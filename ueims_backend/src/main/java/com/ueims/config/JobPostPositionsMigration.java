package com.ueims.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

/**
 * FIX 049: Auto-applies the {@code max_positions} semantics migration on
 * application startup so operators don't need to run the SQL file by hand.
 *
 * Steps (idempotent):
 *   1. Add {@code original_max_positions} column if missing.
 *   2. Backfill it from {@code max_positions} for legacy rows.
 *   3. Recalculate {@code max_positions = max(0, original - taken)} so the UI
 *      and edit form immediately reflect the new "open slots" semantic.
 *   4. Install triggers that maintain the invariant going forward (auto-
 *      decrement on apply, auto-increment on withdraw).
 *
 * Order=0 so it runs before any seeders.
 */
@Component
@Order(0)
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class JobPostPositionsMigration implements CommandLineRunner {

    JdbcTemplate jdbc;

    @Override
    public void run(String... args) {
        try {
            log.info("[FIX 049] Applying job_posts.max_positions semantics migration...");

            jdbc.execute("ALTER TABLE job_posts "
                    + "ADD COLUMN IF NOT EXISTS original_max_positions INT");

            Integer nullCount = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM job_posts WHERE original_max_positions IS NULL",
                    Integer.class);
            if (nullCount != null && nullCount > 0) {
                jdbc.update("UPDATE job_posts SET original_max_positions = max_positions "
                        + "WHERE original_max_positions IS NULL");
            }
            jdbc.execute("ALTER TABLE job_posts "
                    + "ALTER COLUMN original_max_positions SET NOT NULL");

            // Drop legacy >0 check so runtime count can drop to 0 (full).
            // Constraint name auto-generated as job_posts_max_positions_check.
            jdbc.execute("ALTER TABLE job_posts "
                    + "DROP CONSTRAINT IF EXISTS job_posts_max_positions_check");

            jdbc.update(
                    "UPDATE job_posts jp SET max_positions = GREATEST(0, jp.max_positions - "
                    + "COALESCE((SELECT COUNT(*) FROM applications a "
                    + "WHERE a.job_post_id = jp.job_post_id "
                    + "AND a.status NOT IN ('WITHDRAWN','REJECTED_BY_STUDENT','WITHDRAWN_BY_SYSTEM') "
                    + "AND a.deleted_at IS NULL), 0))");

            jdbc.execute("CREATE OR REPLACE FUNCTION jobpost_apply_decrement() "
                    + "RETURNS TRIGGER AS $$ BEGIN "
                    + "IF NEW.deleted_at IS NULL AND NEW.status <> 'WITHDRAWN' THEN "
                    + "UPDATE job_posts SET max_positions = GREATEST(0, max_positions - 1) "
                    + "WHERE job_post_id = NEW.job_post_id; END IF; RETURN NEW; "
                    + "END; $$ LANGUAGE plpgsql");

            jdbc.execute("DROP TRIGGER IF EXISTS trg_application_decrement ON applications");
            jdbc.execute("CREATE TRIGGER trg_application_decrement AFTER INSERT ON applications "
                    + "FOR EACH ROW EXECUTE FUNCTION jobpost_apply_decrement()");

            jdbc.execute("CREATE OR REPLACE FUNCTION jobpost_apply_increment() "
                    + "RETURNS TRIGGER AS $$ BEGIN "
                    + "IF OLD.deleted_at IS NULL AND OLD.status <> 'WITHDRAWN' "
                    + "AND (NEW.deleted_at IS NOT NULL OR NEW.status = 'WITHDRAWN') THEN "
                    + "UPDATE job_posts SET max_positions = "
                    + "LEAST(original_max_positions, max_positions + 1) "
                    + "WHERE job_post_id = OLD.job_post_id; END IF; RETURN NEW; "
                    + "END; $$ LANGUAGE plpgsql");

            jdbc.execute("DROP TRIGGER IF EXISTS trg_application_increment ON applications");
            jdbc.execute("CREATE TRIGGER trg_application_increment "
                    + "AFTER UPDATE OF status, deleted_at ON applications "
                    + "FOR EACH ROW EXECUTE FUNCTION jobpost_apply_increment()");

            jdbc.execute("CREATE OR REPLACE FUNCTION jobpost_apply_reactivate() "
                    + "RETURNS TRIGGER AS $$ DECLARE current_taken BIGINT; BEGIN "
                    + "IF (OLD.deleted_at IS NOT NULL OR OLD.status = 'WITHDRAWN') "
                    + "AND NEW.deleted_at IS NULL AND NEW.status <> 'WITHDRAWN' THEN "
                    + "SELECT COUNT(*) INTO current_taken FROM applications a "
                    + "WHERE a.job_post_id = NEW.job_post_id "
                    + "AND a.deleted_at IS NULL AND a.status <> 'WITHDRAWN' "
                    + "AND a.application_id <> NEW.application_id; "
                    + "current_taken := current_taken + 1; "
                    + "UPDATE job_posts SET max_positions = "
                    + "GREATEST(0, original_max_positions - current_taken) "
                    + "WHERE job_post_id = NEW.job_post_id; END IF; RETURN NEW; "
                    + "END; $$ LANGUAGE plpgsql");

            jdbc.execute("DROP TRIGGER IF EXISTS trg_application_reactivate ON applications");
            jdbc.execute("CREATE TRIGGER trg_application_reactivate "
                    + "AFTER UPDATE OF status, deleted_at ON applications "
                    + "FOR EACH ROW EXECUTE FUNCTION jobpost_apply_reactivate()");

            log.info("[FIX 049] job_posts.max_positions migration applied successfully.");
        } catch (Exception e) {
            log.warn("[FIX 049] migration skipped or failed (likely already applied): {}",
                    e.getMessage());
        }
    }
}
