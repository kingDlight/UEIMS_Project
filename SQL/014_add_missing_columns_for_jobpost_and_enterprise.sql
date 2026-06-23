-- ============================================================
-- File: 014_add_missing_columns_for_jobpost_and_enterprise.sql
-- Purpose: Add missing columns that were mapped in entities
--          (created_by in job_posts, website in enterprises)
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'job_posts'
          AND column_name = 'created_by'
    ) THEN
        ALTER TABLE job_posts ADD COLUMN created_by UUID;
        RAISE NOTICE 'Added created_by column to job_posts';
    ELSE
        RAISE NOTICE 'created_by already exists on job_posts';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'enterprises'
          AND column_name = 'website'
    ) THEN
        ALTER TABLE enterprises ADD COLUMN website VARCHAR(255);
        RAISE NOTICE 'Added website column to enterprises';
    ELSE
        RAISE NOTICE 'website already exists on enterprises';
    END IF;
END
$$;
