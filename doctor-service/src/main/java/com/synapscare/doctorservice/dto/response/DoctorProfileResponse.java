package com.synapscare.doctorservice.dto.response;

import com.synapscare.doctorservice.enums.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorProfileResponse {
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String specialization;
    private String qualifications;
    private Integer experience;
    private String licenseNumber;
    private BigDecimal consultationFee;
    private String bio;
    private String profileImageUrl;
    private String licenseDocumentUrl;
    private Boolean isAvailable;
    private VerificationStatus verificationStatus;
    private String verificationRejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
