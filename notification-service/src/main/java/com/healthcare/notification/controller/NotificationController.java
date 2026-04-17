package com.healthcare.notification.controller;

import com.healthcare.notification.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationPreferenceService preferenceService;

    /**
     * Get all notifications for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDTO>> findByUserId(@PathVariable("userId") Long userId) {
        log.info("Getting notifications for user {}", userId);
        return ResponseEntity.ok(notificationService.getNotificationsByUserId(userId));
    }

    /**
     * Get paginated notifications for a user
     */
    @GetMapping("/user/{userId}/paged")
    public ResponseEntity<Page<NotificationDTO>> findByUserIdPaged(
            @PathVariable("userId") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Getting paginated notifications for user {}, page={}, size={}", userId, page, size);
        return ResponseEntity.ok(notificationService.getNotificationsByUserId(userId, page, size));
    }

    /**
     * Get unread notifications for a user
     */
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(@PathVariable("userId") Long userId) {
        log.info("Getting unread notifications for user {}", userId);
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    /**
     * Get unread notification count for a user
     */
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<UnreadCountResponse> getUnreadCount(@PathVariable("userId") Long userId) {
        log.info("Getting unread count for user {}", userId);
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    /**
     * Mark a single notification as read
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable Long notificationId) {
        log.info("Marking notification {} as read", notificationId);
        boolean success = notificationService.markAsRead(notificationId);
        return ResponseEntity.ok(Map.of(
            "success", success,
            "notificationId", notificationId
        ));
    }

    /**
     * Mark all notifications as read for a user
     */
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead(@PathVariable Long userId) {
        log.info("Marking all notifications as read for user {}", userId);
        int count = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "markedCount", count,
            "userId", userId
        ));
    }

    /**
     * Delete a notification
     */
    @DeleteMapping("/user/{userId}/{notificationId}")
    public ResponseEntity<Map<String, Object>> deleteNotification(
            @PathVariable Long userId,
            @PathVariable Long notificationId) {
        log.info("Deleting notification {} for user {}", notificationId, userId);
        notificationService.deleteNotification(userId, notificationId);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "deleted", notificationId
        ));
    }

    /**
     * Get notification status (for debugging)
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        return ResponseEntity.ok(Map.of(
            "status", "operational",
            "channels", List.of("EMAIL", "WHATSAPP", "SMS")
        ));
    }

    /**
     * Send a test notification (for debugging)
     */
    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> sendTestNotification(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.getOrDefault("userId", 0).toString());
        String type = request.getOrDefault("type", "TEST").toString();
        String title = request.getOrDefault("title", "Test Notification").toString();
        String message = request.getOrDefault("message", "This is a test notification").toString();
        String channel = request.getOrDefault("channel", "IN_APP").toString();
        String email = request.getOrDefault("recipientEmail", "").toString();
        String phone = request.getOrDefault("recipientPhone", "").toString();
        
        log.info("Sending test notification to user {} via {} (Phone: {}, Email: {})", 
                userId, channel, phone, email);
        
        notificationService.sendNotification(
            userId > 0 ? userId : null, 
            null, 
            type, 
            title, 
            message, 
            channel, 
            email.isEmpty() ? null : email, 
            phone.isEmpty() ? null : phone, 
            null
        );
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", String.format("Test notification dispatched to user %d via %s", userId, channel)
        ));
    }
}
