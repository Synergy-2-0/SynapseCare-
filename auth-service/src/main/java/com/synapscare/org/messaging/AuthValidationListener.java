package com.synapscare.org.messaging;

import com.synapscare.org.dto.messaging.AuthValidationRequest;
import com.synapscare.org.dto.messaging.AuthValidationResponse;
import com.synapscare.org.entity.User;
import com.synapscare.org.repository.UserRepository;
import com.synapscare.org.security.JwtUtils;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Set;

import static com.synapscare.org.config.RabbitMQConfig.AUTH_VALIDATION_QUEUE;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthValidationListener {

    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    @RabbitListener(queues = AUTH_VALIDATION_QUEUE)
    public AuthValidationResponse handleAuthValidation(AuthValidationRequest request) {
        log.info("Received auth validation request");

        try {
            String token = request.getToken();

            if (token == null || !jwtUtils.validateToken(token)) {
                return AuthValidationResponse.builder()
                        .valid(false)
                        .message("Invalid or expired token")
                        .build();
            }

            Claims claims = jwtUtils.extractClaims(token);
            String email = claims.getSubject();
            Long userId = claims.get("userId", Long.class);

            User user = userRepository.findByEmailAndIsDeletedFalse(email)
                    .orElse(null);

            if (user == null || !user.getIsActive()) {
                return AuthValidationResponse.builder()
                        .valid(false)
                        .message("User not found or inactive")
                        .build();
            }

            return AuthValidationResponse.builder()
                    .valid(true)
                    .userId(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .roles(Set.of(user.getRole().name()))
                    .message("Token validated successfully")
                    .build();

        } catch (Exception e) {
            log.error("Error validating token: {}", e.getMessage());
            return AuthValidationResponse.builder()
                    .valid(false)
                    .message("Token validation failed: " + e.getMessage())
                    .build();
        }
    }
}
