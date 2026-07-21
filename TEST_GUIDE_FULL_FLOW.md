# UEIMS — Luồng Test Toàn Diện

> Bao phủ toàn bộ chức năng theo thứ tự luồng nghiệp vụ thực tế.
> Mỗi test ghi rõ: bước thực hiện → dữ liệu → kết quả mong đợi.

---

## 0. Chuẩn bị trước khi test

### 0.1 Khởi tạo database

```sql
-- 1. Chạy schema (001_create_schema.sql)
-- 2. Chạy migration liên quan (011, 012, 015, 017...)
-- 3. Chạy seed data
psql -U postgres -d ueims_db -f SQL/016_seed_realistic_data.sql
```

### 0.2 Khởi động ứng dụng

```bash
# Backend
cd ueims_backend
mvn spring-boot:run
# Backend chạy tại http://localhost:8080

# Frontend
cd ueims_frontend
npm run dev
# Frontend chạy tại http://localhost:5173
```

### 0.3 Thông tin hệ thống test

| ID | Email | Password | Role | Trạng thái hiện tại |
|----|-------|----------|------|-----------------------|
| `00000001` | `admin@fpt.edu.vn` | `123456` | ADMIN | ACTIVE |
| `00000002` | `manager@fpt.edu.vn` | `123456` | TRAINING_MANAGER | ACTIVE |
| `c0000011` | `hr@momo.vn` | `123456` | ENTERPRISE | Momo — APPROVED |
| `c0000012` | `hr@fsoft.com` | `123456` | ENTERPRISE | FPT Software — APPROVED |
| `c0000013` | `hr@shopee.vn` | `123456` | ENTERPRISE | Shopee — APPROVED |
| `c0000014` | `hr@vng.com.vn` | `123456` | ENTERPRISE | VNG — APPROVED |
| `d0000001` | `demo.student@fpt.edu.vn` | `123456` | STUDENT | SE15001 — ELIGIBLE, Sem 5 |
| `d0000002` | `student2@fpt.edu.vn` | `123456` | STUDENT | SE15002 — ELIGIBLE, Sem 6 |
| `d0000003` | `student3@fpt.edu.vn` | `123456` | STUDENT | SE15003 — ELIGIBLE, Sem 6 |
| `d0000004` | `student4@fpt.edu.vn` | `123456` | STUDENT | SE15004 — ELIGIBLE, Sem 5 |
| `d0000005` | `student5@fpt.edu.vn` | `123456` | STUDENT | SE15005 — ELIGIBLE, Sem 5 |
| `d0000006` | `student6@fpt.edu.vn` | `123456` | STUDENT | SE15006 — PENDING (applied), Sem 5 |
| `d0000007` | `student7@fpt.edu.vn` | `123456` | STUDENT | SE15007 — PENDING (applied), Sem 5 |
| `d0000011` | `student11@fpt.edu.vn` | `123456` | STUDENT | SE15011 — INTERVIEW_SCHEDULED |
| `d0000012` | `student12@fpt.edu.vn` | `123456` | STUDENT | SE15012 — INTERVIEW_SCHEDULED |
| `d0000016` | `student16@fpt.edu.vn` | `123456` | STUDENT | SE15016 — MATCHED (has placement app APPROVED) |
| `d0000017` | `student17@fpt.edu.vn` | `123456` | STUDENT | SE15017 — MATCHED |
| `d0000021` | `student21@fpt.edu.vn` | `123456` | STUDENT | SE15021 — OJT ACTIVE (has assignment) |
| `d0000022` | `student22@fpt.edu.vn` | `123456` | STUDENT | SE15022 — OJT ACTIVE |
| `d0000026` | `student26@fpt.edu.vn` | `123456` | STUDENT | SE15026 — OJT COMPLETED (has final grade) |
| `d0000027` | `student27@fpt.edu.vn` | `123456` | STUDENT | SE15027 — OJT COMPLETED |
| `d0000028` | `student28@fpt.edu.vn` | `123456` | STUDENT | SE15028 — OJT COMPLETED (grade 9.4) |

**Semester hiện tại:** `50000000-0000-0000-0000-000000000001` — SP26 — Summer 2026 — **ACTIVE**
**Enterprise Momo:** `c0000000-0000-0000-0000-000000000001`
**Job Post Momo Java:** `f0000000-0000-0000-0000-000000000001`

---

## LUỒNG 1: Xác thực & Phân quyền

### TEST 1.1 — Đăng nhập thành công mỗi role

**Mục tiêu:** Kiểm tra mỗi role đăng nhập đúng, nhận JWT token.

**Bước thực hiện:**

1. Mở Postman hoặc curl:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fpt.edu.vn","password":"123456"}'
```

2. Lặp lại với: `manager@fpt.edu.vn`, `hr@momo.vn`, `demo.student@fpt.edu.vn`

**Kết quả mong đợi:**
- HTTP 200, response chứa `accessToken`, `refreshToken`, `tokenType: "Bearer"`
- Mỗi role có endpoint riêng hiển thị sau khi login thành công

**Verify:** Token có thể dùng để gọi API protected:

```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"
# → 200 với thông tin user
```

### TEST 1.2 — Đăng nhập thất bại (sai password)

**Bước:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fpt.edu.vn","password":"wrongpass"}'
```

