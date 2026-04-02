# Phase 16: Align E2E Flows Dispatch Contract - Research

**Researched:** 2026-04-03
**Domain:** SKILL.md dispatch contract alignment (documentation-only change)
**Confidence:** HIGH

## Summary

Phase 16 resolves INT-01, a dispatch tag mismatch in `skills/consolidate/SKILL.md` Step 4. The 11-02-PLAN (lines 89-96) and the `agents/e2e-flows.md` Input Contract (lines 21-31) already agree on a 7-tag dispatch set. SKILL.md Step 4 line 201 is the sole deviation: it lists 4 tags in a parenthetical format, with one phantom (`<phase_id>`) and three missing (`<objective>`, `<changed_components>`, `<project_file>`, `<specs_dir>`).

The milestone audit's INT-01 finding originally described a "3-way mismatch" (Plan 5 / Agent 7 / SKILL.md 4), but discussion revealed the audit undercounted the plan's tags. The plan and agent are already aligned at 7 tags. This reduces the phase to a single-file correction: rewrite SKILL.md Step 4's inline tag list as a `| Tag | Required | Contents |` dispatch table matching the established 7-tag contract.

**Primary recommendation:** Replace SKILL.md Step 4 line 201 parenthetical list with a 7-row dispatch table in the same format as Step 2 (lines 110-124) and Step 5 (lines 211-222). Remove phantom `<phase_id>`. No other files need changes.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** SKILL.md Step 4 dispatch tags must match the e2e-flows.md Input Contract exactly. The 7-tag set is: `objective`, `changed_components`, `spec_hashes`, `existing_flows` (opt), `new_flows` (opt), `project_file`, `specs_dir`.
- **D-02:** The 11-02-PLAN (lines 89-96) and e2e-flows.md agent Input Contract already agree on the same 7 tags. No changes needed to either. The milestone audit's claim of "Plan: 5 tags" was inaccurate -- it undercounted the plan's interfaces block.
- **D-03:** Remove `<phase_id>` from SKILL.md Step 4. Root cause: executor copied it from Step 2's spec-consolidator dispatch table during the v2 rewrite (commit 0a6b5c9). It is not in the 11-02-PLAN e2e-flows spec, not in the agent's Input Contract, and the agent has no use for it (E2E flows use hash-based staleness detection, not phase tracking).
- **D-04:** SKILL.md Step 4 dispatch tags use the same `| Tag | Required | Contents |` table format as Step 2 (spec-consolidator) and Step 5 (spec-verifier). Replaces the current incomplete parenthetical list. Exact Contents column values finalized during planning.

### Claude's Discretion
- Exact Contents column wording in the dispatch table (aligned with agent Input Contract descriptions)
- Whether to add a cross-reference note to the agent file (e.g., "see agents/e2e-flows.md for full contract")

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FLOW-01 | E2E flow generation is opt-in via schema flag (not default) | SKILL.md Step 3.5/4 already gate on `meta.e2eFlows`; dispatch table does not change gating logic |
| FLOW-02 | Orchestrator skips flow steps when E2E is disabled | Step 3.5 skip logic is correct and unchanged; Step 4 dispatch table only executes when e2eFlows=true |
| FLOW-03 | When enabled, flow agent uses universal unit terminology | Agent Input Contract already uses "component" terminology; SKILL.md dispatch table alignment propagates this |
| FLOW-04 | Hash-based change detection works with universal unit structure | `<spec_hashes>` tag is already in all three sources (plan, agent, SKILL.md); dispatch table makes it explicit with correct contents description |
</phase_requirements>

## Dispatch Tag Analysis

### Current State (3-source comparison)

This is the core finding. All three sources were read directly from the codebase.

**Source 1: 11-02-PLAN interfaces block (lines 89-96)**

7 tags specified:
| Tag | Required |
|-----|----------|
| `<objective>` | Yes |
| `<changed_components>` | Yes |
| `<spec_hashes>` | Yes |
| `<existing_flows>` | No (optional) |
| `<new_flows>` | No (optional) |
| `<project_file>` | Yes |
| `<specs_dir>` | Yes |

**Source 2: agents/e2e-flows.md Input Contract (lines 21-31)**

7 tags -- identical set to plan:
| Tag | Required | Agent Usage |
|-----|----------|-------------|
| `<objective>` | Yes | Action description |
| `<changed_components>` | Yes | JSON manifest of updated components |
| `<spec_hashes>` | Yes | JSON from hash-sections.ts for hash comparison |
| `<existing_flows>` | No | JSON array of existing flow file paths |
| `<new_flows>` | No | JSON array of confirmed new flow names |
| `<project_file>` | Yes | Path to PROJECT.md for topology |
| `<specs_dir>` | Yes | Path to specs/ directory root |

