package com.healthcare.appointment.dto.client;

import lombok.Data;

@Data
public class PatientApiResponse {
    private boolean success;
    private String message;
    private PatientClientDto data;
}
