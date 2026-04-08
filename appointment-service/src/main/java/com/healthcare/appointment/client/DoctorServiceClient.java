package com.healthcare.appointment.client;

import com.healthcare.appointment.dto.client.AvailableSlotClientDto;
import com.healthcare.appointment.dto.client.DoctorProfileClientDto;
import com.healthcare.appointment.dto.DoctorAvailabilityDto;
import com.healthcare.appointment.exception.DoctorServiceUnavailableException;
import com.healthcare.appointment.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DoctorServiceClient {

    private final RestTemplate restTemplate;

    @Value("${doctor-service.base-url}")
    private String doctorServiceBaseUrl;

    public List<DoctorProfileClientDto> searchDoctors(String specialization, BigDecimal minFee, BigDecimal maxFee) {
        try {
            String url = UriComponentsBuilder
                    .fromHttpUrl(doctorServiceBaseUrl + "/api/doctors/search")
                    .queryParamIfPresent("specialization", Optional.ofNullable(specialization))
                    .queryParamIfPresent("minFee", Optional.ofNullable(minFee))
                    .queryParamIfPresent("maxFee", Optional.ofNullable(maxFee))
                    .toUriString();

            ResponseEntity<DoctorProfileClientDto[]> response =
                    restTemplate.getForEntity(url, DoctorProfileClientDto[].class);

            DoctorProfileClientDto[] body = response.getBody();
            return body == null ? List.of() : Arrays.asList(body);
        } catch (RestClientException ex) {
            throw new DoctorServiceUnavailableException("Doctor service is currently unavailable");
        }
    }

    public DoctorProfileClientDto getDoctorById(Long doctorId) {
        try {
            return restTemplate.getForObject(
                    doctorServiceBaseUrl + "/api/doctors/" + doctorId,
                    DoctorProfileClientDto.class
            );
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResourceNotFoundException("Doctor not found: " + doctorId);
        } catch (RestClientException ex) {
            throw new DoctorServiceUnavailableException("Doctor service is currently unavailable");
        }
    }

    public List<AvailableSlotClientDto> getAvailableSlots(Long doctorId, LocalDate date) {
        String url = UriComponentsBuilder
                .fromHttpUrl(doctorServiceBaseUrl + "/api/doctors/" + doctorId + "/available-slots")
                .queryParam("date", date)
                .toUriString();

        try {
            ResponseEntity<AvailableSlotClientDto[]> response =
                    restTemplate.getForEntity(url, AvailableSlotClientDto[].class);

            AvailableSlotClientDto[] body = response.getBody();
            return body == null ? List.of() : Arrays.asList(body);
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResourceNotFoundException("Clinical availability node not found for doctor ID: " + doctorId);
        } catch (RestClientException ex) {
            throw new DoctorServiceUnavailableException("Doctor service is currently unavailable for availability synchronization");
        }
    }

    public void syncAvailabilityToDoctorService(List<DoctorAvailabilityDto> dtos, Long userId) {
        String url = doctorServiceBaseUrl + "/api/doctors/availability";

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Id", String.valueOf(userId));
        headers.set("X-User-Role", "DOCTOR");
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            for (DoctorAvailabilityDto dto : dtos) {
                Map<String, Object> request = Map.of(
                        "dayOfWeek", normalizeDoctorServiceDay(dto.getDayOfWeek()),
                "startTime", dto.getStartTime() != null ? dto.getStartTime().toString() : null,
                "endTime", dto.getEndTime() != null ? dto.getEndTime().toString() : null,
                        "isActive", Boolean.TRUE.equals(dto.getIsWorking()),
                        "slotDuration", dto.getSlotDuration(),
                        "bufferTime", dto.getBufferTime()
                );

                restTemplate.exchange(
                        url,
                        HttpMethod.POST,
                        new HttpEntity<>(request, headers),
                        Void.class
                );
            }
        } catch (HttpClientErrorException ex) {
            throw new DoctorServiceUnavailableException("Doctor service availability sync failed: " + ex.getResponseBodyAsString());
        } catch (RestClientException ex) {
            throw new DoctorServiceUnavailableException("Doctor service availability sync failed: " + ex.getMessage());
        }
    }

    private String normalizeDoctorServiceDay(String day) {
        if (day == null) return "MONDAY";

        String normalized = day.trim().toUpperCase();
        return switch (normalized) {
            case "MON", "MONDAY" -> "MONDAY";
            case "TUE", "TUES", "TUESDAY" -> "TUESDAY";
            case "WED", "WEDNESDAY" -> "WEDNESDAY";
            case "THU", "THUR", "THURS", "THURSDAY" -> "THURSDAY";
            case "FRI", "FRIDAY" -> "FRIDAY";
            case "SAT", "SATURDAY" -> "SATURDAY";
            case "SUN", "SUNDAY" -> "SUNDAY";
            default -> "MONDAY";
        };
    }
}