**Source 3: SKILL.md Step 4, line 201 (CURRENT -- needs fix)**

4 tags in parenthetical format:
```
(include `<existing_flows>`, `<new_flows>`, `<spec_hashes>`, `<phase_id>`)
```

### Discrepancy Analysis

| Tag | Plan | Agent | SKILL.md | Status |
|-----|------|-------|----------|--------|
| `<objective>` | Yes | Yes | MISSING | Must add |
| `<changed_components>` | Yes | Yes | MISSING | Must add |
| `<spec_hashes>` | Yes | Yes | Yes | OK |
| `<existing_flows>` | Optional | Optional | Yes | OK (mark optional) |
| `<new_flows>` | Optional | Optional | Yes | OK (mark optional) |
| `<project_file>` | Yes | Yes | MISSING | Must add |
| `<specs_dir>` | Yes | Yes | MISSING | Must add |
| `<phase_id>` | NO | NO | Yes | PHANTOM -- remove |

**Confidence:** HIGH -- all three sources read directly from codebase files.

### Phantom Tag Root Cause

`<phase_id>` appears in SKILL.md Step 2 (line 122) as a legitimate tag for the spec-consolidator agent (which uses it for provenance tracking: "Last consolidated: Phase {id}"). During the v2 rewrite (commit 0a6b5c9), the executor incorrectly carried it into Step 4's parenthetical tag list. The e2e-flows agent uses hash-based staleness detection, not phase tracking, so it has no Input Contract entry for `<phase_id>`.

## Architecture Patterns

### Dispatch Table Format (Established Convention)

All three dispatch steps in SKILL.md follow the same table format:

```markdown
| Tag | Required | Contents |
|-----|----------|----------|
| `<tag_name>` | Yes/No | Description of what to put in this tag |
```

**Step 2 (spec-consolidator):** 13 tags, lines 110-124
**Step 5 (spec-verifier):** 10 tags, lines 211-222
**Step 4 (e2e-flows):** Currently a parenthetical list on line 201. Must become a 7-row table.

The Contents column in Steps 2 and 5 uses concise descriptions that tell the orchestrator where data comes from and what format it should be in. Examples from Step 2:

- `"Consolidate Phase {id} decisions for {component} into specs/{component}/."` (objective)
- `Component name (lowercase)` (component)
- `JSON array of context sections from schema resolution (the context[] array from the resolved SectionBlock)` (sections)
- `Phase identifier string` (phase_id)

Examples from Step 5:

- `Full JSON output from schema-parser.ts (parsed in Step 1)` (schema_data)
- `Path to specs/ directory root` (specs_dir)
- `JSON manifest from consolidator results` (changed_components)

### Contents Column Wording (Discretion Area)

The agent Input Contract provides "How You Use It" descriptions. The SKILL.md dispatch table needs "Contents" descriptions (what the orchestrator puts in). These should:

1. Match the agent's expectations without duplicating its documentation
2. Reference where data comes from in the pipeline (e.g., "from Step 3", "from hash-sections.ts")
3. Follow the format conventions of Steps 2 and 5

Recommended Contents column values for the 7 tags:

| Tag | Required | Recommended Contents |
|-----|----------|---------------------|
| `<objective>` | Yes | `"Generate/update E2E flow documentation for changed components."` |
| `<changed_components>` | Yes | JSON manifest from consolidator results (Step 3) |
| `<spec_hashes>` | Yes | JSON output from hash-sections.ts (computed in sub-step 2 above) |
| `<existing_flows>` | No | JSON array of existing flow file paths from `specs/e2e/` (Step 3.5). Omit if none exist. |
| `<new_flows>` | No | JSON array of developer-confirmed new flow names (Step 3.5). Omit if none confirmed. |
| `<project_file>` | Yes | Path to `.planning/PROJECT.md` |
| `<specs_dir>` | Yes | Path to `specs/` directory root |

**Note on `<project_file>`:** The value should match what the orchestrator actually passes. The agent uses it "for component topology reference" per its Input Contract. Steps 5 already passes `Path to PROJECT.md` for the same purpose.

### Cross-Reference Note (Discretion Area)

Steps 2 and 5 do not include cross-reference notes to their respective agents. Adding one to Step 4 would be inconsistent. **Recommendation:** Do not add a cross-reference. The dispatch table is self-contained by design -- same as Steps 2 and 5.

## Exact Change Scope

### File: `skills/consolidate/SKILL.md`

**Lines to replace:** Line 201 (the parenthetical tag list)

Current line 201:
```
4. Build dispatch prompt with XML tags for the e2e-flows agent (include `<existing_flows>`, `<new_flows>`, `<spec_hashes>`, `<phase_id>`).
```

