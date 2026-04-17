package com.healthcare.telemedicine.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "telemedicine_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TelemedicineSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String sessionId;           // UUID - room identifier

    @Column(nullable = false)
    private Long appointmentId;

    @Column(nullable = false)
    private Long doctorId;

    @Column(nullable = false)
    private Long patientId;

    @Column(nullable = false)
    private String sessionUrl;          // Jitsi room URL (aligned with reference)

    @Column(nullable = false)
    private String roomName;            // Jitsi room name

    private String doctorToken;         // JWT for doctor (moderator)
    private String patientToken;        // JWT for patient (participant)

    private LocalDateTime scheduledStartTime;   // When session is allowed to start
    private LocalDateTime scheduledEndTime;     // When session ends

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status;

    private LocalDateTime startedAt;    // When session actually started (aligned with reference)
    private LocalDateTime endedAt;      // When session actually ended (aligned with reference)
    
    private String endedBy;             // User ID who ended the session (aligned with reference)

    @Column(columnDefinition = "TEXT")
    private String notes;               // Doctor's consultation notes (aligned with reference)

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;    // Audit timestamp
    
    private LocalDateTime updatedAt;    // Last update timestamp (aligned with reference)

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null) status = SessionStatus.SCHEDULED;
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
