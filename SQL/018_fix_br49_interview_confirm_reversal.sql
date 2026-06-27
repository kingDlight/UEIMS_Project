-- ============================================================
-- Migration: 018_fix_br49_interview_confirm_reversal.sql
-- Date: 2026-06-27
-- Description:
--   Fix BR-49 trigger to allow resetting student_confirmed
--   when there's a valid business reason:
--     1. scheduled_datetime changed (reschedule), OR
--     2. reschedule_reason is provided, OR
--     3. status changed to CANCELLED with cancel_reason
--
--   This fixes the bug where TM/Enterprise could not
--   reschedule an interview after a student confirmed it.
--
-- Related code changes:
--   - SQL/001_create_schema.sql (trigger updated)
--   - InterviewServiceImpl.java (update() + cancel())
-- ============================================================

-- STEP 1: Recreate the fixed BR-49 trigger function
CREATE OR REPLACE FUNCTION prevent_confirmation_reversal()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.student_confirmed = TRUE AND NEW.student_confirmed = FALSE THEN
        -- Allow if scheduled time changed (rescheduling)
        IF OLD.scheduled_datetime != NEW.scheduled_datetime THEN
            RETURN NEW;
        END IF;

        -- Allow if reschedule_reason is provided
        IF NEW.reschedule_reason IS NOT NULL AND NEW.reschedule_reason != '' THEN
            RETURN NEW;
        END IF;

        -- Allow if canceling with reason
        IF NEW.status = 'CANCELLED'
           AND NEW.cancel_reason IS NOT NULL
           AND NEW.cancel_reason != '' THEN
            RETURN NEW;
        END IF;

        -- Otherwise: truly irreversible without reason
        RAISE EXCEPTION 'Interview confirmation cannot be reversed without a reschedule or cancel reason (BR-49).';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- The trigger itself (trg_confirmation_irreversible) already exists
-- on the interviews table, so we don't need to recreate it.
-- It will automatically use the new function body above.

-- STEP 2: Log the change
DO $$
BEGIN
    RAISE NOTICE 'BR-49 trigger updated: student_confirmed can now be reset when reschedule_reason or cancel_reason is provided.';
END $$;

-- ============================================================
-- TEST QUERIES (uncomment to verify)
-- ============================================================

-- Test 1: Verify trigger was updated
-- SELECT prosrc FROM pg_proc WHERE proname = 'prevent_confirmation_reversal';

-- Test 2: After fixing, workflow should work:
--   1. Student confirms interview (student_confirmed = TRUE)
--   2. TM/Enterprise reschedules -> sets reschedule_reason + student_confirmed = FALSE
--   3. Trigger allows it (has reschedule_reason)
--   4. Student confirms new schedule again

-- Test 3: Should STILL block accidental/meaningless reset:
--   UPDATE interviews SET student_confirmed = FALSE WHERE student_confirmed = TRUE AND reschedule_reason IS NULL;
--   -- Expected: ERROR: Interview confirmation cannot be reversed without a reschedule or cancel reason (BR-49).
