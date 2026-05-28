---
name: configuration
description: "Skill for the Configuration area of UEIMS_Project. 4 symbols across 2 files."
---

# Configuration

4 symbols | 2 files | Cohesion: 100%

## When to Use

- Working with code in `ueims/`
- Understanding how filterChain, jwtAuthenticationConverter, filterChain work
- Modifying configuration-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `ueims/src/main/java/com/swp/ueims/configuration/SecurityConfig.java` | filterChain, jwtAuthenticationConverter |
| `ueims_backend/src/main/java/com/ueims/configuration/SecurityConfig.java` | filterChain, jwtAuthenticationConverter |

## Entry Points

Start here when exploring this area:

- **`filterChain`** (Method) — `ueims/src/main/java/com/swp/ueims/configuration/SecurityConfig.java:30`
- **`jwtAuthenticationConverter`** (Method) — `ueims/src/main/java/com/swp/ueims/configuration/SecurityConfig.java:60`
- **`filterChain`** (Method) — `ueims_backend/src/main/java/com/ueims/configuration/SecurityConfig.java:30`
- **`jwtAuthenticationConverter`** (Method) — `ueims_backend/src/main/java/com/ueims/configuration/SecurityConfig.java:60`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `filterChain` | Method | `ueims/src/main/java/com/swp/ueims/configuration/SecurityConfig.java` | 30 |
| `jwtAuthenticationConverter` | Method | `ueims/src/main/java/com/swp/ueims/configuration/SecurityConfig.java` | 60 |
| `filterChain` | Method | `ueims_backend/src/main/java/com/ueims/configuration/SecurityConfig.java` | 30 |
| `jwtAuthenticationConverter` | Method | `ueims_backend/src/main/java/com/ueims/configuration/SecurityConfig.java` | 60 |

## How to Explore

1. `gitnexus_context({name: "filterChain"})` — see callers and callees
2. `gitnexus_query({query: "configuration"})` — find related execution flows
3. Read key files listed above for implementation details
