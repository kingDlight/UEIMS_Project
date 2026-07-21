# UEIMS — Test Guide Blackbox Manual (QA On-Site)

> Phong cách: vào web như người dùng thật, click từng nút, quan sát phản hồi UI, đối chiếu giữa các role.
> Mỗi luồng mô tả: (1) mục đích — (2) tài khoản — (3) thao tác từng bước — (4) kết quả quan sát được trên UI — (5) đối chiếu ở các role khác.

---

## 0. Setup trước khi test

### 0.1 Khởi động hệ thống

| Bước | Thao tác |
|------|----------|
| 1 | Mở pgAdmin, chạy `SQL/001_create_schema.sql` (nếu DB mới) |
| 2 | Chạy các migration: `011`, `012`, `015`, `017` |
| 3 | Chạy seed: `SQL/016_seed_realistic_data.sql` |
| 4 | Mở terminal 1: `cd ueims_backend && mvn spring-boot:run` → chờ "Started UeimsBackendApplication" |
| 5 | Mở terminal 2: `cd ueims_frontend && npm run dev` → mở `http://localhost:5173` |

### 0.2 Bảng tài khoản test (mật khẩu chung: `123456`)

| # | Vai trò | Email | Trạng thái bối cảnh test |
|---|---------|-------|-------------------------|
| 1 | Admin | `admin@fpt.edu.vn` | Quản trị hệ thống |
| 2 | Training Manager | `manager@fpt.edu.vn` | TM chính để test mọi luồng duyệt |
| 3 | HR Momo | `hr@momo.vn` | Enterprise APPROVED, đang mở job Java |
| 4 | HR FPT Software | `hr@fsoft.com` | Enterprise APPROVED, job React |
| 5 | HR Shopee | `hr@shopee.vn` | Enterprise APPROVED, job Fullstack |
| 6 | HR VNG | `hr@vng.com.vn` | Enterprise APPROVED, chưa có job |
| 7 | SV Demo (SE15001) | `demo.student@fpt.edu.vn` | ELIGIBLE, kỳ 5, chưa apply |
| 8 | SV SE15002 | `student2@fpt.edu.vn` | ELIGIBLE, kỳ 6, chưa placement |
| 9 | SV SE15003 | `student3@fpt.edu.vn` | ELIGIBLE, kỳ 6 |
| 10 | SV SE15006 | `student6@fpt.edu.vn` | PENDING — đã apply Momo Java |
| 11 | SV SE15011 | `student11@fpt.edu.vn` | INTERVIEW_SCHEDULED tại Momo |
| 12 | SV SE15016 | `student16@fpt.edu.vn` | MATCHED — đã có placement app APPROVED |
| 13 | SV SE15021 | `student21@fpt.edu.vn` | OJT ACTIVE — đang thực tập Momo |
| 14 | SV SE15026 | `student26@fpt.edu.vn` | OJT COMPLETED — đã có final grade |

**Mẹo QA:** Mở **3 tab trình duyệt song song** (Chrome/Edge/Firefox profile khác nhau hoặc 3 cửa sổ ẩn danh) để login cùng lúc 3 role khác nhau theo dõi chéo.

---

## LUỒNG 1 — Khởi tạo kỳ mới & Duyệt doanh nghiệp

**Mục đích:** Chuẩn bị nền tảng dữ liệu cho mọi luồng sau.

### Bước 1.1 — TM tạo học kỳ mới

**Đăng nhập:** `manager@fpt.edu.vn` / `123456`

| Thao tác | Quan sát |
|----------|----------|
| Sau login, mở sidebar → **Semesters** | Bảng hiển thị SP26 ACTIVE, có các nút bên phải |
| Click **Create Semester** (góc trên bên phải) | Modal form mở ra |
| Nhập Code: `FA26`, Name: `Fall 2026`, Start: `2026-09-01`, End: `2026-12-31`, Weekly day: `SUNDAY`, Time: `23:59`, Final deadline: `2026-12-31 23:59` | Field validation realtime |
| Click **Save** | Toast "Semester created successfully", modal đóng |
| Quan sát bảng | Semester mới có status `DRAFT` |

**Kiểm tra state machine:**
- Click nút **Activate** trên FA26 → status chuyển `UPCOMING`
- Click **Mark Active** → status `ACTIVE`. Lúc này hệ thống cảnh báo: SP26 đang ACTIVE → phải Close SP26 trước

### Bước 1.2 — Doanh nghiệp tự đăng ký (Public)

**Không đăng nhập** — dùng tab ẩn danh.

| Thao tác | Quan sát |
|----------|----------|
| Mở `http://localhost:5173/register-enterprise` | Form đăng ký |
| Điền: Company `TechCorp Test`, Industry `IT`, Size `100-500`, Address `123 Test Street`, Contact `HR TechCorp`, Email `hr.techcorp.test@fpt.edu.vn`, Phone `0901234567`, Password `123456` | - |
| Click **Register** | Trang chuyển sang thông báo "Registration submitted, please wait for TM approval" |

### Bước 1.3 — TM duyệt doanh nghiệp

**Quay lại tab TM** đang đăng nhập.

