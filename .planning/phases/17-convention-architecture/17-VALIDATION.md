---
phase: 17
slug: convention-architecture
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-03
---

# Phase 17 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Deno test (built-in) |
| **Config file** | none (Deno test needs no config) |
| **Quick run command** | `deno test --allow-read --allow-write tools/` |
| **Full suite command** | `deno test --allow-read --allow-write tools/` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Structural review of document sections
- **After every plan wave:** Full document review against ARCH requirements
- **Before `/gsd:verify-work`:** All ARCH-01 through ARCH-04 addressed in document
- **Max feedback latency:** N/A (documentation phase — no automated tests)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 17-01-01 | 01 | 1 | ARCH-01 | manual-only | N/A — review docs/CONVENTIONS.md for structure spec | N/A | ⬜ pending |
| 17-01-02 | 01 | 1 | ARCH-02 | manual-only | N/A — review docs/CONVENTIONS.md for discovery contract | N/A | ⬜ pending |
| 17-01-03 | 01 | 1 | ARCH-03 | manual-only | N/A — review docs/CONVENTIONS.md for delta test section | N/A | ⬜ pending |
| 17-01-04 | 01 | 1 | ARCH-04 | manual-only | N/A — review docs/CONVENTIONS.md for base optionality rules | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. Phase 17 produces specification documents, not code — no automated test infrastructure needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Layered structure specified | ARCH-01 | Architecture document, not code | Review docs/CONVENTIONS.md contains base + language-specific file locations, naming, and frontmatter format |
| Discovery rules specified | ARCH-02 | Architecture document, not code | Review docs/CONVENTIONS.md contains directory scanning contract and discoverability rules |
| Delta test defined | ARCH-03 | Design principle, not executable logic | Review docs/CONVENTIONS.md defines delta test methodology |
| Base standalone value | ARCH-04 | Template review, not executable | Review base convention template demonstrates value without language-specific files |

---

## Validation Sign-Off

- [ ] All tasks have manual verification criteria
- [ ] Sampling continuity: structural review after each task commit
- [ ] No automated test infrastructure needed (documentation phase)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
