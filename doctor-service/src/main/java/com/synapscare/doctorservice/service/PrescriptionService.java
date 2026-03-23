package com.synapscare.doctor.service;

import com.synapscare.doctor.dto.request.PrescriptionRequest;
import com.synapscare.doctor.dto.response.PrescriptionResponse;
import com.synapscare.doctor.entity.Prescription;
import com.synapscare.doctor.exception.Exceptions.*;
import com.synapscare.doctor.repository.PrescriptionRepository;
import com.synapscare.doctor.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;

    @Transactional
    public PrescriptionResponse issue(Long doctorUserId, PrescriptionRequest req) {
        Prescription prescription = Prescription.builder()
                .doctorUserId(doctorUserId)
                .patientUserId(req.getPatientUserId())
                .appointmentId(req.getAppointmentId())
                .diagnosis(req.getDiagnosis())
                .medications(req.getMedications())
                .notes(req.getNotes())
                .status("ACTIVE")
                .build();
        return toResponse(prescriptionRepository.save(prescription));
    }

    public List<PrescriptionResponse> getByDoctor(Long doctorUserId) {
        return prescriptionRepository.findByDoctorUserIdOrderByIssuedAtDesc(doctorUserId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<PrescriptionResponse> getByPatient(Long patientUserId) {
        return prescriptionRepository.findByPatientUserIdOrderByIssuedAtDesc(patientUserId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public PrescriptionResponse getById(Long id, UserDetailsImpl user) {
        Prescription p = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));

        // Doctors can only see their own prescriptions; patients only their own
        String role = user.getRole();
        if (role.equals("DOCTOR") && !p.getDoctorUserId().equals(user.getId())) {
            throw new UnauthorizedAccessException("Access denied");
        }
        if (role.equals("PATIENT") && !p.getPatientUserId().equals(user.getId())) {
            throw new UnauthorizedAccessException("Access denied");
        }
        return toResponse(p);
    }

    private PrescriptionResponse toResponse(Prescription p) {
        return PrescriptionResponse.builder()
                .id(p.getId())
                .doctorUserId(p.getDoctorUserId())
                .patientUserId(p.getPatientUserId())
                .appointmentId(p.getAppointmentId())
                .diagnosis(p.getDiagnosis())
                .medications(p.getMedications())
                .notes(p.getNotes())
                .status(p.getStatus())
                .issuedAt(p.getIssuedAt())
                .build();
    }
}