| Thao tác | Quan sát |
|----------|----------|
| Sidebar → **Enterprises** | Bảng enterprises |
| Filter Status: `PENDING` | Chỉ thấy TechCorp Test |
| Click icon con mắt hoặc tên TechCorp | Modal chi tiết mở: thông tin, người liên hệ |
| Click **Approve** → xác nhận | Toast "Enterprise approved", status → `APPROVED` |
| Sidebar → **Users** (nếu có) hoặc `Users Management` | Tài khoản HR TechCorp mới xuất hiện với role ENTERPRISE |

**Đối chiếu tab HR mới:** Nếu test gửi email, HR nhận được thông tin đăng nhập. Nếu test thủ công, tài khoản HR có sẵn trong DB với `must_change_password = TRUE`.

---

## LUỒNG 2 — Từ SV Apply → HR Screen → HR Interview → TM Approve Placement → SV thực tập

**Mục đích:** Luồng nghiệp vụ cốt lõi xuyên suốt 4 role. Đây là test quan trọng nhất.

### Bước 2.1 — Sinh viên duyệt Job Board

**Đăng nhập:** `demo.student@fpt.edu.vn` (SE15001, kỳ 5, ELIGIBLE)

| Thao tác | Quan sát UI |
|----------|-------------|
| Sidebar → **Dashboard** | Badge: **ĐANG CHUẨN BỊ OJT** (xanh dương), card Applications + Interviews trống |
| Sidebar → **Job Board** | Lưới card job: Momo Java, FPT Software React, Shopee Fullstack |
| Gõ "Java" vào ô tìm kiếm | Chỉ còn 1 card: Momo Java Backend Developer Intern |
| Click vào card Momo Java | Modal/trang chi tiết: description, requirements, max_positions=20, deadline=2026-07-15, nút **Apply Now** |
| Click **Apply Now** | Modal Apply mở: form cho phép chọn CV (URL hoặc upload file), cover letter |
| Để nguyên CV mặc định, gõ cover letter: `Em rất mong muốn được thực tập Java tại Momo` | - |
| Click **Submit** | Toast "Application submitted", modal đóng |
| Quay lại Job Board | Card Momo Java hiển thị badge **"Applied"** (màu xám) thay cho nút Apply |
| Sidebar → **My Applications** | Bảng có 1 dòng: Momo Java — status `PENDING` |

### Bước 2.2 — HR Momo xem ứng viên mới

**Đăng nhập:** `hr@momo.vn` (tab thứ 2)

| Thao tác | Quan sát UI |
|----------|-------------|
| Login HR Momo | Dashboard enterprise: thống kê applicants, interviews |
| Sidebar → **Job Posts** | Danh sách job của Momo |
| Click vào job "Java Backend Developer Intern" | Chi tiết job + section "Applicants" |
| Section Applicants | Kanban board / bảng với cột: Applied → Screening → Interview → Offer |
| Quan sát cột Applied | Có: **Demo Student (SE15001)** vừa apply + các SV từ seed (SE15006, 07, 08, 09, 10) |
| Click vào dòng Demo Student | Drawer/modal chi tiết: CV, cover letter, GPA, semester |

### Bước 2.3 — HR screen ứng viên

| Thao tác | Quan sát |
|----------|----------|
| Trong drawer Demo Student, click **Move to Screening** | Toast "Moved to screening", applicant chuyển cột |
| Quay lại Kanban, cột Screening | Demo Student xuất hiện ở đây |
| Với SE15006 (cột Applied): click **Reject** → nhập lý do `CV không phù hợp` | Toast "Rejected", applicant chuyển cột Rejected |

**Đối chiếu tab SV:** Quay lại tab SE15001 → **My Applications** → status dòng Momo Java đổi từ `PENDING` sang `SCREENING`. Bell notification có badge đỏ — click vào thấy "Your application has been moved to screening".

### Bước 2.4 — HR schedule phỏng vấn

| Thao tác | Quan sát |
|----------|----------|
| Click vào Demo Student ở cột Screening | Drawer mở |
| Click **Schedule Interview** | Modal: form date/time, duration, meeting link |
| Chọn: Date `2026-07-28`, Time `10:00`, Duration `45 minutes`, Link `https://meet.momo.vn/abc123` | - |
| Click **Confirm** | Toast "Interview scheduled", status applicant chuyển cột Interview |
| Sidebar → **Interviews** | Bảng interview có dòng mới: Demo Student — 2026-07-28 10:00 — SCHEDULED |

**Đối chiếu tab SV:** Quay lại SE15001 → sidebar **Schedule** → thấy lịch phỏng vấn Momo với nút **Confirm Attendance**. Click confirm → status chuyển `STUDENT_CONFIRMED`.

### Bước 2.5 — HR ghi kết quả phỏng vấn (PASS)

| Thao tác | Quan sát |
|----------|----------|
| Sidebar → **Interviews** → click vào dòng Demo Student | Modal chi tiết interview |
| Click **Record Result** | Form: Result `PASS`, Notes `Strong technical skills` |
| Submit | Interview status → `COMPLETED`, applicant ở Kanban chuyển cột **Offer** |

