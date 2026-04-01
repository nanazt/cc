# Phase 12: /case Updates - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Update /case skill and its agents (case-briefer, case-validator) to use universal v2 vocabulary, add PR/TR rule classification, supersession metadata support, OR-N native prefix, and specs/ priority lookup for the case-briefer. All service-biased language replaced with component terminology via 1:1 term replacement.

**Deliverables:**
- `skills/case/SKILL.md` (update — rule tier conventions, examples)
- `skills/case/step-init.md` (update — service→component terminology)
- `skills/case/step-discuss.md` (update — TR interaction, rule prefix, SR→GR)
- `skills/case/step-finalize.md` (update — CASES.md output format, TR review pass, supersession)
- `agents/case-briefer.md` (update — component topology, specs/ lookup, GR/PR/OR classification)
- `agents/case-validator.md` (update — TR-N, OR-N acceptance, supersession section recognition)
- `docs/MODEL.md` (update — rule prefix table GR-XX→GR-N)

**Not in scope:** Full example rewrite (separate phase after Phase 12), spec-verifier agent (Phase 13), cross-unit flows (Phase 14).

</domain>

<decisions>
## Implementation Decisions

### PR/TR classification
- **D-01:** All rules default to PR (permanent). TR (temporary) is the exception, not the default.
- **D-02:** Claude autonomously judges rule content and proposes TR classification. No hardcoded detection patterns in skill text — Claude reads context and uses judgment.
- **D-03:** Developer can also initiate TR classification directly ("this is temporary").
- **D-04:** TR detection occurs at 3 points in the flow: Step 2.5 (Phase Rules confirmation), mid-discussion (per-operation), and finalize TR review pass. All use the same pattern: Claude proposes or developer initiates → confirmation.
- **D-05:** Finalize includes a dedicated TR review pass as safety net — presents all TR-classified rules for final confirmation. Skipped if no TR rules exist.

### Supersession metadata
- **D-06:** Inline detection during per-operation discussion (Claude notes restructuring signals internally) + finalize guard step (Supersession Review, conditional — skipped when no restructuring detected). Same pattern as Configuration Behaviors (CB).
- **D-07:** Table format per IMPL-SPEC spec-consolidator input contract:
  - Superseded Operations: `Old Operation | Replacement | Reason` (types: Renamed, Split, Merged, Moved, Removed)
  - Superseded Rules: `Phase | Rule ID | Reason`
- **D-08:** Sections omitted from CASES.md when empty (conditional, like CB section).

### Rule prefix system
- **D-09:** OR-N native in /case output. R1→OR-1. No consolidation-time R→OR transform needed. CASE-06 "natively" requirement satisfied.
- **D-10:** All rule prefixes unified with consistent format — dash + number, NO padding anywhere:

  | Prefix | Full Name | Scope | Format |
  |--------|-----------|-------|--------|
  | GR-N | Global Rule | Project-wide | GR-1, GR-2 |
  | CR-N | Component Rule | Component | CR-1, CR-2 |
  | OR-N | Operation Rule | Operation | OR-1, OR-2 |
  | PR-N | Phase Rule | Phase (promotes to CR) | PR-1, PR-2 |
  | TR-N | Temp Rule | Phase (excluded from specs) | TR-1, TR-2 |

- **D-11:** This overrides Phase 9 D-11's GR-XX (zero-padded) format. All prefixes now follow the same no-padding convention.
- **D-12:** Inherits line format updated: `Inherits: PR-1, GR-1` (consistent with no-padding style).

### specs/ priority lookup
- **D-13:** For the current phase's operations only, case-briefer checks `specs/{component}/cases.md` first. This lookup applies exclusively to the phase being discussed, not to dependency phases.
- **D-14:** spec = existing consolidated state (historical reference). phase dir CONTEXT.md = current phase changes. Two distinct sources, not replacement or merge.
- **D-15:** When no specs/ exists (first run, pre-consolidation), briefer uses phase directories only. Silent fallback, no warning. Current behavior unchanged.
- **D-16:** Briefer flags "this operation exists in spec but has new decisions in current phase" without merging. Protester handles the delta during discussion.

### case-validator scope
- **D-17:** Mechanical acceptance only: TR-N, OR-N as valid rule prefixes; Superseded Operations and Superseded Rules as valid CASES.md sections.
- **D-18:** No format enforcement (no v1 vs v2 detection), no intelligent TR content validation.
- **D-19:** Existing 5 checks (A-E) updated with v2 prefix regex. No new check categories.

### Example text neutralization
- **D-20:** Phase 12 performs 1:1 term replacement: service→component, SR→GR, `{Service}`→`{Component}`, cross-service→cross-component, etc.
- **D-21:** Full example rewrite (making examples project-type-agnostic beyond term replacement) deferred to a separate phase to be added after Phase 12 via /gsd:add-phase or /gsd:insert-phase.

### CASES.md output format
- **D-22:** Phase Rules section: PR-N and TR-N distinguished by prefix only. List structure maintained (no subsections, no table).
- **D-23:** Superseded Operations and Superseded Rules sections placed after Phase Rules / Global Rules, before first Operation section. Conditional — omitted when empty.
- **D-24:** "SR Candidates" section renamed to "GR Candidates".
- **D-25:** "System Rules" label in Phase Rules section renamed to "Global Rules".

