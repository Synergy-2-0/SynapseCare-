package com.healthcare.notification.repository;

import com.healthcare.notification.entity.NotificationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, Long> {
    
    Optional<NotificationTemplate> findByTemplateCodeAndChannelAndActiveTrue(String templateCode, String channel);
    
    Optional<NotificationTemplate> findByTemplateCodeAndActiveTrue(String templateCode);
}
