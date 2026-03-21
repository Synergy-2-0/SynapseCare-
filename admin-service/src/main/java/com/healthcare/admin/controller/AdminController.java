package com.healthcare.admin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    @PutMapping("/doctors/{doctorId}/verify")
    public ResponseEntity<String> verifyDoctor(@PathVariable Long doctorId) {
        // In a real system, this would call doctor-service or update DB
        return ResponseEntity.ok("Doctor " + doctorId + " verified successfully.");
    }

    @PostMapping("/users/{userId}/suspend")
    public ResponseEntity<String> suspendUser(@PathVariable Long userId) {
        return ResponseEntity.ok("User " + userId + " account suspended.");
    }

    @GetMapping("/transactions")
    public ResponseEntity<String> getAllTransactions() {
        return ResponseEntity.ok("List of transactions would be here.");
    }
}
