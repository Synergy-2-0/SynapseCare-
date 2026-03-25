package com.synapscare.aisymptomcheckerservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.synapscare.aisymptomcheckerservice.dto.SymptomRequest;
import com.synapscare.aisymptomcheckerservice.dto.SymptomResponse;
import com.synapscare.aisymptomcheckerservice.exception.SymptomCheckException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SymptomCheckerService {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    private static final String SYSTEM_PROMPT = """
            You are an AI-powered medical triage assistant integrated into SynapseCare, a telemedicine platform.
            Your role is to analyse patient-reported symptoms and return a structured preliminary health assessment.
            
            IMPORTANT RULES:
            - You are NOT diagnosing. This is a preliminary triage only.
            - Always recommend the patient consult a qualified doctor.
            - Always include a clear medical disclaimer.
            - Urgency levels must be one of: LOW, MODERATE, HIGH, EMERGENCY.
            
            You MUST respond with ONLY valid JSON in the following exact format (no markdown, no code fences):
            {
              "analysis": "<concise 2-3 sentence summary of the symptoms>",
              "possibleConditions": ["<condition 1>", "<condition 2>", "<condition 3>"],
              "recommendedSpecialties": ["<specialty 1>", "<specialty 2>"],
              "urgencyLevel": "<LOW|MODERATE|HIGH|EMERGENCY>",
              "disclaimer": "This is a preliminary AI assessment only and does not constitute medical advice. Please consult a qualified healthcare professional for a proper diagnosis and treatment."
            }
            """;

    public SymptomResponse analyseSymptoms(SymptomRequest request) {
        String userMessage = buildUserMessage(request);

        log.debug("Sending symptom check request to Mistral AI for symptoms: '{}'", request.symptoms());

        try {
            String rawResponse = chatClient.prompt()
                    .system(SYSTEM_PROMPT)
                    .user(userMessage)
                    .call()
                    .content();

            log.debug("Raw Mistral AI response: {}", rawResponse);

            return parseResponse(rawResponse);

        } catch (Exception e) {
            log.error("Error calling Mistral AI: {}", e.getMessage(), e);
            throw new SymptomCheckException("Unable to process symptom check at this time. Please try again later.", e);
        }
    }

    private String buildUserMessage(SymptomRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append("Patient symptoms: ").append(request.symptoms());

        if (request.ageYears() != null) {
            sb.append("\nPatient age: ").append(request.ageYears()).append(" years");
        }
        if (request.gender() != null && !request.gender().isBlank()) {
            sb.append("\nPatient gender: ").append(request.gender());
        }

        return sb.toString();
    }

    private SymptomResponse parseResponse(String raw) {
        // Strip any accidental markdown fences from the model response
        String cleaned = raw.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceAll("^```[a-zA-Z]*\\n?", "").replaceAll("```$", "").trim();
        }

        try {
            return objectMapper.readValue(cleaned, SymptomResponse.class);
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse AI JSON response. Raw: {}", raw);
            // Fallback: return the raw text as the analysis field
            return new SymptomResponse(
                    raw,
                    java.util.List.of("Unable to parse specific conditions"),
                    java.util.List.of("General Practitioner"),
                    "MODERATE",
                    "This is a preliminary AI assessment only and does not constitute medical advice. Please consult a qualified healthcare professional."
            );
        }
    }
}
