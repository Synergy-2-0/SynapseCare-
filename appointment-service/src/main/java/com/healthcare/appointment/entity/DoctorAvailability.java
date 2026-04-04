package com.healthcare.appointment.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;

@Entity
@Table(name = "appointment_doctor_availability")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorAvailability {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long doctorId;
    
    private String dayOfWeek;
    private Boolean isWorking;
    
    private LocalTime startTime;
    private LocalTime endTime;
    
    private Integer slotDuration;
    private Integer bufferTime;
}