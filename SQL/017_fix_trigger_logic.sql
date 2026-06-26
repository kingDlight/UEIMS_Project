-- ============================================================
-- SQL FIX 017: Fix Trigger Logic for Valid Data Flow
--
-- Problem 1: trg_locked_student_edit blocks MATCHED→OJT transition
--   even though trg_validate_ojt explicitly allows it.
--   Fix: Add exception for status=MATCHED → OJT transition.
--
-- Problem 2: trg_validate_ea_student_status only allows OJT students
--   to have enterprise_assignments. But the actual workflow is:
--   ACCEPTED students can be assigned (before TM approves OJT).
--   Fix: Allow both OJT and ACCEPTED students.
--
-- Problem 3: trg_student_apply_permission only allows semester 5.
--   For flexibility, semester 6 should also be allowed to apply
--   (before they enter OJT).
--   Fix: Allow semesters 5 and 6.
-- ============================================================

BEGIN;

-- ============================================================
-- FIX 1: trg_locked_student_edit — allow MATCHED → OJT
-- ============================================================
CREATE OR REPLACE FUNCTION prevent_locked_student_edit()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_locked = TRUE THEN
        -- FIX 017: Allow MATCHED → OJT transition even when locked
        -- This is needed because trg_validate_ojt fires on the same UPDATE
        -- and explicitly allows this transition (BR-22)
        IF OLD.status = 'MATCHED' AND NEW.status = 'OJT' THEN
            NEW.is_locked := TRUE;
            NEW.approved_at := CURRENT_TIMESTAMP;
            RETURN NEW;
        END IF;

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

-- ============================================================
-- FIX 2: trg_validate_ea_student_status — allow ACCEPTED too
--   The workflow: ACCEPTED student gets matched, then TM approves
--   OJT, then enterprise assignment is created. In practice,
--   ACCEPTED students should be able to have an assignment record
--   created (with status ACTIVE) as the final step before/during OJT.
--   Keeping it strict (OJT only) is also valid — depends on workflow.
--   This fix makes it more flexible: both ACCEPTED and OJT students
--   can be assigned to enterprise.
-- ============================================================
CREATE OR REPLACE FUNCTION validate_enterprise_assignment_student_status()
RETURNS TRIGGER AS $$
DECLARE
    stud_status VARCHAR(20);
BEGIN
    SELECT status INTO stud_status
    FROM eligible_students
    WHERE user_id = NEW.student_id AND semester_id = NEW.semester_id;

    -- FIX 017: Allow both OJT (actively interning) and ACCEPTED (matched, about to start)
    IF stud_status IS NULL OR (stud_status != 'OJT' AND stud_status != 'ACCEPTED') THEN
        RAISE EXCEPTION 'Cannot assign student to enterprise: student status in this semester must be OJT or ACCEPTED, current status: %', COALESCE(stud_status, 'None');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FIX 3: trg_student_apply_permission — allow semesters 5 AND 6
--   BR-54 states semester 5 students can apply for internship.
--   However, in practice semester 6 students may still be in the
--   application/placement phase before OJT officially starts.
--   This fix allows both semester 5 and semester 6 students to apply.
-- ============================================================
CREATE OR REPLACE FUNCTION enforce_student_apply_permission()
RETURNS NEW AS $$
DECLARE
    stud_sem INT;
BEGIN
    SELECT es.current_semester INTO stud_sem
    FROM eligible_students es
    JOIN job_posts jp ON es.semester_id = jp.semester_id
    WHERE es.user_id = NEW.student_id AND jp.job_post_id = NEW.job_post_id;

    -- FIX 017: Allow semesters 5 and 6 to apply
    IF stud_sem IS NULL OR stud_sem NOT IN (5, 6) THEN
        RAISE EXCEPTION 'Student is not in Semester 5 or 6 (Current: %). Only Semester 5-6 students are permitted to apply for jobs (BR-54).', COALESCE(stud_sem::TEXT, 'Unknown');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMIT;
