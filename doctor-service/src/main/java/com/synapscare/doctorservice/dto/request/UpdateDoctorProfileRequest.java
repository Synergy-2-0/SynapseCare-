package com.synapscare.doctorservice.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class UpdateDoctorProfileRequest {

    @Size(max = 255)
    private String specialization;

    @Size(max = 1000)
    private String qualifications;

    @Min(value = 0, message = "Experience cannot be negative")
    private Integer experience;

    @Size(max = 100)
    private String licenseNumber;

    @DecimalMin(value = "0.0", inclusive = false, message = "Consultation fee must be greater than 0")
    private BigDecimal consultationFee;

    @Size(max = 2000)
    private String bio;

    private String profileImageUrl;

    private String licenseDocumentUrl;
}
