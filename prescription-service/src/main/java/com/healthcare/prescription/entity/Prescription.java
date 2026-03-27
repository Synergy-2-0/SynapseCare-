package com.healthcare.prescription.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "prescriptions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Prescription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long appointmentId;

    @Column(nullable = false)
    private Long doctorId;

    @Column(nullable = false)
    private Long patientId;

    // Denormalized fields for PDF generation
    private String doctorName;
    private String doctorSpecialization;
    private String doctorLicenseNumber;
    private String patientName;
    private Integer patientAge;
    private String patientGender;

    @Column(nullable = false)
    private String medicineName;

    @Column(nullable = false)
    private String dosage;

    @Column(nullable = false)
    private String duration;

    @Column(nullable = false, length = 1000)
    private String instructions;

    @Column(nullable = false)
    private LocalDateTime createdDate;

    @Column(length = 1000)
    private String followUpNotes;

    // Diagnosis for prescription context
    @Column(length = 500)
    private String diagnosis;

    @Column(length = 100)
    private String diagnosisCode;
}
