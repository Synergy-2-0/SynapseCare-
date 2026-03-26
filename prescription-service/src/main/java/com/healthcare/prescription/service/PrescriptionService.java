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
                .build();

        prescription = prescriptionRepository.save(prescription);
        log.info("Prescription created for appointment {}", prescription.getAppointmentId());

        // Notify that consultation is completed and prescription is ready
        rabbitTemplate.convertAndSend("healthcare.exchange", "prescription.created", 
            dto.getAppointmentId().toString());

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
                .build();
    }
}
