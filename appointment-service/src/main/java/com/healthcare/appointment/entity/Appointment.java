package com.healthcare.appointment.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long patientId;
    private Long doctorId;
    private LocalDate date;
    private LocalTime time;
    
    private Double fee;
    private String notes;
    private String consultationType; // e.g., PHYSICAL, VIDEO
    private Integer tokenNumber;
    
    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;
}
