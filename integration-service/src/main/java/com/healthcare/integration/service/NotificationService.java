package com.healthcare.integration.service;

import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    
    public void sendEmail(String to, String subject, String message) {
        // Logic to send email (Mocked for brevity)
        System.out.println("--- email ---");
        System.out.println("To: " + to);
        System.out.println("Subject: " + subject);
        System.out.println("Message: " + message);
        System.out.println("-------------");
    }
}
