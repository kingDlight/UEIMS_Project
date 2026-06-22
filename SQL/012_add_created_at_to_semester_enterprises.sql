-- ============================================================
-- File: 012_add_created_at_to_semester_enterprises.sql
-- Purpose: semester_enterprises table is missing created_at column
--          which BaseEntity requires. This adds it.
-- Apply:   psql -U <user> -d <db> -f 012_add_created_at_to_semester_enterprises.sql
-- ============================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'semester_enterprises'
    ) THEN
        -- Add created_at if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'semester_enterprises'
              AND column_name = 'created_at'
        ) THEN
            ALTER TABLE semester_enterprises ADD COLUMN created_at TIMESTAMP;
            UPDATE semester_enterprises SET created_at = COALESCE(registered_at, CURRENT_TIMESTAMP) WHERE created_at IS NULL;
            ALTER TABLE semester_enterprises ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
            ALTER TABLE semester_enterprises ALTER COLUMN created_at SET NOT NULL;
            RAISE NOTICE 'Added created_at to semester_enterprises';
        ELSE
            RAISE NOTICE 'created_at already exists on semester_enterprises';
        END IF;
    END IF;
END
$$;
