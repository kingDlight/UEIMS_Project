---
name: service
description: "Skill for the Service area of UEIMS_Project. 84 symbols across 69 files."
---

# Service

84 symbols | 69 files | Cohesion: 95%

## When to Use

- Working with code in `ueims_backend/`
- Understanding how ApplicationServiceImpl, AuditLogServiceImpl, EligibleStudentServiceImpl work
- Modifying service-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `ueims/src/main/java/com/swp/ueims/service/AuthenticationService.java` | introspect, logout, verifyToken, authenticate, refreshToken (+2) |
| `ueims/src/test/java/com/swp/ueims/service/UserServiceTest.java` | createUser_validRequest_success, createUser_userExisted_fail, getMyInfo_valid_success, getMyInfo_userNotFound_error |
| `ueims/src/main/resources/AuthenticationController.java` | authenticate, logout, authenticate, authenticate |
| `ueims/src/main/java/com/swp/ueims/controller/UserController.java` | createUser, getMyInfo |
| `ueims/src/main/java/com/swp/ueims/repository/UserRepository.java` | existsByUsername, findByUsername |
| `ueims/src/main/java/com/swp/ueims/service/UserService.java` | createUser, getMyInfo |
| `ueims/src/main/java/com/swp/ueims/exception/AppException.java` | getErrorCode |
| `ueims/src/main/java/com/swp/ueims/mapper/UserMapper.java` | toUser |
| `ueims/src/test/java/com/swp/ueims/controller/UserControllerTest.java` | createUser_validRequest_success |
| `ueims/src/main/java/com/swp/ueims/configuration/ApplicationInitConfig.java` | applicationRunner |

## Entry Points

Start here when exploring this area:

- **`ApplicationServiceImpl`** (Class) — `ueims_backend/src/main/java/com/ueims/service/impl/ApplicationServiceImpl.java:10`
- **`AuditLogServiceImpl`** (Class) — `ueims_backend/src/main/java/com/ueims/service/impl/AuditLogServiceImpl.java:10`
- **`EligibleStudentServiceImpl`** (Class) — `ueims_backend/src/main/java/com/ueims/service/impl/EligibleStudentServiceImpl.java:10`
- **`EnterpriseAssignmentServiceImpl`** (Class) — `ueims_backend/src/main/java/com/ueims/service/impl/EnterpriseAssignmentServiceImpl.java:10`
- **`EnterpriseEvaluationServiceImpl`** (Class) — `ueims_backend/src/main/java/com/ueims/service/impl/EnterpriseEvaluationServiceImpl.java:10`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `ApplicationServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/ApplicationServiceImpl.java` | 10 |
| `AuditLogServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/AuditLogServiceImpl.java` | 10 |
| `EligibleStudentServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/EligibleStudentServiceImpl.java` | 10 |
| `EnterpriseAssignmentServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/EnterpriseAssignmentServiceImpl.java` | 10 |
| `EnterpriseEvaluationServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/EnterpriseEvaluationServiceImpl.java` | 10 |
| `EnterpriseServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/EnterpriseServiceImpl.java` | 10 |
| `FinalGradeServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/FinalGradeServiceImpl.java` | 10 |
| `FinalReportServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/FinalReportServiceImpl.java` | 10 |
| `IncidentServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/IncidentServiceImpl.java` | 10 |
| `InternshipPlanItemServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/InternshipPlanItemServiceImpl.java` | 10 |
| `InternshipPlanServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/InternshipPlanServiceImpl.java` | 10 |
| `InterviewServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/InterviewServiceImpl.java` | 10 |
| `InvalidatedTokenServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/InvalidatedTokenServiceImpl.java` | 9 |
| `JobPostServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/JobPostServiceImpl.java` | 10 |
| `NotificationServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/NotificationServiceImpl.java` | 10 |
| `PasswordResetTokenServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/PasswordResetTokenServiceImpl.java` | 10 |
| `PermissionServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/PermissionServiceImpl.java` | 9 |
| `ReportFeedbackServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/ReportFeedbackServiceImpl.java` | 10 |
| `RolePermissionServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/RolePermissionServiceImpl.java` | 10 |
| `RoleServiceImpl` | Class | `ueims_backend/src/main/java/com/ueims/service/impl/RoleServiceImpl.java` | 9 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Authenticate → BuildScope` | intra_community | 4 |
| `Authenticate → AppException` | intra_community | 4 |
| `Authenticate → AppException` | cross_community | 4 |
| `Authenticate → BuildScope` | intra_community | 4 |
| `Logout → AppException` | intra_community | 4 |
| `Decode → AppException` | intra_community | 4 |
| `CreateUser → ExistsByUsername` | intra_community | 3 |
| `CreateUser → AppException` | intra_community | 3 |
| `CreateUser → ToUser` | intra_community | 3 |
| `CreateUser → ToUserResponse` | cross_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Controller | 2 calls |

## How to Explore

1. `gitnexus_context({name: "ApplicationServiceImpl"})` — see callers and callees
2. `gitnexus_query({query: "service"})` — find related execution flows
3. Read key files listed above for implementation details
