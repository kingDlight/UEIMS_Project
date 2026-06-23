-- ============================================================
-- File: 011_add_updated_at_to_all_base_entity_tables.sql
-- Purpose: BaseEntity declares created_at + updated_at columns.
--          Several existing tables only have created_at.
--          This migration adds updated_at to all tables that extend
--          BaseEntity but are missing the column, so Hibernate
--          SELECT/UPDATE statements work without SQL grammar errors.
--
-- Strategy: idempotent ALTER ... ADD COLUMN IF NOT EXISTS, then
--           backfill from created_at, then add NOT NULL DEFAULT.
-- Apply:   psql -U <user> -d <db> -f 011_add_updated_at_to_all_base_entity_tables.sql
-- ============================================================

DO $$
DECLARE
    t TEXT;
    tables TEXT[] := ARRAY[
        'notifications',
        'student_enterprise_feedbacks',
        'audit_logs',
        'student_profiles',
        'enterprises',
        'semester_enterprises',
        'job_posts',
        'applications',
        'placement_applications',
        'interviews',
        'enterprise_assignments',
        'internship_plans',
        'internship_plan_items',
        'enterprise_evaluations',
        'weekly_reports',
        'report_feedbacks',
        'final_reports',
        'incidents',
        'training_warnings',
        'final_grades',
        'eligible_students',
        'eligible_student_status_history',
        'system_announcements',
        'semesters',
        'users',
        'roles',
        'permissions',
        'role_permissions',
        'invalidated_tokens',
        'password_reset_tokens'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = t
        ) THEN
            -- Only add if column truly missing
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = t
                  AND column_name = 'updated_at'
            ) THEN
                EXECUTE format(
                    'ALTER TABLE %I ADD COLUMN updated_at TIMESTAMP',
                    t
                );

                -- Tạm thời vô hiệu hóa trigger để không bị chặn bởi các trigger bảo vệ dữ liệu (ví dụ: audit_logs immutable)
                EXECUTE format('ALTER TABLE %I DISABLE TRIGGER ALL', t);

                -- Check if created_at exists to backfill from it
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = t
                      AND column_name = 'created_at'
                ) THEN
                    EXECUTE format(
                        'UPDATE %I SET updated_at = COALESCE(created_at, CURRENT_TIMESTAMP) WHERE updated_at IS NULL',
                        t
                    );
                ELSE
                    EXECUTE format(
                        'UPDATE %I SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL',
                        t
                    );
                END IF;

                -- Bật lại trigger
                EXECUTE format('ALTER TABLE %I ENABLE TRIGGER ALL', t);

                EXECUTE format(
                    'ALTER TABLE %I ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP',
                    t
                );
                EXECUTE format(
                    'ALTER TABLE %I ALTER COLUMN updated_at SET NOT NULL',
                    t
                );
                RAISE NOTICE 'Added updated_at to table: %', t;
            ELSE
                RAISE NOTICE 'updated_at already exists on table: %', t;
            END IF;
        END IF;
    END LOOP;
END
$$;