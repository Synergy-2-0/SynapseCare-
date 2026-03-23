package com.synapscare.doctor.repository;

import com.synapscare.doctor.entity.TelemedicineSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TelemedicineSessionRepository extends JpaRepository<TelemedicineSession, Long> {
    Optional<TelemedicineSession> findByRoomName(String roomName);
    Optional<TelemedicineSession> findByAppointmentId(Long appointmentId);
    List<TelemedicineSession> findByDoctorUserIdOrderByScheduledAtDesc(Long doctorUserId);
    List<TelemedicineSession> findByPatientUserIdOrderByScheduledAtDesc(Long patientUserId);
    List<TelemedicineSession> findByDoctorUserIdAndStatus(
            Long doctorUserId, TelemedicineSession.SessionStatus status);
}