package com.synapscare.doctorservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCaseRequest {
    private String chiefComplaint;
    private String soapNotesJson;
    private String diagnosesJson;
    private String labOrdersJson;
    private String notes;
    private Long prescriptionId;
    private String status;
    private LocalDateTime followUpDate;
}
