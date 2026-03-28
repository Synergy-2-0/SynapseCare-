package com.healthcare.prescription.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionDto {
    private Long id;
    private Long appointmentId;
    private Long doctorId;
    private Long patientId;
    private String medicineName;
    private String dosage;
    private String duration;
    private String instructions;
    private LocalDateTime createdDate;
    private String followUpNotes;
}
