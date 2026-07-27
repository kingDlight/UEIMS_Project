-- ============================================================
-- REPAIR 006: Add source enum column to placement_applications
--
-- SYMPTOM:
--   Frontend OJTTab.tsx cột "Source" hiển thị sai:
--     - SV đã có enterprise_assignments ACTIVE/COMPLETED nhưng
--       KHÔNG có placement_application row (test data thiếu)
--       → source = "—" (UNSOURCED), nhưng thực tế SV đã được match.
--     - Khi SV tự apply rồi sau đó TM autoMatch tạo row mới hơn,
--       query findOjtPlacementView ORDER BY created_at DESC
--       LIMIT 1 trả row mới nhất → cover_letter = '[Auto-Match]'
--       → source = System-Matched (sai).
--
-- ROOT CAUSE:
--   Bảng placement_applications thiếu cột "ai là người tạo row".
--   Cover letter prefix ([Manual Match by TM], [Auto-Match],
--   [Interview Pass]) đang được dùng như data shape hack — không
--   bền vững vì SV tự apply thì cover_letter do SV viết (không prefix),
--   và seed data trống hoàn toàn gây UI hiển thị "—" cho SV đã có DN.
--
-- WHAT THIS SCRIPT DOES:
--   1. Thêm cột source VARCHAR(20) với CHECK constraint
--      SELF_SOURCED   = SV tự apply (workflow Portal Student)
--      SYSTEM_MATCHED = TM tạo (auto-match, manual-match, interview pass)
--      Default SELF_SOURCED cho an toàn.
--   2. Backfill source dựa trên cover_letter prefix:
--      '[Manual Match by TM]' / '[Auto-Match]' / '[Interview Pass]'
--      → SYSTEM_MATCHED
--      Các row khác (cover_letter bắt đầu bằng text do SV viết) → SELF_SOURCED.
--   3. Backfill placement_applications cho SV đã có
--      enterprise_assignments ACTIVE/COMPLETED trong OPEN/ACTIVE kỳ
--      nhưng CHƯA có placement_applications row. Trường hợp này phát
--      sinh từ seed 002 (SV 21-31 được insert enterprise_assignments
--      trực tiếp mà không qua workflow). Cover_letter được đánh dấu
--      [Legacy: TM created assignment directly] và source = SYSTEM_MATCHED.
--
-- IDEMPOTENT: dùng IF NOT EXISTS cho ALTER, ON CONFLICT cho INSERT.
-- ============================================================

BEGIN;

-- Step 1: Add source column
ALTER TABLE placement_applications
    ADD COLUMN IF NOT EXISTS source VARCHAR(20) NOT NULL DEFAULT 'SELF_SOURCED';

-- Step 2: Add CHECK constraint (drop if exists first to be idempotent)
ALTER TABLE placement_applications
    DROP CONSTRAINT IF EXISTS chk_placement_app_source;

ALTER TABLE placement_applications
    ADD CONSTRAINT chk_placement_app_source CHECK (
        source IN ('SELF_SOURCED', 'SYSTEM_MATCHED')
    );

-- Step 3: Backfill source từ cover_letter prefix cho các row hiện có
UPDATE placement_applications
SET source = 'SYSTEM_MATCHED'
WHERE cover_letter IS NOT NULL
  AND source = 'SELF_SOURCED'
  AND (
        cover_letter LIKE '[Manual Match by TM]%'
     OR cover_letter LIKE '[Auto-Match]%'
     OR cover_letter LIKE '[Interview Pass]%'
  );

-- Step 4: Backfill placement_applications cho SV đã có enterprise_assignments
-- ACTIVE/COMPLETED trong OPEN/ACTIVE semester nhưng chưa có application row.
-- Trường hợp này phát sinh khi TM tạo assignment trực tiếp (legacy/manual
-- insert), không qua autoMatch/manualMatch workflow → trước đó UI hiển thị
-- source = "—" vì applicationId = null.
INSERT INTO placement_applications (
    application_id,
    student_id,
    enterprise_id,
    semester_id,
    status,
    cover_letter,
    source,
    reviewed_by,
    reviewed_at,
    is_replacement
)
SELECT
    gen_random_uuid()                                  AS application_id,
    ea.student_id,
    ea.enterprise_id,
    ea.semester_id,
    CASE WHEN ea.status = 'ACTIVE' THEN 'APPROVED' ELSE 'APPROVED' END
                                                        AS status,
    '[Legacy: TM created assignment directly]'         AS cover_letter,
    'SYSTEM_MATCHED'                                    AS source,
    ea.assigned_by                                      AS reviewed_by,
    ea.start_date::timestamp                            AS reviewed_at,
    FALSE                                               AS is_replacement
FROM enterprise_assignments ea
JOIN eligible_students es
  ON es.user_id      = ea.student_id
 AND es.semester_id  = ea.semester_id
JOIN semesters sem
  ON sem.semester_id = ea.semester_id
 AND sem.status      IN ('OPEN', 'ACTIVE')
WHERE ea.status IN ('ACTIVE', 'COMPLETED')
  AND NOT EXISTS (
        SELECT 1
        FROM placement_applications pa
        WHERE pa.student_id  = ea.student_id
          AND pa.semester_id = ea.semester_id
  )
ON CONFLICT (student_id, enterprise_id, semester_id) DO NOTHING;

-- Step 5: Verify
SELECT
    sp.student_code,
    u.full_name,
    es.status                                  AS eligible_status,
    pa.source                                  AS placement_source,
    pa.status                                  AS application_status,
    LEFT(pa.cover_letter, 50)                  AS cover_letter_preview,
    ea.status                                  AS assignment_status,
    ent.company_name                           AS enterprise
FROM eligible_students es
JOIN users u             ON u.user_id      = es.user_id
JOIN student_profiles sp ON sp.user_id     = u.user_id
LEFT JOIN enterprise_assignments ea
       ON ea.student_id  = es.user_id
      AND ea.semester_id = es.semester_id
      AND ea.status      IN ('ACTIVE', 'COMPLETED')
LEFT JOIN enterprises ent
       ON ent.enterprise_id = ea.enterprise_id
LEFT JOIN LATERAL (
    SELECT pa2.source, pa2.status, pa2.cover_letter
    FROM placement_applications pa2
    WHERE pa2.student_id  = es.user_id
      AND pa2.semester_id = es.semester_id
    ORDER BY pa2.created_at DESC
    LIMIT 1
) pa ON TRUE
JOIN semesters sem ON sem.semester_id = es.semester_id
WHERE es.status IN ('MATCHED', 'OJT', 'ELIGIBLE', 'ACCEPTED')
  AND sem.status IN ('OPEN', 'ACTIVE')
  AND sp.student_code IN (
      'GD15021','GD15027','DM15022','DA15031','GD15032',
      'IS15016','IS15017','DM15018','GD15019','DA15020'
  )
ORDER BY sp.student_code;

COMMIT;

-- Expected output after fix:
--  student_code | full_name        | eligible_status | placement_source | assignment_status | enterprise
--  -------------+------------------+-----------------+------------------+-------------------+------------
--  GD15021      | Vu Huu Quan      | OJT             | SYSTEM_MATCHED   | ACTIVE            | Momo
--  GD15027      | Nguyen Thanh Duc  | OJT             | SYSTEM_MATCHED   | COMPLETED         | Momo
--  ...
--
-- Sau khi chạy xong, refresh tab OJT Placement Center:
--   - Cột Source của GD15021 → GD15032 đổi từ "—" → "System-Matched"
