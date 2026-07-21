# Hướng dẫn Test — OJT Status Dashboard

## Trước khi test

### 1. Backend — Restart

```bash
# Restart backend (nạp enum OjtStatus mới)
cd ueims_backend
mvn spring-boot:run
# Hoặc chạy từ IDE (IntelliJ/Eclipse/VS Code)
```

### 2. Frontend — Rebuild

```bash
cd ueims_frontend
npm run dev
```

---

## Phần 1: Test Student Dashboard (sinh viên)

### Test case 1 — Sinh viên kỳ 1-4 (chưa đến OJT)

**Bước:**
1. Login với tài khoản SV có `currentSemester = 3`
2. Mở Dashboard

**Kỳ vọng:**
- Badge trên header: **"ĐANG HỌC KỲ THƯỜNG"** (màu xám)
- Không hiển thị alert gì đặc biệt

### Test case 2 — Sinh viên kỳ 5 (chuẩn bị OJT)

**Bước:**
1. Login với tài khoản SV có `currentSemester = 5`
2. Mở Dashboard

**Kỳ vọng:**
- Badge: **"ĐANG CHUẨN BỊ OJT"** (màu xanh dương)
- Hiển thị 2 card: Applications + Interviews (còn trống)
- Quick Actions: Browse Jobs, My Schedule

### Test case 3 — Sinh viên kỳ 6, CHƯA có placement

**Bước:**
1. Login với tài khoản SV có `currentSemester = 6`
2. Kiểm tra `eligible_students` chưa có `enterprise_assignments`

**Kỳ vọng:**
- Badge: **"ACTION REQUIRED"** (màu vàng, nhấp nháy)
- Alert hiện: "Bạn chưa có chỗ thực tập và chưa nộp hồ sơ nào"
- Alert có **2 nút**: "Visit Job Board" + "Liên hệ [Tên TM]"
- Click "Liên hệ" → mở email client với subject đã điền sẵn

### Test case 4 — Sinh viên kỳ 6, ĐÃ có placement

**Bước:**
1. Login với tài khoản SV có `enterprise_assignments.status = 'ACTIVE'`
2. Mở Dashboard

**Kỳ vọng:**
- Badge: **"OJT IN PROGRESS"** (màu xanh lá)
- Hiển thị card Weekly Reports với số báo cáo đã nộp
- Hiển thị card Training Progress với progress bar

### Test case 5 — Sinh viên kỳ 6, AT RISK (miss reports)

**Bước:**
1. Login với tài khoản SV đã placed nhưng miss báo cáo tuần
2. Kiểm tra: `weekly_reports` có nhiều `NOT_SUBMITTED`

**Kỳ vọng:**
- Badge: **"AT RISK — ACTION REQUIRED"** (màu đỏ, nhấp nháy)
- Alert đỏ hiện: mô tả lý do miss (ví dụ: "Bạn đã miss 3 báo cáo tuần")

### Test case 6 — Sinh viên kỳ 6, BLOCKED

**Bước:**
1. Login với tài khoản SV có `eligible_students.status = 'CANCELLED'`

**Kỳ vọng:**
- Badge: **"BLOCKED"** (màu đỏ đậm, nhấp nháy)
- Alert: "Tài khoản OJT đã bị hủy bởi phòng Đào tạo"

### Test case 7 — Sinh viên kỳ 7-9 (đã xong OJT)

**Bước:**
1. Login với tài khoản SV có `currentSemester = 8`
2. Mở Dashboard

**Kỳ vọng:**
- Badge: **"ĐANG HỌC KỲ THƯỜNG"** (vì kỳ >= 6 không còn OJT)
- Card Evaluation hiển thị điểm số

---

## Phần 2: Test TM Dashboard (Training Manager)

### Test case 8 — TM xem danh sách At-Risk Students

**Bước:**
1. Login với tài khoản TM
2. Vào menu **At-Risk Students**

**Kỳ vọng:**
- Table hiển thị danh sách SV có vấn đề
- 4 tabs: **All**, *image.png*Unplaced**, **Report Missed**, **Blocked**, **Deadline Risk**
- Mỗi tab có số count phía trên
- 4 summary cards màu: Vàng (Unplaced), Xanh dương (Report), Đỏ (Blocked), Tím (Deadline)
- Priority bar có màu theo mức độ (>= 80: đỏ, >= 50: vàng, < 50: xanh)

### Test case 9 — TM filter theo loại rủi ro

**Bước:**
1. Ở tab At-Risk Students, click tab **"Unplaced"**

**Kỳ vọng:**
- Chỉ hiển thị SV chưa có placement (eligible nhưng chưa matched)
- Cột "Enterprise" hiển thị **"—"**
- Cột "Risk Reason": mô tả lý do cụ thể

### Test case 10 — TM filter "Report Missed"

