---
phase: 14-cross-unit-flows
plan: "01"
subsystem: consolidate
tags: [dependencies, e2e-flows, bias-removal, documentation]
dependency_graph:
  requires: []
  provides:
    - structured-dependencies-format
    - bias-free-e2e-flows-template
    - current-documentation-references
  affects:
    - agents/spec-consolidator.md
    - agents/e2e-flows.md
    - skills/consolidate/SKILL.md
    - docs/MODEL.md
    - docs/STACK.md
    - CLAUDE.md
tech_stack:
  added: []
  patterns:
    - bold-anchor-parsing
key_files:
  created: []
  modified:
    - docs/MODEL.md
    - agents/spec-consolidator.md
    - skills/consolidate/SKILL.md
    - agents/e2e-flows.md
    - docs/STACK.md
    - CLAUDE.md
decisions:
  - Structured Dependencies format with bold component name (`**{name}**`) as parsing anchor replaces NLP-dependent prose scanning for deterministic E2E flow discovery
  - External dependencies (libraries, databases) use plain text without bold formatting so they are excluded from flow discovery
  - IMPL-SPEC references replaced with MODEL.md and agent frontmatter as the current authoritative sources
metrics:
  duration: 8
  completed_date: "2026-04-02"
  tasks_completed: 2
  files_modified: 6
---

# Phase 14 Plan 01: Cross-Unit Flow Pipeline Wiring Summary

**One-liner:** Structured `**{component-name}**` Dependencies format for deterministic flow discovery, bias-free e2e-flows Step Table template, and IMPL-SPEC reference cleanup across 6 files.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Structured Dependencies format and agent/skill parsing update | ed3393b | docs/MODEL.md, agents/spec-consolidator.md, skills/consolidate/SKILL.md, agents/e2e-flows.md |
| 2 | Replace IMPL-SPEC references with current authoritative sources | 3abf713 | docs/STACK.md, CLAUDE.md |

## What Was Built

### Task 1: Structured Dependencies Format

Added `### Dependencies Format` subsection to `docs/MODEL.md` specifying the structured cross-component reference format: `- **{component-name}** -- {description}`. The bold component name is the parsing anchor that enables `SKILL.md Step 3.5` to discover cross-component flows deterministically — replacing the prior approach that required NLP scanning of natural language prose.

Three coordinated changes implement this end-to-end:

1. **MODEL.md** defines the format with the parsing anchor concept
2. **spec-consolidator.md** instructs agents to write Dependencies in the structured format (bold for cross-component, plain text for external)
3. **SKILL.md Step 3.5** now matches `- **{name}** --` patterns against the schema component registry instead of checking "for cross-component references" in unstructured text

Also removed `{operation or HTTP call}` bias from `e2e-flows.md` Step Table template (row 1 Action column) — now uses `{operation}` only, consistent with technology-neutral vocabulary.

### Task 2: IMPL-SPEC Reference Cleanup

Replaced all 3 occurrences of `IMPL-SPEC` in `docs/STACK.md`:
- Model field documentation: now references "MODEL.md and agent frontmatter"
- Agent Model Assignments heading: now references "MODEL.md"
- Alternatives table: "IMPL-SPEC explicitly rejected" replaced with "Rejected early in project design"

Replaced 1 occurrence in `CLAUDE.md` commit examples: `docs: update IMPL-SPEC with review findings` → `docs: update MODEL.md with section override syntax`.

No external file now references IMPL-SPEC as a current document.

## Verification

All overall verification checks passed:
- `grep -rc "IMPL-SPEC" docs/STACK.md CLAUDE.md` → 0 for both files
- `grep -c "HTTP call" agents/e2e-flows.md` → 0
- `grep "Dependencies Format" docs/MODEL.md` → `### Dependencies Format` found at line 72
- `grep "bold component name" agents/spec-consolidator.md` → found in Dependencies section format instruction
- `grep "bold component names" skills/consolidate/SKILL.md` → found in Step 3.5 step 2
- `deno test tools/ --allow-read --allow-write` → 40 passed, 0 failed

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

Files verified:
- `docs/MODEL.md` → FOUND (contains `### Dependencies Format` at line 72)
- `agents/spec-consolidator.md` → FOUND (contains Dependencies section format instruction)
- `skills/consolidate/SKILL.md` → FOUND (Step 3.5 updated with bold parsing)
- `agents/e2e-flows.md` → FOUND (no HTTP call bias)
- `docs/STACK.md` → FOUND (0 IMPL-SPEC occurrences)
- `CLAUDE.md` → FOUND (0 IMPL-SPEC occurrences, updated commit example)

Commits verified:
- ed3393b → FOUND in git log
- 3abf713 → FOUND in git log
