# Phase 11: Consolidation Pipeline - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Rewrite the consolidation orchestrator (SKILL.md), create the spec-consolidator and e2e-flows agents, all using schema-driven dispatch instead of archetype classification. The full consolidation cycle runs end-to-end reading the schema file to resolve component names, section structures, and conditional sections.

**Deliverables:**
- `skills/consolidate/SKILL.md` (rewrite)
- `agents/spec-consolidator.md` (new)
- `agents/e2e-flows.md` (new)

**Not in scope:** spec-verifier agent (Phase 13), /case skill updates (Phase 12), IMPL-SPEC.md deletion (Phase 14 completion).

</domain>

<decisions>
## Implementation Decisions

### IMPL-SPEC handling
- **D-01:** IMPL-SPEC.md is gradually deprecated. Each phase's deliverables replace the corresponding IMPL-SPEC sections. GSD artifacts (CONTEXT.md, PLAN.md) serve as the design document during implementation; completed deliverables become the source of truth after.
- **D-02:** IMPL-SPEC.md is deleted after Phase 14 completion, when all content has been transferred to deliverables.
- **D-03:** During implementation, IMPL-SPEC.md remains in `docs/` as a reference. It is not modified in Phase 11.

### Orchestrator pipeline
- **D-04:** 7+2 pipeline structure preserved from v1. Step contents updated for schema-driven dispatch; step sequence unchanged.
- **D-05:** Step 1 calls `schema-parser.ts` via Bash (`deno run --allow-read tools/schema-parser.ts <path>`), parses JSON stdout. Same pattern as hash-sections.ts.
- **D-06:** Component discovery follows Phase 9 D-21: CASES.md headings (primary) -> CONTEXT.md fallback -> ask developer. No keyword fallback.

### Agent input contracts
- **D-07:** spec-consolidator receives `<component>` (replaces `<service>`), `<sections>` (replaces `<template_type>`), and `<conditional_sections>` with condition text for agent evaluation.
- **D-08:** Conditional section evaluation is done by the consolidator agent (not the orchestrator). Agent reads phase documents and evaluates natural-language conditions, logging inclusion/exclusion reasoning as HTML comments in spec files. Consistent with Phase 9 D-24/D-25.
- **D-09:** Remaining dispatch tags (`<objective>`, `<files_to_read>`, `<phase_id>`, `<existing_spec>`, `<existing_cases>`, `<output_context>`, `<output_cases>`, `<superseded_operations>`, `<superseded_rules>`) carry over with terminology updated (service -> component).

### Merge rules
- **D-10:** All 11 merge rules carry over with terminology changes only. Logic unchanged.
  - Rule 1: `{Service}.{Op}` -> `{Component}.{Op}`
  - Rule 2: PR -> SR promotion -> PR -> **CR** promotion
  - Rule 8: "archetype sections" -> "schema-defined sections"
  - All other rules: unchanged.

### INDEX.md and output structure
- **D-11:** INDEX.md uses "Component" heading. Type column is always displayed (even if empty for components without a type).
- **D-12:** Output directory: `specs/{component}/context.md` and `specs/{component}/cases.md`. Same structure as v1 with directory names using component names.

### Schema synchronization
- **D-13:** New component discovery: auto-add to schema with developer confirmation prompt ("Add to schema?"). Consistent with Phase 9 D-22.
- **D-14:** Deletion/renaming: handled by existing mechanisms. Superseded operations (merge rule 6) -> orphan cleanup (Step 3.7) -> schema removal suggestion. No separate detection logic needed. Principle: minimize developer intervention.
- **D-15:** When orphan cleanup removes a `specs/{component}/` directory, also offer to remove the component from the schema file.

### Agent models
- **D-16:** spec-consolidator = sonnet. Mechanical merge work, no deep reasoning needed.
- **D-17:** e2e-flows = sonnet. Structured output generation.
- **D-18:** spec-verifier = opus. Fixed assignment, no downgrade. (Phase 13 deliverable, recorded here for consistency.)

### Backfill strategy
- **D-19:** SKILL.md includes project-neutral backfill guidance. When a component has no prior consolidated spec, orchestrator detects and offers backfill from earlier phases. No project-specific backfill plans (madome content removed).

### Error handling
- **D-20:** v1 error handling preserved: fail-fast + selective retry (failed agent only) + stage isolation. E2E/verifier failures do not rollback service spec consolidation.

### Verifier in Phase 11
- **D-21:** SKILL.md Step 5 includes a skip branch: if `agents/spec-verifier.md` does not exist, skip verification and mark output as "UNVERIFIED". When Phase 13 creates the verifier, Step 5 activates automatically. Skip branch removed during Phase 13 cleanup.

