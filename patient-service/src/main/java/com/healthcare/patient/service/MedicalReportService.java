package com.healthcare.patient.service;

import com.healthcare.patient.dto.MedicalReportDto;
import com.healthcare.patient.entity.MedicalReport;
import com.healthcare.patient.repository.MedicalReportRepository;
import com.healthcare.patient.repository.PatientRepository;
import com.healthcare.patient.entity.Patient;
import com.healthcare.patient.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MedicalReportService {

    private final MedicalReportRepository reportRepository;
    private final PatientRepository patientRepository;
    private final FileStorageService fileStorageService;

    public MedicalReportDto uploadReport(Long patientId, Long appointmentId, String reportType, String description, org.springframework.web.multipart.MultipartFile file) {
        String subFolder = "patients/" + patientId + "/reports";
        String fileUrl = fileStorageService.storeFile(file, subFolder);

        MedicalReport report = MedicalReport.builder()
                .patientId(patientId)
                .appointmentId(appointmentId)
                .fileName(file.getOriginalFilename())
                .fileUrl(fileUrl)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .description(description)
                .reportType(reportType != null ? reportType : "OTHER")
                .build();

        report = reportRepository.save(report);
        log.info("Clinical report uploaded and indexed for patient {}: {}", patientId, fileUrl);
        return mapToDto(report);
    }
    public MedicalReportDto createReportFromLink(MedicalReportDto reportDto) {
        MedicalReport report = MedicalReport.builder()
                .patientId(reportDto.getPatientId())
                .appointmentId(reportDto.getAppointmentId())
                .fileName(reportDto.getFileName())
                .fileUrl(reportDto.getFileUrl())
                .fileType(reportDto.getFileType())
                .fileSize(reportDto.getFileSize())
                .description(reportDto.getDescription())
                .reportType(reportDto.getReportType() != null ? reportDto.getReportType() : "OTHER")
                .uploadedAt(reportDto.getUploadedAt())
                .build();

        report = reportRepository.save(report);
        log.info("Clinical media artifact indexed for patient {}: {}", reportDto.getPatientId(), reportDto.getFileUrl());
        return mapToDto(report);
    }

    public List<MedicalReportDto> getReportsByPatientId(Long patientId) {
        return reportRepository.findByPatientId(patientId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<MedicalReportDto> getReportsByUserId(Long userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found for userId: " + userId));
        return getReportsByPatientId(patient.getId());
    }

    public MedicalReportDto getReportById(Long reportId) {
        MedicalReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + reportId));
        return mapToDto(report);
    }

    public void deleteReport(Long reportId) {
        MedicalReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + reportId));
        reportRepository.delete(report);
        log.info("Medical record artifact de-indexed: {}", reportId);
    }

    private MedicalReportDto mapToDto(MedicalReport entity) {
        return MedicalReportDto.builder()
                .id(entity.getId())
                .patientId(entity.getPatientId())
                .appointmentId(entity.getAppointmentId())
                .fileName(entity.getFileName())
                .fileUrl(entity.getFileUrl())
                .fileType(entity.getFileType())
                .fileSize(entity.getFileSize())
                .description(entity.getDescription())
                .reportType(entity.getReportType())
                .uploadedAt(entity.getUploadedAt())
                .build();
    }
}
