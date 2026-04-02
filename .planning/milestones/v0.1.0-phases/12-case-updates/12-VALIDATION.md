---
phase: 12
slug: case-updates
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-01
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification (prompt engineering files, no runtime code) |
| **Config file** | None — no automated test framework applies |
| **Quick run command** | `grep -rn 'SR-\|SR \|{Service}\|service topology\| R[0-9]' skills/case/ agents/case-briefer.md agents/case-validator.md` (should return 0 matches) |
| **Full suite command** | Manual review of each deliverable against CONTEXT.md decisions |
| **Estimated runtime** | ~5 seconds (grep audit) |

---

## Sampling Rate

- **After every task commit:** Run quick grep command to verify no old-format terms survive
- **After every plan wave:** Full manual review of all deliverables against CONTEXT.md decisions
- **Before `/gsd:verify-work`:** All grep audits return 0 matches for old terms; manual review confirms all 8 requirements
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 12-01-01 | 01 | 1 | CASE-01 | grep-audit | `grep -rni 'service\b' skills/case/ \| grep -v 'cross-component'` | N/A | ⬜ pending |
| 12-01-02 | 01 | 1 | CASE-02 | grep-verify | `grep -n 'component topology' agents/case-briefer.md` | N/A | ⬜ pending |
| 12-01-03 | 01 | 1 | CASE-06 | grep-verify | `grep -n 'OR-[0-9]' skills/case/SKILL.md` | N/A | ⬜ pending |
| 12-02-01 | 02 | 2 | CASE-03 | manual | Read step-discuss.md and step-finalize.md for TR interaction flow | N/A | ⬜ pending |
| 12-02-02 | 02 | 2 | CASE-04 | manual | Read step-finalize.md output format template for Superseded Operations | N/A | ⬜ pending |
| 12-02-03 | 02 | 2 | CASE-05 | manual | Read step-finalize.md output format template for Superseded Rules | N/A | ⬜ pending |
| 12-02-04 | 02 | 2 | CASE-07 | manual | Read agents/case-validator.md for TR-N/OR-N prefix and section recognition | N/A | ⬜ pending |
| 12-02-05 | 02 | 2 | CASE-08 | manual | Read agents/case-briefer.md Step 1 for specs/ lookup | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework installation needed — verification is grep-based audit + manual review of prompt text.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PR/TR classification flow | CASE-03 | Prompt behavior, not runtime code | Read step-discuss.md for TR proposal interaction and step-finalize.md for TR review pass |
| Superseded Operations table in output | CASE-04 | Output template format in prompt text | Read step-finalize.md CASES.md template for Superseded Operations section |
| Superseded Rules table in output | CASE-05 | Output template format in prompt text | Read step-finalize.md CASES.md template for Superseded Rules section |
| case-validator TR-N/OR-N acceptance | CASE-07 | Validator prompt logic, not runtime regex | Read agents/case-validator.md for expanded prefix acceptance list |
| case-briefer specs/ lookup | CASE-08 | Briefer prompt logic, not runtime code | Read agents/case-briefer.md Step 1 for specs/ priority substep |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
