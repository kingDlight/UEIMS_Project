-- ============================================================
-- Migration 015: GPA scale change (thang 4 → thang 10)
-- ============================================================
-- Lý do: Hệ thống trước lưu GPA thang 4 (max 4.0), nhưng Auto-Match
-- và BR-19 dùng ngưỡng thang 10 (>= 5.0 để pass, >= 7.0 cho auto-match).
-- Convert tất cả giá trị hiện tại: gpa_new = gpa_old * 2.5
-- ============================================================

-- 1. eligible_students: mở rộng column từ DECIMAL(3,2) → DECIMAL(4,2) (max 10.00)
ALTER TABLE eligible_students
    ALTER COLUMN gpa TYPE DECIMAL(4,2);

-- 2. student_profiles: tương tự
ALTER TABLE student_profiles
    ALTER COLUMN gpa TYPE DECIMAL(4,2);

-- 3. Convert dữ liệu: thang 4 → thang 10
UPDATE eligible_students
SET gpa = ROUND(gpa * 2.5, 2)
WHERE gpa <= 4.0;

UPDATE student_profiles
SET gpa = ROUND(gpa * 2.5, 2)
WHERE gpa <= 4.0 AND gpa IS NOT NULL;

-- 4. Cập nhật CHECK constraint BR-19: GPA >= 5.0 để pass
ALTER TABLE eligible_students
    DROP CONSTRAINT IF EXISTS chk_gpa_minimum;

ALTER TABLE eligible_students
    ADD CONSTRAINT chk_gpa_minimum CHECK (gpa >= 5.0 AND gpa <= 10.0);

-- 5. Verify
-- SELECT MIN(gpa), MAX(gpa), AVG(gpa) FROM eligible_students;
-- SELECT MIN(gpa), MAX(gpa), AVG(gpa) FROM student_profiles;
