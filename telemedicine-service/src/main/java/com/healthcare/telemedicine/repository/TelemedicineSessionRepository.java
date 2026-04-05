package com.healthcare.telemedicine.repository;

import com.healthcare.telemedicine.entity.TelemedicineSession;
import com.healthcare.telemedicine.entity.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TelemedicineSessionRepository extends JpaRepository<TelemedicineSession, Long> {
    Optional<TelemedicineSession> findBySessionId(String sessionId);
    Optional<TelemedicineSession> findByAppointmentId(Long appointmentId);
    
    // Get latest session for an appointment (ordered by creation time)
    Optional<TelemedicineSession> findTopByAppointmentIdOrderByCreatedAtDesc(Long appointmentId);
    
    // Get latest non-ended session for an appointment
    Optional<TelemedicineSession> findTopByAppointmentIdAndStatusNotOrderByCreatedAtDesc(
        Long appointmentId, SessionStatus status);
    
    List<TelemedicineSession> findByDoctorId(Long doctorId);
    List<TelemedicineSession> findByPatientId(Long patientId);
    List<TelemedicineSession> findByDoctorIdAndStatus(Long doctorId, SessionStatus status);
    List<TelemedicineSession> findByPatientIdAndStatus(Long patientId, SessionStatus status);
}
