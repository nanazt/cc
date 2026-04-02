# Billing Spec

Last consolidated: Phase 3 (2026-01-15)

> Component rules (CR-XX) defined in cases.md. Referenced, not duplicated.

## Overview
Subscription management and payment processing.

## Public Interface
Billing.CreateSubscription, Billing.CancelSubscription operations.

## Domain Model
Subscription entity with status lifecycle.

## Behavior Rules
Cancellation takes effect at end of billing period.

## Error Handling
- payment_failed (PaymentFailed) -- returned when charge fails
- subscription_not_found (SubscriptionNotFound) -- returned on invalid subscription ID

## Dependencies
Requires Auth component for caller identity.

## Configuration
STRIPE_API_KEY environment variable.
