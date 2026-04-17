package com.healthcare.appointment.service;

import com.healthcare.appointment.client.DoctorServiceClient;
import com.healthcare.appointment.client.PatientServiceClient;
import com.healthcare.appointment.dto.BlockSlotRequest;
import com.healthcare.appointment.dto.AppointmentDto;
import com.healthcare.appointment.dto.AppointmentEvent;
import com.healthcare.appointment.dto.RescheduleAppointmentDto;
import com.healthcare.appointment.dto.client.AvailableSlotClientDto;
import com.healthcare.appointment.dto.client.DoctorProfileClientDto;
import com.healthcare.appointment.entity.Appointment;
import com.healthcare.appointment.entity.AppointmentStatus;
import com.healthcare.appointment.entity.ExtraSlot;
import com.healthcare.appointment.exception.ResourceNotFoundException;
import com.healthcare.appointment.exception.SlotConflictException;
import com.healthcare.appointment.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@org.springframework.transaction.annotation.Transactional
public class AppointmentService {

    private static final List<AppointmentStatus> OCCUPIED_STATUSES = List.of(
            AppointmentStatus.PENDING,
            AppointmentStatus.PENDING_PAYMENT,
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.IN_PROGRESS,
            AppointmentStatus.PAID,
            AppointmentStatus.BLOCKED
    );

