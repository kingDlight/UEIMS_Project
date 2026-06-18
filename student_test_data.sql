-- ============================================================
-- SCRIPT TẠO DATA ĐẦY ĐỦ CHO TÀI KHOẢN STUDENT
-- Email: dominhgiabaobmg@gmail.com
-- Password: 1234567890
-- ============================================================

-- Disable triggers
ALTER TABLE applications DISABLE TRIGGER ALL;
ALTER TABLE interviews DISABLE TRIGGER ALL;
ALTER TABLE weekly_reports DISABLE TRIGGER ALL;
ALTER TABLE report_feedbacks DISABLE TRIGGER ALL;
ALTER TABLE enterprise_assignments DISABLE TRIGGER ALL;
ALTER TABLE final_reports DISABLE TRIGGER ALL;
ALTER TABLE final_grades DISABLE TRIGGER ALL;
ALTER TABLE enterprise_evaluations DISABLE TRIGGER ALL;
ALTER TABLE student_enterprise_feedbacks DISABLE TRIGGER ALL;
ALTER TABLE internship_plans DISABLE TRIGGER ALL;
ALTER TABLE internship_plan_items DISABLE TRIGGER ALL;
ALTER TABLE notifications DISABLE TRIGGER ALL;
ALTER TABLE eligible_students DISABLE TRIGGER ALL;
ALTER TABLE users DISABLE TRIGGER ALL;

-- 1. Cập nhật thông tin User và Eligible Student
UPDATE users SET email = 'dominhgiabaobmg@gmail.com' WHERE user_id = '4c12b835-bbdb-4094-b46c-d643ba179e16';
UPDATE eligible_students SET full_name = 'Do Minh Giao Bao', email = 'dominhgiabaobmg@gmail.com', student_code = 'SE123456', major = 'Software Engineering', gpa = 3.85, current_semester = 5, status = 'ELIGIBLE' WHERE user_id = '4c12b835-bbdb-4094-b46c-d643ba179e16';

-- 2. Xóa data cũ của student
DELETE FROM notifications WHERE recipient_id = '4c12b835-bbdb-4094-b46c-d643ba179e16';
DELETE FROM report_feedbacks WHERE report_id IN (SELECT wr.report_id FROM weekly_reports wr JOIN enterprise_assignments ea ON wr.assignment_id = ea.assignment_id WHERE ea.student_id = '4c12b835-bbdb-4094-b46c-d643ba179e16');
DELETE FROM weekly_reports WHERE assignment_id IN (SELECT assignment_id FROM enterprise_assignments WHERE student_id = '4c12b835-bbdb-4094-b46c-d643ba179e16');
DELETE FROM final_reports WHERE assignment_id IN (SELECT assignment_id FROM enterprise_assignments WHERE student_id = '4c12b835-bbdb-4094-b46c-d643ba179e16');
DELETE FROM final_grades WHERE student_id = '4c12b835-bbdb-4094-b46c-d643ba179e16';
DELETE FROM enterprise_evaluations WHERE assignment_id IN (SELECT assignment_id FROM enterprise_assignments WHERE student_id = '4c12b835-bbdb-4094-b46c-d643ba179e16');
DELETE FROM student_enterprise_feedbacks WHERE student_id = '4c12b835-bbdb-4094-b46c-d643ba179e16';
DELETE FROM internship_plan_items WHERE plan_id IN (SELECT plan_id FROM internship_plans WHERE assignment_id IN (SELECT assignment_id FROM enterprise_assignments WHERE student_id = '4c12b835-bbdb-4094-b46c-d643ba179e16'));
DELETE FROM internship_plans WHERE assignment_id IN (SELECT assignment_id FROM enterprise_assignments WHERE student_id = '4c12b835-bbdb-4094-b46c-d643ba179e16');
DELETE FROM interviews WHERE application_id IN (SELECT application_id FROM applications WHERE student_id = '4c12b835-bbdb-4094-b46c-d643ba179e16');
DELETE FROM applications WHERE student_id = '4c12b835-bbdb-4094-b46c-d643ba179e16';
DELETE FROM enterprise_assignments WHERE student_id = '4c12b835-bbdb-4094-b46c-d643ba179e16';

