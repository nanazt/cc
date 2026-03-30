# Architecture: Universal Consolidation Model

**Domain:** Claude Code multi-agent skill pipeline (plugin toolkit)
**Researched:** 2026-03-31
**Confidence:** HIGH (derived from complete analysis of existing codebase, IMPL-SPEC.md, and all skill/agent definitions)
**Supersedes:** Previous ARCHITECTURE.md (2026-03-30) which documented the v1 service-archetype model

## Executive Summary

The current IMPL-SPEC.md and ROADMAP are built entirely around a "service archetype" model: 3 fixed templates (domain-service, gateway-bff, event-driven), per-service directory output (`specs/{service}/`), `{Service}.{Op}` naming, and classification via PROJECT.md service topology table. This model works for backend microservice projects but fails the technology neutrality test: "Could a CLI tool project, a design system, a library, or a documentation project install this and use it without editing the plugin?"

The universal model replaces **fixed archetypes** with **user-defined consolidation units** and **user-defined section schemas**, while preserving the proven orchestrator-agent pipeline pattern and all merge/verification mechanics.

---

## Question 1: What Replaces Fixed Archetype Templates?

### Problem

The current design has 3 fixed template files:
- `templates/domain-service.md` (8 sections: Domain Model, Adapter Contracts, Business Rules, ...)
- `templates/gateway-bff.md` (7 sections: Route/Endpoint Table, Middleware Stack, ...)
- `templates/event-driven.md` (7 sections: Event Subscriptions, Event Publications, ...)

These encode backend-service assumptions into the plugin. A CLI tool has no "Route Table." A library has no "Event Subscriptions." A design system has no "Cross-Service Dependencies."

### Solution: Consolidation Schema File

Replace the 3 fixed templates with a single **user-authored schema file** per host project: `.planning/consolidation.schema.md`.

The host project defines its own consolidation units and their section structures. The plugin provides no built-in templates. Instead, it provides:

1. **Schema format specification** -- how to write a valid schema file (documented in the /consolidate SKILL.md)
2. **Starter examples** -- shipped as reference docs in `docs/examples/`, never auto-applied

### Schema File Format

```markdown
# Consolidation Schema

## Units

| Unit | Directory | Description |
|------|-----------|-------------|
| auth | specs/auth | Authentication and session management |
| cli-parser | specs/cli-parser | Argument parsing and validation |
| renderer | specs/renderer | Output formatting subsystem |

## Sections: default

> Applied to all units unless overridden.

### Context Sections
1. **Overview** -- What this unit does, its role in the system
2. **Interface** -- Operations this unit exposes (inputs, outputs, contracts)
3. **Rules** -- Business rules and constraints governing behavior
4. **Error Categories** -- Error types this unit produces
5. **Dependencies** -- What this unit requires from other units or external systems
6. **Configuration** -- Environment variables and tunable parameters

### Cases Sections
- Per-operation sections using `## {Unit}.{Operation}` headings
- Each contains: Unit Rules (UR-N), Operation Rules (OR-N), Side Effects, Cases table

## Sections: renderer

> Override for renderer unit (different structure needed).

