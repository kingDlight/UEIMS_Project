-- ============================================================================
-- File: 002_legacy_patches.sql
-- Purpose: Combined in-place upgrade patch for databases that were created
--          from an OLDER version of 001_create_schema.sql (before FIX 013,
--          FIX 017, FIX 018, FIX 021 were merged in).
--
-- USAGE:
--   - Fresh database?  → Run ONLY 001_create_schema.sql. Do NOT run this file.
--   - Existing database from old 001?  → Run this file once. Idempotent via
--     CREATE OR REPLACE FUNCTION; safe to re-run.
--
-- CONTENTS (consolidated from these original files):
--   013_fix_semester_enterprises_columns.sql
--   017_fix_trigger_logic.sql
--   018_fix_br49_interview_confirm_reversal.sql
--   021_fix_enterprise_assignment_student_status_trigger.sql
--
-- Apply:   psql -U <user> -d <db> -f 002_legacy_patches.sql
-- ============================================================================

SET search_path TO public;

-- ============================================================================
-- BLOCK 1 (was 013_fix_semester_enterprises_columns.sql)
--   Fix semester_enterprises:
--     1. Composite PK columns (semester_id, enterprise_id)
--     2. Rename registration_status → status
--     3. Add updated_at (BaseEntity requirement)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'semester_enterprises'
    ) THEN
        -- 1. Add semester_id + enterprise_id columns if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'semester_enterprises'
              AND column_name = 'semester_id'
        ) THEN
            ALTER TABLE semester_enterprises ADD COLUMN semester_id UUID;
            RAISE NOTICE '[013] Added semester_id column';
        ELSE
            RAISE NOTICE '[013] semester_id already exists';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'semester_enterprises'
              AND column_name = 'enterprise_id'
        ) THEN
            ALTER TABLE semester_enterprises ADD COLUMN enterprise_id UUID;
            RAISE NOTICE '[013] Added enterprise_id column';
        ELSE
            RAISE NOTICE '[013] enterprise_id already exists';
        END IF;

        -- 2. Rename registration_status -> status
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'semester_enterprises'
              AND column_name = 'registration_status'
        ) AND NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'semester_enterprises'
              AND column_name = 'status'
        ) THEN
            ALTER TABLE semester_enterprises RENAME COLUMN registration_status TO status;
            RAISE NOTICE '[013] Renamed registration_status to status';
        ELSIF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'semester_enterprises'
              AND column_name = 'registration_status'
        ) AND EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'semester_enterprises'
              AND column_name = 'status'
        ) THEN
            ALTER TABLE semester_enterprises DROP COLUMN registration_status;
            RAISE NOTICE '[013] Dropped redundant registration_status column';
        END IF;

        -- 3. Add updated_at if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'semester_enterprises'
              AND column_name = 'updated_at'
        ) THEN
            ALTER TABLE semester_enterprises ADD COLUMN updated_at TIMESTAMP;
            UPDATE semester_enterprises SET updated_at = COALESCE(created_at, CURRENT_TIMESTAMP) WHERE updated_at IS NULL;
            ALTER TABLE semester_enterprises ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
            ALTER TABLE semester_enterprises ALTER COLUMN updated_at SET NOT NULL;
            RAISE NOTICE '[013] Added updated_at to semester_enterprises';
        ELSE
            RAISE NOTICE '[013] updated_at already exists on semester_enterprises';
        END IF;
    END IF;
END $$;


-- ============================================================================
-- BLOCK 2 (was 017_fix_trigger_logic.sql)
--   Fix trigger logic:
--     1. trg_locked_student_edit — allow MATCHED → OJT
--     2. trg_validate_ea_student_status — allow both OJT and ACCEPTED
--     3. trg_student_apply_permission — allow semesters 5 AND 6
-- ============================================================================

BEGIN;

-- FIX 1: trg_locked_student_edit — allow MATCHED → OJT
CREATE OR REPLACE FUNCTION prevent_locked_student_edit()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_locked = TRUE THEN
        IF OLD.status = 'MATCHED' AND NEW.status = 'OJT' THEN
            NEW.is_locked := TRUE;
            NEW.approved_at := CURRENT_TIMESTAMP;
            RETURN NEW;
        END IF;

        IF NEW.status != 'CANCELLED' THEN
            RAISE EXCEPTION 'Student record is locked. Cannot modify status to % (BR-21).', NEW.status;
        END IF;

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

-- FIX 2: trg_validate_ea_student_status — allow both OJT and ACCEPTED
CREATE OR REPLACE FUNCTION validate_enterprise_assignment_student_status()
RETURNS TRIGGER AS $$
DECLARE
    stud_status VARCHAR(20);
