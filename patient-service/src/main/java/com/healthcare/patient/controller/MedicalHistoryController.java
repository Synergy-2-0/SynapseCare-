package com.healthcare.patient.controller;

import com.healthcare.patient.dto.ApiResponse;
import com.healthcare.patient.dto.MedicalHistoryDto;
import com.healthcare.patient.dto.MedicalReportDto;
import com.healthcare.patient.service.MedicalHistoryService;
import com.healthcare.patient.service.MedicalReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/medical-history")
@RequiredArgsConstructor
public class MedicalHistoryController {

    private final MedicalHistoryService historyService;
    private final MedicalReportService reportService;

    @PostMapping
    public ResponseEntity<ApiResponse<MedicalHistoryDto>> addHistory(@RequestBody MedicalHistoryDto dto) {
        MedicalHistoryDto created = historyService.addHistory(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Medical history added", created));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<MedicalHistoryDto>>> getHistoryByPatient(@PathVariable("patientId") Long patientId) {
        List<MedicalHistoryDto> history = historyService.getHistoryByPatient(patientId);
        return ResponseEntity.ok(new ApiResponse<>(true, "History fetched", history));
    }

    // --- High-Fidelity Medical Report Endpoints ---

    @PostMapping("/reports/link")
    public ResponseEntity<ApiResponse<MedicalReportDto>> createReportFromLink(@RequestBody MedicalReportDto reportDto) {
        if (reportDto.getUploadedAt() == null) {
            reportDto.setUploadedAt(LocalDateTime.now());
        }
        MedicalReportDto created = reportService.createReportFromLink(reportDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Clinical report link established", created));
    }

    @GetMapping("/reports/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<MedicalReportDto>>> getPatientReports(@PathVariable("patientId") Long patientId) {
        List<MedicalReportDto> reports = reportService.getReportsByPatientId(patientId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Reports fetched successfully", reports));
    }

    @GetMapping("/reports/user/{userId}")
    public ResponseEntity<ApiResponse<List<MedicalReportDto>>> getReportsByUserId(@PathVariable("userId") Long userId) {
        List<MedicalReportDto> reports = reportService.getReportsByUserId(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Reports fetched successfully", reports));
    }

    @DeleteMapping("/reports/{reportId}")
    public ResponseEntity<ApiResponse<Void>> deleteReport(@PathVariable("reportId") Long reportId) {
        reportService.deleteReport(reportId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Report deleted successfully", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHistory(@PathVariable("id") Long id) {
        historyService.deleteHistory(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "History deleted", null));
    }
}
