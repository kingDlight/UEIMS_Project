-- ============================================================
-- SEED DATA 002: Realistic Full-Stack Demo Data
-- All UUIDs use valid hex characters only (0-9, a-f)
-- Follows 001_create_schema.sql exactly
-- Idempotent: safe to run multiple times
-- ============================================================

BEGIN;

-- ============================================================
-- MINI-RESET: Chỉ xóa internship_plans + internship_plan_items
-- Dùng khi muốn demo lại flow tạo training plan mà không reset cả DB
-- ============================================================
-- TRUNCATE TABLE internship_plan_items, internship_plans CASCADE;

-- ============================================================
-- Disable all triggers and constraints
-- ============================================================
SET session_replication_role = 'replica';

-- ============================================================
-- CLEANUP: Remove existing seed data (idempotent guard)
-- Single TRUNCATE CASCADE on a top-level table cleans entire FK graph.
-- Order: permissions → announcements → notifications → other seed tables
-- (users CASCADE handles users_roles, eligible_students, applications, interviews,
--  assignments, weekly_reports, final_grades, etc. transitively)
-- ============================================================
TRUNCATE TABLE
    permissions,
    role_permissions,
    system_announcements,
    notifications,
    semesters,
    enterprises,
    users
CASCADE;
-- NOTE: audit_logs is immutable (BR-07 trigger). Skip cleanup.

