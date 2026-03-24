package com.synapscare.doctorservice.dto.messaging;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorVerifiedEvent {
    private Long doctorId;
    private Long userId;
    private String email;
    private String status; // APPROVED or REJECTED
    private String specialization;
}
