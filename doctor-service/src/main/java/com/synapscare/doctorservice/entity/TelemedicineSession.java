package com.synapscare.doctor.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "telemedicine_sessions")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TelemedicineSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long doctorUserId;

    @Column(nullable = false)
    private Long patientUserId;

    private Long appointmentId;

    // Generated room name for Jitsi/Agora/Twilio
    @Column(nullable = false, unique = true)
    private String roomName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status = SessionStatus.PENDING;

    private LocalDateTime scheduledAt;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;

    @Column(columnDefinition = "TEXT")
    private String sessionNotes;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum SessionStatus {
        PENDING, ACTIVE, COMPLETED, CANCELLED
    }
}