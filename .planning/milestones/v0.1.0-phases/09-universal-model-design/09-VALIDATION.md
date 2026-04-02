---
phase: 9
slug: universal-model-design
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-31
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual review (documentation-only phase) |
| **Config file** | N/A |
| **Quick run command** | N/A |
| **Full suite command** | N/A |
| **Estimated runtime** | N/A |

---

## Sampling Rate

- **After every task commit:** Read deliverable, check against requirements
- **After every plan wave:** Verify all delivered sections against MODEL-01 through MODEL-05
- **Before `/gsd:verify-work`:** Full suite must be green (all 5 success criteria from ROADMAP verified manually)
- **Max feedback latency:** N/A (manual review)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | MODEL-01 | manual-only | Review `docs/examples/` -- all 3 declare components freely | N/A | ⬜ pending |
| 09-01-02 | 01 | 1 | MODEL-02 | manual-only | Review MODEL.md -- documents the deferred override mechanism | N/A | ⬜ pending |
| 09-01-03 | 01 | 1 | MODEL-03 | manual-only | Review all 3 examples -- each section has meaningful content | N/A | ⬜ pending |
| 09-01-04 | 01 | 1 | MODEL-04 | manual-only | Review MODEL.md schema format -- Meta table with 3 fields | N/A | ⬜ pending |
| 09-01-05 | 01 | 1 | MODEL-05 | manual-only | Review CLI + library examples -- no forced/empty sections | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework needed for a documentation-only phase.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Schema file allows declaring units without archetypes | MODEL-01 | Documentation artifact, not code | Review `docs/examples/` — all 3 declare components with user-chosen names, no archetype selection |
| Custom section structures per unit type | MODEL-02 | Documentation artifact, not code | Review MODEL.md — documents deferred override mechanism for section customization |
| Default sections work for any project type | MODEL-03 | Neutrality requires human judgment | Review all 3 examples — each of the 7 mandatory sections has meaningful content |
| Meta configuration has defined home | MODEL-04 | Documentation artifact, not code | Review MODEL.md schema format — Meta table has operation-prefix, rule-prefix, e2e-flows fields |
| Default sections pass neutrality test | MODEL-05 | Neutrality requires human judgment | Review CLI + library examples — no forced/empty sections, every section name meaningful |

**Justification:** Phase 9 produces specification documents, not executable code. Validation is structural review.

---

## Validation Sign-Off

- [ ] All tasks have manual verify instructions
- [ ] Sampling continuity: every deliverable reviewed against requirements
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency: immediate (manual review)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
