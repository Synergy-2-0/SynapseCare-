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
    private final PatientEventProducer eventProducer;

    public PatientDto createPatient(PatientDto patientDto) {
        if (patientRepository.existsByEmail(patientDto.getEmail())) {
            throw new RuntimeException("Email already in use");
        }
        Patient patient = mapToEntity(patientDto);
        Patient savedPatient = patientRepository.save(patient);
        PatientDto savedDto = mapToDto(savedPatient);
        eventProducer.sendPatientCreatedEvent(savedDto);
        return savedDto;
    }

    public PatientDto getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
        return mapToDto(patient);
    }

    public PatientDto getPatientByUserId(Long userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with userId: " + userId));
        return mapToDto(patient);
    }

    public List<PatientDto> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public PatientDto updatePatient(Long id, PatientDto patientDto) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
        
        patient.setName(patientDto.getName());
        patient.setEmail(patientDto.getEmail()); // Added email update as per instruction snippet
        patient.setPhone(patientDto.getPhone());
        patient.setAddress(patientDto.getAddress());
        patient.setDob(patientDto.getDob());
        patient.setGender(patientDto.getGender());
        patient.setBloodGroup(patientDto.getBloodGroup());
        patient.setAllergies(patientDto.getAllergies());
        patient.setEmergencyContact(patientDto.getEmergencyContact());
        
        Patient updatedPatient = patientRepository.save(patient);
        PatientDto updatedDto = mapToDto(updatedPatient);
        eventProducer.sendPatientUpdatedEvent(updatedDto);
        return updatedDto;
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
                .userId(dto.getUserId())
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .dob(dto.getDob())
                .gender(dto.getGender())
                .address(dto.getAddress())
                .bloodGroup(dto.getBloodGroup())
                .allergies(dto.getAllergies())
                .emergencyContact(dto.getEmergencyContact())
                .build();
    }

    private PatientDto mapToDto(Patient entity) {
        return PatientDto.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .name(entity.getName())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .dob(entity.getDob())
                .gender(entity.getGender())
                .address(entity.getAddress())
                .bloodGroup(entity.getBloodGroup())
                .allergies(entity.getAllergies())
                .emergencyContact(entity.getEmergencyContact())
                .build();
    }
}
