# Phase 11: Consolidation Pipeline - Research

**Researched:** 2026-03-31
**Domain:** Claude Code skill/agent authoring (SKILL.md orchestrator + subagent .md files) for schema-driven consolidation pipeline
**Confidence:** HIGH

## Summary

Phase 11 rewrites the consolidation orchestrator (`skills/consolidate/SKILL.md`) and creates two new agents (`agents/spec-consolidator.md`, `agents/e2e-flows.md`) to implement the full consolidation cycle using schema-driven dispatch. The existing v1 SKILL.md is a complete rewrite target; the two agents are net-new files. All three are Markdown files with YAML frontmatter -- no TypeScript, no compiled code, no runtime dependencies beyond what already exists (Deno tools from Phases 1 and 10).

The technical domain is Claude Code plugin authoring: writing system prompts that orchestrate multi-step workflows with subagent dispatch, Bash tool calls to Deno scripts, and developer interaction via AskUserQuestion. The key integration points are well-understood: schema-parser.ts (Phase 10) provides structured JSON, hash-sections.ts (Phase 1) provides section hashes, and MODEL.md (Phase 9) defines the authoritative data model. All three tools/specs are stable and tested.

**Primary recommendation:** Structure the work as three deliverables (SKILL.md rewrite, spec-consolidator agent, e2e-flows agent) plus an IMPL-SPEC.md rewrite task. The orchestrator SKILL.md is the largest and most complex deliverable (7+2 step pipeline). Agent files are self-contained and can be written after the orchestrator's dispatch contract is defined.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01/D-02/D-03: IMPL-SPEC.md gradually deprecated; remains as reference in docs/ during Phase 11; deleted after Phase 14
- D-04: 7+2 pipeline structure preserved from v1; step contents updated for schema-driven dispatch
- D-05: Step 1 calls schema-parser.ts via Bash, parses JSON stdout (same pattern as hash-sections.ts)
- D-06: Component discovery: CASES.md headings (primary) -> CONTEXT.md fallback -> ask developer. No keyword fallback.
- D-07: spec-consolidator receives `<component>` (replaces `<service>`), `<sections>` (replaces `<template_type>`), and `<conditional_sections>` with condition text
- D-08: Conditional section evaluation done by consolidator agent (not orchestrator). Agent logs reasoning as HTML comments.
- D-09: Remaining dispatch tags carry over with terminology updated (service -> component)
- D-10: All 11 merge rules carry over with terminology changes only
- D-11: INDEX.md uses "Component" heading. Type column always displayed.
- D-12: Output: `specs/{component}/context.md` and `specs/{component}/cases.md`
- D-13: New component discovery: auto-add to schema with developer confirmation
- D-14: Deletion/renaming via superseded operations -> orphan cleanup -> schema removal suggestion
- D-15: Orphan cleanup offers to remove component from schema file
- D-16: spec-consolidator = sonnet
- D-17: e2e-flows = sonnet
- D-18: spec-verifier = opus (fixed, never downgraded -- Phase 13 deliverable)
- D-19: SKILL.md includes project-neutral backfill guidance; no project-specific backfill plans
- D-20: v1 error handling preserved: fail-fast + selective retry + stage isolation
- D-21: Step 5 skip branch: if agents/spec-verifier.md absent, skip verification, mark "UNVERIFIED"

### Claude's Discretion
- Exact XML dispatch tag structure and nesting for all agents
- Internal SKILL.md step implementation details
- Agent prompt wording and quality gate checklist phrasing
- spec-consolidator internal code organization
- e2e-flows Mermaid diagram formatting decisions

