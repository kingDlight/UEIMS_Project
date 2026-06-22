-- ============================================================
-- File: 010_add_user_sessions_device_id.sql
-- Purpose: Align user_sessions table with UserSession entity
--          (add device_id column required by single-device login
--           enforcement / BR-02 / BR-03).
-- Apply:   psql -U <user> -d <db> -f 010_add_user_sessions_device_id.sql
-- ============================================================

ALTER TABLE user_sessions
    ADD COLUMN IF NOT EXISTS device_id VARCHAR(255);

-- Backfill existing rows so the NOT NULL constraint can be added safely
UPDATE user_sessions
SET device_id = COALESCE(device_id, 'legacy-unknown-device')
WHERE device_id IS NULL;

ALTER TABLE user_sessions
    ALTER COLUMN device_id SET NOT NULL;
