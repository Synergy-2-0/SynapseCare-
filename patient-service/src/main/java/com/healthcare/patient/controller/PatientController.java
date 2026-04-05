package com.healthcare.patient.controller;

import com.healthcare.patient.dto.ApiResponse;
import com.healthcare.patient.dto.PatientDto;
import com.healthcare.patient.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import java.util.Map;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @PostMapping("/profile/upload")
    public ResponseEntity<Map<String, String>> uploadProfileImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "userId", required = false) Long userId) {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }
        
        // Logic: Save file to static/uploads/patients/{userId} and return URL
        // Implementing mock version first to align with doctor-service logic
        String targetId = (userId != null) ? String.valueOf(userId) : "temp_reg_" + System.currentTimeMillis();
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        String mockUrl = "/uploads/patients/" + targetId + "/profile/" + fileName;
        
        return ResponseEntity.ok(Map.of("url", mockUrl));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PatientDto>> createPatient(@Valid @RequestBody PatientDto patientDto) {
        PatientDto created = patientService.createPatient(patientDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Patient created successfully", created));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientDto>> getPatientById(@PathVariable("id") Long id) {
        PatientDto patient = patientService.getPatientById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Patient fetched successfully", patient));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<PatientDto>> getPatientByUserId(@PathVariable("userId") Long userId) {
        PatientDto patient = patientService.getPatientByUserId(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Patient fetched successfully", patient));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PatientDto>>> getAllPatients() {
        List<PatientDto> patients = patientService.getAllPatients();
        return ResponseEntity.ok(new ApiResponse<>(true, "Patients fetched successfully", patients));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientDto>> updatePatient(
            @PathVariable("id") Long id, 
            @Valid @RequestBody PatientDto patientDto) {
        PatientDto updated = patientService.updatePatient(id, patientDto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Patient updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePatient(@PathVariable("id") Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Patient deleted successfully", null));
    }
}
