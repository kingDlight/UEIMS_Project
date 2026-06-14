-- Migration: UC-40 — track CV download count on applications (POST-2 of UC-40)
-- BR-32: Enterprises can only download CVs of students who applied to their posts.
-- Idempotent: safe to re-run.

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS cv_download_count INT NOT NULL DEFAULT 0;
