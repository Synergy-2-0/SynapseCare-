package com.healthcare.integration.service;

import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class TelemedicineService {
    
    public String generateMeetingLink(Long appointmentId) {
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        return "https://telemed.healthcare.com/meet/" + appointmentId + "-" + uniqueId;
    }
}
