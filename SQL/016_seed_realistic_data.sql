-- ============================================================
-- SEED DATA 016: Realistic Data — Correct Data Flow
-- Fixes from 008:
--   1. trg_validate_ea_student_status: REQUIRE status='OJT' for INSERT assignment
--      → MATCHED students cannot have enterprise_assignments unless they transition OJT first
--      → FIX: Only students with status=OJT can have enterprise_assignments in seed
--   2. trg_locked_student_edit: is_locked=TRUE blocks MATCHED→OJT transition
--      → FIX: Set is_locked=FALSE for MATCHED students (they haven't entered OJT yet)
--   3. trg_interview_rules: scheduled_datetime must be in the future
--      → FIX: Use future dates (2026-07-28+) for all interviews
--   4. trg_student_apply_permission: Only semester 5 students can apply
--      → FIX: Remove applications from semester 6-9 students
--   5. trg_plan_item_date_boundary: target_date must fall within semester
--      → FIX: Semester SP26 = 2026-03-01 to 2026-07-31 (summer OJT semester)
--
-- Data Flow per Business Rules:
--   ELIGIBLE → (apply) → PENDING → (screen pass) → SCREENING_PASSED
--             → (schedule interview) → INTERVIEW_SCHEDULED
--             → (PASS interview) → ACCEPTED + (placement app APPROVED) → MATCHED
--             → (TM approve placement) → OJT + is_locked=TRUE (via trg_validate_ojt)
--             → (enterprise assign) → enterprise_assignments (status ACTIVE)
--             → (weekly reports) → weekly_reports
--             → (end of OJT) → enterprise_assignments (status COMPLETED)
--             → (final report) → final_reports
--             → (evaluation) → enterprise_evaluations
--             → (grade) → final_grades
--
-- Application Rules (BR-54):
--   - Semesters 1-5: PREPARE → cannot apply yet
--   - Semester 5: Can apply for job posts
--   - Semester 6: Must be OJT (enterprise_assignment exists)
--   - Semesters 7-9: OJT COMPLETED → final report + evaluation + grade
-- ============================================================
BEGIN;
SET session_replication_role = 'replica';

-- Clean up all OJT-related data first (respect FK order)
DELETE FROM student_enterprise_feedbacks;
DELETE FROM final_grades;
DELETE FROM final_reports;
DELETE FROM enterprise_evaluations;
DELETE FROM report_feedbacks;
DELETE FROM weekly_reports;
DELETE FROM internship_plan_items;
DELETE FROM internship_plans;
DELETE FROM enterprise_assignments;
DELETE FROM placement_applications;
DELETE FROM interviews;
DELETE FROM applications;
DELETE FROM job_posts;
DELETE FROM student_profiles;
DELETE FROM eligible_student_status_history;
DELETE FROM eligible_students;
DELETE FROM semester_enterprises;
DELETE FROM semesters;
DELETE FROM users_roles;
DELETE FROM users;
DELETE FROM enterprises;

-- ============================================================
-- SYSTEM USERS (ADMIN + TM)
-- ============================================================
INSERT INTO users (user_id, email, password_hash, full_name, phone, status, must_change_password) VALUES
    ('9f50dd7a-75e2-4d78-895a-d5e5f4c99382', 'admin@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'System Administrator', '0901234567', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('9f50dd7a-75e2-4d78-895a-d5e5f4c99382', 'ADMIN');

INSERT INTO users (user_id, email, password_hash, full_name, phone, status, must_change_password) VALUES
    ('249b64b9-1ab8-4e92-bd30-2951e07f1def', 'manager@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Training Manager Demo', '0987654321', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('249b64b9-1ab8-4e92-bd30-2951e07f1def', 'TRAINING_MANAGER');

-- ============================================================
-- ENTERPRISES + ENTERPRISE USERS
-- ============================================================
-- Momo (approved)
INSERT INTO enterprises (enterprise_id, company_name, tax_code, industry, company_size, description, address, contact_person_name, contact_person_email, contact_person_phone, approval_status, approved_by, approved_at) VALUES
    ('0264a1ce-a950-4eb1-9d71-75fe9b254d43', 'Momo', '0319913525', 'Fintech', '500-1000', 'Top Company', 'District 1, HCMC', 'HR Momo', 'hr@momo.vn', '0900000000', 'APPROVED', '9f50dd7a-75e2-4d78-895a-d5e5f4c99382', CURRENT_TIMESTAMP);
INSERT INTO users (user_id, email, password_hash, full_name, status, enterprise_id, must_change_password) VALUES
    ('1eda2085-68f1-4d62-97c9-727ae880d8a5', 'hr@momo.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'HR Momo', 'ACTIVE', '0264a1ce-a950-4eb1-9d71-75fe9b254d43', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('1eda2085-68f1-4d62-97c9-727ae880d8a5', 'ENTERPRISE');

-- FPT Software (approved)
INSERT INTO enterprises (enterprise_id, company_name, tax_code, industry, company_size, description, address, contact_person_name, contact_person_email, contact_person_phone, approval_status, approved_by, approved_at) VALUES
    ('7d4af7af-d78f-482e-b57e-55785022c81d', 'FPT Software', '0313473050', 'IT Services', '500-1000', 'Top Company', 'District 1, HCMC', 'HR FPT Software', 'hr@fsoft.com', '0900000000', 'APPROVED', '9f50dd7a-75e2-4d78-895a-d5e5f4c99382', CURRENT_TIMESTAMP);
INSERT INTO users (user_id, email, password_hash, full_name, status, enterprise_id, must_change_password) VALUES
    ('04f62171-bb82-4855-918e-c547bbfff8b5', 'hr@fsoft.com', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'HR FPT Software', 'ACTIVE', '7d4af7af-d78f-482e-b57e-55785022c81d', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('04f62171-bb82-4855-918e-c547bbfff8b5', 'ENTERPRISE');

-- Shopee Vietnam (approved)
INSERT INTO enterprises (enterprise_id, company_name, tax_code, industry, company_size, description, address, contact_person_name, contact_person_email, contact_person_phone, approval_status, approved_by, approved_at) VALUES
    ('470374d2-20b6-4c72-981e-f0e05a0d7bfd', 'Shopee Vietnam', '0313036579', 'E-commerce', '500-1000', 'Top Company', 'District 1, HCMC', 'HR Shopee Vietnam', 'hr@shopee.vn', '0900000000', 'APPROVED', '9f50dd7a-75e2-4d78-895a-d5e5f4c99382', CURRENT_TIMESTAMP);
INSERT INTO users (user_id, email, password_hash, full_name, status, enterprise_id, must_change_password) VALUES
    ('5d7fd4c2-1b31-49cb-83c9-c05079954b22', 'hr@shopee.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'HR Shopee Vietnam', 'ACTIVE', '470374d2-20b6-4c72-981e-f0e05a0d7bfd', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('5d7fd4c2-1b31-49cb-83c9-c05079954b22', 'ENTERPRISE');

-- VNG Corporation (approved)
INSERT INTO enterprises (enterprise_id, company_name, tax_code, industry, company_size, description, address, contact_person_name, contact_person_email, contact_person_phone, approval_status, approved_by, approved_at) VALUES
    ('612493bb-c593-45d5-affa-c722ff75def2', 'VNG Corporation', '0318743606', 'Technology & Gaming', '500-1000', 'Top Company', 'District 1, HCMC', 'HR VNG Corporation', 'hr@vng.com.vn', '0900000000', 'APPROVED', '9f50dd7a-75e2-4d78-895a-d5e5f4c99382', CURRENT_TIMESTAMP);
INSERT INTO users (user_id, email, password_hash, full_name, status, enterprise_id, must_change_password) VALUES
    ('c2295ce5-54ea-4179-9204-304bbb19354c', 'hr@vng.com.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'HR VNG Corporation', 'ACTIVE', '612493bb-c593-45d5-affa-c722ff75def2', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('c2295ce5-54ea-4179-9204-304bbb19354c', 'ENTERPRISE');

-- ============================================================
-- SEMESTER SP26 (Summer 2026 — March to July)
-- trg_initial_semester_status: MUST start as DRAFT (replica bypasses this)
-- Status = ACTIVE so OJT data can be seeded
-- ============================================================
INSERT INTO semesters (semester_id, semester_code, name, start_date, end_date, weekly_report_deadline_day, weekly_report_deadline_time, final_report_deadline, status, created_by) VALUES
    ('26f11784-e2dc-48bb-aec0-80ee582b49a0', 'SP26', 'Summer 2026', '2026-03-01', '2026-07-31', 'SUNDAY', '23:59:00', '2026-08-05 23:59:00', 'ACTIVE', '249b64b9-1ab8-4e92-bd30-2951e07f1def');

-- Semester-Enterprise registrations
INSERT INTO semester_enterprises (semester_id, enterprise_id, registration_status, reviewed_by, reviewed_at) VALUES
    ('26f11784-e2dc-48bb-aec0-80ee582b49a0', '0264a1ce-a950-4eb1-9d71-75fe9b254d43', 'APPROVED', '249b64b9-1ab8-4e92-bd30-2951e07f1def', CURRENT_TIMESTAMP);
INSERT INTO semester_enterprises (semester_id, enterprise_id, registration_status, reviewed_by, reviewed_at) VALUES
    ('26f11784-e2dc-48bb-aec0-80ee582b49a0', '7d4af7af-d78f-482e-b57e-55785022c81d', 'APPROVED', '249b64b9-1ab8-4e92-bd30-2951e07f1def', CURRENT_TIMESTAMP);
INSERT INTO semester_enterprises (semester_id, enterprise_id, registration_status, reviewed_by, reviewed_at) VALUES
    ('26f11784-e2dc-48bb-aec0-80ee582b49a0', '470374d2-20b6-4c72-981e-f0e05a0d7bfd', 'APPROVED', '249b64b9-1ab8-4e92-bd30-2951e07f1def', CURRENT_TIMESTAMP);
INSERT INTO semester_enterprises (semester_id, enterprise_id, registration_status, reviewed_by, reviewed_at) VALUES
    ('26f11784-e2dc-48bb-aec0-80ee582b49a0', '612493bb-c593-45d5-affa-c722ff75def2', 'APPROVED', '249b64b9-1ab8-4e92-bd30-2951e07f1def', CURRENT_TIMESTAMP);

-- ============================================================
-- JOB POSTS (for SP26)
-- Application deadline = 2026-07-15 (future date)
-- ============================================================
INSERT INTO job_posts (job_post_id, enterprise_id, semester_id, title, description, requirements, required_technologies, max_positions, application_deadline, status) VALUES
    ('a7cc62cb-1ee8-4b9c-b20d-cdbd29ea56a2', '0264a1ce-a950-4eb1-9d71-75fe9b254d43', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'Java Backend Developer Intern', 'Phat trien module backend cho Momo', 'Nam vuong Java', 'Java, Spring', 20, '2026-07-15', 'OPEN');
INSERT INTO job_posts (job_post_id, enterprise_id, semester_id, title, description, requirements, required_technologies, max_positions, application_deadline, status) VALUES
    ('b8dd73ce-2ff9-5c3d-ae71-c225d4fb3e14', '7d4af7af-d78f-482e-b57e-55785022c81d', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'React Frontend Developer Intern', 'Phat trien ung dung React cho FPT Software', 'Nam vuong React', 'React, TypeScript', 15, '2026-07-15', 'OPEN');
INSERT INTO job_posts (job_post_id, enterprise_id, semester_id, title, description, requirements, required_technologies, max_positions, application_deadline, status) VALUES
    ('c9ee84df-3a0a-6d4e-bf82-d336e5fc4f25', '470374d2-20b6-4c72-981e-f0e05a0d7bfd', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'Fullstack Developer Intern', 'Phat trien fullstack cho Shopee', 'Fullstack', 'NodeJS, React', 10, '2026-07-15', 'OPEN');

-- ============================================================
-- STUDENTS: SEMESTER 5 (BR-54: Can apply for internships)
--
-- Flow: ELIGIBLE → PENDING → SCREENING_PASSED → INTERVIEW_SCHEDULED → ACCEPTED → MATCHED → OJT
-- student16 (SE15016) = semester 5, MATCHED (has placement, ready for OJT approval)
-- students 11-15 = INTERVIEW_SCHEDULED (passed screening, awaiting interview result)
-- students 6-10  = PENDING (applied, waiting for screening)
-- students 1-5   = ELIGIBLE (no application yet)
-- ============================================================

-- STUDENT 1: Demo Student (SE15001) — Semester 5, ELIGIBLE, no application
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('0e3a780a-7f2e-47fc-8995-1fbd1280b68a', 'demo.student@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Demo Student', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('0e3a780a-7f2e-47fc-8995-1fbd1280b68a', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('1dec5c4b-5867-49f4-b328-1778d72f9820', '26f11784-e2dc-48bb-aec0-80ee582b49a0', '0e3a780a-7f2e-47fc-8995-1fbd1280b68a', 'SE15001', 'Demo Student', 'demo.student@fpt.edu.vn', 'Software Engineering', 6.78, 5, 'ELIGIBLE', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('0e3a780a-7f2e-47fc-8995-1fbd1280b68a', 'SE15001', 'FPT University', 'Software Engineering', 6.5, '["Java"]', 'https://cv.com/cv.pdf');

-- STUDENT 2 (SE15002) — Semester 1, ELIGIBLE, cannot apply (BR-54)
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('f32d8874-506a-46a5-bc25-82c4650eef53', 'student2@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Tran Ngoc Uyen', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('f32d8874-506a-46a5-bc25-82c4650eef53', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('72ea2659-f584-4f85-93fc-3a99fe2e5c07', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'f32d8874-506a-46a5-bc25-82c4650eef53', 'SE15002', 'Tran Ngoc Uyen', 'student2@fpt.edu.vn', 'Software Engineering', 6.83, 1, 'ELIGIBLE', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('f32d8874-506a-46a5-bc25-82c4650eef53', 'SE15002', 'FPT University', 'Software Engineering', 7.5, '["Java"]', 'https://cv.com/cv.pdf');

-- STUDENT 3 (SE15003) — Semester 2, ELIGIBLE
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('4ceb27ad-8169-472e-984c-a5a63d285779', 'student3@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Dang Xuan Vinh', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('4ceb27ad-8169-472e-984c-a5a63d285779', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e8d3162e-0fea-4a67-91cb-40ef6aeb9694', '26f11784-e2dc-48bb-aec0-80ee582b49a0', '4ceb27ad-8169-472e-984c-a5a63d285779', 'SE15003', 'Dang Xuan Vinh', 'student3@fpt.edu.vn', 'Software Engineering', 7.19, 2, 'ELIGIBLE', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('4ceb27ad-8169-472e-984c-a5a63d285779', 'SE15003', 'FPT University', 'Software Engineering', 8.5, '["Java"]', 'https://cv.com/cv.pdf');

-- STUDENT 4 (SE15004) — Semester 3, ELIGIBLE
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('7770a57b-b560-4692-8db4-792d16ef3146', 'student4@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Dang Thu Linh', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('7770a57b-b560-4692-8db4-792d16ef3146', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('c5b7817d-5493-4b68-a388-2006be62da16', '26f11784-e2dc-48bb-aec0-80ee582b49a0', '7770a57b-b560-4692-8db4-792d16ef3146', 'SE15004', 'Dang Thu Linh', 'student4@fpt.edu.vn', 'Software Engineering', 7.99, 3, 'ELIGIBLE', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('7770a57b-b560-4692-8db4-792d16ef3146', 'SE15004', 'FPT University', 'Software Engineering', 7.5, '["Java"]', 'https://cv.com/cv.pdf');

-- STUDENT 5 (SE15005) — Semester 1, ELIGIBLE
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('2d4fcd13-0753-4c46-bca8-4396c0bb981f', 'student5@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Ngo Thanh Uyen', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('2d4fcd13-0753-4c46-bca8-4396c0bb981f', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('8d847807-b110-4375-8a93-85348a9ba974', '26f11784-e2dc-48bb-aec0-80ee582b49a0', '2d4fcd13-0753-4c46-bca8-4396c0bb981f', 'SE15005', 'Ngo Thanh Uyen', 'student5@fpt.edu.vn', 'Software Engineering', 7.63, 1, 'ELIGIBLE', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('2d4fcd13-0753-4c46-bca8-4396c0bb981f', 'SE15005', 'FPT University', 'Software Engineering', 6.5, '["Java"]', 'https://cv.com/cv.pdf');

-- STUDENT 6 (SE15006) — Semester 5, PENDING (applied, awaiting screening)
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('75d4bbaa-9824-48f6-bbb2-9efc40a808da', 'student6@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Vu Thanh Phong', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('75d4bbaa-9824-48f6-bbb2-9efc40a808da', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('a7e3a4db-7881-4c80-a3da-ed395f74af63', '26f11784-e2dc-48bb-aec0-80ee582b49a0', '75d4bbaa-9824-48f6-bbb2-9efc40a808da', 'SE15006', 'Vu Thanh Phong', 'student6@fpt.edu.vn', 'Software Engineering', 8.54, 5, 'PENDING', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('75d4bbaa-9824-48f6-bbb2-9efc40a808da', 'SE15006', 'FPT University', 'Software Engineering', 6.5, '["Java"]', 'https://cv.com/cv.pdf');
-- Application: PENDING
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status) VALUES
    ('84bedf48-16fd-412c-8ec9-4c6b83444673', 'a7cc62cb-1ee8-4b9c-b20d-cdbd29ea56a2', '75d4bbaa-9824-48f6-bbb2-9efc40a808da', 'cv.pdf', 'PENDING');

-- STUDENT 7 (SE15007) — Semester 5, PENDING
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('50170269-a0ae-4234-b7b5-b0f2f6ab9c0d', 'student7@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Hoang Xuan Duc', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('50170269-a0ae-4234-b7b5-b0f2f6ab9c0d', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('ffe2db29-51e2-4676-860d-d9366ad93a60', '26f11784-e2dc-48bb-aec0-80ee582b49a0', '50170269-a0ae-4234-b7b5-b0f2f6ab9c0d', 'SE15007', 'Hoang Xuan Duc', 'student7@fpt.edu.vn', 'Software Engineering', 9.31, 5, 'PENDING', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('50170269-a0ae-4234-b7b5-b0f2f6ab9c0d', 'SE15007', 'FPT University', 'Software Engineering', 7.5, '["Java"]', 'https://cv.com/cv.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status) VALUES
    ('b3a577e7-8567-4b78-ba89-93baf667fe7f', 'a7cc62cb-1ee8-4b9c-b20d-cdbd29ea56a2', '50170269-a0ae-4234-b7b5-b0f2f6ab9c0d', 'cv.pdf', 'PENDING');

-- STUDENT 8 (SE15008) — Semester 5, PENDING
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('2fefa24d-d639-477a-b353-06f188133f94', 'student8@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Le Thanh Binh', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('2fefa24d-d639-477a-b353-06f188133f94', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('784ab74e-f93e-4af5-8694-de793d3f71f0', '26f11784-e2dc-48bb-aec0-80ee582b49a0', '2fefa24d-d639-477a-b353-06f188133f94', 'SE15008', 'Le Thanh Binh', 'student8@fpt.edu.vn', 'Software Engineering', 6.56, 5, 'PENDING', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('2fefa24d-d639-477a-b353-06f188133f94', 'SE15008', 'FPT University', 'Software Engineering', 7.5, '["Java"]', 'https://cv.com/cv.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status) VALUES
    ('bc397677-f778-4d4b-9738-26d3df94ca17', 'a7cc62cb-1ee8-4b9c-b20d-cdbd29ea56a2', '2fefa24d-d639-477a-b353-06f188133f94', 'cv.pdf', 'PENDING');

-- STUDENT 9 (SE15009) — Semester 5, PENDING
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('7244dcc2-792a-4d55-9c15-13c7fb1c1ea5', 'student9@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Huyh Xuan Nam', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('7244dcc2-792a-4d55-9c15-13c7fb1c1ea5', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('a555bb42-f75e-4007-9f39-b9ac9af2c635', '26f11784-e2dc-48bb-aec0-80ee582b49a0', '7244dcc2-792a-4d55-9c15-13c7fb1c1ea5', 'SE15009', 'Huyh Xuan Nam', 'student9@fpt.edu.vn', 'Software Engineering', 6.86, 5, 'PENDING', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('7244dcc2-792a-4d55-9c15-13c7fb1c1ea5', 'SE15009', 'FPT University', 'Software Engineering', 5.5, '["Java"]', 'https://cv.com/cv.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status) VALUES
    ('0ec1568f-422b-445c-a994-cdfe37e831de', 'a7cc62cb-1ee8-4b9c-b20d-cdbd29ea56a2', '7244dcc2-792a-4d55-9c15-13c7fb1c1ea5', 'cv.pdf', 'PENDING');

-- STUDENT 10 (SE15010) — Semester 5, PENDING
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('e32b89e9-9bd5-406c-a7d2-58a099eef0f2', 'student10@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Pham Minh Hai', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('e32b89e9-9bd5-406c-a7d2-58a099eef0f2', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('b6afd1d2-e815-4e5b-b700-d4efcdecf411', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'e32b89e9-9bd5-406c-a7d2-58a099eef0f2', 'SE15010', 'Pham Minh Hai', 'student10@fpt.edu.vn', 'Software Engineering', 7.55, 5, 'PENDING', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('e32b89e9-9bd5-406c-a7d2-58a099eef0f2', 'SE15010', 'FPT University', 'Software Engineering', 6.5, '["Java"]', 'https://cv.com/cv.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status) VALUES
    ('8d06fb02-1380-448b-ab5c-e9507f33f413', 'a7cc62cb-1ee8-4b9c-b20d-cdbd29ea56a2', 'e32b89e9-9bd5-406c-a7d2-58a099eef0f2', 'cv.pdf', 'PENDING');

-- STUDENTS 11-15 (SE15011-SE15015) — Semester 5, INTERVIEW_SCHEDULED
-- Interview status should be SCHEDULED (not COMPLETED) since result hasn't been recorded yet
-- Interview scheduled for future date: 2026-07-28
-- IMPORTANT: trg_interview_eligible requires application status = SCREENING_PASSED or INTERVIEW_SCHEDULED
-- IMPORTANT: trg_interview_rules requires scheduled_datetime > CURRENT_TIMESTAMP

-- STUDENT 11 (SE15011) — INTERVIEW_SCHEDULED, future interview
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('0e4d2bdc-de44-4886-8f5b-d3bd966265be', 'student11@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Hoang Van Uyen', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('0e4d2bdc-de44-4886-8f5b-d3bd966265be', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('8361eb27-3e79-4dc2-b9d1-610890471dc9', '26f11784-e2dc-48bb-aec0-80ee582b49a0', '0e4d2bdc-de44-4886-8f5b-d3bd966265be', 'SE15011', 'Hoang Van Uyen', 'student11@fpt.edu.vn', 'Software Engineering', 7.69, 5, 'PENDING', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('0e4d2bdc-de44-4886-8f5b-d3bd966265be', 'SE15011', 'FPT University', 'Software Engineering', 5.5, '["Java"]', 'https://cv.com/cv.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status) VALUES
    ('3477c23d-57f7-454a-bda5-d32ca047196b', 'a7cc62cb-1ee8-4b9c-b20d-cdbd29ea56a2', '0e4d2bdc-de44-4886-8f5b-d3bd966265be', 'cv.pdf', 'INTERVIEW_SCHEDULED');
-- Interview SCHEDULED (future date, no result yet)
INSERT INTO interviews (interview_id, application_id, scheduled_datetime, status, student_confirmed) VALUES
    ('dc90acee-fd73-4aa8-97b8-2e76a4d31c23', '3477c23d-57f7-454a-bda5-d32ca047196b', '2026-07-28 10:00:00', 'SCHEDULED', FALSE);

-- STUDENT 12 (SE15012) — INTERVIEW_SCHEDULED
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('02f909d3-7c58-4658-92d5-bb3992aa2717', 'student12@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Nguyen Huu Son', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('02f909d3-7c58-4658-92d5-bb3992aa2717', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('11583bbe-60e8-4565-9a54-cf55efc84f4e', '26f11784-e2dc-48bb-aec0-80ee582b49a0', '02f909d3-7c58-4658-92d5-bb3992aa2717', 'SE15012', 'Nguyen Huu Son', 'student12@fpt.edu.vn', 'Software Engineering', 8.99, 5, 'PENDING', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('02f909d3-7c58-4658-92d5-bb3992aa2717', 'SE15012', 'FPT University', 'Software Engineering', 7.5, '["Java"]', 'https://cv.com/cv.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status) VALUES
    ('808fa890-6c4b-4ecb-88cb-4955c1e34347', 'a7cc62cb-1ee8-4b9c-b20d-cdbd29ea56a2', '02f909d3-7c58-4658-92d5-bb3992aa2717', 'cv.pdf', 'INTERVIEW_SCHEDULED');
INSERT INTO interviews (interview_id, application_id, scheduled_datetime, status, student_confirmed) VALUES
    ('d8cb32dc-3d8f-4538-9e10-cebfd0ae4804', '808fa890-6c4b-4ecb-88cb-4955c1e34347', '2026-07-28 14:00:00', 'SCHEDULED', FALSE);

-- STUDENT 13 (SE15013) — INTERVIEW_SCHEDULED
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('ac33586a-583f-4aa9-ad20-da3bc9297559', 'student13@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Vo Minh Giang', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('ac33586a-583f-4aa9-ad20-da3bc9297559', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('87483e91-2979-4b0c-87a3-3c175d030d77', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'ac33586a-583f-4aa9-ad20-da3bc9297559', 'SE15013', 'Vo Minh Giang', 'student13@fpt.edu.vn', 'Software Engineering', 8.85, 5, 'PENDING', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('ac33586a-583f-4aa9-ad20-da3bc9297559', 'SE15013', 'FPT University', 'Software Engineering', 8.5, '["Java"]', 'https://cv.com/cv.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status) VALUES
    ('efda57a4-77ea-4551-be87-b621a19f5f53', 'a7cc62cb-1ee8-4b9c-b20d-cdbd29ea56a2', 'ac33586a-583f-4aa9-ad20-da3bc9297559', 'cv.pdf', 'INTERVIEW_SCHEDULED');
INSERT INTO interviews (interview_id, application_id, scheduled_datetime, status, student_confirmed) VALUES
    ('2c006f71-bb3a-4146-98bd-7b852dd1a7a8', 'efda57a4-77ea-4551-be87-b621a19f5f53', '2026-07-29 09:00:00', 'SCHEDULED', FALSE);

-- STUDENT 14 (SE15014) — INTERVIEW_SCHEDULED
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('63c43a30-ed24-4bcc-be56-03a845b06e57', 'student14@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Ngo Duc Hai', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('63c43a30-ed24-4bcc-be56-03a845b06e57', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('f058c59f-20db-4037-9e61-55cca1d7187b', '26f11784-e2dc-48bb-aec0-80ee582b49a0', '63c43a30-ed24-4bcc-be56-03a845b06e57', 'SE15014', 'Ngo Duc Hai', 'student14@fpt.edu.vn', 'Software Engineering', 8.43, 5, 'PENDING', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('63c43a30-ed24-4bcc-be56-03a845b06e57', 'SE15014', 'FPT University', 'Software Engineering', 8.5, '["Java"]', 'https://cv.com/cv.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status) VALUES
    ('85f25a37-9390-4ae4-83d0-0da5cf012e04', 'a7cc62cb-1ee8-4b9c-b20d-cdbd29ea56a2', '63c43a30-ed24-4bcc-be56-03a845b06e57', 'cv.pdf', 'INTERVIEW_SCHEDULED');
INSERT INTO interviews (interview_id, application_id, scheduled_datetime, status, student_confirmed) VALUES
    ('42d1edaa-4af1-424b-a4d3-ac4136030b83', '85f25a37-9390-4ae4-83d0-0da5cf012e04', '2026-07-29 14:00:00', 'SCHEDULED', FALSE);

-- STUDENT 15 (SE15015) — INTERVIEW_SCHEDULED
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('354f1d5f-054b-439b-9c72-1b989d0b2e7d', 'student15@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Vu Thanh Giang', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('354f1d5f-054b-439b-9c72-1b989d0b2e7d', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('2ec7da55-d818-4548-86ea-3f60f2842809', '26f11784-e2dc-48bb-aec0-80ee582b49a0', '354f1d5f-054b-439b-9c72-1b989d0b2e7d', 'SE15015', 'Vu Thanh Giang', 'student15@fpt.edu.vn', 'Software Engineering', 8.57, 5, 'PENDING', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('354f1d5f-054b-439b-9c72-1b989d0b2e7d', 'SE15015', 'FPT University', 'Software Engineering', 7.5, '["Java"]', 'https://cv.com/cv.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status) VALUES
    ('cc7b722f-e13d-473c-bc06-2d8a49894cc5', 'a7cc62cb-1ee8-4b9c-b20d-cdbd29ea56a2', '354f1d5f-054b-439b-9c72-1b989d0b2e7d', 'cv.pdf', 'INTERVIEW_SCHEDULED');
INSERT INTO interviews (interview_id, application_id, scheduled_datetime, status, student_confirmed) VALUES
    ('5f3c2e88-8096-439c-8969-dc71aa8c5c85', 'cc7b722f-e13d-473c-bc06-2d8a49894cc5', '2026-07-30 10:00:00', 'SCHEDULED', FALSE);

-- ============================================================
-- STUDENTS 16-20 (SE15016-SE15020) — MATCHED (key fix from 008)
--
-- CRITICAL FIX from 008:
--   OLD (WRONG): status=MATCHED, is_locked=TRUE, has enterprise_assignments
--   NEW (CORRECT): status=MATCHED, is_locked=FALSE (haven't entered OJT yet)
--   is_locked=TRUE is ONLY set by trg_validate_ojt when MATCHED→OJT transition happens
--   enterprise_assignments should NOT exist yet (only created after MATCHED→OJT)
--
-- Correct flow:
--   1. PASS interview → application becomes ACCEPTED
--   2. Placement application APPROVED → status becomes MATCHED (is_locked=FALSE)
--   3. TM approves OJT → MATCHED→OJT → trg_validate_ojt sets is_locked=TRUE
--   4. Enterprise assignment created (now allowed because status=OJT)
--
-- student16 (SE15016) = Vo Thi Minh — matched with Momo
-- ============================================================

-- STUDENT 16 (SE15016) — MATCHED, no enterprise_assignment yet
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('f8577259-d7f4-4738-90db-5e3c6aefd84a', 'student16@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Vo Thi Minh', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('f8577259-d7f4-4738-90db-5e3c6aefd84a', 'STUDENT');
-- is_locked=FALSE (MATCHED hasn't transitioned to OJT yet)
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('6357a87b-0f70-4b2a-9163-f2c69047a94d', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'f8577259-d7f4-4738-90db-5e3c6aefd84a', 'SE15016', 'Vo Thi Minh', 'student16@fpt.edu.vn', 'Software Engineering', 9.7, 5, 'MATCHED', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('f8577259-d7f4-4738-90db-5e3c6aefd84a', 'SE15016', 'FPT University', 'Software Engineering', 7.5, '["Java"]', 'https://cv.com/cv.pdf');
-- Application ACCEPTED after PASS interview
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status) VALUES
    ('bfad22f8-cc63-4b06-9273-b016e5a5f4ec', 'a7cc62cb-1ee8-4b9c-b20d-cdbd29ea56a2', 'f8577259-d7f4-4738-90db-5e3c6aefd84a', 'cv.pdf', 'ACCEPTED');
-- Interview COMPLETED with PASS result (future date so result can be recorded)
INSERT INTO interviews (interview_id, application_id, scheduled_datetime, status, student_confirmed, result) VALUES
    ('127ce074-d940-48de-85d4-faffa10101bf', 'bfad22f8-cc63-4b06-9273-b016e5a5f4ec', '2026-07-15 10:00:00', 'COMPLETED', TRUE, 'PASS');
-- Placement application APPROVED (TM approved the match)
INSERT INTO placement_applications (application_id, student_id, enterprise_id, semester_id, status, cover_letter, reviewed_by, reviewed_at) VALUES
    ('baba0001-0001-0001-0001-000000000001', 'f8577259-d7f4-4738-90db-5e3c6aefd84a', '0264a1ce-a950-4eb1-9d71-75fe9b254d43', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'APPROVED', 'I am eager to join Momo as a backend developer intern.', '249b64b9-1ab8-4e92-bd30-2951e07f1def', CURRENT_TIMESTAMP);
-- NO enterprise_assignments yet — will be created when MATCHED→OJT transition happens

-- STUDENT 17 (SE15017) — MATCHED
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('afbfb57b-a5f4-4ca1-9d6a-b52e306b097b', 'student17@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Nguyen Minh Vinh', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('afbfb57b-a5f4-4ca1-9d6a-b52e306b097b', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('1c91dd9d-fec5-49b5-8108-3aa8a2d171b2', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'afbfb57b-a5f4-4ca1-9d6a-b52e306b097b', 'SE15017', 'Nguyen Minh Vinh', 'student17@fpt.edu.vn', 'Software Engineering', 7.54, 5, 'MATCHED', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('afbfb57b-a5f4-4ca1-9d6a-b52e306b097b', 'SE15017', 'FPT University', 'Software Engineering', 6.5, '["Java"]', 'https://cv.com/cv.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status) VALUES
    ('a39a2d59-b478-4dc4-bb38-ebfe0765090f', 'a7cc62cb-1ee8-4b9c-b20d-cdbd29ea56a2', 'afbfb57b-a5f4-4ca1-9d6a-b52e306b097b', 'cv.pdf', 'ACCEPTED');
INSERT INTO interviews (interview_id, application_id, scheduled_datetime, status, student_confirmed, result) VALUES
    ('d4edf8ee-abf2-4539-be79-6bf3fb81433c', 'a39a2d59-b478-4dc4-bb38-ebfe0765090f', '2026-07-15 14:00:00', 'COMPLETED', TRUE, 'PASS');
INSERT INTO placement_applications (application_id, student_id, enterprise_id, semester_id, status, cover_letter, reviewed_by, reviewed_at) VALUES
    ('baba0002-0002-0002-0002-000000000002', 'afbfb57b-a5f4-4ca1-9d6a-b52e306b097b', '0264a1ce-a950-4eb1-9d71-75fe9b254d43', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'APPROVED', 'I am excited to intern at Momo.', '249b64b9-1ab8-4e92-bd30-2951e07f1def', CURRENT_TIMESTAMP);

-- STUDENT 18 (SE15018) — MATCHED
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('477b7dea-6bb6-4515-bf47-6e40ad4e954e', 'student18@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Ly Tuyet Thanh', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('477b7dea-6bb6-4515-bf47-6e40ad4e954e', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('e30aa561-5b53-40e0-859d-e5c9768811d0', '26f11784-e2dc-48bb-aec0-80ee582b49a0', '477b7dea-6bb6-4515-bf47-6e40ad4e954e', 'SE15018', 'Ly Tuyet Thanh', 'student18@fpt.edu.vn', 'Software Engineering', 8.56, 5, 'MATCHED', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('477b7dea-6bb6-4515-bf47-6e40ad4e954e', 'SE15018', 'FPT University', 'Software Engineering', 6.5, '["Java"]', 'https://cv.com/cv.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status) VALUES
    ('2d71c3d0-ae30-4502-8bbd-b191f27cc72d', 'a7cc62cb-1ee8-4b9c-b20d-cdbd29ea56a2', '477b7dea-6bb6-4515-bf47-6e40ad4e954e', 'cv.pdf', 'ACCEPTED');
INSERT INTO interviews (interview_id, application_id, scheduled_datetime, status, student_confirmed, result) VALUES
    ('06e58ba6-16c8-4f00-8ceb-3588a2fe665d', '2d71c3d0-ae30-4502-8bbd-b191f27cc72d', '2026-07-16 09:00:00', 'COMPLETED', TRUE, 'PASS');
INSERT INTO placement_applications (application_id, student_id, enterprise_id, semester_id, status, cover_letter, reviewed_by, reviewed_at) VALUES
    ('baba0003-0003-0003-0003-000000000003', '477b7dea-6bb6-4515-bf47-6e40ad4e954e', '0264a1ce-a950-4eb1-9d71-75fe9b254d43', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'APPROVED', 'I want to learn from Momo team.', '249b64b9-1ab8-4e92-bd30-2951e07f1def', CURRENT_TIMESTAMP);

-- STUDENT 19 (SE15019) — MATCHED
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('c5fcf5f0-647a-426b-8477-02a53f14cd29', 'student19@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Ngo Ngoc Xuan', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('c5fcf5f0-647a-426b-8477-02a53f14cd29', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('4f30d736-2a8d-4487-aad7-dc477e2a44bf', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'c5fcf5f0-647a-426b-8477-02a53f14cd29', 'SE15019', 'Ngo Ngoc Xuan', 'student19@fpt.edu.vn', 'Software Engineering', 7.83, 5, 'MATCHED', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('c5fcf5f0-647a-426b-8477-02a53f14cd29', 'SE15019', 'FPT University', 'Software Engineering', 6.5, '["Java"]', 'https://cv.com/cv.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status) VALUES
    ('da85c815-64ca-4e02-a84c-a9900d0e4bec', 'a7cc62cb-1ee8-4b9c-b20d-cdbd29ea56a2', 'c5fcf5f0-647a-426b-8477-02a53f14cd29', 'cv.pdf', 'ACCEPTED');
INSERT INTO interviews (interview_id, application_id, scheduled_datetime, status, student_confirmed, result) VALUES
    ('24b1f843-4be7-4818-af60-e494e0af5da8', 'da85c815-64ca-4e02-a84c-a9900d0e4bec', '2026-07-16 14:00:00', 'COMPLETED', TRUE, 'PASS');
INSERT INTO placement_applications (application_id, student_id, enterprise_id, semester_id, status, cover_letter, reviewed_by, reviewed_at) VALUES
    ('baba0004-0004-0004-0004-000000000004', 'c5fcf5f0-647a-426b-8477-02a53f14cd29', '0264a1ce-a950-4eb1-9d71-75fe9b254d43', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'APPROVED', 'Excited to join Momo internship.', '249b64b9-1ab8-4e92-bd30-2951e07f1def', CURRENT_TIMESTAMP);

-- STUDENT 20 (SE15020) — MATCHED
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('4257fcb4-b199-485b-8606-27c5351df596', 'student20@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Huyh Minh Xuan', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('4257fcb4-b199-485b-8606-27c5351df596', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('3718a5a6-2e3e-4dd8-a0b1-f8833d3ce4ed', '26f11784-e2dc-48bb-aec0-80ee582b49a0', '4257fcb4-b199-485b-8606-27c5351df596', 'SE15020', 'Huyh Minh Xuan', 'student20@fpt.edu.vn', 'Software Engineering', 7.23, 5, 'MATCHED', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('4257fcb4-b199-485b-8606-27c5351df596', 'SE15020', 'FPT University', 'Software Engineering', 7.5, '["Java"]', 'https://cv.com/cv.pdf');
INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status) VALUES
    ('78e046b2-1ce9-440f-aea1-d88aa2b60408', 'a7cc62cb-1ee8-4b9c-b20d-cdbd29ea56a2', '4257fcb4-b199-485b-8606-27c5351df596', 'cv.pdf', 'ACCEPTED');
INSERT INTO interviews (interview_id, application_id, scheduled_datetime, status, student_confirmed, result) VALUES
    ('a1b6c187-8cdf-4288-b954-5a375853b00a', '78e046b2-1ce9-440f-aea1-d88aa2b60408', '2026-07-17 10:00:00', 'COMPLETED', TRUE, 'PASS');
INSERT INTO placement_applications (application_id, student_id, enterprise_id, semester_id, status, cover_letter, reviewed_by, reviewed_at) VALUES
    ('baba0005-0005-0005-0005-000000000005', '4257fcb4-b199-485b-8606-27c5351df596', '0264a1ce-a950-4eb1-9d71-75fe9b254d43', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'APPROVED', 'I am ready for Momo internship.', '249b64b9-1ab8-4e92-bd30-2951e07f1def', CURRENT_TIMESTAMP);

-- ============================================================
-- STUDENTS 21-25 (SE15021-SE15025) — SEMESTER 6, OJT ACTIVE
--
-- CRITICAL: These students have status=OJT and is_locked=TRUE
-- Only OJT students can have enterprise_assignments (trg_validate_ea_student_status)
-- They have weekly reports, internship plans, and enterprise evaluations
-- ============================================================

-- STUDENT 21 (SE15021) — Semester 6, OJT, ACTIVE assignment, with evaluation
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d260f84d-6e1a-47f6-ba0a-7ed86dd39d83', 'student21@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Vu Huu Quan', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d260f84d-6e1a-47f6-ba0a-7ed86dd39d83', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked, approved_at) VALUES
    ('bafeafe7-fb11-4caf-86c1-4b62af598e22', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'd260f84d-6e1a-47f6-ba0a-7ed86dd39d83', 'SE15021', 'Vu Huu Quan', 'student21@fpt.edu.vn', 'Software Engineering', 8.06, 6, 'OJT', TRUE, CURRENT_TIMESTAMP);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d260f84d-6e1a-47f6-ba0a-7ed86dd39d83', 'SE15021', 'FPT University', 'Software Engineering', 7.5, '["Java"]', 'https://cv.com/cv.pdf');
INSERT INTO enterprise_assignments (assignment_id, enterprise_id, student_id, semester_id, supervisor_name, supervisor_email, assigned_by, status, start_date) VALUES
    ('77c0715f-58a7-4bcd-9052-513023700eea', '0264a1ce-a950-4eb1-9d71-75fe9b254d43', 'd260f84d-6e1a-47f6-ba0a-7ed86dd39d83', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'Sup Momo', 'sup@momo.vn', '249b64b9-1ab8-4e92-bd30-2951e07f1def', 'ACTIVE', '2026-03-15');
INSERT INTO internship_plans (plan_id, assignment_id) VALUES
    ('50524b95-3d4b-4169-8dc1-e372ed8b435e', '77c0715f-58a7-4bcd-9052-513023700eea');
-- Weekly reports within semester (2026-03-01 to 2026-07-31)
INSERT INTO internship_plan_items (plan_item_id, plan_id, week_number, task_description, target_date, status) VALUES
    ('0d143749-7e8a-4f2b-99e6-85c2279009df', '50524b95-3d4b-4169-8dc1-e372ed8b435e', 1, 'Orientation & setup development environment', '2026-03-15', 'COMPLETED');
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, issues_challenges, lessons_learned, plan_next_week, status, submitted_at) VALUES
    ('bde5fc60-7964-4466-b6ea-5c76783c5507', '77c0715f-58a7-4bcd-9052-513023700eea', 1, 'Setup dev environment, understand codebase', 'Minor issues with API integration', 'Learned Spring Boot basics', 'Start with user module', 'APPROVED', '2026-03-21');
INSERT INTO internship_plan_items (plan_item_id, plan_id, week_number, task_description, target_date, status) VALUES
    ('44e01ddc-7e6e-415b-baa1-625fdfac8b33', '50524b95-3d4b-4169-8dc1-e372ed8b435e', 2, 'Implement user authentication module', '2026-03-22', 'COMPLETED');
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, issues_challenges, lessons_learned, plan_next_week, status, submitted_at) VALUES
    ('d91c4b40-378b-448f-abae-3e891182f67d', '77c0715f-58a7-4bcd-9052-513023700eea', 2, 'Implemented JWT authentication', 'Need to improve error handling', 'Learned about JWT security', 'Work on API documentation', 'APPROVED', '2026-03-28');
INSERT INTO internship_plan_items (plan_item_id, plan_id, week_number, task_description, target_date, status) VALUES
    ('55e12abc-8d9f-4c3e-be12-73f6e9c0d844', '50524b95-3d4b-4169-8dc1-e372ed8b435e', 3, 'Develop REST API endpoints', '2026-03-29', 'IN_PROGRESS');
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, issues_challenges, lessons_learned, plan_next_week, status, submitted_at) VALUES
    ('e12d5a67-9a3f-4b1e-c8f2-48b3d0e1a956', '77c0715f-58a7-4bcd-9052-513023700eea', 3, 'Built 5 REST API endpoints', 'Working on validation', 'Learned REST best practices', 'Add unit tests', 'SUBMITTED', '2026-04-04');
-- Enterprise evaluation (only for completed OJT - shown here for demo)
INSERT INTO enterprise_evaluations (evaluation_id, assignment_id, attitude_score, professionalism_score, soft_skills_score, progress_score, overall_comments, is_locked, submitted_at) VALUES
    ('baba00e1-0001-0001-0001-000000000001', '77c0715f-58a7-4bcd-9052-513023700eea', 8.50, 9.00, 8.00, 8.50, 'Excellent intern, proactive and quick learner.', TRUE, CURRENT_TIMESTAMP);

-- STUDENT 22 (SE15022) — Semester 6, OJT, ACTIVE, with evaluation
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('6837bca2-aaa9-4e62-b39f-6910fea6c344', 'student22@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Ho Gia Quan', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('6837bca2-aaa9-4e62-b39f-6910fea6c344', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked, approved_at) VALUES
    ('735bdf16-6e0e-48fd-b367-a2b53a552f64', '26f11784-e2dc-48bb-aec0-80ee582b49a0', '6837bca2-aaa9-4e62-b39f-6910fea6c344', 'SE15022', 'Ho Gia Quan', 'student22@fpt.edu.vn', 'Software Engineering', 9.66, 6, 'OJT', TRUE, CURRENT_TIMESTAMP);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('6837bca2-aaa9-4e62-b39f-6910fea6c344', 'SE15022', 'FPT University', 'Software Engineering', 7.5, '["Java"]', 'https://cv.com/cv.pdf');
INSERT INTO enterprise_assignments (assignment_id, enterprise_id, student_id, semester_id, supervisor_name, supervisor_email, assigned_by, status, start_date) VALUES
    ('3b05ca37-25ae-43f1-9075-10ffd2a0cbd7', '0264a1ce-a950-4eb1-9d71-75fe9b254d43', '6837bca2-aaa9-4e62-b39f-6910fea6c344', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'Sup Momo', 'sup@momo.vn', '249b64b9-1ab8-4e92-bd30-2951e07f1def', 'ACTIVE', '2026-03-15');
INSERT INTO internship_plans (plan_id, assignment_id) VALUES
    ('bbe277b9-32df-45a5-8213-81cf18e7915c', '3b05ca37-25ae-43f1-9075-10ffd2a0cbd7');
INSERT INTO internship_plan_items (plan_item_id, plan_id, week_number, task_description, target_date, status) VALUES
    ('d4b60db5-cffc-48d3-bad0-ceada22d3f49', 'bbe277b9-32df-45a5-8213-81cf18e7915c', 1, 'Project kickoff and team onboarding', '2026-03-15', 'COMPLETED');
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, status, submitted_at) VALUES
    ('6652175f-7c3e-4c27-a63e-8ae7a63049de', '3b05ca37-25ae-43f1-9075-10ffd2a0cbd7', 1, 'Completed onboarding tasks', 'APPROVED', '2026-03-21');
INSERT INTO internship_plan_items (plan_item_id, plan_id, week_number, task_description, target_date, status) VALUES
    ('fd23d47d-84d8-40e7-8d72-d4dbb3ee597e', 'bbe277b9-32df-45a5-8213-81cf18e7915c', 2, 'Database design and implementation', '2026-03-22', 'COMPLETED');
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, status, submitted_at) VALUES
    ('73928f33-7243-43e4-9d8e-a62278875216', '3b05ca37-25ae-43f1-9075-10ffd2a0cbd7', 2, 'Designed database schema', 'APPROVED', '2026-03-28');
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, status, submitted_at) VALUES
    ('fa8c34b1-3a2d-4e5f-9a1b-6c8d0e9f1234', '3b05ca37-25ae-43f1-9075-10ffd2a0cbd7', 3, 'Implemented backend APIs', 'SUBMITTED', '2026-04-04');
INSERT INTO enterprise_evaluations (evaluation_id, assignment_id, attitude_score, professionalism_score, soft_skills_score, progress_score, overall_comments, is_locked, submitted_at) VALUES
    ('baba00e2-0002-0002-0002-000000000002', '3b05ca37-25ae-43f1-9075-10ffd2a0cbd7', 9.00, 9.50, 9.00, 9.00, 'Outstanding performance, highly recommended.', TRUE, CURRENT_TIMESTAMP);

-- STUDENT 23 (SE15023) — Semester 6, OJT, ACTIVE
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('112e4cf7-a17b-4095-a36b-53a4e1f47caa', 'student23@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Vu Duc Uyen', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('112e4cf7-a17b-4095-a36b-53a4e1f47caa', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked, approved_at) VALUES
    ('a923f995-b144-4654-b0bf-d77b3d1a0ff1', '26f11784-e2dc-48bb-aec0-80ee582b49a0', '112e4cf7-a17b-4095-a36b-53a4e1f47caa', 'SE15023', 'Vu Duc Uyen', 'student23@fpt.edu.vn', 'Software Engineering', 9.17, 6, 'OJT', TRUE, CURRENT_TIMESTAMP);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('112e4cf7-a17b-4095-a36b-53a4e1f47caa', 'SE15023', 'FPT University', 'Software Engineering', 7.5, '["Java"]', 'https://cv.com/cv.pdf');
INSERT INTO enterprise_assignments (assignment_id, enterprise_id, student_id, semester_id, supervisor_name, supervisor_email, assigned_by, status, start_date) VALUES
    ('0bb2b684-cc20-420d-99d2-58e05aa0d63e', '0264a1ce-a950-4eb1-9d71-75fe9b254d43', '112e4cf7-a17b-4095-a36b-53a4e1f47caa', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'Sup Momo', 'sup@momo.vn', '249b64b9-1ab8-4e92-bd30-2951e07f1def', 'ACTIVE', '2026-03-15');
INSERT INTO internship_plans (plan_id, assignment_id) VALUES
    ('7a71366e-1412-4f94-9103-75267bdd82f8', '0bb2b684-cc20-420d-99d2-58e05aa0d63e');
INSERT INTO internship_plan_items (plan_item_id, plan_id, week_number, task_description, target_date, status) VALUES
    ('43322f1b-0db8-42f4-9227-f1d16008d1d9', '7a71366e-1412-4f94-9103-75267bdd82f8', 1, 'Training on company tech stack', '2026-03-15', 'COMPLETED');
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, status, submitted_at) VALUES
    ('04f6762f-5a83-42e7-9b2a-108c8ef374ee', '0bb2b684-cc20-420d-99d2-58e05aa0d63e', 1, 'Completed tech stack training', 'APPROVED', '2026-03-21');
INSERT INTO internship_plan_items (plan_item_id, plan_id, week_number, task_description, target_date, status) VALUES
    ('4e7e7d1a-8420-460f-9452-80ef2ed4437d', '7a71366e-1412-4f94-9103-75267bdd82f8', 2, 'Start working on assigned features', '2026-03-22', 'COMPLETED');
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, status, submitted_at) VALUES
    ('52e32c89-09cb-44ff-ba93-0f5f43ca51f4', '0bb2b684-cc20-420d-99d2-58e05aa0d63e', 2, 'Started feature development', 'APPROVED', '2026-03-28');
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, status, submitted_at) VALUES
    ('ab3d45f2-1a2c-4d3e-5f6a-7b8c9d0e1f234', '0bb2b684-cc20-420d-99d2-58e05aa0d63e', 3, 'Feature implementation ongoing', 'SUBMITTED', '2026-04-04');

-- STUDENT 24 (SE15024) — Semester 6, OJT, ACTIVE
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('a549dd40-258a-4a58-a928-af7df8a288af', 'student24@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Huyh Huu Yen', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('a549dd40-258a-4a58-a928-af7df8a288af', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked, approved_at) VALUES
    ('ab2da4bb-4c44-47f2-8780-d715661f65d7', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'a549dd40-258a-4a58-a928-af7df8a288af', 'SE15024', 'Huyh Huu Yen', 'student24@fpt.edu.vn', 'Software Engineering', 7.91, 6, 'OJT', TRUE, CURRENT_TIMESTAMP);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('a549dd40-258a-4a58-a928-af7df8a288af', 'SE15024', 'FPT University', 'Software Engineering', 7.5, '["Java"]', 'https://cv.com/cv.pdf');
INSERT INTO enterprise_assignments (assignment_id, enterprise_id, student_id, semester_id, supervisor_name, supervisor_email, assigned_by, status, start_date) VALUES
    ('377e3f44-c778-460f-bfec-4cf100c3206d', '0264a1ce-a950-4eb1-9d71-75fe9b254d43', 'a549dd40-258a-4a58-a928-af7df8a288af', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'Sup Momo', 'sup@momo.vn', '249b64b9-1ab8-4e92-bd30-2951e07f1def', 'ACTIVE', '2026-03-15');
INSERT INTO internship_plans (plan_id, assignment_id) VALUES
    ('c81dff24-f95f-4c42-b9de-b8786d3e84e4', '377e3f44-c778-460f-bfec-4cf100c3206d');
INSERT INTO internship_plan_items (plan_item_id, plan_id, week_number, task_description, target_date, status) VALUES
    ('0784029b-43e0-48f9-8ed2-5bf97810ae3c', 'c81dff24-f95f-4c42-b9de-b8786d3e84e4', 1, 'Code review and documentation', '2026-03-15', 'COMPLETED');
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, status, submitted_at) VALUES
    ('c74312e0-2f7b-4958-a038-485c0f940a29', '377e3f44-c778-460f-bfec-4cf100c3206d', 1, 'Code review and docs', 'APPROVED', '2026-03-21');
INSERT INTO internship_plan_items (plan_item_id, plan_id, week_number, task_description, target_date, status) VALUES
    ('9093ebe6-9acd-464f-855d-5e8918346f03', 'c81dff24-f95f-4c42-b9de-b8786d3e84e4', 2, 'Work on bug fixes', '2026-03-22', 'COMPLETED');
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, status, submitted_at) VALUES
    ('bc2d7e4a-3de7-4035-bf4b-a5c1f2e3a08d', '377e3f44-c778-460f-bfec-4cf100c3206d', 2, 'Fixed 3 critical bugs', 'APPROVED', '2026-03-28');
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, status, submitted_at) VALUES
    ('cd4e56a3-2b3f-4a5e-6d7f-8a9b0c1d2e345', '377e3f44-c778-460f-bfec-4cf100c3206d', 3, 'Feature development in progress', 'SUBMITTED', '2026-04-04');

-- STUDENT 25 (SE15025) — Semester 6, OJT, ACTIVE
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('51177997-bbfc-4a67-9e87-8627fe6f2434', 'student25@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Vu Thanh Son', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('51177997-bbfc-4a67-9e87-8627fe6f2434', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked, approved_at) VALUES
    ('c37e9a5e-bea0-40dc-b906-8d74eb4d73c5', '26f11784-e2dc-48bb-aec0-80ee582b49a0', '51177997-bbfc-4a67-9e87-8627fe6f2434', 'SE15025', 'Vu Thanh Son', 'student25@fpt.edu.vn', 'Software Engineering', 6.91, 6, 'OJT', TRUE, CURRENT_TIMESTAMP);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('51177997-bbfc-4a67-9e87-8627fe6f2434', 'SE15025', 'FPT University', 'Software Engineering', 8.5, '["Java"]', 'https://cv.com/cv.pdf');
INSERT INTO enterprise_assignments (assignment_id, enterprise_id, student_id, semester_id, supervisor_name, supervisor_email, assigned_by, status, start_date) VALUES
    ('c4e7f455-4a3c-4a91-9708-1e22ff1d64c2', '0264a1ce-a950-4eb1-9d71-75fe9b254d43', '51177997-bbfc-4a67-9e87-8627fe6f2434', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'Sup Momo', 'sup@momo.vn', '249b64b9-1ab8-4e92-bd30-2951e07f1def', 'ACTIVE', '2026-03-15');
INSERT INTO internship_plans (plan_id, assignment_id) VALUES
    ('53511b38-9f95-4455-af7f-996822c9f322', 'c4e7f455-4a3c-4a91-9708-1e22ff1d64c2');
INSERT INTO internship_plan_items (plan_item_id, plan_id, week_number, task_description, target_date, status) VALUES
    ('e080e546-c6a4-45ee-8760-1bb8d3b4a6fb', '53511b38-9f95-4455-af7f-996822c9f322', 1, 'System setup and training', '2026-03-15', 'COMPLETED');
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, status, submitted_at) VALUES
    ('6ece9685-24c6-47eb-9d15-4a79637a431a', 'c4e7f455-4a3c-4a91-9708-1e22ff1d64c2', 1, 'System setup completed', 'APPROVED', '2026-03-21');
INSERT INTO internship_plan_items (plan_item_id, plan_id, week_number, task_description, target_date, status) VALUES
    ('769c0ed6-a8ce-479b-837f-233f5bbd92b7', '53511b38-9f95-4455-af7f-996822c9f322', 2, 'Start feature implementation', '2026-03-22', 'COMPLETED');
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, status, submitted_at) VALUES
    ('47dd997c-de56-464f-84bb-9b383d8ad993', 'c4e7f455-4a3c-4a91-9708-1e22ff1d64c2', 2, 'Feature implementation started', 'APPROVED', '2026-03-28');
INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, status, submitted_at) VALUES
    ('de5f67b4-3c4a-5b6d-7e8f-9a0b1c2d3e456', 'c4e7f455-4a3c-4a91-9708-1e22ff1d64c2', 3, 'Feature implementation ongoing', 'SUBMITTED', '2026-04-04');

-- ============================================================
-- STUDENTS 26-30 (SE15026-SE15030) — SEMESTER 7, OJT COMPLETED
--
-- CRITICAL: assignment status = COMPLETED
-- Has final_reports, enterprise_evaluations, final_grades
-- student_enterprise_feedbacks only for semesters 7-9 (BR-54)
-- ============================================================

-- STUDENT 26 (SE15026) — Semester 7, OJT COMPLETED
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('50203323-58da-4ce0-9a53-9b15928b5b8f', 'student26@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Do Thi Thanh', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('50203323-58da-4ce0-9a53-9b15928b5b8f', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked, approved_at) VALUES
    ('77bd0222-add8-4191-8347-46112e5015e5', '26f11784-e2dc-48bb-aec0-80ee582b49a0', '50203323-58da-4ce0-9a53-9b15928b5b8f', 'SE15026', 'Do Thi Thanh', 'student26@fpt.edu.vn', 'Software Engineering', 8.56, 7, 'OJT', TRUE, CURRENT_TIMESTAMP);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('50203323-58da-4ce0-9a53-9b15928b5b8f', 'SE15026', 'FPT University', 'Software Engineering', 5.5, '["Java"]', 'https://cv.com/cv.pdf');
INSERT INTO enterprise_assignments (assignment_id, enterprise_id, student_id, semester_id, supervisor_name, supervisor_email, assigned_by, status, start_date, end_date) VALUES
    ('14f4e28c-1f74-42e1-ad47-e6d9b0753de7', '0264a1ce-a950-4eb1-9d71-75fe9b254d43', '50203323-58da-4ce0-9a53-9b15928b5b8f', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'Sup Momo', 'sup@momo.vn', '249b64b9-1ab8-4e92-bd30-2951e07f1def', 'COMPLETED', '2026-03-01', '2026-07-15');
INSERT INTO final_reports (final_report_id, assignment_id, file_url, file_size_bytes, submitted_at, is_late) VALUES
    ('a66b42dc-4329-41a2-a14d-5b9c66dd6dd4', '14f4e28c-1f74-42e1-ad47-e6d9b0753de7', 'final_se26.pdf', 1048576, '2026-07-15 23:00:00', FALSE);
INSERT INTO enterprise_evaluations (evaluation_id, assignment_id, attitude_score, professionalism_score, soft_skills_score, progress_score, overall_comments, is_locked, submitted_at) VALUES
    ('baba00e3-0003-0003-0003-000000000003', '14f4e28c-1f74-42e1-ad47-e6d9b0753de7', 8.00, 8.50, 8.00, 8.50, 'Good intern, consistent performance.', TRUE, '2026-07-16 10:00:00');
INSERT INTO final_grades (grade_id, student_id, tm_id, semester_id, enterprise_total_score, final_grade, overall_status, is_locked, graded_at) VALUES
    ('baba00g1-0001-0001-0001-000000000001', '50203323-58da-4ce0-9a53-9b15928b5b8f', '249b64b9-1ab8-4e92-bd30-2951e07f1def', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 8.36, 8.4, 'PASSED', TRUE, '2026-07-20 14:00:00');
INSERT INTO student_enterprise_feedbacks (feedback_id, student_id, enterprise_id, semester_id, training_quality_score, supervisor_support_score, work_environment_score, overall_score, positive_feedback, improvement_feedback, submitted_at) VALUES
    ('baba00f1-0001-0001-0001-000000000001', '50203323-58da-4ce0-9a53-9b15928b5b8f', '0264a1ce-a950-4eb1-9d71-75fe9b254d43', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 5, 4, 5, 5, 'Great mentorship and learning environment.', 'Could improve on feedback turnaround time.', '2026-07-18 09:00:00');

-- STUDENT 27 (SE15027) — Semester 7, OJT COMPLETED
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d5981706-5aa5-4cff-8ebb-b7b26572a9bf', 'student27@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Nguyen Thanh Duc', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d5981706-5aa5-4cff-8ebb-b7b26572a9bf', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked, approved_at) VALUES
    ('c3f9489f-31a1-4f9c-9673-ef4c7573ed98', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'd5981706-5aa5-4cff-8ebb-b7b26572a9bf', 'SE15027', 'Nguyen Thanh Duc', 'student27@fpt.edu.vn', 'Software Engineering', 7.56, 7, 'OJT', TRUE, CURRENT_TIMESTAMP);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d5981706-5aa5-4cff-8ebb-b7b26572a9bf', 'SE15027', 'FPT University', 'Software Engineering', 5.5, '["Java"]', 'https://cv.com/cv.pdf');
INSERT INTO enterprise_assignments (assignment_id, enterprise_id, student_id, semester_id, supervisor_name, supervisor_email, assigned_by, status, start_date, end_date) VALUES
    ('b72de7c7-d879-45d7-9b3f-d17fcf78ff35', '0264a1ce-a950-4eb1-9d71-75fe9b254d43', 'd5981706-5aa5-4cff-8ebb-b7b26572a9bf', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'Sup Momo', 'sup@momo.vn', '249b64b9-1ab8-4e92-bd30-2951e07f1def', 'COMPLETED', '2026-03-01', '2026-07-15');
INSERT INTO final_reports (final_report_id, assignment_id, file_url, file_size_bytes, submitted_at, is_late) VALUES
    ('7b508d56-8266-4c09-80b8-d4ce4854b260', 'b72de7c7-d879-45d7-9b3f-d17fcf78ff35', 'final_se27.pdf', 1048576, '2026-07-15 22:30:00', FALSE);
INSERT INTO enterprise_evaluations (evaluation_id, assignment_id, attitude_score, professionalism_score, soft_skills_score, progress_score, overall_comments, is_locked, submitted_at) VALUES
    ('baba00e4-0004-0004-0004-000000000004', 'b72de7c7-d879-45d7-9b3f-d17fcf78ff35', 7.50, 8.00, 7.50, 8.00, 'Solid performer, good team collaboration.', TRUE, '2026-07-16 11:00:00');
INSERT INTO final_grades (grade_id, student_id, tm_id, semester_id, enterprise_total_score, final_grade, overall_status, is_locked, graded_at) VALUES
    ('baba00g2-0002-0002-0002-000000000002', 'd5981706-5aa5-4cff-8ebb-b7b26572a9bf', '249b64b9-1ab8-4e92-bd30-2951e07f1def', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 7.85, 7.9, 'PASSED', TRUE, '2026-07-20 15:00:00');
INSERT INTO student_enterprise_feedbacks (feedback_id, student_id, enterprise_id, semester_id, training_quality_score, supervisor_support_score, work_environment_score, overall_score, positive_feedback, improvement_feedback, submitted_at) VALUES
    ('baba00f2-0002-0002-0002-000000000002', 'd5981706-5aa5-4cff-8ebb-b7b26572a9bf', '0264a1ce-a950-4eb1-9d71-75fe9b254d43', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 4, 5, 4, 4, 'Good learning experience with supportive team.', 'More structured training curriculum.', '2026-07-18 10:00:00');

-- STUDENT 28 (SE15028) — Semester 7, OJT COMPLETED (excellent student)
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('9f36b39b-3d25-4cd7-afca-dc86811b33ed', 'student28@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Ho Tuyet Linh', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('9f36b39b-3d25-4cd7-afca-dc86811b33ed', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked, approved_at) VALUES
    ('ede4d469-87d9-4335-ad2a-d24b6e4ea7c1', '26f11784-e2dc-48bb-aec0-80ee582b49a0', '9f36b39b-3d25-4cd7-afca-dc86811b33ed', 'SE15028', 'Ho Tuyet Linh', 'student28@fpt.edu.vn', 'Software Engineering', 8.83, 7, 'OJT', TRUE, CURRENT_TIMESTAMP);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('9f36b39b-3d25-4cd7-afca-dc86811b33ed', 'SE15028', 'FPT University', 'Software Engineering', 5.5, '["Java"]', 'https://cv.com/cv.pdf');
INSERT INTO enterprise_assignments (assignment_id, enterprise_id, student_id, semester_id, supervisor_name, supervisor_email, assigned_by, status, start_date, end_date) VALUES
    ('cb3993f9-5074-4ebd-9293-6bb89c08a5e7', '0264a1ce-a950-4eb1-9d71-75fe9b254d43', '9f36b39b-3d25-4cd7-afca-dc86811b33ed', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'Sup Momo', 'sup@momo.vn', '249b64b9-1ab8-4e92-bd30-2951e07f1def', 'COMPLETED', '2026-03-01', '2026-07-15');
INSERT INTO final_reports (final_report_id, assignment_id, file_url, file_size_bytes, submitted_at, is_late) VALUES
    ('c217157f-5aba-482b-91d3-abef16ee1a78', 'cb3993f9-5074-4ebd-9293-6bb89c08a5e7', 'final_se28.pdf', 1048576, '2026-07-14 20:00:00', FALSE);
INSERT INTO enterprise_evaluations (evaluation_id, assignment_id, attitude_score, professionalism_score, soft_skills_score, progress_score, overall_comments, is_locked, submitted_at) VALUES
    ('baba00e5-0005-0005-0005-000000000005', 'cb3993f9-5074-4ebd-9293-6bb89c08a5e7', 9.50, 9.50, 9.00, 9.50, 'Exceptional intern, exceeded all expectations. Highly recommended for hire.', TRUE, '2026-07-16 09:00:00');
INSERT INTO final_grades (grade_id, student_id, tm_id, semester_id, enterprise_total_score, final_grade, overall_status, is_locked, graded_at) VALUES
    ('baba00g3-0003-0003-0003-000000000003', '9f36b39b-3d25-4cd7-afca-dc86811b33ed', '249b64b9-1ab8-4e92-bd30-2951e07f1def', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 9.40, 9.4, 'PASSED', TRUE, '2026-07-20 16:00:00');
INSERT INTO student_enterprise_feedbacks (feedback_id, student_id, enterprise_id, semester_id, training_quality_score, supervisor_support_score, work_environment_score, overall_score, positive_feedback, improvement_feedback, submitted_at) VALUES
    ('baba00f3-0003-0003-0003-000000000003', '9f36b39b-3d25-4cd7-afca-dc86811b33ed', '0264a1ce-a950-4eb1-9d71-75fe9b254d43', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 5, 5, 5, 5, 'Excellent internship program with great mentorship.', 'Everything was well organized.', '2026-07-18 11:00:00');

-- STUDENT 29 (SE15029) — Semester 7, OJT COMPLETED
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('4b029a3a-0986-4a43-8a81-218da9e61a2f', 'student29@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Ngo Thanh Phong', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('4b029a3a-0986-4a43-8a81-218da9e61a2f', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked, approved_at) VALUES
    ('7f29a2c9-55cf-4824-9273-89169ca3592f', '26f11784-e2dc-48bb-aec0-80ee582b49a0', '4b029a3a-0986-4a43-8a81-218da9e61a2f', 'SE15029', 'Ngo Thanh Phong', 'student29@fpt.edu.vn', 'Software Engineering', 6.61, 7, 'OJT', TRUE, CURRENT_TIMESTAMP);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('4b029a3a-0986-4a43-8a81-218da9e61a2f', 'SE15029', 'FPT University', 'Software Engineering', 6.5, '["Java"]', 'https://cv.com/cv.pdf');
INSERT INTO enterprise_assignments (assignment_id, enterprise_id, student_id, semester_id, supervisor_name, supervisor_email, assigned_by, status, start_date, end_date) VALUES
    ('69bc459c-9593-4bbd-a38c-df99f8b3059f', '0264a1ce-a950-4eb1-9d71-75fe9b254d43', '4b029a3a-0986-4a43-8a81-218da9e61a2f', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'Sup Momo', 'sup@momo.vn', '249b64b9-1ab8-4e92-bd30-2951e07f1def', 'COMPLETED', '2026-03-01', '2026-07-15');
INSERT INTO final_reports (final_report_id, assignment_id, file_url, file_size_bytes, submitted_at, is_late) VALUES
    ('d35043ac-7868-46a5-8963-a54091eb131e', '69bc459c-9593-4bbd-a38c-df99f8b3059f', 'final_se29.pdf', 1048576, '2026-07-15 21:00:00', FALSE);
INSERT INTO enterprise_evaluations (evaluation_id, assignment_id, attitude_score, professionalism_score, soft_skills_score, progress_score, overall_comments, is_locked, submitted_at) VALUES
    ('baba00e6-0006-0006-0006-000000000006', '69bc459c-9593-4bbd-a38c-df99f8b3059f', 7.00, 7.50, 7.00, 7.50, 'Met expectations, some areas for improvement.', TRUE, '2026-07-16 12:00:00');
INSERT INTO final_grades (grade_id, student_id, tm_id, semester_id, enterprise_total_score, final_grade, overall_status, is_locked, graded_at) VALUES
    ('baba00g4-0004-0004-0004-000000000004', '4b029a3a-0986-4a43-8a81-218da9e61a2f', '249b64b9-1ab8-4e92-bd30-2951e07f1def', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 7.40, 7.4, 'PASSED', TRUE, '2026-07-20 17:00:00');
INSERT INTO student_enterprise_feedbacks (feedback_id, student_id, enterprise_id, semester_id, training_quality_score, supervisor_support_score, work_environment_score, overall_score, positive_feedback, improvement_feedback, submitted_at) VALUES
    ('baba00f4-0004-0004-0004-000000000004', '4b029a3a-0986-4a43-8a81-218da9e61a2f', '0264a1ce-a950-4eb1-9d71-75fe9b254d43', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 4, 4, 3, 4, 'Good experience overall, learned a lot.', 'More regular feedback sessions needed.', '2026-07-18 12:00:00');

-- STUDENT 30 (SE15030) — Semester 7, OJT COMPLETED
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('b899c952-17bc-4757-9fb5-193be918644d', 'student30@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Vu Duc Yen', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('b899c952-17bc-4757-9fb5-193be918644d', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked, approved_at) VALUES
    ('2aa0b930-a2a2-4e05-a94b-e79f4a726a9a', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'b899c952-17bc-4757-9fb5-193be918644d', 'SE15030', 'Vu Duc Yen', 'student30@fpt.edu.vn', 'Software Engineering', 7.89, 7, 'OJT', TRUE, CURRENT_TIMESTAMP);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('b899c952-17bc-4757-9fb5-193be918644d', 'SE15030', 'FPT University', 'Software Engineering', 6.5, '["Java"]', 'https://cv.com/cv.pdf');
INSERT INTO enterprise_assignments (assignment_id, enterprise_id, student_id, semester_id, supervisor_name, supervisor_email, assigned_by, status, start_date, end_date) VALUES
    ('4e75220f-dd96-477b-b310-a0a528955414', '0264a1ce-a950-4eb1-9d71-75fe9b254d43', 'b899c952-17bc-4757-9fb5-193be918644d', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'Sup Momo', 'sup@momo.vn', '249b64b9-1ab8-4e92-bd30-2951e07f1def', 'COMPLETED', '2026-03-01', '2026-07-15');
INSERT INTO final_reports (final_report_id, assignment_id, file_url, file_size_bytes, submitted_at, is_late) VALUES
    ('84ec61c9-dc97-4822-86f4-6d6a2496547d', '4e75220f-dd96-477b-b310-a0a528955414', 'final_se30.pdf', 1048576, '2026-07-15 20:00:00', FALSE);
INSERT INTO enterprise_evaluations (evaluation_id, assignment_id, attitude_score, professionalism_score, soft_skills_score, progress_score, overall_comments, is_locked, submitted_at) VALUES
    ('baba00e7-0007-0007-0007-000000000007', '4e75220f-dd96-477b-b310-a0a528955414', 8.00, 8.50, 8.00, 8.00, 'Reliable and consistent performer.', TRUE, '2026-07-16 13:00:00');
INSERT INTO final_grades (grade_id, student_id, tm_id, semester_id, enterprise_total_score, final_grade, overall_status, is_locked, graded_at) VALUES
    ('baba00g5-0005-0005-0005-000000000005', 'b899c952-17bc-4757-9fb5-193be918644d', '249b64b9-1ab8-4e92-bd30-2951e07f1def', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 8.20, 8.2, 'PASSED', TRUE, '2026-07-20 18:00:00');
INSERT INTO student_enterprise_feedbacks (feedback_id, student_id, enterprise_id, semester_id, training_quality_score, supervisor_support_score, work_environment_score, overall_score, positive_feedback, improvement_feedback, submitted_at) VALUES
    ('baba00f5-0005-0005-0005-000000000005', 'b899c952-17bc-4757-9fb5-193be918644d', '0264a1ce-a950-4eb1-9d71-75fe9b254d43', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 4, 5, 4, 4, 'Good project exposure and mentorship.', 'Could improve onboarding process.', '2026-07-18 13:00:00');

-- ============================================================
-- STUDENTS 31-35: SEMESTER 8-9 (ELIGIBLE, cannot apply or do OJT)
-- BR-54: Only semester 5-6 can apply; semesters 7-9 can give feedback
-- ============================================================

-- STUDENT 31 (SE15031) — Semester 8, ELIGIBLE (future OJT, not yet)
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('d8f306b1-f810-4b2b-a4b5-20f000cb8931', 'student31@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Duong Minh Khanh', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('d8f306b1-f810-4b2b-a4b5-20f000cb8931', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('ffa543cd-91c2-401e-b326-ca744b7320ac', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'd8f306b1-f810-4b2b-a4b5-20f000cb8931', 'SE15031', 'Duong Minh Khanh', 'student31@fpt.edu.vn', 'Software Engineering', 8.17, 8, 'ELIGIBLE', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('d8f306b1-f810-4b2b-a4b5-20f000cb8931', 'SE15031', 'FPT University', 'Software Engineering', 6.5, '["Java"]', 'https://cv.com/cv.pdf');

-- STUDENT 32 (SE15032) — Semester 9, ELIGIBLE
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('4f4959ea-66d8-45a6-af5e-4b02a859dec1', 'student32@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Do Xuan Quan', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('4f4959ea-66d8-45a6-af5e-4b02a859dec1', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('6a509e41-017d-4733-ab9f-5415658e4841', '26f11784-e2dc-48bb-aec0-80ee582b49a0', '4f4959ea-66d8-45a6-af5e-4b02a859dec1', 'SE15032', 'Do Xuan Quan', 'student32@fpt.edu.vn', 'Software Engineering', 9.22, 9, 'ELIGIBLE', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('4f4959ea-66d8-45a6-af5e-4b02a859dec1', 'SE15032', 'FPT University', 'Software Engineering', 6.5, '["Java"]', 'https://cv.com/cv.pdf');

-- STUDENT 33 (SE15033) — Semester 1, ELIGIBLE
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('66a213b6-b24f-49b1-82a0-14f236f74048', 'student33@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Vo Huu Yen', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('66a213b6-b24f-49b1-82a0-14f236f74048', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('92d50ed1-87b8-4d8a-bb3f-03fe2d2c0b91', '26f11784-e2dc-48bb-aec0-80ee582b49a0', '66a213b6-b24f-49b1-82a0-14f236f74048', 'SE15033', 'Vo Huu Yen', 'student33@fpt.edu.vn', 'Software Engineering', 8.87, 1, 'ELIGIBLE', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('66a213b6-b24f-49b1-82a0-14f236f74048', 'SE15033', 'FPT University', 'Software Engineering', 7.5, '["Java"]', 'https://cv.com/cv.pdf');

-- STUDENT 34 (SE15034) — Semester 7, ELIGIBLE (no OJT done yet)
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('a70251a1-9369-40d2-bfad-024ef4d90aee', 'student34@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Ho Xuan Linh', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('a70251a1-9369-40d2-bfad-024ef4d90aee', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('c6b46b2b-286d-44f7-8646-4d7019b58cd0', '26f11784-e2dc-48bb-aec0-80ee582b49a0', 'a70251a1-9369-40d2-bfad-024ef4d90aee', 'SE15034', 'Ho Xuan Linh', 'student34@fpt.edu.vn', 'Software Engineering', 7.1, 7, 'ELIGIBLE', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('a70251a1-9369-40d2-bfad-024ef4d90aee', 'SE15034', 'FPT University', 'Software Engineering', 7.5, '["Java"]', 'https://cv.com/cv.pdf');

-- STUDENT 35 (SE15035) — Semester 1, ELIGIBLE
INSERT INTO users (user_id, email, password_hash, full_name, status, must_change_password) VALUES
    ('93ed049c-d060-45e2-8a73-0c80ae572a4d', 'student35@fpt.edu.vn', '$2a$10$DowzU4EaJ1VwTItK3tB9ZOC2/n4J3b2Y3d8H.zZlX9/7xZ2O2x7.G', 'Bui Xuan Phong', 'ACTIVE', FALSE);
INSERT INTO users_roles (user_id, role_name) VALUES ('93ed049c-d060-45e2-8a73-0c80ae572a4d', 'STUDENT');
INSERT INTO eligible_students (eligible_id, semester_id, user_id, student_code, full_name, email, major, gpa, current_semester, status, is_locked) VALUES
    ('16a4a1b2-b578-4f5b-9dc6-5462a30ea6b4', '26f11784-e2dc-48bb-aec0-80ee582b49a0', '93ed049c-d060-45e2-8a73-0c80ae572a4d', 'SE15035', 'Bui Xuan Phong', 'student35@fpt.edu.vn', 'Software Engineering', 6.8, 1, 'ELIGIBLE', FALSE);
INSERT INTO student_profiles (user_id, student_code, university, major, gpa, skills, cv_file_url) VALUES
    ('93ed049c-d060-45e2-8a73-0c80ae572a4d', 'SE15035', 'FPT University', 'Software Engineering', 8.5, '["Java"]', 'https://cv.com/cv.pdf');

-- ============================================================
-- RE-ENABLE TRIGGERS
-- ============================================================
SET session_replication_role = 'origin';
COMMIT;
