package com.synapscare.org.service;

import com.synapscare.org.dto.messaging.DoctorVerificationEvent;
import com.synapscare.org.dto.request.ChangePasswordRequest;
import com.synapscare.org.dto.request.DoctorVerificationRequest;
import com.synapscare.org.dto.request.UpdateProfileRequest;
import com.synapscare.org.entity.User;
import com.synapscare.org.enums.VerificationStatus;
import com.synapscare.org.exception.BadRequestException;
import com.synapscare.org.exception.ResourceNotFoundException;
import com.synapscare.org.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.synapscare.org.dto.response.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import static com.synapscare.org.config.RabbitMQConfig.USER_DOCTOR_VERIFIED_ROUTING_KEY;
import static com.synapscare.org.config.RabbitMQConfig.USER_EXCHANGE;


@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RabbitTemplate rabbitTemplate;

    // ─── Get User By ID ───────────────────────────────────────────────────────

    public UserResponse getUserById(Long id) {
        User user = userRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserResponse.fromUser(user);
    }

    public UserResponse getNonAdminUserById(Long id) {
        User user = userRepository.findByIdAndRoleNotAndIsDeletedFalse(id, User.Role.ADMIN)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserResponse.fromUser(user);
    }

    // ─── Update Profile ───────────────────────────────────────────────────────

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());

        return UserResponse.fromUser(userRepository.save(user));
    }

    // ─── Change Password ──────────────────────────────────────────────────────

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for user: {}", user.getEmail());
    }

    // ─── Get All Doctors (for patient browsing) ───────────────────────────────

    public List<UserResponse> getVerifiedDoctors() {
        // Updated to use new verification status field
        return userRepository.findByRoleAndIsActiveAndIsDeletedFalse(User.Role.DOCTOR, true)
                .stream()
                .filter(user -> user.getVerificationStatus() == VerificationStatus.APPROVED)
                .map(UserResponse::fromUser)
                .collect(Collectors.toList());
    }

    public UserResponse getVerifiedDoctorById(Long doctorId) {
        // Updated to use new verification status field
        User doctor = userRepository.findByIdAndRoleAndIsActiveAndIsDeletedFalse(
                        doctorId,
                        User.Role.DOCTOR,
                        true)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        if (doctor.getVerificationStatus() != VerificationStatus.APPROVED) {
            throw new ResourceNotFoundException("Verified doctor not found with id: " + doctorId);
        }

        return UserResponse.fromUser(doctor);
    }

    // ─── Admin: Get All Users ─────────────────────────────────────────────────

    public List<UserResponse> getAllUsers() {
        return userRepository.findByRoleNotAndIsDeletedFalse(User.Role.ADMIN)
                .stream()
                .map(UserResponse::fromUser)
                .collect(Collectors.toList());
    }

    // ─── Admin: Get All Users By Role ─────────────────────────────────────────

    public List<UserResponse> getUsersByRole(User.Role role) {
        if (role == User.Role.ADMIN) {
            return List.of();
        }

        return userRepository.findByRoleAndIsDeletedFalse(role)
                .stream()
                .map(UserResponse::fromUser)
                .collect(Collectors.toList());
    }

    // ─── Admin: Verify Doctor ─────────────────────────────────────────────────
    /**
     * SOURCE OF TRUTH for doctor verification.
     * Only this method should change doctor verification status.
     * Publishes DoctorVerificationEvent to notify other services (doctor-service, notification-service, etc.)
     */
    @Transactional
    public UserResponse verifyDoctor(Long doctorId, DoctorVerificationRequest request, String adminUsername) {
        log.info("Processing doctor verification: doctorId={}, status={}, admin={}",
                doctorId, request.getStatus(), adminUsername);

        // Validate request
        request.validate();

        User doctor = userRepository.findByIdAndIsDeletedFalse(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        if (doctor.getRole() != User.Role.DOCTOR) {
            log.error("User {} is not a doctor (role: {})", doctorId, doctor.getRole());
            throw new BadRequestException("User is not a doctor");
        }

        VerificationStatus newStatus;
        try {
            newStatus = VerificationStatus.valueOf(request.getStatus());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid verification status: " + request.getStatus());
        }

        // Check if already in the requested status
        if (doctor.getVerificationStatus() == newStatus) {
            log.warn("Doctor {} is already in status {}", doctorId, newStatus);
            return UserResponse.fromUser(doctor);
        }

        VerificationStatus oldStatus = doctor.getVerificationStatus();

        // Update verification status (SOURCE OF TRUTH)
        doctor.setVerificationStatus(newStatus);
        doctor.setVerificationRejectionReason(request.getRejectionReason());

        // Update legacy isVerified field for backward compatibility
        doctor.setIsVerified(newStatus == VerificationStatus.APPROVED);

        User savedDoctor = userRepository.save(doctor);
        log.info("Doctor {} verification updated: {} -> {}", doctorId, oldStatus, newStatus);

        // Publish verification event with comprehensive error handling
        publishVerificationEvent(savedDoctor, adminUsername);

        return UserResponse.fromUser(savedDoctor);
    }

    private void publishVerificationEvent(User doctor, String verifiedBy) {
        try {
            DoctorVerificationEvent event = DoctorVerificationEvent.builder()
                    .userId(doctor.getId())
                    .status(doctor.getVerificationStatus().name())
                    .rejectionReason(doctor.getVerificationRejectionReason())
                    .verifiedBy(verifiedBy)
                    .verifiedAt(LocalDateTime.now())
                    .build();

            rabbitTemplate.convertAndSend(
                    USER_EXCHANGE,
                    USER_DOCTOR_VERIFIED_ROUTING_KEY,
                    event
            );

            log.info("Published DoctorVerificationEvent: userId={}, status={}",
                    doctor.getId(), doctor.getVerificationStatus());
        } catch (Exception e) {
            log.error("CRITICAL: Failed to publish verification event for userId: {}. " +
                     "Doctor verification status in auth-service will be out of sync with doctor-service!",
                     doctor.getId(), e);
            // TODO: Implement transactional outbox pattern or store in dead letter queue
            // For now, we log the error but don't fail the verification
            // This means auth-service is still the source of truth but other services might be stale
        }
    }

    // ─── Admin: Toggle User Active Status ────────────────────────────────────

    @Transactional
    public UserResponse toggleUserStatus(Long userId) {
        User user = userRepository.findByIdAndRoleNotAndIsDeletedFalse(userId, User.Role.ADMIN)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setIsActive(!user.getIsActive());
        log.info("User {} status toggled to: {}", user.getEmail(), user.getIsActive());
        return UserResponse.fromUser(userRepository.save(user));
    }

    // ─── Admin: Delete User (Soft Delete) ───────────────────────────────────

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findByIdAndRoleNotAndIsDeletedFalse(userId, User.Role.ADMIN)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setIsActive(false);
        user.setIsVerified(false);
        user.setIsDeleted(true);
        userRepository.save(user);
        log.info("User soft-deleted (deactivated): {}", userId);
    }

    // ─── Get Unverified Doctors (Admin) ──────────────────────────────────────

    public List<UserResponse> getPendingDoctors() {
        // Updated to use new verification status field
        return userRepository.findByRoleAndIsDeletedFalse(User.Role.DOCTOR)
                .stream()
                .filter(user -> user.getVerificationStatus() == VerificationStatus.PENDING)
                .map(UserResponse::fromUser)
                .collect(Collectors.toList());
    }
}