### case-briefer changes
- **D-26:** Briefer does NOT distinguish TR. Classifies constraints as GR-candidate, PR-candidate, or OR-specific only. TR judgment is Protester's (Claude's) responsibility during discussion.
- **D-27:** Step 4.5 classification: SR-candidate→GR-candidate, R→OR (mechanical rename alongside other terminology updates).

### MODEL.md update
- **D-28:** MODEL.md Rule System table updated in Phase 12 to reflect GR-N (no-padding) format. Single table cell format change.

### Claude's Discretion
- Exact wording of TR proposal prompts during discussion
- Order of 1:1 term replacements across files
- Internal organization of changes within each deliverable file
- Whether to batch or sequence file updates during execution

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Model specification
- `docs/MODEL.md` -- Authoritative v2 model. Rule System table (update target for GR-N format). Section structure, schema format, component discovery.

### Consolidation pipeline contracts
- `docs/IMPL-SPEC.md` -- spec-consolidator input contracts: `<superseded_operations>` and `<superseded_rules>` XML tag schemas define the Superseded table formats CASES.md must produce.

### /case skill (update targets)
- `skills/case/SKILL.md` -- Main skill file. Rule tier conventions section, canonical example, formatting section.
- `skills/case/step-init.md` -- Init step. briefer dispatch, "service topology" reference.
- `skills/case/step-discuss.md` -- Discuss step. Step 2.5 Phase Rules confirmation, mid-discussion PR promotion, SR-candidate discovery. All need v2 updates + TR mechanism.
- `skills/case/step-finalize.md` -- Finalize step. CASES.md output format template, cross-operation concerns. Needs: TR review pass, supersession review, updated output format.

### Agents (update targets)
- `agents/case-briefer.md` -- Briefer agent. 11 service-biased references to update. Step 4.5 SR→GR rename. Add specs/ lookup in Step 1.
- `agents/case-validator.md` -- Validator agent. Already neutral. Add TR-N/OR-N prefix acceptance, supersession section recognition.

### Prior phase decisions
- `.planning/phases/09-universal-model-design/09-CONTEXT.md` -- Phase 9 D-07 (SR→CR), D-10 ({Component}.{Operation}), D-11 (rule prefix system — GR-XX format overridden by this phase's D-11).
- `.planning/phases/11-consolidation-pipeline/11-CONTEXT.md` -- Phase 11 D-07 (spec-consolidator receives `<component>`), D-09 (dispatch tags use component terminology).

### Requirements
- `.planning/REQUIREMENTS.md` -- CASE-01 through CASE-08: acceptance criteria for /case updates.

### Project constraints
- `CLAUDE.md` -- GSD Reference Boundary (D-XX references only inside .planning/), Technology Neutrality section.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `skills/case/SKILL.md`: Working /case skill with 3-step architecture (init→discuss→finalize). Core structure unchanged — only vocabulary and feature additions.
- `skills/case/step-discuss.md`: Mid-discussion PR promotion pattern (line 53-65) is the template for TR interaction. Same mechanism, different classification target.
- `skills/case/step-finalize.md`: CB consolidation pattern (Step 4d) is the template for supersession review (Step 4f). Same conditional "detect inline → review at finalize" structure.
- `agents/case-briefer.md`: Step 4.5 cross-cutting constraint classification. GR/PR/OR rename is mechanical.
- `agents/case-validator.md`: Already technology-neutral (no service references found). Only prefix regex and section recognition updates needed.

### Established Patterns
- AskUserQuestion for all developer-facing decisions (confirm, demote, promote)
- Agent dispatch via XML tags (`<objective>`, `<files_to_read>`, etc.)
- YAML frontmatter + Markdown body for skills and agents
- Conditional sections in CASES.md output (omit when empty): CB, Forward Concerns

### Integration Points
- `CASES.md` → `skills/consolidate/SKILL.md` (orchestrator reads CASES.md headings and supersession tables)
- `specs/{component}/cases.md` → `agents/case-briefer.md` (new: briefer reads consolidated specs for historical context)
- `docs/MODEL.md` ← Phase 12 update (rule prefix table)

</code_context>

<specifics>
## Specific Ideas

- PR/TR classification follows the same "Claude proposes, developer confirms" pattern already used for PR promotion/demotion — no new interaction paradigm needed
- Supersession detection mirrors CB (Configuration Behaviors) — inline capture + finalize review. Proven pattern, minimal cognitive overhead
- GR no-padding decision overrides Phase 9 D-11 to achieve full prefix consistency — user explicitly requested all prefixes unified
- specs/ lookup is "reference, not replacement" — briefer stays extraction-only, Protester reconciles spec history with current phase decisions during discussion
- Full example rewrite is explicitly scoped out as a separate phase — Phase 12 stays focused on v2 migration mechanics

</specifics>

<deferred>
## Deferred Ideas

- **Full /case example rewrite** — All example text in step files rewritten to be project-type-agnostic (not just term replacement). To be added as a separate phase after Phase 12 via /gsd:add-phase or /gsd:insert-phase.
- Per-component section overrides — deferred from Phase 9
- Spec-vs-code drift detection — deferred to future gsd:verify expansion

</deferred>

---

*Phase: 12-case-updates*
*Context gathered: 2026-04-01*
