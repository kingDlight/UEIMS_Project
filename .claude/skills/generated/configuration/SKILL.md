---
name: configuration
description: "Skill for the Configuration area of UEIMS_Project. 3 symbols across 2 files."
---

# Configuration

3 symbols | 2 files | Cohesion: 100%

## When to Use

- Working with code in `ueims_backend/`
- Understanding how JwtAuthenticationEntryPoint, filterChain, jwtAuthenticationConverter work
- Modifying configuration-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `ueims_backend/src/main/java/com/ueims/configuration/SecurityConfig.java` | filterChain, jwtAuthenticationConverter |
| `ueims_backend/src/main/java/com/ueims/configuration/JwtAuthenticationEntryPoint.java` | JwtAuthenticationEntryPoint |

## Entry Points

Start here when exploring this area:

- **`JwtAuthenticationEntryPoint`** (Class) — `ueims_backend/src/main/java/com/ueims/configuration/JwtAuthenticationEntryPoint.java:16`
- **`filterChain`** (Method) — `ueims_backend/src/main/java/com/ueims/configuration/SecurityConfig.java:30`
- **`jwtAuthenticationConverter`** (Method) — `ueims_backend/src/main/java/com/ueims/configuration/SecurityConfig.java:60`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `JwtAuthenticationEntryPoint` | Class | `ueims_backend/src/main/java/com/ueims/configuration/JwtAuthenticationEntryPoint.java` | 16 |
| `filterChain` | Method | `ueims_backend/src/main/java/com/ueims/configuration/SecurityConfig.java` | 30 |
| `jwtAuthenticationConverter` | Method | `ueims_backend/src/main/java/com/ueims/configuration/SecurityConfig.java` | 60 |

## How to Explore

1. `gitnexus_context({name: "JwtAuthenticationEntryPoint"})` — see callers and callees
2. `gitnexus_query({query: "configuration"})` — find related execution flows
3. Read key files listed above for implementation details
