package com.synapscare.doctorservice.service;

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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;



@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorScheduleRepository scheduleRepository;

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
            if (request.getProfileImageUrl() != null) {
                doctor.setProfileImageUrl(request.getProfileImageUrl());
            }
            if (request.getLicenseDocumentUrl() != null) {
                doctor.setLicenseDocumentUrl(request.getLicenseDocumentUrl());
            }
            if (request.getSlotDuration() != null) {
                doctor.setSlotDuration(request.getSlotDuration());
            }
            if (request.getBufferTime() != null) {
                doctor.setBufferTime(request.getBufferTime());
            }
            // Keep isAvailable false until APPROVED via RabbitMQ event
            // Keep existing verification status

        } else {
            // Create new profile
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
            doctor.setLicenseDocumentUrl(request.getLicenseDocumentUrl());
            doctor.setSlotDuration(request.getSlotDuration() != null ? request.getSlotDuration() : 30);
            doctor.setBufferTime(request.getBufferTime() != null ? request.getBufferTime() : 0);
            doctor.setIsAvailable(false); // Not available until APPROVED
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
        if (request.getLicenseNumber() != null) {
            doctor.setLicenseNumber(request.getLicenseNumber());
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
        if (request.getLicenseDocumentUrl() != null) {
            doctor.setLicenseDocumentUrl(request.getLicenseDocumentUrl());
        }
        if (request.getSlotDuration() != null) {
            doctor.setSlotDuration(request.getSlotDuration());
        }
        if (request.getBufferTime() != null) {
            doctor.setBufferTime(request.getBufferTime());
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
        log.debug("Clinical registry lookup signal for practitioner: {}", id);
        Doctor doctor = resolveDoctor(id);

        // Validation: Identity must be APPROVED for public engagement dossier access
        if (doctor.getVerificationStatus() != VerificationStatus.APPROVED) {
            log.warn("Security Alert: Tactical lookup on unvalidated profile {}. Status={}", id, doctor.getVerificationStatus());
            throw new DoctorNotFoundException("Clinical identity not yet validated for public engagement");
        }

        return mapToProfileResponse(doctor);
    }

    /**
     * Unified Clinical Identity Resolution Protocol
     * Standardizes ID vs UserID lookups across all service modules.
     */
    private Doctor resolveDoctor(Long id) {
        return doctorRepository.findById(id)
                .or(() -> doctorRepository.findByUserId(id))
                .orElseThrow(() -> {
                    log.error("Clinical Node Identity Failure: Identity registry MISS for identifier {}", id);
                    return new DoctorNotFoundException(id);
                });
    }

    public DoctorProfileResponse getDoctorByUserId(Long userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found for user: " + userId));
        return mapToProfileResponse(doctor);
    }

    public List<DoctorProfileResponse> findPeers(Long doctorId, String specialization) {
        log.debug("Finding peers for doctor {} in specialization {}", doctorId, specialization);
        return doctorRepository.findBySpecializationAndVerificationStatus(specialization, VerificationStatus.APPROVED)
                .stream()
                .filter(d -> !d.getId().equals(doctorId))
                .map(this::mapToProfileResponse)
                .collect(Collectors.toList());
    }

    /**
     * Search doctors - PUBLIC endpoint
     * Only returns doctors with:
     * - Complete profile (specialization AND consultationFee NOT NULL)
     * - APPROVED verification status
     */
    public List<DoctorProfileResponse> searchDoctors(String specialization, BigDecimal minFee, BigDecimal maxFee) {
        log.info("Tactical clinical search initiated. Criteria: specialization={}, minFee={}, maxFee={}", 
                specialization, minFee, maxFee);

        // Fetching strictly APPROVED doctors to ensure the public registry only shows verified specialists.
        List<Doctor> approvedDoctors = doctorRepository.findByVerificationStatus(VerificationStatus.APPROVED);
        log.debug("Identified {} approved clinical nodes in valid registry.", approvedDoctors.size());

        List<Doctor> filtered = approvedDoctors.stream()
                .filter(d -> {
                    if (specialization == null || specialization.isBlank()) return true;
                    if (d.getSpecialization() == null) return false;
                    return d.getSpecialization().toLowerCase().contains(specialization.toLowerCase());
                })
                .filter(d -> {
                    if (minFee == null) return true;
                    if (d.getConsultationFee() == null) return false;
                    return d.getConsultationFee().compareTo(minFee) >= 0;
                })
                .filter(d -> {
                    if (maxFee == null) return true;
                    if (d.getConsultationFee() == null) return false;
                    return d.getConsultationFee().compareTo(maxFee) <= 0;
                })
                .collect(Collectors.toList());

        log.info("Clinical search result: {} dossiers matched the engagement criteria.", filtered.size());

        return filtered.stream()
                .map(this::mapToProfileResponse)
                .collect(Collectors.toList());
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

        List<DoctorAvailability> existingForDay = availabilityRepository.findByDoctorIdAndDayOfWeek(doctorId, request.getDayOfWeek());

        DoctorAvailability availability;
        if (existingForDay.isEmpty()) {
            availability = new DoctorAvailability();
            availability.setDoctorId(doctorId);
            availability.setDayOfWeek(request.getDayOfWeek());
        } else {
            availability = existingForDay.get(0);
            if (existingForDay.size() > 1) {
                availabilityRepository.deleteAll(existingForDay.subList(1, existingForDay.size()));
            }
        }

        availability.setStartTime(request.getStartTime());
        availability.setEndTime(request.getEndTime());
        availability.setIsActive(request.getIsActive());

        // Update doctor's global duration & buffer settings
        if (request.getSlotDuration() != null) {
            doctor.setSlotDuration(request.getSlotDuration());
        }
        if (request.getBufferTime() != null) {
            doctor.setBufferTime(request.getBufferTime());
        }
        doctorRepository.save(doctor);

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
                    createEmptyDoctorProfile(userId, null, null);
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
                    createEmptyDoctorProfile(userId, null, null);
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
     * Only returns slots if doctor is APPROVED and available.
     * Generates 30-minute slots from general or specific availability.
     */
    public List<AvailableSlotResponse> getAvailableSlots(Long doctorId, LocalDate date) {
        Doctor doctor = resolveDoctor(doctorId);
        log.info("Synchronizing availability protocol for clinical node: {} on {}", doctor.getId(), date);
        
        if (!doctor.getIsAvailable() || doctor.getVerificationStatus() != VerificationStatus.APPROVED) {
            log.warn("Tactical Check Failure: Clinical node {} is not available for public scheduling protocol", doctorId);
            return List.of();
        }

        // 1. Check if there's a schedule override for this specific date
        List<DoctorSchedule> overrides = scheduleRepository.findByDoctorIdAndDateBetween(doctor.getId(), date, date);
        if (!overrides.isEmpty()) {
            boolean dayOff = overrides.stream().anyMatch(s -> Boolean.FALSE.equals(s.getIsAvailable()));
            if (dayOff) {
                log.info("Doctor {} marked as unavailable for {}", doctorId, date);
                return List.of();
            }
            
            // If they have a specific working range for this day, generate slots from it
            return overrides.stream()
                    .filter(s -> Boolean.TRUE.equals(s.getIsAvailable()))
                    .flatMap(s -> generateDynamicSlots(date, s.getStartTime(), s.getEndTime(), doctor.getSlotDuration(), doctor.getBufferTime()).stream())
                    .collect(Collectors.toList());
        }

        // 2. If no override, use weekly general availability
        com.synapscare.doctorservice.enums.DayOfWeek dow = 
            com.synapscare.doctorservice.enums.DayOfWeek.valueOf(date.getDayOfWeek().name());
            
        List<DoctorAvailability> weeklySlots = availabilityRepository.findByDoctorIdAndDayOfWeek(doctor.getId(), dow);
        if (weeklySlots.isEmpty()) {
            log.info("No weekly availability found for node {} on {}", doctor.getId(), dow);
            return List.of();
        }

        return weeklySlots.stream()
                .filter(DoctorAvailability::getIsActive)
                .flatMap(slot -> generateDynamicSlots(date, slot.getStartTime(), slot.getEndTime(), doctor.getSlotDuration(), doctor.getBufferTime()).stream())
                .collect(Collectors.toList());
    }

    private List<AvailableSlotResponse> generateDynamicSlots(LocalDate date, java.time.LocalTime start, java.time.LocalTime end, int duration, int buffer) {
        List<AvailableSlotResponse> slots = new java.util.ArrayList<>();
        if (start == null || end == null || duration <= 0) return slots;

        java.time.LocalTime current = start;
        int totalDelta = duration + buffer;

        while (current.plusMinutes(duration).isBefore(end) || current.plusMinutes(duration).equals(end)) {
            slots.add(AvailableSlotResponse.builder()
                    .date(date)
                    .startTime(current)
                    .endTime(current.plusMinutes(duration))
                    .isAvailable(true)
                    .build());
            current = current.plusMinutes(totalDelta);
        }
        return slots;
    }

    @Transactional
    public void createEmptyDoctorProfile(Long userId, String firstName, String lastName) {
        if (doctorRepository.existsByUserId(userId)) {
            log.debug("Doctor profile already exists for userId: {}", userId);
            return;
        }

        Doctor doctor = new Doctor();
        doctor.setUserId(userId);
        doctor.setFirstName(firstName);
        doctor.setLastName(lastName);
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
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .specialization(doctor.getSpecialization())
                .qualifications(doctor.getQualifications())
                .experience(doctor.getExperience())
                .licenseNumber(doctor.getLicenseNumber())
                .consultationFee(doctor.getConsultationFee())
                .bio(doctor.getBio())
                .profileImageUrl(doctor.getProfileImageUrl())
                .licenseDocumentUrl(doctor.getLicenseDocumentUrl())
                .isAvailable(doctor.getIsAvailable())
                .verificationStatus(doctor.getVerificationStatus())
                .slotDuration(doctor.getSlotDuration())
                .bufferTime(doctor.getBufferTime())
                .verificationRejectionReason(doctor.getVerificationRejectionReason())
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
