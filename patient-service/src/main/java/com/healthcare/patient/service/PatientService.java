package com.healthcare.patient.service;

import com.healthcare.patient.dto.PatientDto;
import com.healthcare.patient.entity.Patient;
import com.healthcare.patient.exception.ResourceNotFoundException;
import com.healthcare.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientDto createPatient(PatientDto dto) {
        if (patientRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already in use");
        }
        Patient patient = mapToEntity(dto);
        patient = patientRepository.save(patient);
        return mapToDto(patient);
    }

    public PatientDto getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
        return mapToDto(patient);
    }

    public List<PatientDto> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public PatientDto updatePatient(Long id, PatientDto dto) {
        Patient existing = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
        
        existing.setName(dto.getName());
        existing.setPhone(dto.getPhone());
        existing.setAddress(dto.getAddress());
        existing.setDob(dto.getDob());
        existing.setGender(dto.getGender());
        
        existing = patientRepository.save(existing);
        return mapToDto(existing);
    }

    public void deletePatient(Long id) {
        if (!patientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Patient not found with id: " + id);
        }
        patientRepository.deleteById(id);
    }

    private Patient mapToEntity(PatientDto dto) {
        return Patient.builder()
                .id(dto.getId())
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .dob(dto.getDob())
                .gender(dto.getGender())
                .address(dto.getAddress())
                .build();
    }

    private PatientDto mapToDto(Patient entity) {
        return PatientDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .dob(entity.getDob())
                .gender(entity.getGender())
                .address(entity.getAddress())
                .build();
    }
}
