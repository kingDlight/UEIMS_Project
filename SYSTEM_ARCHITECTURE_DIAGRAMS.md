# System Architecture Diagrams - UEIMS (Mermaid)

Sơ đồ dạng Mermaid có thể render trên GitHub, Notion, hoặc các tool hỗ trợ Mermaid.

---

## 1. Sơ đồ tổng quan 3-tier

```mermaid
graph TB
    subgraph Users["Người dùng"]
        S[Sinh viên]
        E[Doanh nghiệp]
        TM[Training Manager]
        A[Admin]
    end

    subgraph Frontend["TẦNG 1: CLIENT TIER (React 18 + Vite + TypeScript)"]
        direction TB
        FE_Pages[Pages: Login, Dashboard, Student, Enterprise, TrainingMgr, Admin]
        FE_Layout[Layouts: ModernLayout, AppLayout]
        FE_Stops[Stores: useAuthStore, useNotificationStore]
        FE_Services[Services: 40+ API Services]
        FE_Axios[Axios + Interceptors<br/>Bearer JWT + Auto Refresh]
        FE_WS[WebSocket Client<br/>SockJS + STOMP]
        FE_RQ[TanStack Query v5]

        FE_Pages --> FE_Layout
        FE_Pages --> FE_Stops
        FE_Pages --> FE_Services
        FE_Services --> FE_Axios
        FE_Services --> FE_RQ
        FE_Stops --> FE_Axios
        FE_Pages --> FE_WS
    end

    subgraph Backend["TẦNG 2: APPLICATION TIER (Spring Boot 3.2.5 + Java 21)"]
        direction TB
        BE_Security[Security Filter Chain<br/>SecurityHeaders → RateLimit → JWT → PwdChange → ReqLog]
        BE_Controller[REST Controller Layer<br/>40+ Controllers]
        BE_Service[Service Layer<br/>45+ Services<br/>Business Logic + @Transactional]
        BE_Mapper[Mapper Layer<br/>MapStruct<br/>Entity ↔ DTO]
        BE_Repository[Repository Layer<br/>Spring Data JPA<br/>35+ Repositories]
        BE_Entity[Entity Layer<br/>40+ JPA Entities]

        BE_Aspect[AOP Aspect<br/>AuditLogAspect<br/>@AfterReturning on POST/PUT/DELETE]
        BE_Exception[GlobalExceptionHandler<br/>@ControllerAdvice<br/>ErrorCode enum 110+ mã]
        BE_DTO[DTO Layer<br/>Request/Response]
        BE_WS[WebSocket Config<br/>STOMP /ws<br/>JwtHandshakeInterceptor]
        BE_Cron[Scheduled Tasks<br/>ScanMissingReports<br/>TokenCleanup<br/>RequestLogCleanup]

        BE_Security --> BE_Controller
        BE_Controller --> BE_Service
        BE_Service --> BE_Mapper
        BE_Service --> BE_Repository
        BE_Repository --> BE_Entity
        BE_Mapper --> BE_DTO
        BE_Controller -.-> BE_Aspect
        BE_Service -.-> BE_Exception
        BE_Controller -.-> BE_WS
        BE_Service -.-> BE_Cron
    end

    subgraph External["TẦNG 3: EXTERNAL SERVICES & STORAGE"]
        DB[(PostgreSQL Database<br/>40+ tables)]
        SMTP[SMTP Mail Server<br/>Gmail/SendGrid]
        FS[File Storage<br/>CV, Avatar, Reports]
    end

    S --> Frontend
    E --> Frontend
    TM --> Frontend
    A --> Frontend

    FE_Axios -->|HTTPS + JWT| BE_Security
    FE_WS -->|WSS + JWT| BE_WS

    BE_Repository -->|JDBC| DB
    BE_Service -->|SMTP| SMTP
    BE_Service -->|File I/O| FS

    style Users fill:#FFE4B5
    style Frontend fill:#E0F2FE
    style Backend fill:#FEF3C7
    style External fill:#D1FAE5
```

---

## 2. Sơ đồ Backend chi tiết (Controller → Service → Mapper → Repository → Entity)

