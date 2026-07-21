# Hệ thống UEIMS được xây dựng như thế nào?

## Bối cảnh

Trước đây, khi một sinh viên đi thực tập, quy trình diễn ra như thế này:
- Sinh viên gửi email cho công ty
- Công ty gửi email cho trường
- Trường gửi thư cho sinh viên
- Mọi thứ rời rạc, dễ thất lạc, khó theo dõi

**UEIMS ra đời để giải quyết vấn đề đó** — đưa toàn bộ quy trình lên một nền tảng số, để 3 bên (nhà trường, doanh nghiệp, sinh viên) cùng nhìn vào một hệ thống duy nhất.

---

## Tổng quan kiến trúc — Mô hình 3 lớp

Hệ thống UEIMS được thiết kế theo mô hình **3-tier architecture** (3 lớp), giống như cách một nhà hàng hoạt động:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          MÔ HÌNH 3 LỚP                                  │
│                                                                         │
│    ┌───────────────────┐                                                │
│    │   LỚP 1: QUẢN LÝ   │  ← "Quầy phục vụ"                           │
│    │   (Client Tier)    │     Tiếp nhận yêu cầu từ khách hàng          │
│    └─────────┬─────────┘                                                │
│              │  Gửi yêu cầu bằng " vé xác nhận " (JWT Token)           │
│              ▼                                                          │
│    ┌───────────────────┐                                                │
│    │   LỚP 2: XỬ LÝ     │  ← "Bếp nấu"                                │
│    │ (Application Tier)  │     Nhận yêu cầu, chế biến, kiểm tra         │
│    └─────────┬─────────┘                                                │
│              │  Gửi yêu cầu lấy/ghi dữ liệu                            │
│              ▼                                                          │
│    ┌───────────────────┐                                                │
│    │   LỚP 3: LƯU TRỮ   │  ← "Kho hàng"                                │
│    │(External Services) │     Lưu trữ nguyên liệu, ghi chép            │
│    └───────────────────┘                                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Lớp 1: Client Tier (Giao diện người dùng)

### Công nghệ sử dụng: React + Vite

**React** là một thư viện JavaScript phổ biến nhất thế giới để xây dựng giao diện web. Giống như việc bạn dùng PowerPoint để tạo slide — React giúp lập trình viên tạo giao diện một cách có tổ chức, tái sử dụng được.

**Vite** là công cụ build (đóng gói) nhanh, giúp frontend chạy mượt mà trong quá trình phát triển.

### Nó hoạt động như thế nào?

Khi bạn mở UEIMS trên trình duyệt:

