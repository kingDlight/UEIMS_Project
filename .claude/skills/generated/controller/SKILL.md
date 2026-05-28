---
name: controller
description: "Skill for the Controller area of UEIMS_Project. 324 symbols across 84 files."
---

# Controller

324 symbols | 84 files | Cohesion: 100%

## When to Use

- Working with code in `ueims_backend/`
- Understanding how EligibleStudent, authenticate, getMyInfo work
- Modifying controller-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `ueims_backend/src/main/java/com/ueims/controller/SemesterController.java` | getAll, getById, create, delete, openSemester (+1) |
| `ueims_backend/src/main/java/com/ueims/service/SemesterService.java` | findAll, findById, save, deleteById, openSemester (+1) |
| `ueims_backend/src/main/java/com/ueims/service/impl/SemesterServiceImpl.java` | findAll, findById, save, deleteById, openSemester (+1) |
| `ueims_backend/src/main/java/com/ueims/controller/UserController.java` | getMyInfo, getAll, getById, create, delete |
| `ueims_backend/src/main/java/com/ueims/service/UserService.java` | getMyInfo, findAll, findById, save, deleteById |
| `ueims_backend/src/main/java/com/ueims/service/impl/UserServiceImpl.java` | getMyInfo, findAll, findById, save, deleteById |
| `ueims_backend/src/main/java/com/ueims/controller/EligibleStudentController.java` | uploadExcel, getAll, getById, create, delete |
| `ueims_backend/src/main/java/com/ueims/service/EligibleStudentService.java` | importFromExcel, findAll, findById, save, deleteById |
| `ueims_backend/src/main/java/com/ueims/service/impl/EligibleStudentServiceImpl.java` | importFromExcel, findAll, findById, save, deleteById |
| `ueims_backend/src/main/java/com/ueims/controller/ApplicationController.java` | getAll, getById, create, delete |

## Entry Points

Start here when exploring this area:

- **`EligibleStudent`** (Class) — `ueims_backend/src/main/java/com/ueims/model/entity/EligibleStudent.java:10`
- **`authenticate`** (Method) — `ueims_backend/src/main/java/com/ueims/controller/AuthenticationController.java:27`
- **`getMyInfo`** (Method) — `ueims_backend/src/main/java/com/ueims/controller/UserController.java:23`
- **`findByEmail`** (Method) — `ueims_backend/src/main/java/com/ueims/repository/UserRepository.java:12`
- **`findByEmail`** (Method) — `ueims_backend/src/main/java/com/ueims/repository/UserSessionRepository.java:11`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `EligibleStudent` | Class | `ueims_backend/src/main/java/com/ueims/model/entity/EligibleStudent.java` | 10 |
| `authenticate` | Method | `ueims_backend/src/main/java/com/ueims/controller/AuthenticationController.java` | 27 |
| `getMyInfo` | Method | `ueims_backend/src/main/java/com/ueims/controller/UserController.java` | 23 |
| `findByEmail` | Method | `ueims_backend/src/main/java/com/ueims/repository/UserRepository.java` | 12 |
| `findByEmail` | Method | `ueims_backend/src/main/java/com/ueims/repository/UserSessionRepository.java` | 11 |
| `authenticate` | Method | `ueims_backend/src/main/java/com/ueims/service/AuthenticationService.java` | 79 |
| `getMyInfo` | Method | `ueims_backend/src/main/java/com/ueims/service/UserService.java` | 17 |
| `getMyInfo` | Method | `ueims_backend/src/main/java/com/ueims/service/impl/UserServiceImpl.java` | 42 |
| `uploadExcel` | Method | `ueims_backend/src/main/java/com/ueims/controller/EligibleStudentController.java` | 41 |
| `importFromExcel` | Method | `ueims_backend/src/main/java/com/ueims/service/EligibleStudentService.java` | 18 |
| `importFromExcel` | Method | `ueims_backend/src/main/java/com/ueims/service/impl/EligibleStudentServiceImpl.java` | 45 |
| `parseEligibleStudents` | Method | `ueims_backend/src/main/java/com/ueims/util/ExcelImportUtil.java` | 20 |
| `getAll` | Method | `ueims_backend/src/main/java/com/ueims/controller/ApplicationController.java` | 19 |
| `findAll` | Method | `ueims_backend/src/main/java/com/ueims/service/ApplicationService.java` | 8 |
| `findAll` | Method | `ueims_backend/src/main/java/com/ueims/service/impl/ApplicationServiceImpl.java` | 18 |
| `getById` | Method | `ueims_backend/src/main/java/com/ueims/controller/ApplicationController.java` | 24 |
| `findById` | Method | `ueims_backend/src/main/java/com/ueims/service/ApplicationService.java` | 10 |
| `findById` | Method | `ueims_backend/src/main/java/com/ueims/service/impl/ApplicationServiceImpl.java` | 23 |
| `create` | Method | `ueims_backend/src/main/java/com/ueims/controller/ApplicationController.java` | 29 |
| `save` | Method | `ueims_backend/src/main/java/com/ueims/service/ApplicationService.java` | 12 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `UploadExcel → EligibleStudent` | intra_community | 4 |
| `UploadExcel → AppException` | intra_community | 4 |
| `Authenticate → BuildScope` | cross_community | 4 |
| `Create → AppException` | intra_community | 3 |
| `Authenticate → FindByEmail` | intra_community | 3 |
| `Authenticate → AppException` | intra_community | 3 |
| `Authenticate → FindByEmail` | intra_community | 3 |
| `RefreshToken → FindByEmail` | cross_community | 3 |
| `GetMyInfo → FindByEmail` | intra_community | 3 |
| `GetMyInfo → AppException` | intra_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Service | 1 calls |

## How to Explore

1. `gitnexus_context({name: "EligibleStudent"})` — see callers and callees
2. `gitnexus_query({query: "controller"})` — find related execution flows
3. Read key files listed above for implementation details
