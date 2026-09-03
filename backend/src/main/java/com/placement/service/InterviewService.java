package com.placement.service;

import com.placement.dto.request.InterviewRequest;
import com.placement.dto.response.InterviewDto;
import com.placement.entity.Application;
import com.placement.entity.Interview;
import com.placement.entity.Student;
import com.placement.entity.enums.ApplicationStatus;
import com.placement.entity.enums.InterviewStatus;
import com.placement.entity.enums.NotificationType;
import com.placement.exception.BadRequestException;
import com.placement.exception.ResourceNotFoundException;
import com.placement.repository.ApplicationRepository;
import com.placement.repository.InterviewRepository;
import com.placement.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InterviewService {

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public InterviewDto scheduleInterview(InterviewRequest request) {
        Application application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", request.getApplicationId()));

        if (application.getStatus() == ApplicationStatus.REJECTED) {
            throw new BadRequestException("Cannot schedule an interview for a REJECTED application.");
        }

        Interview interview = new Interview();
        interview.setApplication(application);
        interview.setInterviewDate(request.getInterviewDate());
        interview.setInterviewTime(request.getInterviewTime());
        interview.setMode(request.getMode());
        interview.setLocationOrLink(request.getLocationOrLink().trim());
        interview.setRoundName(request.getRoundName().trim());
        interview.setStatus(request.getStatus() != null ? request.getStatus() : InterviewStatus.SCHEDULED);
        interview.setRemarks(request.getRemarks());

        Interview saved = interviewRepository.save(interview);

        // Update application status to INTERVIEW_SCHEDULED
        application.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        applicationRepository.save(application);

        // Send In-App & Email Notification to candidate
        Student student = application.getStudent();
        String companyName = application.getJob().getCompany() != null ? application.getJob().getCompany().getName() : "Company";
        String notificationMessage = String.format(
                "Your interview '%s' for '%s' at %s has been scheduled on %s at %s (%s). Details/Link: %s",
                interview.getRoundName(),
                application.getJob().getTitle(),
                companyName,
                interview.getInterviewDate(),
                interview.getInterviewTime(),
                interview.getMode(),
                interview.getLocationOrLink()
        );

        notificationService.createNotification(
                student,
                "Interview Scheduled: " + interview.getRoundName(),
                notificationMessage,
                NotificationType.INTERVIEW
        );

        return mapToDto(saved);
    }

    @Transactional
    public InterviewDto updateInterview(Long id, InterviewRequest request) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview", "id", id));

        interview.setInterviewDate(request.getInterviewDate());
        interview.setInterviewTime(request.getInterviewTime());
        interview.setMode(request.getMode());
        interview.setLocationOrLink(request.getLocationOrLink().trim());
        interview.setRoundName(request.getRoundName().trim());
        if (request.getStatus() != null) {
            interview.setStatus(request.getStatus());
        }
        interview.setRemarks(request.getRemarks());

        Interview updated = interviewRepository.save(interview);

        // Notify Student of Reschedule / Update
        Application app = updated.getApplication();
        String companyName = app.getJob().getCompany() != null ? app.getJob().getCompany().getName() : "Company";
        notificationService.createNotification(
                app.getStudent(),
                "Interview Updated / Rescheduled: " + updated.getRoundName(),
                String.format("Notice: Your interview '%s' for %s has been updated to %s at %s (%s). Location/Link: %s",
                        updated.getRoundName(), companyName, updated.getInterviewDate(), updated.getInterviewTime(),
                        updated.getMode(), updated.getLocationOrLink()),
                NotificationType.INTERVIEW
        );

        return mapToDto(updated);
    }

    @Transactional
    public void cancelInterview(Long id) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview", "id", id));

        interview.setStatus(InterviewStatus.CANCELLED);
        interviewRepository.save(interview);

        Application app = interview.getApplication();
        String companyName = app.getJob().getCompany() != null ? app.getJob().getCompany().getName() : "Company";
        notificationService.createNotification(
                app.getStudent(),
                "Interview Cancelled: " + interview.getRoundName(),
                String.format("Your interview for %s (%s) originally scheduled for %s has been CANCELLED.",
                        companyName, interview.getRoundName(), interview.getInterviewDate()),
                NotificationType.INTERVIEW
        );
    }

    @Transactional(readOnly = true)
    public List<InterviewDto> getMyInterviews(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user id: " + userId));

        return interviewRepository.findByStudentId(student.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InterviewDto> getAllInterviews() {
        return interviewRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InterviewDto> getUpcomingInterviews() {
        return interviewRepository.findUpcomingInterviews(LocalDate.now())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public InterviewDto mapToDto(Interview interview) {
        InterviewDto dto = new InterviewDto();
        dto.setId(interview.getId());

        if (interview.getApplication() != null) {
            Application app = interview.getApplication();
            dto.setApplicationId(app.getId());

            if (app.getStudent() != null) {
                Student s = app.getStudent();
                dto.setStudentId(s.getId());
                dto.setStudentName(s.getFullName());
                if (s.getUser() != null) {
                    dto.setStudentEmail(s.getUser().getEmail());
                }
                dto.setStudentPhone(s.getPhone());
                dto.setStudentDepartment(s.getDepartment());
            }

            if (app.getJob() != null) {
                dto.setJobId(app.getJob().getId());
                dto.setJobTitle(app.getJob().getTitle());
                if (app.getJob().getCompany() != null) {
                    dto.setCompanyName(app.getJob().getCompany().getName());
                }
            }
        }

        dto.setInterviewDate(interview.getInterviewDate());
        dto.setInterviewTime(interview.getInterviewTime());
        dto.setMode(interview.getMode());
        dto.setLocationOrLink(interview.getLocationOrLink());
        dto.setRoundName(interview.getRoundName());
        dto.setStatus(interview.getStatus());
        dto.setRemarks(interview.getRemarks());
        dto.setCreatedAt(interview.getCreatedAt());

        return dto;
    }
}
