package com.healthcare.telemedicine.repository;

import com.healthcare.telemedicine.entity.ConsultationSession;
import com.healthcare.telemedicine.entity.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConsultationSessionRepository extends JpaRepository<ConsultationSession, Long> {
    Optional<ConsultationSession> findBySessionId(String sessionId);
    Optional<ConsultationSession> findByAppointmentId(Long appointmentId);
    List<ConsultationSession> findByDoctorId(Long doctorId);
    List<ConsultationSession> findByPatientId(Long patientId);
    List<ConsultationSession> findByDoctorIdAndStatus(Long doctorId, SessionStatus status);
    List<ConsultationSession> findByPatientIdAndStatus(Long patientId, SessionStatus status);
}
