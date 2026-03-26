package com.healthcare.appointment.dto;

import com.healthcare.appointment.entity.AppointmentStatus;
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
public class AppointmentEvent {
    private String eventType;
    private Long appointmentId;
    private Long patientId;
    private Long doctorId;
    private LocalDate date;
    private LocalTime time;
    private AppointmentStatus status;
    private LocalDateTime occurredAt;
}
