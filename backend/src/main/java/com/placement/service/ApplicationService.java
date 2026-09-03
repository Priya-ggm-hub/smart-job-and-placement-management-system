package com.placement.service;

import com.placement.dto.request.ApplicationStatusUpdateRequest;
import com.placement.dto.response.ApplicationDto;
import com.placement.dto.response.EligibilityResponseDto;
import com.placement.entity.Application;
import com.placement.entity.Interview;
import com.placement.entity.Job;
import com.placement.entity.Student;
import com.placement.entity.enums.ApplicationStatus;
import com.placement.entity.enums.NotificationType;
import com.placement.exception.BadRequestException;
import com.placement.exception.ResourceNotFoundException;
import com.placement.repository.ApplicationRepository;
import com.placement.repository.InterviewRepository;
import com.placement.repository.JobRepository;
import com.placement.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private EligibilityService eligibilityService;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public ApplicationDto applyForJob(Long jobId, Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user id: " + userId));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        // 1. Prevent duplicate application
        if (applicationRepository.existsByStudentIdAndJobId(student.getId(), jobId)) {
            throw new BadRequestException("You have already applied for this job opening.");
        }

        // 2. Check Job status and deadline
        if (!"OPEN".equalsIgnoreCase(job.getStatus())) {
            throw new BadRequestException("This job opening is currently closed for new applications.");
        }
        if (job.getDeadline() != null && job.getDeadline().isBefore(LocalDate.now())) {
            throw new BadRequestException("The deadline for this job opening has passed (" + job.getDeadline() + ").");
        }

        // 3. Strict Server-Side Eligibility Validation
        EligibilityResponseDto eligibility = eligibilityService.checkEligibility(jobId, student.getId());
        if (!eligibility.isEligible()) {
            throw new BadRequestException("You are not eligible for this opening. Reason: " +
                    (eligibility.getReasons().isEmpty() ? "Criteria not satisfied" : String.join(" | ", eligibility.getReasons())));
        }

        // 4. Create and persist application
        Application application = new Application(student, job);
        application.setStatus(ApplicationStatus.APPLIED);
        application.setRemarks("Application submitted successfully.");
        Application saved = applicationRepository.save(application);

        // 5. Send In-App & Email Notification
        String companyName = job.getCompany() != null ? job.getCompany().getName() : "Company";
        notificationService.createNotification(
                student,
                "Application Submitted Successfully",
                String.format("You have successfully applied for '%s' at %s. You can track your application status from your dashboard.",
                        job.getTitle(), companyName),
                NotificationType.STATUS_UPDATE
        );

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<ApplicationDto> getMyApplications(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user id: " + userId));

        return applicationRepository.findByStudentId(student.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ApplicationDto> filterApplications(Long jobId, ApplicationStatus status, String query, Pageable pageable) {
        return applicationRepository.filterApplications(
                jobId,
                status,
                query != null && !query.trim().isEmpty() ? query.trim() : null,
                pageable
        ).map(this::mapToDto);
    }

    @Transactional
    public ApplicationDto updateApplicationStatus(Long applicationId, ApplicationStatusUpdateRequest request) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        ApplicationStatus oldStatus = application.getStatus();
        ApplicationStatus newStatus = request.getStatus();
        application.setStatus(newStatus);
        if (request.getRemarks() != null && !request.getRemarks().trim().isEmpty()) {
            application.setRemarks(request.getRemarks().trim());
        }

        Application updated = applicationRepository.save(application);

        // Send In-App + Email notification to student on status update
        if (oldStatus != newStatus) {
            String companyName = updated.getJob().getCompany() != null ? updated.getJob().getCompany().getName() : "Company";
            String jobTitle = updated.getJob().getTitle();

            String title = "Application Status Update: " + newStatus.name();
            String message;

            switch (newStatus) {
                case SHORTLISTED:
                    message = String.format("Great news! Your application for '%s' at %s has been SHORTLISTED for the upcoming recruitment rounds.",
                            jobTitle, companyName);
                    break;
                case SELECTED:
                    message = String.format("Heartiest Congratulations! You have been SELECTED for '%s' at %s! Please await further onboarding communications.",
                            jobTitle, companyName);
                    break;
                case REJECTED:
                    message = String.format("Thank you for your interest in '%s' at %s. We regret to inform you that your application was not selected at this time.",
                            jobTitle, companyName);
                    break;
                case INTERVIEW_SCHEDULED:
                    message = String.format("An interview round has been scheduled for your application to '%s' at %s. Check your interviews tab for date, time, and links.",
                            jobTitle, companyName);
                    break;
                default:
                    message = String.format("The status of your application for '%s' at %s has been updated to %s.",
                            jobTitle, companyName, newStatus.name());
            }

            notificationService.createNotification(updated.getStudent(), title, message, NotificationType.STATUS_UPDATE);
        }

        return mapToDto(updated);
    }

    public ApplicationDto mapToDto(Application app) {
        ApplicationDto dto = new ApplicationDto();
        dto.setId(app.getId());

        if (app.getStudent() != null) {
            Student s = app.getStudent();
            dto.setStudentId(s.getId());
            dto.setStudentName(s.getFullName());
            if (s.getUser() != null) {
                dto.setStudentEmail(s.getUser().getEmail());
            }
            dto.setStudentDepartment(s.getDepartment());
            dto.setStudentDegree(s.getDegree());
            dto.setStudentCgpa(s.getCgpa() != null ? s.getCgpa().doubleValue() : 0.0);
            dto.setStudentResumePath(s.getResumePath());
        }

        if (app.getJob() != null) {
            Job j = app.getJob();
            dto.setJobId(j.getId());
            dto.setJobTitle(j.getTitle());
            if (j.getCompany() != null) {
                dto.setCompanyName(j.getCompany().getName());
            }
            dto.setSalaryPackage(j.getSalaryPackage());
            dto.setLocation(j.getLocation());
        }

        dto.setApplicationDate(app.getApplicationDate());
        dto.setStatus(app.getStatus());
        dto.setRemarks(app.getRemarks());
        dto.setUpdatedAt(app.getUpdatedAt());

        // Attach latest interview summary if scheduled
        Optional<Interview> interviewOpt = interviewRepository.findFirstByApplicationIdOrderByIdDesc(app.getId());
        if (interviewOpt.isPresent()) {
            Interview interview = interviewOpt.get();
            dto.setInterviewId(interview.getId());
            dto.setInterviewDate(interview.getInterviewDate().toString());
            dto.setInterviewTime(interview.getInterviewTime().toString());
            dto.setInterviewMode(interview.getMode().name());
            dto.setInterviewLocationOrLink(interview.getLocationOrLink());
            dto.setInterviewRound(interview.getRoundName());
            dto.setInterviewStatus(interview.getStatus().name());
        }

        return dto;
    }
}
