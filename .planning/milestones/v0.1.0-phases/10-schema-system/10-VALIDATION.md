---
phase: 10
slug: schema-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-31
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Deno test (built-in) |
| **Config file** | none (zero-config) |
| **Quick run command** | `deno test tools/schema-parser_test.ts tools/schema-bootstrap_test.ts --allow-read --allow-write` |
| **Full suite command** | `deno test tools/ --allow-read --allow-write` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `deno test tools/schema-parser_test.ts tools/schema-bootstrap_test.ts --allow-read --allow-write`
- **After every plan wave:** Run `deno test tools/ --allow-read --allow-write`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | SCHEMA-02 | unit | `deno test tools/schema-parser_test.ts --allow-read -x` | ❌ W0 | ⬜ pending |
| 10-01-02 | 01 | 1 | SCHEMA-03 | unit | `deno test tools/schema-parser_test.ts --allow-read -x` | ❌ W0 | ⬜ pending |
| 10-01-03 | 01 | 1 | SCHEMA-04 | unit | `deno test tools/schema-parser_test.ts --allow-read -x` | ❌ W0 | ⬜ pending |
| 10-02-01 | 02 | 2 | SCHEMA-01 | unit | `deno test tools/schema-bootstrap_test.ts --allow-read --allow-write -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tools/schema-parser_test.ts` — stubs for SCHEMA-02, SCHEMA-03, SCHEMA-04
- [ ] `tools/schema-bootstrap_test.ts` — stubs for SCHEMA-01

*Existing infrastructure covers framework install (Deno test is built-in).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Reference examples are readable documentation | SCHEMA-04 | Documentation quality is subjective | Review `docs/schema-examples/` files for clarity and completeness |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
