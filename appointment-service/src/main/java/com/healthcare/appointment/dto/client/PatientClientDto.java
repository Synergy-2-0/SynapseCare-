package com.healthcare.appointment.dto.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientClientDto {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private LocalDate dob;
    private String gender;
    private String bloodGroup;
    private String allergies;
}
