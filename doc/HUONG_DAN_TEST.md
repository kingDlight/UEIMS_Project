# Hướng dẫn chạy Test E2E với Playwright (Module Authentication)

Tài liệu này hướng dẫn các thành viên trong nhóm cách thiết lập và chạy bộ 15 Test Cases tự động cho chức năng Đăng nhập và Quản trị tài khoản (Module 1).

## 1. Chuẩn bị cơ sở dữ liệu (Database Seed)
Để các test case chạy đúng (ví dụ: test đăng nhập thành công, reset password), database của bạn **phải** có sẵn dữ liệu test.
1. Khởi động MySQL Server.
2. Import 2 file SQL sau vào database `ueims` của bạn:
   - `SQL/full_seed.sql`
   - `SQL/008_fix_status_columns.sql`
   *(Các file này chứa sẵn tài khoản như `sv_test@fpt.edu.vn`, `tm@ueims.edu.vn` và các token cần thiết).*

## 2. Khởi động Backend (Spring Boot)
Playwright E2E Test mô phỏng người dùng thật nên yêu cầu Backend phải hoạt động.
1. Mở terminal, trỏ vào thư mục `ueims_backend`.
2. Chạy ứng dụng Spring Boot:
   ```bash
   ./mvnw.cmd spring-boot:run
   ```
   *Đảm bảo Backend chạy thành công ở cổng 8080 mà không báo lỗi.*

## 3. Khởi động Frontend (React/Vite)
1. Mở một terminal mới, trỏ vào thư mục `ueims_frontend`.
2. Cài đặt các thư viện (nếu chưa cài):
   ```bash
   npm install
   ```
3. Chạy server Frontend:
   ```bash
   npm run dev
   ```
   *Đảm bảo Frontend chạy thành công ở cổng 5173.*

## 4. Chạy Test Tự Động (Playwright)
Giữ nguyên 2 terminal của Backend và Frontend đang chạy. Mở **terminal thứ 3** (ở thư mục `ueims_frontend`).

### Cài đặt Playwright (Lần đầu tiên)
Nếu đây là lần đầu bạn dùng Playwright trên máy, hãy cài đặt trình duyệt ảo:
```bash
npx playwright install
```

### Cách 1: Chạy test ngầm (Nhanh nhất)
Lệnh này sẽ chạy toàn bộ 15 test cases trong nền và trả về kết quả ở terminal:
```bash
npx playwright test
```

### Cách 2: Chạy test với giao diện UI (Khuyên dùng)
Lệnh này mở ra giao diện trực quan, cho phép bạn xem trình duyệt tự động click, gõ chữ, và tua lại từng bước nếu có lỗi.
```bash
npx playwright test --ui
```

---
**Lưu ý khi test lỗi:** 
Nếu có test case bị `Timeout` (VD: `TC-AUTH-007`), 99% nguyên nhân là do Backend chưa chạy, không thể gọi API, hoặc Database chưa được import đúng file seed. Hãy kiểm tra lại Bước 1 và 2.