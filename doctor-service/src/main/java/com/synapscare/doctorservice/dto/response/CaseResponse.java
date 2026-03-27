package com.synapscare.doctorservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaseResponse {
    private Long id;
    private Long appointmentId;
    private Long doctorId;
    private Long patientId;
    private String patientName;
    private Integer patientAge;
    private String patientGender;
    private String chiefComplaint;
    private String soapNotesJson;
    private String diagnosesJson;
    private String labOrdersJson;
    private Long prescriptionId;
    private String notes;
    private String status;
    private LocalDateTime followUpDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime finalizedAt;
}
