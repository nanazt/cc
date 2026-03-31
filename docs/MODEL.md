# Consolidation Model

Version: 1.0
Status: Specification
Applies to: cckit v2.0+

---

## Terminology

### Component

**Definition:** A component is the smallest independently specifiable unit in your project.

The word "component" is used everywhere: schema declarations, dispatch tags, user-facing output, error messages, `specs/INDEX.md`, and all agent prompts. There is no internal/external terminology split.

**What "component" means by project type:**

| Project Type | Component Examples |
|---|---|
| Microservice backend | auth, gateway, user, billing, notification |
| CLI tool | init command group, config subsystem, output formatter, plugin loader |
| Library / SDK | public API module, plugin interface, serialization layer, type definitions |
| Mobile app | authentication flow, offline sync engine, push notification handler |
| Desktop app | file manager, preferences system, plugin host, window manager |
| Game | combat system, inventory, save/load, AI controller |
| Documentation project | style guide, API reference, tutorial pipeline, changelog |
| System software | scheduler, memory allocator, device driver, network stack |
| Monolith (modules) | billing module, search module, notification module, admin panel |

**No predefined categories, no fixed type vocabulary.** The user names their components and the system accepts them. The schema holds the authoritative component registry (see [Schema Format](#schema-format)).

### Terminology Change from v1

| Old Term | New Term | Reason |
|---|---|---|
| Service | Component | "Service" implies a network process. "Component" is project-type-neutral. |
| Component Rule prefix: SR | Component Rule prefix: CR | Prefix semantically matches the universal model. |
| Fixed project-type categories | (removed) | v1 had three hardcoded project type categories. v2 has no fixed categories. |

---

## Default Section Structure

All components use the same section structure. Per-component section overrides are deferred (D-16); implement the 7+2 default first.

### Context Sections

Every `specs/{component}/context.md` file contains these 7 mandatory sections. The guide text tells the consolidation agent what to include in each section.

1. **Overview** -- What this component does and why it exists
2. **Public Interface** -- Operations, commands, endpoints, or API surface this component exposes to consumers
3. **Domain Model** -- Entities, types, and data structures this component owns
4. **Behavior Rules** -- Business rules, constraints, and invariants governing this component's behavior
5. **Error Handling** -- Error categories, failure modes, and recovery strategies
6. **Dependencies** -- What this component requires from other components or external systems
7. **Configuration** -- Environment variables, feature flags, and tunable parameters

Guide text style is **descriptive** (enumerates examples: "Operations, commands, endpoints, or API surface..."). Descriptive guide text helps LLM agents scope section content accurately (D-05).

### Conditional Sections

These sections are included or excluded by the consolidation agent based on natural language evaluation of phase documents. See [Conditional Section Evaluation](#conditional-section-evaluation) for evaluation criteria and decision logging rules.

- **State Lifecycle** -- Include when: component manages stateful entities with lifecycle transitions
- **Event Contracts** -- Include when: component produces or consumes events/messages

### Neutrality Validation

D-04 confirms that all 7 mandatory sections produce meaningful content for web service, CLI tool, and library project types. Conditional sections appropriately skip for stateless or eventless components. See `docs/examples/` for concrete proof across 3 project types.

---

## Rule System

### Rule Prefixes

| Prefix | Full Name | Scope | Lifecycle | Example |
|---|---|---|---|---|
| GR-XX | Global Rule | Project-wide | Defined in PROJECT.md; referenced in specs (never duplicated) | GR-01: All timestamps use UTC |
| CR-N | Component Rule | Single component | Promoted from PR at consolidation; permanent in specs | CR-1: Passwords require minimum 12 characters |
| OR-N | Operation Rule | Single operation | Defined per operation in cases.md | OR-1: Input email must be normalized to lowercase |
| PR-N | Phase Rule | Phase-scoped | Temporary; promotes to CR-N at consolidation | PR1: Rate limiting applies to all auth endpoints |
| TR-N | Temp Rule | Phase-scoped | Temporary; excluded from specs, never consolidated | TR1: Use mock SMTP during Phase 3 |

### Rule Prefix Changes from v1

The CR-N prefix replaces the old SR prefix. "Component Rule" is semantically accurate for the universal model; the prior "SR" prefix was tied to service-specific vocabulary.

### PR to CR Promotion

All Phase Rules (PR-N) promote to Component Rules (CR-N) at consolidation time. This is a mechanical rename -- no judgment, no filtering. The spec-consolidator agent:

1. Collects all PR-N entries from the phase CASES.md.
2. Renumbers them sequentially starting from the highest existing CR number + 1 to avoid CR-N collisions.
3. Writes the renamed rules into `specs/{component}/cases.md`.

This is identical to v1's PR-to-SR promotion. Only the target prefix changes.

### Operation Naming

Operations are named using the fixed format: `{Component}.{Operation}`

**Examples by project type:**

| Project Type | Operation Examples |
|---|---|
| Backend service | Auth.Login, Auth.Refresh, User.UpdateProfile |
| CLI tool | CLI.Init, CLI.Config, Output.Format |
| Library | Parser.Tokenize, Serializer.Encode, API.Query |
| Documentation | GettingStarted.QuickStart, Reference.Lookup |

This format is **not configurable via schema** (D-18). It is a fixed convention that works universally across all project types.

---

## Cases Format

The `specs/{component}/cases.md` file format is unchanged from v1 (D-06).

### Structure

Each operation occupies one section:

```
## {Component}.{Operation}

### Rules
- CR-N: {rule text} (Source: Phase {id})
- OR-N: {rule text} (Source: Phase {id})

### Side Effects
- {effect description}

### Cases

| Case | Input | Expected Output |
|------|-------|-----------------|
| S1: {success name} | {input} | {output} |
| F1: {failure name} | {input} | {output} |
| E1: {edge name} | {input} | {output} |
```

### Superseded Tables

When applicable, include these tables at the bottom of `cases.md`:

**Superseded Operations:**

| Old Operation | Replacement | Source Phase |
|---|---|---|
| Component.OldOp | Component.NewOp | Phase {id} |

**Superseded Rules:**

| Phase | Rule ID | Reason |
|---|---|---|
| {id} | PR-N | {why superseded} |
