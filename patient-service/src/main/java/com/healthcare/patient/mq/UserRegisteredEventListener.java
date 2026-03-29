package com.healthcare.patient.mq;

import com.healthcare.patient.config.RabbitMQConfig;
import com.healthcare.patient.dto.messaging.UserRegisteredEvent;
import com.healthcare.patient.entity.Patient;
import com.healthcare.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserRegisteredEventListener {

    private final PatientRepository patientRepository;

    @RabbitListener(queues = RabbitMQConfig.USER_REGISTERED_QUEUE)
    public void onUserRegistered(UserRegisteredEvent event) {
        log.info("Received UserRegisteredEvent from auth-service for userId: {}", event.getUserId());

        if (patientRepository.existsByUserId(event.getUserId())) {
            log.warn("Patient profile already exists for userId: {}, skipping creation", event.getUserId());
            return;
        }

        Patient patient = Patient.builder()
                .userId(event.getUserId())
                .name(event.getFirstName() + " " + event.getLastName())
                .email(event.getEmail())
                .phone(event.getPhoneNumber())
                .build();

        patientRepository.save(patient);
        log.info("Successfully created patient profile for userId: {}", event.getUserId());
    }
}