### Context Sections
1. **Overview** -- What this unit does
2. **Output Formats** -- Supported formats and their rendering rules
3. **Theme System** -- Customization hooks and defaults
4. **Dependencies** -- External rendering libraries
5. **Configuration** -- Format defaults, color support detection
```

### Why This Design

**User defines the taxonomy.** The plugin never assumes what "kinds of things" exist in a project. A microservice project will define units that look like services. A CLI project will define units like "parser," "executor," "formatter." A library project might have a single unit.

**Default + override model.** Most projects have a dominant pattern (most units share the same section structure). The `default` sections apply unless a specific unit has an override. This avoids N copies of identical section lists.

**Sections are just H2 headings.** The consolidator agent uses the section list to know what H2 headings to produce in `context.md`. The agent does not need to understand what "Domain Model" means vs "Output Formats" -- it extracts content from phase docs and organizes it under the specified headings.

**No behavioral logic in the schema.** The schema defines structure, not rules. Merge rules (latest-wins, PR->SR promotion, supersession) are universal and live in the agent prompt, not in the schema.

### What Stays, What Changes

| Concept | v1 (Current IMPL-SPEC) | v2 (Universal) |
|---------|------------------------|-----------------|
| Template files | 3 fixed `.md` files in `templates/` | 1 user-authored `.planning/consolidation.schema.md` |
| Section definitions | Hardcoded per archetype | User-defined per unit, with defaults |
| Template selection | Orchestrator maps from PROJECT.md topology | Orchestrator reads schema file directly |
| `templates/` directory | Required in plugin | Removed. `docs/examples/` has starter schemas |
| Archetype concept | Core abstraction | Eliminated entirely |

### Migration Path for Existing IMPL-SPEC

- Delete `templates/` directory references from File Inventory
- Delete "Three Archetypes" section entirely
- Delete `<template_type>` from spec-consolidator input contract (replaced by `<sections>`)
- Delete archetype determination from Step 1
- Add schema file reading to Step 1

---

## Question 2: How Does the Orchestrator Classify/Dispatch Without Archetypes?

### Problem

The current Step 1 uses a 2-step service classification:
1. Scan CASES.md for `## {Service}.{Op}` headings, extract service names
2. Scan CONTEXT.md for service names matching PROJECT.md topology
Then maps each service to an archetype via PROJECT.md communication patterns.

Without archetypes, what drives classification and dispatch?

### Solution: Schema-Driven Unit Resolution

The orchestrator no longer "classifies" units by type. Instead:

**Step 1 (revised):**

1. Read `.planning/consolidation.schema.md` for the unit registry.
2. Scan CASES.md for `## {Unit}.{Op}` headings. Extract unique unit names from the prefix before the dot.
3. Match extracted unit names against the schema's Units table.
4. For each matched unit, look up its sections (unit-specific override or `default`).
5. On unmatched unit name (in CASES.md but not in schema): ask the developer. "Unit '{name}' found in CASES.md but not in consolidation schema. Add it? (yes with sections / skip)"
6. On miss (no units found): same as current -- error + ask developer.

**Step 2 dispatch changes:**

The `<template_type>` XML tag is replaced by `<sections>`:

```xml
<objective>Consolidate Phase {id} decisions for {unit} into specs/{unit}/.</objective>
<unit>auth</unit>
<sections>
Context:
1. Overview
2. Interface
3. Rules
4. Error Categories
5. Dependencies
6. Configuration

Cases:
- Per-operation using ## {Unit}.{Operation} headings
- Unit Rules (UR-N), Operation Rules (OR-N), Side Effects, Cases table
</sections>
```

The consolidator agent uses `<sections>` as its structural guide instead of reading a template file from disk. This eliminates the template read step and makes the section structure explicit in the dispatch prompt.

### What Changes in the Pipeline

| Step | v1 | v2 |
|------|----|----|
| 1 (classify) | Extract services from CASES.md, match PROJECT.md topology, determine archetype | Extract units from CASES.md, match schema Units table, look up sections |
| 2 (dispatch) | `<template_type>domain-service</template_type>` | `<sections>` with actual section list from schema |
| 3.7 (orphan) | Check service dirs for 0 operations | Check unit dirs for 0 operations (same logic, different terminology) |

### Schema Bootstrapping

**First run (no schema exists):** The orchestrator detects missing schema and offers two paths:
1. "No consolidation schema found. Create one from a starter? (microservice / cli / library / custom)" -- generates a starter in `.planning/consolidation.schema.md`
2. "Define units manually for this run?" -- developer specifies units and sections ad-hoc, orchestrator writes the schema file for future runs

This preserves the existing "ask the developer" pattern for ambiguity resolution.

---

## Question 3: How Does /case Change?

### Current Service Assumptions in /case

After thorough analysis of all /case files, the service bias is narrower than expected. The /case skill is already substantially project-type-agnostic. The key finding:

