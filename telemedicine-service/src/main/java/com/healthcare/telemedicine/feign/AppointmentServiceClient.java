package com.healthcare.telemedicine.feign;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentServiceClient {

    private final RestTemplate restTemplate;

    @Value("${services.appointment.url}")
    private String appointmentServiceUrl;

    @Value("${telemedicine.stub-mode:true}")
    private boolean stubMode;

    /**
     * Get appointment details by ID
     */
    public Map<String, Object> getAppointment(Long appointmentId) {
        if (stubMode) {
            log.info("Stub mode enabled - skipping appointment service call for appointment: {}", appointmentId);
            return createStubAppointment(appointmentId);
        }

        try {
            String url = appointmentServiceUrl + "/api/v1/appointments/" + appointmentId;
            log.debug("Fetching appointment from: {}", url);
            
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
            
            log.warn("Failed to fetch appointment {}: status {}", appointmentId, response.getStatusCode());
            return null;
            
        } catch (Exception e) {
            log.error("Error fetching appointment {}: {}", appointmentId, e.getMessage());
            return null;
        }
    }

    /**
     * Update appointment status
     */
    public boolean updateAppointmentStatus(Long appointmentId, String status) {
        if (stubMode) {
            log.info("Stub mode enabled - skipping appointment status update for appointment: {} to status: {}", 
                    appointmentId, status);
            return true;
        }

        try {
            String url = appointmentServiceUrl + "/api/v1/appointments/" + appointmentId;
            log.debug("Updating appointment status at: {}", url);
            
            Map<String, Object> updateRequest = new HashMap<>();
            updateRequest.put("status", status);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(updateRequest);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.PATCH, request, Map.class);
            
            boolean success = response.getStatusCode().is2xxSuccessful();
            if (!success) {
                log.warn("Failed to update appointment {} status to {}: status {}", 
                        appointmentId, status, response.getStatusCode());
            }
            return success;
            
        } catch (Exception e) {
            log.error("Error updating appointment {} status to {}: {}", appointmentId, status, e.getMessage());
            return false;
        }
    }

    /**
     * Create stub appointment for testing
     */
    private Map<String, Object> createStubAppointment(Long appointmentId) {
        Map<String, Object> stubAppointment = new HashMap<>();
        stubAppointment.put("id", appointmentId);
        stubAppointment.put("type", "TELEMEDICINE");
        stubAppointment.put("status", "CONFIRMED");
        return stubAppointment;
    }
}
