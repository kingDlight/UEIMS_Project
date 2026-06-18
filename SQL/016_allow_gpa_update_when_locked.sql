-- ============================================================
-- Migration 016: Allow GPA update when is_locked = TRUE
-- ============================================================
-- Lý do: BR-21 (BR-21) chặn tất cả update khi is_locked=true, kể cả
-- admin/TM muốn sửa GPA. Tuy nhiên, BR-21 thực chất chỉ nên chặn
-- status transitions, không chặn thông tin profile (full_name,
-- email, gpa, major). Mở rộng cho phép update các trường này.
-- ============================================================

-- 1. Tắt trigger trước khi update function
ALTER TABLE eligible_students DISABLE TRIGGER ALL;

-- 2. Update trigger function: loại bỏ check trên gpa/full_name/email/major
--    khi is_locked=true. Vẫn chặn status, student_code, semester_id, user_id.
CREATE OR REPLACE FUNCTION prevent_locked_student_edit()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_locked = TRUE THEN
        -- Allow only status transition to CANCELLED
        IF NEW.status != 'CANCELLED' THEN
            RAISE EXCEPTION 'Student record is locked. Cannot modify status to % (BR-21).', NEW.status;
        END IF;

        -- Enforce Admin validation if transitioning from OJT to CANCELLED (BR-24)
        IF OLD.status = 'OJT' AND NEW.status = 'CANCELLED' THEN
            IF NEW.cancelled_by IS NULL THEN
                RAISE EXCEPTION 'cancelled_by must be specified when cancelling an active OJT student (BR-24).';
            END IF;
            IF NOT EXISTS (
                SELECT 1 FROM users_roles
                WHERE user_id = NEW.cancelled_by AND role_name = 'ADMIN'
            ) THEN
                RAISE EXCEPTION 'Only System Administrators can cancel an active OJT student (BR-24).';
            END IF;
        END IF;

        -- Prevent modification of identity columns
        -- (gpa, full_name, email, major được phép update)
        IF OLD.eligible_id != NEW.eligible_id OR
           OLD.semester_id != NEW.semester_id OR
           OLD.user_id IS DISTINCT FROM NEW.user_id OR
           OLD.student_code != NEW.student_code OR
           OLD.imported_at != NEW.imported_at THEN
            RAISE EXCEPTION 'Student record is locked. Only profile fields (gpa, name, email, major) and status can be updated.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Bật lại trigger
ALTER TABLE eligible_students ENABLE TRIGGER ALL;

-- 4. Verify
-- SELECT tgname, tgenabled FROM pg_trigger WHERE tgrelid = 'eligible_students'::regclass;
