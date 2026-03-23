// TelemedicineSessionResponse.java
package com.synapscare.doctor.dto.response;

import com.synapscare.doctor.entity.TelemedicineSession.SessionStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder
public class TelemedicineSessionResponse {
    private Long id;
    private Long doctorUserId;
    private Long patientUserId;
    private Long appointmentId;
    private String roomName;
    private String joinUrl;         // e.g. https://meet.jit.si/{roomName}
    private SessionStatus status;
    private LocalDateTime scheduledAt;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private String sessionNotes;
    private LocalDateTime createdAt;
}