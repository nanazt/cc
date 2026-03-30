# Technology Stack: v2.0 Universal Consolidation Model

**Project:** cckit (Claude Code Toolkit)
**Milestone:** v2.0 Universal Consolidation
**Researched:** 2026-03-31
**Scope:** Stack additions/changes for universal model. Excludes already-validated v1.0 stack (Deno, unified, remark-parse, hash-sections.ts).

## Executive Summary

The universal consolidation model needs **zero new runtime dependencies**. Every change is in the prompt-engineering layer -- skills, agents, and templates -- which are Markdown files consumed by Claude Code. The core design shift: replace 3 hardcoded archetype templates with a single generic template plus a host-project-level override mechanism using the conventions Claude Code already supports.

**Key insight:** The v1.0 IMPL-SPEC's biggest technology-specific assumption is not in the tooling -- it is in the vocabulary. "Service", "archetype", "gRPC interface", "gateway" are all baked into the template schemas and agent prompts. Making this universal is a vocabulary and schema design problem, not a technology problem.

## What Carries Over Unchanged

These are validated in v1.0 and require no changes for universality. Listed for completeness; no re-research performed.

| Layer | Technology | v2.0 Status |
|-------|-----------|-------------|
| Runtime | Deno >= 2.7 | Unchanged. hash-sections.ts is project-type-agnostic (operates on markdown structure, not content semantics). |
| Markdown AST | unified 11.0.5 + remark-parse 11.0.0 + remark-stringify 11.0.0 | Unchanged. |
| Crypto | Web Crypto API (Deno built-in) | Unchanged. |
| Plugin format | SKILL.md + Agent .md (YAML frontmatter + Markdown) | Unchanged format. Content rewrites needed. |
| Testing | Deno test (built-in) | Unchanged for hash tool. New fixture patterns for universal model (see below). |

## What Changes

### 1. Consolidation Unit: "Component" Replaces "Service"

**Problem:** The v1.0 model assumes `specs/{service}/` -- every consolidation target is a "service" in a service-oriented architecture. This fails for CLI tools, libraries, documentation projects, system software.

**Recommendation:** Use "component" as the universal consolidation unit.

| Project Type | Component Maps To | Example |
|-------------|-------------------|---------|
| Microservices | Service | `auth`, `gateway`, `user` |
| Monolith | Module/Package | `billing`, `notifications`, `admin` |
| CLI tool | Subcommand group | `init`, `build`, `deploy` |
| Library | Public API surface | `parser`, `formatter`, `config` |
| Documentation | Section/Chapter | `getting-started`, `api-reference` |
| System software | Subsystem | `scheduler`, `memory-manager`, `fs` |
| Desktop/Mobile app | Feature area | `editor`, `sync`, `settings` |

**Why "component":**
- Deliberately abstract -- no architectural assumption
- Maps naturally to any organizational boundary a project uses
- The host project's PROJECT.md already declares its topology (whatever the project calls its units)
- Developers understand "what are the major parts of your system?" regardless of project type

**Output directory stays `specs/{component}/`** -- the path structure does not change, only the vocabulary in prompts and templates.

**Confidence:** HIGH. This is a naming decision, not a technology decision. The underlying mechanics (file-per-unit, section-based hashing, merge rules) are all unit-name-agnostic.

### 2. Template System: Generic Default + Host Overrides

**Problem:** v1.0 defines 3 archetype templates (`domain-service.md`, `gateway-bff.md`, `event-driven.md`) with archetype detection logic. Adding a new project type means editing the plugin. This violates the technology neutrality principle.

**Recommendation:** Two-layer template system.

#### Layer 1: Generic Default Template (ships with plugin)

A single `templates/default.md` replacing all 3 archetype templates. Contains the minimum sections that apply to ANY component in ANY project type:

```
# {Component} Spec

Last consolidated: Phase {id} (YYYY-MM-DD)

## Purpose

What this component does and why it exists.

## Interface

Operations, endpoints, commands, or public API this component exposes.
Use `{Component}.{Operation}` format for each operation.

## Rules

Business rules, constraints, invariants governing this component's behavior.

## Dependencies

What this component requires from other components or external systems.

## Configuration

Environment variables, feature flags, tunable parameters.
```

