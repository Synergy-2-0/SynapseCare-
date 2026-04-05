package com.healthcare.telemedicine.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EndSessionRequest {
    
    private String endedBy;  // User ID who ended the session
    
    private String notes;    // Doctor's consultation notes
    
    // If true, update appointment status to COMPLETED
    @Builder.Default
    private Boolean markAppointmentCompleted = false;
}
