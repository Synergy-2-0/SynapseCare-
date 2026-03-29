package com.synapscare.doctorservice.controller;

import com.synapscare.doctorservice.dto.request.CreateCaseRequest;
import com.synapscare.doctorservice.dto.request.UpdateCaseRequest;
import com.synapscare.doctorservice.dto.response.CaseResponse;
import com.synapscare.doctorservice.service.ConsultationCaseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors/cases")
@RequiredArgsConstructor
@Slf4j
public class ConsultationCaseController {

    private final ConsultationCaseService caseService;

    @PostMapping
    public ResponseEntity<?> createCase(
            @RequestHeader("X-User-Id") Long doctorId,
            @RequestBody CreateCaseRequest request) {
        log.info("Creating case for doctor {} and patient {}", doctorId, request.getPatientId());
        CaseResponse response = caseService.createCase(doctorId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Case created successfully", "data", response));
    }

    @GetMapping
    public ResponseEntity<List<CaseResponse>> getDoctorCases(
            @RequestHeader("X-User-Id") Long doctorId,
            @RequestParam(value = "status", required = false) String status) {
        List<CaseResponse> cases;
        if (status != null && !status.isEmpty()) {
            cases = caseService.getCasesByDoctorAndStatus(doctorId, status);
        } else {
            cases = caseService.getCasesByDoctor(doctorId);
        }
        return ResponseEntity.ok(cases);
    }

    @GetMapping("/{caseId}")
    public ResponseEntity<CaseResponse> getCaseById(@PathVariable("caseId") Long caseId) {
        return ResponseEntity.ok(caseService.getCaseById(caseId));
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<CaseResponse> getCaseByAppointment(@PathVariable("appointmentId") Long appointmentId) {
        return ResponseEntity.ok(caseService.getCaseByAppointmentId(appointmentId));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<CaseResponse>> getPatientCases(@PathVariable("patientId") Long patientId) {
        return ResponseEntity.ok(caseService.getCasesByPatient(patientId));
    }

    @GetMapping("/patient/{patientId}/history")
    public ResponseEntity<List<CaseResponse>> getPatientCaseHistory(
            @RequestHeader("X-User-Id") Long doctorId,
            @PathVariable("patientId") Long patientId) {
        return ResponseEntity.ok(caseService.getPatientCaseHistory(doctorId, patientId));
    }

    @PutMapping("/{caseId}")
    public ResponseEntity<?> updateCase(
            @RequestHeader("X-User-Id") Long doctorId,
            @PathVariable("caseId") Long caseId,
            @RequestBody UpdateCaseRequest request) {
        log.info("Updating case {} by doctor {}", caseId, doctorId);
        CaseResponse response = caseService.updateCase(caseId, doctorId, request);
        return ResponseEntity.ok(Map.of("message", "Case updated successfully", "data", response));
    }

    @PostMapping("/{caseId}/finalize")
    public ResponseEntity<?> finalizeCase(
            @RequestHeader("X-User-Id") Long doctorId,
            @PathVariable("caseId") Long caseId) {
        log.info("Finalizing case {} by doctor {}", caseId, doctorId);
        CaseResponse response = caseService.finalizeCase(caseId, doctorId);
        return ResponseEntity.ok(Map.of("message", "Case finalized successfully", "data", response));
    }
}