**Why these 5 sections:** They pass the universality test. Every component in every project type has a purpose, exposes some interface, follows rules, may depend on other things, and may have configuration. They are also the minimum the consolidator agent needs to produce useful output, and the minimum the case-briefer needs to consume.

**Conditional sections** (included only when the component warrants them):

```
## State Management

(Include when: component manages stateful entities with lifecycle transitions)

## Error Categories

(Include when: component defines its own error taxonomy)

## Event Contracts

(Include when: component produces or consumes events/messages)
```

**What about the detailed v1.0 archetype sections?** They become examples in the host override layer (see Layer 2) or in reference documentation. The generic template intentionally under-specifies. The agent fills in what the phase documents warrant.

#### Layer 2: Host Project Overrides (optional, in host project)

The host project can place custom templates in `.planning/specs/_templates/{name}.md`. The consolidator checks for overrides before falling back to the plugin's default.

**Lookup order (consolidator agent prompt instruction):**

1. `.planning/specs/_templates/{component-name}.md` -- component-specific override
2. `.planning/specs/_templates/default.md` -- project-wide override
3. `${CLAUDE_SKILL_DIR}/templates/default.md` -- plugin default (always present)

**Why `_templates/` with underscore prefix:** Distinguishes the template directory from component spec directories. `specs/auth/` is a component; `specs/_templates/` is configuration. The underscore is a common convention for meta/config directories.

**Why not YAML/JSON schema files:** Markdown templates are self-documenting. The agent reads the template as instructions, not as a schema to parse. Section headings ARE the schema. Guide text below each heading tells the agent what to write there. This is consistent with the entire cckit approach -- everything is prompt content, not data.

**Why not a `consolidate.yaml` config file:** Adding a new config format means adding config validation logic, documentation for the config format, migration handling when the format evolves, and cognitive overhead for users. The template IS the config. Reading a Markdown file with section headings is something Claude already does well.

**Confidence:** HIGH for the approach. `${CLAUDE_SKILL_DIR}` is confirmed available in Claude Code skills (verified via official docs, March 2026). The template lookup is prompt-instructed behavior, not code -- the orchestrator tells the consolidator agent "check for overrides in this order."

### 3. Component Classification: Topology-Driven, Not Detection-Based

**Problem:** v1.0 uses a 2-step detection algorithm: (1) scan CASES.md for `{Service}.{Op}` headings, (2) match against PROJECT.md service topology table. The "archetype determination" from the topology table is hardcoded to 3 types.

**Recommendation:** Drop archetype detection entirely. The consolidator does not need to know the archetype -- it needs to know the template.

**New classification algorithm:**

1. **Operation headings:** Scan CASES.md for `## {Component}.{Op}` headings. Extract unique component names. (Unchanged from v1.0.)
2. **CONTEXT.md component names:** If step 1 yields zero results, scan CONTEXT.md for component names matching PROJECT.md topology. (Unchanged from v1.0.)
3. **Template resolution:** For each component, resolve the template using the 3-level lookup order above. No archetype mapping needed.
4. **On miss:** If both steps yield zero components, ask the developer. (Unchanged from v1.0.)

**What disappears:** The `<template_type>` dispatch tag in the consolidator input contract. Replaced by `<template_path>` pointing to the resolved template file. The consolidator reads the template and follows its section structure.

**What stays:** The `{Component}.{Operation}` naming convention is universal. It works for `Auth.Login`, `CLI.Init`, `Parser.Tokenize`, `GettingStarted.QuickStart` (docs), `Scheduler.DispatchJob` (system software). No change needed.

**Confidence:** HIGH. The naming convention was already universal in v1.0 by accident -- it just used service-centric vocabulary to describe it.

### 4. Merge Rules: What Changes, What Stays

