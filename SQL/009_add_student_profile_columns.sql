-- ===========================================================
-- MIGRATION 009: Sync student_profiles Entity ↔ DB
-- ===========================================================
-- Adds columns expected by StudentProfile entity that are
-- missing from the original 001_create_schema.sql definition.
--
-- Run this against the dev/prod database BEFORE restarting
-- the backend. Safe to re-run (uses IF NOT EXISTS).
-- ===========================================================

BEGIN;

ALTER TABLE student_profiles
    ADD COLUMN IF NOT EXISTS cv_url         VARCHAR(500),
    ADD COLUMN IF NOT EXISTS cv_file_name   VARCHAR(255),
    ADD COLUMN IF NOT EXISTS linkedin_url   VARCHAR(500),
    ADD COLUMN IF NOT EXISTS github_url     VARCHAR(500),
    ADD COLUMN IF NOT EXISTS portfolio_url  VARCHAR(500),
    ADD COLUMN IF NOT EXISTS bio            TEXT;

COMMIT;