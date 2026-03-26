package com.healthcare.appointment.mq;

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

    @RabbitListener(queues = "appointment.complete.queue")
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
