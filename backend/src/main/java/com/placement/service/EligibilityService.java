package com.placement.service;

import com.placement.dto.response.EligibilityResponseDto;
import com.placement.dto.response.SkillResourceDto;
import com.placement.entity.Job;
import com.placement.entity.Skill;
import com.placement.entity.SkillResource;
import com.placement.entity.Student;
import com.placement.exception.ResourceNotFoundException;
import com.placement.repository.ApplicationRepository;
import com.placement.repository.JobRepository;
import com.placement.repository.SkillResourceRepository;
import com.placement.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EligibilityService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private SkillResourceRepository skillResourceRepository;

    @Transactional(readOnly = true)
    public EligibilityResponseDto checkEligibility(Long jobId, Long studentId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        EligibilityResponseDto response = new EligibilityResponseDto();
        List<String> reasons = new ArrayList<>();

        // Context details
        response.setStudentCgpa(student.getCgpa());
        response.setMinCgpaRequired(job.getMinCgpa());
        response.setStudentDepartment(student.getDepartment());
        response.setEligibleDepartment(job.getEligibleDepartment());

        // 1. Check CGPA
        boolean cgpaSatisfied = student.getCgpa() != null &&
                job.getMinCgpa() != null &&
                student.getCgpa().compareTo(job.getMinCgpa()) >= 0;
        response.setCgpaSatisfied(cgpaSatisfied);
        if (!cgpaSatisfied) {
            reasons.add(String.format("Minimum CGPA required is %.2f, but your current CGPA is %.2f.",
                    job.getMinCgpa(), student.getCgpa() != null ? student.getCgpa() : 0.0));
        }

        // 2. Check Department
        boolean deptSatisfied = job.getEligibleDepartment() == null ||
                job.getEligibleDepartment().equalsIgnoreCase("ALL") ||
                job.getEligibleDepartment().equalsIgnoreCase(student.getDepartment());
        response.setDepartmentSatisfied(deptSatisfied);
        if (!deptSatisfied) {
            reasons.add(String.format("This drive is restricted to '%s' department candidates (Your department: %s).",
                    job.getEligibleDepartment(), student.getDepartment()));
        }

        // 3. Check Graduation Year
        boolean gradYearSatisfied = job.getGraduationYear() == null ||
                job.getGraduationYear().equals(student.getGraduationYear());
        response.setGraduationYearSatisfied(gradYearSatisfied);
        if (!gradYearSatisfied) {
            reasons.add(String.format("This drive is open only to batch of %d (Your graduation year: %d).",
                    job.getGraduationYear(), student.getGraduationYear()));
        }

        // 4. Check Skills & Perform Skill Gap Analysis
        Set<String> studentSkillNames = student.getSkills() != null
                ? student.getSkills().stream().map(s -> s.getName().toLowerCase().trim()).collect(Collectors.toSet())
                : new HashSet<>();

        List<String> missingSkills = new ArrayList<>();
        List<String> matchedSkills = new ArrayList<>();

        if (job.getRequiredSkills() != null) {
            for (Skill jobSkill : job.getRequiredSkills()) {
                String normalizedJobSkill = jobSkill.getName().toLowerCase().trim();
                if (studentSkillNames.contains(normalizedJobSkill)) {
                    matchedSkills.add(jobSkill.getName());
                } else {
                    missingSkills.add(jobSkill.getName());
                }
            }
        }

        response.setMatchedSkills(matchedSkills);
        response.setMissingSkills(missingSkills);
        boolean skillsSatisfied = missingSkills.isEmpty();
        response.setSkillsSatisfied(skillsSatisfied);

        if (!skillsSatisfied) {
            reasons.add("Missing required technical skill(s): " + String.join(", ", missingSkills));
        }

        // 5. Fetch Curated Learning Resources for Skill Gaps
        List<SkillResourceDto> learningResources = new ArrayList<>();
        for (String missingSkill : missingSkills) {
            Optional<SkillResource> resourceOpt = skillResourceRepository.findBySkillNameIgnoreCase(missingSkill);
            if (resourceOpt.isPresent()) {
                SkillResource res = resourceOpt.get();
                learningResources.add(new SkillResourceDto(res.getSkillName(), res.getResourceTitle(), res.getResourceUrl(), res.getDescription()));
            } else {
                // Dynamic fallback learning guide
                learningResources.add(new SkillResourceDto(
                        missingSkill,
                        missingSkill + " Documentation & Guide",
                        "https://www.google.com/search?q=" + missingSkill.replace(" ", "+") + "+tutorial+documentation",
                        "Recommended learning roadmap and documentation to prepare for " + missingSkill + "."
                ));
            }
        }
        response.setLearningResources(learningResources);

        // 6. Application state & deadline flags
        boolean alreadyApplied = applicationRepository.existsByStudentIdAndJobId(studentId, jobId);
        response.setAlreadyApplied(alreadyApplied);

        boolean deadlinePassed = job.getDeadline() != null && job.getDeadline().isBefore(LocalDate.now());
        response.setDeadlinePassed(deadlinePassed);
        if (deadlinePassed) {
            reasons.add("The application deadline for this opening has passed (" + job.getDeadline() + ").");
        }

        if (job.getStatus() != null && !job.getStatus().equalsIgnoreCase("OPEN")) {
            reasons.add("This recruitment opening is currently marked as CLOSED.");
        }

        // Overall eligibility flag
        boolean isOverallEligible = cgpaSatisfied && deptSatisfied && gradYearSatisfied && skillsSatisfied && !deadlinePassed && "OPEN".equalsIgnoreCase(job.getStatus());
        response.setEligible(isOverallEligible);
        response.setReasons(reasons);

        return response;
    }
}
