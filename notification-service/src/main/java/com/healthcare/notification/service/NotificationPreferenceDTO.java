package com.healthcare.notification.service;

import lombok.*;

/**
 * DTO for notification preferences
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferenceDTO {
    private Long userId;
    
    // Email preferences
    private Boolean emailEnabled;
    private Boolean emailAppointmentConfirmation;
    private Boolean emailAppointmentReminder;
    private Boolean emailPaymentConfirmation;
    private Boolean emailPrescriptionReady;
    private Boolean emailTelemedicineSession;
    
    // SMS preferences
    private Boolean smsEnabled;
    private Boolean smsAppointmentReminder;
    private Boolean smsTelemedicineSession;
    
    // WhatsApp preferences
    private Boolean whatsappEnabled;
    private Boolean whatsappAppointmentReminder;
    private Boolean whatsappTelemedicineSession;
    private Boolean whatsappPrescriptionReady;
    
    // In-app preferences
    private Boolean inAppEnabled;
}
