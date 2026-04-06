package com.healthcare.notification.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notification_templates")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String templateCode;  // e.g., APPOINTMENT_CONFIRMED, PAYMENT_SUCCESS
    
    private String channel;  // EMAIL, SMS, IN_APP
    
    private String subject;  // For emails
    
    @Column(length = 4000)
    private String bodyTemplate;  // Template with placeholders like {{patientName}}
    
    private String iconType;
    
    @Builder.Default
    private Boolean active = true;
}