**Kết quả mong đợi:** HTTP 401, message "Invalid email or password"

### TEST 1.3 — Access token hết hạn

**Bước:**
1. Lấy access token hợp lệ
2. Gọi API với token đó sau khi chờ hết thời gian sống (hoặc decode JWT xem `exp` claim)

**Kết quả mong đợi:** HTTP 401 `Token has expired`, frontend chuyển sang trang login

### TEST 1.4 — Refresh token

**Bước:**
```bash
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<REFRESH_TOKEN>"}'
```

**Kết quả mong đợi:** HTTP 200, nhận accessToken + refreshToken mới

### TEST 1.5 — Logout (blacklist token)

**Bước:**
1. Login → lấy token
2. Logout:
```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"refreshToken":"<REFRESH_TOKEN>"}'
```

**Kết quả mong đợi:** HTTP 200, token bị blacklist. Gọi lại API với token cũ → HTTP 401

### TEST 1.6 — Đăng ký enterprise (public)

**Bước:**
```bash
curl -X POST http://localhost:8080/api/public/enterprise/register \
  -H "Content-Type: application/json" \
  -d '{
    "companyName":"TechCorp Vietnam",
    "industry":"IT",
    "companySize":"100-500",
    "address":"123 Nguyen Hue, Q1, HCMC",
    "contactPersonName":"HR TechCorp",
    "contactPersonEmail":"hr@techcorp.vn",
    "contactPersonPhone":"0909999999",
    "password":"SecurePass123"
  }'
```

**Kết quả mong đợi:**
- HTTP 201, enterprise được tạo với `approval_status = "PENDING"`
- Chưa có account HR (sẽ được tạo sau khi TM duyệt)

### TEST 1.7 — RBAC — SV không được truy cập endpoint TM

**Bước:**
```bash
curl -X GET http://localhost:8080/api/semesters \
  -H "Authorization: Bearer <STUDENT_TOKEN>"
```

**Kết quả mong đợi:** HTTP 403 Forbidden

---

## LUỒNG 2: Quản lý Học kỳ (Training Manager)

### TEST 2.1 — TM xem danh sách học kỳ

**Tài khoản:** `manager@fpt.edu.vn` / `123456`

**Bước:**
1. Login TM
2. Vào menu **Semesters**

**Kết quả mong đợi:**
- Thấy SP26 (Summer 2026) có status **ACTIVE**
- Có các nút: Create, Edit, Close, View Details

### TEST 2.2 — TM tạo học kỳ mới

**Bước:**
1. TM click **Create Semester**
2. Điền form:
   - Semester Code: `FA26`
   - Name: `Fall 2026`
   - Start Date: `2026-09-01`
   - End Date: `2026-12-31`
   - Weekly Report Deadline Day: `SUNDAY`
   - Weekly Report Deadline Time: `23:59`
   - Final Report Deadline: `2026-12-31 23:59`

**Kết quả mong đợi:**
- HTTP 201, semester được tạo với status `DRAFT` (hoặc `OPEN` tùy workflow)
- State machine: DRAFT → UPCOMING → ACTIVE → CLOSED → LOCKED

### TEST 2.3 — TM chuyển trạng thái học kỳ

**Bước:**
1. Với semester mới tạo ở TEST 2.2 (status `DRAFT`)
2. Click **Activate** / chuyển sang `UPCOMING`

**Kết quả mong đợi:**
- Status chuyển thành `UPCOMING`
- Chỉ có đúng 1 semester ACTIVE tại 1 thời điểm
- Nếu cố chuyển semester khác sang ACTIVE khi đã có ACTIVE → báo lỗi hoặc tự động chuyển

### TEST 2.4 — TM khóa học kỳ (Lock)

**Bước:**
1. Với semester đã CLOSED, click **Lock**

**Kết quả mong đợi:**
- Status chuyển thành `LOCKED`
- Trigger `enforce_semester_lock` ngăn chỉnh sửa dữ liệu semester

---

## LUỒNG 3: Quản lý Doanh nghiệp (TM duyệt Enterprise)

### TEST 3.1 — TM xem danh sách doanh nghiệp chờ duyệt

**Tài khoản:** `manager@fpt.edu.vn` / `123456`

**Bước:**
1. Login TM → vào **Enterprises**
2. Filter: Status = `PENDING`

**Kết quả mong đợi:**
- Thấy doanh nghiệp đã đăng ký từ TEST 1.6 (nếu có)
- Có nút Approve / Reject

### TEST 3.2 — TM duyệt doanh nghiệp

**Bước:**
1. Click **Approve** trên doanh nghiệp đang PENDING
2. Xác nhận

