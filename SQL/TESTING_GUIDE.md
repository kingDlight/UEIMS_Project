# Test Plan — OJT Placement Workflow

## Yêu cầu trước khi test

1. **Build backend** qua IntelliJ (Build → Rebuild Project).
2. **Chạy migration `SQL/011_placement_applications.sql`** trên pgAdmin4 (mở Query Tool → paste → F5).
3. **Chạy test data `SQL/012_test_data_ojt_workflow.sql`** (chỉ phần BƯỚC 0 — UPDATE eligible_students).
4. **Hot-reload frontend** (Vite tự reload).

### Bước 0.5 (nếu cần reset): Xóa data cũ trước khi test

Nếu bạn đã test trước đó và các SV bị `is_locked = TRUE`, chạy lệnh sau để reset trong pgAdmin4:

```sql
-- ============================================================
-- ⚠️ Trigger prevent_locked_student_edit (BR-21) chặn MỌI update
-- khi is_locked = TRUE. Phải DISABLE trigger tạm thời để reset.
-- Wrap trong transaction để chắc chắn bật lại trigger.
-- ============================================================
BEGIN;

ALTER TABLE eligible_students DISABLE TRIGGER trg_locked_student_edit;

-- 1. Xóa placement_applications test cũ
DELETE FROM placement_applications;

-- 2. Reset assignments ACTIVE cũ về TERMINATED
-- (Bảng enterprise_assignments KHÔNG có cột cancelled_by/reason)
UPDATE enterprise_assignments
SET status = 'TERMINATED'
WHERE status = 'ACTIVE';

-- 3. Reset 5 SV về ELIGIBLE + unlock
UPDATE eligible_students
SET is_locked = FALSE, status = 'ELIGIBLE'
WHERE semester_id = '26f11784-e2dc-48bb-aec0-80ee582b49a0'
  AND user_id IN (
    '0e3a780a-7f2e-47fc-8995-1fbd1280b68a',
    'f32d8874-506a-46a5-bc25-82c4650eef53',
    '4ceb27ad-8169-472e-984c-a5a63d285779',
    '7770a57b-b560-4692-8db4-792d16ef3146',
    '2d4fcd13-0753-4c46-bca8-4396c0bb981f'
  );

ALTER TABLE eligible_students ENABLE TRIGGER trg_locked_student_edit;

COMMIT;
```

**Lưu ý:** Trigger `enforce_semester_lock` chỉ chặn khi semester `LOCKED`, không chặn `ACTIVE`/`CLOSED`.

## Test Plan

### Test 1: Tab OJT render đúng

1. Login với tài khoản TM (`manager@fpt.edu.vn` / `password`).
2. Vào trang Training Manager → tab **OJT Placement Center**.
3. **Expect:** Thấy 5 SV eligible hiển thị với workflow_status = `UNPLACED`, nút **Match** (màu cam).
4. Thanh summary chips: Unplaced: 5, Pending: 0, Placed: 0, Completed: 0.

### Test 2: SV apply (qua Postman)

1. Login với SV (`demo.student@fpt.edu.vn` / `password`) qua Postman, lấy token.
2. `POST http://localhost:8080/api/placement-applications`
   - Header: `Authorization: Bearer <token>`
   - Body:
     ```json
     {
       "enterpriseId": "0264a1ce-a950-4eb1-9d71-75fe9b254d43",
       "coverLetter": "Em muốn thực tập Java Backend tại Momo."
     }
     ```
3. **Expect:** Status 200, response có `applicationId`.
4. Mở lại tab OJT (TM), badge Self-Placements hiển thị "**1**" (badge xanh).
5. Bấm nút **Self-Placements** → modal Review hiển thị SV này.

### Test 3: TM approve

1. Từ modal Self-Placements, bấm **Approve** trên SV này.
2. Modal Approve hiện ra, bấm **Approve & Place**.
3. **Expect:**
   - Tab OJT: SV này chuyển sang workflow_status = `PLACED`, nút **View Contract**.
   - Badge Self-Placements về "0".
   - Summary chips: Placed: 1.
   - DB: `placement_applications.status = 'APPROVED'`, `enterprise_assignments` có row ACTIVE mới.

### Test 4: TM reject (bắt buộc lý do ≥ 5 chars)