### Deferred Ideas (OUT OF SCOPE)
- Per-component section overrides (individual, not type-based) -- deferred until proven necessary
- Template inheritance/composition -- deferred per research
- Operation prefix configurability -- `{Component}.{Operation}` fixed
- Spec-vs-code drift detection (Layer 3 verification) -- deferred
- IMPL-SPEC.md deletion -- after Phase 14 completion
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PIPE-01 | Orchestrator reads schema to resolve unit names and section structures (replaces archetype classification) | Schema-parser.ts outputs JSON with `meta`, `components`, `sections` keys. Orchestrator calls via `deno run --allow-read tools/schema-parser.ts <path>` and parses stdout. Replaces v1's PROJECT.md archetype classification. |
| PIPE-02 | Consolidator agent receives explicit section list via dispatch (not template type) | New dispatch tags: `<component>`, `<sections>` (JSON list from schema parser), `<conditional_sections>` (with condition text). Replaces v1's `<service>` + `<template_type>`. |
| PIPE-03 | All 11 merge rules function correctly with universal model | Merge rules carry over with 3 terminology changes (Rule 1: Component.Op, Rule 2: PR->CR, Rule 8: schema-defined sections). Logic unchanged. Agent prompt must enumerate all 11 rules. |
| PIPE-04 | INDEX.md uses "Component" heading with optional "Type" column | New INDEX.md format with Component/Type/Description/Files/Last Consolidated columns. Replaces v1 "Service"/"Archetype" columns. |
| PIPE-05 | `specs/{unit}/context.md` and `cases.md` output structure works for any unit type | Directory structure unchanged from v1 concept (per-unit directories). Naming uses component names from schema. Section structure comes from schema sections, not hardcoded templates. |
| PIPE-06 | IMPL-SPEC is fully rewritten to reflect universal design | IMPL-SPEC.md rewrite: remove archetype references, document schema-driven pipeline, update all agent contracts and terminology. File stays in docs/ as reference until Phase 14 deletion. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Language:** All content in English
- **Commit conventions:** Conventional Commits 1.0.0, scope = codebase noun (consolidate, consolidator, e2e-flows), never phase numbers
- **GSD Reference Boundary:** No D-nn, phase numbers, or requirement IDs in deliverables outside .planning/
- **Technology Neutrality:** All artifacts must be project-type-agnostic. No service-biased language. The neutrality test: "Could any project install this and use it without editing?"
- **Runtime:** Deno for TypeScript tools (hash-sections.ts, schema-parser.ts). Skills and agents are Markdown only.
- **Agent models:** spec-consolidator = sonnet, e2e-flows = sonnet, spec-verifier = opus (Phase 13)
- **No hardcoded project references:** Skills and agents must be technology-neutral and project-neutral
- **GSD conventions:** Depends on CONTEXT.md, CASES.md, ROADMAP.md, PROJECT.md phase directory structure

## Standard Stack

This phase produces no new code -- only Markdown files (SKILL.md, agent .md, IMPL-SPEC.md rewrite). The "stack" is the Claude Code plugin layer.

### Core

| Technology | Format | Purpose | Why Standard |
|------------|--------|---------|--------------|
| SKILL.md | YAML frontmatter + Markdown body | Orchestrator skill definition | Claude Code Agent Skills standard. Frontmatter configures invocation; body is system prompt. |
| Agent .md | YAML frontmatter + Markdown body | Subagent definitions | Claude Code native subagent format. Frontmatter sets model, tools, description; body is system prompt. |

### Existing Tools (consumed, not modified)

| Tool | Location | Invocation | Output |
|------|----------|------------|--------|
| schema-parser.ts | `tools/schema-parser.ts` | `deno run --allow-read tools/schema-parser.ts <path>` | JSON: `{ meta, components, sections }` |
| schema-bootstrap.ts | `tools/schema-bootstrap.ts` | `deno run --allow-read --allow-write tools/schema-bootstrap.ts <path>` | Creates starter schema, refuses overwrite |
| hash-sections.ts | `tools/hash-sections.ts` | `deno run --no-lock --allow-read tools/hash-sections.ts <files...>` | JSON: `{ files: [{ path, sections: [{ heading, hash }] }] }` |

### Agent Frontmatter Patterns (from existing agents)

Verified from `agents/case-briefer.md` and `agents/case-validator.md`:

```yaml
---
name: case-briefer
description: >
  Multi-line description of what the agent does and when to use it.
tools:
  - Read
  - Grep
  - Glob
  - Write
model: sonnet
---
```

**Key conventions established in this project:**
- `tools` as YAML list (not comma-separated string)
- `model` as alias (`sonnet`, `opus`), not full model ID
- No `permissionMode`, `maxTurns`, `hooks`, `memory`, `background`, `effort`, `isolation` used yet (consider `maxTurns` for verifier in Phase 13)
- `description` uses multi-line `>` folded scalar

### SKILL.md Frontmatter Pattern (from existing skill)

Verified from `skills/consolidate/SKILL.md` (v1) and `skills/case/SKILL.md`:

