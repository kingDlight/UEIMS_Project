-- Full Data Seeder for UEIMS (Corrected)
-- Run this after 001_create_schema.sql to set up environment for testing

-- 1. Disable triggers to allow insertions
ALTER TABLE users DISABLE TRIGGER ALL;
ALTER TABLE roles DISABLE TRIGGER ALL;
ALTER TABLE enterprises DISABLE TRIGGER ALL;
ALTER TABLE semesters DISABLE TRIGGER ALL;
ALTER TABLE users_roles DISABLE TRIGGER ALL;
ALTER TABLE semester_enterprises DISABLE TRIGGER ALL;

-- 2. Insert Roles
INSERT INTO roles (role_name, description) VALUES
    ('ADMIN', 'System Administrator'),
    ('TRAINING_MANAGER', 'Training Manager'),
    ('ENTERPRISE', 'Enterprise Admin'),
    ('STUDENT', 'Student')
ON CONFLICT (role_name) DO NOTHING;

-- 3. Insert Users FIRST (to satisfy created_by FK in semesters)
-- Passwords are hashed with bcrypt (Valid@2026, Admin!2026, Tm!2026, Ent!2026, Men!2026)
INSERT INTO users (user_id, email, password_hash, full_name, status, phone) VALUES
('a041d654-0f9e-40e5-8769-101e2845bec4', 'sv_test@fpt.edu.vn', '$2a$10$YFAq0yqwUGnzTJDMoOlJ6es4wMXwjWTcRJ0FxZrsPcgysw0kOxXWG', 'Student Test', 'ACTIVE', '0901234567'),
('a041d654-0f9e-40e5-8769-101e2845bec5', 'locked_user@fpt.edu.vn', '$2a$10$YFAq0yqwUGnzTJDMoOlJ6es4wMXwjWTcRJ0FxZrsPcgysw0kOxXWG', 'Locked Student', 'LOCKED', '0901234568'),
('a041d654-0f9e-40e5-8769-101e2845bec6', 'admin@ueims.vn', '$2a$10$awLcpKfqgCIESa/HX1SJ5.YLum/f/IKux1LLfnADnT.eApKLdc8O6', 'Admin Test', 'ACTIVE', '0901234569'),
('a041d654-0f9e-40e5-8769-101e2845bec7', 'tm@ueims.test', '$2a$10$rqIVEZVZ9byPXYBAQ60Vhuj0AmexDeyn.vJFGR.shd4hmDJknM0xO', 'TM Test', 'ACTIVE', '0901234570'),
('a041d654-0f9e-40e5-8769-101e2845bec8', 'enterprise@ueims.test', '$2a$10$rqIVEZVZ9byPXYBAQ60Vhuj0AmexDeyn.vJFGR.shd4hmDJknM0xO', 'Enterprise Test', 'ACTIVE', '0901234571'),
('a041d654-0f9e-40e5-8769-101e2845bec9', 'mentor_fpt@gmail.com', '$2a$10$rqIVEZVZ9byPXYBAQ60Vhuj0AmexDeyn.vJFGR.shd4hmDJknM0xO', 'Mentor Test', 'ACTIVE', '0901234572'),
('99999999-9999-9999-9999-999999999993', 'missing_reviewer@ueims.vn', 'dummy_hash', 'Missing Reviewer', 'ACTIVE', '0901234573')
ON CONFLICT (user_id) DO NOTHING;

-- 4. Insert Enterprises
INSERT INTO enterprises (enterprise_id, company_name, tax_code, approval_status) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'FPT Software', '0101248141', 'APPROVED')
ON CONFLICT (enterprise_id) DO NOTHING;

-- 5. Insert Semesters
INSERT INTO semesters (semester_id, semester_code, name, start_date, end_date, status, created_by) VALUES
('b1444798-bfc0-407b-b6f5-57280231c06f', 'SP27', 'Spring 2027', '2027-01-01', '2027-04-30', 'DRAFT', 'a041d654-0f9e-40e5-8769-101e2845bec6')
ON CONFLICT (semester_id) DO NOTHING;

-- 6. Insert Semester-Enterprise relationship
INSERT INTO semester_enterprises (semester_enterprise_id, semester_id, enterprise_id, registration_status) VALUES
('a041d654-0f9e-40e5-8769-101e2845bec3', 'b1444798-bfc0-407b-b6f5-57280231c06f', '550e8400-e29b-41d4-a716-446655440003', 'APPROVED')
ON CONFLICT (semester_enterprise_id) DO NOTHING;

-- 7. Assign roles
INSERT INTO users_roles (user_id, role_name) VALUES
('a041d654-0f9e-40e5-8769-101e2845bec4', 'STUDENT'),
('a041d654-0f9e-40e5-8769-101e2845bec5', 'STUDENT'),
('a041d654-0f9e-40e5-8769-101e2845bec6', 'ADMIN'),
('a041d654-0f9e-40e5-8769-101e2845bec7', 'TRAINING_MANAGER'),
('a041d654-0f9e-40e5-8769-101e2845bec8', 'ENTERPRISE'),
('a041d654-0f9e-40e5-8769-101e2845bec9', 'ENTERPRISE')
ON CONFLICT DO NOTHING;

-- 8. Enable triggers
ALTER TABLE users ENABLE TRIGGER ALL;
ALTER TABLE roles ENABLE TRIGGER ALL;
ALTER TABLE enterprises ENABLE TRIGGER ALL;
ALTER TABLE semesters ENABLE TRIGGER ALL;
ALTER TABLE users_roles ENABLE TRIGGER ALL;
ALTER TABLE semester_enterprises ENABLE TRIGGER ALL;
