package com.placement.controller;

import com.placement.dto.request.InterviewRequest;
import com.placement.dto.response.InterviewDto;
import com.placement.security.UserPrincipal;
import com.placement.service.InterviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    @GetMapping("/my")
    public ResponseEntity<List<InterviewDto>> getMyInterviews(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(interviewService.getMyInterviews(principal.getId()));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<InterviewDto>> getAllInterviews() {
        return ResponseEntity.ok(interviewService.getAllInterviews());
    }

    @GetMapping("/upcoming")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<InterviewDto>> getUpcomingInterviews() {
        return ResponseEntity.ok(interviewService.getUpcomingInterviews());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<InterviewDto> scheduleInterview(@Valid @RequestBody InterviewRequest request) {
        InterviewDto created = interviewService.scheduleInterview(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<InterviewDto> updateInterview(
            @PathVariable Long id,
            @Valid @RequestBody InterviewRequest request) {
        InterviewDto updated = interviewService.updateInterview(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> cancelInterview(@PathVariable Long id) {
        interviewService.cancelInterview(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Interview has been cancelled successfully.");
        return ResponseEntity.ok(response);
    }
}
