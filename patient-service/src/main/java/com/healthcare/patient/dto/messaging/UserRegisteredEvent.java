package com.healthcare.patient.dto.messaging;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRegisteredEvent {
    private Long userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Set<String> roles;

    private String bloodGroup;
    private String allergies;
    private String chronicIllnesses;
    private String height;
    private String weight;
    private String emergencyContact;
    private String dob;
    private String gender;
    private String profileImageUrl;
}