**Kết quả mong đợi:**
- `approval_status` chuyển thành `APPROVED`
- Hệ thống tự tạo account HR cho doanh nghiệp (kiểm tra bảng `users`)
- Email thông báo được gửi (hoặc notification)

### TEST 3.3 — Enterprise HR đổi mật khẩu (lần đầu)

**Tài khoản:** (account HR mới được tạo sau TEST 3.2)

**Bước:**
1. Link trong email hoặc login lần đầu
2. Nhập password mới

**Kết quả mong đợi:**
- `must_change_password = FALSE` sau khi đổi
- Account có thể đăng nhập bình thường

### TEST 3.4 — TM từ chối doanh nghiệp

**Bước:**
1. Với doanh nghiệp PENDING khác, click **Reject**
2. Nhập lý do từ chối

**Kết quả mong đợi:**
- `approval_status = REJECTED`
- Doanh nghiệp không đăng nhập được

---

## LUỒNG 4: Quản lý Sinh viên Eligible (TM)

### TEST 4.1 — TM xem danh sách Eligible Students

**Tài khoản:** `manager@fpt.edu.vn` / `123456`

**Bước:**
1. Login TM → vào **Eligible Students** / **Student Management**
2. Filter theo semester = SP26

**Kết quả mong đợi:**
- Bảng hiển thị đầy đủ 35 sinh viên trong seed data
- Mỗi dòng: student_code, full_name, major, gpa, current_semester, status, enterprise (nếu có)
- Cột trạng thái phân biệt: ELIGIBLE, PENDING, MATCHED, OJT, CANCELLED, DEFERRED

### TEST 4.2 — TM thêm sinh viên eligible (import / tạo thủ công)

**Bước:**
1. Click **Add Student** / **Import**
2. Điền form:
   - Student Code: `SE99999`
   - Full Name: `Nguyen Test Student`
   - Email: `test99999@fpt.edu.vn`
   - Major: `Software Engineering`
   - GPA: `7.5`
   - Current Semester: `5`
   - Semester: `SP26`

**Kết quả mong đợi:**
- HTTP 201, sinh viên được tạo trong `eligible_students`
- User account tự động tạo (nếu hệ thống hỗ trợ)
- Status mặc định: `ELIGIBLE`

### TEST 4.3 — TM chuyển sinh viên sang CANCELLED

**Bước:**
1. Chọn sinh viên ELIGIBLE
2. Click **Cancel** / **Block**
3. Nhập lý do hủy

**Kết quả mong đợi:**
- `eligible_students.status = 'CANCELLED'`, `is_locked = TRUE`
- Trigger `prevent_locked_student_edit` khóa mọi thay đổi trên record này
- Sinh viên thấy badge BLOCKED trên dashboard

### TEST 4.4 — TM xem chi tiết 1 sinh viên

**Bước:**
1. Click vào dòng sinh viên SE15021 (OJT ACTIVE)

**Kết quả mong đợi:**
- Modal / page hiển thị đầy đủ:
  - Thông tin cá nhân + academic
  - Trạng thái OJT hiện tại
  - Enterprise đang thực tập (Momo)
  - Danh sách báo cáo tuần đã nộp
  - Lịch sử incident/warning

---

## LUỒNG 5: Sinh viên tìm việc & Nộp đơn

### TEST 5.1 — SV duyệt Job Board

**Tài khoản:** `demo.student@fpt.edu.vn` / `123456` (SE15001, ELIGIBLE, Sem 5)

**Bước:**
1. Login với SE15001
2. Vào **Job Board** / **Find Jobs**

**Kết quả mong đợi:**
- Hiển thị job posts của semester SP26 đang OPEN
- Momo — Java Backend Developer Intern
- FPT Software — React Frontend Developer Intern
- Shopee — Fullstack Developer Intern
- Mỗi card hiển thị: title, enterprise, deadline, skills, max_positions

### TEST 5.2 — SV lọc job theo skill / tìm kiếm

**Bước:**
1. Gõ "Java" vào ô tìm kiếm
2. Hoặc filter theo industry, location

**Kết quả mong đợi:**
- Chỉ hiển thị job phù hợp với filter
- Count badge trên filter chip thay đổi

### TEST 5.3 — SV xem chi tiết job post

**Bước:**
1. Click vào card "Java Backend Developer Intern" của Momo

**Kết quả mong đợi:**
- Trang chi tiết: mô tả, yêu cầu, benefits, deadline
- Nút **Apply Now** (nếu chưa apply)
- Số lượng đã apply / max_positions

### TEST 5.4 — SV nộp đơn ứng tuyển (apply)

**Bước:**
1. Từ chi tiết job, click **Apply Now**
2. Tải lên CV (file hoặc URL) hoặc dùng CV có sẵn trong profile
3. Viết cover letter (optional)
4. Submit

**Kết quả mong đợi:**
- HTTP 200, `applications` được tạo với `status = 'PENDING'`
- Trên Job Board: job hiển thị đã applied badge
- Giới hạn: tối đa 3 active applications cùng lúc

