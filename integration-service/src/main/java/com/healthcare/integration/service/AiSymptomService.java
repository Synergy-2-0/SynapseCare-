package com.healthcare.integration.service;

import org.springframework.stereotype.Service;

@Service
public class AiSymptomService {
    
    public String analyzeSymptoms(String symptoms) {
        String s = symptoms.toLowerCase();
        
        StringBuilder advice = new StringBuilder();
        advice.append("=== AI Preliminary Symptom Analysis ===\n");
        
        if (s.contains("chest pain") || s.contains("breathing") || s.contains("head injury")) {
            advice.append("Possible concern: High Severity Cardiac/Respiratory or Neurological issue.\n");
            advice.append("Suggested specialty: EMERGENCY CARE / CARDIOLOGIST.\n");
            advice.append("CRITICAL: Seek emergency medical attention immediately!\n");
        } else if (s.contains("skin") || s.contains("rash") || s.contains("itch")) {
            advice.append("Possible concern: Dermatological reaction or infection.\n");
            advice.append("Suggested specialty: DERMATOLOGIST.\n");
            advice.append("Recommendation: Avoid scratching. Consult a doctor for a proper diagnosis.\n");
        } else if (s.contains("fever") || s.contains("cough") || s.contains("sore throat")) {
            advice.append("Possible concern: Common viral or bacterial respiratory infection.\n");
            advice.append("Suggested specialty: GENERAL PHYSICIAN.\n");
            advice.append("Recommendation: Rest, stay hydrated, and monitor temperature.\n");
        } else {
            advice.append("Possible concern: Non-specific symptoms detected.\n");
            advice.append("Suggested specialty: GENERAL PHYSICIAN.\n");
            advice.append("Recommendation: Please consult a doctor for a professional evaluation.\n");
        }

        advice.append("\nWARNING: This is an AI-generated suggestion, not a medical diagnosis. Please consult a licensed professional for any healthcare decisions.");
        return advice.toString();
    }
}
