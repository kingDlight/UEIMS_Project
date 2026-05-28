---
name: controller
description: "Skill for the Controller area of UEIMS_Project. 306 symbols across 78 files."
---

# Controller

306 symbols | 78 files | Cohesion: 100%

## When to Use

- Working with code in `ueims_backend/`
- Understanding how getAll, findAll, findAll work
- Modifying controller-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `ueims_backend/src/main/java/com/ueims/controller/ApplicationController.java` | getAll, getById, create, delete |
| `ueims_backend/src/main/java/com/ueims/service/ApplicationService.java` | findAll, findById, save, deleteById |
| `ueims_backend/src/main/java/com/ueims/service/impl/ApplicationServiceImpl.java` | findAll, findById, save, deleteById |
| `ueims_backend/src/main/java/com/ueims/controller/AuditLogController.java` | getAll, getById, create, delete |
| `ueims_backend/src/main/java/com/ueims/service/AuditLogService.java` | findAll, findById, save, deleteById |
| `ueims_backend/src/main/java/com/ueims/service/impl/AuditLogServiceImpl.java` | findAll, findById, save, deleteById |
| `ueims_backend/src/main/java/com/ueims/controller/EligibleStudentController.java` | getAll, getById, create, delete |
| `ueims_backend/src/main/java/com/ueims/service/EligibleStudentService.java` | findAll, findById, save, deleteById |
| `ueims_backend/src/main/java/com/ueims/service/impl/EligibleStudentServiceImpl.java` | findAll, findById, save, deleteById |
| `ueims_backend/src/main/java/com/ueims/controller/EnterpriseAssignmentController.java` | getAll, getById, create, delete |

## Entry Points

Start here when exploring this area:

- **`getAll`** (Method) — `ueims_backend/src/main/java/com/ueims/controller/ApplicationController.java:19`
- **`findAll`** (Method) — `ueims_backend/src/main/java/com/ueims/service/ApplicationService.java:8`
- **`findAll`** (Method) — `ueims_backend/src/main/java/com/ueims/service/impl/ApplicationServiceImpl.java:18`
- **`getById`** (Method) — `ueims_backend/src/main/java/com/ueims/controller/ApplicationController.java:24`
- **`findById`** (Method) — `ueims_backend/src/main/java/com/ueims/service/ApplicationService.java:10`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `getAll` | Method | `ueims_backend/src/main/java/com/ueims/controller/ApplicationController.java` | 19 |
| `findAll` | Method | `ueims_backend/src/main/java/com/ueims/service/ApplicationService.java` | 8 |
| `findAll` | Method | `ueims_backend/src/main/java/com/ueims/service/impl/ApplicationServiceImpl.java` | 18 |
| `getById` | Method | `ueims_backend/src/main/java/com/ueims/controller/ApplicationController.java` | 24 |
| `findById` | Method | `ueims_backend/src/main/java/com/ueims/service/ApplicationService.java` | 10 |
| `findById` | Method | `ueims_backend/src/main/java/com/ueims/service/impl/ApplicationServiceImpl.java` | 23 |
| `create` | Method | `ueims_backend/src/main/java/com/ueims/controller/ApplicationController.java` | 29 |
| `save` | Method | `ueims_backend/src/main/java/com/ueims/service/ApplicationService.java` | 12 |
| `save` | Method | `ueims_backend/src/main/java/com/ueims/service/impl/ApplicationServiceImpl.java` | 28 |
| `delete` | Method | `ueims_backend/src/main/java/com/ueims/controller/ApplicationController.java` | 34 |
| `deleteById` | Method | `ueims_backend/src/main/java/com/ueims/service/ApplicationService.java` | 14 |
| `deleteById` | Method | `ueims_backend/src/main/java/com/ueims/service/impl/ApplicationServiceImpl.java` | 33 |
| `getAll` | Method | `ueims_backend/src/main/java/com/ueims/controller/AuditLogController.java` | 19 |
| `findAll` | Method | `ueims_backend/src/main/java/com/ueims/service/AuditLogService.java` | 8 |
| `findAll` | Method | `ueims_backend/src/main/java/com/ueims/service/impl/AuditLogServiceImpl.java` | 18 |
| `getById` | Method | `ueims_backend/src/main/java/com/ueims/controller/AuditLogController.java` | 24 |
| `findById` | Method | `ueims_backend/src/main/java/com/ueims/service/AuditLogService.java` | 10 |
| `findById` | Method | `ueims_backend/src/main/java/com/ueims/service/impl/AuditLogServiceImpl.java` | 23 |
| `create` | Method | `ueims_backend/src/main/java/com/ueims/controller/AuditLogController.java` | 29 |
| `save` | Method | `ueims_backend/src/main/java/com/ueims/service/AuditLogService.java` | 12 |

## How to Explore

1. `gitnexus_context({name: "getAll"})` — see callers and callees
2. `gitnexus_query({query: "controller"})` — find related execution flows
3. Read key files listed above for implementation details
