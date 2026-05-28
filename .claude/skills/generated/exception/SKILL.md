---
name: exception
description: "Skill for the Exception area of UEIMS_Project. 10 symbols across 4 files."
---

# Exception

10 symbols | 4 files | Cohesion: 100%

## When to Use

- Working with code in `ueims/`
- Understanding how ApiResponse, ApiResponse, handlingRuntimeException work
- Modifying exception-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `ueims/src/main/java/com/swp/ueims/exception/GlobalExceptionHandler.java` | handlingRuntimeException, handlingAppException, handlingValidation, mapAttribute |
| `ueims_backend/src/main/java/com/ueims/exception/GlobalExceptionHandler.java` | handlingRuntimeException, handlingAppException, handlingValidation, mapAttribute |
| `ueims/src/main/java/com/swp/ueims/dto/request/ApiResponse.java` | ApiResponse |
| `ueims_backend/src/main/java/com/ueims/dto/response/ApiResponse.java` | ApiResponse |

## Entry Points

Start here when exploring this area:

- **`ApiResponse`** (Class) — `ueims/src/main/java/com/swp/ueims/dto/request/ApiResponse.java:7`
- **`ApiResponse`** (Class) — `ueims_backend/src/main/java/com/ueims/dto/response/ApiResponse.java:7`
- **`handlingRuntimeException`** (Method) — `ueims/src/main/java/com/swp/ueims/exception/GlobalExceptionHandler.java:23`
- **`handlingAppException`** (Method) — `ueims/src/main/java/com/swp/ueims/exception/GlobalExceptionHandler.java:34`
- **`handlingValidation`** (Method) — `ueims/src/main/java/com/swp/ueims/exception/GlobalExceptionHandler.java:56`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `ApiResponse` | Class | `ueims/src/main/java/com/swp/ueims/dto/request/ApiResponse.java` | 7 |
| `ApiResponse` | Class | `ueims_backend/src/main/java/com/ueims/dto/response/ApiResponse.java` | 7 |
| `handlingRuntimeException` | Method | `ueims/src/main/java/com/swp/ueims/exception/GlobalExceptionHandler.java` | 23 |
| `handlingAppException` | Method | `ueims/src/main/java/com/swp/ueims/exception/GlobalExceptionHandler.java` | 34 |
| `handlingValidation` | Method | `ueims/src/main/java/com/swp/ueims/exception/GlobalExceptionHandler.java` | 56 |
| `mapAttribute` | Method | `ueims/src/main/java/com/swp/ueims/exception/GlobalExceptionHandler.java` | 87 |
| `handlingRuntimeException` | Method | `ueims_backend/src/main/java/com/ueims/exception/GlobalExceptionHandler.java` | 23 |
| `handlingAppException` | Method | `ueims_backend/src/main/java/com/ueims/exception/GlobalExceptionHandler.java` | 34 |
| `handlingValidation` | Method | `ueims_backend/src/main/java/com/ueims/exception/GlobalExceptionHandler.java` | 56 |
| `mapAttribute` | Method | `ueims_backend/src/main/java/com/ueims/exception/GlobalExceptionHandler.java` | 87 |

## How to Explore

1. `gitnexus_context({name: "ApiResponse"})` — see callers and callees
2. `gitnexus_query({query: "exception"})` — find related execution flows
3. Read key files listed above for implementation details