```yaml
---
name: consolidate-specs
description: >
  Multi-line description with trigger keywords.
argument-hint: "[phase-number]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - Edit
  - AskUserQuestion
disable-model-invocation: true
---
```

**v2 changes to frontmatter:**
- Add `Agent` to `allowed-tools` (required for subagent dispatch)
- Update `name` from `consolidate-specs` to `consolidate` (matches IMPL-SPEC)
- Update `description` to remove "per-service" language, use "per-component"

## Architecture Patterns

### Deliverable Structure

```
skills/consolidate/
  SKILL.md              -- Orchestrator (REWRITE - 7+2 step pipeline)
agents/
  spec-consolidator.md  -- NEW - per-component consolidation agent
  e2e-flows.md          -- NEW - cross-component E2E flow agent
  case-briefer.md       -- EXISTING (reference only)
  case-validator.md     -- EXISTING (reference only)
docs/
  IMPL-SPEC.md          -- REWRITE to reflect universal design
```

### Pattern 1: Schema-Driven Dispatch (Orchestrator Step 1)

**What:** Orchestrator calls schema-parser.ts via Bash, parses JSON, uses output to resolve component names and section structures for dispatch.

**When to use:** Step 1 of every consolidation run.

**Flow:**
```
1. Resolve phase directory from skill argument
2. Check for schema file at .planning/consolidation.schema.md
   - Missing: offer bootstrap via schema-bootstrap.ts, or abort
3. Call schema-parser.ts via Bash, capture JSON stdout
4. Parse JSON: extract meta, components, sections
5. Resolve section structure per component:
   - component.type non-empty -> sections[component.type]
   - component.type empty -> sections["default"]
6. Component discovery from CASES.md/CONTEXT.md
7. Cross-reference discovered components against schema
   - In schema -> proceed
   - Not in schema -> "Add to schema?" prompt
```

**Schema parser output structure (verified from schema-parser.ts):**
```typescript
interface SchemaOutput {
  meta: { version: number; rulePrefix: string; e2eFlows: boolean };
  components: { name: string; description: string; type: string }[];
  sections: Record<string, {
    context: { name: string; guide: string }[];
    conditional: { name: string; condition: string }[];
  }>;
}
```

### Pattern 2: XML Dispatch Tags (Agent Input Contract)

**What:** Orchestrator builds XML-tagged dispatch prompts for each agent invocation.

**v2 spec-consolidator dispatch (from CONTEXT.md D-07/D-09):**

| Tag | Required | Contents | Change from v1 |
|-----|----------|----------|-----------------|
| `<objective>` | Yes | "Consolidate Phase {id} decisions for {component} into specs/{component}/." | "service" -> "component" |
| `<component>` | Yes | Component name (lowercase) | Replaces `<service>` |
| `<sections>` | Yes | JSON array of context sections from schema parser | Replaces `<template_type>` |
| `<conditional_sections>` | Yes | JSON array of conditional sections with conditions | NEW |
| `<files_to_read>` | Yes | Phase CONTEXT.md, CASES.md, PROJECT.md paths | Unchanged |
| `<existing_spec>` | No | Path to existing specs/{component}/context.md | "service" -> "component" |
| `<existing_cases>` | No | Path to existing specs/{component}/cases.md | "service" -> "component" |
| `<output_context>` | Yes | Output path for specs/{component}/context.md | "service" -> "component" |
| `<output_cases>` | Yes | Output path for specs/{component}/cases.md | "service" -> "component" |
| `<phase_id>` | Yes | Phase identifier string | Unchanged |
| `<superseded_operations>` | No | JSON array from CASES.md Superseded Operations table | Unchanged |
| `<superseded_rules>` | No | JSON array from CASES.md Superseded Rules table | Unchanged |

### Pattern 3: E2E Opt-In via Schema Meta (Step 3.5/4)

**What:** E2E flow generation is controlled by `meta.e2eFlows` from the schema parser output.

**Flow:**
```
1. Check schema meta.e2eFlows
   - false -> skip Steps 3.5 and 4 entirely
   - true -> proceed with E2E flow identification and generation
2. Step 3.5: Identify affected flows
3. Step 4: Compute hashes, dispatch e2e-flows agent
```

This is a key simplification from v1 which always ran E2E discovery.

### Pattern 4: Verifier Skip Branch (Step 5 - D-21)

**What:** Step 5 checks for `agents/spec-verifier.md` existence before dispatching.

