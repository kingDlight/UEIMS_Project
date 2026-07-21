# Sơ đồ System Architecture - Hệ thống UEIMS (Phiên bản đầy đủ)

## Mục lục
1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Sơ đồ kiến trúc tổng thể (3-tier + chiều sâu)](#2-sơ-đồ-kiến-trúc-tổng-thể-3-tier--chiều-sâu)
3. [Chi tiết Client Tier (Frontend)](#3-chi-tiết-client-tier-frontend)
4. [Chi tiết Application Tier (Backend)](#4-chi-tiết-application-tier-backend)
5. [Chi tiết External Services & Storage](#5-chi-tiết-external-services--storage)
6. [Sơ đồ chiều dọc - Module nghiệp vụ chi tiết](#6-sơ-đồ-chiều-dọc---module-nghiệp-vụ-chi-tiết)
7. [Các cơ chế xuyên suốt (Cross-cutting Concerns)](#7-các-cơ-chế-xuyên-suốt-cross-cutting-concerns)
8. [Luồng hoạt động chi tiết](#8-luồng-hoạt-động-chi-tiết)
9. [Sơ đồ Use Case theo Role](#9-sơ-đồ-use-case-theo-role)
10. [Bảng công nghệ sử dụng](#10-bảng-công-nghệ-sử-dụng)

---

## 1. Tổng quan dự án

### 1.1. Giới thiệu
**UEIMS** (University Enterprise Internship Management System) là hệ thống quản lý thực tập sinh viên tại trường đại học, kết nối 3 bên: **Nhà trường** (Training Manager), **Doanh nghiệp** (Enterprise) và **Sinh viên** (Student) trong một nền tảng số thống nhất.

### 1.2. Bối cảnh & Vấn đề giải quyết
| Trước đây | Hiện tại (UEIMS) |
|-----------|------------------|
| Sinh viên gửi email cho công ty | Sinh viên ứng tuyển qua Job Board |
| Công ty gửi email cho trường | Doanh nghiệp duyệt đơn trên hệ thống |
| Trường gửi thư cho sinh viên | Training Manager quản lý mọi thứ tập trung |
| Mọi thứ rời rạc, dễ thất lạc | Toàn bộ quy trình số hóa, minh bạch |
| Khó theo dõi tiến độ | Dashboard theo dõi real-time |

### 1.3. Các tính năng chính (theo role)

**Sinh viên (Student):**
- Đăng ký & quản lý hồ sơ cá nhân, upload CV
- Xem Job Board, ứng tuyển việc thực tập
- Theo dõi trạng thái đơn (Application) & lịch phỏng vấn
- Nộp báo cáo tuần (Weekly Report) & báo cáo cuối kỳ (Final Report)
- Đánh giá doanh nghiệp (Feedback)
- Nhận thông báo real-time (WebSocket)

**Doanh nghiệp (Enterprise):**
- Đăng ký tài khoản, đợi Training Manager duyệt
- Đăng tin tuyển dụng (Job Post)
- Quản lý đơn ứng tuyển (Applicant Kanban)
- Sắp xếp lịch phỏng vấn (Interview Schedule)
- Đánh giá sinh viên (Enterprise Evaluation)
- Duyệt báo cáo tuần của sinh viên
- Quản lý kế hoạch thực tập (Internship Plan)

**Training Manager (Nhà trường):**
- Quản lý sinh viên (CRUD, import Excel)
- Quản lý doanh nghiệp (duyệt đăng ký)
- Quản lý học kỳ (Semester: DRAFT → OPEN → ACTIVE → CLOSED → LOCKED)
- Dashboard thống kê tổng quan (Command Center)
- Duyệt đơn đăng ký thực tập (Placement Application)
- Quản lý cảnh báo sinh viên có nguy cơ (At-Risk Student)
- Xử lý sự cố (Incidents)
- Gửi thông báo hệ thống (System Announcement)
- Xuất báo cáo Excel

**Admin:**
- Quản lý User & Role & Permission
- Xem audit log, request log
- Theo dõi real-time request log (WebSocket)

---

## 2. Sơ đồ kiến trúc tổng thể (3-tier + chiều sâu)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        NGƯỜI DÙNG (3 Roles)                                                     │
│         Sinh viên              Doanh nghiệp              Training Manager              Admin                    │
└──────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────┘
                                   │ HTTPS / WSS
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  TẦNG 1: CLIENT TIER (FRONTEND) - React 18 + TypeScript + Vite                                                │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐│
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────────────────┐    ││
│  │  │  Pages (35+)    │  │  Layouts        │  │  Guards          │  │  Hooks                      │    ││
│  │  │  - Login        │  │  - ModernLayout │  │  - ProtectedRoute│  │  - useAuth                  │    ││
│  │  │  - Dashboard    │  │  - AppLayout    │  │  - RoleGuard     │  │  - useStomp                 │    ││
│  │  │  - Student      │  │                 │  │                  │  │                             │    ││
│  │  │  - Enterprise   │  │                 │  │                  │  │                             │    ││
│  │  │  - TrainingMgr  │  │                 │  │                  │  │                             │    ││
│  │  │  - Admin        │  │                 │  │                  │  │                             │    ││
│  │  └─────────────────┘  └─────────────────┘  └──────────────────┘  └─────────────────────────────┘    ││
│  │                                                                                                       ││
│  │  ┌─────────────────────────────┐  ┌──────────────────┐  ┌─────────────────────────────────────┐    ││
│  │  │  Tabs (theo Role, 40+ tabs) │  │  Modal/Dialog    │  │  Stores (Zustand)                   │    ││
│  │  │  - DashboardTab              │  │  (Ant Design)    │  │  - useAuthStore                    │    ││
│  │  │  - JobBoardTab               │  │  - Form Modal    │  │  - useNotificationStore            │    ││
│  │  │  - ReportsTab                │  │  - Confirm Modal │  │  - useAnnouncementStore            │    ││
│  │  │  - ... (Tab-based UI)        │  │  - Preview Modal │  │                                     │    ││
│  │  └─────────────────────────────┘  └──────────────────┘  └─────────────────────────────────────┘    ││
│  │                                                                                                       ││
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐  ││
│  │  │  Services Layer (40+ API Services - tương ứng backend)                                       │  ││
│  │  │  - AuthService, ApplicationService, JobPostService, InterviewService, ...                     │  ││
│  │  └─────────────────────────────────────────────────────────────────────────────────────────────────┘  ││
│  │                                                                                                       ││
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐  ││
│  │  │  Axios Instance + Interceptors (api.ts)                                                        │  ││
│  │  │  - Request Interceptor: Tự động gắn Bearer JWT vào Header Authorization                       │  ││
│  │  │  - Response Interceptor: Auto refresh token khi 401, logout khi refresh fail                  │  ││
│  │  │  - Error handling: Map ErrorCode → Toast/Modal                                                │  ││
│  │  └─────────────────────────────────────────────────────────────────────────────────────────────────┘  ││
│  │                                                                                                       ││
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐  ││
│  │  │  React Query (TanStack Query v5) - Cache + State management cho server state                   │  ││
│  │  └─────────────────────────────────────────────────────────────────────────────────────────────────┘  ││
│  │                                                                                                       ││
│  │  ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐  ││
│  │  │  WebSocket Client (SockJS + STOMP.js) → subscribe /topic/request-logs, /user/queue/notif      │  ││
│  │  └─────────────────────────────────────────────────────────────────────────────────────────────────┘  ││
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────┬──────────────────────────────────────────────────────────┘
                                                │ Bearer JWT + HTTPS
                                                ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  TẦNG 2: APPLICATION TIER (BACKEND) - Spring Boot 3.2.5 + Java 21                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐│
│  │                            SECURITY FILTER CHAIN (SecurityConfig)                                       ││
│  │  ┌────────────┐ ┌─────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────────┐ ┌─────────────┐ ││
│  │  │ Security   │ │ RateLimit   │ │ CORS Filter  │ │ BearerToken  │ │ RequirePwd    │ │ RequestLog  │ ││
│  │  │ Headers    │ │ Filter      │ │              │ │ Auth Filter  │ │ ChangeFilter  │ │ Filter      │ ││
│  │  │ Filter     │ │ (4029)      │ │              │ │ (JWT Decode) │ │               │ │             │ ││
│  │  └────────────┘ └─────────────┘ └──────────────┘ └──────────────┘ └───────────────┘ └─────────────┘ ││
│  │       │                │                │                │                    │              │        ││
│  │       ▼                ▼                ▼                ▼                    ▼              ▼        ││
│  │  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐ ││
│  │  │                       REST CONTROLLER LAYER (40+ Controllers)                                    │ ││
│  │  │  AuthenticationController  ApplicationController  JobPostController  InterviewController          │ ││
│  │  │  UserController            EnterpriseController  ReportController   FinalReportController       │ ││
│  │  │  StudentController         WeeklyReportController  AtRiskStudentController  ...                 │ ││
│  │  │                                                                                                    │ ││
│  │  │  → Nhận HTTP request, parse JSON, validate input cơ bản, gọi Service                             │ ││
│  │  │  → KHÔNG chứa business logic                                                                      │ ││
│  │  └────────────────────────────────────┬─────────────────────────────────────────────────────────────┘ ││
│  │                                       ▼                                                                ││
│  │  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐ ││
│  │  │                       SERVICE LAYER (45+ Services) - Business Logic                              │ ││
│  │  │  AuthenticationService  ApplicationService  EnterpriseService  WeeklyReportService              │ ││
│  │  │  InterviewService       PlacementApplicationService  IncidentService  AuditLogService          │ ││
│  │  │  MailService (SMTP)     JobRecommenderService (AI matching)  PlagiarismDetectionService        │ ││
│  │  │                                                                                                    │ ││
│  │  │  → Xử lý logic nghiệp vụ, validation phức tạp, phân quyền, transaction                         │ ││
│  │  │  → Điều phối nhiều Repository                                                                     │ ││
│  │  │  → Gọi Mapper để chuyển Entity ↔ DTO                                                             │ ││
│  │  └────────────────────────────────────┬─────────────────────────────────────────────────────────────┘ ││
│  │                                       ▼                                                                ││
│  │  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐ ││
│  │  │                       MAPPER LAYER (MapStruct) - Entity ↔ DTO Conversion                         │ ││
│  │  │  ApplicationMapper  UserMapper  JobPostMapper  EnterpriseMapper  WeeklyReportMapper               │ ││
│  │  │  InterviewMapper    IncidentMapper  ... (20+ mappers)                                            │ ││
│  │  │                                                                                                    │ ││
│  │  │  → Sinh code tự động tại compile-time, dùng @Mapping(source, target)                            │ ││
│  │  │  → Tránh lộ Entity ra ngoài API, giảm boilerplate                                                │ ││
│  │  └────────────────────────────────────┬─────────────────────────────────────────────────────────────┘ ││
│  │                                       ▼                                                                ││
│  │  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐ ││
│  │  │                       REPOSITORY LAYER (Spring Data JPA)                                          │ ││
│  │  │  UserRepository  StudentRepository  JobPostRepository  ApplicationRepository  ... (35+ repos)   │ ││
│  │  │                                                                                                    │ ││
│  │  │  → Interface extends JpaRepository<T, ID>                                                       │ ││
│  │  │  → Spring tự sinh implementation (findAll, findById, save, delete, ...)                          │ ││
│  │  │  → Custom queries: @Query("SELECT ..."), @Param                                                 │ ││
│  │  └────────────────────────────────────┬─────────────────────────────────────────────────────────────┘ ││
│  │                                       ▼                                                                ││
│  │  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐ ││
│  │  │                       ENTITY LAYER (JPA Entities - ánh xạ bảng DB)                              │ ││
│  │  │  User  StudentProfile  Enterprise  JobPost  Application  Interview  WeeklyReport  ...            │ ││
│  │  └──────────────────────────────────────────────────────────────────────────────────────────────────┘ ││
│  │                                                                                                       ││
│  │  ══════════════════════════════ CÁC THÀNH PHẦN XUYÊN SUỐT ══════════════════════════════════════════   ││
│  │                                                                                                       ││
│  │  ┌─────────────────────────────────┐  ┌──────────────────────────────────────────────────────────┐    ││
│  │  │  AOP ASPECT (JBA)               │  │  EXCEPTION HANDLING                                    │    ││
│  │  │  AuditLogAspect                 │  │  GlobalExceptionHandler (@ControllerAdvice)              │    ││
│  │  │  - @AfterReturning on           │  │  - Bắt AppException → trả ErrorCode tương ứng          │    ││
│  │  │    POST/PUT/DELETE controllers  │  │  - Bắt MethodArgumentNotValidException → 400           │    ││
│  │  │  - Tự động ghi AuditLog vào DB  │  │  - Bắt JpaSystemException → 1040                       │    ││
│  │  │  - Capture: user, action, IP,   │  │  - Bắt AccessDeniedException → 1007                    │    ││
│  │  │    UserAgent, timestamp         │  │  - ErrorCode enum (110+ mã lỗi có sẵn message)          │    ││
│  │  └─────────────────────────────────┘  └──────────────────────────────────────────────────────────┘    ││
│  │                                                                                                       ││
│  │  ┌─────────────────────────────────┐  ┌──────────────────────────────────────────────────────────┐    ││
│  │  │  DTO LAYER                      │  │  WEBSOCKET (STOMP)                                      │    ││
│  │  │  Request: AuthenticationRequest │  │  WebSocketConfig                                        │    ││
│  │  │           ApplicationRequest    │  │  - /ws endpoint (SockJS + STOMP)                        │    ││
│  │  │           JobPostRequest...     │  │  - JwtHandshakeInterceptor (xác thực qua ?token=)      │    ││
│  │  │  Response: ApiResponse<T>       │  │  - ChannelInterceptor (validate JWT trên CONNECT)       │    ││
│  │  │            ApplicationResponse  │  │  - Admin subscribe /topic/request-logs                  │    ││
│  │  │            JobPostResponse...   │  │  - User subscribe /user/queue/notifications              │    ││
│  │  └─────────────────────────────────┘  └──────────────────────────────────────────────────────────┘    ││
│  │                                                                                                       ││
│  │  ┌─────────────────────────────────┐  ┌──────────────────────────────────────────────────────────┐    ││
│  │  │  CONFIG & UTIL                  │  │  SCHEDULED TASKS (Cron Jobs)                            │    ││
│  │  │  AsyncConfig (email async)      │  │  ScanMissingReportsServiceImpl                          │    ││
│  │  │  SchedulingConfig               │  │  InvalidatedTokenCleanupService                         │    ││
│  │  │  DataSeeder (initial data)      │  │  RequestLogCleanupService                               │    ││
│  │  │  WebMvcConfig (CORS, static)   │  │  (chạy nền theo @Scheduled)                             │    ││
│  │  └─────────────────────────────────┘  └──────────────────────────────────────────────────────────┘    ││
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────┬──────────────────────────────────────────────────────────┘
                                                │ JDBC (PostgreSQL Driver) | SMTP Protocol
                                                ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  TẦNG 3: EXTERNAL SERVICES & STORAGE                                                                        │
│  ┌──────────────────────────────────┐  ┌──────────────────────────────────┐  ┌──────────────────────────────┐    │
│  │   PostgreSQL Database            │  │   SMTP Mail Server              │  │   File Storage               │    │
│  │   (ueims database)               │  │   (Gmail / SendGrid / ...)      │  │   (Local FS / S3)            │    │
│  │                                  │  │                                  │  │                              │    │
│  │   40+ tables:                    │  │   Gửi email:                     │  │   Lưu trữ:                   │    │
│  │   - users, user_roles            │  │   - Xác nhận ứng tuyển          │  │   - Avatar                   │    │
│  │   - students, eligible_students  │  │   - Lịch phỏng vấn              │  │   - CV (PDF)                  │    │
│  │   - enterprises                  │  │   - Reset password              │  │   - Final report (PDF)        │    │
│  │   - job_posts, applications      │  │   - Cảnh báo nộp báo cáo       │  │   - Excel imports/exports     │    │
│  │   - interviews, weekly_reports   │  │   - Thông báo hệ thống          │  │                              │    │
│  │   - incidents, evaluations       │  │                                  │  │                              │    │
│  │   - audit_logs, request_logs     │  │                                  │  │                              │    │
│  │   - notifications                │  │                                  │  │                              │    │
│  └──────────────────────────────────┘  └──────────────────────────────────┘  └──────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Chi tiết Client Tier (Frontend)

### 3.1. Tech Stack
| Công nghệ | Vai trò |
|-----------|---------|
| **React 18** | UI library (component-based) |
| **TypeScript** | Type safety |
| **Vite** | Build tool (HMR, fast bundling) |
| **Ant Design 5** | UI Component Library (Modal, Form, Table, ...) |
| **React Router v6** | Routing & lazy loading |
| **TanStack Query v5** | Server state management & cache |
| **Zustand** | Client state management (auth, notification) |
| **Axios** | HTTP client + interceptors |
| **SockJS + STOMP.js** | WebSocket client cho real-time |
| **Recharts** | Biểu đồ (dashboard analytics) |
| **@dnd-kit** | Drag & drop (Applicant Kanban) |
| **i18next** | Đa ngôn ngữ (i18n) |
| **Tailwind CSS** | Utility CSS framework |
| **react-easy-crop** | Crop ảnh đại diện |
| **dayjs** | Xử lý ngày tháng |
| **framer-motion** | Animation |

### 3.2. Cấu trúc thư mục Frontend

```
ueims_frontend/src/
├── App.tsx                      ← Root component (Providers: GoogleOAuth, QueryClient, ConfigProvider)
├── main.tsx                     ← Mount React vào DOM
├── components/
│   ├── guards/                  ← ProtectedRoute, RoleGuard
│   ├── layout/                  ← AppLayout, ModernLayout (Sidebar + Header + Content)
│   ├── FallbackLoader.tsx
│   └── LogoIcon.tsx
├── pages/
│   ├── auth/                    ← LoginPage, ForgotPasswordPage, ResetPasswordPage, RegisterEnterprisePage
│   ├── home/                    ← HomePage (landing page)
│   ├── student/
│   │   ├── StudentDashboard.tsx
│   │   ├── JobDetailPage.tsx
│   │   ├── components/          ← Chia sẻ component giữa các tab
│   │   └── tabs/                ← 13 tabs (Dashboard, JobBoard, Applications, Reports, ...)
│   ├── enterprise/
│   │   ├── EnterpriseDashboard.tsx
│   │   └── tabs/                ← 14 tabs (ApplicantKanban, InterviewSchedule, Evaluation, ...)
│   ├── training-manager/
│   │   ├── TrainingManagerDashboard.tsx
│   │   └── tabs/                ← 13 tabs (CommandCenter, Students, Enterprises, Semester, ...)
│   ├── admin/
│   │   └── AdminDashboard.tsx
│   ├── errors/                  ← NotFoundPage, 500Page
│   └── dev/                     ← EmailPreviewPage
├── routes/router.tsx            ← React Router config
├── services/                    ← 40+ API service files (gọi axios đến backend)
├── stores/                      ← Zustand stores
│   ├── useAuthStore.ts          ← JWT token, refresh token, user info
│   ├── useNotificationStore.ts
│   └── useAnnouncementStore.ts
├── hooks/                       ← Custom hooks
├── utils/                       ← Helper functions
├── i18n/                        ← Cấu hình đa ngôn ngữ
├── theme/                       ← themeConfig.ts (Ant Design theme)
└── assets/                      ← Static assets
```

### 3.3. Luồng xử lý trong Frontend

```
User click button
     │
     ▼
Component (Tab/Modal/Page)
     │
     ├──→ useAuthStore.getState().token  (lấy JWT)
     │
     ├──→ Service.method()  (vd: ApplicationService.apply())
     │         │
     │         ▼
     │    axios instance (api.ts)
     │         │
     │         ├── [Request Interceptor] Gắn "Authorization: Bearer <jwt>"
     │         │
     │         ▼
     │    HTTP Request → Backend
     │         │
     │         ▼
     │    Response
     │         │
     │         ├── [Response Interceptor]
     │         │    ├── Nếu 401 → gọi /auth/refresh → retry
     │         │    └── Nếu refresh fail → logout + redirect /login
     │         │
     │         ▼
     │    Component nhận data
     │         │
     │         ├── Update UI qua React Query cache
     │         ├── Hiển thị Modal (Ant Design)
     │         ├── Hiển thị Toast notification
     │         └── Update Zustand store (nếu cần)
     │
     ▼
User thấy kết quả
```

---

## 4. Chi tiết Application Tier (Backend)

### 4.1. Tech Stack Backend
| Công nghệ | Vai trò |
|-----------|---------|
| **Spring Boot 3.2.5** | Application framework |
| **Java 21** | Ngôn ngữ lập trình |
| **Spring Data JPA + Hibernate** | ORM, truy xuất database |
| **Spring Security** | Authentication & Authorization |
| **Spring OAuth2 Resource Server** | JWT validation |
| **Spring AOP** | Cross-cutting concerns (audit log) |
| **MapStruct 1.5.5** | Auto-generated Entity ↔ DTO mappers |
| **Lombok** | Giảm boilerplate (@Getter, @Builder, @Slf4j) |
| **Springdoc OpenAPI** | Auto-generate Swagger UI |
| **Apache POI** | Đọc/ghi file Excel |
| **OpenPDF** | Sinh file PDF |
| **Jsoup** | HTML sanitization (chống XSS) |
| **Spring Boot Starter Mail** | Gửi email qua SMTP |
| **Spring Boot Starter WebSocket** | STOMP cho real-time |
| **Thymeleaf** | Email templates |
| **Jacoco** | Code coverage |
| **Spotless** | Code formatter |

### 4.2. Cấu trúc thư mục Backend (đầy đủ các tầng)

```
ueims_backend/src/main/java/com/ueims/
├── UeimsBackendApplication.java        ← @SpringBootApplication entry point
│
├── controller/                         ← TẦNG REST CONTROLLER (40+ files)
│   ├── AuthenticationController.java   ← /api/auth/**
│   ├── UserController.java             ← /api/users/**
│   ├── ApplicationController.java      ← /api/applications/**
│   ├── JobPostController.java          ← /api/job-posts/**
│   ├── InterviewController.java        ← /api/interviews/**
│   ├── EnterpriseController.java       ← /api/enterprises/**
│   ├── WeeklyReportController.java
│   ├── FinalReportController.java
│   ├── IncidentController.java
│   ├── StudentProfileController.java
│   ├── DashboardController.java
│   ├── ... (40+ controllers)
│
├── service/                            ← TẦNG SERVICE INTERFACE
│   ├── AuthenticationService.java
│   ├── ApplicationService.java
│   ├── ... (45+ interface files)
│   ├── impl/                           ← TẦNG SERVICE IMPLEMENTATION
│   │   ├── AuthenticationServiceImpl.java   ← Business logic chính (27k+ LOC)
│   │   ├── ApplicationServiceImpl.java      ← Matching & validation
│   │   ├── WeeklyReportServiceImpl.java
│   │   ├── InterviewServiceImpl.java
│   │   ├── MailServiceImpl.java             ← Gửi email async
│   │   ├── ScanMissingReportsServiceImpl.java ← Cron job
│   │   ├── ExcelExportServiceImpl.java      ← Xuất Excel (POI)
│   │   └── ... (40+ impl files)
│   └── websocket/
│       └── (NotificationService cho WS)
│
├── mapper/                             ← TẦNG MAPPER (MapStruct) - 20+ files
│   ├── ApplicationMapper.java         ← @Mapping(source="jobPost.jobPostId", target="jobPostId")
│   ├── UserMapper.java
│   ├── EnterpriseMapper.java
│   ├── InterviewMapper.java
│   ├── WeeklyReportMapper.java
│   ├── ...
│
├── repository/                         ← TẦNG REPOSITORY (Spring Data JPA) - 35+ files
│   ├── UserRepository.java            ← extends JpaRepository<User, UUID>
│   ├── ApplicationRepository.java
│   ├── JobPostRepository.java
│   ├── ... (35+ interface files với custom @Query)
│
├── model/
│   ├── entity/                         ← JPA Entities (40+ entities)
│   │   ├── User.java
│   │   ├── StudentProfile.java
│   │   ├── Enterprise.java
│   │   ├── JobPost.java
│   │   ├── Application.java
│   │   ├── Interview.java
│   │   ├── WeeklyReport.java
│   │   ├── AuditLog.java
│   │   ├── RequestLog.java
│   │   ├── Semester.java
│   │   ├── ...
│   │   └── BaseEntity.java            ← @MappedSuperclass với createdAt, updatedAt
│   └── dto/                            ← DTOs (Request + Response)
│       ├── request/                    ← 40+ request DTOs
│       │   ├── AuthenticationRequest.java
│       │   ├── ApplicationRequest.java
│       │   ├── JobPostRequest.java
│       │   ├── InterviewRequest.java
│       │   └── ...
│       └── response/                   ← 30+ response DTOs + ApiResponse<T>
│           ├── ApiResponse.java        ← { code, message, result }
│           ├── ApplicationResponse.java
│           ├── JobPostResponse.java
│           └── ...
│
├── exception/                          ← XỬ LÝ NGOẠI LỆ
│   ├── AppException.java               ← Custom exception với ErrorCode
│   ├── ErrorCode.java                  ← Enum 110+ mã lỗi (1001-2200)
│   ├── GlobalExceptionHandler.java     ← @ControllerAdvice, map exception → ResponseEntity
│   └── ResourceNotFoundException.java
│
├── aspect/                             ← AOP ASPECTS (JBA)
│   └── AuditLogAspect.java             ← @AfterReturning tự động log mutating actions
│
├── filter/                             ← CUSTOM FILTERS
│   └── RequestLoggingFilter.java       ← Ghi log mọi request
│
├── config/                             ← CONFIGURATION
│   ├── SecurityConfig.java             ← SecurityFilterChain, CORS, public endpoints
│   ├── CorsConfig.java
│   ├── AsyncConfig.java                ← Thread pool cho email async
│   ├── AsyncSchedulingConfig.java
│   ├── SchedulingConfig.java           ← @EnableScheduling
│   ├── WebMvcConfig.java               ← Static resources, interceptors
│   ├── DataSeeder.java                 ← Seed initial data khi start
│   ├── security/                       ← SECURITY FILTERS
│   │   ├── CustomJwtDecoder.java        ← Giải mã JWT
│   │   ├── JwtAuthenticationEntryPoint.java ← Xử lý 401
│   │   ├── SecurityHeadersFilter.java   ← Set security headers
│   │   ├── RateLimitFilter.java         ← Giới hạn request (4029)
│   │   └── RequirePasswordChangeFilter.java
│   └── websocket/
│       └── WebSocketConfig.java         ← STOMP endpoints + JWT handshake
│
└── util/                               ← UTILITY CLASSES
    └── (helper methods: date format, validation, ...)
```

### 4.3. Luồng xử lý Request trong Backend (chi tiết từng tầng)

```
HTTP Request từ Frontend (kèm JWT)
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│ SecurityHeadersFilter                                   │ ← Set X-Frame-Options, CSP, ...
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ RateLimitFilter                                         │ ← Check số lượng request/IP
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ BearerTokenAuthenticationFilter                        │ ← Giải mã JWT, set SecurityContext
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ RequirePasswordChangeFilter                             │ ← Bắt buộc đổi MK nếu user yêu cầu
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ RequestLoggingFilter                                    │ ← Ghi log request vào DB
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ DispatcherServlet → Routing đến đúng Controller        │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ CONTROLLER (@RestController)                           │
│ - Nhận @RequestBody / @PathVariable                    │
│ - Validate cơ bản (@Valid)                              │
│ - Gọi Service.xxx()                                    │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ SERVICE (Business Logic)                               │
│ - Check quyền (@PreAuthorize)                           │
│ - Validate logic phức tạp                              │
│ - Gọi nhiều Repository                                  │
│ - Gọi Mapper.toResponse(entity) để chuyển DTO          │
│ - Quản lý @Transactional                               │
│ - Bắn AppException(ErrorCode.X) nếu có lỗi nghiệp vụ │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ MAPPER (MapStruct)                                     │
│ - Application application = Repository.findById(id)    │
│ - ApplicationResponse dto = mapper.toResponse(app)     │
│ - Tự động map các field theo @Mapping annotation      │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ REPOSITORY (Spring Data JPA)                           │
│ - Tự sinh SQL: SELECT * FROM applications WHERE id=?   │
│ - Trả về Entity (Application)                          │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ Hibernate → JDBC → PostgreSQL                          │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ (Song song) AUDIT LOG ASPECT (AOP)                     │
│ - @AfterReturning trên POST/PUT/DELETE                 │
│ - Tự động save AuditLog vào DB                         │
│ - Capture: user, action, IP, UserAgent, timestamp      │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ (Nếu có lỗi) GlobalExceptionHandler                    │
│ - Catch AppException → trả { code, message } từ ErrorCode
│ - Catch ValidationException → 400 + field errors       │
│ - Catch AccessDeniedException → 403                    │
└────────────────────────┬────────────────────────────────┘
                         ▼
Response JSON về Frontend
{ "code": 1000, "message": "Success", "result": {...} }
```

---

## 5. Chi tiết External Services & Storage

### 5.1. PostgreSQL Database (Database chính)

**40+ bảng** được tổ chức theo domain:

| Nhóm | Bảng chính |
|------|-----------|
| **User & Auth** | users, user_roles, user_sessions, roles, permissions, role_permissions |
| **Student** | students, eligible_students, student_profiles, cv_files |
| **Enterprise** | enterprises, enterprise_assignments, enterprise_evaluations |
| **Job & Application** | job_posts, applications, placement_applications |
| **Interview** | interviews, interview_results |
| **Report** | weekly_reports, final_reports, report_feedbacks |
| **Semester** | semesters, semester_enterprises, semester_statistics |
| **Plan** | internship_plans, internship_plan_items |
| **Notification** | notifications, system_announcements |
| **Log & Audit** | audit_logs, request_logs, invalidated_tokens |
| **Other** | incidents, training_warnings, at_risk_students, student_enterprise_feedbacks |

**Quan hệ chính:**
- `users` 1-N `student_profiles`
- `users` 1-N `applications` (qua student_id)
- `enterprises` 1-N `job_posts`
- `job_posts` 1-N `applications`
- `applications` 1-1 `interviews`
- `semesters` 1-N `eligible_students`
- `students` 1-N `weekly_reports`, `final_reports`
- `users` 1-N `audit_logs`, `request_logs`

### 5.2. SMTP Mail Server

**MailServiceImpl** gửi email async (qua `@Async`):
- Email xác nhận đơn ứng tuyển
- Email lịch phỏng vấn
- Email reset password
- Email cảnh báo nộp báo cáo (cron job)
- Email thông báo hệ thống (System Announcement)
- Email đánh giá doanh nghiệp

**Template engine:** Thymeleaf (`@Controller` không cần, chỉ dùng Context để render)

### 5.3. File Storage

Lưu trữ trong thư mục `uploads/` (hoặc S3 trong production):
- Avatar người dùng
- CV sinh viên (PDF, max 5MB)
- Final Report (PDF, max 20MB)
- File Excel import/export

---

## 6. Sơ đồ chiều dọc - Module nghiệp vụ chi tiết

### 6.1. Module Application (Quản lý đơn ứng tuyển)

```
┌──────────────────────────────────────────────────────────────────────┐
│                    MODULE: APPLICATION MANAGEMENT                    │
└──────────────────────────────────────────────────────────────────────┘

  Controller                Service                Mapper            Repository           Entity
  ──────────                ───────                ──────            ──────────           ──────
  ApplicationController  →  ApplicationService →  ApplicationMapper → ApplicationRepository → Application
       │                         │                      │                    │                   │
       │ POST /apply             │                      │                    │                   │
       │────────────────────────→│                      │                    │                   │
       │                         │ 1. Validate:         │                    │                   │
       │                         │    - Student kỳ 5?   │                    │                   │
       │                         │    - Đã apply chưa?  │                    │                   │
       │                         │    - JobPost OPEN?   │                    │                   │
       │                         │    - Đã đủ 3 đơn?    │                    │                   │
       │                         │                      │                    │                   │
       │                         │ 2. findByStudentId   │                    │                   │
       │                         │─────────────────────────────────────────→│                   │
       │                         │                      │                    │ SELECT * FROM ... │
       │                         │                      │                    │──────────────────→│
       │                         │                      │                    │←──────────────────│
       │                         │                      │                    │ List<Application> │
       │                         │←─────────────────────────────────────────│                   │
       │                         │                      │                    │                   │
       │                         │ 3. Create & Save     │                    │                   │
       │                         │─────────────────────────────────────────→│                   │
       │                         │                      │                    │ INSERT INTO ...   │
       │                         │                      │                    │──────────────────→│
       │                         │                      │                    │←──────────────────│
       │                         │←─────────────────────────────────────────│                   │
       │                         │                      │                    │                   │
       │                         │ 4. Gọi MailService   │                    │                   │
       │                         │   (gửi email async)  │                    │                   │
       │                         │                      │                    │                   │
       │                         │ 5. mapper.toResponse │                    │                   │
       │                         │─────────────────────→│                    │                   │
       │                         │←─────────────────────│                    │                   │
       │                         │ ApplicationResponse  │                    │                   │
       │←────────────────────────│                      │                    │                   │
       │ 201 Created             │                      │                    │                   │
       │ {code:1000, result}    │                      │                    │                   │
       │                         │                      │                    │                   │
       │                         │ ★ AUDIT LOG ASPECT (AOP) tự động chạy   │                   │
       │                         │   @AfterReturning → save AuditLog       │                   │
       │                         │   action = "POST_CREATE_APPLICATION"    │                   │
```

### 6.2. Module Interview (Phỏng vấn)

```
Controller          Service              Repository          Entity
──────────          ───────              ──────────          ──────
InterviewController → InterviewService → InterviewRepository → Interview
                           │
                           ├── 1. Validate status (PENDING/SCREENED)
                           ├── 2. Check overlap thời gian
                           ├── 3. Save interview
                           ├── 4. Gửi email cho student + enterprise
                           └── 5. WebSocket push notification (nếu có)
```

### 6.3. Module WeeklyReport (Báo cáo tuần)

```
WeeklyReportController → WeeklyReportService → WeeklyReportRepository → WeeklyReport
                              │
                              ├── 1. Check student kỳ 6+
                              ├── 2. Check tuần hiện tại (current week only)
                              ├── 3. Anti-plagiarism (PlagiarismDetectionService)
                              ├── 4. Save report
                              ├── 5. Audit Log
                              └── 6. Notify enterprise
```

---

## 7. Các cơ chế xuyên suốt (Cross-cutting Concerns)

### 7.1. AOP Aspect - AuditLogAspect (JBA)

**Mục đích:** Tự động ghi log mọi hành động thay đổi dữ liệu (POST/PUT/DELETE).

```java
@Aspect
@Component
public class AuditLogAspect {
    @Pointcut("@annotation(PostMapping) || @annotation(PutMapping) || @annotation(DeleteMapping)")
    public void mutatingEndpoints() {}

    @Pointcut("!within(AuthenticationController) && !within(AuditLogController)")
    public void excludedControllers() {}

    @AfterReturning(pointcut = "mutatingEndpoints() && excludedControllers()")
    public void logAfterReturning(JoinPoint joinPoint, Object result) {
        // Tự động lấy:
        // - User từ SecurityContext
        // - Action (POST_CREATE_USER, DELETE_APPLICATION, ...)
        // - Target entity (User, Application, ...)
        // - IP address, User-Agent
        // - Timestamp
        // → Lưu vào audit_logs table
    }
}
```

**Luồng:** Controller method trả về → Aspect tự động chạy → DB có record audit.

### 7.2. Global Exception Handling

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)          → Trả ErrorCode tương ứng
    @ExceptionHandler(MethodArgumentNotValidException.class)  → 400 + field errors
    @ExceptionHandler(JpaSystemException.class)    → 1040 Data integrity violation
    @ExceptionHandler(DataIntegrityViolationException.class) → 1040 hoặc 2004
    @ExceptionHandler(AccessDeniedException.class) → 1007 Unauthorized
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class) → 1041
    @ExceptionHandler(Exception.class)            → 9999 Unhandled exception
    @ExceptionHandler(MultipartException.class)    → Invalid Excel format
    @ExceptionHandler(MaxUploadSizeExceededException.class) → File too large
    @ExceptionHandler(MissingServletRequestParameterException.class) → 1034
}
```

**ErrorCode enum** có 110+ mã lỗi:
- `1001-1999`: Business logic errors (validation, not found, conflict)
- `2001-2999`: Auth/Account errors (locked, banned, wrong password)
- `9999`: Unhandled exception

### 7.3. Security Filter Chain

```
Request → SecurityHeadersFilter → RateLimitFilter → BearerTokenAuthenticationFilter
       → RequirePasswordChangeFilter → RequestLoggingFilter → Controller

SecurityConfig quản lý:
- Public endpoints: /api/auth/**, /api/public/**, /swagger-ui/**, /ws/**
- Protected: mọi request khác cần JWT
- @EnableMethodSecurity → @PreAuthorize("hasRole('ADMIN')") ở controller
```

### 7.4. WebSocket (Real-time)

**WebSocketConfig** cấu hình STOMP:
- Endpoint: `/ws` (SockJS fallback)
- Auth: JWT qua `?token=` query param (browser không set header được)
- Topics:
  - `/topic/request-logs` → Admin nhận real-time log
  - `/topic/admin` → Admin broadcast
  - `/user/queue/notifications` → User-specific notifications
- `/app/**` → Client gửi message lên server

### 7.5. Scheduled Tasks (Cron Jobs)

```
@Scheduled (cron = "0 0 * * * *")  → ScanMissingReportsServiceImpl
                                      → Quét sinh viên chưa nộp báo cáo tuần
                                      → Gửi email cảnh báo

@Scheduled (cron = "0 0 0 * * *")  → InvalidatedTokenCleanupService
                                      → Xóa token hết hạn

@Scheduled (cron = "0 0 1 * * *")  → RequestLogCleanupService
                                      → Xóa request log cũ (>30 ngày)
```

---

## 8. Luồng hoạt động chi tiết

### 8.1. Flow: Sinh viên đăng nhập + Apply Job

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Step 1: Login (Email/Password)                                          │
└─────────────────────────────────────────────────────────────────────────┘
Student (Browser) → POST /api/auth/token {email, password}
                   │
                   ▼
AuthenticationController → AuthenticationService.authenticate()
                          │
                          ├── 1. Validate email/password format
                          ├── 2. UserRepository.findByEmail()
                          ├── 3. BCryptPasswordEncoder.matches()
                          ├── 4. Check account status (locked/inactive?)
                          ├── 5. Tạo JWT (access + refresh) qua JJwt
                          ├── 6. Lưu UserSession vào DB
                          └── 7. Return {accessToken, refreshToken, user}

Response → Frontend → Lưu vào useAuthStore (Zustand) → localStorage

┌─────────────────────────────────────────────────────────────────────────┐
│ Step 2: Student apply job                                               │
└─────────────────────────────────────────────────────────────────────────┘
Student (Browser) → POST /api/applications {jobPostId, cvFile}
                   Header: Authorization: Bearer <accessToken>
                   │
                   ▼
SecurityConfig:
  ├─ SecurityHeadersFilter ✓
  ├─ RateLimitFilter ✓ (chưa vượt limit)
  ├─ BearerTokenAuthenticationFilter ✓ (JWT hợp lệ)
  ├─ RequirePasswordChangeFilter ✓
  └─ RequestLoggingFilter ✓ (ghi log)

ApplicationController.apply()
  │
  ▼
ApplicationService.apply()
  │
  ├── 1. Check quyền @PreAuthorize("hasRole('STUDENT')")
  ├── 2. Validate:
  │     - Sinh viên đang ở kỳ 5?  (BR-XX)
  │     - Đã apply job này chưa?   (DUPLICATE_APPLICATION)
  │     - JobPost còn OPEN không?  (JOB_POST_CLOSED)
  │     - Còn deadline không?      (APPLICATION_DEADLINE_EXPIRED)
  │     - Đã apply 3 job chưa?     (MAX_APPLICATIONS_LIMIT_REACHED)
  ├── 3. ApplicationRepository.save(application)
  │       → JPA → SQL INSERT INTO applications ...
  │       → DB trả về Application entity
  ├── 4. ApplicationMapper.toResponse(application)
  │       → ApplicationResponse DTO (ẩn field nhạy cảm)
  ├── 5. MailService.sendApplicationConfirmation() (@Async)
  │       → SMTP server gửi email cho student + enterprise
  └── 6. AuditLogAspect tự động chạy (AOP @AfterReturning)
        → INSERT INTO audit_logs (user, action, target, ip, timestamp)

Response 201 Created → { code: 1000, message: "Success", result: ApplicationResponse }
  │
  ▼
Frontend:
  - React Query cập nhật cache
  - Hiển thị Toast "Apply thành công!"
  - Refresh Job Board tab
```

### 8.2. Flow: Admin xem real-time Request Log (WebSocket)

```
Admin (Browser) → Connect WebSocket /ws?token=<jwt>
                  │
                  ▼
WebSocketConfig.JwtHandshakeInterceptor:
  - Validate JWT
  - Set Authorization header cho STOMP
  │
  ▼
STOMP CONNECT frame với Authorization header
  │
  ▼
ChannelInterceptor.preSend():
  - Decode JWT, lấy roles
  - Set user vào STOMP session
  │
  ▼
Admin subscribe /topic/request-logs
  │
  ▼
ChannelInterceptor preSend (SUBSCRIBE):
  - Check role = ROLE_ADMIN or ROLE_SYSTEM_ADMIN
  - OK → cho subscribe
  │
  ▼
Mỗi khi có request đến backend:
  RequestLoggingFilter ghi log vào DB
    │
    ▼
  RequestLogService.publishLog(log) → SimpMessagingTemplate
    │
    ▼
  /topic/request-logs → broadcast đến tất cả admin subscribers
    │
    ▼
  Admin browser nhận được → update UI real-time (không cần refresh)
```

### 8.3. Flow: Enterprise duyệt báo cáo tuần của sinh viên

```
Enterprise (Browser) → GET /api/weekly-reports/pending
                       │
                       ▼
WeeklyReportController.getPendingReports()
  │
WeeklyReportService.getPendingReports()
  │
  ├── 1. Lấy enterprise từ JWT
  ├── 2. WeeklyReportRepository.findByEnterpriseIdAndStatus(enterpriseId, SUBMITTED)
  └── 3. WeeklyReportMapper.toResponseList(reports)

Enterprise (Browser) → POST /api/weekly-reports/{id}/approve {feedback: "Tốt"}
                       │
                       ▼
WeeklyReportController.approveReport(id, request)
  │
WeeklyReportService.approveReport(id, request)
  │
  ├── 1. Validate report tồn tại, status = SUBMITTED
  ├── 2. Cập nhật status = APPROVED, feedback
  ├── 3. Save ReportFeedback (riêng bảng)
  ├── 4. Gửi email cho student
  └── 5. Audit log tự động

Response → Frontend → Update UI → "Đã duyệt"
```

---

## 9. Sơ đồ Use Case theo Role

```
                              ┌─────────────────────────────────┐
                              │       UEIMS System              │
                              └─────────────────────────────────┘
                                          │
        ┌───────────────────┬──────────────┼──────────────────┬─────────────────────┐
        │                   │              │                  │                     │
        ▼                   ▼              ▼                  ▼                     ▼
  ┌──────────┐      ┌────────────┐  ┌──────────────┐   ┌────────────┐     ┌──────────────┐
  │ STUDENT  │      │ ENTERPRISE │  │ TRAINING MGR │   │   ADMIN    │     │  PUBLIC      │
  └──────────┘      └────────────┘  └──────────────┘   └────────────┘     └──────────────┘
  - Login           - Register       - Login            - Login             - View landing
  - View jobs       - Login          - Manage students  - Manage users       page
  - Apply jobs      - Post jobs      - Manage companies - Manage roles       - Register
  - Submit CV       - View applicants- Manage semesters - View audit logs    enterprise
  - View interviews - Schedule      - View dashboard  - View request logs   - Forgot
  - Submit reports    interviews    - Approve placement - Real-time logs      password
  - View feedback   - Submit eval.    applications    - System monitoring
  - Rate enterprise - Approve reports- Issue warnings
  - Settings        - Manage plan   - Manage OJT
                      - Settings       - Export reports
```

---

## 10. Bảng công nghệ sử dụng

### 10.1. Frontend
| Layer | Công nghệ | Phiên bản |
|-------|-----------|-----------|
| UI Framework | React | 18.2 |
| Language | TypeScript | 6.0 |
| Build Tool | Vite | 5.0 |
| UI Components | Ant Design | 5.12 |
| Routing | React Router | 6.20 |
| Server State | TanStack Query | 5.12 |
| Client State | Zustand | 4.4 |
| HTTP Client | Axios | 1.6 |
| WebSocket | SockJS + STOMP | 1.6 + 7.3 |
| Charts | Recharts | 3.8 |
| Drag & Drop | @dnd-kit | 6.3 |
| i18n | i18next | 26.3 |
| CSS | Tailwind | 3.4 |
| Date | dayjs | 1.11 |

### 10.2. Backend
| Layer | Công nghệ | Phiên bản |
|-------|-----------|-----------|
| Framework | Spring Boot | 3.2.5 |
| Language | Java | 21 |
| ORM | Spring Data JPA + Hibernate | (theo SB) |
| Security | Spring Security + OAuth2 Resource Server | (theo SB) |
| AOP | Spring AOP | (theo SB) |
| Mapper | MapStruct | 1.5.5 |
| Boilerplate | Lombok | 1.18.38 |
| JWT | jjwt | 0.12.5 |
| API Docs | Springdoc OpenAPI | 2.5.0 |
| Excel | Apache POI | 5.2.5 |
| PDF | OpenPDF | 1.3.30 |
| HTML Sanitize | Jsoup | 1.16.1 |
| Email | Spring Mail | (theo SB) |
| WebSocket | Spring WebSocket + STOMP | (theo SB) |
| Email Template | Thymeleaf | (theo SB) |
| Coverage | JaCoCo | 0.8.14 |
| Format | Spotless | 2.44.0 |

### 10.3. Database & Infrastructure
| Thành phần | Công nghệ |
|------------|-----------|
| RDBMS | PostgreSQL |
| SMTP | Gmail / SendGrid |
| File Storage | Local FS / S3 |
| Build (Backend) | Maven |
| Build (Frontend) | Vite |
| CI/CD | (tuỳ dự án) |

---

## 11. Nguyên tắc thiết kế (Design Principles)

| Layer | Chứa gì | KHÔNG chứa gì |
|-------|---------|---------------|
| **Controller** | Nhận/trả HTTP request, parse JSON, validate input cơ bản | Business logic, query DB trực tiếp |
| **Service** | Business logic, validation phức tạp, phân quyền, @Transactional | Xử lý HTTP (status code, header) |
| **Mapper** | Chuyển đổi Entity ↔ DTO (tự động) | Logic nghiệp vụ |
| **Repository** | Query DB (CRUD thuần, custom @Query) | Business logic |
| **Aspect (JBA)** | Cross-cutting (audit log) | Logic nghiệp vụ chính |
| **Exception Handler** | Map exception → ErrorCode JSON | Logic nghiệp vụ |

**Lợi ích:**
- **Dễ bảo trì:** Sửa logic ở Service không ảnh hưởng Controller
- **Dễ test:** Test từng layer độc lập (Mock Repository, ...)
- **Tái sử dụng:** Nhiều Controller có thể dùng chung Service
- **Bảo mật:** Mọi request qua Security filter chain
- **Audit:** Mọi thay đổi dữ liệu đều có log nhờ AOP
- **Performance:** Real-time qua WebSocket, async qua @Async

---

## 12. Tổng kết

| Tầng | Công nghệ chính | Nhiệm vụ |
|------|-----------------|-----------|
| **Client Tier** | React 18 + TypeScript + Vite + Ant Design + Zustand + TanStack Query | UI, gửi request với JWT, real-time qua WebSocket |
| **Application Tier** | Spring Boot 3.2.5 + Java 21 | Controller → Service → Mapper → Repository → Entity |
| **Cross-cutting** | AOP (Audit), Exception Handler, Security Filter, WebSocket | Audit log, error mapping, auth, real-time |
| **External Services** | PostgreSQL + SMTP + File Storage | Lưu trữ, gửi email, file |

**Luồng dữ liệu tổng thể:**
```
Frontend (React)
  ↓ HTTPS + Bearer JWT
Backend Filter Chain → Controller → Service → Mapper → Repository → Entity
  ↓ JPA                                                  ↑
PostgreSQL DB ────────────────────────────────────────────┘
  ↑
SMTP Server (Mail async) | File Storage | WebSocket (real-time)
```

**Câu mở đầu khi thuyết trình:**
> "Hệ thống UEIMS được xây dựng trên kiến trúc 3-tier với đầy đủ các tầng chi tiết:
> Frontend React 18 với Modal, Tab-based UI, Zustand store và Axios interceptor;
> Backend Spring Boot 3.2.5 với các tầng Controller → Service → Mapper → Repository → Entity,
> tích hợp AOP cho audit log, GlobalExceptionHandler cho error mapping, WebSocket cho real-time,
> và Security Filter Chain cho JWT authentication.
> Toàn bộ kết nối với PostgreSQL database qua JPA/Hibernate, gửi email qua SMTP async,
> và hỗ trợ WebSocket STOMP cho admin theo dõi request log real-time."

---

**Tác giả:** Generated cho dự án UEIMS
**Ngày cập nhật:** Tháng 7/2026