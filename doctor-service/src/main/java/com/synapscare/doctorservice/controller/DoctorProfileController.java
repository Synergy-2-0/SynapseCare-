package com.synapscare.doctor.controller;

import com.synapscare.doctor.dto.request.DoctorProfileRequest;
import com.synapscare.doctor.dto.response.DoctorProfileResponse;
import com.synapscare.doctor.security.UserDetailsImpl;
import com.synapscare.doctor.service.DoctorProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorProfileController {

    private final DoctorProfileService profileService;

    @GetMapping
    public ResponseEntity<List<DoctorProfileResponse>> listDoctors(
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(profileService.listDoctors(specialty, search));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<DoctorProfileResponse> getDoctorByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(profileService.getByUserId(userId));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorProfileResponse> getMyProfile(
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(profileService.getByUserId(user.getId()));
    }

    @PostMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorProfileResponse> createProfile(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody DoctorProfileRequest request) {
        return ResponseEntity.status(201).body(profileService.createProfile(user.getId(), request));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody DoctorProfileRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(user.getId(), request));
    }
}