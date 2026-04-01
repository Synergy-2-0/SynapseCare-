package com.healthcare.payment.service;

import com.healthcare.payment.dto.PayHereInitiateDto;
import com.healthcare.payment.dto.PaymentDto;
import com.healthcare.payment.dto.PaymentRequestDto;
import com.healthcare.payment.entity.Payment;
import com.healthcare.payment.entity.PaymentMethod;
import com.healthcare.payment.entity.PaymentStatus;
import com.healthcare.payment.mq.PaymentEventPublisher;
import com.healthcare.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentEventPublisher eventPublisher;

    @Value("${payhere.merchant-id}")
    private String merchantId;

    @Value("${payhere.merchant-secret}")
    private String merchantSecret;

    @Value("${payhere.sandbox-url}")
    private String sandboxUrl;

    @Value("${app.notify-url}")
    private String notifyUrl;

    // -------------------------------------------------------
    // 1. Create payment request (linked to appointment)
    // -------------------------------------------------------
    @Transactional
    public PaymentDto createPaymentRequest(PaymentRequestDto request) {
        String paymentId = UUID.randomUUID().toString();
        String merchantOrderId = "ORDER-" + System.currentTimeMillis();

        Payment payment = Payment.builder()
                .paymentId(paymentId)
                .appointmentId(request.getAppointmentId())
                .patientId(request.getPatientId())
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : "LKR")
                .method(request.getMethod() != null ? request.getMethod() : PaymentMethod.PAYHERE)
                .status(PaymentStatus.PENDING)
                .merchantOrderId(merchantOrderId)
                .doctorId(request.getDoctorId())
                .build();

        payment = paymentRepository.save(payment);
        log.info("Created payment request: paymentId={}, appointmentId={}",
                paymentId, request.getAppointmentId());
        return toDto(payment);
    }

    // -------------------------------------------------------
    // 2. Initiate PayHere sandbox payment (returns form data)
    // -------------------------------------------------------
    public PayHereInitiateDto initiatePayHerePayment(String paymentId, String returnUrl, String cancelUrl) {
        Payment payment = paymentRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new RuntimeException("Payment is not in PENDING state");
        }

        // Generate PayHere hash: MD5(merchant_id + order_id + amount + currency + MD5(merchant_secret).toUpperCase())
        String hash = generatePayHereHash(payment.getMerchantOrderId(), payment.getAmount(), payment.getCurrency());

        return PayHereInitiateDto.builder()
                .merchant_id(merchantId)
                .return_url(returnUrl != null ? returnUrl : "http://localhost:3000/payment/success")
                .cancel_url(cancelUrl != null ? cancelUrl : "http://localhost:3000/payment/cancel")
                .notify_url(notifyUrl)
                .order_id(payment.getMerchantOrderId())
                .items("Medical Consultation - Appointment #" + payment.getAppointmentId())
                .currency(payment.getCurrency())
                .amount(payment.getAmount())
                .first_name("Patient")
                .last_name(payment.getPatientId().toString())
                .email("patient" + payment.getPatientId() + "@synapscare.com")
                .phone("0771234567")
                .address("Colombo")
                .city("Colombo")
                .country("Sri Lanka")
                .hash(hash)
                .sandbox("true")
                .build();
    }

    // -------------------------------------------------------
    // 3. Handle PayHere payment notification callback
    // -------------------------------------------------------
    @Transactional
    public void handlePayHereCallback(String merchantId, String orderId, String payhereAmount,
                                      String payhereCurrency, String statusCode,
                                      String md5sig, String paymentIdGateway) {
        Payment payment = paymentRepository.findByMerchantOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment record not found for order: " + orderId));

        // Verify hash
        String localHash = generatePayHereCallbackHash(orderId, payhereAmount, payhereCurrency, statusCode);
        if (!localHash.equalsIgnoreCase(md5sig)) {
            log.warn("PayHere hash mismatch for order: {}", orderId);
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Hash verification failed");
            paymentRepository.save(payment);
            return;
        }

        String rawResponse = String.format(
                "status_code=%s,order_id=%s,payment_id=%s,amount=%s,currency=%s",
                statusCode, orderId, paymentIdGateway, payhereAmount, payhereCurrency);
        payment.setGatewayResponse(rawResponse);
        payment.setTransactionReference(paymentIdGateway);

        switch (statusCode) {
            case "2" -> {  // Success
                payment.setStatus(PaymentStatus.SUCCESS);
                payment.setPaidAt(LocalDateTime.now());
                payment.setReceiptUrl("/api/payments/" + payment.getPaymentId() + "/receipt");
                log.info("Payment SUCCESS for appointment: {}", payment.getAppointmentId());
                // Notify appointment service to confirm the appointment
                eventPublisher.publishPaymentSuccess(payment.getAppointmentId(), payment.getPaymentId());
            }
            case "0" -> {  // Pending
                payment.setStatus(PaymentStatus.PENDING);
                log.info("Payment PENDING for order: {}", orderId);
            }
            case "-1" -> { // Cancelled
                payment.setStatus(PaymentStatus.CANCELLED);
                payment.setFailureReason("Payment cancelled by user");
                eventPublisher.publishPaymentFailed(payment.getAppointmentId(), payment.getPaymentId(), "Payment cancelled by user");
            }
            case "-2" -> { // Failed
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason("Payment failed at gateway");
                eventPublisher.publishPaymentFailed(payment.getAppointmentId(), payment.getPaymentId(), "Payment failed at gateway");
            }
            case "-3" -> { // Chargedback
                payment.setStatus(PaymentStatus.REFUNDED);
                payment.setFailureReason("Chargedback");
            }
            default -> {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason("Unknown status code: " + statusCode);
            }
        }
        paymentRepository.save(payment);
    }

    // -------------------------------------------------------
    // 4. Get payment by paymentId
    // -------------------------------------------------------
    public PaymentDto getPaymentById(String paymentId) {
        return paymentRepository.findByPaymentId(paymentId)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));
    }

    // -------------------------------------------------------
    // 5. Get payments by appointment
    // -------------------------------------------------------
    public PaymentDto getPaymentByAppointment(Long appointmentId) {
        return paymentRepository.findByAppointmentId(appointmentId)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("No payment found for appointment: " + appointmentId));
    }

    // -------------------------------------------------------
    // 6. Get payment history for patient
    // -------------------------------------------------------
    public List<PaymentDto> getPatientPaymentHistory(Long patientId) {
        return paymentRepository.findByPatientId(patientId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // -------------------------------------------------------
    // 7. Initiate Refund
    // -------------------------------------------------------
    @Transactional
    public PaymentDto initiateRefund(String paymentId, String reason) {
        Payment payment = paymentRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));
        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new RuntimeException("Only successful payments can be refunded");
        }
        payment.setStatus(PaymentStatus.REFUNDED);
        payment.setFailureReason("Refund: " + reason);
        payment = paymentRepository.save(payment);
        log.info("Refund initiated for paymentId: {}", paymentId);
        return toDto(payment);
    }

    // -------------------------------------------------------
    // 8. Retry failed payment (create new pending record)
    // -------------------------------------------------------
    @Transactional
    public PaymentDto retryPayment(String paymentId) {
        Payment original = paymentRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));
        if (original.getStatus() != PaymentStatus.FAILED && original.getStatus() != PaymentStatus.CANCELLED) {
            throw new RuntimeException("Only FAILED or CANCELLED payments can be retried");
        }
        // Create a fresh pending payment for the same appointment
        String newPaymentId = UUID.randomUUID().toString();
        String newMerchantOrderId = "ORDER-" + System.currentTimeMillis();
        Payment retry = Payment.builder()
                .paymentId(newPaymentId)
                .appointmentId(original.getAppointmentId())
                .patientId(original.getPatientId())
                .amount(original.getAmount())
                .currency(original.getCurrency())
                .method(original.getMethod())
                .status(PaymentStatus.PENDING)
                .merchantOrderId(newMerchantOrderId)
                .build();
        retry = paymentRepository.save(retry);
        log.info("Retry payment created: {} for original: {}", newPaymentId, paymentId);
        return toDto(retry);
    }

    // -------------------------------------------------------
    // 9. Payment summary report
    // -------------------------------------------------------
    public java.util.Map<String, Object> getPaymentSummary() {
        long total = paymentRepository.count();
        long success = paymentRepository.findByStatus(PaymentStatus.SUCCESS).size();
        long failed = paymentRepository.findByStatus(PaymentStatus.FAILED).size();
        long pending = paymentRepository.findByStatus(PaymentStatus.PENDING).size();
        long refunded = paymentRepository.findByStatus(PaymentStatus.REFUNDED).size();
        BigDecimal totalRevenue = paymentRepository.findByStatus(PaymentStatus.SUCCESS)
                .stream().map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return java.util.Map.of(
                "total", total,
                "success", success,
                "failed", failed,
                "pending", pending,
                "refunded", refunded,
                "totalRevenue", totalRevenue
        );
    }

    // -------------------------------------------------------
    // Helper: generate PayHere hash for checkout form
    // -------------------------------------------------------
    private String generatePayHereHash(String orderId, BigDecimal amount, String currency) {
        try {
            String merchantSecretMd5 = md5(merchantSecret).toUpperCase();
            String formatted = String.format(java.util.Locale.US, "%.2f", amount);
            String raw = merchantId + orderId + formatted + currency + merchantSecretMd5;
            String generatedHash = md5(raw).toUpperCase();
            log.info("PayHere Hash Debug - Merchant: {}, Order: {}, Amount: {}, Currency: {}, SecretMD5: {}, Raw: {}, Hash: {}", 
                     merchantId, orderId, formatted, currency, merchantSecretMd5, raw, generatedHash);
            return generatedHash;
        } catch (Exception e) {
            throw new RuntimeException("Hash generation failed", e);
        }
    }

    // -------------------------------------------------------
    // Helper: verify PayHere callback hash
    // -------------------------------------------------------
    private String generatePayHereCallbackHash(String orderId, String amount, String currency, String statusCode) {
        try {
            String merchantSecretMd5 = md5(merchantSecret).toUpperCase();
            String raw = merchantId + orderId + amount + currency + statusCode + merchantSecretMd5;
            return md5(raw).toUpperCase();
        } catch (Exception e) {
            throw new RuntimeException("Callback hash generation failed", e);
        }
    }

    private String md5(String input) throws Exception {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] bytes = md.digest(input.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) sb.append(String.format("%02x", b));
        return sb.toString();
    }

    // -------------------------------------------------------
    // Entity to DTO mapper
    // -------------------------------------------------------
    private PaymentDto toDto(Payment p) {
        return PaymentDto.builder()
                .id(p.getId())
                .paymentId(p.getPaymentId())
                .appointmentId(p.getAppointmentId())
                .patientId(p.getPatientId())
                .amount(p.getAmount())
                .currency(p.getCurrency())
                .method(p.getMethod())
                .status(p.getStatus())
                .transactionReference(p.getTransactionReference())
                .merchantOrderId(p.getMerchantOrderId())
                .createdAt(p.getCreatedAt())
                .paidAt(p.getPaidAt())
                .receiptUrl(p.getReceiptUrl())
                .failureReason(p.getFailureReason())
                .build();
    }
}
