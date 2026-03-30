package com.synapscare.org.controller;

import com.synapscare.org.dto.request.DoctorVerificationRequest;
import com.synapscare.org.dto.response.UserResponse;
import com.synapscare.org.entity.User;
import com.synapscare.org.exception.BadRequestException;
import com.synapscare.org.security.UserDetailsImpl;
import com.synapscare.org.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;

    // GET /api/admin/users  – List all users
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // GET /api/admin/users/role/{role}  – List users by role
    @GetMapping("/users/role/{role}")
    public ResponseEntity<List<UserResponse>> getUsersByRole(@PathVariable("role") String role) {
        User.Role userRole;
        try {
            userRole = User.Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid role: " + role);
        }
        return ResponseEntity.ok(userService.getUsersByRole(userRole));
    }

    // GET /api/admin/users/{id}  – Get user by ID
    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(userService.getNonAdminUserById(id));
    }

    // GET /api/admin/doctors/pending  – List unverified doctors
    @GetMapping("/doctors/pending")
    public ResponseEntity<List<UserResponse>> getPendingDoctors() {
        return ResponseEntity.ok(userService.getPendingDoctors());
    }

    // PUT /api/admin/doctors/{id}/verify  – Approve or reject a doctor registration
    /**
     * SOURCE OF TRUTH endpoint for doctor verification.
     * This method updates the verification status in auth-service and publishes
     * an event to notify doctor-service and other services.
     *
     * @param id the doctor's user ID
     * @param request verification request containing status (APPROVED/REJECTED) and optional rejection reason.
     *                If not provided, defaults to APPROVED for backward compatibility.
     * @param principal the authenticated admin user
     * @return the updated user response
     */
    @PutMapping("/doctors/{id}/verify")
    public ResponseEntity<UserResponse> verifyDoctor(
            @PathVariable("id") Long id,
            @Valid @RequestBody(required = false) DoctorVerificationRequest request,
            @AuthenticationPrincipal UserDetailsImpl principal
    ) {
        String adminUsername = principal.getUsername();

        // Backward compatibility: if no body provided, default to APPROVED
        if (request == null) {
            request = new DoctorVerificationRequest("APPROVED", null);
        }

        return ResponseEntity.ok(userService.verifyDoctor(id, request, adminUsername));
    }

    // PUT /api/admin/users/{id}/toggle-status  – Activate or deactivate a user
    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<UserResponse> toggleUserStatus(@PathVariable("id") Long id) {
        return ResponseEntity.ok(userService.toggleUserStatus(id));
    }

    // DELETE /api/admin/users/{id}  – Delete a user account
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable("id") Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
}
