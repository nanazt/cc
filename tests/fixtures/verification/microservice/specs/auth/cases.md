# Auth Cases

Last consolidated: Phase 3 (2026-01-15)

## Component Rules
CR-1: All tokens expire after configured TTL (Source: Phase 3)

## Auth.Login
### Operation Rules
OR-1: Rate limited to 10 attempts per minute per IP (Source: Phase 3)
### Side Effects
- Emits login event on success
### Cases
| Type | # | When | Then | Expected Outcome |
|------|---|------|------|-----------------|
| S | 1 | Valid credentials | Login | Session token returned |
| F | 1 | Invalid credentials | Login | invalid_credentials (InvalidCredentials) |

## Auth.RefreshToken
### Operation Rules
OR-1: Refresh token single-use -- invalidated after use (Source: Phase 3)
### Cases
| Type | # | When | Then | Expected Outcome |
|------|---|------|------|-----------------|
| S | 1 | Valid refresh token | RefreshToken | New session token returned |
| F | 1 | Expired refresh token | RefreshToken | token_expired (TokenExpired) |
