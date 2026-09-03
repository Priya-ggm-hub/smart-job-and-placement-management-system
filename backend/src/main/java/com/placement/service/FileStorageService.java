package com.placement.service;

import com.placement.exception.BadRequestException;
import com.placement.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${app.upload.dir:uploads/resumes}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new BadRequestException("Could not create the directory where the uploaded files will be stored.");
        }
    }

    public String storeResume(MultipartFile file, Long studentId) {
        if (file.isEmpty()) {
            throw new BadRequestException("Failed to upload empty file.");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "resume.pdf");

        // Validate file extension and MIME type (PDF only)
        if (!originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new BadRequestException("Only PDF files are allowed for resume upload.");
        }

        String contentType = file.getContentType();
        if (contentType != null && !contentType.equalsIgnoreCase("application/pdf") && !contentType.equalsIgnoreCase("application/x-pdf")) {
            throw new BadRequestException("Invalid file type. Resume must be a valid PDF document.");
        }

        // Validate size (max 2MB)
        if (file.getSize() > 2 * 1024 * 1024) {
            throw new BadRequestException("Resume file size exceeds maximum limit of 2MB.");
        }

        try {
            // Generate unique filename: resume_studentId_uuid.pdf
            String uniqueFileName = "resume_" + studentId + "_" + UUID.randomUUID().toString().substring(0, 8) + ".pdf";
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return "uploads/resumes/" + uniqueFileName;
        } catch (IOException ex) {
            throw new BadRequestException("Could not store file " + originalFilename + ". Please try again!");
        }
    }

    public Resource loadFileAsResource(String filePath) {
        try {
            Path path = Paths.get(filePath).toAbsolutePath().normalize();
            if (!path.startsWith(this.fileStorageLocation) && !path.toFile().exists()) {
                // Fallback to resolving against storage location
                String filename = Paths.get(filePath).getFileName().toString();
                path = this.fileStorageLocation.resolve(filename).normalize();
            }

            Resource resource = new UrlResource(path.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found: " + filePath);
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File not found: " + filePath);
        }
    }
}
