---
name: entity
description: "Skill for the Entity area of UEIMS_Project. 10 symbols across 10 files."
---

# Entity

10 symbols | 10 files | Cohesion: 80%

## When to Use

- Working with code in `ueims_backend/`
- Understanding how FinalGrade, User, Semester work
- Modifying entity-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `ueims_backend/src/main/java/com/ueims/controller/FinalGradeController.java` | create |
| `ueims_backend/src/main/java/com/ueims/model/entity/FinalGrade.java` | FinalGrade |
| `ueims_backend/src/main/java/com/ueims/model/entity/User.java` | User |
| `ueims_backend/src/main/java/com/ueims/service/FinalGradeService.java` | save |
| `ueims_backend/src/main/java/com/ueims/service/impl/FinalGradeServiceImpl.java` | save |
| `ueims_backend/src/main/java/com/ueims/controller/TrainingWarningController.java` | create |
| `ueims_backend/src/main/java/com/ueims/model/entity/Semester.java` | Semester |
| `ueims_backend/src/main/java/com/ueims/model/entity/TrainingWarning.java` | TrainingWarning |
| `ueims_backend/src/main/java/com/ueims/service/TrainingWarningService.java` | save |
| `ueims_backend/src/main/java/com/ueims/service/impl/TrainingWarningServiceImpl.java` | save |

## Entry Points

Start here when exploring this area:

- **`FinalGrade`** (Class) — `ueims_backend/src/main/java/com/ueims/model/entity/FinalGrade.java:9`
- **`User`** (Class) — `ueims_backend/src/main/java/com/ueims/model/entity/User.java:10`
- **`Semester`** (Class) — `ueims_backend/src/main/java/com/ueims/model/entity/Semester.java:12`
- **`TrainingWarning`** (Class) — `ueims_backend/src/main/java/com/ueims/model/entity/TrainingWarning.java:8`
- **`create`** (Method) — `ueims_backend/src/main/java/com/ueims/controller/FinalGradeController.java:32`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `FinalGrade` | Class | `ueims_backend/src/main/java/com/ueims/model/entity/FinalGrade.java` | 9 |
| `User` | Class | `ueims_backend/src/main/java/com/ueims/model/entity/User.java` | 10 |
| `Semester` | Class | `ueims_backend/src/main/java/com/ueims/model/entity/Semester.java` | 12 |
| `TrainingWarning` | Class | `ueims_backend/src/main/java/com/ueims/model/entity/TrainingWarning.java` | 8 |
| `create` | Method | `ueims_backend/src/main/java/com/ueims/controller/FinalGradeController.java` | 32 |
| `save` | Method | `ueims_backend/src/main/java/com/ueims/service/FinalGradeService.java` | 12 |
| `save` | Method | `ueims_backend/src/main/java/com/ueims/service/impl/FinalGradeServiceImpl.java` | 28 |
| `create` | Method | `ueims_backend/src/main/java/com/ueims/controller/TrainingWarningController.java` | 32 |
| `save` | Method | `ueims_backend/src/main/java/com/ueims/service/TrainingWarningService.java` | 12 |
| `save` | Method | `ueims_backend/src/main/java/com/ueims/service/impl/TrainingWarningServiceImpl.java` | 28 |

## How to Explore

1. `gitnexus_context({name: "FinalGrade"})` — see callers and callees
2. `gitnexus_query({query: "entity"})` — find related execution flows
3. Read key files listed above for implementation details
