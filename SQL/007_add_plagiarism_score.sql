-- Migration: UC-48 / BR-58 — plagiarism tracking on weekly reports
-- Idempotent: safe to re-run.

ALTER TABLE weekly_reports
ADD COLUMN IF NOT EXISTS plagiarism_score DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS is_anomaly BOOLEAN NOT NULL DEFAULT FALSE;
