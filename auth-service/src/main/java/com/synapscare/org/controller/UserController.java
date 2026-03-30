package com.synapscare.org.controller;

import com.synapscare.org.dto.request.ChangePasswordRequest;
import com.synapscare.org.dto.request.UpdateProfileRequest;
import com.synapscare.org.dto.response.UserResponse;
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
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/users/me  – Get own profile
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(userService.getUserById(currentUser.getId()));
    }

    // PUT /api/users/me  – Update own profile
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMyProfile(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(currentUser.getId(), request));
    }

    // PUT /api/users/me/password  – Change own password
    @PutMapping("/me/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(currentUser.getId(), request);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    // GET /api/users/doctors  – Browse verified doctors (accessible to all logged-in users)
    @GetMapping("/doctors")
    public ResponseEntity<List<UserResponse>> getDoctors() {
        return ResponseEntity.ok(userService.getVerifiedDoctors());
    }

    // GET /api/users/doctors/{id}  – Get a specific doctor's public profile
    @GetMapping("/doctors/{id}")
    public ResponseEntity<UserResponse> getDoctorById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(userService.getVerifiedDoctorById(id));
    }

    // GET /api/users/{id}  – Get any user by ID (Doctor or Admin only)
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
}
