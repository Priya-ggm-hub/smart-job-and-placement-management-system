package com.placement.service;

import com.placement.dto.request.JobRequest;
import com.placement.dto.response.EligibilityResponseDto;
import com.placement.dto.response.JobDto;
import com.placement.entity.Application;
import com.placement.entity.Company;
import com.placement.entity.Job;
import com.placement.entity.Skill;
import com.placement.entity.Student;
import com.placement.exception.BadRequestException;
import com.placement.exception.ResourceNotFoundException;
import com.placement.repository.ApplicationRepository;
import com.placement.repository.CompanyRepository;
import com.placement.repository.JobRepository;
import com.placement.repository.SkillRepository;
import com.placement.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private EligibilityService eligibilityService;

    @Transactional(readOnly = true)
    public Page<JobDto> filterJobs(String query, String department, String employmentType, String status, Pageable pageable, Long currentUserId) {
        Page<Job> jobs = jobRepository.filterJobs(
                query != null && !query.trim().isEmpty() ? query.trim() : null,
                department != null && !department.trim().isEmpty() ? department.trim() : null,
                employmentType != null && !employmentType.trim().isEmpty() ? employmentType.trim() : null,
                status != null && !status.trim().isEmpty() ? status.trim() : null,
                pageable
        );

        Long studentId = getStudentIdByUserId(currentUserId);
        return jobs.map(job -> mapToDto(job, studentId));
    }

    @Transactional(readOnly = true)
    public JobDto getJobById(Long id, Long currentUserId) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", id));
        Long studentId = getStudentIdByUserId(currentUserId);
        return mapToDto(job, studentId);
    }

    @Transactional
    public JobDto createJob(JobRequest request) {
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", request.getCompanyId()));

        Job job = new Job();
        job.setCompany(company);
        job.setTitle(request.getTitle().trim());
        job.setDescription(request.getDescription());
        job.setMinCgpa(request.getMinCgpa());
        job.setEligibleDepartment(request.getEligibleDepartment() != null ? request.getEligibleDepartment().trim().toUpperCase() : "ALL");
        job.setGraduationYear(request.getGraduationYear());
        job.setLocation(request.getLocation());
        job.setEmploymentType(request.getEmploymentType() != null ? request.getEmploymentType() : "Full-time");
        job.setSalaryPackage(request.getSalaryPackage());
        job.setDeadline(request.getDeadline());
        job.setStatus(request.getStatus() != null ? request.getStatus().toUpperCase() : "OPEN");

        if (request.getRequiredSkills() != null) {
            Set<Skill> skills = new HashSet<>();
            for (String skillName : request.getRequiredSkills()) {
                String cleanName = skillName.trim();
                if (!cleanName.isEmpty()) {
                    Skill skill = skillRepository.findByNameIgnoreCase(cleanName)
                            .orElseGet(() -> skillRepository.save(new Skill(cleanName)));
                    skills.add(skill);
                }
            }
            job.setRequiredSkills(skills);
        }

        Job saved = jobRepository.save(job);
        return mapToDto(saved, null);
    }

    @Transactional
    public JobDto updateJob(Long id, JobRequest request) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", id));

        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", request.getCompanyId()));

        job.setCompany(company);
        job.setTitle(request.getTitle().trim());
        job.setDescription(request.getDescription());
        job.setMinCgpa(request.getMinCgpa());
        job.setEligibleDepartment(request.getEligibleDepartment() != null ? request.getEligibleDepartment().trim().toUpperCase() : "ALL");
        job.setGraduationYear(request.getGraduationYear());
        job.setLocation(request.getLocation());
        job.setEmploymentType(request.getEmploymentType() != null ? request.getEmploymentType() : "Full-time");
        job.setSalaryPackage(request.getSalaryPackage());
        job.setDeadline(request.getDeadline());
        job.setStatus(request.getStatus() != null ? request.getStatus().toUpperCase() : "OPEN");

        if (request.getRequiredSkills() != null) {
            Set<Skill> skills = new HashSet<>();
            for (String skillName : request.getRequiredSkills()) {
                String cleanName = skillName.trim();
                if (!cleanName.isEmpty()) {
                    Skill skill = skillRepository.findByNameIgnoreCase(cleanName)
                            .orElseGet(() -> skillRepository.save(new Skill(cleanName)));
                    skills.add(skill);
                }
            }
            job.setRequiredSkills(skills);
        }

        Job updated = jobRepository.save(job);
        return mapToDto(updated, null);
    }

    @Transactional
    public void deleteJob(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", id));
        jobRepository.delete(job);
    }

    private Long getStudentIdByUserId(Long userId) {
        if (userId == null) return null;
        return studentRepository.findByUserId(userId)
                .map(Student::getId)
                .orElse(null);
    }

    public JobDto mapToDto(Job job, Long studentId) {
        JobDto dto = new JobDto();
        dto.setId(job.getId());
        if (job.getCompany() != null) {
            dto.setCompanyId(job.getCompany().getId());
            dto.setCompanyName(job.getCompany().getName());
            dto.setCompanyLocation(job.getCompany().getLocation());
            dto.setCompanyWebsite(job.getCompany().getWebsite());
        }
        dto.setTitle(job.getTitle());
        dto.setDescription(job.getDescription());
        dto.setMinCgpa(job.getMinCgpa());
        dto.setEligibleDepartment(job.getEligibleDepartment());
        dto.setGraduationYear(job.getGraduationYear());
        dto.setLocation(job.getLocation());
        dto.setEmploymentType(job.getEmploymentType());
        dto.setSalaryPackage(job.getSalaryPackage());
        dto.setDeadline(job.getDeadline());
        dto.setStatus(job.getStatus());
        dto.setCreatedAt(job.getCreatedAt());

        if (job.getRequiredSkills() != null) {
            dto.setRequiredSkills(job.getRequiredSkills().stream().map(Skill::getName).collect(Collectors.toSet()));
        } else {
            dto.setRequiredSkills(new HashSet<>());
        }

        if (studentId != null) {
            Optional<Application> appOpt = applicationRepository.findByStudentIdAndJobId(studentId, job.getId());
            if (appOpt.isPresent()) {
                dto.setHasApplied(true);
                dto.setApplicationStatus(appOpt.get().getStatus().name());
            } else {
                dto.setHasApplied(false);
            }

            try {
                EligibilityResponseDto eligibility = eligibilityService.checkEligibility(job.getId(), studentId);
                dto.setIsEligible(eligibility.isEligible());
            } catch (Exception ignored) {
                dto.setIsEligible(false);
            }
        }

        return dto;
    }
}