**SKILL.md (case orchestrator):** No service-specific language. Uses generic "operation" throughout. The formatting example uses `[OperationName]` without service prefix. The `{Service}.{Op}` format appears only in the Rules section's `Inherits: SR-01` reference pattern, which is a rule-tier convention, not a service assumption.

**step-init.md:** Project-type-agnostic. Dispatches case-briefer with generic planning docs.

**step-discuss.md:** Project-type-agnostic. Probes are behavioral (auth, validation, state, boundaries), not service-specific. The probing techniques (ZOMBIES, EP/BVA) are universal.

**step-finalize.md:** Project-type-agnostic. Cross-operation consistency checks are generic.

**case-briefer.md:** Mostly agnostic. Step 2 says "operations may appear as: Interface definition tables (API routes, commands, event handlers, etc.)." However, Step 4.6 has service-biased language: scans for `{Service}.{OperationName}` patterns. Step 1's PROJECT.md extraction mentions "Service topology," "gRPC," "Cross-service interaction patterns."

**case-validator.md:** Project-type-agnostic. Validates against planning artifacts generically.

### Required Changes

| File | Change | Severity |
|------|--------|----------|
| **SKILL.md** | No changes needed. | None |
| **step-init.md** | No changes needed. | None |
| **step-discuss.md** | No changes needed. | None |
| **step-finalize.md** | No changes needed. | None |
| **case-briefer.md** | Rename "service topology" to "system topology" or "component topology" in Step 1 extraction. Step 4.6: change `{Service}.{OperationName}` to `{Unit}.{Operation}` or keep it generic ("dot-prefixed operation names"). | Low |
| **case-validator.md** | No changes needed. | None |
| **SKILL.md formatting** | The `{Service}.{Op}` naming in the canonical example should use `{Unit}.{Op}` or remain generic `[OperationName]` (it already does). | None/cosmetic |

### Rule Tier Rename

The rule tier system needs terminology updates:

| Current | Universal | Notes |
|---------|-----------|-------|
| SR-N (Service Rules) | UR-N (Unit Rules) | Rules scoped to one consolidation unit |
| `specs/{service}/` | `specs/{unit}/` | Directory naming |
| `{Service}.{Op}` | `{Unit}.{Op}` | Operation naming convention |
| GR-XX (Global Rules) | GR-XX (unchanged) | Already universal |
| OR-N (Operation Rules) | OR-N (unchanged) | Already universal |
| PR-N (Phase Rules) | PR-N (unchanged) | Already universal |
| TR-N (Temp Rules) | TR-N (unchanged) | Already universal |

The SR -> UR rename is the only tier change. GR, OR, PR, TR are already project-type-agnostic.

**IMPORTANT:** The IMPL-SPEC already has a pending "SR-to-GR and SvcR-to-SR rename" task. In the universal model, this simplifies: the old `SR-XX` (system-wide) is already `GR-XX`, and `SvcR-N` / new `SR-N` becomes `UR-N`. The rename mapping is:

| IMPL-SPEC v1 Prefix | Universal Prefix |
|---------------------|------------------|
| GR-XX (was SR-XX in v0) | GR-XX (no change) |
| SR-N (was SvcR-N in v0) | UR-N |

### /case Does NOT Need to Know About the Schema

The /case skill discovers operations from phase planning documents. It does not need to know about consolidation units or the schema file. The consolidator maps operations to units at consolidation time. This is an important separation: /case is about behavioral discovery, /consolidate is about structural organization.

The only change /case needs is using `{Unit}.{Op}` naming in output (if the host project uses that convention). But this is already handled: the case-briefer extracts operation names from whatever structure CONTEXT.md uses. The naming convention is a host-project concern, not a plugin concern.

---

## Question 4: Schema for User-Defined Consolidation Units

### Complete Schema Specification

