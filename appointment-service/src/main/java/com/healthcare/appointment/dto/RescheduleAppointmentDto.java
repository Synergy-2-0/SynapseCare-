package com.healthcare.appointment.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RescheduleAppointmentDto {

    @NotNull(message = "Date is required")
    @FutureOrPresent(message = "Date must be today or future")
    private LocalDate date;

    @NotNull(message = "Time is required")
    private LocalTime time;

    private String reason;
    private String meetingLink;
    private Double fee;
    private String notes;
    private String consultationType;
}