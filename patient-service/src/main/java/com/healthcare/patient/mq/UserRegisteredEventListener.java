package com.healthcare.patient.mq;

import com.healthcare.patient.config.RabbitMQConfig;
import com.healthcare.patient.dto.messaging.UserRegisteredEvent;
import com.healthcare.patient.entity.Patient;
import com.healthcare.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;

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

        Patient.PatientBuilder patientBuilder = Patient.builder()
                .userId(event.getUserId())
                .name(event.getFirstName() + " " + event.getLastName())
                .email(event.getEmail())
                .phone(event.getPhoneNumber())
                .bloodGroup(event.getBloodGroup())
                .allergies(event.getAllergies())
                .chronicIllnesses(event.getChronicIllnesses())
                .gender(event.getGender())
                .profileImageUrl(event.getProfileImageUrl())
                .emergencyContact(event.getEmergencyContact());

        // Safe Metric Parsing Shards
        try {
            if (event.getHeight() != null && !event.getHeight().isEmpty()) {
                patientBuilder.height(Double.parseDouble(event.getHeight()));
            }
            if (event.getWeight() != null && !event.getWeight().isEmpty()) {
                patientBuilder.weight(Double.parseDouble(event.getWeight()));
            }
            if (event.getDob() != null && !event.getDob().isEmpty()) {
                patientBuilder.dob(LocalDate.parse(event.getDob()));
            }
        } catch (NumberFormatException | DateTimeParseException e) {
            log.warn("Clinical metric shard parsing failed for userId {}: {}", event.getUserId(), e.getMessage());
        }

        patientRepository.save(patientBuilder.build());
        log.info("Successfully created patient profile for userId: {}", event.getUserId());
    }
}
