---
phase: 14
slug: cross-unit-flows
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-02
---

# Phase 14 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Deno test (built-in), v2.7.9 |
| **Config file** | none (zero-config) |
| **Quick run command** | `deno test tools/ --allow-read` |
| **Full suite command** | `deno test tools/ --allow-read --allow-write` |
| **Estimated runtime** | ~43ms (19 existing tests) |

---

## Sampling Rate

- **After every task commit:** Run `deno test tools/ --allow-read`
- **After every plan wave:** Run `deno test tools/ --allow-read --allow-write`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 1 second

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 14-01-01 | 01 | 1 | FLOW-01 | fixture + parser test | `deno test tools/schema-parser_test.ts --allow-read --filter "e2e-flows"` | Existing | ⬜ pending |
| 14-01-02 | 01 | 1 | FLOW-02 | fixture validation | Visual: cli/library schemas have `e2e-flows: false`, no `specs/e2e/` dir | Wave 0 | ⬜ pending |
| 14-01-03 | 01 | 1 | FLOW-03 | fixture + grep | `grep -r "service" tests/fixtures/verification/microservice/specs/e2e/ \| grep -v "api-service"` returns 0 | Wave 0 | ⬜ pending |
| 14-01-04 | 01 | 1 | FLOW-04 | fixture + hash tool | `deno run --allow-read tools/hash-sections.ts tests/fixtures/verification/microservice/specs/auth/context.md` | Existing | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/fixtures/verification/microservice/consolidation.schema.md` — parseable schema with `e2eFlows=true`
- [ ] `tests/fixtures/verification/cli/consolidation.schema.md` — parseable schema with `e2eFlows=false`
- [ ] `tests/fixtures/verification/library/consolidation.schema.md` — parseable schema with `e2eFlows=false`
- [ ] `tests/fixtures/verification/microservice/specs/e2e/` directory with flow file

Existing schema-parser_test.ts already validates e2eFlows parsing. No new test files needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| IMPL-SPEC references replaced | D-05 | Content replacement, not logic | Grep `IMPL-SPEC` in docs/STACK.md and CLAUDE.md — should only find non-reference mentions |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 1s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
