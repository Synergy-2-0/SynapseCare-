package com.healthcare.telemedicine.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionCreatedEvent {
    private String sessionId;
    private Long appointmentId;
    private Long doctorId;
    private Long patientId;
    private String roomName;
    private String sessionUrl;
    private LocalDateTime scheduledStartTime;
    private LocalDateTime scheduledEndTime;
    private LocalDateTime createdAt;
}
