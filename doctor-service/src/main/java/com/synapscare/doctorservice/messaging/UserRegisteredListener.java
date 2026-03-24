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
        log.info("Received user registered event for userId: {}", event.getUserId());

        try {
            // Check if user has DOCTOR role
            if (event.getRoles() != null && event.getRoles().contains("DOCTOR")) {
                log.info("Creating empty doctor profile for userId: {}", event.getUserId());
                doctorService.createEmptyDoctorProfile(event.getUserId());
            }
        } catch (Exception e) {
            log.error("Error processing user registered event for userId: {}", event.getUserId(), e);
        }
    }
}
