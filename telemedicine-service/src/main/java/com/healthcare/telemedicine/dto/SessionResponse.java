package com.healthcare.telemedicine.dto;

import com.healthcare.telemedicine.entity.SessionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionResponse {
    
    private Long id;
    private String sessionId;
    private Long appointmentId;
    private Long doctorId;
    private Long patientId;
    private String sessionUrl;
    private String roomName;
    private SessionStatus status;
    
    // Scheduled times
    private LocalDateTime scheduledStartTime;
    private LocalDateTime scheduledEndTime;
    
    // Actual times
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    
    private String endedBy;
    private String notes;
    
    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Access token (only included when user joins)
    private String accessToken;
}
