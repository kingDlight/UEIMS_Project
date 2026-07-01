-- Debug: Tại sao student pass interview không xuất hiện PLACED trong OJT tab
-- Paste toàn bộ output cho mình.

WITH passed AS (
  SELECT
    i.interview_id,
    a.student_id,
    u.full_name,
    jp.enterprise_id,
    e.company_name,
    e.status            AS enterprise_status,
    jp.semester_id,
    s.semester_code,
    s.status            AS semester_status,
    i.result,
    i.decided_at
  FROM interviews i
  JOIN applications  a  ON a.application_id   = i.application_id
  JOIN users         u  ON u.user_id          = a.student_id
  JOIN job_posts     jp ON jp.job_post_id     = a.job_post_id
  JOIN enterprises   e  ON e.enterprise_id    = jp.enterprise_id
  JOIN semesters     s  ON s.semester_id      = jp.semester_id
  WHERE i.result = 'PASS'
)
SELECT
  p.student_id,
  p.full_name,
  p.company_name,
  p.enterprise_status,
  p.semester_code,
  p.semester_status,
  -- 3 row auto-placement phải tạo:
  pa.placement_application_id IS NOT NULL AS has_placement_app,
  pa.status                    AS placement_status,
  ea.assignment_id             IS NOT NULL AS has_assignment,
  ea.status                    AS assignment_status,
  es.status                    AS eligible_status,
  p.decided_at,
  -- Guard summary
  CASE
    WHEN p.enterprise_status <> 'APPROVED'           THEN 'BLOCKED_GUARD_1 (enterprise not APPROVED)'
    WHEN p.semester_status   =  'LOCKED'             THEN 'BLOCKED_GUARD_2 (semester LOCKED)'
    WHEN ea.assignment_id IS NOT NULL                 THEN 'OK_BUT_ASSIGNMENT_EXISTS'
    WHEN ea.assignment_id IS NULL
     AND pa.placement_application_id IS NULL         THEN 'BUG: 3 guards passed but row not created'
    ELSE 'OK_PLACED'
  END AS diagnosis
FROM passed p
LEFT JOIN placement_applications pa
       ON pa.student_id    = p.student_id
      AND pa.enterprise_id = p.enterprise_id
      AND pa.semester_id   = p.semester_id
LEFT JOIN enterprise_assignments  ea
       ON ea.student_id    = p.student_id
      AND ea.enterprise_id = p.enterprise_id
      AND ea.semester_id   = p.semester_id
LEFT JOIN eligible_students       es
       ON es.user_id       = p.student_id
      AND es.semester_id   = p.semester_id
ORDER BY p.decided_at DESC NULLS LAST
LIMIT 20;