-- ==========================================================
-- Smart Job & Placement Management System
-- Seed Data for Development & Testing
-- ==========================================================

USE placement_db;

-- ----------------------------------------------------------
-- 1. Insert Skills Catalog
-- ----------------------------------------------------------
INSERT INTO skills (name) VALUES
('Java'),
('Spring Boot'),
('Python'),
('React'),
('JavaScript'),
('SQL'),
('MySQL'),
('AWS'),
('Docker'),
('Kubernetes'),
('Data Structures'),
('Algorithms'),
('Machine Learning'),
('Node.js'),
('C++'),
('Git'),
('System Design'),
('REST API')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ----------------------------------------------------------
-- 2. Insert Curated Skill Learning Resources (Skill Gap Analysis)
-- ----------------------------------------------------------
INSERT INTO skill_resources (skill_name, resource_title, resource_url, description) VALUES
('Java', 'Oracle Java Documentation & Tutorials', 'https://dev.java/learn/', 'Official comprehensive Java language reference and modern tutorials.'),
('Spring Boot', 'Spring Boot Official Getting Started Guides', 'https://spring.io/guides', 'Hands-on tutorials for building production-ready REST APIs and Microservices with Spring Boot.'),
('React', 'React.js Interactive Documentation', 'https://react.dev/learn', 'Official React documentation with interactive code sandboxes and state management guides.'),
('Python', 'Python Official Documentation & Tutorial', 'https://docs.python.org/3/tutorial/', 'Official guide covering Python basics, data structures, and standard libraries.'),
('SQL', 'W3Schools SQL Tutorial & Practice', 'https://www.w3schools.com/sql/', 'Interactive SQL query tutorial covering joins, grouping, indexing, and DDL.'),
('Docker', 'Docker Getting Started Guide', 'https://docs.docker.com/get-started/', 'Official guide for containerizing applications, building Dockerfiles, and compose files.'),
('AWS', 'AWS Free Tier & Cloud Fundamentals', 'https://aws.amazon.com/getting-started/', 'Practical tutorials on AWS EC2, S3, RDS, Lambda, and IAM fundamentals.'),
('Data Structures', 'GeeksforGeeks Data Structures Course', 'https://www.geeksforgeeks.org/data-structures/', 'Complete roadmap covering Arrays, Trees, Graphs, HashMaps, and Dynamic Programming.'),
('Kubernetes', 'Kubernetes Basics & Tutorials', 'https://kubernetes.io/docs/tutorials/kubernetes-basics/', 'Official interactive guide for container orchestration, Pods, Deployments, and Services.'),
('Machine Learning', 'Google Machine Learning Crash Course', 'https://developers.google.com/machine-learning/crash-course', 'Self-study guide with video lectures and interactive TensorFlow exercises.')
ON DUPLICATE KEY UPDATE resource_title=VALUES(resource_title), resource_url=VALUES(resource_url), description=VALUES(description);

