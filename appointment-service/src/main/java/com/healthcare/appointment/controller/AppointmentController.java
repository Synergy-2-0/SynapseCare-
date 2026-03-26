package com.healthcare.appointment.controller;

import com.healthcare.appointment.dto.ApiResponse;
import com.healthcare.appointment.dto.AppointmentDto;
import com.healthcare.appointment.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.healthcare.appointment.client.DoctorServiceClient;

import java.math.BigDecimal;

import java.util.List;


@RestController
@RequestMapping("")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final DoctorServiceClient doctorServiceClient;

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AppointmentDto>> getAppointmentsByDoctor(@PathVariable Long doctorId) {
        List<AppointmentDto> appointments = appointmentService.getAppointmentsByDoctor(doctorId);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentDto>> getAppointmentsByPatient(@PathVariable Long patientId) {
        List<AppointmentDto> appointments = appointmentService.getAppointmentsByPatient(patientId);
        return ResponseEntity.ok(appointments);
    }

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
            @PathVariable Long id,
            @RequestBody AppointmentDto dto) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment rescheduled", appointmentService.rescheduleAppointment(id, dto)));
    }

        @PutMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<String>> acceptAppointment(@PathVariable Long id) {
        appointmentService.confirmAppointment(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment accepted successfully", "CONFIRMED"));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<String>> rejectAppointment(@PathVariable Long id) {
        appointmentService.rejectAppointment(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment rejected", "REJECTED"));
    }
}