```
┌──────────────────────────────────────────────────────┐
│                    TRÌNH DUYỆT                       │
│                                                      │
│   ┌────────────────────────────────────────────┐    │
│   │              GIAO DIỆN UEIMS                 │    │
│   │                                              │    │
│   │   [Logo]  Quản lý Thực tập Sinh viên       │    │
│   │   ───────────────────────────────────────   │    │
│   │   Dashboard | Sinh viên | Doanh nghiệp |... │    │
│   │   ───────────────────────────────────────   │    │
│   │                                              │    │
│   │   Chào mừng, Nguyễn Văn A                    │    │
│   │   Lớp: K63CNTT                               │    │
│   │                                              │    │
│   │   📊 Công việc đang ứng tuyển: 3            │    │
│   │   📅 Lịch phỏng vấn: 1                      │    │
│   │   📝 Báo cáo tuần: Đã nộp tuần 5            │    │
│   │                                              │    │
│   └────────────────────────────────────────────┘    │
│                                                      │
│   → Mỗi khi bạn click, React cập nhật giao diện    │
│     mà KHÔNG cần tải lại trang (SPA - Single Page)  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Đặc điểm quan trọng: JWT Token

Mỗi khi giao diện gửi yêu cầu lên server, nó đều kèm theo một **"vé xác nhận"** gọi là JWT Token.

- **JWT Token là gì?** Giống như thẻ ra vào thư viện — thẻ này xác nhận "bạn là ai" và "bạn có quyền gì".
- **Token trông như thế nào?** Một chuỗi ký tự dài, ví dụ:
  ```
  eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIn0.abc123...
  ```
- **Ai tạo ra nó?** Backend tạo ra khi bạn đăng nhập, và gửi về cho frontend lưu trữ.
- **Token có thời hạn?** Có, thường là vài giờ. Hết hạn thì phải đăng nhập lại.

---

## Lớp 2: Application Tier (Xử lý nghiệp vụ)

### Công nghệ sử dụng: Spring Boot (Java)

**Spring Boot** là framework phổ biến nhất của Java để xây dựng ứng dụng web. Nó giống như một "khung nhà thông minh" — đã có sẵn nền móng, lập trình viên chỉ cần xây phần nghiệp vụ riêng.

### 3 lớp con bên trong

Bên trong Application Tier có **3 lớp con**, mỗi lớp làm một việc riêng biệt:

```
┌─────────────────────────────────────────────────────────────┐
│              APPLICATION TIER (Backend)                     │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │            REST CONTROLLER                          │   │
│   │   "Người tiếp tân"                                  │   │
│   │   • Nhận yêu cầu từ frontend                       │   │
│   │   • Trả lời kết quả về frontend                   │   │
│   │   • KHÔNG làm gì khác                               │   │
│   └─────────────────────┬───────────────────────────────┘   │
│                          │                                    │
│                          ▼                                    │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              SERVICE LAYER                           │   │
│   │   "Đầu bếp chính"                                   │   │
│   │   • Xử lý logic nghiệp vụ                          │   │
│   │   • Kiểm tra dữ liệu (validation)                  │   │
│   │   • Phân quyền người dùng                           │   │
│   └─────────────────────┬───────────────────────────────┘   │
│                          │                                    │
│                          ▼                                    │
│   ┌─────────────────────────────────────────────────────┐   │
│   │            REPOSITORY LAYER                         │   │
│   │   "Người kho hàng"                                   │   │
│   │   • Truy xuất dữ liệu từ database                   │   │
│   │   • Thêm / Sửa / Xóa bản ghi                        │   │
│   │   • KHÔNG biết gì về nghiệp vụ                      │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Tại sao phải tách thành 3 lớp nhỏ?

Hãy tưởng tượng bạn đang điều hành một nhà hàng:

| Vị trí | Trong nhà hàng | Trong lập trình |
|--------|---------------|-----------------|
| **Người tiếp tân** | Đứng đón khách, ghi order | Controller nhận request |
| **Đầu bếp** | Nấu ăn, quyết định món nào ra sao | Service xử lý logic |
| **Người kho** | Lấy nguyên liệu từ kho | Repository truy xuất DB |

**Lợi ích của việc tách biệt:**

1. **Dễ sửa chữa:** Nếu món ăn có vấn đề, bạn biết ngay là đầu bếp, không phải tiếp tân hay người kho.
2. **Dễ nâng cấp:** Có thể thay đổi cách nấu mà không cần thay người tiếp tân.
3. **Dễ kiểm thử:** Test từng vị trí độc lập.
4. **Nhiều người làm việc cùng lúc:** Người tiếp tân, đầu bếp, người kho có thể làm việc song song.

---

## Lớp 3: External Services & Storage (Lưu trữ dữ liệu)

### 2 thành phần chính

