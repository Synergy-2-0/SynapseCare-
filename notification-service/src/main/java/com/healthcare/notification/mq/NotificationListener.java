package com.healthcare.notification.mq;

import com.healthcare.notification.service.EmailService;
import com.healthcare.notification.service.NotificationService;
import com.healthcare.notification.service.SmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * RabbitMQ listener for processing notification events from various services
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationListener {

    private final NotificationService notificationService;
    private final EmailService emailService;
    private final SmsService smsService;

    /**
     * Handle general notification events (Payment Success, Password Reset, etc.)
     */
    @RabbitListener(queues = "notification.queue")
    public void handleGeneralNotification(Map<String, Object> event) {
        log.info("📧 General Notification Event received: {}", event);
        try {
            String type = extractString(event, "type");
            
            if ("PASSWORD_RESET".equals(type)) {
                handlePasswordReset(event);
            } else {
                // Default to payment success for existing events without explicit type
                handlePaymentSuccess(event);
            }
        } catch (Exception e) {
            log.error("❌ Failed to process notification event: {}", e.getMessage(), e);
        }
    }

    private void handlePasswordReset(Map<String, Object> event) {
        String email = extractString(event, "email");
        String token = extractString(event, "token");
        String firstName = extractString(event, "firstName");
        Long userId = extractLong(event, "userId");

        // Send via Email Service
        if (email != null && !email.isEmpty()) {
            emailService.sendPasswordResetEmail(email, firstName != null ? firstName : "Patient", token);
        }

        // Also record as IN_APP notification
        notificationService.sendNotification(userId, null, "PASSWORD_RESET", 
                "Password Reset Requested", "A password reset link has been sent to your email.", 
                "IN_APP", email, null, null);

        log.info("✅ Password reset notification processed for user {}", email);
    }

    private void handlePaymentSuccess(Map<String, Object> event) {
        try {
            Long appointmentId = extractLong(event, "appointmentId");
            String paymentId = extractString(event, "paymentId");
            Long userId = extractLong(event, "userId");
            String patientEmail = extractString(event, "patientEmail");
            String patientName = extractString(event, "patientName");
            String amount = extractString(event, "amount");
            String patientPhone = extractString(event, "patientPhone");

            String title = "Payment Successful";
            String message = String.format("Your payment of %s for appointment #%d has been successfully processed. Payment ID: %s",
                    amount != null ? amount : "consultation fee", appointmentId, paymentId);

            // Send notification via all channels
            notificationService.sendNotification(userId, appointmentId, "PAYMENT_SUCCESS", title, message, 
                    "ALL", patientEmail, patientPhone, "/patient/appointments/" + appointmentId);

            // Send formatted email if email is available
            if (patientEmail != null && !patientEmail.isEmpty()) {
                emailService.sendPaymentSuccessEmail(patientEmail, 
                        patientName != null ? patientName : "Patient", 
                        appointmentId, 
                        amount != null ? amount : "N/A", 
                        paymentId);
            }

            log.info("✅ Payment success notification sent for appointment {}", appointmentId);
        } catch (Exception e) {
            log.error("❌ Failed to process payment success logic: {}", e.getMessage(), e);
        }
    }

    /**
     * Handle payment failed events
     */
    @RabbitListener(queues = "notification.payment.failed.queue")
    public void handlePaymentFailed(Map<String, Object> event) {
        log.info("📧 Payment Failed Event received: {}", event);
        try {
            Long appointmentId = extractLong(event, "appointmentId");
            String reason = extractString(event, "reason");
            Long userId = extractLong(event, "userId");
            String patientEmail = extractString(event, "patientEmail");

            String title = "Payment Failed";
            String message = String.format("Your payment for appointment #%d could not be processed. Reason: %s. Please try again.",
                    appointmentId, reason != null ? reason : "Unknown error");

            notificationService.sendNotification(userId, appointmentId, "PAYMENT_FAILED", title, message, 
                    "IN_APP", patientEmail, null, "/patient/appointments/" + appointmentId + "/payment");

            log.info("✅ Payment failed notification sent for appointment {}", appointmentId);
        } catch (Exception e) {
            log.error("❌ Failed to process payment failed event: {}", e.getMessage(), e);
        }
    }

    /**
     * Handle appointment events (booked, confirmed, cancelled)
     */
    @RabbitListener(queues = "appointment.notification.queue")
    public void handleAppointmentEvent(Map<String, Object> event) {
        log.info("📧 Appointment Event received: {}", event);
        try {
            String eventType = extractString(event, "eventType");
            Long appointmentId = extractLong(event, "appointmentId");
            Long userId = extractLong(event, "userId");
            Long patientId = extractLong(event, "patientId");
            String patientEmail = extractString(event, "patientEmail");
            String patientPhone = extractString(event, "patientPhone");
            String patientName = extractString(event, "patientName");
            String doctorName = extractString(event, "doctorName");
            String date = extractString(event, "date");
            String time = extractString(event, "time");
            String meetingLink = extractString(event, "meetingLink");

            // Use patientId as userId if userId not provided
            if (userId == null) userId = patientId;

            switch (eventType) {
                case "APPOINTMENT_BOOKED" -> handleAppointmentBooked(
                        appointmentId, userId, patientEmail, patientPhone, patientName, 
                        doctorName, date, time);
                
                case "APPOINTMENT_CONFIRMED" -> handleAppointmentConfirmed(
                        appointmentId, userId, patientEmail, patientPhone, patientName, 
                        doctorName, date, time, meetingLink);
                
                case "APPOINTMENT_CANCELLED" -> handleAppointmentCancelled(
                        appointmentId, userId, patientEmail, patientName, doctorName, date, time,
                        extractString(event, "reason"));
                
                case "APPOINTMENT_REMINDER" -> handleAppointmentReminder(
                        appointmentId, userId, patientEmail, patientPhone, patientName, 
                        doctorName, date, time, meetingLink);
                
                default -> log.warn("Unknown appointment event type: {}", eventType);
            }
        } catch (Exception e) {
            log.error("❌ Failed to process appointment event: {}", e.getMessage(), e);
        }
    }

    private void handleAppointmentBooked(Long appointmentId, Long userId, String email, String phone,
            String patientName, String doctorName, String date, String time) {
        String title = "Appointment Booked";
        String message = String.format("Your appointment with Dr. %s on %s at %s has been booked. Awaiting confirmation.",
                doctorName != null ? doctorName : "your doctor", date, time);

        notificationService.sendNotification(userId, appointmentId, "APPOINTMENT_BOOKED", title, message, 
                "IN_APP", email, null, "/patient/appointments/" + appointmentId);

        log.info("✅ Appointment booked notification sent for appointment {}", appointmentId);
    }

    private void handleAppointmentConfirmed(Long appointmentId, Long userId, String email, String phone,
            String patientName, String doctorName, String date, String time, String meetingLink) {
        String title = "Appointment Confirmed";
        String message = String.format("Your appointment #%d with Dr. %s is confirmed for %s at %s.",
                appointmentId, doctorName != null ? doctorName : "your doctor", date, time);
        
        if (meetingLink != null && !meetingLink.isEmpty()) {
            message += " Meeting link: " + meetingLink;
        }

        notificationService.sendNotification(userId, appointmentId, "APPOINTMENT_CONFIRMED", title, message, 
                "ALL", email, phone, "/patient/appointments/" + appointmentId);

        // Send formatted email
        if (email != null && !email.isEmpty()) {
            emailService.sendAppointmentConfirmationEmail(email, 
                    patientName != null ? patientName : "Patient",
                    doctorName != null ? doctorName : "Doctor",
                    date, time, appointmentId);
        }

        // Send SMS
        if (phone != null && !phone.isEmpty()) {
            smsService.sendAppointmentConfirmationSms(phone, 
                    patientName != null ? patientName : "Patient",
                    appointmentId, date, time);
        }

        log.info("✅ Appointment confirmed notification sent for appointment {}", appointmentId);
    }

    private void handleAppointmentCancelled(Long appointmentId, Long userId, String email,
            String patientName, String doctorName, String date, String time, String reason) {
        String title = "Appointment Cancelled";
        String message = String.format("Your appointment #%d with Dr. %s on %s at %s has been cancelled.",
                appointmentId, doctorName != null ? doctorName : "your doctor", date, time);
        if (reason != null && !reason.isEmpty()) {
            message += " Reason: " + reason;
        }

        notificationService.sendNotification(userId, appointmentId, "APPOINTMENT_CANCELLED", title, message, 
                "ALL", email, null, "/patient/find-doctors");

        log.info("✅ Appointment cancelled notification sent for appointment {}", appointmentId);
    }

    private void handleAppointmentReminder(Long appointmentId, Long userId, String email, String phone,
            String patientName, String doctorName, String date, String time, String meetingLink) {
        String title = "Appointment Reminder";
        String message = String.format("Reminder: Your appointment with Dr. %s is scheduled for %s at %s.",
                doctorName != null ? doctorName : "your doctor", date, time);

        notificationService.sendNotification(userId, appointmentId, "APPOINTMENT_REMINDER", title, message, 
                "ALL", email, phone, "/patient/appointments/" + appointmentId);

        // Send SMS reminder
        if (phone != null && !phone.isEmpty()) {
            smsService.sendAppointmentReminderSms(phone, 
                    patientName != null ? patientName : "Patient",
                    doctorName != null ? doctorName : "Doctor",
                    date, time);
        }

        log.info("✅ Appointment reminder sent for appointment {}", appointmentId);
    }

    /**
     * Handle prescription created events
     */
    @RabbitListener(queues = "prescription.queue")
    public void handlePrescriptionCreated(String appointmentIdStr) {
        log.info("📧 Prescription Created Event received: appointmentId={}", appointmentIdStr);
        try {
            Long appointmentId = Long.valueOf(appointmentIdStr);

            String title = "Prescription Ready";
            String message = String.format("A new prescription has been issued for your consultation #%d. View it in your patient dashboard.", 
                    appointmentId);

            // Since we only have appointmentId, send as IN_APP notification
            // The service can be enhanced to fetch patient details from other services
            notificationService.sendNotification(null, appointmentId, "PRESCRIPTION_READY", title, message, 
                    "IN_APP", null, null, "/patient/prescriptions");

            log.info("✅ Prescription ready notification sent for appointment {}", appointmentId);
        } catch (Exception e) {
            log.error("❌ Failed to process prescription created event: {}", e.getMessage(), e);
        }
    }

    /**
     * Handle telemedicine session events
     */
    @RabbitListener(queues = "telemedicine.notification.queue")
    public void handleTelemedicineEvent(Map<String, Object> event) {
        log.info("📧 Telemedicine Event received: {}", event);
        try {
            String sessionId = extractString(event, "sessionId");
            Long appointmentId = extractLong(event, "appointmentId");
            Long patientId = extractLong(event, "patientId");
            Long doctorId = extractLong(event, "doctorId");
            String sessionUrl = extractString(event, "sessionUrl");
            String roomName = extractString(event, "roomName");
            String scheduledStartTime = extractString(event, "scheduledStartTime");
            
            // Determine if this is a session created or ended event based on payload
            boolean isSessionEnded = event.containsKey("endedAt") || event.containsKey("endedBy");
            
            if (isSessionEnded) {
                handleTelemedicineSessionEnded(sessionId, appointmentId, patientId, doctorId, event);
            } else {
                handleTelemedicineSessionCreated(sessionId, appointmentId, patientId, doctorId, 
                        sessionUrl, roomName, scheduledStartTime);
            }
        } catch (Exception e) {
            log.error("❌ Failed to process telemedicine event: {}", e.getMessage(), e);
        }
    }

    private void handleTelemedicineSessionCreated(String sessionId, Long appointmentId, Long patientId, 
            Long doctorId, String sessionUrl, String roomName, String scheduledStartTime) {
        
        // Notify patient
        String patientTitle = "Telemedicine Session Ready";
        String patientMessage = String.format("Your telemedicine session for appointment #%d is ready. Click to join: %s",
                appointmentId, sessionUrl != null ? sessionUrl : "Available in your dashboard");

        notificationService.sendNotification(patientId, appointmentId, "TELEMEDICINE_SESSION_CREATED", 
                patientTitle, patientMessage, "ALL", null, null, sessionUrl);

        // Notify doctor
        String doctorTitle = "Telemedicine Session Created";
        String doctorMessage = String.format("A telemedicine session has been created for appointment #%d. Room: %s",
                appointmentId, roomName != null ? roomName : "N/A");

        notificationService.sendNotification(doctorId, appointmentId, "TELEMEDICINE_SESSION_CREATED", 
                doctorTitle, doctorMessage, "IN_APP", null, null, sessionUrl);

        log.info("✅ Telemedicine session created notifications sent for appointment {}", appointmentId);
    }

    private void handleTelemedicineSessionEnded(String sessionId, Long appointmentId, Long patientId, 
            Long doctorId, Map<String, Object> event) {
        // Notified via specialized methods

        String title = "Telemedicine Session Ended";
        String message = String.format("Your telemedicine session for appointment #%d has ended. " +
                "A prescription may be issued shortly.", appointmentId);

        // Notify patient
        notificationService.sendNotification(patientId, appointmentId, "TELEMEDICINE_SESSION_ENDED", 
                title, message, "IN_APP", null, null, "/patient/appointments/" + appointmentId);

        // Notify doctor
        String doctorMessage = String.format("Telemedicine session for appointment #%d ended. Don't forget to issue a prescription if needed.",
                appointmentId);
        notificationService.sendNotification(doctorId, appointmentId, "TELEMEDICINE_SESSION_ENDED", 
                "Session Completed", doctorMessage, "IN_APP", null, null, "/doctor/prescriptions/new?appointmentId=" + appointmentId);

        log.info("✅ Telemedicine session ended notifications sent for appointment {}", appointmentId);
    }

    // Helper methods
    private Long extractLong(Map<String, Object> event, String key) {
        Object value = event.get(key);
        if (value == null) return null;
        if (value instanceof Number) return ((Number) value).longValue();
        try {
            return Long.valueOf(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String extractString(Map<String, Object> event, String key) {
        Object value = event.get(key);
        return value != null ? value.toString() : null;
    }
}
