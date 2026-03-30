# Phase 2: Templates - Research

**Researched:** 2026-03-31
**Domain:** Markdown template authoring (service archetype schemas for spec-consolidator)
**Confidence:** HIGH

## Summary

Phase 2 produces three Markdown template files that serve as the schema contract between the orchestrator and the spec-consolidator agent. Each template defines the H2 section structure for a service archetype (domain-service, gateway-bff, event-driven), including section purpose descriptions, table column schemas where applicable, and cases.md format with placeholder notation.

This is a pure content-authoring phase with no code, no runtime dependencies, and no external tools. The authoritative source for section names, counts, and conditional markers is IMPL-SPEC.md lines 112-177. The v1 SKILL.md (lines 76-151) contains inline v1 templates that demonstrate the old section names -- these are superseded by the IMPL-SPEC v2 definitions and must NOT appear in the new files.

**Primary recommendation:** Implement the three templates sequentially (domain-service first as reference, then gateway-bff and event-driven), validating each against IMPL-SPEC section counts and the v1-to-v2 rename table before moving to the next.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Schema + guide approach. Each section includes: H2 heading, purpose description (what belongs in this section), and table column schema where applicable. No example data -- only structural placeholders using `{placeholder}` notation.
- **D-02:** Rationale: consolidator agent needs enough context to structure output correctly, but example data risks being copied verbatim or confused with real content.
- **D-03:** Templates live at `skills/consolidate/templates/` per IMPL-SPEC. Three files: `domain-service.md`, `gateway-bff.md`, `event-driven.md`.
- **D-04:** Rationale: unlike `tools/hash-sections.ts` (extracted for cross-skill reuse), templates are consolidate-specific assets. Keeping them inside the skill directory maintains cohesion.
- **D-05:** Inline `(conditional)` marker on the heading. Example: `## State Management (conditional)`. Guide text below the heading explains the inclusion condition in behavioral terms.
- **D-06:** Three conditional sections total: Domain service State Management, Gateway/BFF Identity Propagation, Event-driven State Management.
- **D-07:** Full operation structure with placeholder notation. Template includes one example operation showing: `## {Service}.{Operation}` heading, Service Rules (SR-N), Operation Rules (OR-N), Side Effects, and Cases table (S/F/E with Expected Outcome columns). All using `{placeholder}` style -- no real data.
- **D-08:** Event-driven archetype uses `{Service}.On{Event}` operation naming pattern per IMPL-SPEC.
- **D-09:** All guide text uses role-based language, not protocol-specific language.
- **D-10:** Judgment criteria expressed as behavioral tests, not technology checks.
- **D-11:** Technology neutrality principle codified in CLAUDE.md.
- **D-12:** Gateway template includes cases.md section with a condition guide at the top. The guide states the "judgment seat" test criteria in technology-neutral behavioral terms.
- **D-13:** Templates use v2 names only. No v1 names appear in template files.
- **D-14:** v1-to-v2 name mapping is the consolidator agent's responsibility (Phase 3). Templates define the target state.

### Claude's Discretion
- Exact wording of guide text within each section
- Table column ordering within section schemas
- Whether to include a brief preamble at the top of each template file explaining its purpose
- Internal organization of the cases.md template section

