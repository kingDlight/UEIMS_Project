-- ============================================================
-- REPAIR 005: Backfill enterprise_assignments for students
-- whose eligible_students.status = 'MATCHED' but who never got
-- an ACTIVE assignment row.
--
-- SYMPTOM:
--   OJT Placement tab hiển thị nút "Match" cho SV có status
--   eligible = 'MATCHED'. Kỳ vọng: không có nút vì SV đã có DN.
--
-- ROOT CAUSE:
--   Seed data (SQL/002_seed_realistic_data.sql) chèn eligible +
--   placement_applications (APPROVED) cho SV 16-20 (IS15016 →
--   DA15020) nhưng KHÔNG chèn enterprise_assignments ACTIVE.
--   Query findOjtPlacementView() đọc enterprise_assignments để
--   tính workflow_status → trả về 'UNPLACED' → UI hiện nút Match.
--
-- WHAT THIS SCRIPT DOES:
--   1. Lấy SV có status = 'MATCHED' trong OPEN/ACTIVE semester,
--      có placement_application APPROVED, nhưng CHƯA có assignment
--      ACTIVE ở cùng kỳ.
--   2. INSERT enterprise_assignments ACTIVE cho mỗi SV tìm được.
--   3. (Optional) Nâng eligible.status từ 'MATCHED' → 'OJT' nếu
--      bạn muốn sinh viên "officially" sang giai đoạn OJT.
--
-- IDEMPOTENT: dùng ON CONFLICT (assignment_id) DO NOTHING.
-- ============================================================

BEGIN;

-- Step 1: Backfill enterprise_assignments ACTIVE cho SV đã
-- placement APPROVED nhưng chưa có assignment.
INSERT INTO enterprise_assignments (
    assignment_id,
    enterprise_id,
    student_id,
    semester_id,
    supervisor_name,
    supervisor_email,
    assigned_by,
    status,
    start_date
)
SELECT
    gen_random_uuid()                                AS assignment_id,
    pa.enterprise_id,
    pa.student_id,
    pa.semester_id,
    'Sup Momo'                                       AS supervisor_name,
    'sup@momo.vn'                                    AS supervisor_email,
    COALESCE(pa.reviewed_by, '00000000-0000-0000-0000-000000000002') AS assigned_by,
    'ACTIVE'                                         AS status,
    '2026-03-01'::date                               AS start_date
FROM placement_applications pa
JOIN eligible_students es
  ON es.user_id      = pa.student_id
 AND es.semester_id  = pa.semester_id
JOIN semesters sem
  ON sem.semester_id = pa.semester_id
 AND sem.status      IN ('OPEN', 'ACTIVE')
WHERE pa.status = 'APPROVED'
  AND es.status = 'MATCHED'
  AND NOT EXISTS (
        SELECT 1
        FROM enterprise_assignments ea
        WHERE ea.student_id  = pa.student_id
          AND ea.semester_id = pa.semester_id
          AND ea.status      = 'ACTIVE'
  )
ON CONFLICT (assignment_id) DO NOTHING;

-- Step 2: Verify
SELECT
    sp.student_code,
    u.full_name,
    es.status            AS eligible_status,
    ea.status            AS assignment_status,
    ent.company_name     AS enterprise
FROM eligible_students es
JOIN users u             ON u.user_id             = es.user_id
JOIN student_profiles sp ON sp.user_id            = u.user_id
LEFT JOIN enterprise_assignments ea
       ON ea.student_id  = es.user_id
      AND ea.semester_id = es.semester_id
      AND ea.status      = 'ACTIVE'
LEFT JOIN enterprises ent
       ON ent.enterprise_id = ea.enterprise_id
JOIN semesters sem       ON sem.semester_id       = es.semester_id
WHERE es.status IN ('MATCHED', 'OJT')
  AND sem.status IN ('OPEN', 'ACTIVE')
  AND sp.student_code IN (
      'IS15016','IS15017','DM15018','GD15019','DA15020'
  )
ORDER BY sp.student_code;

COMMIT;

-- Expected output after fix:
--  student_code | full_name        | eligible_status | assignment_status | enterprise
--  -------------+------------------+-----------------+-------------------+------------
--  IS15016      | Vo Thi Minh      | MATCHED         | ACTIVE            | Momo
--  IS15017      | Nguyen Minh Vinh | MATCHED         | ACTIVE            | Momo
--  DM15018      | Ly Tuyet Thanh   | MATCHED         | ACTIVE            | Momo
--  GD15019      | Ngo Ngoc Xuan    | MATCHED         | ACTIVE            | Momo
--  DA15020      | Huy Minh Xuan    | MATCHED         | ACTIVE            | Momo
--
-- Sau khi chạy xong, refresh tab OJT Placement Center trên UI:
--   - workflow_status của IS15016 → DA15020 đổi từ UNPLACED → PLACED
--   - Nút "Match" biến mất, thay bằng nút "View Details"
