package com.healthcare.patient.repository;

import com.healthcare.patient.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    boolean existsByEmail(String email);
    java.util.Optional<Patient> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}
