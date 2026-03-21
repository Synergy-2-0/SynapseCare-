package com.healthcare.appointment.service;

import com.healthcare.appointment.dto.AppointmentDto;
import com.healthcare.appointment.entity.Appointment;
import com.healthcare.appointment.entity.AppointmentStatus;
import com.healthcare.appointment.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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

        Appointment appointment = Appointment.builder()
                .patientId(dto.getPatientId())
                .doctorId(dto.getDoctorId())
                .date(dto.getDate())
                .time(dto.getTime())
                .status(AppointmentStatus.CONFIRMED)
                .build();
                
        appointment = appointmentRepository.save(appointment);
        return mapToDto(appointment);
    }

    public AppointmentDto cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment = appointmentRepository.save(appointment);
        return mapToDto(appointment);
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
                .status(entity.getStatus())
                .build();
    }
}
