package com.healthcare.notification.service;

import com.healthcare.notification.entity.Notification;
import com.healthcare.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void sendNotification(Long userId, Long appointmentId, String type, String message, String channel) {
        log.info("Sending {} notification to User {}: {}", channel, userId, message);
        
        Notification notification = Notification.builder()
                .userId(userId)
                .appointmentId(appointmentId)
                .type(type)
                .message(message)
                .channel(channel)
                .status("SENT")
                .sentTime(LocalDateTime.now())
                .build();
        
        notificationRepository.save(notification);
    }
}
