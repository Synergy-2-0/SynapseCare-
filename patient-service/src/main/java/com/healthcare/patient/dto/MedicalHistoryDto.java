package com.healthcare.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalHistoryDto {
    private Long id;
    private Long patientId;
    private String condition;
    private LocalDate diagnosisDate;
    private String treatment;
    private String notes;
}
