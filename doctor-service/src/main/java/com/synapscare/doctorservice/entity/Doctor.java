package com.synapscare.doctorservice.entity;

import com.synapscare.doctorservice.enums.VerificationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId; // Reference to auth-service User

    // Nullable during initial registration, filled via profile creation
    @Column(nullable = true)
    private String firstName;

    @Column(nullable = true)
    private String lastName;

    @Column(nullable = true)
    private String specialization;

    @Column(length = 1000)
    private String qualifications;

    private Integer experience; // Years of experience

    @Column(unique = true)
    private String licenseNumber;

    // Nullable during initial registration, filled via profile creation
    @Column(nullable = true)
    private BigDecimal consultationFee;

    @Column(length = 2000)
    private String bio;

    @Column(columnDefinition = "TEXT")
    private String profileImageUrl;

    @Column(columnDefinition = "TEXT")
    private String licenseDocumentUrl;

    @Column(nullable = false)
    private Boolean isAvailable = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Column(nullable = true)
    private Integer slotDuration = 30; // Minutes

    @Column(nullable = true)
    private Integer bufferTime = 0; // Minutes

    @Column(length = 500)
    private String verificationRejectionReason; // Synced from auth-service

    @Column(length = 100)
    private String verifiedBy; // Admin username who verified/rejected

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
