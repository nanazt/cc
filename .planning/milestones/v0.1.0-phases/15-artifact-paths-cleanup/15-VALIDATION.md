---
phase: 15
slug: artifact-paths-cleanup
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-02
validated: 2026-04-03
---

# Phase 15 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Deno test (built-in) + grep/file-existence smoke checks |
| **Config file** | deno.json (project root) |
| **Quick run command** | `grep -c '\.planning/specs/' skills/consolidate/SKILL.md \| grep '^0$' && test ! -f docs/IMPL-SPEC.md` |
| **Full suite command** | `deno test` |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick smoke checks (grep + file-existence)
- **After every plan wave:** Run `deno test` (full suite)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 2 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 15-01-01 | 01 | 1 | INT-02 | smoke | `grep -c '\.planning/specs/' skills/consolidate/SKILL.md \| grep '^0$'` | N/A (grep) | ✅ green |
| 15-01-02 | 01 | 1 | INT-02 | smoke | `grep -c 'specs/' skills/consolidate/SKILL.md` (> 0) | N/A (grep) | ✅ green |
| 15-01-03 | 01 | 1 | INT-03 | smoke | `test ! -f docs/IMPL-SPEC.md` | N/A (absence) | ✅ green |
| 15-01-04 | 01 | 1 | INT-03 | smoke | `grep -c 'IMPL-SPEC' .gitignore \| grep '^0$'` | N/A (grep) | ✅ green |
| 15-01-05 | 01 | 1 | — | regression | `deno test --allow-read --allow-write tools/` | ✅ | ✅ green (40/40) |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test infrastructure needed — this phase uses only grep checks, file-existence tests, and the existing Deno test suite.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Memory file updated | D-04 | File is outside repo, in user's home directory | Check `~/.claude/projects/-Users-syr-Developments-cckit/memory/project_impl_spec_stale.md` reflects deletion |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 2s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved

---

## Validation Audit 2026-04-03

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |

All 5 automated checks executed and returned green. 1 manual-only check (memory file) also confirmed passing. Phase is Nyquist-compliant with zero gaps.