```mermaid
graph LR
    subgraph In["Request từ Frontend"]
        HTTP[HTTP Request + JWT]
    end

    subgraph FilterChain["Security Filter Chain"]
        F1[SecurityHeadersFilter]
        F2[RateLimitFilter]
        F3[BearerTokenAuthenticationFilter]
        F4[RequirePasswordChangeFilter]
        F5[RequestLoggingFilter]
    end

    HTTP --> F1 --> F2 --> F3 --> F4 --> F5

    subgraph Controller["REST CONTROLLER LAYER"]
        AC[AuthenticationController]
        AppC[ApplicationController]
        JPC[JobPostController]
        IC[InterviewController]
        URC[WeeklyReportController]
        EC[EnterpriseController]
        UC[UserController]
        Dots[...]
    end

    F5 --> Controller

    subgraph Service["SERVICE LAYER (Business Logic)"]
        AS[AuthenticationService]
        AppS[ApplicationService]
        JPS[JobPostService]
        IS[InterviewService]
        WRS[WeeklyReportService]
        ES[EnterpriseService]
        US[UserService]
        MS[MailService<br/>@Async]
        Cron[ScanMissingReportsService]
        Dots2[...]
    end

    Controller --> Service

    subgraph Mapper["MAPPER LAYER (MapStruct)"]
        AM[ApplicationMapper]
        JM[JobPostMapper]
        IM[InterviewMapper]
        WM[WeeklyReportMapper]
        UM[UserMapper]
        Dots3[...]
    end

    Service --> Mapper

    subgraph Repository["REPOSITORY LAYER (JPA)"]
        AR[ApplicationRepository]
        JR[JobPostRepository]
        IR[InterviewRepository]
        WR[WeeklyReportRepository]
        UR[UserRepository]
        Dots4[...]
    end

    Service --> Repository

    subgraph Entity["ENTITY LAYER (JPA)"]
        AE[Application]
        JE[JobPost]
        IE[Interview]
        WE[WeeklyReport]
        UE[User]
        Dots5[...]
    end

    Repository --> Entity

    subgraph CrossCutting["XUYÊN SUỐT (Cross-cutting)"]
        Aspect[AuditLogAspect<br/>AOP @AfterReturning]
        GEH[GlobalExceptionHandler<br/>@ControllerAdvice]
        WSC[WebSocketConfig<br/>STOMP]
    end

    Controller -.-> Aspect
    Service -.-> GEH
    Service -.-> MS
    Controller -.-> WSC

    Entity --> DB[(PostgreSQL)]
    MS --> SMTP[SMTP Server]
    Service -.-> Cron

    style FilterChain fill:#FECACA
    style Controller fill:#BFDBFE
    style Service fill:#FED7AA
    style Mapper fill:#FDE68A
    style Repository fill:#BBF7D0
    style Entity fill:#C7D2FE
    style CrossCutting fill:#FBCFE8
```

---

## 3. Sơ đồ Module Application (chi tiết)

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Student (Browser)
    participant FE as Frontend (React + Axios)
    participant Filter as Security Filter Chain
    participant Ctrl as ApplicationController
    participant Svc as ApplicationService
    participant Map as ApplicationMapper
    participant Repo as ApplicationRepository
    participant DB as PostgreSQL
    participant Mail as MailService (Async)
    participant Aspect as AuditLogAspect (AOP)

    Browser->>FE: Click "Apply" + chọn CV
    FE->>FE: useAuthStore.getState().token
    FE->>Filter: POST /api/applications<br/>Header: Bearer <jwt>

    Filter->>Filter: SecurityHeadersFilter ✓
    Filter->>Filter: RateLimitFilter ✓
    Filter->>Filter: JWT Decode ✓
    Filter->>Filter: RequirePwdChange ✓
    Filter->>Filter: RequestLoggingFilter (log DB)

    Filter->>Ctrl: Dispatch request
    Ctrl->>Svc: apply(request)

    Svc->>Svc: @PreAuthorize("hasRole('STUDENT')")
    Svc->>Repo: findByStudentIdAndJobPostId()
    Repo->>DB: SELECT * FROM applications WHERE ...
    DB-->>Repo: List<Application>
    Repo-->>Svc: empty

    Svc->>Svc: Validate: kỳ 5? chưa apply? job OPEN? còn deadline? <3 đơn?
    Svc->>Repo: save(newApplication)
    Repo->>DB: INSERT INTO applications ...
    DB-->>Repo: Application entity
    Repo-->>Svc: Application

    Svc->>Map: toApplicationResponse(application)
    Map-->>Svc: ApplicationResponse DTO

    Svc->>Mail: sendApplicationConfirmation() [@Async]
    Mail-->>Mail: SMTP gửi email (background)

    Svc-->>Ctrl: ApplicationResponse

    Ctrl-->>Aspect: @AfterReturning tự động
    Aspect->>DB: INSERT INTO audit_logs (user, action, ip, ...)

    Ctrl-->>FE: 201 Created<br/>{code:1000, message:"Success", result:{...}}

    FE->>Browser: Hiển thị Toast "Apply thành công!"<br/>Refresh Job Board
