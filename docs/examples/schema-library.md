<!-- Example: Reusable library (e.g., compiler library, data processing SDK) -->
# Consolidation Schema

A component is the smallest independently specifiable unit in your project.

## Meta

| Key | Value |
|-----|-------|
| version | 1 |
| rule-prefix | CR |
| e2e-flows | false |

## Components

| Component | Description |
|-----------|-------------|
| parser | Input parsing and AST construction |
| transformer | AST transformation and optimization passes |
| emitter | Output code generation and serialization |
| plugin | Plugin discovery, loading, and lifecycle management |

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
