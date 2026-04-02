# Spec Index

Last updated: 2026-01-15

## Components

| Component | Type | Description | Files | Last Consolidated |
|-----------|------|-------------|-------|-------------------|
| auth | api-gateway | Authentication and session management | [context](auth/context.md) [cases](auth/cases.md) | Phase 3 (2026-01-15) |
| billing | | Subscription and payment processing | [context](billing/context.md) [cases](billing/cases.md) | Phase 3 (2026-01-15) |

## E2E Flows

| Flow | Description | Components | File |
|------|-------------|------------|------|
| Auth-Billing Flow | User creates a premium subscription requiring authentication and billing | auth, billing | [auth-billing-flow](e2e/auth-billing-flow.md) |

## Operation Index

| Operation | Component | Cases Source | Phase |
|-----------|-----------|-------------|-------|
| Auth.Login | auth | [cases.md](auth/cases.md) | 3 |
| Auth.RefreshToken | auth | [cases.md](auth/cases.md) | 3 |
| Billing.CreateSubscription | billing | [cases.md](billing/cases.md) | 3 |
| Billing.CancelSubscription | billing | [cases.md](billing/cases.md) | 3 |
