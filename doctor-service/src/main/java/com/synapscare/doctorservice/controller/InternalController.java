package com.synapscare.doctor.controller;

import com.synapscare.doctor.dto.response.AvailabilitySlotResponse;
import com.synapscare.doctor.dto.response.DoctorProfileResponse;
import com.synapscare.doctor.dto.response.TelemedicineSessionResponse;
import com.synapscare.doctor.service.AvailabilityService;
import com.synapscare.doctor.service.DoctorProfileService;
import com.synapscare.doctor.service.TelemedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// No JWT — protected only by the shared internal secret header
@RestController
@RequestMapping("/api/internal/doctors")
@RequiredArgsConstructor
public class InternalController {

    private final DoctorProfileService profileService;
    private final AvailabilityService availabilityService;
    private final TelemedicineService telemedicineService;

    @Value("${internal.service-secret}")
    private String serviceSecret;

    @GetMapping("/{userId}/profile")
    public ResponseEntity<DoctorProfileResponse> getDoctorProfile(
            @PathVariable Long userId,
            @RequestHeader("X-Service-Secret") String secret) {
        validateSecret(secret);
        return ResponseEntity.ok(profileService.getByUserId(userId));
    }

    @GetMapping("/{userId}/availability")
    public ResponseEntity<List<AvailabilitySlotResponse>> getDoctorAvailability(
            @PathVariable Long userId,
            @RequestHeader("X-Service-Secret") String secret) {
        validateSecret(secret);
        return ResponseEntity.ok(availabilityService.getAvailableSlots(userId));
    }

    @GetMapping("/sessions/appointment/{appointmentId}")
    public ResponseEntity<TelemedicineSessionResponse> getSessionByAppointment(
            @PathVariable Long appointmentId,
            @RequestHeader("X-Service-Secret") String secret) {
        validateSecret(secret);
        return ResponseEntity.ok(telemedicineService.getSessionByAppointmentId(appointmentId));
    }

    private void validateSecret(String secret) {
        if (!serviceSecret.equals(secret)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Invalid service secret");
        }
    }
}