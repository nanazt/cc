---
phase: 18
slug: convention-skill
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-05
---

# Phase 18 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Deno test (built-in) |
| **Config file** | none — uses CLI flags |
| **Quick run command** | `deno test --allow-read tools/convention-skill_test.ts` |
| **Full suite command** | `deno test --allow-read --allow-write tools/` |
| **Estimated runtime** | ~5ms (structural file checks only) |

---

## Sampling Rate

- **After every task commit:** Run `deno test --allow-read tools/convention-skill_test.ts`
- **After every plan wave:** Run `deno test --allow-read --allow-write tools/`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** <1 second

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 18-01-01 | 01 | 1 | SKILL-01 | structural | `deno test --allow-read tools/convention-skill_test.ts` | ✅ | ✅ green |
| 18-01-01 | 01 | 1 | SKILL-02 | structural | `deno test --allow-read tools/convention-skill_test.ts` | ✅ | ✅ green |
| 18-01-01 | 01 | 1 | SKILL-03 | structural | `deno test --allow-read tools/convention-skill_test.ts` | ✅ | ✅ green |
| 18-01-02 | 01 | 1 | SKILL-03 | structural | `deno test --allow-read tools/convention-skill_test.ts` | ✅ | ✅ green |
| 18-01-02 | 01 | 1 | SKILL-05 | structural | `deno test --allow-read tools/convention-skill_test.ts` | ✅ | ✅ green |
| 18-01-02 | 01 | 1 | SKILL-06 | structural | `deno test --allow-read tools/convention-skill_test.ts` | ✅ | ✅ green |
| 18-02-01 | 02 | 1 | SKILL-04 | structural | `deno test --allow-read tools/convention-skill_test.ts` | ✅ | ✅ green |
| 18-02-01 | 02 | 1 | SKILL-07 | structural | `deno test --allow-read tools/convention-skill_test.ts` | ✅ | ✅ green |
| 18-02-02 | 02 | 1 | SKILL-07 | structural | `deno test --allow-read tools/convention-skill_test.ts` | ✅ | ✅ green |
| 18-03-01 | 03 | 2 | SKILL-01 | structural | `deno test --allow-read tools/convention-skill_test.ts` | ✅ | ✅ green |
| 18-03-01 | 03 | 2 | SKILL-04 | structural | `deno test --allow-read tools/convention-skill_test.ts` | ✅ | ✅ green |
| 18-03-02 | 03 | 2 | SKILL-05 | structural | `deno test --allow-read tools/convention-skill_test.ts` | ✅ | ✅ green |
| 18-03-02 | 03 | 2 | SKILL-06 | structural | `deno test --allow-read tools/convention-skill_test.ts` | ✅ | ✅ green |

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. Deno test was already configured.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| End-to-end create flow (init -> research -> preferences -> generate -> approve) | SKILL-01, SKILL-04, SKILL-05 | Requires live Claude Code session with web research and interactive AskUserQuestion dialogue | Invoke `/convention commit` from a non-cckit project. Verify full flow produces `.claude/rules/cckit-commit.md` with proper frontmatter and footer. |
| Language-specific with missing base scenario | SKILL-05, SKILL-07 | Interactive multi-step flow requiring real AskUserQuestion responses | Invoke `/convention coding rust` with no existing coding convention. Verify 3 options presented for missing base. |
| Surgical edit update flow | SKILL-05 | Requires existing convention file and interactive change collection | After creating a convention, invoke `/convention commit` again. Select "Surgical edit", add/modify/remove rules. Verify structured change report. |
| Empty convention (all delta-filtered) handling | SKILL-03 | Depends on actual research results and delta test outcomes | Invoke `/convention` for an area where Claude follows all best practices. Verify force-create/skip/adjust options. |
| Publisher vs consumer path resolution | SKILL-07 | Requires two project directories with different configs | Compare output paths with and without `.claude/cckit.json`. |

---

## Validation Audit 2026-04-05

| Metric | Count |
|--------|-------|
| Gaps found | 7 |
| Resolved | 7 |
| Escalated | 0 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 1s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-05
