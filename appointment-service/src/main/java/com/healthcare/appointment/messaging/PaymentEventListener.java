package com.healthcare.appointment.messaging;

import com.healthcare.appointment.config.RabbitMQConfig;
import com.healthcare.appointment.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventListener {

    private final AppointmentService appointmentService;

    @RabbitListener(queues = RabbitMQConfig.APPOINTMENT_CONFIRM_QUEUE)
    public void handlePaymentSuccess(Map<String, Object> event) {
        log.info("Received PAYMENT_SUCCESS event: {}", event);
        try {
            Long appointmentId = Long.valueOf(event.get("appointmentId").toString());
            String paymentId = event.get("paymentId").toString();
            
            appointmentService.confirmAppointment(appointmentId);
            log.info("Successfully confirmed appointment {} after payment {}", appointmentId, paymentId);
        } catch (Exception e) {
            log.error("Error confirming appointment from payment event: {}", e.getMessage());
        }
    }

    @RabbitListener(queues = RabbitMQConfig.APPOINTMENT_FAILED_QUEUE)
    public void handlePaymentFailed(Map<String, Object> event) {
        log.info("Received PAYMENT_FAILED event: {}", event);
        try {
            Long appointmentId = Long.valueOf(event.get("appointmentId").toString());
            String reason = event.get("reason") != null ? event.get("reason").toString() : "Payment Failed";
            
            // Cancel or reject the appointment
            appointmentService.cancelAppointment(appointmentId);
            log.info("Successfully cancelled appointment {} due to payment failure: {}", appointmentId, reason);
        } catch (Exception e) {
            log.error("Error cancelling appointment from payment failure event: {}", e.getMessage());
        }
    }

    @RabbitListener(queues = RabbitMQConfig.APPOINTMENT_COMPLETE_QUEUE)
    public void handlePrescriptionCreated(String appointmentId) {
        log.info("Received PRESCRIPTION_CREATED event for appointment: {}", appointmentId);
        try {
            appointmentService.completeAppointment(Long.valueOf(appointmentId));
            log.info("Successfully completed appointment {} after prescription issuance", appointmentId);
        } catch (Exception e) {
            log.error("Error completing appointment from prescription event: {}", e.getMessage());
        }
    }
}