**Flow:**
```
1. Check if agents/spec-verifier.md exists (Glob or file read)
   - Absent -> log "Verification skipped (spec-verifier agent not yet created)"
              mark output as "UNVERIFIED" in confirmation summary
   - Present -> dispatch spec-verifier agent normally
```

Phase 13 creates the verifier. This skip branch activates it automatically.

### Pattern 5: Orchestrator Pipeline (7+2 Steps)

The pipeline structure from IMPL-SPEC carries over with these step-level changes:

| Step | v1 Action | v2 Change |
|------|-----------|-----------|
| 1 | Read docs, classify services from PROJECT.md topology | Read docs, call schema-parser.ts, resolve sections per component |
| 2 | Dispatch consolidators with `<service>` + `<template_type>` | Dispatch with `<component>` + `<sections>` + `<conditional_sections>` |
| 3 | Collect results, update INDEX.md (v1 format) | Collect results, update INDEX.md (v2 format: Component/Type columns) |
| 3.5 | Identify E2E flows (always runs) | Check `meta.e2eFlows` first; skip if false |
| 3.7 | Orphan cleanup (service directories) | Orphan cleanup (component directories) + schema removal suggestion |
| 4 | Hash + dispatch E2E agent | Unchanged (terminology only) |
| 5 | Dispatch verifier | Skip branch if verifier agent absent |
| 6 | Confirmation summary | Updated terminology (Component, Type, CR) |
| 7 | Commit or rollback | Unchanged |

### Anti-Patterns to Avoid

- **Archetype classification in orchestrator:** v1 classified services into domain-service/gateway-bff/event-driven from PROJECT.md topology. v2 eliminates this entirely -- section structure comes from schema.
- **Hardcoded section lists in agents:** spec-consolidator must use the `<sections>` dispatch tag, not an internal default. The agent adapts to whatever section list the orchestrator provides.
- **Service-biased language anywhere:** "service" only appears in IMPL-SPEC.md v1 references. All new content uses "component".
- **Keyword-based component discovery:** Explicitly rejected (D-06). Only heading scan and CONTEXT.md name matching are valid.
- **Conditional evaluation in orchestrator:** D-08 says the consolidator agent evaluates conditions, not the orchestrator. The orchestrator passes conditions; the agent decides.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Schema parsing | Custom regex/string parsing in SKILL.md | `tools/schema-parser.ts` via Bash | AST-based, validated, tested (18 test cases). Orchestrator gets structured JSON. |
| Schema creation | Manual file writing in SKILL.md | `tools/schema-bootstrap.ts` via Bash | Atomic no-overwrite, tested, consistent output. |
| Section hashing | Agent-computed hashes | `tools/hash-sections.ts` via Bash | Deterministic, normalized, AST-based. Agent inline hashing is non-deterministic. |
| Markdown AST ops | String manipulation in prompts | Deno tools | All markdown structural operations go through tested Deno tools, never agent string parsing. |

**Key insight:** The orchestrator SKILL.md is a system prompt that instructs Claude how to use tools (Bash, Agent, Read, Write, AskUserQuestion). It does not contain executable code -- it contains instructions for the AI to follow. Complexity is in clear step-by-step instructions, not in code.

## Common Pitfalls

### Pitfall 1: Schema Parser JSON in Dispatch Tags
**What goes wrong:** Embedding raw JSON from schema-parser.ts into XML dispatch tags can break XML parsing if JSON contains angle brackets or special characters.
**Why it happens:** Schema section names or guide text could theoretically contain `<` or `>` characters.
**How to avoid:** Instruct the orchestrator to wrap JSON payloads in CDATA sections or to validate/escape before embedding. Alternatively, pass JSON as a file path reference rather than inline.
**Warning signs:** Agent reports "parse error" or "unexpected tag" when receiving dispatch.

### Pitfall 2: Section Resolution for Unknown Types
**What goes wrong:** A component in the schema has a type that maps to a section block, but the parser already validates this cross-reference. However, if the schema is manually edited after parsing...
**Why it happens:** Race condition between schema edit and consolidation run.
**How to avoid:** Always re-parse the schema at the start of each consolidation run. Never cache parsed results across runs.
**Warning signs:** "Type X has no matching Sections block" error from parser.

