-- ============================================================
-- Migration 018: Expand incidents category check
-- ============================================================
-- Code gửi 'ATTITUDE' nhưng DB CHECK chỉ cho phép 'POOR_ATTITUDE'.
-- Mở rộng CHECK để chấp nhận cả ATTITUDE (alias ngắn gọn).
-- ============================================================

ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_category_check;
ALTER TABLE incidents ADD CONSTRAINT incidents_category_check
    CHECK (category IN (
        'PROLONGED_ABSENCE', 'DISCIPLINARY_VIOLATION',
        'POOR_ATTITUDE', 'ATTITUDE',
        'CONFIDENTIALITY_BREACH', 'OTHER'
    ));