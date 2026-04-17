package com.healthcare.notification.service;

import lombok.*;
import java.time.LocalDateTime;

/**
 * DTO for notification responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private Long userId;
    private Long appointmentId;
    private String type;
    private String title;
    private String message;
    private String channel;
    private String status;
    private Boolean isRead;
    private String actionUrl;
    private String iconType;
    private LocalDateTime createdAt;
    private LocalDateTime sentTime;
    private LocalDateTime readAt;
}
