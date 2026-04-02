---
phase: 13-verification
plan: "01"
subsystem: spec-verifier
tags: [agent, verification, opus, schema-parameterized, technology-neutral]
dependency_graph:
  requires:
    - agents/spec-consolidator.md (dispatch tag pattern reference)
    - agents/case-validator.md (opus read-only agent structure reference)
    - tools/schema-parser.ts (schema JSON output consumed via schema_data tag)
  provides:
    - agents/spec-verifier.md (verification agent with 27 checks)
  affects:
    - skills/consolidate/SKILL.md (Step 5 skip branch removal — separate plan)
    - docs/IMPL-SPEC.md (spec-verifier section annotated as transferred)
tech_stack:
  added: []
  patterns:
    - opus read-only agent with tiered findings output
    - schema-parameterized section checks (schema_data dispatch tag)
    - conditionalized checks (V-11, V-15) based on actual document content
    - conditional section re-evaluation (opus cross-checks sonnet's judgment)
key_files:
  created:
    - agents/spec-verifier.md
  modified:
    - docs/IMPL-SPEC.md
decisions:
  - "V-11 conditionalized: skip when no interface mapping exists in Public Interface section"
  - "V-15 conditionalized: skip when fewer than 2 components have structured error identifiers"
  - "V-20 and V-21 promoted from human-only to automated T2 checks"
  - "V-23 dropped: covered by V-01, V-02, V-03, V-05, V-07, V-17"
  - "Conditional section re-evaluation integrated into V-04 as extended behavior"
  - "maxTurns omitted from frontmatter per plan constraint"
metrics:
  duration_minutes: 4
  completed_date: "2026-04-02"
  tasks_completed: 2
  files_created: 1
  files_modified: 1
---

# Phase 13 Plan 01: Spec Verifier Agent Summary

**One-liner:** Opus read-only verification agent with 27 schema-parameterized checks, tiered findings output, and technology-neutral language throughout.

## What Was Built

### Task 1: Create agents/spec-verifier.md

Created the complete spec-verifier agent definition (418 lines) following the established opus read-only agent pattern from case-validator.md.

**Frontmatter:** `model: opus`, tools: Read, Grep, Glob only (no Write, no Bash, no maxTurns).

**Input contract (10 tags):**
- `<schema_data>` — pre-parsed schema JSON (new, per D-07)
- `<phase_context_file>` — path to phase CONTEXT.md (new, per D-08)
- 8 existing tags retained from IMPL-SPEC contract

**27 checks organized by tier:**
- **Tier 1 (10):** V-01, V-02, V-07, V-08, V-09, V-16, V-17, V-25, V-26, V-29 — blocks confirmation
- **Tier 2 (11):** V-05, V-10, V-11, V-14, V-15, V-18, V-20, V-21, V-22, V-27, V-28 — developer decides
- **Tier 3 (6):** V-03, V-04, V-06, V-12, V-13, V-19 — informational
- **Human-Only (1):** V-24 — E2E accuracy checklist item

**Key transformations applied:**
- V-10: universalized examples to `[Component].[OperationName]` structural placeholders
- V-11: conditionalized — skip when no interface mapping found in Public Interface
- V-15: conditionalized — skip when fewer than 2 components have structured error identifiers
- V-20 and V-21: promoted from human-only to automated T2 checks
- V-22: partially automated (T2 for mismatches, T3 for ambiguities)
- V-23: dropped (covered by existing checks per D-15)
- V-29: already conditional on `meta.e2eFlows` + `<e2e_dir>` presence (retained)

**Conditional section re-evaluation (D-11):** Integrated as extension of V-04. Verifier independently assesses conditional section inclusion/exclusion against phase evidence, then compares against consolidator's HTML comment decisions. Contradictions reported as T2 findings.

**Return protocol:** `Checked=N/27 Skipped=N | T1=N T2=N T3=N | Verdict: PASS/FINDINGS`

### Task 2: Annotate IMPL-SPEC spec-verifier section

Updated the blockquote under `## Agent: spec-verifier` from the Phase 13 deliverable note to:
> **Transferred to `agents/spec-verifier.md`.** Content below retained as reference until Phase 14 deletion.

Original section content (Input Contract table, Return Protocol, Quality Gate Checklist) left intact as reference per D-27.

## Verification Results

All acceptance criteria pass:
- `agents/spec-verifier.md` created with 418 lines (exceeds 200-line minimum)
- Frontmatter contains `model: opus`
- Frontmatter contains `- Read`, `- Grep`, `- Glob`
- Frontmatter does NOT contain `maxTurns`
- Frontmatter does NOT contain `- Write` or `- Bash`
- `schema_data` tag present in input contract
- `phase_context_file` tag present in input contract
- "Check all applicable verification items" wording present (D-19)
- V-23 not mentioned anywhere (D-15: dropped)
- V-11 contains "Skip" and "no interface mapping" (D-03)
- V-15 contains "Skip" and "fewer than 2 components" (D-04)
- V-20 and V-21 appear under Tier 2, not Human-Only
- V-24 appears under Human-Only section only
- Conditional section re-evaluation present
- `Checked=` and `Skipped=` format present in return protocol
- No occurrences of "Check all 28" or "all 28"
- No service-biased examples in check descriptions
- IMPL-SPEC annotated with "Transferred to" text

## Deviations from Plan

None — plan executed exactly as written. All 27 decisions from CONTEXT.md reflected in the agent.

## Known Stubs

None. The agent definition is complete and ready for dispatch by the `/consolidate` orchestrator.

## Self-Check

Files created/modified:
- `agents/spec-verifier.md` — exists (verified)
- `docs/IMPL-SPEC.md` — annotation verified via grep

Commits:
- `1f4bbb5` — feat(spec-verifier): create opus read-only verification agent with 27 checks
- `6e4fd0d` — docs(spec-verifier): annotate IMPL-SPEC section as transferred to agent definition

## Self-Check: PASSED
