package com.synapscare.org.controller;

import com.synapscare.org.dto.request.DoctorRegisterRequest;
import com.synapscare.org.dto.request.LoginRequest;
import com.synapscare.org.dto.request.PatientRegisterRequest;
import com.synapscare.org.dto.request.TokenRefreshRequest;
import com.synapscare.org.dto.response.AuthResponse;
import com.synapscare.org.security.UserDetailsImpl;
import com.synapscare.org.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // POST /api/auth/register/patient
    @PostMapping("/register/patient")
    public ResponseEntity<AuthResponse> registerPatient(
            @Valid @RequestBody PatientRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.registerPatient(request));
    }

    // POST /api/auth/register/doctor
    @PostMapping("/register/doctor")
    public ResponseEntity<AuthResponse> registerDoctor(
            @Valid @RequestBody DoctorRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.registerDoctor(request));
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // POST /api/auth/refresh
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(
            @Valid @RequestBody TokenRefreshRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    // POST /api/auth/logout
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        authService.logout(currentUser.getId());
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
