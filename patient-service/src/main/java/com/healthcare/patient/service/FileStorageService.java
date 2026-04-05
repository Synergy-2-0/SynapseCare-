package com.healthcare.patient.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    private final Path rootLocation = Paths.get("patient-service/src/main/resources/static/uploads");

    public FileStorageService() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            log.error("Could not initialize storage directory", e);
        }
    }

    public String storeFile(MultipartFile file, String subFolder) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Failed to store empty file.");
            }
            
            Path folderPath = rootLocation.resolve(subFolder);
            Files.createDirectories(folderPath);

            String originalFileName = Objects.requireNonNull(file.getOriginalFilename());
            String fileName = UUID.randomUUID() + "_" + originalFileName;
            Path targetLocation = folderPath.resolve(fileName);
            
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            // Return URL (assuming /uploads is mapped to static resources)
            return "/uploads/" + subFolder + "/" + fileName;
        } catch (IOException e) {
            log.error("Failed to store file", e);
            throw new RuntimeException("Could not store file. Please try again!", e);
        }
    }
}
