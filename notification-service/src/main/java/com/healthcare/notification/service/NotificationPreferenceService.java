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

    public NotificationPreferenceDTO getPreferencesDTO(Long userId) {
        return getPreferences(userId);
    }

    public NotificationPreferenceDTO getPreferences(Long userId) {
        NotificationPreference pref = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));
        return mapToDTO(pref);
    }

    @Transactional
    public NotificationPreferenceDTO updatePreferences(Long userId, NotificationPreferenceDTO dto) {
        log.info("Updating preferences for user {}: {}", userId, dto);
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
        if (dto.getSmsAppointmentConfirmation() != null) pref.setSmsAppointmentConfirmation(dto.getSmsAppointmentConfirmation());
        if (dto.getSmsAppointmentReminder() != null) pref.setSmsAppointmentReminder(dto.getSmsAppointmentReminder());
        if (dto.getSmsTelemedicineSession() != null) pref.setSmsTelemedicineSession(dto.getSmsTelemedicineSession());

        // Update WhatsApp preferences
        if (dto.getWhatsappEnabled() != null) pref.setWhatsappEnabled(dto.getWhatsappEnabled());
        if (dto.getWhatsappAppointmentConfirmation() != null) pref.setWhatsappAppointmentConfirmation(dto.getWhatsappAppointmentConfirmation());
        if (dto.getWhatsappAppointmentReminder() != null) pref.setWhatsappAppointmentReminder(dto.getWhatsappAppointmentReminder());
        if (dto.getWhatsappTelemedicineSession() != null) pref.setWhatsappTelemedicineSession(dto.getWhatsappTelemedicineSession());
        if (dto.getWhatsappPrescriptionReady() != null) pref.setWhatsappPrescriptionReady(dto.getWhatsappPrescriptionReady());

        // CRITICAL FIX: Ensure the preferred channel is read and saved
        if (dto.getPreferredAppointmentChannel() != null) {
            log.info("Setting preferred channel to: {}", dto.getPreferredAppointmentChannel());
            pref.setPreferredAppointmentChannel(dto.getPreferredAppointmentChannel().toUpperCase());
        }

        if (dto.getInAppEnabled() != null) pref.setInAppEnabled(dto.getInAppEnabled());

        NotificationPreference saved = preferenceRepository.save(pref);
        log.info("Saved preferred_appointment_channel as: {}", saved.getPreferredAppointmentChannel());
        
        return mapToDTO(saved);
    }

    public boolean shouldSendEmail(Long userId, String notificationType) {
        NotificationPreference pref = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));
        
        if (!Boolean.TRUE.equals(pref.getEmailEnabled())) return false;
        
        // If Email is the PREFERRED channel, allow appointment messages
        boolean isPreferred = pref.getPreferredAppointmentChannel() == null || 
                             "EMAIL".equalsIgnoreCase(pref.getPreferredAppointmentChannel());

        return switch (notificationType) {
            case "APPOINTMENT_CONFIRMED", "APPOINTMENT_CANCELLED", "APPOINTMENT_BOOKED" -> 
                    isPreferred || Boolean.TRUE.equals(pref.getEmailAppointmentConfirmation());
            case "APPOINTMENT_REMINDER" -> 
                    isPreferred || Boolean.TRUE.equals(pref.getEmailAppointmentReminder());
            case "PAYMENT_SUCCESS", "PAYMENT_FAILED" -> Boolean.TRUE.equals(pref.getEmailPaymentConfirmation());
            case "PRESCRIPTION_READY" -> Boolean.TRUE.equals(pref.getEmailPrescriptionReady());
            case "TELEMEDICINE_SESSION_CREATED", "TELEMEDICINE_SESSION_REMINDER", "TELEMEDICINE_SESSION_ENDED" -> 
                    Boolean.TRUE.equals(pref.getEmailTelemedicineSession());
            default -> true;
        };
    }

    public boolean shouldSendSms(Long userId, String notificationType) {
        NotificationPreference pref = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));
        if (!Boolean.TRUE.equals(pref.getSmsEnabled())) return false;
        return switch (notificationType) {
            case "APPOINTMENT_CONFIRMED", "APPOINTMENT_CANCELLED", "APPOINTMENT_BOOKED" -> 
                    Boolean.TRUE.equals(pref.getSmsAppointmentConfirmation());
            case "APPOINTMENT_REMINDER" -> Boolean.TRUE.equals(pref.getSmsAppointmentReminder());
            case "TELEMEDICINE_SESSION_CREATED", "TELEMEDICINE_SESSION_REMINDER" -> 
                    Boolean.TRUE.equals(pref.getSmsTelemedicineSession());
            default -> false;
        };
    }

    public boolean shouldSendWhatsApp(Long userId, String notificationType) {
        NotificationPreference pref = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));
        
        // If WhatsApp is NOT the enabled globally for the user, stop.
        if (!Boolean.TRUE.equals(pref.getWhatsappEnabled())) return false;
        
        // CRITICAL: If WhatsApp is the PREFERRED channel for appointments, 
        // we should allow appointment-related messages even if the specific sub-toggle is null/false
        boolean isPreferred = "WHATSAPP".equalsIgnoreCase(pref.getPreferredAppointmentChannel());
        
        return switch (notificationType) {
            case "APPOINTMENT_BOOKED", "APPOINTMENT_CONFIRMED", "APPOINTMENT_CANCELLED" -> 
                    isPreferred || Boolean.TRUE.equals(pref.getWhatsappAppointmentConfirmation());
            case "APPOINTMENT_REMINDER" -> 
                    isPreferred || Boolean.TRUE.equals(pref.getWhatsappAppointmentReminder());
            case "TELEMEDICINE_SESSION_CREATED", "TELEMEDICINE_SESSION_REMINDER" -> 
                    Boolean.TRUE.equals(pref.getWhatsappTelemedicineSession());
            case "PRESCRIPTION_READY" -> Boolean.TRUE.equals(pref.getWhatsappPrescriptionReady());
            default -> isPreferred;
        };
    }

    public boolean shouldSendInApp(Long userId) {
        return preferenceRepository.findByUserId(userId)
                .map(pref -> Boolean.TRUE.equals(pref.getInAppEnabled()))
                .orElse(true);
    }

    private NotificationPreference createDefaultPreferences(Long userId) {
        NotificationPreference pref = NotificationPreference.builder()
                .userId(userId)
                .preferredAppointmentChannel("EMAIL")
                .build();
        return preferenceRepository.save(pref);
    }

    private NotificationPreferenceDTO mapToDTO(NotificationPreference pref) {
        NotificationPreferenceDTO dto = new NotificationPreferenceDTO();
        dto.setUserId(pref.getUserId());
        dto.setEmailEnabled(pref.getEmailEnabled());
        dto.setEmailAppointmentConfirmation(pref.getEmailAppointmentConfirmation());
        dto.setEmailAppointmentReminder(pref.getEmailAppointmentReminder());
        dto.setEmailPaymentConfirmation(pref.getEmailPaymentConfirmation());
        dto.setEmailPrescriptionReady(pref.getEmailPrescriptionReady());
        dto.setEmailTelemedicineSession(pref.getEmailTelemedicineSession());
        
        dto.setSmsEnabled(pref.getSmsEnabled());
        dto.setSmsAppointmentConfirmation(pref.getSmsAppointmentConfirmation());
        dto.setSmsAppointmentReminder(pref.getSmsAppointmentReminder());
        dto.setSmsTelemedicineSession(pref.getSmsTelemedicineSession());
        
        dto.setWhatsappEnabled(pref.getWhatsappEnabled());
        dto.setWhatsappAppointmentConfirmation(pref.getWhatsappAppointmentConfirmation());
        dto.setWhatsappAppointmentReminder(pref.getWhatsappAppointmentReminder());
        dto.setWhatsappTelemedicineSession(pref.getWhatsappTelemedicineSession());
        dto.setWhatsappPrescriptionReady(pref.getWhatsappPrescriptionReady());
        
        dto.setPreferredAppointmentChannel(pref.getPreferredAppointmentChannel());
        dto.setInAppEnabled(pref.getInAppEnabled());
        return dto;
    }
}
