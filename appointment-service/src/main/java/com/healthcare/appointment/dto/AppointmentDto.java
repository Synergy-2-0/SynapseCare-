package com.healthcare.appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.healthcare.appointment.entity.AppointmentStatus;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDto {
    private Long id;

    @NotNull(message = "Patient id is required")
    private Long patientId;

    @NotNull(message = "Doctor id is required")
    private Long doctorId;

    @NotNull(message = "Date is required")
    @FutureOrPresent(message = "Date must be today or future")
    private LocalDate date;

    @NotNull(message = "Time is required")
    private LocalTime time;

    private String meetingLink;
    private String reason;

    private AppointmentStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
