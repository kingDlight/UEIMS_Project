-- Migration: Add version column for EnterpriseEvaluation optimistic locking
-- Fixes: column "ee1_0.version does not exist" when submitting enterprise evaluation
-- Reason: EnterpriseEvaluation entity has @Version but table is missing the column

ALTER TABLE enterprise_evaluations
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
