package com.synapscare.doctorservice.repository;

import com.synapscare.doctorservice.entity.DoctorAvailability;
import com.synapscare.doctorservice.enums.DayOfWeek;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {

    List<DoctorAvailability> findByDoctorId(Long doctorId);

    List<DoctorAvailability> findByDoctorIdAndIsActive(Long doctorId, Boolean isActive);

    List<DoctorAvailability> findByDoctorIdAndDayOfWeek(Long doctorId, DayOfWeek dayOfWeek);

    void deleteByDoctorId(Long doctorId);
}
