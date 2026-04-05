package com.healthcare.telemedicine.exception;

public class SessionNotFoundException extends RuntimeException {
    public SessionNotFoundException(String message) {
        super(message);
    }

    public SessionNotFoundException(String sessionId, String field) {
        super(String.format("Session not found with %s: %s", field, sessionId));
    }
}
