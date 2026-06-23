package com.ueims.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseMigrationRunner implements CommandLineRunner {
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            // Find the auto-generated check constraint name for status
            String constraintName = jdbcTemplate.queryForObject(
                    "SELECT conname FROM pg_constraint WHERE conrelid = 'eligible_students'::regclass AND pg_get_constraintdef(oid) ILIKE '%status%' AND contype = 'c' LIMIT 1",
                    String.class);
            if (constraintName != null) {
                log.info(
                        "Found check constraint {} on eligible_students.status. Dropping and recreating...",
                        constraintName);
                jdbcTemplate.execute("ALTER TABLE eligible_students DROP CONSTRAINT " + constraintName);
            }
        } catch (Exception e) {
            log.debug("No existing constraint found or error fetching it: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute(
                    "ALTER TABLE eligible_students ADD CONSTRAINT chk_elig_status CHECK (status IN ('ELIGIBLE', 'NOT_ELIGIBLE', 'PENDING', 'ACCEPTED', 'MATCHED', 'OJT', 'CANCELLED'))");
            log.info("Successfully updated status check constraint to include NOT_ELIGIBLE.");
        } catch (Exception e) {
            log.debug("Constraint might already exist or error adding it: {}", e.getMessage());
        }

        // Add missing deferred columns from earlier commits (since ddl-auto=update might fail on some setups)
        try {
            jdbcTemplate.execute("ALTER TABLE eligible_students ADD COLUMN IF NOT EXISTS deferred_reason TEXT");
            jdbcTemplate.execute(
                    "ALTER TABLE eligible_students ADD COLUMN IF NOT EXISTS deferred_by UUID REFERENCES users(user_id)");
            jdbcTemplate.execute("ALTER TABLE eligible_students ADD COLUMN IF NOT EXISTS deferred_at TIMESTAMP");
            log.info("Ensured deferred columns exist.");
        } catch (Exception e) {
            log.debug("Error adding deferred columns: {}", e.getMessage());
        }
    }
}