```markdown
# Consolidation Schema

## Meta

| Key | Value |
|-----|-------|
| version | 1 |
| operation-prefix | {unit}.{operation} |
| rule-prefix | UR |
| specs-dir | specs |

## Units

| Unit | Directory | Description |
|------|-----------|-------------|
| {name} | specs/{name} | {what this unit is} |

## Sections: default

### Context Sections
1. **{Section Name}** -- {one-line guide text}
2. **{Section Name}** -- {one-line guide text}
...

### Conditional Sections
- **{Section Name}** -- Include when: {condition}

### Cases Format
{Description of how cases.md is structured for this unit type}

## Sections: {unit-name}

> Override: {why this unit needs different sections}

### Context Sections
1. **{Section Name}** -- {one-line guide text}
...
```

### Schema Fields Explained

**Meta section:**
- `version`: Schema format version (for future evolution). Always `1` for now.
- `operation-prefix`: How operations are named. Default `{unit}.{operation}`. Some projects might use `{module}::{function}` or just `{operation}`.
- `rule-prefix`: What replaces "SR" for unit-scoped rules. Default `UR`. A project could use `SR` if it prefers.
- `specs-dir`: Output directory name under `.planning/`. Default `specs`.

**Units table:** The exhaustive list of consolidation units. Each unit gets a `specs/{name}/` directory. The orchestrator only consolidates into listed units.

**Sections: default:** Applied to any unit without a specific override. The consolidator agent uses this section list to structure `context.md`.

**Sections: {unit-name}:** Override for a specific unit. Completely replaces the default -- no inheritance/merging between default and override.

**Conditional sections:** Sections included only when certain conditions are met (e.g., "State Management -- Include when: unit manages stateful entities"). The consolidator agent evaluates the condition and includes or omits.

**Cases Format:** Description of how `cases.md` is structured. Usually the same across all units (operation headings with rules + cases tables), but overridable for units where cases don't apply (e.g., a "shared-types" unit might have no cases.md).

### Validation Rules (Orchestrator Enforces)

1. Schema file must exist at `.planning/consolidation.schema.md` (or orchestrator bootstraps it)
2. Every unit in the Units table must have a unique name and directory
3. A `Sections: default` block must exist
4. Section names within a block must be unique
5. Operation prefix must contain `{unit}` and `{operation}` placeholders (or be empty for flat naming)

### Why Markdown, Not YAML/JSON

The schema is a human-authored planning artifact. It lives in `.planning/` alongside other markdown docs. Markdown is:
- Readable by Claude Code agents without a parser
- Editable by developers in any text editor
- Consistent with every other `.planning/` artifact
- Diffable in PRs

YAML would require a parser. JSON is hostile to human editing. Markdown tables are the native format for planning artifacts in the GSD ecosystem.

---

## Question 5: Integration with the Existing Hash Tool

### Hash Tool Is Already Universal

The hash tool (`tools/hash-sections.ts`) operates on markdown H2 sections generically. It does not know or care about service archetypes, unit types, or consolidation schemas. Its input is file paths; its output is section headings + SHA-256/8 hashes.

**No changes needed to hash-sections.ts.**

### What Changes in Hash Tool Invocation

The orchestrator currently assumes `specs/{service}/context.md` paths. In the universal model, the paths are `specs/{unit}/context.md` -- same structure, different naming. The orchestrator reads the schema's Units table to build the file list:

```bash
# v1 (from IMPL-SPEC)
deno run --no-lock --allow-read tools/hash-sections.ts specs/auth/context.md specs/auth/cases.md specs/user/context.md ...

# v2 (universal) -- identical invocation, different path source
deno run --no-lock --allow-read tools/hash-sections.ts specs/auth/context.md specs/auth/cases.md specs/cli-parser/context.md ...
```

The hash tool path in IMPL-SPEC (`skills/consolidate/hash-sections.ts`) is wrong -- the tool actually lives at `tools/hash-sections.ts`. This should be corrected in the IMPL-SPEC rewrite.

### E2E Flows Impact

E2E flows document cross-unit interactions. The E2E agent receives hash JSON and uses it to detect staleness. This mechanism is unit-name-agnostic -- the hash JSON contains file paths and section headings, which work regardless of what the units represent.

