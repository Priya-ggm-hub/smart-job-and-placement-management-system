package com.placement.service;

import com.placement.dto.response.NotificationDto;
import com.placement.entity.Notification;
import com.placement.entity.Student;
import com.placement.entity.enums.NotificationType;
import com.placement.exception.ResourceNotFoundException;
import com.placement.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${spring.mail.username:noreply@placement.edu}")
    private String fromEmail;

    @Transactional
    public NotificationDto createNotification(Student student, String title, String message, NotificationType type) {
        Notification notification = new Notification(student, title, message, type);
        Notification saved = notificationRepository.save(notification);

        // Trigger safe email delivery if student email is present
        if (student.getUser() != null && student.getUser().getEmail() != null) {
            sendEmailSafe(student.getUser().getEmail(), title, message);
        }

        return mapToDto(saved);
    }

    public void sendEmailSafe(String toEmail, String subject, String content) {
        if (!mailEnabled || mailSender == null) {
            logger.info("[Email Simulation] To: {} | Subject: {} | Message: {}", toEmail, subject, content);
            return;
        }

        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(fromEmail);
            mail.setTo(toEmail);
            mail.setSubject("[Placement Portal] " + subject);
            mail.setText(content + "\n\nBest Regards,\nCampus Placement Cell");
            mailSender.send(mail);
            logger.info("Email notification successfully sent to {}", toEmail);
        } catch (Exception ex) {
            logger.warn("Could not send SMTP email to {}: {}", toEmail, ex.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getNotificationsForStudent(Long studentId) {
        return notificationRepository.findByStudentIdOrderByCreatedAtDesc(studentId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long studentId) {
        return notificationRepository.countByStudentIdAndReadFalse(studentId);
    }

    @Transactional
    public NotificationDto markAsRead(Long notificationId, Long studentId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getStudent().getId().equals(studentId)) {
            throw new ResourceNotFoundException("Notification", "id", notificationId);
        }

        notification.setRead(true);
        return mapToDto(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllAsRead(Long studentId) {
        notificationRepository.markAllAsRead(studentId);
    }

    public NotificationDto mapToDto(Notification notification) {
        NotificationDto dto = new NotificationDto();
        dto.setId(notification.getId());
        dto.setStudentId(notification.getStudent().getId());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setRead(notification.isRead());
        dto.setType(notification.getType());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
}
