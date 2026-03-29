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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

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

    /**
     * Search doctors with complete profiles and APPROVED verification.
     * Returns empty if no doctors meet ALL criteria:
     * - specialization IS NOT NULL (profile complete)
     * - consultationFee IS NOT NULL (profile complete)
     * - verificationStatus = APPROVED
     */
    @GetMapping("/search")
    public ResponseEntity<List<DoctorProfileResponse>> searchDoctors(
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) BigDecimal minFee,
            @RequestParam(required = false) BigDecimal maxFee
    ) {
        List<DoctorProfileResponse> doctors = doctorService.searchDoctors(specialization, minFee, maxFee);
        return ResponseEntity.ok(doctors);
    }

    /**
     * Get ALL doctors (for debugging/admin purposes).
     * Shows doctors regardless of verification or profile completion status.
     */
    @GetMapping("/all")
    public ResponseEntity<List<DoctorProfileResponse>> getAllDoctors() {
        List<DoctorProfileResponse> doctors = doctorService.getAllDoctors();
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

    @PostMapping(value = "/profile/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadDoctorFiles(
            @RequestParam("type") String type,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        // Logic: Save file to static/uploads/{userId}/{type} and return URL
        // Simplified for dev: returns a mock URL but validates the file exists
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }
        
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        // In a real production system, you'd use S3 or a dedicated FileService.
        // For development, we'll return a path that the frontend can reference.
        String mockUrl = "/uploads/doctors/" + userPrincipal.getUserId() + "/" + type + "/" + fileName;
        
        return ResponseEntity.ok(Map.of("url", mockUrl));
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

    /**
     * Get all doctors pending verification.
     * For actual verification, use auth-service: PUT /api/admin/doctors/{id}/verify
     */
    @GetMapping("/pending")
    public ResponseEntity<List<DoctorProfileResponse>> getPendingDoctors() {
        List<DoctorProfileResponse> doctors = doctorService.getPendingDoctors();
        return ResponseEntity.ok(doctors);
    }

    /**
     * REMOVED: PUT /api/doctors/{id}/verify
     *
     * Doctor verification is now exclusively handled by auth-service.
     * Use this endpoint instead: PUT /api/admin/doctors/{id}/verify in auth-service
     *
     * Doctor-service automatically syncs verification status from auth-service via RabbitMQ events.
     */
}
