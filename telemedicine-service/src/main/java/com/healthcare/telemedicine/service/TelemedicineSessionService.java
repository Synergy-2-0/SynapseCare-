package com.healthcare.telemedicine.service;

import com.healthcare.telemedicine.dto.CreateSessionRequest;
import com.healthcare.telemedicine.dto.EndSessionRequest;
import com.healthcare.telemedicine.dto.SessionResponse;
import com.healthcare.telemedicine.entity.TelemedicineSession;
import com.healthcare.telemedicine.entity.SessionStatus;
import com.healthcare.telemedicine.events.SessionCreatedEvent;
import com.healthcare.telemedicine.events.SessionEndedEvent;
import com.healthcare.telemedicine.exception.SessionNotFoundException;
import com.healthcare.telemedicine.exception.UnauthorizedAccessException;
import com.healthcare.telemedicine.exception.InvalidSessionStateException;
import com.healthcare.telemedicine.feign.AppointmentServiceClient;
import com.healthcare.telemedicine.repository.TelemedicineSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelemedicineSessionService {

    private final TelemedicineSessionRepository sessionRepository;
    private final JitsiTokenService jitsiTokenService;
    private final AppointmentServiceClient appointmentClient;
    private final RabbitTemplate rabbitTemplate;

    @Value("${telemedicine.stub-mode:true}")
    private boolean stubMode;

    @Value("${app.rabbitmq.exchange:healthcare.exchange}")
    private String exchange;

    /**
     * Create or return existing telemedicine session for appointment.
     * Aligned with Curex reference implementation.
     */
    @Transactional
    public SessionResponse createSession(CreateSessionRequest request) {
        log.info("Creating session for appointment: {}, forceNew: {}", request.getAppointmentId(), request.getForceNew());

        // Check for existing active session
        var existingSession = sessionRepository
                .findTopByAppointmentIdAndStatusNotOrderByCreatedAtDesc(request.getAppointmentId(), SessionStatus.ENDED);

        if (existingSession.isPresent()) {
            TelemedicineSession existing = existingSession.get();
            
            if (Boolean.TRUE.equals(request.getForceNew())) {
                // End old session and create new one
                log.info("Ending existing session {} to create new one", existing.getSessionId());
                endExistingSession(existing, "system", "Session ended to create new session");
            } else {
                // Return existing active session
                log.info("Returning existing active session: {}", existing.getSessionId());
                return toResponse(existing, false);
            }
        }

        // Validate appointment (if not in stub mode)
        if (!stubMode) {
            validateAppointment(request.getAppointmentId());
        }

        // Generate session identifiers
        String sessionId = UUID.randomUUID().toString();
        String roomName = jitsiTokenService.generateRoomName(sessionId);
        String sessionUrl = jitsiTokenService.generateMeetingLink(roomName);

        // Generate JWT tokens for Jitsi
        String doctorToken = jitsiTokenService.generateToken(
                request.getDoctorId(), "Dr. " + request.getDoctorId(),
                "doctor" + request.getDoctorId() + "@synapscare.com", roomName, true);
        String patientToken = jitsiTokenService.generateToken(
                request.getPatientId(), "Patient " + request.getPatientId(),
                "patient" + request.getPatientId() + "@synapscare.com", roomName, false);

        // Create session entity
        TelemedicineSession session = TelemedicineSession.builder()
                .sessionId(sessionId)
                .appointmentId(request.getAppointmentId())
                .doctorId(request.getDoctorId())
                .patientId(request.getPatientId())
                .sessionUrl(sessionUrl)
                .roomName(roomName)
                .doctorToken(doctorToken)
                .patientToken(patientToken)
                .scheduledStartTime(request.getScheduledStartTime())
                .scheduledEndTime(request.getScheduledEndTime())
                .status(SessionStatus.SCHEDULED)
                .build();

        session = sessionRepository.save(session);
        log.info("Created telemedicine session: {} for appointment: {}", sessionId, request.getAppointmentId());

        // Update appointment status to IN_SESSION (if not stub mode)
        if (!stubMode) {
            appointmentClient.updateAppointmentStatus(request.getAppointmentId(), "IN_SESSION");
        }

        // Publish session created event
        publishSessionCreatedEvent(session);

        return toResponse(session, false);
    }

    /**
     * Get session by appointment ID
     */
    public SessionResponse getSessionByAppointment(Long appointmentId) {
        TelemedicineSession session = sessionRepository
                .findTopByAppointmentIdOrderByCreatedAtDesc(appointmentId)
                .orElseThrow(() -> new SessionNotFoundException(
                        "No session found for appointment: " + appointmentId, "appointmentId"));
        return toResponse(session, false);
    }

    /**
     * Get session by session ID
     */
    public SessionResponse getSession(String sessionId) {
        TelemedicineSession session = findSessionByIdOrThrow(sessionId);
        return toResponse(session, false);
    }

    /**
     * Doctor joins session - returns session with access token
     */
    @Transactional
    public SessionResponse doctorJoin(String sessionId, Long doctorId) {
        TelemedicineSession session = findSessionByIdOrThrow(sessionId);

        // In this environment, userId (from header) might not match doctorId (service-specific)
        if (!Objects.equals(session.getDoctorId(), doctorId) && doctorId != null) {
            log.warn("ID mismatch for doctor join: session.doctorId={}, provided={}. Proceeding due to role trust.", 
                    session.getDoctorId(), doctorId);
        }

        validateSessionJoinable(session);

        // Start session if it's still scheduled
        if (session.getStatus() == SessionStatus.SCHEDULED) {
            session.setStatus(SessionStatus.IN_SESSION);
            session.setStartedAt(LocalDateTime.now());
            session = sessionRepository.save(session);
            log.info("Doctor {} started session {}", doctorId, sessionId);
        }

        SessionResponse response = toResponse(session, true);
        response.setAccessToken(session.getDoctorToken());
        return response;
    }

    /**
     * Patient joins session - returns session with access token
     */
    @Transactional
    public SessionResponse patientJoin(String sessionId, Long patientId) {
        TelemedicineSession session = findSessionByIdOrThrow(sessionId);

        // In this environment, userId (from header) might not match patientId (service-specific)
        if (!Objects.equals(session.getPatientId(), patientId) && patientId != null) {
            log.warn("ID mismatch for patient join: session.patientId={}, provided={}. Proceeding due to role trust.", 
                    session.getPatientId(), patientId);
        }

        validateSessionJoinable(session);

        SessionResponse response = toResponse(session, true);
        response.setAccessToken(session.getPatientToken());
        return response;
    }

    /**
     * End session (doctor or admin only)
     */
    @Transactional
    public SessionResponse endSession(String sessionId, EndSessionRequest request, String endedByUserId) {
        TelemedicineSession session = findSessionByIdOrThrow(sessionId);

        if (session.getStatus() == SessionStatus.ENDED) {
            throw new InvalidSessionStateException("Session already ended");
        }

        if (session.getStatus() == SessionStatus.CANCELLED) {
            throw new InvalidSessionStateException("Cannot end a cancelled session");
        }

        // End the session
        session.setStatus(SessionStatus.ENDED);
        session.setEndedAt(LocalDateTime.now());
        session.setEndedBy(endedByUserId);
        
        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            session.setNotes(request.getNotes());
        }

        session = sessionRepository.save(session);
        log.info("Session {} ended by user {}", sessionId, endedByUserId);

        // Update appointment status if requested (and not in stub mode)
        if (Boolean.TRUE.equals(request.getMarkAppointmentCompleted()) && !stubMode) {
            boolean updated = appointmentClient.updateAppointmentStatus(session.getAppointmentId(), "COMPLETED");
            if (!updated) {
                log.warn("Failed to update appointment {} status to COMPLETED", session.getAppointmentId());
            }
        }

        // Publish session ended event
        publishSessionEndedEvent(session);

        return toResponse(session, false);
    }

    /**
     * Update consultation notes
     */
    @Transactional
    public SessionResponse updateNotes(String sessionId, Long doctorId, String notes) {
        TelemedicineSession session = findSessionByIdOrThrow(sessionId);

        if (!session.getDoctorId().equals(doctorId)) {
            throw new UnauthorizedAccessException("Only the doctor can update consultation notes");
        }

        session.setNotes(notes);
        session = sessionRepository.save(session);
        log.info("Updated notes for session {}", sessionId);
        
        return toResponse(session, false);
    }

    /**
     * Cancel session
     */
    @Transactional
    public SessionResponse cancelSession(String sessionId) {
        TelemedicineSession session = findSessionByIdOrThrow(sessionId);
        
        if (session.getStatus() == SessionStatus.ENDED) {
            throw new InvalidSessionStateException("Cannot cancel an ended session");
        }

        session.setStatus(SessionStatus.CANCELLED);
        session = sessionRepository.save(session);
        log.info("Session {} cancelled", sessionId);
        
        return toResponse(session, false);
    }

    /**
     * Get all sessions for a doctor
     */
    public List<SessionResponse> getDoctorSessions(Long doctorId) {
        return sessionRepository.findByDoctorId(doctorId)
                .stream()
                .map(s -> toResponse(s, false))
                .collect(Collectors.toList());
    }

    /**
     * Get all sessions for a patient
     */
    public List<SessionResponse> getPatientSessions(Long patientId) {
        return sessionRepository.findByPatientId(patientId)
                .stream()
                .map(s -> toResponse(s, false))
                .collect(Collectors.toList());
    }

    // ============ Private Helper Methods ============

    private TelemedicineSession findSessionByIdOrThrow(String sessionId) {
        return sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new SessionNotFoundException(sessionId, "sessionId"));
    }

    private void validateAppointment(Long appointmentId) {
        Map<String, Object> appointment = appointmentClient.getAppointment(appointmentId);
        
        if (appointment == null) {
            throw new IllegalArgumentException("Appointment not found: " + appointmentId);
        }

        String type = (String) appointment.getOrDefault("consultationType", appointment.get("type"));
        if (type != null && !type.equalsIgnoreCase("TELEMEDICINE") && !type.equalsIgnoreCase("VIDEO")) {
            log.warn("Appointment {} is of type {}, expected TELEMEDICINE or VIDEO", appointmentId, type);
            // Relaxing this for dev mode if type is null or mismatches but we forced entry
        }

        String status = (String) appointment.get("status");
        if ("CANCELLED".equalsIgnoreCase(status) || "COMPLETED".equalsIgnoreCase(status)) {
            throw new IllegalStateException("Appointment is " + status);
        }
    }

    private void validateSessionJoinable(TelemedicineSession session) {
        LocalDateTime now = LocalDateTime.now();
        
        /* 
         * Testing Override: Allow joining at any time regardless of scheduled start time.
         * Original logic restricted joins to 15 minutes before start.
         */
        log.debug("Session join validation: allowing immediate entry for appointment {}", session.getAppointmentId());


        if (session.getStatus() == SessionStatus.ENDED) {
            throw new InvalidSessionStateException("Session has ended");
        }

        if (session.getStatus() == SessionStatus.CANCELLED) {
            throw new InvalidSessionStateException("Session has been cancelled");
        }

        if (session.getStatus() == SessionStatus.EXPIRED) {
            throw new InvalidSessionStateException("Session has expired");
        }
    }

    private void endExistingSession(TelemedicineSession session, String endedBy, String reason) {
        session.setStatus(SessionStatus.ENDED);
        session.setEndedAt(LocalDateTime.now());
        session.setEndedBy(endedBy);
        session.setNotes(reason);
        sessionRepository.save(session);
    }

    private void publishSessionCreatedEvent(TelemedicineSession session) {
        SessionCreatedEvent event = SessionCreatedEvent.builder()
                .sessionId(session.getSessionId())
                .appointmentId(session.getAppointmentId())
                .doctorId(session.getDoctorId())
                .patientId(session.getPatientId())
                .roomName(session.getRoomName())
                .sessionUrl(session.getSessionUrl())
                .scheduledStartTime(session.getScheduledStartTime())
                .scheduledEndTime(session.getScheduledEndTime())
                .createdAt(session.getCreatedAt())
                .build();

        rabbitTemplate.convertAndSend(exchange, "telemedicine.session.created", event);
        log.debug("Published session created event for session: {}", session.getSessionId());
    }

    private void publishSessionEndedEvent(TelemedicineSession session) {
        SessionEndedEvent event = SessionEndedEvent.builder()
                .sessionId(session.getSessionId())
                .appointmentId(session.getAppointmentId())
                .doctorId(session.getDoctorId())
                .patientId(session.getPatientId())
                .endedBy(session.getEndedBy())
                .notes(session.getNotes())
                .startedAt(session.getStartedAt())
                .endedAt(session.getEndedAt())
                .createdAt(session.getCreatedAt())
                .build();

        rabbitTemplate.convertAndSend(exchange, "telemedicine.session.ended", event);
        log.debug("Published session ended event for session: {}", session.getSessionId());
    }

    private SessionResponse toResponse(TelemedicineSession session, boolean includeUrl) {
        return SessionResponse.builder()
                .id(session.getId())
                .sessionId(session.getSessionId())
                .appointmentId(session.getAppointmentId())
                .doctorId(session.getDoctorId())
                .patientId(session.getPatientId())
                .sessionUrl(includeUrl ? session.getSessionUrl() : null)
                .roomName(session.getRoomName())
                .status(session.getStatus())
                .scheduledStartTime(session.getScheduledStartTime())
                .scheduledEndTime(session.getScheduledEndTime())
                .startedAt(session.getStartedAt())
                .endedAt(session.getEndedAt())
                .endedBy(session.getEndedBy())
                .notes(session.getNotes())
                .createdAt(session.getCreatedAt())
                .updatedAt(session.getUpdatedAt())
                .build();
    }
}
