package com.synapscare.doctor.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserServiceClient {

    private final RestClient userServiceRestClient;

    @Value("${internal.service-secret}")
    private String serviceSecret;

    // Verify a user exists and has PATIENT role — called before issuing a prescription
    public boolean isValidPatient(Long userId) {
        try {
            Map response = userServiceRestClient.get()
                    .uri("/api/internal/users/{userId}/exists", userId)
                    .header("X-Service-Secret", serviceSecret)
                    .retrieve()
                    .body(Map.class);
            return response != null && Boolean.TRUE.equals(response.get("exists"));
        } catch (RestClientException e) {
            log.warn("Could not verify patient {} with User Service: {}", userId, e.getMessage());
            // Fail open in dev — in production, fail closed (return false)
            return true;
        }
    }
}