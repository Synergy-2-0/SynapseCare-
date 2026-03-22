package com.synapscare.org.service;

import com.synapscare.org.dto.request.ChangePasswordRequest;
import com.synapscare.org.dto.request.UpdateProfileRequest;
import com.synapscare.org.entity.User;
import com.synapscare.org.exception.BadRequestException;
import com.synapscare.org.exception.ResourceNotFoundException;
import com.synapscare.org.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.synapscare.org.dto.response.*;

import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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
        return userRepository.findByRoleAndIsVerifiedAndIsActiveAndIsDeletedFalse(User.Role.DOCTOR, true, true)
                .stream()
                .map(UserResponse::fromUser)
                .collect(Collectors.toList());
    }

    public UserResponse getVerifiedDoctorById(Long doctorId) {
        User doctor = userRepository.findByIdAndRoleAndIsVerifiedAndIsActiveAndIsDeletedFalse(
                        doctorId,
                        User.Role.DOCTOR,
                        true,
                        true)
                .orElseThrow(() -> new ResourceNotFoundException("Verified doctor not found with id: " + doctorId));
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

    @Transactional
    public UserResponse verifyDoctor(Long doctorId) {
        User doctor = userRepository.findByIdAndIsDeletedFalse(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        if (doctor.getRole() != User.Role.DOCTOR) {
            throw new BadRequestException("User is not a doctor");
        }

        doctor.setIsVerified(true);
        return UserResponse.fromUser(userRepository.save(doctor));
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
        return userRepository.findByRoleAndIsVerifiedAndIsDeletedFalse(User.Role.DOCTOR, false)
                .stream()
                .map(UserResponse::fromUser)
                .collect(Collectors.toList());
    }
}