```
┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES & STORAGE                     │
│                                                             │
│   ┌───────────────────┐      ┌───────────────────┐        │
│   │   SMTP MAIL SERVER │      │   DATABASE SERVER  │        │
│   │   (Máy chủ email)  │      │   (Kho dữ liệu)    │        │
│   │                    │      │                    │        │
│   │   Gửi email:       │      │   Lưu trữ:         │        │
│   │   - Thông báo      │      │   - Users           │        │
│   │   - Reset password │      │   - Students        │        │
│   │   - Lịch phỏng vấn │      │   - Jobs            │        │
│   │   - Kết quả       │      │   - Interviews      │        │
│   │                    │      │   - Reports         │        │
│   └───────────────────┘      └───────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### SMTP Mail Server

- **SMTP** = Simple Mail Transfer Protocol (giao thức gửi email)
- Khi sinh viên nộp đơn, hệ thống tự động gửi email xác nhận
- Khi có lịch phỏng vấn mới, email được gửi tự động
- Giống như "người đưa thư" — nhận thư từ hệ thống, giao đến hộp mail của người nhận

### Database Server (PostgreSQL)

- **PostgreSQL** là hệ quản trị cơ sở dữ liệu mã nguồn mở mạnh mẽ nhất hiện nay
- Lưu trữ TẤT CẢ dữ liệu của hệ thống dưới dạng bảng có quan hệ với nhau
- Ví dụ: bảng `users` liên kết với bảng `students`, bảng `students` liên kết với bảng `applications`,...

---

## Luồng hoạt động thực tế — Từ khi đăng nhập đến khi xem danh sách sinh viên

### Ví dụ 1: Đăng nhập bằng Google

```
Bước 1: User click "Đăng nhập Google"
┌─────────────────────────────────────────────────────────────┐
│  Frontend (React) ──── Gọi Google ────► Google Server      │
│     ◄─── Trả về id_token ────                              │
└─────────────────────────────────────────────────────────────┘

Bước 2: Frontend gửi id_token cho Backend
┌─────────────────────────────────────────────────────────────┐
│  Frontend ──── POST /api/auth/google ────► Backend          │
│                    { id_token: "abc123..." }               │
└─────────────────────────────────────────────────────────────┘

Bước 3: Backend xử lý
┌─────────────────────────────────────────────────────────────┐
│  Controller ──── Gọi ────► Service ──── Gọi ────► Google  │
│                                    │                        │
│                                    │ Verify token           │
│                                    │ ✓ Token hợp lệ        │
│                                    │ ✓ Email: user@gmail.com│
│                                    │                        │
│                                    ▼                        │
│  Service ──── Gọi ────► Repository ────► Database          │
│                                    │                        │
│                                    │ Tìm user?             │
│                                    │ Tạo mới nếu chưa có   │
│                                    │                        │
│                                    ▼                        │
│  Service ◄─── Trả về user ──── Repository ◄─── Database    │
│                                    │                        │
│  Service tạo JWT Token cho user                               │
│  Controller ◄─── Trả về { token, user } ──── Service        │
└─────────────────────────────────────────────────────────────┘

Bước 4: Frontend nhận kết quả
┌─────────────────────────────────────────────────────────────┐
│  Frontend ◄─── Response ──── Backend                        │
│     { token: "eyJ...", user: { name, email, role } }       │
│                                                             │
│  Frontend lưu token vào localStorage                        │
│  Redirect user về trang Dashboard                           │
└─────────────────────────────────────────────────────────────┘
```

### Ví dụ 2: Xem danh sách sinh viên (sau khi đã đăng nhập)

```
Bước 1: User click "Sinh viên" trên menu
┌─────────────────────────────────────────────────────────────┐
│  Frontend ◄─── Click ──── User                              │
│                                                             │
│  Frontend gửi request kèm JWT Token:                        │
│  GET /api/students                                          │
│  Header: Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...     │
└─────────────────────────────────────────────────────────────┘

Bước 2: Backend nhận và xử lý
┌─────────────────────────────────────────────────────────────┐
│  ① JwtFilter (Bộ lọc)                                       │
│     - Kiểm tra token có hợp lệ không                        │
│     - Lấy thông tin user từ token                          │
│     - Nếu hợp lệ → cho đi tiếp                             │
│     - Nếu không → trả lỗi 401 Unauthorized                  │
│                                                             │
│  ② Controller nhận request                                  │
│     - Gọi: studentService.getAllStudents()                  │
│                                                             │
│  ③ Service xử lý logic                                     │
│     - (Có thể kiểm tra phân quyền: chỉ Training Manager    │
│        hoặc Enterprise mới được xem)                        │
│     - Gọi: studentRepository.findAll()                      │
│                                                             │
│  ④ Repository truy xuất database                           │
│     - Sinh câu SQL: SELECT * FROM students                  │
│     - Gửi đến Database Server                               │
│                                                             │
│  ⑤ Database trả kết quả                                     │
│     - Các bản ghi sinh viên: [ {id, name, email}, ... ]    │
│     - Gửi về Repository                                    │
│                                                             │
│  ⑥ Dữ liệu đi ngược lên: Repository → Service → Controller │
└─────────────────────────────────────────────────────────────┘

