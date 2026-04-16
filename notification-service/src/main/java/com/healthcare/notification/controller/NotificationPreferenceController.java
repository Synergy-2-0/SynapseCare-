package com.healthcare.notification.controller;

import com.healthcare.notification.service.NotificationPreferenceDTO;
import com.healthcare.notification.service.NotificationPreferenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for managing user notification preferences
 */
@RestController
@RequestMapping("/api/notifications/preferences")
@RequiredArgsConstructor
@Slf4j
public class NotificationPreferenceController {

    private final NotificationPreferenceService preferenceService;

    /**
     * Get preferences for a specific user
     */
    @GetMapping("/{userId}")
    public ResponseEntity<NotificationPreferenceDTO> getPreferences(@PathVariable Long userId) {
        log.info("Fetching notification preferences for user: {}", userId);
        return ResponseEntity.ok(preferenceService.getPreferencesDTO(userId));
    }

    /**
     * Update preferences for a specific user
     */
    @PutMapping("/{userId}")
    public ResponseEntity<NotificationPreferenceDTO> updatePreferences(
            @PathVariable Long userId,
            @RequestBody NotificationPreferenceDTO dto) {
        log.info("Updating notification preferences for user: {}", userId);
        return ResponseEntity.ok(preferenceService.updatePreferences(userId, dto));
    }
}
