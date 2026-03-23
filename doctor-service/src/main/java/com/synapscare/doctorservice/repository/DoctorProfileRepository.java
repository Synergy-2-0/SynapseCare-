package com.synapscare.doctor.repository;

import com.synapscare.doctor.entity.DoctorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, Long> {
    Optional<DoctorProfile> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
    List<DoctorProfile> findByIsActiveTrue();
    List<DoctorProfile> findBySpecialtyIgnoreCaseAndIsActiveTrue(String specialty);
    List<DoctorProfile> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            String firstName, String lastName);
}