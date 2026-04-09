package com.healthcare.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Service for sending WhatsApp notifications via UltraMsg
 */
@Service
@Slf4j
public class WhatsAppService {

    @Value("${app.notification.whatsapp.enabled:true}")
    private boolean whatsappEnabled;

    @Value("${app.notification.whatsapp.mock:true}")
    private boolean mockMode;

    @Value("${ultramsg.instance-id:}")
    private String instanceId;

    @Value("${ultramsg.token:}")
    private String token;

    @Value("${ultramsg.api-url:https://api.ultramsg.com/instance168773/}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Send a WhatsApp notification via UltraMsg
     */
    @Async
    public void sendWhatsApp(String phoneNumber, String message) {
        if (!whatsappEnabled) {
            log.info("WhatsApp notifications disabled. Would have sent to: {}", phoneNumber);
            return;
        }

        if (mockMode || token == null || token.isEmpty()) {
            logMockWhatsApp(phoneNumber, message);
            return;
        }

        try {
            // Clean phone number (remove +, spaces, etc.)
            String cleanPhone = phoneNumber.replaceAll("[^0-9]", "");
            
            String chatUrl = apiUrl + "messages/chat";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, String> body = new HashMap<>();
            body.put("token", token);
            body.put("to", cleanPhone);
            body.put("body", message);
            
            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
            
            restTemplate.postForEntity(chatUrl, request, String.class);
            
            log.info("WhatsApp (UltraMsg) message successfully sent to: {}", phoneNumber);
        } catch (Exception e) {
            log.error("CRITICAL: Failed to send WhatsApp message to {}: {}", phoneNumber, e.getMessage());
        }
    }

    /**
     * Send appointment reminder WhatsApp
     */
    public void sendAppointmentReminder(String phoneNumber, String patientName, 
            String doctorName, String appointmentDate, String appointmentTime) {
        String message = String.format(
            "SynapseCare: Hi %s, your appointment with Dr. %s is scheduled for %s at %s. Click to join: https://synapcare.com/dashboard",
            patientName, doctorName, appointmentDate, appointmentTime
        );
        sendWhatsApp(phoneNumber, message);
    }

    /**
     * Send appointment confirmation WhatsApp
     */
    public void sendAppointmentConfirmation(String phoneNumber, String patientName, 
            Long appointmentId, String appointmentDate, String appointmentTime) {
        String message = String.format(
            "SynapseCare: Hi %s, your appointment #%d is confirmed for %s at %s. View details: https://synapcare.com/appointments/%d",
            patientName, appointmentId, appointmentDate, appointmentTime, appointmentId
        );
        sendWhatsApp(phoneNumber, message);
    }

    /**
     * Send prescription ready WhatsApp
     */
    public void sendPrescriptionReady(String phoneNumber, String patientName, Long appointmentId) {
        String message = String.format(
            "SynapseCare: Hi %s, your prescription for appointment #%d is ready. View it here: https://synapcare.com/prescriptions",
            patientName, appointmentId
        );
        sendWhatsApp(phoneNumber, message);
    }

    private void logMockWhatsApp(String phoneNumber, String message) {
        log.info("═══════════════════════════════════════════════════════════════");
        log.info("💹 [MOCK WHATSAPP]");
        log.info("To: {}", phoneNumber);
        log.info("Message: {}", message);
        log.info("═══════════════════════════════════════════════════════════════");
    }
}
