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
public class SessionEndedEvent {
    private String sessionId;
    private Long appointmentId;
    private Long doctorId;
    private Long patientId;
    private String endedBy;
    private String notes;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private LocalDateTime createdAt;
}