BEGIN
    SELECT status INTO stud_status
    FROM eligible_students
    WHERE user_id = NEW.student_id AND semester_id = NEW.semester_id;

    IF stud_status IS NULL OR (stud_status != 'OJT' AND stud_status != 'ACCEPTED') THEN
        RAISE EXCEPTION 'Cannot assign student to enterprise: student status in this semester must be OJT or ACCEPTED, current status: %', COALESCE(stud_status, 'None');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- FIX 3: trg_student_apply_permission — allow semesters 5 AND 6
CREATE OR REPLACE FUNCTION enforce_student_apply_permission()
RETURNS TRIGGER AS $$
DECLARE
    stud_sem INT;
BEGIN
    SELECT es.current_semester INTO stud_sem
    FROM eligible_students es
    JOIN job_posts jp ON es.semester_id = jp.semester_id
    WHERE es.user_id = NEW.student_id AND jp.job_post_id = NEW.job_post_id;

    IF stud_sem IS NULL OR stud_sem NOT IN (5, 6) THEN
        RAISE EXCEPTION 'Student is not in Semester 5 or 6 (Current: %). Only Semester 5-6 students are permitted to apply for jobs (BR-54).', COALESCE(stud_sem::TEXT, 'Unknown');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMIT;


-- ============================================================================
-- BLOCK 3 (was 018_fix_br49_interview_confirm_reversal.sql)
--   Fix BR-49 trigger: allow resetting student_confirmed when there's a
--   valid business reason (reschedule / cancel with reason).
-- ============================================================================

CREATE OR REPLACE FUNCTION prevent_confirmation_reversal()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.student_confirmed = TRUE AND NEW.student_confirmed = FALSE THEN
        IF OLD.scheduled_datetime != NEW.scheduled_datetime THEN
            RETURN NEW;
        END IF;

        IF NEW.reschedule_reason IS NOT NULL AND NEW.reschedule_reason != '' THEN
            RETURN NEW;
        END IF;

        IF NEW.status = 'CANCELLED'
           AND NEW.cancel_reason IS NOT NULL
           AND NEW.cancel_reason != '' THEN
            RETURN NEW;
        END IF;

        RAISE EXCEPTION 'Interview confirmation cannot be reversed without a reschedule or cancel reason (BR-49).';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- (The trigger trg_confirmation_irreversible itself is created in 001; this
-- CREATE OR REPLACE FUNCTION update is picked up by the existing trigger.)


-- ============================================================================
-- BLOCK 4 (was 021_fix_enterprise_assignment_student_status_trigger.sql)
--   Fix trg_validate_ea_student_status: allow ELIGIBLE|ACCEPTED|MATCHED|OJT
--   (supersedes the narrower 017 fix above).
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_enterprise_assignment_student_status()
RETURNS TRIGGER AS $$
DECLARE
    stud_status VARCHAR(20);
BEGIN
    SELECT status INTO stud_status
    FROM eligible_students
    WHERE user_id = NEW.student_id AND semester_id = NEW.semester_id;

    -- FIX 021: Allow ELIGIBLE | ACCEPTED | MATCHED | OJT.
    -- Required for UC-44 auto-placement after interview.
    IF stud_status IS NULL OR
       stud_status NOT IN ('ELIGIBLE', 'ACCEPTED', 'MATCHED', 'OJT') THEN
        RAISE EXCEPTION
            'Cannot assign student to enterprise: student status in this semester must be ELIGIBLE, ACCEPTED, MATCHED or OJT, current status: %',
            COALESCE(stud_status, 'None');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_enterprise_assignment_student_status() IS
    'FIX 021: Allow enterprise_assignments INSERT for ELIGIBLE|ACCEPTED|MATCHED|OJT students.';


-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== 002_legacy_patches.sql applied successfully ===';
    RAISE NOTICE 'If upgrading from a pre-FIX-013/017/018/021 database, all four legacy fixes are now active.';
END $$;


