package com.synapscare.doctorservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCaseRequest {
    private Long appointmentId;
    private Long patientId;
    private String patientName;
    private Integer patientAge;
    private String patientGender;
    private String chiefComplaint;
}
