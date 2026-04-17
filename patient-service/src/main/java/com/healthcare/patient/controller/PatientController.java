package com.healthcare.patient.controller;

import com.healthcare.patient.dto.ApiResponse;
import com.healthcare.patient.dto.PatientDto;
import com.healthcare.patient.service.FileStorageService;
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
    private final FileStorageService fileStorageService;

    @PostMapping(value = "/profile/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadProfileImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "userId", required = false) Long userId) {
        
        System.out.println("[PatientController] Received profile upload request for user: " + userId);
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "File is empty", null));
        }
        
        try {
            String targetId = (userId != null) ? String.valueOf(userId) : "temp_reg_" + System.currentTimeMillis();
            String subFolder = "patients/" + targetId + "/profile";
            
            String imageUrl = fileStorageService.storeFile(file, subFolder);
            System.out.println("[PatientController] File stored successfully: " + imageUrl);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Image uploaded", Map.of("url", imageUrl)));
        } catch (Exception e) {
            System.err.println("[PatientController] Upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Upload failed: " + e.getMessage(), null));
        }
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