**Đối chiếu tab SV:** SE15001 nhận notification "Congratulations! You've passed the interview at Momo". Application status → `ACCEPTED`.

### Bước 2.6 — TM duyệt Self-Placement

**Đăng nhập:** `manager@fpt.edu.vn` (tab thứ 3)

| Thao tác | Quan sát |
|----------|----------|
| Sidebar → **OJT Placement Center** | 5 tab: All, Unplaced, Pending Approval, Placed, Completed |
| Thanh summary chips: Unplaced, Pending, Placed, Completed | Hiển thị count từng loại |
| Click tab **Pending Approval** | Danh sách SV có `placement_applications.status = 'PENDING'` (seed có sẵn 16, 17) |
| **Quan trọng:** SE15001 (Demo Student) chưa có placement application tự động — cần test bằng cách: |  |
| Mở DB: `INSERT INTO placement_applications (semester_id, student_id, enterprise_id, cover_letter, status) VALUES (...);` | Hoặc dùng SQL test riêng |
| Giả sử sau khi có placement app của SE15001 ở PENDING, tab Pending Approval | Hiển thị Demo Student + 2 SV seed |
| Click **Review** trên Demo Student | Modal: xem thông tin SV + enterprise đề xuất (Momo) |
| Click **Approve & Place** | Modal confirm: Start date `2026-03-15`, Supervisor `Sup Momo`, Email `sup@momo.vn` |
| Confirm | Toast "Placement approved", tab Pending giảm 1, tab Placed tăng 1 |
| DB check: `SELECT * FROM enterprise_assignments WHERE student_id = SE15001;` | Có 1 row với `status='ACTIVE'` |

**Đối chiếu tab SV SE15001:**
- Dashboard badge: **OJT IN PROGRESS** (xanh lá) thay vì "ĐANG CHUẨN BỊ OJT"
- Sidebar hiển thị thêm: Training Plan, Weekly Reports, Final Report, Evaluation, Feedback
- Thử click **Profile** → thông báo "Profile is locked during internship"

**Đối chiếu tab HR Momo:**
- Sidebar → **Assigned Students** → Demo Student xuất hiện
- Có thể tạo Internship Plan, đánh giá cuối kỳ

---

## LUỒNG 3 — SV nộp Weekly Report → HR duyệt/từ chối → SV nộp lại

**Mục đích:** Vòng lặp báo cáo tuần (lặp đi lặp lại mỗi tuần).

### Bước 3.1 — SV xem dashboard OJT đang thực tập

**Đăng nhập:** `student21@fpt.edu.vn` (SE15021, OJT ACTIVE tại Momo)

| Thao tác | Quan sát |
|----------|----------|
| Sidebar → **Dashboard** | Badge **OJT IN PROGRESS** xanh, card **Weekly Reports** hiển thị 3 reports |
| Card Enterprise: Momo, Supervisor: Sup Momo | - |
| Card Training Progress: progress bar | Tuần 4/12 |
| Countdown: "Còn 89 ngày đến khi kết thúc kỳ" | - |

### Bước 3.2 — SV nộp Weekly Report tuần 5

| Thao tác | Quan sát |
|----------|----------|
| Sidebar → **Weekly Reports** | Bảng: Week 1 (APPROVED), Week 2 (APPROVED), Week 3 (SUBMITTED), Week 4 (MISSED) |
| Click **New Report** hoặc **Submit Report** | Modal form |
| Điền: Tasks `Built REST API endpoints`, Issues `Need to learn Docker`, Lessons `Learned about Spring Boot testing`, Plan `Continue API work` | - |
| Click **Submit** | Toast "Report submitted", bảng có dòng mới Week 5 (SUBMITTED, màu vàng) |

### Bước 3.3 — HR Momo duyệt report

**Đăng nhập:** `hr@momo.vn` (tab HR)

| Thao tác | Quan sát |
|----------|----------|
| Sidebar → **Reports** / **Weekly Reports Review** | Bảng report SV Momo |
| Filter: Status `SUBMITTED` | Thấy Week 5 SE15021 |
| Click vào dòng đó | Drawer nội dung report |
| Click **Approve** | Toast "Report approved" |

**Đối chiếu tab SV:** Quay lại SE15021 → **Weekly Reports** → Week 5 status đổi sang `APPROVED` (màu xanh). Bell notification có thông báo "Your Week 5 report was approved".

### Bước 3.4 — HR reject report (yêu cầu sửa)

| Thao tác | Quan sát |
|----------|----------|
| Với report SUBMITTED khác (hoặc tạo mới từ SV), HR mở drawer | - |
| Click **Reject** → nhập feedback `Vui lòng bổ sung phần kết quả testing` | Toast "Report rejected" |

**Đối chiếu tab SV:** Report chuyển `REJECTED` (đỏ), tab **Reports** của SV hiển thị feedback từ HR. Nút **Resubmit** xuất hiện.

### Bước 3.5 — SV resubmit

| Thao tác | Quan sát |
|----------|----------|
| Click **Resubmit** trên report bị reject | Modal mở với nội dung cũ |
| Sửa Tasks, Lessons, thêm Notes `Đã bổ sung kết quả testing` | - |
| Submit | Report tạo version mới, status `RESUBMITTED` → HR duyệt → `APPROVED` |

