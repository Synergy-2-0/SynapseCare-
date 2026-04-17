package com.healthcare.appointment.repository;

import com.healthcare.appointment.entity.ExtraSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExtraSlotRepository extends JpaRepository<ExtraSlot, Long> {
    List<ExtraSlot> findByDoctorIdAndDate(Long doctorId, LocalDate date);
    List<ExtraSlot> findByDoctorId(Long doctorId);
}
