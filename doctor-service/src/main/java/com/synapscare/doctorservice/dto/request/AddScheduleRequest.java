package com.synapscare.doctorservice.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AddScheduleRequest {

    @NotNull(message = "Date is required")
    private LocalDate date;

    private LocalTime startTime;

    private LocalTime endTime;

    @NotNull(message = "Availability status is required")
    private Boolean isAvailable;

    private String reason;
}
