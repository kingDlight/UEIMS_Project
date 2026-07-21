-- ============================================================================
-- File: 004_internship_plan_revision.sql
-- Purpose: Add revision_note + revision_count + audit log for InternshipPlan
--          so Enterprise can re-submit after TM reject with a reason
--          describing what changed.
--
-- USAGE:
--   - Fresh database?  → Re-run 001_create_schema.sql (already includes these
--     changes below). This file is a no-op.
--   - Existing database?  → Run this file once. Idempotent.
--
-- Apply:   psql -U <user> -d <db> -f 004_internship_plan_revision.sql
-- ============================================================================

SET search_path TO public;

-- ============================================================================
-- BLOCK 1: Add columns to internship_plans
--   - revision_note       : lý do revise (Enterprise nhập khi re-submit)
--   - revision_count      : đếm số lần revise (tăng mỗi lần re-submit sau reject)
--   - last_revision_at    : timestamp lần revise gần nhất
--   - last_reviewed_by    : user gần nhất đã review (reject/approve)
--   - last_reviewed_at    : timestamp review gần nhất
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'internship_plans'
          AND column_name = 'revision_note'
    ) THEN
        ALTER TABLE internship_plans ADD COLUMN revision_note TEXT;
        RAISE NOTICE '[004] Added column internship_plans.revision_note';
    ELSE
        RAISE NOTICE '[004] Column internship_plans.revision_note already exists';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'internship_plans'
          AND column_name = 'revision_count'
    ) THEN
        ALTER TABLE internship_plans ADD COLUMN revision_count INT NOT NULL DEFAULT 0;
        RAISE NOTICE '[004] Added column internship_plans.revision_count';
    ELSE
        RAISE NOTICE '[004] Column internship_plans.revision_count already exists';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'internship_plans'
          AND column_name = 'last_revision_at'
    ) THEN
        ALTER TABLE internship_plans ADD COLUMN last_revision_at TIMESTAMP;
        RAISE NOTICE '[004] Added column internship_plans.last_revision_at';
    ELSE
        RAISE NOTICE '[004] Column internship_plans.last_revision_at already exists';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'internship_plans'
          AND column_name = 'last_reviewed_by'
    ) THEN
        ALTER TABLE internship_plans ADD COLUMN last_reviewed_by UUID REFERENCES users(user_id);
        RAISE NOTICE '[004] Added column internship_plans.last_reviewed_by';
    ELSE
        RAISE NOTICE '[004] Column internship_plans.last_reviewed_by already exists';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'internship_plans'
          AND column_name = 'last_reviewed_at'
    ) THEN
        ALTER TABLE internship_plans ADD COLUMN last_reviewed_at TIMESTAMP;
        RAISE NOTICE '[004] Added column internship_plans.last_reviewed_at';
    ELSE
        RAISE NOTICE '[004] Column internship_plans.last_reviewed_at already exists';
    END IF;
END $$;


-- ============================================================================
-- BLOCK 2: Create audit log table
--   Ghi lại mỗi lần TM reject/approve + mỗi lần Enterprise revise.
--   Giữ lịch sử đầy đủ ngay cả khi plan bị re-submit (ghi đè status).
-- ============================================================================

CREATE TABLE IF NOT EXISTS internship_plan_revisions (
    revision_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id          UUID NOT NULL REFERENCES internship_plans(plan_id) ON DELETE CASCADE,
    actor_id         UUID NOT NULL REFERENCES users(user_id),       -- người thực hiện hành động
    actor_role       VARCHAR(30) NOT NULL,                          -- ENTERPRISE | TRAINING_MANAGER
    action           VARCHAR(30) NOT NULL
                      CHECK (action IN ('SUBMITTED', 'REVISED', 'APPROVED', 'REJECTED')),
    note             TEXT,                                          -- revision_note (enterprise) hoặc rejection_reason (TM)
    from_status      VARCHAR(30),
    to_status        VARCHAR(30) NOT NULL,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_plan_revisions_plan_id ON internship_plan_revisions(plan_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_plan_revisions_action  ON internship_plan_revisions(plan_id, action);

COMMENT ON TABLE internship_plan_revisions IS
    '[004] Audit log for InternshipPlan submissions, revisions, and TM reviews. Preserves history even when plan is overwritten.';
COMMENT ON COLUMN internship_plan_revisions.action IS
    'SUBMITTED (Enterprise first save) | REVISED (Enterprise re-submit after REJECTED) | APPROVED | REJECTED';


-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
    has_note        BOOLEAN;
    has_count       BOOLEAN;
    has_audit       BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='internship_plans' AND column_name='revision_note'
    ) INTO has_note;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='internship_plans' AND column_name='revision_count'
    ) INTO has_count;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema='public' AND table_name='internship_plan_revisions'
    ) INTO has_audit;

    RAISE NOTICE '========================================================';
    RAISE NOTICE '[004] Verification:';
    RAISE NOTICE '  - internship_plans.revision_note present : %', has_note;
    RAISE NOTICE '  - internship_plans.revision_count present: %', has_count;
    RAISE NOTICE '  - internship_plan_revisions table exists  : %', has_audit;
    RAISE NOTICE '========================================================';
END $$;