However, the E2E flow format in IMPL-SPEC assumes multi-service architecture (Step Table with From/To service columns, Mermaid sequence diagrams with service participants). For projects with a single unit or non-service architecture, E2E flows may not apply.

**Recommendation:** Make E2E flows opt-in via the schema:

```markdown
## Meta

| Key | Value |
|-----|-------|
| e2e-flows | true |
```

Default `false`. The orchestrator skips Steps 3.5 and 4 entirely when `e2e-flows` is false. This eliminates the E2E machinery for projects where it adds no value (single-unit projects, libraries, CLI tools).

---

## Revised Component Architecture

### System Context (Universal)

```
Host Project (.planning/)
  |
  +-- consolidation.schema.md            (input: unit definitions + section schemas)
  +-- phases/{NN}-CONTEXT.md, CASES.md   (input: phase decisions)
  +-- PROJECT.md                         (input: GR rules, system topology)
  +-- specs/
  |     {unit}/
  |       context.md                     (output: consolidated decisions)
  |       cases.md                       (output: consolidated rules + cases)
  |     e2e/                             (output: cross-unit flows, opt-in)
  |     INDEX.md                         (output: navigation index)

Plugin Project (cckit/)
  |
  +-- skills/consolidate/
  |     +-- SKILL.md                     (orchestrator: 7+2 step state machine)
  |
  +-- tools/
  |     +-- hash-sections.ts             (Deno tool: deterministic section hashing)
  |     +-- hash-sections_test.ts
  |
  +-- agents/
  |     +-- spec-consolidator.md         (sonnet: per-unit merge)
  |     +-- e2e-flows.md                 (sonnet: cross-unit flow docs, opt-in)
  |     +-- spec-verifier.md             (opus: verification checks)
  |
  +-- docs/examples/
        +-- schema-microservice.md       (starter schema: backend services)
        +-- schema-cli.md                (starter schema: CLI application)
        +-- schema-library.md            (starter schema: reusable library)
```

### Component Changes Summary