### TEST 5.5 — SV kiểm tra giới hạn 3 đơn

**Bước:**
1. SE15001 đã apply 1 đơn ở TEST 5.4
2. Apply thêm 2 job khác (FPT Software, Shopee)
3. Thử apply thêm job thứ 4

**Kết quả mong đợi:**
- Job thứ 4: HTTP 400 — "Maximum of 3 active applications allowed"
- (Rejected applications không tính vào limit)

### TEST 5.5b — SV xem danh sách đơn đã nộp

**Bước:**
1. Vào **My Applications** / **Applications**

**Kết quả mong đợi:**
- Bảng đơn: job title, enterprise, status, applied date
- Status badge: PENDING, SCREENING, INTERVIEW_SCHEDULED, ACCEPTED, REJECTED

---

## LUỒNG 6: Enterprise duyệt đơn & Phỏng vấn

### TEST 6.1 — Enterprise HR xem danh sách ứng viên

**Tài khoản:** `hr@momo.vn` / `123456`

**Bước:**
1. Login HR Momo
2. Vào **Applications** / **Candidates** — filter: Momo Java Backend job

**Kết quả mong đợi:**
- Thấy ứng viên đã apply (SE15006, SE15007, SE15008, SE15009, SE15010 từ seed data)
- Kanban board: Applied → Screening → Interview → Offer / Rejected
- Hoặc bảng với cột status + filter

### TEST 6.2 — Enterprise screen ứng viên

**Bước:**
1. Click vào ứng viên SE15011 (INTERVIEW_SCHEDULED trong seed — có sẵn)
2. Xem CV + thông tin
3. Click **Screen** / **Move to Screening**

**Kết quả mong đợi:**
- `applications.status` chuyển từ `PENDING` sang `SCREENING`
- Notification được gửi cho sinh viên

### TEST 6.3 — Enterprise reject ứng viên

**Bước:**
1. Chọn ứng viên PENDING
2. Click **Reject** — nhập lý do

**Kết quả mong đợi:**
- `applications.status = 'REJECTED'`
- `rejected_reason` được lưu
- Notification cho sinh viên

### TEST 6.4 — Enterprise lên lịch phỏng vấn

**Bước:**
1. Với ứng viên đã SCREENING
2. Click **Schedule Interview**
3. Điền form:
   - Date/Time: chọn ngày trong tương lai, ví dụ `2026-07-28 10:00`
   - Duration: `45 minutes`
   - Meeting Link: `https://meet.momo.vn/interview-xxx`
4. Confirm

**Kết quả mong đợi:**
- `interviews` record được tạo với `status = 'SCHEDULED'`
- `applications.status = 'INTERVIEW_SCHEDULED'`
- Sinh viên nhận notification lịch phỏng vấn

### TEST 6.5 — Sinh viên xác nhận phỏng vấn

**Tài khoản:** `student11@fpt.edu.vn` / `123456`

**Bước:**
1. Login SE15011
2. Vào **Interviews** — thấy lịch phỏng vấn Momo
3. Click **Confirm Attendance**

**Kết quả mong đợi:**
- `student_confirmed = TRUE` trong bảng `interviews`
- Status interview vẫn `SCHEDULED`

### TEST 6.6 — Enterprise ghi kết quả phỏng vấn (PASS)

**Tài khoản:** `hr@momo.vn` / `123456`

**Bước:**
1. Vào Interviews → chọn interview SE15011
2. Click **Record Result**
3. Chọn: Result = `PASS`, Notes = `Strong Java skills, good attitude`

**Kết quả mong đợi:**
- `interviews.status = 'COMPLETED'`, `result = 'PASS'`
- `applications.status = 'ACCEPTED'` (hoặc chuyển sang bước tiếp theo trong workflow)
- Notification cho sinh viên

### TEST 6.7 — Enterprise ghi kết quả phỏng vấn (FAIL)

**Bước:**
1. Với ứng viên khác, record result = `FAIL`
2. Nhập `result_note`

**Kết quả mong đợi:**
- `interviews.status = 'COMPLETED'`, `result = 'FAIL'`
- `applications.status = 'REJECTED'`
- Notification cho sinh viên

---

## LUỒNG 7: TM Placement Center (MATCHED → OJT)

### TEST 7.1 — TM xem OJT Placement Center

**Tài khoản:** `manager@fpt.edu.vn` / `123456`

**Bước:**
1. Login TM → vào **OJT Placement Center**

**Kết quả mong đợi:**
- Tabs: **All** / **Unplaced** / **Pending Approval** / **Placed** / **Completed**
- Summary chips: Unplaced, Pending, Placed, Completed counts
- SE15016, SE15017 đang MATCHED (có placement_application APPROVED)

### TEST 7.2 — TM xem danh sách Pending Placement Applications

**Bước:**
1. Click tab **Pending Approval** / **Self-Placements**

**Kết quả mong đợi:**
- Thấy sinh viên đã có `placement_applications` với `status = 'APPROVED'` (SE15016, SE15017 từ seed)
- Các nút: **Approve & Place** / **Reject**

