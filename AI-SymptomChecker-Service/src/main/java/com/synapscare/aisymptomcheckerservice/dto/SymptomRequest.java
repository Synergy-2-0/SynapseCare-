package com.synapscare.aisymptomcheckerservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SymptomRequest(

        @NotBlank(message = "Symptoms description must not be blank")
        @Size(min = 5, max = 2000, message = "Symptoms description must be between 5 and 2000 characters")
        String symptoms,

        Integer ageYears,   // optional

        String gender       // optional – e.g. "male", "female", "other"
) {}