### Deferred Ideas (OUT OF SCOPE)
- Template versioning mechanism (if template sections change in future, how to handle existing specs)
- Template validation tool (lint check that template sections match IMPL-SPEC)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TMPL-01 | Domain service template defines 8 context.md sections (Domain Model, Adapter Contracts, Business Rules, Error Categories, Service Interface, Configuration, Cross-Service Dependencies, State Management) | IMPL-SPEC lines 125-135 define exact section names and descriptions. D-01/D-05 define content depth and conditional marker format. |
| TMPL-02 | Domain service template defines cases.md format (per-operation sections with SR, OR, Side Effects, Cases table) | IMPL-SPEC lines 137-139 define format. D-07 specifies placeholder approach with one example operation. |
| TMPL-03 | Gateway/BFF template defines 7 context.md sections (Route/Endpoint Table, Middleware Stack, Composition Patterns, Error Translation, External API Conventions, Configuration, Identity Propagation) | IMPL-SPEC lines 141-151 define exact section names. D-05/D-06 define conditional Identity Propagation. |
| TMPL-04 | Gateway cases.md is conditional -- only when gateway has behavioral operations passing "judgment seat" test | IMPL-SPEC line 152 defines condition. D-12 specifies the guide states the test criteria in behavioral terms. |
| TMPL-05 | Event-driven template defines 7 context.md sections (Event Subscriptions, Event Publications, Processing Logic, Idempotency, Error Categories, Configuration, State Management) | IMPL-SPEC lines 154-164 define exact section names. D-06/D-08 define conditional State Management and `On{Event}` naming. |
| TMPL-06 | v1-to-v2 section renames applied (Ports->Adapter Contracts, gRPC Interface->Service Interface, Orchestration Patterns->Composition Patterns, Error Handling->Error Translation, REST Conventions->External API Conventions) | IMPL-SPEC lines 167-177 define the full rename table. D-13 locks templates to v2 names only. |
</phase_requirements>

## Standard Stack

Not applicable -- this phase produces pure Markdown files. No libraries, runtimes, or build tools involved.

The only relevant "technology" is the Markdown formatting conventions established in the project:
- H2 headings for sections
- `{placeholder}` notation for structural examples
- `(conditional)` inline markers on headings
- Markdown tables for schemas

## Architecture Patterns

### File Location and Naming

Per D-03 and IMPL-SPEC File Inventory item #7-9:

```
skills/consolidate/templates/
  domain-service.md      # 8 context.md sections + cases.md format
  gateway-bff.md         # 7 context.md sections + conditional cases.md
  event-driven.md        # 7 context.md sections + cases.md format
```

The `skills/consolidate/templates/` directory does not exist yet and must be created.

### Template Internal Structure

Each template file follows this pattern (per D-01, D-05):

```markdown
# {Archetype} Template

> [Optional preamble -- Claude's discretion]

## Section Name

{Purpose description: what belongs in this section}

{Table column schema or structural guidance, if applicable}

## Section Name (conditional)

**Include when:** {behavioral condition in technology-neutral language}

{Purpose description}
```

### cases.md Section Structure

Per D-07, each template includes a cases.md section demonstrating the operation format with placeholders:

```markdown
# cases.md

## {Service}.{Operation}

### Service Rules

| ID | Rule |
|----|------|
| SR-{N} | {rule description} `(Source: Phase {id})` |

### Operation Rules

| ID | Rule |
|----|------|
| OR-{N} | {rule description} |

### Side Effects

- {side effect description}

### Cases

| Type | ID | Case | Expected Outcome |
|------|----|------|------------------|
| S | S1 | {success scenario} | {expected result including side effects} |
| F | F1 | {failure scenario} | {expected error, side effects NOT triggered} |
| E | E1 | {edge case scenario} | {expected behavior} |
```

### Archetype-Specific Variations

| Archetype | Operation Naming | cases.md | Conditional Sections |
|-----------|-----------------|----------|---------------------|
| domain-service | `{Service}.{Operation}` | Always present | State Management |
| gateway-bff | `{Service}.{Operation}` | Conditional (judgment seat test) | Identity Propagation |
| event-driven | `{Service}.On{Event}` | Always present | State Management |

### v1-to-v2 Rename Table (reference only -- templates use v2 names exclusively)

| v1 Name (SKILL.md) | v2 Name (Templates) |
|---------------------|---------------------|
| Ports | Adapter Contracts |
| gRPC Interface | Service Interface |
| Orchestration Patterns | Composition Patterns |
| Error Handling | Error Translation |
| REST Conventions | External API Conventions |

