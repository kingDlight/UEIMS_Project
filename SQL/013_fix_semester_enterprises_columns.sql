-- ============================================================
-- File: 013_fix_semester_enterprises_columns.sql
-- Purpose: Fix semester_enterprises table mismatches:
--   1. Entity expects "status" column but table has "registration_status"
--   2. Entity extends BaseEntity (needs updated_at) but table lacks it
--   3. Entity uses composite PK (semester_id + enterprise_id) but
--      table has its own UUID PK — fix by adding composite PK columns
-- ============================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'semester_enterprises'
    ) THEN

        -- 1. Add semester_id + enterprise_id columns if missing (for composite PK)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'semester_enterprises'
              AND column_name = 'semester_id'
        ) THEN
            ALTER TABLE semester_enterprises ADD COLUMN semester_id UUID;
            RAISE NOTICE 'Added semester_id column';
        ELSE
            RAISE NOTICE 'semester_id already exists';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'semester_enterprises'
              AND column_name = 'enterprise_id'
        ) THEN
            ALTER TABLE semester_enterprises ADD COLUMN enterprise_id UUID;
            RAISE NOTICE 'Added enterprise_id column';
        ELSE
            RAISE NOTICE 'enterprise_id already exists';
        END IF;

        -- 2. Rename registration_status -> status (entity expects "status")
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'semester_enterprises'
              AND column_name = 'registration_status'
        ) THEN
            ALTER TABLE semester_enterprises RENAME COLUMN registration_status TO status;
            RAISE NOTICE 'Renamed registration_status to status';
        END IF;

        -- 3. Add updated_at if missing (BaseEntity requirement)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'semester_enterprises'
              AND column_name = 'updated_at'
        ) THEN
            ALTER TABLE semester_enterprises ADD COLUMN updated_at TIMESTAMP;
            UPDATE semester_enterprises SET updated_at = COALESCE(created_at, CURRENT_TIMESTAMP) WHERE updated_at IS NULL;
            ALTER TABLE semester_enterprises ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
            ALTER TABLE semester_enterprises ALTER COLUMN updated_at SET NOT NULL;
            RAISE NOTICE 'Added updated_at to semester_enterprises';
        ELSE
            RAISE NOTICE 'updated_at already exists on semester_enterprises';
        END IF;

    END IF;
END
$$;
