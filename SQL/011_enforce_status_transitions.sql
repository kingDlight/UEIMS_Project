-- ============================================================
-- MIGRATION 011 — Enforce eligible_students status state machine
-- DB previously allowed free-form status updates (except
--   OJT-from-non-ACCEPTED/MATCHED, handled by validate_ojt_approval
--   in migration 001).
-- This migration adds a stricter state machine so TM cannot roll
-- students backwards through the workflow by accident, and
-- prevents jumping multiple steps forward in one update.
--
-- Allowed transitions:
--   ELIGIBLE  -> PENDING, CANCELLED
--   PENDING   -> ACCEPTED, ELIGIBLE, CANCELLED
--   ACCEPTED  -> MATCHED,  PENDING,  CANCELLED
--   MATCHED   -> OJT,      ACCEPTED, CANCELLED
--   OJT       -> CANCELLED  (admin-only, enforced in app layer)
--   CANCELLED -> (terminal)
--
-- Initial INSERT (old_status IS NULL) always allowed.
-- ============================================================

CREATE OR REPLACE FUNCTION enforce_eligible_status_transition()
RETURNS TRIGGER AS $$
DECLARE
    allowed BOOLEAN := FALSE;
BEGIN
    -- Skip the no-op case
    IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
        RETURN NEW;
    END IF;

    -- Allow if the row was just inserted (BEFORE INSERT, OLD is NULL).
    -- The trigger is BEFORE UPDATE, so the no-op guard above covers
    -- the typical update path; we still allow any forward direction
    -- if the record is in its pristine state.
    IF OLD.status IS NULL THEN
        RETURN NEW;
    END IF;

    allowed := CASE
        WHEN OLD.status = 'ELIGIBLE'  AND NEW.status IN ('PENDING',   'CANCELLED')              THEN TRUE
        WHEN OLD.status = 'PENDING'   AND NEW.status IN ('ACCEPTED',  'ELIGIBLE', 'CANCELLED') THEN TRUE
        WHEN OLD.status = 'ACCEPTED'  AND NEW.status IN ('MATCHED',   'PENDING',  'CANCELLED') THEN TRUE
        WHEN OLD.status = 'MATCHED'   AND NEW.status IN ('OJT',       'ACCEPTED', 'CANCELLED') THEN TRUE
        WHEN OLD.status = 'OJT'       AND NEW.status =  'CANCELLED'                            THEN TRUE
        ELSE FALSE
    END;

    IF NOT allowed THEN
        RAISE EXCEPTION
            'Invalid eligible_student status transition: % -> % (BR-22/BR-23). Allowed: see migration 011.',
            OLD.status, NEW.status;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only attach if not already present (idempotent re-runs)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_eligible_status_transition'
    ) THEN
        CREATE TRIGGER trg_eligible_status_transition
            BEFORE UPDATE OF status ON eligible_students
            FOR EACH ROW EXECUTE FUNCTION enforce_eligible_status_transition();
    END IF;
END $$;
