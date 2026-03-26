package com.healthcare.appointment.dto.client;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DoctorProfileClientDto {
    private Long id;
    private Long userId;
    private String specialization;
    private BigDecimal consultationFee;
    private Boolean isAvailable;
    private String verificationStatus;
}