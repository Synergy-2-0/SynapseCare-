package com.synapscare.doctorservice.controller;

import com.synapscare.doctorservice.dto.request.*;
import com.synapscare.doctorservice.dto.response.*;
import com.synapscare.doctorservice.security.UserPrincipal;
import com.synapscare.doctorservice.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    // ==================== Public Endpoints ====================

    @GetMapping("/search")
    public ResponseEntity<List<DoctorProfileResponse>> searchDoctors(
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) BigDecimal minFee,
            @RequestParam(required = false) BigDecimal maxFee
    ) {
        List<DoctorProfileResponse> doctors = doctorService.searchDoctors(specialization, minFee, maxFee);
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorProfileResponse> getDoctorById(@PathVariable Long id) {
        DoctorProfileResponse doctor = doctorService.getDoctorById(id);
        return ResponseEntity.ok(doctor);
    }

    @GetMapping("/{id}/available-slots")
    public ResponseEntity<List<AvailableSlotResponse>> getAvailableSlots(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        List<AvailableSlotResponse> slots = doctorService.getAvailableSlots(id, date);
        return ResponseEntity.ok(slots);
    }

    // ==================== Doctor Endpoints ====================

    @PostMapping("/profile")
    public ResponseEntity<DoctorProfileResponse> createProfile(
            @Valid @RequestBody CreateDoctorProfileRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        DoctorProfileResponse response = doctorService.createDoctorProfile(userPrincipal.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<DoctorProfileResponse> updateProfile(
            @Valid @RequestBody UpdateDoctorProfileRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        // First get the doctor by userId
        DoctorProfileResponse existingDoctor = doctorService.getDoctorByUserId(userPrincipal.getUserId());
        DoctorProfileResponse response = doctorService.updateDoctorProfile(
                existingDoctor.getId(),
                userPrincipal.getUserId(),
                request
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile/me")
    public ResponseEntity<DoctorProfileResponse> getMyProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        DoctorProfileResponse response = doctorService.getDoctorByUserId(userPrincipal.getUserId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/availability")
    public ResponseEntity<DoctorAvailabilityResponse> setAvailability(
            @Valid @RequestBody SetAvailabilityRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        DoctorProfileResponse doctor = doctorService.getDoctorByUserId(userPrincipal.getUserId());
        DoctorAvailabilityResponse response = doctorService.setAvailability(
                doctor.getId(),
                userPrincipal.getUserId(),
                request
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/availability")
    public ResponseEntity<List<DoctorAvailabilityResponse>> getMyAvailability(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        DoctorProfileResponse doctor = doctorService.getDoctorByUserId(userPrincipal.getUserId());
        List<DoctorAvailabilityResponse> response = doctorService.getDoctorAvailability(doctor.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/schedule")
    public ResponseEntity<DoctorScheduleResponse> addSchedule(
            @Valid @RequestBody AddScheduleRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        DoctorProfileResponse doctor = doctorService.getDoctorByUserId(userPrincipal.getUserId());
        DoctorScheduleResponse response = doctorService.addSchedule(
                doctor.getId(),
                userPrincipal.getUserId(),
                request
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/status")
    public ResponseEntity<Map<String, String>> updateStatus(
            @RequestBody Map<String, Boolean> statusRequest,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        DoctorProfileResponse doctor = doctorService.getDoctorByUserId(userPrincipal.getUserId());
        Boolean isAvailable = statusRequest.get("isAvailable");
        doctorService.updateAvailabilityStatus(doctor.getId(), userPrincipal.getUserId(), isAvailable);
        return ResponseEntity.ok(Map.of("message", "Status updated successfully"));
    }

    // ==================== Admin Endpoints ====================

    @GetMapping("/pending")
    public ResponseEntity<List<DoctorProfileResponse>> getPendingDoctors() {
        List<DoctorProfileResponse> doctors = doctorService.getPendingDoctors();
        return ResponseEntity.ok(doctors);
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<DoctorProfileResponse> verifyDoctor(
            @PathVariable Long id,
            @Valid @RequestBody VerifyDoctorRequest request
    ) {
        DoctorProfileResponse response = doctorService.verifyDoctor(id, request.getStatus());
        return ResponseEntity.ok(response);
    }
}
