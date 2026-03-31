---
phase: 09-universal-model-design
plan: "02"
subsystem: examples
tags: [documentation, schema-examples, neutrality-validation, model-design]
dependency_graph:
  requires: [docs/MODEL.md]
  provides: [docs/examples/schema-microservice.md, docs/examples/schema-cli.md, docs/examples/schema-library.md]
  affects: [Phase 10 schema system bootstrapping, MODEL-05 neutrality validation]
tech_stack:
  added: []
  patterns: [schema-examples-as-validation, identical-structure-different-components]
key_files:
  created:
    - docs/examples/schema-cli.md
    - docs/examples/schema-library.md
    - docs/examples/schema-microservice.md
  modified: []
decisions:
  - "Default guide text used unchanged in all 3 examples -- no per-project-type adaptation needed"
  - "CLI and library written first (Pitfall 3) to validate neutrality before microservice"
  - "e2e-flows=true for microservice, false for CLI and library -- matches expected usage"
metrics:
  duration_seconds: 67
  completed_date: "2026-03-31"
  tasks_completed: 1
  tasks_total: 2
  files_created: 3
  files_modified: 0
---

# Phase 09 Plan 02: Starter Schema Examples -- Neutrality Validation

**One-liner:** Three starter schema examples (microservice, CLI, library) instantiating the MODEL.md 7+2 structure with project-type-realistic components, demonstrating universal neutrality with identical section structure and zero v1 terminology.

## What Was Built

Three starter schema files in `docs/examples/`, each containing:
- An HTML comment identifying the project type
- `# Consolidation Schema` title with the "component" definition sentence
- `## Meta` table (version=1, rule-prefix=CR, e2e-flows varies)
- `## Components` table with 4 realistic components per project type
- `## Sections: default` block with identical 7+2 section structure (default guide text, no adaptation)

### Files Created

| File | e2e-flows | Components |
|------|-----------|------------|
| `docs/examples/schema-cli.md` | false | init, run, config, output |
| `docs/examples/schema-library.md` | false | parser, transformer, emitter, plugin |
| `docs/examples/schema-microservice.md` | true | auth, user, notification, billing |

### Key design choices

**Identical section structure.** The ONLY differences between the 3 files are the comment line, the e2e-flows value, and the Components table rows. The `## Sections: default` block is byte-for-byte identical. This is intentional -- it demonstrates that the 7+2 default works without modification for any project type.

**Default guide text, not adapted.** Research (Open Question 2) recommended using default guide text unchanged. Guide text is descriptive enough ("Operations, commands, endpoints, or API surface...") to be interpreted per project type without project-specific rewriting.

**CLI and library first.** Per Research Pitfall 3, the real neutrality test is whether non-service project types produce meaningful content. Written in order: CLI -> library -> microservice.

## Commits

| Task | Name | Commit | Key Files |
|---|---|---|---|
| 1 | Create 3 starter schema examples | bb4c274 | docs/examples/schema-cli.md, docs/examples/schema-library.md, docs/examples/schema-microservice.md |
| 2 | Checkpoint: human-verify | -- | Awaiting human approval |

## Requirements Addressed

| Req ID | Coverage |
|---|---|
| MODEL-01 | All 3 examples declare components freely -- no type column, no archetype selection, user-named entries |
| MODEL-03 | 7 mandatory sections with default guide text present in all 3 files |
| MODEL-05 | 3 examples serve as concrete neutrality proof. CLI/library written first to confirm no forced sections. Checkpoint gets human confirmation. |

## Deviations from Plan

None -- plan executed exactly as written. Written in order: CLI first, library second, microservice third (per Pitfall 3). Default guide text used unchanged in all examples (per Open Question 2 recommendation).

## Known Stubs

None. All 3 examples are complete and self-contained. Components table has 4 realistic rows per file. Section structure is complete. No placeholder text.

## Automated Pre-Check Results (Task 2 Checkpoint)

| Check | Result |
|-------|--------|
| v1 terminology audit (SR-N, Service Rule, archetype, template_type, SvcR, domain-service, gateway-bff) | PASS: 0 matches |
| H2 section count in MODEL.md | PASS: 16 sections (>= 8) |
| MODEL.md line count | PASS: 398 lines (>= 250) |
| Component table rows per example (expect >= 5) | PASS: 11 rows each (header + separator + 3 meta rows + 4 component rows) |
| Checkpoint automated verify | PASS |

## Self-Check: PASSED

- [x] `docs/examples/schema-cli.md` exists: FOUND
- [x] `docs/examples/schema-library.md` exists: FOUND
- [x] `docs/examples/schema-microservice.md` exists: FOUND
- [x] Task 1 commit bb4c274 exists
- [x] All 3 files contain `# Consolidation Schema` (line 2)
- [x] All 3 files contain 7 numbered sections
- [x] All 3 files contain 2 conditional sections (State Lifecycle, Event Contracts)
- [x] All 3 files contain `## Meta` with version, rule-prefix, e2e-flows
- [x] Microservice has e2e-flows=true; CLI and library have e2e-flows=false
- [x] Zero forbidden terms (archetype, template_type, SR-N, Service Rule) across all files
- [x] Section structure is byte-for-byte identical across all 3 files
- [x] Awaiting human checkpoint for Task 2
