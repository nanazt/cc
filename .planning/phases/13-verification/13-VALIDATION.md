---
phase: 13
slug: verification
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-02
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Deno test (built-in) |
| **Config file** | None (uses `deno test` defaults) |
| **Quick run command** | `deno test --allow-read --allow-write` |
| **Full suite command** | `deno test --allow-read --allow-write` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Review agent prompt against CONTEXT.md decisions
- **After every plan wave:** Run `/consolidate` against one test fixture (CLI recommended -- most likely to produce false positives)
- **Before `/gsd:verify-work`:** Full verification against all 3 fixture types with zero false positives
- **Max feedback latency:** N/A (manual agent verification, not automated test suite)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 13-01-01 | 01 | 1 | VRFY-01, VRFY-02 | manual | Review: agent prompt uses `<schema_data>` for section checks, not hardcoded lists | N/A | ⬜ pending |
| 13-01-02 | 01 | 1 | VRFY-02 | manual | Review: V-10 examples use structural placeholders; V-11/V-15 have skip conditions | N/A | ⬜ pending |
| 13-02-01 | 02 | 1 | VRFY-01 | manual | Review: SKILL.md Step 5 passes `<schema_data>` and `<phase_context_file>` | N/A | ⬜ pending |
| 13-03-01 | 03 | 2 | VRFY-03 | manual | Dispatch verifier against CLI/library fixtures; verify zero false positives | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No Deno test infrastructure needed -- fixtures are directory structures with markdown files, not code.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Verifier checks use schema-declared sections | VRFY-01 | Agent is LLM, not unit-testable | Dispatch verifier with CLI schema, verify V-04 checks CLI sections not default |
| V-11/V-15 skip on non-service projects | VRFY-02 | Requires live agent execution | Run verifier against CLI fixture, verify V-11/V-15 skipped with reasons |
| Zero false positives on CLI/library | VRFY-03 | Requires live agent execution | Run `/consolidate` against all 3 fixture types, inspect findings for false positives |
| V-20/V-21 automated comparison | VRFY-01 | Requires CONTEXT.md + spec content | Dispatch verifier with phase context, verify T2 findings compare decisions vs spec |

---

## Validation Sign-Off

- [ ] All tasks have manual verification instructions defined
- [ ] Sampling continuity: prompt review after each task, fixture test after each wave
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency: acceptable for manual verification
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