-- ----------------------------------------------------------
-- 3. Insert Users (Admin & Students)
-- Password for all seed accounts: "Password@123" (BCrypt hash below)
-- Admin: admin@placement.edu / Password@123
-- Student 1: rahul.sharma@college.edu / Password@123
-- Student 2: ananya.patel@college.edu / Password@123
-- Student 3: vikram.singh@college.edu / Password@123
-- Student 4: priya.nair@college.edu / Password@123
-- ----------------------------------------------------------
INSERT INTO users (id, email, password, role, is_active) VALUES
(1, 'admin@placement.edu', '$2a$10$O0rE2B5cRjJq6eXjM7jW4.FkXQZqPZzJ1eU5iHqQ8xY2k0N9e7O6S', 'ROLE_ADMIN', TRUE),
(2, 'rahul.sharma@college.edu', '$2a$10$O0rE2B5cRjJq6eXjM7jW4.FkXQZqPZzJ1eU5iHqQ8xY2k0N9e7O6S', 'ROLE_STUDENT', TRUE),
(3, 'ananya.patel@college.edu', '$2a$10$O0rE2B5cRjJq6eXjM7jW4.FkXQZqPZzJ1eU5iHqQ8xY2k0N9e7O6S', 'ROLE_STUDENT', TRUE),
(4, 'vikram.singh@college.edu', '$2a$10$O0rE2B5cRjJq6eXjM7jW4.FkXQZqPZzJ1eU5iHqQ8xY2k0N9e7O6S', 'ROLE_STUDENT', TRUE),
(5, 'priya.nair@college.edu', '$2a$10$O0rE2B5cRjJq6eXjM7jW4.FkXQZqPZzJ1eU5iHqQ8xY2k0N9e7O6S', 'ROLE_STUDENT', TRUE)
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- ----------------------------------------------------------
-- 4. Insert Student Profiles
-- ----------------------------------------------------------
INSERT INTO students (id, user_id, full_name, phone, date_of_birth, department, degree, graduation_year, cgpa, resume_path, profile_completed) VALUES
(1, 2, 'Rahul Sharma', '+91 9876543210', '2003-05-14', 'CSE', 'B.Tech', 2025, 8.75, 'uploads/resumes/sample_rahul.pdf', TRUE),
(2, 3, 'Ananya Patel', '+91 9876543211', '2003-09-22', 'ECE', 'B.Tech', 2025, 7.90, 'uploads/resumes/sample_ananya.pdf', TRUE),
(3, 4, 'Vikram Singh', '+91 9876543212', '2002-12-05', 'IT', 'B.Tech', 2025, 6.80, NULL, FALSE),
(4, 5, 'Priya Nair', '+91 9876543213', '2003-03-30', 'MECH', 'B.Tech', 2025, 8.20, 'uploads/resumes/sample_priya.pdf', TRUE)
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- ----------------------------------------------------------
-- 5. Map Skills to Students
-- ----------------------------------------------------------
-- Rahul: Java (1), Spring Boot (2), SQL (6), Git (16), REST API (18)
INSERT IGNORE INTO student_skills (student_id, skill_id) VALUES
(1, 1), (1, 2), (1, 6), (1, 16), (1, 18),
-- Ananya: Python (3), React (4), JavaScript (5), Git (16)
(2, 3), (2, 4), (2, 5), (2, 16),
-- Vikram: Python (3), SQL (6)
(3, 3), (3, 6),
-- Priya: C++ (15), Python (3), Data Structures (11)
(4, 15), (4, 3), (4, 11);

-- ----------------------------------------------------------
-- 6. Insert Recruiting Companies
-- ----------------------------------------------------------
INSERT INTO companies (id, name, description, industry, location, website, contact_email) VALUES
(1, 'TechCorp Global', 'Leading cloud transformation and enterprise software solutions provider.', 'Information Technology', 'Bangalore, India', 'https://techcorp-global.com', 'careers@techcorp-global.com'),
(2, 'Nexus FinTech Labs', 'Cutting-edge digital payments and high-frequency trading platform.', 'Financial Services', 'Mumbai, India', 'https://nexusfintech.io', 'recruitment@nexusfintech.io'),
(3, 'CloudScale Systems', 'Global infrastructure engineering and cloud automation partner.', 'Cloud Computing', 'Hyderabad, India', 'https://cloudscale-systems.com', 'jobs@cloudscale-systems.com'),
(4, 'Innovate AI Solutions', 'Applied artificial intelligence and computer vision product studio.', 'Artificial Intelligence', 'Pune, India', 'https://innovateai.tech', 'campus@innovateai.tech'),
(5, 'Apex Digital Media', 'Next-gen streaming media and interactive web platforms.', 'Internet / Media', 'Gurgaon, India', 'https://apexdigital.com', 'talent@apexdigital.com')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ----------------------------------------------------------
-- 7. Insert Recruitment Job Openings
-- ----------------------------------------------------------
INSERT INTO jobs (id, company_id, title, description, min_cgpa, eligible_department, graduation_year, location, employment_type, salary_package, deadline, status) VALUES
(1, 1, 'Graduate Software Engineer - Backend (Java)', 'Seeking proactive backend developers with strong core Java and Spring Boot knowledge to build scalable microservices.', 7.50, 'CSE', 2025, 'Bangalore, India', 'Full-time', '12.5 LPA', '2026-12-31', 'OPEN'),
(2, 2, 'Associate Full-Stack Developer', 'Design and implement dynamic web experiences using React.js and modern API endpoints.', 7.00, 'ALL', 2025, 'Mumbai, India', 'Full-time', '9.0 LPA', '2026-11-30', 'OPEN'),
(3, 3, 'Cloud Infrastructure Associate', 'Automate cloud deployments, Docker container lifecycle, and AWS cloud management.', 6.50, 'ALL', 2025, 'Hyderabad, India', 'Full-time', '8.0 LPA', '2026-10-15', 'OPEN'),
(4, 4, 'Junior ML Engineer', 'Build machine learning pipelines, evaluate classification models, and integrate Python-based predictive services.', 8.00, 'CSE', 2025, 'Pune, India', 'Full-time', '14.0 LPA', '2026-12-15', 'OPEN'),
(5, 5, 'Frontend Developer Intern', 'Exciting internship working with modern React and TypeScript web applications.', 6.00, 'ALL', 2025, 'Gurgaon, India', 'Internship', '5.0 LPA', '2026-09-30', 'OPEN')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- ----------------------------------------------------------
-- 8. Map Required Skills to Jobs
-- ----------------------------------------------------------
-- Job 1 (Java Dev): Java (1), Spring Boot (2), SQL (6)
INSERT IGNORE INTO job_skills (job_id, skill_id) VALUES
(1, 1), (1, 2), (1, 6),
-- Job 2 (Full Stack): React (4), JavaScript (5), REST API (18)
(2, 4), (2, 5), (2, 18),
-- Job 3 (Cloud): AWS (8), Docker (9), Git (16)
(3, 8), (3, 9), (3, 16),
-- Job 4 (ML): Python (3), Machine Learning (13), Data Structures (11)
(4, 3), (4, 13), (4, 11),
-- Job 5 (Frontend): React (4), JavaScript (5)
(5, 4), (5, 5);

