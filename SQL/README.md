# SQL Folder – UEIMS Database

This folder contains the canonical SQL files for the UEIMS PostgreSQL database.

## 📂 File Structure

```
SQL/
├── README.md                              ← this file
├── 001_create_schema.sql                  ← CANONICAL schema (run for fresh DB)
├── 002_seed_realistic_data.sql            ← optional: realistic demo data (run AFTER 001, BEFORE 003)
├── 003_legacy_patches.sql                 ← in-place upgrade for old DBs (run AFTER 001 + 002)
├── 900_disable_interview_trigger.sql     ← ops toggle (disable a specific trigger)
├── 901_enable_interview_trigger.sql      ← ops toggle (re-enable)
├── TESTING_GUIDE.md                       ← testing documentation
├── ueims_erd.dbml                         ← ERD reverse-engineered from DB
├── ERD/                                   ← per-module ERD diagrams (gitignored)
└── _archive/                              ← legacy / debug / generated files (gitignored)
```

## 🚀 Setup Guide

### Fresh database (new environment)

```bash
createdb ueims
psql -U postgres -d ueims -f 001_create_schema.sql
psql -U postgres -d ueims -f 002_seed_realistic_data.sql   # optional demo data
```

That's it. **Do NOT run `003_legacy_patches.sql`** on a fresh DB — it targets
older snapshots of `001` and is a **no-op** on the current schema.

### Upgrading an existing database (was created from an older 001)

```bash
psql -U postgres -d ueims -f 001_create_schema.sql     # forward-compatible in most cases
psql -U postgres -d ueims -f 002_seed_realistic_data.sql   # optional demo data
psql -U postgres -d ueims -f 003_legacy_patches.sql    # fixes triggers from pre-FIX-013/017/018/021
```

The `003_legacy_patches.sql` file consolidates these historical patches:

| Original file | Purpose | Merged into 002? |
|---|---|---|
| `013_fix_semester_enterprises_columns.sql` | Fix column mismatches on `semester_enterprises` | ✅ |
| `017_fix_trigger_logic.sql` | Allow MATCHED→OJT + ACCEPTED status + semesters 5 AND 6 | ✅ |
| `018_fix_br49_interview_confirm_reversal.sql` | Allow resetting `student_confirmed` with reason | ✅ |
| `021_fix_enterprise_assignment_student_status_trigger.sql` | Allow ELIGIBLE+ACCEPTED+MATCHED+OJT | ✅ |

If your DB was created from `001` **after** all these fixes were merged into
`001`, running `003` is a no-op (safe and idempotent).

## 🗑️ Legacy patches that were NO-OPS and have been deleted

These files used to add columns/constraints that are now already in the
canonical `001_create_schema.sql`. They've been deleted because running them
on a current DB does nothing:

- `011_add_updated_at_to_all_base_entity_tables.sql` (all columns already in 001)
- `012_add_created_at_to_semester_enterprises.sql` (already in 001)
- `014_add_missing_columns_for_jobpost_and_enterprise.sql` (already in 001)
- `015_add_version_to_enterprise_evaluations.sql` (already in 001)
- `019_add_overall_goal_to_internship_plans.sql` (already in 001)
- `020_add_profile_enrichment_columns_to_student_profiles.sql` (already in 001, comments merged into 001)

## 🔧 Operations

- `900_disable_interview_trigger.sql` — **emergency fallback only**. Disables
  `trg_interview_rules` wholesale so BR-35 stops blocking past-dated
  `scheduled_datetime`. Use ONLY when the preferred backdate flow below
  is not viable.
- `901_enable_interview_trigger.sql` — re-enable after running 900

### Preferred way to backdate an interview (demo / data-fix)

Instead of disabling the trigger, call the application-layer endpoint:

```
POST /api/interviews/{id}/backdate-schedule?newTime=2026-07-15T10:00:00&reason=...
```

Requires:
- Backend flag: `app.interview.demo-mode=true` in `application.properties`
  (defaults to **false** in production builds — endpoint returns 403 otherwise)
- Role: `ADMIN` or `SYSTEM_ADMIN`
- Audit fields auto-stamped: `is_backdated`, `backdated_at`, `backdated_by`, `backdated_reason`
- The BR-35 trigger has an exception that accepts the UPDATE only when all four
  audit fields are present and `backdated_reason` is at least 10 characters.
- A `POST_BACKDATE_SCHEDULE` row is also written to `audit_logs` for traceability.

The frontend exposes this via the "Demo: Backdate" button in
`InterviewScheduleTab`'s toolbar, visible only when the build-time `DEMO_MODE`
flag in that file is `true` AND the current user has an admin role.

## 🧹 What's in `_archive/` (gitignored)

Debug queries, generated artifacts, and test fixtures that aren't part of the
canonical schema. Kept around in case someone needs to recreate an old state,
but not required for normal operation:

- `debug_one_query.sql`, `debug_pass_interview_not_in_ojt.sql`
- `generated_schema.sql` (1.9 MB auto-dump — regenerate via `pg_dump`)
- `semantic_graph.json`, `semantic_graph_compressed.txt`, `semantic_graph_viewer.html`
- `generate_test_roster.py`, `test-roster-template.xlsx`
- `008_seed_perfect_demo.sql` (75 KB older seed, superseded by 016)

## ⚠️ Rules for future SQL changes

1. **Never edit a migration file after it's been applied to any environment.**
   Once a file has been run anywhere (dev/staging/prod), it is immutable.
2. **Put new schema into a new file with a higher number** (e.g., `003_…`).
3. **Always make new migrations idempotent** when possible (use
   `IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`).
4. **Update this README** to reflect the new file.
5. **Update `001_create_schema.sql`** only if you're certain all environments
   will be dropped/recreated; otherwise leave it alone and add a new file.

## 🆘 Troubleshooting

If you get an error like `column ... does not exist` after a fresh setup,
you probably applied an older version of `001`. Run `003_legacy_patches.sql`
to apply the latest trigger functions in-place.
