---
phase: 10-schema-system
plan: "02"
subsystem: schema-system
tags: [schema-parser, deno, ast, gfm, validation, tdd]
dependency_graph:
  requires:
    - docs/examples/schema-*.md (Plan 01 — updated with Type column and override)
    - tools/schema-bootstrap.ts (Plan 01 — bootstrap output used as test fixture)
  provides:
    - tools/schema-parser.ts (schema parser CLI tool, parseSchema export)
    - tools/schema-parser_test.ts (19-test suite using examples as fixtures)
  affects:
    - skills/consolidate/SKILL.md (Phase 11 — calls schema-parser.ts to read schema)
tech_stack:
  added:
    - tools/schema-parser.ts (Deno, unified + remark-parse + remark-gfm + mdast-util-to-string)
    - tools/schema-parser_test.ts (jsr:@std/assert, fixture-based + inline schema tests)
    - npm:remark-gfm@^4.0.0 (new dependency, required for GFM table AST nodes)
  patterns:
    - AST-based GFM table extraction (remark-gfm required — without it, tables parse as paragraph text)
    - Defensive cell access for rows with fewer cells than headers
    - H2 section collection then H3 sub-section dispatch
    - Strong node extraction for section names (avoids splitting on " -- ")
    - Mutually exclusive outputs: data present only when errors is empty
    - TDD: RED commit (6ad326f) then GREEN commit (40baf4d)
key_files:
  created:
    - tools/schema-parser.ts
    - tools/schema-parser_test.ts
  modified: []
decisions:
  - "Mutually exclusive outputs: data present only when errors is empty — cleaner contract for CLI consumers"
  - "Section name extracted from strong AST node, not by splitting on ' -- ' — handles guide text containing dashes"
  - "Orphaned section blocks (type in Sections heading but no component references it) are not flagged as errors — warnings only (not implemented as errors per spec)"
  - "Kebab-case validation runs on both Components table types AND Sections block headings — catches mismatches early"
metrics:
  duration_seconds: 156
  completed_date: "2026-03-31"
  tasks_completed: 2
  files_created: 2
  files_modified: 0
---

# Phase 10 Plan 02: Schema Parser Summary

**One-liner:** AST-based schema parser using unified + remark-gfm extracts meta, components, and section override blocks from schema files, with line-number validation errors and a 19-test suite using all 3 example schemas as fixtures.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 (RED) | Failing tests for schema parser | 6ad326f | tools/schema-parser_test.ts |
| 1 (GREEN) | Implement schema parser | 40baf4d | tools/schema-parser.ts |
| 2 | End-to-end CLI verification | (no code changes) | — |

## Changes Made

### tools/schema-parser.ts

- Exports `parseSchema(source: string): ParseResult` — parses schema markdown, returns `{ data?, errors[] }`
- Parses `## Meta` table using key-value row extraction with defaults (version=1, rulePrefix="CR", e2eFlows=false)
- Parses `## Components` table with defensive cell access for rows omitting trailing empty cell in Type column
- Parses all `## Sections: {type-name}` blocks — extracts `### Context Sections` numbered lists and `### Conditional Sections` bullet lists
- Section names extracted from `strong` AST nodes (avoids Pitfall 6: splitting on ` -- `)
- Validates: kebab-case type names (in both Components table and Sections block headings), cross-reference consistency (every non-empty Type must have a Sections block), duplicate component names
- Errors include `line` (number), `message` (string), and `fix` (string) fields
- CLI entrypoint behind `import.meta.main`; JSON to stdout, errors to stderr, exits 1 on failure or missing args
- Uses `npm:remark-gfm@^4.0.0` for GFM table support — critical addition over hash-sections.ts

### tools/schema-parser_test.ts

- 19 test cases: 8 fixture-based (reads docs/examples/), 1 behavioral condition, 5 validation error tests, 2 edge cases, 3 section content tests
- All 3 example schemas parse with no errors
- Behavioral condition text verified: "component manages stateful entities with lifecycle transitions"
- Bootstrap output round-trip: `parseSchema(generateStarterSchema())` returns no errors

## Verification Results

All plan verification checks passed:

1. `deno test tools/schema-parser_test.ts tools/schema-bootstrap_test.ts --allow-read --allow-write` — 30 passed | 0 failed
2. `deno run --allow-read tools/schema-parser.ts docs/examples/schema-microservice.md | python3 -c "..."` — "api-gateway" in sections confirmed
3. `deno run --allow-read tools/schema-parser.ts docs/examples/schema-cli.md | python3 -c "..."` — 4 components confirmed
4. Behavioral condition text verified in test 9: "component manages stateful entities with lifecycle transitions"
5. CLI with no args: exits 1 with "Usage:" on stderr
6. CLI with nonexistent file: exits 1 with "not found" on stderr
7. Bootstrap output round-trips through parser without errors

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — parser fully wired. All 3 examples parse. Bootstrap output parses. Validation catches all specified error conditions.

## Self-Check: PASSED

Files exist:
- `tools/schema-parser.ts` — FOUND
- `tools/schema-parser_test.ts` — FOUND

Commits exist:
- `6ad326f` — FOUND (Task 1 RED)
- `40baf4d` — FOUND (Task 1 GREEN)
