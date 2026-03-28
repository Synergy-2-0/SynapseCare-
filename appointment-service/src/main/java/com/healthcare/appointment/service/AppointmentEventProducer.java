package com.healthcare.appointment.service;

import com.healthcare.appointment.dto.AppointmentEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentEventProducer {

    @Value("${app.rabbitmq.exchange}")
    private String exchange;

    @Value("${app.rabbitmq.routing-key}")
    private String routingKey;

    private final RabbitTemplate rabbitTemplate;

    public void sendAppointmentEvent(AppointmentEvent event) {
        try {
            rabbitTemplate.convertAndSend(exchange, routingKey, event);
            log.info("Published appointment event: {} for appointment {}", event.getEventType(), event.getAppointmentId());
        } catch (Exception ex) {
            log.warn("Failed to publish appointment event: {}", ex.getMessage());
        }
    }
}
