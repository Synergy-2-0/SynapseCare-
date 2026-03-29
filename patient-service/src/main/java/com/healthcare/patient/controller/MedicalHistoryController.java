package com.healthcare.patient.controller;

import com.healthcare.patient.dto.ApiResponse;
import com.healthcare.patient.dto.MedicalHistoryDto;
import com.healthcare.patient.service.MedicalHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-history")
@RequiredArgsConstructor
public class MedicalHistoryController {

    private final MedicalHistoryService historyService;

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

    @GetMapping("/patient/user/{userId}")
    public ResponseEntity<ApiResponse<List<MedicalHistoryDto>>> getHistoryByUserId(@PathVariable("userId") Long userId) {
        List<MedicalHistoryDto> history = historyService.getHistoryByUserId(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "History fetched", history));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHistory(@PathVariable("id") Long id) {
        historyService.deleteHistory(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "History deleted", null));
    }
}
