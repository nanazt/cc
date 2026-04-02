# Phase 9: Universal Model Design - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Define the project-type-agnostic consolidation model: what a "component" is, how components are declared, what sections specs contain, naming conventions, and meta configuration. This phase produces the conceptual foundation — all downstream phases (schema system, pipeline, /case, verification, flows) build on these decisions.

**Deliverables:** `docs/MODEL.md` (model specification), `docs/examples/` (3 starter schema examples). No code changes.

</domain>

<decisions>
## Implementation Decisions

### Default section list
- **D-01:** 7 mandatory sections + 2 conditional sections for `context.md`.
- **D-02:** Mandatory sections (FEATURES proposal, descriptive guide style):
  1. **Overview** — What this component does and why it exists
  2. **Public Interface** — Operations, commands, endpoints, or API surface this component exposes to consumers
  3. **Domain Model** — Entities, types, and data structures this component owns
  4. **Behavior Rules** — Business rules, constraints, and invariants governing this component's behavior
  5. **Error Handling** — Error categories, failure modes, and recovery strategies
  6. **Dependencies** — What this component requires from other components or external systems
  7. **Configuration** — Environment variables, feature flags, and tunable parameters
- **D-03:** Conditional sections:
  - **State Lifecycle** — Include when: component manages stateful entities with lifecycle transitions
  - **Event Contracts** — Include when: component produces or consumes events/messages
- **D-04:** Neutrality test passed for web service, CLI tool, and library project types. All 7 mandatory sections produce meaningful content in all 3 types; conditional sections appropriately skip for stateless/eventless components.
- **D-05:** Guide text style is descriptive (enumerates examples: "Operations, commands, endpoints, or API surface...") to help LLM agents scope section content accurately.
- **D-06:** cases.md format is unchanged from v1: per-operation sections with `## {Component}.{Operation}` headings, Rules (CR-N, OR-N), Side Effects, and S/F/E Cases table.

### Rule and operation naming
- **D-07:** SR (Service Rule) renamed to **CR (Component Rule)**. Abbreviation changes from SR-N to CR-N. All other prefixes unchanged: GR-XX (Global), OR-N (Operation), PR-N (Phase), TR-N (Temp).
- **D-08:** Rationale: "unit" evokes "unit test" (smallest unit), feels too granular. "Component" matches user-facing vocabulary and is intuitive across project types.
- **D-09:** PR → CR mechanical promotion — identical to v1's PR → SR, only the target prefix changes. No filtering; consolidator does not make judgment calls.
- **D-10:** Operation naming format **`{Component}.{Operation}`** is fixed (not configurable via schema). Works universally: Auth.Login, CLI.Init, Parser.Tokenize, GettingStarted.QuickStart.
- **D-11:** Full rule prefix system:

  | Prefix | Full Name | Scope |
  |--------|-----------|-------|
  | GR-XX | Global Rule | Project-wide |
  | CR-N | Component Rule | Component (replaces SR) |
  | OR-N | Operation Rule | Operation |
  | PR-N | Phase Rule | Phase (promotes to CR at consolidation) |
  | TR-N | Temp Rule | Phase (excluded from specs) |

### Terminology
- **D-12:** **"component" unified everywhere** — schema, dispatch, user-facing output, error messages, INDEX.md, all agent prompts. No internal/external split.
- **D-13:** Schema file explains terminology at the top: "A component is the smallest independently specifiable unit in your project."

### Schema file structure
- **D-14:** Schema approach confirmed: **Option B (schema file)** per research recommendation. Single user-authored `.planning/consolidation.schema.md` per host project.
- **D-15:** Schema location: `.planning/consolidation.schema.md` (input file alongside PROJECT.md, ROADMAP.md in the .planning/ root).
- **D-16:** No per-component section overrides. All components use the same 7+2 section structure. Override mechanism deferred until need is proven.
- **D-17:** Meta fields (3 only):

  | Key | Value | Purpose |
  |-----|-------|---------|
  | version | 1 | Schema format version |
  | rule-prefix | CR | Component Rule prefix |
  | e2e-flows | false | Opt-in E2E flow generation |

- **D-18:** No `specs-dir` or `operation-prefix` meta fields. `specs/` is fixed; `{Component}.{Operation}` is fixed.
- **D-19:** Bootstrapping: confirmation before creation. When `/consolidate` runs and no schema exists → "No schema found. Create starter schema?" → developer confirms → generates default schema with empty Components table.
- **D-20:** 3 starter schema examples ship in `docs/examples/`: microservice, CLI tool, library.

### Component discovery
- **D-21:** 2-stage discovery with schema as authority:
  1. **Primary:** Extract component names from CASES.md `## {Component}.{Operation}` headings (string parsing, high accuracy).
  2. **Fallback:** When CASES.md is absent or empty, scan CONTEXT.md for component references matched against schema Components table (agent inference, lower accuracy).
  3. **On miss:** If both stages yield zero components, ask the developer.
- **D-22:** Schema is the authoritative component registry. Components not in schema trigger "Add to schema?" prompt.
- **D-23:** Schema synchronization direction only: schema grows automatically (new components detected during consolidation), deletion/rename details deferred to Phase 11 (orchestrator implementation). Schema changes reviewed at consolidation confirmation step.