| Rule | v1.0 | v2.0 | Change |
|------|------|------|--------|
| Operation-level replacement | Per-service | Per-component | Vocabulary only |
| PR-to-SR promotion | SR = Service Rule | SR = Spec Rule (or keep Service Rule -- see below) | Potentially rename |
| TR exclusion | Unchanged | Unchanged | None |
| R-to-OR transformation | Unchanged | Unchanged | None |
| GR reference-only | GR = Global Rule (from PROJECT.md) | Unchanged | None |
| Superseded operations | Unchanged | Unchanged | None |
| Superseded rules | Unchanged | Unchanged | None |
| Section-level rewrite | Per archetype sections | Per template sections | Template-driven |
| Provenance tagging | Unchanged | Unchanged | None |
| Forward Concerns exclusion | Unchanged | Unchanged | None |
| Phase-contextual exclusion | Unchanged | Unchanged | None |

**The SR naming question:** "Service Rule" becomes awkward for a CLI tool or library. Options:

| Option | Pros | Cons |
|--------|------|------|
| Keep SR = Service Rule | No migration, all docs/examples stay valid | Misleading for non-service projects |
| Rename SR = Spec Rule | Accurate for all project types, S still works | Migration in all docs, existing projects |
| Rename SR = Scoped Rule | Describes the actual semantics (component-scoped) | "Scoped" is less intuitive than "Spec" |

**Recommendation:** Rename to "Spec Rule" (SR stays SR). The abbreviation does not change, so existing CASES.md files, agent prompts, and verifier checks all continue to work. Only the expanded name changes in documentation and guide text. Zero migration cost.

**Confidence:** HIGH. The abbreviation does not change, and the rename happens only in prose.

### 5. Verification Checks: Universality Audit

The v1.0 IMPL-SPEC defines 28 verification checks. Most are already universal. The archetype-specific ones need changes:

| Check | v1.0 | v2.0 Change |
|-------|------|-------------|
| V-04 | "Archetype-appropriate sections present" | "Template-appropriate sections present" -- compare against resolved template |
| V-11 | "Gateway routes resolve" | Drop or generalize to "Interface references resolve" -- not all components have routes |
| V-27 | "specs/ service list matches PROJECT.md service topology" | "specs/ component list matches PROJECT.md topology" -- vocabulary only |

All other checks (V-01 through V-29 excluding V-04, V-11, V-27) are already universal -- they operate on structural patterns (provenance tags, section emptiness, operation naming, rule formatting) that are project-type-agnostic.

**V-11 specifically:** This check assumed a gateway with route-to-backend-operation mappings. In the universal model, this becomes: "Interface cross-references resolve -- operations referenced in one component's spec exist in the referenced component's spec." Same semantic check, broader applicability.

**Confidence:** HIGH. The verification framework is structurally sound; only vocabulary and a few check definitions need updating.

### 6. E2E Flows: Optional, Not Assumed

**Problem:** v1.0 treats E2E flows as a standard pipeline step (Step 3.5, Step 4). But E2E cross-component flows only make sense when components interact (multi-service systems, multi-module monoliths with inter-module calls). For a CLI tool, a library, or a documentation project, there are no "cross-component flows."

**Recommendation:** Make E2E flow generation explicitly conditional.

**Trigger condition:** E2E flows are generated ONLY when the project topology in PROJECT.md declares inter-component communication. The orchestrator checks for this before Step 3.5.

**Detection heuristic (prompt-instructed, not code):** "Does PROJECT.md describe communication between components (API calls, event subscriptions, shared state, message passing)? If yes, E2E flows apply. If the project is a standalone tool, library, or documentation project with no inter-component communication, skip E2E flows entirely."

**Impact on pipeline:** Step 3.5 and Step 4 become conditional. The orchestrator skips them with a log message: "No inter-component flows detected. Skipping E2E generation." This is already the v1.0 behavior for the "no cross-service dependencies" case -- it just needs to be the expected default, not the exception.

**Confidence:** HIGH. This is a prompt-level change in the orchestrator SKILL.md. No tooling changes.

### 7. Agent Model Assignments: Unchanged