    private final AppointmentRepository appointmentRepository;
    private final DoctorServiceClient doctorServiceClient;
    private final PatientServiceClient patientServiceClient;
    private final AppointmentEventProducer appointmentEventProducer;
    private final com.healthcare.appointment.repository.ExtraSlotRepository extraSlotRepository;

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
                OCCUPIED_STATUSES
        );

        if (isBooked) {
            throw new SlotConflictException("Doctor is already booked for this slot");
        }

        // Token Generation: Count existing appointments for this doctor on this day
        long existingCount = appointmentRepository.countByDoctorIdAndDate(dto.getDoctorId(), dto.getDate());
        int tokenNumber = (int) existingCount + 1;

        Appointment appointment = Appointment.builder()
                .patientId(dto.getPatientId())
                .doctorId(dto.getDoctorId())
                .date(dto.getDate())
                .time(dto.getTime())
            .meetingLink(dto.getMeetingLink())
            .reason(dto.getReason())
                .fee(dto.getFee() != null ? dto.getFee() : 1500.0)
                .notes(dto.getNotes())
                .consultationType(dto.getConsultationType() != null ? dto.getConsultationType() : "VIDEO")
                .tokenNumber(tokenNumber)
            .status(AppointmentStatus.PENDING)
                .build();

        appointment = appointmentRepository.save(appointment);

        publishEvent("APPOINTMENT_BOOKED", appointment);
        publishEvent("PAYMENT_REQUESTED", appointment);
        return mapToDto(appointment);
    }

    public void completeAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointment = appointmentRepository.save(appointment);
        publishEvent("APPOINTMENT_COMPLETED", appointment);
    }

    public void rejectAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        appointment.setStatus(AppointmentStatus.REJECTED);
        appointment = appointmentRepository.save(appointment);
        publishEvent("APPOINTMENT_REJECTED", appointment);
    }

    public void confirmAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!StringUtils.hasText(appointment.getMeetingLink())) {
            appointment.setMeetingLink(generateMeetingLink(appointment));
        }
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment = appointmentRepository.save(appointment);
        publishEvent("APPOINTMENT_CONFIRMED", appointment);
        publishEvent("TELEMEDICINE_LINK_READY", appointment);
        publishEvent("PAYMENT_REQUESTED", appointment);
    }

    public AppointmentDto cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment = appointmentRepository.save(appointment);

        publishEvent("APPOINTMENT_CANCELLED", appointment);
        return mapToDto(appointment);
    }
    

    public AppointmentDto rescheduleAppointment(Long id, RescheduleAppointmentDto dto) {
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
            OCCUPIED_STATUSES,
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
        if (dto.getFee() != null) {
            appointment.setFee(dto.getFee());
        }
        if (dto.getNotes() != null) {
            appointment.setNotes(dto.getNotes());
        }
        if (dto.getConsultationType() != null) {
            appointment.setConsultationType(dto.getConsultationType());
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

    public List<AppointmentDto> getAllAppointments() {
        return appointmentRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<AppointmentDto> getAppointmentsByDoctor(Long doctorId) {
        List<AppointmentDto> appointments = new java.util.ArrayList<>(
            appointmentRepository.findByDoctorIdOrderByDateAscTimeAsc(doctorId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList())
        );

        List<ExtraSlot> extraSlots = extraSlotRepository.findByDoctorId(doctorId);
        log.info("Found {} extra availability slots for clinician {}", extraSlots.size(), doctorId);

        List<AppointmentDto> extras = extraSlots.stream()
                .map(es -> AppointmentDto.builder()
                        .id(es.getId())
                        .patientId(0L) // Virtual patient for tracking
                        .doctorId(es.getDoctorId())
                        .date(es.getDate())
                        .time(es.getStartTime())
                        .status(AppointmentStatus.AVAILABLE)
                        .reason("Extra Availability")
                        .build())
                .collect(Collectors.toList());

        appointments.addAll(extras);
        return appointments;
    }

    public List<java.time.LocalTime> getBookedSlots(Long doctorId, java.time.LocalDate date) {
        return appointmentRepository.findByDoctorIdAndDateAndStatusIn(
                doctorId, 
                date, 
                OCCUPIED_STATUSES
        ).stream()
         .map(Appointment::getTime)
         .collect(Collectors.toList());
    }

    public List<AvailableSlotClientDto> getFilteredAvailableSlots(Long doctorId, java.time.LocalDate date) {
        // 1. Get base slots from doctor-service
        List<AvailableSlotClientDto> slots = doctorServiceClient.getAvailableSlots(doctorId, date);
        
        // 2. Get booked times from our local DB
        java.util.Set<java.time.LocalTime> bookedTimes = appointmentRepository.findByDoctorIdAndDateAndStatusIn(
                doctorId, 
                date, 
                OCCUPIED_STATUSES
        ).stream()
         .map(com.healthcare.appointment.entity.Appointment::getTime)
         .collect(Collectors.toSet());

        // 3. Get extra slots from local DB
        List<com.healthcare.appointment.entity.ExtraSlot> extraSlots = extraSlotRepository.findByDoctorIdAndDate(doctorId, date);
        List<AvailableSlotClientDto> extraDtos = extraSlots.stream()
                .map(es -> AvailableSlotClientDto.builder()
                        .date(es.getDate())
                        .startTime(es.getStartTime())
                        .endTime(es.getEndTime())
                        .isAvailable(true)
                        .build())
                .collect(Collectors.toList());

        // 4. Merge all slots
        List<AvailableSlotClientDto> allSlots = new java.util.ArrayList<>(slots);
        allSlots.addAll(extraDtos);

        // 5. Sort by time
        allSlots.sort(java.util.Comparator.comparing(AvailableSlotClientDto::getStartTime));

        // 6. Mark slots as unavailable if booked
        return allSlots.stream()
                .map(slot -> {
                    if (bookedTimes.contains(slot.getStartTime())) {
                        return AvailableSlotClientDto.builder()
                                .date(slot.getDate())
                                .startTime(slot.getStartTime())
                                .endTime(slot.getEndTime())
                                .isAvailable(false)
                                .build();
                    }
                    return slot;
                })
                .collect(Collectors.toList());
    }

    public List<com.healthcare.appointment.dto.client.PatientClientDto> getPatientsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorIdOrderByDateAscTimeAsc(doctorId)
                .stream()
                .map(Appointment::getPatientId)
                .distinct()
                .map(patientId -> {
                    try {
                        return patientServiceClient.getPatientById(patientId);
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(p -> p != null)
                .collect(Collectors.toList());
    }

    public AppointmentDto updateStatus(Long id, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (status == AppointmentStatus.CONFIRMED && !StringUtils.hasText(appointment.getMeetingLink())) {
            appointment.setMeetingLink(generateMeetingLink(appointment));
        }
        appointment.setStatus(status);
        appointment = appointmentRepository.save(appointment);

        publishEvent("APPOINTMENT_STATUS_UPDATED", appointment);
        if (status == AppointmentStatus.CONFIRMED) {
            publishEvent("TELEMEDICINE_LINK_READY", appointment);
            publishEvent("PAYMENT_REQUESTED", appointment);
        }
        return mapToDto(appointment);
    }

    public List<AppointmentDto> findConflicts(Long doctorId, LocalDate start, LocalDate end) {
        return appointmentRepository.findByDoctorIdAndDateBetweenAndStatusIn(
                doctorId, 
                start, 
                end, 
                OCCUPIED_STATUSES
        ).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public AppointmentDto blockSlot(Long doctorId, Long userId, BlockSlotRequest request) {
        log.info("Attempting to block clinical slot for doctor {} on {} at {}", doctorId, request.getDate(), request.getTime());
        
        DoctorProfileClientDto doctor = null;
        try {
            doctor = doctorServiceClient.getDoctorById(doctorId);
        } catch (Exception e) {
            log.warn("Identity verification for doctor {} failed during slot blocking, but proceeding with safety checks: {}", doctorId, e.getMessage());
        }

        if (doctor != null && userId != null && doctor.getUserId() != null && !doctor.getUserId().equals(userId)) {
            throw new SlotConflictException("Security breach: Unauthorized practitioner identity detected for this clinical channel.");
        }

        boolean alreadyOccupied = appointmentRepository.existsByDoctorIdAndDateAndTimeAndStatusIn(
                doctorId,
                request.getDate(),
                request.getTime(),
                OCCUPIED_STATUSES
        );

        if (alreadyOccupied) {
            throw new SlotConflictException("Clinical collision: Practitioner is already committed to an appointment or block at this juncture.");
        }

        try {
            long existingCount = appointmentRepository.countByDoctorIdAndDate(doctorId, request.getDate());
            
            Appointment appointment = Appointment.builder()
                    .patientId(null) // Identity is vacant for blocked clinical nodes
                    .doctorId(doctorId)
                    .date(request.getDate())
                    .time(request.getTime())
                    .reason(request.getReason() != null ? request.getReason() : "Clinical schedule adjustment")
                    .fee(0.0)
                    .notes("Secured Practitioner Availability")
                    .consultationType("CLINICAL_BLOCK")
                    .tokenNumber((int) existingCount + 1)
                    .status(AppointmentStatus.BLOCKED)
                    .build();

            appointment = appointmentRepository.save(appointment);
            log.info("Clinical slot successfully secured for practitioner {}. Identity Artifact ID: {}", doctorId, appointment.getId());
            return mapToDto(appointment);
        } catch (Exception e) {
            log.error("CRITICAL: Clinical slot persistence failed for doctor {}. Root cause: {}", doctorId, e.getMessage());
            throw new RuntimeException("Clinical availability failure: Contact systems engineering. Error: " + e.getMessage());
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public List<AppointmentDto> blockSlotsBulk(Long doctorId, Long userId, List<BlockSlotRequest> requests) {
        return requests.stream()
                .map(request -> {
                    try {
                        return blockSlot(doctorId, userId, request);
                    } catch (Exception e) {
                        log.warn("Could not block individual slot: {}", e.getMessage());
                        return null;
                    }
                })
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
    }

    public void addExtraSlot(Long doctorId, BlockSlotRequest request) {
        com.healthcare.appointment.entity.ExtraSlot extraSlot = com.healthcare.appointment.entity.ExtraSlot.builder()
                .doctorId(doctorId)
                .date(request.getDate())
                .startTime(request.getTime())
                .endTime(request.getTime().plusMinutes(60)) // Assuming 1 hour for extra slot for now
                .reason("Clinician Defined Extra Availability")
                .build();
        extraSlotRepository.save(extraSlot);
    }

    public void deleteExtraSlot(Long id, Long doctorId) {
        log.info("Deleting extra slot {} for doctor {}", id, doctorId);
        extraSlotRepository.findById(id).ifPresent(es -> {
            if (es.getDoctorId().equals(doctorId)) {
                extraSlotRepository.delete(es);
                log.info("Extra slot {} deleted successfully", id);
            } else {
                log.warn("Unauthorized attempt to delete extra slot {} by doctor {}", id, doctorId);
            }
        });
    }

    public void convertExtraSlotToBlock(Long slotId, Long doctorId) {
        log.info("Converting extra slot {} to clinical block for doctor {}", slotId, doctorId);
        extraSlotRepository.findById(slotId).ifPresent(es -> {
            if (es.getDoctorId().equals(doctorId)) {
                // Create the block using existing business logic
                BlockSlotRequest blockReq = new BlockSlotRequest();
                blockReq.setDate(es.getDate());
                blockReq.setTime(es.getStartTime());
                blockReq.setReason("Clinical Administrative Block");
                blockSlot(doctorId, null, blockReq);
                
                // Remove the extra slot record
                extraSlotRepository.delete(es);
                log.info("Successfully converted slot {} to block and removed extra_slot entry", slotId);
            }
        });
    }

    public void bulkReassign(List<Long> appointmentIds, Long targetDoctorId) {
        List<Appointment> appointments = appointmentRepository.findAllById(appointmentIds);
        for (Appointment appointment : appointments) {
            appointment.setDoctorId(targetDoctorId);
            appointmentRepository.save(appointment);
            publishEvent("APPOINTMENT_REASSIGNED", appointment);
        }
    }

    public void bulkCancel(List<Long> appointmentIds, String reason) {
        List<Appointment> appointments = appointmentRepository.findAllById(appointmentIds);
        for (Appointment appointment : appointments) {
            appointment.setStatus(AppointmentStatus.CANCELLED);
            appointment.setReason(reason);
            appointmentRepository.save(appointment);
            publishEvent("APPOINTMENT_CANCELLED", appointment);
        }
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
                .fee(entity.getFee())
                .notes(entity.getNotes())
                .consultationType(entity.getConsultationType())
                .tokenNumber(entity.getTokenNumber())
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
        Long userId = null;
        String patientEmail = null;
        String patientPhone = null;
        try {
            com.healthcare.appointment.dto.client.PatientClientDto patient = 
                patientServiceClient.getPatientById(appointment.getPatientId());
            if (patient != null) {
                userId = patient.getUserId();
                patientEmail = patient.getEmail();
                patientPhone = patient.getPhone();
            }
        } catch (Exception e) {
            log.error("Could not fetch patient info for event: {}", e.getMessage());
        }

        appointmentEventProducer.sendAppointmentEvent(
                AppointmentEvent.builder()
                        .eventType(eventType)
                        .appointmentId(appointment.getId())
                        .patientId(appointment.getPatientId())
                        .userId(userId)
                        .patientEmail(patientEmail)
                        .patientPhone(patientPhone)
                        .doctorId(appointment.getDoctorId())
                        .date(appointment.getDate())
                        .time(appointment.getTime())
                        .meetingLink(appointment.getMeetingLink())
                        .fee(appointment.getFee())
                        .consultationType(appointment.getConsultationType())
                        .reason(appointment.getReason())
                        .status(appointment.getStatus())
                        .occurredAt(LocalDateTime.now())
                        .build()
        );
    }

    private String generateMeetingLink(Appointment appointment) {
        String roomToken = appointment.getId() + "-" + UUID.randomUUID().toString().substring(0, 8);
        return "https://meet.jit.si/medilink-" + roomToken;
    }
    
}