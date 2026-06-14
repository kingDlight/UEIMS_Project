-- Migration: UC-43 — store cancel/reschedule reasons on interviews
-- Idempotent: safe to re-run.

ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS cancel_reason TEXT,
ADD COLUMN IF NOT EXISTS reschedule_reason TEXT,
ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMP;
