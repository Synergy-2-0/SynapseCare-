package com.synapscare.doctorservice.exception;

public class DoctorNotFoundException extends RuntimeException {
    public DoctorNotFoundException(String message) {
        super(message);
    }

    public DoctorNotFoundException(Long id) {
        super("Doctor not found with id: " + id);
    }
}
