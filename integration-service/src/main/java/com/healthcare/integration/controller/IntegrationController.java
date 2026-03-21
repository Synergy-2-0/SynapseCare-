package com.healthcare.integration.controller;

import com.healthcare.integration.dto.ApiResponse;
import com.healthcare.integration.entity.Payment;
import com.healthcare.integration.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/integration")
@RequiredArgsConstructor
public class IntegrationController {
    
    private final PaymentService paymentService;
    private final NotificationService notificationService;
    private final TelemedicineService telemedicineService;
    private final AiSymptomService aiSymptomService;

    @PostMapping("/payment")
    public ResponseEntity<ApiResponse<Payment>> createPayment(
            @RequestParam Long appointmentId, 
            @RequestParam Long patientId, 
            @RequestParam BigDecimal amount) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Payment successful",
                paymentService.processPayment(appointmentId, patientId, amount)));
    }

    @PostMapping("/notify")
    public ResponseEntity<ApiResponse<Void>> sendNotification(
            @RequestParam String email, 
            @RequestParam String subject, 
            @RequestParam String message) {
        notificationService.sendEmail(email, subject, message);
        return ResponseEntity.ok(new ApiResponse<>(true, "Notification sent", null));
    }

    @GetMapping("/telemedicine/{appointmentId}")
    public ResponseEntity<ApiResponse<String>> getMeetingLink(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Link generated",
                telemedicineService.generateMeetingLink(appointmentId)));
    }

    @PostMapping("/ai/symptoms")
    public ResponseEntity<ApiResponse<String>> checkSymptoms(@RequestBody String symptoms) {
        return ResponseEntity.ok(new ApiResponse<>(true, "AI Assessment complete",
                aiSymptomService.analyzeSymptoms(symptoms)));
    }
}
