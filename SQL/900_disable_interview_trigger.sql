-- ============================================================
-- DISABLE trigger trg_interview_rules
-- Mục đích: bypass toàn bộ rule interview (BR-35, BR-37, overlap)
--           để test record result khi scheduled_datetime trong quá khứ.
-- Chạy file 901 để ENABLE lại sau khi test xong.
-- ============================================================

ALTER TABLE interviews DISABLE TRIGGER trg_interview_rules;
