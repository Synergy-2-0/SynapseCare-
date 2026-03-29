package com.healthcare.telemedicine.controller;

import com.healthcare.telemedicine.dto.ApiResponse;
import com.healthcare.telemedicine.dto.CreateSessionDto;
import com.healthcare.telemedicine.dto.SessionDto;
import com.healthcare.telemedicine.service.TelemedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/telemedicine")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TelemedicineController {

    private final TelemedicineService telemedicineService;

    /**
     * POST /api/telemedicine/sessions
     * Create a new telemedicine session for an appointment.
     * Called after appointment is confirmed (and payment is made).
     */
    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<SessionDto>> createSession(
            @Valid @RequestBody CreateSessionDto request) {
        SessionDto session = telemedicineService.createSession(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Telemedicine session created", session));
    }

    /**
     * GET /api/telemedicine/sessions/{sessionId}
     * Get session details (no tokens exposed).
     */
    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<SessionDto>> getSession(@PathVariable("sessionId") String sessionId) {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Session found", telemedicineService.getSession(sessionId)));
    }

    /**
     * GET /api/telemedicine/sessions/appointment/{appointmentId}
     * Get session by appointment ID.
     */
    @GetMapping("/sessions/appointment/{appointmentId}")
    public ResponseEntity<ApiResponse<SessionDto>> getByAppointment(@PathVariable("appointmentId") Long appointmentId) {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Session found", telemedicineService.getSessionByAppointment(appointmentId)));
    }

    /**
     * POST /api/telemedicine/sessions/{sessionId}/join/doctor
     * Doctor joins session — returns meeting link + JWT token.
     * Only allowed within ±15 minutes of scheduled time.
     */
    @PostMapping("/sessions/{sessionId}/join/doctor")
    public ResponseEntity<ApiResponse<SessionDto>> doctorJoin(
            @PathVariable("sessionId") String sessionId,
            @RequestParam("doctorId") Long doctorId) {
        SessionDto session = telemedicineService.doctorJoin(sessionId, doctorId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Doctor joined session", session));
    }

    /**
     * POST /api/telemedicine/sessions/{sessionId}/join/patient
     * Patient joins session — returns meeting link + JWT token.
     * Only allowed within ±15 minutes of scheduled time.
     */
    @PostMapping("/sessions/{sessionId}/join/patient")
    public ResponseEntity<ApiResponse<SessionDto>> patientJoin(
            @PathVariable("sessionId") String sessionId,
            @RequestParam("patientId") Long patientId) {
        SessionDto session = telemedicineService.patientJoin(sessionId, patientId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Patient joined session", session));
    }

    /**
     * POST /api/telemedicine/sessions/{sessionId}/end
     * Doctor ends session and optionally submits notes.
     */
    @PostMapping("/sessions/{sessionId}/end")
    public ResponseEntity<ApiResponse<SessionDto>> endSession(
            @PathVariable("sessionId") String sessionId,
            @RequestParam("doctorId") Long doctorId,
            @RequestParam(value = "notes", required = false, defaultValue = "") String notes) {
        SessionDto session = telemedicineService.endSession(sessionId, doctorId, notes);
        return ResponseEntity.ok(new ApiResponse<>(true, "Session ended", session));
    }

    /**
     * PUT /api/telemedicine/sessions/{sessionId}/notes
     * Doctor updates consultation notes.
     */
    @PutMapping("/sessions/{sessionId}/notes")
    public ResponseEntity<ApiResponse<SessionDto>> updateNotes(
            @PathVariable("sessionId") String sessionId,
            @RequestParam("doctorId") Long doctorId,
            @RequestBody Map<String, String> body) {
        String notes = body.getOrDefault("notes", "");
        SessionDto session = telemedicineService.updateNotes(sessionId, doctorId, notes);
        return ResponseEntity.ok(new ApiResponse<>(true, "Notes updated", session));
    }

    /**
     * PUT /api/telemedicine/sessions/{sessionId}/cancel
     * Cancel a scheduled session.
     */
    @PutMapping("/sessions/{sessionId}/cancel")
    public ResponseEntity<ApiResponse<SessionDto>> cancelSession(@PathVariable("sessionId") String sessionId) {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Session cancelled", telemedicineService.cancelSession(sessionId)));
    }

    /**
     * GET /api/telemedicine/sessions/doctor/{doctorId}
     * Get all sessions for a doctor.
     */
    @GetMapping("/sessions/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<SessionDto>>> getDoctorSessions(@PathVariable("doctorId") Long doctorId) {
        List<SessionDto> sessions = telemedicineService.getDoctorSessions(doctorId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Doctor sessions", sessions));
    }

    /**
     * GET /api/telemedicine/sessions/patient/{patientId}
     * Get all sessions for a patient.
     */
    @GetMapping("/sessions/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<SessionDto>>> getPatientSessions(@PathVariable("patientId") Long patientId) {
        List<SessionDto> sessions = telemedicineService.getPatientSessions(patientId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Patient sessions", sessions));
    }
}
