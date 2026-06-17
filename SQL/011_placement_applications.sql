-- ============================================================
-- Migration 011: Placement Applications (OJT Self-Apply workflow)
--
-- Workflow:
--   SV (eligible) → submit application
--      → PENDING_APPROVAL
--         ├─ TM Approve → APPROVED + auto-create enterprise_assignments(ACTIVE)
--         ├─ TM Reject  → REJECTED  + rejection_reason (mandatory)
--         └─ SV Withdraw → WITHDRAWN
--
-- Status set is restrictive on purpose; legacy enterprise_assignments
-- ACTIVE/COMPLETED/CANCELLED lifecycle stays untouched.
-- ============================================================

CREATE TABLE IF NOT EXISTS placement_applications (
    application_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id         UUID NOT NULL REFERENCES users(user_id),
    enterprise_id      UUID NOT NULL REFERENCES enterprises(enterprise_id),
    semester_id        UUID NOT NULL REFERENCES semesters(semester_id),

    -- Workflow status. PENDING_APPROVAL = chờ TM; APPROVED = đã match với DN;
    -- REJECTED = TM bác (kèm lý do); WITHDRAWN = SV tự rút.
    status             VARCHAR(20) NOT NULL DEFAULT 'PENDING_APPROVAL',
    CONSTRAINT chk_placement_app_status CHECK (
        status IN ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'WITHDRAWN')
    ),

    -- Lý do SV muốn apply (do SV nhập)
    cover_letter       TEXT,

    -- Audit duyệt (do TM)
    reviewed_by        UUID REFERENCES users(user_id),
    reviewed_at        TIMESTAMP,
    rejection_reason   TEXT,
    CONSTRAINT chk_reject_reason_required CHECK (
        status <> 'REJECTED' OR (rejection_reason IS NOT NULL AND length(trim(rejection_reason)) >= 5)
    ),

    -- Audit chung (BaseEntity-style)
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by         UUID REFERENCES users(user_id),
    updated_by         UUID REFERENCES users(user_id),

    -- 1 SV chỉ được apply 1 lần vào 1 DN trong cùng 1 kỳ
    CONSTRAINT uq_placement_app_per_student_enterprise_semester
        UNIQUE (student_id, enterprise_id, semester_id)
);

-- Index cho query phổ biến
CREATE INDEX IF NOT EXISTS idx_app_student_status
    ON placement_applications(student_id, status);

CREATE INDEX IF NOT EXISTS idx_app_status_semester
    ON placement_applications(status, semester_id);

CREATE INDEX IF NOT EXISTS idx_app_enterprise_semester
    ON placement_applications(enterprise_id, semester_id);

-- Updated_at tự động refresh
CREATE OR REPLACE FUNCTION trg_set_updated_at_placement_applications()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_placement_applications_updated_at ON placement_applications;
CREATE TRIGGER trg_placement_applications_updated_at
    BEFORE UPDATE ON placement_applications
    FOR EACH ROW
    EXECUTE FUNCTION trg_set_updated_at_placement_applications();

-- ============================================================
-- Backfill (optional, idempotent): map SV đang ACTIVE trong
-- enterprise_assignments thành 1 application APPROVED "legacy"
-- để data hiện có hiển thị được trên UI. KHÔNG bắt buộc.
-- Bỏ comment block dưới nếu muốn chạy.
-- ============================================================
/*
INSERT INTO placement_applications (
    student_id, enterprise_id, semester_id, status,
    cover_letter, reviewed_by, reviewed_at
)
SELECT
    ea.student_id, ea.enterprise_id, ea.semester_id,
    'APPROVED', 'Legacy backfill from existing assignment',
    ea.assigned_by, ea.created_at
FROM enterprise_assignments ea
WHERE NOT EXISTS (
    SELECT 1 FROM placement_applications pa
    WHERE pa.student_id = ea.student_id
      AND pa.enterprise_id = ea.enterprise_id
      AND pa.semester_id = ea.semester_id
);
*/