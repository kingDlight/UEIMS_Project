# Product Overview

## 1. Project Description

**UEIMS (University Enterprise Internship Management System)** is a comprehensive web-based platform designed to manage the entire lifecycle of student On-the-Job Training (OJT) at FPT University. The system bridges three key stakeholders — Students, Enterprises, and Training Managers — providing a centralized, transparent, and efficient workflow from student eligibility through internship placement, progress tracking, and final evaluation.

Traditional OJT management relies heavily on manual communication: email, spreadsheets, and in-person coordination between the university, students, and enterprise partners. This approach creates significant pain points — scheduling conflicts, miscommunication, duplicated effort, lack of real-time visibility, and high administrative overhead for Training Managers. UEIMS addresses these challenges by digitizing every step of the OJT process, from semester setup and student eligibility through enterprise matching, interview scheduling, report submission, and final grading.

---

## 2. Key Features

### 2.1 Multi-Role Authentication & Authorization
- JWT-based authentication with role-based access control (RBAC) supporting four user roles: **Admin**, **Training Manager**, **Enterprise (HR)**, and **Student**.
- Secure session management with token blacklisting on logout, password reset via secure email tokens, and audit logging of all authentication events.
- Fine-grained permission system where each role is granted only the permissions required for their responsibilities.

### 2.2 Semester & Academic Calendar Management
- Full lifecycle management of academic semesters through a configurable state machine: **Draft → Upcoming → Active → Closed → Locked**.
- Training Managers control semester transitions, with database-level enforcement preventing invalid state changes (e.g., editing locked semesters, setting overlapping active semesters).
- Timeline editing, filter and sort capabilities, and academic year boundaries are all validated against business rules.

### 2.3 Student Eligibility & Profile Management
- Students must meet eligibility criteria (Semester 6+, GPA ≥ 5.0) before they can participate in OJT placement.
- Training Managers manage the eligible student list, toggle eligibility status, and handle special cases such as OJT cancellations.
- Students maintain rich profiles including personal information, CV upload (web URL or file-based), and academic records.
- At-Risk Students module enables Training Managers to proactively identify and monitor students who are missing reports or at risk of failing.

### 2.4 Enterprise Management & Recruitment
- Enterprises register through a public registration form, pending approval by Training Managers before gaining full access.
- Approved enterprises can create and manage job posts specifying required skills, salary, and location.
- Enterprise profiles include company information, logo upload, and industry categorization.
- HRs within the same enterprise are scoped to their own job posts (creator-level authorization enforced).

### 2.5 Job Board & Application Workflow
- Students browse open job posts on a searchable Job Board filtered by skills, location, and salary range.
- Students may hold up to 3 active applications at a time (pending, screening, interview, or accepted statuses only; rejected applications do not count toward the limit).
- Application tracking via a Kanban board allows enterprises to move candidates through stages: Applied → Screening → Interview → Offer → Rejected.

### 2.6 Interview Scheduling & Management
- Enterprises schedule interviews for candidates who pass screening, specifying date, time, and meeting details.
- Rescheduling sends automatic notifications to students. Interview status transitions (Scheduled → Completed, Canceled) are enforced with appropriate notifications.
- Training Managers maintain visibility into scheduled interviews across all enterprises.

### 2.7 OJT Placement Center
- Training Managers match eligible students to approved enterprise positions through a dedicated placement workflow.
- Placement workflow states: **Unplaced → Pending → Placed → Completed**, with cancellation and termination support.
- Placed students are locked from profile edits to maintain data integrity during the active internship.
- Bulk placement operations and semester-aware filtering ensure efficient batch management.

### 2.8 Weekly & Final Report Management
- Students submit weekly progress reports during their internship, including work summaries and file attachments.
- Enterprises review and approve/reject weekly reports, providing feedback to guide student performance.
- Final reports are submitted at the end of the internship, consolidating the entire OJT experience.
- Missing report tracking feeds into the At-Risk Students module for proactive intervention.

### 2.9 Internship Plan & Evaluation
- Enterprises create structured internship training plans for assigned students, outlining learning objectives and milestones.
- Enterprises evaluate students at the end of the internship; students reciprocally evaluate their enterprise experience.
- Training Managers assign final grades based on enterprise evaluations and report submissions, with grade appeals supported.

### 2.10 Incident Reporting
- Enterprises can report critical incidents (misconduct, violations) against assigned students.
- Training Managers review incidents, apply disciplinary actions, and track incident history.
- Incident status tracking and escalation workflow ensure accountability and timely resolution.

### 2.11 Notifications & Announcements
- System-wide announcements allow Training Managers to broadcast messages to all students.
- Targeted notifications alert relevant parties of important events: interview rescheduling, report feedback, status changes, and more.
- Email integration ensures critical updates reach users even when they are not logged in.

### 2.12 Reporting & Analytics
- **Command Center Dashboard** provides Training Managers with real-time operational metrics: active semesters, eligible students, placement rates, incident counts, and report submission rates.
- **Enterprise Analytics** gives enterprises insights into recruitment pipeline performance, interview conversion rates, and student evaluation trends.
- **Student Dashboard** consolidates each student's OJT status, upcoming schedules, report deadlines, and evaluation results.
- Export functionality (CSV/Excel) for audit logs and student lists supports offline analysis.

### 2.13 Admin & Security Features
- Full audit logging of sensitive operations for compliance and accountability.
- System configuration management through a dedicated admin interface.
- RBAC enforcement at both API and controller levels, ensuring unauthorized access is blocked regardless of entry point.
- Security tests validated via automated Postman/Newman test suites covering authentication, authorization, and business logic flows.

---

## 3. System Challenges & Considerations

**Data Security & Privacy**: The system handles sensitive personal and academic data. All endpoints are protected by JWT authentication and role-based authorization. Passwords are hashed with BCrypt, and sensitive operations are logged in the audit trail.

**Scalability During Peak Usage**: The system is designed for concurrent access by hundreds of students and dozens of enterprises simultaneously. Database connection pooling, efficient query design, and stateless API architecture support horizontal scaling.

**Legacy Workflow Transition**: Encouraging enterprises and students to shift from email/spreadsheet-based communication to a centralized digital platform requires a user-friendly interface with minimal learning curve — a core design principle guiding all UI decisions in UEIMS.

**Integration with University Systems**: The RBAC model, student eligibility criteria, and grade export formats are designed to align with FPT University's existing academic infrastructure, minimizing disruption during adoption.

**Complex State Management**: The OJT lifecycle involves multiple interconnected entities (students, semesters, enterprises, placements, reports, incidents) with intricate state dependencies. Database triggers and application-level validation work together to enforce business rule integrity at every transition.

---

## 4. Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript, Ant Design 5, Vite, Recharts |
| **Backend** | Java 21, Spring Boot 3.2, Spring Security, Spring Data JPA |
| **Database** | PostgreSQL (29 tables, 2 views, 16 triggers) |
| **Authentication** | JWT (HS512), BCrypt |
| **API Documentation** | OpenAPI / Swagger |
| **Testing** | Newman (Postman), Playwright |
| **ORM** | Hibernate with MapStruct |
| **Architecture** | RESTful API, Layered Architecture (Controller → Service → Repository) |
