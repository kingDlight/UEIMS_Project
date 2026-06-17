-- ============================================================
-- Migration 014: Self-Replace + Auto-Match support
-- ============================================================
-- Adds columns to support:
--   1. Self-Replace workflow (SV đang OJT muốn đổi DN)
--   2. Manual/Auto-Match (không cần thêm cột mới, dùng existing fields)
-- ============================================================

-- 1. placement_applications: thêm cột đánh dấu replacement
ALTER TABLE placement_applications
    ADD COLUMN IF NOT EXISTS is_replacement BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE placement_applications
    ADD COLUMN IF NOT EXISTS replaces_application_id UUID
    REFERENCES placement_applications(application_id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_pa_is_replacement
    ON placement_applications(is_replacement)
    WHERE is_replacement = TRUE;

-- 2. enterprise_assignments: thêm cột termination + replacement chain
ALTER TABLE enterprise_assignments
    ADD COLUMN IF NOT EXISTS termination_reason TEXT;

ALTER TABLE enterprise_assignments
    ADD COLUMN IF NOT EXISTS terminated_at TIMESTAMP;

ALTER TABLE enterprise_assignments
    ADD COLUMN IF NOT EXISTS replaced_by_assignment_id UUID
    REFERENCES enterprise_assignments(assignment_id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_ea_status
    ON enterprise_assignments(status);

-- 3. Comment cho documentation
COMMENT ON COLUMN placement_applications.is_replacement IS
    'TRUE if this application requires replacing the current ACTIVE assignment (Self-Replace workflow)';

COMMENT ON COLUMN placement_applications.replaces_application_id IS
    'The previously APPROVED application that this application replaces.';

COMMENT ON COLUMN enterprise_assignments.termination_reason IS
    'Reason for assignment being terminated (e.g. Replaced by new placement, Student withdrawal)';

COMMENT ON COLUMN enterprise_assignments.terminated_at IS
    'The time when the assignment is terminated';

COMMENT ON COLUMN enterprise_assignments.replaced_by_assignment_id IS
    'A new assignment replaces this one (only if terminated due to replacement).';
