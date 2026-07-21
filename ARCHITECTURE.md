# Sơ đồ kiến trúc hệ thống UEIMS

## Tổng quan 3-tier

Hệ thống UEIMS được thiết kế theo mô hình **3-tier architecture**:

```
┌─────────────────────┐         ┌──────────────────────────┐         ┌─────────────────────┐
│    CLIENT TIER      │         │    APPLICATION TIER      │         │  EXTERNAL SERVICES  │
│    (Frontend)       │         │       (Backend)          │         │     & STORAGE       │
│                     │         │                          │         │                     │
│  ┌───────────────┐  │  HTTPS  │  ┌────────────────────┐  │  SMTP   │  ┌───────────────┐  │
│  │               │  │ Request │  │                    │  │ ──────► │  │   SMTP Mail   │  │
│  │   React Web   │  │ + Bearer│  │   REST Controller  │  │         │  │    Server     │  │
│  │      App      │◄─┼─────────┼──┤      (Spring)      │  │         │  └───────────────┘  │
│  │               │  │  JWT    │  │                    │  │         │                     │
│  │               │  │         │  └─────────┬──────────┘  │         │  ┌───────────────┐  │
│  └───────────────┘  │         │            │             │  SQL    │  │   Database    │  │
│                     │         │            ▼             │ ──────► │  │    Server     │  │
│                     │         │  ┌────────────────────┐  │         │  └───────────────┘  │
│                     │         │  │   Service Layer    │  │         │                     │
│                     │         │  │ (Business Logic)   │  │         │                     │
│                     │         │  └─────────┬──────────┘  │         │                     │
│                     │         │            │             │         │                     │
│                     │         │            ▼             │         │                     │
│                     │         │  ┌────────────────────┐  │         │                     │
│                     │         │  │  Repository Layer  │  │         │                     │
│                     │         │  │    (Data Access)   │  │         │                     │
│                     │         │  └────────────────────┘  │         │                     │
│                     │         │                          │         │                     │
└─────────────────────┘         └──────────────────────────┘         └─────────────────────┘
```

---

## 1. Client Tier (Frontend)

**Công nghệ:** React + Vite + TypeScript

**Chức năng:**
- Giao diện người dùng (UI) chạy trên trình duyệt
- Người dùng thao tác: đăng nhập, xem danh sách, thêm/sửa/xóa dữ liệu
- Mọi request gửi lên backend đều kèm **Bearer JWT Token** trong header `Authorization`

**Ví dụ request:**
```
GET /api/students
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
```

---

## 2. Application Tier (Backend - Spring Boot)

Backend được tổ chức thành **3 layer xếp theo thứ tự xử lý**:

### 2.1. REST Controller Layer
- **Nhiệm vụ:** Nhận HTTP request từ frontend, parse JSON body, validate input cơ bản
- **Không chứa business logic** — chỉ điều phối
- Trả về JSON response

**Ví dụ:**
```java
@PostMapping("/api/auth/google")
public ResponseEntity<AuthResponse> loginWithGoogle(@RequestBody GoogleLoginRequest request) {
    return ResponseEntity.ok(authService.handleGoogleLogin(request.getIdToken()));
}
```

### 2.2. Service Layer
- **Nhiệm vụ:** Xử lý **business logic** (nghiệp vụ chính)
- Validate dữ liệu phức tạp
- Phân quyền (authorization)
- Điều phối nhiều repository

**Ví dụ:**
```java
public AuthResponse handleGoogleLogin(String idToken) {
    // 1. Verify id_token với Google
    GoogleIdToken.Payload payload = verifyGoogleToken(idToken);

    // 2. Tìm hoặc tạo user trong DB
    User user = userRepository.findByEmail(payload.getEmail())
        .orElseGet(() -> createNewUser(payload));

    // 3. Phát hành JWT của hệ thống
    String jwt = jwtService.generateToken(user);

    return new AuthResponse(jwt, user);
}
```

