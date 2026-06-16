-- Migration: UC-45 — supervisor / internship window info on enterprise_assignments
-- Idempotent: safe to re-run.

ALTER TABLE enterprise_assignments
ADD COLUMN IF NOT EXISTS supervisor_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS supervisor_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;
