package com.healthcare.patient.service;

import com.healthcare.patient.dto.PatientDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientEventProducer {

    @Value("${app.rabbitmq.exchange}")
    private String exchange;

    @Value("${app.rabbitmq.routing-key}")
    private String routingKey;

    private final RabbitTemplate rabbitTemplate;

    public void sendPatientCreatedEvent(PatientDto patientDto) {
        log.info("Sending patient created event to RabbitMQ for patient: {}", patientDto.getEmail());
        rabbitTemplate.convertAndSend(exchange, routingKey, patientDto);
    }

    public void sendPatientUpdatedEvent(PatientDto patientDto) {
        log.info("Sending patient updated event to RabbitMQ for patient: {}", patientDto.getEmail());
        rabbitTemplate.convertAndSend(exchange, routingKey, patientDto);
    }
}