### 2.3. Repository Layer
- **Nhiệm vụ:** Truy xuất dữ liệu từ database (CRUD thuần)
- Dùng **Spring Data JPA** — chỉ định nghĩa interface, framework tự sinh SQL

**Ví dụ:**
```java
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
}
```

---

## 3. External Services & Storage

### 3.1. SMTP Mail Server
- Gửi email: thông báo, reset password, xác nhận lịch phỏng vấn,...

### 3.2. Database Server
- Lưu trữ toàn bộ dữ liệu chính: users, students, jobs, interviews,...

---

## Luồng hoạt động thực tế

### Flow 1: Đăng nhập bằng Google

```
User          Frontend (React)        Backend Controller       Service Layer          Google API         Database
 │                  │                        │                      │                    │                │
 │ 1. Click "Đăng nhập Google"                │                      │                    │                │
 ├─────────────────►│                        │                      │                    │                │
 │                  │ 2. useGoogleLogin()    │                      │                    │                │
 │                  ├──────────────────────────────────────────────────────────────►  │                │
 │                  │ 3. Google trả về id_token│                      │                    │                │
 │                  │◄──────────────────────────────────────────────────────────────┤                │
 │                  │                        │                      │                    │                │
 │                  │ 4. POST /api/auth/google│                      │                    │                │
 │                  │    body: {id_token}     │                      │                    │                │
 │                  ├───────────────────────►│                      │                    │                │
 │                  │                        │ 5. authService.handleGoogleLogin()         │                │
 │                  │                        ├─────────────────────►│                    │                │
 │                  │                        │                      │ 6. Verify token    │                │
 │                  │                        │                      ├──────────────────►│                │
 │                  │                        │                      │ 7. Token hợp lệ + email          │
 │                  │                        │                      │◄──────────────────┤                │
 │                  │                        │                      │                    │                │
 │                  │                        │                      │ 8. Tìm user theo email            │
 │                  │                        │                      ├─────────────────────────────────────►
 │                  │                        │                      │ 9. User record                   │
 │                  │                        │                      │◄─────────────────────────────────────
 │                  │                        │                      │                    │                │
 │                  │                        │                      │ 10. (Nếu chưa có) Tạo user mới     │
 │                  │                        │                      ├─────────────────────────────────────►
 │                  │                        │                      │                    │                │
 │                  │                        │                      │ 11. Tạo JWT token │                │
 │                  │                        │◄─────────────────────┤                    │                │
 │                  │ 12. Response: {token, user}                    │                    │                │
 │                  │◄───────────────────────┤                      │                    │                │
 │ 13. Lưu JWT vào localStorage                │                      │                    │                │
 │◄─────────────────┤                        │                      │                    │                │
 │                  │                        │                      │                    │                │
 │ 14. Redirect về /dashboard                  │                      │                    │                │
 │◄─────────────────┤                        │                      │                    │                │
```

**Tóm tắt các bước:**
1. User click "Đăng nhập Google"
2. Frontend gọi `useGoogleLogin()` → Google popup
3. Google trả về `id_token`
4. Frontend gửi POST `/api/auth/google` với `id_token` lên backend
5. Controller nhận request → gọi `AuthService`
6. Service verify `id_token` với Google → lấy email
7. Token hợp lệ, email verified
8-10. Tìm user trong DB, nếu chưa có thì tạo mới
11. Service tạo JWT của hệ thống
12. Trả `{token: "xxx", user: {...}` về frontend
13. Frontend lưu JWT vào localStorage
14. Redirect user về `/dashboard`

---

### Flow 2: Request bất kỳ sau khi đã đăng nhập (ví dụ: xem danh sách sinh viên)

