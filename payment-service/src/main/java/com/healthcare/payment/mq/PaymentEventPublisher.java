package com.healthcare.payment.mq;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public static final String EXCHANGE = "healthcare.exchange";
    public static final String PAYMENT_SUCCESS_ROUTING_KEY = "payment.success";
    public static final String PAYMENT_FAILED_ROUTING_KEY = "payment.failed";

    /**
     * Publishes a payment success event so appointment-service can
     * auto-confirm the appointment.
     */
    public void publishPaymentSuccess(Long appointmentId, String paymentId) {
        Map<String, Object> event = Map.of(
                "appointmentId", appointmentId,
                "paymentId", paymentId,
                "event", "PAYMENT_SUCCESS"
        );
        rabbitTemplate.convertAndSend(EXCHANGE, PAYMENT_SUCCESS_ROUTING_KEY, event);
        log.info("Published PAYMENT_SUCCESS event for appointmentId={}", appointmentId);
    }

    public void publishPaymentFailed(Long appointmentId, String paymentId, String reason) {
        Map<String, Object> event = Map.of(
                "appointmentId", appointmentId,
                "paymentId", paymentId,
                "reason", reason,
                "event", "PAYMENT_FAILED"
        );
        rabbitTemplate.convertAndSend(EXCHANGE, PAYMENT_FAILED_ROUTING_KEY, event);
        log.info("Published PAYMENT_FAILED event for appointmentId={}", appointmentId);
    }
}