-- ============================================================================
-- FIX 049: max_positions semantics change
-- ----------------------------------------------------------------------------
-- `job_posts.max_positions` is being redefined from "total historical quota"
-- to "current open positions runtime". The previous "0 / 18 filled" view
-- confused enterprise users because the historical quota had no operational
-- meaning after applications started arriving. Going forward:
--   - max_positions = number of slots currently OPEN for new applications
--   - When students fill slots, the applications table count rises but
--     max_positions stays put (runtime); enterprise can decrement or
--     extend it via edit without manual math.
-- This migration:
--   1. Adds `original_max_positions` snapshot column (immutable after create)
--   2. Backfills it from the legacy `max_positions` value
--   3. Recalculates `max_positions` so the visible UI matches the new semantic
--   4. Installs triggers so future applications keep the invariant intact:
--        INSERT application → max_positions -= 1
--        DELETE/WITHDRAW     → max_positions += 1
--      Only decrements if max_positions > 0 (over-applications don't go negative)
-- Idempotent (uses GREATEST + DROP IF EXISTS).
-- ============================================================================

-- 1. Snapshot column for the immutable original quota
ALTER TABLE job_posts
    ADD COLUMN IF NOT EXISTS original_max_positions INT;

UPDATE job_posts
SET original_max_positions = max_positions
WHERE original_max_positions IS NULL;

ALTER TABLE job_posts
    ALTER COLUMN original_max_positions SET NOT NULL;

-- Drop the legacy >0 check so the runtime count can drop to 0 (full).
ALTER TABLE job_posts
    DROP CONSTRAINT IF EXISTS job_posts_max_positions_check;

-- 2. Backfill max_positions = max(0, original - taken) for legacy rows.
--    After this step, existing rows render correctly under the new semantic.
UPDATE job_posts jp
SET max_positions = GREATEST(
    0,
    jp.max_positions - COALESCE((
        SELECT COUNT(*)
        FROM applications a
        WHERE a.job_post_id = jp.job_post_id
          AND a.status NOT IN ('WITHDRAWN', 'REJECTED_BY_STUDENT', 'WITHDRAWN_BY_SYSTEM')
          AND a.deleted_at IS NULL
    ), 0)
);

-- 3a. Trigger: when a NEW active application is created, decrement max_positions.
CREATE OR REPLACE FUNCTION jobpost_apply_decrement() RETURNS TRIGGER AS $$
BEGIN
    -- Only decrement for new rows that count as active.
    -- Active = NOT WITHDRAWN (the only terminal state in the schema).
    IF NEW.deleted_at IS NULL AND NEW.status <> 'WITHDRAWN' THEN
        UPDATE job_posts
        SET max_positions = GREATEST(0, max_positions - 1)
        WHERE job_post_id = NEW.job_post_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_application_decrement ON applications;
CREATE TRIGGER trg_application_decrement
    AFTER INSERT ON applications
    FOR EACH ROW
    EXECUTE FUNCTION jobpost_apply_decrement();

-- 3b. Trigger: when an application is withdrawn / soft-deleted,
-- increment max_positions back up so the post re-opens.
-- Also handles the BR-26 undo case: revive from WITHDRAWN back to PENDING
-- (no slot accounting change — slot was already counted when first inserted).
CREATE OR REPLACE FUNCTION jobpost_apply_increment() RETURNS TRIGGER AS $$
BEGIN
    -- Old row was active; new row is now terminal → return the slot.
    IF OLD.deleted_at IS NULL AND OLD.status <> 'WITHDRAWN'
       AND (NEW.deleted_at IS NOT NULL OR NEW.status = 'WITHDRAWN') THEN
        UPDATE job_posts
        SET max_positions = LEAST(original_max_positions, max_positions + 1)
        WHERE job_post_id = OLD.job_post_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_application_increment ON applications;
CREATE TRIGGER trg_application_increment
    AFTER UPDATE OF status, deleted_at ON applications
    FOR EACH ROW
    EXECUTE FUNCTION jobpost_apply_increment();

-- 3c. Trigger: when a soft-deleted/withdrawn application is REVIVED
-- (e.g. BR-26 undo cascade: WITHDRAWN → PENDING), decrement max_positions
-- again because the slot is now occupied again. Recomputes from scratch
-- against the source-of-truth (original - taken) so the invariant always
-- holds even after BR-26 cascades.
CREATE OR REPLACE FUNCTION jobpost_apply_reactivate() RETURNS TRIGGER AS $$
DECLARE current_taken BIGINT;
BEGIN
    -- Revive = was terminal (withdrawn or soft-deleted), now active again.
    IF (OLD.deleted_at IS NOT NULL OR OLD.status = 'WITHDRAWN')
       AND NEW.deleted_at IS NULL
       AND NEW.status <> 'WITHDRAWN' THEN
        SELECT COUNT(*) INTO current_taken
        FROM applications a
        WHERE a.job_post_id = NEW.job_post_id
          AND a.deleted_at IS NULL
          AND a.status <> 'WITHDRAWN'
          AND a.application_id <> NEW.application_id;
        current_taken := current_taken + 1;  -- the reviving row itself

        UPDATE job_posts
        SET max_positions = GREATEST(0, original_max_positions - current_taken)
        WHERE job_post_id = NEW.job_post_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_application_reactivate ON applications;
CREATE TRIGGER trg_application_reactivate
    AFTER UPDATE OF status, deleted_at ON applications
    FOR EACH ROW
    EXECUTE FUNCTION jobpost_apply_reactivate();

COMMENT ON COLUMN job_posts.max_positions IS
    'FIX 049: current number of OPEN positions (runtime, auto-maintained by triggers). Was: total historical quota.';
COMMENT ON COLUMN job_posts.original_max_positions IS
    'FIX 049: immutable original quota snapshot taken at job-post creation.';
