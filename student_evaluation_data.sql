-- =====================================================
-- Insert Evaluation Data for Student: dominhgiabaobmg@gmail.com
-- Password: Bao@21022006
-- =====================================================

-- Step 1: Get user_id for the student
DO $$
DECLARE
    v_user_id UUID;
    v_eligible_id UUID;
    v_semester_id UUID;
    v_enterprise_id UUID;
    v_assignment_id UUID;
BEGIN
    -- Get user ID
    SELECT user_id INTO v_user_id FROM users WHERE email = 'dominhgiabaobmg@gmail.com';
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'User not found!';
        RETURN;
    END IF;
    RAISE NOTICE 'User ID: %', v_user_id;
    
    -- Get eligible student
    SELECT eligible_id INTO v_eligible_id FROM eligible_students WHERE user_id = v_user_id LIMIT 1;
    RAISE NOTICE 'Eligible ID: %', v_eligible_id;
    
    -- Get semester ID (current semester)
    SELECT semester_id INTO v_semester_id FROM semesters ORDER BY start_date DESC LIMIT 1;
    RAISE NOTICE 'Semester ID: %', v_semester_id;
    
    -- Get enterprise ID (create if not exists)
    SELECT enterprise_id INTO v_enterprise_id FROM enterprises WHERE enterprise_name LIKE '%Tech%' LIMIT 1;
    IF v_enterprise_id IS NULL THEN
        INSERT INTO enterprises (enterprise_id, enterprise_name, industry, website, contact_email, status, created_at, updated_at)
        VALUES (gen_random_uuid(), 'TechViet Solutions', 'IT Services', 'https://techviet.vn', 'contact@techviet.vn', 'ACTIVE', NOW(), NOW())
        RETURNING enterprise_id INTO v_enterprise_id;
    END IF;
    RAISE NOTICE 'Enterprise ID: %', v_enterprise_id;
    
    -- Update eligible student to semester 5 if needed
    IF v_eligible_id IS NOT NULL THEN
        UPDATE eligible_students SET current_semester = 5 WHERE eligible_id = v_eligible_id;
    END IF;
    
    -- Create enterprise assignment (INTERNSHIP_COMPLETED status)
    INSERT INTO enterprise_assignments (
        assignment_id, enterprise_id, student_id, semester_id, assignment_date, 
        expected_start_date, expected_end_date, status, created_at, updated_at
    )
    VALUES (
        gen_random_uuid(), v_enterprise_id, v_user_id, v_semester_id, NOW(),
        CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE - INTERVAL '1 day',
        'INTERNSHIP_COMPLETED', NOW(), NOW()
    )
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Enterprise assignment created/updated';
END $$;

-- Step 2: Insert Weekly Reports
DO $$
DECLARE
    v_user_id UUID;
    v_assignment_id UUID;
    v_report_id UUID;
BEGIN
    SELECT user_id INTO v_user_id FROM users WHERE email = 'dominhgiabaobmg@gmail.com';
    SELECT assignment_id INTO v_assignment_id FROM enterprise_assignments WHERE student_id = v_user_id LIMIT 1;
    
    IF v_assignment_id IS NOT NULL THEN
        -- Delete existing reports
        DELETE FROM weekly_reports WHERE assignment_id = v_assignment_id;
        
        -- Insert 4 weekly reports
        FOR i IN 1..4 LOOP
            INSERT INTO weekly_reports (
                report_id, assignment_id, week_number, tasks_completed, 
                issues_challenges, lessons_learned, plan_next_week, 
                status, submitted_at, created_at, updated_at
            ) VALUES (
                gen_random_uuid(), v_assignment_id, i,
                'Week ' || i || ': Completed assigned tasks including code review, feature development, and bug fixes. Participated in daily standup meetings.',
                'Week ' || i || ': Faced challenges with unfamiliar legacy codebase and complex business logic.',
                'Week ' || i || ': Learned about the company coding standards, Git workflow, and agile methodology.',
                'Week ' || (i+1) || ': Planning to focus on unit testing and documentation.',
                CASE WHEN i < 4 THEN 'REVIEWED' ELSE 'APPROVED' END,
                NOW() - INTERVAL (5-i) * 7 DAY,
                NOW() - INTERVAL (5-i) * 7 DAY,
                NOW() - INTERVAL (5-i) * 7 DAY
            );
        END LOOP;
        
        RAISE NOTICE 'Weekly reports inserted';
    END IF;
END $$;

-- Step 3: Insert Final Report
DO $$
DECLARE
    v_user_id UUID;
    v_assignment_id UUID;
