package com.healthcare.telemedicine.mq;

import com.healthcare.telemedicine.config.RabbitMQConfig;
import com.healthcare.telemedicine.dto.AppointmentEventDto;
import com.healthcare.telemedicine.dto.CreateSessionRequest;
import com.healthcare.telemedicine.service.TelemedicineSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentEventListener {

    private final TelemedicineSessionService sessionService;

    @RabbitListener(queues = RabbitMQConfig.APPOINTMENT_EVENT_QUEUE)
    public void handleAppointmentEvent(AppointmentEventDto event) {
        log.info("Received appointment event: {} for appointment {}", event.getEventType(), event.getAppointmentId());

        if ("TELEMEDICINE_LINK_READY".equals(event.getEventType()) || "APPOINTMENT_CONFIRMED".equals(event.getEventType())) {
            
            if ("TELEMEDICINE".equalsIgnoreCase(event.getConsultationType()) || "VIDEO".equalsIgnoreCase(event.getConsultationType())) {
                log.info("Initializing telemedicine session for confirmed appointment: {}", event.getAppointmentId());
                
                LocalDateTime scheduledStart = null;
                if (event.getDate() != null && event.getTime() != null) {
                    scheduledStart = LocalDateTime.of(event.getDate(), event.getTime());
                }

                CreateSessionRequest request = CreateSessionRequest.builder()
                        .appointmentId(event.getAppointmentId())
                        .doctorId(event.getDoctorId())
                        .patientId(event.getPatientId())
                        .scheduledStartTime(scheduledStart)
                        .scheduledEndTime(scheduledStart != null ? scheduledStart.plusMinutes(30) : null)
                        .forceNew(false)
                        .build();

                try {
                    sessionService.createSession(request);
                    log.info("Successfully pre-created telemedicine session for appointment {}", event.getAppointmentId());
                } catch (Exception e) {
                    log.error("Failed to pre-create telemedicine session for appointment {}: {}", 
                            event.getAppointmentId(), e.getMessage());
                }
            }
        }
    }
}
