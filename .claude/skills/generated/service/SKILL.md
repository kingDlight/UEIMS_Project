---
name: service
description: "Skill for the Service area of UEIMS_Project. 67 symbols across 60 files."
---

# Service

67 symbols | 60 files | Cohesion: 97%

## When to Use

- Working with code in `ueims_backend/`
- Understanding how ApplicationServiceImpl, AuditLogServiceImpl, EligibleStudentServiceImpl work
- Modifying service-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `ueims_backend/src/main/java/com/ueims/service/AuthenticationService.java` | introspect, logout, verifyToken, refreshToken, generateToken (+1) |
| `ueims_backend/src/main/java/com/ueims/controller/AuthenticationController.java` | introspect, logout, refreshToken |
| `ueims_backend/src/main/java/com/ueims/service/ApplicationService.java` | ApplicationService |
| `ueims_backend/src/main/java/com/ueims/service/impl/ApplicationServiceImpl.java` | ApplicationServiceImpl |
| `ueims_backend/src/main/java/com/ueims/service/AuditLogService.java` | AuditLogService |
| `ueims_backend/src/main/java/com/ueims/service/impl/AuditLogServiceImpl.java` | AuditLogServiceImpl |
| `ueims_backend/src/main/java/com/ueims/service/EligibleStudentService.java` | EligibleStudentService |
| `ueims_backend/src/main/java/com/ueims/service/impl/EligibleStudentServiceImpl.java` | EligibleStudentServiceImpl |
| `ueims_backend/src/main/java/com/ueims/service/EnterpriseAssignmentService.java` | EnterpriseAssignmentService |
| `ueims_backend/src/main/java/com/ueims/service/impl/EnterpriseAssignmentServiceImpl.java` | EnterpriseAssignmentServiceImpl |

## Entry Points

Start here when exploring this area:

- **`ApplicationServiceImpl`** (Class) — `ueims_backend/src/main/java/com/ueims/service/impl/ApplicationServiceImpl.java:13`
- **`AuditLogServiceImpl`** (Class) — `ueims_backend/src/main/java/com/ueims/service/impl/AuditLogServiceImpl.java:13`
- **`EligibleStudentServiceImpl`** (Class) — `ueims_backend/src/main/java/com/ueims/service/impl/EligibleStudentServiceImpl.java:19`
- **`EnterpriseAssignmentServiceImpl`** (Class) — `ueims_backend/src/main/java/com/ueims/service/impl/EnterpriseAssignmentServiceImpl.java:13`
- **`EnterpriseEvaluationServiceImpl`** (Class) — `ueims_backend/src/main/java/com/ueims/service/impl/EnterpriseEvaluationServiceImpl.java:13`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `ApplicationServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/ApplicationServiceImpl.java` | 13 |
| `AuditLogServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/AuditLogServiceImpl.java` | 13 |
| `EligibleStudentServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/EligibleStudentServiceImpl.java` | 19 |
| `EnterpriseAssignmentServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/EnterpriseAssignmentServiceImpl.java` | 13 |
| `EnterpriseEvaluationServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/EnterpriseEvaluationServiceImpl.java` | 13 |
| `EnterpriseServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/EnterpriseServiceImpl.java` | 13 |
| `FinalGradeServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/FinalGradeServiceImpl.java` | 13 |
| `FinalReportServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/FinalReportServiceImpl.java` | 13 |
| `IncidentServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/IncidentServiceImpl.java` | 13 |
| `InternshipPlanItemServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/InternshipPlanItemServiceImpl.java` | 13 |
| `InternshipPlanServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/InternshipPlanServiceImpl.java` | 13 |
| `InterviewServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/InterviewServiceImpl.java` | 13 |
| `InvalidatedTokenServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/InvalidatedTokenServiceImpl.java` | 12 |
| `JobPostServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/JobPostServiceImpl.java` | 13 |
| `NotificationServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/NotificationServiceImpl.java` | 13 |
| `PasswordResetTokenServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/PasswordResetTokenServiceImpl.java` | 13 |
| `PermissionServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/PermissionServiceImpl.java` | 12 |
| `ReportFeedbackServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/ReportFeedbackServiceImpl.java` | 13 |
| `RolePermissionServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/RolePermissionServiceImpl.java` | 13 |
| `RoleServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/RoleServiceImpl.java` | 12 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Authenticate → BuildScope` | cross_community | 4 |
| `Introspect → AppException` | intra_community | 4 |
| `RefreshToken → AppException` | cross_community | 4 |
| `RefreshToken → BuildScope` | intra_community | 4 |
| `Logout → AppException` | intra_community | 4 |
| `RefreshToken → FindByEmail` | cross_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Controller | 1 calls |

## How to Explore

1. `gitnexus_context({name: "ApplicationServiceImpl"})` — see callers and callees
2. `gitnexus_query({query: "service"})` — find related execution flows
3. Read key files listed above for implementation details