```

---

## 4. Sơ đồ WebSocket Real-time

```mermaid
sequenceDiagram
    autonumber
    participant Admin as Admin (Browser)
    participant FE as AdminDashboard (React)
    participant SockJS as SockJS Client
    participant WS as WebSocket Endpoint /ws
    participant Intc as JwtHandshakeInterceptor
    participant ChanIntc as ChannelInterceptor
    participant Broker as STOMP Broker
    participant Ctrl as RequestLogController
    participant Svc as RequestLogService
    participant DB as PostgreSQL

    Admin->>FE: Login thành công
    FE->>SockJS: new SockJS('/ws?token=<jwt>')
    SockJS->>WS: HTTP Upgrade WebSocket
    WS->>Intc: beforeHandshake()
    Intc->>Intc: Validate JWT (từ query param)
    Intc-->>WS: Set Authorization header, OK

    WS->>ChanIntc: STOMP CONNECT
    ChanIntc->>ChanIntc: Decode JWT, set user
    ChanIntc-->>Broker: CONNECTED

    FE->>Broker: SUBSCRIBE /topic/request-logs
    ChanIntc->>ChanIntc: Check role = ROLE_ADMIN
    ChanIntc-->>Broker: SUBSCRIBED

    Note over DB,FE: Sau đó, có request từ user bất kỳ

    DB->>Svc: Ghi request log
    Svc->>Ctrl: publishLog(log)
    Ctrl->>Broker: convertAndSend("/topic/request-logs", log)
    Broker-->>FE: STOMP MESSAGE<br/>destination: /topic/request-logs

    FE->>FE: useStomp hook nhận message
    FE->>Admin: Update UI real-time<br/>(không cần refresh trang)