1. Cho SV khác apply (qua Postman như Test 2 với enterpriseId khác).
2. Tab OJT → bấm nút **Reject** trên row mới.
3. Modal Reject hiện ra, **để trống lý do** → bấm **Confirm Reject**.
4. **Expect:** Toast warning "Rejection reason must be at least 5 characters".
5. Nhập "test" (4 chars) → bấm Confirm → vẫn báo lỗi.
6. Nhập "Không đủ điều kiện" → bấm Confirm.
7. **Expect:** Modal đóng, toast success. Tab OJT: SV chuyển sang workflow_status = `REJECTED`, hiển thị "No action".

### Test 5: SV withdraw (qua Postman)

1. Cho SV thứ 3 apply.
2. `PUT /api/placement-applications/{id}/withdraw` với token SV.
3. **Expect:** Status 200.
4. Tab OJT: SV này workflow_status = `WITHDRAWN`.

### Test 6: Duplicate apply (chặn)

1. SV đã APPROVED ở Test 3, gọi lại POST apply cùng Momo.
2. **Expect:** Status 400, message "Student already has an active placement in this semester".

### Test 7: Reject với application đã approve (chặn)

1. Lấy applicationId đã APPROVED ở Test 3, gọi PUT reject.
2. **Expect:** Status 400, message "Only PENDING_APPROVAL applications can be reviewed or withdrawn".

### Test 8: Try withdraw của SV khác (chặn)

1. SV A submit application, lấy applicationId.
2. SV B gọi PUT withdraw applicationId đó.
3. **Expect:** Status 403, message "You do not have permission".

### Test 9: Filter & Pagination

1. Tab OJT → chọn Major filter = "SE", Status filter = "Pending".
2. **Expect:** Bảng lọc đúng theo 2 tiêu chí.
3. Chọn "All Statuses" → bảng hiển thị tất cả 5 SV.

### Test 10: Auto-Match button (placeholder)

1. Bấm nút **Auto-Match** ở header.
2. **Expect:** Toast info "Auto-match will be wired to backend in a follow-up. Use Approve on pending applications meanwhile." (Logic thật chưa implement, button hiện chỉ hiển thị thông báo.)

## Cấu trúc test

```
SQL/011_placement_applications.sql    ← BẮT BUỘC chạy trước
SQL/012_test_data_ojt_workflow.sql    ← OPTIONAL: query debug + UPDATE eligible
```

## Lỗi thường gặp & cách xử lý

| Lỗi | Nguyên nhân | Cách xử lý |
|---|---|---|
| 404 Placement application not found | applicationId sai | Lấy lại từ tab OJT |
| 400 STUDENT_NOT_ELIGIBLE_FOR_PLACEMENT | SV không có trong eligible_students hoặc status không phải ACCEPTED/OJT/MATCHED | Chạy BƯỚC 0 trong 012 để update status = ACCEPTED |
| 400 STUDENT_HAS_ACTIVE_PLACEMENT | SV đã có assignment ACTIVE cho kỳ này | Hủy assignment cũ trước (chưa có endpoint, làm thủ công qua SQL: `UPDATE enterprise_assignments SET status='CANCELLED' WHERE ...`) |
| 400 ENTERPRISE_NOT_APPROVED | enterprise.approval_status ≠ 'APPROVED' | `UPDATE enterprises SET approval_status = 'APPROVED' WHERE ...` |
| 400 NO_ACTIVE_SEMESTER | Không có semester nào ACTIVE/OPEN | `UPDATE semesters SET status='ACTIVE' WHERE semester_code='SP26'` |
| 400 REJECTION_REASON_REQUIRED | Lý do < 5 chars hoặc rỗng | Nhập lý do dài hơn |
| Frontend hiển thị "No action" | workflow_status ∈ {REJECTED, WITHDRAWN, CANCELLED} | Đúng — SV không còn action nào |
| Auto-Match chỉ hiển thị info | Backend chưa implement thuật toán | Theo design, để tích hợp sau |

## Sau khi test xong

Báo lại cho mình:
1. Có test nào fail không? → Forward error log
2. Có thiếu case nào không?
3. Có muốn mình implement Auto-Match thật (cần thuật toán) không?
4. Có muốn mình build UI cho SV-side để SV tự apply (không cần Postman) không?