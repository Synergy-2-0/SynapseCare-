package com.healthcare.appointment.exception;

public class DoctorServiceUnavailableException extends RuntimeException {
    public DoctorServiceUnavailableException(String message) {
        super(message);
    }
}
