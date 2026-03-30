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
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MedicalReportService {

    private final MedicalReportRepository reportRepository;
    private final FileStorageService fileStorageService;
    private final PatientRepository patientRepository;

    public MedicalReportDto uploadReport(Long patientId, MultipartFile file, String description, String reportType) {
        try {
            String objectName = fileStorageService.uploadFile(patientId, file);
            String presignedUrl = fileStorageService.getPresignedUrl(objectName);

            MedicalReport report = MedicalReport.builder()
                    .patientId(patientId)
                    .fileName(file.getOriginalFilename())
                    .objectName(objectName)
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .fileUrl(presignedUrl)
                    .description(description)
                    .reportType(reportType != null ? reportType : "OTHER")
                    .build();

            report = reportRepository.save(report);
            log.info("Medical report uploaded for patient {}: {}", patientId, objectName);
            return mapToDto(report);
        } catch (Exception e) {
            log.error("Failed to upload medical report for patient {}: {}", patientId, e.getMessage());
            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
        }
    }

    public List<MedicalReportDto> getReportsByPatientId(Long patientId) {
        return reportRepository.findByPatientId(patientId).stream()
                .map(this::enrichWithPresignedUrl)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<MedicalReportDto> getReportsByUserId(Long userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found for userId: " + userId));
        return getReportsByPatientId(patient.getId());
    }

    private MedicalReport enrichWithPresignedUrl(MedicalReport report) {
        try {
            if (report.getObjectName() != null) {
                String freshUrl = fileStorageService.getPresignedUrl(report.getObjectName());
                report.setFileUrl(freshUrl);
            }
        } catch (Exception e) {
            log.warn("Could not generate presigned URL for report {}: {}", report.getId(), e.getMessage());
        }
        return report;
    }

    public MedicalReportDto getReportById(Long reportId) {
        MedicalReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + reportId));

        try {
            if (report.getObjectName() != null) {
                String freshUrl = fileStorageService.getPresignedUrl(report.getObjectName());
                report.setFileUrl(freshUrl);
            }
        } catch (Exception e) {
            log.warn("Could not generate presigned URL for report {}: {}", reportId, e.getMessage());
        }

        return mapToDto(report);
    }

    public void deleteReport(Long reportId) {
        MedicalReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + reportId));

        try {
            if (report.getObjectName() != null) {
                fileStorageService.deleteFile(report.getObjectName());
            }
            reportRepository.delete(report);
            log.info("Medical report deleted: {}", reportId);
        } catch (Exception e) {
            log.error("Failed to delete medical report {}: {}", reportId, e.getMessage());
            throw new RuntimeException("Failed to delete file: " + e.getMessage(), e);
        }
    }

    public byte[] downloadReport(Long reportId) {
        MedicalReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + reportId));

        try {
            return fileStorageService.downloadFile(report.getObjectName()).readAllBytes();
        } catch (Exception e) {
            log.error("Failed to download report {}: {}", reportId, e.getMessage());
            throw new RuntimeException("Failed to download file: " + e.getMessage(), e);
        }
    }

    private MedicalReportDto mapToDto(MedicalReport entity) {
        return MedicalReportDto.builder()
                .id(entity.getId())
                .patientId(entity.getPatientId())
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