| Component | Status | Changes |
|-----------|--------|---------|
| **SKILL.md orchestrator** | REWRITE | Schema reading replaces archetype determination; unit terminology; E2E opt-in gate; schema bootstrapping flow |
| **spec-consolidator.md** | MODIFY | `<template_type>` replaced by `<sections>`; `<service>` replaced by `<unit>`; SR -> UR in merge rules; remove template file reading |
| **e2e-flows.md** | MODIFY | Service -> unit terminology; opt-in gating handled by orchestrator |
| **spec-verifier.md** | MODIFY | Service -> unit terminology; V-04 (archetype-appropriate sections) replaced by schema-appropriate sections; V-27 (PROJECT.md topology match) replaced by schema Units match |
| **hash-sections.ts** | NO CHANGE | Already universal |
| **case-briefer.md** | MINOR | Service -> unit/component in guide text |
| **case-validator.md** | NO CHANGE | Already universal |
| **SKILL.md (/case)** | NO CHANGE | Already universal |
| **templates/** | DELETE | Replaced by user-authored schema + starter examples |
| **docs/examples/** | NEW | Starter schema examples for common project types |

### Data Flow (Universal)

```
Developer invokes: /consolidate {phase-number}
         |
         v
[Step 1] Read consolidation.schema.md
         |  - Parse Units table
         |  - Parse default + override sections
         |  - Read phase CONTEXT.md, CASES.md
         |  - Extract unit names from CASES.md headings
         |  - Match against schema Units table
         |  - On unknown unit: ask developer (add to schema or skip)
         |  - For each unit: resolve its section list (override or default)
         |  - Read existing specs/{unit}/ if present
         |
         v
[Step 2] Dispatch N spec-consolidator agents (PARALLEL)
         |  - One per affected unit
         |  - Each receives: <unit>, <sections>, phase docs, existing spec
         |  - Each writes: specs/{unit}/context.md + cases.md
         |
         v
[Step 3] Collect results, update INDEX.md
         |
         v
[Step 3.5] Identify E2E flows (ONLY if schema.meta.e2e-flows == true)
         |
         v
[Step 3.7] Orphan unit cleanup
         |
         v
[Step 4] Hash computation + E2E dispatch (ONLY if e2e-flows enabled)
         |
         v
[Step 5] Verification dispatch
         |
         v
[Step 6] Confirmation summary
         |
         v
[Step 7] Commit or rollback
```

---

## Merge Rule Changes for Universal Model

The 11 merge rules from IMPL-SPEC need minimal changes:

| Rule | Current | Universal | Change |
|------|---------|-----------|--------|
| 1. Operation-level replacement | Same `{Service}.{Op}` heading | `{Unit}.{Op}` heading (configurable via schema `operation-prefix`) | Terminology |
| 2. PR to SR promotion | PR -> SR | PR -> UR (configurable via schema `rule-prefix`) | Terminology |
| 3. TR exclusion | Unchanged | Unchanged | None |
| 4. R to OR transformation | Unchanged | Unchanged | None |
| 5. GR reference only | Unchanged | Unchanged | None |
| 6. Superseded operations | Unchanged (unit-scoped) | Unchanged | None |
| 7. Superseded rules | Unchanged | Unchanged | None |
| 8. Section-level rewrite | "Template sections" | "Schema-defined sections" | Source reference |
| 9. Provenance | Unchanged | Unchanged | None |
| 10. Forward Concerns exclusion | Unchanged | Unchanged | None |
| 11. Exclusions | Unchanged | Unchanged | None |

The merge rules are fundamentally universal. Only the naming convention (service -> unit, SR -> UR) and the section source (template file -> schema) change.

---

## Verification Check Changes

| Check | Current | Universal | Change |
|-------|---------|-----------|--------|
| V-04 | "Archetype-appropriate sections present" | "Schema-defined sections present" | Reference source |
| V-27 | "specs/ service list matches PROJECT.md service topology" | "specs/ unit list matches schema Units table" | Reference source |
| All others | Service-agnostic already | Unchanged | None/terminology |

Most verification checks are structural (provenance tags exist, operations have cases, INDEX matches filesystem). These are universal by nature.

---

## Suggested Build Order (Revised for Universal Model)

The original 8-phase ROADMAP assumed service archetypes throughout. Here is the revised build order:

### Phase 1: Hash Tool (COMPLETE -- no changes)

Already built. Already universal. Carry forward as-is.

### Phase 2: Schema Design + Examples (REPLACES: Templates)

**Build:** Schema format specification (in SKILL.md), 3 starter examples in `docs/examples/`.

**Why:** Defines the structural foundation. Everything downstream reads the schema. But the deliverable is simpler than 3 archetype templates -- it is a format spec + examples, not behavioral code.

**Key difference from original Phase 2:** No `templates/` directory. The schema format is documented in the consolidate SKILL.md (or a referenced file). Starter examples are reference docs, not consumed by the pipeline.

### Phase 3: Spec Consolidator Agent (MODIFIED)

**Changes:** Receives `<sections>` instead of `<template_type>`. Uses UR instead of SR. Reads section list from dispatch prompt instead of template file.

**Impact:** Agent prompt rewrite, but merge rule logic is identical.

### Phase 4: /case Updates (MINOR CHANGES)

**Changes:** UR prefix instead of SR. Case-briefer terminology tweaks.

**Impact:** Smaller than originally planned. /case is already mostly universal.

### Phase 5: Orchestrator Core (MODIFIED)

**Changes:** Schema reading replaces archetype determination. Unit resolution replaces service classification. Schema bootstrapping flow. E2E opt-in gate.

**Impact:** Step 1 is significantly different. Steps 2-3.7 are structurally similar with terminology changes.

### Phase 6: E2E Flows Agent (MODIFIED, POTENTIALLY DEFERRABLE)

**Changes:** Unit terminology. Opt-in gating means this phase only runs for projects that enable E2E flows.

**Impact:** Could be deferred if no immediate test project needs cross-unit flows. The opt-in gate (schema `e2e-flows: true`) makes this safely skippable.

### Phase 7: Spec Verifier + Integration (MODIFIED)

**Changes:** V-04 and V-27 reference schema instead of archetypes/topology. Other checks get terminology updates.

### Phase 8: Consumer Updates (MINOR)

**Changes:** Same as original -- case-briefer reads specs/ first, falls back to phase dirs.

### Dependency Graph (Universal)

```
Phase 1: hash-sections.ts (DONE) ---+
                                      |
Phase 2: schema design + examples ---+--> Phase 3: spec-consolidator ---> Phase 5: orchestrator (1-3.7)
                                                                               |
                                      Phase 1 ----+                           |
                                                   |                           v
                                      Phase 3 ----+--> Phase 6: e2e-flows --> Phase 7: verifier + integration
                                                                               ^
                                      Phase 3 ---------> Phase 7 (verifier) --+

Phase 4: /case updates (independent, can parallel with Phase 3 or 5)
Phase 8: consumer updates (after Phase 7)
```

---

## Open Questions

### 1. Schema File Location

`.planning/consolidation.schema.md` is the proposed location. Alternative: `.planning/specs/SCHEMA.md` (co-located with output). The `.planning/` root is recommended because the schema is an input (like PROJECT.md), not an output (like specs/).

### 2. Schema Evolution

When the project adds a new unit mid-milestone, the developer updates the schema manually. Should the orchestrator detect schema changes between runs and warn? Probably not -- the schema is the source of truth, and the orchestrator should just use whatever is current.

### 3. Projects Without Operations

Some consolidation units may have context decisions but no behavioral operations (like the current Phase 1 infrastructure case). The schema's Cases Format section should support "no cases.md" as a valid configuration for units that are purely contextual.

### 4. Naming Convention Flexibility

The `operation-prefix` field (`{unit}.{operation}`) may need to support project-specific patterns. Some projects use `module::function`, others use just `OperationName` without a unit prefix. The orchestrator's unit-extraction logic (Step 1.2: "extract unit names from the prefix before the dot") needs to be configurable based on the schema's prefix pattern.

### 5. E2E Flows for Non-Service Projects

The current E2E flow format (Step Table with From/To, Mermaid sequence diagrams) is inherently multi-component. For projects with cross-unit flows that are not service-to-service (e.g., CLI subcommand -> parser -> executor -> formatter), the format needs minor terminology adaptation but the structure works. The opt-in gate handles projects where E2E flows are irrelevant.

---

## Sources

- `/Users/syr/Developments/cckit/docs/IMPL-SPEC.md` -- current design document (HIGH confidence, analyzed in full)
- `/Users/syr/Developments/cckit/skills/case/SKILL.md` -- working /case orchestrator (HIGH confidence)
- `/Users/syr/Developments/cckit/skills/case/step-init.md` -- /case init step (HIGH confidence)
- `/Users/syr/Developments/cckit/skills/case/step-discuss.md` -- /case discussion step (HIGH confidence)
- `/Users/syr/Developments/cckit/skills/case/step-finalize.md` -- /case finalize step (HIGH confidence)
- `/Users/syr/Developments/cckit/agents/case-briefer.md` -- case-briefer agent (HIGH confidence)
- `/Users/syr/Developments/cckit/agents/case-validator.md` -- case-validator agent (HIGH confidence)
- `/Users/syr/Developments/cckit/skills/consolidate/SKILL.md` -- v1 consolidate skill (HIGH confidence)
- `/Users/syr/Developments/cckit/.planning/PROJECT.md` -- project context and neutrality constraints (HIGH confidence)
- `/Users/syr/Developments/cckit/.planning/ROADMAP.md` -- current phase plan (HIGH confidence)
- `/Users/syr/Developments/cckit/tools/hash-sections.ts` -- hash tool location confirmed (HIGH confidence)
