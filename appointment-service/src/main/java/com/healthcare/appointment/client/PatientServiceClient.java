package com.healthcare.appointment.client;

import com.healthcare.appointment.dto.client.PatientApiResponse;
import com.healthcare.appointment.dto.client.PatientClientDto;
import com.healthcare.appointment.exception.PatientServiceUnavailableException;
import com.healthcare.appointment.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class PatientServiceClient {

    private final RestTemplate restTemplate;

    @Value("${patient-service.base-url}")
    private String patientServiceBaseUrl;

    public PatientClientDto getPatientById(Long patientId) {
        try {
            PatientApiResponse response = restTemplate.getForObject(
                    patientServiceBaseUrl + "/api/patients/" + patientId,
                    PatientApiResponse.class
            );

            if (response == null || !response.isSuccess() || response.getData() == null) {
                throw new ResourceNotFoundException("Patient not found: " + patientId);
            }

            return response.getData();
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResourceNotFoundException("Patient not found: " + patientId);
        } catch (HttpClientErrorException ex) {
            throw new PatientServiceUnavailableException("Patient service request failed");
        } catch (RestClientException ex) {
            throw new PatientServiceUnavailableException("Patient service is currently unavailable");
        }
    }
}
