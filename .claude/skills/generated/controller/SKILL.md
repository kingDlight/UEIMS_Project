---
name: controller
description: "Skill for the Controller area of UEIMS_Project. 332 symbols across 87 files."
---

# Controller

332 symbols | 87 files | Cohesion: 100%

## When to Use

- Working with code in `ueims_backend/`
- Understanding how getUsers, getUser, updateUser work
- Modifying controller-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `ueims/src/main/java/com/swp/ueims/controller/UserController.java` | getUsers, getUser, updateUser, deleteUser |
| `ueims/src/main/java/com/swp/ueims/service/UserService.java` | updateUser, getUsers, getUser, deleteUser |
| `ueims_backend/src/main/java/com/ueims/controller/ApplicationController.java` | getAll, getById, create, delete |
| `ueims_backend/src/main/java/com/ueims/service/ApplicationService.java` | findAll, findById, save, deleteById |
| `ueims_backend/src/main/java/com/ueims/service/impl/ApplicationServiceImpl.java` | findAll, findById, save, deleteById |
| `ueims_backend/src/main/java/com/ueims/controller/AuditLogController.java` | getAll, getById, create, delete |
| `ueims_backend/src/main/java/com/ueims/service/AuditLogService.java` | findAll, findById, save, deleteById |
| `ueims_backend/src/main/java/com/ueims/service/impl/AuditLogServiceImpl.java` | findAll, findById, save, deleteById |
| `ueims_backend/src/main/java/com/ueims/controller/EligibleStudentController.java` | getAll, getById, create, delete |
| `ueims_backend/src/main/java/com/ueims/service/EligibleStudentService.java` | findAll, findById, save, deleteById |

## Entry Points

Start here when exploring this area:

- **`getUsers`** (Method) — `ueims/src/main/java/com/swp/ueims/controller/UserController.java:34`
- **`getUser`** (Method) — `ueims/src/main/java/com/swp/ueims/controller/UserController.java:41`
- **`updateUser`** (Method) — `ueims/src/main/java/com/swp/ueims/controller/UserController.java:61`
- **`toUserResponse`** (Method) — `ueims/src/main/java/com/swp/ueims/mapper/UserMapper.java:15`
- **`updateUser`** (Method) — `ueims/src/main/java/com/swp/ueims/mapper/UserMapper.java:17`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `getUsers` | Method | `ueims/src/main/java/com/swp/ueims/controller/UserController.java` | 34 |
| `getUser` | Method | `ueims/src/main/java/com/swp/ueims/controller/UserController.java` | 41 |
| `updateUser` | Method | `ueims/src/main/java/com/swp/ueims/controller/UserController.java` | 61 |
| `toUserResponse` | Method | `ueims/src/main/java/com/swp/ueims/mapper/UserMapper.java` | 15 |
| `updateUser` | Method | `ueims/src/main/java/com/swp/ueims/mapper/UserMapper.java` | 17 |
| `updateUser` | Method | `ueims/src/main/java/com/swp/ueims/service/UserService.java` | 61 |
| `getUsers` | Method | `ueims/src/main/java/com/swp/ueims/service/UserService.java` | 79 |
| `getUser` | Method | `ueims/src/main/java/com/swp/ueims/service/UserService.java` | 85 |
| `create` | Method | `ueims/src/main/java/com/swp/ueims/controller/PermissionController.java` | 24 |
| `getAll` | Method | `ueims/src/main/java/com/swp/ueims/controller/PermissionController.java` | 31 |
| `toPermission` | Method | `ueims/src/main/java/com/swp/ueims/mapper/PermissionMapper.java` | 10 |
| `toPermissionResponse` | Method | `ueims/src/main/java/com/swp/ueims/mapper/PermissionMapper.java` | 12 |
| `create` | Method | `ueims/src/main/java/com/swp/ueims/service/PermissionService.java` | 25 |
| `getAll` | Method | `ueims/src/main/java/com/swp/ueims/service/PermissionService.java` | 31 |
| `create` | Method | `ueims/src/main/java/com/swp/ueims/controller/RoleController.java` | 24 |
| `getAll` | Method | `ueims/src/main/java/com/swp/ueims/controller/RoleController.java` | 31 |
| `toRole` | Method | `ueims/src/main/java/com/swp/ueims/mapper/RoleMapper.java` | 11 |
| `toRoleResponse` | Method | `ueims/src/main/java/com/swp/ueims/mapper/RoleMapper.java` | 14 |
| `create` | Method | `ueims/src/main/java/com/swp/ueims/service/RoleService.java` | 27 |
| `getAll` | Method | `ueims/src/main/java/com/swp/ueims/service/RoleService.java` | 37 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `CreateUser → ToUserResponse` | cross_community | 3 |
| `Create → ToPermission` | intra_community | 3 |
| `Create → ToPermissionResponse` | intra_community | 3 |
| `Create → ToRole` | intra_community | 3 |
| `Create → ToRoleResponse` | intra_community | 3 |
| `UpdateUser → AppException` | intra_community | 3 |
| `UpdateUser → UpdateUser` | intra_community | 3 |
| `UpdateUser → ToUserResponse` | intra_community | 3 |
| `GetAll → ToPermissionResponse` | intra_community | 3 |
| `GetAll → ToRoleResponse` | intra_community | 3 |

## How to Explore

1. `gitnexus_context({name: "getUsers"})` — see callers and callees
2. `gitnexus_query({query: "controller"})` — find related execution flows
3. Read key files listed above for implementation details
