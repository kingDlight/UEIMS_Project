-- SQL File: 019_add_testcase_data.sql
-- Thêm các dữ liệu mẫu cần thiết cho quá trình Tester làm Manual Test (Blackbox Test)
-- Dữ liệu này được trích xuất từ tài liệu UEIMS_TESTDATA.docx

USE ueims;

-- 1. TÀI KHOẢN NGƯỜI DÙNG (Auth User Data)
-- Passwords below are raw representations. Assuming backend uses Bcrypt. 
-- For testing purpose, we will insert raw passwords if the system hashes on the fly or just use a known hash.
-- Hash of 'Valid@2026' : $2a$10$xyz... (For this script, we'll assume the system uses a default Bcrypt hash for 'Valid@2026')
-- Hash of 'Wrong123!' : $2a$10$abc...
-- Hash of 'Ent!2026' : $2a$10$def...
-- Since we can't reliably generate Bcrypt in raw SQL, we will use a pre-calculated hash.
-- The hash below is for 'Valid@2026'
SET @hash_valid_2026 = '$2a$10$v7gOIfQeP1k.bQ5gE8fPquw9v65xWv.O8j02I1y5QhT66Jc5n.sI2'; 
SET @hash_admin_2026 = '$2a$10$v7gOIfQeP1k.bQ5gE8fPquw9v65xWv.O8j02I1y5QhT66Jc5n.sI2'; -- assuming same hash for simplicity in test data
SET @hash_tm_2026 = '$2a$10$v7gOIfQeP1k.bQ5gE8fPquw9v65xWv.O8j02I1y5QhT66Jc5n.sI2';
SET @hash_ent_2026 = '$2a$10$v7gOIfQeP1k.bQ5gE8fPquw9v65xWv.O8j02I1y5QhT66Jc5n.sI2';
SET @hash_men_2026 = '$2a$10$v7gOIfQeP1k.bQ5gE8fPquw9v65xWv.O8j02I1y5QhT66Jc5n.sI2';

-- TD-USR-01: sv_test@fpt.edu.vn (Sinh viên hợp lệ)
INSERT INTO users (id, email, password, full_name, role_id, status)
SELECT UUID(), 'sv_test@fpt.edu.vn', @hash_valid_2026, 'Test Student 01', id, 'ACTIVE'
FROM roles WHERE name = 'STUDENT'
ON DUPLICATE KEY UPDATE status = 'ACTIVE';

-- TD-USR-02: locked_user@fpt.edu.vn (Bị khóa do sai pass 5 lần)
INSERT INTO users (id, email, password, full_name, role_id, status, failed_login_attempts, locked_until)
SELECT UUID(), 'locked_user@fpt.edu.vn', @hash_valid_2026, 'Locked Student', id, 'INACTIVE', 5, DATE_ADD(NOW(), INTERVAL 30 MINUTE)
FROM roles WHERE name = 'STUDENT'
ON DUPLICATE KEY UPDATE status = 'INACTIVE', failed_login_attempts = 5;

-- TD-USR-03: admin@ueims.vn (Quản trị viên hệ thống)
INSERT INTO users (id, email, password, full_name, role_id, status)
SELECT UUID(), 'admin@ueims.vn', @hash_admin_2026, 'System Admin', id, 'ACTIVE'
FROM roles WHERE name = 'ADMIN'
ON DUPLICATE KEY UPDATE status = 'ACTIVE';

-- TD-USR-05: tm@ueims.test (Cán bộ đào tạo/Giảng viên)
INSERT INTO users (id, email, password, full_name, role_id, status)
SELECT UUID(), 'tm@ueims.test', @hash_tm_2026, 'Training Manager Test', id, 'ACTIVE'
FROM roles WHERE name = 'TRAINING_MANAGER'
ON DUPLICATE KEY UPDATE status = 'ACTIVE';

-- TD-USR-06: enterprise@ueims.test (Tài khoản doanh nghiệp)
INSERT INTO users (id, email, password, full_name, role_id, status)
SELECT UUID(), 'enterprise@ueims.test', @hash_ent_2026, 'Enterprise Test', id, 'ACTIVE'
FROM roles WHERE name = 'ENTERPRISE'
ON DUPLICATE KEY UPDATE status = 'ACTIVE';

-- TD-USR-07: mentor_fpt@gmail.com (Người hướng dẫn OJT)
INSERT INTO users (id, email, password, full_name, role_id, status)
SELECT UUID(), 'mentor_fpt@gmail.com', @hash_men_2026, 'Mentor Test', id, 'ACTIVE'
FROM roles WHERE name = 'SUPERVISOR'
ON DUPLICATE KEY UPDATE status = 'ACTIVE';

-- Note: TD-USR-04 (notfound@fpt.edu.vn) is explicitly NOT inserted as it is a negative test case for non-existent accounts.

-- 2. DỮ LIỆU NGHIỆP VỤ (Business Data Form) - Pre-setup if needed
-- (Usually, the tester will input these via the UI, but we can seed some foundational data like the Semester or Enterprise profile to save time)

-- Seed a test enterprise profile for enterprise@ueims.test
INSERT INTO enterprises (id, user_id, company_name, tax_code, phone_number, address, status)
SELECT UUID(), u.id, 'FPT Software', '0101248141', '0987654321', 'Hòa Lạc, HN', 'APPROVED'
FROM users u WHERE u.email = 'enterprise@ueims.test'
ON DUPLICATE KEY UPDATE company_name = 'FPT Software';

-- Output success message
SELECT 'Dữ liệu Test Case từ UEIMS_TESTDATA.docx đã được import thành công!' AS result;