### Pitfall 3: CR Numbering Collisions During PR Promotion
**What goes wrong:** When promoting PR-N to CR-N, the consolidator must start numbering from the highest existing CR number + 1. If it starts from 1, it overwrites existing CRs.
**Why it happens:** Agent doesn't read existing cases.md before assigning CR numbers.
**How to avoid:** Quality gate checklist in spec-consolidator must include: "CR numbers sequential from highest existing CR + 1". Dispatch must include `<existing_cases>` path.
**Warning signs:** Duplicate CR-1, CR-2 entries in consolidated cases.md.

### Pitfall 4: Missing `Agent` in allowed-tools
**What goes wrong:** SKILL.md cannot dispatch subagents.
**Why it happens:** v1 SKILL.md didn't need `Agent` tool because it had no subagent dispatch.
**How to avoid:** Ensure `Agent` is in the `allowed-tools` list in SKILL.md frontmatter.
**Warning signs:** "Tool Agent is not allowed" error during consolidation.

### Pitfall 5: Verifier Skip Branch Cleanup
**What goes wrong:** Phase 13 creates the verifier but forgets to remove the skip branch from SKILL.md.
**Why it happens:** The skip branch is in Phase 11's SKILL.md; Phase 13 focuses on the verifier agent.
**How to avoid:** Document in SKILL.md (as a comment or note) that the skip branch should be removed when spec-verifier.md is created. Phase 13 planner should check for this.
**Warning signs:** Verifier agent exists but is never invoked.

### Pitfall 6: E2E Skip When meta.e2eFlows is False
**What goes wrong:** Steps 3.5 and 4 run unnecessarily, discover no flows, waste time/tokens.
**Why it happens:** Orchestrator doesn't check the meta flag early enough.
**How to avoid:** Check `meta.e2eFlows` immediately after schema parsing. Skip all E2E-related steps (3.5, 4) when false.
**Warning signs:** Unnecessary "No cross-component flows detected" messages on every run for projects that have E2E disabled.

### Pitfall 7: Technology-Biased Language Leaking In
**What goes wrong:** Agent prompts or guide text inadvertently use "service", "gRPC", "REST", "microservice" etc.
**Why it happens:** Copy-paste from v1 IMPL-SPEC which was service-oriented.
**How to avoid:** Search-and-replace review of all deliverables for service-biased terms. Use the neutrality test from CLAUDE.md.
**Warning signs:** Any occurrence of "service" in user-facing output (INDEX.md, spec headers, confirmation messages) except in IMPL-SPEC.md v1 reference sections.

### Pitfall 8: Orchestrator Prompt Exceeding Skill Limits
**What goes wrong:** SKILL.md body becomes too large for Claude Code to process effectively.
**Why it happens:** 7+2 steps with detailed instructions, error handling, format specifications.
**How to avoid:** Use supporting files pattern. Keep SKILL.md under 500 lines (Claude Code recommendation). Move detailed templates (INDEX.md format, confirmation summary format) to supporting files that SKILL.md references.
**Warning signs:** SKILL.md exceeding 500 lines, Claude losing track of later steps.

## Code Examples

### Example 1: SKILL.md Frontmatter (v2)

```yaml
---
name: consolidate
description: >
  Consolidate a shipped phase's decisions into per-component spec files.
  Reads schema for component registry and section structures, dispatches
  parallel consolidation agents, generates E2E flows when enabled, runs
  verification. Triggers: after ship, spec consolidation, phase completed.
argument-hint: "[phase-number]"
allowed-tools:
  - Agent
  - Bash
  - Read
  - Write
  - Glob
  - Grep
  - AskUserQuestion
disable-model-invocation: true
---
```

Source: Derived from v1 `skills/consolidate/SKILL.md` frontmatter + IMPL-SPEC agent contract + Claude Code skills documentation.

### Example 2: spec-consolidator Frontmatter

```yaml
---
name: spec-consolidator
description: >
  Consolidates phase planning decisions into per-component spec files.
  Reads phase CONTEXT.md and CASES.md, merges with existing specs,
  writes updated specs/{component}/context.md and cases.md.
tools:
  - Read
  - Grep
  - Glob
  - Write
model: sonnet
---
```

Source: IMPL-SPEC spec-consolidator section + project agent conventions from case-briefer.md.

### Example 3: e2e-flows Frontmatter

