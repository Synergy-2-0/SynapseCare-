package com.synapscare.doctor.service;

import com.synapscare.doctor.dto.request.TelemedicineSessionRequest;
import com.synapscare.doctor.dto.response.TelemedicineSessionResponse;
import com.synapscare.doctor.entity.TelemedicineSession;
import com.synapscare.doctor.entity.TelemedicineSession.SessionStatus;
import com.synapscare.doctor.exception.Exceptions.*;
import com.synapscare.doctor.repository.TelemedicineSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TelemedicineService {

    private final TelemedicineSessionRepository sessionRepository;

    // Base Jitsi URL — swap for Agora/Twilio token generation as needed
    private static final String JITSI_BASE_URL = "https://meet.jit.si/";

    @Transactional
    public TelemedicineSessionResponse createSession(Long doctorUserId,
                                                     TelemedicineSessionRequest req) {
        // Generate a unique room name: synapscare-{uuid}
        String roomName = "synapscare-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);

        TelemedicineSession session = TelemedicineSession.builder()
                .doctorUserId(doctorUserId)
                .patientUserId(req.getPatientUserId())
                .appointmentId(req.getAppointmentId())
                .roomName(roomName)
                .status(SessionStatus.PENDING)
                .scheduledAt(req.getScheduledAt())
                .sessionNotes(req.getSessionNotes())
                .build();

        return toResponse(sessionRepository.save(session));
    }

    @Transactional
    public TelemedicineSessionResponse startSession(Long doctorUserId, Long sessionId) {
        TelemedicineSession session = findSessionForDoctor(doctorUserId, sessionId);
        if (session.getStatus() != SessionStatus.PENDING) {
            throw new BadRequestException("Session is not in PENDING state");
        }
        session.setStatus(SessionStatus.ACTIVE);
        session.setStartedAt(LocalDateTime.now());
        return toResponse(sessionRepository.save(session));
    }

    @Transactional
    public TelemedicineSessionResponse endSession(Long doctorUserId, Long sessionId,
                                                  String notes) {
        TelemedicineSession session = findSessionForDoctor(doctorUserId, sessionId);
        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new BadRequestException("Session is not currently active");
        }
        session.setStatus(SessionStatus.COMPLETED);
        session.setEndedAt(LocalDateTime.now());
        if (notes != null && !notes.isBlank()) {
            session.setSessionNotes(notes);
        }
        return toResponse(sessionRepository.save(session));
    }

    public TelemedicineSessionResponse getSessionByRoom(String roomName) {
        TelemedicineSession session = sessionRepository.findByRoomName(roomName)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
        return toResponse(session);
    }

    public List<TelemedicineSessionResponse> getDoctorSessions(Long doctorUserId) {
        return sessionRepository.findByDoctorUserIdOrderByScheduledAtDesc(doctorUserId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<TelemedicineSessionResponse> getPatientSessions(Long patientUserId) {
        return sessionRepository.findByPatientUserIdOrderByScheduledAtDesc(patientUserId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private TelemedicineSession findSessionForDoctor(Long doctorUserId, Long sessionId) {
        TelemedicineSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
        if (!session.getDoctorUserId().equals(doctorUserId)) {
            throw new UnauthorizedAccessException("Access denied to this session");
        }
        return session;
    }

    private TelemedicineSessionResponse toResponse(TelemedicineSession s) {
        return TelemedicineSessionResponse.builder()
                .id(s.getId())
                .doctorUserId(s.getDoctorUserId())
                .patientUserId(s.getPatientUserId())
                .appointmentId(s.getAppointmentId())
                .roomName(s.getRoomName())
                .joinUrl(JITSI_BASE_URL + s.getRoomName())
                .status(s.getStatus())
                .scheduledAt(s.getScheduledAt())
                .startedAt(s.getStartedAt())
                .endedAt(s.getEndedAt())
                .sessionNotes(s.getSessionNotes())
                .createdAt(s.getCreatedAt())
                .build();
    }
}