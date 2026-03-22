package com.synapscare.org.controller;

import com.synapscare.org.dto.response.UserResponse;
import com.synapscare.org.entity.User;
import com.synapscare.org.exception.BadRequestException;
import com.synapscare.org.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    public ResponseEntity<List<UserResponse>> getUsersByRole(@PathVariable String role) {
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
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getNonAdminUserById(id));
    }

    // GET /api/admin/doctors/pending  – List unverified doctors
    @GetMapping("/doctors/pending")
    public ResponseEntity<List<UserResponse>> getPendingDoctors() {
        return ResponseEntity.ok(userService.getPendingDoctors());
    }

    // PUT /api/admin/doctors/{id}/verify  – Approve a doctor registration
    @PutMapping("/doctors/{id}/verify")
    public ResponseEntity<UserResponse> verifyDoctor(@PathVariable Long id) {
        return ResponseEntity.ok(userService.verifyDoctor(id));
    }

    // PUT /api/admin/users/{id}/toggle-status  – Activate or deactivate a user
    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<UserResponse> toggleUserStatus(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleUserStatus(id));
    }

    // DELETE /api/admin/users/{id}  – Delete a user account
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
}
