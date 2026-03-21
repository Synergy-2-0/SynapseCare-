package com.healthcare.integration.service;

import com.healthcare.integration.entity.Payment;
import com.healthcare.integration.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PaymentService {
    
    private final PaymentRepository paymentRepository;

    public Payment processPayment(Long appointmentId, Long patientId, BigDecimal amount) {
        Payment payment = Payment.builder()
                .appointmentId(appointmentId)
                .patientId(patientId)
                .amount(amount)
                .status("SUCCESS")
                .build();
        return paymentRepository.save(payment);
    }
}
