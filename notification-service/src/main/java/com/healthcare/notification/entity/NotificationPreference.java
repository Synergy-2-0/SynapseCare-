package com.healthcare.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification_preferences")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;
    
    // Email preferences
    @Builder.Default
    private Boolean emailEnabled = true;
    
    @Builder.Default
    private Boolean emailAppointmentConfirmation = true;
    
    @Builder.Default
    private Boolean emailAppointmentReminder = true;
    
    @Builder.Default
    private Boolean emailPaymentConfirmation = true;
    
    @Builder.Default
    private Boolean emailPrescriptionReady = true;
    
    @Builder.Default
    private Boolean emailTelemedicineSession = true;
    
    // SMS preferences
    @Builder.Default
    private Boolean smsEnabled = true;
    
    @Builder.Default
    private Boolean smsAppointmentReminder = true;
    
    @Builder.Default
    private Boolean smsTelemedicineSession = true;
    
    // WhatsApp preferences
    @Builder.Default
    private Boolean whatsappEnabled = true;
    
    @Builder.Default
    private Boolean whatsappAppointmentReminder = true;
    
    @Builder.Default
    private Boolean whatsappTelemedicineSession = true;
    
    @Builder.Default
    private Boolean whatsappPrescriptionReady = true;
    
    // In-app preferences
    @Builder.Default
    private Boolean inAppEnabled = true;
    
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
