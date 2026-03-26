package com.synapscare.org.dto.messaging;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Event published by Auth Service when doctor verification status changes.
 * This is the SOURCE OF TRUTH for doctor verification.
 * Doctor Service should listen and sync its local verification status.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorVerificationEvent {
    private Long userId;
    private String status; // PENDING, APPROVED, REJECTED
    private String rejectionReason; // Optional: reason if status is REJECTED
    private String verifiedBy; // Admin username who verified/rejected
    private LocalDateTime verifiedAt;
}
