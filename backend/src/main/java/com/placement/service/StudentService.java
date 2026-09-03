package com.placement.service;

import com.placement.dto.request.PasswordChangeRequest;
import com.placement.dto.request.ProfileUpdateRequest;
import com.placement.dto.response.StudentProfileDto;
import com.placement.entity.Skill;
import com.placement.entity.Student;
import com.placement.entity.User;
import com.placement.exception.BadRequestException;
import com.placement.exception.ResourceNotFoundException;
import com.placement.repository.SkillRepository;
import com.placement.repository.StudentRepository;
import com.placement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public StudentProfileDto getProfileByUserId(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user id: " + userId));
        return mapToDto(student);
    }

    @Transactional(readOnly = true)
    public StudentProfileDto getProfileById(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));
        return mapToDto(student);
    }

    @Transactional(readOnly = true)
    public Student getStudentEntityByUserId(Long userId) {
        return studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user id: " + userId));
    }

    @Transactional
    public StudentProfileDto updateProfile(Long userId, ProfileUpdateRequest request) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user id: " + userId));

        student.setFullName(request.getFullName().trim());
        student.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        student.setDateOfBirth(request.getDateOfBirth());
        student.setDepartment(request.getDepartment().trim().toUpperCase());
        student.setDegree(request.getDegree().trim());
        student.setGraduationYear(request.getGraduationYear());
        student.setCgpa(request.getCgpa());
        student.setProfileCompleted(true);

        if (request.getSkills() != null) {
            Set<Skill> skillEntities = new HashSet<>();
            for (String skillName : request.getSkills()) {
                String cleanName = skillName.trim();
                if (!cleanName.isEmpty()) {
                    Skill skill = skillRepository.findByNameIgnoreCase(cleanName)
                            .orElseGet(() -> skillRepository.save(new Skill(cleanName)));
                    skillEntities.add(skill);
                }
            }
            student.setSkills(skillEntities);
        }

        Student updated = studentRepository.save(student);
        return mapToDto(updated);
    }

    @Transactional
    public StudentProfileDto uploadResume(Long userId, MultipartFile file) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user id: " + userId));

        String resumePath = fileStorageService.storeResume(file, student.getId());
        student.setResumePath(resumePath);
        student.setProfileCompleted(true);

        Student updated = studentRepository.save(student);
        return mapToDto(updated);
    }

    @Transactional
    public void changePassword(Long userId, PasswordChangeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Incorrect current password.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public Page<StudentProfileDto> searchStudents(String query, Pageable pageable) {
        Page<Student> students;
        if (query != null && !query.trim().isEmpty()) {
            students = studentRepository.searchStudents(query.trim(), pageable);
        } else {
            students = studentRepository.findAll(pageable);
        }
        return students.map(this::mapToDto);
    }

    public StudentProfileDto mapToDto(Student student) {
        StudentProfileDto dto = new StudentProfileDto();
        dto.setId(student.getId());
        if (student.getUser() != null) {
            dto.setUserId(student.getUser().getId());
            dto.setEmail(student.getUser().getEmail());
        }
        dto.setFullName(student.getFullName());
        dto.setPhone(student.getPhone());
        dto.setDateOfBirth(student.getDateOfBirth());
        dto.setDepartment(student.getDepartment());
        dto.setDegree(student.getDegree());
        dto.setGraduationYear(student.getGraduationYear());
        dto.setCgpa(student.getCgpa());
        dto.setResumePath(student.getResumePath());
        dto.setProfileCompleted(student.isProfileCompleted());

        if (student.getSkills() != null) {
            dto.setSkills(student.getSkills().stream().map(Skill::getName).collect(Collectors.toSet()));
        } else {
            dto.setSkills(new HashSet<>());
        }

        return dto;
    }
}
