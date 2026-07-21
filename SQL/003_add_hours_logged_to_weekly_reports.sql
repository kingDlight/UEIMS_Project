-- ============================================================================
-- File: 003_add_hours_logged_to_weekly_reports.sql
-- Purpose: Add hours_logged column to weekly_reports so students can declare
--          how many hours they actually worked that week. Replaces the
--          hard-coded 40 in the Training Manager UI (WeeklyReportsTab).
--
-- Apply:   psql -U <user> -d <db> -f 003_add_hours_logged_to_weekly_reports.sql
-- ============================================================================

SET search_path TO public;

ALTER TABLE weekly_reports
    ADD COLUMN IF NOT EXISTS hours_logged INT
        CHECK (hours_logged IS NULL OR (hours_logged >= 0 AND hours_logged <= 168));

COMMENT ON COLUMN weekly_reports.hours_logged IS
    'Hours the student worked this week (0–168). NULL = not declared.';