Per D-13/D-14: templates contain v2 names ONLY. The rename mapping is the consolidator's concern (Phase 3).

## Don't Hand-Roll

Not applicable -- there are no libraries or tools to evaluate for this phase. Templates are handwritten Markdown.

## Common Pitfalls

### Pitfall 1: Section Count Mismatch
**What goes wrong:** Template has wrong number of sections (missing or extra H2 headings).
**Why it happens:** IMPL-SPEC defines exact section lists per archetype. Easy to miss one or add an extra.
**How to avoid:** Count H2 headings after writing each template. Domain-service: 8 context + cases. Gateway: 7 context + conditional cases. Event-driven: 7 context + cases.
**Warning signs:** Spec-verifier V-04 check (Phase 7) validates output sections against archetype template. Wrong count will propagate through the entire pipeline.

### Pitfall 2: v1 Names Leaking Into Templates
**What goes wrong:** Using "Ports" instead of "Adapter Contracts", "gRPC Interface" instead of "Service Interface", etc.
**Why it happens:** The v1 SKILL.md (currently deployed, lines 76-151) uses old names. Copy-pasting from there introduces v1 terminology.
**How to avoid:** Use IMPL-SPEC lines 125-165 as the authoritative section name source. Never reference the v1 SKILL.md inline templates.
**Warning signs:** Any of these strings in templates: "Ports", "gRPC Interface", "Orchestration Patterns", "Error Handling" (as a section heading), "REST Conventions".

### Pitfall 3: Technology-Specific Language in Guide Text
**What goes wrong:** Guide text says "gRPC methods", "REST endpoints", "Kafka topics", "SQL tables" instead of neutral equivalents.
**Why it happens:** Natural to write in familiar terms. CLAUDE.md Technology Neutrality section exists specifically to prevent this.
**How to avoid:** Apply the neutrality test from CLAUDE.md: "Could a team using Python/Django, Rust/Axum, Go/gRPC, or Node/Express install this and use it without editing the plugin?" Use "operations", "events consumed/produced", "entities", "fields".
**Warning signs:** Any protocol name, framework name, or infrastructure product name appearing in template guide text.

### Pitfall 4: Example Data Instead of Structural Placeholders
**What goes wrong:** Template includes realistic-looking data (service names, field names, error codes) that the consolidator copies verbatim.
**Why it happens:** Desire to make templates "helpful" with examples. D-02 explicitly rejects this.
**How to avoid:** Use only `{placeholder}` notation: `{Service}`, `{Operation}`, `{Entity}`, `{field_name}`, `{error_identifier}`. Never use real service names or concrete values.
**Warning signs:** Any capitalized proper noun, any concrete field name like `email` or `user_id`, any specific HTTP status code.

### Pitfall 5: Missing Conditional Marker
**What goes wrong:** Conditional section heading lacks the `(conditional)` marker or the behavioral inclusion condition.
**Why it happens:** Writing the section and forgetting the marker is easy. Three sections across two templates need it.
**How to avoid:** Checklist -- Domain: State Management (conditional). Gateway: Identity Propagation (conditional). Event-driven: State Management (conditional). Each must have `**Include when:**` guide text with behavioral condition.
**Warning signs:** An H2 heading for a conditional section without `(conditional)` suffix.

### Pitfall 6: Gateway cases.md Missing Judgment Seat Criteria
**What goes wrong:** Gateway template's cases.md section doesn't explain WHEN to include it, or explains it in technology-specific terms.
**Why it happens:** The conditional nature of gateway cases.md is unique -- the other two archetypes always include cases.md.
**How to avoid:** D-12 specifies: the guide states behavioral criteria -- "qualifies when operations examine state, apply rules, and branch to different outcomes; does NOT qualify for translation, passthrough, or deterministic mapping."
**Warning signs:** Missing condition guide at top of gateway cases.md section, or criteria mentioning specific technologies.

## Code Examples

Not applicable in the traditional sense (no code). Instead, here are the authoritative section definitions from IMPL-SPEC that templates must implement:

