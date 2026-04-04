package com.healthcare.appointment.service;

import com.healthcare.appointment.entity.Appointment;
import com.healthcare.appointment.entity.AppointmentStatus;
import com.healthcare.appointment.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled task that expires PENDING appointments whose payment window has lapsed.
 *
 * When a patient books a slot, the appointment is created with status PENDING immediately.
 * This blocks the slot from being booked by others. If the patient abandons the payment,
 * that slot would remain permanently locked without this cleanup job.
 *
 * This scheduler runs every 2 minutes and cancels any PENDING appointment that was
 * created more than 15 minutes ago without progressing to a paid/confirmed state.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentExpiryScheduler {

    // Payment window: how long a PENDING slot is held before being released
    private static final int PAYMENT_WINDOW_MINUTES = 15;

    private final AppointmentRepository appointmentRepository;
    private final AppointmentEventProducer appointmentEventProducer;

    /**
     * Runs every 2 minutes to scan for and expire stale PENDING bookings.
     */
    @Scheduled(fixedRate = 2 * 60 * 1000)
    @Transactional
    public void expireAbandonedPendingAppointments() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(PAYMENT_WINDOW_MINUTES);

        List<Appointment> stale = appointmentRepository.findByStatusAndCreatedAtBefore(
                AppointmentStatus.PENDING, cutoff);

        if (stale.isEmpty()) {
            return;
        }

        log.info("[PaymentWindowExpiry] Found {} stale PENDING appointment(s) older than {} minutes. Releasing slots...",
                stale.size(), PAYMENT_WINDOW_MINUTES);

        for (Appointment appointment : stale) {
            appointment.setStatus(AppointmentStatus.CANCELLED);
            appointmentRepository.save(appointment);

            log.info("[PaymentWindowExpiry] Released slot: appointmentId={}, doctorId={}, date={}, time={}",
                    appointment.getId(), appointment.getDoctorId(),
                    appointment.getDate(), appointment.getTime());

            // Notify downstream services so they can clean up (e.g. cancel payment record)
            try {
                appointmentEventProducer.sendAppointmentEvent(
                    com.healthcare.appointment.dto.AppointmentEvent.builder()
                        .eventType("APPOINTMENT_PAYMENT_EXPIRED")
                        .appointmentId(appointment.getId())
                        .patientId(appointment.getPatientId())
                        .doctorId(appointment.getDoctorId())
                        .date(appointment.getDate())
                        .time(appointment.getTime())
                        .status(AppointmentStatus.CANCELLED)
                        .occurredAt(LocalDateTime.now())
                        .build()
                );
            } catch (Exception e) {
                log.warn("[PaymentWindowExpiry] Could not publish expiry event for appointmentId={}: {}",
                        appointment.getId(), e.getMessage());
            }
        }

        log.info("[PaymentWindowExpiry] Released {} slot(s) successfully.", stale.size());
    }
}
