# Phase 16: Align E2E Flows Dispatch Contract - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-04-03
**Phase:** 16-e2e-dispatch-alignment
**Areas discussed:** Canonical tag set, phase_id disposition, Step 4 format

---

## Canonical Tag Set

| Option | Description | Selected |
|--------|-------------|----------|
| Agent-based (7 tags) | Use e2e-flows.md Input Contract as source of truth, align SKILL.md to match | |
| Plan-based + extensions | Start from 11-02-PLAN's 5 tags, selectively add agent additions | |
| Redesign | Review both agent and SKILL.md from scratch for optimal tag set | |

**User's choice:** User corrected the premise -- pointed out that 11-02-PLAN actually specifies 7 tags (lines 89-96), not 5 as the audit claimed. Plan and agent are already aligned. The only problem is SKILL.md Step 4.

**Notes:** The milestone audit's INT-01 finding undercounted plan tags. Verified by reading 11-02-PLAN directly: `project_file` and `specs_dir` are both in the plan's interfaces block. This simplified the phase from "3-way mismatch resolution" to "SKILL.md correction to match existing plan+agent agreement."

---

## phase_id Disposition

| Option | Description | Selected |
|--------|-------------|----------|
| Remove | Remove phantom tag from SKILL.md Step 4 | ✓ |
| Keep + add to agent | Add phase_id to agent contract for provenance tracking | |

**User's choice:** Remove -- after verifying the origin.

**Notes:** User asked to trace where phase_id came from before deciding. Investigation found it was copied from Step 2's spec-consolidator dispatch table (SKILL.md line 122/183 in original commit 0a6b5c9). The executor included it in Step 4's parenthetical list by mistake. E2E flows agent uses hash-based staleness detection, not phase-based tracking, so phase_id serves no purpose in Step 4.

---

## Step 4 Format

| Option | Description | Selected |
|--------|-------------|----------|
| Table format | Match Step 2/5's `| Tag | Required | Contents |` pattern | ✓ |
| Parenthetical list | Keep current inline tag list, just fix the tag names | |
| You decide | Claude's discretion | |

**User's choice:** Table format. Exact Contents column wording deferred to plan phase.

**Notes:** User requested a concrete example before deciding. After seeing the proposed table alongside Step 2/5's existing tables, confirmed table format with note that specific descriptions are a planning concern.

---

## Claude's Discretion

- Contents column exact wording (aligned with agent Input Contract)
- Whether to add cross-reference note to agent file

## Deferred Ideas

None -- discussion stayed within phase scope
