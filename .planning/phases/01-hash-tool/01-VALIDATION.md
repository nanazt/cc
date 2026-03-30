---
phase: 1
slug: hash-tool
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-30
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Deno built-in test runner (`deno test`) |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `deno test --allow-read` |
| **Full suite command** | `deno test --allow-read` |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run `deno test --allow-read`
- **After every plan wave:** Run `deno test --allow-read`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | HASH-01 | unit | `deno test --allow-read --filter "H2 section"` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | HASH-02 | unit | `deno test --allow-read --filter "deterministic"` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | HASH-03 | unit | `deno test --allow-read --filter "fenced code"` | ❌ W0 | ⬜ pending |
| 01-01-04 | 01 | 1 | HASH-04 | unit | `deno test --allow-read --filter "normalize"` | ❌ W0 | ⬜ pending |
| 01-01-05 | 01 | 1 | HASH-05 | unit | `deno test --allow-read --filter "setext"` | ❌ W0 | ⬜ pending |
| 01-01-06 | 01 | 1 | HASH-06 | unit | `deno test --allow-read --filter "ATX trailing"` | ❌ W0 | ⬜ pending |
| 01-01-07 | 01 | 1 | HASH-07 | unit | `deno test --allow-read --filter "pre-first-H2"` | ❌ W0 | ⬜ pending |
| 01-01-08 | 01 | 1 | TEST-04 | integration | `deno test --allow-read` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `hash-sections_test.ts` — test stubs for all HASH requirements
- [ ] `tests/fixtures/` — markdown fixture files for edge cases

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

*All phase behaviors have automated verification.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