```
User          Frontend (React)        REST Controller       Service Layer       Repository         Database
 │                  │                        │                    │                  │                │
 │ 1. Click "Students"                        │                    │                  │                │
 ├─────────────────►│                        │                    │                  │                │
 │                  │ 2. GET /api/students   │                    │                  │                │
 │                  │    Header: Authorization: Bearer <jwt>         │                  │                │
 │                  ├───────────────────────►│                    │                  │                │
 │                  │                        │ 3. JwtFilter xác thực token          │                │
 │                  │                        │    Lấy userId từ payload              │                │
 │                  │                        │                    │                  │                │
 │                  │                        │ 4. studentService.getAll()            │                │
 │                  │                        ├───────────────────►│                  │                │
 │                  │                        │                    │ 5. studentRepo.findAll()           │
 │                  │                        │                    ├─────────────────►│                │
 │                  │                        │                    │                  │ 6. SELECT *... │
 │                  │                        │                    │                  ├───────────────►│
 │                  │                        │                    │                  │ 7. Result rows │
 │                  │                        │                    │                  │◄───────────────┤
 │                  │                        │                    │ 8. List<Student> │                │
 │                  │                        │                    │◄─────────────────┤                │
 │                  │                        │ 9. List<Student>   │                  │                │
 │                  │                        │◄───────────────────┤                  │                │
 │                  │ 10. Response: [{...}, {...}]                 │                  │                │
 │                  │◄───────────────────────┤                    │                  │                │
 │ 11. Render UI    │                        │                    │                  │                │
 │◄─────────────────┤                        │                    │                  │                │
```

**Tóm tắt các bước:**
1. User click menu "Students"
2. Frontend gửi GET `/api/students` kèm JWT
3. Backend `JwtFilter` xác thực token → lấy `userId`
4. Controller gọi `StudentService.getAll()`
5. Service gọi `StudentRepository.findAll()`
6-7. Repository sinh SQL `SELECT * FROM students` → truy vấn DB
8. DB trả về danh sách records
9-10. Service → Controller → Response JSON về frontend
11. React render danh sách lên UI

---

## Nguyên tắc thiết kế

| Layer | Chứa gì | KHÔNG chứa gì |
|-------|---------|---------------|
| **Controller** | Nhận/trả HTTP request, parse JSON, gọi Service | Business logic, query DB trực tiếp |
| **Service** | Business logic, validation, phân quyền, transaction | Xử lý HTTP (status code, header) |
| **Repository** | Query DB (CRUD thuần) | Business logic, xử lý HTTP |

---

## Các khái niệm quan trọng

### JWT Token là gì?
- "Vé vào cửa" mà frontend gửi kèm mỗi request
- Có 3 phần: `header.payload.signature`
- Backend giải mã `payload` để biết user nào, role gì, có quyền gì
- Có thời hạn (vd: 1 giờ), sau đó user phải login lại

### Tại sao tách 3 layer?
- **Dễ bảo trì:** Sửa logic ở Service không ảnh hưởng Controller
- **Dễ test:** Test từng layer độc lập
- **Tái sử dụng:** Nhiều Controller có thể dùng chung Service
- **Rõ ràng trách nhiệm:** Mỗi layer làm đúng việc của nó

### Bearer Token trong Header
```
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
```
- Từ "Bearer" = "người mang" — ai có token này được coi là user đó
- Frontend tự động thêm vào mọi request nhờ **axios interceptor**

---

## Tổng kết

| Tầng | Công nghệ | Nhiệm vụ chính |
|------|-----------|----------------|
| **Client Tier** | React + Vite | UI, gửi request với JWT |
| **Application Tier** | Spring Boot (Java) | Controller → Service → Repository |
| **External Services** | SMTP, PostgreSQL | Email + Lưu trữ dữ liệu |

Luồng dữ liệu: **Frontend** ↔ **Backend (Controller → Service → Repository)** ↔ **Database**

Vì sao OAuth Google quan trọng trong flow này?

Thay vì user nhập username/password, Google đã xác thực rồi → Backend chỉ cần:
1. Verify token Google gửi về
2. Tìm/tạo user trong DB
3. Phát hành JWT của hệ thống

→ User dùng tài khoản Google, không cần nhớ password cho UEIMS.