-- ============================================================
-- SYSTEM ACCOUNTS
-- ============================================================
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('00000000-0000-0000-0000-000000000001', 'dlmkjadragonbmg@gmail.com', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'System Administrator', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('00000000-0000-0000-0000-000000000001', 'ADMIN');

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('00000000-0000-0000-0000-000000000002', 'manager@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Training Manager Demo', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('00000000-0000-0000-0000-000000000002', 'TRAINING_MANAGER');

-- ============================================================
-- ENTERPRISES + LINKED ENTERPRISE USERS
-- ============================================================
INSERT INTO enterprises (enterprise_id, company_name, industry, company_size, description, address, contact_person_name, contact_person_email, contact_person_phone, approval_status, approved_by, approved_at, website) VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Momo', 'Fintech', '500-1000', 'Leading e-wallet and digital payments platform in Vietnam.', 'District 1, Ho Chi Minh City', 'HR Momo', 'hr@momo.vn', '0900000001', 'APPROVED', '00000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP, 'https://momo.vn');
INSERT INTO users (user_id, email, password_hash, full_name, status, enterprise_id, must_change_password) VALUES
    ('c0000000-0000-0000-0000-000000000011', 'hr@momo.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'HR Momo', 'ACTIVE', 'c0000000-0000-0000-0000-000000000001', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('c0000000-0000-0000-0000-000000000011', 'ENTERPRISE');

INSERT INTO enterprises (enterprise_id, company_name, industry, company_size, description, address, contact_person_name, contact_person_email, contact_person_phone, approval_status, approved_by, approved_at, website) VALUES
    ('c0000000-0000-0000-0000-000000000002', 'FPT Software', 'IT Services', '500-1000', 'Global technology and IT services company.', 'District 1, Ho Chi Minh City', 'HR FPT Software', 'hr@fsoft.com', '0900000002', 'APPROVED', '00000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP, 'https://fptsoftware.com');
INSERT INTO users (user_id, email, password_hash, full_name, status, enterprise_id, must_change_password) VALUES
    ('c0000000-0000-0000-0000-000000000012', 'hr@fsoft.com', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'HR FPT Software', 'ACTIVE', 'c0000000-0000-0000-0000-000000000002', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('c0000000-0000-0000-0000-000000000012', 'ENTERPRISE');

INSERT INTO enterprises (enterprise_id, company_name, industry, company_size, description, address, contact_person_name, contact_person_email, contact_person_phone, approval_status, approved_by, approved_at, website) VALUES
    ('c0000000-0000-0000-0000-000000000003', 'Shopee Vietnam', 'E-commerce', '500-1000', 'Leading e-commerce platform in Southeast Asia.', 'District 1, Ho Chi Minh City', 'HR Shopee Vietnam', 'hr@shopee.vn', '0900000003', 'APPROVED', '00000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP, 'https://shopee.vn');
INSERT INTO users (user_id, email, password_hash, full_name, status, enterprise_id, must_change_password) VALUES
    ('c0000000-0000-0000-0000-000000000013', 'hr@shopee.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'HR Shopee Vietnam', 'ACTIVE', 'c0000000-0000-0000-0000-000000000003', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('c0000000-0000-0000-0000-000000000013', 'ENTERPRISE');

INSERT INTO enterprises (enterprise_id, company_name, industry, company_size, description, address, contact_person_name, contact_person_email, contact_person_phone, approval_status, approved_by, approved_at, website) VALUES
    ('c0000000-0000-0000-0000-000000000004', 'VNG Corporation', 'Technology & Gaming', '500-1000', 'Top Vietnamese technology and gaming company.', 'District 1, Ho Chi Minh City', 'HR VNG Corporation', 'hr@vng.com.vn', '0900000004', 'APPROVED', '00000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP, 'https://vng.com.vn');
INSERT INTO users (user_id, email, password_hash, full_name, status, enterprise_id, must_change_password) VALUES
    ('c0000000-0000-0000-0000-000000000014', 'hr@vng.com.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'HR VNG Corporation', 'ACTIVE', 'c0000000-0000-0000-0000-000000000004', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('c0000000-0000-0000-0000-000000000014', 'ENTERPRISE');

-- ============================================================
-- SEMESTER (create as OPEN, then update to ACTIVE to satisfy state machine)
-- ============================================================
INSERT INTO semesters (semester_id, semester_code, name, start_date, end_date, weekly_report_deadline_day, weekly_report_deadline_time, final_report_deadline, status, created_by) VALUES
    ('50000000-0000-0000-0000-000000000001', 'SP26', 'Spring 2026', '2026-03-01', '2026-05-31', 'SUNDAY', '23:59:00', '2026-05-31 23:59:00', 'OPEN', '00000000-0000-0000-0000-000000000002');
UPDATE semesters SET status = 'ACTIVE' WHERE semester_id = '50000000-0000-0000-0000-000000000001';

-- ============================================================
-- SEMESTER ENTERPRISES
-- ============================================================
INSERT INTO semester_enterprises (semester_enterprise_id, semester_id, enterprise_id, registration_status, reviewed_by, reviewed_at) VALUES
    ('51000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'APPROVED', '00000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP);
INSERT INTO semester_enterprises (semester_enterprise_id, semester_id, enterprise_id, registration_status, reviewed_by, reviewed_at) VALUES
    ('51000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'APPROVED', '00000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP);
INSERT INTO semester_enterprises (semester_enterprise_id, semester_id, enterprise_id, registration_status, reviewed_by, reviewed_at) VALUES
    ('51000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'APPROVED', '00000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP);
INSERT INTO semester_enterprises (semester_enterprise_id, semester_id, enterprise_id, registration_status, reviewed_by, reviewed_at) VALUES
    ('51000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'APPROVED', '00000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP);

-- ============================================================
-- JOB POSTS
-- ============================================================
INSERT INTO job_posts (job_post_id, enterprise_id, semester_id, title, description, requirements, benefits, required_technologies, max_positions, application_deadline, status) VALUES
    ('f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Java Backend Developer Intern', 'Develop backend modules for Momo payment platform using Java and Spring Boot.', 'Proficient in Java, understanding of Spring framework', 'Mentorship, flexible hours, certificate', 'Java, Spring Boot, MySQL', 20, '2026-05-25', 'OPEN');
INSERT INTO job_posts (job_post_id, enterprise_id, semester_id, title, description, requirements, benefits, required_technologies, max_positions, application_deadline, status) VALUES
    ('f0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 'React Frontend Developer Intern', 'Build responsive web applications using React and TypeScript.', 'Experience with React, HTML, CSS', 'Agile environment, learning opportunities', 'React, TypeScript, CSS', 15, '2026-05-25', 'OPEN');
INSERT INTO job_posts (job_post_id, enterprise_id, semester_id, title, description, requirements, benefits, required_technologies, max_positions, application_deadline, status) VALUES
    ('f0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001', 'Fullstack Developer Intern', 'Work on end-to-end features for Shopee Vietnam platform.', 'Basic fullstack knowledge', 'High-impact projects, team environment', 'Node.js, React, MongoDB', 10, '2026-05-25', 'OPEN');

-- ============================================================
-- STUDENTS 1-5: ELIGIBLE (Semester 5-6), no applications yet
-- ============================================================

-- SE15001: mock student (kept generic so it doesn't clash with the real demo student SE15004)
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000001', 'student1@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Demo Student', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000001', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'SE15001', 'Demo Student', 'student1@fpt.edu.vn', 'Software Engineering', 6.78, 5, 'ELIGIBLE', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000001', 'SE15001', 'FPT University', 'Software Engineering', 6.5, '["Java", "Spring Boot"]'::jsonb, 'https://cv.example.com/se15001.pdf');

-- SE15002
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000002', 'student2@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Tran Ngoc Uyen', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000002', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'SE15002', 'Tran Ngoc Uyen', 'student2@fpt.edu.vn', 'Software Engineering', 6.83, 6, 'ELIGIBLE', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000002', 'SE15002', 'FPT University', 'Software Engineering', 7.5, '["Java", "React"]'::jsonb, 'https://cv.example.com/se15002.pdf');

-- SE15003
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000003', 'student3@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Dang Xuan Vinh', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000003', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 'SE15003', 'Dang Xuan Vinh', 'student3@fpt.edu.vn', 'Software Engineering', 7.19, 6, 'ELIGIBLE', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000003', 'SE15003', 'FPT University', 'Software Engineering', 8.5, '["Python", "Django"]'::jsonb, 'https://cv.example.com/se15003.pdf');

-- SE15004
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000004', 'dominhgiabao12@gmail.com', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Do Minh Gia Bao', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000004', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000004', 'SE15004', 'Do Minh Gia Bao', 'dominhgiabao12@gmail.com', 'Software Engineering', 7.99, 5, 'ELIGIBLE', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000004', 'SE15004', 'FPT University', 'Software Engineering', 7.5, '["JavaScript", "Node.js"]'::jsonb, 'https://cv.example.com/se15004.pdf');

-- SE15005
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000005', 'student5@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Ngo Thanh Uyen', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000005', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000005', 'SE15005', 'Ngo Thanh Uyen', 'student5@fpt.edu.vn', 'Software Engineering', 7.63, 5, 'ELIGIBLE', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000005', 'SE15005', 'FPT University', 'Software Engineering', 6.5, '["Java", "SQL"]'::jsonb, 'https://cv.example.com/se15005.pdf');

-- ============================================================
-- STUDENTS 6-10: PENDING (Sem 5-6, applied, interview not scheduled)
-- Application status: PENDING
-- ============================================================

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000006', 'student6@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Vu Thanh Phong', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000006', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000006', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000006', 'SE15006', 'Vu Thanh Phong', 'student6@fpt.edu.vn', 'Software Engineering', 8.54, 5, 'PENDING', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000006', 'SE15006', 'FPT University', 'Software Engineering', 6.5, '["Java"]'::jsonb, 'https://cv.example.com/se15006.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status) VALUES
    ('a0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000006', 'https://cv.example.com/se15006.pdf', 'PENDING');

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000007', 'student7@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Hoang Xuan Duc', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000007', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000007', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000007', 'SE15007', 'Hoang Xuan Duc', 'student7@fpt.edu.vn', 'Software Engineering', 9.31, 5, 'PENDING', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000007', 'SE15007', 'FPT University', 'Software Engineering', 7.5, '["React"]'::jsonb, 'https://cv.example.com/se15007.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status) VALUES
    ('a0000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000007', 'https://cv.example.com/se15007.pdf', 'PENDING');

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000008', 'student8@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Le Thanh Binh', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000008', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000008', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000008', 'SE15008', 'Le Thanh Binh', 'student8@fpt.edu.vn', 'Software Engineering', 6.56, 5, 'PENDING', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000008', 'SE15008', 'FPT University', 'Software Engineering', 7.5, '["Java"]'::jsonb, 'https://cv.example.com/se15008.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status) VALUES
    ('a0000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000008', 'https://cv.example.com/se15008.pdf', 'PENDING');

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000009', 'student9@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Huy Xuan Nam', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000009', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000009', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000009', 'SE15009', 'Huy Xuan Nam', 'student9@fpt.edu.vn', 'Software Engineering', 6.86, 5, 'PENDING', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000009', 'SE15009', 'FPT University', 'Software Engineering', 5.5, '["Java"]'::jsonb, 'https://cv.example.com/se15009.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status) VALUES
    ('a0000000-0000-0000-0000-000000000009', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000009', 'https://cv.example.com/se15009.pdf', 'PENDING');

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000010', 'student10@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Pham Minh Hai', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000010', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000010', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000010', 'SE15010', 'Pham Minh Hai', 'student10@fpt.edu.vn', 'Software Engineering', 7.55, 5, 'PENDING', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000010', 'SE15010', 'FPT University', 'Software Engineering', 6.5, '["Java"]'::jsonb, 'https://cv.example.com/se15010.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status) VALUES
    ('a0000000-0000-0000-0000-000000000010', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000010', 'https://cv.example.com/se15010.pdf', 'PENDING');

-- ============================================================
-- STUDENTS 11-15: INTERVIEW_SCHEDULED (applied, interview scheduled)
-- Application status: INTERVIEW_SCHEDULED
-- ============================================================

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000011', 'student11@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Hoang Van Uyen', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000011', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000011', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000011', 'SE15011', 'Hoang Van Uyen', 'student11@fpt.edu.vn', 'Software Engineering', 7.69, 5, 'PENDING', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000011', 'SE15011', 'FPT University', 'Software Engineering', 5.5, '["Java"]'::jsonb, 'https://cv.example.com/se15011.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status, screening_note, screened_by, screened_at) VALUES
    ('a0000000-0000-0000-0000-000000000011', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000011', 'https://cv.example.com/se15011.pdf', 'INTERVIEW_SCHEDULED', 'Strong Java skills, good projects', 'c0000000-0000-0000-0000-000000000011', CURRENT_TIMESTAMP);
INSERT INTO interviews (interview_id, application_id, scheduled_datetime, duration_minutes, meeting_link, status, student_confirmed) VALUES
    ('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000011', '2026-04-15 10:00:00', 45, 'https://meet.momo.vn/interview-11', 'SCHEDULED', FALSE);

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000012', 'student12@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Nguyen Huu Son', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000012', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000012', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000012', 'SE15012', 'Nguyen Huu Son', 'student12@fpt.edu.vn', 'Software Engineering', 8.99, 5, 'PENDING', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000012', 'SE15012', 'FPT University', 'Software Engineering', 7.5, '["React", "TypeScript"]'::jsonb, 'https://cv.example.com/se15012.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status, screening_note, screened_by, screened_at) VALUES
    ('a0000000-0000-0000-0000-000000000012', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000012', 'https://cv.example.com/se15012.pdf', 'INTERVIEW_SCHEDULED', 'Excellent GPA and portfolio', 'c0000000-0000-0000-0000-000000000011', CURRENT_TIMESTAMP);
INSERT INTO interviews (interview_id, application_id, scheduled_datetime, duration_minutes, meeting_link, status, student_confirmed) VALUES
    ('b0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000012', '2026-04-15 14:00:00', 45, 'https://meet.momo.vn/interview-12', 'SCHEDULED', FALSE);

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000013', 'student13@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Vo Minh Giang', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000013', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000013', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000013', 'SE15013', 'Vo Minh Giang', 'student13@fpt.edu.vn', 'Software Engineering', 8.85, 5, 'PENDING', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000013', 'SE15013', 'FPT University', 'Software Engineering', 8.5, '["Python", "JavaScript"]'::jsonb, 'https://cv.example.com/se15013.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status, screening_note, screened_by, screened_at) VALUES
    ('a0000000-0000-0000-0000-000000000013', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000013', 'https://cv.example.com/se15013.pdf', 'INTERVIEW_SCHEDULED', 'Good technical knowledge', 'c0000000-0000-0000-0000-000000000011', CURRENT_TIMESTAMP);
INSERT INTO interviews (interview_id, application_id, scheduled_datetime, duration_minutes, meeting_link, status, student_confirmed) VALUES
    ('b0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000013', '2026-04-16 09:00:00', 60, 'https://meet.momo.vn/interview-13', 'SCHEDULED', FALSE);

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000014', 'student14@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Tran Thanh Nam', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000014', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000014', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000014', 'SE15014', 'Tran Thanh Nam', 'student14@fpt.edu.vn', 'Software Engineering', 7.45, 5, 'PENDING', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000014', 'SE15014', 'FPT University', 'Software Engineering', 8.5, '["Java", "Spring"]'::jsonb, 'https://cv.example.com/se15014.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status, screening_note, screened_by, screened_at) VALUES
    ('a0000000-0000-0000-0000-000000000014', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000014', 'https://cv.example.com/se15014.pdf', 'INTERVIEW_SCHEDULED', 'Solid backend experience', 'c0000000-0000-0000-0000-000000000011', CURRENT_TIMESTAMP);
INSERT INTO interviews (interview_id, application_id, scheduled_datetime, duration_minutes, meeting_link, status, student_confirmed) VALUES
    ('b0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000014', '2026-04-16 14:00:00', 45, 'https://meet.momo.vn/interview-14', 'SCHEDULED', FALSE);

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000015', 'student15@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Vu Thanh Giang', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000015', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000015', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000015', 'SE15015', 'Vu Thanh Giang', 'student15@fpt.edu.vn', 'Software Engineering', 8.57, 5, 'PENDING', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000015', 'SE15015', 'FPT University', 'Software Engineering', 7.5, '["Java", "React"]'::jsonb, 'https://cv.example.com/se15015.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status, screening_note, screened_by, screened_at) VALUES
    ('a0000000-0000-0000-0000-000000000015', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000015', 'https://cv.example.com/se15015.pdf', 'INTERVIEW_SCHEDULED', 'Good culture fit', 'c0000000-0000-0000-0000-000000000011', CURRENT_TIMESTAMP);
INSERT INTO interviews (interview_id, application_id, scheduled_datetime, duration_minutes, meeting_link, status, student_confirmed) VALUES
    ('b0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000015', '2026-04-17 10:00:00', 45, 'https://meet.momo.vn/interview-15', 'SCHEDULED', FALSE);

-- ============================================================
-- STUDENTS 16-20: MATCHED (interview passed, placement approved)
-- Application status: ACCEPTED, eligible_students status: MATCHED
-- has placement_applications (APPROVED)
-- ============================================================

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000016', 'student16@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Vo Thi Minh', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000016', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000016', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000016', 'IS15016', 'Vo Thi Minh', 'student16@fpt.edu.vn', 'Information Security', 9.70, 5, 'MATCHED', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000016', 'IS15016', 'FPT University', 'Information Security', 7.5, '["OWASP", "Penetration Testing", "Burp Suite"]'::jsonb, 'https://cv.example.com/is15016.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status, screening_note, screened_by, screened_at) VALUES
    ('a0000000-0000-0000-0000-000000000016', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000016', 'https://cv.example.com/se15016.pdf', 'ACCEPTED', 'Top candidate, excellent interview', 'c0000000-0000-0000-0000-000000000011', CURRENT_TIMESTAMP);
INSERT INTO interviews (interview_id, application_id, scheduled_datetime, duration_minutes, meeting_link, status, student_confirmed, result, result_note, decided_by, decided_at) VALUES
    ('b0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000016', '2026-04-10 10:00:00', 45, 'https://meet.momo.vn/interview-16', 'COMPLETED', TRUE, 'PASS', 'Strong Java skills, great attitude', 'c0000000-0000-0000-0000-000000000011', CURRENT_TIMESTAMP);
INSERT INTO placement_applications (application_id, student_id, enterprise_id, semester_id, status, cover_letter, reviewed_by, reviewed_at) VALUES
    ('a0000000-0000-0000-0000-000000000016', 'd0000000-0000-0000-0000-000000000016', 'c0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'APPROVED', 'I am eager to join Momo as a backend developer intern.', '00000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP);
INSERT INTO enterprise_assignments (assignment_id, enterprise_id, student_id, semester_id, supervisor_name, supervisor_email, assigned_by, status, start_date) VALUES
    ('f0000000-0000-0000-0000-000000000016', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000016', '50000000-0000-0000-0000-000000000001', 'Sup Momo', 'sup@momo.vn', '00000000-0000-0000-0000-000000000002', 'ACTIVE', '2026-03-01');

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000017', 'student17@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Nguyen Minh Vinh', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000017', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000017', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000017', 'IS15017', 'Nguyen Minh Vinh', 'student17@fpt.edu.vn', 'Information Security', 7.54, 5, 'MATCHED', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000017', 'IS15017', 'FPT University', 'Information Security', 6.5, '["Network Security", "SIEM", "Splunk"]'::jsonb, 'https://cv.example.com/is15017.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status, screening_note, screened_by, screened_at) VALUES
    ('a0000000-0000-0000-0000-000000000017', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000017', 'https://cv.example.com/se15017.pdf', 'ACCEPTED', 'Good overall performance', 'c0000000-0000-0000-0000-000000000011', CURRENT_TIMESTAMP);
INSERT INTO interviews (interview_id, application_id, scheduled_datetime, duration_minutes, meeting_link, status, student_confirmed, result, result_note, decided_by, decided_at) VALUES
    ('b0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000017', '2026-04-10 14:00:00', 45, 'https://meet.momo.vn/interview-17', 'COMPLETED', TRUE, 'PASS', 'Solid technical skills', 'c0000000-0000-0000-0000-000000000011', CURRENT_TIMESTAMP);
INSERT INTO placement_applications (application_id, student_id, enterprise_id, semester_id, status, cover_letter, reviewed_by, reviewed_at) VALUES
    ('a0000000-0000-0000-0000-000000000017', 'd0000000-0000-0000-0000-000000000017', 'c0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'APPROVED', 'Excited to intern at Momo.', '00000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP);
INSERT INTO enterprise_assignments (assignment_id, enterprise_id, student_id, semester_id, supervisor_name, supervisor_email, assigned_by, status, start_date) VALUES
    ('f0000000-0000-0000-0000-000000000017', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000017', '50000000-0000-0000-0000-000000000001', 'Sup Momo', 'sup@momo.vn', '00000000-0000-0000-0000-000000000002', 'ACTIVE', '2026-03-01');

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000018', 'student18@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Ly Tuyet Thanh', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000018', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000018', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000018', 'DM15018', 'Ly Tuyet Thanh', 'student18@fpt.edu.vn', 'Digital Marketing', 8.56, 5, 'MATCHED', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000018', 'DM15018', 'FPT University', 'Digital Marketing', 6.5, '["SEO", "Google Ads", "Facebook Ads"]'::jsonb, 'https://cv.example.com/dm15018.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status, screening_note, screened_by, screened_at) VALUES
    ('a0000000-0000-0000-0000-000000000018', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000018', 'https://cv.example.com/se15018.pdf', 'ACCEPTED', 'Great interview performance', 'c0000000-0000-0000-0000-000000000011', CURRENT_TIMESTAMP);
INSERT INTO interviews (interview_id, application_id, scheduled_datetime, duration_minutes, meeting_link, status, student_confirmed, result, result_note, decided_by, decided_at) VALUES
    ('b0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000018', '2026-05-26 09:00:00', 45, 'https://meet.momo.vn/interview-18', 'COMPLETED', TRUE, 'PASS', 'Good team fit', 'c0000000-0000-0000-0000-000000000011', CURRENT_TIMESTAMP);
INSERT INTO placement_applications (application_id, student_id, enterprise_id, semester_id, status, cover_letter, reviewed_by, reviewed_at) VALUES
    ('a0000000-0000-0000-0000-000000000018', 'd0000000-0000-0000-0000-000000000018', 'c0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'APPROVED', 'I want to learn from Momo team.', '00000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP);
INSERT INTO enterprise_assignments (assignment_id, enterprise_id, student_id, semester_id, supervisor_name, supervisor_email, assigned_by, status, start_date) VALUES
    ('f0000000-0000-0000-0000-000000000018', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000018', '50000000-0000-0000-0000-000000000001', 'Sup Momo', 'sup@momo.vn', '00000000-0000-0000-0000-000000000002', 'ACTIVE', '2026-03-01');

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000019', 'student19@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Ngo Ngoc Xuan', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000019', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000019', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000019', 'GD15019', 'Ngo Ngoc Xuan', 'student19@fpt.edu.vn', 'Graphic Design', 7.83, 5, 'MATCHED', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000019', 'GD15019', 'FPT University', 'Graphic Design', 6.5, '["Figma", "Adobe XD", "Illustrator"]'::jsonb, 'https://cv.example.com/gd15019.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status, screening_note, screened_by, screened_at) VALUES
    ('a0000000-0000-0000-0000-000000000019', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000019', 'https://cv.example.com/se15019.pdf', 'ACCEPTED', 'Strong problem-solving skills', 'c0000000-0000-0000-0000-000000000011', CURRENT_TIMESTAMP);
INSERT INTO interviews (interview_id, application_id, scheduled_datetime, duration_minutes, meeting_link, status, student_confirmed, result, result_note, decided_by, decided_at) VALUES
    ('b0000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000019', '2026-04-11 14:00:00', 45, 'https://meet.momo.vn/interview-19', 'COMPLETED', TRUE, 'PASS', 'Proactive learner', 'c0000000-0000-0000-0000-000000000011', CURRENT_TIMESTAMP);
INSERT INTO placement_applications (application_id, student_id, enterprise_id, semester_id, status, cover_letter, reviewed_by, reviewed_at) VALUES
    ('a0000000-0000-0000-0000-000000000019', 'd0000000-0000-0000-0000-000000000019', 'c0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'APPROVED', 'Excited to join Momo internship.', '00000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP);
INSERT INTO enterprise_assignments (assignment_id, enterprise_id, student_id, semester_id, supervisor_name, supervisor_email, assigned_by, status, start_date) VALUES
    ('f0000000-0000-0000-0000-000000000019', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000019', '50000000-0000-0000-0000-000000000001', 'Sup Momo', 'sup@momo.vn', '00000000-0000-0000-0000-000000000002', 'ACTIVE', '2026-03-01');

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000020', 'student20@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Huy Minh Xuan', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000020', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000020', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000020', 'DA15020', 'Huy Minh Xuan', 'student20@fpt.edu.vn', 'Digital Art & Design', 7.23, 5, 'MATCHED', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000020', 'DA15020', 'FPT University', 'Digital Art & Design', 7.5, '["Photoshop", "After Effects", "Motion Graphics"]'::jsonb, 'https://cv.example.com/da15020.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status, screening_note, screened_by, screened_at) VALUES
    ('a0000000-0000-0000-0000-000000000020', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000020', 'https://cv.example.com/se15020.pdf', 'ACCEPTED', 'Well-prepared and motivated', 'c0000000-0000-0000-0000-000000000011', CURRENT_TIMESTAMP);
INSERT INTO interviews (interview_id, application_id, scheduled_datetime, duration_minutes, meeting_link, status, student_confirmed, result, result_note, decided_by, decided_at) VALUES
    ('b0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000020', '2026-04-12 10:00:00', 45, 'https://meet.momo.vn/interview-20', 'COMPLETED', TRUE, 'PASS', 'Good communication', 'c0000000-0000-0000-0000-000000000011', CURRENT_TIMESTAMP);
INSERT INTO placement_applications (application_id, student_id, enterprise_id, semester_id, status, cover_letter, reviewed_by, reviewed_at) VALUES
    ('a0000000-0000-0000-0000-000000000020', 'd0000000-0000-0000-0000-000000000020', 'c0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'APPROVED', 'I am ready for Momo internship.', '00000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP);
INSERT INTO enterprise_assignments (assignment_id, enterprise_id, student_id, semester_id, supervisor_name, supervisor_email, assigned_by, status, start_date) VALUES
    ('f0000000-0000-0000-0000-000000000020', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000020', '50000000-0000-0000-0000-000000000001', 'Sup Momo', 'sup@momo.vn', '00000000-0000-0000-0000-000000000002', 'ACTIVE', '2026-03-01');

-- ============================================================
-- STUDENTS 21-25: OJT ACTIVE (Sem 6, enterprise_assignment ACTIVE)
-- has enterprise_assignments, internship_plans, weekly_reports
-- ============================================================

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000021', 'student21@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Vu Huu Quan', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000021', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked, approved_at) VALUES
    ('e0000000-0000-0000-0000-000000000021', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000021', 'GD15021', 'Vu Huu Quan', 'student21@fpt.edu.vn', 'Graphic Design', 8.06, 6, 'OJT', TRUE, CURRENT_TIMESTAMP);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000021', 'GD15021', 'FPT University', 'Graphic Design', 7.5, '["Figma", "Sketch", "Prototyping"]'::jsonb, 'https://cv.example.com/gd15021.pdf');
INSERT INTO enterprise_assignments (assignment_id, enterprise_id, student_id, semester_id, supervisor_name, supervisor_email, assigned_by, status, start_date) VALUES
    ('f0000000-0000-0000-0000-000000000021', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000021', '50000000-0000-0000-0000-000000000001', 'Sup Momo', 'sup@momo.vn', '00000000-0000-0000-0000-000000000002', 'ACTIVE', '2026-03-15');
-- internship_plans: commented out for demo purposes (TM wants to see fresh plan creation)
-- INSERT INTO internship_plans (plan_id, enterprise_id, semester_id, overall_goal, status, created_at, updated_at) VALUES
--     ('00000000-0000-0000-0001-000000000020', 'c0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Complete 12-week OJT: setup env, implement core features, testing, deployment.', 'APPROVED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- internship_plan_items: commented out for demo purposes
-- INSERT INTO internship_plan_items (plan_item_id, plan_id, week_number, task_description, training_objective, target_date, status) VALUES
--     ('00000000-0000-0000-0002-000000000020', '00000000-0000-0000-0001-000000000020', 1, 'Orientation & development environment setup', 'Understand company culture and tools', '2026-03-15', 'COMPLETED');
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, issues_challenges, lessons_learned, plan_next_week, status, submitted_at, feedback) VALUES
    ('00000000-0000-0000-0003-000000000021', 'f0000000-0000-0000-0000-000000000021', 1, 'Setup dev environment, understand codebase structure', 'Minor issues with API integration', 'Learned Spring Boot basics', 'Start with user module', 'APPROVED', '2026-03-21', 'Good start, keep it up!');
-- INSERT INTO internship_plan_items (plan_item_id, plan_id, week_number, task_description, training_objective, target_date, status) VALUES
--     ('00000000-0000-0000-0004-000000000020', '00000000-0000-0000-0001-000000000020', 2, 'Implement core feature module', 'Build deliverable feature', '2026-03-22', 'COMPLETED');
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, issues_challenges, lessons_learned, plan_next_week, status, submitted_at, feedback) VALUES
    ('00000000-0000-0000-0005-000000000021', 'f0000000-0000-0000-0000-000000000021', 2, 'Implemented core feature module', 'Need to improve error handling', 'Learned about JWT security', 'Work on API documentation', 'APPROVED', '2026-03-28', 'Solid implementation.');
-- INSERT INTO internship_plan_items (plan_item_id, plan_id, week_number, task_description, training_objective, target_date, status) VALUES
--     ('00000000-0000-0000-0006-000000000020', '00000000-0000-0000-0001-000000000020', 3, 'Develop remaining features & integration', 'Create clean and documented APIs', '2026-03-29', 'IN_PROGRESS');
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, issues_challenges, lessons_learned, plan_next_week, status, submitted_at) VALUES
    ('00000000-0000-0000-0007-000000000021', 'f0000000-0000-0000-0000-000000000021', 3, 'Built 5 REST API endpoints', 'Working on validation', 'Learned REST best practices', 'Add unit tests', 'SUBMITTED', '2026-04-04');
INSERT INTO report_feedbacks (feedback_id, report_id, reviewer_id, feedback_text, action) VALUES
    ('00000000-0000-0000-0008-000000000021', '00000000-0000-0000-0007-000000000021', '00000000-0000-0000-0000-000000000002', 'Please add input validation and error handling.', 'REJECTED');
INSERT INTO enterprise_evaluations (evaluation_id, assignment_id, attitude_score, professionalism_score, soft_skills_score, progress_score, overall_comments, is_locked, submitted_at) VALUES
    ('00000000-0000-0000-0009-000000000021', 'f0000000-0000-0000-0000-000000000021', 8.50, 9.00, 8.00, 8.50, 'Excellent intern, proactive and quick learner.', TRUE, CURRENT_TIMESTAMP);
INSERT INTO training_warnings (warning_id, tm_id, student_id, semester_id, week_number, warning_message, sent_at) VALUES
    ('00000000-0000-0000-000a-000000000021', '00000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000021', '50000000-0000-0000-0000-000000000001', 4, 'Weekly report for week 4 has not been submitted. Please submit by deadline.', CURRENT_TIMESTAMP);
INSERT INTO incidents (incident_id, assignment_id, reported_by, category, description, status, resolution_note, resolved_by, resolved_at) VALUES
    ('00000000-0000-0000-000b-000000000021', 'f0000000-0000-0000-0000-000000000021', 'c0000000-0000-0000-0000-000000000011', 'PROLONGED_ABSENCE', 'Student was absent for 3 consecutive days without prior notice.', 'RESOLVED', 'Student had a family emergency. Has submitted leave request and made up the work.', '00000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP);

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000022', 'student22@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Ho Gia Quan', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000022', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked, approved_at) VALUES
    ('e0000000-0000-0000-0000-000000000022', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000022', 'IS15022', 'Ho Gia Quan', 'student22@fpt.edu.vn', 'Information Security', 9.66, 6, 'OJT', TRUE, CURRENT_TIMESTAMP);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000022', 'IS15022', 'FPT University', 'Information Security', 7.5, '["Network Security", "Firewall", "IDS/IPS"]'::jsonb, 'https://cv.example.com/is15022.pdf');
INSERT INTO enterprise_assignments (assignment_id, enterprise_id, student_id, semester_id, supervisor_name, supervisor_email, assigned_by, status, start_date) VALUES
    ('f0000000-0000-0000-0000-000000000022', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000022', '50000000-0000-0000-0000-000000000001', 'Sup Momo', 'sup@momo.vn', '00000000-0000-0000-0000-000000000002', 'ACTIVE', '2026-03-15');
-- Student 22 dùng chung plan + items từ plan 00000000-0000-0000-0001-000000000020
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, issues_challenges, lessons_learned, plan_next_week, status, submitted_at, feedback) VALUES
    ('00000000-0000-0000-0003-000000000022', 'f0000000-0000-0000-0000-000000000022', 1, 'Completed onboarding tasks, met team members', 'No issues', 'Learned team workflow', 'Start database design', 'APPROVED', '2026-03-21', 'Excellent progress!');
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, issues_challenges, lessons_learned, plan_next_week, status, submitted_at, feedback) VALUES
    ('00000000-0000-0000-0005-000000000022', 'f0000000-0000-0000-0000-000000000022', 2, 'Designed database schema, started implementation', 'None', 'Learned database best practices', 'API development', 'APPROVED', '2026-03-28', 'Great work on the schema!');
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, issues_challenges, lessons_learned, plan_next_week, status, submitted_at) VALUES
    ('00000000-0000-0000-0007-000000000022', 'f0000000-0000-0000-0000-000000000022', 3, 'Implemented backend APIs for user module', 'Minor optimization needed', 'Learned API design patterns', 'Write unit tests', 'SUBMITTED', '2026-04-04');
INSERT INTO enterprise_evaluations (evaluation_id, assignment_id, attitude_score, professionalism_score, soft_skills_score, progress_score, overall_comments, is_locked, submitted_at) VALUES
    ('00000000-0000-0000-0009-000000000022', 'f0000000-0000-0000-0000-000000000022', 9.00, 9.50, 9.00, 9.00, 'Outstanding performance, highly recommended.', TRUE, CURRENT_TIMESTAMP);

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000023', 'student23@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Vu Duc Uyen', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000023', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked, approved_at) VALUES
    ('e0000000-0000-0000-0000-000000000023', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000023', 'DM15023', 'Vu Duc Uyen', 'student23@fpt.edu.vn', 'Digital Marketing', 9.17, 6, 'OJT', TRUE, CURRENT_TIMESTAMP);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000023', 'DM15023', 'FPT University', 'Digital Marketing', 7.5, '["Content Marketing", "Email Marketing", "Analytics"]'::jsonb, 'https://cv.example.com/dm15023.pdf');
INSERT INTO enterprise_assignments (assignment_id, enterprise_id, student_id, semester_id, supervisor_name, supervisor_email, assigned_by, status, start_date) VALUES
    ('f0000000-0000-0000-0000-000000000023', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000023', '50000000-0000-0000-0000-000000000001', 'Sup Momo', 'sup@momo.vn', '00000000-0000-0000-0000-000000000002', 'ACTIVE', '2026-03-15');
-- Student 23 dùng chung plan + items từ plan 00000000-0000-0000-0001-000000000020
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, issues_challenges, lessons_learned, plan_next_week, status, submitted_at, feedback) VALUES
    ('00000000-0000-0000-0003-000000000023', 'f0000000-0000-0000-0000-000000000023', 1, 'Completed tech stack training modules', 'Some modules were complex', 'Learned microservices basics', 'Start feature development', 'APPROVED', '2026-03-21', 'Good learning attitude.');
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, issues_challenges, lessons_learned, plan_next_week, status, submitted_at, feedback) VALUES
    ('00000000-0000-0000-0005-000000000023', 'f0000000-0000-0000-0000-000000000023', 2, 'Started feature development, first PR submitted', 'Code review feedback to address', 'Learned code review process', 'Address code review comments', 'APPROVED', '2026-03-28', 'Good first PR!');
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, issues_challenges, lessons_learned, plan_next_week, status, submitted_at) VALUES
    ('00000000-0000-0000-0007-000000000023', 'f0000000-0000-0000-0000-000000000023', 3, 'Feature implementation ongoing, addressing review comments', 'Time management challenge', 'Learned agile workflow', 'Complete feature and testing', 'SUBMITTED', '2026-04-04');

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000024', 'student24@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Huy Huu Yen', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000024', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked, approved_at) VALUES
    ('e0000000-0000-0000-0000-000000000024', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000024', 'SE15024', 'Huy Huu Yen', 'student24@fpt.edu.vn', 'Software Engineering', 7.91, 6, 'OJT', TRUE, CURRENT_TIMESTAMP);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000024', 'SE15024', 'FPT University', 'Software Engineering', 7.5, '["Java", "Spring Boot"]'::jsonb, 'https://cv.example.com/se15024.pdf');
INSERT INTO enterprise_assignments (assignment_id, enterprise_id, student_id, semester_id, supervisor_name, supervisor_email, assigned_by, status, start_date) VALUES
    ('f0000000-0000-0000-0000-000000000024', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000024', '50000000-0000-0000-0000-000000000001', 'Sup Momo', 'sup@momo.vn', '00000000-0000-0000-0000-000000000002', 'ACTIVE', '2026-03-15');
-- Student 24 dùng chung plan + items từ plan 00000000-0000-0000-0001-000000000020
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, issues_challenges, lessons_learned, plan_next_week, status, submitted_at, feedback) VALUES
    ('00000000-0000-0000-0003-000000000024', 'f0000000-0000-0000-0000-000000000024', 1, 'Code review sessions, wrote technical docs', 'Understanding legacy code', 'Learned documentation standards', 'Start bug fixes', 'APPROVED', '2026-03-21', 'Thorough documentation!');
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, issues_challenges, lessons_learned, plan_next_week, status, submitted_at, feedback) VALUES
    ('00000000-0000-0000-0005-000000000024', 'f0000000-0000-0000-0000-000000000024', 2, 'Fixed 3 critical bugs, 5 minor bugs', 'Debugging complex issues', 'Learned debugging tools', 'Feature development', 'APPROVED', '2026-03-28', 'Excellent debugging skills!');
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, issues_challenges, lessons_learned, plan_next_week, status, submitted_at) VALUES
    ('00000000-0000-0000-0007-000000000024', 'f0000000-0000-0000-0000-000000000024', 3, 'Feature development in progress', 'Feature scope management', 'Learned sprint planning', 'Complete first feature module', 'SUBMITTED', '2026-04-04');

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000025', 'student25@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Vu Thanh Son', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000025', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked, approved_at) VALUES
    ('e0000000-0000-0000-0000-000000000025', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000025', 'IS15025', 'Vu Thanh Son', 'student25@fpt.edu.vn', 'Information Security', 6.91, 6, 'OJT', TRUE, CURRENT_TIMESTAMP);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000025', 'IS15025', 'FPT University', 'Information Security', 8.5, '["Cryptography", "OWASP", "Ethical Hacking"]'::jsonb, 'https://cv.example.com/is15025.pdf');
INSERT INTO enterprise_assignments (assignment_id, enterprise_id, student_id, semester_id, supervisor_name, supervisor_email, assigned_by, status, start_date) VALUES
    ('f0000000-0000-0000-0000-000000000025', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000025', '50000000-0000-0000-0000-000000000001', 'Sup Momo', 'sup@momo.vn', '00000000-0000-0000-0000-000000000002', 'ACTIVE', '2026-03-15');
-- Student 25 dùng chung plan + items từ plan 00000000-0000-0000-0001-000000000020
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, issues_challenges, lessons_learned, plan_next_week, status, submitted_at, feedback) VALUES
    ('00000000-0000-0000-0003-000000000025', 'f0000000-0000-0000-0000-000000000025', 1, 'System setup completed, initial training done', 'None', 'Learned Momo architecture', 'Start feature work', 'APPROVED', '2026-03-21', 'Well prepared!');
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, issues_challenges, lessons_learned, plan_next_week, status, submitted_at, feedback) VALUES
    ('00000000-0000-0000-0005-000000000025', 'f0000000-0000-0000-0000-000000000025', 2, 'Feature implementation started', 'Git workflow questions', 'Learned Git branching strategy', 'Continue feature dev', 'APPROVED', '2026-03-28', 'Good progress!');
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, issues_challenges, lessons_learned, plan_next_week, status, submitted_at) VALUES
    ('00000000-0000-0000-0007-000000000025', 'f0000000-0000-0000-0000-000000000025', 3, 'Feature implementation ongoing', 'Scope creep management', 'Learned sprint management', 'Complete feature', 'SUBMITTED', '2026-04-04');

-- ============================================================
-- STUDENTS 26-30: OJT COMPLETED (Sem 7, assignment COMPLETED)
-- has final_reports, enterprise_evaluations, final_grades, student_feedbacks
-- ============================================================

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000026', 'student26@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Do Thi Thanh', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000026', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked, approved_at) VALUES
    ('e0000000-0000-0000-0000-000000000026', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000026', 'DA15026', 'Do Thi Thanh', 'student26@fpt.edu.vn', 'Digital Art & Design', 8.56, 7, 'OJT', TRUE, CURRENT_TIMESTAMP);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000026', 'DA15026', 'FPT University', 'Digital Art & Design', 5.5, '["Photoshop", "After Effects", "Motion Graphics"]'::jsonb, 'https://cv.example.com/da15026.pdf');
INSERT INTO enterprise_assignments (assignment_id, enterprise_id, student_id, semester_id, supervisor_name, supervisor_email, assigned_by, status, start_date, end_date) VALUES
    ('f0000000-0000-0000-0000-000000000026', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000026', '50000000-0000-0000-0000-000000000001', 'Sup Momo', 'sup@momo.vn', '00000000-0000-0000-0000-000000000002', 'COMPLETED', '2026-03-01', '2026-05-25');
INSERT INTO final_reports (final_report_id, assignment_id, file_url, file_size_bytes, submitted_at, is_late) VALUES
    ('00000000-0000-0000-000c-000000000026', 'f0000000-0000-0000-0000-000000000026', 'https://reports.example.com/se15026_final.pdf', 1048576, '2026-05-25 23:00:00', FALSE);
INSERT INTO enterprise_evaluations (evaluation_id, assignment_id, attitude_score, professionalism_score, soft_skills_score, progress_score, overall_comments, is_locked, submitted_at) VALUES
    ('00000000-0000-0000-000d-000000000026', 'f0000000-0000-0000-0000-000000000026', 8.00, 8.50, 8.00, 8.50, 'Good intern, consistent performance throughout.', TRUE, '2026-05-26 10:00:00');
INSERT INTO final_grades (grade_id, student_id, tm_id, semester_id, enterprise_total_score, final_grade, overall_status, is_locked, graded_at) VALUES
    ('00000000-0000-0000-000e-000000000026', 'd0000000-0000-0000-0000-000000000026', '00000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 8.36, 8.4, 'PASSED', TRUE, '2026-05-28 14:00:00');
INSERT INTO student_enterprise_feedbacks (feedback_id, student_id, enterprise_id, semester_id, training_quality_score, supervisor_support_score, work_environment_score, overall_score, positive_feedback, improvement_feedback, submitted_at) VALUES
    ('00000000-0000-0000-000f-000000000026', 'd0000000-0000-0000-0000-000000000026', 'c0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 5, 4, 5, 5, 'Great mentorship and learning environment at Momo.', 'Could improve on feedback turnaround time.', '2026-05-27 09:00:00');

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000027', 'student27@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Nguyen Thanh Duc', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000027', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked, approved_at) VALUES
    ('e0000000-0000-0000-0000-000000000027', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000027', 'GD15027', 'Nguyen Thanh Duc', 'student27@fpt.edu.vn', 'Graphic Design', 7.56, 7, 'OJT', TRUE, CURRENT_TIMESTAMP);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000027', 'GD15027', 'FPT University', 'Graphic Design', 5.5, '["Figma", "Illustrator", "UI Design"]'::jsonb, 'https://cv.example.com/gd15027.pdf');
INSERT INTO enterprise_assignments (assignment_id, enterprise_id, student_id, semester_id, supervisor_name, supervisor_email, assigned_by, status, start_date, end_date) VALUES
    ('f0000000-0000-0000-0000-000000000027', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000027', '50000000-0000-0000-0000-000000000001', 'Sup Momo', 'sup@momo.vn', '00000000-0000-0000-0000-000000000002', 'COMPLETED', '2026-03-01', '2026-05-25');
INSERT INTO final_reports (final_report_id, assignment_id, file_url, file_size_bytes, submitted_at, is_late) VALUES
    ('00000000-0000-0000-000c-000000000027', 'f0000000-0000-0000-0000-000000000027', 'https://reports.example.com/se15027_final.pdf', 1048576, '2026-05-25 22:30:00', FALSE);
INSERT INTO enterprise_evaluations (evaluation_id, assignment_id, attitude_score, professionalism_score, soft_skills_score, progress_score, overall_comments, is_locked, submitted_at) VALUES
    ('00000000-0000-0000-000d-000000000027', 'f0000000-0000-0000-0000-000000000027', 7.50, 8.00, 7.50, 8.00, 'Solid performer, good team collaboration.', TRUE, '2026-05-26 11:00:00');
INSERT INTO final_grades (grade_id, student_id, tm_id, semester_id, enterprise_total_score, final_grade, overall_status, is_locked, graded_at) VALUES
    ('00000000-0000-0000-000e-000000000027', 'd0000000-0000-0000-0000-000000000027', '00000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 7.85, 7.9, 'PASSED', TRUE, '2026-05-28 15:00:00');
INSERT INTO student_enterprise_feedbacks (feedback_id, student_id, enterprise_id, semester_id, training_quality_score, supervisor_support_score, work_environment_score, overall_score, positive_feedback, improvement_feedback, submitted_at) VALUES
    ('00000000-0000-0000-000f-000000000027', 'd0000000-0000-0000-0000-000000000027', 'c0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 4, 5, 4, 4, 'Good learning experience with supportive team at Momo.', 'More structured training curriculum needed.', '2026-05-27 10:00:00');

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000028', 'student28@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Ho Tuyet Linh', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000028', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked, approved_at) VALUES
    ('e0000000-0000-0000-0000-000000000028', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000028', 'DM15028', 'Ho Tuyet Linh', 'student28@fpt.edu.vn', 'Digital Marketing', 8.83, 7, 'OJT', TRUE, CURRENT_TIMESTAMP);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000028', 'DM15028', 'FPT University', 'Digital Marketing', 5.5, '["Facebook Ads", "Google Ads", "SEO"]'::jsonb, 'https://cv.example.com/dm15028.pdf');
INSERT INTO enterprise_assignments (assignment_id, enterprise_id, student_id, semester_id, supervisor_name, supervisor_email, assigned_by, status, start_date, end_date) VALUES
    ('f0000000-0000-0000-0000-000000000028', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000028', '50000000-0000-0000-0000-000000000001', 'Sup Momo', 'sup@momo.vn', '00000000-0000-0000-0000-000000000002', 'COMPLETED', '2026-03-01', '2026-05-25');
INSERT INTO final_reports (final_report_id, assignment_id, file_url, file_size_bytes, submitted_at, is_late) VALUES
    ('00000000-0000-0000-000c-000000000028', 'f0000000-0000-0000-0000-000000000028', 'https://reports.example.com/se15028_final.pdf', 1048576, '2026-05-24 20:00:00', FALSE);
INSERT INTO enterprise_evaluations (evaluation_id, assignment_id, attitude_score, professionalism_score, soft_skills_score, progress_score, overall_comments, is_locked, submitted_at) VALUES
    ('00000000-0000-0000-000d-000000000028', 'f0000000-0000-0000-0000-000000000028', 9.50, 9.50, 9.00, 9.50, 'Exceptional intern, exceeded all expectations. Highly recommended for hire.', TRUE, '2026-05-26 09:00:00');
INSERT INTO final_grades (grade_id, student_id, tm_id, semester_id, enterprise_total_score, final_grade, overall_status, is_locked, graded_at) VALUES
    ('00000000-0000-0000-000e-000000000028', 'd0000000-0000-0000-0000-000000000028', '00000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 9.40, 9.4, 'PASSED', TRUE, '2026-05-28 16:00:00');
INSERT INTO student_enterprise_feedbacks (feedback_id, student_id, enterprise_id, semester_id, training_quality_score, supervisor_support_score, work_environment_score, overall_score, positive_feedback, improvement_feedback, submitted_at) VALUES
    ('00000000-0000-0000-000f-000000000028', 'd0000000-0000-0000-0000-000000000028', 'c0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 5, 5, 5, 5, 'Excellent internship program with great mentorship at Momo.', 'Everything was well organized.', '2026-05-27 11:00:00');

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000029', 'student29@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Ngo Thanh Phong', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000029', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked, approved_at) VALUES
    ('e0000000-0000-0000-0000-000000000029', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000029', 'IS15029', 'Ngo Thanh Phong', 'student29@fpt.edu.vn', 'Information Security', 6.61, 7, 'OJT', TRUE, CURRENT_TIMESTAMP);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000029', 'IS15029', 'FPT University', 'Information Security', 6.5, '["SIEM", "Splunk", "Penetration Testing"]'::jsonb, 'https://cv.example.com/is15029.pdf');
INSERT INTO enterprise_assignments (assignment_id, enterprise_id, student_id, semester_id, supervisor_name, supervisor_email, assigned_by, status, start_date, end_date) VALUES
    ('f0000000-0000-0000-0000-000000000029', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000029', '50000000-0000-0000-0000-000000000001', 'Sup Momo', 'sup@momo.vn', '00000000-0000-0000-0000-000000000002', 'COMPLETED', '2026-03-01', '2026-05-25');
INSERT INTO final_reports (final_report_id, assignment_id, file_url, file_size_bytes, submitted_at, is_late) VALUES
    ('00000000-0000-0000-000c-000000000029', 'f0000000-0000-0000-0000-000000000029', 'https://reports.example.com/se15029_final.pdf', 1048576, '2026-05-25 21:00:00', FALSE);
INSERT INTO enterprise_evaluations (evaluation_id, assignment_id, attitude_score, professionalism_score, soft_skills_score, progress_score, overall_comments, is_locked, submitted_at) VALUES
    ('00000000-0000-0000-000d-000000000029', 'f0000000-0000-0000-0000-000000000029', 7.00, 7.50, 7.00, 7.50, 'Met expectations, some areas for improvement.', TRUE, '2026-05-26 12:00:00');
INSERT INTO final_grades (grade_id, student_id, tm_id, semester_id, enterprise_total_score, final_grade, overall_status, is_locked, graded_at) VALUES
    ('00000000-0000-0000-000e-000000000029', 'd0000000-0000-0000-0000-000000000029', '00000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 7.40, 7.4, 'PASSED', TRUE, '2026-05-28 17:00:00');
INSERT INTO student_enterprise_feedbacks (feedback_id, student_id, enterprise_id, semester_id, training_quality_score, supervisor_support_score, work_environment_score, overall_score, positive_feedback, improvement_feedback, submitted_at) VALUES
    ('00000000-0000-0000-000f-000000000029', 'd0000000-0000-0000-0000-000000000029', 'c0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 4, 4, 3, 4, 'Good experience overall, learned a lot at Momo.', 'More regular feedback sessions needed.', '2026-05-27 12:00:00');

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000030', 'student30@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Vu Duc Yen', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000030', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked, approved_at) VALUES
    ('e0000000-0000-0000-0000-000000000030', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000030', 'DA15030', 'Vu Duc Yen', 'student30@fpt.edu.vn', 'Digital Art & Design', 7.89, 7, 'OJT', TRUE, CURRENT_TIMESTAMP);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000030', 'DA15030', 'FPT University', 'Digital Art & Design', 6.5, '["Photoshop", "Illustrator", "Branding"]'::jsonb, 'https://cv.example.com/da15030.pdf');
INSERT INTO enterprise_assignments (assignment_id, enterprise_id, student_id, semester_id, supervisor_name, supervisor_email, assigned_by, status, start_date, end_date) VALUES
    ('f0000000-0000-0000-0000-000000000030', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000030', '50000000-0000-0000-0000-000000000001', 'Sup Momo', 'sup@momo.vn', '00000000-0000-0000-0000-000000000002', 'COMPLETED', '2026-03-01', '2026-05-25');
INSERT INTO final_reports (final_report_id, assignment_id, file_url, file_size_bytes, submitted_at, is_late) VALUES
    ('00000000-0000-0000-000c-000000000030', 'f0000000-0000-0000-0000-000000000030', 'https://reports.example.com/se15030_final.pdf', 1048576, '2026-05-25 20:00:00', FALSE);
INSERT INTO enterprise_evaluations (evaluation_id, assignment_id, attitude_score, professionalism_score, soft_skills_score, progress_score, overall_comments, is_locked, submitted_at) VALUES
    ('00000000-0000-0000-000d-000000000030', 'f0000000-0000-0000-0000-000000000030', 8.00, 8.50, 8.00, 8.00, 'Reliable and consistent performer.', TRUE, '2026-05-26 13:00:00');
INSERT INTO final_grades (grade_id, student_id, tm_id, semester_id, enterprise_total_score, final_grade, overall_status, is_locked, graded_at) VALUES
    ('00000000-0000-0000-000e-000000000030', 'd0000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 8.20, 8.2, 'PASSED', TRUE, '2026-05-28 18:00:00');
INSERT INTO student_enterprise_feedbacks (feedback_id, student_id, enterprise_id, semester_id, training_quality_score, supervisor_support_score, work_environment_score, overall_score, positive_feedback, improvement_feedback, submitted_at) VALUES
    ('00000000-0000-0000-000f-000000000030', 'd0000000-0000-0000-0000-000000000030', 'c0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 4, 5, 4, 4, 'Good project exposure and mentorship at Momo.', 'Could improve onboarding process.', '2026-05-27 13:00:00');

-- ============================================================
-- STUDENTS 31-35: ELIGIBLE (various semesters, no activity)
-- ============================================================

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000031', 'student31@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Duong Minh Khanh', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000031', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000031', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000031', 'SE15031', 'Duong Minh Khanh', 'student31@fpt.edu.vn', 'Software Engineering', 8.17, 8, 'ELIGIBLE', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000031', 'SE15031', 'FPT University', 'Software Engineering', 6.5, '["Java", "Spring Boot"]'::jsonb, 'https://cv.example.com/se15031.pdf');

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000032', 'student32@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Do Xuan Quan', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000032', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000032', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000032', 'SE15032', 'Do Xuan Quan', 'student32@fpt.edu.vn', 'Software Engineering', 9.22, 9, 'ELIGIBLE', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000032', 'SE15032', 'FPT University', 'Software Engineering', 6.5, '["Java", "Spring Boot"]'::jsonb, 'https://cv.example.com/se15032.pdf');

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000033', 'student33@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Vo Huu Yen', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000033', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000033', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000033', 'SE15033', 'Vo Huu Yen', 'student33@fpt.edu.vn', 'Software Engineering', 8.87, 1, 'ELIGIBLE', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000033', 'SE15033', 'FPT University', 'Software Engineering', 7.5, '["Java", "Spring Boot"]'::jsonb, 'https://cv.example.com/se15033.pdf');

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000034', 'student34@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Ho Xuan Linh', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000034', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000034', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000034', 'SE15034', 'Ho Xuan Linh', 'student34@fpt.edu.vn', 'Software Engineering', 7.10, 7, 'ELIGIBLE', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000034', 'SE15034', 'FPT University', 'Software Engineering', 7.5, '["Java", "Spring Boot"]'::jsonb, 'https://cv.example.com/se15034.pdf');

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000035', 'student35@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Bui Xuan Phong', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000035', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000035', '50000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000035', 'SE15035', 'Bui Xuan Phong', 'student35@fpt.edu.vn', 'Software Engineering', 6.80, 1, 'ELIGIBLE', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d0000000-0000-0000-0000-000000000035', 'SE15035', 'FPT University', 'Software Engineering', 8.5, '["Java", "Spring Boot"]'::jsonb, 'https://cv.example.com/se15035.pdf');

-- ============================================================
-- SYSTEM ANNOUNCEMENTS
-- ============================================================
INSERT INTO system_announcements (announcement_id, semester_id, title, content, status, created_by, published_at, type, audience) VALUES
    ('00000000-0000-0001-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Welcome to Summer 2026 OJT Program', 'Dear students, welcome to the Summer 2026 OJT program. Please review your internship assignments and contact your supervisors. Orientation session will be held on March 1, 2026.', 'PUBLISHED', '00000000-0000-0000-0000-000000000002', '2026-03-01 08:00:00', 'SYSTEM_ANNOUNCEMENT', 'ALL');
INSERT INTO system_announcements (announcement_id, semester_id, title, content, status, created_by, published_at, type, audience) VALUES
    ('00000000-0000-0001-0000-000000000002', '50000000-0000-0000-0000-000000000001', 'Weekly Report Deadline Reminder', 'Please remember to submit your weekly reports every Sunday by 23:59. Late submissions require Training Manager approval.', 'PUBLISHED', '00000000-0000-0000-0000-000000000002', '2026-03-08 09:00:00', 'SYSTEM_ANNOUNCEMENT', 'ALL');
INSERT INTO system_announcements (announcement_id, semester_id, title, content, status, created_by, published_at, type, audience) VALUES
    ('00000000-0000-0001-0000-000000000003', '50000000-0000-0000-0000-000000000001', 'Application Deadline Extended', 'The application deadline for Summer 2026 positions has been extended to July 15, 2026. Apply now!', 'PUBLISHED', '00000000-0000-0000-0000-000000000002', '2026-04-20 10:00:00', 'SYSTEM_ANNOUNCEMENT', 'STUDENT');
INSERT INTO system_announcements (announcement_id, semester_id, title, content, status, created_by, type, audience) VALUES
    ('00000000-0000-0001-0000-000000000004', '50000000-0000-0000-0000-000000000001', 'Final Report Submission Guidelines', 'Please review the final report submission guidelines. Reports must be submitted by August 5, 2026.', 'DRAFT', '00000000-0000-0000-0000-000000000002', 'SYSTEM_ANNOUNCEMENT', 'STUDENT');

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
INSERT INTO notifications (notification_id, recipient_id, title, message, type, reference_entity, reference_id, is_read) VALUES
    ('00000000-0000-0002-0000-000000000016', 'd0000000-0000-0000-0000-000000000016', 'Congratulations! You have been matched with Momo', 'Your application to Momo has been approved. Please check your placement details.', 'APPROVAL', 'placement_applications', 'a0000000-0000-0000-0000-000000000016', FALSE);
INSERT INTO notifications (notification_id, recipient_id, title, message, type, reference_entity, reference_id, is_read) VALUES
    ('00000000-0000-0002-0000-000000000017', 'd0000000-0000-0000-0000-000000000017', 'Congratulations! You have been matched with Momo', 'Your application to Momo has been approved. Please check your placement details.', 'APPROVAL', 'placement_applications', 'a0000000-0000-0000-0000-000000000017', FALSE);
INSERT INTO notifications (notification_id, recipient_id, title, message, type, reference_entity, reference_id, is_read) VALUES
    ('00000000-0000-0002-0000-000000000021', 'd0000000-0000-0000-0000-000000000021', 'Weekly Report Approved', 'Your weekly report for Week 2 has been approved by the supervisor.', 'REPORT_FEEDBACK', 'weekly_reports', '00000000-0000-0000-0005-000000000021', TRUE);
INSERT INTO notifications (notification_id, recipient_id, title, message, type, reference_entity, reference_id, is_read) VALUES
    ('00000000-0000-0002-0000-000000000022', 'd0000000-0000-0000-0000-000000000022', 'Weekly Report Approved', 'Your weekly report for Week 2 has been approved by the supervisor.', 'REPORT_FEEDBACK', 'weekly_reports', '00000000-0000-0000-0005-000000000022', TRUE);
INSERT INTO notifications (notification_id, recipient_id, title, message, type, reference_entity, reference_id, is_read) VALUES
    ('00000000-0000-0002-0000-000000000023', 'd0000000-0000-0000-0000-000000000023', 'Weekly Report Approved', 'Your weekly report for Week 2 has been approved by the supervisor.', 'REPORT_FEEDBACK', 'weekly_reports', '00000000-0000-0000-0005-000000000023', TRUE);
INSERT INTO notifications (notification_id, recipient_id, title, message, type, reference_entity, reference_id, is_read) VALUES
    ('00000000-0000-0002-0000-000000000024', 'd0000000-0000-0000-0000-000000000024', 'Weekly Report Approved', 'Your weekly report for Week 2 has been approved by the supervisor.', 'REPORT_FEEDBACK', 'weekly_reports', '00000000-0000-0000-0005-000000000024', TRUE);
INSERT INTO notifications (notification_id, recipient_id, title, message, type, reference_entity, reference_id, is_read) VALUES
    ('00000000-0000-0002-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'New Incident Reported', 'An incident has been reported for Vu Huu Quan (SE15021). Please review.', 'INCIDENT', 'incidents', '00000000-0000-0000-000b-000000000021', TRUE);
INSERT INTO notifications (notification_id, recipient_id, title, message, type, reference_entity, reference_id, is_read) VALUES
    ('00000000-0000-0002-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Student Warning Sent', 'A training warning has been sent to Vu Huu Quan (SE15021) for Week 4.', 'WARNING', 'training_warnings', '00000000-0000-0000-000a-000000000021', TRUE);
INSERT INTO notifications (notification_id, recipient_id, title, message, type, reference_entity, reference_id, is_read) VALUES
    ('00000000-0000-0002-0000-000000000011', 'd0000000-0000-0000-0000-000000000011', 'Interview Scheduled with Momo', 'Your interview with Momo has been scheduled for July 28, 2026 at 10:00 AM.', 'INTERVIEW_INVITE', 'interviews', 'b0000000-0000-0000-0000-000000000011', TRUE);
INSERT INTO notifications (notification_id, recipient_id, title, message, type, reference_entity, reference_id, is_read) VALUES
    ('00000000-0000-0002-0000-000000000012', 'd0000000-0000-0000-0000-000000000012', 'Interview Scheduled with Momo', 'Your interview with Momo has been scheduled for July 28, 2026 at 2:00 PM.', 'INTERVIEW_INVITE', 'interviews', 'b0000000-0000-0000-0000-000000000012', TRUE);
INSERT INTO notifications (notification_id, recipient_id, title, message, type, reference_entity, reference_id, is_read) VALUES
    ('00000000-0000-0002-0000-000000000026', 'd0000000-0000-0000-0000-000000000026', 'Your Final Grade Has Been Published', 'Final grade for Summer 2026: 8.4 - PASSED. Congratulations!', 'GRADE_PUBLISHED', 'final_grades', '00000000-0000-0000-000e-000000000026', FALSE);
INSERT INTO notifications (notification_id, recipient_id, title, message, type, reference_entity, reference_id, is_read) VALUES
    ('00000000-0000-0002-0000-000000000027', 'd0000000-0000-0000-0000-000000000027', 'Your Final Grade Has Been Published', 'Final grade for Summer 2026: 7.9 - PASSED. Congratulations!', 'GRADE_PUBLISHED', 'final_grades', '00000000-0000-0000-000e-000000000027', FALSE);
INSERT INTO notifications (notification_id, recipient_id, title, message, type, reference_entity, reference_id, is_read) VALUES
    ('00000000-0000-0002-0000-000000000028', 'd0000000-0000-0000-0000-000000000028', 'Your Final Grade Has Been Published', 'Final grade for Summer 2026: 9.4 - PASSED. Outstanding!', 'GRADE_PUBLISHED', 'final_grades', '00000000-0000-0000-000e-000000000028', FALSE);

-- ============================================================
-- PART 0: UPDATE EMAILS
-- (Password unchanged: Password@123 for all accounts)
-- ============================================================

-- Update email for Training Manager (account 2)
UPDATE users SET email = 'dominhgiabaobmg@gmail.com' WHERE user_id = '00000000-0000-0000-0000-000000000002';

-- Update email for Momo HR (account 11)
UPDATE users SET email = 'dominhgiabaobmg1@gmail.com' WHERE user_id = 'c0000000-0000-0000-0000-000000000011';

-- Update email for FPT Software HR (account 12) → mock (kept on @fsoft.com domain only)
UPDATE users SET email = 'hr@fsoft.com' WHERE user_id = 'c0000000-0000-0000-0000-000000000012';
UPDATE enterprises SET contact_person_email = 'hr@fsoft.com' WHERE enterprise_id = 'c0000000-0000-0000-0000-000000000002';

-- Update email for Shopee HR (account 13)
UPDATE users SET email = 'gogodlmkja21022006@gmail.com' WHERE user_id = 'c0000000-0000-0000-0000-000000000013';

-- ============================================================
-- PART 1: PERMISSIONS & RBAC
-- (System non-functional without these — CRITICAL)
-- ============================================================

INSERT INTO permissions (permission_name, description) VALUES
    -- Admin permissions
    ('USERS_CREATE',        'Create new user accounts'),
    ('USERS_READ',          'View user accounts'),
    ('USERS_UPDATE',        'Update user accounts'),
    ('USERS_DELETE',        'Delete user accounts'),
    ('ROLES_ASSIGN',        'Assign roles to users'),
    -- Training Manager permissions
    ('SEMESTER_MANAGE',     'Create and manage semesters'),
    ('SEMESTER_VIEW',       'View semester data'),
    ('STUDENTS_IMPORT',     'Import eligible student list'),
    ('STUDENTS_MANAGE',     'Manage student eligibility and status'),
    ('STUDENTS_VIEW',       'View student information'),
    ('GRADES_MANAGE',       'Manage and publish final grades'),
    ('GRADES_VIEW',         'View grades'),
    ('INCIDENTS_MANAGE',    'Resolve incidents and training warnings'),
    ('INCIDENTS_VIEW',      'View incidents'),
    ('WARNINGS_SEND',       'Send training warnings to students'),
    ('ANNOUNCEMENTS_MANAGE', 'Create and publish announcements'),
    -- Enterprise permissions
    ('RECRUITMENT_MANAGE',  'Post jobs and manage recruitment'),
    ('RECRUITMENT_VIEW',    'View recruitment pipeline'),
    ('APPLICATIONS_SCREEN', 'Screen and evaluate applications'),
    ('INTERVIEWS_SCHEDULE', 'Schedule and manage interviews'),
    ('INTERVIEWS_VIEW',     'View interview schedules'),
    ('TRAINING_MANAGE',     'Manage OJT training and evaluations'),
    ('TRAINING_VIEW',       'View student training progress'),
    ('REPORTS_REVIEW',      'Review and approve student reports'),
    ('INCIDENTS_REPORT',    'Report incidents'),
    -- Student permissions
    ('JOBS_VIEW',           'View available job posts'),
    ('JOBS_APPLY',          'Apply for jobs'),
    ('MY_APPLICATIONS',     'View own applications'),
    ('MY_REPORTS',          'Submit weekly reports'),
    ('MY_PROFILE',          'Manage own profile'),
    ('MY_INTERVIEWS',       'View interview invitations');

-- RBAC: ADMIN = all permissions
INSERT INTO role_permissions (role_name, permission_name)
SELECT 'ADMIN', permission_name FROM permissions;

-- RBAC: TRAINING_MANAGER
INSERT INTO role_permissions (role_name, permission_name) VALUES
    ('TRAINING_MANAGER', 'SEMESTER_VIEW'), ('TRAINING_MANAGER', 'SEMESTER_MANAGE'),
    ('TRAINING_MANAGER', 'STUDENTS_VIEW'), ('TRAINING_MANAGER', 'STUDENTS_MANAGE'),
    ('TRAINING_MANAGER', 'STUDENTS_IMPORT'),
    ('TRAINING_MANAGER', 'GRADES_VIEW'), ('TRAINING_MANAGER', 'GRADES_MANAGE'),
    ('TRAINING_MANAGER', 'INCIDENTS_VIEW'), ('TRAINING_MANAGER', 'INCIDENTS_MANAGE'),
    ('TRAINING_MANAGER', 'WARNINGS_SEND'),
    ('TRAINING_MANAGER', 'ANNOUNCEMENTS_MANAGE'),
    ('TRAINING_MANAGER', 'RECRUITMENT_VIEW'), ('TRAINING_MANAGER', 'APPLICATIONS_SCREEN'),
    ('TRAINING_MANAGER', 'INTERVIEWS_VIEW'), ('TRAINING_MANAGER', 'INTERVIEWS_SCHEDULE'),
    ('TRAINING_MANAGER', 'TRAINING_VIEW'), ('TRAINING_MANAGER', 'REPORTS_REVIEW'),
    ('TRAINING_MANAGER', 'JOBS_VIEW'), ('TRAINING_MANAGER', 'MY_PROFILE');

-- RBAC: ENTERPRISE
INSERT INTO role_permissions (role_name, permission_name) VALUES
    ('ENTERPRISE', 'RECRUITMENT_MANAGE'), ('ENTERPRISE', 'RECRUITMENT_VIEW'),
    ('ENTERPRISE', 'APPLICATIONS_SCREEN'),
    ('ENTERPRISE', 'INTERVIEWS_VIEW'), ('ENTERPRISE', 'INTERVIEWS_SCHEDULE'),
    ('ENTERPRISE', 'TRAINING_MANAGE'), ('ENTERPRISE', 'TRAINING_VIEW'),
    ('ENTERPRISE', 'REPORTS_REVIEW'),
    ('ENTERPRISE', 'INCIDENTS_REPORT'), ('ENTERPRISE', 'INCIDENTS_VIEW'),
    ('ENTERPRISE', 'JOBS_VIEW'), ('ENTERPRISE', 'MY_PROFILE');

-- RBAC: STUDENT
INSERT INTO role_permissions (role_name, permission_name) VALUES
    ('STUDENT', 'JOBS_VIEW'), ('STUDENT', 'JOBS_APPLY'),
    ('STUDENT', 'MY_APPLICATIONS'),
    ('STUDENT', 'MY_INTERVIEWS'),
    ('STUDENT', 'MY_REPORTS'),
    ('STUDENT', 'MY_PROFILE'),
    ('STUDENT', 'TRAINING_VIEW');

-- ============================================================
-- PART 3: ADDITIONAL SEMESTERS (Multi-semester demo)
-- ============================================================

-- SU26: Summer 2026 (CLOSED) — historical semester kept for cross-semester demos
INSERT INTO semesters (semester_id, semester_code, name, start_date, end_date, weekly_report_deadline_day, weekly_report_deadline_time, final_report_deadline, status, created_by) VALUES
    ('50000000-0000-0000-0000-000000000002', 'SU26', 'Summer 2026', '2026-06-01', '2026-09-30', 'SUNDAY', '23:59:00', '2026-10-05 23:59:00', 'CLOSED', '00000000-0000-0000-0000-000000000002');

-- FA25: Fall 2025 (CLOSED) — historical semester for grade comparison demo
INSERT INTO semesters (semester_id, semester_code, name, start_date, end_date, weekly_report_deadline_day, weekly_report_deadline_time, final_report_deadline, status, created_by) VALUES
    ('50000000-0000-0000-0000-000000000003', 'FA25', 'Fall 2025', '2025-08-01', '2025-12-31', 'SUNDAY', '23:59:00', '2026-01-05 23:59:00', 'CLOSED', '00000000-0000-0000-0000-000000000002');

-- Register enterprises for SU26
INSERT INTO semester_enterprises (semester_enterprise_id, semester_id, enterprise_id, registration_status, reviewed_by, reviewed_at) VALUES
    ('51000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'APPROVED', '00000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP),
    ('51000000-0000-0000-0000-000000000006', '50000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'APPROVED', '00000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP),
    ('51000000-0000-0000-0000-000000000007', '50000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 'APPROVED', '00000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP);

-- ============================================================
-- PART 4: STUDENTS WITH MISSING STATUSES
-- ============================================================

-- NOT_ELIGIBLE students (SE15036-37) for eligibility rejection demo
-- NOTE: chk_gpa_minimum requires gpa >= 5.0, so NOT_ELIGIBLE here means "missing certifications" not low GPA
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000036', 'student36@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Tran Van Khoa', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000036', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000036', '50000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000036', 'SE15036', 'Tran Van Khoa', 'student36@fpt.edu.vn', 'Software Engineering', 5.50, 5, 'NOT_ELIGIBLE', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills) VALUES
    ('d0000000-0000-0000-0000-000000000036', 'SE15036', 'FPT University', 'Software Engineering', 5.5, '["Java"]'::jsonb);

INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000037', 'student37@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Nguyen Thi Lan', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000037', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000037', '50000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000037', 'SE15037', 'Nguyen Thi Lan', 'student37@fpt.edu.vn', 'Software Engineering', 5.20, 5, 'NOT_ELIGIBLE', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills) VALUES
    ('d0000000-0000-0000-0000-000000000037', 'SE15037', 'FPT University', 'Software Engineering', 5.2, '["Python"]'::jsonb);

-- ACCEPTED students (SE15038) for ACCEPTED status demo
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000038', 'student38@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Pham Hoang Nam', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000038', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e0000000-0000-0000-0000-000000000038', '50000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000038', 'SE15038', 'Pham Hoang Nam', 'student38@fpt.edu.vn', 'Software Engineering', 7.80, 5, 'ACCEPTED', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills) VALUES
    ('d0000000-0000-0000-0000-000000000038', 'SE15038', 'FPT University', 'Software Engineering', 7.5, '["Java", "React"]'::jsonb);

-- CANCELLED students (SE15039) for cancellation demo
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000039', 'student39@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Le Thi Mai', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000039', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked, cancelled_reason, cancelled_by) VALUES
    ('e0000000-0000-0000-0000-000000000039', '50000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000039', 'SE15039', 'Le Thi Mai', 'student39@fpt.edu.vn', 'Software Engineering', 6.10, 5, 'CANCELLED', FALSE, 'Student withdrew from program', '00000000-0000-0000-0000-000000000002');
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills) VALUES
    ('d0000000-0000-0000-0000-000000000039', 'SE15039', 'FPT University', 'Software Engineering', 7.0, '["JavaScript"]'::jsonb);

-- ============================================================
-- PART 5: APPLICATIONS WITH ALL 7 STATUSES
-- ============================================================

-- SCREENING_PASSED: student40 passed screening, awaiting interview scheduling
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000040', 'student40@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Dao Van An', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000040', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status) VALUES
    ('e0000000-0000-0000-0000-000000000040', '50000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000040', 'SE15040', 'Dao Van An', 'student40@fpt.edu.vn', 'Software Engineering', 8.00, 5, 'PENDING');
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills) VALUES
    ('d0000000-0000-0000-0000-000000000040', 'SE15040', 'FPT University', 'Software Engineering', 7.5, '["React", "Node.js"]'::jsonb);
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status, screening_note, screened_by, screened_at) VALUES
    ('a0000000-0000-0000-0000-000000000040', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000040', 'https://cv.example.com/se15040.pdf', 'SCREENING_PASSED', 'Strong portfolio, passed technical screening', 'c0000000-0000-0000-0000-000000000011', CURRENT_TIMESTAMP);

-- SCREENING_PASSED: student41 passed screening
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000041', 'student41@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Bui Thi Hoa', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000041', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status) VALUES
    ('e0000000-0000-0000-0000-000000000041', '50000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000041', 'SE15041', 'Bui Thi Hoa', 'student41@fpt.edu.vn', 'Software Engineering', 7.20, 5, 'PENDING');
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills) VALUES
    ('d0000000-0000-0000-0000-000000000041', 'SE15041', 'FPT University', 'Software Engineering', 7.5, '["Python", "Django"]'::jsonb);
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status, screening_note, screened_by, screened_at) VALUES
    ('a0000000-0000-0000-0000-000000000041', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000041', 'https://cv.example.com/se15041.pdf', 'SCREENING_PASSED', 'Good GPA, relevant projects', 'c0000000-0000-0000-0000-000000000011', CURRENT_TIMESTAMP);

-- SCREENING_REJECTED: student42 rejected at screening
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000042', 'student42@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Hoang Van Cuong', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000042', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status) VALUES
    ('e0000000-0000-0000-0000-000000000042', '50000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000042', 'SE15042', 'Hoang Van Cuong', 'student42@fpt.edu.vn', 'Software Engineering', 5.20, 5, 'ELIGIBLE');
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills) VALUES
    ('d0000000-0000-0000-0000-000000000042', 'SE15042', 'FPT University', 'Software Engineering', 7.0, '[]'::jsonb);
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status, screening_note, screened_by, screened_at) VALUES
    ('a0000000-0000-0000-0000-000000000042', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000042', 'https://cv.example.com/se15042.pdf', 'SCREENING_REJECTED', 'No relevant skills listed, GPA below requirement', 'c0000000-0000-0000-0000-000000000011', CURRENT_TIMESTAMP);

-- SCREENING_REJECTED: student43 rejected at screening (REJECTED final status after interview)
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000043', 'student43@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Tran Thi Thu', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000043', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status) VALUES
    ('e0000000-0000-0000-0000-000000000043', '50000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000043', 'SE15043', 'Tran Thi Thu', 'student43@fpt.edu.vn', 'Software Engineering', 6.50, 5, 'PENDING');
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills) VALUES
    ('d0000000-0000-0000-0000-000000000043', 'SE15043', 'FPT University', 'Software Engineering', 7.0, '["Java"]'::jsonb);
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status, screening_note, screened_by, screened_at) VALUES
    ('a0000000-0000-0000-0000-000000000043', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000043', 'https://cv.example.com/se15043.pdf', 'SCREENING_REJECTED', 'Missing required certifications', 'c0000000-0000-0000-0000-000000000011', CURRENT_TIMESTAMP);

-- WITHDRAWN: student44 withdrew before screening
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d0000000-0000-0000-0000-000000000044', 'student44@fpt.edu.vn', '$2b$10$9iIyzMRccX/e5dRyLbgK3.11HHtAVrHrRSWNEhe.VnM/GFi3Aep8O', 'Vu Van Binh', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d0000000-0000-0000-0000-000000000044', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status) VALUES
    ('e0000000-0000-0000-0000-000000000044', '50000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000044', 'SE15044', 'Vu Van Binh', 'student44@fpt.edu.vn', 'Software Engineering', 7.00, 5, 'ELIGIBLE');
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills) VALUES
    ('d0000000-0000-0000-0000-000000000044', 'SE15044', 'FPT University', 'Software Engineering', 7.0, '["JavaScript"]'::jsonb);
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status, withdrawn_at) VALUES
    ('a0000000-0000-0000-0000-000000000044', 'f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000044', 'https://cv.example.com/se15044.pdf', 'WITHDRAWN', CURRENT_TIMESTAMP);

-- ============================================================
-- PART 6: INTERVIEWS WITH ALL STATUSES
-- ============================================================

-- CONFIRMED: student11 interview confirmed (upgrade from SCHEDULED)
UPDATE interviews SET status = 'CONFIRMED', student_confirmed = TRUE, confirmed_at = CURRENT_TIMESTAMP
WHERE application_id = 'a0000000-0000-0000-0000-000000000011';

-- CANCELLED: student12 interview cancelled
UPDATE interviews SET status = 'CANCELLED', cancel_reason = 'Candidate scheduling conflict, will reschedule'
WHERE application_id = 'a0000000-0000-0000-0000-000000000012';

-- COMPLETED with FAIL: student13 interview failed
UPDATE interviews SET status = 'COMPLETED', result = 'FAIL', result_note = 'Insufficient technical knowledge for the role requirements', decided_by = 'c0000000-0000-0000-0000-000000000011', decided_at = CURRENT_TIMESTAMP
WHERE application_id = 'a0000000-0000-0000-0000-000000000013';

-- New CONFIRMED interview (student14) — second-round interview, distinct interview_id from line 255
INSERT INTO interviews (interview_id, application_id, scheduled_datetime, duration_minutes, meeting_link, status, student_confirmed, confirmed_at) VALUES
    ('b0000000-0000-0000-0000-000000000021', 'a0000000-0000-0000-0000-000000000014', '2026-05-25 09:00:00', 45, 'https://meet.momo.vn/interview-14-new', 'CONFIRMED', TRUE, CURRENT_TIMESTAMP);

-- ============================================================
-- PART 7: INCIDENTS WITH ALL STATUSES (OPEN, UNDER_REVIEW, RESOLVED)
-- ============================================================

-- OPEN incident: student21 absent without leave (2 days) — pending TM action
INSERT INTO incidents (incident_id, assignment_id, reported_by, category, description, evidence_urls, status) VALUES
    ('00000000-0000-0000-000c-000000000021', 'f0000000-0000-0000-0000-000000000021', 'c0000000-0000-0000-0000-000000000011', 'PROLONGED_ABSENCE',
     'Student has been absent for 2 consecutive days (July 1-2, 2026) without submitting any leave request or notifying the supervisor.',
     '["https://evidence.example.com/absence-1.pdf"]'::jsonb, 'OPEN');

-- UNDER_REVIEW incident: student22 professionalism issue — TM investigating
INSERT INTO incidents (incident_id, assignment_id, reported_by, category, description, evidence_urls, status) VALUES
    ('00000000-0000-0000-000c-000000000022', 'f0000000-0000-0000-0000-000000000022', 'c0000000-0000-0000-0000-000000000011', 'POOR_ATTITUDE',
     'Student submitted a weekly report with plagiarized content and unprofessional language directed at supervisor feedback.',
     '["https://evidence.example.com/report-plagiarism.pdf"]'::jsonb, 'UNDER_REVIEW');

-- Notification for TM about OPEN incident
INSERT INTO notifications (notification_id, recipient_id, title, message, type, reference_entity, reference_id, is_read) VALUES
    ('00000000-0000-0002-0000-000000000040', '00000000-0000-0000-0000-000000000002', 'New Incident: Prolonged Absence', 'An absence incident has been reported for Vu Huu Quan (SE15021) at Momo. Please review and take action.', 'INCIDENT', 'incidents', '00000000-0000-0000-000c-000000000021', FALSE);

-- ============================================================
-- PART 8: REPORT FEEDBACKS — APPROVED examples
-- ============================================================

INSERT INTO report_feedbacks (feedback_id, report_id, reviewer_id, feedback_text, action) VALUES
    ('00000000-0000-0003-0000-000000000021', '00000000-0000-0000-0003-000000000021', 'c0000000-0000-0000-0000-000000000011', 'Excellent progress this week. Well-structured report. Keep it up!', 'APPROVED'),
    ('00000000-0000-0003-0000-000000000022', '00000000-0000-0000-0003-000000000022', 'c0000000-0000-0000-0000-000000000011', 'Good work on the project kickoff. Comprehensive report.', 'APPROVED'),
    ('00000000-0000-0003-0000-000000000023', '00000000-0000-0000-0003-000000000023', 'c0000000-0000-0000-0000-000000000011', 'Thorough report with good technical details. Approved.', 'APPROVED'),
    ('00000000-0000-0003-0000-000000000024', '00000000-0000-0000-0003-000000000024', 'c0000000-0000-0000-0000-000000000011', 'Well-documented code review activities. Great work.', 'APPROVED'),
    ('00000000-0000-0003-0000-000000000025', '00000000-0000-0000-0003-000000000025', 'c0000000-0000-0000-0000-000000000011', 'Good system setup and clear documentation. Approved.', 'APPROVED');

-- ============================================================
-- PART 9: FINAL GRADES — FAILED & CANCELLED examples
-- ============================================================

-- FAILED grade (FA25 historical semester) — distinct grade_id from line 563 (which is current semester)
INSERT INTO final_grades (grade_id, student_id, tm_id, semester_id, enterprise_total_score, final_grade, overall_status, is_locked, graded_at) VALUES
    ('00000000-0000-0000-0010-000000000031', 'd0000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000003', 3.20, 3.2, 'FAILED', TRUE, '2025-12-20 10:00:00');

-- CANCELLED grade (student withdrew mid-semester)
INSERT INTO final_grades (grade_id, student_id, tm_id, semester_id, enterprise_total_score, final_grade, overall_status, is_locked, cancelled_reason, cancelled_by, cancelled_at) VALUES
    ('00000000-0000-0000-000e-000000000031', 'd0000000-0000-0000-0000-000000000039', '00000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', NULL, 0.0, 'CANCELLED', TRUE, 'Student withdrew from program before evaluation', '00000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP);

-- ============================================================
-- PART 10: WEEKLY REPORTS — NOT_SUBMITTED for at-risk demo
-- ============================================================

-- student21 week 4 NOT_SUBMITTED (triggers warning + at-risk)
INSERT INTO weekly_reports (report_id, assignment_id, week_number, status) VALUES
    ('00000000-0000-0000-0010-000000000021', 'f0000000-0000-0000-0000-000000000021', 4, 'NOT_SUBMITTED');

-- student22 week 4 NOT_SUBMITTED
INSERT INTO weekly_reports (report_id, assignment_id, week_number, status) VALUES
    ('00000000-0000-0000-0010-000000000022', 'f0000000-0000-0000-0000-000000000022', 4, 'NOT_SUBMITTED');

-- student23 week 4 NOT_SUBMITTED
INSERT INTO weekly_reports (report_id, assignment_id, week_number, status) VALUES
    ('00000000-0000-0000-0010-000000000023', 'f0000000-0000-0000-0000-000000000023', 4, 'NOT_SUBMITTED');

-- ============================================================
-- PART 11: TRAINING WARNINGS — additional for dashboard variety
-- ============================================================

INSERT INTO training_warnings (warning_id, tm_id, student_id, semester_id, week_number, warning_message, sent_at) VALUES
    ('00000000-0000-0000-000a-000000000022', '00000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000022', '50000000-0000-0000-0000-000000000001', 4, 'Weekly report for week 4 has not been submitted. Please submit by deadline.', CURRENT_TIMESTAMP),
    ('00000000-0000-0000-000a-000000000023', '00000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000023', '50000000-0000-0000-0000-000000000001', 4, 'Weekly report for week 4 has not been submitted. Immediate submission required.', CURRENT_TIMESTAMP);

-- ============================================================
-- PART 12: AUDIT LOGS — synthetic entries for audit trail demo
-- ============================================================

INSERT INTO audit_logs (user_id, action, target_entity, target_id, old_value, new_value, ip_address) VALUES
    ('00000000-0000-0000-0000-000000000002', 'UPDATE_STATUS', 'eligible_students', 'e0000000-0000-0000-0000-000000000016', 'PENDING', 'MATCHED', '192.168.1.100'),
    ('00000000-0000-0000-0000-000000000002', 'UPDATE_STATUS', 'eligible_students', 'e0000000-0000-0000-0000-000000000021', 'MATCHED', 'OJT', '192.168.1.100'),
    ('c0000000-0000-0000-0000-000000000011', 'CREATE', 'job_posts', 'f0000000-0000-0000-0000-000000000001', NULL, '{"title":"Java Backend Developer Intern"}', '10.0.0.50'),
    ('c0000000-0000-0000-0000-000000000011', 'UPDATE_STATUS', 'applications', 'a0000000-0000-0000-0000-000000000006', 'PENDING', 'SCREENING_PASSED', '10.0.0.50'),
    ('00000000-0000-0000-0000-000000000002', 'RESOLVE', 'incidents', '00000000-0000-0000-000b-000000000021', 'OPEN', 'RESOLVED', '192.168.1.100'),
    ('00000000-0000-0000-0000-000000000002', 'PUBLISH', 'final_grades', '00000000-0000-0000-000e-000000000026', 'LOCKED', 'PUBLISHED', '192.168.1.100'),
    ('d0000000-0000-0000-0000-000000000021', 'SUBMIT', 'weekly_reports', '00000000-0000-0000-0007-000000000021', 'NOT_SUBMITTED', 'SUBMITTED', '172.16.0.20'),
    ('c0000000-0000-0000-0000-000000000011', 'SCHEDULE', 'interviews', 'b0000000-0000-0000-0000-000000000011', NULL, '{"scheduled_datetime":"2026-04-15 10:00:00"}', '10.0.0.50');

-- ============================================================
-- Re-enable all triggers and constraints
-- ============================================================
SET session_replication_role = 'origin';

COMMIT;
