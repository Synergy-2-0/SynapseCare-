package com.healthcare.appointment.controller;

import com.healthcare.appointment.dto.ApiResponse;
import com.healthcare.appointment.dto.AppointmentDto;
import com.healthcare.appointment.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping("/book")
    public ResponseEntity<ApiResponse<AppointmentDto>> bookAppointment(@RequestBody AppointmentDto dto) {
        AppointmentDto booked = appointmentService.bookAppointment(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Appointment booked successfully", booked));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentDto>> cancelAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment cancelled", appointmentService.cancelAppointment(id)));
    }

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<ApiResponse<AppointmentDto>> rescheduleAppointment(
            @PathVariable Long id, 
            @RequestBody AppointmentDto dto) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment rescheduled", appointmentService.rescheduleAppointment(id, dto)));
    }
}
