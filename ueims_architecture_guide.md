# Kiến Trúc và Công Nghệ (Tham Khảo Từ UEIMS)

Tài liệu này tổng hợp lại toàn bộ kiến trúc, công nghệ và các "Design Pattern" (Mẫu thiết kế) đã được áp dụng cực kỳ chuẩn mực ở dự án `ueims` gốc. Bạn và team có thể dùng file này làm **"Kim chỉ nam"** khi code repo mới để đảm bảo tính đồng bộ, chuyên nghiệp và cực kỳ dễ scale.

## 1. Công Nghệ Sử Dụng (Tech Stack)
- **Framework Chính:** Java Spring Boot.
- **Ngôn ngữ:** Java 21.
- **Database & ORM:** PostgreSQL + Spring Data JPA (Hibernate).
- **Security:** Spring Security + Spring Boot OAuth2 Resource Server.
- **Thư viện phụ trợ cực kỳ quan trọng:** 
  - **Lombok:** Giảm thiểu việc phải tự gõ các hàm Get/Set/Builder dài dòng.
  - **MapStruct:** Thư viện giúp tự động map (sao chép) dữ liệu giữa DTO và Entity siêu nhanh lúc compile.
  - **Nimbus JOSE + JWT:** Thư viện chuẩn công nghiệp dùng để tạo và giải mã JWT Token một cách bảo mật.
  - **Hibernate Validator:** Dùng để xác thực dữ liệu đầu vào (Validation).

---

## 2. Chuẩn Hóa Cấu Trúc Thư Mục (Layered Architecture)
Dự án được chia theo kiến trúc nhiều tầng (N-Tier) rất rõ ràng, ai làm việc nấy:
- **`controller`**: Chỉ làm nhiệm vụ đón Request từ Frontend, nhận DTO, gọi Service. Tuyệt đối không viết logic tính toán hay chọc vào Database ở tầng này.
- **`service`**: Chứa toàn bộ "não bộ" (Business Logic). Tầng này xử lý logic nghiệp vụ, gọi DB thông qua Repository, và gom dữ liệu trả về cho Controller.
- **`repository`**: Tầng duy nhất được phép chọc vào Database thông qua các interface `JpaRepository`.
- **`entity`**: Các class ánh xạ trực tiếp 1-1 với cấu trúc bảng trong Database (dùng `@Entity`).
- **`dto` (Data Transfer Object)**: Tầng giao tiếp dữ liệu với bên ngoài.
  - *Request DTO*: Chứa dữ liệu Frontend gửi lên (kèm các tag bắt lỗi `@NotBlank`, `@Size`...).
  - *Response DTO*: Chứa dữ liệu đã được chắt lọc để gửi về cho Frontend (tuyệt đối không gửi thẳng Entity về vì nó sẽ làm lộ password hoặc những trường nhạy cảm).
- **`mapper`**: Chứa các interface MapStruct để chuyển đổi tự động (Ví dụ chuyển `UserRequestDTO` thành `User` Entity).

---

## 3. Kiến Trúc Bảo Mật (Authentication & Authorization)
- **Dùng JWT (JSON Web Token):** Khi Login, Backend mã hóa thông tin thành 1 chuỗi token (gồm Header, Payload chứa thông tin Roles, và Chữ ký Signature).
- **Luồng Refresh Token:** Cấp cho Frontend 1 Access Token (Sống ngắn, tầm 1 tiếng) và 1 Refresh Token (Sống lâu, tầm 1 tháng). Khi Access Token hết hạn, gọi API cấp lại để lấy token mới mà không cần bắt user phải đăng nhập lại từ đầu.
- **Mã hóa Password:** Sử dụng thuật toán **BCrypt** (`BCryptPasswordEncoder`). Mật khẩu sẽ bị băm 1 chiều cộng thêm chuỗi muối ngẫu nhiên (Salt), khiến cho ngay cả DBA có soi Database cũng không biết pass thật là gì.
- **Tự động trích xuất Quyền (Role/Permission):** Server tự check chữ ký của JWT xem có hợp lệ không (CustomJwtDecoder). Nếu hợp lệ, tự động móc cái Role trong token ra và cấp quyền cho User đó luôn.
- **Token Blacklist (Logout):** Khi user bấm đăng xuất, ID của Token (`jti`) sẽ bị nhét vào bảng `invalidated_tokens`. Lần sau user ráng dùng lại token đó thì sẽ bị chặn lại ngay lập tức (Check trong `AuthService`).

---

## 4. Chuẩn Hóa API & Xử Lý Ngoại Lệ (Best Practices)
- **Chuẩn hóa Format API Trả Về (`ApiResponse`):** 
  Mọi API khi phản hồi (dù thành công hay thất bại) đều phải bọc trong một form chuẩn là `ApiResponse` để Frontend dễ code và bắt lỗi.
  *Ví dụ JSON:* `{ "code": 1000, "message": "Success", "result": { ... } }`
- **Gom lỗi về một mối (`GlobalExceptionHandler`):**
  Dùng cơ chế `@ControllerAdvice`. Xuyên suốt dự án (kể cả ở Service), khi phát hiện lỗi gì (như User không tồn tại, sai mật khẩu), bạn chỉ việc gọi `throw new AppException(ErrorCode.USER_NOT_EXISTED);`. Thằng GlobalException sẽ tự động chộp lấy lỗi đó, trả về HTTP Status và JSON Code đúng chuẩn đã định dạng trong enum `ErrorCode`. Bạn không bao giờ phải viết try-catch thủ công khắp nơi.
- **Custom Validator (Ví dụ `@DobConstraint`):** Dễ dàng tạo các tag xác thực dữ liệu riêng biệt. Ví dụ chỉ cần gắn `@DobConstraint(min=18)` lên trường ngày sinh ở DTO, hệ thống sẽ tự chặn không cho đăng ký nếu user chưa đủ 18 tuổi.
