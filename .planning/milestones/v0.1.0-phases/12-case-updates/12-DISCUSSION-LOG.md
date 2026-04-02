# Phase 12: /case Updates - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-01
**Phase:** 12-case-updates
**Areas discussed:** PR/TR classification, Supersession tables, OR-N prefix, specs/ lookup, case-validator scope, Example neutralization, CASES.md output format, step-discuss TR interaction, case-briefer PR/TR extraction, MODEL.md update scope

---

## PR/TR Classification Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Default PR + TR flag | All rules default PR. Claude proposes TR, developer confirms. Finalize TR review pass. | ✓ |
| Classify at Step 2.5 | PR/TR decision at Phase Rules confirmation before per-operation discussion. | |
| Inline during 3a anchor | Classify each rule when discovered during operation discussion. | |
| Batch at finalize (Step 4f) | All rules stay PR during discussion. Full PR/TR review at finalize. | |

**User's choice:** Default PR + TR flag (recommended)
**Notes:** User asked whether TR classification is manual or Claude-proposed. Confirmed: Claude autonomously reads rule content and proposes TR — no hardcoded detection patterns. User explicitly said patterns in skill text should NOT be listed; Claude uses judgment.

---

## Supersession Tables

| Option | Description | Selected |
|--------|-------------|----------|
| Inline detection + finalize guard | Capture during discussion, review at finalize. Same pattern as CB. | ✓ |
| Finalize-only (Step 4f) | Only ask about supersession at finalize. | |
| Ad-hoc only (no probing) | Only record when developer explicitly mentions. | |

**User's choice:** Inline detection + finalize guard (recommended)
**Notes:** User raised concern about finalize cognitive load. Addressed: finalize is Claude (not a separate agent), conditional skip when no supersession, CB pattern is proven lightweight. User agreed — "overthinking."

---

## OR-N Prefix Adoption

| Option | Description | Selected |
|--------|-------------|----------|
| OR-N native, no padding | R1→OR-1. Matches D-11 examples. No consolidation transform. | ✓ |
| OR-N, dash+padding | R1→OR-01. GR-XX style padding. | |

**User's choice:** OR-N native, no padding
**Notes:** User additionally requested ALL rule prefixes drop padding, including GR (GR-01→GR-1). This overrides Phase 9 D-11's GR-XX format. Full unification: GR-N, CR-N, OR-N, PR-N, TR-N.

---

## specs/ Priority Lookup

| Option | Description | Selected |
|--------|-------------|----------|
| Spec as reference, phase dir as current | Spec = historical consolidated state. Phase dir = current changes. Two distinct sources. | ✓ |
| Full replacement (spec wins) | Spec completely replaces phase dir content. | |
| Merge/union | Spec as base, phase dir overlays. | |

**User's choice:** Spec as reference, phase dir as current
**Notes:** User pointed out that /case runs before /consolidate, so new operations won't be in specs/. Confirmed: specs/ lookup applies only to the current phase's operations. Dependency phases use existing Step 4.6/4.7 mechanisms.

---

## case-validator Expansion Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Mechanical acceptance only | TR-N, OR-N as valid. Supersession sections recognized. No format enforcement. | ✓ |
| Mechanical + format consistency | Above + v2 prefix non-compliance warning. | |
| Intelligent TR validation | Above + flag TR rules that look permanent. | |

**User's choice:** Mechanical acceptance only
**Notes:** User asked if format enforcement is needed when only v2 is used. Confirmed: if /case only produces v2, format enforcement is just a safety net for Claude mistakes — low risk, not worth the complexity.

---

## Example Text Neutralization

| Option | Description | Selected |
|--------|-------------|----------|
| 1:1 term replacement | service→component, SR→GR, etc. Structure preserved. | ✓ |
| Hybrid (selective rewrite) | 1:1 replacement + awkward examples selectively rewritten. | |
| Full example rewrite | All examples rewritten for project-type-agnosticism. | |

**User's choice:** 1:1 term replacement for Phase 12
**Notes:** Full example rewrite deferred to a separate phase (to be added via /gsd:add-phase or /gsd:insert-phase). Not a backlog item — a real phase.

---

## CASES.md Output Format — PR/TR Display

| Option | Description | Selected |
|--------|-------------|----------|
| Prefix-only distinction | PR-N and TR-N in same list. Prefix is the discriminator. | ✓ |
| Subsection split | Permanent/Temporary subheadings. | |
| Table with Type column | Structured table with PR/TR column. | |

**User's choice:** Prefix-only distinction (recommended)
**Notes:** TR is rare (0-2 per phase). Subsections and tables add structure overhead for an exception case.

---

## CASES.md Output Format — Superseded Section Placement

| Option | Description | Selected |
|--------|-------------|----------|
| After Phase Rules | Phase-level metadata grouped together. Consolidation pipeline parses top-down. | ✓ |
| Before Forward Concerns (end) | Minimizes document structure change. | |

**User's choice:** After Phase Rules (recommended)
**Notes:** Consolidation pipeline needs supersession info before processing operations. Top-down single-pass parsing.

---

## step-discuss TR Interaction

| Option | Description | Selected |
|--------|-------------|----------|
| Claude autonomous proposal | Existing flow maintained. Claude proposes TR based on content judgment. No new action items. | ✓ |
| Explicit TR action in list | "Mark as TR" added to developer actions. Always visible. | |
| Separate Step 2.6 | Dedicated TR classification step after 2.5. | |

**User's choice:** Claude autonomous proposal
**Notes:** User requested full flow visualization before deciding. Presented end-to-end TR flow (Step 2.5 → mid-discussion → finalize → consolidation). Confirmed.

---

## case-briefer PR/TR Extraction

| Option | Description | Selected |
|--------|-------------|----------|
| Briefer does not distinguish TR | GR/PR/OR-candidate only. TR is Protester's job. | ✓ |
| Briefer estimates TR-candidate | Detect temporal signals in CONTEXT.md. Hint for Protester. | |

**User's choice:** Briefer does not distinguish TR (recommended)

---

## MODEL.md Update Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Update in Phase 12 | Rule prefix table GR-XX→GR-N alongside /case updates. | ✓ |
| Separate task | MODEL.md is Phase 9 deliverable. Update separately. | |

**User's choice:** Update in Phase 12 (recommended)

---

## Claude's Discretion

- Internal structure and ordering of changes within each file
- Exact wording of TR proposal prompts
- Sequencing of file updates during execution

## Deferred Ideas

- Full /case example rewrite → separate phase after Phase 12 (not backlog — real phase via /gsd:add-phase)
