package com.healthcare.telemedicine.service;

import com.healthcare.telemedicine.dto.CreateSessionDto;
import com.healthcare.telemedicine.dto.SessionDto;
import com.healthcare.telemedicine.entity.ConsultationSession;
import com.healthcare.telemedicine.entity.SessionStatus;
import com.healthcare.telemedicine.repository.ConsultationSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelemedicineService {

    private final ConsultationSessionRepository sessionRepository;
    private final JitsiTokenService jitsiTokenService;

    // -------------------------------------------------------
    // 1. Generate consultation session (creates Jitsi room)
    // -------------------------------------------------------
    @Transactional
    public SessionDto createSession(CreateSessionDto request) {
        // Check if a session already exists for this appointment
        sessionRepository.findByAppointmentId(request.getAppointmentId()).ifPresent(s -> {
            throw new RuntimeException("A session already exists for appointment: " + request.getAppointmentId());
        });

        String sessionId = UUID.randomUUID().toString();
        String roomName = jitsiTokenService.generateRoomName(sessionId);
        String meetingLink = jitsiTokenService.generateMeetingLink(roomName);

        // Generate JWT tokens (works with self-hosted Jitsi; safe no-op on public meet.jit.si)
        String doctorToken = jitsiTokenService.generateToken(
                request.getDoctorId(), "Dr. " + request.getDoctorId(),
                "doctor" + request.getDoctorId() + "@synapscare.com", roomName, true);
        String patientToken = jitsiTokenService.generateToken(
                request.getPatientId(), "Patient " + request.getPatientId(),
                "patient" + request.getPatientId() + "@synapscare.com", roomName, false);

        ConsultationSession session = ConsultationSession.builder()
                .sessionId(sessionId)
                .appointmentId(request.getAppointmentId())
                .doctorId(request.getDoctorId())
                .patientId(request.getPatientId())
                .meetingLink(meetingLink)
                .roomName(roomName)
                .doctorToken(doctorToken)
                .patientToken(patientToken)
                .scheduledStartTime(request.getScheduledStartTime())
                .scheduledEndTime(request.getScheduledEndTime())
                .status(SessionStatus.SCHEDULED)
                .build();

        session = sessionRepository.save(session);
        log.info("Created telemedicine session: {} for appointment: {}", sessionId, request.getAppointmentId());
        return toDto(session, null); // Don't expose tokens in create response
    }

    // -------------------------------------------------------
    // 2. Doctor joins session
    // -------------------------------------------------------
    @Transactional
    public SessionDto doctorJoin(String sessionId, Long doctorId) {
        ConsultationSession session = getAndValidateSession(sessionId);

        if (!session.getDoctorId().equals(doctorId)) {
            throw new RuntimeException("Access denied: You are not the doctor for this session");
        }
        validateSessionTime(session);

        if (session.getStatus() == SessionStatus.SCHEDULED) {
            session.setStatus(SessionStatus.ACTIVE);
            session.setActualStartTime(LocalDateTime.now());
            session = sessionRepository.save(session);
            log.info("Doctor {} started session {}", doctorId, sessionId);
        }

        SessionDto dto = toDto(session, null);
        dto.setAccessToken(session.getDoctorToken());
        dto.setMeetingLink(session.getMeetingLink());
        return dto;
    }

    // -------------------------------------------------------
    // 3. Patient joins session
    // -------------------------------------------------------
    @Transactional
    public SessionDto patientJoin(String sessionId, Long patientId) {
        ConsultationSession session = getAndValidateSession(sessionId);

        if (!session.getPatientId().equals(patientId)) {
            throw new RuntimeException("Access denied: You are not the patient for this session");
        }
        validateSessionTime(session);

        if (session.getStatus() == SessionStatus.COMPLETED || session.getStatus() == SessionStatus.CANCELLED) {
            throw new RuntimeException("Session is already " + session.getStatus());
        }

        SessionDto dto = toDto(session, null);
        dto.setAccessToken(session.getPatientToken());
        dto.setMeetingLink(session.getMeetingLink());
        return dto;
    }

    // -------------------------------------------------------
    // 4. End consultation session
    // -------------------------------------------------------
    @Transactional
    public SessionDto endSession(String sessionId, Long doctorId, String notes) {
        ConsultationSession session = getAndValidateSession(sessionId);

        if (!session.getDoctorId().equals(doctorId)) {
            throw new RuntimeException("Only the doctor can end this session");
        }
        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new RuntimeException("Session is not ACTIVE");
        }

        session.setStatus(SessionStatus.COMPLETED);
        session.setActualEndTime(LocalDateTime.now());
        if (notes != null && !notes.isBlank()) {
            session.setConsultationNotes(notes);
        }
        session = sessionRepository.save(session);
        log.info("Session {} ended by doctor {}", sessionId, doctorId);
        return toDto(session, null);
    }

    // -------------------------------------------------------
    // 5. Add / update consultation notes
    // -------------------------------------------------------
    @Transactional
    public SessionDto updateNotes(String sessionId, Long doctorId, String notes) {
        ConsultationSession session = getAndValidateSession(sessionId);
        if (!session.getDoctorId().equals(doctorId)) {
            throw new RuntimeException("Only the doctor can update consultation notes");
        }
        session.setConsultationNotes(notes);
        session = sessionRepository.save(session);
        return toDto(session, null);
    }

    // -------------------------------------------------------
    // 6. Cancel session
    // -------------------------------------------------------
    @Transactional
    public SessionDto cancelSession(String sessionId) {
        ConsultationSession session = getAndValidateSession(sessionId);
        session.setStatus(SessionStatus.CANCELLED);
        session = sessionRepository.save(session);
        log.info("Session {} cancelled", sessionId);
        return toDto(session, null);
    }

    // -------------------------------------------------------
    // 7. Get session by ID
    // -------------------------------------------------------
    public SessionDto getSession(String sessionId) {
        return toDto(getAndValidateSession(sessionId), null);
    }

    // -------------------------------------------------------
    // 8. Get session by appointment
    // -------------------------------------------------------
    public SessionDto getSessionByAppointment(Long appointmentId) {
        ConsultationSession session = sessionRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new RuntimeException("No session for appointment: " + appointmentId));
        return toDto(session, null);
    }

    // -------------------------------------------------------
    // 9. Doctor session history
    // -------------------------------------------------------
    public List<SessionDto> getDoctorSessions(Long doctorId) {
        return sessionRepository.findByDoctorId(doctorId)
                .stream().map(s -> toDto(s, null)).collect(Collectors.toList());
    }

    // -------------------------------------------------------
    // 10. Patient session history
    // -------------------------------------------------------
    public List<SessionDto> getPatientSessions(Long patientId) {
        return sessionRepository.findByPatientId(patientId)
                .stream().map(s -> toDto(s, null)).collect(Collectors.toList());
    }

    // -------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------
    private ConsultationSession getAndValidateSession(String sessionId) {
        return sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));
    }

    /**
     * Validates that the current time is within ±15 minutes of the scheduled start.
     * This enforces the "join button only at appointment time" requirement.
     */
    private void validateSessionTime(ConsultationSession session) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime allowJoinFrom = session.getScheduledStartTime().minusMinutes(15);
        LocalDateTime sessionEnd = session.getScheduledEndTime();

        if (now.isBefore(allowJoinFrom)) {
            long minutesLeft = java.time.Duration.between(now, allowJoinFrom).toMinutes();
            throw new RuntimeException("Session not yet available. You can join in " + minutesLeft + " minutes.");
        }
        if (now.isAfter(sessionEnd) && session.getStatus() == SessionStatus.SCHEDULED) {
            session.setStatus(SessionStatus.EXPIRED);
            sessionRepository.save(session);
            throw new RuntimeException("Session time has passed and it was never started.");
        }
    }

    private SessionDto toDto(ConsultationSession s, String token) {
        return SessionDto.builder()
                .id(s.getId())
                .sessionId(s.getSessionId())
                .appointmentId(s.getAppointmentId())
                .doctorId(s.getDoctorId())
                .patientId(s.getPatientId())
                .meetingLink(s.getMeetingLink())
                .roomName(s.getRoomName())
                .scheduledStartTime(s.getScheduledStartTime())
                .scheduledEndTime(s.getScheduledEndTime())
                .actualStartTime(s.getActualStartTime())
                .actualEndTime(s.getActualEndTime())
                .status(s.getStatus())
                .consultationNotes(s.getConsultationNotes())
                .createdAt(s.getCreatedAt())
                .accessToken(token)
                .build();
    }
}