Replace with a numbered item 4 that introduces the dispatch table, followed by the 7-row `| Tag | Required | Contents |` table.

**Surrounding context preservation:**
- Lines 191-200 (Step 4 header, Deno verification, hash computation, hash parsing) -- unchanged
- Lines 202-205 (dispatch instruction, parse return, error handling) -- unchanged, but line numbering shifts due to table insertion
- The numbered list items (1-6) need renumbering: current items 4 ("Build dispatch"), 5 ("Dispatch"), 6 ("Parse return") become items 4-6 with the table embedded after the introductory sentence in item 4

### Files NOT Changed

| File | Reason |
|------|--------|
| `agents/e2e-flows.md` | Already correct (7 tags match plan) |
| `.planning/phases/11-consolidation-pipeline/11-02-PLAN.md` | Historical artifact, already correct |
| `tools/schema-parser.ts` | No dispatch changes |
| `tools/hash-sections.ts` | No hash changes |
| `agents/spec-consolidator.md` | Unrelated agent |
| `agents/spec-verifier.md` | Unrelated agent |

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tag set definition | Invent a new tag set | Copy from e2e-flows.md Input Contract | Plan+agent already agree; SKILL.md must match, not diverge |
| Contents wording | Write novel descriptions | Adapt from Steps 2/5 and agent Input Contract | Consistency across dispatch tables matters for readability |
| Format | Invent a new dispatch format | Reuse `\| Tag \| Required \| Contents \|` pattern | Three dispatch steps should look identical in structure |

## Common Pitfalls

### Pitfall 1: Introducing New Discrepancies
**What goes wrong:** When rewriting the dispatch table, the planner or executor adds/removes a tag that breaks alignment with the agent.
**Why it happens:** Working from memory instead of directly reading the agent's Input Contract.
**How to avoid:** The 7-tag set is locked by D-01. Verification must diff the new SKILL.md table against e2e-flows.md lines 21-31.
**Warning signs:** Tag count differs from 7, or tag names don't match exactly.

### Pitfall 2: Copying Step 2's phase_id Into the New Table
**What goes wrong:** Since Step 2 has `<phase_id>` as a legitimate tag, and the executor is looking at Step 2 as a format reference, they might include it in Step 4's new table.
**Why it happens:** This is exactly how the original phantom was introduced (commit 0a6b5c9).
**How to avoid:** D-03 explicitly removes `<phase_id>` from Step 4. The 7-tag set does not include it. Verification must confirm its absence.
**Warning signs:** 8 tags in the new table instead of 7.

### Pitfall 3: Renumbering Errors in the Procedure List
**What goes wrong:** Step 4 has a numbered list (1-6). Inserting a table after item 4's introductory sentence could disrupt the numbering or the list structure.
**Why it happens:** Markdown numbered lists can be fragile when tables are embedded.
**How to avoid:** Restructure item 4 to introduce the table with a sentence, then embed the table, then continue with item 5. Check that all 6 items still render correctly.
**Warning signs:** Items 5 and 6 (Dispatch agent, Parse return) disappear or merge.

