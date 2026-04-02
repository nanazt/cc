# Phase 9: Universal Model Design - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-31
**Phase:** 09-universal-model-design
**Areas discussed:** Default section list, Rule/operation naming, Schema file structure, Conditional section mechanism, Phase 9 deliverables, Component discovery, v1 code impact, Merge rules

---

## Default Section List

### Section count direction

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal (5+α) | STACK-based. 5 mandatory + 2-3 conditional. | |
| Detailed (7+1) | FEATURES-based. 7 mandatory + 1 conditional. | ✓ |
| Compromise (6+2) | 5 + Domain Model mandatory = 6. Error Handling conditional. | |

**User's choice:** 7 mandatory
**Notes:** User wanted more structure provided by default.

### Section names

| Option | Description | Selected |
|--------|-------------|----------|
| FEATURES proposal | Overview, Public Interface, Domain Model, Behavior Rules, Error Handling, Dependencies, Configuration | ✓ |
| STACK proposal | Purpose, Interface, Domain Model, Rules, Error Handling, Dependencies, Configuration | |
| Mixed | Overview, Interface, Domain Model, Rules, Error Handling, Dependencies, Configuration | |

**User's choice:** FEATURES proposal
**Notes:** Modifiers ("Public", "Behavior") serve as scope guidance for LLM agents. "Public Interface" distinguishes from internal implementation; "Behavior Rules" excludes technical/coding rules.

### Conditional sections

| Option | Description | Selected |
|--------|-------------|----------|
| State Lifecycle only | 1 conditional section | |
| State Lifecycle + Event Contracts | 2 conditional sections | ✓ |
| No conditionals | 7 mandatory only, overrides for the rest | |

**User's choice:** State Lifecycle + Event Contracts
**Notes:** Both cover distinct project needs (stateful entities vs event/message systems).

### Guide text style

| Option | Description | Selected |
|--------|-------------|----------|
| Descriptive | Enumerates examples: "Operations, commands, endpoints, or API surface..." | ✓ |
| Terse | Core phrase only: "Exposed operations and contracts" | |
| Question-based | "What operations does this component expose?" | |

**User's choice:** Descriptive
**Notes:** User noted "LLM이 잘 따를 수 있는게 좋음" — descriptive style with explicit examples helps agents scope content accurately.

### Neutrality test + cases.md format

**User's choice:** Approved neutrality test results (3 project types) and v1 cases.md format.

---

## Rule/Operation Naming

### SR replacement

| Option | Description | Selected |
|--------|-------------|----------|
| UR (Unit Rule) | Matches "unit" terminology | |
| SR = Spec Rule | Abbreviation unchanged, full name changes | |
| CR (Component Rule) | Matches "component" user-facing terminology | ✓ |

**User's choice:** CR (Component Rule)
**Notes:** "unit" evokes "unit test" — feels like smallest possible unit. "Component" is more intuitive for the consolidation concept.

### Operation naming format

| Option | Description | Selected |
|--------|-------------|----------|
| {Component}.{Operation} fixed | Not configurable. All projects use dot notation. | ✓ |
| Schema-configurable | operation-prefix meta field allows alternatives. | |

**User's choice:** Fixed format

### Component vs unit terminology

| Option | Description | Selected |
|--------|-------------|----------|
| All "component" | Schema, dispatch, user-facing — all use "component" | ✓ |
| Split (user=component, internal=unit) | Different terms for different audiences | |

**User's choice:** All "component" unified
**Notes:** User preferred consistency over brevity. Schema explanation at top prevents confusion.

### PR → CR promotion

| Option | Description | Selected |
|--------|-------------|----------|
| Mechanical (same as v1) | PR unconditionally promotes to CR. No filtering. | ✓ |
| Modified | Some change to promotion logic. | |

**User's choice:** Mechanical, identical to v1

---

## Schema File Structure

### Schema format

| Option | Description | Selected |
|--------|-------------|----------|
| Markdown schema file | Meta + Components table + Sections definition | ✓ |
| YAML/JSON schema | Structured data format | |
| Template files | Markdown templates with filesystem convention | |

**User's choice:** Markdown schema file
**Notes:** Extended discussion about what the schema file is, its role in the pipeline, and the routing mechanism. User needed full-picture explanation before deciding.

### Per-component section overrides

| Option | Description | Selected |
|--------|-------------|----------|
| No overrides | All components use same 7+2 sections | ✓ |
| Overrides supported | Sections: {name} for specific components | |

**User's choice:** No overrides
**Notes:** User questioned why overrides were needed when sections are already universal. Agreed to defer until proven necessary.

### Schema file location

| Option | Description | Selected |
|--------|-------------|----------|
| .planning/consolidation.schema.md | Root of .planning/, alongside PROJECT.md | ✓ |
| .planning/specs/SCHEMA.md | Co-located with output | |

**User's choice:** .planning/consolidation.schema.md

### Bootstrapping

| Option | Description | Selected |
|--------|-------------|----------|
| Confirmation before creation | "No schema found. Create starter?" → confirm | ✓ |
| Auto-create | Silently generate | |
| Error + guide | Stop and tell user to create manually | |

**User's choice:** Confirmation before creation

### Meta fields

**Confirmed:** version, rule-prefix, e2e-flows only. No specs-dir.

### Starter examples

**Confirmed:** 3 examples (microservice, CLI tool, library).

---

## Conditional Section Mechanism

### Who decides inclusion

| Option | Description | Selected |
|--------|-------------|----------|
| Agent inference | Agent evaluates natural language conditions | ✓ |
| Schema flags | User declares per-component in Components table | |
| Agent + user confirmation | Agent decides, then asks user | |

**User's choice:** Agent inference
**Notes:** User initially questioned why user confirmation wasn't recommended. Explanation: consolidation flow interruption for low-stakes decisions (wrong inclusion/exclusion has near-zero cost, verification catches issues).

### Condition text

**Confirmed:**
- State Lifecycle: "component manages stateful entities with lifecycle transitions"
- Event Contracts: "component produces or consumes events/messages"

### Safety mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| None needed | Verification catches issues | |
| Logging | HTML comments with reasoning | ✓ |

**User's choice:** Logging
**Notes:** User agreed with chain-of-thought accuracy improvement argument.

### Future conditional section policy

**Confirmed:** Update cckit default schema. Users can also modify their own schema.

---

## Additional Areas

### Phase 9 deliverables

**Confirmed:** docs/MODEL.md + docs/examples/ (3 files). No code changes. IMPL-SPEC rewrite is Phase 11.

### Component discovery

**Confirmed:** 2-stage discovery (CASES.md headings → CONTEXT.md scan) with schema as authority. New components trigger "Add to schema?" prompt.

### Schema synchronization

**Decision:** Direction only (schema is authority, grows automatically). Deletion/rename details deferred to Phase 11.
**Notes:** User pointed out that detailed sync strategy (like merge rules) may be premature at the model design phase.

### Merge rules

**Confirmed:** All 11 rules carry over. Only terminology changes (3 of 11).

### /case skill

**Confirmed:** Phase 12 handles /case changes. Phase 9 only establishes vocabulary (component, CR).

---

## Claude's Discretion

- Internal structure of docs/MODEL.md
- Exact content of starter schema examples
- Schema format specification organization
- Bootstrapping prompt wording

## Deferred Ideas

- Per-component section overrides — until need is proven
- Schema sync details (deletion, rename) — Phase 11
- Template inheritance — per research recommendation
- Operation prefix configurability — fixed for now
- IMPL-SPEC rewrite — Phase 11
- /case changes — Phase 12
