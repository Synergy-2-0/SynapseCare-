package com.healthcare.doctor.service;

import com.healthcare.doctor.dto.AvailabilitySlotDto;
import com.healthcare.doctor.dto.DoctorDto;
import com.healthcare.doctor.entity.AvailabilitySlot;
import com.healthcare.doctor.entity.Doctor;
import com.healthcare.doctor.exception.ResourceNotFoundException;
import com.healthcare.doctor.repository.AvailabilitySlotRepository;
import com.healthcare.doctor.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final AvailabilitySlotRepository slotRepository;

    public DoctorDto createDoctor(DoctorDto dto) {
        Doctor doctor = Doctor.builder()
                .name(dto.getName())
                .specialization(dto.getSpecialization())
                .experience(dto.getExperience())
                .fee(dto.getFee())
                .build();
        doctor = doctorRepository.save(doctor);
        return mapToDto(doctor);
    }

    public DoctorDto getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        return mapToDto(doctor);
    }

    public List<DoctorDto> getAllDoctors() {
        return doctorRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public AvailabilitySlotDto addSlot(Long doctorId, AvailabilitySlotDto dto) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new ResourceNotFoundException("Doctor not found");
        }
        AvailabilitySlot slot = AvailabilitySlot.builder()
                .doctorId(doctorId)
                .date(dto.getDate())
                .time(dto.getTime())
                .isAvailable(true)
                .build();
        slot = slotRepository.save(slot);
        return mapToSlotDto(slot);
    }

    public List<AvailabilitySlotDto> getSlots(Long doctorId, LocalDate date) {
        return slotRepository.findByDoctorIdAndDate(doctorId, date).stream()
                .map(this::mapToSlotDto)
                .collect(Collectors.toList());
    }

    private DoctorDto mapToDto(Doctor entity) {
        return DoctorDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .specialization(entity.getSpecialization())
                .experience(entity.getExperience())
                .fee(entity.getFee())
                .build();
    }

    private AvailabilitySlotDto mapToSlotDto(AvailabilitySlot entity) {
        return AvailabilitySlotDto.builder()
                .id(entity.getId())
                .doctorId(entity.getDoctorId())
                .date(entity.getDate())
                .time(entity.getTime())
                .isAvailable(entity.getIsAvailable())
                .build();
    }
}