BEGIN
    SELECT user_id INTO v_user_id FROM users WHERE email = 'dominhgiabaobmg@gmail.com';
    SELECT assignment_id INTO v_assignment_id FROM enterprise_assignments WHERE student_id = v_user_id LIMIT 1;
    
    IF v_assignment_id IS NOT NULL THEN
        DELETE FROM final_reports WHERE assignment_id = v_assignment_id;
        
        INSERT INTO final_reports (
            report_id, assignment_id, file_url, file_size_bytes,
            status, submitted_at, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_assignment_id,
            '/uploads/final-reports/sample_report.pdf',
            1024000,
            'PENDING_REVIEW',
            NOW(),
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Final report inserted';
    END IF;
END $$;

-- Step 4: Insert Enterprise Evaluation (Enterprise's evaluation of student)
DO $$
DECLARE
    v_user_id UUID;
    v_assignment_id UUID;
    v_enterprise_id UUID;
    v_semester_id UUID;
    v_eval_id UUID;
BEGIN
    SELECT user_id INTO v_user_id FROM users WHERE email = 'dominhgiabaobmg@gmail.com';
    SELECT assignment_id INTO v_assignment_id FROM enterprise_assignments WHERE student_id = v_user_id LIMIT 1;
    SELECT enterprise_id INTO v_enterprise_id FROM enterprise_assignments WHERE student_id = v_user_id LIMIT 1;
    SELECT semester_id INTO v_semester_id FROM enterprise_assignments WHERE student_id = v_user_id LIMIT 1;
    
    IF v_assignment_id IS NOT NULL THEN
        DELETE FROM enterprise_evaluations WHERE assignment_id = v_assignment_id;
        
        v_eval_id := gen_random_uuid();
        INSERT INTO enterprise_evaluations (
            evaluation_id, assignment_id, evaluator_id, evaluation_date,
            technical_skills_score, communication_skills_score,
            teamwork_score, punctuality_score, initiative_score,
            overall_score, strengths, areas_for_improvement,
            recommendation, status, created_at, updated_at
        ) VALUES (
            v_eval_id, v_assignment_id, v_user_id, NOW(),
            4, 4, 5, 4, 4,
            4, 'Good problem-solving skills and ability to learn quickly.',
            'Could improve documentation practices and estimation skills.',
            'RECOMMENDED',
            'COMPLETED',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Enterprise evaluation inserted with ID: %', v_eval_id;
    END IF;
END $$;

-- Step 5: Insert Student Enterprise Feedback (Student's feedback about enterprise)
DO $$
DECLARE
    v_user_id UUID;
    v_enterprise_id UUID;
    v_semester_id UUID;
BEGIN
    SELECT user_id INTO v_user_id FROM users WHERE email = 'dominhgiabaobmg@gmail.com';
    SELECT enterprise_id INTO v_enterprise_id FROM enterprise_assignments WHERE student_id = v_user_id LIMIT 1;
    SELECT semester_id INTO v_semester_id FROM enterprise_assignments WHERE student_id = v_user_id LIMIT 1;
    
    IF v_enterprise_id IS NOT NULL AND v_semester_id IS NOT NULL THEN
        DELETE FROM student_enterprise_feedbacks 
        WHERE student_id = v_user_id AND enterprise_id = v_enterprise_id AND semester_id = v_semester_id;
        
        INSERT INTO student_enterprise_feedbacks (
            feedback_id, student_id, enterprise_id, semester_id,
            training_quality_score, supervisor_support_score, work_environment_score,
            overall_score, positive_feedback, improvement_feedback, additional_comments,
            submitted_at, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_user_id, v_enterprise_id, v_semester_id,
            5, 4, 4, 4,
            'Great learning experience! The team was supportive and the projects were challenging.',
            'Could have more structured training sessions for new interns.',
            'Overall a very positive internship experience.',
            NOW(),
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Student enterprise feedback inserted';
    END IF;
END $$;

-- Verify inserted data
SELECT 
    u.email,
    ea.status as assignment_status,
    (SELECT COUNT(*) FROM weekly_reports WHERE assignment_id = ea.assignment_id) as weekly_reports_count,
    (SELECT COUNT(*) FROM final_reports WHERE assignment_id = ea.assignment_id) as final_reports_count,
    (SELECT COUNT(*) FROM enterprise_evaluations WHERE assignment_id = ea.assignment_id) as evaluations_count
FROM users u
LEFT JOIN enterprise_assignments ea ON u.user_id = ea.student_id
WHERE u.email = 'dominhgiabaobmg@gmail.com';
