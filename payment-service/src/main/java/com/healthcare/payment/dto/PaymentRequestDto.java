package com.healthcare.payment.dto;

import com.healthcare.payment.entity.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentRequestDto {
    @NotNull
    private Long appointmentId;
    @NotNull
    private Long patientId;
    @NotNull @Positive
    private BigDecimal amount;
    private String currency;        // default LKR
    @NotNull
    private PaymentMethod method;   // PAYHERE is primary
    private Long doctorId;          // For denormalization in receipts
    private String returnUrl;       // Frontend redirect after payment
    private String cancelUrl;       // Frontend redirect on cancel
}
