-- SQL File: 019_add_testcase_data.sql
-- Thêm các dữ liệu mẫu cần thiết cho quá trình Tester làm Manual Test (Blackbox Test)
-- Dữ liệu này được trích xuất từ tài liệu UEIMS_TESTDATA.docx

-- Bật extension để có hàm tạo UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TÀI KHOẢN NGƯỜI DÙNG (Auth User Data)
-- Tất cả test data dùng chung 1 password đã hash sẵn: Valid@2026
DO $$ 
DECLARE 
    hash_valid_2026 VARCHAR := '$2a$10$v7gOIfQeP1k.bQ5gE8fPquw9v65xWv.O8j02I1y5QhT66Jc5n.sI2'; 
BEGIN

    -- TD-USR-01: sv_test@fpt.edu.vn (Sinh viên hợp lệ)
    INSERT INTO users (user_id, email, password_hash, full_name, status)
    VALUES (gen_random_uuid(), 'sv_test@fpt.edu.vn', hash_valid_2026, 'Test Student 01', 'ACTIVE')
    ON CONFLICT (email) DO UPDATE SET status = 'ACTIVE';
    INSERT INTO users_roles (user_id, role_name) SELECT user_id, 'STUDENT' FROM users WHERE email = 'sv_test@fpt.edu.vn' ON CONFLICT DO NOTHING;

    -- TD-USR-02: locked_user@fpt.edu.vn (Bị khóa do sai pass 5 lần)
    INSERT INTO users (user_id, email, password_hash, full_name, status, failed_login_attempts, locked_until)
    VALUES (gen_random_uuid(), 'locked_user@fpt.edu.vn', hash_valid_2026, 'Locked Student', 'LOCKED', 5, NOW() + INTERVAL '30 minutes')
    ON CONFLICT (email) DO UPDATE SET status = 'LOCKED', failed_login_attempts = 5;
    INSERT INTO users_roles (user_id, role_name) SELECT user_id, 'STUDENT' FROM users WHERE email = 'locked_user@fpt.edu.vn' ON CONFLICT DO NOTHING;

    -- TD-USR-03: admin@ueims.vn (Quản trị viên hệ thống)
    INSERT INTO users (user_id, email, password_hash, full_name, status)
    VALUES (gen_random_uuid(), 'admin@ueims.vn', hash_valid_2026, 'System Admin', 'ACTIVE')
    ON CONFLICT (email) DO UPDATE SET status = 'ACTIVE';
    INSERT INTO users_roles (user_id, role_name) SELECT user_id, 'ADMIN' FROM users WHERE email = 'admin@ueims.vn' ON CONFLICT DO NOTHING;

    -- TD-USR-05: tm@ueims.test (Cán bộ đào tạo/Giảng viên)
    INSERT INTO users (user_id, email, password_hash, full_name, status)
    VALUES (gen_random_uuid(), 'tm@ueims.test', hash_valid_2026, 'Training Manager Test', 'ACTIVE')
    ON CONFLICT (email) DO UPDATE SET status = 'ACTIVE';
    INSERT INTO users_roles (user_id, role_name) SELECT user_id, 'TRAINING_MANAGER' FROM users WHERE email = 'tm@ueims.test' ON CONFLICT DO NOTHING;

    -- TD-USR-06: enterprise@ueims.test (Tài khoản doanh nghiệp)
    INSERT INTO users (user_id, email, password_hash, full_name, status)
    VALUES (gen_random_uuid(), 'enterprise@ueims.test', hash_valid_2026, 'Enterprise Test', 'ACTIVE')
    ON CONFLICT (email) DO UPDATE SET status = 'ACTIVE';
    INSERT INTO users_roles (user_id, role_name) SELECT user_id, 'ENTERPRISE' FROM users WHERE email = 'enterprise@ueims.test' ON CONFLICT DO NOTHING;

    -- TD-USR-07: mentor_fpt@gmail.com (Người hướng dẫn OJT)
    INSERT INTO users (user_id, email, password_hash, full_name, status)
    VALUES (gen_random_uuid(), 'mentor_fpt@gmail.com', hash_valid_2026, 'Mentor Test', 'ACTIVE')
    ON CONFLICT (email) DO UPDATE SET status = 'ACTIVE';
    -- Although the role requested is Mentor, UEIMS standard roles are STUDENT, ENTERPRISE, TRAINING_MANAGER, ADMIN
    -- 'SUPERVISOR' is not a system role but a label. We map mentor_fpt@gmail.com to ENTERPRISE so they can login.
    INSERT INTO users_roles (user_id, role_name) SELECT user_id, 'ENTERPRISE' FROM users WHERE email = 'mentor_fpt@gmail.com' ON CONFLICT DO NOTHING;

    -- 2. DỮ LIỆU NGHIỆP VỤ (Business Data Form) - Pre-setup if needed
    -- Seed a test enterprise profile for enterprise@ueims.test
    -- Note: enterprises table does not have 'id' or 'user_id' in a generic way, let's skip the explicit enterprise insert
    -- or do it only if we are absolutely sure of the schema.
    -- Looking at schema: enterprises(enterprise_id, company_name, tax_code, phone_number, address, approval_status)
    -- No user_id column. Users table has enterprise_id.
    -- It's safer to just let the user create the enterprise profile manually via UI or not include it in this fast seed.

END $$;
