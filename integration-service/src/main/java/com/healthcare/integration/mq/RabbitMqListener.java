package com.healthcare.integration.mq;

import com.healthcare.integration.dto.ApiResponse;
import com.healthcare.integration.entity.Payment;
import com.healthcare.integration.service.AiSymptomService;
import com.healthcare.integration.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class RabbitMqListener {

    private final AiSymptomService aiSymptomService;
    private final PaymentService paymentService;

    @RabbitListener(queues = "${app.rabbitmq.queue:patient.queue}")
    public void handlePatientEvent(Object patientDto) {
        log.info("Received patient event message: {}", patientDto);
        // Process or sync patient data if needed
    }

    @RabbitListener(queues = "payment.queue")
    public void handlePaymentRequest(Map<String, Object> paymentRequest) {
        log.info("Received payment request event: {}", paymentRequest);
        Long appointmentId = Long.valueOf(paymentRequest.get("appointmentId").toString());
        Long patientId = Long.valueOf(paymentRequest.get("patientId").toString());
        BigDecimal amount = new BigDecimal(paymentRequest.get("amount").toString());
        
        paymentService.processPayment(appointmentId, patientId, amount);
        log.info("Payment processed successfully for appointment {}", appointmentId);
    }

    @RabbitListener(queues = "symptom.queue")
    public void handleSymptomAnalysisRequest(Map<String, String> request) {
        log.info("Received symptom analysis request: {}", request);
        String symptoms = request.get("symptoms");
        String result = aiSymptomService.analyzeSymptoms(symptoms);
        log.info("AI Analysis result ready: {}", result);
        // Usually, in a real system, we'd send the result back to another queue or WebSocket
    }
}
