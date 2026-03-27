package com.healthcare.appointment.controller;

import com.healthcare.appointment.dto.ApiResponse;
import com.healthcare.appointment.dto.AppointmentDto;
import com.healthcare.appointment.entity.AppointmentStatus;
import com.healthcare.appointment.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.healthcare.appointment.client.DoctorServiceClient;
import com.healthcare.appointment.dto.client.DoctorProfileClientDto;

import java.math.BigDecimal;

import java.util.List;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final DoctorServiceClient doctorServiceClient;

    @PostMapping("/book")
    public ResponseEntity<ApiResponse<AppointmentDto>> bookAppointment(@Valid @RequestBody AppointmentDto dto) {
        AppointmentDto booked = appointmentService.bookAppointment(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Appointment booked successfully", booked));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentDto>> cancelAppointment(@PathVariable("id") Long id) {
        AppointmentDto cancelled = appointmentService.cancelAppointment(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment cancelled", cancelled));
    }

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<ApiResponse<AppointmentDto>> rescheduleAppointment(
            @PathVariable("id") Long id,
            @Valid @RequestBody AppointmentDto dto) {
        AppointmentDto rescheduled = appointmentService.rescheduleAppointment(id, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment rescheduled", rescheduled));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentDto>> getAppointmentById(@PathVariable("id") Long id) {
        AppointmentDto appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment fetched", appointment));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<AppointmentDto>>> getAppointmentsByPatient(@PathVariable("patientId") Long patientId) {
        List<AppointmentDto> appointments = appointmentService.getAppointmentsByPatient(patientId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Patient appointments fetched", appointments));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<AppointmentDto>>> getAppointmentsByDoctor(@PathVariable("doctorId") Long doctorId) {
        List<AppointmentDto> appointments = appointmentService.getAppointmentsByDoctor(doctorId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Doctor appointments fetched", appointments));
    }

    @GetMapping("/doctors/search")
    public ResponseEntity<ApiResponse<List<DoctorProfileClientDto>>> searchDoctors(
            @RequestParam(value = "specialization", required = false) String specialization,
            @RequestParam(value = "minFee", required = false) BigDecimal minFee,
            @RequestParam(value = "maxFee", required = false) BigDecimal maxFee) {

        List<DoctorProfileClientDto> doctors = doctorServiceClient.searchDoctors(specialization, minFee, maxFee);
        return ResponseEntity.ok(new ApiResponse<>(true, "Doctors fetched from doctor-service", doctors));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AppointmentDto>> updateStatus(
            @PathVariable("id") Long id,
            @RequestParam("status") AppointmentStatus status) {
        AppointmentDto updated = appointmentService.updateStatus(id, status);
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment status updated", updated));
    }
    
}