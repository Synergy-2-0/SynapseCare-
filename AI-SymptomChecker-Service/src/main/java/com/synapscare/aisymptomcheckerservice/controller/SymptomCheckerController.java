package com.synapscare.aisymptomcheckerservice.controller;

import com.synapscare.aisymptomcheckerservice.dto.SymptomRequest;
import com.synapscare.aisymptomcheckerservice.dto.SymptomResponse;
import com.synapscare.aisymptomcheckerservice.service.SymptomCheckerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/symptoms")
@RequiredArgsConstructor
public class SymptomCheckerController {

    private final SymptomCheckerService symptomCheckerService;

    @PostMapping("/check")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<SymptomResponse> checkSymptoms(@Valid @RequestBody SymptomRequest request) {
        log.info("Received symptom check request...");
        SymptomResponse response = symptomCheckerService.analyseSymptoms(request);
        return ResponseEntity.ok(response);
    }
}
