package com.synapscare.doctorservice.messaging;

import com.synapscare.doctorservice.dto.messaging.DoctorVerificationEvent;
import com.synapscare.doctorservice.service.DoctorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Component;

import static com.synapscare.doctorservice.config.RabbitMQConfig.USER_DOCTOR_VERIFIED_QUEUE;

/**
 * Listens to doctor verification events from auth-service.
 * Auth-service is the SOURCE OF TRUTH for verification status.
 * This listener ensures doctor-service stays in sync.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DoctorVerificationListener {

    private final DoctorService doctorService;

    @RabbitListener(queues = USER_DOCTOR_VERIFIED_QUEUE)
    @Retryable(
        maxAttempts = 3,
        backoff = @Backoff(delay = 2000, multiplier = 2)
    )
    public void handleDoctorVerification(DoctorVerificationEvent event) {
        log.info("Received verification event from auth-service: userId={}, status={}, verifiedBy={}",
                event.getUserId(), event.getStatus(), event.getVerifiedBy());

        if (event.getUserId() == null || event.getStatus() == null) {
            log.error("Invalid event: userId or status is null");
            throw new IllegalArgumentException("Invalid verification event");
        }

        // Sync verification with metadata (rejection reason, verifier, etc.)
        doctorService.syncDoctorVerification(
                event.getUserId(),
                event.getStatus(),
                event.getRejectionReason(),
                event.getVerifiedBy()
        );

        log.info("Successfully synced verification for userId: {} to status: {}",
                event.getUserId(), event.getStatus());
    }
}
