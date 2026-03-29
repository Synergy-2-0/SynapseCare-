package com.healthcare.notification.mq;

import com.healthcare.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationListener {

    private final NotificationService notificationService;

    @RabbitListener(queues = "notification.queue")
    public void handlePaymentSuccess(String appointmentId) {
        log.info("Notification received for Payment Success: Appointment {}", appointmentId);
        notificationService.sendNotification(null, Long.valueOf(appointmentId), "PAYMENT_SUCCESS", 
            "Your payment for appointment #" + appointmentId + " was successful.", "EMAIL");
    }

    @RabbitListener(queues = "prescription.queue")
    public void handlePrescriptionCreated(String appointmentId) {
        log.info("Notification received for Prescription Created: Appointment {}", appointmentId);
        notificationService.sendNotification(null, Long.valueOf(appointmentId), "PRESCRIPTION_READY", 
            "A new prescription has been issued for your consultation #" + appointmentId, "SMS");
    }
}
