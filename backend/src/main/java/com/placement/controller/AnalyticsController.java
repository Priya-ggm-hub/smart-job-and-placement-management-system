package com.placement.controller;

import com.placement.dto.response.*;
import com.placement.service.AnalyticsService;
import com.placement.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private StudentService studentService;

    @GetMapping("/analytics/summary")
    public ResponseEntity<DashboardSummaryDto> getDashboardSummary() {
        return ResponseEntity.ok(analyticsService.getDashboardSummary());
    }

    @GetMapping("/analytics/department-stats")
    public ResponseEntity<List<DepartmentStatsDto>> getDepartmentStats() {
        return ResponseEntity.ok(analyticsService.getDepartmentStats());
    }

    @GetMapping("/analytics/company-packages")
    public ResponseEntity<List<CompanyPackageDto>> getCompanyPackages() {
        return ResponseEntity.ok(analyticsService.getCompanyPackages());
    }

    @GetMapping("/analytics/funnel")
    public ResponseEntity<List<FunnelStatsDto>> getFunnelStats() {
        return ResponseEntity.ok(analyticsService.getFunnelStats());
    }

    @GetMapping("/analytics/export-csv")
    public ResponseEntity<Resource> exportPlacementReportCsv() {
        Resource csvResource = analyticsService.exportPlacementReportCsv();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"campus_placement_report.csv\"")
                .body(csvResource);
    }

    @GetMapping("/students")
    public ResponseEntity<Page<StudentProfileDto>> getAllStudents(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "fullName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(studentService.searchStudents(query, pageable));
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<StudentProfileDto> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getProfileById(id));
    }
}
