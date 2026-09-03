package com.placement.controller;

import com.placement.dto.response.NotificationDto;
import com.placement.entity.Student;
import com.placement.security.UserPrincipal;
import com.placement.service.NotificationService;
import com.placement.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private StudentService studentService;

    @GetMapping("/my")
    public ResponseEntity<List<NotificationDto>> getMyNotifications(@AuthenticationPrincipal UserPrincipal principal) {
        Student student = studentService.getStudentEntityByUserId(principal.getId());
        return ResponseEntity.ok(notificationService.getNotificationsForStudent(student.getId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal UserPrincipal principal) {
        Student student = studentService.getStudentEntityByUserId(principal.getId());
        long count = notificationService.getUnreadCount(student.getId());
        Map<String, Long> response = new HashMap<>();
        response.put("unreadCount", count);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDto> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Student student = studentService.getStudentEntityByUserId(principal.getId());
        return ResponseEntity.ok(notificationService.markAsRead(id, student.getId()));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(@AuthenticationPrincipal UserPrincipal principal) {
        Student student = studentService.getStudentEntityByUserId(principal.getId());
        notificationService.markAllAsRead(student.getId());
        Map<String, String> response = new HashMap<>();
        response.put("message", "All notifications marked as read.");
        return ResponseEntity.ok(response);
    }
}
