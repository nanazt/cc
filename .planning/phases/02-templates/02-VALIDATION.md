---
phase: 2
slug: templates
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-31
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual file inspection (no code runtime — pure Markdown authoring) |
| **Config file** | none |
| **Quick run command** | `grep -c "^## " templates/{archetype}/context.md` |
| **Full suite command** | `bash -c 'for f in templates/*/context.md; do echo "$f:"; grep "^## " "$f"; done'` |
| **Estimated runtime** | ~1 second |

---

## Sampling Rate

- **After every task commit:** Run quick section count check
- **After every plan wave:** Run full suite — verify all templates have correct section counts
- **Before `/gsd:verify-work`:** Full suite must confirm section schemas match IMPL-SPEC
- **Max feedback latency:** 1 second

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | TMPL-01 | manual-inspect | `grep "^## " templates/domain-service/context.md \| wc -l` (expect 8) | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | TMPL-02 | manual-inspect | `grep "^## " templates/gateway-bff/context.md \| wc -l` (expect 7) | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | TMPL-03 | manual-inspect | `grep "^## " templates/event-driven/context.md \| wc -l` (expect 7) | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | TMPL-04 | manual-inspect | `grep -c "(conditional)" templates/gateway-bff/context.md` (expect 3) | ❌ W0 | ⬜ pending |
| 02-01-05 | 01 | 1 | TMPL-05 | manual-inspect | `grep -c "cases.md" templates/domain-service/context.md` | ❌ W0 | ⬜ pending |
| 02-01-06 | 01 | 1 | TMPL-06 | manual-inspect | `grep -E "Adapter Contracts\|Service Interface" templates/domain-service/context.md` (no v1 names) | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `templates/domain-service/` — directory structure created
- [ ] `templates/gateway-bff/` — directory structure created
- [ ] `templates/event-driven/` — directory structure created

*Existing infrastructure: none — this is a new artifact directory.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Section content quality | TMPL-01 through TMPL-03 | Guide text quality requires human review | Read each section's placeholder/guide text and verify it describes the section's purpose in technology-neutral language |
| v1→v2 rename completeness | TMPL-06 | Must verify absence of old names across all files | `grep -rE "Ports\|gRPC Interface\|Proto" templates/` should return 0 matches |
| Conditional marker semantics | TMPL-04 | Must verify markers include behavioral inclusion conditions | Read `(conditional)` sections and verify each has a when-to-include guide |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 1s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
