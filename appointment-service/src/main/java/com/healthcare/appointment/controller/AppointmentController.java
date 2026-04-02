package com.healthcare.appointment.controller;

import com.healthcare.appointment.client.DoctorServiceClient;
import com.healthcare.appointment.dto.BlockSlotRequest;
import com.healthcare.appointment.dto.ApiResponse;
import com.healthcare.appointment.dto.AppointmentDto;
import com.healthcare.appointment.dto.RescheduleAppointmentDto;
import com.healthcare.appointment.dto.client.DoctorProfileClientDto;
import com.healthcare.appointment.entity.AppointmentStatus;
import com.healthcare.appointment.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
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

        @PostMapping("/doctor/{doctorId}/blocked-slots")
        public ResponseEntity<ApiResponse<AppointmentDto>> blockSlot(
            @PathVariable("doctorId") Long doctorId,
            @Valid @RequestBody BlockSlotRequest request,
            @AuthenticationPrincipal com.healthcare.appointment.security.UserPrincipal userPrincipal) {
        AppointmentDto blocked = appointmentService.blockSlot(
            doctorId,
            userPrincipal != null ? userPrincipal.getUserId() : null,
            request
        );
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse<>(true, "Slot blocked successfully", blocked));
        }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentDto>> cancelAppointment(@PathVariable("id") Long id) {
        AppointmentDto cancelled = appointmentService.cancelAppointment(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment cancelled", cancelled));
    }

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<ApiResponse<AppointmentDto>> rescheduleAppointment(
            @PathVariable("id") Long id,
            @Valid @RequestBody RescheduleAppointmentDto dto) {
        AppointmentDto rescheduled = appointmentService.rescheduleAppointment(id, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment rescheduled", rescheduled));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<String>> acceptAppointment(@PathVariable("id") Long id) {
        appointmentService.confirmAppointment(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment accepted successfully", "CONFIRMED"));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<String>> rejectAppointment(@PathVariable("id") Long id) {
        appointmentService.rejectAppointment(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Appointment rejected", "REJECTED"));
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

    @GetMapping("/doctor/{doctorId}/available-slots")
    public ResponseEntity<List<com.healthcare.appointment.dto.client.AvailableSlotClientDto>> getAvailableSlots(
            @PathVariable("doctorId") Long doctorId,
            @RequestParam("date") java.time.LocalDate date) {
        return ResponseEntity.ok(appointmentService.getFilteredAvailableSlots(doctorId, date));
    }

    @GetMapping("/doctor/{doctorId}/patients")
    public ResponseEntity<ApiResponse<List<com.healthcare.appointment.dto.client.PatientClientDto>>> getPatientsByDoctor(@PathVariable("doctorId") Long doctorId) {
        List<com.healthcare.appointment.dto.client.PatientClientDto> patients = appointmentService.getPatientsByDoctor(doctorId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Doctor's patients fetched successfully", patients));
    }

    @GetMapping("/doctor/{doctorId}/booked-slots")
    public ResponseEntity<List<java.time.LocalTime>> getBookedSlots(
            @PathVariable("doctorId") Long doctorId,
            @RequestParam("date") java.time.LocalDate date) {
        return ResponseEntity.ok(appointmentService.getBookedSlots(doctorId, date));
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
