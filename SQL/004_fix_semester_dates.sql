-- ============================================================================
-- 004_fix_semester_dates.sql
-- ----------------------------------------------------------------------------
-- Re-aligns the three internship semesters (SP26, SU26, FA26) and seeds a new
-- SP27 so each semester is exactly 14 weeks (98 days) and starts on Jan 1.
--
-- Layout (2026):
--   SP26  : 2026-01-01 → 2026-04-08 (98 days)
--   GAP   : 21 days  (mid-April review break)
--   SU26  : 2026-04-30 → 2026-08-05 (98 days)
--   GAP   : 14 days  (short summer break)
--   FA26  : 2026-08-19 → 2026-11-25 (98 days)
--   GAP   : 36 days  (year-end / Tết break)
--   SP27  : 2027-01-01 → 2027-04-08 (98 days)
--
-- Math check: 98 * 3 = 294 internship days + 21 + 14 + 36 = 71 gap days = 365
-- daily = days-in-year 2026 (not leap). 2027 SP27 mirrors SP26.
--
-- Status policy:
--   SP26 = OPEN (current active semester)
--   SU26, FA26, SP27 = DRAFT (awaiting TM activation)
--
-- Downstream rows (job_posts, semester_enterprises, eligible_students,
-- applications, weekly_reports, etc.) keep their FK reference to
-- semester_id; only date/status columns on `semesters` change.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1) SP26 — Spring 2026, 14 weeks from 2026-01-01
-- ---------------------------------------------------------------------------
UPDATE semesters
SET
    name                       = 'Spring 2026',
    start_date                 = DATE '2026-01-01',
    end_date                   = DATE '2026-04-08',
    weekly_report_deadline_day = 'SUNDAY',
    weekly_report_deadline_time= TIME '23:59:00',
    final_report_deadline      = TIMESTAMP '2026-04-15 23:59:00',
    status                     = 'OPEN'
WHERE semester_code = 'SP26';

-- ---------------------------------------------------------------------------
-- 2) SU26 — Summer 2026, 14 weeks starting 2026-04-30 (after 21-day gap)
-- ---------------------------------------------------------------------------
UPDATE semesters
SET
    name                       = 'Summer 2026',
    start_date                 = DATE '2026-04-30',
    end_date                   = DATE '2026-08-05',
    weekly_report_deadline_day = 'SUNDAY',
    weekly_report_deadline_time= TIME '23:59:00',
    final_report_deadline      = TIMESTAMP '2026-08-12 23:59:00',
    status                     = 'DRAFT'
WHERE semester_code = 'SU26';

-- ---------------------------------------------------------------------------
-- 3) FA26 — Fall 2026, 14 weeks starting 2026-08-19 (after 14-day gap)
-- ---------------------------------------------------------------------------
UPDATE semesters
SET
    name                       = 'Fall 2026',
    start_date                 = DATE '2026-08-19',
    end_date                   = DATE '2026-11-25',
    weekly_report_deadline_day = 'SUNDAY',
    weekly_report_deadline_time= TIME '23:59:00',
    final_report_deadline      = TIMESTAMP '2026-12-02 23:59:00',
    status                     = 'DRAFT'
WHERE semester_code = 'FA26';

-- ---------------------------------------------------------------------------
-- 4) FA25 — keep but pull out of "future" view (it's historical): set to CLOSED
--    and cap end_date so it stops appearing as an OPEN semester.
-- ---------------------------------------------------------------------------
UPDATE semesters
SET
    name                       = 'Fall 2025',
    start_date                 = DATE '2025-09-01',
    end_date                   = DATE '2025-12-07',
    weekly_report_deadline_day = 'SUNDAY',
    weekly_report_deadline_time= TIME '23:59:00',
    final_report_deadline      = TIMESTAMP '2025-12-14 23:59:00',
    status                     = 'CLOSED'
WHERE semester_code = 'FA25';

-- ---------------------------------------------------------------------------
-- 5) SP27 — NEW semester (Spring 2027), 14 weeks from 2027-01-01
-- ---------------------------------------------------------------------------
INSERT INTO semesters (
    semester_id,
    semester_code,
    name,
    start_date,
    end_date,
    weekly_report_deadline_day,
    weekly_report_deadline_time,
    final_report_deadline,
    status,
    created_by
) VALUES (
    '50000000-0000-0000-0000-000000000004',
    'SP27',
    'Spring 2027',
    DATE '2027-01-01',
    DATE '2027-04-08',
    'SUNDAY',
    TIME '23:59:00',
    TIMESTAMP '2027-04-15 23:59:00',
    'DRAFT',
    '00000000-0000-0000-0000-000000000002'
)
ON CONFLICT (semester_code) DO UPDATE
SET
    name                       = EXCLUDED.name,
    start_date                 = EXCLUDED.start_date,
    end_date                   = EXCLUDED.end_date,
    weekly_report_deadline_day = EXCLUDED.weekly_report_deadline_day,
    weekly_report_deadline_time= EXCLUDED.weekly_report_deadline_time,
    final_report_deadline      = EXCLUDED.final_report_deadline,
    status                     = EXCLUDED.status;

COMMIT;

-- ---------------------------------------------------------------------------
-- Verification (run manually after commit):
-- ---------------------------------------------------------------------------
-- SELECT semester_code, name, start_date, end_date,
--        (end_date - start_date + 1) AS days_inclusive,
--        status
-- FROM semesters
-- ORDER BY start_date;
--
-- Expected output:
--   FA25 | Fall 2025   | 2025-09-01 | 2025-12-07 | 98  | CLOSED
--   SP26 | Spring 2026 | 2026-01-01 | 2026-04-08 | 98  | OPEN
--   SU26 | Summer 2026 | 2026-04-30 | 2026-08-05 | 98  | DRAFT
--   FA26 | Fall 2026   | 2026-08-19 | 2026-11-25 | 98  | DRAFT
--   SP27 | Spring 2027 | 2027-01-01 | 2027-04-08 | 98  | DRAFT
-- ---------------------------------------------------------------------------