### Domain Service context.md Sections (IMPL-SPEC lines 127-135)
1. Domain Model -- entities, fields, constraints
2. Adapter Contracts -- trait interfaces and method signatures (renamed from "Ports")
3. Business Rules -- service-level rules with SR references and provenance
4. Error Categories -- table: Category, Identifier, Description
5. Service Interface -- operations in `{Service}.{Op}` format (renamed from "gRPC Interface")
6. Configuration -- environment variables and tunable parameters
7. Cross-Service Dependencies -- what this service requires from others
8. State Management (conditional) -- stateful entity lifecycle, if applicable

### Gateway/BFF context.md Sections (IMPL-SPEC lines 143-150)
1. Route/Endpoint Table -- table: Tier, Method, Path, Description, Source
2. Middleware Stack -- ordered middleware with purpose
3. Composition Patterns -- how gateway composes backend calls (renamed from "Orchestration Patterns")
4. Error Translation -- REST error format, gRPC-to-HTTP mapping (renamed from "Error Handling")
5. External API Conventions -- naming, pagination, request/response patterns (renamed from "REST Conventions")
6. Configuration -- environment variables, listen address, timeouts
7. Identity Propagation (conditional) -- how caller identity flows to backend services

### Event-Driven context.md Sections (IMPL-SPEC lines 156-163)
1. Event Subscriptions -- events consumed, source services
2. Event Publications -- events produced, consumer services
3. Processing Logic -- how events are processed
4. Idempotency -- deduplication and exactly-once semantics
5. Error Categories -- table: Category, Identifier, Description
6. Configuration -- environment variables, queue settings
7. State Management (conditional) -- stateful processing if applicable

### cases.md Format (IMPL-SPEC lines 137-139, 152, 165)
- Domain service: per-operation sections using `## {Service}.{Op}` headings. Each contains SR-N, OR-N, Side Effects, Cases table.
- Gateway/BFF: conditional. Only when operations pass judgment seat test.
- Event-driven: standard format with `{Service}.On{Event}` naming pattern.

## State of the Art

| Old Approach (v1 SKILL.md) | Current Approach (v2 Templates) | Impact |
|----------------------------|--------------------------------|--------|
| Inline templates in SKILL.md | Separate template files in `templates/` dir | Consolidator reads templates as structured data; templates can evolve independently of skill logic |
| "Ports" section | "Adapter Contracts" section | Removes hexagonal architecture jargon |
| "gRPC Interface" section | "Service Interface" section | Removes protocol assumption |
| "Orchestration Patterns" section | "Composition Patterns" section | Removes integration pattern assumption |
| "Error Handling" section | "Error Translation" section | More specific to gateway role |
| "REST Conventions" section | "External API Conventions" section | Removes protocol assumption |
| Single flat `{service}.md` spec file | Split `context.md` + `cases.md` per service dir | Separation of concerns; hash tool operates on individual files |
| No conditional sections | `(conditional)` marker + behavioral condition | Consolidator knows when to include/omit sections |
| No cases.md template | Full operation structure with placeholders | Consolidator has schema for SR/OR/Side Effects/Cases table format |

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Manual verification (no automated test framework for Markdown templates) |
| Config file | none |
| Quick run command | Visual inspection + H2 heading count |
| Full suite command | Grep-based validation (see below) |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TMPL-01 | Domain service has 8 context.md sections | smoke | `grep -c "^## " skills/consolidate/templates/domain-service.md` (expect 8 in context + cases heading count) | Wave 0 |
| TMPL-02 | Domain service cases.md format present | smoke | `grep -c "Service Rules\|Operation Rules\|Side Effects\|Cases" skills/consolidate/templates/domain-service.md` | Wave 0 |
| TMPL-03 | Gateway has 7 context.md sections | smoke | `grep -c "^## " skills/consolidate/templates/gateway-bff.md` | Wave 0 |
| TMPL-04 | Gateway cases.md is conditional with judgment seat criteria | manual-only | Visual: verify condition guide at top of cases.md section | N/A |
| TMPL-05 | Event-driven has 7 context.md sections | smoke | `grep -c "^## " skills/consolidate/templates/event-driven.md` | Wave 0 |
| TMPL-06 | No v1 section names present | smoke | `grep -i "^## Ports\|^## gRPC Interface\|^## Orchestration Patterns\|^## Error Handling$\|^## REST Conventions" skills/consolidate/templates/*.md` (expect 0 matches) | Wave 0 |

