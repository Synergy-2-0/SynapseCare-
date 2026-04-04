package com.healthcare.appointment.dto.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorProfileClientDto {
    private Long id;
    private Long userId;
    private String specialization;
    private BigDecimal consultationFee;
    private Boolean isAvailable;
    private String verificationStatus;
}