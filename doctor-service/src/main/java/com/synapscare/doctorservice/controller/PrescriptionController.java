package com.synapscare.doctor.controller;

import com.synapscare.doctor.dto.request.PrescriptionRequest;
import com.synapscare.doctor.dto.response.PrescriptionResponse;
import com.synapscare.doctor.security.UserDetailsImpl;
import com.synapscare.doctor.service.PrescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<PrescriptionResponse> issuePrescription(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody PrescriptionRequest request) {
        return ResponseEntity.status(201)
                .body(prescriptionService.issue(user.getId(), request));
    }

    @GetMapping("/issued")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<PrescriptionResponse>> getIssuedPrescriptions(
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(prescriptionService.getByDoctor(user.getId()));
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<PrescriptionResponse>> getMyPrescriptions(
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(prescriptionService.getByPatient(user.getId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR','PATIENT','ADMIN')")
    public ResponseEntity<PrescriptionResponse> getPrescription(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long id) {
        return ResponseEntity.ok(prescriptionService.getById(id, user));
    }
}