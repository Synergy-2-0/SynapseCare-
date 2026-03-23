package com.synapscare.doctor.repository;

import com.synapscare.doctor.entity.AvailabilitySlot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, Long> {
    List<AvailabilitySlot> findByDoctorUserIdAndIsAvailableTrue(Long doctorUserId);
    List<AvailabilitySlot> findByDoctorUserId(Long doctorUserId);
    Optional<AvailabilitySlot> findByIdAndDoctorUserId(Long id, Long doctorUserId);
    boolean existsByDoctorUserIdAndDayOfWeekAndStartTime(
            Long doctorUserId, DayOfWeek dayOfWeek, java.time.LocalTime startTime);
}