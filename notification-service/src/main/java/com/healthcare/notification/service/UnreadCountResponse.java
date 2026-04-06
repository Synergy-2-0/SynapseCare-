package com.healthcare.notification.service;

import lombok.*;

/**
 * Response for unread count
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnreadCountResponse {
    private Long userId;
    private Long unreadCount;
}
