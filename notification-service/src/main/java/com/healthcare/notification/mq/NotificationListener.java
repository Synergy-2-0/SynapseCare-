package com.healthcare.notification.mq;

import com.healthcare.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationListener {

    private final NotificationService notificationService;

    @RabbitListener(queues = "notification.queue")
    public void handlePaymentSuccess(Map<String, Object> event) {
        log.info("Notification received for Payment Success: Event {}", event);
        Object appointmentIdObj = event.get("appointmentId");
        if (appointmentIdObj != null) {
            String appointmentId = appointmentIdObj.toString();
            notificationService.sendNotification(null, Long.valueOf(appointmentId), "PAYMENT_SUCCESS", 
                "Your payment for appointment #" + appointmentId + " was successful.", "EMAIL");
        }
    }

    @RabbitListener(queues = "appointment.notification.queue")
    public void handleAppointmentConfirmed(Map<String, Object> event) {
        log.info("Notification received for Appointment Confirmation: Event {}", event);
        if ("APPOINTMENT_CONFIRMED".equals(event.get("eventType"))) {
            Object idObj = event.get("appointmentId");
            if (idObj == null) return;
            Long appointmentId = Long.valueOf(idObj.toString());
            String date = event.get("date") != null ? event.get("date").toString() : "TBD";
            String time = event.get("time") != null ? event.get("time").toString() : "TBD";
            String link = event.get("meetingLink") != null ? event.get("meetingLink").toString() : "TBD";
            Long userId = event.get("userId") != null ? Long.valueOf(event.get("userId").toString()) : null;
            
            String message = String.format("Appointment #%d confirmed for %s at %s. Link: %s", 
                appointmentId, date, time, link);
            
            notificationService.sendNotification(userId, appointmentId, "APPOINTMENT_CONFIRMED", 
                message, "EMAIL");
        }
    }

    @RabbitListener(queues = "prescription.queue")
    public void handlePrescriptionCreated(String appointmentId) {
        log.info("Notification received for Prescription Created: Appointment {}", appointmentId);
        notificationService.sendNotification(null, Long.valueOf(appointmentId), "PRESCRIPTION_READY", 
            "A new prescription has been issued for your consultation #" + appointmentId, "SMS");
    }
}
