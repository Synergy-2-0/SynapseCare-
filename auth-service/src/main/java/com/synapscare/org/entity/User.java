package com.synapscare.org.entity;

import com.synapscare.org.enums.VerificationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email"),
        @UniqueConstraint(columnNames = "username")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "first_name", length = 50)
    private String firstName;

    @Column(name = "last_name", length = 50)
    private String lastName;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    // Kept for backward compatibility - for PATIENT and ADMIN roles
    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = false;

    // New field for DOCTOR verification - source of truth
    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", length = 20)
    private VerificationStatus verificationStatus;

    // Rejection reason for DOCTOR accounts
    @Column(name = "verification_rejection_reason", length = 500)
    private String verificationRejectionReason;

    @Column(name = "is_deleted")
    @Builder.Default
    private Boolean isDeleted = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Role {
        PATIENT,
        DOCTOR,
        ADMIN
    }

    // Convenience method for checking if doctor is verified
    public boolean isDoctorVerified() {
        return role == Role.DOCTOR && verificationStatus == VerificationStatus.APPROVED;
    }

    // Convenience method for checking if user can login
    public boolean canLogin() {
        if (role == Role.DOCTOR) {
            return verificationStatus == VerificationStatus.APPROVED;
        }
        return Boolean.TRUE.equals(isVerified);
    }
}
