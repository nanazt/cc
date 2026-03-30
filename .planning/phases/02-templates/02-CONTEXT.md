# Phase 2: Templates - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Service archetype templates that define the section schema for each archetype. The spec-consolidator agent reads these templates to know which sections to produce when consolidating phase planning documents into per-service spec files. Three archetypes: domain-service, gateway-bff, event-driven. Each defines a context.md section schema and a cases.md format.

</domain>

<decisions>
## Implementation Decisions

### Template content depth
- **D-01:** Schema + guide approach. Each section includes: H2 heading, purpose description (what belongs in this section), and table column schema where applicable. No example data — only structural placeholders using `{placeholder}` notation.
- **D-02:** Rationale: consolidator agent needs enough context to structure output correctly, but example data risks being copied verbatim or confused with real content.

### Template file location
- **D-03:** Templates live at `skills/consolidate/templates/` per IMPL-SPEC. Three files: `domain-service.md`, `gateway-bff.md`, `event-driven.md`.
- **D-04:** Rationale: unlike `tools/hash-sections.ts` (extracted for cross-skill reuse), templates are consolidate-specific assets. Keeping them inside the skill directory maintains cohesion.

### Conditional section handling
- **D-05:** Inline `(conditional)` marker on the heading. Example: `## State Management (conditional)`. Guide text below the heading explains the inclusion condition in behavioral terms.
- **D-06:** Three conditional sections total:
  - Domain service: State Management (conditional) — include when service manages long-lived stateful entities
  - Gateway/BFF: Identity Propagation (conditional) — include when caller identity flows to backend services
  - Event-driven: State Management (conditional) — include when service has stateful event processing

### cases.md template detail
- **D-07:** Full operation structure with placeholder notation. Template includes one example operation showing: `## {Service}.{Operation}` heading, Service Rules (SR-N), Operation Rules (OR-N), Side Effects, and Cases table (S/F/E with Expected Outcome columns). All using `{placeholder}` style — no real data.
- **D-08:** Event-driven archetype uses `{Service}.On{Event}` operation naming pattern per IMPL-SPEC.

### Technology neutrality
- **D-09:** All guide text uses role-based language, not protocol-specific language. "Operations this service exposes" instead of "gRPC methods" or "REST endpoints". "Events consumed/produced" instead of "Kafka topics" or "RabbitMQ queues".
- **D-10:** Judgment criteria (e.g., gateway cases.md conditional) expressed as behavioral tests: "does the code examine state, apply rules, and branch to different outcomes?" — not technology checks.
- **D-11:** This principle is now codified in CLAUDE.md under "Technology Neutrality" section for all future work on this project.

### Gateway cases.md conditional
- **D-12:** Gateway template includes cases.md section with a condition guide at the top. The guide states the "judgment seat" test criteria in technology-neutral behavioral terms: qualifies when operations examine state, apply rules, and branch; does not qualify for translation, passthrough, or deterministic mapping.

### v1-to-v2 section renames
- **D-13:** Templates use v2 names only (Adapter Contracts, Service Interface, Composition Patterns, Error Translation, External API Conventions). No v1 names appear in template files.
- **D-14:** v1→v2 name mapping is the consolidator agent's responsibility (Phase 3) when processing existing specs that use old names. Templates define the target state.

### Claude's Discretion
- Exact wording of guide text within each section
- Table column ordering within section schemas
- Whether to include a brief preamble at the top of each template file explaining its purpose
- Internal organization of the cases.md template section

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Template specification
- `docs/IMPL-SPEC.md` — Templates section (lines 112-177): three archetypes with exact section lists, conditional sections, cases.md format, v1→v2 rename table. This is the authoritative source for section names and counts.

### Requirements
- `.planning/REQUIREMENTS.md` — TMPL-01 through TMPL-06: acceptance criteria for all three archetypes and v1→v2 renames

### Technology neutrality principle
- `CLAUDE.md` — "Technology Neutrality" section: default stance, exceptions, and the neutrality test. All template content must pass this test.

### Prior phase context
- `.planning/phases/01-hash-tool/01-CONTEXT.md` — D-08/D-09 (file location precedent), D-07 (version pinning pattern)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `skills/consolidate/SKILL.md`: v1 orchestrator — will reference templates via relative path `templates/domain-service.md` etc.
- `tools/hash-sections.ts`: Phase 1 deliverable — not directly used by templates but establishes Deno/TypeScript patterns in the project

### Established Patterns
- YAML frontmatter + Markdown body pattern used by skills and agents
- Templates are pure Markdown (no frontmatter needed) — they are data files read by the consolidator agent, not executable artifacts
- `{placeholder}` notation for structural examples (no real data in templates)

### Integration Points
- spec-consolidator agent (Phase 3) reads templates to determine section structure per archetype
- Orchestrator SKILL.md Step 1 determines archetype from host PROJECT.md, then passes template reference to consolidator
- spec-verifier V-04 check (Phase 7) validates output sections against archetype template

</code_context>

<specifics>
## Specific Ideas

- Templates are the "contract" between the orchestrator and consolidator — if a section is in the template, the consolidator must produce it (or justify omission for conditional sections)
- The `(conditional)` marker on headings doubles as documentation and machine-readable signal

</specifics>

<deferred>
## Deferred Ideas

- Template versioning mechanism (if template sections change in future, how to handle existing specs) — defer to v2 requirements
- Template validation tool (lint check that template sections match IMPL-SPEC) — could be useful but not required for v1

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-templates*
*Context gathered: 2026-03-30*
