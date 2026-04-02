---
phase: 11
slug: consolidation-pipeline
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-31
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual validation (Markdown deliverables, no runtime code) |
| **Config file** | none |
| **Quick run command** | `cat skills/consolidate/SKILL.md \| head -5` |
| **Full suite command** | `ls -la skills/consolidate/SKILL.md agents/spec-consolidator.md agents/e2e-flows.md docs/IMPL-SPEC.md` |
| **Estimated runtime** | ~1 second |

---

## Sampling Rate

- **After every task commit:** Verify file exists and frontmatter is valid YAML
- **After every plan wave:** Run full suite command to confirm all deliverables present
- **Before `/gsd:verify-work`:** All 4 deliverables exist with correct structure
- **Max feedback latency:** 2 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | PIPE-01 | grep | `grep -c "schema-parser" skills/consolidate/SKILL.md` | ⬜ | ⬜ pending |
| TBD | TBD | TBD | PIPE-02 | grep | `grep -c "<sections>" agents/spec-consolidator.md` | ⬜ | ⬜ pending |
| TBD | TBD | TBD | PIPE-03 | grep | `grep -c "Component" skills/consolidate/SKILL.md` | ⬜ | ⬜ pending |
| TBD | TBD | TBD | PIPE-04 | grep | `grep -c "Component" skills/consolidate/SKILL.md` | ⬜ | ⬜ pending |
| TBD | TBD | TBD | PIPE-05 | grep | `grep "specs/{" skills/consolidate/SKILL.md` | ⬜ | ⬜ pending |
| TBD | TBD | TBD | PIPE-06 | grep | `grep -cL "archetype" docs/IMPL-SPEC.md` | ⬜ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. No new test framework needed — deliverables are Markdown files validated by grep and structure checks.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Merge rules produce correct results | PIPE-03 | Rules are documented in prose, not executable code | Read SKILL.md merge rules section; verify all 11 rules use universal terminology |
| Agent prompt quality | PIPE-02 | Prompt effectiveness is subjective | Review spec-consolidator.md dispatch contract; verify section list is explicit |
| IMPL-SPEC completeness | PIPE-06 | Full document review required | Read docs/IMPL-SPEC.md; confirm no archetype references remain |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 2s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
