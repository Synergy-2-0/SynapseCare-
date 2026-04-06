package com.healthcare.notification.service;

import com.healthcare.notification.entity.Notification;
import com.healthcare.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final SmsService smsService;
    private final WhatsAppService whatsappService;
    private final NotificationPreferenceService preferenceService;

    /**
     * Send a notification through specified channels
     */
    public Notification sendNotification(Long userId, Long appointmentId, String type, String title, 
            String message, String channel, String recipientEmail, String recipientPhone, String actionUrl) {
        
        log.info("Processing notification - User: {}, Type: {}, Channel: {}", userId, type, channel);

        String iconType = getIconTypeForNotificationType(type);
        String status = "SENT";

        // Create and save notification record
        Notification notification = Notification.builder()
                .userId(userId)
                .appointmentId(appointmentId)
                .type(type)
                .title(title != null ? title : getTitleForType(type))
                .message(message)
                .channel(channel)
                .status(status)
                .isRead(false)
                .recipientEmail(recipientEmail)
                .recipientPhone(recipientPhone)
                .actionUrl(actionUrl)
                .iconType(iconType)
                .createdAt(LocalDateTime.now())
                .sentTime(LocalDateTime.now())
                .build();

        Notification saved = notificationRepository.save(notification);

        // Send via appropriate channel
        try {
            switch (channel.toUpperCase()) {
                case "EMAIL" -> sendEmailNotification(userId, type, title, message, recipientEmail);
                case "SMS" -> sendSmsNotification(userId, type, message, recipientPhone);
                case "WHATSAPP" -> sendWhatsAppNotification(userId, type, message, recipientPhone);
                case "IN_APP" -> recordInAppHistory(saved);
                case "ALL" -> {
                    sendEmailNotification(userId, type, title, message, recipientEmail);
                    sendSmsNotification(userId, type, message, recipientPhone);
                    sendWhatsAppNotification(userId, type, message, recipientPhone);
                    recordInAppHistory(saved);
                }
                default -> recordInAppHistory(saved);
            }
        } catch (Exception e) {
            log.error("Failed to send notification via {}: {}", channel, e.getMessage());
            saved.setStatus("FAILED");
            notificationRepository.save(saved);
        }

        return saved;
    }

    /**
     * Legacy method for backward compatibility
     */
    public void sendNotification(Long userId, Long appointmentId, String type, String message, String channel) {
        sendNotification(userId, appointmentId, type, null, message, channel, null, null, null);
    }

    /**
     * Get all notifications for a user
     */
    public List<NotificationDTO> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get paginated notifications for a user
     */
    public Page<NotificationDTO> getNotificationsByUserId(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToDTO);
    }

    /**
     * Get unread notifications for a user
     */
    public List<NotificationDTO> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get unread count for a user
     */
    public UnreadCountResponse getUnreadCount(Long userId) {
        Long count = notificationRepository.countUnreadByUserId(userId);
        return UnreadCountResponse.builder()
                .userId(userId)
                .unreadCount(count)
                .build();
    }

    /**
     * Mark a single notification as read
     */
    @Transactional
    public boolean markAsRead(Long notificationId) {
        int updated = notificationRepository.markAsReadById(notificationId);
        if (updated > 0) {
            log.info("Marked notification {} as read", notificationId);
            return true;
        }
        return false;
    }

    /**
     * Mark all notifications as read for a user
     */
    @Transactional
    public int markAllAsRead(Long userId) {
        int updated = notificationRepository.markAllAsReadByUserId(userId);
        log.info("Marked {} notifications as read for user {}", updated, userId);
        
        return updated;
    }

    /**
     * Delete a notification
     */
    @Transactional
    public void deleteNotification(Long userId, Long notificationId) {
        notificationRepository.deleteByUserIdAndId(userId, notificationId);
        log.info("Deleted notification {} for user {}", notificationId, userId);
    }

    /**
     * Send email notification if user preferences allow
     */
    private void sendEmailNotification(Long userId, String type, String title, String message, String email) {
        if (email == null || email.isEmpty()) {
            log.warn("No email address provided for user {}", userId);
            return;
        }

        // Bypass preference check for TEST type
        if (userId != null && !"TEST".equalsIgnoreCase(type) && !preferenceService.shouldSendEmail(userId, type)) {
            log.info("User {} has disabled email notifications for type {}", userId, type);
            return;
        }

        String subject = title != null ? "SynapseCare - " + title : "SynapseCare - " + getTitleForType(type);
        emailService.sendSimpleEmail(email, subject, message);
    }

    /**
     * Send SMS notification if user preferences allow
     */
    private void sendSmsNotification(Long userId, String type, String message, String phone) {
        if (phone == null || phone.isEmpty()) {
            log.warn("No phone number provided for user {}", userId);
            return;
        }

        // Bypass preference check for TEST type
        if (userId != null && !"TEST".equalsIgnoreCase(type) && !preferenceService.shouldSendSms(userId, type)) {
            log.info("User {} has disabled SMS notifications for type {}", userId, type);
            return;
        }

        smsService.sendSms(phone, message);
    }

    /**
     * Send WhatsApp notification if user preferences allow
     */
    private void sendWhatsAppNotification(Long userId, String type, String message, String phone) {
        if (phone == null || phone.isEmpty()) {
            log.warn("No phone number provided for WhatsApp user {}", userId);
            return;
        }

        // Bypass preference check for TEST type
        if (userId != null && !"TEST".equalsIgnoreCase(type) && !preferenceService.shouldSendWhatsApp(userId, type)) {
            log.info("User {} has disabled WhatsApp notifications for type {}", userId, type);
            return;
        }

        whatsappService.sendWhatsApp(phone, message);
    }

    /**
     * Record in-app notification to the database history
     */
    private void recordInAppHistory(Notification notification) {
        if (notification.getUserId() != null && 
            !preferenceService.shouldSendInApp(notification.getUserId())) {
            log.info("User {} has disabled in-app notifications", notification.getUserId());
            return;
        }

        log.info("In-app notification history recorded for user {}", notification.getUserId());
    }

    private String getTitleForType(String type) {
        return switch (type) {
            case "APPOINTMENT_BOOKED" -> "Appointment Booked";
            case "APPOINTMENT_CONFIRMED" -> "Appointment Confirmed";
            case "APPOINTMENT_CANCELLED" -> "Appointment Cancelled";
            case "APPOINTMENT_REMINDER" -> "Appointment Reminder";
            case "PAYMENT_SUCCESS" -> "Payment Successful";
            case "PAYMENT_FAILED" -> "Payment Failed";
            case "PRESCRIPTION_READY" -> "Prescription Ready";
            case "TELEMEDICINE_SESSION_CREATED" -> "Telemedicine Session Created";
            case "TELEMEDICINE_SESSION_REMINDER" -> "Session Starting Soon";
            case "TELEMEDICINE_SESSION_ENDED" -> "Session Ended";
            case "DOCTOR_APPROVED" -> "Registration Approved";
            case "DOCTOR_REJECTED" -> "Registration Rejected";
            default -> "Notification";
        };
    }

    private String getIconTypeForNotificationType(String type) {
        return switch (type) {
            case "APPOINTMENT_BOOKED", "APPOINTMENT_CONFIRMED", "APPOINTMENT_CANCELLED", "APPOINTMENT_REMINDER" -> "appointment";
            case "PAYMENT_SUCCESS", "PAYMENT_FAILED" -> "payment";
            case "PRESCRIPTION_READY" -> "prescription";
            case "TELEMEDICINE_SESSION_CREATED", "TELEMEDICINE_SESSION_REMINDER", "TELEMEDICINE_SESSION_ENDED" -> "telemedicine";
            case "DOCTOR_APPROVED", "DOCTOR_REJECTED" -> "doctor";
            default -> "system";
        };
    }

    private NotificationDTO mapToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .appointmentId(notification.getAppointmentId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .channel(notification.getChannel())
                .status(notification.getStatus())
                .isRead(notification.getIsRead())
                .actionUrl(notification.getActionUrl())
                .iconType(notification.getIconType())
                .createdAt(notification.getCreatedAt())
                .sentTime(notification.getSentTime())
                .readAt(notification.getReadAt())
                .build();
    }
}
