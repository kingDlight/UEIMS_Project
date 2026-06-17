-- ============================================================
-- Test Data: OJT Placement Workflow
-- Chạy SAU migration 011.
-- Insert 3 scenarios để test đầy đủ workflow.
-- ============================================================

-- Scenario 1: SV apply (sẽ có status PENDING_APPROVAL sau khi gọi API)
-- Scenario 2: SV withdraw
-- Scenario 3: TM reject
-- Scenario 4: TM approve (sẽ tạo assignment ACTIVE)

-- Biến giả định (lấy từ seed 008):
--   SV1: '0e3a780a-7f2e-47fc-8995-1fbd1280b68a' (Demo Student - SE15001)
--   SV2: 'f32d8874-506a-46a5-bc25-82c4650eef53' (Trần Ngọc Uyên - SE15002)
--   SV3: '4ceb27ad-8169-472e-984c-a5a63d285779' (Đặng Xuân Vinh - SE15003)
--   SV4: '7770a57b-b560-4692-8db4-792d16ef3146' (Đặng Thu Linh - SE15004)
--   SV5: '2d4fcd13-0753-4c46-bca8-4396c0bb981f' (Ngô Thanh Uyên - SE15005)
--   DN1 (Momo):     '0264a1ce-a950-4eb1-9d71-75fe9b254d43'
--   DN2 (FPT SW):   '7d4af7af-d78f-482e-b57e-55785022c81d'
--   DN3 (Shopee):   '470374d2-20b6-4c72-981e-f0e05a0d7bfd'
--   DN4 (VNG):      '612493bb-c593-45d5-affa-c722ff75def2'
--   TM:             '249b64b9-1ab8-4e92-bd30-2951e07f1def'
--   Semester SP26:  '26f11784-e2dc-48bb-aec0-80ee582b49a0'

-- ============================================================
-- BƯỚC 0: Đảm bảo các SV có status 'ACCEPTED' trong eligible_students
-- (mặc định seed là 'ELIGIBLE', cần đổi thành 'ACCEPTED' để được apply)
-- ============================================================
UPDATE eligible_students
SET status = 'ACCEPTED'
WHERE user_id IN (
    '0e3a780a-7f2e-47fc-8995-1fbd1280b68a',
    'f32d8874-506a-46a5-bc25-82c4650eef53',
    '4ceb27ad-8169-472e-984c-a5a63d285779',
    '7770a57b-b560-4692-8db4-792d16ef3146',
    '2d4fcd13-0753-4c46-bca8-4396c0bb981f'
)
AND semester_id = '26f11784-e2dc-48bb-aec0-80ee582b49a0';

-- ============================================================
-- TEST 1: TM test workflow (dùng tab OJT trên frontend)
-- ============================================================
-- Sau khi update eligible ở trên, mở tab OJT → sẽ thấy 5 SV với workflow_status = 'UNPLACED'.
-- (Vì 5 SV chưa apply gì cả.)

-- ============================================================
-- TEST 2: SV Demo Student (SE15001) apply Momo
-- (Gọi API qua Postman, không insert trực tiếp — để test transaction)
-- ============================================================
-- POST http://localhost:8080/api/placement-applications
-- Authorization: Bearer <SV_token>
-- Body: { "enterpriseId": "0264a1ce-a950-4eb1-9d71-75fe9b254d43", "coverLetter": "Em muốn thực tập tại Momo" }
--
-- Expect: status 200, response.applicationId != null
-- Tab OJT: SV này hiển thị workflowStatus = 'PENDING_APPROVAL', applicationId có

-- ============================================================
-- TEST 3: TM approve
-- PUT http://localhost:8080/api/placement-applications/{applicationId}/approve
-- Authorization: Bearer <TM_token>
--
-- Expect:
--   - placement_applications.status = 'APPROVED'
--   - enterprise_assignments có row mới với status='ACTIVE'
--   - SV eligible_students.status tự động chuyển sang 'OJT' (optional - hiện tại service không tự đổi)
-- Tab OJT: SV hiển thị workflowStatus = 'PLACED'

-- ============================================================
-- TEST 4: SV Trần Ngọc Uyên (SE15002) apply FPT Software
-- Sau đó TM reject với lý do
-- ============================================================
-- POST /api/placement-applications { enterpriseId: '7d4af7af-d78f-482e-b57e-55785022c81d', coverLetter: '...' }
-- PUT /api/placement-applications/{id}/reject { rejectionReason: 'Công ty không phù hợp với ngành' }
--
-- Expect: 400 nếu rejectionReason < 5 chars
-- Tab OJT: SV hiển thị workflowStatus = 'REJECTED'

-- ============================================================
-- TEST 5: SV Đặng Xuân Vinh (SE15003) apply Shopee, sau đó tự withdraw
-- ============================================================
-- POST /api/placement-applications { enterpriseId: '470374d2-20b6-4c72-981e-f0e05a0d7bfd', ... }
-- PUT /api/placement-applications/{id}/withdraw
--
-- Tab OJT: SV hiển thị workflowStatus = 'WITHDRAWN'

-- ============================================================
-- TEST 6: Try duplicate apply
-- SV Demo đã APPROVED vào Momo → apply lại Momo
-- Expect: 400 STUDENT_HAS_ACTIVE_PLACEMENT

-- ============================================================
-- TEST 7: Try apply với enterprise PENDING (chưa approved)
-- ============================================================
-- (Mặc định seed chỉ có enterprises APPROVED, nên skip test này.)

-- ============================================================
-- TEST 8: Try apply khi SV không eligible
-- ============================================================
-- (Mặc định seed đã filter SV ACTIVE + role STUDENT, nên SV nào có trong
-- users + student_profiles + role STUDENT đều query được. Nhưng nếu
-- SV không có trong eligible_students → expect 400 STUDENT_NOT_ELIGIBLE_FOR_PLACEMENT.)

-- ============================================================
-- QUERIES HỮU ÍCH ĐỂ DEBUG
-- ============================================================
-- SELECT * FROM placement_applications ORDER BY created_at DESC;
-- SELECT * FROM enterprise_assignments WHERE status = 'ACTIVE' ORDER BY created_at DESC;
-- SELECT * FROM eligible_students WHERE semester_id = '26f11784-e2dc-48bb-aec0-80ee582b49a0';
-- SELECT workflow_status, application_id, enterprise_name FROM (
--     SELECT u.full_name, ea.status AS assignment_status, pa.status AS app_status
--     FROM users u
--     LEFT JOIN enterprise_assignments ea ON ea.student_id = u.user_id AND ea.semester_id = '26f11784-e2dc-48bb-aec0-80ee582b49a0'
--     LEFT JOIN placement_applications pa ON pa.student_id = u.user_id AND pa.semester_id = '26f11784-e2dc-48bb-aec0-80ee582b49a0'
-- ) t;