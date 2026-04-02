---
phase: 14-cross-unit-flows
plan: 02
subsystem: fixtures
tags: [fixtures, e2e-flows, schema, test-infrastructure]
dependency_graph:
  requires: []
  provides: [schema fixtures with e2eFlows flag for all 3 project types, cross-component E2E flow fixture, structured Dependencies format]
  affects: [tests/fixtures/verification/]
tech_stack:
  added: []
  patterns: [5-section E2E flow format, structured Dependencies with bold component names, schema e2eFlows flag]
key_files:
  created:
    - tests/fixtures/verification/microservice/consolidation.schema.md
    - tests/fixtures/verification/cli/consolidation.schema.md
    - tests/fixtures/verification/library/consolidation.schema.md
    - tests/fixtures/verification/microservice/specs/e2e/auth-billing-flow.md
  modified:
    - tests/fixtures/verification/microservice/specs/auth/context.md
    - tests/fixtures/verification/microservice/specs/billing/context.md
    - tests/fixtures/verification/microservice/specs/INDEX.md
decisions:
  - Schema fixtures use exact component names from existing specs/ directories to ensure cross-reference validity
  - Spec Reference hashes in flow file are real computed values from hash-sections.ts, not placeholders
  - Dependencies format uses bold component names matching the e2e-flows agent's structured detection pattern
metrics:
  duration: 10
  completed: "2026-04-02"
  tasks: 2
  files: 7
---

# Phase 14 Plan 02: Test Fixture Infrastructure for Cross-Component Flow Validation

Schema fixtures with e2eFlows opt-in flag, cross-component E2E flow file with real computed hashes, and structured Dependencies format across all 3 project type fixtures.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Create schema fixture files for all 3 project types | d9eeb17 | 3 new files |
| 2 | Create E2E flow fixture, update Dependencies format, populate INDEX.md | bc3886b | 1 new + 3 modified |

## What Was Built

### Task 1: Schema Fixture Files

Three `consolidation.schema.md` files created in the verification fixture directories, each parseable by `schema-parser.ts`:

- **microservice**: `e2e-flows | true` — auth component with `api-gateway` type and matching `Sections: api-gateway` override block, billing component untyped
- **cli**: `e2e-flows | false` — init and config components, both untyped
- **library**: `e2e-flows | false` — parser and emitter components, both untyped

All component names in the schemas exactly match the existing `specs/` directory structure. The microservice schema's `api-gateway` section override matches the actual section headings in `auth/context.md`.

### Task 2: E2E Flow Infrastructure

**`specs/e2e/auth-billing-flow.md`** — A complete 5-section flow file following the e2e-flows agent spec:
1. Title and description
2. Step Table (6 columns: #, From, To, Action, Data, Ref) with 2 rows tracing caller -> auth -> billing
3. Sequence Diagram (Mermaid) matching Step Table participants and order
4. Error Paths referencing specific failure cases from component specs (F1 entries)
5. Spec References with real 8-character hashes computed by `hash-sections.ts`

**`auth/context.md` and `billing/context.md`** — Dependencies section updated from free-text prose to structured bold-entry format:
- auth: `- **billing** -- payment processing for premium account upgrades`
- billing: `- **auth** -- caller identity and session validation`

**`specs/INDEX.md`** — E2E Flows section populated with a table row linking to the flow file (replaces "No E2E flows." placeholder).

## Verification Results

| Check | Result |
|-------|--------|
| `deno test tools/ --allow-read --allow-write` | 40 passed, 0 failed |
| microservice schema `e2eFlows: true` | PASS |
| cli schema `e2eFlows: false` | PASS |
| library schema `e2eFlows: false` | PASS |
| hash-sections.ts processes flow file | PASS (4 section hashes output) |
| No "service" in e2e/ directory | PASS |
| No cli/specs/e2e/ directory | PASS |
| No library/specs/e2e/ directory | PASS |
| `**billing**` in auth Dependencies | PASS |
| `**auth**` in billing Dependencies | PASS |

## Requirements Validated

- **FLOW-01**: Schema e2eFlows flag distinguishes opt-in (microservice=true) from disabled projects
- **FLOW-02**: CLI and library have no specs/e2e/ directory, confirming skip path
- **FLOW-03**: Flow file uses "component"/"caller" terminology throughout — zero occurrences of "service"
- **FLOW-04**: Spec References in flow file contain real hashes from hash-sections.ts enabling change detection

## Key Links

- Flow file Spec References table references: `auth/context.md`, `auth/cases.md`, `billing/context.md`, `billing/cases.md`
- Schema Components table matches existing fixture spec directories exactly

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all fixture data is wired to actual spec content; hashes are real computed values.

## Self-Check: PASSED

Files verified:
- tests/fixtures/verification/microservice/consolidation.schema.md: FOUND
- tests/fixtures/verification/cli/consolidation.schema.md: FOUND
- tests/fixtures/verification/library/consolidation.schema.md: FOUND
- tests/fixtures/verification/microservice/specs/e2e/auth-billing-flow.md: FOUND
- tests/fixtures/verification/microservice/specs/auth/context.md: FOUND (modified)
- tests/fixtures/verification/microservice/specs/billing/context.md: FOUND (modified)
- tests/fixtures/verification/microservice/specs/INDEX.md: FOUND (modified)

Commits verified:
- d9eeb17: feat(fixtures): add schema files with e2eFlows flag for all 3 project types
- bc3886b: feat(fixtures): add E2E flow file and update microservice fixture for cross-component flows
