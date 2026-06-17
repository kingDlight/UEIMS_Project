-- ============================================================
-- Migration: 008 — Request Logging (BR-XXX)
-- Adds request_logs table for HTTP request audit trail.
-- Used by: RequestLoggingFilter, RequestLogCleanupService, RequestLogController
-- Retention: 7 days (DB) + 14 days (JSON file)
-- Idempotent: safe to re-run.
-- ============================================================

CREATE TABLE IF NOT EXISTS request_logs (
    id                  UUID PRIMARY KEY,
    user_id             UUID,
    user_email          VARCHAR(255),
    session_id          VARCHAR(255),
    http_method         VARCHAR(10)  NOT NULL,
    endpoint            VARCHAR(500) NOT NULL,
    status_code         INTEGER,
    ip_address          VARCHAR(45),
    user_agent          VARCHAR(500),
    response_time_ms    BIGINT,
    timestamp           TIMESTAMP    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_request_log_timestamp
    ON request_logs (timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_request_log_user_timestamp
    ON request_logs (user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_request_log_endpoint
    ON request_logs (endpoint);

-- Optional FK (only if users table exists from 001_create_schema.sql)
-- Note: users table in 001 uses "user_id" as PK (not "id")
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'fk_request_log_user'
        ) THEN
            ALTER TABLE request_logs
            ADD CONSTRAINT fk_request_log_user
            FOREIGN KEY (user_id) REFERENCES users(user_id);
        END IF;
    END IF;
END $$;
