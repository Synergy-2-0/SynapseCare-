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

    private String fileName;

    private String objectName; // MinIO object key

    private String fileType; // MIME type

    private Long fileSize; // Size in bytes

    private String fileUrl; // Presigned URL (generated on demand)

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
