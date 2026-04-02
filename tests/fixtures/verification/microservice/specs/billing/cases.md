# Billing Cases

Last consolidated: Phase 3 (2026-01-15)

## Component Rules
CR-1: All subscription changes logged with timestamp (Source: Phase 3)

## Billing.CreateSubscription
### Operation Rules
OR-1: Payment method must be verified before subscription creation (Source: Phase 3)
### Cases
| Type | # | When | Then | Expected Outcome |
|------|---|------|------|-----------------|
| S | 1 | Valid payment method | Create subscription | Subscription active, first charge processed |
| F | 1 | Invalid payment method | Create subscription | payment_failed (PaymentFailed) |

## Billing.CancelSubscription
### Operation Rules
OR-1: Cancellation effective at end of current billing period (Source: Phase 3)
### Cases
| Type | # | When | Then | Expected Outcome |
|------|---|------|------|-----------------|
| S | 1 | Active subscription | Cancel | Cancellation scheduled for period end |
| F | 1 | Unknown subscription ID | Cancel | subscription_not_found (SubscriptionNotFound) |
