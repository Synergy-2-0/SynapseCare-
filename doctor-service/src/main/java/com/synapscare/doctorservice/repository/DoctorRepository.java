package com.synapscare.doctorservice.repository;

import com.synapscare.doctorservice.entity.Doctor;
import com.synapscare.doctorservice.enums.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    boolean existsByLicenseNumber(String licenseNumber);

    List<Doctor> findByVerificationStatus(VerificationStatus status);

    @Query("SELECT d FROM Doctor d WHERE " +
            "(:specialization IS NULL OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', :specialization, '%'))) AND " +
            "(:minFee IS NULL OR d.consultationFee >= :minFee) AND " +
            "(:maxFee IS NULL OR d.consultationFee <= :maxFee) AND " +
            "d.verificationStatus = 'APPROVED' AND " +
            "d.isAvailable = true")
    List<Doctor> searchDoctors(
            @Param("specialization") String specialization,
            @Param("minFee") BigDecimal minFee,
            @Param("maxFee") BigDecimal maxFee
    );
}
