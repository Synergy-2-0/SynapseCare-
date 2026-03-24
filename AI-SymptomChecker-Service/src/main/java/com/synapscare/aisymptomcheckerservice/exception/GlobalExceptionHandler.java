package com.synapscare.aisymptomcheckerservice.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String message = error.getDefaultMessage();
            fieldErrors.put(fieldName, message);
        });

        Map<String, Object> body = Map.of(
                "timestamp", LocalDateTime.now().toString(),
                "status", HttpStatus.BAD_REQUEST.value(),
                "error", "Validation Failed",
                "details", fieldErrors
        );

        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(SymptomCheckException.class)
    public ResponseEntity<Map<String, Object>> handleSymptomCheckException(SymptomCheckException ex) {
        log.error("Symptom check error: {}", ex.getMessage());
        Map<String, Object> body = Map.of(
                "timestamp", LocalDateTime.now().toString(),
                "status", HttpStatus.SERVICE_UNAVAILABLE.value(),
                "error", "Symptom Check Unavailable",
                "message", ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        log.error("Unexpected error: {}", ex.getMessage(), ex);
        Map<String, Object> body = Map.of(
                "timestamp", LocalDateTime.now().toString(),
                "status", HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "error", "Internal Server Error",
                "message", "An unexpected error occurred"
        );
        return ResponseEntity.internalServerError().body(body);
    }
}
