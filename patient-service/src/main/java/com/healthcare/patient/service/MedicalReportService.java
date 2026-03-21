package com.healthcare.patient.service;

import com.healthcare.patient.dto.MedicalReportDto;
import com.healthcare.patient.entity.MedicalReport;
import com.healthcare.patient.repository.MedicalReportRepository;
import com.healthcare.patient.repository.PatientRepository;
import com.healthcare.patient.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalReportService {

    private final MedicalReportRepository reportRepository;
    private final PatientRepository patientRepository;

    public MedicalReportDto uploadReport(Long patientId, MedicalReportDto dto) {
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found");
        }
        MedicalReport report = MedicalReport.builder()
                .patientId(patientId)
                .fileUrl(dto.getFileUrl())
                .description(dto.getDescription())
                .build();
                
        report = reportRepository.save(report);
        return mapToDto(report);
    }

    public List<MedicalReportDto> getReportsByPatientId(Long patientId) {
        return reportRepository.findByPatientId(patientId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private MedicalReportDto mapToDto(MedicalReport entity) {
        return MedicalReportDto.builder()
                .id(entity.getId())
                .patientId(entity.getPatientId())
                .fileUrl(entity.getFileUrl())
                .description(entity.getDescription())
                .build();
    }
}