---

## LUỒNG 4 — Internship Plan (HR lên kế hoạch → SV xem & tick milestone)

### Bước 4.1 — HR tạo Internship Plan

**Đăng nhập:** `hr@momo.vn`

| Thao tác | Quan sát |
|----------|----------|
| Sidebar → **Internship Plan** (hoặc **Assigned Students** → click vào SE15021) | Trang quản lý plan |
| Click **Create Plan** | Modal: chọn student `Demo Student (SE15021)`, semester SP26 |
| Điền title: `Java Backend Bootcamp Plan`, description: `12 tuần thực tập` | - |
| Click **Add Milestone** nhiều lần, điền: | - |
| - Tuần 1-2: `Setup dev environment, code review` | - |
| - Tuần 3-4: `Build CRUD APIs` | - |
| - Tuần 5-6: `Integrate payment gateway` | - |
| - Tuần 7-12: `Refactor + Document + Final project` | - |
| Click **Save Plan** | Plan hiển thị trong danh sách |

### Bước 4.2 — SV xem & tick milestone

**Đăng nhập:** `student21@fpt.edu.vn`

| Thao tác | Quan sát |
|----------|----------|
| Sidebar → **Training Plan** | Danh sách milestone từ HR |
| Mỗi milestone có checkbox hoặc nút **Mark Complete** | - |
| Tick milestone "Setup dev environment" | Đánh dấu hoàn thành |
| Click **Update Status** hoặc tự động lưu | Progress bar trên dashboard tăng |

**Đối chiếu tab HR Momo:** Plan cập nhật trạng thái milestone theo SV tick.

---

## LUỒNG 5 — Incident (HR báo cáo → TM xử lý → TM cảnh báo)

### Bước 5.1 — HR báo cáo sự cố

**Đăng nhập:** `hr@momo.vn`

| Thao tác | Quan sát |
|----------|----------|
| Sidebar → **Incidents** → click **Report Incident** | Modal form |
| Chọn student: `SE15021`, Category: `PROLONGED_ABSENCE`, Severity: `MEDIUM` | - |
| Description: `Sinh viên vắng 3 ngày không phép` | - |
| Submit | Bảng incidents có dòng mới, status `OPEN` |

### Bước 5.2 — TM xem và xử lý

**Đăng nhập:** `manager@fpt.edu.vn`

| Thao tác | Quan sát |
|----------|----------|
| Sidebar → **Incidents** | Bảng có incident mới, badge `OPEN` (đỏ) |
| Click vào dòng | Modal: full description, evidence (nếu có) |
| Điền Resolution note: `SV đã có đơn xin nghỉ hợp lệ` | - |
| Click **Resolve** | Status → `RESOLVED`, điền resolved_by + resolved_at |

### Bước 5.3 — TM gửi Training Warning

| Thao tác | Quan sát |
|----------|----------|
| Sidebar → **At-Risk Students** hoặc **Warnings** | - |
| Tìm SE15021, click **Send Warning** | Modal: chọn week, message |
| Message: `Vui lòng cải thiện việc chấm công. Tiếp tục vắng sẽ ảnh hưởng đánh giá.` | - |
| Submit | Toast success, SV nhận notification |

**Đối chiếu tab SV:** SE15021 → bell notification có cảnh báo. Vào **Warnings** (nếu có menu) thấy lịch sử cảnh báo.

---

## LUỒNG 6 — Final Report → Enterprise Evaluate → TM Publish Grade → SV Feedback

### Bước 6.1 — SV nộp Final Report

**Đăng nhập:** `student26@fpt.edu.vn` (SE15026, OJT COMPLETED)

| Thao tác | Quan sát |
|----------|----------|
| Sidebar → **Final Report** | Form upload file báo cáo cuối kỳ |
| Upload file `.pdf` hoặc dán URL `https://example.com/final-report.pdf` | - |
| Điền summary: `Hoàn thành 12 tuần thực tập tại Momo, đóng góp vào 3 module chính` | - |
| Submit | Toast "Final report submitted", status `SUBMITTED` |

### Bước 6.2 — HR đánh giá sinh viên

**Đăng nhập:** `hr@momo.vn`

| Thao tác | Quan sát |
|----------|----------|
| Sidebar → **Evaluation** hoặc **Assigned Students** → SE15026 | Form evaluation |
| Điền: Attitude `8.5`, Professionalism `9.0`, Soft skills `8.0`, Progress `9.0` | - |
| Overall comments: `Intern xuất sắc, chủ động và có tư duy tốt` | - |
| Submit | Toast "Evaluation submitted", bị lock (không sửa được) |

### Bước 6.3 — TM publish final grade

**Đăng nhập:** `manager@fpt.edu.vn`

| Thao tác | Quan sát |
|----------|----------|
| Sidebar → **Final Grades** | Bảng SV đã hoàn thành internship |
| Tìm SE15026, click **Grade** | Modal: hiển thị enterprise eval scores + form nhập final_grade |
| Hệ thống có thể tự tính: `avg(enterprise_scores) = 8.6` | - |
| TM điều chỉnh final_grade: `8.6`, ghi chú | - |
| Click **Publish Grade** | Toast "Grade published", badge `PASSED` hoặc `FAILED` |

