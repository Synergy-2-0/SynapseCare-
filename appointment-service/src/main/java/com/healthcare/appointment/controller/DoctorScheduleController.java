package com.healthcare.appointment.controller;

import com.healthcare.appointment.dto.DoctorAvailabilityDto;
import com.healthcare.appointment.dto.DoctorLeaveDto;
import com.healthcare.appointment.entity.DoctorAvailability;
import com.healthcare.appointment.entity.DoctorLeave;
import com.healthcare.appointment.repository.DoctorAvailabilityRepository;
import com.healthcare.appointment.repository.DoctorLeaveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/appointments/schedule")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DoctorScheduleController {

    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorLeaveRepository leaveRepository;

    @GetMapping("/doctor/{doctorId}/availability")
    public ResponseEntity<List<DoctorAvailabilityDto>> getAvailability(@PathVariable Long doctorId) {
        List<DoctorAvailability> availabilities = availabilityRepository.findByDoctorId(doctorId);
        List<DoctorAvailabilityDto> dtos = availabilities.stream().map(a -> DoctorAvailabilityDto.builder()
                .id(a.getId())
                .doctorId(a.getDoctorId())
                .dayOfWeek(a.getDayOfWeek())
                .isWorking(a.getIsWorking())
                .startTime(a.getStartTime())
                .endTime(a.getEndTime())
                .slotDuration(a.getSlotDuration())
                .bufferTime(a.getBufferTime())
                .build()).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/doctor/{doctorId}/availability")
    @Transactional
    public ResponseEntity<?> saveAvailability(@PathVariable Long doctorId, @RequestBody List<DoctorAvailabilityDto> dtos) {
        // Clear existing and save new
        availabilityRepository.deleteByDoctorId(doctorId);
        
        List<DoctorAvailability> entities = dtos.stream().map(dto -> DoctorAvailability.builder()
                .doctorId(doctorId)
                .dayOfWeek(dto.getDayOfWeek())
                .isWorking(dto.getIsWorking())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .slotDuration(dto.getSlotDuration())
                .bufferTime(dto.getBufferTime())
                .build()).collect(Collectors.toList());
                
        availabilityRepository.saveAll(entities);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/doctor/{doctorId}/leaves")
    public ResponseEntity<List<DoctorLeaveDto>> getLeaves(@PathVariable Long doctorId) {
        List<DoctorLeave> leaves = leaveRepository.findByDoctorId(doctorId);
        List<DoctorLeaveDto> dtos = leaves.stream().map(l -> DoctorLeaveDto.builder()
                .id(l.getId())
                .doctorId(l.getDoctorId())
                .startDate(l.getStartDate())
                .endDate(l.getEndDate())
                .reason(l.getReason())
                .build()).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/doctor/{doctorId}/leaves")
    public ResponseEntity<DoctorLeaveDto> addLeave(@PathVariable Long doctorId, @RequestBody DoctorLeaveDto dto) {
        DoctorLeave l = DoctorLeave.builder()
                .doctorId(doctorId)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .reason(dto.getReason())
                .build();
        DoctorLeave saved = leaveRepository.save(l);
        dto.setId(saved.getId());
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/leaves/{id}")
    public ResponseEntity<?> removeLeave(@PathVariable Long id) {
        leaveRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}