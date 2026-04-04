# cckit — Claude Code Toolkit

## What This Is

A personal Claude Code toolkit that packages skills, agents, and behavioral directives for installation into arbitrary host projects. Ships `/case` (behavioral case discovery), `/consolidate` (spec consolidation after phase ship), and `/convention` (research-driven convention authoring) as GSD workflow extensions: `discuss -> /case -> plan -> execute -> verify -> ship -> /consolidate`.

## Core Value

Encode behavioral quality standards as installable artifacts — so projects get consistent case discovery, spec consolidation, and code conventions without reinventing them. All artifacts must be project-type agnostic.

## Current Milestone: v0.2.0 Portable Conventions

**Goal:** Research-driven, high-quality conventions packaged as installable artifacts with selective project installation via Deno remote script.

**Target features:**
- Installation infrastructure: Deno-based remote installer (`deno run https://...`), project-only (no global)
- Config system: settings file for selective convention installation, self-applicable to cckit
- Convention packages: coding, workflow, documentation, commit, test, project structure, security, AI collaboration, release/versioning, error handling — each individually researched
- Open milestone: infrastructure first, conventions added incrementally as phases

**Previous:** Shipped v0.1.0 Universal Consolidation (2026-04-03) — 52 files, ~5,583 LOC.

## Requirements

### Validated

- ✓ hash-sections.ts — deterministic SHA-256/8 section hashing (10/10 tests) — v0.0.1
- ✓ Consolidation model redesign — project-type-agnostic unit and structure — v0.1.0
- ✓ Schema system — bootstrap, parser, override syntax, conditional sections — v0.1.0
- ✓ Consolidation pipeline — schema-driven orchestrator, spec-consolidator, e2e-flows agents — v0.1.0
- ✓ /case skill — universal vocabulary, PR/TR classification, supersession, OR-N prefix — v0.1.0
- ✓ /case technology neutralization — structural placeholders, open formats, no domain bias — v0.1.0
- ✓ Verification — schema-parameterized checks, no false positives on non-service projects — v0.1.0
- ✓ Cross-unit flows — opt-in E2E generation, structured Dependencies, hash change detection — v0.1.0

### Active

- [ ] Installation infrastructure (Deno remote script, project-only install)
- [ ] Config system for selective convention installation
- [ ] Convention packages (individually researched, added as phases)

### Out of Scope

- Installation/distribution mechanism — deferred to separate discussion after implementation
- `/gsd:next` integration — manual invocation only
- Spec-vs-code drift detection (Layer 3 verification) — deferred to future gsd:verify expansion
- Rule tier rename migration (SR->GR, SvcR->SR in existing projects) — separate atomic task
- Fixed archetype templates — violates technology neutrality, replaced by user-defined schema
- Keyword-based service classification — masks structural problems in phase documents
- Case-level merge (within operations) — /case produces complete per-operation specs
- Automatic PR/TR classification — consolidator cannot make judgment calls
- Manual spec file editing — specs must be machine-maintained for consistency

## Context

- Plugin project lives at `/Users/syr/Developments/cckit`, installed into host projects' `.claude/` directory
- GSD conventions assumed: CONTEXT.md, ROADMAP.md, phase directory structure, PROJECT.md
- `/case` produces CASE-SCRATCH.md -> CASES.md pipeline; `/consolidate` consumes the finalized CASES.md
- MODEL.md and agent frontmatter are the authoritative sources for consolidation pipeline design (IMPL-SPEC.md deleted)
- Hash tool requires Deno runtime and npm packages (unified, remark-parse) — first run needs network
- All v0.1.0 requirements (30/30) validated and shipped

## Constraints

- **Runtime**: Deno required for hash-sections.ts (npm:unified, npm:remark-parse)
- **Agent models**: consolidation agents (spec-consolidator, e2e-flows), case-briefer, and convention-generator use sonnet; case-validator, spec-verifier, and convention-researcher use opus
- **No hardcoded project references**: Skills and agents must be technology-neutral and project-neutral
- **GSD conventions**: Depends on CONTEXT.md, CASES.md, ROADMAP.md, PROJECT.md phase directory structure
- **Content language**: All code, docs, commit messages in English (per CLAUDE.md)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| AST-based hashing over manual regex | remark-parse handles all CommonMark edge cases | ✓ Good |
| Orchestrator computes hashes, E2E agent compares only | Single source of truth; avoids agent-side non-determinism | ✓ Good |
| 2-step component discovery (no keyword fallback) | Keyword guessing masks structural problems | ✓ Good |
| PR mechanically promoted to CR (no filtering) | Consolidator cannot make judgment calls | ✓ Good |
| Separate test fixtures (not madome dry-run) | Isolated, reproducible tests | ✓ Good |
| Schema file over template files | Explicit unit registry, configurable naming, single source of truth | ✓ Good |
| Component as universal unit | User-named, no predefined categories, works for any project type | ✓ Good |
| 7+2 section structure | 7 mandatory + 2 conditional covers all project types without bias | ✓ Good |
| Structural placeholders over domain examples | Teaches format/quality bar; Claude adapts to host project | ✓ Good |
| IMPL-SPEC.md deleted | MODEL.md and agent frontmatter are authoritative; IMPL-SPEC was stale | ✓ Good |
| Installation method deferred | Need research on global vs project install options | — Pending |
| Convention architecture uses Claude Code rules (not skills) | Rules enable path-scoped loading, skills require user invocation | ✓ Good |
| Base convention is optional (must pass delta test) | Avoids empty/redundant base files when all content is language-specific | ✓ Good |
| No manifest file — directory scan is discovery mechanism | Simpler, self-describing; presence of convention files = existence | ✓ Good |

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
*Last updated: 2026-04-04 after Phase 18 (/convention Skill) complete*
