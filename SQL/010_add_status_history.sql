-- ============================================================
-- MIGRATION 010 — eligible_student_status_history
-- Audit trail for every status transition of an eligible_student.
-- Fills the gap that the eligible_students table only stores the
-- current status + updated_at; there is no way to know who moved
-- a student from PENDING -> ACCEPTED or when.
--
-- Populated by the application layer (EligibleStudentService) on
-- every status change. A safety-net trigger also records a row on
-- UPDATE so even direct DB writes are captured.
-- ============================================================

CREATE TABLE IF NOT EXISTS eligible_student_status_history (
    history_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eligible_id    UUID NOT NULL REFERENCES eligible_students(eligible_id) ON DELETE CASCADE,
    old_status     VARCHAR(20),
    new_status     VARCHAR(20) NOT NULL
                   CHECK (new_status IN ('ELIGIBLE', 'PENDING', 'ACCEPTED', 'MATCHED', 'OJT', 'CANCELLED')),
    changed_by     UUID REFERENCES users(user_id),
    reason         TEXT,
    changed_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_essh_eligible
    ON eligible_student_status_history(eligible_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_essh_changed_by
    ON eligible_student_status_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_essh_new_status
    ON eligible_student_status_history(new_status);

-- Safety-net trigger: if anything updates status without going through
-- the service layer, still capture the change. changed_by stays NULL
-- (we don't know who did it directly). The application should set
-- changed_by explicitly for proper audit attribution.
CREATE OR REPLACE FUNCTION log_eligible_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO eligible_student_status_history
            (eligible_id, old_status, new_status, changed_by, reason)
        VALUES
            (NEW.eligible_id, NULL, NEW.status, NEW.cancelled_by, 'import');
    ELSIF (TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status) THEN
        INSERT INTO eligible_student_status_history
            (eligible_id, old_status, new_status, changed_by, reason)
        VALUES
            (NEW.eligible_id, OLD.status, NEW.status, NEW.cancelled_by, NEW.cancelled_reason);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_eligible_status_change ON eligible_students;
CREATE TRIGGER trg_log_eligible_status_change
    AFTER INSERT OR UPDATE OF status ON eligible_students
    FOR EACH ROW EXECUTE FUNCTION log_eligible_status_change();

-- Backfill: record one synthetic "import" row for every existing student
-- so the timeline view is not empty after this migration is applied.
INSERT INTO eligible_student_status_history (eligible_id, old_status, new_status, reason, changed_at)
SELECT eligible_id, NULL, status, 'backfill from migration 010', imported_at
FROM eligible_students
WHERE NOT EXISTS (
    SELECT 1 FROM eligible_student_status_history h
    WHERE h.eligible_id = eligible_students.eligible_id
);
