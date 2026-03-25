package com.synapscare.aisymptomcheckerservice.exception;

public class SymptomCheckException extends RuntimeException {

    public SymptomCheckException(String message, Throwable cause) {
        super(message, cause);
    }

    public SymptomCheckException(String message) {
        super(message);
    }
}
