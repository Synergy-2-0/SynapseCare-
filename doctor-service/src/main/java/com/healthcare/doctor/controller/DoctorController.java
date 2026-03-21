package com.healthcare.doctor.controller;

import com.healthcare.doctor.dto.ApiResponse;
import com.healthcare.doctor.dto.AvailabilitySlotDto;
import com.healthcare.doctor.dto.DoctorDto;
import com.healthcare.doctor.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping
    public ResponseEntity<ApiResponse<DoctorDto>> createDoctor(@Valid @RequestBody DoctorDto doctorDto) {
        DoctorDto created = doctorService.createDoctor(doctorDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Doctor created", created));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorDto>> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", doctorService.getDoctorById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorDto>>> getAllDoctors() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", doctorService.getAllDoctors()));
    }

    @PostMapping("/{id}/slots")
    public ResponseEntity<ApiResponse<AvailabilitySlotDto>> addSlot(
            @PathVariable Long id,
            @RequestBody AvailabilitySlotDto dto) {
        AvailabilitySlotDto created = doctorService.addSlot(id, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Slot added", created));
    }

    @GetMapping("/{id}/slots")
    public ResponseEntity<ApiResponse<List<AvailabilitySlotDto>>> getSlots(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", doctorService.getSlots(id, date)));
    }
}