```yaml
---
name: e2e-flows
description: >
  Generates or updates cross-component E2E flow documentation.
  Reads consolidated component specs and produces per-user-action flow files
  with step tables, Mermaid diagrams, and spec reference hashes.
tools:
  - Read
  - Grep
  - Glob
  - Write
model: sonnet
---
```

Source: IMPL-SPEC e2e-flows section + project agent conventions.

### Example 4: Schema Parser Invocation in Orchestrator

The orchestrator Step 1 calls the parser:

```
Run via Bash:
  deno run --allow-read tools/schema-parser.ts .planning/consolidation.schema.md

Parse the JSON stdout. The result has this structure:
  - meta.e2eFlows: boolean -- controls whether E2E steps run
  - components[]: array of { name, description, type }
  - sections: map of type-name -> { context[], conditional[] }

For each discovered component:
  - Look up component.type in sections map
  - If type is empty string, use sections["default"]
  - This gives the explicit section list for dispatch
```

Source: `tools/schema-parser.ts` interface definitions and test suite.

### Example 5: INDEX.md v2 Format

```markdown
# Spec Index

Last updated: {YYYY-MM-DD}

## Components

| Component | Type | Description | Files | Last Consolidated |
|-----------|------|-------------|-------|-------------------|
| auth | api-gateway | Authentication and session management | [context](auth/context.md) [cases](auth/cases.md) | Phase {id} ({date}) |
| user | | User profile and account operations | [context](user/context.md) [cases](user/cases.md) | Phase {id} ({date}) |

## E2E Flows

| Flow | File | Participants | Last Updated |
|------|------|-------------|--------------|
| Signup | [signup.md](e2e/signup.md) | auth, user | Phase {id} |

## Operation Index

| Operation | Component | Cases Source | Phase |
|-----------|-----------|-------------|-------|
| Auth.Login | auth | [cases.md](auth/cases.md) | {id} |
```

Source: IMPL-SPEC INDEX.md v2 Format section, adapted with "Component"/"Type" columns per D-11.

## State of the Art

| Old Approach (v1) | Current Approach (v2) | When Changed | Impact |
|---|---|---|---|
| Fixed archetype templates (domain-service, gateway-bff, event-driven) | Schema-defined section structures | Phase 9 MODEL.md | Eliminates archetype classification; any project type works |
| `<service>` + `<template_type>` dispatch | `<component>` + `<sections>` + `<conditional_sections>` dispatch | Phase 11 (this phase) | Agent receives explicit section list, not a template selector |
| SERVICE.md service topology classification | schema-parser.ts JSON output | Phase 10 | Tool-based, validated parsing replaces agent inference |
| SR (Service Rule) prefix | CR (Component Rule) prefix | Phase 9 MODEL.md | Terminology alignment with universal model |
| Always-on E2E flow discovery | Opt-in via schema meta.e2eFlows | Phase 9 MODEL.md | Projects without cross-component flows skip E2E entirely |
| v1 SKILL.md (no Agent dispatch) | v2 SKILL.md with Agent tool for subagent dispatch | Phase 11 (this phase) | Parallel agent dispatch, structured return protocols |

**Deprecated/outdated:**
- Three archetype templates (`templates/domain-service.md`, `templates/gateway-bff.md`, `templates/event-driven.md`): These v1 files do not exist in the repository (they were planned but never created). v2 eliminates the template concept entirely.
- Service classification from PROJECT.md topology table: Replaced by schema component registry.
- `consolidate-specs` skill name: Updating to `consolidate` per IMPL-SPEC.

## Open Questions

1. **SKILL.md size management**
   - What we know: The 7+2 step pipeline with error handling, format specs, and dispatch construction is substantial. Claude Code recommends keeping SKILL.md under 500 lines.
   - What's unclear: Whether the complete orchestrator prompt fits in 500 lines.
   - Recommendation: Use supporting files pattern (e.g., `skills/consolidate/formats.md` for INDEX.md and confirmation summary formats). SKILL.md references them with "Read `formats.md` for the INDEX.md template." This is a Claude's discretion area.

2. **JSON in XML dispatch safety**
   - What we know: Schema parser output and hash tool output are JSON. These must be embedded in XML dispatch tags.
   - What's unclear: Whether any edge case in section names/guide text could break XML parsing.
   - Recommendation: Use JSON string encoding (the standard JSON serialization is XML-safe for typical schema content). Note this as a quality gate check for the consolidator.

