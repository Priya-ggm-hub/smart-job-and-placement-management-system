package com.placement.service;

import com.placement.dto.request.LoginRequest;
import com.placement.dto.request.RegisterRequest;
import com.placement.dto.response.AuthResponse;
import com.placement.entity.Skill;
import com.placement.entity.Student;
import com.placement.entity.User;
import com.placement.entity.enums.NotificationType;
import com.placement.entity.enums.Role;
import com.placement.exception.BadRequestException;
import com.placement.exception.ResourceNotFoundException;
import com.placement.repository.SkillRepository;
import com.placement.repository.StudentRepository;
import com.placement.repository.UserRepository;
import com.placement.security.JwtTokenProvider;
import com.placement.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public AuthResponse registerStudent(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new BadRequestException("Email address is already registered: " + request.getEmail());
        }

        // 1. Create User account
        User user = new User(
                request.getEmail().trim().toLowerCase(),
                passwordEncoder.encode(request.getPassword()),
                Role.ROLE_STUDENT
        );
        User savedUser = userRepository.save(user);

        // 2. Create Student profile
        Student student = new Student();
        student.setUser(savedUser);
        student.setFullName(request.getFullName().trim());
        student.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        student.setDateOfBirth(request.getDateOfBirth());
        student.setDepartment(request.getDepartment().trim().toUpperCase());
        student.setDegree(request.getDegree().trim());
        student.setGraduationYear(request.getGraduationYear());
        student.setCgpa(request.getCgpa());
        student.setProfileCompleted(true);

        // 3. Attach Skills
        if (request.getSkills() != null && !request.getSkills().isEmpty()) {
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

        Student savedStudent = studentRepository.save(student);

        // 4. Send Welcome In-App Notification & Email
        notificationService.createNotification(
                savedStudent,
                "Welcome to Campus Placement Portal!",
                "Your student account has been successfully registered. You can now explore job openings, check your eligibility, and upload your resume.",
                NotificationType.SYSTEM
        );

        // 5. Authenticate and generate token
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return new AuthResponse(jwt, savedUser.getId(), savedUser.getEmail(), savedUser.getRole().name(), savedStudent.getFullName(), savedStudent.getId());
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));

        String fullName = "Administrator";
        Long studentId = null;

        if (user.getRole() == Role.ROLE_STUDENT) {
            Student student = studentRepository.findByUser(user).orElse(null);
            if (student != null) {
                fullName = student.getFullName();
                studentId = student.getId();
            }
        }

        return new AuthResponse(jwt, user.getId(), user.getEmail(), user.getRole().name(), fullName, studentId);
    }

    @Transactional(readOnly = true)
    public AuthResponse getCurrentUser(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));

        String fullName = "Administrator";
        Long studentId = null;

        if (user.getRole() == Role.ROLE_STUDENT) {
            Student student = studentRepository.findByUser(user).orElse(null);
            if (student != null) {
                fullName = student.getFullName();
                studentId = student.getId();
            }
        }

        return new AuthResponse(null, user.getId(), user.getEmail(), user.getRole().name(), fullName, studentId);
    }
}
