# Smart Job & Placement Management System

A production-grade, full-stack Campus Placement and Job Management System designed for universities and academic institutions. Built using **Spring Boot 3 (Java 17+)**, **React.js (Vite)**, and **MySQL**, this system streamlines and automates the entire campus recruitment lifecycle—from candidate onboarding, resume storage, and automated eligibility checking with skill gap recommendations, to interview scheduling, email/in-app notifications, and placement analytics.

---

## 🚀 Key Features

### 👨‍🎓 Student Features
- **Authentication & Security**: Student self-registration and JWT-based login with BCrypt password hashing.
- **Academic Profile Management**: Manage personal info, department, degree, graduation batch, and CGPA.
- **Technical Skills Matrix**: Add and maintain technical skills for recruitment matching.
- **PDF Resume Management**: Secure PDF resume upload (max 2MB), replacement, and streaming viewer.
- **Job Discovery & Search**: Filter and search open campus drives by department, employment type, and role.
- **Automated Eligibility Engine**: Instant server-side verification of CGPA, department, batch, and skill criteria.
- **Skill Gap Analysis**: Identifies missing technical skills for ineligible drives and provides **curated learning guides & documentation links**.
- **Application Tracking**: Real-time status progression (`APPLIED` → `SHORTLISTED` → `INTERVIEW_SCHEDULED` → `SELECTED` / `REJECTED`).
- **Interview Portal**: Access scheduled interview rounds, video meeting links (Google Meet/Teams), and venue instructions.
- **In-App Notifications**: Real-time notification bell in navbar with unread counts and read-state management.

### 🛡️ Placement Admin Features
- **Analytics & BI Dashboard**:
  - Key counters: Total Students, Companies, Jobs, Applications, Placement Rate (%).
  - **Placement % by Department** (Interactive Bar Chart via Recharts).
  - **Average Package Offered by Company** (Horizontal Bar Chart).
  - **Application Funnel Stages** (Applied → Shortlisted → Interviewed → Selected).
  - **CSV Placement Report Export**: Instant download of student placement records.
- **Bulk Student Onboarding**: Upload hundreds of students at once via **Excel (`.xlsx`)** or **CSV** (powered by Apache POI) with row-by-row error validation and downloadable template.
- **Company Management**: Full CRUD for recruiting partner profiles, websites, and contact emails.
- **Job Openings Management**: Configure recruitment drives, salary packages (LPA), minimum CGPA thresholds, eligible departments, required skill tags, and deadlines.
- **Candidate Registry**: Searchable candidate directory with full academic history and direct **PDF resume download**.
- **Application Workflow & Status Management**: Review applicant pools, shortlist candidates, update statuses, and log remarks.
- **Interview Scheduling Engine**: Schedule technical, coding, or HR interview rounds with date/time, mode (Online/Offline), and meeting links with automated student alerts.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Axios, Recharts, Lucide React, Vanilla CSS3 Design Tokens |
| **Backend** | Java 17+, Spring Boot 3.2.5, Spring Security 6, Spring Data JPA, Hibernate, JWT (JJWT 0.11.5) |
| **Integrations** | Apache POI 5.2.5 (Excel parsing), Commons CSV 1.10.0, Spring Boot Starter Mail (SMTP) |
| **Database** | MySQL 8.0+ / MariaDB |
| **Testing** | JUnit 5, Mockito |

---

## 🏛️ System Architecture

```
+---------------------------------------------------------------------------------------+
|                                    REACT.JS FRONTEND (SPA)                             |
|                                                                                       |
|   +-------------------+  +--------------------------------+  +--------------------+   |
|   |  Public Pages     |  |   Student Portal               |  |   Admin Portal     |   |
|   |  - Login          |  |   - Dashboard                  |  |   - Dashboard (BI) |   |
|   |  - Registration   |  |   - Profile & Resume           |  |   - Student Mgmt   |   |
|   +-------------------+  |   - Job Search & Skill Gap     |  |   - Bulk Upload    |   |
|                          |   - My Applications            |  |   - Company Mgmt   |   |
|                          |   - My Interviews              |  |   - Job Mgmt       |   |
|                          |   - In-App Notifications Drop  |  |   - Applications   |   |
|                          +--------------------------------+  |   - Interviews     |   |
|                                                              +--------------------+   |
|                                                                                       |
|   [ Axios HTTP Client + Auth Interceptor (JWT Bearer Token) + Recharts Engine ]        |
+------------------------------------------+--------------------------------------------+
                                           | HTTP / REST (JSON) + Multipart/form-data
                                           v
+---------------------------------------------------------------------------------------+
|                                SPRING BOOT BACKEND API                                |
|                                                                                       |
|   +-------------------------------------------------------------------------------+   |
|   | Security Layer (Spring Security 6 + JwtAuthenticationFilter + RBAC Authorization)|   |
|   +-------------------------------------------------------------------------------+   |
|                                          |                                            |
|   +--------------------------------------v----------------------------------------+   |
|   | REST Controllers Layer                                                        |   |
|   | AuthController | StudentController | CompanyController | JobController        |   |
|   | ApplicationController | InterviewController | NotificationController          |   |
|   | AnalyticsController | BulkUploadController                                    |   |
|   +--------------------------------------|----------------------------------------+   |
|                                          v                                            |
|   +-------------------------------------------------------------------------------+   |
|   | Service Layer (Business Logic & Transactions)                                 |   |
|   | - Eligibility & Skill-Gap Analysis Engine                                      |   |
|   | - File Storage Service (PDF Resumes)                                          |   |
|   | - Excel/CSV Parser (Apache POI)                                               |   |
|   | - Notification Dispatcher (In-app DB + JavaMailSender SMTP)                   |   |
|   | - Analytics Aggregation & CSV Export Service                                  |   |
|   +--------------------------------------|----------------------------------------+   |
|                                          v                                            |
|   +-------------------------------------------------------------------------------+   |
|   | Data Access Layer (Spring Data JPA / Hibernate Repositories)                  |   |
|   +--------------------------------------|----------------------------------------+   |
+------------------------------------------+--------------------------------------------+
                                           | JDBC
                                           v
+---------------------------------------------------------------------------------------+
|                                   MYSQL RELATIONAL DATABASE                           |
|   [users, students, skills, student_skills, companies, jobs, job_skills,              |
|    applications, interviews, notifications, skill_resources]                          |
+---------------------------------------------------------------------------------------+
```

