package com.healthcare.appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DoctorAvailabilityDto {
    private Long id;
    private Long doctorId;
    private String dayOfWeek;
    private Boolean isWorking;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer slotDuration;
    private Integer bufferTime;
}