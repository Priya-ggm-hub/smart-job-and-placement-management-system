package com.placement.controller;

import com.placement.dto.request.PasswordChangeRequest;
import com.placement.dto.request.ProfileUpdateRequest;
import com.placement.dto.response.StudentProfileDto;
import com.placement.entity.Skill;
import com.placement.repository.SkillRepository;
import com.placement.security.UserPrincipal;
import com.placement.service.FileStorageService;
import com.placement.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private SkillRepository skillRepository;

    @GetMapping("/profile")
    public ResponseEntity<StudentProfileDto> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        StudentProfileDto profile = studentService.getProfileByUserId(principal.getId());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<StudentProfileDto> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProfileUpdateRequest request) {
        StudentProfileDto updated = studentService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping(value = "/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StudentProfileDto> uploadResume(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("file") MultipartFile file) {
        StudentProfileDto updated = studentService.uploadResume(principal.getId(), file);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/resume")
    public ResponseEntity<Resource> downloadMyResume(@AuthenticationPrincipal UserPrincipal principal) {
        StudentProfileDto profile = studentService.getProfileByUserId(principal.getId());
        if (profile.getResumePath() == null || profile.getResumePath().isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = fileStorageService.loadFileAsResource(profile.getResumePath());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + profile.getFullName().replace(" ", "_") + "_Resume.pdf\"")
                .body(resource);
    }

    @GetMapping("/resume/{studentId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Resource> downloadStudentResumeByAdmin(@PathVariable Long studentId) {
        StudentProfileDto profile = studentService.getProfileById(studentId);
        if (profile.getResumePath() == null || profile.getResumePath().isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = fileStorageService.loadFileAsResource(profile.getResumePath());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + profile.getFullName().replace(" ", "_") + "_Resume.pdf\"")
                .body(resource);
    }

    @PutMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PasswordChangeRequest request) {
        studentService.changePassword(principal.getId(), request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password changed successfully.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/skills")
    public ResponseEntity<List<String>> getAllAvailableSkills() {
        List<String> skills = skillRepository.findAll()
                .stream()
                .map(Skill::getName)
                .sorted()
                .collect(Collectors.toList());
        return ResponseEntity.ok(skills);
    }
}
