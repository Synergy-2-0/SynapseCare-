package com.synapscare.doctor.controller;

import com.synapscare.doctor.dto.request.TelemedicineSessionRequest;
import com.synapscare.doctor.dto.response.TelemedicineSessionResponse;
import com.synapscare.doctor.security.UserDetailsImpl;
import com.synapscare.doctor.service.TelemedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/telemedicine")
@RequiredArgsConstructor
public class TelemedicineController {

    private final TelemedicineService telemedicineService;

    // Doctor creates a session for a patient
    @PostMapping("/sessions")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<TelemedicineSessionResponse> createSession(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody TelemedicineSessionRequest request) {
        return ResponseEntity.status(201)
                .body(telemedicineService.createSession(user.getId(), request));
    }

    // Doctor starts the session (changes PENDING → ACTIVE)
    @PutMapping("/sessions/{sessionId}/start")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<TelemedicineSessionResponse> startSession(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long sessionId) {
        return ResponseEntity.ok(telemedicineService.startSession(user.getId(), sessionId));
    }

    // Doctor ends the session (changes ACTIVE → COMPLETED)
    @PutMapping("/sessions/{sessionId}/end")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<TelemedicineSessionResponse> endSession(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long sessionId,
            @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.get("sessionNotes") : null;
        return ResponseEntity.ok(telemedicineService.endSession(user.getId(), sessionId, notes));
    }

    // Both doctor and patient can look up a session by room name
    @GetMapping("/sessions/room/{roomName}")
    @PreAuthorize("hasAnyRole('DOCTOR','PATIENT')")
    public ResponseEntity<TelemedicineSessionResponse> getByRoom(@PathVariable String roomName) {
        return ResponseEntity.ok(telemedicineService.getSessionByRoom(roomName));
    }

    // Doctor sees all their sessions
    @GetMapping("/sessions/mine")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<TelemedicineSessionResponse>> getDoctorSessions(
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(telemedicineService.getDoctorSessions(user.getId()));
    }

    // Patient sees all their sessions
    @GetMapping("/sessions/patient")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<TelemedicineSessionResponse>> getPatientSessions(
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(telemedicineService.getPatientSessions(user.getId()));
    }
}