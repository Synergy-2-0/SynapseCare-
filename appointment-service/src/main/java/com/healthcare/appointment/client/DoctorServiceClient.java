package com.healthcare.appointment.client;

import com.healthcare.appointment.dto.client.AvailableSlotClientDto;
import com.healthcare.appointment.dto.client.DoctorProfileClientDto;
import com.healthcare.appointment.exception.DoctorServiceUnavailableException;
import com.healthcare.appointment.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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
        } catch (RestClientException ex) {
            throw new DoctorServiceUnavailableException("Doctor service is currently unavailable");
        }
    }
}