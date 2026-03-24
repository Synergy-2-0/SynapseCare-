package com.synapscare.doctorservice.repository;

import com.synapscare.doctorservice.entity.DoctorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, Long> {

    List<DoctorSchedule> findByDoctorId(Long doctorId);

    List<DoctorSchedule> findByDoctorIdAndDateBetween(Long doctorId, LocalDate startDate, LocalDate endDate);

    Optional<DoctorSchedule> findByDoctorIdAndDate(Long doctorId, LocalDate date);

    void deleteByDoctorId(Long doctorId);
}
