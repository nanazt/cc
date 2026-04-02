# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v0.1.0 — Universal Consolidation

**Shipped:** 2026-04-03
**Phases:** 9 | **Plans:** 17

### What Was Built
- Complete `/consolidate` v2 pipeline: schema-driven orchestrator, spec-consolidator, e2e-flows, spec-verifier agents
- Complete `/case` v2 skill: universal vocabulary, PR/TR classification, supersession metadata, technology-neutral placeholders
- Schema system: bootstrap tool (`schema-bootstrap.ts`) + AST-based parser (`schema-parser.ts`)
- Test fixtures for 3 project types (microservice, CLI, library) validating verifier behavior

### What Worked
- Specification-first approach: MODEL.md written before implementation drove consistent terminology across all artifacts
- Phase dependency design: Phase 12 (/case) depended only on Phase 9, allowing parallel planning with Phases 10-11
- Technology neutrality as a forcing function: applying the "could any project type use this?" test consistently caught bias that would have shipped otherwise
- Gap closure phases (15, 16) were small and focused — caught integration issues the milestone audit surfaced

### What Was Inefficient
- IMPL-SPEC.md was written in Phase 11, then deleted in Phase 15 — transitional documentation that didn't survive the milestone
- Some SUMMARY.md files lacked one-liner fields, making automated accomplishment extraction incomplete
- Phase 12.1 was an insertion to fix bias that should have been caught in Phase 12's initial scope

### Patterns Established
- Schema-driven dispatch: orchestrator reads schema, passes explicit section lists to agents via XML tags
- Structural placeholder convention: all skill examples use `[OperationName]`, `[error description] (ErrorName)` etc.
- Open format sections: `- [describe each X]` instead of fixed category lists
- Standard vocabulary: `Caller:`, `Component`, `(ErrorName)` as universal terms
- Behavioral conditions over type checks for conditional sections

### Key Lessons
1. Technology neutrality requires active enforcement at every artifact level — training-data defaults always drift toward web service patterns
2. Agent frontmatter and skill files are better authoritative sources than separate spec documents — fewer files to keep in sync
3. Milestone audits catch real integration gaps — Phase 15 and 16 both came from audit findings
4. Structural rules ("be specific enough that a test can assert against it") are more durable than example-based teaching

### Cost Observations
- Model mix: executor agents on sonnet, verifier/validator on opus
- 17 plans across 9 phases in 4 days
- Notable: most plans were small (1-3 tasks) reflecting focused phase scoping

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 1 | 2 | Hash tool foundation |
| v0.1.0 | 9 | 17 | Full milestone audit + gap closure phases |

### Cumulative Quality

| Milestone | Tests | Fixtures | Key Quality Metric |
|-----------|-------|----------|-------------------|
| v1.0 | 10 (hash-sections) | 0 | AST-based parsing correctness |
| v0.1.0 | 10 + 19 (schema-parser) | 15 (3 project types) | Zero false positives on non-service projects |

### Top Lessons (Verified Across Milestones)

1. Specification-first approach pays off — MODEL.md and hash-sections spec both drove clean implementations
2. Test fixtures as validation: separate fixtures (not dry-runs on real projects) ensure reproducible verification
