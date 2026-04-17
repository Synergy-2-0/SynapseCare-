package com.healthcare.telemedicine.entity;

public enum SessionStatus {
    SCHEDULED,
    IN_SESSION,    // Active session (aligned with reference)
    ENDED,         // Session completed (aligned with reference)
    COMPLETED,     // Keep for backwards compatibility
    CANCELLED,
    EXPIRED
}
