package com.synapscare.org.service;

import com.synapscare.org.dto.request.DoctorRegisterRequest;
import com.synapscare.org.dto.request.LoginRequest;
import com.synapscare.org.dto.request.PatientRegisterRequest;
import com.synapscare.org.dto.request.TokenRefreshRequest;
import com.synapscare.org.dto.response.AuthResponse;
import com.synapscare.org.dto.response.UserResponse;
import com.synapscare.org.entity.RefreshToken;
import com.synapscare.org.entity.User;
import com.synapscare.org.exception.BadRequestException;
import com.synapscare.org.exception.DuplicateResourceException;
import com.synapscare.org.exception.ResourceNotFoundException;
import com.synapscare.org.exception.TokenRefreshException;
import com.synapscare.org.exception.UnauthorizedAccessException;
import com.synapscare.org.repository.RefreshTokenRepository;
import com.synapscare.org.repository.UserRepository;
import com.synapscare.org.security.JwtConfig;
import com.synapscare.org.security.JwtUtils;
import com.synapscare.org.security.UserDetailsImpl;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final JwtConfig jwtConfig;

    @Transactional
    public AuthResponse registerPatient(PatientRegisterRequest request) {
        validateUniqueUser(request.getEmail(), request.getUsername());

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phoneNumber(request.getPhoneNumber())
                .role(User.Role.PATIENT)
                .isActive(true)
                .isVerified(true)
                .build();

        User savedUser = userRepository.save(user);
        return buildAuthResponse(UserDetailsImpl.build(savedUser), savedUser);
    }

    @Transactional
    public AuthResponse registerDoctor(DoctorRegisterRequest request) {
        validateUniqueUser(request.getEmail(), request.getUsername());

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phoneNumber(request.getPhoneNumber())
                .role(User.Role.DOCTOR)
                .isActive(true)
                .isVerified(false)
                .build();

        User savedUser = userRepository.save(user);
        return buildAuthResponse(UserDetailsImpl.build(savedUser), savedUser);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User userByEmail = userRepository.findByEmailAndIsDeletedFalse(request.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findByIdAndIsDeletedFalse(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userDetails.getId()));

        if (!user.getId().equals(userByEmail.getId())) {
            throw new ResourceNotFoundException("User mismatch for email: " + request.getEmail());
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new UnauthorizedAccessException("User account is deactivated");
        }

        if (user.getRole() == User.Role.DOCTOR && !Boolean.TRUE.equals(user.getIsVerified())) {
            throw new BadRequestException("Doctor account is pending verification");
        }

        return buildAuthResponse(userDetails, user);
    }

    @Transactional
    public AuthResponse refreshToken(TokenRefreshRequest request) {
        String requestToken = request.getRefreshToken();

        RefreshToken refreshToken = refreshTokenRepository.findByToken(requestToken)
                .orElseThrow(() -> new TokenRefreshException(requestToken, "Refresh token not found"));

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new TokenRefreshException(requestToken, "Refresh token has expired. Please log in again");
        }

        User user = refreshToken.getUser();
        if (Boolean.TRUE.equals(user.getIsDeleted()) || !Boolean.TRUE.equals(user.getIsActive())) {
            refreshTokenRepository.delete(refreshToken);
            throw new TokenRefreshException(requestToken, "User is inactive or deleted. Please log in again");
        }
        String accessToken = jwtUtils.generateToken(UserDetailsImpl.build(user));

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(requestToken)
                .user(UserResponse.fromUser(user))
                .build();
    }

    @Transactional
    public void logout(Long userId) {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        refreshTokenRepository.deleteByUser(user);
        log.info("User logged out: {}", user.getEmail());
    }

    private AuthResponse buildAuthResponse(UserDetailsImpl userDetails, User user) {
        String accessToken = jwtUtils.generateToken(userDetails);
        String refreshToken = createRefreshToken(user).getToken();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(UserResponse.fromUser(user))
                .build();
    }

    private RefreshToken createRefreshToken(User user) {
        return refreshTokenRepository.findByUser(user)
                .map(existing -> {
                    existing.setToken(UUID.randomUUID().toString());
                    existing.setExpiryDate(Instant.now().plusMillis(jwtConfig.getRefreshExpirationMs()));
                    return refreshTokenRepository.save(existing);
                })
                .orElseGet(() -> {
                    RefreshToken refreshToken = RefreshToken.builder()
                            .user(user)
                            .token(UUID.randomUUID().toString())
                            .expiryDate(Instant.now().plusMillis(jwtConfig.getRefreshExpirationMs()))
                            .build();
                    return refreshTokenRepository.save(refreshToken);
                });
    }

    private void validateUniqueUser(String email, String username) {
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email is already in use");
        }

        if (userRepository.existsByUsername(username)) {
            throw new DuplicateResourceException("Username is already in use");
        }
    }

}
