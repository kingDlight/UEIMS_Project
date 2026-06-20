-- ============================================================
-- UEIMS - University Enterprise Internship Management System
-- Database Schema (PostgreSQL) — VERSION 4.1 FINAL (Auth Overhaul)
-- Author: Đỗ Minh Gia Bảo
-- Created: 2026-05-23 | Updated: 2026-05-26
-- ============================================================
-- Tech Stack: React + TypeScript | Java Spring Boot | PostgreSQL
-- PK Strategy: UUID (gen_random_uuid) (Except Auth tables)
-- Delete Strategy: Soft Delete (deleted_at column)
-- Total: 29 Tables + 2 Views + 16 Triggers
-- Coverage: 66/66 UCs + 55/55 BRs
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- MODULE 1: AUTHENTICATION & USER MANAGEMENT
-- Covers: UC-01 → UC-13
-- Business Rules: BR-01 → BR-07
-- ============================================================

-- TABLE 1: roles
CREATE TABLE roles (
    role_name       VARCHAR(50) PRIMARY KEY,
    description     VARCHAR(500),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed default roles (Reduced to 4 Roles in V4.0)
INSERT INTO roles (role_name, description) VALUES
    ('ADMIN', 'System Administrator - manages accounts, roles, and system security'),
    ('TRAINING_MANAGER', 'Training Manager - manages semesters, student lists, grades, and incidents'),
    ('ENTERPRISE', 'Enterprise Admin/Supervisor - manages job posts, recruitment, and internship training'),
    ('STUDENT', 'Student - applies for internships, submits reports, and tracks progress');

-- TABLE 2: permissions
CREATE TABLE permissions (
    permission_name VARCHAR(100) PRIMARY KEY,
    description     VARCHAR(500),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- TABLE 3: role_permissions
CREATE TABLE role_permissions (
    role_name       VARCHAR(50) REFERENCES roles(role_name) ON DELETE CASCADE,
    permission_name VARCHAR(100) REFERENCES permissions(permission_name) ON DELETE CASCADE,
    PRIMARY KEY (role_name, permission_name)
);

-- TABLE 4: users
-- Central table for all 4 actor types.
CREATE TABLE users (
    user_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,                    -- BR-05: Unique email
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE', 'INACTIVE', 'LOCKED')),
    failed_login_attempts   INT NOT NULL DEFAULT 0                   -- BR-01: Lock after 5 failed attempts
                    CHECK (failed_login_attempts >= 0),
    locked_until            TIMESTAMP,                               -- BR-01: Lock for 30 minutes
    must_change_password    BOOLEAN NOT NULL DEFAULT TRUE,            -- BR-04: Force change on first login
    password_changed_at     TIMESTAMP,                               -- UC-05: Track password change time
    enterprise_id           UUID,                                    -- FK set later (for ENTERPRISE roles)
    last_login_at           TIMESTAMP,                               -- Track last successful login
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP                                        -- Soft delete
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_deleted ON users(deleted_at);

-- TABLE 5: users_roles
-- BR-06: Single Role Assignment (enforced by user_id primary key)
CREATE TABLE users_roles (
    user_id         UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    role_name       VARCHAR(50) REFERENCES roles(role_name) ON DELETE CASCADE
);

-- TABLE 6: invalidated_tokens
-- JWT Blacklist for Stateless Architecture
CREATE TABLE invalidated_tokens (
    token_id        VARCHAR(255) PRIMARY KEY, -- JWT ID (jti)
    expires_at      TIMESTAMP NOT NULL,
    invalidated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tokens_expiry ON invalidated_tokens(expires_at);

-- TABLE 7: password_reset_tokens
CREATE TABLE password_reset_tokens (
    token_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) NOT NULL,
    expires_at      TIMESTAMP NOT NULL,
    is_used         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prt_user ON password_reset_tokens(user_id);

-- TABLE 8: audit_logs
-- Immutable system activity log. BR-07: Append-only, no UPDATE/DELETE.
CREATE TABLE audit_logs (
    log_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(user_id) ON DELETE SET NULL,
    action          VARCHAR(100) NOT NULL,
    target_entity   VARCHAR(100),
    target_id       UUID,
    old_value       TEXT,
    new_value       TEXT,
    ip_address      VARCHAR(45),
    user_agent      VARCHAR(500),
    timestamp       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP     -- BR-23: Action logging
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- TRIGGER: BR-07 — Audit logs are immutable (append-only, no UPDATE/DELETE)
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable. Cannot UPDATE or DELETE.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_immutable
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();


-- ============================================================
-- MODULE 2: SEMESTER & TRAINING MANAGEMENT
-- Covers: UC-14 → UC-30
-- Business Rules: BR-08 → BR-28
-- ============================================================

-- TABLE 9: semesters
CREATE TABLE semesters (
    semester_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    semester_code   VARCHAR(20) NOT NULL UNIQUE,                     -- BR-08: Unique code
    name            VARCHAR(255) NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    weekly_report_deadline_day   VARCHAR(10) DEFAULT 'SUNDAY'
                    CHECK (weekly_report_deadline_day IN ('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY')),
    weekly_report_deadline_time  TIME DEFAULT '23:59:00',
    final_report_deadline        TIMESTAMP,                                  -- BR-51: Final report deadline
    status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT'             -- BR-10: Default = Draft
                    CHECK (status IN ('DRAFT', 'OPEN', 'ACTIVE', 'CLOSED', 'LOCKED')),  -- BR-13
    created_by      UUID NOT NULL REFERENCES users(user_id),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP,

    CONSTRAINT chk_semester_dates CHECK (start_date < end_date)      -- BR-09
);

CREATE INDEX idx_semesters_code ON semesters(semester_code);
CREATE INDEX idx_semesters_status ON semesters(status);

-- TRIGGER: BR-12 — Prevent modifying dates of Active/Closed/Locked semesters
CREATE OR REPLACE FUNCTION prevent_active_semester_date_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IN ('ACTIVE', 'CLOSED', 'LOCKED') AND 
       (OLD.start_date != NEW.start_date OR OLD.end_date != NEW.end_date) THEN
        RAISE EXCEPTION 'Cannot modify dates of semester with status: %', OLD.status;
    END IF;
    -- BR-11: LOCKED = fully read-only (block ALL column changes except status itself)
    IF OLD.status = 'LOCKED' AND NEW.status = 'LOCKED' THEN
        RAISE EXCEPTION 'Semester is LOCKED. No modifications allowed.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_semester_date_protection
    BEFORE UPDATE ON semesters
    FOR EACH ROW EXECUTE FUNCTION prevent_active_semester_date_change();

-- TRIGGER: BR-13 — Semester status state machine (forward-only transitions)
CREATE OR REPLACE FUNCTION enforce_semester_state_machine()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status != OLD.status THEN
        IF NOT (
            (OLD.status = 'DRAFT'  AND NEW.status = 'OPEN')   OR
            (OLD.status = 'OPEN'   AND NEW.status = 'ACTIVE') OR
            (OLD.status = 'ACTIVE' AND NEW.status = 'CLOSED') OR
            (OLD.status = 'CLOSED' AND NEW.status = 'LOCKED')
        ) THEN
            RAISE EXCEPTION 'Invalid semester status transition: % → %', OLD.status, NEW.status;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_semester_state_machine
    BEFORE UPDATE ON semesters
    FOR EACH ROW EXECUTE FUNCTION enforce_semester_state_machine();

-- TRIGGER: BR-10 — Newly created semesters must start with DRAFT status
CREATE OR REPLACE FUNCTION enforce_initial_semester_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status != 'DRAFT' THEN
        RAISE EXCEPTION 'Newly created semesters must start with DRAFT status (BR-10).';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_initial_semester_status
    BEFORE INSERT ON semesters
    FOR EACH ROW EXECUTE FUNCTION enforce_initial_semester_status();

-- TABLE 10: eligible_students
CREATE TABLE eligible_students (
    eligible_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    semester_id     UUID NOT NULL REFERENCES semesters(semester_id),
    user_id         UUID REFERENCES users(user_id),                  -- Linked when account is created
    student_code    VARCHAR(20) NOT NULL,                            -- BR-17: Mandatory
    full_name       VARCHAR(255) NOT NULL,                           -- BR-17: Mandatory
    email           VARCHAR(255),                                    -- For auto-creating accounts
    major           VARCHAR(255) NOT NULL,                           -- BR-17: Mandatory
    gpa             TYPE DECIMAL(4,2),                               -- BR-17, BR-19: >= 2.0
    current_semester INT NOT NULL CHECK (current_semester BETWEEN 1 AND 9), -- BR-54: Semester-based access
    status          VARCHAR(20) NOT NULL DEFAULT 'ELIGIBLE'
                    CHECK (status IN ('ELIGIBLE', 'PENDING', 'ACCEPTED', 'MATCHED', 'OJT', 'CANCELLED')),
    is_locked       BOOLEAN NOT NULL DEFAULT FALSE,                  -- BR-21
    imported_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at     TIMESTAMP,
    cancelled_reason TEXT,
    cancelled_by    UUID REFERENCES users(user_id),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_gpa_minimum CHECK (gpa >= 5.0 AND gpa <= 10.0),                  -- BR-19
    CONSTRAINT uq_student_semester UNIQUE (semester_id, student_code),
    -- BR-23: Cancelled must have reason + who cancelled
    CONSTRAINT chk_cancel_audit CHECK (
        status != 'CANCELLED' OR (cancelled_reason IS NOT NULL AND cancelled_by IS NOT NULL)
    )
);

CREATE INDEX idx_eligible_semester ON eligible_students(semester_id);
CREATE INDEX idx_eligible_status ON eligible_students(status);

-- Prevent mapping the same user_id to multiple eligible student records in the same semester
CREATE UNIQUE INDEX uq_eligible_user_semester 
    ON eligible_students(semester_id, user_id) 
    WHERE user_id IS NOT NULL;

UPDATE eligible_students
SET gpa = ROUND(gpa * 2.5, 2)
WHERE gpa <= 4.0;

-- TRIGGER: BR-22 — OJT approval only for ACCEPTED/MATCHED students
-- BR-21: Auto-lock record when status changes to OJT
CREATE OR REPLACE FUNCTION validate_ojt_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'OJT' AND OLD.status NOT IN ('ACCEPTED', 'MATCHED') THEN
        RAISE EXCEPTION 'Can only approve OJT for ACCEPTED/MATCHED students, current: %', OLD.status;
    END IF;
    
    IF NEW.status = 'OJT' THEN
        NEW.is_locked := TRUE;
        NEW.approved_at := CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_ojt
    BEFORE UPDATE ON eligible_students
    FOR EACH ROW EXECUTE FUNCTION validate_ojt_approval();

-- TRIGGER: BR-21 — Prevent modifications when is_locked = TRUE
CREATE OR REPLACE FUNCTION prevent_locked_student_edit()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_locked = TRUE THEN
        -- Allow only status transition to CANCELLED
        IF NEW.status != 'CANCELLED' THEN
            RAISE EXCEPTION 'Student record is locked. Cannot modify status to % (BR-21).', NEW.status;
        END IF;

        -- Enforce Admin validation if transitioning from OJT to CANCELLED (BR-24)
        IF OLD.status = 'OJT' AND NEW.status = 'CANCELLED' THEN
            IF NEW.cancelled_by IS NULL THEN
                RAISE EXCEPTION 'cancelled_by must be specified when cancelling an active OJT student (BR-24).';
            END IF;
            IF NOT EXISTS (
                SELECT 1 FROM users_roles
                WHERE user_id = NEW.cancelled_by AND role_name = 'ADMIN'
            ) THEN
                RAISE EXCEPTION 'Only System Administrators can cancel an active OJT student (BR-24).';
            END IF;
        END IF;

        -- Prevent modification of identity columns
        -- (gpa, full_name, email, major được phép update)
        IF OLD.eligible_id != NEW.eligible_id OR
           OLD.semester_id != NEW.semester_id OR
           OLD.user_id IS DISTINCT FROM NEW.user_id OR
           OLD.student_code != NEW.student_code OR
           OLD.imported_at != NEW.imported_at THEN
            RAISE EXCEPTION 'Student record is locked. Only profile fields (gpa, name, email, major) and status can be updated.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_locked_student_edit
    BEFORE UPDATE ON eligible_students
    FOR EACH ROW EXECUTE FUNCTION prevent_locked_student_edit();

-- TABLE 10.1: eligible_student_status_history
CREATE TABLE IF NOT EXISTS eligible_student_status_history (
    history_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eligible_id    UUID NOT NULL REFERENCES eligible_students(eligible_id) ON DELETE CASCADE,
    old_status     VARCHAR(20),
    new_status     VARCHAR(20) NOT NULL
                   CHECK (new_status IN ('ELIGIBLE', 'PENDING', 'ACCEPTED', 'MATCHED', 'OJT', 'CANCELLED')),
    changed_by     UUID REFERENCES users(user_id),
    reason         TEXT,
    changed_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_essh_eligible
    ON eligible_student_status_history(eligible_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_essh_changed_by
    ON eligible_student_status_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_essh_new_status
    ON eligible_student_status_history(new_status);

-- Safety-net trigger: if anything updates status without going through
-- the service layer, still capture the change. changed_by stays NULL
-- (we don't know who did it directly). The application should set
-- changed_by explicitly for proper audit attribution.
CREATE OR REPLACE FUNCTION log_eligible_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO eligible_student_status_history
            (eligible_id, old_status, new_status, changed_by, reason)
        VALUES
            (NEW.eligible_id, NULL, NEW.status, NEW.cancelled_by, 'import');
    ELSIF (TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status) THEN
        INSERT INTO eligible_student_status_history
            (eligible_id, old_status, new_status, changed_by, reason)
        VALUES
            (NEW.eligible_id, OLD.status, NEW.status, NEW.cancelled_by, NEW.cancelled_reason);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_eligible_status_change ON eligible_students;
CREATE TRIGGER trg_log_eligible_status_change
    AFTER INSERT OR UPDATE OF status ON eligible_students
    FOR EACH ROW EXECUTE FUNCTION log_eligible_status_change();

-- Backfill: record one synthetic "import" row for every existing student
-- so the timeline view is not empty after this migration is applied.
INSERT INTO eligible_student_status_history (eligible_id, old_status, new_status, reason, changed_at)
SELECT eligible_id, NULL, status, 'backfill from migration 010', imported_at
FROM eligible_students
WHERE NOT EXISTS (
    SELECT 1 FROM eligible_student_status_history h
    WHERE h.eligible_id = eligible_students.eligible_id
);

-- TABLE 11: system_announcements
CREATE TABLE system_announcements (
    announcement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    semester_id     UUID REFERENCES semesters(semester_id),
    title           VARCHAR(500) NOT NULL,
    content         TEXT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                    CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    created_by      UUID NOT NULL REFERENCES users(user_id),
    published_at    TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP,
    type            VARCHAR(30),
    audience        VARCHAR(30),
    target_role     VARCHAR(30)
);

UPDATE system_announcements
SET type        = COALESCE(type, 'SYSTEM_ANNOUNCEMENT'),
    audience    = COALESCE(audience, 'ALL'),
    target_role = COALESCE(target_role, NULL)
WHERE type IS NULL OR audience IS NULL;


-- ============================================================
-- MODULE 3: ENTERPRISE & RECRUITMENT
-- Covers: UC-31 → UC-41
-- Business Rules: BR-29 → BR-37
-- ============================================================

-- TABLE 12: enterprises
CREATE TABLE enterprises (
    enterprise_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name    VARCHAR(500) NOT NULL,
    tax_code        VARCHAR(50),
    industry        VARCHAR(255),
    company_size    VARCHAR(50),
    description     TEXT,
    address         TEXT,
    logo_url        VARCHAR(1000),
    contact_person_name     VARCHAR(255),
    contact_person_email    VARCHAR(255),
    contact_person_phone    VARCHAR(20),
    approval_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                    CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    rejection_reason TEXT,                                           -- BR-15: Mandatory when rejected
    approved_by     UUID REFERENCES users(user_id),
    approved_at     TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP,

    -- BR-15: Rejection reason is mandatory when status = REJECTED
    CONSTRAINT chk_enterprise_rejection_reason CHECK (
        approval_status != 'REJECTED' OR (rejection_reason IS NOT NULL AND LENGTH(rejection_reason) > 0)
    )
);

-- Add FK from users.enterprise_id to enterprises
ALTER TABLE users
    ADD CONSTRAINT fk_users_enterprise
    FOREIGN KEY (enterprise_id) REFERENCES enterprises(enterprise_id);

CREATE INDEX idx_enterprises_status ON enterprises(approval_status);

-- TABLE 13: semester_enterprises
CREATE TABLE semester_enterprises (
    semester_enterprise_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    semester_id     UUID NOT NULL REFERENCES semesters(semester_id),
    enterprise_id   UUID NOT NULL REFERENCES enterprises(enterprise_id),
    registration_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                    CHECK (registration_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    rejection_reason TEXT,
    reviewed_by     UUID REFERENCES users(user_id),
    reviewed_at     TIMESTAMP,
    registered_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_semester_enterprise UNIQUE (semester_id, enterprise_id),
    CONSTRAINT chk_se_rejection_reason CHECK (
        registration_status != 'REJECTED' OR (rejection_reason IS NOT NULL AND LENGTH(rejection_reason) > 0)
    )
);

CREATE INDEX idx_se_semester ON semester_enterprises(semester_id);
CREATE INDEX idx_se_enterprise ON semester_enterprises(enterprise_id);

-- TABLE 14: job_posts
CREATE TABLE job_posts (
    job_post_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id   UUID NOT NULL REFERENCES enterprises(enterprise_id),  -- BR-29: Post ownership
    semester_id     UUID NOT NULL REFERENCES semesters(semester_id),
    title           VARCHAR(500) NOT NULL,
    description     TEXT NOT NULL,
    requirements    TEXT,
    benefits        TEXT,
    required_technologies   TEXT,
    max_positions   INT NOT NULL DEFAULT 1 CHECK (max_positions > 0),
    application_deadline    DATE,
    status          VARCHAR(20) NOT NULL DEFAULT 'OPEN'
                    CHECK (status IN ('OPEN', 'CLOSED')),            -- BR-30
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP
);

CREATE INDEX idx_jobposts_enterprise ON job_posts(enterprise_id);
CREATE INDEX idx_jobposts_semester ON job_posts(semester_id);
CREATE INDEX idx_jobposts_status ON job_posts(status);

-- TABLE 15: applications
CREATE TABLE applications (
    application_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_post_id     UUID NOT NULL REFERENCES job_posts(job_post_id),
    student_id      UUID NOT NULL REFERENCES users(user_id),
    cv_file_url     VARCHAR(1000) NOT NULL,                          -- BR-31: PDF format
    cv_snapshot_url VARCHAR(1000),                                   -- BR-47: Snapshot at submission
    cv_download_count INT NOT NULL DEFAULT 0,
    status          VARCHAR(30) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'SCREENING_PASSED', 'SCREENING_REJECTED',
                                      'INTERVIEW_SCHEDULED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),
    screening_note  TEXT,
    screened_by     UUID REFERENCES users(user_id),
    screened_at     TIMESTAMP,
    withdrawn_at    TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP,

    CONSTRAINT chk_app_cv_format CHECK (cv_file_url ILIKE '%.pdf')   -- BR-31
);

-- BR-46: Single active application per job post per student
CREATE UNIQUE INDEX uq_active_application
    ON applications(job_post_id, student_id)
    WHERE status != 'WITHDRAWN' AND deleted_at IS NULL;

CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_applications_jobpost ON applications(job_post_id);
CREATE INDEX idx_applications_status ON applications(status);

-- TRIGGER: BR-54 — Enforce Student in Semester 5 is allowed to apply
CREATE OR REPLACE FUNCTION enforce_student_apply_permission()
RETURNS TRIGGER AS $$
DECLARE
    stud_sem INT;
BEGIN
    SELECT es.current_semester INTO stud_sem
    FROM eligible_students es
    JOIN job_posts jp ON es.semester_id = jp.semester_id
    WHERE es.user_id = NEW.student_id AND jp.job_post_id = NEW.job_post_id;

    IF stud_sem IS NULL OR stud_sem != 5 THEN
        RAISE EXCEPTION 'Student is not in Semester 5 (Current: %). Only Semester 5 students are permitted to apply for jobs (BR-54).', COALESCE(stud_sem::TEXT, 'Unknown');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_student_apply_permission
    BEFORE INSERT ON applications
    FOR EACH ROW EXECUTE FUNCTION enforce_student_apply_permission();

-- TRIGGER: BR-33 — Prevent reverting application status to PENDING
CREATE OR REPLACE FUNCTION prevent_application_revert()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IN ('SCREENING_PASSED', 'SCREENING_REJECTED', 'INTERVIEW_SCHEDULED',
                      'ACCEPTED', 'REJECTED')
       AND NEW.status = 'PENDING' THEN
        RAISE EXCEPTION 'Cannot revert application from % to PENDING', OLD.status;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_app_no_revert
    BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION prevent_application_revert();

-- TRIGGER: BR-30 — Block new applications on CLOSED job posts
CREATE OR REPLACE FUNCTION prevent_application_on_closed_post()
RETURNS TRIGGER AS $$
DECLARE post_status VARCHAR(20);
BEGIN
    SELECT status INTO post_status FROM job_posts WHERE job_post_id = NEW.job_post_id;
    IF post_status = 'CLOSED' THEN
        RAISE EXCEPTION 'Cannot apply to a CLOSED job post.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_block_closed_applications
    BEFORE INSERT ON applications
    FOR EACH ROW EXECUTE FUNCTION prevent_application_on_closed_post();

-- TRIGGER: BR-48 — Withdrawal only before application deadline
CREATE OR REPLACE FUNCTION validate_withdrawal_deadline()
RETURNS TRIGGER AS $$
DECLARE deadline DATE;
BEGIN
    IF NEW.status = 'WITHDRAWN' AND OLD.status != 'WITHDRAWN' THEN
        SELECT application_deadline INTO deadline FROM job_posts WHERE job_post_id = NEW.job_post_id;
        IF deadline IS NOT NULL AND CURRENT_DATE > deadline THEN
            RAISE EXCEPTION 'Cannot withdraw after the application deadline.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_withdrawal_deadline
    BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION validate_withdrawal_deadline();

-- TABLE 15.1: placement_applications
CREATE TABLE IF NOT EXISTS placement_applications (
    application_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id         UUID NOT NULL REFERENCES users(user_id),
    enterprise_id      UUID NOT NULL REFERENCES enterprises(enterprise_id),
    semester_id        UUID NOT NULL REFERENCES semesters(semester_id),

    -- Workflow status. PENDING_APPROVAL = chờ TM; APPROVED = đã match với DN;
    -- REJECTED = TM bác (kèm lý do); WITHDRAWN = SV tự rút.
    status             VARCHAR(20) NOT NULL DEFAULT 'PENDING_APPROVAL',
    CONSTRAINT chk_placement_app_status CHECK (
        status IN ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'WITHDRAWN')
    ),

    -- Lý do SV muốn apply (do SV nhập)
    cover_letter       TEXT,

    -- Audit duyệt (do TM)
    reviewed_by        UUID REFERENCES users(user_id),
    reviewed_at        TIMESTAMP,
    rejection_reason   TEXT,
    CONSTRAINT chk_reject_reason_required CHECK (
        status <> 'REJECTED' OR (rejection_reason IS NOT NULL AND length(trim(rejection_reason)) >= 5)
    ),

    -- Audit chung (BaseEntity-style)
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by         UUID REFERENCES users(user_id),
    updated_by         UUID REFERENCES users(user_id),
    is_replacement     BOOLEAN NOT NULL DEFAULT FALSE,
    replaces_application_id UUID    REFERENCES placement_applications(application_id) ON DELETE SET NULL

    -- 1 SV chỉ được apply 1 lần vào 1 DN trong cùng 1 kỳ
    CONSTRAINT uq_placement_app_per_student_enterprise_semester
        UNIQUE (student_id, enterprise_id, semester_id)
);

-- Index cho query phổ biến
CREATE INDEX IF NOT EXISTS idx_app_student_status
    ON placement_applications(student_id, status);

CREATE INDEX IF NOT EXISTS idx_app_status_semester
    ON placement_applications(status, semester_id);

CREATE INDEX IF NOT EXISTS idx_app_enterprise_semester
    ON placement_applications(enterprise_id, semester_id);

CREATE INDEX IF NOT EXISTS idx_pa_is_replacement
    ON placement_applications(is_replacement)
    WHERE is_replacement = TRUE;

-- Updated_at tự động refresh
CREATE OR REPLACE FUNCTION trg_set_updated_at_placement_applications()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_placement_applications_updated_at ON placement_applications;
CREATE TRIGGER trg_placement_applications_updated_at
    BEFORE UPDATE ON placement_applications
    FOR EACH ROW
    EXECUTE FUNCTION trg_set_updated_at_placement_applications();

-- TABLE 16: interviews
CREATE TABLE interviews (
    interview_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id  UUID NOT NULL REFERENCES applications(application_id),
    scheduled_datetime  TIMESTAMP NOT NULL,                          -- BR-35: Must be in the future (validated by trigger)
    duration_minutes    INT DEFAULT 30,
    location        VARCHAR(500),
    meeting_link    VARCHAR(1000),
    cancel_reason   TEXT,
    canceled_at     TIMESTAMP,
    reschedule_reason   TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED'
                    CHECK (status IN ('SCHEDULED', 'CONFIRMED', 'POSTPONED', 'CANCELLED', 'COMPLETED')),
    student_confirmed   BOOLEAN NOT NULL DEFAULT FALSE,              -- BR-49: Irreversible once true
    confirmed_at    TIMESTAMP,
    student_decline_reason TEXT,
    result          VARCHAR(10)                                      -- BR-37: Set after completion only (validated by trigger)
                    CHECK (result IS NULL OR result IN ('PASS', 'FAIL')),
    result_note     TEXT,
    decided_by      UUID REFERENCES users(user_id),
    decided_at      TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_result_requires_completed                         -- BR-37
        CHECK (result IS NULL OR status = 'COMPLETED'),
    CONSTRAINT chk_decline_reason_length
        CHECK (student_confirmed = TRUE OR student_decline_reason IS NULL
               OR LENGTH(student_decline_reason) >= 10)
);

CREATE INDEX idx_interviews_application ON interviews(application_id);
CREATE INDEX idx_interviews_datetime ON interviews(scheduled_datetime);
CREATE INDEX idx_interviews_status ON interviews(status);

-- TRIGGER: BR-36 — Only SCREENING_PASSED applications can have interviews
CREATE OR REPLACE FUNCTION validate_interview_eligibility()
RETURNS TRIGGER AS $$
DECLARE app_status VARCHAR(30);
BEGIN
    SELECT status INTO app_status
    FROM applications
    WHERE application_id = NEW.application_id;

    IF app_status NOT IN ('SCREENING_PASSED', 'INTERVIEW_SCHEDULED') THEN
        RAISE EXCEPTION 'Cannot schedule interview: application status is %, need SCREENING_PASSED', app_status;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_interview_eligible
    BEFORE INSERT ON interviews
    FOR EACH ROW EXECUTE FUNCTION validate_interview_eligibility();

-- TRIGGER: BR-49 — Prevent reversing interview confirmation (irreversible once true)
CREATE OR REPLACE FUNCTION prevent_confirmation_reversal()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.student_confirmed = TRUE AND NEW.student_confirmed = FALSE THEN
        RAISE EXCEPTION 'Interview confirmation cannot be reversed.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_confirmation_irreversible
    BEFORE UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION prevent_confirmation_reversal();

-- TRIGGER: BR-35 & BR-37 — Interview Schedule Rules (Future validation, non-overlapping, result logging time)
CREATE OR REPLACE FUNCTION validate_interview_rules()
RETURNS TRIGGER AS $$
DECLARE
    student_uuid UUID;
    ent_uuid UUID;
    has_overlap BOOLEAN;
BEGIN
    -- 1. Validate that scheduled time is in the future on INSERT or when scheduled_datetime changes (BR-35)
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.scheduled_datetime != NEW.scheduled_datetime) THEN
        IF NEW.scheduled_datetime <= CURRENT_TIMESTAMP THEN
            RAISE EXCEPTION 'Scheduled interview time must be in the future (BR-35).';
        END IF;
    END IF;

    -- 2. Validate that recruitment result is only logged after the scheduled time has started (BR-37)
    IF NEW.result IS NOT NULL AND NEW.status = 'COMPLETED' THEN
        IF CURRENT_TIMESTAMP < NEW.scheduled_datetime THEN
            RAISE EXCEPTION 'Cannot record interview result before the interview scheduled time has started (BR-37).';
        END IF;
    END IF;

    -- 3. Overlap Check (BR-35): Candidate student or hosting enterprise cannot have overlapping interviews
    SELECT a.student_id, jp.enterprise_id INTO student_uuid, ent_uuid
    FROM applications a
    JOIN job_posts jp ON a.job_post_id = jp.job_post_id
    WHERE a.application_id = NEW.application_id;

    SELECT EXISTS (
        SELECT 1 FROM interviews i
        JOIN applications a2 ON i.application_id = a2.application_id
        WHERE i.interview_id != COALESCE(NEW.interview_id, '00000000-0000-0000-0000-000000000000'::UUID)
          AND i.status NOT IN ('CANCELLED')
          AND a2.student_id = student_uuid
          AND NEW.scheduled_datetime < (i.scheduled_datetime + (i.duration_minutes || ' minutes')::INTERVAL)
          AND (NEW.scheduled_datetime + (NEW.duration_minutes || ' minutes')::INTERVAL) > i.scheduled_datetime
    ) INTO has_overlap;

    IF has_overlap THEN
        RAISE EXCEPTION 'Student has an overlapping interview schedule (BR-35).';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM interviews i
        JOIN applications a2 ON i.application_id = a2.application_id
        JOIN job_posts jp2 ON a2.job_post_id = jp2.job_post_id
        WHERE i.interview_id != COALESCE(NEW.interview_id, '00000000-0000-0000-0000-000000000000'::UUID)
          AND i.status NOT IN ('CANCELLED')
          AND jp2.enterprise_id = ent_uuid
          AND NEW.scheduled_datetime < (i.scheduled_datetime + (i.duration_minutes || ' minutes')::INTERVAL)
          AND (NEW.scheduled_datetime + (NEW.duration_minutes || ' minutes')::INTERVAL) > i.scheduled_datetime
    ) INTO has_overlap;

    IF has_overlap THEN
        RAISE EXCEPTION 'Enterprise has an overlapping interview schedule (BR-35).';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_interview_rules
    BEFORE INSERT OR UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION validate_interview_rules();


-- ============================================================
-- MODULE 4: STUDENT PROFILE
-- ============================================================

-- TABLE 17: student_profiles
CREATE TABLE student_profiles (
    profile_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    student_code    VARCHAR(20),
    university      VARCHAR(255),
    major           VARCHAR(255),
    gpa             TYPE DECIMAL(4,2),
    skills          JSONB,                                           -- e.g., ["Java", "React"]
    bio             TEXT,
    cv_file_url     VARCHAR(1000),                                   -- BR-31: PDF only
    cv_file_size    INT,                                             -- BR-45: Max 5MB
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP,

    CONSTRAINT chk_cv_size CHECK (cv_file_size IS NULL OR cv_file_size <= 5242880),  -- BR-45
    CONSTRAINT chk_profile_cv_format CHECK (cv_file_url IS NULL OR cv_file_url ILIKE '%.pdf') -- BR-31
);

CREATE INDEX idx_profiles_user ON student_profiles(user_id);

UPDATE student_profiles
SET gpa = ROUND(gpa * 2.5, 2)
WHERE gpa <= 4.0 AND gpa IS NOT NULL;

-- ============================================================
-- MODULE 5: INTERNSHIP TRAINING & SUPERVISION (ENTERPRISE)
-- Covers: UC-51 → UC-57
-- Business Rules: BR-38 → BR-44
-- ============================================================

-- TABLE 18: enterprise_assignments (Replaced mentor_assignments)
CREATE TABLE enterprise_assignments (
    assignment_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id   UUID NOT NULL REFERENCES enterprises(enterprise_id),
    student_id      UUID NOT NULL REFERENCES users(user_id),
    semester_id     UUID NOT NULL REFERENCES semesters(semester_id),
    supervisor_name VARCHAR(255),
    supervisor_email VARCHAR(255),
    supervisor_phone VARCHAR(20),
    assigned_by     UUID NOT NULL REFERENCES users(user_id),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE', 'COMPLETED', 'TERMINATED')),
    assigned_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    start_date      DATE,
    end_date        DATE,
    termination_reason    TEXT,
    terminated_at   TIMESTAMP,
    replaced_by_assignment_id UUID      REFERENCES enterprise_assignments(assignment_id) ON DELETE SET NULL,



    -- Enforces a student has at most one assignment placement per semester
    CONSTRAINT uq_student_semester_assignment UNIQUE (student_id, semester_id)
);

CREATE INDEX idx_ea_enterprise ON enterprise_assignments(enterprise_id);
CREATE INDEX idx_ea_student ON enterprise_assignments(student_id);
CREATE INDEX idx_ea_semester ON enterprise_assignments(semester_id);
CREATE INDEX IF NOT EXISTS idx_ea_status ON enterprise_assignments(status);

COMMENT ON COLUMN placement_applications.is_replacement IS 'TRUE if this application requires replacing the current ACTIVE assignment (Self-Replace workflow)';
COMMENT ON COLUMN placement_applications.replaces_application_id IS 'The previously APPROVED application that this application replaces.';
COMMENT ON COLUMN enterprise_assignments.termination_reason IS 'Reason for assignment being terminated (e.g. Replaced by new placement, Student withdrawal)';
COMMENT ON COLUMN enterprise_assignments.terminated_at IS 'The time when the assignment is terminated';
COMMENT ON COLUMN enterprise_assignments.replaced_by_assignment_id IS 'A new assignment replaces this one (only if terminated due to replacement).';

-- TRIGGER: BR-54 — Verify Student is in Semester 6 to participate in active internship
CREATE OR REPLACE FUNCTION enforce_student_internship_permission()
RETURNS TRIGGER AS $$
DECLARE
    stud_sem INT;
BEGIN
    SELECT current_semester INTO stud_sem
    FROM eligible_students
    WHERE user_id = NEW.student_id AND semester_id = NEW.semester_id;

    IF stud_sem IS NULL OR stud_sem != 6 THEN
        RAISE EXCEPTION 'Student is not in Semester 6 (Current: %). Only Semester 6 students can participate in active internship (BR-54).', COALESCE(stud_sem::TEXT, 'Unknown');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_student_internship_permission
    BEFORE INSERT ON enterprise_assignments
    FOR EACH ROW EXECUTE FUNCTION enforce_student_internship_permission();

-- TRIGGER: Ensure assigned students hold OJT status (approved OJT list)
CREATE OR REPLACE FUNCTION validate_enterprise_assignment_student_status()
RETURNS TRIGGER AS $$
DECLARE
    stud_status VARCHAR(20);
BEGIN
    SELECT status INTO stud_status
    FROM eligible_students
    WHERE user_id = NEW.student_id AND semester_id = NEW.semester_id;

    IF stud_status IS NULL OR stud_status != 'OJT' THEN
        RAISE EXCEPTION 'Cannot assign student to enterprise: student status in this semester must be OJT, current status: %', COALESCE(stud_status, 'None');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_ea_student_status
    BEFORE INSERT ON enterprise_assignments
    FOR EACH ROW EXECUTE FUNCTION validate_enterprise_assignment_student_status();

-- TABLE 19: internship_plans
CREATE TABLE internship_plans (
    plan_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id   UUID NOT NULL UNIQUE REFERENCES enterprise_assignments(assignment_id),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP
);

-- TABLE 20: internship_plan_items
CREATE TABLE internship_plan_items (
    plan_item_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id         UUID NOT NULL REFERENCES internship_plans(plan_id) ON DELETE CASCADE,
    week_number     INT NOT NULL CHECK (week_number > 0),
    task_description TEXT NOT NULL,                                   -- BR-38: Mandatory
    training_objective TEXT,
    target_date     DATE NOT NULL,                                   -- BR-38, BR-39
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')),
    order_index     INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_planitems_plan ON internship_plan_items(plan_id);

-- TRIGGER: BR-39 — Plan item target_date must fall within semester dates
CREATE OR REPLACE FUNCTION validate_plan_item_date_boundary()
RETURNS TRIGGER AS $$
DECLARE sem_start DATE; sem_end DATE;
BEGIN
    SELECT s.start_date, s.end_date INTO sem_start, sem_end
    FROM semesters s
    JOIN enterprise_assignments ea ON s.semester_id = ea.semester_id
    JOIN internship_plans ip ON ea.assignment_id = ip.assignment_id
    WHERE ip.plan_id = NEW.plan_id;

    IF NEW.target_date < sem_start OR NEW.target_date > sem_end THEN
        RAISE EXCEPTION 'Plan item target_date (%) must be within semester dates (% to %)',
            NEW.target_date, sem_start, sem_end;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_plan_item_date_boundary
    BEFORE INSERT OR UPDATE ON internship_plan_items
    FOR EACH ROW EXECUTE FUNCTION validate_plan_item_date_boundary();

-- TABLE 21: enterprise_evaluations
CREATE TABLE enterprise_evaluations (
    evaluation_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id   UUID NOT NULL UNIQUE REFERENCES enterprise_assignments(assignment_id),
    attitude_score      DECIMAL(4,2) NOT NULL CHECK (attitude_score BETWEEN 0 AND 10),
    professionalism_score DECIMAL(4,2) NOT NULL CHECK (professionalism_score BETWEEN 0 AND 10),
    soft_skills_score   DECIMAL(4,2) NOT NULL CHECK (soft_skills_score BETWEEN 0 AND 10),
    progress_score      DECIMAL(4,2) NOT NULL CHECK (progress_score BETWEEN 0 AND 10),
    -- BR-43: Auto-calculated weighted total
    total_score         DECIMAL(4,2) GENERATED ALWAYS AS (
        ROUND(attitude_score * 0.2 + professionalism_score * 0.4 + soft_skills_score * 0.2 + progress_score * 0.2, 2)
    ) STORED,
    overall_comments    TEXT,
    is_locked       BOOLEAN NOT NULL DEFAULT TRUE,                   -- BR-44: Locked after submission
    submitted_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- TRIGGER: BR-44 — Prevent modification of locked evaluations
CREATE OR REPLACE FUNCTION prevent_locked_evaluation_edit()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_locked = TRUE THEN
        -- If it was locked, we ONLY allow setting is_locked to FALSE (unlocking)
        -- and do not allow modifying other columns in the same transaction
        IF NEW.is_locked = FALSE AND (
            OLD.attitude_score != NEW.attitude_score OR
            OLD.professionalism_score != NEW.professionalism_score OR
            OLD.soft_skills_score != NEW.soft_skills_score OR
            OLD.progress_score != NEW.progress_score OR
            OLD.overall_comments IS DISTINCT FROM NEW.overall_comments OR
            OLD.assignment_id != NEW.assignment_id
        ) THEN
            RAISE EXCEPTION 'Evaluation is locked. You must unlock it first before modifying scores (BR-44).';
        END IF;

        IF NEW.is_locked = TRUE THEN
            RAISE EXCEPTION 'Evaluation is locked and cannot be modified (BR-44).';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_evaluation_lock
    BEFORE UPDATE ON enterprise_evaluations
    FOR EACH ROW EXECUTE FUNCTION prevent_locked_evaluation_edit();


-- ============================================================
-- MODULE 6: WEEKLY REPORTS & FINAL REPORT
-- Covers: UC-58 → UC-62
-- Business Rules: BR-40, BR-50, BR-51
-- ============================================================

-- TABLE 22: weekly_reports
CREATE TABLE weekly_reports (
    report_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id   UUID NOT NULL REFERENCES enterprise_assignments(assignment_id),
    week_number     INT NOT NULL CHECK (week_number > 0),
    tasks_completed TEXT,
    issues_challenges TEXT,
    lessons_learned TEXT,
    plan_next_week  TEXT,
    attachment_urls JSONB,
    status          VARCHAR(20) NOT NULL DEFAULT 'NOT_SUBMITTED'
                    CHECK (status IN ('NOT_SUBMITTED', 'SUBMITTED', 'APPROVED', 'REJECTED')),
    feedback        TEXT,
    submitted_at    TIMESTAMP,
    late_override_by UUID REFERENCES users(user_id),                  -- BR-56: TM override for late/early submissions
    plagiarism_score DECIMAL(5,4),                                    -- BR-58: RBL Jaccard Similarity Score (0.0000 - 1.0000)
    is_anomaly      BOOLEAN NOT NULL DEFAULT FALSE,                   -- BR-58: Red flag if score >= 0.85
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_report_week UNIQUE (assignment_id, week_number)
);

CREATE INDEX idx_reports_assignment ON weekly_reports(assignment_id);
CREATE INDEX idx_reports_status ON weekly_reports(status);

-- TRIGGER: Prevent editing content when SUBMITTED or APPROVED
CREATE OR REPLACE FUNCTION prevent_approved_report_edit()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IN ('SUBMITTED', 'APPROVED') THEN
        IF (COALESCE(OLD.tasks_completed,'') != COALESCE(NEW.tasks_completed,'')) OR
           (COALESCE(OLD.issues_challenges,'') != COALESCE(NEW.issues_challenges,'')) OR
           (COALESCE(OLD.lessons_learned,'') != COALESCE(NEW.lessons_learned,'')) OR
           (COALESCE(OLD.plan_next_week,'') != COALESCE(NEW.plan_next_week,'')) THEN
            RAISE EXCEPTION 'Cannot edit report content when status is %', OLD.status;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_report_edit_lock
    BEFORE UPDATE ON weekly_reports
    FOR EACH ROW EXECUTE FUNCTION prevent_approved_report_edit();

-- TRIGGER: BR-56 — Verify weekly report submission window & override
CREATE OR REPLACE FUNCTION validate_weekly_report_submission_window()
RETURNS TRIGGER AS $$
DECLARE
    sem_start DATE;
    sem_status VARCHAR(20);
    curr_week INT;
BEGIN
    -- Only validate when status transitions to SUBMITTED
    IF NEW.status = 'SUBMITTED' AND (OLD.status IS NULL OR OLD.status != 'SUBMITTED') THEN
        -- Get semester start date and status
        SELECT s.start_date, s.status INTO sem_start, sem_status
        FROM semesters s
        JOIN enterprise_assignments ea ON s.semester_id = ea.semester_id
        WHERE ea.assignment_id = NEW.assignment_id;

        IF sem_status != 'ACTIVE' THEN
            RAISE EXCEPTION 'Cannot submit report. Related semester is not ACTIVE.';
        END IF;

        -- Calculate current week (1-based)
        curr_week := ((CURRENT_DATE - sem_start) / 7) + 1;

        -- Check submission window
        IF NEW.week_number != curr_week THEN
            IF NEW.late_override_by IS NULL THEN
                RAISE EXCEPTION 'Weekly report submission is restricted to the current active week (Week %). Report week is %. Late/early submissions require Training Manager override (BR-56).', curr_week, NEW.week_number;
            ELSE
                -- Verify TM override role
                IF NOT EXISTS (
                    SELECT 1 FROM users_roles
                    WHERE user_id = NEW.late_override_by AND role_name = 'TRAINING_MANAGER'
                ) THEN
                    RAISE EXCEPTION 'Invalid override: The user authorizing this late submission is not a Training Manager.';
                END IF;
            END IF;
        END IF;
        
        NEW.submitted_at := CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_weekly_report_window
    BEFORE INSERT OR UPDATE ON weekly_reports
    FOR EACH ROW EXECUTE FUNCTION validate_weekly_report_submission_window();

-- TABLE 23: report_feedbacks
CREATE TABLE report_feedbacks (
    feedback_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id       UUID NOT NULL REFERENCES weekly_reports(report_id),
    reviewer_id     UUID NOT NULL REFERENCES users(user_id),
    feedback_text   TEXT,
    action          VARCHAR(20) NOT NULL
                    CHECK (action IN ('APPROVED', 'REJECTED')),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- BR-40: Mandatory feedback text when rejecting
    CONSTRAINT chk_rejection_needs_feedback
        CHECK (action != 'REJECTED' OR (feedback_text IS NOT NULL AND LENGTH(feedback_text) > 0))
);

CREATE INDEX idx_feedbacks_report ON report_feedbacks(report_id);

-- TABLE 24: final_reports
CREATE TABLE final_reports (
    final_report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id   UUID NOT NULL UNIQUE REFERENCES enterprise_assignments(assignment_id),
    file_url        VARCHAR(1000) NOT NULL,                          -- BR-50: PDF format
    file_size_bytes INT NOT NULL,
    submitted_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,    -- BR-51
    is_late         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_final_report_format CHECK (file_url ILIKE '%.pdf') -- BR-50
);

-- TRIGGER: BR-51 — Validate final report deadline
CREATE OR REPLACE FUNCTION validate_final_report_submission()
RETURNS TRIGGER AS $$
DECLARE
    deadline TIMESTAMP;
BEGIN
    SELECT s.final_report_deadline INTO deadline
    FROM semesters s
    JOIN enterprise_assignments ea ON s.semester_id = ea.semester_id
    WHERE ea.assignment_id = NEW.assignment_id;

    IF deadline IS NOT NULL AND NEW.submitted_at > deadline THEN
        RAISE EXCEPTION 'Submission rejected. The deadline for the final report was % (BR-51).', deadline;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_final_report
    BEFORE INSERT ON final_reports
    FOR EACH ROW EXECUTE FUNCTION validate_final_report_submission();


-- ============================================================
-- MODULE 7: INCIDENT MANAGEMENT & FINAL GRADING (TRAINING MANAGER)
-- Covers: UC-63 → UC-66
-- Business Rules: BR-25 → BR-27, BR-41
-- ============================================================

-- TABLE 25: incidents
CREATE TABLE incidents (
    incident_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id   UUID NOT NULL REFERENCES enterprise_assignments(assignment_id),
    reported_by     UUID NOT NULL REFERENCES users(user_id),
    category        VARCHAR(50) NOT NULL                             -- BR-41: Mandatory
                    CHECK (category IN ('PROLONGED_ABSENCE', 'DISCIPLINARY_VIOLATION','POOR_ATTITUDE', 'CONFIDENTIALITY_BREACH', 'OTHER')),
    description     TEXT NOT NULL,                                   -- BR-41: Mandatory
    evidence_urls   JSONB,
    status          VARCHAR(20) NOT NULL DEFAULT 'OPEN'
                    CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'RESOLVED')),
    resolution_note TEXT,                                            -- BR-26: Mandatory when RESOLVED
    resolved_by     UUID REFERENCES users(user_id),
    resolved_at     TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- BR-26: Resolution note is mandatory when closing an incident
    CONSTRAINT chk_resolution_needs_note CHECK (
        status != 'RESOLVED' OR (resolution_note IS NOT NULL AND LENGTH(resolution_note) > 0)
    )
);

CREATE INDEX idx_incidents_assignment ON incidents(assignment_id);
CREATE INDEX idx_incidents_status ON incidents(status);

-- TABLE 26: training_warnings
CREATE TABLE training_warnings (
    warning_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tm_id           UUID NOT NULL REFERENCES users(user_id),
    student_id      UUID NOT NULL REFERENCES users(user_id),
    semester_id     UUID NOT NULL REFERENCES semesters(semester_id),
    week_number     INT NOT NULL,                                    -- BR-25
    warning_message TEXT NOT NULL,
    sent_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_warnings_tm ON training_warnings(tm_id);
CREATE INDEX idx_warnings_student ON training_warnings(student_id);

-- TRIGGER: BR-25 — Student must have missed the report to receive warning
CREATE OR REPLACE FUNCTION validate_warning_eligibility()
RETURNS TRIGGER AS $$
DECLARE
    assign_id UUID;
    has_submitted BOOLEAN;
BEGIN
    SELECT assignment_id INTO assign_id
    FROM enterprise_assignments
    WHERE student_id = NEW.student_id AND semester_id = NEW.semester_id AND status = 'ACTIVE';

    IF assign_id IS NULL THEN
        RAISE EXCEPTION 'Cannot send warning: Student does not have an active internship assignment.';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM weekly_reports
        WHERE assignment_id = assign_id 
          AND week_number = NEW.week_number
          AND status IN ('SUBMITTED', 'APPROVED', 'REJECTED')
    ) INTO has_submitted;

    IF has_submitted THEN
        RAISE EXCEPTION 'Cannot send warning: Student has already submitted the report for week % (BR-25).', NEW.week_number;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_warning
    BEFORE INSERT ON training_warnings
    FOR EACH ROW EXECUTE FUNCTION validate_warning_eligibility();

-- TABLE 27: final_grades
CREATE TABLE final_grades (
    grade_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID NOT NULL REFERENCES users(user_id),
    tm_id           UUID NOT NULL REFERENCES users(user_id),
    semester_id     UUID NOT NULL REFERENCES semesters(semester_id),
    enterprise_total_score  DECIMAL(4,2),
    final_grade     DECIMAL(3,1) NOT NULL                            -- BR-27: 0.0 to 10.0
                    CHECK (final_grade >= 0.0 AND final_grade <= 10.0),
    overall_status  VARCHAR(20) NOT NULL
                    CHECK (overall_status IN ('PASSED', 'FAILED', 'CANCELLED')),
    is_locked       BOOLEAN NOT NULL DEFAULT TRUE,
    cancelled_reason TEXT,
    cancelled_by    UUID REFERENCES users(user_id),
    cancelled_at    TIMESTAMP,
    graded_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_grade_student_semester UNIQUE (student_id, semester_id)
);

CREATE INDEX idx_grades_student ON final_grades(student_id);
CREATE INDEX idx_grades_semester ON final_grades(semester_id);

-- TRIGGER: Prevent editing locked grades
CREATE OR REPLACE FUNCTION prevent_locked_grade_edit()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_locked = TRUE THEN
        -- Allow unlocking (setting is_locked = FALSE) but block updating other grade fields when locked
        IF NEW.is_locked = FALSE AND (
            OLD.student_id != NEW.student_id OR
            OLD.tm_id != NEW.tm_id OR
            OLD.semester_id != NEW.semester_id OR
            OLD.enterprise_total_score IS DISTINCT FROM NEW.enterprise_total_score OR
            OLD.final_grade != NEW.final_grade OR
            OLD.overall_status != NEW.overall_status
        ) THEN
            RAISE EXCEPTION 'Grade is locked. You must unlock it first before modifying grades.';
        END IF;

        IF NEW.is_locked = TRUE THEN
            RAISE EXCEPTION 'Grade is locked and cannot be modified.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_grade_lock
    BEFORE UPDATE ON final_grades
    FOR EACH ROW EXECUTE FUNCTION prevent_locked_grade_edit();


-- ============================================================
-- MODULE 8: NOTIFICATIONS (Cross-cutting)
-- ============================================================

-- TABLE 28: notifications
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id    UUID NOT NULL REFERENCES users(user_id),
    title           VARCHAR(500) NOT NULL,
    message         TEXT NOT NULL,
    type            VARCHAR(30) NOT NULL,
    CONSTRAINT notifications_type_check
    CHECK (type IN (
        'WARNING', 'INCIDENT', 'REPORT_FEEDBACK', 'INTERVIEW_INVITE',
        'SYSTEM_ANNOUNCEMENT', 'GRADE_PUBLISHED', 'APPROVAL', 'GENERAL'
    )),
    reference_entity VARCHAR(100),
    reference_id    UUID,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);


-- ============================================================
-- MODULE 9: INTERNAL FEEDBACK
-- ============================================================

-- TABLE 29: student_enterprise_feedbacks
CREATE TABLE student_enterprise_feedbacks (
    feedback_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID NOT NULL REFERENCES users(user_id),
    enterprise_id   UUID NOT NULL REFERENCES enterprises(enterprise_id),
    semester_id     UUID NOT NULL REFERENCES semesters(semester_id),
    
    -- BR-55: 1 to 5 integer rating
    training_quality_score   INT NOT NULL CHECK (training_quality_score BETWEEN 1 AND 5),
    supervisor_support_score INT NOT NULL CHECK (supervisor_support_score BETWEEN 1 AND 5),
    work_environment_score   INT NOT NULL CHECK (work_environment_score BETWEEN 1 AND 5),
    overall_score            INT NOT NULL CHECK (overall_score BETWEEN 1 AND 5),
    
    positive_feedback   TEXT,
    improvement_feedback TEXT,
    additional_comments TEXT,
    
    submitted_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- BR-53: Only 1 feedback per enterprise per semester
    CONSTRAINT uq_student_enterprise_semester_feedback 
        UNIQUE (student_id, enterprise_id, semester_id)
);

CREATE INDEX idx_sef_enterprise ON student_enterprise_feedbacks(enterprise_id);
CREATE INDEX idx_sef_semester ON student_enterprise_feedbacks(semester_id);

-- TRIGGER: BR-54 — Enforce student in Semesters 7-9 to submit feedback
CREATE OR REPLACE FUNCTION enforce_student_feedback_permission()
RETURNS TRIGGER AS $$
DECLARE
    stud_sem INT;
BEGIN
    SELECT current_semester INTO stud_sem
    FROM eligible_students
    WHERE user_id = NEW.student_id AND semester_id = NEW.semester_id;

    IF stud_sem IS NULL OR stud_sem NOT BETWEEN 7 AND 9 THEN
        RAISE EXCEPTION 'Student is not in Semesters 7-9 (Current: %). Only Semesters 7-9 students are permitted to submit enterprise feedback (BR-54).', COALESCE(stud_sem::TEXT, 'Unknown');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_student_feedback_permission
    BEFORE INSERT ON student_enterprise_feedbacks
    FOR EACH ROW EXECUTE FUNCTION enforce_student_feedback_permission();


-- ============================================================
-- VIEWS
-- ============================================================

-- VIEW: v_semester_statistics (UC-26)
-- Highly optimized view using pre-aggregated subquery joins for maximum performance
CREATE OR REPLACE VIEW v_semester_statistics AS
SELECT
    s.semester_id,
    s.semester_code,
    s.name AS semester_name,
    COALESCE(es.total_eligible, 0) AS total_eligible,
    COALESCE(es.total_ojt, 0) AS total_ojt,
    COALESCE(es.total_cancelled, 0) AS total_cancelled,
    COALESCE(app.total_applications, 0) AS total_applications,
    COALESCE(app.interviews_passed, 0) AS interviews_passed,
    COALESCE(app.interviews_failed, 0) AS interviews_failed,
    fg.avg_final_grade,
    fg.min_final_grade,
    fg.max_final_grade
FROM semesters s
LEFT JOIN (
    SELECT 
        semester_id,
        COUNT(*) AS total_eligible,
        COUNT(CASE WHEN status = 'OJT' THEN 1 END) AS total_ojt,
        COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) AS total_cancelled
    FROM eligible_students
    GROUP BY semester_id
) es ON s.semester_id = es.semester_id
LEFT JOIN (
    SELECT 
        jp.semester_id,
        COUNT(a.application_id) AS total_applications,
        COUNT(CASE WHEN i.result = 'PASS' THEN 1 END) AS interviews_passed,
        COUNT(CASE WHEN i.result = 'FAIL' THEN 1 END) AS interviews_failed
    FROM job_posts jp
    LEFT JOIN applications a ON jp.job_post_id = a.job_post_id AND a.deleted_at IS NULL
    LEFT JOIN interviews i ON a.application_id = i.application_id
    WHERE jp.deleted_at IS NULL
    GROUP BY jp.semester_id
) app ON s.semester_id = app.semester_id
LEFT JOIN (
    SELECT 
        semester_id,
        AVG(final_grade) AS avg_final_grade,
        MIN(final_grade) AS min_final_grade,
        MAX(final_grade) AS max_final_grade
    FROM final_grades
    GROUP BY semester_id
) fg ON s.semester_id = fg.semester_id
WHERE s.deleted_at IS NULL;

-- VIEW: v_at_risk_students (UC-29)
-- Highly optimized view utilizing pre-aggregated joins for weekly reports
CREATE OR REPLACE VIEW v_at_risk_students AS
SELECT
    ea.assignment_id,
    u.user_id AS student_id,
    u.full_name AS student_name,
    sp.student_code,
    s.semester_id,
    s.semester_code,
    ea.supervisor_name,
    e.company_name,
    GREATEST(0, 
        ((CURRENT_DATE - s.start_date) / 7) - COALESCE(wr.submitted_count, 0)
    ) AS missed_reports,
    COALESCE(wr.rejected_count, 0) AS rejected_reports
FROM enterprise_assignments ea
JOIN users u ON ea.student_id = u.user_id
JOIN enterprises e ON ea.enterprise_id = e.enterprise_id
JOIN semesters s ON ea.semester_id = s.semester_id
LEFT JOIN student_profiles sp ON u.user_id = sp.user_id
LEFT JOIN (
    SELECT 
        assignment_id,
        COUNT(CASE WHEN status IN ('SUBMITTED', 'APPROVED', 'REJECTED') THEN 1 END) AS submitted_count,
        COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) AS rejected_count
    FROM weekly_reports
    GROUP BY assignment_id
) wr ON ea.assignment_id = wr.assignment_id
WHERE ea.status = 'ACTIVE' AND s.status = 'ACTIVE'
AND (
    GREATEST(0, ((CURRENT_DATE - s.start_date) / 7) - COALESCE(wr.submitted_count, 0)) > 0
    OR COALESCE(wr.rejected_count, 0) >= 2
);


-- ============================================================
-- TRIGGER: BR-14 — Freeze all related data when semester is LOCKED
-- ============================================================

-- General trigger function to enforce LOCKED semester immutability
CREATE OR REPLACE FUNCTION enforce_semester_lock()
RETURNS TRIGGER AS $$
DECLARE
    sem_id UUID;
    sem_status VARCHAR(20);
    target_row RECORD;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_row := OLD;
    ELSE
        target_row := NEW;
    END IF;

    CASE TG_TABLE_NAME
        WHEN 'eligible_students', 'job_posts', 'enterprise_assignments', 'final_grades', 'student_enterprise_feedbacks', 'semester_enterprises', 'system_announcements' THEN
            sem_id := target_row.semester_id;
            
        WHEN 'applications' THEN
            SELECT semester_id INTO sem_id FROM job_posts WHERE job_post_id = target_row.job_post_id;
            
        WHEN 'interviews' THEN
            SELECT jp.semester_id INTO sem_id 
            FROM applications a 
            JOIN job_posts jp ON a.job_post_id = jp.job_post_id
            WHERE a.application_id = target_row.application_id;
            
        WHEN 'internship_plans' THEN
            SELECT semester_id INTO sem_id FROM enterprise_assignments WHERE assignment_id = target_row.assignment_id;
            
        WHEN 'internship_plan_items' THEN
            SELECT ea.semester_id INTO sem_id 
            FROM internship_plans ip 
            JOIN enterprise_assignments ea ON ip.assignment_id = ea.assignment_id
            WHERE ip.plan_id = target_row.plan_id;
            
        WHEN 'enterprise_evaluations', 'weekly_reports', 'final_reports', 'incidents' THEN
            SELECT semester_id INTO sem_id FROM enterprise_assignments WHERE assignment_id = target_row.assignment_id;
            
        WHEN 'report_feedbacks' THEN
            SELECT ea.semester_id INTO sem_id 
            FROM weekly_reports wr
            JOIN enterprise_assignments ea ON wr.assignment_id = ea.assignment_id
            WHERE wr.report_id = target_row.report_id;
            
        ELSE
            RETURN COALESCE(NEW, OLD);
    END CASE;

    IF sem_id IS NOT NULL THEN
        SELECT status INTO sem_status FROM semesters WHERE semester_id = sem_id;
        IF sem_status = 'LOCKED' THEN
            RAISE EXCEPTION 'Cannot perform % operation on %: the related semester is LOCKED (BR-14).', TG_OP, TG_TABLE_NAME;
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Register lock triggers for all OJT tables
CREATE TRIGGER trg_lock_eligible_students BEFORE INSERT OR UPDATE OR DELETE ON eligible_students FOR EACH ROW EXECUTE FUNCTION enforce_semester_lock();
CREATE TRIGGER trg_lock_job_posts BEFORE INSERT OR UPDATE OR DELETE ON job_posts FOR EACH ROW EXECUTE FUNCTION enforce_semester_lock();
CREATE TRIGGER trg_lock_applications BEFORE INSERT OR UPDATE OR DELETE ON applications FOR EACH ROW EXECUTE FUNCTION enforce_semester_lock();
CREATE TRIGGER trg_lock_interviews BEFORE INSERT OR UPDATE OR DELETE ON interviews FOR EACH ROW EXECUTE FUNCTION enforce_semester_lock();
CREATE TRIGGER trg_lock_enterprise_assignments BEFORE INSERT OR UPDATE OR DELETE ON enterprise_assignments FOR EACH ROW EXECUTE FUNCTION enforce_semester_lock();
CREATE TRIGGER trg_lock_internship_plans BEFORE INSERT OR UPDATE OR DELETE ON internship_plans FOR EACH ROW EXECUTE FUNCTION enforce_semester_lock();
CREATE TRIGGER trg_lock_internship_plan_items BEFORE INSERT OR UPDATE OR DELETE ON internship_plan_items FOR EACH ROW EXECUTE FUNCTION enforce_semester_lock();
CREATE TRIGGER trg_lock_enterprise_evaluations BEFORE INSERT OR UPDATE OR DELETE ON enterprise_evaluations FOR EACH ROW EXECUTE FUNCTION enforce_semester_lock();
CREATE TRIGGER trg_lock_weekly_reports BEFORE INSERT OR UPDATE OR DELETE ON weekly_reports FOR EACH ROW EXECUTE FUNCTION enforce_semester_lock();
CREATE TRIGGER trg_lock_report_feedbacks BEFORE INSERT OR UPDATE OR DELETE ON report_feedbacks FOR EACH ROW EXECUTE FUNCTION enforce_semester_lock();
CREATE TRIGGER trg_lock_final_reports BEFORE INSERT OR UPDATE OR DELETE ON final_reports FOR EACH ROW EXECUTE FUNCTION enforce_semester_lock();
CREATE TRIGGER trg_lock_incidents BEFORE INSERT OR UPDATE OR DELETE ON incidents FOR EACH ROW EXECUTE FUNCTION enforce_semester_lock();
CREATE TRIGGER trg_lock_final_grades BEFORE INSERT OR UPDATE OR DELETE ON final_grades FOR EACH ROW EXECUTE FUNCTION enforce_semester_lock();
CREATE TRIGGER trg_lock_student_enterprise_feedbacks BEFORE INSERT OR UPDATE OR DELETE ON student_enterprise_feedbacks FOR EACH ROW EXECUTE FUNCTION enforce_semester_lock();
CREATE TRIGGER trg_lock_semester_enterprises BEFORE INSERT OR UPDATE OR DELETE ON semester_enterprises FOR EACH ROW EXECUTE FUNCTION enforce_semester_lock();


-- ============================================================
-- END OF SCHEMA — VERSION 4.3 CORRECTED & OPTIMIZED
-- ============================================================
-- Summary:
--   Tables:    29
--   Views:      2
--   Triggers:  31
-- ============================================================

-- ============================================================
-- ADDED FOR OAUTH2 STATEFUL SESSIONS (BR-02 & BR-03)
-- ============================================================
CREATE TABLE user_sessions (
    token_id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS request_logs (
    id                  UUID PRIMARY KEY,
    user_id             UUID,
    user_email          VARCHAR(255),
    session_id          VARCHAR(255),
    http_method         VARCHAR(10)  NOT NULL,
    endpoint            VARCHAR(500) NOT NULL,
    status_code         INTEGER,
    ip_address          VARCHAR(45),
    user_agent          VARCHAR(500),
    response_time_ms    BIGINT,
    timestamp           TIMESTAMP    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_request_log_timestamp
    ON request_logs (timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_request_log_user_timestamp
    ON request_logs (user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_request_log_endpoint
    ON request_logs (endpoint);

-- Optional FK (only if users table exists from 001_create_schema.sql)
-- Note: users table in 001 uses "user_id" as PK (not "id")
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'fk_request_log_user'
        ) THEN
            ALTER TABLE request_logs
            ADD CONSTRAINT fk_request_log_user
            FOREIGN KEY (user_id) REFERENCES users(user_id);
        END IF;
    END IF;
END $$;