package com.healthcare.telemedicine.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateSessionDto {
    @NotNull
    private Long appointmentId;
    @NotNull
    private Long doctorId;
    @NotNull
    private Long patientId;
    @NotNull
    private LocalDateTime scheduledStartTime;
    @NotNull
    private LocalDateTime scheduledEndTime;
}
