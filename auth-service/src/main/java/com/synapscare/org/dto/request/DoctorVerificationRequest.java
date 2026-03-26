package com.synapscare.org.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorVerificationRequest {

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "APPROVED|REJECTED", message = "Status must be either APPROVED or REJECTED")
    private String status;

    @Size(max = 500, message = "Rejection reason cannot exceed 500 characters")
    private String rejectionReason;

    /**
     * Validates that rejection reason is provided when status is REJECTED
     */
    public void validate() {
        if ("REJECTED".equals(status) && (rejectionReason == null || rejectionReason.isBlank())) {
            throw new IllegalArgumentException("Rejection reason is required when rejecting a doctor");
        }
        if ("APPROVED".equals(status) && rejectionReason != null && !rejectionReason.isBlank()) {
            throw new IllegalArgumentException("Rejection reason should not be provided when approving a doctor");
        }
    }
}
