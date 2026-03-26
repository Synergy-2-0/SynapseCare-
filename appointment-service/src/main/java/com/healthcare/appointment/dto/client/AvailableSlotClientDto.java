package com.healthcare.appointment.dto.client;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AvailableSlotClientDto {
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean isAvailable;
}
