package com.healthcare.payment.controller;

import com.healthcare.payment.dto.*;
import com.healthcare.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * POST /api/payments/create
     * Create a new payment request linked to an appointment.
     */
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<PaymentDto>> createPayment(
            @Valid @RequestBody PaymentRequestDto request) {
        PaymentDto payment = paymentService.createPaymentRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Payment request created", payment));
    }

    /**
     * GET /api/payments/{paymentId}/initiate-payhere
     * Returns PayHere sandbox checkout form data.
     */
    @GetMapping("/{paymentId}/initiate-payhere")
    public ResponseEntity<ApiResponse<PayHereInitiateDto>> initiatePayHere(
            @PathVariable(name = "paymentId") String paymentId,
            @RequestParam(value = "returnUrl", required = false) String returnUrl,
            @RequestParam(value = "cancelUrl", required = false) String cancelUrl) {
        PayHereInitiateDto dto = paymentService.initiatePayHerePayment(paymentId, returnUrl, cancelUrl);
        return ResponseEntity.ok(new ApiResponse<>(true, "PayHere checkout data", dto));
    }

    /**
     * POST /api/payments/payhere/notify
     * PayHere sandbox callback (notify_url). Receives payment status from PayHere.
     */
    @PostMapping("/payhere/notify")
    public ResponseEntity<String> payHereNotify(
            @RequestParam("merchant_id") String merchantId,
            @RequestParam("order_id") String orderId,
            @RequestParam("payhere_amount") String payhereAmount,
            @RequestParam("payhere_currency") String payhereCurrency,
            @RequestParam("status_code") String statusCode,
            @RequestParam("md5sig") String md5sig,
            @RequestParam(value = "payment_id", required = false, defaultValue = "") String paymentId) {

        log.info("PayHere callback received: orderId={}, statusCode={}", orderId, statusCode);
        paymentService.handlePayHereCallback(merchantId, orderId, payhereAmount,
                payhereCurrency, statusCode, md5sig, paymentId);
        return ResponseEntity.ok("OK");
    }

    /**
     * GET /api/payments/{paymentId}
     * Get a specific payment by our internal paymentId (UUID).
     */
    @GetMapping("/{paymentId}")
    public ResponseEntity<ApiResponse<PaymentDto>> getPayment(@PathVariable(name = "paymentId") String paymentId) {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Payment found", paymentService.getPaymentById(paymentId)));
    }

    /**
     * GET /api/payments/appointment/{appointmentId}
     * Get payment linked to an appointment.
     */
    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<ApiResponse<PaymentDto>> getByAppointment(@PathVariable(name = "appointmentId") Long appointmentId) {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Payment found", paymentService.getPaymentByAppointment(appointmentId)));
    }

    /**
     * GET /api/payments/patient/{patientId}/history
     * Get all payment history for a patient.
     */
    @GetMapping("/patient/{patientId}/history")
    public ResponseEntity<ApiResponse<List<PaymentDto>>> getPatientHistory(@PathVariable(name = "patientId") Long patientId) {
        List<PaymentDto> history = paymentService.getPatientPaymentHistory(patientId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Payment history", history));
    }

    /**
     * POST /api/payments/{paymentId}/refund
     * Initiate a refund for a successful payment.
     */
    @PostMapping("/{paymentId}/refund")
    public ResponseEntity<ApiResponse<PaymentDto>> refundPayment(
            @PathVariable(name = "paymentId") String paymentId,
            @RequestParam(value = "reason", defaultValue = "Requested by patient") String reason) {
        PaymentDto refunded = paymentService.initiateRefund(paymentId, reason);
        return ResponseEntity.ok(new ApiResponse<>(true, "Refund initiated", refunded));
    }

    /**
     * POST /api/payments/{paymentId}/retry
     * Retry a failed or cancelled payment.
     */
    @PostMapping("/{paymentId}/retry")
    public ResponseEntity<ApiResponse<PaymentDto>> retryPayment(@PathVariable(name = "paymentId") String paymentId) {
        PaymentDto retried = paymentService.retryPayment(paymentId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Retry payment created", retried));
    }

    /**
     * GET /api/payments/{paymentId}/receipt
     * Payment receipt endpoint.
     */
    @GetMapping("/{paymentId}/receipt")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReceipt(@PathVariable(name = "paymentId") String paymentId) {
        PaymentDto payment = paymentService.getPaymentById(paymentId);
        Map<String, Object> receipt = Map.of(
                "receiptNumber", "RCT-" + payment.getPaymentId().substring(0, 8).toUpperCase(),
                "paymentId", payment.getPaymentId(),
                "appointmentId", payment.getAppointmentId(),
                "patientId", payment.getPatientId(),
                "amount", payment.getAmount(),
                "currency", payment.getCurrency(),
                "method", payment.getMethod(),
                "transactionRef", payment.getTransactionReference() != null ? payment.getTransactionReference() : "N/A",
                "paidAt", payment.getPaidAt() != null ? payment.getPaidAt().toString() : "N/A",
                "status", payment.getStatus()
        );
        return ResponseEntity.ok(new ApiResponse<>(true, "Receipt generated", receipt));
    }

    /**
     * GET /api/payments/admin/summary
     * Admin: payment summary report.
     */
    @GetMapping("/admin/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSummary() {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Payment summary", paymentService.getPaymentSummary()));
    }
}
