-- Migration: 020_add_profile_enrichment_columns_to_student_profiles.sql
-- Purpose:  Add columns introduced by entity StudentProfile enrichment (TM bulk-import).
--           Original 001_create_schema.sql lines 888-891 reference migration 019,
--           but DB runtime is missing these columns, causing:
--             InvalidDataAccessResourceUsageException: column sp1_0.address does not exist
--           on AuthenticationService.authenticate (fetching User.studentProfile).
--
-- Safe to run on a DB that already has the columns (IF NOT EXISTS is a no-op).
-- Also re-creates the CHECK constraint that 001_create_schema.sql defines.

SET search_path TO public;

ALTER TABLE student_profiles
    ADD COLUMN IF NOT EXISTS class_code    VARCHAR(50),
    ADD COLUMN IF NOT EXISTS date_of_birth DATE,
    ADD COLUMN IF NOT EXISTS gender        VARCHAR(20),
    ADD COLUMN IF NOT EXISTS address       VARCHAR(500);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_student_profiles_gender'
          AND conrelid = 'student_profiles'::regclass
    ) THEN
        ALTER TABLE student_profiles
            ADD CONSTRAINT chk_student_profiles_gender
            CHECK (gender IS NULL OR gender IN ('MALE', 'FEMALE', 'OTHER'));
    END IF;
END$$;

COMMENT ON COLUMN student_profiles.class_code    IS 'TM bulk-import enrichment (migration 019)';
COMMENT ON COLUMN student_profiles.date_of_birth IS 'TM bulk-import enrichment (migration 019)';
COMMENT ON COLUMN student_profiles.gender        IS 'TM bulk-import enrichment (migration 019)';
COMMENT ON COLUMN student_profiles.address       IS 'TM bulk-import enrichment (migration 019)';