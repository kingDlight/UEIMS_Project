-- ============================================================
-- Migration: 021_fix_enterprise_assignment_student_status_trigger.sql
-- Purpose:   Fix bug: trg_validate_ea_student_status blocks
--            INSERT enterprise_assignments whenever eligible_students.status
--            is not in ('OJT','ACCEPTED').
--
-- ALREADY MERGED INTO 001_create_schema.sql (line ~1012).
-- For fresh databases: do NOT run this file - the function body in
--   001_create_schema.sql already contains the FIX 021 logic.
-- For existing databases that were created from old 001_create_schema.sql:
--   run THIS file to upgrade the trigger function in place.
--   CREATE OR REPLACE FUNCTION is idempotent and safe to re-run.
--
-- Why this migration exists alongside the merged 001 version:
--   - 001_create_schema.sql is the canonical source for new environments.
--   - 020_* and below are numbered patches applied on top of an existing DB.
--   - 021_* follows the same convention: keeps in-place upgrades available
--     for environments that already applied 001_create_schema.sql (with the
--     broken FIX 017 trigger) and don't want to drop/recreate the database.
--
-- Trigger trg_validate_ea_student_status already exists in 001_create_schema.sql.
-- CREATE OR REPLACE FUNCTION updates the function body; existing trigger picks up
-- the new function automatically (no need to ALTER TRIGGER here).
--
-- Background (UC-44 interview PASS + manual placement):
--   autoCreatePlacementAfterInterview flow:
--     1. INSERT enterprise_assignments.status = 'ACTIVE'  <-- trigger fires HERE
--     2. UPDATE eligible_students.status = 'MATCHED'        (only if el.row exists)
--
--   Old trigger assumed eligible_students status must already be ACCEPTED or OJT
--   before the assignment is created. That assumption is wrong for the
--   UC-44 auto-placement flow: assignment is inserted while the student is still
--   ELIGIBLE (and exactly for that reason - to mark them as MATCHED right after).
--   Without this fix the trigger RAISES EXCEPTION, Hibernate rolls back the
--   whole @Transactional method, and the FE observes an HTTP 500 with no DB
--   change.
--
-- Allowed statuses for assignment creation:
--   ELIGIBLE   - student freshly passed interview (UC-44 auto-placement)
--   ACCEPTED   - student accepted offer, matched by hand
--   MATCHED    - student matched to position (manual match / auto-match)
--   OJT        - student in active OJT (replace flow)
--
-- Disallowed (still rejected):
--   NULL       - student not in eligible_students for this semester
--   CANCELLED  - explicit cancellation
--   NOT_ELIGIBLE / PENDING / other - invalid
--
-- Backward compatibility:
--   All previously written rows are not modified.
--   Existing assignment rows remain intact because the trigger only fires
--   on INSERT, not UPDATE.
--
-- Run first in non-prod, then prod. Re-runnable via CREATE OR REPLACE.
-- ============================================================

SET search_path TO public;

CREATE OR REPLACE FUNCTION validate_enterprise_assignment_student_status()
RETURNS TRIGGER AS $$
DECLARE
    stud_status VARCHAR(20);
BEGIN
    SELECT status INTO stud_status
    FROM eligible_students
    WHERE user_id = NEW.student_id AND semester_id = NEW.semester_id;

    -- FIX 021: Allow assignments to be created for any student that is
    --          currently in a positionable status. The previous rule of
    --          only OJT/ACCEPTED was too restrictive and broke the
    --          UC-44 auto-placement after-interview flow.
    --
    -- Allowed: ELIGIBLE, ACCEPTED, MATCHED, OJT
    -- Rejected: NULL, anything else (CANCELLED, NOT_ELIGIBLE, PENDING, ...).
    --
    -- Comment from FIX 017 left intentionally for traceability.
    IF stud_status IS NULL OR
       stud_status NOT IN ('ELIGIBLE', 'ACCEPTED', 'MATCHED', 'OJT') THEN
        RAISE EXCEPTION
            'Cannot assign student to enterprise: student status in this semester must be ELIGIBLE, ACCEPTED, MATCHED or OJT, current status: %',
            COALESCE(stud_status, 'None');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger trg_validate_ea_student_status already exists in 001_create_schema.sql.
-- CREATE OR REPLACE FUNCTION updates the function body; existing trigger picks up
-- the new function automatically (no need to ALTER TRIGGER here).

COMMENT ON FUNCTION validate_enterprise_assignment_student_status() IS
    'FIX 021: Allow enterprise_assignments INSERT for ELIGIBLE|ACCEPTED|MATCHED|OJT students. Trigger trg_validate_ea_student_status uses this function.';
