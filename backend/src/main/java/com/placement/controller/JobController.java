package com.placement.controller;

import com.placement.dto.request.JobRequest;
import com.placement.dto.response.EligibilityResponseDto;
import com.placement.dto.response.JobDto;
import com.placement.entity.Student;
import com.placement.security.UserPrincipal;
import com.placement.service.EligibilityService;
import com.placement.service.JobService;
import com.placement.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobService jobService;

    @Autowired
    private EligibilityService eligibilityService;

    @Autowired
    private StudentService studentService;

    @GetMapping
    public ResponseEntity<Page<JobDto>> filterJobs(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String employmentType,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal UserPrincipal principal) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Long currentUserId = principal != null ? principal.getId() : null;
        Page<JobDto> jobs = jobService.filterJobs(query, department, employmentType, status, pageable, currentUserId);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDto> getJobById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long currentUserId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(jobService.getJobById(id, currentUserId));
    }

    @GetMapping("/{id}/eligibility")
    public ResponseEntity<EligibilityResponseDto> checkEligibility(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Student student = studentService.getStudentEntityByUserId(principal.getId());
        EligibilityResponseDto eligibility = eligibilityService.checkEligibility(id, student.getId());
        return ResponseEntity.ok(eligibility);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<JobDto> createJob(@Valid @RequestBody JobRequest request) {
        JobDto created = jobService.createJob(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<JobDto> updateJob(@PathVariable Long id, @Valid @RequestBody JobRequest request) {
        JobDto updated = jobService.updateJob(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Job opening deleted successfully.");
        return ResponseEntity.ok(response);
    }
}
