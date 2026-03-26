package com.synapscare.org.messaging;

import com.synapscare.org.dto.messaging.DoctorVerificationEvent;
import com.synapscare.org.entity.User;
import com.synapscare.org.enums.VerificationStatus;
import com.synapscare.org.exception.ResourceNotFoundException;
import com.synapscare.org.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import static com.synapscare.org.config.RabbitMQConfig.USER_DOCTOR_VERIFIED_QUEUE;

@Component
@RequiredArgsConstructor
@Slf4j
public class DoctorVerificationListener {

    private final UserRepository userRepository;

    @RabbitListener(queues = USER_DOCTOR_VERIFIED_QUEUE)
    @Retryable(
        maxAttempts = 3,
        backoff = @Backoff(delay = 2000, multiplier = 2)
    )
    @Transactional
    public void handleDoctorVerificationStatusChange(DoctorVerificationEvent event) {
        log.info("Received doctor verification event: userId={}, status={}",
                event.getUserId(), event.getStatus());

        // Validate event
        if (event.getUserId() == null || event.getStatus() == null) {
            log.error("Invalid event: userId or status is null");
            throw new IllegalArgumentException("Invalid verification event");
        }

        // Validate status enum
        try {
            VerificationStatus.valueOf(event.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            log.error("Invalid status: {}", event.getStatus());
            throw new IllegalArgumentException("Invalid verification status: " + event.getStatus());
        }

        // Find and update user
        User user = userRepository.findByIdAndIsDeletedFalse(event.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + event.getUserId()));

        if (user.getRole() != User.Role.DOCTOR) {
            log.error("User {} is not a doctor", event.getUserId());
            throw new IllegalStateException("User is not a doctor");
        }

        boolean isApproved = "APPROVED".equalsIgnoreCase(event.getStatus());
        user.setIsVerified(isApproved);
        userRepository.save(user);

        log.info("Updated doctor verification: userId={}, isVerified={}",
                event.getUserId(), isApproved);
    }
}
