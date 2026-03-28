package com.healthcare.appointment.dto.client;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PatientClientDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private LocalDate dob;
    private String gender;
    private String bloodGroup;
    private String allergies;
}
