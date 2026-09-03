package com.placement;

import com.placement.dto.response.EligibilityResponseDto;
import com.placement.entity.Job;
import com.placement.entity.Skill;
import com.placement.entity.SkillResource;
import com.placement.entity.Student;
import com.placement.repository.ApplicationRepository;
import com.placement.repository.JobRepository;
import com.placement.repository.SkillResourceRepository;
import com.placement.repository.StudentRepository;
import com.placement.service.EligibilityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class EligibilityServiceTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private SkillResourceRepository skillResourceRepository;

    @InjectMocks
    private EligibilityService eligibilityService;

    private Student eligibleStudent;
    private Student lowCgpaStudent;
    private Student missingSkillsStudent;
    private Job javaBackendJob;

    @BeforeEach
    void setUp() {
        // Setup Skills
        Skill javaSkill = new Skill(1L, "Java");
        Skill springSkill = new Skill(2L, "Spring Boot");
        Skill sqlSkill = new Skill(3L, "SQL");
        Skill reactSkill = new Skill(4L, "React");

        // Setup Job: Requires Java, Spring Boot, SQL | Min CGPA: 7.50 | Dept: CSE | Batch: 2025
        javaBackendJob = new Job();
        javaBackendJob.setId(100L);
        javaBackendJob.setTitle("Backend Engineer");
        javaBackendJob.setMinCgpa(new BigDecimal("7.50"));
        javaBackendJob.setEligibleDepartment("CSE");
        javaBackendJob.setGraduationYear(2025);
        javaBackendJob.setDeadline(LocalDate.now().plusDays(30));
        javaBackendJob.setStatus("OPEN");
        javaBackendJob.setRequiredSkills(new HashSet<>(Set.of(javaSkill, springSkill, sqlSkill)));

        // Setup Fully Eligible Student: CGPA 8.50, CSE, 2025, Skills: Java, Spring Boot, SQL, React
        eligibleStudent = new Student();
        eligibleStudent.setId(1L);
        eligibleStudent.setFullName("Rahul Sharma");
        eligibleStudent.setDepartment("CSE");
        eligibleStudent.setGraduationYear(2025);
        eligibleStudent.setCgpa(new BigDecimal("8.50"));
        eligibleStudent.setSkills(new HashSet<>(Set.of(javaSkill, springSkill, sqlSkill, reactSkill)));

        // Setup Low CGPA Student: CGPA 6.80, CSE, 2025, Skills: Java, Spring Boot, SQL
        lowCgpaStudent = new Student();
        lowCgpaStudent.setId(2L);
        lowCgpaStudent.setFullName("Vikram Singh");
        lowCgpaStudent.setDepartment("CSE");
        lowCgpaStudent.setGraduationYear(2025);
        lowCgpaStudent.setCgpa(new BigDecimal("6.80"));
        lowCgpaStudent.setSkills(new HashSet<>(Set.of(javaSkill, springSkill, sqlSkill)));

        // Setup Missing Skills Student: CGPA 8.20, CSE, 2025, Skills: React Only (Missing Java, Spring Boot, SQL)
        missingSkillsStudent = new Student();
        missingSkillsStudent.setId(3L);
        missingSkillsStudent.setFullName("Ananya Patel");
        missingSkillsStudent.setDepartment("CSE");
        missingSkillsStudent.setGraduationYear(2025);
        missingSkillsStudent.setCgpa(new BigDecimal("8.20"));
        missingSkillsStudent.setSkills(new HashSet<>(Set.of(reactSkill)));
    }

    @Test
    @DisplayName("Should evaluate fully qualified candidate as ELIGIBLE")
    void testEligibleCandidate() {
        when(jobRepository.findById(100L)).thenReturn(Optional.of(javaBackendJob));
        when(studentRepository.findById(1L)).thenReturn(Optional.of(eligibleStudent));
        when(applicationRepository.existsByStudentIdAndJobId(1L, 100L)).thenReturn(false);

        EligibilityResponseDto result = eligibilityService.checkEligibility(100L, 1L);

        assertTrue(result.isEligible(), "Student should be marked as eligible");
        assertTrue(result.isCgpaSatisfied(), "CGPA check must pass");
        assertTrue(result.isDepartmentSatisfied(), "Department check must pass");
        assertTrue(result.isSkillsSatisfied(), "Skills check must pass");
        assertTrue(result.getMissingSkills().isEmpty(), "No skills should be missing");
    }

    @Test
    @DisplayName("Should mark candidate as INELIGIBLE when CGPA is below threshold")
    void testLowCgpaIneligible() {
        when(jobRepository.findById(100L)).thenReturn(Optional.of(javaBackendJob));
        when(studentRepository.findById(2L)).thenReturn(Optional.of(lowCgpaStudent));
        when(applicationRepository.existsByStudentIdAndJobId(2L, 100L)).thenReturn(false);

        EligibilityResponseDto result = eligibilityService.checkEligibility(100L, 2L);

        assertFalse(result.isEligible(), "Student should be marked ineligible due to low CGPA");
        assertFalse(result.isCgpaSatisfied(), "CGPA condition must be false");
        assertTrue(result.isDepartmentSatisfied(), "Department is CSE, should pass");
        assertTrue(result.getReasons().stream().anyMatch(r -> r.contains("Minimum CGPA required is 7.50")));
    }

    @Test
    @DisplayName("Should detect SKILL GAPS and attach curated learning resources for missing skills")
    void testSkillGapAnalysisAndResources() {
        when(jobRepository.findById(100L)).thenReturn(Optional.of(javaBackendJob));
        when(studentRepository.findById(3L)).thenReturn(Optional.of(missingSkillsStudent));
        when(applicationRepository.existsByStudentIdAndJobId(3L, 100L)).thenReturn(false);
        when(skillResourceRepository.findBySkillNameIgnoreCase("Java")).thenReturn(
                Optional.of(new SkillResource("Java", "Oracle Java Docs", "https://dev.java", "Core Java"))
        );
        when(skillResourceRepository.findBySkillNameIgnoreCase("Spring Boot")).thenReturn(
                Optional.of(new SkillResource("Spring Boot", "Spring Guides", "https://spring.io", "Spring Boot"))
        );
        when(skillResourceRepository.findBySkillNameIgnoreCase("SQL")).thenReturn(
                Optional.of(new SkillResource("SQL", "SQL Tutorial", "https://w3schools.com/sql", "SQL"))
        );

        EligibilityResponseDto result = eligibilityService.checkEligibility(100L, 3L);

        assertFalse(result.isEligible(), "Student should be marked ineligible due to missing required skills");
        assertFalse(result.isSkillsSatisfied(), "Skills condition must be false");
        assertEquals(3, result.getMissingSkills().size(), "Should identify 3 missing skills (Java, Spring Boot, SQL)");
        assertEquals(3, result.getLearningResources().size(), "Should recommend 3 learning resources");
        assertTrue(result.getLearningResources().stream().anyMatch(r -> r.getResourceUrl().contains("spring.io")));
    }
}
