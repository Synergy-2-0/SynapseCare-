package com.healthcare.telemedicine.controller;

import com.healthcare.telemedicine.dto.ApiResponse;
import com.healthcare.telemedicine.dto.CreateSessionRequest;
import com.healthcare.telemedicine.dto.EndSessionRequest;
import com.healthcare.telemedicine.dto.SessionResponse;
import com.healthcare.telemedicine.exception.UnauthorizedAccessException;
import com.healthcare.telemedicine.service.TelemedicineSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/telemedicine")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class TelemedicineController {

    private final TelemedicineSessionService sessionService;

    /**
     * POST /api/telemedicine/appointments/{appointmentId}/session
     * Create or return active session for appointment
     * Roles: PATIENT, DOCTOR, ADMIN
     */
    @PostMapping("/appointments/{appointmentId}/session")
    public ResponseEntity<ApiResponse<SessionResponse>> createSession(
            @PathVariable Long appointmentId,
            @Valid @RequestBody CreateSessionRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        
        log.info("Create session request for appointment {} by user {} (role: {})", 
                appointmentId, userId, userRole);

        // Set appointmentId from path if not in request
        if (request.getAppointmentId() == null) {
            request.setAppointmentId(appointmentId);
        }

        // Validate authorization (patient, doctor, or admin can create)
        validateSessionCreationAuth(request, userId, userRole);

        SessionResponse session = sessionService.createSession(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Telemedicine session created", session));
    }

    /**
     * GET /api/telemedicine/appointments/{appointmentId}/session
     * Get latest session for appointment
     */
    @GetMapping("/appointments/{appointmentId}/session")
    public ResponseEntity<ApiResponse<SessionResponse>> getSessionByAppointment(
            @PathVariable Long appointmentId,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        
        SessionResponse session = sessionService.getSessionByAppointment(appointmentId);
        
        // Validate access (only patient, doctor, or admin of this session)
        validateSessionAccess(session, userId, userRole);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Session found", session));
    }

    /**
     * POST /api/telemedicine/appointments/{appointmentId}/end
     * End active session (doctor or admin only)
     */
    @PostMapping("/appointments/{appointmentId}/end")
    public ResponseEntity<ApiResponse<SessionResponse>> endSessionByAppointment(
            @PathVariable Long appointmentId,
            @RequestBody(required = false) EndSessionRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        
        log.info("End session request for appointment {} by user {} (role: {})", 
                appointmentId, userId, userRole);

        // Get session by appointment
        SessionResponse session = sessionService.getSessionByAppointment(appointmentId);
        
        // Validate authorization (only doctor or admin)
        if (!"ADMIN".equalsIgnoreCase(userRole) && 
            !session.getDoctorId().equals(parseLong(userId))) {
            throw new UnauthorizedAccessException("Only the doctor or admin can end this session");
        }

        if (request == null) {
            request = new EndSessionRequest();
        }

        SessionResponse endedSession = sessionService.endSession(session.getSessionId(), request, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Session ended", endedSession));
    }

    /**
     * GET /api/telemedicine/sessions/{sessionId}
     * Get session by ID
     */
    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<SessionResponse>> getSession(
            @PathVariable String sessionId,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        
        SessionResponse session = sessionService.getSession(sessionId);
        validateSessionAccess(session, userId, userRole);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Session found", session));
    }

    /**
     * POST /api/telemedicine/sessions/{sessionId}/join/doctor
     * Doctor joins session - returns meeting link + JWT token
     */
    @PostMapping("/sessions/{sessionId}/join/doctor")
    public ResponseEntity<ApiResponse<SessionResponse>> doctorJoin(
            @PathVariable String sessionId,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        
        log.info("Doctor join request for session {} by user {} (role: {})", 
                sessionId, userId, userRole);

        Long doctorId = parseLong(userId);
        SessionResponse session = sessionService.doctorJoin(sessionId, doctorId);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Doctor joined session", session));
    }

    /**
     * POST /api/telemedicine/sessions/{sessionId}/join/patient
     * Patient joins session - returns meeting link + JWT token
     */
    @PostMapping("/sessions/{sessionId}/join/patient")
    public ResponseEntity<ApiResponse<SessionResponse>> patientJoin(
            @PathVariable String sessionId,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        
        log.info("Patient join request for session {} by user {} (role: {})", 
                sessionId, userId, userRole);

        Long patientId = parseLong(userId);
        SessionResponse session = sessionService.patientJoin(sessionId, patientId);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Patient joined session", session));
    }

    /**
     * POST /api/telemedicine/sessions/{sessionId}/end
     * End session (doctor or admin only)
     */
    @PostMapping("/sessions/{sessionId}/end")
    public ResponseEntity<ApiResponse<SessionResponse>> endSession(
            @PathVariable String sessionId,
            @RequestBody(required = false) EndSessionRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        
        log.info("End session request for session {} by user {} (role: {})", 
                sessionId, userId, userRole);

        if (request == null) {
            request = new EndSessionRequest();
        }

        SessionResponse session = sessionService.endSession(sessionId, request, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Session ended", session));
    }

    /**
     * PUT /api/telemedicine/sessions/{sessionId}/notes
     * Update consultation notes (doctor only)
     */
    @PutMapping("/sessions/{sessionId}/notes")
    public ResponseEntity<ApiResponse<SessionResponse>> updateNotes(
            @PathVariable String sessionId,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        
        String notes = body.getOrDefault("notes", "");
        Long doctorId = parseLong(userId);
        
        SessionResponse session = sessionService.updateNotes(sessionId, doctorId, notes);
        return ResponseEntity.ok(new ApiResponse<>(true, "Notes updated", session));
    }

    /**
     * PUT /api/telemedicine/sessions/{sessionId}/cancel
     * Cancel scheduled session
     */
    @PutMapping("/sessions/{sessionId}/cancel")
    public ResponseEntity<ApiResponse<SessionResponse>> cancelSession(
            @PathVariable String sessionId,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        
        log.info("Cancel session request for session {} by user {} (role: {})", 
                sessionId, userId, userRole);
        
        SessionResponse session = sessionService.cancelSession(sessionId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Session cancelled", session));
    }

    /**
     * GET /api/telemedicine/sessions/doctor/{doctorId}
     * Get all sessions for a doctor
     */
    @GetMapping("/sessions/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<SessionResponse>>> getDoctorSessions(
            @PathVariable Long doctorId,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        
        // Validate access (self or admin)
        if (!"ADMIN".equalsIgnoreCase(userRole) && !doctorId.equals(parseLong(userId))) {
            throw new UnauthorizedAccessException("You can only view your own sessions");
        }
        
        List<SessionResponse> sessions = sessionService.getDoctorSessions(doctorId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Doctor sessions", sessions));
    }

    /**
     * GET /api/telemedicine/sessions/patient/{patientId}
     * Get all sessions for a patient
     */
    @GetMapping("/sessions/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<SessionResponse>>> getPatientSessions(
            @PathVariable Long patientId,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        
        // Validate access (self or admin)
        if (!"ADMIN".equalsIgnoreCase(userRole) && !patientId.equals(parseLong(userId))) {
            throw new UnauthorizedAccessException("You can only view your own sessions");
        }
        
        List<SessionResponse> sessions = sessionService.getPatientSessions(patientId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Patient sessions", sessions));
    }

    // ============ Private Helper Methods ============

    private void validateSessionCreationAuth(CreateSessionRequest request, String userId, String userRole) {
        if (userId == null || userRole == null) {
            throw new UnauthorizedAccessException("Authentication required");
        }

        Long userIdLong = parseLong(userId);
        
        // Admin can create any session
        if ("ADMIN".equalsIgnoreCase(userRole)) {
            return;
        }

        // Doctor can create session if they are the doctor
        if ("DOCTOR".equalsIgnoreCase(userRole) && request.getDoctorId().equals(userIdLong)) {
            return;
        }

        // Patient can create session if they are the patient
        if ("PATIENT".equalsIgnoreCase(userRole) && request.getPatientId().equals(userIdLong)) {
            return;
        }

        throw new UnauthorizedAccessException("You are not authorized to create this session");
    }

    private void validateSessionAccess(SessionResponse session, String userId, String userRole) {
        if (userId == null || userRole == null) {
            throw new UnauthorizedAccessException("Authentication required");
        }

        Long userIdLong = parseLong(userId);
        
        // Admin can access any session
        if ("ADMIN".equalsIgnoreCase(userRole)) {
            return;
        }

        // Doctor can access their own sessions
        if (session.getDoctorId().equals(userIdLong)) {
            return;
        }

        // Patient can access their own sessions
        if (session.getPatientId().equals(userIdLong)) {
            return;
        }

        throw new UnauthorizedAccessException("You are not authorized to access this session");
    }

    private Long parseLong(String value) {
        if (value == null || value.isBlank()) {
            throw new UnauthorizedAccessException("User ID is required");
        }
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid user ID format");
        }
    }
}
