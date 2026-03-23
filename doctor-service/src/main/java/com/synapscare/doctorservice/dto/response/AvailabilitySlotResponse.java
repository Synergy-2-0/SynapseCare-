// AvailabilitySlotResponse.java
package com.synapscare.doctor.dto.response;

import lombok.*;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Data @Builder
public class AvailabilitySlotResponse {
    private Long id;
    private Long doctorUserId;
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer slotDurationMinutes;
    private boolean isAvailable;
}