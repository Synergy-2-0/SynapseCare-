package com.synapscare.doctorservice.repository;

import com.synapscare.doctorservice.entity.ConsultationCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConsultationCaseRepository extends JpaRepository<ConsultationCase, Long> {

    List<ConsultationCase> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);

    List<ConsultationCase> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    List<ConsultationCase> findByDoctorIdAndStatusOrderByCreatedAtDesc(Long doctorId, ConsultationCase.CaseStatus status);

    Optional<ConsultationCase> findByAppointmentId(Long appointmentId);

    List<ConsultationCase> findByDoctorIdAndPatientIdOrderByCreatedAtDesc(Long doctorId, Long patientId);

    boolean existsByAppointmentId(Long appointmentId);
}
