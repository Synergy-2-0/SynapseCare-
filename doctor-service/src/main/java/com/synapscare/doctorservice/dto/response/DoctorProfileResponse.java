// DoctorProfileResponse.java
package com.synapscare.doctor.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder
public class DoctorProfileResponse {
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String specialty;
    private String qualifications;
    private String licenseNumber;
    private String bio;
    private String profilePictureUrl;
    private Integer yearsOfExperience;
    private Double consultationFee;
    private String hospital;
    private String phoneNumber;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}