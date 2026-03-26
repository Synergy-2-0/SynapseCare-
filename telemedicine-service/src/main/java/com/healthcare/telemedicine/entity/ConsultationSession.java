package com.healthcare.telemedicine.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "consultation_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultationSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String sessionId;           // UUID

    @Column(nullable = false)
    private Long appointmentId;

    @Column(nullable = false)
    private Long doctorId;

    @Column(nullable = false)
    private Long patientId;

    @Column(nullable = false)
    private String meetingLink;         // Jitsi room URL

    @Column(nullable = false)
    private String roomName;            // Jitsi room name

    private String doctorToken;         // JWT for doctor (moderator)
    private String patientToken;        // JWT for patient (participant)

    private LocalDateTime scheduledStartTime;   // When session is allowed to start
    private LocalDateTime scheduledEndTime;     // When session ends

    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;

    @Enumerated(EnumType.STRING)
    private SessionStatus status;

    @Column(columnDefinition = "TEXT")
    private String consultationNotes;   // Doctor's notes after session

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null) status = SessionStatus.SCHEDULED;
    }
}