**Đối chiếu tab SV:** SE15026 → **Evaluation** → thấy final_grade 8.6, status PASSED, scores chi tiết từ HR.

### Bước 6.4 — SV feedback cho Enterprise

| Thao tác | Quan sát |
|----------|----------|
| Sidebar → **Feedback** (Enterprise Feedback) | Form survey |
| Rate: Training quality `5/5`, Supervisor support `5/5`, Work environment `5/5` | - |
| Positive: `Môi trường chuyên nghiệp, mentor nhiệt tình` | - |
| Improvement: `Nên có nhiều task thực tế hơn` | - |
| Submit | Toast "Feedback submitted" |

**Đối chiếu tab HR:** HR Momo vào **Student Feedback** → thấy feedback từ SE15026.

---

## LUỒNG 7 — Hết kỳ — Đóng & Khóa học kỳ

### Bước 7.1 — TM đóng học kỳ

**Đăng nhập:** `manager@fpt.edu.vn`

| Thao tác | Quan sát |
|----------|----------|
| Sidebar → **Semesters** → tìm SP26 (ACTIVE) | - |
| Click **Close Semester** | Confirm dialog "Are you sure? All incomplete reports will be marked late" |
| Confirm | Status SP26 → `CLOSED` |

### Bước 7.2 — TM khóa học kỳ

| Thao tác | Quan sát |
|----------|----------|
| Với SP26 (CLOSED), click **Lock** | Confirm "Lock will permanently prevent edits" |
| Confirm | Status → `LOCKED` |

**Kiểm tra constraint:**
- Thử Edit SP26 → button disabled hoặc backend từ chối
- Thử approve placement application trong SP26 → báo lỗi "Semester is locked"
- Thử submit weekly report mới → báo lỗi "Cannot submit to locked semester"

---

## LUỒNG 8 — Đăng ký Enterprise mới (Public) và cập nhật Job Board

### Bước 8.1 — HR mới đổi mật khẩu lần đầu

**Sau khi TM duyệt enterprise từ LUỒNG 1:**

| Thao tác | Quan sát |
|----------|----------|
| Login `hr.techcorp.test@fpt.edu.vn` / `123456` | - |
| Hệ thống redirect sang trang **Change Password** (bắt buộc) | - |
| Nhập new password `NewPass123!` | - |
| Sau khi đổi, vào dashboard | `must_change_password = FALSE`, có thể dùng bình thường |

### Bước 8.2 — HR mới tạo Job Post

**Đăng nhập:** HR mới (TechCorp)

| Thao tác | Quan sát |
|----------|----------|
| Sidebar → **Job Posts** → click **Create** | Modal form job |
| Chọn semester: `SP26`, Title: `Junior Backend Dev`, Description, Requirements, Benefits | - |
| Required technologies: `Python, FastAPI`, max_positions: `5`, deadline: `2026-08-15` | - |
| Submit | Job mới trong bảng với status `OPEN` |

### Bước 8.3 — SV thấy job mới

**Đăng nhập:** `student2@fpt.edu.vn` (SE15002)

| Thao tác | Quan sát |
|----------|----------|
| Sidebar → **Job Board** | Reload, thấy thêm card TechCorp Junior Backend |
| Apply job này (giống LUỒNG 2.1) | Application mới với status PENDING |

---

## LUỒNG 9 — Trải nghiệm SV đầy đủ (Persona-based)

**Mục đích:** Test theo "ngày của SV" — từng giai đoạn cuộc đời trong hệ thống.

### Bước 9.1 — SV kỳ 3 (chưa đến OJT)

**Dùng:** Tạo tài khoản SV mới với `currentSemester = 3` (qua DB hoặc admin) → login

| Thao tác | Quan sát |
|----------|----------|
| Sidebar | Chỉ có: Dashboard, Profile, Jobs (không có Applications, Reports...) |
| Dashboard | Badge xám **"ĐANG HỌC KỲ THƯỜNG"** |
| Job Board | Vẫn duyệt được nhưng click Apply → báo "Bạn cần đạt kỳ 5 trở lên để ứng tuyển" |

### Bước 9.2 — SV kỳ 5 chuẩn bị OJT (SE15001)

| Thao tác | Quan sát |
|----------|----------|
| Sidebar | Dashboard, Profile, Jobs, Applications, Schedule |
| Dashboard | Badge xanh **"ĐANG CHUẨN BỊ OJT"** |
| Apply job | Cho phép apply |
| Notification | Sau khi apply, bell có notification mới |

### Bước 9.3 — SV kỳ 6 chưa placement (SE15002)

| Thao tác | Quan sát |
|----------|----------|
| Sidebar | Thêm Schedule, Applications (đầy đủ) |
| Dashboard | Badge vàng nhấp nháy **"ACTION REQUIRED"** |
| Alert | "Bạn chưa có chỗ thực tập. Vào Job Board để apply hoặc liên hệ Training Office" |
| Có 2 nút: **Visit Job Board** + **Contact Support** | - |
| Click Contact Support | Mở email client với subject/email đã điền sẵn |

