# cckit — Claude Code Toolkit

## What This Is

A personal Claude Code toolkit that packages skills, agents, and behavioral directives for installation into arbitrary host projects. Currently ships `/case` (behavioral case discovery) and `/consolidate` (spec consolidation after phase ship) as GSD workflow extensions: `discuss -> /case -> plan -> execute -> verify -> ship -> /consolidate`.

## Core Value

Encode behavioral quality standards as installable artifacts — so projects get consistent case discovery, spec consolidation, and code conventions without reinventing them. All artifacts must be project-type agnostic.

## Current Milestone: v2.0 Universal Consolidation

**Goal:** Redesign consolidate v2 pipeline and /case skill to be truly project-type-agnostic — no fixed archetypes, no service assumptions.

**Target features:**
- `/consolidate` v2 with extensible/user-defined consolidation model (replaces 3 fixed archetypes)
- Consolidation unit redesign — define what gets consolidated when "per-service" is not the assumption
- `/case` review and fix for any service-biased language/structure
- IMPL-SPEC rewrite reflecting universal design
- Hash tool carry over from v1.0 (already complete, already universal)

## Requirements

### Validated

- `/case` skill working (migrated from madome) — S/F/E table discovery, CASE-SCRATCH.md and CASES.md production
- `case-briefer` agent working — extracts operations from phase planning documents
- `case-validator` agent working — validates CASES.md structure and completeness
- hash-sections.ts — Validated in Phase 1: Hash Tool (10/10 tests pass, all 8 requirements verified)
- hash-sections_test.ts — Validated in Phase 1: Hash Tool (HASH-07, TEST-04)

### Active (v2.0)

- [x] Consolidation model redesign — project-type-agnostic unit and structure (replaces fixed archetypes) — Validated in Phase 9: Universal Model Design
- [x] Consolidate v2 SKILL.md — orchestrator pipeline with schema-driven dispatch — Validated in Phase 11: Consolidation Pipeline
- [x] Consolidation agent — merge rules, promotion, supersession handling (universal) — Validated in Phase 11: Consolidation Pipeline
- [x] Verification agent — read-only spec verification (universal) — Validated in Phase 13: Verification
- [x] Template/schema system — extensible, user-defined (replaces 3 fixed archetype templates) — Validated in Phase 10: Schema System
- [x] /case review — remove service-biased language and assumptions — Validated in Phase 12: /case Updates; technology neutralization completed in Phase 12.1
- [x] /case update: PR/TR rule distinction (discuss + finalize classification) — Validated in Phase 12: /case Updates
- [x] /case update: Superseded Operations and Rules sections — Validated in Phase 12: /case Updates
- [x] /case update: OR-N prefix natively (replacing R-N) — Validated in Phase 12: /case Updates
- [x] case-briefer update: specs/ priority lookup with phase directory fallback — Validated in Phase 12: /case Updates
- [x] case-validator update: TR/OR recognition, supersession sections — Validated in Phase 12: /case Updates
- [x] IMPL-SPEC rewrite reflecting universal design — Validated in Phase 11: Consolidation Pipeline
- [x] Test fixtures for skill/agent validation — Validated in Phase 13: Verification
- [x] Cross-component E2E flow pipeline — schema-driven opt-in, structured Dependencies, universal flow format — Validated in Phase 14: Cross-Unit Flows

### Out of Scope

- Installation/distribution mechanism — deferred to separate discussion after implementation
- `/gsd:next` integration — manual invocation only
- Spec-vs-code drift detection (Layer 3 verification) — deferred to future gsd:verify expansion
- Rule tier rename migration (SR->GR, SvcR->SR in existing projects) — separate atomic task

## Context

- Plugin project lives at `/Users/syr/Developments/cckit`, installed into host projects' `.claude/` directory
- GSD conventions assumed: CONTEXT.md, ROADMAP.md, phase directory structure, PROJECT.md with service topology
- `/case` already produces CASE-SCRATCH.md -> CASES.md pipeline; consolidate v2 consumes the finalized CASES.md
- v1 consolidate skill exists but was never executed — v2 is a full rewrite, not incremental update
- MODEL.md and agent frontmatter are the authoritative sources for consolidate v2 design (IMPL-SPEC.md deleted in Phase 15)
- Reference implementation patterns exist in madome project's case-briefer and case-validator agents
- Hash tool requires Deno runtime and npm packages (unified, remark-parse) — first run needs network

## Constraints

- **Runtime**: Deno required for hash-sections.ts (npm:unified, npm:remark-parse)
- **Agent models**: consolidation agents (spec-consolidator, e2e-flows) and case-briefer use sonnet; case-validator and spec-verifier use opus
- **No hardcoded project references**: Skills and agents must be technology-neutral and project-neutral
- **GSD conventions**: Depends on CONTEXT.md, CASES.md, ROADMAP.md, PROJECT.md phase directory structure
- **Content language**: All code, docs, commit messages in English (per CLAUDE.md)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| AST-based hashing over manual regex | remark-parse handles all CommonMark edge cases (fenced blocks, setext headers) automatically | Validated Phase 1 |
| Orchestrator computes hashes, E2E agent compares only | Single source of truth; avoids agent-side non-deterministic normalization | Validated Phase 11 |
| 2-step component discovery (no keyword fallback) | Keyword guessing masks structural problems in phase documents | Validated Phase 11 |
| PR mechanically promoted to CR (no filtering) | Consolidator cannot make judgment calls; /case finalizes PR/TR before consolidation | Validated Phase 11 |
| Separate test fixtures (not madome dry-run) | Isolated, reproducible tests independent of any host project state | Validated Phase 1 |
| Installation method deferred | Need research on global vs project install options before committing | -- Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-03 — Phase 16 complete (e2e-dispatch-alignment: aligned SKILL.md Step 4 dispatch table to e2e-flows agent contract, closed integration gap INT-01). All v2.0 milestone phases complete.*