---

## 🗄️ Database Design & Schema

The relational MySQL schema is defined in [`database/schema.sql`](file:///c:/Users/DELL/Desktop/smart%20job%20and%20placement%20mgmt%20systems/database/schema.sql) and [`database/seed_data.sql`](file:///c:/Users/DELL/Desktop/smart%20job%20and%20placement%20mgmt%20systems/database/seed_data.sql).

### Tables Summary
1. **`users`**: System credentials, role (`ROLE_STUDENT`, `ROLE_ADMIN`), active state, timestamps.
2. **`students`**: Academic data (department, degree, graduation year, CGPA), resume file path, completion flag.
3. **`skills`**: Catalog of technical skills (Java, Spring Boot, React, AWS, etc.).
4. **`student_skills`**: Many-to-Many join table mapping skills possessed by candidates.
5. **`companies`**: Organization name, industry, location, website, recruiter email.
6. **`jobs`**: Recruitment openings, salary package, min CGPA, target department, deadline, status.
7. **`job_skills`**: Many-to-Many join table mapping required skills for each drive.
8. **`applications`**: Candidate drive applications, status workflow, recruiter remarks (Unique per student + job).
9. **`interviews`**: Scheduled evaluation rounds, date, time, mode (`ONLINE`/`OFFLINE`), meeting URL / room.
10. **`notifications`**: In-app notifications with read status and notification type.
11. **`skill_resources`**: Curated learning resources (official documentation, tutorials) mapped to technical skills.

---

## 📡 REST API Catalog

| Module | Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | POST | `/api/auth/register` | Public | Student self-registration |
| | POST | `/api/auth/login` | Public | Authenticate user & return JWT token |
| | GET | `/api/auth/me` | Authenticated | Get current authenticated user info |
| **Student** | GET | `/api/students/profile` | Student | Get personal profile |
| | PUT | `/api/students/profile` | Student | Update profile details and skills |
| | POST | `/api/students/resume` | Student | Upload/replace resume PDF (max 2MB) |
| | GET | `/api/students/resume` | Student | Download current student resume |
| | GET | `/api/students/resume/{studentId}` | Admin | Download student resume by admin |
| | PUT | `/api/students/change-password` | Authenticated | Change user password |
| | GET | `/api/students/skills` | Authenticated | Master list of all skills |
| **Company** | GET | `/api/companies` | Authenticated | List all companies |
| | GET | `/api/companies/{id}` | Authenticated | Get single company details |
| | POST | `/api/companies` | Admin | Create company |
| | PUT | `/api/companies/{id}` | Admin | Update company |
| | DELETE | `/api/companies/{id}` | Admin | Delete company |
| **Job** | GET | `/api/jobs` | Authenticated | List/search/filter job openings |
| | GET | `/api/jobs/{id}` | Authenticated | Get job details |
| | POST | `/api/jobs` | Admin | Create job opening |
| | PUT | `/api/jobs/{id}` | Admin | Update job opening |
| | DELETE | `/api/jobs/{id}` | Admin | Delete job opening |
| | GET | `/api/jobs/{id}/eligibility` | Student | Check eligibility + skill gap analysis |
| **Application** | POST | `/api/applications` | Student | Apply for a job |
| | GET | `/api/applications/my` | Student | List logged-in student's applications |
| | GET | `/api/applications` | Admin | List all applications (filterable) |
| | PUT | `/api/applications/{id}/status` | Admin | Update application status |
| **Interview** | POST | `/api/interviews` | Admin | Schedule interview for shortlisted candidate |
| | PUT | `/api/interviews/{id}` | Admin | Reschedule / update interview |
| | DELETE | `/api/interviews/{id}` | Admin | Cancel interview |
| | GET | `/api/interviews/my` | Student | Get student's scheduled interviews |
| | GET | `/api/interviews` | Admin | List all scheduled interviews |
| **Notifications** | GET | `/api/notifications/my` | Student | Fetch recent notifications & unread count |
| | PUT | `/api/notifications/{id}/read` | Student | Mark single notification as read |
| | PUT | `/api/notifications/read-all` | Student | Mark all notifications as read |
| **Admin & Bulk** | GET | `/api/admin/students` | Admin | List all students with search & pagination |
| | GET | `/api/admin/students/{id}` | Admin | Get full student profile & history |
| | POST | `/api/admin/students/bulk-upload` | Admin | Upload Excel/CSV with student records |
| | GET | `/api/admin/students/sample-template` | Admin | Download sample Excel template |
| | GET | `/api/admin/analytics/summary` | Admin | Get placement KPIs and counters |
| | GET | `/api/admin/analytics/department-stats` | Admin | Department-wise placement % |
| | GET | `/api/admin/analytics/company-packages` | Admin | Average salary by company |
| | GET | `/api/admin/analytics/funnel` | Admin | Application funnel stage counts |
| | GET | `/api/admin/analytics/export-csv` | Admin | Download full placement report as CSV |

---

## ⚙️ Setup & Running Instructions

### 1. Prerequisites
- **Java 17+** (Java 17, 21, or 26)
- **Apache Maven 3.8+**
- **Node.js 18+** & **npm 9+**
- **MySQL Server 8.0+**

### 2. Database Setup
1. Start your local MySQL server.
2. Run the SQL schema and seed data scripts in MySQL Workbench, MySQL CLI, or your preferred client:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed_data.sql
```

*(Note: If creating a fresh database, Spring Boot JPA `ddl-auto=update` and the main class `CommandLineRunner` will automatically initialize default admin and skills on first boot!)*

### 3. Backend Setup & Run
1. Open `backend/src/main/resources/application.properties` and update your MySQL password if necessary:
```properties
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```
2. Navigate to `backend/` and run:
```bash
cd backend
mvn clean spring-boot:run
```
The backend API server will start at `http://localhost:8080`.

### 4. Frontend Setup & Run
1. Open a new terminal and navigate to `frontend/`:
```bash
cd frontend
npm install
npm run dev
```
The React frontend application will launch at `http://localhost:3000`.

---

## 🔑 Test Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Placement Admin** | `admin@placement.edu` | `Admin@123` |
| **Student 1 (CSE - High CGPA)** | `rahul.sharma@college.edu` | `Password@123` |
| **Student 2 (ECE)** | `ananya.patel@college.edu` | `Password@123` |
| **Student 3 (IT)** | `vikram.singh@college.edu` | `Password@123` |

*(Tip: The login page includes 1-click demo credential chips for fast testing!)*

---

## 🧪 Testing

Run backend unit and integration tests:
```bash
cd backend
mvn test
```

---

## 📁 Repository Structure

```
smart job and placement mgmt systems/
├── backend/
│   ├── pom.xml
│   ├── uploads/resumes/
│   └── src/
│       ├── main/
│       │   ├── java/com/placement/
│       │   │   ├── PlacementApplication.java
│       │   │   ├── config/ (SecurityConfig, WebMvcConfig)
│       │   │   ├── security/ (JwtTokenProvider, JwtAuthenticationFilter, UserPrincipal)
│       │   │   ├── entity/ (User, Student, Skill, Company, Job, Application, Interview, Notification, SkillResource)
│       │   │   ├── repository/ (Spring Data JPA Repositories)
│       │   │   ├── dto/ (Request & Response DTOs)
│       │   │   ├── service/ (EligibilityService, BulkUploadService, AnalyticsService, etc.)
│       │   │   ├── controller/ (REST API Endpoints)
│       │   │   └── exception/ (GlobalExceptionHandler, Custom Exceptions)
│       │   └── resources/
│       │       └── application.properties
│       └── test/
│           └── java/com/placement/ (EligibilityServiceTest, BulkUploadServiceTest)
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── api/ (axiosClient.js)
│       ├── context/ (AuthContext.jsx, NotificationContext.jsx)
│       ├── components/common/ (Navbar, Sidebar, Modal, StatCard, NotificationDropdown, ProtectedRoute)
│       └── pages/
│           ├── auth/ (LoginPage, RegisterPage)
│           ├── student/ (StudentDashboard, StudentProfile, JobBrowser, JobDetails, MyApplications, MyInterviews)
│           └── admin/ (AdminDashboard, CompanyManagement, JobManagement, StudentRegistry, BulkUploadPage, ApplicationManagement, InterviewManagement)
├── database/
│   ├── schema.sql
│   └── seed_data.sql
├── postman/
│   └── Placement_System_API_Collection.json
├── .gitignore
└── README.md
```