**Bước:**
1. Click tab **"Report Missed"**

**Kỳ vọng:**
- Chỉ hiển thị SV đã placed nhưng miss/reject reports
- Cột "Missed / Rejected": hiển thị số cụ thể
- Priority bar phản ánh mức độ nghiêm trọng

### Test case 11 — TM search sinh viên

**Bước:**
1. Gõ tên hoặc mã SV vào ô search

**Kỳ vọng:**
- Kết quả lọc theo tên, mã SV, tên công ty, lý do rủi ro

### Test case 12 — TM Export Excel

**Bước:**
1. Click nút **"Export List"**

**Kỳ vọng:**
- Tải file `.xlsx`
- File chứa đầy đủ columns: Student Code, Full Name, Company, Risk Category, Priority, Missed/Rejected, Risk Reason

### Test case 13 — TM Action buttons

**Bước:**
1. Ở dòng SV có Risk Category = **"Unplaced"**
2. Click nút **"Match"**

**Kỳ vọng:**
- Toast "Manual Match: coming soon" (chức năng chưa implement)

---

## Phần 3: Test API trực tiếp (Postman/cURL)

### Test API OjtStatus

```bash
curl -X GET "http://localhost:8080/api/ojt-status/my" \
  -H "Authorization: Bearer <TOKEN>"
```

**Kỳ vọng response:**
```json
{
  "ojtStatus": "PLACED",
  "statusLabel": "OJT IN PROGRESS",
  "statusColor": "#10B981",
  "isUrgent": false,
  "riskReason": null,
  "daysUntilDeadline": 45,
  "deadlineLabel": "Còn 45 ngày đến khi kết thúc kỳ",
  "placementEnterpriseName": "TechCorp Vietnam",
  "contactSupportEmail": "training-office@ueims.edu.vn",
  "contactSupportName": "Phòng Đào Tạo",
  "applicationCount": 3,
  "interviewCount": 1,
  "reportCount": 4,
  "semesterId": "<uuid>",
  "semesterName": "Summer 2026"
}
```

### Test API At-Risk Students (TM)

```bash
# Tất cả
curl -X GET "http://localhost:8080/api/at-risk-students?semesterId=<SEMESTER_UUID>" \
  -H "Authorization: Bearer <TM_TOKEN>"

# Chỉ Unplaced
curl -X GET "http://localhost:8080/api/at-risk-students?semesterId=<SEMESTER_UUID>&riskCategory=UNPLACED" \
  -H "Authorization: Bearer <TM_TOKEN>"

# Chỉ Report Missed
curl -X GET "http://localhost:8080/api/at-risk-students?semesterId=<SEMESTER_UUID>&riskCategory=REPORT" \
  -H "Authorization: Bearer <TM_TOKEN>"
```

---

## Checklist — Đánh dấu khi test xong

### Student Dashboard
- [ ] SV kỳ 1-4: Badge xám "ĐANG HỌC KỲ THƯỜNG"
- [ ] SV kỳ 5: Badge xanh "ĐANG CHUẨN BỊ OJT"
- [ ] SV kỳ 6 chưa placement: Badge vàng "ACTION REQUIRED" + Alert + nút Contact Support
- [ ] SV kỳ 6 đã placement: Badge xanh "OJT IN PROGRESS"
- [ ] SV kỳ 6 at-risk: Badge đỏ "AT RISK — ACTION REQUIRED" + Alert đỏ
- [ ] SV kỳ 6 blocked: Badge đỏ đậm "BLOCKED"
- [ ] Click "Liên hệ" → mở email client

### TM Dashboard
- [ ] Danh sách hiển thị đầy đủ 4 nhóm
- [ ] Tab filter hoạt động đúng
- [ ] Priority bar có màu theo mức độ
- [ ] Search lọc đúng
- [ ] Export Excel tải được file
- [ ] Action buttons hiển thị

### API
- [ ] `GET /api/ojt-status/my` trả về đúng status
- [ ] `GET /api/at-risk-students` trả về danh sách
- [ ] Filter `riskCategory` hoạt động
- [ ] Không có lỗi 500

---

## Nếu gặp lỗi

### Lỗi 500 khi gọi API

1. Kiểm tra backend console/log — tìm stack trace
2. Thường là thiếu field trong entity hoặc null pointer
3. Chạy `mvn compile` để xem lỗi build

### Badge không hiển thị đúng

1. Kiểm tra `OjtStatusServiceImpl` logic
2. Đảm bảo `currentSemester` đúng trong `student_profiles`

### TM Dashboard trống

1. Kiểm tra semester có `status = 'ACTIVE'` trong DB
2. Kiểm tra có eligible_students trong semester đó
3. Kiểm tra backend log có exception không

### Frontend build lỗi

```bash
cd ueims_frontend
rm -rf node_modules/.vite
npm run dev
```