| Agent | Model | v2.0 Status |
|-------|-------|-------------|
| spec-consolidator | sonnet | Unchanged. Template-following consolidation is well within sonnet capability. |
| e2e-flows | sonnet | Unchanged (when E2E applies). |
| spec-verifier | opus | Unchanged. Verification reasoning depth hasn't changed. Still a downgrade candidate after usage data. |

No model changes. The universal model does not increase reasoning difficulty -- it reduces template complexity (fewer sections to match) and removes archetype classification (less branching logic for agents).

## What NOT to Add

These were considered and explicitly rejected for v2.0.

### Do Not Add: Schema Definition Language

**Temptation:** Define a formal schema language (YAML, JSON Schema, custom DSL) for specifying template section structures, required vs optional sections, validation rules, and conditional inclusion logic.

**Why not:** The template Markdown file IS the schema. Adding a separate schema definition language means: (1) maintaining two representations of the same information, (2) building a parser/validator for the schema format, (3) documenting the schema language, (4) debugging schema-vs-template mismatches. The agent reads the template headings and guide text directly. Markdown is the schema language.

### Do Not Add: Project Type Detection

**Temptation:** Build a classifier that reads the host project's files (package.json, Cargo.toml, go.mod, Makefile) and determines the project type, then selects an appropriate template.

**Why not:** This is the archetype detection problem from v1.0 at a larger scale. The host project tells us its topology in PROJECT.md. If PROJECT.md does not declare a topology, the developer provides one. The plugin never needs to guess. Detection logic is fragile, incomplete, and creates a maintenance burden of supporting every project type.

### Do Not Add: Template Inheritance / Composition

**Temptation:** Let templates extend or compose other templates (`extends: default`, `includes: [error-categories, state-management]`).

**Why not:** This adds a template processing engine. The problem is small enough to solve with flat files. A project override template is a complete replacement, not a delta. If a project wants 3 sections from the default and 2 custom ones, they write a 5-section template. Copy-paste is simpler than inheritance for files this small (10-30 lines).

### Do Not Add: YAML Configuration File for Consolidation

**Temptation:** Create a `.planning/consolidate.yaml` or `specs/config.yaml` that configures the consolidation pipeline (component mappings, template assignments, rule tier settings, E2E flow preferences).

**Why not:** Configuration accumulates. Every config key needs documentation, default values, migration when the schema changes, and validation. For v2.0, the template files + PROJECT.md topology provide all configuration needed. If configuration complexity grows in the future, evaluate then -- but do not pre-build infrastructure for imagined future needs.

### Do Not Add: Runtime Schema Validation Tool

**Temptation:** Build a Deno tool (like hash-sections.ts) that validates spec files against their template schema.

**Why not:** The spec-verifier agent already does this (V-04 check: template-appropriate sections present). Adding a Deno validation tool duplicates the verifier's job in a different format. The verifier is better at this because it can reason about "close enough" and "technically missing but covered by another section" -- a structural validator cannot.

### Do Not Add: Multiple Template Formats

**Temptation:** Support YAML templates alongside Markdown templates, or support both inline template definitions (in SKILL.md) and file-based templates.

**Why not:** One format. Markdown. Agents read Markdown. Templates are Markdown. Specs are Markdown. Adding a second format doubles the surface area for bugs and documentation.

## File Inventory Changes (v1.0 to v2.0)

| v1.0 File | v2.0 Replacement | Change Type |
|-----------|-------------------|-------------|
| `templates/domain-service.md` | `templates/default.md` | Replace (3 files -> 1) |
| `templates/gateway-bff.md` | (removed) | Covered by default + host overrides |
| `templates/event-driven.md` | (removed) | Covered by default + host overrides |
| `agents/spec-consolidator.md` | `agents/spec-consolidator.md` | Rewrite (remove archetype references) |
| `agents/e2e-flows.md` | `agents/e2e-flows.md` | Minor rewrite (vocabulary only) |
| `agents/spec-verifier.md` | `agents/spec-verifier.md` | Minor rewrite (V-04, V-11, V-27 updates) |
| `skills/consolidate/SKILL.md` | `skills/consolidate/SKILL.md` | Rewrite (remove archetype detection, add template lookup, conditional E2E) |
| (new) | `templates/examples/` | New directory with example host-override templates for common project types |
| `hash-sections.ts` | `hash-sections.ts` | Unchanged |
| `hash-sections_test.ts` | `hash-sections_test.ts` | Unchanged |