-- 3. Tạo Enterprise Assignment (dùng DEFAULT để sinh UUID)
INSERT INTO enterprise_assignments (assignment_id, enterprise_id, semester_id, student_id, supervisor_name, supervisor_email, supervisor_phone, assigned_by, status, assigned_at, created_at, updated_at)
VALUES (gen_random_uuid(), '4ba3a890-133a-4375-84aa-8e1c1d894c46', '385f98b9-d5e0-48bb-b9c5-85290fe580e1', '4c12b835-bbdb-4094-b46c-d643ba179e16', 'Nguyen Van A', 'nvana@fpt.com.vn', '0912345678', '4c12b835-bbdb-4094-b46c-d643ba179e16', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
RETURNING assignment_id;

-- Lấy assignment_id vừa tạo để dùng cho các bảng khác
DO $$
DECLARE
    v_assignment_id UUID;
    v_application_id1 UUID;
    v_application_id2 UUID;
    v_application_id3 UUID;
    v_application_id4 UUID;
    v_application_id5 UUID;
    v_plan_id UUID;
BEGIN
    -- Lấy assignment_id
    SELECT assignment_id INTO v_assignment_id 
    FROM enterprise_assignments 
    WHERE student_id = '4c12b835-bbdb-4094-b46c-d643ba179e16'
    ORDER BY created_at DESC LIMIT 1;

    -- 4. Tạo 5 Applications
    INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status, cover_letter)
    VALUES
    (gen_random_uuid(), '8bd393a2-ca3a-4f9d-849f-5c71e273fc0b', '4c12b835-bbdb-4094-b46c-d643ba179e16', '/cv/cv1.pdf', 'ACCEPTED', 'Mong muốn thực tập tại FPT Software...')
    RETURNING application_id INTO v_application_id1;

    INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status, cover_letter)
    VALUES
    (gen_random_uuid(), '870694a4-6465-4652-b91e-888aa0e7cba7', '4c12b835-bbdb-4094-b46c-d643ba179e16', '/cv/cv2.pdf', 'SCREENING_PASSED', 'Backend development...')
    RETURNING application_id INTO v_application_id2;

    INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status, cover_letter)
    VALUES
    (gen_random_uuid(), '09994f0a-9011-4041-9a7c-0344d7992444', '4c12b835-bbdb-4094-b46c-d643ba179e16', '/cv/cv3.pdf', 'INTERVIEW_SCHEDULED', 'Công nghệ mới...')
    RETURNING application_id INTO v_application_id3;

    INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status, cover_letter)
    VALUES
    (gen_random_uuid(), '9005abc3-bde3-4276-8c6b-408ef8a1546b', '4c12b835-bbdb-4094-b46c-d643ba179e16', '/cv/cv4.pdf', 'PENDING', 'TMA Solutions...')
    RETURNING application_id INTO v_application_id4;

    INSERT INTO applications (application_id, job_post_id, student_id, cv_file_url, status, cover_letter)
    VALUES
    (gen_random_uuid(), '431c1900-a2a1-4388-895b-773d3177e5f6', '4c12b835-bbdb-4094-b46c-d643ba179e16', '/cv/cv5.pdf', 'REJECTED', 'Apply vị trí này...')
    RETURNING application_id INTO v_application_id5;

    -- 5. Tạo Interviews
    INSERT INTO interviews (interview_id, application_id, scheduled_datetime, duration_minutes, student_confirmed, status, meeting_link, scheduled_time)
    VALUES (gen_random_uuid(), v_application_id1, '2026-06-10 09:00:00', 60, true, 'COMPLETED', 'https://meet.fpt.com.vn/abc123', '2026-06-10 09:00:00');

    INSERT INTO interviews (interview_id, application_id, scheduled_datetime, duration_minutes, student_confirmed, status, meeting_link, scheduled_time)
    VALUES (gen_random_uuid(), v_application_id3, '2026-06-15 14:00:00', 45, false, 'SCHEDULED', 'https://meet.nashtech.vn/xyz789', '2026-06-15 14:00:00');

    -- 6. Tạo 12 Weekly Reports
    FOR i IN 1..12 LOOP
        INSERT INTO weekly_reports (report_id, assignment_id, week_number, tasks_completed, issues_challenges, lessons_learned, plan_next_week, status, submitted_at)
        VALUES (
            gen_random_uuid(), v_assignment_id, i,
            'Tasks completed for week ' || i,
            'Issues in week ' || i,
            'Lessons learned in week ' || i,
            'Plan for week ' || (i+1),
            CASE WHEN i <= 10 THEN 'APPROVED' ELSE 'SUBMITTED' END,
            CURRENT_TIMESTAMP - (12-i) * INTERVAL '7 days'
        );
    END LOOP;

    -- 7. Tạo Report Feedbacks cho 5 weekly reports đầu
    INSERT INTO report_feedbacks (feedback_id, report_id, reviewer_id, feedback_text, action, created_at, updated_at)
    SELECT gen_random_uuid(), report_id, '4c12b835-bbdb-4094-b46c-d643ba179e16', 'Good work!', 'APPROVED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    FROM weekly_reports WHERE assignment_id = v_assignment_id ORDER BY week_number LIMIT 5;

    -- 8. Tạo Final Report
    INSERT INTO final_reports (final_report_id, assignment_id, file_url, file_size_bytes, submitted_at, is_late, created_at, updated_at)
    VALUES (gen_random_uuid(), v_assignment_id, '/final-reports/report.pdf', 1048576, CURRENT_TIMESTAMP, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- 9. Tạo Final Grade
    INSERT INTO final_grades (grade_id, student_id, tm_id, semester_id, enterprise_total_score, final_grade, overall_status, is_locked, graded_at, created_at, updated_at)
    VALUES (gen_random_uuid(), '4c12b835-bbdb-4094-b46c-d643ba179e16', '4c12b835-bbdb-4094-b46c-d643ba179e16', '385f98b9-d5e0-48bb-b9c5-85290fe580e1', 8.5, 8.5, 'PASSED', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- 10. Tạo Enterprise Evaluation
    INSERT INTO enterprise_evaluations (evaluation_id, assignment_id, attitude_score, professionalism_score, soft_skills_score, progress_score, overall_comments, is_locked, submitted_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_assignment_id, 8.5, 8.0, 8.5, 8.0, 'Good progress.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- 11. Tạo Student Enterprise Feedback
    INSERT INTO student_enterprise_feedbacks (feedback_id, student_id, enterprise_id, semester_id, training_quality_score, supervisor_support_score, work_environment_score, overall_score, positive_feedback, improvement_feedback, submitted_at)
    VALUES (gen_random_uuid(), '4c12b835-bbdb-4094-b46c-d643ba179e16', '4ba3a890-133a-4375-84aa-8e1c1d894c46', '385f98b9-d5e0-48bb-b9c5-85290fe580e1', 5, 4, 5, 5, 'Môi trường chuyên nghiệp.', 'Supervisor khó tiếp cận.', CURRENT_TIMESTAMP);

    -- 12. Tạo Training Plan
    INSERT INTO internship_plans (plan_id, assignment_id, overall_goal, is_locked, created_at, updated_at)
    VALUES (gen_random_uuid(), v_assignment_id, 'Hoàn thành backend internship tại FPT Software', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING plan_id INTO v_plan_id;

    -- 13. Tạo Internship Plan Items
    FOR i IN 1..12 LOOP
        INSERT INTO internship_plan_items (plan_item_id, plan_id, week_number, task_description, training_objective, target_date, status, order_index)
        VALUES (
            gen_random_uuid(), v_plan_id, i,
            'Task for week ' || i,
            'Objective for week ' || i,
            CURRENT_DATE + i * INTERVAL '7 days',
            CASE WHEN i < 11 THEN 'COMPLETED' WHEN i = 11 THEN 'IN_PROGRESS' ELSE 'PENDING' END,
            i
        );
    END LOOP;

    -- 14. Tạo Notifications
    INSERT INTO notifications (notification_id, recipient_id, title, message, type, is_read, created_at, updated_at)
    VALUES 
    (gen_random_uuid(), '4c12b835-bbdb-4094-b46c-d643ba179e16', 'Chuc mung duoc nhan thuc tap!', 'Application da duoc chap nhan tai FPT Software.', 'APPROVAL', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), '4c12b835-bbdb-4094-b46c-d643ba179e16', 'Bao cao tuan 1 da duoc duyet', 'Supervisor da feedback.', 'REPORT_FEEDBACK', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), '4c12b835-bbdb-4094-b46c-d643ba179e16', 'Lich phong van NashTech', 'Phong van ngay 15/06/2026 luc 14:00.', 'INTERVIEW_INVITE', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), '4c12b835-bbdb-4094-b46c-d643ba179e16', 'Training Plan da duoc duyet', 'Ke hoach thuc tap da duoc duyet.', 'APPROVAL', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), '4c12b835-bbdb-4094-b46c-d643ba179e16', 'Diem so da duoc cong bo', 'Final grade: 8.5/A.', 'GRADE_PUBLISHED', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

END $$;

-- Re-enable triggers
ALTER TABLE applications ENABLE TRIGGER ALL;
ALTER TABLE interviews ENABLE TRIGGER ALL;
ALTER TABLE weekly_reports ENABLE TRIGGER ALL;
ALTER TABLE report_feedbacks ENABLE TRIGGER ALL;
ALTER TABLE enterprise_assignments ENABLE TRIGGER ALL;
ALTER TABLE final_reports ENABLE TRIGGER ALL;
ALTER TABLE final_grades ENABLE TRIGGER ALL;
ALTER TABLE enterprise_evaluations ENABLE TRIGGER ALL;
ALTER TABLE student_enterprise_feedbacks ENABLE TRIGGER ALL;
ALTER TABLE internship_plans ENABLE TRIGGER ALL;
ALTER TABLE internship_plan_items ENABLE TRIGGER ALL;
ALTER TABLE notifications ENABLE TRIGGER ALL;
ALTER TABLE eligible_students ENABLE TRIGGER ALL;
ALTER TABLE users ENABLE TRIGGER ALL;

-- ============================================================
-- KẾT THÚC SCRIPT
-- ============================================================