### TEST 7.3 — TM approve placement (tạo assignment)

**Bước:**
1. Click **Approve & Place** trên SE15016
2. Điền thông tin phân công:
   - Enterprise: Momo (auto-filled)
   - Supervisor Name: `Sup Momo`
   - Supervisor Email: `sup@momo.vn`
   - Start Date: `2026-03-15`
3. Confirm

**Kết quả mong đợi:**
- `enterprise_assignments` record mới với `status = 'ACTIVE'`
- `eligible_students.status` chuyển thành `OJT`
- `eligible_students.is_locked = TRUE`
- Placement chip count: Placed tăng 1
- Notification cho sinh viên

### TEST 7.4 — TM reject placement

**Bước:**
1. Tạo placement application mới (qua Postman):
```bash
curl -X POST http://localhost:8080/api/placement-applications \
  -H "Authorization: Bearer <STUDENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "enterpriseId": "c0000000-0000-0000-0000-000000000001",
    "coverLetter": "Em muon thuc tap tai Momo"
  }'
```
2. TM vào OJT Placement Center, click **Reject**
3. Nhập lý do: `Khong du dieu kien`

**Kết quả mong đợi:**
- `placement_applications.status = 'REJECTED'`
- Toast success

### TEST 7.5 — SV bị locked không chỉnh được profile

**Tài khoản:** `student21@fpt.edu.vn` / `123456` (OJT ACTIVE, is_locked=TRUE)

**Bước:**
1. Login SE15021
2. Thử chỉnh sửa profile (thay đổi CV, skills)

**Kết quả mong đợi:**
- Frontend chặn hoặc backend trả HTTP 400 với message liên quan đến locked

### TEST 7.6 — TM xem OJT Placement với filter

**Bước:**
1. OJT Placement Center → filter: Status = `Placed`
2. Filter: Enterprise = `Momo`

**Kết quả mong đợi:**
- Chỉ hiển thị sinh viên đã placed tại Momo
- Pagination hoạt động

---

## LUỒNG 8: SV Thực tập — Báo cáo hàng tuần

### TEST 8.1 — SV xem Dashboard OJT

**Tài khoản:** `student21@fpt.edu.vn` / `123456` (OJT ACTIVE)

**Bước:**
1. Login SE15021
2. Mở Dashboard

**Kết quả mong đợi:**
- Badge: **OJT IN PROGRESS** (màu xanh)
- Card: Enterprise (Momo), Supervisor (Sup Momo)
- Card: Weekly Reports — thấy 3 báo cáo (Week 1, 2 APPROVED, Week 3 SUBMITTED)
- Card: Training Progress — progress bar
- Countdown: ngày còn lại đến khi kết thúc kỳ

### TEST 8.2 — SV nộp Weekly Report

**Bước:**
1. Vào **Weekly Reports** → click **New Report** / **Submit Report**
2. Điền form:
   - Week Number: `4`
   - Tasks Completed: `Implemented user authentication module`
   - Issues/Challenges: `Need to improve error handling`
   - Lessons Learned: `Learned about JWT security`
   - Plan Next Week: `Work on API documentation`
3. Submit

**Kết quả mong đợi:**
- HTTP 200, `weekly_reports` tạo với `status = 'SUBMITTED'`
- Trên dashboard: số báo cáo tăng lên
- TM nhận notification có báo cáo mới

### TEST 8.3 — Enterprise duyệt / từ chối Weekly Report

**Tài khoản:** `hr@momo.vn` / `123456`

**Bước:**
1. Vào **Weekly Reports** / **Reports** — thấy báo cáo SE15021 Week 4 (SUBMITTED)
2. Click **Approve**

**Kết quả mong đợi:**
- `weekly_reports.status = 'APPROVED'`
- Notification cho sinh viên

### TEST 8.4 — Enterprise reject Weekly Report (yêu cầu sửa lại)

**Bước:**
1. Với báo cáo khác ở trạng thái SUBMITTED
2. Click **Reject** — nhập feedback: `Please add input validation and error handling.`

**Kết quả mong đợi:**
- `weekly_reports.status = 'REJECTED'`
- `report_feedbacks` record được tạo
- Sinh viên thấy báo cáo bị reject + feedback
- Sinh viên submit lại báo cáo cho week đó

### TEST 8.5 — SV nộp Final Report

**Bước:**
1. Khi internship gần kết thúc, SV vào **Final Report**
2. Upload file báo cáo cuối kỳ (URL hoặc file)
3. Submit

**Kết quả mong đợi:**
- `final_reports` record tạo với `submitted_at`
- `is_late` flag = TRUE nếu submit sau deadline

---

## LUỒNG 9: Enterprise đánh giá & TM chấm điểm cuối kỳ

### TEST 9.1 — Enterprise đánh giá sinh viên

**Tài khoản:** `hr@momo.vn` / `123456`

