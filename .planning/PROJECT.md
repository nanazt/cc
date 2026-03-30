# cckit — Claude Code Toolkit

## What This Is

A personal Claude Code plugin project providing reusable skills, agents, and directives for use across projects. The two primary tools — `/case` (behavioral case discovery) and `/consolidate` (per-service spec consolidation) — extend the GSD workflow pipeline: `discuss -> /case -> plan -> execute -> verify -> ship -> /consolidate`.

## Core Value

Consolidate phase-scoped planning decisions into persistent, per-service spec files that downstream agents (case-briefer, planner, executor) can consume as authoritative source of truth.

## Requirements

### Validated

- `/case` skill working (migrated from madome) — S/F/E table discovery, CASE-SCRATCH.md and CASES.md production
- `case-briefer` agent working — extracts operations from phase planning documents
- `case-validator` agent working — validates CASES.md structure and completeness
- hash-sections.ts — Validated in Phase 1: Hash Tool (10/10 tests pass, all 8 requirements verified)
- hash-sections_test.ts — Validated in Phase 1: Hash Tool (HASH-07, TEST-04)

### Active

- [ ] Consolidate v2 SKILL.md — 7+2 step orchestrator pipeline replacing v1
- [ ] spec-consolidator agent — per-service consolidation with merge rules, PR-to-SR promotion, supersession handling
- [ ] e2e-flows agent — cross-service E2E flow documentation with Mermaid diagrams and spec reference hashes
- [ ] spec-verifier agent — 28-check verification (T1/T2/T3 tiered findings), read-only
- [ ] Template: domain-service archetype (context.md + cases.md sections)
- [ ] Template: gateway-bff archetype (context.md sections, conditional cases.md)
- [ ] Template: event-driven archetype (context.md + cases.md sections)
- [ ] /case update: PR/TR rule distinction (discuss + finalize classification)
- [ ] /case update: Superseded Operations section (Old Operation, Replacement, Reason)
- [ ] /case update: Superseded Rules section (Phase, Rule ID, Reason)
- [ ] /case update: OR-N prefix natively (replacing R-N)
- [ ] case-briefer update: specs/ priority lookup with phase directory fallback
- [ ] case-validator update: TR/OR recognition, supersession sections
- [ ] Test fixtures for skill/agent validation

### Out of Scope

- Installation/distribution mechanism — deferred to separate discussion after implementation
- `/gsd:next` integration — manual invocation only
- Spec-vs-code drift detection (Layer 3 verification) — deferred to future gsd:verify expansion
- Event-driven archetype real-world validation — no event-driven service exists yet
- Proto/Common service handling — deferred until needed
- Rule tier rename migration (SR->GR, SvcR->SR in existing projects) — separate atomic task

## Context

- Plugin project lives at `/Users/syr/Developments/cckit`, installed into host projects' `.claude/` directory
- GSD conventions assumed: CONTEXT.md, ROADMAP.md, phase directory structure, PROJECT.md with service topology
- `/case` already produces CASE-SCRATCH.md -> CASES.md pipeline; consolidate v2 consumes the finalized CASES.md
- v1 consolidate skill exists but was never executed — v2 is a full rewrite, not incremental update
- IMPL-SPEC.md (`docs/IMPL-SPEC.md`) is the authoritative design document for consolidate v2
- Reference implementation patterns exist in madome project's case-briefer and case-validator agents
- Hash tool requires Deno runtime and npm packages (unified, remark-parse) — first run needs network

## Constraints

- **Runtime**: Deno required for hash-sections.ts (npm:unified, npm:remark-parse)
- **Agent models**: spec-consolidator and e2e-flows use sonnet; spec-verifier uses opus (downgrade candidate after usage data)
- **No hardcoded project references**: Skills and agents must be technology-neutral and project-neutral
- **GSD conventions**: Depends on CONTEXT.md, CASES.md, ROADMAP.md, PROJECT.md phase directory structure
- **Content language**: All code, docs, commit messages in English (per CLAUDE.md)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| AST-based hashing over manual regex | remark-parse handles all CommonMark edge cases (fenced blocks, setext headers) automatically | Validated Phase 1 |
| Orchestrator computes hashes, E2E agent compares only | Single source of truth; avoids agent-side non-deterministic normalization | -- Pending |
| 2-step service classification (no keyword fallback) | Keyword guessing masks structural problems in phase documents | -- Pending |
| PR mechanically promoted to SR (no filtering) | Consolidator cannot make judgment calls; /case finalizes PR/TR before consolidation | -- Pending |
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
*Last updated: 2026-03-30 after Phase 1 completion*
