package com.placement;

import com.placement.dto.response.BulkUploadResultDto;
import com.placement.entity.Skill;
import com.placement.entity.Student;
import com.placement.entity.User;
import com.placement.repository.SkillRepository;
import com.placement.repository.StudentRepository;
import com.placement.repository.UserRepository;
import com.placement.service.BulkUploadService;
import com.placement.service.NotificationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BulkUploadServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private SkillRepository skillRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private BulkUploadService bulkUploadService;

    @Test
    @DisplayName("Should process valid CSV rows and report accurate row-by-row success/failure counts")
    void testProcessValidCsvUpload() {
        String csvContent = "Name,Email,Phone,Department,Degree,GraduationYear,CGPA,Skills\n" +
                "Karan Kapoor,karan@college.edu,+91 9999999991,CSE,B.Tech,2025,8.40,\"Java, SQL\"\n" +
                "Bad CGPA Student,badcgpa@college.edu,+91 9999999992,IT,B.Tech,2025,12.50,Python\n" +
                "Duplicate Email,dup@college.edu,+91 9999999993,ECE,B.Tech,2025,7.80,C++\n";

        lenient().when(userRepository.existsByEmail(anyString())).thenAnswer(invocation -> {
            String email = invocation.getArgument(0);
            return "dup@college.edu".equalsIgnoreCase(email);
        });

        lenient().when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        lenient().when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
        lenient().when(studentRepository.save(any(Student.class))).thenAnswer(i -> i.getArgument(0));
        lenient().when(skillRepository.findByNameIgnoreCase(anyString())).thenReturn(Optional.of(new Skill("Java")));

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "students.csv",
                "text/csv",
                csvContent.getBytes(StandardCharsets.UTF_8)
        );

        BulkUploadResultDto result = bulkUploadService.processBulkStudentUpload(file);

        assertEquals(3, result.getTotalRows(), "Total rows should be 3");
        assertEquals(1, result.getSuccessCount(), "1 valid row should succeed");
        assertEquals(2, result.getFailureCount(), "2 invalid rows should fail");
        assertEquals(2, result.getErrors().size(), "Should report 2 detailed row errors");

        assertTrue(result.getErrors().stream().anyMatch(e -> e.getReason().contains("CGPA must be between 0.0 and 10.0")));
        assertTrue(result.getErrors().stream().anyMatch(e -> e.getReason().contains("Email already exists in system")));
    }
}