**Bước:**
1. Vào **Evaluation** / **Student Evaluation**
2. Chọn sinh viên đã hoàn thành internship (SE15026)
3. Điền điểm:
   - Attitude Score: `8.0`
   - Professionalism Score: `8.5`
   - Soft Skills Score: `8.0`
   - Progress Score: `8.5`
   - Overall Comments: `Good intern, consistent performance`
4. Submit

**Kết quả mong đợi:**
- `enterprise_evaluations` record tạo
- `is_locked = TRUE` (không cho sửa sau khi submit)
- Notification cho TM

### TEST 9.2 — TM chấm Final Grade

**Tài khoản:** `manager@fpt.edu.vn` / `123456`

**Bước:**
1. Vào **Final Grades** / **Grading**
2. Tìm SE15026

**Kết quả mong đợi:**
- Hiển thị điểm từ enterprise evaluation
- TM nhập/pheiư chỉnh final_grade
- Click **Publish Grade**

**Kết quả mong đợi:**
- `final_grades` record tạo với `final_grade` (ví dụ: `8.4`)
- `overall_status = 'PASSED'` (hoặc `FAILED` tùy điểm)
- Notification cho sinh viên

### TEST 9.3 — SV xem kết quả cuối kỳ

**Tài khoản:** `student26@fpt.edu.vn` / `123456`

**Bước:**
1. Login SE15026
2. Vào **Results** / **My Grades**

**Kết quả mong đợi:**
- Hiển thị: Final Grade, Enterprise Evaluation scores, Status (PASSED)
- Card Evaluation với điểm chi tiết

### TEST 9.4 — Sinh viên feedback cho Enterprise

**Tài khoản:** `student26@fpt.edu.vn` / `123456`

**Bước:**
1. Sau khi enterprise đánh giá, SV vào **Feedback**
2. Điền survey:
   - Training Quality: `5`
   - Supervisor Support: `4`
   - Work Environment: `5`
   - Positive Feedback: `Great mentorship and learning environment`
   - Improvement Feedback: `Could improve on feedback turnaround time`
3. Submit

**Kết quả mong đợi:**
- `student_enterprise_feedbacks` record tạo
- TM/Enterprise thấy feedback trong dashboard

---

## LUỒNG 10: Incident & Warning

### TEST 10.1 — Enterprise báo cáo Incident

**Tài khoản:** `hr@momo.vn` / `123456`

**Bước:**
1. Vào **Incidents** → click **Report Incident**
2. Chọn sinh viên: SE15021
3. Điền form:
   - Category: `PROLONGED_ABSENCE`
   - Description: `Student was absent for 3 consecutive days without prior notice`
4. Submit

**Kết quả mong đợi:**
- `incidents` record tạo với `status = 'OPEN'`
- Notification cho TM

### TEST 10.2 — TM xem và resolve Incident

**Tài khoản:** `manager@fpt.edu.vn` / `123456`

**Bước:**
1. Vào **Incidents** — thấy incident của SE15021
2. Click **View** → điền:
   - Resolution Note: `Student had a family emergency. Has submitted leave request.`
   - Action: `No further action needed`
3. Click **Resolve**

**Kết quả mong đợi:**
- `incidents.status = 'RESOLVED'`
- `resolved_by`, `resolved_at` được ghi nhận
- Notification cho enterprise + student

### TEST 10.3 — TM gửi Training Warning

**Bước:**
1. Vào **At-Risk Students** / **Warnings**
2. Click **Send Warning** trên SE15021
3. Chọn week: `4`, nhập message

**Kết quả mong đợi:**
- `training_warnings` record tạo
- Notification cho sinh viên

---

## LUỒNG 11: Notifications & Announcements

### TEST 11.1 — TM tạo Announcement

**Tài khoản:** `manager@fpt.edu.vn` / `123456`

**Bước:**
1. Vào **Announcements** → click **Create**
2. Điền:
   - Title: `Weekly Report Deadline Reminder`
   - Content: `Please remember to submit weekly reports every Sunday by 23:59`
   - Type: `SYSTEM_ANNOUNCEMENT`
   - Audience: `ALL` hoặc `STUDENT`
3. Publish

**Kết quả mong đợi:**
- `system_announcements` record với `status = 'PUBLISHED'`
- `published_at` được ghi nhận

### TEST 11.2 — SV xem Announcements

**Tài khoản:** `demo.student@fpt.edu.vn` / `123456`

**Bước:**
1. Login SE15001
2. Vào **Announcements** / Dashboard widget

**Kết quả mong đợi:**
- Thấy announcement từ TEST 11.1
- Badge "New" nếu chưa đọc

### TEST 11.3 — SV xem Notifications

**Bước:**
1. Vào **Notifications** (bell icon)

**Kết quả mong đợi:**
- Danh sách notification: interview invites, report feedback, placement approved...
- Badge số unread trên bell icon
- Click notification → điều hướng đến trang liên quan

---

## LUỒNG 12: Dashboard & Analytics

### TEST 12.1 — TM Command Center Dashboard

**Tài khoản:** `manager@fpt.edu.vn` / `123456`

