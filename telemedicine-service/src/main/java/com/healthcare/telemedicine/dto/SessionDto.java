package com.healthcare.telemedicine.dto;

import com.healthcare.telemedicine.entity.SessionStatus;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SessionDto {
    private Long id;
    private String sessionId;
    private Long appointmentId;
    private Long doctorId;
    private Long patientId;
    private String meetingLink;
    private String roomName;
    private LocalDateTime scheduledStartTime;
    private LocalDateTime scheduledEndTime;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    private SessionStatus status;
    private String consultationNotes;
    private LocalDateTime createdAt;
    // Tokens returned on join (never stored in listing responses)
    private String accessToken;
}
