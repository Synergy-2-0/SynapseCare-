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

    /**
     * Creates or updates doctor profile.
     * If placeholder profile exists (from registration), it updates it.
     * Otherwise creates a new profile.
     */
    @Transactional
    public DoctorProfileResponse createDoctorProfile(Long userId, CreateDoctorProfileRequest request) {
        // Check if placeholder profile exists
        Doctor doctor = doctorRepository.findByUserId(userId).orElse(null);

        if (doctor != null) {
            // Update existing placeholder profile
            log.info("Updating placeholder doctor profile for userId: {}", userId);

            // Check if license number is being changed and already exists
            if (request.getLicenseNumber() != null &&
                !request.getLicenseNumber().equals(doctor.getLicenseNumber()) &&
                doctorRepository.existsByLicenseNumber(request.getLicenseNumber())) {
                throw new DoctorAlreadyExistsException("License number already registered: " + request.getLicenseNumber());
            }

            doctor.setSpecialization(request.getSpecialization());
            doctor.setQualifications(request.getQualifications());
            doctor.setExperience(request.getExperience());
            doctor.setLicenseNumber(request.getLicenseNumber());
            doctor.setConsultationFee(request.getConsultationFee());
            doctor.setBio(request.getBio());
            doctor.setProfileImageUrl(request.getProfileImageUrl());
            doctor.setIsAvailable(true); // Now available for appointments (after verification)
            // Keep existing verification status

        } else {
            // Create new profile (legacy path, shouldn't happen with new flow)
            log.info("Creating new doctor profile for userId: {}", userId);

            if (doctorRepository.existsByLicenseNumber(request.getLicenseNumber())) {
                throw new DoctorAlreadyExistsException("License number already registered: " + request.getLicenseNumber());
            }

            doctor = new Doctor();
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
        }

        Doctor savedDoctor = doctorRepository.save(doctor);
        log.info("Doctor profile saved for userId: {}", userId);

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

    /**
     * Get doctor by ID - PUBLIC endpoint
     * Only returns doctor if verification status is APPROVED and profile complete
     */
    public DoctorProfileResponse getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new DoctorNotFoundException(id));

        // Security: Only return APPROVED doctors with complete profiles for public access
        if (doctor.getVerificationStatus() != VerificationStatus.APPROVED) {
            throw new DoctorNotFoundException("Doctor not found or not verified");
        }

        // Ensure profile is complete
        if (doctor.getSpecialization() == null || doctor.getConsultationFee() == null) {
            throw new DoctorNotFoundException("Doctor profile incomplete");
        }

        return mapToProfileResponse(doctor);
    }

    public DoctorProfileResponse getDoctorByUserId(Long userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found for user: " + userId));
        return mapToProfileResponse(doctor);
    }

    /**
     * Search doctors - PUBLIC endpoint
     * Only returns doctors with:
     * - Complete profile (specialization AND consultationFee NOT NULL)
     * - APPROVED verification status
     */
    public List<DoctorProfileResponse> searchDoctors(String specialization, BigDecimal minFee, BigDecimal maxFee) {
        log.debug("Searching doctors: specialization={}, minFee={}, maxFee={}", specialization, minFee, maxFee);

        List<Doctor> doctors = doctorRepository.searchDoctors(minFee, maxFee);
        log.debug("Found {} approved doctors with complete profiles", doctors.size());

        if (specialization != null && !specialization.isBlank()) {
            String term = specialization.toLowerCase();
            doctors = doctors.stream()
                .filter(d -> d.getSpecialization() != null
                    && d.getSpecialization().toLowerCase().contains(term))
                .collect(Collectors.toList());
            log.debug("After specialization filter '{}': {} doctors", specialization, doctors.size());
        }

        List<DoctorProfileResponse> result = doctors.stream()
                .map(this::mapToProfileResponse)
                .collect(Collectors.toList());

        if (result.isEmpty()) {
            log.warn("⚠️ Search returned empty. Possible reasons: 1) No doctors registered, 2) Doctors haven't completed profile, 3) Doctors not verified");
        }

        return result;
    }

    /**
     * Get ALL doctors regardless of status - for debugging/admin
     */
    public List<DoctorProfileResponse> getAllDoctors() {
        log.debug("Fetching ALL doctors (including incomplete/pending)");
        List<Doctor> doctors = doctorRepository.findAll();
        log.info("Total doctors in database: {}", doctors.size());

        List<DoctorProfileResponse> responses = doctors.stream()
                .map(this::mapToProfileResponse)
                .collect(Collectors.toList());

        // Log statistics
        long pending = doctors.stream().filter(d -> d.getVerificationStatus() == VerificationStatus.PENDING).count();
        long approved = doctors.stream().filter(d -> d.getVerificationStatus() == VerificationStatus.APPROVED).count();
        long rejected = doctors.stream().filter(d -> d.getVerificationStatus() == VerificationStatus.REJECTED).count();
        long incomplete = doctors.stream().filter(d -> d.getSpecialization() == null || d.getConsultationFee() == null).count();

        log.info("Doctor statistics: PENDING={}, APPROVED={}, REJECTED={}, INCOMPLETE_PROFILE={}",
                pending, approved, rejected, incomplete);

        return responses;
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

    /**
     * REMOVED: verifyDoctor(Long doctorId, String status)
     *
     * Verification is now exclusively handled by auth-service.
     * This service only SYNCS verification status from DoctorVerificationEvent.
     *
     * Admin should call auth-service: POST /api/users/doctors/{doctorId}/verify
     * Doctor-service will automatically sync via syncDoctorVerificationByUserId()
     */

    /**
     * Syncs doctor verification status from auth-service event.
     * This is the ONLY way verification status should be updated in doctor-service.
     * Called automatically when DoctorVerificationEvent is received from RabbitMQ.
     */
    @Transactional
    public void syncDoctorVerificationByUserId(Long userId, String status) {
        log.info("Syncing verification: userId={}, status={}", userId, status);

        // Validate status first
        VerificationStatus verificationStatus;
        try {
            verificationStatus = VerificationStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.error("Invalid status '{}' for userId: {}", status, userId);
            throw new InvalidAvailabilityException("Invalid verification status: " + status);
        }

        // Find or create doctor profile
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseGet(() -> {
                    log.warn("Doctor profile not found for userId: {}, creating placeholder", userId);
                    createEmptyDoctorProfile(userId);
                    return doctorRepository.findByUserId(userId)
                            .orElseThrow(() -> new DoctorNotFoundException("Failed to create doctor profile for user: " + userId));
                });

        VerificationStatus oldStatus = doctor.getVerificationStatus();
        doctor.setVerificationStatus(verificationStatus);
        doctor.setIsAvailable(verificationStatus == VerificationStatus.APPROVED);
        doctorRepository.save(doctor);

        log.info("Verification synced: userId={}, {} -> {}", userId, oldStatus, verificationStatus);
    }

    /**
     * Syncs doctor verification status with additional metadata from auth-service event.
     * Enhanced version that includes rejection reason and verifier info.
     */
    @Transactional
    public void syncDoctorVerification(Long userId, String status, String rejectionReason, String verifiedBy) {
        log.info("Syncing verification with metadata: userId={}, status={}, verifiedBy={}",
                userId, status, verifiedBy);

        VerificationStatus verificationStatus;
        try {
            verificationStatus = VerificationStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.error("Invalid status '{}' for userId: {}", status, userId);
            throw new InvalidAvailabilityException("Invalid verification status: " + status);
        }

        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseGet(() -> {
                    log.warn("Doctor profile not found for userId: {}, creating placeholder", userId);
                    createEmptyDoctorProfile(userId);
                    return doctorRepository.findByUserId(userId)
                            .orElseThrow(() -> new DoctorNotFoundException("Failed to create doctor profile for user: " + userId));
                });

        VerificationStatus oldStatus = doctor.getVerificationStatus();
        doctor.setVerificationStatus(verificationStatus);
        doctor.setVerificationRejectionReason(rejectionReason);
        doctor.setVerifiedBy(verifiedBy);
        doctor.setIsAvailable(verificationStatus == VerificationStatus.APPROVED);
        doctorRepository.save(doctor);

        log.info("Verification synced with metadata: userId={}, {} -> {}, reason={}",
                userId, oldStatus, verificationStatus, rejectionReason);
    }

    public List<DoctorProfileResponse> getPendingDoctors() {
        return doctorRepository.findByVerificationStatus(VerificationStatus.PENDING)
                .stream()
                .map(this::mapToProfileResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get available slots for a doctor - PUBLIC endpoint
     * Only returns slots if doctor is APPROVED and available
     */
    public List<AvailableSlotResponse> getAvailableSlots(Long doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new DoctorNotFoundException(doctorId));

        // Security: Only return slots for APPROVED and available doctors
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

    /**
     * Creates a placeholder doctor profile when a user registers as DOCTOR.
     * Called automatically by UserRegisteredListener.
     * Doctor will fill in details later via createDoctorProfile endpoint.
     */
    @Transactional
    public void createEmptyDoctorProfile(Long userId) {
        if (doctorRepository.existsByUserId(userId)) {
            log.debug("Doctor profile already exists for userId: {}", userId);
            return;
        }

        Doctor doctor = new Doctor();
        doctor.setUserId(userId);
        doctor.setSpecialization(null); // To be filled by doctor
        doctor.setQualifications(null);
        doctor.setExperience(0);
        doctor.setLicenseNumber(null);
        doctor.setConsultationFee(null); // To be filled by doctor
        doctor.setBio(null);
        doctor.setProfileImageUrl(null);
        doctor.setIsAvailable(false); // Not available until profile completed
        doctor.setVerificationStatus(VerificationStatus.PENDING);

        doctorRepository.save(doctor);
        log.info("✅ Placeholder doctor profile created for userId: {}", userId);
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
