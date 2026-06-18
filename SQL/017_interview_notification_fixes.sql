-- ============================================================
-- Migration 017: Fix notification type check + interview status check
-- ============================================================
-- 1. notifications_type_check: thêm 4 interview-related types mà code dùng
--    nhưng không có trong CHECK gốc.
-- 2. interviews status CHECK: thêm RESCHEDULED, RESULT_RECORDED, CANCELED
--    (DB gốc có POSTPONED, code dùng RESCHEDULED)
-- ============================================================

-- 1. Mở rộng notifications type check
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
    CHECK (type IN (
        'WARNING', 'INCIDENT', 'REPORT_FEEDBACK', 'INTERVIEW_INVITE',
        'INTERVIEW_SCHEDULED', 'INTERVIEW_RESCHEDULED', 'INTERVIEW_CANCELED', 'INTERVIEW_RESULT',
        'SYSTEM_ANNOUNCEMENT', 'GRADE_PUBLISHED', 'APPROVAL', 'GENERAL'
    ));

-- 2. Mở rộng interviews status check
--    Gốc: 'SCHEDULED', 'CONFIRMED', 'POSTPONED', 'CANCELLED', 'COMPLETED'
--    Code dùng: RESCHEDULED, RESULT_RECORDED, CANCELED
ALTER TABLE interviews DROP CONSTRAINT IF EXISTS interviews_status_check;
ALTER TABLE interviews ADD CONSTRAINT interviews_status_check
    CHECK (status IN (
        'SCHEDULED', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED', 'CANCELED', 'COMPLETED', 'RESULT_RECORDED'
    ));

-- 3. Sửa chính tả trong trigger: BR-37 check result chỉ khi status=COMPLETED
--    Code dùng RESULT_RECORDED, nên cập nhật trigger để chấp nhận cả COMPLETED và RESULT_RECORDED
CREATE OR REPLACE FUNCTION validate_interview_rules()
RETURNS TRIGGER AS $$
DECLARE
    student_uuid UUID;
    ent_uuid UUID;
    has_overlap BOOLEAN;
BEGIN
    -- 1. Validate that scheduled time is in the future on INSERT or when scheduled_datetime changes (BR-35)
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.scheduled_datetime != NEW.scheduled_datetime) THEN
        IF NEW.scheduled_datetime <= CURRENT_TIMESTAMP THEN
            RAISE EXCEPTION 'Scheduled interview time must be in the future (BR-35).';
        END IF;
    END IF;

    -- 2. Validate that recruitment result is only logged after the scheduled time has started (BR-37)
    IF NEW.result IS NOT NULL AND NEW.status IN ('COMPLETED', 'RESULT_RECORDED') THEN
        IF CURRENT_TIMESTAMP < NEW.scheduled_datetime THEN
            RAISE EXCEPTION 'Cannot record interview result before the interview scheduled time has started (BR-37).';
        END IF;
    END IF;

    -- 3. Overlap Check (BR-35): Candidate student or hosting enterprise cannot have overlapping interviews
    SELECT a.student_id, jp.enterprise_id INTO student_uuid, ent_uuid
    FROM applications a
    JOIN job_posts jp ON a.job_post_id = jp.job_post_id
    WHERE a.application_id = NEW.application_id;

    SELECT EXISTS (
        SELECT 1 FROM interviews i
        JOIN applications a2 ON i.application_id = a2.application_id
        WHERE i.interview_id != COALESCE(NEW.interview_id, '00000000-0000-0000-0000-000000000000'::UUID)
          AND i.status NOT IN ('CANCELLED', 'CANCELED')
          AND a2.student_id = student_uuid
          AND NEW.scheduled_datetime < (i.scheduled_datetime + (i.duration_minutes || ' minutes')::INTERVAL)
          AND (NEW.scheduled_datetime + (NEW.duration_minutes || ' minutes')::INTERVAL) > i.scheduled_datetime
    ) INTO has_overlap;

    IF has_overlap THEN
        RAISE EXCEPTION 'Student has an overlapping interview schedule (BR-35).';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM interviews i
        JOIN applications a2 ON i.application_id = a2.application_id
        JOIN job_posts jp2 ON a2.job_post_id = jp2.job_post_id
        WHERE i.interview_id != COALESCE(NEW.interview_id, '00000000-0000-0000-0000-000000000000'::UUID)
          AND i.status NOT IN ('CANCELLED', 'CANCELED')
          AND jp2.enterprise_id = ent_uuid
          AND NEW.scheduled_datetime < (i.scheduled_datetime + (i.duration_minutes || ' minutes')::INTERVAL)
          AND (NEW.scheduled_datetime + (NEW.duration_minutes || ' minutes')::INTERVAL) > i.scheduled_datetime
    ) INTO has_overlap;

    IF has_overlap THEN
        RAISE EXCEPTION 'Enterprise has an overlapping interview schedule (BR-35).';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
