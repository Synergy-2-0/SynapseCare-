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

    @Column(nullable = false)
    private String medicineName;

    @Column
    private String dosage;

    @Column
    private String duration;

    @Column(length = 1000)
    private String instructions;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdDate;

    @Column(length = 1000)
    private String followUpNotes;

    // Diagnosis for prescription context
    @Column(length = 500)
    private String diagnosis;

    @Column(length = 100)
    private String diagnosisCode;

    // Billing / Inventory (Pharmacist Logic)
    private Double unitPrice;
    private Integer quantity;
    private Double unitDiscount;
    private Double totalAmount;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
}