3. **Orphan cleanup + schema removal (D-15)**
   - What we know: When orphan cleanup removes a `specs/{component}/` directory, also offer to remove from schema.
   - What's unclear: The exact mechanism for schema file editing (the orchestrator has Write tool access, but editing Markdown tables programmatically from a prompt is fragile).
   - Recommendation: The orchestrator should suggest the removal and, on confirmation, use Edit tool to remove the row from the Components table. This is feasible since the table format is known.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Deno | schema-parser.ts, hash-sections.ts | Yes | 2.7.4 | No fallback -- Deno is required |
| Claude Code | Skill/agent execution | Yes | (host environment) | No fallback |
| Git | Step 7 commit/rollback | Yes | (host environment) | No fallback |

No missing dependencies. All tools are available.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Manual validation (Markdown deliverables) + Deno test (existing tools) |
| Config file | None needed for Phase 11 deliverables |
| Quick run command | `deno test --allow-read tools/` (validates existing tools still work) |
| Full suite command | `deno test --allow-read tools/` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PIPE-01 | Orchestrator reads schema to resolve names/sections | manual review | Verify SKILL.md Step 1 references schema-parser.ts correctly | N/A (prompt review) |
| PIPE-02 | Consolidator receives explicit section list | manual review | Verify dispatch tags include `<sections>` and `<conditional_sections>` | N/A (prompt review) |
| PIPE-03 | All 11 merge rules function correctly | manual review | Verify spec-consolidator.md enumerates all 11 rules with v2 terminology | N/A (prompt review) |
| PIPE-04 | INDEX.md uses Component heading with Type column | manual review | Verify SKILL.md Step 3 INDEX.md format uses Component/Type columns | N/A (prompt review) |
| PIPE-05 | specs/{unit}/context.md and cases.md output structure | manual review | Verify output paths in dispatch tags and Step 3 use component names | N/A (prompt review) |
| PIPE-06 | IMPL-SPEC rewritten for universal design | manual review | Verify no archetype references remain, schema-driven pipeline documented | N/A (doc review) |

### Sampling Rate
- **Per task commit:** `deno test --allow-read tools/` (ensure existing tools unbroken)
- **Per wave merge:** Full review of all 3 deliverable files for terminology consistency
- **Phase gate:** Technology neutrality test on all deliverables; verify no "service" in user-facing content

### Wave 0 Gaps
None -- Phase 11 deliverables are Markdown files (prompts and documentation). No new test infrastructure needed. Existing Deno test suite validates that tools consumed by the orchestrator still function correctly.

## Sources

### Primary (HIGH confidence)
- `tools/schema-parser.ts` -- Verified interface definitions, JSON output structure, CLI invocation pattern
- `tools/schema-parser_test.ts` -- 18 test cases confirming parser behavior
- `tools/schema-bootstrap.ts` -- Verified atomic write behavior, starter schema content
- `tools/hash-sections.ts` -- Verified invocation pattern, JSON output format
- `docs/MODEL.md` -- Authoritative v2 model: sections, rules, discovery, conditional evaluation
- `docs/IMPL-SPEC.md` -- v1 pipeline steps, agent contracts, merge rules, verification checks
- `skills/consolidate/SKILL.md` (v1) -- Current orchestrator, rewrite target
- `agents/case-briefer.md` -- Reference for agent frontmatter conventions
- `agents/case-validator.md` -- Reference for read-only agent pattern
- `skills/case/SKILL.md` -- Reference for skill with Agent dispatch pattern

### Secondary (MEDIUM confidence)
- [Claude Code Skills Docs](https://code.claude.com/docs/en/skills) -- SKILL.md frontmatter reference, supporting files pattern, invocation control
- [Claude Code Subagents Docs](https://code.claude.com/docs/en/sub-agents) -- Agent .md frontmatter reference, model options, tool restrictions, dispatch patterns

### Tertiary (LOW confidence)
- None. All findings verified against primary sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All tools and patterns already exist in the codebase; no new dependencies
- Architecture: HIGH -- Pipeline structure is locked (D-04), dispatch contracts are specified in CONTEXT.md
- Pitfalls: HIGH -- Derived from v1 IMPL-SPEC known issues and codebase analysis

**Research date:** 2026-03-31
**Valid until:** 2026-04-30 (stable -- no external dependency changes expected)
