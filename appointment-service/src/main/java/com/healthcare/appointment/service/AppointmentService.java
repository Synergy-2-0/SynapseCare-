package com.healthcare.appointment.service;

import com.healthcare.appointment.client.PatientServiceClient;
import com.healthcare.appointment.dto.AppointmentDto;
import com.healthcare.appointment.dto.AppointmentEvent;
import com.healthcare.appointment.entity.Appointment;
import com.healthcare.appointment.entity.AppointmentStatus;
import com.healthcare.appointment.exception.ResourceNotFoundException;
import com.healthcare.appointment.exception.SlotConflictException;
import com.healthcare.appointment.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.healthcare.appointment.client.DoctorServiceClient;
import com.healthcare.appointment.dto.client.AvailableSlotClientDto;
import com.healthcare.appointment.dto.client.DoctorProfileClientDto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorServiceClient doctorServiceClient;
    private final PatientServiceClient patientServiceClient;
    private final AppointmentEventProducer appointmentEventProducer;

    public AppointmentDto bookAppointment(AppointmentDto dto) {
        patientServiceClient.getPatientById(dto.getPatientId());

        DoctorProfileClientDto doctor = doctorServiceClient.getDoctorById(dto.getDoctorId());

        if (doctor == null) {
            throw new ResourceNotFoundException("Doctor not found");
        }
        if (!Boolean.TRUE.equals(doctor.getIsAvailable())) {
            throw new SlotConflictException("Doctor is currently unavailable");
        }
        if (doctor.getVerificationStatus() == null || !"APPROVED".equalsIgnoreCase(doctor.getVerificationStatus())) {
            throw new SlotConflictException("Doctor is not approved for appointments");
        }

        List<AvailableSlotClientDto> availableSlots =
                doctorServiceClient.getAvailableSlots(dto.getDoctorId(), dto.getDate());
        if (!isWithinAnyAvailableSlot(dto.getTime(), availableSlots)) {
            throw new SlotConflictException("Requested time is not within doctor available slots");
        }

        boolean isBooked = appointmentRepository.existsByDoctorIdAndDateAndTimeAndStatusIn(
                dto.getDoctorId(),
                dto.getDate(),
                dto.getTime(),
                List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED)
        );

        if (isBooked) {
            throw new SlotConflictException("Doctor is already booked for this slot");
        }

        Appointment appointment = Appointment.builder()
                .patientId(dto.getPatientId())
                .doctorId(dto.getDoctorId())
                .date(dto.getDate())
                .time(dto.getTime())
            .meetingLink(dto.getMeetingLink())
            .reason(dto.getReason())
                .status(AppointmentStatus.PENDING)
                .build();

        appointment = appointmentRepository.save(appointment);

        publishEvent("APPOINTMENT_BOOKED", appointment);
        return mapToDto(appointment);
    }

    public AppointmentDto cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment = appointmentRepository.save(appointment);

        publishEvent("APPOINTMENT_CANCELLED", appointment);
        return mapToDto(appointment);
    }

    public AppointmentDto rescheduleAppointment(Long id, AppointmentDto dto) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        List<AvailableSlotClientDto> availableSlots =
            doctorServiceClient.getAvailableSlots(appointment.getDoctorId(), dto.getDate());
        if (!isWithinAnyAvailableSlot(dto.getTime(), availableSlots)) {
            throw new SlotConflictException("Requested time is not within doctor available slots");
        }

        boolean isBooked = appointmentRepository.existsByDoctorIdAndDateAndTimeAndStatusInAndIdNot(
                appointment.getDoctorId(),
                dto.getDate(),
                dto.getTime(),
            List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED),
            appointment.getId()
        );

        if (isBooked) {
            throw new SlotConflictException("Doctor is already booked for the new slot");
        }

        appointment.setDate(dto.getDate());
        appointment.setTime(dto.getTime());
        if (dto.getReason() != null) {
            appointment.setReason(dto.getReason());
        }
        if (dto.getMeetingLink() != null) {
            appointment.setMeetingLink(dto.getMeetingLink());
        }
        appointment = appointmentRepository.save(appointment);

        publishEvent("APPOINTMENT_RESCHEDULED", appointment);
        return mapToDto(appointment);
    }

    public AppointmentDto getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        return mapToDto(appointment);
    }

    public List<AppointmentDto> getAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientIdOrderByDateAscTimeAsc(patientId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<AppointmentDto> getAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorIdOrderByDateAscTimeAsc(doctorId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public AppointmentDto updateStatus(Long id, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        appointment.setStatus(status);
        appointment = appointmentRepository.save(appointment);

        publishEvent("APPOINTMENT_STATUS_UPDATED", appointment);
        return mapToDto(appointment);
    }

    private AppointmentDto mapToDto(Appointment entity) {
        return AppointmentDto.builder()
                .id(entity.getId())
                .patientId(entity.getPatientId())
                .doctorId(entity.getDoctorId())
                .date(entity.getDate())
                .time(entity.getTime())
                .meetingLink(entity.getMeetingLink())
                .reason(entity.getReason())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private boolean isWithinAnyAvailableSlot(java.time.LocalTime requestedTime, List<AvailableSlotClientDto> slots) {
        return slots.stream()
                .filter(slot -> Boolean.TRUE.equals(slot.getIsAvailable()))
                .anyMatch(slot -> !requestedTime.isBefore(slot.getStartTime()) && requestedTime.isBefore(slot.getEndTime()));
    }

    private void publishEvent(String eventType, Appointment appointment) {
        appointmentEventProducer.sendAppointmentEvent(
                AppointmentEvent.builder()
                        .eventType(eventType)
                        .appointmentId(appointment.getId())
                        .patientId(appointment.getPatientId())
                        .doctorId(appointment.getDoctorId())
                        .date(appointment.getDate())
                        .time(appointment.getTime())
                        .status(appointment.getStatus())
                        .occurredAt(LocalDateTime.now())
                        .build()
        );
    }
}