package com.healthcare.notification.service;

import lombok.RequiredArgsConstructor;
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
 * Service for sending SMS notifications
 * Currently implements mock mode for development
 * Can be extended to integrate with Twilio, Vonage, or local SMS gateways
 */
@Service
@Slf4j
public class SmsService {

    @Value("${app.notification.sms.enabled:true}")
    private boolean smsEnabled;

    @Value("${textbee.api-key:}")
    private String apiKey;

    private static final String TEXTBEE_API_URL = "https://api.textbee.dev/api/v1/gateway/devices/%s/send-sms";

    @Value("${textbee.device-id:}")
    private String deviceId;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Send an SMS notification via TextBee.dev
     */
    @Async
    public void sendSms(String phoneNumber, String message) {
        if (!smsEnabled) {
            log.info("SMS notifications disabled. Would have sent to: {}", phoneNumber);
            return;
        }

        if (apiKey == null || apiKey.isEmpty() || deviceId == null || deviceId.isEmpty()) {
            log.warn("TextBee credentials missing. SMS won't be sent.");
            return;
        }

        try {
            String url = String.format(TEXTBEE_API_URL, deviceId);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", apiKey);
            
            Map<String, Object> body = new HashMap<>();
            body.put("recipients", new String[]{phoneNumber});
            body.put("message", message);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            
            var response = restTemplate.postForEntity(url, request, Map.class);
            
            log.info("SMS (TextBee) dispatched successfully to {}. Response: {}", phoneNumber, response.getBody());
        } catch (Exception e) {
            log.error("CRITICAL: Failed to send SMS via TextBee to {}: {}", phoneNumber, e.getMessage());
        }
    }

    /**
     * Send appointment reminder SMS
     */
    public void sendAppointmentReminderSms(String phoneNumber, String patientName, 
            String doctorName, String appointmentDate, String appointmentTime) {
        String message = String.format(
            "SynapseCare Reminder: Hi %s, your appointment with Dr. %s is scheduled for %s at %s. Reply HELP for assistance.",
            patientName, doctorName, appointmentDate, appointmentTime
        );
        sendSms(phoneNumber, message);
    }

    /**
     * Send appointment confirmation SMS
     */
    public void sendAppointmentConfirmationSms(String phoneNumber, String patientName, 
            Long appointmentId, String appointmentDate, String appointmentTime) {
        String message = String.format(
            "SynapseCare: Hi %s, your appointment #%d is confirmed for %s at %s. Log in to view details.",
            patientName, appointmentId, appointmentDate, appointmentTime
        );
        sendSms(phoneNumber, message);
    }

    /**
     * Send prescription ready SMS
     */
    public void sendPrescriptionReadySms(String phoneNumber, String patientName, Long appointmentId) {
        String message = String.format(
            "SynapseCare: Hi %s, a new prescription for appointment #%d is ready. View it in your patient dashboard.",
            patientName, appointmentId
        );
        sendSms(phoneNumber, message);
    }

    /**
     * Send telemedicine session reminder SMS
     */
    public void sendTelemedicineReminderSms(String phoneNumber, String name, String scheduledTime) {
        String message = String.format(
            "SynapseCare: Hi %s, your telemedicine session starts at %s. Log in to join the video call.",
            name, scheduledTime
        );
        sendSms(phoneNumber, message);
    }

    /**
     * Send payment confirmation SMS
     */
    public void sendPaymentConfirmationSms(String phoneNumber, String patientName, String amount) {
        String message = String.format(
            "SynapseCare: Hi %s, your payment of %s has been received. Thank you!",
            patientName, amount
        );
        sendSms(phoneNumber, message);
    }

}
