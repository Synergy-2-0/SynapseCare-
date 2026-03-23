// DoctorProfileRequest.java
package com.synapscare.doctor.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class DoctorProfileRequest {
    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Specialty is required")
    private String specialty;

    private String qualifications;
    private String licenseNumber;
    private String bio;
    private String profilePictureUrl;
    private Integer yearsOfExperience;

    @NotNull(message = "Consultation fee is required")
    @Positive(message = "Consultation fee must be positive")
    private Double consultationFee;

    private String hospital;
    private String phoneNumber;
}