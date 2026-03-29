package com.healthcare.patient.controller;

import com.healthcare.patient.dto.ApiResponse;
import com.healthcare.patient.dto.MedicalReportDto;
import com.healthcare.patient.service.MedicalReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/patients/{patientId}/reports")
@RequiredArgsConstructor
public class MedicalReportController {

    private final MedicalReportService reportService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<MedicalReportDto>> uploadReport(
            @PathVariable("patientId") Long patientId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "reportType", required = false) String reportType) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "File is required", null));
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/") &&
                !contentType.equals("application/pdf"))) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Only images and PDFs are allowed", null));
        }

        MedicalReportDto uploaded = reportService.uploadReport(patientId, file, description, reportType);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Report uploaded successfully", uploaded));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MedicalReportDto>>> getPatientReports(@PathVariable("patientId") Long patientId) {
        List<MedicalReportDto> reports = reportService.getReportsByPatientId(patientId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Reports fetched successfully", reports));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<MedicalReportDto>>> getReportsByUserId(@PathVariable("userId") Long userId) {
        List<MedicalReportDto> reports = reportService.getReportsByUserId(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Reports fetched successfully", reports));
    }

    @GetMapping("/{reportId}")
    public ResponseEntity<ApiResponse<MedicalReportDto>> getReportById(
            @PathVariable("patientId") Long patientId,
            @PathVariable("reportId") Long reportId) {
        MedicalReportDto report = reportService.getReportById(reportId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Report fetched successfully", report));
    }

    @GetMapping("/{reportId}/download")
    public ResponseEntity<byte[]> downloadReport(
            @PathVariable("patientId") Long patientId,
            @PathVariable("reportId") Long reportId) {
        MedicalReportDto report = reportService.getReportById(reportId);
        byte[] fileContent = reportService.downloadReport(reportId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(report.getFileType()));
        headers.setContentDispositionFormData("attachment", report.getFileName());
        headers.setContentLength(fileContent.length);

        return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);
    }

    @DeleteMapping("/{reportId}")
    public ResponseEntity<ApiResponse<Void>> deleteReport(
            @PathVariable("patientId") Long patientId,
            @PathVariable("reportId") Long reportId) {
        reportService.deleteReport(reportId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Report deleted successfully", null));
    }
}
