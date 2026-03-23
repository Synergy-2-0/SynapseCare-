package com.healthcare.appointment.service;

import com.healthcare.appointment.dto.AppointmentDto;
import com.healthcare.appointment.entity.Appointment;
import com.healthcare.appointment.entity.AppointmentStatus;
import com.healthcare.appointment.exception.ResourceNotFoundException;
import com.healthcare.appointment.exception.SlotConflictException;
import com.healthcare.appointment.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentDto bookAppointment(AppointmentDto dto) {
        boolean isBooked = appointmentRepository.existsByDoctorIdAndDateAndTimeAndStatus(
                dto.getDoctorId(), dto.getDate(), dto.getTime(), AppointmentStatus.CONFIRMED);

        if (isBooked) {
            throw new SlotConflictException("Doctor is already booked for this slot");
        }

        Appointment appointment = Appointment.builder()
                .patientId(dto.getPatientId())
                .doctorId(dto.getDoctorId())
                .date(dto.getDate())
                .time(dto.getTime())
                .status(AppointmentStatus.PENDING) 
                .build();

        appointment = appointmentRepository.save(appointment);
        return mapToDto(appointment);
    }

    public AppointmentDto cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment = appointmentRepository.save(appointment);
        return mapToDto(appointment);
    }

    public AppointmentDto rescheduleAppointment(Long id, AppointmentDto dto) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        boolean isBooked = appointmentRepository.existsByDoctorIdAndDateAndTimeAndStatus(
                appointment.getDoctorId(), dto.getDate(), dto.getTime(), AppointmentStatus.CONFIRMED);

        if (isBooked) {
            throw new SlotConflictException("Doctor is already booked for the new slot");
        }

        appointment.setDate(dto.getDate());
        appointment.setTime(dto.getTime());
        appointment = appointmentRepository.save(appointment);
        return mapToDto(appointment);
    }

    public AppointmentDto getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        return mapToDto(appointment);
    }

    public List<AppointmentDto> getAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientIdOrderByDateAscTimeAsc(patientId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<AppointmentDto> getAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorIdOrderByDateAscTimeAsc(doctorId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public AppointmentDto updateStatus(Long id, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        appointment.setStatus(status);
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
                .status(entity.getStatus())
                .build();
    }
}