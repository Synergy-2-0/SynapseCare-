package com.healthcare.patient.service;

import com.healthcare.patient.dto.MedicalHistoryDto;
import com.healthcare.patient.entity.MedicalHistory;
import com.healthcare.patient.exception.ResourceNotFoundException;
import com.healthcare.patient.repository.MedicalHistoryRepository;
import com.healthcare.patient.repository.PatientRepository;
import com.healthcare.patient.entity.Patient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalHistoryService {

    private final MedicalHistoryRepository repository;
    private final PatientRepository patientRepository;

    public MedicalHistoryDto addHistory(MedicalHistoryDto dto) {
        MedicalHistory history = mapToEntity(dto);
        history = repository.save(history);
        return mapToDto(history);
    }

    public List<MedicalHistoryDto> getHistoryByPatient(Long patientId) {
        return repository.findByPatientId(patientId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<MedicalHistoryDto> getHistoryByUserId(Long userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found for userId: " + userId));
        return getHistoryByPatient(patient.getId());
    }

    public void deleteHistory(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Medical history not found");
        }
        repository.deleteById(id);
    }

    private MedicalHistory mapToEntity(MedicalHistoryDto dto) {
        return MedicalHistory.builder()
                .id(dto.getId())
                .patientId(dto.getPatientId())
                .condition(dto.getCondition())
                .diagnosisDate(dto.getDiagnosisDate())
                .treatment(dto.getTreatment())
                .notes(dto.getNotes())
                .build();
    }

    private MedicalHistoryDto mapToDto(MedicalHistory entity) {
        return MedicalHistoryDto.builder()
                .id(entity.getId())
                .patientId(entity.getPatientId())
                .condition(entity.getCondition())
                .diagnosisDate(entity.getDiagnosisDate())
                .treatment(entity.getTreatment())
                .notes(entity.getNotes())
                .build();
    }
}