### Bước 9.4 — SV kỳ 6 at-risk (đã placed nhưng miss reports)

**Tạo state:** SV đang OJT ACTIVE, xóa 3 weekly reports gần nhất.

| Thao tác | Quan sát |
|----------|----------|
| Dashboard | Badge đỏ nhấp nháy **"AT RISK — ACTION REQUIRED"** |
| Alert đỏ | "Bạn đã miss 3 báo cáo tuần. Vui lòng nộp ngay." |
| Weekly Reports tab | Nhiều dòng `MISSED` màu đỏ |

### Bước 9.5 — SV bị block (TM cancel)

**Tạo state:** Set `eligible_students.status = 'CANCELLED'`, `is_locked = TRUE`.

| Thao tác | Quan sát |
|----------|----------|
| Login SV | Dashboard badge đỏ đậm **"BLOCKED"** |
| Alert | "Tài khoản OJT của bạn đã bị hủy bởi Phòng Đào Tạo. Liên hệ support." |
| Sidebar | Bị ẩn bớt các tab OJT |

---

## LUỒNG 10 — Dashboard & Báo cáo (TM, Enterprise, SV)

### Bước 10.1 — TM Command Center Dashboard

**Đăng nhập:** `manager@fpt.edu.vn`

| Thao tác | Quan sát |
|----------|----------|
| Sidebar → **Dashboard** (hoặc mở trang default) | Trang Command Center |
| Các card thống kê: Active semesters, Eligible students, Placed, At-Risk, Incidents, Report submission rate | Số liệu từ DB |
| Biểu đồ placement funnel (Eligible → Applied → Interviewed → Placed) | Biểu đồ cột / đường |
| Biểu đồ report submission theo tuần | - |
| Top enterprise tuyển nhiều SV | - |

**Tương tác:** Click vào 1 card → chuyển sang trang chi tiết tương ứng (ví dụ: click "At-Risk" → mở At-Risk Students tab).

### Bước 10.2 — Enterprise Dashboard

**Đăng nhập:** `hr@momo.vn`

| Thao tác | Quan sát |
|----------|----------|
| Dashboard default | Card: Total applicants, Interviews scheduled, Placed students, Reports pending review |
| Biểu đồ pipeline (Applied → Placed) theo thời gian | - |
| Biểu đồ điểm trung bình SV qua các kỳ | - |

### Bước 10.3 — At-Risk Students (TM)

**Đăng nhập:** `manager@fpt.edu.vn`

| Thao tác | Quan sát |
|----------|----------|
| Sidebar → **At-Risk Students** | 4 tabs: All, Unplaced, Report Missed, Blocked |
| 4 summary cards màu: Vàng (Unplaced), Xanh dương (Report), Đỏ (Blocked), Tím (Deadline Risk) | Count từng loại |
| Tab Unplaced | SV eligible nhưng chưa match — cột Enterprise hiển thị "—" |
| Tab Report Missed | SV đã placed nhưng miss/reject report — cột Missed/Rejected có số |
| Priority bar | Màu theo mức độ: ≥80 đỏ, ≥50 vàng, <50 xanh |
| Ô search | Gõ tên/mã SV → filter realtime |
| Click **Export** | Tải file `.xlsx` với đầy đủ cột |
| Click **Match** trên Unplaced student | Hiện modal/info "Manual Match: coming soon" (nếu backend chưa implement) |

---

## LUỒNG 11 — Notifications & Announcements

### Bước 11.1 — TM tạo Announcement

**Đăng nhập:** `manager@fpt.edu.vn`

| Thao tác | Quan sát |
|----------|----------|
| Sidebar → **Announcements** → click **Create** | Form |
| Title: `Deadline báo cáo tuần`, Content: `Nhắc nhở SV nộp weekly report trước Chủ nhật 23:59`, Audience: `STUDENT` | - |
| Click **Publish** | Announcement mới trong bảng, status `PUBLISHED` |

**Đối chiếu tab SV:** SE15001 vào Dashboard → widget Announcements hiển thị announcement mới với badge "New".

### Bước 11.2 — SV xem Notifications chi tiết

**Đăng nhập:** `student21@fpt.edu.vn`

| Thao tác | Quan sát |
|----------|----------|
| Click icon bell ở header | Dropdown: 5 notification gần nhất |
| Mỗi notification có: icon, title, time ago, "Mark as read" | - |
| Click **View All** | Trang /notifications đầy đủ |
| Filter: All / Unread / By type (Application, Interview, Report...) | - |
| Click 1 notification | Điều hướng đến trang liên quan (Application detail, Interview...) |

---

## LUỒNG 12 — Profile Management

### Bước 12.1 — SV cập nhật profile (khi chưa OJT)

**Đăng nhập:** `demo.student@fpt.edu.vn`

| Thao tác | Quan sát |
|----------|----------|
| Sidebar → **Profile** | Form thông tin cá nhân + academic |
| Click **Edit** | Các field enabled |
| Sửa Skills: thêm `TypeScript, Node.js` | - |
| Upload CV mới (PDF) hoặc đổi CV URL | - |
| Click **Save** | Toast "Profile updated", thông tin mới hiển thị |

