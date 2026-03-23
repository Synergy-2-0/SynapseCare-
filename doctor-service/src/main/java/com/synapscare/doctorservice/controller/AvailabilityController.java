package com.synapscare.doctor.controller;

import com.synapscare.doctor.dto.request.AvailabilitySlotRequest;
import com.synapscare.doctor.dto.response.AvailabilitySlotResponse;
import com.synapscare.doctor.security.UserDetailsImpl;
import com.synapscare.doctor.service.AvailabilityService;
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
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping("/{userId}/availability")
    public ResponseEntity<List<AvailabilitySlotResponse>> getDoctorAvailability(
            @PathVariable Long userId) {
        return ResponseEntity.ok(availabilityService.getAvailableSlots(userId));
    }

    @GetMapping("/me/availability")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<AvailabilitySlotResponse>> getMySlots(
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(availabilityService.getAllSlots(user.getId()));
    }

    @PostMapping("/me/availability")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<AvailabilitySlotResponse> addSlot(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody AvailabilitySlotRequest request) {
        return ResponseEntity.status(201)
                .body(availabilityService.addSlot(user.getId(), request));
    }

    @PutMapping("/me/availability/{slotId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<AvailabilitySlotResponse> updateSlot(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long slotId,
            @Valid @RequestBody AvailabilitySlotRequest request) {
        return ResponseEntity.ok(availabilityService.updateSlot(user.getId(), slotId, request));
    }

    @DeleteMapping("/me/availability/{slotId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Void> deleteSlot(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long slotId) {
        availabilityService.deleteSlot(user.getId(), slotId);
        return ResponseEntity.noContent().build();
    }
}