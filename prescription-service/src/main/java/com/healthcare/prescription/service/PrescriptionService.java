package com.healthcare.prescription.service;

import com.healthcare.prescription.dto.PrescriptionDto;
import com.healthcare.prescription.entity.Prescription;
import com.healthcare.prescription.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionPdfService pdfService;
    private final RabbitTemplate rabbitTemplate;

    public PrescriptionDto createPrescription(PrescriptionDto dto) {
        Prescription prescription = Prescription.builder()
                .appointmentId(dto.getAppointmentId())
                .doctorId(dto.getDoctorId())
                .patientId(dto.getPatientId())
                .medicineName(dto.getMedicineName())
                .dosage(dto.getDosage())
                .duration(dto.getDuration())
                .instructions(dto.getInstructions())
                .createdDate(LocalDateTime.now())
                .followUpNotes(dto.getFollowUpNotes())
                .diagnosis(dto.getDiagnosis() != null ? dto.getDiagnosis() : "")
                .diagnosisCode(dto.getDiagnosisCode() != null ? dto.getDiagnosisCode() : "")
                .unitPrice(dto.getUnitPrice())
                .quantity(dto.getQuantity())
                .unitDiscount(dto.getUnitDiscount())
                .totalAmount(
                    (dto.getUnitPrice() != null ? dto.getUnitPrice() : 0.0) * 
                    (dto.getQuantity() != null ? dto.getQuantity() : 0) - 
                    (dto.getUnitDiscount() != null ? dto.getUnitDiscount() : 0.0)
                )
                .isActive(true)
                .build();

        prescription = prescriptionRepository.save(prescription);
        log.info("Prescription created with ID: {} for appointment: {}", prescription.getId(), prescription.getAppointmentId());

        // Notify that consultation is completed and prescription is ready
        if (prescription.getAppointmentId() != null) {
            try {
                rabbitTemplate.convertAndSend("healthcare.exchange", "prescription.created",
                    prescription.getAppointmentId().toString());
            } catch (Exception e) {
                log.error("Failed to send RabbitMQ notification for prescription: {}", e.getMessage());
            }
        }

        return mapToDto(prescription);
    }

    public List<PrescriptionDto> getByPatientId(Long patientId) {
        return prescriptionRepository.findByPatientId(patientId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<PrescriptionDto> getByDoctorId(Long doctorId) {
        return prescriptionRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<PrescriptionDto> getByAppointmentId(Long appointmentId) {
        return prescriptionRepository.findByAppointmentId(appointmentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public PrescriptionDto getById(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found with id: " + id));
        return mapToDto(prescription);
    }

    public byte[] generatePdf(Long prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Prescription not found with id: " + prescriptionId));
        return pdfService.generatePrescriptionPdf(prescription);
    }

    private PrescriptionDto mapToDto(Prescription entity) {
        return PrescriptionDto.builder()
                .id(entity.getId())
                .appointmentId(entity.getAppointmentId())
                .doctorId(entity.getDoctorId())
                .patientId(entity.getPatientId())
                .medicineName(entity.getMedicineName())
                .dosage(entity.getDosage())
                .duration(entity.getDuration())
                .instructions(entity.getInstructions())
                .createdDate(entity.getCreatedDate())
                .followUpNotes(entity.getFollowUpNotes())
                .diagnosis(entity.getDiagnosis())
                .diagnosisCode(entity.getDiagnosisCode())
                .unitPrice(entity.getUnitPrice())
                .quantity(entity.getQuantity())
                .unitDiscount(entity.getUnitDiscount())
                .totalAmount(entity.getTotalAmount())
                .build();
    }
}
