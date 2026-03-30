package com.synapscare.doctorservice.messaging;

import com.synapscare.doctorservice.dto.messaging.UserRegisteredEvent;
import com.synapscare.doctorservice.service.DoctorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import static com.synapscare.doctorservice.config.RabbitMQConfig.USER_REGISTERED_QUEUE;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserRegisteredListener {

    private final DoctorService doctorService;

    @RabbitListener(queues = USER_REGISTERED_QUEUE)
    public void handleUserRegistered(UserRegisteredEvent event) {
        log.info("Received UserRegisteredEvent: userId={}, roles={}", event.getUserId(), event.getRoles());

        try {
            // Check if user has DOCTOR role
            if (event.getRoles() != null && event.getRoles().contains("DOCTOR")) {
                log.info("Creating placeholder doctor profile for userId: {} ({} {})", 
                         event.getUserId(), event.getFirstName(), event.getLastName());
                doctorService.createEmptyDoctorProfile(event.getUserId(), event.getFirstName(), event.getLastName());
                log.info("Successfully created placeholder doctor profile for userId: {}", event.getUserId());
            } else {
                log.debug("Skipping doctor profile creation - not a DOCTOR role: {}", event.getRoles());
            }
        } catch (Exception e) {
            log.error("CRITICAL: Failed to create doctor profile for userId: {}. Doctor will not appear in search!",
                     event.getUserId(), e);
            // Re-throw to trigger retry
            throw new RuntimeException("Failed to create doctor profile", e);
        }
    }
}