## Template Examples Directory

**Not part of the runtime.** A `templates/examples/` directory ships with the plugin containing non-functional example templates that developers can copy into their host project's `specs/_templates/`:

| Example | For Project Types Like | Key Sections |
|---------|----------------------|--------------|
| `microservice.md` | Backend services, APIs | Domain Model, Adapter Contracts, Service Interface, Error Categories |
| `cli-tool.md` | CLI applications | Command Interface, Argument Parsing, Output Formats |
| `library.md` | Reusable libraries, SDKs | Public API, Type Contracts, Error Handling |
| `documentation.md` | Doc sites, knowledge bases | Content Structure, Cross-References, Audience |

These are reference material, not active templates. The skill never reads from `examples/`. Their purpose is reducing the "blank page" problem for users creating host overrides.

**Confidence:** MEDIUM. The specific example categories and sections are speculative -- they should be refined based on real usage. The mechanism (reference examples, not functional templates) is HIGH confidence.

## Integration with Existing Hash Tool

The hash tool (`hash-sections.ts`) operates on H2 section headings. It does not know or care what those headings say. A spec with `## Domain Model` and a spec with `## Command Interface` are processed identically.

**No changes needed.** The hash tool is already universal.

The only interaction point: the E2E flows agent uses hashes from the hash tool to detect spec changes. If a component's spec sections change (regardless of what those sections are called), the hash changes, and the E2E flow referencing that spec is flagged for regeneration. This mechanism is heading-name-agnostic.

## Testing Impact

### Hash Tool Tests: No Change

The 10 existing test cases in `hash-sections_test.ts` are structure-based (H2 extraction, code block handling, normalization). They do not reference service-specific content. Already universal.

### Skill/Agent Test Fixtures: New

For v2.0, test fixtures should cover:

| Fixture Category | Purpose |
|-----------------|---------|
| Generic component (minimal template) | Validates basic consolidation with default template |
| Component with host override template | Validates template lookup order |
| Non-service project (CLI tool) | Validates vocabulary neutrality |
| Multi-component project without E2E | Validates E2E skip path |

These are prompt-based (fixture input -> expected output assertions). No new tooling needed.

**Confidence:** MEDIUM. Fixture design depends on final template format decisions during implementation.

## Recommended Stack Summary

| Layer | Technology | Change from v1.0 |
|-------|-----------|------------------|
| Runtime | Deno >= 2.7 | None |
| Markdown AST | unified + remark-parse + remark-stringify | None |
| Crypto | Web Crypto API | None |
| Plugin format | SKILL.md + Agent .md | None (format unchanged, content rewritten) |
| Templates | Single `default.md` + host override lookup | Replace 3 archetypes with 1 default + override mechanism |
| Agent models | sonnet (consolidator, e2e) + opus (verifier) | None |
| Schema format | Markdown (template headings = schema) | Explicit decision: no YAML/JSON schema |
| Config | PROJECT.md topology + template files | Explicit decision: no separate config file |
| Testing | Deno test + prompt-based fixtures | New fixtures for universal scenarios |

## Sources

- [Claude Code Skills Docs](https://code.claude.com/docs/en/skills) -- `${CLAUDE_SKILL_DIR}` reference, supporting files pattern, template conventions (verified March 2026)
- [Claude Code Subagents Docs](https://code.claude.com/docs/en/sub-agents) -- Agent .md frontmatter, model options (verified March 2026)
- [Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) -- Keeping SKILL.md focused, reference file patterns
- [Agent Skills Standard](https://agentskills.io) -- Open standard for skill format
- v1.0 research: `.planning/research/STACK.md` (2026-03-30) -- Deno, unified, remark-parse validation
- v1.0 IMPL-SPEC: `docs/IMPL-SPEC.md` -- Current design being replaced
