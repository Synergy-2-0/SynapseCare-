// TelemedicineSessionRequest.java
package com.synapscare.doctor.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TelemedicineSessionRequest {
    @NotNull(message = "Patient user ID is required")
    private Long patientUserId;

    private Long appointmentId;

    @NotNull(message = "Scheduled time is required")
    private LocalDateTime scheduledAt;

    private String sessionNotes;
}