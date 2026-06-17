-- ============================================================
-- MIGRATION 009 — Add metadata fields to system_announcements
-- so that publishing an announcement can also broadcast a
-- WebSocket bell (one source of truth: announcement = notification).
--
-- New fields (all nullable for back-compat with existing rows):
--   - type         VARCHAR(30)   GENERAL / WARNING / INCIDENT / SYSTEM_ANNOUNCEMENT / APPROVAL
--   - audience     VARCHAR(30)   ALL / STUDENTS / ENTERPRISE / LECTURER / MENTOR / ADMIN / SEMESTER
--   - target_role  VARCHAR(30)   Role enum used by NotificationService.broadcast()
--                                 (NULL = broadcast to all users)
-- ============================================================

ALTER TABLE system_announcements
    ADD COLUMN IF NOT EXISTS type        VARCHAR(30),
    ADD COLUMN IF NOT EXISTS audience    VARCHAR(30),
    ADD COLUMN IF NOT EXISTS target_role VARCHAR(30);

-- Backfill existing rows: treat them as "general, all users" so a publish
-- of any legacy row will still fan-out to every active user.
UPDATE system_announcements
SET type        = COALESCE(type, 'SYSTEM_ANNOUNCEMENT'),
    audience    = COALESCE(audience, 'ALL'),
    target_role = COALESCE(target_role, NULL)
WHERE type IS NULL OR audience IS NULL;
