package com.healthcare.prescription.controller;

import com.healthcare.prescription.dto.PrescriptionDto;
import com.healthcare.prescription.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @PostMapping("/create")
    public ResponseEntity<?> createPrescription(@RequestBody PrescriptionDto dto) {
        PrescriptionDto created = prescriptionService.createPrescription(dto);
        return ResponseEntity.ok(Map.of("message", "Prescription created successfully", "data", created));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrescriptionDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(prescriptionService.getById(id));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<PrescriptionDto>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(prescriptionService.getByPatientId(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<PrescriptionDto>> getByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(prescriptionService.getByDoctorId(doctorId));
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<List<PrescriptionDto>> getByAppointment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(prescriptionService.getByAppointmentId(appointmentId));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
        byte[] pdfContent = prescriptionService.generatePdf(id);
        PrescriptionDto prescription = prescriptionService.getById(id);

        String filename = String.format("prescription_%d_%s.pdf",
                id,
                prescription.getPatientName() != null
                        ? prescription.getPatientName().replaceAll("\\s+", "_")
                        : "patient");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(pdfContent.length);

        return new ResponseEntity<>(pdfContent, headers, HttpStatus.OK);
    }
}