-- ----------------------------------------------------------
-- 9. Insert Sample Applications & Status Workflows
-- ----------------------------------------------------------
INSERT INTO applications (id, student_id, job_id, application_date, status, remarks) VALUES
(1, 1, 1, '2026-08-01 10:00:00', 'SHORTLISTED', 'Resume matches core Java and Spring requirements.'),
(2, 1, 2, '2026-08-02 11:30:00', 'APPLIED', 'Application submitted for review.'),
(3, 2, 2, '2026-08-03 14:15:00', 'INTERVIEW_SCHEDULED', 'Shortlisted after initial screening.'),
(4, 2, 5, '2026-08-04 16:00:00', 'SELECTED', 'Offered internship role.'),
(5, 4, 3, '2026-08-05 09:45:00', 'REJECTED', 'Skill requirements not met.')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- ----------------------------------------------------------
-- 10. Insert Scheduled Interviews
-- ----------------------------------------------------------
INSERT INTO interviews (id, application_id, interview_date, interview_time, mode, location_or_link, round_name, status, remarks) VALUES
(1, 1, '2026-09-10', '11:00:00', 'ONLINE', 'https://meet.google.com/abc-placement-xyz', 'Technical Round 1', 'SCHEDULED', 'Focus on Java Concurrency, OOP, and Spring Boot annotations.'),
(2, 3, '2026-09-12', '14:30:00', 'ONLINE', 'https://meet.google.com/nexus-interview-2026', 'Frontend System Architecture', 'SCHEDULED', 'React component design and state management evaluation.')
ON DUPLICATE KEY UPDATE round_name=VALUES(round_name);

-- ----------------------------------------------------------
-- 11. Insert Sample In-App Notifications
-- ----------------------------------------------------------
INSERT INTO notifications (id, student_id, title, message, is_read, type, created_at) VALUES
(1, 1, 'Application Shortlisted!', 'Congratulations! Your application for Graduate Software Engineer - Backend (Java) at TechCorp Global has been shortlisted.', FALSE, 'STATUS_UPDATE', NOW() - INTERVAL 2 DAY),
(2, 1, 'Interview Scheduled', 'Your Technical Round 1 for TechCorp Global is scheduled on 2026-09-10 at 11:00 AM.', FALSE, 'INTERVIEW', NOW() - INTERVAL 1 DAY),
(3, 2, 'Interview Scheduled', 'Your interview for Associate Full-Stack Developer at Nexus FinTech Labs is scheduled on 2026-09-12 at 02:30 PM.', FALSE, 'INTERVIEW', NOW() - INTERVAL 1 DAY),
(4, 2, 'Offer Selected!', 'Congratulations! You have been selected for Frontend Developer Intern at Apex Digital Media.', TRUE, 'STATUS_UPDATE', NOW() - INTERVAL 3 DAY)
ON DUPLICATE KEY UPDATE title=VALUES(title);
