-- ============================================================
-- SQL FIX 019: Add overall_goal column to internship_plans
--
-- Purpose: Persist overallGoal in DB instead of keeping it
--          as @Transient. Previously overallGoal was passed via
--          DTO but never saved, causing it to vanish on reload.
--
-- Run after: 001_create_schema.sql
-- ============================================================

BEGIN;

ALTER TABLE internship_plans
ADD COLUMN IF NOT EXISTS overall_goal TEXT;

COMMIT;
