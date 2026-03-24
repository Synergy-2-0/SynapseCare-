package com.synapscare.doctorservice.security;

import com.synapscare.doctorservice.dto.messaging.AuthValidationRequest;
import com.synapscare.doctorservice.dto.messaging.AuthValidationResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashSet;

import static com.synapscare.doctorservice.config.RabbitMQConfig.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final RabbitTemplate rabbitTemplate;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            String jwt = extractJwtFromRequest(request);

            if (jwt != null && jwtUtil.validateToken(jwt)) {
                // Validate token with auth-service via RabbitMQ
                AuthValidationRequest validationRequest = new AuthValidationRequest(jwt);

                AuthValidationResponse validationResponse = (AuthValidationResponse) rabbitTemplate
                        .convertSendAndReceive(
                                AUTH_EXCHANGE,
                                AUTH_VALIDATION_ROUTING_KEY,
                                validationRequest
                        );

                if (validationResponse != null && validationResponse.isValid()) {
                    UserPrincipal userPrincipal = new UserPrincipal(
                            validationResponse.getUserId(),
                            validationResponse.getUsername(),
                            validationResponse.getEmail(),
                            validationResponse.getRoles() != null ? validationResponse.getRoles() : new HashSet<>()
                    );

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userPrincipal,
                                    null,
                                    userPrincipal.getAuthorities()
                            );

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    log.warn("Token validation failed: {}", validationResponse != null ? validationResponse.getMessage() : "No response");
                }
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