### Pitfall 4: Inconsistent Required/Optional Marking
**What goes wrong:** Marking a tag as Required when the agent says Optional, or vice versa.
**Why it happens:** Confusing "the orchestrator always has this data" with "the agent always needs it."
**How to avoid:** Copy Required/Optional directly from agent Input Contract. `existing_flows` and `new_flows` are Optional (omitted when none exist). The other 5 are Required.
**Warning signs:** "No" in Required column for a tag other than `existing_flows` or `new_flows`.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Deno test (built-in) |
| Config file | None (convention-based) |
| Quick run command | `deno test` |
| Full suite command | `deno test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FLOW-01 | E2E opt-in via schema flag | manual-only | N/A (documentation change -- verify by reading SKILL.md) | N/A |
| FLOW-02 | Orchestrator skips when disabled | manual-only | N/A (gating logic unchanged, verification is structural) | N/A |
| FLOW-03 | Universal unit terminology | manual-only | N/A (verify "component" not "service" in dispatch table) | N/A |
| FLOW-04 | Hash-based change detection works | manual-only | N/A (spec_hashes tag presence verifiable by reading) | N/A |

**Justification for manual-only:** This phase modifies a single documentation file (SKILL.md). The change is a dispatch table rewrite with no code execution paths affected. Verification is structural: compare the new table's tags against e2e-flows.md Input Contract. No automated test can meaningfully validate markdown table content alignment -- this requires a line-by-line diff.

### Sampling Rate
- **Per task commit:** Visual diff of SKILL.md Step 4 against e2e-flows.md lines 21-31
- **Per wave merge:** `deno test` (ensure no regressions in hash/parser tools)
- **Phase gate:** Tag-by-tag comparison: SKILL.md Step 4 table vs e2e-flows.md Input Contract

### Wave 0 Gaps
None -- no test infrastructure needed for a documentation-only change. Existing `deno test` suite covers regression safety.

## Verification Approach

Since this phase is a documentation-only change, verification is structural rather than behavioral:

1. **Tag set match:** Extract tag names from new SKILL.md Step 4 table. Extract tag names from e2e-flows.md Input Contract. Sets must be identical (7 tags).
2. **No phantom tags:** Confirm `<phase_id>` does not appear in Step 4.
3. **Format consistency:** Confirm Step 4 uses `| Tag | Required | Contents |` format matching Steps 2 and 5.
4. **Required/Optional alignment:** For each tag, Required column in SKILL.md matches Required column in e2e-flows.md.
5. **Regression check:** `deno test` passes (no code changes, but good hygiene).

## Code Examples

### Target State: SKILL.md Step 4 Dispatch Table

The new table should look like this (Contents column wording is Claude's discretion per CONTEXT.md):

```markdown
4. Build dispatch prompt containing these XML tags:

   | Tag | Required | Contents |
   |-----|----------|----------|
   | `<objective>` | Yes | "Generate/update E2E flow documentation for changed components." |
   | `<changed_components>` | Yes | JSON manifest from consolidator results (Step 3) |
   | `<spec_hashes>` | Yes | JSON output from hash-sections.ts (computed in sub-step 2 above) |
   | `<existing_flows>` | No | JSON array of existing flow file paths from `specs/e2e/` (Step 3.5). Omit if none exist. |
   | `<new_flows>` | No | JSON array of developer-confirmed new flow names (Step 3.5). Omit if none confirmed. |
   | `<project_file>` | Yes | Path to PROJECT.md |
   | `<specs_dir>` | Yes | Path to `specs/` directory root |
```

### Reference: Step 2 Dispatch Table (existing pattern)

Source: `skills/consolidate/SKILL.md` lines 108-124

```markdown
For each affected component, build a dispatch prompt containing these XML tags:

| Tag | Required | Contents |
|-----|----------|----------|
| `<objective>` | Yes | "Consolidate Phase {id} decisions for {component} into specs/{component}/." |
| `<component>` | Yes | Component name (lowercase) |
| `<sections>` | Yes | JSON array of context sections from schema resolution ... |
...
```

### Reference: Step 5 Dispatch Table (existing pattern)

Source: `skills/consolidate/SKILL.md` lines 209-222

```markdown
Build dispatch prompt for `agents/spec-verifier.md` with these XML tags:

| Tag | Required | Contents |
|-----|----------|----------|
| `<objective>` | Yes | "Verify consolidated specs for Phase {id}..." |
| `<schema_data>` | Yes | Full JSON output from schema-parser.ts ... |
...
```

## Open Questions

1. **Contents column for `<project_file>`: `.planning/PROJECT.md` or just `PROJECT.md`?**
   - Step 5 says "Path to PROJECT.md" without the `.planning/` prefix
   - The actual path is `.planning/PROJECT.md`
   - Recommendation: Follow Step 5's convention: "Path to PROJECT.md" (the orchestrator knows the actual path)

No other open questions. The phase scope is narrow and well-defined by CONTEXT.md decisions.

## Sources

### Primary (HIGH confidence)
- `skills/consolidate/SKILL.md` -- read directly, lines 106-205 (Steps 2-4 dispatch)
- `agents/e2e-flows.md` -- read directly, lines 1-151 (full agent including Input Contract)
- `.planning/phases/11-consolidation-pipeline/11-02-PLAN.md` -- read directly, lines 89-96 (e2e-flows dispatch spec)
- `.planning/phases/16-e2e-dispatch-alignment/16-CONTEXT.md` -- read directly (all decisions)
- `.planning/v2.0-MILESTONE-AUDIT.md` -- read directly (INT-01 gap definition and evidence)

### Secondary (MEDIUM confidence)
- `.planning/phases/16-e2e-dispatch-alignment/16-DISCUSSION-LOG.md` -- read for audit trail of decisions

### Tertiary (LOW confidence)
None -- all findings verified from primary sources.

## Metadata

**Confidence breakdown:**
- Standard stack: N/A (no libraries involved -- documentation-only change)
- Architecture: HIGH -- dispatch table format is established convention with two existing examples in the same file
- Pitfalls: HIGH -- root cause of the original bug is documented (commit 0a6b5c9) and all discrepancies verified by direct file comparison

**Research date:** 2026-04-03
**Valid until:** indefinite (no external dependencies; internal codebase documentation)
