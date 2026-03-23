package com.synapscare.doctor.service;

import com.synapscare.doctor.dto.request.AvailabilitySlotRequest;
import com.synapscare.doctor.dto.response.AvailabilitySlotResponse;
import com.synapscare.doctor.entity.AvailabilitySlot;
import com.synapscare.doctor.exception.Exceptions.*;
import com.synapscare.doctor.repository.AvailabilitySlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final AvailabilitySlotRepository slotRepository;

    public List<AvailabilitySlotResponse> getAvailableSlots(Long doctorUserId) {
        return slotRepository.findByDoctorUserIdAndIsAvailableTrue(doctorUserId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<AvailabilitySlotResponse> getAllSlots(Long doctorUserId) {
        return slotRepository.findByDoctorUserId(doctorUserId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public AvailabilitySlotResponse addSlot(Long doctorUserId, AvailabilitySlotRequest req) {
        if (req.getEndTime().isBefore(req.getStartTime()) ||
                req.getEndTime().equals(req.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }
        if (slotRepository.existsByDoctorUserIdAndDayOfWeekAndStartTime(
                doctorUserId, req.getDayOfWeek(), req.getStartTime())) {
            throw new DuplicateResourceException("A slot already exists for this day and start time");
        }
        AvailabilitySlot slot = AvailabilitySlot.builder()
                .doctorUserId(doctorUserId)
                .dayOfWeek(req.getDayOfWeek())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .slotDurationMinutes(req.getSlotDurationMinutes())
                .isAvailable(req.isAvailable())
                .build();
        return toResponse(slotRepository.save(slot));
    }

    @Transactional
    public AvailabilitySlotResponse updateSlot(Long doctorUserId, Long slotId,
                                               AvailabilitySlotRequest req) {
        AvailabilitySlot slot = slotRepository.findByIdAndDoctorUserId(slotId, doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found or access denied"));
        slot.setDayOfWeek(req.getDayOfWeek());
        slot.setStartTime(req.getStartTime());
        slot.setEndTime(req.getEndTime());
        slot.setSlotDurationMinutes(req.getSlotDurationMinutes());
        slot.setAvailable(req.isAvailable());
        return toResponse(slotRepository.save(slot));
    }

    @Transactional
    public void deleteSlot(Long doctorUserId, Long slotId) {
        AvailabilitySlot slot = slotRepository.findByIdAndDoctorUserId(slotId, doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found or access denied"));
        slotRepository.delete(slot);
    }

    private AvailabilitySlotResponse toResponse(AvailabilitySlot s) {
        return AvailabilitySlotResponse.builder()
                .id(s.getId())
                .doctorUserId(s.getDoctorUserId())
                .dayOfWeek(s.getDayOfWeek())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .slotDurationMinutes(s.getSlotDurationMinutes())
                .isAvailable(s.isAvailable())
                .build();
    }
}