package com.healthcare.integration.service;

import org.springframework.stereotype.Service;

@Service
public class AiSymptomService {
    
    public String analyzeSymptoms(String symptoms) {
        if (symptoms.toLowerCase().contains("chest pain")) {
            return "Critical: Please seek emergency medical attention immediately!";
        } else if (symptoms.toLowerCase().contains("fever")) {
            return "Recommendation: Rest, stay hydrated, and consult a general physician if it persists.";
        }
        return "Recommendation: We suggest booking a general consultation out of caution.";
    }
}