### Bước 12.2 — SV cập nhật profile khi đã OJT (locked)

**Đăng nhập:** `student21@fpt.edu.vn` (OJT ACTIVE, is_locked=TRUE)

| Thao tác | Quan sát |
|----------|----------|
| Sidebar → **Profile** | Hiển thị thông báo "Profile is locked during active internship" |
| Các nút Edit bị ẩn / disabled | - |
| Thông tin chỉ xem | - |

---

## LUỒNG 13 — Quản lý User (Admin)

### Bước 13.1 — Admin xem & quản lý users

**Đăng nhập:** `admin@fpt.edu.vn`

| Thao tác | Quan sát |
|----------|----------|
| Sidebar → **Users** | Bảng tất cả users với filter theo role/status |
| Tìm `demo.student` → click | Drawer: profile, roles, last login, audit log |
| Click **Reset Password** | Gửi email reset token (hoặc hiển thị link reset) |
| Click **Deactivate** | User status → `INACTIVE`, không login được |
| Reactivate | Status → `ACTIVE` lại |

### Bước 13.2 — Admin quản lý Roles & Permissions

| Thao tác | Quan sát |
|----------|----------|
| Sidebar → **Roles** | Danh sách 4 roles: ADMIN, TRAINING_MANAGER, ENTERPRISE, STUDENT |
| Click vào `STUDENT` | Bảng permissions của role |
| Toggle 1 permission | Toast success/fail tùy backend support |

### Bước 13.3 — Admin xem Audit Logs

| Thao tác | Quan sát |
|----------|----------|
| Sidebar → **Audit Logs** | Bảng các sự kiện: login, approve, lock, grade publish... |
| Filter theo user, action, date range | - |
| Click **Export** | Tải CSV |

---

## LUỒNG 14 — Đăng nhập, Phân quyền, Lỗi UX

### Bước 14.1 — Login thành công các role

| Thao tác | Quan sát |
|----------|----------|
| Mở `/login`, đăng nhập `admin@fpt.edu.vn` / `123456` | Redirect → `/admin/dashboard` |
| Logout, login `manager@fpt.edu.vn` / `123456` | Redirect → `/training-manager/dashboard` |
| Logout, login `hr@momo.vn` / `123456` | Redirect → `/enterprise/dashboard` |
| Logout, login `demo.student@fpt.edu.vn` / `123456` | Redirect → `/student/dashboard` |

### Bước 14.2 — Login sai mật khẩu

| Thao tác | Quan sát |
|----------|----------|
| Email `admin@fpt.edu.vn`, password `wrongpass` | Form báo lỗi đỏ "Invalid email or password" |
| Thử 5 lần liên tiếp | Có thể bị rate limit → "Too many attempts. Try again in X minutes" |

### Bước 14.3 — Quên mật khẩu

| Thao tác | Quan sát |
|----------|----------|
| Trang login → click **Forgot Password** | Form nhập email |
| Nhập `demo.student@fpt.edu.vn`, submit | Toast "Reset link sent to your email" |
| Check email (hoặc DB để lấy token trực tiếp) | Có link với token |
| Click link → trang Reset Password | Form nhập password mới |
| Submit thành công | Toast "Password reset", redirect login |

### Bước 14.4 — RBAC test

**Dùng browser, không dùng Postman:**

| Thao tác | Quan sát |
|----------|----------|
| Login SV → gõ URL trực tiếp `/training-manager/dashboard` | Redirect hoặc trang 403 |
| Login SV → gõ URL `/admin/users` | Tương tự |
| Login HR Momo → gõ `/training-manager/semesters` | Từ chối truy cập |
| Login TM → gõ `/student/jobs` | Vẫn xem được (TM xem được nhiều) hoặc 403 tùy thiết kế |

### Bước 14.5 — Token hết hạn

| Thao tác | Quan sát |
|----------|----------|
| Login, để tab idle 1-2 giờ (hoặc giảm thời gian sống token trong config) | - |
| Click vào bất kỳ action nào | Toast "Session expired", redirect login |

### Bước 14.6 — Logout

| Thao tác | Quan sát |
|----------|----------|
| Click avatar / menu → **Logout** | Toast "Logged out", redirect login |
| Click browser back | Không vào lại được dashboard (token bị blacklist) |

---

## CHECKLIST QA TỔNG HỢP

Đánh dấu khi test xong. Mỗi item phải có ✅ mới hợp lệ.

### A. Authentication & Setup
- [ ] Đăng nhập thành công cả 4 role (Admin, TM, Enterprise, Student)
- [ ] Login sai password → báo lỗi rõ ràng, không crash
- [ ] Logout → token blacklist, không back lại được
- [ ] Forgot password flow hoàn chỉnh
- [ ] Token tự động refresh hoặc redirect login khi hết hạn
- [ ] RBAC: SV không vào được trang TM/Admin
- [ ] Enterprise HR không vào được trang của enterprise khác

