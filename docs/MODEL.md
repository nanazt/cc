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

All components use the same section structure. Per-component section overrides are deferred; implement the 7+2 default first.

### Context Sections

Every `specs/{component}/context.md` file contains these 7 mandatory sections. The guide text tells the consolidation agent what to include in each section.

1. **Overview** -- What this component does and why it exists
2. **Public Interface** -- Operations, commands, endpoints, or API surface this component exposes to consumers
3. **Domain Model** -- Entities, types, and data structures this component owns
4. **Behavior Rules** -- Business rules, constraints, and invariants governing this component's behavior
5. **Error Handling** -- Error categories, failure modes, and recovery strategies
6. **Dependencies** -- What this component requires from other components or external systems
7. **Configuration** -- Environment variables, feature flags, and tunable parameters

Guide text style is **descriptive** (enumerates examples: "Operations, commands, endpoints, or API surface..."). Descriptive guide text helps LLM agents scope section content accurately.

### Conditional Sections

These sections are included or excluded by the consolidation agent based on natural language evaluation of phase documents. See [Conditional Section Evaluation](#conditional-section-evaluation) for evaluation criteria and decision logging rules.

- **State Lifecycle** -- Include when: component manages stateful entities with lifecycle transitions
- **Event Contracts** -- Include when: component produces or consumes events/messages

### Neutrality Validation

All 7 mandatory sections produce meaningful content for web service, CLI tool, and library project types. Conditional sections appropriately skip for stateless or eventless components. See `docs/examples/` for concrete proof across 3 project types.

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

This format is **not configurable via schema**. It is a fixed convention that works universally across all project types.

---

## Cases Format

The `specs/{component}/cases.md` file format is unchanged from v1.

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

---

## Schema Format

Each host project has one schema file at `.planning/consolidation.schema.md`. This file is human-readable Markdown with tables and is machine-parseable by the Phase 10 schema system.

### Schema Structure

A complete schema file:

```markdown
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
| auth | Authentication and session management |
| user | User profile and account operations |

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
```

### Meta Fields

| Key | Type | Default | Description |
|---|---|---|---|
| version | integer | 1 | Schema format version. Future versions may add new fields. |
| rule-prefix | string | CR | Prefix for component-level rules. Default "CR" (Component Rule). |
| e2e-flows | boolean | false | When true, enables cross-component E2E flow generation. Projects without cross-component communication should leave this false. |

No `specs-dir` or `operation-prefix` meta fields exist. The `specs/` directory location and `{Component}.{Operation}` naming format are fixed conventions, not configurable.

### Parsing Rules

Phase 10 implementers use these rules to parse the schema file:

1. **Meta section:** The `## Meta` heading identifies the meta section. The table below it contains key-value pairs (Key column, Value column). Parse each row as `key = value`.

2. **Components section:** The `## Components` heading identifies the component registry. Each row in the table below it defines one component. The table must have at least `Component` and `Description` columns. Additional columns are ignored.

3. **Sections block:** The `## Sections: default` heading identifies the default section structure. The `### Context Sections` numbered list defines mandatory sections in order. The `### Conditional Sections` bullet list defines conditional sections with their inclusion conditions.

4. **Missing `## Meta` section:** Use defaults: version=1, rule-prefix=CR, e2e-flows=false.

5. **Missing `## Sections: default` section:** Use the built-in default (the 7+2 sections defined in this specification).

6. **Empty `## Components` table:** Valid schema state. Consolidation prompts for component discovery when the Components table has no rows.

7. **Section heading matching:** Compare headings case-insensitively. `## Meta`, `## meta`, and `## META` are equivalent. Section names in the Components table are stored as declared (case is preserved).

---

## Component Discovery

When `/consolidate` runs, it identifies which components are affected by the current phase using a 2-stage algorithm.

### Discovery Algorithm

1. **Primary: CASES.md heading scan.** Extract component names from `## {Component}.{Operation}` headings in the phase CASES.md. Implementation: string parsing -- split on `.`, take the first segment. Collect unique values. Accuracy: high (cases.md is machine-produced by the /case workflow).

2. **Fallback: CONTEXT.md scan.** When CASES.md is absent or empty, scan CONTEXT.md for component references matched against the schema Components table. Implementation: agent inference -- compare text against known component names. Accuracy: lower than stage 1.

3. **On miss:** If both stages yield zero components, prompt the developer: "No components detected. Which components does this phase affect?"

### Schema Authority

The schema is the authoritative component registry.

- Components discovered during consolidation that are not in the schema trigger an "Add to schema?" prompt: `Component '{name}' not in schema. Add it?`
- On confirmation, the new component is added to the schema's `## Components` table.
- Schema grows automatically during consolidation. Deletion and rename detection are deferred to Phase 11 (orchestrator implementation).
- All schema changes proposed during a consolidation run are reviewed at the confirmation step before any files are written.

---

## Conditional Section Evaluation

The spec-consolidator agent evaluates natural language conditions from the schema against phase documents (CONTEXT.md, CASES.md) to determine whether each conditional section should be included or excluded.

### State Lifecycle

**Condition:** component manages stateful entities with lifecycle transitions

**Evidence for inclusion:** Phase documents mention state transitions (created/active/expired, draft/published/archived, pending/approved/rejected), entity status fields, lifecycle hooks, state machine references, or explicit lifecycle diagrams.

**Evidence for exclusion:** Component is stateless, processes requests without maintaining entity state, no status/state fields mentioned, purely functional transformation.

**Example include:** "CONTEXT.md describes order states: placed -> paid -> shipped -> delivered"

**Example exclude:** "Component is a pure data transformer with no persistent state"

### Event Contracts

**Condition:** component produces or consumes events/messages

**Evidence for inclusion:** Phase documents mention event emission, message queues, pub/sub patterns, webhooks, event handlers, listeners, callbacks triggered by external events, or async message passing.

**Evidence for exclusion:** Component operates synchronously with no event production or consumption, uses only request/response patterns, no mention of queues or async messaging.

**Example include:** "CASES.md mentions 'emits UserCreated event after registration'"

**Example exclude:** "CLI command reads input, processes, writes output -- no events"

### Decision Logging

Inclusion and exclusion decisions are logged as HTML comments in the spec file. This serves two purposes: traceability and chain-of-thought accuracy improvement for the agent.

**Format for inclusion** (comment placed immediately before the section heading):

```markdown
<!-- State Lifecycle: Included -- CONTEXT.md mentions session state transitions: created -> active -> expired -->
## State Lifecycle
```

**Format for exclusion** (comment placed at end of context.md when section is omitted):

```markdown
<!-- Event Contracts: Excluded -- No event production or consumption patterns found in phase documents -->
```

Future conditional sections are added by updating cckit's default schema definition. Host project users can also add or remove conditional sections in their own `.planning/consolidation.schema.md` file.

---

## Merge Rules

These rules govern how phase CASES.md content is merged into `specs/{component}/cases.md` and how phase CONTEXT.md content is merged into `specs/{component}/context.md`.

### Terminology Mapping from v1

| Rule | Old Term | New Term |
|---|---|---|
| 1 | `{Service}.{Op}` heading format | `{Component}.{Op}` heading format |
| 2 | PR to SR promotion | PR to CR promotion |
| 8 | "template sections" | "schema-defined sections" |

### Rules

1. **Operation-level replacement.** When a later phase re-specifies an operation (same `{Component}.{Op}` heading), the entire operation section (rules, side effects, cases table) replaces the prior version in the consolidated spec. No case-level merge -- the /case workflow produces complete per-operation specs.

2. **PR to CR promotion.** All Phase Rules (PR-N) from the source phase CASES.md are mechanically promoted to Component Rules (CR-N) in the consolidated `cases.md`. This is a mechanical rename -- no judgment, no filtering. Renumber sequentially from the highest existing CR number + 1 to avoid CR-N collisions.

3. **TR exclusion.** Temp Rules (TR-N) from the source phase CASES.md are skipped entirely. They never enter specs/. If the source CASES.md has no TR section, this rule is a no-op.

4. **R to OR transformation.** Operation Rules labeled `R-N` in the source CASES.md are renamed to `OR-N` in the consolidated output. This is a consolidation-time output transformation -- the source CASES.md is never modified.

5. **GR reference only.** Global Rules (GR-XX, defined in PROJECT.md) are referenced with `See GR-XX` notation. Never duplicated into specs/.

6. **Superseded operations.** For each entry in the Superseded Operations table, remove the old operation section from the existing spec. The Replacement column is for developer reference and verifier cross-checking only -- the consolidator's job is to remove the old operation.

7. **Superseded rules.** For each entry in the Superseded Rules table, skip the referenced PR during CR promotion. The Phase+ID reference enables fully mechanical skip -- no semantic matching needed.

8. **Section-level rewrite for context.md.** For each schema-defined section in context.md, if the new phase has content for that section, rewrite the entire section with merged content (latest wins). If the new phase has no content for a section, leave the existing section unchanged.

9. **Provenance.** Every rule and significant decision entry includes `(Source: Phase {id})` or `(Source: Phase {id} D-{n})` inline provenance.

10. **Forward Concerns exclusion.** Forward Concerns from CASES.md are never consolidated into specs/. They remain in phase CASES.md only.

11. **Exclusions from specs/.** Infrastructure setup, testing strategy, discussion rationale, research findings, and planning artifacts (task decomposition, execution order) are never consolidated into specs/.

---

## Bootstrapping

When `/consolidate` runs and no schema file exists at `.planning/consolidation.schema.md`:

1. The orchestrator prompts (recommended wording, not exact): `"No consolidation schema found at .planning/consolidation.schema.md. Create a starter schema now?"`

2. On confirmation: generate a default schema file with:
   - Empty `## Components` table (user adds their components)
   - Default Meta values: version=1, rule-prefix=CR, e2e-flows=false
   - The default 7+2 section structure in `## Sections: default`

3. On decline: abort consolidation with message: `"Consolidation schema required. Create .planning/consolidation.schema.md to proceed."`

The generated starter schema is equivalent to the examples in `docs/examples/`. Component declarations are left empty; the user fills them in before the next consolidation run, or the discovery algorithm prompts for them automatically.

---

## Output Structure

Consolidation writes output to:

- `specs/{component}/context.md` -- component context spec (mandatory sections + applicable conditional sections)
- `specs/{component}/cases.md` -- component operation cases
- `specs/INDEX.md` -- registry of all consolidated components

Component directory names use the component name as declared in the schema (lowercase, hyphenated if multi-word). Example: component "User Profile" -> `specs/user-profile/`.

Each spec file begins with a header:

```
Last consolidated: Phase {id} (YYYY-MM-DD)
```

### INDEX.md Format

| Component | Type | Description |
|---|---|---|
| auth | (optional) | Authentication and session management |
| user | (optional) | User profile and account operations |

The `Type` column is optional. Components without a declared type leave it blank. The heading "Component" (not "Service") is used throughout.

---

## Examples

Starter schema examples demonstrating this model for different project types are provided in `docs/examples/`. Each example instantiates every concept in this specification for a specific project type.

- `docs/examples/schema-microservice.md` -- Backend microservice project with multiple services, E2E flows enabled
- `docs/examples/schema-cli.md` -- CLI application with command groups, no E2E flows
- `docs/examples/schema-library.md` -- Reusable library, stateless components, no E2E flows

These examples serve as the neutrality validation artifacts for MODEL-05. Each mandatory section appears with project-type-specific content, demonstrating that the 7+2 default works without modification for any project type.
