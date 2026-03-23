// PrescriptionResponse.java
package com.synapscare.doctor.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder
public class PrescriptionResponse {
    private Long id;
    private Long doctorUserId;
    private Long patientUserId;
    private Long appointmentId;
    private String diagnosis;
    private String medications;
    private String notes;
    private String status;
    private LocalDateTime issuedAt;
}