package com.healthcare.telemedicine.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentEventDto {
    private String eventType;
    private Long appointmentId;
    private Long patientId;
    private Long userId;
    private String patientEmail;
    private String patientPhone;
    private Long doctorId;
    private LocalDate date;
    private LocalTime time;
    private String meetingLink;
    private Double fee;
    private String consultationType;
    private String reason;
    private String status;
    private LocalDateTime occurredAt;
}
