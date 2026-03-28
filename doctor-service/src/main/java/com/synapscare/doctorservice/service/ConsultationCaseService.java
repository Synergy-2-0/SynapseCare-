package com.synapscare.doctorservice.service;

import com.synapscare.doctorservice.dto.request.CreateCaseRequest;
import com.synapscare.doctorservice.dto.request.UpdateCaseRequest;
import com.synapscare.doctorservice.dto.response.CaseResponse;
import com.synapscare.doctorservice.entity.ConsultationCase;
import com.synapscare.doctorservice.exception.DoctorNotFoundException;
import com.synapscare.doctorservice.repository.ConsultationCaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConsultationCaseService {

    private final ConsultationCaseRepository caseRepository;

    @Transactional
    public CaseResponse createCase(Long doctorId, CreateCaseRequest request) {
        // Check if case already exists for this appointment
        if (request.getAppointmentId() != null && caseRepository.existsByAppointmentId(request.getAppointmentId())) {
            throw new RuntimeException("Case already exists for appointment: " + request.getAppointmentId());
        }

        ConsultationCase consultationCase = ConsultationCase.builder()
                .appointmentId(request.getAppointmentId())
                .doctorId(doctorId)
                .patientId(request.getPatientId())
                .patientName(request.getPatientName())
                .patientAge(request.getPatientAge())
                .patientGender(request.getPatientGender())
                .chiefComplaint(request.getChiefComplaint())
                .status(ConsultationCase.CaseStatus.DRAFT)
                .build();

        consultationCase = caseRepository.save(consultationCase);
        log.info("Created consultation case {} for doctor {} and patient {}",
                consultationCase.getId(), doctorId, request.getPatientId());

        return mapToResponse(consultationCase);
    }

    @Transactional
    public CaseResponse updateCase(Long caseId, Long doctorId, UpdateCaseRequest request) {
        ConsultationCase consultationCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new DoctorNotFoundException("Case not found with id: " + caseId));

        // Verify doctor owns this case
        if (!consultationCase.getDoctorId().equals(doctorId)) {
            throw new RuntimeException("Unauthorized: Doctor does not own this case");
        }

        // Update fields
        if (request.getChiefComplaint() != null) {
            consultationCase.setChiefComplaint(request.getChiefComplaint());
        }
        if (request.getSoapNotesJson() != null) {
            consultationCase.setSoapNotesJson(request.getSoapNotesJson());
        }
        if (request.getDiagnosesJson() != null) {
            consultationCase.setDiagnosesJson(request.getDiagnosesJson());
        }
        if (request.getLabOrdersJson() != null) {
            consultationCase.setLabOrdersJson(request.getLabOrdersJson());
        }
        if (request.getNotes() != null) {
            consultationCase.setNotes(request.getNotes());
        }
        if (request.getPrescriptionId() != null) {
            consultationCase.setPrescriptionId(request.getPrescriptionId());
        }
        if (request.getFollowUpDate() != null) {
            consultationCase.setFollowUpDate(request.getFollowUpDate());
        }
        if (request.getStatus() != null) {
            ConsultationCase.CaseStatus newStatus = ConsultationCase.CaseStatus.valueOf(request.getStatus());
            consultationCase.setStatus(newStatus);

            if (newStatus == ConsultationCase.CaseStatus.COMPLETED) {
                consultationCase.setFinalizedAt(LocalDateTime.now());
            }
        }

        consultationCase = caseRepository.save(consultationCase);
        log.info("Updated consultation case {}", caseId);

        return mapToResponse(consultationCase);
    }

    @Transactional
    public CaseResponse finalizeCase(Long caseId, Long doctorId) {
        ConsultationCase consultationCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new DoctorNotFoundException("Case not found with id: " + caseId));

        if (!consultationCase.getDoctorId().equals(doctorId)) {
            throw new RuntimeException("Unauthorized: Doctor does not own this case");
        }

        consultationCase.setStatus(ConsultationCase.CaseStatus.COMPLETED);
        consultationCase.setFinalizedAt(LocalDateTime.now());

        consultationCase = caseRepository.save(consultationCase);
        log.info("Finalized consultation case {}", caseId);

        return mapToResponse(consultationCase);
    }

    public CaseResponse getCaseById(Long caseId) {
        ConsultationCase consultationCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new DoctorNotFoundException("Case not found with id: " + caseId));
        return mapToResponse(consultationCase);
    }

    public CaseResponse getCaseByAppointmentId(Long appointmentId) {
        ConsultationCase consultationCase = caseRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new DoctorNotFoundException("Case not found for appointment: " + appointmentId));
        return mapToResponse(consultationCase);
    }

    public List<CaseResponse> getCasesByDoctor(Long doctorId) {
        return caseRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CaseResponse> getCasesByDoctorAndStatus(Long doctorId, String status) {
        ConsultationCase.CaseStatus caseStatus = ConsultationCase.CaseStatus.valueOf(status.toUpperCase());
        return caseRepository.findByDoctorIdAndStatusOrderByCreatedAtDesc(doctorId, caseStatus).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CaseResponse> getCasesByPatient(Long patientId) {
        return caseRepository.findByPatientIdOrderByCreatedAtDesc(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CaseResponse> getPatientCaseHistory(Long doctorId, Long patientId) {
        return caseRepository.findByDoctorIdAndPatientIdOrderByCreatedAtDesc(doctorId, patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private CaseResponse mapToResponse(ConsultationCase entity) {
        return CaseResponse.builder()
                .id(entity.getId())
                .appointmentId(entity.getAppointmentId())
                .doctorId(entity.getDoctorId())
                .patientId(entity.getPatientId())
                .patientName(entity.getPatientName())
                .patientAge(entity.getPatientAge())
                .patientGender(entity.getPatientGender())
                .chiefComplaint(entity.getChiefComplaint())
                .soapNotesJson(entity.getSoapNotesJson())
                .diagnosesJson(entity.getDiagnosesJson())
                .labOrdersJson(entity.getLabOrdersJson())
                .prescriptionId(entity.getPrescriptionId())
                .notes(entity.getNotes())
                .status(entity.getStatus().name())
                .followUpDate(entity.getFollowUpDate())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .finalizedAt(entity.getFinalizedAt())
                .build();
    }
}
