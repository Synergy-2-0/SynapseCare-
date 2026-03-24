package com.synapscare.doctorservice.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateDoctorProfileRequest {

    @NotBlank(message = "Specialization is required")
    @Size(max = 255)
    private String specialization;

    @Size(max = 1000)
    private String qualifications;

    @Min(value = 0, message = "Experience cannot be negative")
    private Integer experience;

    @NotBlank(message = "License number is required")
    @Size(max = 100)
    private String licenseNumber;

    @NotNull(message = "Consultation fee is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Consultation fee must be greater than 0")
    private BigDecimal consultationFee;

    @Size(max = 2000)
    private String bio;

    private String profileImageUrl;
}