**Bước:**
1. Login TM → mở Dashboard / **Command Center**

**Kết quả mong đợi:**
- Cards tổng quan:
  - Active Semesters: `1` (SP26)
  - Eligible Students: count SP26 eligible
  - Placed Students: count đã assigned
  - At-Risk Students: count
  - Incidents: count
  - Report Submission Rate: percentage
- Charts:
  - Placement funnel (Eligible → Applied → Interviewed → Placed)
  - Report submission chart
  - Enterprise distribution

### TEST 12.2 — Enterprise Analytics Dashboard

**Tài khoản:** `hr@momo.vn` / `123456`

**Bước:**
1. Login HR Momo → Dashboard / Analytics

**Kết quả mong đợi:**
- Cards: Total Candidates, Interviews, Placements
- Recruitment pipeline chart
- Student evaluation trends

### TEST 12.3 — Student Dashboard — các trạng thái khác nhau

**TEST 12.3a — SV Sem 1-4 (chưa đến OJT)**
- Tài khoản: tạo SV mới với `currentSemester = 3`
- Badge: **ĐANG HỌC KỲ THƯỜNG** (xám)

**TEST 12.3b — SV Sem 5 (chuẩn bị OJT)**
- Tài khoản: `demo.student@fpt.edu.vn` (SE15001, Sem 5)
- Badge: **ĐANG CHUẨN BỊ OJT** (xanh dương)
- Hiển thị card Applications, Interviews (trống)

**TEST 12.3c — SV Sem 6, chưa placement**
- Tài khoản: `student2@fpt.edu.vn` (SE15002, ELIGIBLE)
- Badge: **ACTION REQUIRED** (vàng, nhấp nháy)

**TEST 12.3d — SV OJT ACTIVE**
- Tài khoản: `student21@fpt.edu.vn`
- Badge: **OJT IN PROGRESS** (xanh lá)

**TEST 12.3e — SV OJT COMPLETED**
- Tài khoản: `student26@fpt.edu.vn`
- Badge: **ĐANG HỌC KỲ THƯỜNG** (Sem >= 7)
- Card Evaluation hiển thị điểm

### TEST 12.4 — TM Export dữ liệu

**Bước:**
1. Vào **Eligible Students** → click **Export**
2. Hoặc **Audit Logs** → Export CSV/Excel

**Kết quả mong đợi:**
- File tải về (.xlsx hoặc .csv)
- Dữ liệu đầy đủ, đúng format

---

## LUỒNG 13: At-Risk Students

### TEST 13.1 — TM xem At-Risk Students

**Tài khoản:** `manager@fpt.edu.vn` / `123456`

**Bước:**
1. Vào **At-Risk Students**

**Kết quả mong đợi:**
- 4 tabs: **All** / **Unplaced** / **Report Missed** / **Blocked**
- 4 summary cards: màu vàng, xanh dương, đỏ, tím
- Priority bar có màu theo mức độ
- SE15021 (missed week 4) xuất hiện trong tab Report Missed

### TEST 13.2 — TM filter theo loại rủi ro

**Bước:**
1. Tab **Unplaced**: chỉ hiển thị SV chưa matched/placed
2. Tab **Report Missed**: chỉ hiển thị SV miss/reject weekly reports
3. Tab **Blocked**: chỉ hiển thị SV CANCELLED/DEFERRED

**Kết quả mong đợi:**
- Mỗi tab lọc đúng loại rủi ro
- Count badge trên tab chính xác

### TEST 13.3 — TM search At-Risk Student

**Bước:**
1. Gõ "SE15021" hoặc "Vu Huu Quan" vào ô search

**Kết quả mong đợi:**
- Kết quả lọc theo student code, full name, company name, risk reason

---

## LUỒNG 14: Edge Cases & Validation

### TEST 14.1 — SV chưa ELIGIBLE không apply được

**Bước:**
1. Tạo/have a student with `currentSemester = 4` (không đủ điều kiện)
2. Thử apply job

**Kết quả mong đợi:** HTTP 400 — "Student is not eligible for placement"

### TEST 14.2 — Apply sau deadline

**Bước:**
1. Sửa `application_deadline` của job post về ngày trong quá khứ
2. SV apply job đó

**Kết quả mong đợi:** HTTP 400 — "Application deadline has passed"

### TEST 14.3 — TM không duyệt placement khi semester LOCKED

**Bước:**
1. Lock semester SP26
2. Thử approve placement application

**Kết quả mong đợi:** HTTP 400 — "Semester is locked, cannot modify placement"

### TEST 14.4 — Thử duplicate placement

**Bước:**
1. SE15016 đã có assignment ACTIVE tại Momo (seed data)
2. TM cố approve thêm 1 placement application khác cho SE15016 cùng Momo

**Kết quả mong đợi:** HTTP 400 — "Student already has an active placement in this semester"

### TEST 14.5 — TM không sửa grade khi đã LOCKED

**Bước:**
1. SE15026 có `final_grades.is_locked = TRUE` (seed data)
2. TM thử sửa điểm