Bước 3: Frontend nhận và hiển thị
┌─────────────────────────────────────────────────────────────┐
│  Frontend ◄─── JSON Response ──── Backend                   │
│     [                                                         │
│       { id: 1, name: "Nguyễn Văn A", email: "a@gmail.com" },│
│       { id: 2, name: "Trần Thị B", email: "b@gmail.com" },   │
│       ...                                                     │
│     ]                                                         │
│                                                             │
│  React cập nhật giao diện:                                  │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  DANH SÁCH SINH VIÊN                               │     │
│  │  ─────────────────────────────────────────────────  │     │
│  │  1. Nguyễn Văn A        a@gmail.com      K63CNTT   │     │
│  │  2. Trần Thị B          b@gmail.com      K63KT    │     │
│  │  3. Lê Văn C            c@gmail.com      K63PM    │     │
│  └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## Tại sao dùng JWT Token thay vì Session?

### Cách cũ: Session (Phiên làm việc)

```
┌─────────────────────────────────────────────────────────────┐
│  CÁCH Cũ: SESSION                                            │
│                                                             │
│  User ──── Login ────► Server tạo Session ID               │
│                     ──── Lưu vào Memory ────► Server        │
│                     ◄─── Gửi Session ID về User             │
│                                                             │
│  User ──── Request kèm Session ID ────► Server              │
│                 Server kiểm tra Session có trong Memory?    │
│                 CÓ → Xử lý                                   │
│                                                             │
│  ❌ Vấn đề: Nếu có 1000 user, server phải lưu 1000 sessions│
│     → Tốn bộ nhớ RAM                                        │
│     → Khó scale (thêm server)                               │
└─────────────────────────────────────────────────────────────┘
```

### Cách mới: JWT Token ( stateless - không lưu trạng thái )

```
┌─────────────────────────────────────────────────────────────┐
│  CÁCH MỚI: JWT TOKEN                                        │
│                                                             │
│  User ──── Login ────► Server tạo JWT Token (có mã hóa)    │
│                     ◄─── Gửi JWT về User ────               │
│                                                             │
│  User ──── Request kèm JWT ────► Server                    │
│                 Server GIẢI MÃ token (không cần lưu)        │
│                 ✓ Token hợp lệ → Xử lý                      │
│                                                             │
│  ✓ Không tốn bộ nhớ để lưu sessions                         │
│  ✓ Dễ scale (nhiều server đều giải mã được token)          │
│  ✓ User có thể verify ở bất kỳ đâu (token tự chứa thông tin)│
└─────────────────────────────────────────────────────────────┘
```

---

## Tóm tắt bằng một câu chuyện

> **Hãy tưởng tượng bạn đi đến một thư viện hiện đại:**
>
> 1. **Bạn đăng ký** (đăng nhập) → Thủ thư cấp cho bạn một **thẻ thư viện** (JWT Token). Thẻ này ghi rõ bạn là ai, quyền gì. Thủ thư **không cần nhớ** bạn — thẻ tự chứa thông tin.
>
> 2. **Bạn muốn mượn sách** → Đưa thẻ cho thủ thư. Thủ thư kiểm tra thẻ → thấy bạn là sinh viên năm 3 → cho phép mượn 5 cuốn.
>
> 3. **Bạn đến kho sách** → Thủ thư vào kho tìm sách. Kho không cần biết bạn là ai, chỉ cần trả sách ra.
>
> 4. **Kết quả:** Bạn nhận được sách, thủ thư không phải nhớ ai ai, hệ thống vận hành nhẹ nhàng.

