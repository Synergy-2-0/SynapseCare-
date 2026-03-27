package com.synapscare.doctorservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "consultation_cases")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultationCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long appointmentId;

    @Column(nullable = false)
    private Long doctorId;

    @Column(nullable = false)
    private Long patientId;

    // Patient info (denormalized for display)
    private String patientName;
    private Integer patientAge;
    private String patientGender;

    // Chief complaint
    @Column(length = 1000)
    private String chiefComplaint;

    // SOAP Notes stored as JSON
    @Column(columnDefinition = "TEXT")
    private String soapNotesJson;

    // Diagnoses stored as JSON array
    @Column(columnDefinition = "TEXT")
    private String diagnosesJson;

    // Lab orders stored as JSON array
    @Column(columnDefinition = "TEXT")
    private String labOrdersJson;

    // Link to prescription (if created)
    private Long prescriptionId;

    // Consultation notes
    @Column(length = 2000)
    private String notes;

    // Case status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CaseStatus status = CaseStatus.DRAFT;

    // Follow-up date if needed
    private LocalDateTime followUpDate;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // When consultation was finalized
    private LocalDateTime finalizedAt;

    public enum CaseStatus {
        DRAFT,       // Still being edited
        IN_PROGRESS, // Consultation ongoing
        COMPLETED,   // Finalized
        FOLLOW_UP,   // Needs follow-up
        CLOSED       // Case closed
    }
}
