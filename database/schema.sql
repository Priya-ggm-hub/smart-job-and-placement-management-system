-- ==========================================================
-- Smart Job & Placement Management System
-- Relational Database Schema (MySQL 8.0+)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS placement_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE placement_db;

-- Disable foreign key checks during schema creation
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------
-- 1. Table: users
-- Purpose: System authentication & role-based access
-- ----------------------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL COMMENT 'ROLE_STUDENT, ROLE_ADMIN',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 2. Table: students
-- Purpose: Detailed profile, academic data, resume reference
-- ----------------------------------------------------------
DROP TABLE IF EXISTS students;
CREATE TABLE students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    department VARCHAR(50) NOT NULL COMMENT 'CSE, ECE, IT, MECH, CIVIL, etc.',
    degree VARCHAR(50) NOT NULL COMMENT 'B.Tech, B.E., M.Tech, MCA, etc.',
    graduation_year INT NOT NULL,
    cgpa DECIMAL(4, 2) NOT NULL,
    resume_path VARCHAR(255) NULL,
    profile_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student_department (department),
    INDEX idx_student_grad_year (graduation_year),
    INDEX idx_student_cgpa (cgpa)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 3. Table: skills
-- Purpose: Master list of technical and soft skills
-- ----------------------------------------------------------
DROP TABLE IF EXISTS skills;
CREATE TABLE skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    INDEX idx_skill_name (name)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 4. Table: student_skills (Join Table)
-- Purpose: Many-to-Many association between students and skills
-- ----------------------------------------------------------
DROP TABLE IF EXISTS student_skills;
CREATE TABLE student_skills (
    student_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    PRIMARY KEY (student_id, skill_id),
    CONSTRAINT fk_ss_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_ss_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 5. Table: companies
-- Purpose: Recruiting organization information
-- ----------------------------------------------------------
DROP TABLE IF EXISTS companies;
CREATE TABLE companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    industry VARCHAR(50),
    location VARCHAR(100),
    website VARCHAR(100),
    contact_email VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_company_name (name),
    INDEX idx_company_industry (industry)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 6. Table: jobs
-- Purpose: Campus recruitment drives & placement openings
-- ----------------------------------------------------------
DROP TABLE IF EXISTS jobs;
CREATE TABLE jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    min_cgpa DECIMAL(4, 2) NOT NULL DEFAULT 0.00,
    eligible_department VARCHAR(50) NOT NULL DEFAULT 'ALL' COMMENT 'ALL or specific like CSE, IT, ECE',
    graduation_year INT NULL COMMENT 'Target batch, or NULL for all',
    location VARCHAR(100),
    employment_type VARCHAR(50) NOT NULL DEFAULT 'Full-time' COMMENT 'Full-time, Internship, Contract',
    salary_package VARCHAR(50) COMMENT 'e.g., 12 LPA, 8.5 LPA',
    deadline DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' COMMENT 'OPEN, CLOSED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_jobs_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_job_deadline (deadline),
    INDEX idx_job_status (status),
    INDEX idx_job_dept (eligible_department)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 7. Table: job_skills (Join Table)
-- Purpose: Many-to-Many association for job skill requirements
-- ----------------------------------------------------------
DROP TABLE IF EXISTS job_skills;
CREATE TABLE job_skills (
    job_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    PRIMARY KEY (job_id, skill_id),
    CONSTRAINT fk_js_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_js_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 8. Table: applications
-- Purpose: Student applications to recruitment drives
-- ----------------------------------------------------------
DROP TABLE IF EXISTS applications;
CREATE TABLE applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    application_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) NOT NULL DEFAULT 'APPLIED' COMMENT 'APPLIED, SHORTLISTED, INTERVIEW_SCHEDULED, REJECTED, SELECTED',
    remarks TEXT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_job_application UNIQUE (student_id, job_id),
    CONSTRAINT fk_app_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_app_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_app_status (status),
    INDEX idx_app_student (student_id),
    INDEX idx_app_job (job_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 9. Table: interviews
-- Purpose: Interview rounds for shortlisted candidates
-- ----------------------------------------------------------
DROP TABLE IF EXISTS interviews;
CREATE TABLE interviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    interview_date DATE NOT NULL,
    interview_time TIME NOT NULL,
    mode VARCHAR(20) NOT NULL DEFAULT 'ONLINE' COMMENT 'ONLINE, OFFLINE',
    location_or_link VARCHAR(255) NOT NULL COMMENT 'Physical Room or Video Meeting Link',
    round_name VARCHAR(100) NOT NULL COMMENT 'Technical Round 1, Coding Assessment, HR Round, etc.',
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' COMMENT 'SCHEDULED, COMPLETED, CANCELLED',
    remarks TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_interview_app FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    INDEX idx_interview_date (interview_date),
    INDEX idx_interview_status (status)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 10. Table: notifications
-- Purpose: In-app alerts for student workflow milestones
-- ----------------------------------------------------------
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    type VARCHAR(30) NOT NULL DEFAULT 'GENERAL' COMMENT 'STATUS_UPDATE, INTERVIEW, SYSTEM',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_notif_student_read (student_id, is_read)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 11. Table: skill_resources
-- Purpose: Curated skill-gap learning resources & guides
-- ----------------------------------------------------------
DROP TABLE IF EXISTS skill_resources;
CREATE TABLE skill_resources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(50) NOT NULL UNIQUE,
    resource_title VARCHAR(100) NOT NULL,
    resource_url VARCHAR(255) NOT NULL,
    description TEXT NULL,
    INDEX idx_sr_skill_name (skill_name)
) ENGINE=InnoDB;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
