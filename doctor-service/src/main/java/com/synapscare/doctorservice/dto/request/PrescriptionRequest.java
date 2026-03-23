// PrescriptionRequest.java
package com.synapscare.doctor.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class PrescriptionRequest {
    @NotNull(message = "Patient user ID is required")
    private Long patientUserId;

    private Long appointmentId;

    @NotBlank(message = "Diagnosis is required")
    private String diagnosis;

    @NotBlank(message = "Medications are required")
    private String medications;

    private String notes;
}