### Conditional section mechanism
- **D-24:** Agent inference — spec-consolidator evaluates natural language conditions from schema ("Include when: component manages stateful entities with lifecycle transitions") against phase documents. No user flags or confirmation prompts.
- **D-25:** Inclusion/exclusion reasoning logged as HTML comments in spec files for traceability and chain-of-thought accuracy improvement.
  ```
  <!-- State Lifecycle: Included — CONTEXT.md mentions session state transitions: created → active → expired -->
  ```
- **D-26:** Future conditional sections added by updating cckit's default schema. Users can also add/remove conditional sections in their own schema.

### Merge rules
- **D-27:** All 11 v1 merge rules carry over unchanged in logic. Only terminology changes:
  - Rule 1: `{Service}.{Op}` → `{Component}.{Op}`
  - Rule 2: PR → SR promotion → PR → **CR** promotion
  - Rule 8: "archetype sections" → "schema-defined sections"

### Phase 9 deliverables
- **D-28:** `docs/MODEL.md` — model specification (concepts, section definitions, rule system, schema format, component discovery).
- **D-29:** `docs/examples/schema-microservice.md`, `docs/examples/schema-cli.md`, `docs/examples/schema-library.md` — starter schema examples for 3 project types.
- **D-30:** No code changes in Phase 9. IMPL-SPEC.md rewrite is Phase 11 (PIPE-06).

### Claude's Discretion
- Internal structure and organization of docs/MODEL.md
- Exact content of starter schema examples (within the decided model)
- Section ordering within the schema format specification
- Wording of bootstrapping prompts and error messages

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Model research
- `.planning/research/SUMMARY.md` — Executive summary of v2.0 research, critical design decision (schema file vs templates), gaps to address
- `.planning/research/ARCHITECTURE.md` — Schema file format specification, dispatch changes, rule tier renames, complete schema example
- `.planning/research/FEATURES.md` — Default template design (7+1 section proposal), feature landscape, anti-features, merge rule analysis
- `.planning/research/STACK.md` — Generic default template (5+3 section proposal), two-layer template system, merge rule changes

### Requirements
- `.planning/REQUIREMENTS.md` — MODEL-01 through MODEL-05: acceptance criteria for universal model

### Technology neutrality
- `CLAUDE.md` — "Technology Neutrality" section: default stance, exceptions, neutrality test

### Existing implementation (v1)
- `docs/IMPL-SPEC.md` — v1 design document. Hash tool section is current; all other sections will be rewritten in Phase 11
- `skills/consolidate/SKILL.md` — v1 orchestrator. Will be rewritten in Phase 11

### Prior phase context
- `.planning/phases/01-hash-tool/01-CONTEXT.md` — Hash tool decisions (carries over unchanged)
- `.planning/phases/02-templates/02-CONTEXT.md` — v1 template decisions (SUPERSEDED by this phase's universal model)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `tools/hash-sections.ts`: Already universal. No changes needed. Computes SHA-256/8 hashes for H2 sections in markdown files.
- `tools/hash-sections_test.ts`: 10 test cases, all passing. Test pattern can be referenced for future test fixtures.

### Established Patterns
- YAML frontmatter + Markdown body for skills and agents
- `{placeholder}` notation in templates for structural examples
- Technology-neutral language in guide text (role-based, not protocol-specific)
- `(conditional)` marker pattern for optional sections (Phase 2, now superseded by schema conditional mechanism)

### Integration Points
- `skills/consolidate/SKILL.md` (Phase 11): Will read schema file, dispatch with `<sections>` instead of `<template_type>`
- `agents/spec-consolidator.md` (Phase 11): Will receive explicit section list, use CR prefix
- `agents/case-briefer.md` (Phase 12): Will use "component topology" instead of "service topology"
- `agents/spec-verifier.md` (Phase 13): Will parameterize checks against schema

</code_context>

<specifics>
## Specific Ideas

- "component" was chosen over "unit" specifically because "unit" evokes "unit test" — feels like the smallest possible unit rather than a meaningful project part
- Guide text style is descriptive (enumerates examples) rather than terse or question-based, because LLM agents follow descriptive instructions most reliably
- Conditional section logging via HTML comments serves dual purpose: traceability AND chain-of-thought accuracy improvement for the agent
- Schema synchronization details (deletion, rename detection, confirmation UX) are intentionally deferred to Phase 11 — only the direction ("schema is authority, grows automatically") is decided here

</specifics>

<deferred>
## Deferred Ideas

- Per-component section overrides — deferred until proven necessary. All components use 7+2 for now.
- Schema synchronization details (deletion, rename) — deferred to Phase 11 (orchestrator implementation)
- Template inheritance/composition — deferred per research recommendation (wait for evidence flat files are insufficient)
- Operation prefix configurability (`module::function`, flat names) — deferred. `{Component}.{Operation}` fixed for now.
- IMPL-SPEC.md rewrite — Phase 11 (PIPE-06)
- /case skill changes — Phase 12 (CASE-01 through CASE-08)

</deferred>

---

*Phase: 09-universal-model-design*
*Context gathered: 2026-03-31*
