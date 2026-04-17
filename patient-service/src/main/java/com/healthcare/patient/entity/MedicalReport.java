package com.healthcare.patient.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "medical_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long patientId;
    private Long appointmentId; // Optional link to a specific appointment

    @Column(length = 512)
    private String fileName;

    @Column(length = 128)
    private String fileType; // MIME type

    private Long fileSize; // Size in bytes

    @Column(columnDefinition = "TEXT")
    private String fileUrl; // Presigned URL (generated on demand)

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    private String reportType; // LAB_RESULT, IMAGING, PRESCRIPTION, OTHER

    @Column(name = "uploaded_at", updatable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
    }
}
