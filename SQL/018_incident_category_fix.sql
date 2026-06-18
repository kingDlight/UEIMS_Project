-- ============================================================
-- Migration 018: Expand incidents category check
-- ============================================================
-- Frontend categories and their DB-normalized forms:
--   ATTENDANCE     -> PROLONGED_ABSENCE
--   ATTITUDE       -> POOR_ATTITUDE
--   CONFIDENTIALITY-> CONFIDENTIALITY_BREACH
--   PERFORMANCE    -> POOR_ATTITUDE
--   SAFETY         -> DISCIPLINARY_VIOLATION
--   OTHER          -> OTHER
-- ============================================================

ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_category_check;
ALTER TABLE incidents ADD CONSTRAINT incidents_category_check
    CHECK (category IN (
        'PROLONGED_ABSENCE', 'DISCIPLINARY_VIOLATION',
        'POOR_ATTITUDE', 'CONFIDENTIALITY_BREACH', 'OTHER'
    ));