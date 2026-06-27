-- ============================================================
-- ENABLE trigger trg_interview_rules
-- Khôi phục rule validate interview sau khi test xong.
-- ============================================================

ALTER TABLE interviews ENABLE TRIGGER trg_interview_rules;
