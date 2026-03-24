package com.healthcare.appointment.repository;

import com.healthcare.appointment.entity.Appointment;
import com.healthcare.appointment.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
boolean existsByDoctorIdAndDateAndTimeAndStatusIn(
        Long doctorId, LocalDate date, LocalTime time, List<AppointmentStatus> statuses);
        
    List<Appointment> findByPatientIdOrderByDateAscTimeAsc(Long patientId);

    List<Appointment> findByDoctorIdOrderByDateAscTimeAsc(Long doctorId);
}