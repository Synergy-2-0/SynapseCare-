package com.healthcare.appointment.repository;

import com.healthcare.appointment.entity.DoctorLeave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorLeaveRepository extends JpaRepository<DoctorLeave, Long> {
    List<DoctorLeave> findByDoctorId(Long doctorId);
}