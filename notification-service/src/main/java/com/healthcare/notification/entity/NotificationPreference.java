package com.healthcare.notification.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.DynamicUpdate;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification_preferences")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@DynamicUpdate
public class NotificationPreference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;
    
    // Email preferences
    @Column(name = "email_enabled")
    @Builder.Default
    private Boolean emailEnabled = true;
    
    @Column(name = "email_appointment_confirmation")
    @Builder.Default
    private Boolean emailAppointmentConfirmation = true;
    
    @Column(name = "email_appointment_reminder")
    @Builder.Default
    private Boolean emailAppointmentReminder = true;
    
    @Column(name = "email_payment_confirmation")
    @Builder.Default
    private Boolean emailPaymentConfirmation = true;
    
    @Column(name = "email_prescription_ready")
    @Builder.Default
    private Boolean emailPrescriptionReady = true;
    
    @Column(name = "email_telemedicine_session")
    @Builder.Default
    private Boolean emailTelemedicineSession = true;
    
    // SMS preferences
    @Column(name = "sms_enabled")
    @Builder.Default
    private Boolean smsEnabled = true;

    @Column(name = "sms_appointment_confirmation")
    @Builder.Default
    private Boolean smsAppointmentConfirmation = true;
    
    @Column(name = "sms_appointment_reminder")
    @Builder.Default
    private Boolean smsAppointmentReminder = true;
    
    @Column(name = "sms_telemedicine_session")
    @Builder.Default
    private Boolean smsTelemedicineSession = true;
    
    // WhatsApp preferences
    @Column(name = "whatsapp_enabled")
    @Builder.Default
    private Boolean whatsappEnabled = true;
    
    @Column(name = "whatsapp_appointment_confirmation")
    @Builder.Default
    private Boolean whatsappAppointmentConfirmation = true;

    @Column(name = "whatsapp_appointment_reminder")
    @Builder.Default
    private Boolean whatsappAppointmentReminder = true;
    
    @Column(name = "whatsapp_telemedicine_session")
    @Builder.Default
    private Boolean whatsappTelemedicineSession = true;
    
    @Column(name = "whatsapp_prescription_ready")
    @Builder.Default
    private Boolean whatsappPrescriptionReady = true;
    
    // Exclusive Preference Logic
    @Column(name = "preferred_appointment_channel")
    @Builder.Default
    private String preferredAppointmentChannel = "EMAIL";

    // In-app preferences
    @Column(name = "in_app_enabled")
    @Builder.Default
    private Boolean inAppEnabled = true;
    
    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