```

---

## 5. Sơ đồ Database (Entities chính)

```mermaid
erDiagram
    USER ||--o{ STUDENT_PROFILE : has
    USER ||--o{ APPLICATION : submits
    USER ||--o{ AUDIT_LOG : performs
    USER ||--o{ NOTIFICATION : receives
    USER }o--o{ ROLE : has
    ROLE }o--o{ PERMISSION : has

    ENTERPRISE ||--o{ JOB_POST : posts
    ENTERPRISE ||--o{ ENTERPRISE_ASSIGNMENT : assigns
    ENTERPRISE ||--o{ ENTERPRISE_EVALUATION : evaluates
    ENTERPRISE ||--o{ STUDENT_ENTERPRISE_FEEDBACK : receives

    JOB_POST ||--o{ APPLICATION : receives
    JOB_POST ||--o{ PLACEMENT_APPLICATION : receives

    APPLICATION ||--o| INTERVIEW : scheduled
    APPLICATION ||--o| FINAL_GRADE : graded

    STUDENT_PROFILE ||--o{ WEEKLY_REPORT : submits
    STUDENT_PROFILE ||--o{ FINAL_REPORT : submits
    STUDENT_PROFILE ||--o{ INTERNSHIP_PLAN : has
    STUDENT_PROFILE ||--o{ AT_RISK_STUDENT : flagged

    SEMESTER ||--o{ ELIGIBLE_STUDENT : includes
    SEMESTER ||--o{ SEMESTER_ENTERPRISE : includes
    SEMESTER ||--o{ SEMESTER_STATISTICS : aggregates

    INTERNSHIP_PLAN ||--o{ INTERNSHIP_PLAN_ITEM : contains

    WEEKLY_REPORT ||--o{ REPORT_FEEDBACK : reviewed

    USER {
        uuid user_id PK
        string email UK
        string password_hash
        string full_name
        boolean is_active
        boolean is_locked
        timestamp created_at
    }
    STUDENT_PROFILE {
        uuid student_id PK
        uuid user_id FK
        string student_code UK
        string major
        int current_semester
        decimal gpa
    }
    ENTERPRISE {
        uuid enterprise_id PK
        string company_name
        string tax_code UK
        string status
        uuid approved_by FK
    }
    JOB_POST {
        uuid job_post_id PK
        uuid enterprise_id FK
        string title
        text description
        int slots
        date deadline
        string status
    }
    APPLICATION {
        uuid application_id PK
        uuid student_id FK
        uuid job_post_id FK
        string status
        timestamp applied_at
    }
    INTERVIEW {
        uuid interview_id PK
        uuid application_id FK
        timestamp interview_date
        string interview_link
        string status
    }
    WEEKLY_REPORT {
        uuid report_id PK
        uuid student_id FK
        uuid enterprise_id FK
        int week_number
        text content
        string status
        timestamp submitted_at
    }
    AUDIT_LOG {
        uuid log_id PK
        uuid user_id FK
        string action
        string target_entity
        string ip_address
        text user_agent
        timestamp timestamp
    }
```

---

## 6. Sơ đồ phân quyền theo Role

```mermaid
graph TB
    subgraph Roles["4 Roles"]
        R1[STUDENT<br/>Sinh viên]
        R2[ENTERPRISE<br/>Doanh nghiệp]
        R3[TRAINING_MANAGER<br/>Nhà trường]
        R4[ADMIN<br/>Quản trị viên]
    end

    subgraph StudentPerms["Quyền STUDENT"]
        S1[Xem Job Board]
        S2[Apply Job]
        S3[Nộp CV]
        S4[Nộp Weekly Report]
        S5[Nộp Final Report]
        S6[Đánh giá Enterprise]
        S7[Xem lịch Interview]
        S8[Xem Dashboard cá nhân]
    end

    subgraph EnterprisePerms["Quyền ENTERPRISE"]
        E1[Đăng Job Post]
        E2[Xem Applicants]
        E3[Sắp xếp Interview]
        E4[Submit Evaluation]
        E5[Approve Weekly Report]
        E6[Quản lý Internship Plan]
        E7[Xem Dashboard riêng]
        E8[Đăng ký - đợi duyệt]
    end

    subgraph TMPerms["Quyền TRAINING_MANAGER"]
        T1[Quản lý Sinh viên CRUD]
        T2[Quản lý Doanh nghiệp]
        T3[Quản lý Học kỳ]
        T4[Duyệt Placement Application]
        T5[Xem Command Center Dashboard]
        T6[Quản lý OJT Status]
        T7[Issue Warning]
        T8[Export Excel Reports]
        T9[Quản lý Incidents]
        T10[Send System Announcement]
    end

    subgraph AdminPerms["Quyền ADMIN"]
        A1[Quản lý Users & Roles]
        A2[Quản lý Permissions]
        A3[Xem Audit Log]
        A4[Xem Request Log real-time]
        A5[System Monitoring]
    end

    R1 --> StudentPerms
    R2 --> EnterprisePerms
    R3 --> TMPerms
    R4 --> AdminPerms

    R3 -.->|Có thêm| A3
    R3 -.->|Có thêm| A4
```

---

## 7. Sơ đồ Exception Handling Flow

```mermaid
flowchart TD
    A[Service throws exception] --> B{Loại exception?}

    B -->|AppException| C[GlobalExceptionHandler.handlingAppException]
    B -->|MethodArgumentNotValidException| D[handlingValidation → 400]
    B -->|JpaSystemException| E[handlingJpaSystemException → 1040]
    B -->|DataIntegrityViolationException| F[handlingDataIntegrityViolation → 1040/2004]
    B -->|AccessDeniedException| G[handlingAccessDenied → 1007]
    B -->|HttpRequestMethodNotSupported| H[handlingHttpRequestMethodNotSupported → 1041]
    B -->|MissingServletRequestParameter| I[handlingMissingParameter → 1034]
    B -->|MultipartException| J[handlingMultipart → Invalid Excel]
    B -->|MaxUploadSizeExceeded| K[handlingMaxUploadSize → File too large]
    B -->|NoResourceFoundException| L[handlingNoResourceFound → 1075]
    B -->|Exception khác| M[handlingRuntimeException → 9999]

    C --> N[ResponseEntity ApiResponse]
    D --> N
    E --> N
    F --> N
    G --> N
    H --> N
    I --> N
    J --> N
    K --> N
    L --> N
    M --> N

    N --> O[JSON Response]
    O --> P["{code, message, result:null}"]

    P --> Q[Frontend axios interceptor]
    Q --> R[Map ErrorCode → Toast/Modal]
    Q --> S[Ẩn error kỹ thuật khỏi user]
```

---

## 8. Sơ đồ Cron Jobs

```mermaid
gantt
    title Scheduled Tasks (Cron Jobs)
    dateFormat HH:mm
    axisFormat %H:%M

    section Daily
    ScanMissingReports     :active, scan, 00:00, 1m
    InvalidatedTokenCleanup :token, 00:05, 1m
    RequestLogCleanup      :reqlog, 01:00, 5m

    section Weekly
    SemesterStatisticsUpdate :semester, 02:00, 10m
```

---

## 9. Sơ đồ Tech Stack (Frontend)

```mermaid
graph TB
    subgraph UI["UI Layer"]
        AntD[Ant Design 5<br/>Modal, Form, Table, Tabs]
        Tailwind[Tailwind CSS]
        Framer[Framer Motion]
        Recharts[Recharts<br/>Dashboard Charts]
    end

    subgraph State["State Management"]
        Zustand[Zustand<br/>useAuthStore, useNotificationStore]
        ReactQ[TanStack Query v5<br/>Server State + Cache]
    end

    subgraph Routing["Routing"]
        RR[React Router v6<br/>createBrowserRouter + lazy]
    end

    subgraph Services["Service Layer"]
        Axios[Axios + Interceptors<br/>Bearer JWT + Auto Refresh]
        Services_Files[40+ Service Files]
        Stomp[SockJS + STOMP.js<br/>WebSocket Real-time]
    end

    subgraph Core["Core"]
        React[React 18]
        TS[TypeScript]
        Vite[Vite 5<br/>Build + HMR]
    end

    subgraph Util["Utilities"]
        Dayjs[dayjs]
        I18n[i18next]
        DnD[&commat;dnd-kit]
        EasyCrop[react-easy-crop]
    end

    UI --> Core
    State --> Core
    Routing --> Core
    Services --> Core
    Util --> Core

    style UI fill:#FFE4E1
    style State fill:#E0FFE0
    style Routing fill:#E0E0FF
    style Services fill:#FFF8DC
    style Core fill:#FFB6C1
    style Util fill:#F0E68C
```

---

## 10. Sơ đồ Tech Stack (Backend)

```mermaid
graph TB
    subgraph Web["Web Layer"]
        WebSocket[Spring WebSocket + STOMP<br/>&commat;EnableWebSocketMessageBroker]
        WebMvc[Spring MVC<br/>REST Controllers]
        Thyme[Thymeleaf<br/>Email Templates]
    end

    subgraph Security["Security Layer"]
        SecCfg[SecurityConfig<br/>Filter Chain]
        JWT[Spring Security OAuth2<br/>JWT Resource Server]
        Filter[Custom Filters:<br/>SecurityHeaders, RateLimit,<br/>RequirePwdChange, RequestLog]
    end

    subgraph Business["Business Layer"]
        Services[45+ Services<br/>&commat;Service + &commat;Transactional]
        AOP[Spring AOP<br/>AuditLogAspect<br/>&commat;AfterReturning]
        Schedule[&commat;Scheduled<br/>Cron Jobs]
    end

    subgraph Data["Data Layer"]
        MapStruct[MapStruct 1.5.5<br/>Entity ↔ DTO]
        JPA[Spring Data JPA<br/>Hibernate]
        Repos[35+ Repositories]
        Entities[40+ JPA Entities]
    end

    subgraph Integration["Integration"]
        SMTP[Spring Mail<br/>&commat;Async]
        Excel[Apache POI<br/>Excel Import/Export]
        PDF[OpenPDF<br/>PDF Generation]
        Jsoup[Jsoup<br/>HTML Sanitize]
    end

    subgraph Quality["Quality"]
        Lombok[Lombok<br/>&commat;Getter, &commat;Builder]
        Spotless[Spotless<br/>Code Formatter]
        Jacoco[JaCoCo<br/>Code Coverage]
        Swagger[Springdoc OpenAPI<br/>Swagger UI]
    end

    subgraph Core["Core"]
        SpringBoot[Spring Boot 3.2.5]
        Java[Java 21]
        Maven[Maven]
    end

    Web --> Core
    Security --> Core
    Business --> Core
    Data --> Core
    Integration --> Core
    Quality --> Core

    style Web fill:#FFE4B5
    style Security fill:#FFB6C1
    style Business fill:#98FB98
    style Data fill:#87CEEB
    style Integration fill:#DDA0DD
    style Quality fill:#F0E68C
    style Core fill:#FF6347
```

---

## Cách sử dụng

Các sơ đồ trên có thể được render tại:
1. **GitHub** - Tự động render trong file `.md`
2. **Mermaid Live Editor** - https://mermaid.live
3. **VS Code** - Cài extension "Markdown Preview Mermaid Support"
4. **Notion** - Paste code vào block `/mermaid`

**Lưu ý:** Ký tự `&commat;` được escape để GitHub render đúng. Khi paste vào Mermaid Live Editor, hãy thay `&commat;` bằng `@`.