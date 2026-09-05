package com.placement;

import com.placement.entity.*;
import com.placement.entity.enums.*;
import com.placement.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.File;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

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
            CompanyRepository companyRepository,
            JobRepository jobRepository,
            ApplicationRepository applicationRepository,
            InterviewRepository interviewRepository,
            NotificationRepository notificationRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            try {
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
                } else if (admin.getPassword() == null || !passwordEncoder.matches("Admin@123", admin.getPassword()) || admin.getRole() != Role.ROLE_ADMIN || !admin.isActive()) {
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

                // 3. Initialize or Synchronize Demo Students & Profiles
                class DemoStudentDef {
                    String email;
                    String fullName;
                    String phone;
                    LocalDate dob;
                    String department;
                    String degree;
                    int gradYear;
                    BigDecimal cgpa;
                    String resumePath;
                    boolean profileCompleted;
                    List<String> skills;

                    DemoStudentDef(String email, String fullName, String phone, LocalDate dob, String department, String degree, int gradYear, BigDecimal cgpa, String resumePath, boolean profileCompleted, List<String> skills) {
                        this.email = email;
                        this.fullName = fullName;
                        this.phone = phone;
                        this.dob = dob;
                        this.department = department;
                        this.degree = degree;
                        this.gradYear = gradYear;
                        this.cgpa = cgpa;
                        this.resumePath = resumePath;
                        this.profileCompleted = profileCompleted;
                        this.skills = skills;
                    }
                }

                List<DemoStudentDef> demoStudents = Arrays.asList(
                        new DemoStudentDef("rahul.sharma@college.edu", "Rahul Sharma", "+91 9876543210", LocalDate.of(2003, 5, 14), "CSE", "B.Tech", 2025, new BigDecimal("8.75"), "uploads/resumes/sample_rahul.pdf", true, Arrays.asList("Java", "Spring Boot", "SQL", "Git", "REST API")),
                        new DemoStudentDef("ananya.patel@college.edu", "Ananya Patel", "+91 9876543211", LocalDate.of(2003, 9, 22), "ECE", "B.Tech", 2025, new BigDecimal("7.90"), "uploads/resumes/sample_ananya.pdf", true, Arrays.asList("Python", "React", "JavaScript", "Git")),
                        new DemoStudentDef("vikram.singh@college.edu", "Vikram Singh", "+91 9876543212", LocalDate.of(2002, 12, 5), "IT", "B.Tech", 2025, new BigDecimal("6.80"), null, false, Arrays.asList("Python", "SQL")),
                        new DemoStudentDef("priya.nair@college.edu", "Priya Nair", "+91 9876543213", LocalDate.of(2003, 3, 30), "MECH", "B.Tech", 2025, new BigDecimal("8.20"), "uploads/resumes/sample_priya.pdf", true, Arrays.asList("C++", "Python", "Data Structures"))
                );

                Map<String, Student> studentMap = new HashMap<>();
                for (DemoStudentDef def : demoStudents) {
                    User user = userRepository.findByEmail(def.email).orElse(null);
                    if (user == null) {
                        user = new User(def.email, passwordEncoder.encode("Password@123"), Role.ROLE_STUDENT);
                        user = userRepository.save(user);
                    } else if (user.getPassword() == null || !passwordEncoder.matches("Password@123", user.getPassword()) || !user.isActive()) {
                        user.setPassword(passwordEncoder.encode("Password@123"));
                        user.setRole(Role.ROLE_STUDENT);
                        user.setActive(true);
                        user = userRepository.save(user);
                    }

                    Student student = studentRepository.findByUser(user).orElse(null);
                    if (student == null) {
                        student = studentRepository.findByUserEmail(def.email).orElse(null);
                    }
                    if (student == null) {
                        student = new Student();
                        student.setUser(user);
                        student.setFullName(def.fullName);
                        student.setPhone(def.phone);
                        student.setDateOfBirth(def.dob);
                        student.setDepartment(def.department);
                        student.setDegree(def.degree);
                        student.setGraduationYear(def.gradYear);
                        student.setCgpa(def.cgpa);
                        student.setResumePath(def.resumePath);
                        student.setProfileCompleted(def.profileCompleted);

                        Set<Skill> studentSkills = new HashSet<>();
                        for (String sk : def.skills) {
                            skillRepository.findByNameIgnoreCase(sk).ifPresent(studentSkills::add);
                        }
                        student.setSkills(studentSkills);
                        student = studentRepository.save(student);
                    }
                    studentMap.put(def.email, student);
                }
                System.out.println(">>> Demo Student accounts & profiles initialized.");

                // 4. Initialize Curated Skill Resources for Skill Gap Analysis
                if (skillResourceRepository.count() == 0) {
                    skillResourceRepository.save(new SkillResource("Java", "Oracle Java Documentation & Tutorials", "https://dev.java/learn/", "Official comprehensive Java language reference and modern tutorials."));
                    skillResourceRepository.save(new SkillResource("Spring Boot", "Spring Boot Official Getting Started Guides", "https://spring.io/guides", "Hands-on tutorials for building production-ready REST APIs and Microservices with Spring Boot."));
                    skillResourceRepository.save(new SkillResource("React", "React.js Interactive Documentation", "https://react.dev/learn", "Official React documentation with interactive code sandboxes and state management guides."));
                    skillResourceRepository.save(new SkillResource("Python", "Python Official Documentation & Tutorial", "https://docs.python.org/3/tutorial/", "Official guide covering Python basics, data structures, and standard libraries."));
                    skillResourceRepository.save(new SkillResource("SQL", "W3Schools SQL Tutorial & Practice", "https://www.w3schools.com/sql/", "Interactive SQL query tutorial covering joins, grouping, indexing, and DDL."));
                    skillResourceRepository.save(new SkillResource("Docker", "Docker Getting Started Guide", "https://docs.docker.com/get-started/", "Official guide for containerizing applications, building Dockerfiles, and compose files."));
                    skillResourceRepository.save(new SkillResource("AWS", "AWS Free Tier & Cloud Fundamentals", "https://aws.amazon.com/getting-started/", "Practical tutorials on AWS EC2, S3, RDS, Lambda, and IAM fundamentals."));
                    skillResourceRepository.save(new SkillResource("Data Structures", "GeeksforGeeks Data Structures Course", "https://www.geeksforgeeks.org/data-structures/", "Complete roadmap covering Arrays, Trees, Graphs, HashMaps, and Dynamic Programming."));
                    skillResourceRepository.save(new SkillResource("Kubernetes", "Kubernetes Basics & Tutorials", "https://kubernetes.io/docs/tutorials/kubernetes-basics/", "Official interactive guide for container orchestration, Pods, Deployments, and Services."));
                    skillResourceRepository.save(new SkillResource("Machine Learning", "Google Machine Learning Crash Course", "https://developers.google.com/machine-learning/crash-course", "Self-study guide with video lectures and interactive TensorFlow exercises."));
                    System.out.println(">>> Core skill resources seeded for Skill Gap Analysis.");
                }

                // 5. Initialize Recruiting Companies
                class DemoCompanyDef {
                    String name;
                    String desc;
                    String industry;
                    String location;
                    String website;
                    String email;

                    DemoCompanyDef(String name, String desc, String industry, String location, String website, String email) {
                        this.name = name;
                        this.desc = desc;
                        this.industry = industry;
                        this.location = location;
                        this.website = website;
                        this.email = email;
                    }
                }

                List<DemoCompanyDef> demoCompanies = Arrays.asList(
                        new DemoCompanyDef("TechCorp Global", "Leading cloud transformation and enterprise software solutions provider.", "Information Technology", "Bangalore, India", "https://techcorp-global.com", "careers@techcorp-global.com"),
                        new DemoCompanyDef("Nexus FinTech Labs", "Cutting-edge digital payments and high-frequency trading platform.", "Financial Services", "Mumbai, India", "https://nexusfintech.io", "recruitment@nexusfintech.io"),
                        new DemoCompanyDef("CloudScale Systems", "Global infrastructure engineering and cloud automation partner.", "Cloud Computing", "Hyderabad, India", "https://cloudscale-systems.com", "jobs@cloudscale-systems.com"),
                        new DemoCompanyDef("Innovate AI Solutions", "Applied artificial intelligence and computer vision product studio.", "Artificial Intelligence", "Pune, India", "https://innovateai.tech", "campus@innovateai.tech"),
                        new DemoCompanyDef("Apex Digital Media", "Next-gen streaming media and interactive web platforms.", "Internet / Media", "Gurgaon, India", "https://apexdigital.com", "talent@apexdigital.com")
                );

                Map<String, Company> companyMap = new HashMap<>();
                for (DemoCompanyDef def : demoCompanies) {
                    Company company = companyRepository.findByNameIgnoreCase(def.name).orElse(null);
                    if (company == null) {
                        company = new Company();
                        company.setName(def.name);
                        company.setDescription(def.desc);
                        company.setIndustry(def.industry);
                        company.setLocation(def.location);
                        company.setWebsite(def.website);
                        company.setContactEmail(def.email);
                        company = companyRepository.save(company);
                    }
                    companyMap.put(def.name, company);
                }
                System.out.println(">>> Recruiting companies seeded.");

                // 6. Initialize Recruitment Job Openings
                class DemoJobDef {
                    String companyName;
                    String title;
                    String desc;
                    BigDecimal minCgpa;
                    String eligibleDept;
                    Integer gradYear;
                    String location;
                    String empType;
                    String salaryPackage;
                    LocalDate deadline;
                    String status;
                    List<String> requiredSkills;

                    DemoJobDef(String companyName, String title, String desc, BigDecimal minCgpa, String eligibleDept, Integer gradYear, String location, String empType, String salaryPackage, LocalDate deadline, String status, List<String> requiredSkills) {
                        this.companyName = companyName;
                        this.title = title;
                        this.desc = desc;
                        this.minCgpa = minCgpa;
                        this.eligibleDept = eligibleDept;
                        this.gradYear = gradYear;
                        this.location = location;
                        this.empType = empType;
                        this.salaryPackage = salaryPackage;
                        this.deadline = deadline;
                        this.status = status;
                        this.requiredSkills = requiredSkills;
                    }
                }

                List<DemoJobDef> demoJobs = Arrays.asList(
                        new DemoJobDef("TechCorp Global", "Graduate Software Engineer - Backend (Java)", "Seeking proactive backend developers with strong core Java and Spring Boot knowledge to build scalable microservices.", new BigDecimal("7.50"), "CSE", 2025, "Bangalore, India", "Full-time", "12.5 LPA", LocalDate.of(2026, 12, 31), "OPEN", Arrays.asList("Java", "Spring Boot", "SQL")),
                        new DemoJobDef("Nexus FinTech Labs", "Associate Full-Stack Developer", "Design and implement dynamic web experiences using React.js and modern API endpoints.", new BigDecimal("7.00"), "ALL", 2025, "Mumbai, India", "Full-time", "9.0 LPA", LocalDate.of(2026, 11, 30), "OPEN", Arrays.asList("React", "JavaScript", "REST API")),
                        new DemoJobDef("CloudScale Systems", "Cloud Infrastructure Associate", "Automate cloud deployments, Docker container lifecycle, and AWS cloud management.", new BigDecimal("6.50"), "ALL", 2025, "Hyderabad, India", "Full-time", "8.0 LPA", LocalDate.of(2026, 10, 15), "OPEN", Arrays.asList("AWS", "Docker", "Git")),
                        new DemoJobDef("Innovate AI Solutions", "Junior ML Engineer", "Build machine learning pipelines, evaluate classification models, and integrate Python-based predictive services.", new BigDecimal("8.00"), "CSE", 2025, "Pune, India", "Full-time", "14.0 LPA", LocalDate.of(2026, 12, 15), "OPEN", Arrays.asList("Python", "Machine Learning", "Data Structures")),
                        new DemoJobDef("Apex Digital Media", "Frontend Developer Intern", "Exciting internship working with modern React and TypeScript web applications.", new BigDecimal("6.00"), "ALL", 2025, "Gurgaon, India", "Internship", "5.0 LPA", LocalDate.of(2026, 9, 30), "OPEN", Arrays.asList("React", "JavaScript"))
                );

                Map<String, Job> jobMap = new HashMap<>();
                for (DemoJobDef def : demoJobs) {
                    Company company = companyMap.get(def.companyName);
                    if (company != null) {
                        Job job = jobRepository.findByTitleAndCompanyId(def.title, company.getId()).orElse(null);
                        if (job == null) {
                            job = new Job();
                            job.setCompany(company);
                            job.setTitle(def.title);
                            job.setDescription(def.desc);
                            job.setMinCgpa(def.minCgpa);
                            job.setEligibleDepartment(def.eligibleDept);
                            job.setGraduationYear(def.gradYear);
                            job.setLocation(def.location);
                            job.setEmploymentType(def.empType);
                            job.setSalaryPackage(def.salaryPackage);
                            job.setDeadline(def.deadline);
                            job.setStatus(def.status);

                            Set<Skill> reqSkills = new HashSet<>();
                            for (String sk : def.requiredSkills) {
                                skillRepository.findByNameIgnoreCase(sk).ifPresent(reqSkills::add);
                            }
                            job.setRequiredSkills(reqSkills);
                            job = jobRepository.save(job);
                        }
                        jobMap.put(def.title, job);
                    }
                }
                System.out.println(">>> Demo job openings seeded with required skills.");

                // 7. Initialize Sample Applications & Status Workflows if empty
                if (applicationRepository.count() == 0) {
                    Student rahul = studentMap.get("rahul.sharma@college.edu");
                    Student ananya = studentMap.get("ananya.patel@college.edu");
                    Student priya = studentMap.get("priya.nair@college.edu");

                    Job javaJob = jobMap.get("Graduate Software Engineer - Backend (Java)");
                    Job fullstackJob = jobMap.get("Associate Full-Stack Developer");
                    Job cloudJob = jobMap.get("Cloud Infrastructure Associate");
                    Job frontendIntern = jobMap.get("Frontend Developer Intern");

                    if (rahul != null && javaJob != null) {
                        Application app1 = new Application(rahul, javaJob);
                        app1.setStatus(ApplicationStatus.SHORTLISTED);
                        app1.setRemarks("Resume matches core Java and Spring requirements.");
                        applicationRepository.save(app1);

                        // Scheduled interview for Rahul
                        if (interviewRepository.count() == 0) {
                            Interview int1 = new Interview();
                            int1.setApplication(app1);
                            int1.setInterviewDate(LocalDate.now().plusDays(5));
                            int1.setInterviewTime(LocalTime.of(11, 0));
                            int1.setMode(InterviewMode.ONLINE);
                            int1.setLocationOrLink("https://meet.google.com/abc-placement-xyz");
                            int1.setRoundName("Technical Round 1");
                            int1.setStatus(InterviewStatus.SCHEDULED);
                            int1.setRemarks("Focus on Java Concurrency, OOP, and Spring Boot annotations.");
                            interviewRepository.save(int1);
                        }
                    }

                    if (rahul != null && fullstackJob != null) {
                        Application app2 = new Application(rahul, fullstackJob);
                        app2.setStatus(ApplicationStatus.APPLIED);
                        app2.setRemarks("Application submitted for review.");
                        applicationRepository.save(app2);
                    }

                    if (ananya != null && fullstackJob != null) {
                        Application app3 = new Application(ananya, fullstackJob);
                        app3.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
                        app3.setRemarks("Shortlisted after initial screening.");
                        applicationRepository.save(app3);

                        Interview int2 = new Interview();
                        int2.setApplication(app3);
                        int2.setInterviewDate(LocalDate.now().plusDays(7));
                        int2.setInterviewTime(LocalTime.of(14, 30));
                        int2.setMode(InterviewMode.ONLINE);
                        int2.setLocationOrLink("https://meet.google.com/nexus-interview-2026");
                        int2.setRoundName("Frontend System Architecture");
                        int2.setStatus(InterviewStatus.SCHEDULED);
                        int2.setRemarks("React component design and state management evaluation.");
                        interviewRepository.save(int2);
                    }

                    if (ananya != null && frontendIntern != null) {
                        Application app4 = new Application(ananya, frontendIntern);
                        app4.setStatus(ApplicationStatus.SELECTED);
                        app4.setRemarks("Offered internship role.");
                        applicationRepository.save(app4);
                    }

                    if (priya != null && cloudJob != null) {
                        Application app5 = new Application(priya, cloudJob);
                        app5.setStatus(ApplicationStatus.REJECTED);
                        app5.setRemarks("Skill requirements not met.");
                        applicationRepository.save(app5);
                    }
                    System.out.println(">>> Sample applications and interview workflows seeded.");
                }

                // 8. Initialize In-App Notifications if empty
                if (notificationRepository.count() == 0) {
                    Student rahul = studentMap.get("rahul.sharma@college.edu");
                    if (rahul != null) {
                        notificationRepository.save(new Notification(rahul, "Application Shortlisted!", "Congratulations! Your application for Graduate Software Engineer - Backend (Java) at TechCorp Global has been shortlisted.", NotificationType.STATUS_UPDATE));
                        notificationRepository.save(new Notification(rahul, "Interview Scheduled", "Your Technical Round 1 for TechCorp Global is scheduled in 5 days at 11:00 AM.", NotificationType.INTERVIEW));
                    }
                    Student ananya = studentMap.get("ananya.patel@college.edu");
                    if (ananya != null) {
                        notificationRepository.save(new Notification(ananya, "Interview Scheduled", "Your interview for Associate Full-Stack Developer at Nexus FinTech Labs is scheduled in 7 days at 02:30 PM.", NotificationType.INTERVIEW));
                        Notification offerNotif = new Notification(ananya, "Offer Selected!", "Congratulations! You have been selected for Frontend Developer Intern at Apex Digital Media.", NotificationType.STATUS_UPDATE);
                        offerNotif.setRead(true);
                        notificationRepository.save(offerNotif);
                    }
                    System.out.println(">>> Sample notifications seeded.");
                }
            } catch (Exception e) {
                System.err.println(">>> Warning: Data initialization encountered an error: " + e.getMessage());
                e.printStackTrace();
            }
        };
    }
}
