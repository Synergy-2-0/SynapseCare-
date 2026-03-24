package com.healthcare.payment.dto;

import com.healthcare.payment.entity.PaymentMethod;
import com.healthcare.payment.entity.PaymentStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentDto {
    private Long id;
    private String paymentId;
    private Long appointmentId;
    private Long patientId;
    private BigDecimal amount;
    private String currency;
    private PaymentMethod method;
    private PaymentStatus status;
    private String transactionReference;
    private String merchantOrderId;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private String receiptUrl;
    private String failureReason;
}