### Claude's Discretion
- Exact XML dispatch tag structure and nesting for all agents
- Internal SKILL.md step implementation details
- Agent prompt wording and quality gate checklist phrasing
- spec-consolidator internal code organization
- e2e-flows Mermaid diagram formatting decisions

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Model specification
- `docs/MODEL.md` -- Authoritative v2 model. Section structure, schema format, rule system, component discovery, conditional section evaluation, section overrides.

### Schema tools (Phase 10 deliverables)
- `tools/schema-parser.ts` -- Reads `.planning/consolidation.schema.md`, outputs structured JSON. Orchestrator calls this in Step 1.
- `tools/schema-parser_test.ts` -- Test suite, reference for parser output format.
- `tools/schema-bootstrap.ts` -- Creates starter schema. Called when no schema exists.

### Schema examples
- `docs/examples/schema-microservice.md` -- Microservice example with section override
- `docs/examples/schema-cli.md` -- CLI example, default sections only
- `docs/examples/schema-library.md` -- Library example, default sections only

### v1 implementation (reference during transition)
- `docs/IMPL-SPEC.md` -- v1 design document. Hash tool section is current; agent contracts, pipeline steps, merge rules, verification checks are reference for v2 rewrite. Will be deleted after Phase 14.
- `skills/consolidate/SKILL.md` -- v1 orchestrator. Rewrite target for this phase.

### Existing tools
- `tools/hash-sections.ts` -- SHA-256 section hashing for E2E flow dependency tracking. Unchanged from Phase 1.

### Prior phase context
- `.planning/phases/09-universal-model-design/09-CONTEXT.md` -- Model design decisions (D-01 through D-30). Foundation for all v2 work.
- `.planning/phases/10-schema-system/10-CONTEXT.md` -- Schema system decisions (D-01 through D-21). Parser and bootstrap tool design.

### Requirements
- `.planning/REQUIREMENTS.md` -- PIPE-01 through PIPE-06: acceptance criteria for consolidation pipeline.

### Technology neutrality
- `CLAUDE.md` -- "Technology Neutrality" section: default stance, exceptions, neutrality test.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `tools/schema-parser.ts`: Deno tool, AST-based schema parsing. Outputs JSON with `meta`, `components`, `sections` keys. Orchestrator calls via Bash and parses stdout.
- `tools/schema-bootstrap.ts`: Creates starter schema with atomic no-overwrite. Orchestrator calls when no schema exists.
- `tools/hash-sections.ts`: SHA-256/8 section hashing. E2E flow dependency tracking. Called in Step 4.
- `agents/case-briefer.md`: Reference for agent frontmatter pattern (name, description, tools, model).
- `agents/case-validator.md`: Reference for read-only verification agent pattern.

### Established Patterns
- YAML frontmatter + Markdown body for skills and agents
- Deno runtime with `npm:` specifiers, `--allow-read` / `--allow-write` permission scoping
- JSON output to stdout for tool-to-agent communication
- XML dispatch tags for agent input contracts (`<objective>`, `<files_to_read>`, etc.)
- `disable-model-invocation: true` on skills to prevent autonomous skill triggering

### Integration Points
- `skills/consolidate/SKILL.md` -> `tools/schema-parser.ts` (Step 1, Bash)
- `skills/consolidate/SKILL.md` -> `tools/schema-bootstrap.ts` (Step 1 when no schema, Bash)
- `skills/consolidate/SKILL.md` -> `agents/spec-consolidator.md` (Step 2, Agent dispatch)
- `skills/consolidate/SKILL.md` -> `tools/hash-sections.ts` (Step 4, Bash)
- `skills/consolidate/SKILL.md` -> `agents/e2e-flows.md` (Step 4, Agent dispatch)
- `skills/consolidate/SKILL.md` -> `agents/spec-verifier.md` (Step 5, Agent dispatch -- skip if absent)

</code_context>

<specifics>
## Specific Ideas

- IMPL-SPEC is a planning document, not a source file. Its content migrates to deliverables across phases, not all at once. The file itself is deleted after Phase 14 when all phases have completed.
- "Minimum developer intervention" principle for schema synchronization: new components auto-add with confirm, deletions/renames flow through superseded operations -> orphan cleanup -> schema cleanup. Developer rarely needs to manually edit the schema.
- verifier is opus and will never be downgraded -- user's explicit and firm decision.
- Conditional section evaluation stays with the agent (not orchestrator) because the agent already reads the full phase document context and can log reasoning as HTML comments per Phase 9 D-25.

</specifics>

<deferred>
## Deferred Ideas

- Per-component section overrides (individual component, not type-based) -- deferred until proven necessary (Phase 9)
- Template inheritance/composition -- deferred per research (Phase 9)
- Operation prefix configurability -- deferred, `{Component}.{Operation}` fixed (Phase 9)
- Spec-vs-code drift detection (Layer 3 verification) -- deferred to future gsd:verify expansion
- IMPL-SPEC.md deletion -- after Phase 14 completion

</deferred>

---

*Phase: 11-consolidation-pipeline*
*Context gathered: 2026-03-31*
