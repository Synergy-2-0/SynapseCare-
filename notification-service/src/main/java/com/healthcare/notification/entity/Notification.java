package com.healthcare.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;
    
    private Long appointmentId;
    
    @Column(nullable = false)
    private String type;
    
    private String title;
    
    @Column(length = 2000)
    private String message;
    
    private String channel;  // EMAIL, SMS, IN_APP
    
    private String status;  // SENT, FAILED, PENDING
    
    @Builder.Default
    private Boolean isRead = false;
    
    private String recipientEmail;
    
    private String recipientPhone;
    
    // Additional metadata for rich notifications
    private String actionUrl;
    
    private String iconType;  // appointment, payment, prescription, telemedicine, system
    
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "sent_time")
    private LocalDateTime sentTime;
    
    @Column(name = "read_at")
    private LocalDateTime readAt;
}
