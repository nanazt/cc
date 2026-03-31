<!-- Example: Microservice backend (e.g., SaaS platform, API service) -->
# Consolidation Schema

A component is the smallest independently specifiable unit in your project.

## Meta

| Key | Value |
|-----|-------|
| version | 1 |
| rule-prefix | CR |
| e2e-flows | true |

## Components

| Component | Description | Type |
|-----------|-------------|------|
| auth | Authentication, session management, and token lifecycle | api-gateway |
| user | User profiles, account settings, and preferences | |
| notification | Message delivery across email, push, and in-app channels | |
| billing | Subscription management, payment processing, and invoicing | |

## Sections: default

### Context Sections
1. **Overview** -- What this component does and why it exists
2. **Public Interface** -- Operations, commands, endpoints, or API surface this component exposes to consumers
3. **Domain Model** -- Entities, types, and data structures this component owns
4. **Behavior Rules** -- Business rules, constraints, and invariants governing this component's behavior
5. **Error Handling** -- Error categories, failure modes, and recovery strategies
6. **Dependencies** -- What this component requires from other components or external systems
7. **Configuration** -- Environment variables, feature flags, and tunable parameters

### Conditional Sections
- **State Lifecycle** -- Include when: component manages stateful entities with lifecycle transitions
- **Event Contracts** -- Include when: component produces or consumes events/messages

## Sections: api-gateway

### Context Sections
1. **Overview** -- What this gateway component does and why it exists
2. **Public Interface** -- Routes, middleware chains, and API surface exposed to external consumers
3. **Authentication** -- Token validation, session management, and identity resolution
4. **Rate Limiting** -- Throttling rules, quota management, and abuse prevention
5. **Error Handling** -- Error response formats, status code mapping, and client-facing error contracts
6. **Dependencies** -- Upstream services, identity providers, and external integrations
7. **Configuration** -- Environment variables, feature flags, and tunable parameters
