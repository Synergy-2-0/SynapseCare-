package com.healthcare.patient.controller;

import com.healthcare.patient.dto.ApiResponse;
import com.healthcare.patient.dto.MedicalReportDto;
import com.healthcare.patient.service.MedicalReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/patients/{patientId}/reports")
@RequiredArgsConstructor
public class MedicalReportController {

    private final MedicalReportService reportService;

    @PostMapping
    public ResponseEntity<ApiResponse<MedicalReportDto>> uploadReport(
            @PathVariable Long patientId,
            @RequestBody MedicalReportDto dto) {
        MedicalReportDto uploaded = reportService.uploadReport(patientId, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Report uploaded successfully", uploaded));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MedicalReportDto>>> getPatientReports(@PathVariable Long patientId) {
        List<MedicalReportDto> reports = reportService.getReportsByPatientId(patientId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Reports fetched successfully", reports));
    }
}
