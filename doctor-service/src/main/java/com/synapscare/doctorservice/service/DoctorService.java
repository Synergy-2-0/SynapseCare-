package com.synapscare.doctorservice.service;

import com.synapscare.doctorservice.dto.messaging.DoctorVerifiedEvent;
import com.synapscare.doctorservice.dto.request.*;
import com.synapscare.doctorservice.dto.response.*;
import com.synapscare.doctorservice.entity.Doctor;
import com.synapscare.doctorservice.entity.DoctorAvailability;
import com.synapscare.doctorservice.entity.DoctorSchedule;
import com.synapscare.doctorservice.enums.VerificationStatus;
import com.synapscare.doctorservice.exception.*;
import com.synapscare.doctorservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import static com.synapscare.doctorservice.config.RabbitMQConfig.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorScheduleRepository scheduleRepository;
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    public DoctorProfileResponse createDoctorProfile(Long userId, CreateDoctorProfileRequest request) {
        if (doctorRepository.existsByUserId(userId)) {
            throw new DoctorAlreadyExistsException("Doctor profile already exists for user: " + userId);
        }

        if (doctorRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new DoctorAlreadyExistsException("License number already registered: " + request.getLicenseNumber());
        }

        Doctor doctor = new Doctor();
        doctor.setUserId(userId);
        doctor.setSpecialization(request.getSpecialization());
        doctor.setQualifications(request.getQualifications());
        doctor.setExperience(request.getExperience());
        doctor.setLicenseNumber(request.getLicenseNumber());
        doctor.setConsultationFee(request.getConsultationFee());
        doctor.setBio(request.getBio());
        doctor.setProfileImageUrl(request.getProfileImageUrl());
        doctor.setIsAvailable(true);
        doctor.setVerificationStatus(VerificationStatus.PENDING);

        Doctor savedDoctor = doctorRepository.save(doctor);
        log.info("Doctor profile created for userId: {}", userId);

        return mapToProfileResponse(savedDoctor);
    }

    @Transactional
    public DoctorProfileResponse updateDoctorProfile(Long doctorId, Long userId, UpdateDoctorProfileRequest request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new DoctorNotFoundException(doctorId));

        if (!doctor.getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("Not authorized to update this profile");
        }

        if (request.getSpecialization() != null) {
            doctor.setSpecialization(request.getSpecialization());
        }
        if (request.getQualifications() != null) {
            doctor.setQualifications(request.getQualifications());
        }
        if (request.getExperience() != null) {
            doctor.setExperience(request.getExperience());
        }
        if (request.getConsultationFee() != null) {
            doctor.setConsultationFee(request.getConsultationFee());
        }
        if (request.getBio() != null) {
            doctor.setBio(request.getBio());
        }
        if (request.getProfileImageUrl() != null) {
            doctor.setProfileImageUrl(request.getProfileImageUrl());
        }

        Doctor updatedDoctor = doctorRepository.save(doctor);
        log.info("Doctor profile updated for id: {}", doctorId);

        return mapToProfileResponse(updatedDoctor);
    }

    public DoctorProfileResponse getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new DoctorNotFoundException(id));
        return mapToProfileResponse(doctor);
    }

    public DoctorProfileResponse getDoctorByUserId(Long userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found for user: " + userId));
        return mapToProfileResponse(doctor);
    }

    public List<DoctorProfileResponse> searchDoctors(String specialization, BigDecimal minFee, BigDecimal maxFee) {
        return doctorRepository.searchDoctors(specialization, minFee, maxFee)
                .stream()
                .map(this::mapToProfileResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DoctorAvailabilityResponse setAvailability(Long doctorId, Long userId, SetAvailabilityRequest request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new DoctorNotFoundException(doctorId));

        if (!doctor.getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("Not authorized to set availability");
        }

        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
            throw new InvalidAvailabilityException("Start time must be before end time");
        }

        DoctorAvailability availability = new DoctorAvailability();
        availability.setDoctorId(doctorId);
        availability.setDayOfWeek(request.getDayOfWeek());
        availability.setStartTime(request.getStartTime());
        availability.setEndTime(request.getEndTime());
        availability.setIsActive(request.getIsActive());

        DoctorAvailability saved = availabilityRepository.save(availability);
        log.info("Availability set for doctor: {} on {}", doctorId, request.getDayOfWeek());

        return mapToAvailabilityResponse(saved);
    }

    public List<DoctorAvailabilityResponse> getDoctorAvailability(Long doctorId) {
        return availabilityRepository.findByDoctorIdAndIsActive(doctorId, true)
                .stream()
                .map(this::mapToAvailabilityResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DoctorScheduleResponse addSchedule(Long doctorId, Long userId, AddScheduleRequest request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new DoctorNotFoundException(doctorId));

        if (!doctor.getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("Not authorized to add schedule");
        }

        if (request.getStartTime() != null && request.getEndTime() != null) {
            if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
                throw new InvalidAvailabilityException("Start time must be before end time");
            }
        }

        DoctorSchedule schedule = new DoctorSchedule();
        schedule.setDoctorId(doctorId);
        schedule.setDate(request.getDate());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setIsAvailable(request.getIsAvailable());
        schedule.setReason(request.getReason());

        DoctorSchedule saved = scheduleRepository.save(schedule);
        log.info("Schedule added for doctor: {} on {}", doctorId, request.getDate());

        return mapToScheduleResponse(saved);
    }

    @Transactional
    public void updateAvailabilityStatus(Long doctorId, Long userId, Boolean isAvailable) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new DoctorNotFoundException(doctorId));

        if (!doctor.getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("Not authorized to update status");
        }

        doctor.setIsAvailable(isAvailable);
        doctorRepository.save(doctor);
        log.info("Availability status updated for doctor: {} to {}", doctorId, isAvailable);
    }

    @Transactional
    public DoctorProfileResponse verifyDoctor(Long doctorId, String status) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new DoctorNotFoundException(doctorId));

        VerificationStatus verificationStatus;
        try {
            verificationStatus = VerificationStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidAvailabilityException("Invalid verification status: " + status);
        }

        doctor.setVerificationStatus(verificationStatus);
        Doctor savedDoctor = doctorRepository.save(doctor);

        // Publish event for notification service
        DoctorVerifiedEvent event = new DoctorVerifiedEvent(
                doctorId,
                doctor.getUserId(),
                null, // Email will be fetched by notification service from auth-service
                verificationStatus.name(),
                doctor.getSpecialization()
        );

        rabbitTemplate.convertAndSend(DOCTOR_EXCHANGE, DOCTOR_VERIFIED_ROUTING_KEY, event);
        log.info("Doctor {} verification status updated to: {}", doctorId, verificationStatus);

        return mapToProfileResponse(savedDoctor);
    }

    public List<DoctorProfileResponse> getPendingDoctors() {
        return doctorRepository.findByVerificationStatus(VerificationStatus.PENDING)
                .stream()
                .map(this::mapToProfileResponse)
                .collect(Collectors.toList());
    }

    public List<AvailableSlotResponse> getAvailableSlots(Long doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new DoctorNotFoundException(doctorId));

        if (!doctor.getIsAvailable() || doctor.getVerificationStatus() != VerificationStatus.APPROVED) {
            return List.of();
        }

        // Check if there's a schedule override for this date
        return scheduleRepository.findByDoctorIdAndDate(doctorId, date)
                .map(schedule -> List.of(AvailableSlotResponse.builder()
                        .date(schedule.getDate())
                        .startTime(schedule.getStartTime())
                        .endTime(schedule.getEndTime())
                        .isAvailable(schedule.getIsAvailable())
                        .build()))
                .orElse(List.of());
    }

    @Transactional
    public void createEmptyDoctorProfile(Long userId) {
        if (!doctorRepository.existsByUserId(userId)) {
            Doctor doctor = new Doctor();
            doctor.setUserId(userId);
            doctor.setSpecialization("");
            doctor.setConsultationFee(BigDecimal.ZERO);
            doctor.setIsAvailable(false);
            doctor.setVerificationStatus(VerificationStatus.PENDING);
            doctorRepository.save(doctor);
            log.info("Empty doctor profile created for userId: {}", userId);
        }
    }

    private DoctorProfileResponse mapToProfileResponse(Doctor doctor) {
        return DoctorProfileResponse.builder()
                .id(doctor.getId())
                .userId(doctor.getUserId())
                .specialization(doctor.getSpecialization())
                .qualifications(doctor.getQualifications())
                .experience(doctor.getExperience())
                .licenseNumber(doctor.getLicenseNumber())
                .consultationFee(doctor.getConsultationFee())
                .bio(doctor.getBio())
                .profileImageUrl(doctor.getProfileImageUrl())
                .isAvailable(doctor.getIsAvailable())
                .verificationStatus(doctor.getVerificationStatus())
                .createdAt(doctor.getCreatedAt())
                .updatedAt(doctor.getUpdatedAt())
                .build();
    }

    private DoctorAvailabilityResponse mapToAvailabilityResponse(DoctorAvailability availability) {
        return DoctorAvailabilityResponse.builder()
                .id(availability.getId())
                .doctorId(availability.getDoctorId())
                .dayOfWeek(availability.getDayOfWeek())
                .startTime(availability.getStartTime())
                .endTime(availability.getEndTime())
                .isActive(availability.getIsActive())
                .build();
    }

    private DoctorScheduleResponse mapToScheduleResponse(DoctorSchedule schedule) {
        return DoctorScheduleResponse.builder()
                .id(schedule.getId())
                .doctorId(schedule.getDoctorId())
                .date(schedule.getDate())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .isAvailable(schedule.getIsAvailable())
                .reason(schedule.getReason())
                .build();
    }
}
