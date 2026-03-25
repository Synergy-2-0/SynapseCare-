package com.healthcare.appointment.service;

import com.healthcare.appointment.dto.AppointmentDto;
import com.healthcare.appointment.entity.Appointment;
import com.healthcare.appointment.entity.AppointmentStatus;
import com.healthcare.appointment.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentDto bookAppointment(AppointmentDto dto) {
        boolean isBooked = appointmentRepository.existsByDoctorIdAndDateAndTimeAndStatus(
                dto.getDoctorId(), dto.getDate(), dto.getTime(), AppointmentStatus.CONFIRMED);
        
        if (isBooked) {
            throw new RuntimeException("Doctor is already booked for this slot");
        }

        // Token Generation: Count existing appointments for this doctor on this day
        long existingCount = appointmentRepository.countByDoctorIdAndDate(dto.getDoctorId(), dto.getDate());
        int tokenNumber = (int) existingCount + 1;

        Appointment appointment = Appointment.builder()
                .patientId(dto.getPatientId())
                .doctorId(dto.getDoctorId())
                .date(dto.getDate())
                .time(dto.getTime())
                .fee(dto.getFee() != null ? dto.getFee() : 1500.0)
                .notes(dto.getNotes())
                .consultationType(dto.getConsultationType() != null ? dto.getConsultationType() : "VIDEO")
                .tokenNumber(tokenNumber)
                .status(AppointmentStatus.PENDING) 
                .build();
                
        appointment = appointmentRepository.save(appointment);
        return mapToDto(appointment);
    }

    public void completeAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);
    }

    public void rejectAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        appointment.setStatus(AppointmentStatus.REJECTED);
        appointmentRepository.save(appointment);
    }

    public void confirmAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointmentRepository.save(appointment);
    }

    public AppointmentDto cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment = appointmentRepository.save(appointment);
        return mapToDto(appointment);
    }
    
    public List<AppointmentDto> getAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToDto)
                .collect(java.util.stream.Collectors.toList());
    }

    public List<AppointmentDto> getAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId).stream()
                .map(this::mapToDto)
                .collect(java.util.stream.Collectors.toList());
    }

    public AppointmentDto rescheduleAppointment(Long id, AppointmentDto dto) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
                
        boolean isBooked = appointmentRepository.existsByDoctorIdAndDateAndTimeAndStatus(
                appointment.getDoctorId(), dto.getDate(), dto.getTime(), AppointmentStatus.CONFIRMED);
        
        if (isBooked) {
            throw new RuntimeException("Doctor is already booked for the new slot");
        }

        appointment.setDate(dto.getDate());
        appointment.setTime(dto.getTime());
        appointment = appointmentRepository.save(appointment);
        return mapToDto(appointment);
    }

    private AppointmentDto mapToDto(Appointment entity) {
        return AppointmentDto.builder()
                .id(entity.getId())
                .patientId(entity.getPatientId())
                .doctorId(entity.getDoctorId())
                .date(entity.getDate())
                .time(entity.getTime())
                .fee(entity.getFee())
                .notes(entity.getNotes())
                .consultationType(entity.getConsultationType())
                .tokenNumber(entity.getTokenNumber())
                .status(entity.getStatus())
                .build();
    }
}
