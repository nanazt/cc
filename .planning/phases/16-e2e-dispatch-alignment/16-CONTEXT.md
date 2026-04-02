# Phase 16: Align E2E Flows Dispatch Contract - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Resolve the dispatch tag mismatch between SKILL.md Step 4 and e2e-flows.md agent Input Contract. The 11-02-PLAN and agent already agree on 7 tags; SKILL.md Step 4 lists only 4 (with 1 phantom). This phase aligns SKILL.md to match the established plan+agent contract.

**Deliverables:**
1. SKILL.md Step 4 rewrite with correct 7-tag dispatch table
2. Removal of phantom `<phase_id>` tag from Step 4

**Not in scope:** e2e-flows.md agent changes (already correct), audit report corrections (`.planning/` internal), plan file updates (historical artifacts).

</domain>

<decisions>
## Implementation Decisions

### Tag set alignment
- **D-01:** SKILL.md Step 4 dispatch tags must match the e2e-flows.md Input Contract exactly. The 7-tag set is: `objective`, `changed_components`, `spec_hashes`, `existing_flows` (opt), `new_flows` (opt), `project_file`, `specs_dir`.
- **D-02:** The 11-02-PLAN (lines 89-96) and e2e-flows.md agent Input Contract already agree on the same 7 tags. No changes needed to either. The milestone audit's claim of "Plan: 5 tags" was inaccurate -- it undercounted the plan's interfaces block.

### Phantom tag removal
- **D-03:** Remove `<phase_id>` from SKILL.md Step 4. Root cause: executor copied it from Step 2's spec-consolidator dispatch table during the v2 rewrite (commit 0a6b5c9). It is not in the 11-02-PLAN e2e-flows spec, not in the agent's Input Contract, and the agent has no use for it (E2E flows use hash-based staleness detection, not phase tracking).

### Step 4 format
- **D-04:** SKILL.md Step 4 dispatch tags use the same `| Tag | Required | Contents |` table format as Step 2 (spec-consolidator) and Step 5 (spec-verifier). Replaces the current incomplete parenthetical list. Exact Contents column values finalized during planning.

### Claude's Discretion
- Exact Contents column wording in the dispatch table (aligned with agent Input Contract descriptions)
- Whether to add a cross-reference note to the agent file (e.g., "see agents/e2e-flows.md for full contract")

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Dispatch alignment targets
- `skills/consolidate/SKILL.md` -- Step 4 (lines 191-205) is the rewrite target. Also reference Step 2 (lines 108-124) and Step 5 (lines 209-219) for table format pattern.
- `agents/e2e-flows.md` -- Input Contract table (lines 21-31) is the source of truth for the 7-tag set. No changes needed.

### Plan specification
- `.planning/phases/11-consolidation-pipeline/11-02-PLAN.md` -- Lines 89-96: e2e-flows dispatch spec with all 7 tags. Lines 329-336: detailed tag documentation for agent creation.

### Audit evidence
- `.planning/v2.0-MILESTONE-AUDIT.md` -- INT-01 gap definition. Note: audit undercounted plan tags as 5 (actual: 7).

### Prior phase context
- `.planning/phases/14-cross-unit-flows/14-CONTEXT.md` -- E2E flows decisions, Dependencies structuring, agent bias fix.
- `.planning/phases/11-consolidation-pipeline/11-CONTEXT.md` -- Pipeline structure, agent dispatch conventions, agent model assignments.

</canonical_refs>

<code_context>
## Existing Code Insights

### Files to Modify
- `skills/consolidate/SKILL.md` -- Step 4 lines 191-205: replace parenthetical tag list (line 201) with dispatch table matching 7-tag contract

### Files Already Correct (no changes needed)
- `agents/e2e-flows.md` -- Input Contract already lists all 7 tags with Required/Optional and descriptions
- `tools/schema-parser.ts` -- `e2eFlows` parsing unchanged
- `tools/hash-sections.ts` -- Hash computation unchanged

### Established Patterns
- Step 2 dispatch table: 13 tags in `| Tag | Required | Contents |` format (SKILL.md lines 110-124)
- Step 5 dispatch table: 7 tags in same format (SKILL.md lines 211-219)
- XML dispatch tags as agent input contracts -- consistent across all three agents

### Integration Points
- SKILL.md Step 3 builds `<changed_components>` manifest -> consumed by Step 4 dispatch
- SKILL.md Step 3.5 builds `<existing_flows>` and `<new_flows>` lists -> consumed by Step 4 dispatch
- SKILL.md Step 4 computes `<spec_hashes>` via hash-sections.ts -> passed to agent

</code_context>

<specifics>
## Specific Ideas

- The 11-01-PLAN originally wrote Step 4 as "(see agent contract)" -- the delegation was correct but the executor unrolled it incorrectly. The table format makes the unrolling explicit and verifiable.
- The phantom `<phase_id>` in Step 4 is a classic delegation unrolling divergence: when a delegated reference is expanded inline, tags from adjacent contexts (Step 2) bleed in.
- After this fix, all three dispatch steps (2, 4, 5) will have self-contained tag tables in SKILL.md, making the orchestrator prompt readable without cross-referencing agent files.

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 16-e2e-dispatch-alignment*
*Context gathered: 2026-04-03*
