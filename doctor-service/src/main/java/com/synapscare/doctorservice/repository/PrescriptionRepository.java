package com.synapscare.doctor.repository;

import com.synapscare.doctor.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByDoctorUserIdOrderByIssuedAtDesc(Long doctorUserId);
    List<Prescription> findByPatientUserIdOrderByIssuedAtDesc(Long patientUserId);
    List<Prescription> findByAppointmentId(Long appointmentId);
}