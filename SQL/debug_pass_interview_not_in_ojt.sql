-- Evidence collection: tại sao student không hiển thị PLACED trong TM OJT tab sau khi pass interview.
-- Bạn hãy chạy từng query (hoặc cả file) trong DBeaver/pgAdmin rồi paste lại kết quả cho mình.

-- =============================================================
-- Q1. Tìm các interview vừa được record PASS gần đây
-- =============================================================
SELECT
    i.interview_id,
    i.status,
    i.result,
    i.decided_at,
    i.updated_at,
    i.application_id,
    a.student_id,
    a.job_post_id,
    jp.enterprise_id,
    e.company_name
FROM interviews i
JOIN applications a ON a.application_id = i.application_id
JOIN job_posts    jp ON jp.job_post_id = a.job_post_id
JOIN enterprises   e ON e.enterprise_id = jp.enterprise_id
WHERE i.result = 'PASS'
ORDER BY COALESCE(i.decided_at, i.updated_at) DESC NULLS LAST
LIMIT 10;

-- =============================================================
-- Q2. Với mỗi interview PASS ở trên, kiểm tra 3 row kèm theo
--    (eligible_students, placement_applications, enterprise_assignments)
--    → Trả lời câu hỏi: autoCreatePlacement có chạy không?
-- =============================================================
-- Lấy student_id và semester_id từ Q1 (paste vào CTE)
WITH passed AS (
  SELECT
    a.student_id,
    jp.enterprise_id,
    jp.semester_id
  FROM interviews i
  JOIN applications a ON a.application_id = i.application_id
  JOIN job_posts    jp ON jp.job_post_id = a.job_post_id
  WHERE i.result = 'PASS'
)
SELECT
  p.student_id,
  p.enterprise_id,
  p.semester_id,
  es.status                            AS eligible_status,
  pa.placement_application_id,
  pa.status                            AS placement_app_status,
  pa.created_at                        AS placement_created_at,
  ea.assignment_id,
  ea.status                            AS assignment_status,
  ea.created_at                        AS assignment_created_at
FROM passed p
LEFT JOIN eligible_students       es ON es.user_id = p.student_id
                                   AND es.semester_id = p.semester_id
LEFT JOIN placement_applications pa ON pa.student_id = p.student_id
                                    AND pa.enterprise_id = p.enterprise_id
                                    AND pa.semester_id = p.semester_id
LEFT JOIN enterprise_assignments  ea ON ea.student_id = p.student_id
                                    AND ea.enterprise_id = p.enterprise_id
                                    AND ea.semester_id = p.semester_id
ORDER BY p.student_id;

-- =============================================================
-- Q3. Trạng thái enterprise và semester của các cuộc interview PASS
-- → Xem guard 1 (enterprise.status != 'APPROVED') và guard 2 (semester='LOCKED')
-- =============================================================
SELECT
    e.enterprise_id,
    e.company_name,
    e.status    AS enterprise_status,
    s.semester_id,
    s.semester_code,
    s.status    AS semester_status
FROM interviews i
JOIN applications a ON a.application_id = i.application_id
JOIN job_posts    jp ON jp.job_post_id  = a.job_post_id
JOIN enterprises   e ON e.enterprise_id  = jp.enterprise_id
JOIN semesters     s ON s.semester_id    = jp.semester_id
WHERE i.result = 'PASS'
GROUP BY e.enterprise_id, e.company_name, e.status, s.semester_id, s.semester_code, s.status;

-- =============================================================
-- Q4. Kiểm tra duplicate guard (guard 3):
--    Có assignment ACTIVE/COMPLETED trước đó với cùng student+enterprise+semester?
-- =============================================================
SELECT
    ea.assignment_id,
    ea.student_id,
    ea.enterprise_id,
    ea.semester_id,
    ea.status,
    ea.created_at
FROM enterprise_assignments ea
WHERE ea.student_id IN (
    SELECT a.student_id
    FROM interviews i
    JOIN applications a ON a.application_id = i.application_id
    WHERE i.result = 'PASS'
)
ORDER BY ea.created_at DESC;

-- =============================================================
-- Q5. (Nếu row EnterpriseAssignment TỒN TẠI nhưng OJT tab không thấy)
--    Kiểm tra filter trong /ojt-placements/view:
--    - semester.status phải trong ('OPEN','ACTIVE') ?
--    - eligible_students.status phải trong ('ELIGIBLE','ACCEPTED','OJT','MATCHED') ?
-- =============================================================
SELECT
    u.full_name,
    u.user_id,
    sem.semester_id,
    sem.status    AS semester_status,
    es.status     AS eligible_status,
    (SELECT status FROM enterprise_assignments ea
      WHERE ea.student_id = u.user_id AND ea.semester_id = sem.semester_id
      ORDER BY ea.created_at DESC LIMIT 1) AS assignment_status
FROM users u
JOIN student_profiles sp ON sp.user_id = u.user_id
JOIN eligible_students es ON es.user_id = u.user_id
JOIN semesters          sem ON sem.semester_id = es.semester_id
WHERE u.full_name ILIKE '%paste student name here%';   -- <-- thay bằng tên SV bạn đang test