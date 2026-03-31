# Phase 11: Consolidation Pipeline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-03-31
**Phase:** 11-consolidation-pipeline
**Areas discussed:** IMPL-SPEC handling, Orchestrator redesign, Agent input contracts, Output structure + INDEX.md, Schema synchronization, Agent models, Backfill strategy, Error handling, Deliverable list, Verifier stub

---

## IMPL-SPEC Rewrite Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Full rewrite | Keep hash tool section, rewrite everything else | |
| Section-by-section | Keep hash tool + rule tier, convert agent/orchestrator sections | |
| Minimal change | Terminology swap only | |

**User's choice:** Rejected all three. Pointed out IMPL-SPEC is a planning file, not a source file, and questioned why it's being treated as a standalone document outside GSD workflow.

---

## IMPL-SPEC as Planning Document

| Option | Description | Selected |
|--------|-------------|----------|
| Delete IMPL-SPEC | GSD artifacts replace it. Deliverables are source of truth. | |
| Move to .planning/ | Integrate as GSD artifact. Cross-cutting architecture reference. | |
| Keep in docs/ | Rewrite in place as before. | |

**User's choice:** Pointed out case/consolidate skills aren't complete yet, so deliverables can't serve as design docs during implementation. Concluded: GSD planning artifacts (CONTEXT, PLAN) serve during implementation; deliverables serve after. IMPL-SPEC content migrates gradually.

**Notes:** User explicitly stated "IMPL-SPEC is a planning file, not a source file." This reframed the entire discussion.

---

## IMPL-SPEC Deletion Timing

| Option | Description | Selected |
|--------|-------------|----------|
| Phase 11 end | Delete after Phase 11 deliverables created | |
| Phase 13 end | All content transferred after verifier complete | |
| Phase 14 end | All v2 phases complete | ✓ |

**User's choice:** Phase 14 completion. Noted that all IMPL-SPEC content isn't fully transferred until Phase 13 (verifier), and Phase 14 (E2E) may also reference it.

---

## Orchestrator Pipeline Structure

| Option | Description | Selected |
|--------|-------------|----------|
| 7+2 pipeline (preserve) | Same step structure, content updated for schema | ✓ |
| Simplified (5 step) | Merge E2E/orphan into substeps | |
| Claude decides | Planner determines | |

**User's choice:** 7+2 pipeline preserved.

---

## Schema Read Method

| Option | Description | Selected |
|--------|-------------|----------|
| Bash Deno call | `deno run tools/schema-parser.ts`, parse JSON stdout | ✓ |
| Read + direct parsing | SKILL.md reads schema file directly via Read tool | |

**User's choice:** Bash Deno call. Same pattern as hash-sections.ts.

---

## Component Discovery Failure

| Option | Description | Selected |
|--------|-------------|----------|
| Ask developer | Phase 9 D-21: 2-stage discovery failure -> AskUserQuestion | ✓ |
| Error and stop | Cannot find components -> abort consolidation | |

**User's choice:** Ask developer. Phase 9 decision maintained.

---

## Conditional Section Evaluation

| Option | Description | Selected |
|--------|-------------|----------|
| Condition text to agent | Agent evaluates conditions from phase doc context + HTML comment logging | ✓ |
| Orchestrator pre-evaluates | Orchestrator evaluates, sends confirmed section list only | |
| Claude decides | Planner determines | |

**User's choice:** Condition text to agent. Phase 9 D-24/D-25 maintained.

**Notes:** User requested detailed explanation with trade-off table before selecting. Key factor: Phase 9 decisions already assumed this approach.

---

## Merge Rule Transition

| Option | Description | Selected |
|--------|-------------|----------|
| Terminology swap only | Same 11 rules, service->component, SR->CR, archetype->schema | ✓ |
| Rule restructuring | Reclassify/merge the 11 rules | |

**User's choice:** Terminology swap only.

---

## INDEX.md Type Column

| Option | Description | Selected |
|--------|-------------|----------|
| Always display | Type column always present, empty if no type | ✓ |
| Conditional display | Show only if any component has a type | |
| Claude decides | Planner determines | |

**User's choice:** Always display.

---

## Schema Sync -- New Components

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-add + confirm | "Add to schema?" prompt. Phase 9 D-22. | ✓ |
| Warning only | Warn, developer edits manually | |
| Error and stop | Schema mismatch -> abort | |

**User's choice:** Auto-add with confirmation.

---

## Schema Sync -- Deletion/Renaming

| Option | Description | Selected |
|--------|-------------|----------|
| Existing mechanisms cover | Superseded ops -> orphan cleanup -> schema cleanup | ✓ |
| Simple manual | Developer manually edits schema | |

**User's choice:** Existing mechanisms. User suggested "minimum developer intervention" principle. Also pointed out that renaming IS detectable through superseded operations mechanism -- not actually undetectable as initially presented.

**Notes:** User corrected the initial claim that renaming was undetectable. Through superseded operations, renames flow naturally: old component ops superseded -> orphan cleanup -> schema removal + new component auto-add.

---

## Agent Models

| Option | Description | Selected |
|--------|-------------|----------|
| v1 preserved (consolidator/e2e=sonnet, verifier=opus) | | |
| All sonnet | Cost savings | |
| Consolidator/e2e=sonnet, verifier=opus (fixed) | User's explicit choice | ✓ |

**User's choice:** consolidator=sonnet, e2e=sonnet, verifier=opus. User explicitly stated verifier will never be downgraded.

---

## Backfill Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| General guide in SKILL.md | Project-neutral backfill logic | ✓ |
| Separate discussion | Not in Phase 11 | |
| Claude decides | Planner determines | |

**User's choice:** General guide in SKILL.md.

---

## Error Handling

| Option | Description | Selected |
|--------|-------------|----------|
| v1 preserved | fail-fast + selective retry + stage isolation | ✓ |
| Simplified | Full abort + full rollback, no retry | |
| Claude decides | Planner determines | |

**User's choice:** v1 preserved.

---

## Verifier in Phase 11

| Option | Description | Selected |
|--------|-------------|----------|
| Skip processing | Step 5 checks for verifier file; skips if absent, marks UNVERIFIED | ✓ |
| Stub creation | Create minimal always-pass verifier | |
| Remove Step 5 | Don't include verification step in Phase 11 SKILL.md | |

**User's choice:** Skip processing. Skip branch removed when Phase 13 creates the real verifier.

---

## Claude's Discretion

- Exact XML dispatch tag structure and nesting
- Internal SKILL.md step implementation details
- Agent prompt wording and quality gate checklist phrasing
- spec-consolidator internal code organization
- e2e-flows Mermaid diagram formatting

## Deferred Ideas

- IMPL-SPEC.md deletion -- after Phase 14 completion
- Per-component section overrides (Phase 9 deferral)
- Operation prefix configurability (Phase 9 deferral)
