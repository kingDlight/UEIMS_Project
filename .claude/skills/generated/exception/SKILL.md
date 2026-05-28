---
name: exception
description: "Skill for the Exception area of UEIMS_Project. 6 symbols across 3 files."
---

# Exception

6 symbols | 3 files | Cohesion: 100%

## When to Use

- Working with code in `ueims_backend/`
- Understanding how ApiResponse, getErrorCode, handlingRuntimeException work
- Modifying exception-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `ueims_backend/src/main/java/com/ueims/exception/GlobalExceptionHandler.java` | handlingRuntimeException, handlingAppException, handlingValidation, mapAttribute |
| `ueims_backend/src/main/java/com/ueims/dto/response/ApiResponse.java` | ApiResponse |
| `ueims_backend/src/main/java/com/ueims/exception/AppException.java` | getErrorCode |

## Entry Points

Start here when exploring this area:

- **`ApiResponse`** (Class) — `ueims_backend/src/main/java/com/ueims/dto/response/ApiResponse.java:7`
- **`getErrorCode`** (Method) — `ueims_backend/src/main/java/com/ueims/exception/AppException.java:11`
- **`handlingRuntimeException`** (Method) — `ueims_backend/src/main/java/com/ueims/exception/GlobalExceptionHandler.java:23`
- **`handlingAppException`** (Method) — `ueims_backend/src/main/java/com/ueims/exception/GlobalExceptionHandler.java:34`
- **`handlingValidation`** (Method) — `ueims_backend/src/main/java/com/ueims/exception/GlobalExceptionHandler.java:56`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `ApiResponse` | Class | `ueims_backend/src/main/java/com/ueims/dto/response/ApiResponse.java` | 7 |
| `getErrorCode` | Method | `ueims_backend/src/main/java/com/ueims/exception/AppException.java` | 11 |
| `handlingRuntimeException` | Method | `ueims_backend/src/main/java/com/ueims/exception/GlobalExceptionHandler.java` | 23 |
| `handlingAppException` | Method | `ueims_backend/src/main/java/com/ueims/exception/GlobalExceptionHandler.java` | 34 |
| `handlingValidation` | Method | `ueims_backend/src/main/java/com/ueims/exception/GlobalExceptionHandler.java` | 56 |
| `mapAttribute` | Method | `ueims_backend/src/main/java/com/ueims/exception/GlobalExceptionHandler.java` | 87 |

## How to Explore

1. `gitnexus_context({name: "ApiResponse"})` — see callers and callees
2. `gitnexus_query({query: "exception"})` — find related execution flows
3. Read key files listed above for implementation details
