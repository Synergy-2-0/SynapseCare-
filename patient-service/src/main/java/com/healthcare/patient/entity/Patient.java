package com.healthcare.patient.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "patients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private Long userId;
    
    private String name;
    private String email;
    private String phone;
    private LocalDate dob;
    private String gender;
    private String address;
    private String bloodGroup;
    private String allergies;
    private String emergencyContact;
}