**Kết quả mong đợi:** HTTP 400 — "Grade is locked"

### TEST 14.6 — SV withdraw placement application

**Bước:**
```bash
curl -X PUT http://localhost:8080/api/placement-applications/{id}/withdraw \
  -H "Authorization: Bearer <STUDENT_TOKEN>"
```

**Kết quả mong đợi:**
- `placement_applications.status = 'WITHDRAWN'`
- TM thấy status chuyển thành WITHDRAWN

---

## CHECKLIST TỔNG HỢP

### Xác thực & Phân quyền
- [ ] 1.1 Login mỗi role thành công
- [ ] 1.2 Login sai password → 401
- [ ] 1.3 Token hết hạn → 401
- [ ] 1.4 Refresh token hoạt động
- [ ] 1.5 Logout → token bị blacklist
- [ ] 1.6 Enterprise đăng ký → PENDING
- [ ] 1.7 RBAC chặn đúng endpoint

### Semester Management
- [ ] 2.1 Xem danh sách học kỳ
- [ ] 2.2 Tạo học kỳ mới
- [ ] 2.3 Chuyển trạng thái học kỳ
- [ ] 2.4 Lock học kỳ

### Enterprise Management
- [ ] 3.1 TM xem enterprise PENDING
- [ ] 3.2 TM duyệt enterprise → APPROVED + tạo HR account
- [ ] 3.3 HR đổi password
- [ ] 3.4 TM reject enterprise

### Student Management
- [ ] 4.1 TM xem eligible students
- [ ] 4.2 TM thêm sinh viên
- [ ] 4.3 TM cancel student → locked
- [ ] 4.4 Xem chi tiết sinh viên

### Job Board & Applications
- [ ] 5.1 SV duyệt job board
- [ ] 5.2 Filter + search job
- [ ] 5.3 Xem chi tiết job
- [ ] 5.4 SV apply → PENDING
- [ ] 5.5 Giới hạn 3 active applications
- [ ] 5.5b Xem danh sách đơn đã nộp

### Interview
- [ ] 6.1 Enterprise xem ứng viên
- [ ] 6.2 Screen ứng viên
- [ ] 6.3 Reject ứng viên
- [ ] 6.4 Schedule interview
- [ ] 6.5 SV confirm interview
- [ ] 6.6 Record PASS result
- [ ] 6.7 Record FAIL result

### Placement
- [ ] 7.1 TM xem OJT Placement Center
- [ ] 7.2 Xem pending placements
- [ ] 7.3 Approve & Place → tạo assignment + lock student
- [ ] 7.4 Reject placement
- [ ] 7.5 Locked student không sửa được profile
- [ ] 7.6 Filter placement

### Weekly Reports
- [ ] 8.1 SV xem OJT dashboard
- [ ] 8.2 Submit weekly report
- [ ] 8.3 Enterprise approve report
- [ ] 8.4 Enterprise reject report + feedback
- [ ] 8.5 Submit final report

### Evaluation & Grading
- [ ] 9.1 Enterprise evaluate student
- [ ] 9.2 TM publish final grade
- [ ] 9.3 SV xem kết quả
- [ ] 9.4 SV feedback enterprise

### Incident & Warning
- [ ] 10.1 Enterprise report incident
- [ ] 10.2 TM resolve incident
- [ ] 10.3 TM send training warning

### Notifications
- [ ] 11.1 TM create announcement
- [ ] 11.2 SV xem announcement
- [ ] 11.3 SV xem notifications + unread badge

### Dashboard
- [ ] 12.1 TM Command Center
- [ ] 12.2 Enterprise Analytics
- [ ] 12.3 Student Dashboard (5 trạng thái)
- [ ] 12.4 Export data

### At-Risk
- [ ] 13.1 TM xem At-Risk list
- [ ] 13.2 Filter tabs
- [ ] 13.3 Search

### Edge Cases
- [ ] 14.1 Không eligible → không apply
- [ ] 14.2 Apply sau deadline → lỗi
- [ ] 14.3 Locked semester → không duyệt placement
- [ ] 14.4 Duplicate placement → lỗi
- [ ] 14.5 Locked grade → không sửa
- [ ] 14.6 Withdraw placement

---

## CÁCH TRA CỨU KHI GẶP LỖI

| Lỗi | Cách kiểm tra |
|------|--------------|
| Lỗi 500 trên API | `tail -f ueims_backend/logs/app.log` — xem stack trace |
| Frontend blank | `cd ueims_frontend; npm run build` — xem lỗi compile |
| Trigger chặn update | Chạy `ALTER TABLE xxx DISABLE TRIGGER trg_xxx;` tạm thời |
| Không thấy data | Kiểm tra `semester.status = 'ACTIVE'` và đúng semester trong request |
| RBAC lỗi | Kiểm tra `users_roles` trong DB, đúng role name |
| BCrypt login fail | Hash password bằng `node -e "bcrypt.hash('123456',10,...)"` so sánh |
