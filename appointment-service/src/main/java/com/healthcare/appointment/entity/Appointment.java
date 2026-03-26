package com.healthcare.appointment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
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

    private String meetingLink;
    private String reason;
    
    private Double fee;
    private String notes;
    private String consultationType; // e.g., PHYSICAL, VIDEO
    private Integer tokenNumber;
    
    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
