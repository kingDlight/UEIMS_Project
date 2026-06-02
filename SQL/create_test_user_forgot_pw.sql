-- ============================================================
-- QUERY TẠO USER ĐỂ TEST CHỨC NĂNG QUÊN MẬT KHẨU (FORGOT PASSWORD)
-- ============================================================
-- Lưu ý quan trọng: 
-- Hãy thay đổi dòng 'email_cua_ban_sep@gmail.com' thành email THẬT của bạn sếp.
-- Hệ thống sẽ gửi email chứa Link Reset Mật Khẩu vào địa chỉ này.

INSERT INTO users (
    user_id,
    email,
    password_hash,
    full_name,
    phone,
    status,
    failed_login_attempts,
    must_change_password,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'email_cua_ban_sep@gmail.com', -- ⚠️ SỬA EMAIL THẬT VÀO ĐÂY
    '$2a$10$W2neF9.6Agi6kAKVq8q3fec5dHW8KUA.b0VSIGdIZyUawzL3O2VKy', -- Mật khẩu tạm thời là: 123456 (Bcrypt Hash)
    'Test Friend',
    '0901234567',
    'ACTIVE',
    0,
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ============================================================
-- HƯỚNG DẪN TEST:
-- 1. Chạy đoạn Script trên trong PostgreSQL (DBeaver / pgAdmin).
-- 2. Mở giao diện Web (Frontend), bấm vào "Quên mật khẩu".
-- 3. Nhập email thật vừa điền ở trên và bấm Gửi.
-- 4. Kêu bạn sếp check hòm thư (kể cả thư mục Spam) để click vào link đổi Pass nhé!
