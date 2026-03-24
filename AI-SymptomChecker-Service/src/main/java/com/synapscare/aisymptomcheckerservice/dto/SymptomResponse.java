package com.synapscare.aisymptomcheckerservice.dto;

import java.util.List;

public record SymptomResponse(
        String analysis,
        List<String> possibleConditions,
        List<String> recommendedSpecialties,
        String urgencyLevel,
        String disclaimer
) {}
