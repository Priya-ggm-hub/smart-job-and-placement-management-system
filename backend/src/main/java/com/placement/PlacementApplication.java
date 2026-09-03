package com.placement;

import com.placement.entity.Skill;
import com.placement.entity.SkillResource;
import com.placement.entity.User;
import com.placement.entity.enums.Role;
import com.placement.repository.SkillRepository;
import com.placement.repository.SkillResourceRepository;
import com.placement.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.File;
import java.util.Arrays;
import java.util.List;

@SpringBootApplication
public class PlacementApplication {

    public static void main(String[] args) {
        SpringApplication.run(PlacementApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(
            UserRepository userRepository,
            SkillRepository skillRepository,
            SkillResourceRepository skillResourceRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // Ensure uploads directory exists
            File uploadDir = new File("uploads/resumes");
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // 1. Initialize Default Admin if not exists
            if (!userRepository.existsByEmail("admin@placement.edu")) {
                User admin = new User(
                        "admin@placement.edu",
                        passwordEncoder.encode("Admin@123"),
                        Role.ROLE_ADMIN
                );
                userRepository.save(admin);
                System.out.println(">>> Default Admin created: admin@placement.edu / Admin@123");
            }

            // 2. Initialize Core Skills
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

            // 3. Initialize Curated Skill Resources for Skill Gap Analysis
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