### Sampling Rate
- **Per task commit:** H2 heading count + v1 name absence check
- **Per wave merge:** Full section-by-section comparison against IMPL-SPEC
- **Phase gate:** All 6 TMPL requirements verified via grep + visual inspection

### Wave 0 Gaps
- [ ] `skills/consolidate/templates/` directory -- must be created
- [ ] No automated test file needed -- templates are static Markdown validated by grep commands and visual inspection

## Open Questions

1. **Template preamble inclusion**
   - What we know: D-01 defines section structure. Claude's Discretion includes "Whether to include a brief preamble at the top of each template file explaining its purpose."
   - What's unclear: Whether a preamble helps or clutters. The consolidator agent reads these files -- a preamble could provide useful framing or be noise.
   - Recommendation: Include a short preamble (2-3 lines) stating the archetype name and that this template defines the section schema. Low risk, potentially helpful for agent context.

2. **Error Categories table format consistency**
   - What we know: IMPL-SPEC specifies "table: Category, Identifier, Description" for domain-service and event-driven Error Categories sections.
   - What's unclear: Whether the template should show the table header row as a Markdown table or describe it in prose.
   - Recommendation: Show it as a Markdown table header with `{placeholder}` rows per D-01. This is unambiguous for the consolidator.

## Project Constraints (from CLAUDE.md)

- **Content language:** All content in English
- **Technology neutrality:** Templates must pass the neutrality test -- "Could a team using Python/Django, Rust/Axum, Go/gRPC, or Node/Express install this and use it without editing the plugin?"
- **No hardcoded project references:** Skills and agents must be technology-neutral and project-neutral
- **Commit conventions:** Conventional Commits 1.0.0. Scope is a codebase noun (e.g., `feat(consolidate): add service archetype templates`), never a phase number.
- **GSD conventions:** Depends on CONTEXT.md, CASES.md, ROADMAP.md, PROJECT.md phase directory structure

## Sources

### Primary (HIGH confidence)
- `docs/IMPL-SPEC.md` lines 112-177 -- authoritative template specification (section names, counts, conditionals, v1-v2 renames)
- `docs/IMPL-SPEC.md` lines 179-274 -- spec-consolidator agent contract (shows how templates are consumed)
- `.planning/phases/02-templates/02-CONTEXT.md` -- 14 locked decisions (D-01 through D-14)
- `.planning/REQUIREMENTS.md` -- TMPL-01 through TMPL-06 acceptance criteria
- `CLAUDE.md` Technology Neutrality section -- neutrality test and exceptions

### Secondary (HIGH confidence -- project artifacts)
- `skills/consolidate/SKILL.md` -- v1 templates (lines 76-151) showing old section names to avoid
- `tools/hash-sections.ts` -- established code patterns (position-offset approach, import conventions) though not directly relevant to Markdown authoring
- `docs/IMPL-SPEC.md` lines 464-600 -- orchestrator pipeline showing how templates feed into dispatch

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no stack, pure Markdown
- Architecture: HIGH -- file locations and structure locked by IMPL-SPEC + CONTEXT.md decisions
- Pitfalls: HIGH -- identified from direct comparison of v1 SKILL.md vs v2 IMPL-SPEC definitions

**Research date:** 2026-03-31
**Valid until:** Indefinite (templates are static content, no version-sensitive dependencies)