**Tương tự trong UEIMS:**
- **Thẻ thư viện** = JWT Token
- **Thủ thư kiểm tra** = Controller + Service
- **Người kho sách** = Repository
- **Kho sách** = Database

---

## Sơ đồ tổng hợp cuối cùng

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NGƯỜI DÙNG                                      │
│                           (Bạn, Giảng viên, Doanh nghiệp)                  │
│                                    │                                        │
│                                    ▼                                        │
│         ┌─────────────────────────────────────────────────────────┐          │
│         │           FRONTEND (React + Vite)                       │          │
│         │                                                         │          │
│         │   • Giao diện người dùng                                │          │
│         │   • Gửi request kèm JWT Token                          │          │
│         │   • Hiển thị kết quả (bảng, biểu đồ, form...)          │          │
│         │                                                         │          │
│         └────────────────────┬────────────────────────────────────┘          │
│                              │ HTTPS + JWT                                    │
│                              ▼                                                │
│         ┌─────────────────────────────────────────────────────────┐          │
│         │              BACKEND (Spring Boot - Java)              │          │
│         │                                                         │          │
│         │   ┌─────────────────────────────────────────────────┐   │          │
│         │   │  CONTROLLER (Người tiếp tân)                    │   │          │
│         │   │  • Nhận yêu cầu từ frontend                     │   │          │
│         │   │  • Trả kết quả về frontend                     │   │          │
│         │   └─────────────────────┬───────────────────────────┘   │          │
│         │                         │                                │          │
│         │                         ▼                                │          │
│         │   ┌─────────────────────────────────────────────────┐   │          │
│         │   │  SERVICE (Đầu bếp chính)                        │   │          │
│         │   │  • Xử lý logic nghiệp vụ                        │   │          │
│         │   │  • Kiểm tra dữ liệu, phân quyền                │   │          │
│         │   └─────────────────────┬───────────────────────────┘   │          │
│         │                         │                                │          │
│         │                         ▼                                │          │
│         │   ┌─────────────────────────────────────────────────┐   │          │
│         │   │  REPOSITORY (Người kho hàng)                    │   │          │
│         │   │  • Truy xuất database                           │   │          │
│         │   │  • CRUD: Create, Read, Update, Delete           │   │          │
│         │   └─────────────────────────────────────────────────┘   │          │
│         │                                                         │          │
│         └────────────────────┬────────────────────────────────────┘          │
│                              │                                                 │
│                              ▼                                                 │
│    ┌────────────────────────┴────────────────────────────────────┐           │
│    │                         DATABASE (PostgreSQL)               │           │
│    │  • Users  • Students  • Enterprises  • Jobs  • Reports...  │           │
│    └─────────────────────────────────────────────────────────────┘           │
│                                                                              │
│    ┌─────────────────────────────────────────────────────────────┐           │
│    │                    SMTP MAIL SERVER                         │           │
│    │  • Gửi email thông báo, xác nhận, reminder                 │           │
│    └─────────────────────────────────────────────────────────────┘           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Key takeaways (Điểm mấu chốt)

1. **Frontend** là "mặt tiền" — nơi người dùng nhìn thấy và tương tác
2. **Backend 3 lớp** đảm bảo mã nguồn sạch, dễ bảo trì:
   - Controller = Tiếp tân
   - Service = Đầu bếp
   - Repository = Kho hàng
3. **JWT Token** là "thẻ xác nhận" — không cần server lưu trạng thái
4. **Database** là "kho" lưu toàn bộ dữ liệu
5. **SMTP** là "người đưa thư" — gửi email tự động

---

**Khi thuyết trình**, bạn có thể dùng câu mở đầu:
> "Hệ thống UEIMS được xây dựng trên kiến trúc 3 lớp — giống như một nhà hàng có người tiếp tân, đầu bếp và người kho, mỗi người làm một việc riêng để hệ thống vận hành trơn tru và dễ bảo trì."
