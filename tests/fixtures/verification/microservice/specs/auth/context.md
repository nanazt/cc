# Auth Spec

Last consolidated: Phase 3 (2026-01-15)

> Component rules (CR-XX) defined in cases.md. Referenced, not duplicated.

## Overview
Authentication gateway handling token validation and session management.

## Public Interface
| Route | Operation | Auth |
|-------|-----------|------|
| POST /login | Auth.Login | public |
| POST /refresh | Auth.RefreshToken | authenticated |

## Authentication
Token validation via JWT with configurable expiry.

## Rate Limiting
10 requests per minute per IP on login endpoint.

## Error Handling
- invalid_credentials (InvalidCredentials) -- returned when login fails
- token_expired (TokenExpired) -- returned on expired JWT

## Dependencies
- **billing** -- payment processing for premium account upgrades

## Configuration
JWT_SECRET, TOKEN_EXPIRY_SECONDS environment variables.
