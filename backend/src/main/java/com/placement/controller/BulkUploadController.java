package com.placement.controller;

import com.placement.dto.response.BulkUploadResultDto;
import com.placement.service.BulkUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/students")
public class BulkUploadController {

    @Autowired
    private BulkUploadService bulkUploadService;

    @PostMapping(value = "/bulk-upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<BulkUploadResultDto> bulkUploadStudents(@RequestParam("file") MultipartFile file) {
        BulkUploadResultDto result = bulkUploadService.processBulkStudentUpload(file);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/sample-template")
    public ResponseEntity<Resource> downloadSampleTemplate() {
        Resource template = bulkUploadService.generateSampleTemplate();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"students_bulk_upload_template.xlsx\"")
                .body(template);
    }
}