### B. Semester & Enterprise Onboarding
- [ ] TM tạo semester mới thành công
- [ ] State machine: DRAFT → UPCOMING → ACTIVE → CLOSED → LOCKED đúng thứ tự
- [ ] Không cho phép 2 semester ACTIVE cùng lúc
- [ ] Public đăng ký enterprise → status PENDING
- [ ] TM duyệt enterprise → tạo HR account, status APPROVED
- [ ] HR mới phải đổi password lần đầu
- [ ] TM reject enterprise → status REJECTED

### C. Student Workflow
- [ ] SV duyệt Job Board với filter/search hoạt động
- [ ] SV apply job → application PENDING
- [ ] Giới hạn 3 active applications đúng
- [ ] SV kỳ 3-4 không apply được
- [ ] HR screen ứng viên → status SCREENING
- [ ] HR reject ứng viên → status REJECTED
- [ ] HR schedule interview → notification cho SV
- [ ] SV confirm interview → status STUDENT_CONFIRMED
- [ ] HR record PASS → application ACCEPTED
- [ ] HR record FAIL → application REJECTED

### D. Placement
- [ ] TM thấy placement pending trong OJT Center
- [ ] TM approve placement → tạo assignment ACTIVE, lock SV
- [ ] TM reject placement với lý do ≥ 5 ký tự
- [ ] SV locked không sửa được profile
- [ ] SV withdraw placement thành công
- [ ] Duplicate placement bị chặn

### E. OJT In Progress
- [ ] SV dashboard hiển thị OJT IN PROGRESS
- [ ] SV submit weekly report → SUBMITTED
- [ ] HR approve weekly report → APPROVED
- [ ] HR reject weekly report + feedback → SV resubmit được
- [ ] HR tạo internship plan với milestones
- [ ] SV tick milestone → progress cập nhật
- [ ] HR báo cáo incident → TM xử lý
- [ ] TM gửi training warning → SV nhận notification

### F. Evaluation & Grading
- [ ] SV nộp final report (PDF/URL)
- [ ] HR đánh giá SV (scores + comments) → lock
- [ ] TM publish final grade → status PASSED/FAILED
- [ ] SV feedback enterprise → HR xem được

### G. Semester Closing
- [ ] TM close semester → status CLOSED
- [ ] TM lock semester → LOCKED, mọi edit bị chặn
- [ ] Submit weekly report vào LOCKED semester → báo lỗi

### H. Dashboard & Analytics
- [ ] TM Command Center hiển thị số liệu chính xác
- [ ] Enterprise Analytics hiển thị pipeline + scores
- [ ] At-Risk Students có 4 tabs filter đúng
- [ ] Export Excel/CSV tải được file

### I. SV Persona States
- [ ] SV kỳ 3-4: badge xám "ĐANG HỌC KỲ THƯỜNG"
- [ ] SV kỳ 5: badge xanh "ĐANG CHUẨN BỊ OJT"
- [ ] SV kỳ 6 chưa placement: badge vàng "ACTION REQUIRED" + Contact Support
- [ ] SV kỳ 6 placed: badge xanh "OJT IN PROGRESS"
- [ ] SV at-risk: badge đỏ "AT RISK"
- [ ] SV blocked: badge đỏ đậm "BLOCKED"

### J. Notifications
- [ ] Bell icon có badge unread count
- [ ] Click notification → điều hướng đúng
- [ ] TM publish announcement → SV thấy trên dashboard
- [ ] Email reset password gửi được (hoặc có token trong DB)

### K. Admin & Security
- [ ] Admin xem được audit logs
- [ ] Admin deactivate/reactivate user
- [ ] Admin manage roles & permissions
- [ ] Export audit logs CSV

---

## LỖI THƯỜNG GẶP & CÁCH BÁO CÁO

| Hiện tượng | Cách mô tả cho dev |
|------------|---------------------|
| Trang trắng | "Mở tab Network F12, request nào 500? Mở tab Console có error đỏ nào không?" |
| Click nút không phản hồi | "Mở Network, click lại, xem request có fire không, response là gì?" |
| Toast đỏ "Something went wrong" | Copy nguyên text lỗi + step để reproduce |
| Dữ liệu không khớp giữa các role | "Role A thấy X, role B thấy Y, DB có Z — query SQL kiểm tra" |
| UI lệch / vỡ layout | Screenshot + browser + viewport size |

**Khi báo bug, ghi rõ:**
1. **Role + email tài khoản** đang dùng
2. **Step reproduce** (đánh số 1, 2, 3...)
3. **Expected** (mong đợi)
4. **Actual** (thực tế quan sát được)
5. **Screenshot / video** nếu có

---

## MẸO TEST NHANH

- **Dùng 3-4 browser profiles** để login 4 role cùng lúc, theo dõi chéo.
- **Luôn đọc bell notification** ở mỗi role sau khi role khác thay đổi trạng thái.
- **Để ý badge màu sắc**: xám = chưa bắt đầu, xanh dương = đang làm, xanh lá = tốt, vàng = cảnh báo, đỏ = nguy cơ.
- **Reload page** (F5) sau khi role khác thay đổi data — kiểm tra cache có hiển thị đúng không.
- **Test responsive**: thu nhỏ browser xuống 768px, 375px xem có vỡ không.
- **Test trình duyệt khác**: Chrome, Edge, Firefox — đặc biệt form upload file.
