---
phase: quick
plan: 260401-tgz
subsystem: docs
tags: [claude-md, stack, agents, documentation]
dependency_graph:
  requires: []
  provides: [accurate-claude-md, corrected-stack-md, corrected-project-md]
  affects: [claude-md, docs/STACK.md, .planning/PROJECT.md]
tech_stack:
  added: []
  patterns: []
key_files:
  created: []
  modified:
    - CLAUDE.md
    - docs/STACK.md
    - .planning/PROJECT.md
decisions:
  - "Keep remark-stringify in Sources section and Alternatives table — it is referenced as an alternative considered, not claimed as a dependency"
  - "spec-verifier note added inline in Rationale column rather than adding a 4th table column"
metrics:
  duration: ~10 minutes
  completed: "2026-04-01T12:18:19Z"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 3
---

# Quick Task 260401-tgz: Update CLAUDE.md Manual Sections to Match Actual State

**One-liner:** Corrected 4-agent table, validated v2 /consolidate status, tools/ structure entry, and replaced remark-stringify dependency claim with actual imports (mdast-util-to-string, remark-gfm).

## Objective

CLAUDE.md manual sections and GSD source files had drifted from actual project state. The agents table was missing spec-consolidator and e2e-flows. The /consolidate skill still showed "v2 in development". STACK.md incorrectly listed remark-stringify as a dependency when neither tool imports it. PROJECT.md Constraints referenced a non-existent verifier agent.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Update CLAUDE.md manual sections | 5d8d94b | CLAUDE.md |
| 2 | Fix GSD source files | cb65326 | docs/STACK.md, .planning/PROJECT.md |

## Changes Made

### CLAUDE.md

- **Structure block:** Added `tools/` directory entry; updated `directives/` description to note it is currently empty with guidelines inline in CLAUDE.md; updated `docs/` description to mention stack documentation.
- **Skills table:** Updated `/consolidate` status from "v1 exists, v2 in development (see docs/IMPL-SPEC.md)" to "Working (v2 validated)".
- **Agents table:** Added `spec-consolidator` (sonnet, /consolidate) and `e2e-flows` (sonnet, /consolidate) rows. Table now has all 4 agents with correct models.

No GSD-marked blocks were modified.

### docs/STACK.md

- **Markdown AST dependency table:** Replaced `npm:remark-stringify 11.0.0` row with `npm:mdast-util-to-string 4.0.0` (heading text extraction) and `npm:remark-gfm 4.0.0` (GFM table parsing). Added `npm:@types/mdast 4.0.0` (TypeScript type import). These match actual imports in hash-sections.ts and schema-parser.ts.
- **"What NOT to Use" table:** Removed the mdast-util-to-string entry (it is used, not avoided). Replaced it with a remark-stringify entry explaining it is not needed since section hashing uses source slicing rather than AST round-trip serialization.
- **Installation section:** Updated first-run package list from remark-stringify to mdast-util-to-string and remark-gfm.
- **Alternatives Considered table:** Updated the AST serializer row to correctly position mdast-util-to-string as the chosen approach for heading extraction and remark-stringify as the alternative not used.
- **Agent Model Assignments table:** Added "(not yet implemented)" note to spec-verifier Rationale to avoid confusion while preserving the planned entry.

### .planning/PROJECT.md

- **Constraints section:** Updated Agent models constraint from "consolidation agents use sonnet; verifier uses opus (downgrade candidate after usage data)" to "consolidation agents (spec-consolidator, e2e-flows) and case-briefer use sonnet; case-validator uses opus". This accurately names all 4 existing agents without referencing a non-existent spec-verifier.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all changes are corrections to existing documentation, not stubs.

## Self-Check: PASSED

- CLAUDE.md agents table: 4 rows confirmed (spec-consolidator, e2e-flows present)
- CLAUDE.md /consolidate status: "Working (v2 validated)" confirmed
- CLAUDE.md tools/ entry: confirmed
- docs/STACK.md mdast-util-to-string dependency row: confirmed
- docs/STACK.md remark-gfm dependency row: confirmed
- docs/STACK.md remark-stringify removed from dependency table: confirmed (0 matches in `^\| \`npm:remark-stringify` pattern)
- PROJECT.md "spec-consolidator, e2e-flows" in Constraints: confirmed
- Commits 5d8d94b and cb65326 exist in git log: confirmed
