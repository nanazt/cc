# Phase 10: Schema System - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the schema system tooling: a Deno-based parser that reads `.planning/consolidation.schema.md` and outputs structured JSON, a bootstrapper that generates starter schemas for new projects, updated MODEL.md reflecting section override syntax, and updated examples demonstrating all schema features. The orchestrator (SKILL.md) integration is Phase 11.

**Deliverables:**
- `tools/schema-parser.ts` + `tools/schema-parser_test.ts`
- `tools/schema-bootstrap.ts` + `tools/schema-bootstrap_test.ts`
- `docs/MODEL.md` updated with section override format
- `docs/examples/schema-*.md` updated (3 files)

**Not in scope:** Orchestrator (SKILL.md) changes, consolidation pipeline integration, conditional section evaluation by agents.

</domain>

<decisions>
## Implementation Decisions

### Section override syntax
- **D-01:** Named section blocks — `## Sections: {type-name}` blocks alongside `## Sections: default`. Components table gains a `Type` column to map components to their section block.
- **D-02:** Override completely replaces the default — both mandatory and conditional sections. If an override block omits `### Conditional Sections`, that type has no conditional sections.
- **D-03:** Type names must be kebab-case (lowercase ASCII + hyphens). Enforced by parser validation.
- **D-04:** Components with an empty Type column use `## Sections: default`.
- **D-05:** `## Sections: default` is always explicit in the schema file. Parser has a defensive fallback to built-in 7+2 (MODEL.md parsing rule 5) but intended usage requires the block to be present.

### Bootstrapping
- **D-06:** Bootstrap tool is a separate Deno script: `tools/schema-bootstrap.ts`.
- **D-07:** Generated starter schema: minimal skeleton with Meta defaults (version=1, rule-prefix=CR, e2e-flows=false), empty Components table (with Type column, no example rows), full `## Sections: default` (7+2), and a comment referencing `docs/examples/` for guidance.
- **D-08:** CLI: `deno run --allow-write --allow-read tools/schema-bootstrap.ts <output-path>`. Refuses to overwrite existing files (exit 1). No `--force` flag.
- **D-09:** On decline during `/consolidate` flow: abort consolidation with message explaining the schema is required and how to create one manually.
- **D-10:** Previous decision (bootstrapping in orchestrator) revised — moved to separate Deno tool for consistency with hash-sections.ts pattern and to enable independent testing.

### Schema parsing
- **D-11:** Deno parser tool: `tools/schema-parser.ts`. AST-based parsing using unified + remark-parse, same stack as hash-sections.ts.
- **D-12:** CLI: `deno run --allow-read tools/schema-parser.ts <schema-path>`. JSON to stdout, errors to stderr + exit 1. Follows hash-sections.ts pattern.
- **D-13:** JSON output: top-level keys `meta`, `components`, `sections`. Detailed JSON schema defined at implementation time, not here.
- **D-14:** Strict validation with clear errors: line numbers, what's wrong, how to fix. Errors array in JSON output when validation fails.
- **D-15:** Core validations confirmed:
  1. Required sections exist (`## Components`, `## Sections: default`; `## Meta` falls back to defaults if missing)
  2. Type reference consistency (every Type value in Components table has a corresponding `## Sections: {type}` block)
  3. Type name kebab-case enforcement
  4. Additional validations added at implementation time
- **D-16:** Tests required (Deno test), test cases and scope defined by planner.

### Examples
- **D-17:** Update existing 3 examples (not add new ones). Add Type column to Components table in all 3.
- **D-18:** Microservice example demonstrates section override (at least one component with a custom type and `## Sections: {type}` block). CLI and library examples use default only.
- **D-19:** Examples serve as test fixtures for schema-parser_test.ts — parser tests read `docs/examples/` directly.

### MODEL.md updates
- **D-20:** Phase 10 updates MODEL.md to add: section override format (`## Sections: {type-name}`), Type column in Components table, override parsing rules, type name constraints (kebab-case).
- **D-21:** Remove "Per-component section overrides are deferred" language. Replace with the override mechanism specification.

### Claude's Discretion
- Internal JSON schema structure (field names, nesting) for parser output
- Test case selection and count for both tools
- Exact error message wording
- Internal code organization within each tool file
- Whether to share utilities between parser and bootstrap (or keep fully independent)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Model specification
- `docs/MODEL.md` — Authoritative v2 model source. Section structure, schema format, parsing rules, rule system. Will be updated in this phase to add override syntax.

### Schema examples (will be updated)
- `docs/examples/schema-microservice.md` — Microservice example, will gain section override
- `docs/examples/schema-cli.md` — CLI example, default sections only
- `docs/examples/schema-library.md` — Library example, default sections only

### Existing tool pattern
- `tools/hash-sections.ts` — Reference pattern for Deno tool: AST-based markdown parsing, CLI interface, JSON output, error handling
- `tools/hash-sections_test.ts` — Reference pattern for Deno tests: fixture-based, comprehensive edge cases

### Requirements
- `.planning/REQUIREMENTS.md` — SCHEMA-01 through SCHEMA-04: acceptance criteria for schema system

### Prior phase context
- `.planning/phases/09-universal-model-design/09-CONTEXT.md` — Model design decisions. D-01 through D-30 are the foundation this phase builds on.

### Technology neutrality
- `CLAUDE.md` — "Technology Neutrality" section: default stance, exceptions, neutrality test

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `tools/hash-sections.ts`: Deno tool using unified + remark-parse for markdown AST parsing. Same stack will be used for schema-parser.ts. CLI pattern (path arg, JSON stdout, stderr errors) is the template.
- `tools/hash-sections_test.ts`: 10 test cases using Deno test. Test pattern (fixture-based assertions) is the template.
- `docs/examples/schema-*.md`: 3 existing examples serve as both documentation and test fixtures.

### Established Patterns
- Deno runtime with `npm:` specifiers (unified, remark-parse, remark-stringify)
- `--allow-read` / `--allow-write` permission scoping
- JSON output to stdout for tool-to-agent communication
- AST traversal for structured markdown extraction

### Integration Points
- `skills/consolidate/SKILL.md` (Phase 11): Will call schema-parser.ts and schema-bootstrap.ts via `deno run`
- `docs/MODEL.md`: Updated in this phase; consumed by all downstream phases

</code_context>

<specifics>
## Specific Ideas

- Bootstrap tool and parser tool are intentionally separate files (not combined), matching the user's explicit preference for modular tools
- Previous decision to put bootstrapping in the orchestrator was revised — Deno tools provide consistency with hash-sections.ts and enable independent testing
- Examples double as test fixtures: schema-parser_test.ts reads docs/examples/ directly, eliminating duplicate fixture maintenance
- "Strict + clear errors" validation philosophy: parser should tell users exactly what's wrong and how to fix it, with line numbers

</specifics>

<deferred>
## Deferred Ideas

- Per-component section overrides (individual component, not type-based) — deferred until proven necessary. Current mechanism is type-based: groups of components share a section structure via Type column.
- Schema synchronization details (deletion, rename detection) — deferred to Phase 11 (orchestrator implementation)
- IMPL-SPEC.md rewrite — Phase 11 (PIPE-06)
- SKILL.md orchestrator integration — Phase 11 (PIPE-01, PIPE-02)

</deferred>

---

*Phase: 10-schema-system*
*Context gathered: 2026-03-31*
