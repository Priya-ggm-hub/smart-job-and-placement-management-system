package com.placement;

import com.placement.entity.Skill;
import com.placement.entity.SkillResource;
import com.placement.entity.Student;
import com.placement.entity.User;
import com.placement.entity.enums.Role;
import com.placement.repository.SkillRepository;
import com.placement.repository.SkillResourceRepository;
import com.placement.repository.StudentRepository;
import com.placement.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.File;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@SpringBootApplication
public class PlacementApplication {

    public static void main(String[] args) {
        SpringApplication.run(PlacementApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(
            UserRepository userRepository,
            StudentRepository studentRepository,
            SkillRepository skillRepository,
            SkillResourceRepository skillResourceRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // Ensure uploads directory exists
            File uploadDir = new File("uploads/resumes");
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // 1. Initialize or Synchronize Default Admin
            User admin = userRepository.findByEmail("admin@placement.edu").orElse(null);
            if (admin == null) {
                admin = new User(
                        "admin@placement.edu",
                        passwordEncoder.encode("Admin@123"),
                        Role.ROLE_ADMIN
                );
                userRepository.save(admin);
                System.out.println(">>> Default Admin created: admin@placement.edu / Admin@123");
            } else if (!passwordEncoder.matches("Admin@123", admin.getPassword())) {
                admin.setPassword(passwordEncoder.encode("Admin@123"));
                admin.setRole(Role.ROLE_ADMIN);
                admin.setActive(true);
                userRepository.save(admin);
                System.out.println(">>> Default Admin password synchronized: admin@placement.edu / Admin@123");
            }

            // 2. Initialize Core Skills first so they can be assigned
            List<String> coreSkills = Arrays.asList(
                    "Java", "Spring Boot", "Python", "React", "JavaScript",
                    "SQL", "MySQL", "AWS", "Docker", "Kubernetes",
                    "Data Structures", "Algorithms", "Machine Learning", "Node.js",
                    "C++", "Git", "System Design", "REST API"
            );
            for (String skillName : coreSkills) {
                if (skillRepository.findByNameIgnoreCase(skillName).isEmpty()) {
                    skillRepository.save(new Skill(skillName));
                }
            }

            // 3. Initialize or Synchronize Demo Student (rahul.sharma@college.edu)
            User studentUser = userRepository.findByEmail("rahul.sharma@college.edu").orElse(null);
            if (studentUser == null) {
                studentUser = new User(
                        "rahul.sharma@college.edu",
                        passwordEncoder.encode("Password@123"),
                        Role.ROLE_STUDENT
                );
                studentUser = userRepository.save(studentUser);
                System.out.println(">>> Demo Student User created: rahul.sharma@college.edu / Password@123");
            } else if (!passwordEncoder.matches("Password@123", studentUser.getPassword())) {
                studentUser.setPassword(passwordEncoder.encode("Password@123"));
                studentUser.setRole(Role.ROLE_STUDENT);
                studentUser.setActive(true);
                studentUser = userRepository.save(studentUser);
                System.out.println(">>> Demo Student User password synchronized: rahul.sharma@college.edu / Password@123");
            }

            // Ensure demo student profile exists in students table
            if (studentRepository.findByUser(studentUser).isEmpty()) {
                Student student = new Student();
                student.setUser(studentUser);
                student.setFullName("Rahul Sharma");
                student.setPhone("+91 9876543210");
                student.setDateOfBirth(LocalDate.of(2003, 5, 14));
                student.setDepartment("CSE");
                student.setDegree("B.Tech");
                student.setGraduationYear(2025);
                student.setCgpa(new BigDecimal("8.75"));
                student.setProfileCompleted(true);

                // Attach core skills
                Set<Skill> studentSkillSet = new HashSet<>();
                List<String> defaultSkills = Arrays.asList("Java", "Spring Boot", "SQL", "Git", "REST API");
                for (String sk : defaultSkills) {
                    skillRepository.findByNameIgnoreCase(sk).ifPresent(studentSkillSet::add);
                }
                student.setSkills(studentSkillSet);
                studentRepository.save(student);
                System.out.println(">>> Demo Student Profile created for Rahul Sharma");
            }

            // Synchronize other demo accounts if present from seed data
            List<String> otherDemoAccounts = Arrays.asList(
                    "ananya.patel@college.edu",
                    "vikram.singh@college.edu",
                    "priya.nair@college.edu"
            );
            for (String demoEmail : otherDemoAccounts) {
                userRepository.findByEmail(demoEmail).ifPresent(u -> {
                    if (!passwordEncoder.matches("Password@123", u.getPassword())) {
                        u.setPassword(passwordEncoder.encode("Password@123"));
                        userRepository.save(u);
                    }
                });
            }

            // 4. Initialize Curated Skill Resources for Skill Gap Analysis
            if (skillResourceRepository.count() == 0) {
                skillResourceRepository.save(new SkillResource(
                        "Java", "Oracle Java Documentation & Tutorials",
                        "https://dev.java/learn/",
                        "Official comprehensive Java language reference and modern tutorials."
                ));
                skillResourceRepository.save(new SkillResource(
                        "Spring Boot", "Spring Boot Official Getting Started Guides",
                        "https://spring.io/guides",
                        "Hands-on tutorials for building production-ready REST APIs and Microservices with Spring Boot."
                ));
                skillResourceRepository.save(new SkillResource(
                        "React", "React.js Interactive Documentation",
                        "https://react.dev/learn",
                        "Official React documentation with interactive code sandboxes and state management guides."
                ));
                skillResourceRepository.save(new SkillResource(
                        "Python", "Python Official Documentation & Tutorial",
                        "https://docs.python.org/3/tutorial/",
                        "Official guide covering Python basics, data structures, and standard libraries."
                ));
                skillResourceRepository.save(new SkillResource(
                        "SQL", "W3Schools SQL Tutorial & Practice",
                        "https://www.w3schools.com/sql/",
                        "Interactive SQL query tutorial covering joins, grouping, indexing, and DDL."
                ));
                skillResourceRepository.save(new SkillResource(
                        "Docker", "Docker Getting Started Guide",
                        "https://docs.docker.com/get-started/",
                        "Official guide for containerizing applications, building Dockerfiles, and compose files."
                ));
                skillResourceRepository.save(new SkillResource(
                        "AWS", "AWS Free Tier & Cloud Fundamentals",
                        "https://aws.amazon.com/getting-started/",
                        "Practical tutorials on AWS EC2, S3, RDS, Lambda, and IAM fundamentals."
                ));
                skillResourceRepository.save(new SkillResource(
                        "Data Structures", "GeeksforGeeks Data Structures Course",
                        "https://www.geeksforgeeks.org/data-structures/",
                        "Complete roadmap covering Arrays, Trees, Graphs, HashMaps, and Dynamic Programming."
                ));
                skillResourceRepository.save(new SkillResource(
                        "Kubernetes", "Kubernetes Basics & Tutorials",
                        "https://kubernetes.io/docs/tutorials/kubernetes-basics/",
                        "Official interactive guide for container orchestration, Pods, Deployments, and Services."
                ));
                skillResourceRepository.save(new SkillResource(
                        "Machine Learning", "Google Machine Learning Crash Course",
                        "https://developers.google.com/machine-learning/crash-course",
                        "Self-study guide with video lectures and interactive TensorFlow exercises."
                ));
                System.out.println(">>> Core skill resources seeded for Skill Gap Analysis.");
            }
        };
    }
}
