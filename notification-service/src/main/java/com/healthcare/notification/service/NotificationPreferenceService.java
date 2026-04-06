package com.healthcare.notification.service;

import com.healthcare.notification.entity.NotificationPreference;
import com.healthcare.notification.repository.NotificationPreferenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationPreferenceService {

    private final NotificationPreferenceRepository preferenceRepository;

    /**
     * Get notification preferences for a user
     */
    public NotificationPreferenceDTO getPreferences(Long userId) {
        NotificationPreference pref = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));
        return mapToDTO(pref);
    }

    /**
     * Update notification preferences for a user
     */
    @Transactional
    public NotificationPreferenceDTO updatePreferences(Long userId, NotificationPreferenceDTO dto) {
        NotificationPreference pref = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));

        // Update email preferences
        if (dto.getEmailEnabled() != null) pref.setEmailEnabled(dto.getEmailEnabled());
        if (dto.getEmailAppointmentConfirmation() != null) pref.setEmailAppointmentConfirmation(dto.getEmailAppointmentConfirmation());
        if (dto.getEmailAppointmentReminder() != null) pref.setEmailAppointmentReminder(dto.getEmailAppointmentReminder());
        if (dto.getEmailPaymentConfirmation() != null) pref.setEmailPaymentConfirmation(dto.getEmailPaymentConfirmation());
        if (dto.getEmailPrescriptionReady() != null) pref.setEmailPrescriptionReady(dto.getEmailPrescriptionReady());
        if (dto.getEmailTelemedicineSession() != null) pref.setEmailTelemedicineSession(dto.getEmailTelemedicineSession());

        // Update SMS preferences
        if (dto.getSmsEnabled() != null) pref.setSmsEnabled(dto.getSmsEnabled());
        if (dto.getSmsAppointmentReminder() != null) pref.setSmsAppointmentReminder(dto.getSmsAppointmentReminder());
        if (dto.getSmsTelemedicineSession() != null) pref.setSmsTelemedicineSession(dto.getSmsTelemedicineSession());

        // Update WhatsApp preferences
        if (dto.getWhatsappEnabled() != null) pref.setWhatsappEnabled(dto.getWhatsappEnabled());
        if (dto.getWhatsappAppointmentReminder() != null) pref.setWhatsappAppointmentReminder(dto.getWhatsappAppointmentReminder());
        if (dto.getWhatsappTelemedicineSession() != null) pref.setWhatsappTelemedicineSession(dto.getWhatsappTelemedicineSession());
        if (dto.getWhatsappPrescriptionReady() != null) pref.setWhatsappPrescriptionReady(dto.getWhatsappPrescriptionReady());

        // Update in-app preferences
        if (dto.getInAppEnabled() != null) pref.setInAppEnabled(dto.getInAppEnabled());

        NotificationPreference saved = preferenceRepository.save(pref);
        log.info("Updated notification preferences for user {}", userId);
        return mapToDTO(saved);
    }

    /**
     * Check if user wants email notifications for a specific type
     */
    public boolean shouldSendEmail(Long userId, String notificationType) {
        NotificationPreference pref = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));

        if (!pref.getEmailEnabled()) return false;

        return switch (notificationType) {
            case "APPOINTMENT_CONFIRMED", "APPOINTMENT_CANCELLED", "APPOINTMENT_BOOKED" -> 
                    pref.getEmailAppointmentConfirmation();
            case "APPOINTMENT_REMINDER" -> pref.getEmailAppointmentReminder();
            case "PAYMENT_SUCCESS", "PAYMENT_FAILED" -> pref.getEmailPaymentConfirmation();
            case "PRESCRIPTION_READY" -> pref.getEmailPrescriptionReady();
            case "TELEMEDICINE_SESSION_CREATED", "TELEMEDICINE_SESSION_REMINDER", "TELEMEDICINE_SESSION_ENDED" -> 
                    pref.getEmailTelemedicineSession();
            default -> true;
        };
    }

    /**
     * Check if user wants SMS notifications for a specific type
     */
    public boolean shouldSendSms(Long userId, String notificationType) {
        NotificationPreference pref = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));

        if (!pref.getSmsEnabled()) return false;

        return switch (notificationType) {
            case "APPOINTMENT_REMINDER" -> pref.getSmsAppointmentReminder();
            case "TELEMEDICINE_SESSION_CREATED", "TELEMEDICINE_SESSION_REMINDER" -> 
                    pref.getSmsTelemedicineSession();
            default -> false; // SMS only for specific notifications
        };
    }

    /**
     * Check if user wants WhatsApp notifications for a specific type
     */
    public boolean shouldSendWhatsApp(Long userId, String notificationType) {
        NotificationPreference pref = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));

        if (!pref.getWhatsappEnabled()) return false;

        return switch (notificationType) {
            case "APPOINTMENT_REMINDER", "APPOINTMENT_CONFIRMED", "APPOINTMENT_BOOKED" -> pref.getWhatsappAppointmentReminder();
            case "TELEMEDICINE_SESSION_CREATED", "TELEMEDICINE_SESSION_REMINDER" -> 
                    pref.getWhatsappTelemedicineSession();
            case "PRESCRIPTION_READY" -> pref.getWhatsappPrescriptionReady();
            default -> false;
        };
    }

    /**
     * Check if user wants in-app notifications
     */
    public boolean shouldSendInApp(Long userId) {
        return preferenceRepository.findByUserId(userId)
                .map(NotificationPreference::getInAppEnabled)
                .orElse(true);
    }

    private NotificationPreference createDefaultPreferences(Long userId) {
        NotificationPreference pref = NotificationPreference.builder()
                .userId(userId)
                .build();
        return preferenceRepository.save(pref);
    }

    private NotificationPreferenceDTO mapToDTO(NotificationPreference pref) {
        return NotificationPreferenceDTO.builder()
                .userId(pref.getUserId())
                .emailEnabled(pref.getEmailEnabled())
                .emailAppointmentConfirmation(pref.getEmailAppointmentConfirmation())
                .emailAppointmentReminder(pref.getEmailAppointmentReminder())
                .emailPaymentConfirmation(pref.getEmailPaymentConfirmation())
                .emailPrescriptionReady(pref.getEmailPrescriptionReady())
                .emailTelemedicineSession(pref.getEmailTelemedicineSession())
                .smsEnabled(pref.getSmsEnabled())
                .smsAppointmentReminder(pref.getSmsAppointmentReminder())
                .smsTelemedicineSession(pref.getSmsTelemedicineSession())
                .whatsappEnabled(pref.getWhatsappEnabled())
                .whatsappAppointmentReminder(pref.getWhatsappAppointmentReminder())
                .whatsappTelemedicineSession(pref.getWhatsappTelemedicineSession())
                .whatsappPrescriptionReady(pref.getWhatsappPrescriptionReady())
                .inAppEnabled(pref.getInAppEnabled())
                .build();
    }
}
