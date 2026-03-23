package com.synapscare.doctor.service;

import com.synapscare.doctor.dto.request.DoctorProfileRequest;
import com.synapscare.doctor.dto.response.DoctorProfileResponse;
import com.synapscare.doctor.entity.DoctorProfile;
import com.synapscare.doctor.exception.Exceptions.*;
import com.synapscare.doctor.repository.DoctorProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorProfileService {

    private final DoctorProfileRepository profileRepository;

    public List<DoctorProfileResponse> listDoctors(String specialty, String search) {
        if (search != null && !search.isBlank()) {
            return profileRepository
                    .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(search, search)
                    .stream().map(this::toResponse).collect(Collectors.toList());
        }
        if (specialty != null && !specialty.isBlank()) {
            return profileRepository
                    .findBySpecialtyIgnoreCaseAndIsActiveTrue(specialty)
                    .stream().map(this::toResponse).collect(Collectors.toList());
        }
        return profileRepository.findByIsActiveTrue()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public DoctorProfileResponse getByUserId(Long userId) {
        return toResponse(findByUserIdOrThrow(userId));
    }

    @Transactional
    public DoctorProfileResponse createProfile(Long userId, DoctorProfileRequest req) {
        if (profileRepository.existsByUserId(userId)) {
            throw new DuplicateResourceException("Profile already exists for this doctor");
        }
        DoctorProfile profile = DoctorProfile.builder()
                .userId(userId)
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .specialty(req.getSpecialty())
                .qualifications(req.getQualifications())
                .licenseNumber(req.getLicenseNumber())
                .bio(req.getBio())
                .profilePictureUrl(req.getProfilePictureUrl())
                .yearsOfExperience(req.getYearsOfExperience())
                .consultationFee(req.getConsultationFee())
                .hospital(req.getHospital())
                .phoneNumber(req.getPhoneNumber())
                .isActive(true)
                .build();
        return toResponse(profileRepository.save(profile));
    }

    @Transactional
    public DoctorProfileResponse updateProfile(Long userId, DoctorProfileRequest req) {
        DoctorProfile profile = findByUserIdOrThrow(userId);
        profile.setFirstName(req.getFirstName());
        profile.setLastName(req.getLastName());
        profile.setSpecialty(req.getSpecialty());
        profile.setQualifications(req.getQualifications());
        profile.setBio(req.getBio());
        profile.setProfilePictureUrl(req.getProfilePictureUrl());
        profile.setYearsOfExperience(req.getYearsOfExperience());
        profile.setConsultationFee(req.getConsultationFee());
        profile.setHospital(req.getHospital());
        profile.setPhoneNumber(req.getPhoneNumber());
        return toResponse(profileRepository.save(profile));
    }

    private DoctorProfile findByUserIdOrThrow(Long userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for userId: " + userId));
    }

    public DoctorProfileResponse toResponse(DoctorProfile p) {
        return DoctorProfileResponse.builder()
                .id(p.getId())
                .userId(p.getUserId())
                .firstName(p.getFirstName())
                .lastName(p.getLastName())
                .fullName(p.getFirstName() + " " + p.getLastName())
                .specialty(p.getSpecialty())
                .qualifications(p.getQualifications())
                .licenseNumber(p.getLicenseNumber())
                .bio(p.getBio())
                .profilePictureUrl(p.getProfilePictureUrl())
                .yearsOfExperience(p.getYearsOfExperience())
                .consultationFee(p.getConsultationFee())
                .hospital(p.getHospital())
                .phoneNumber(p.getPhoneNumber())
                .isActive(p.isActive())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}