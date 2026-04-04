---
phase: 18-convention-skill
plan: 03
subsystem: convention-skill
tags: [skill, convention, research, preferences, generate, update]
dependency_graph:
  requires: [18-01, 18-02]
  provides: [complete-convention-skill-workflow]
  affects: [skills/convention/]
tech_stack:
  added: []
  patterns: [agent-dispatch, askuserquestion-loop, orchestrator-review, adaptive-interaction]
key_files:
  created:
    - skills/convention/step-research.md
    - skills/convention/step-preferences.md
    - skills/convention/step-generate.md
    - skills/convention/step-update.md
  modified: []
decisions:
  - "Research step builds host project context (CLAUDE.md + tech stack scan) before dispatching researcher agent to ensure project-aware research"
  - "Preferences step uses adaptive loop (no fixed question count) and exposes trade-offs when user selection conflicts with research recommendations"
  - "Generate step performs orchestrator light review after generation (frontmatter format, footer, tech-neutrality scan) to catch generator misses without blocking"
  - "Empty convention (all rules filtered by delta test) offers three explicit paths: force-create, skip, or adjust preferences and re-generate"
  - "Update step offers full-rewrite (delegates to create flow, passes existing convention to researcher as context) vs surgical-edit (targeted changes only with structured diff preview)"
metrics:
  duration_minutes: 4
  completed_date: "2026-04-04"
  tasks_completed: 2
  files_created: 4
  files_modified: 0
---

# Phase 18 Plan 03: Convention Skill Step Files Summary

**One-liner:** Four step files completing the /convention skill workflow — research agent dispatch with host context, adaptive preference collection with conflict detection, generation pipeline with delta-test handling and preview/approval cycle, and update mode with full-rewrite vs surgical-edit routing.

## What Was Built

### step-research.md

Orchestrates the research phase of convention authoring:

1. **Host project context building** — reads CLAUDE.md, scans for technology indicator files (package.json, Cargo.toml, go.mod, etc.), checks existing convention files. Compiles a compact context paragraph for the researcher.
2. **Agent dispatch** — dispatches `convention-researcher` with all required XML tags: `<objective>`, `<convention_area>`, `<target_language>`, `<host_project_context>`, `<research_tools>`. Includes `<existing_convention>` when mode is update.
3. **Result handling** — handles `RESEARCH COMPLETE` and `RESEARCH FAILED` with retry/proceed/cancel options.
4. **Findings presentation** — numbered best practices with delta classification (HIGH/LOW/NO-DELTA), delta summary statistics, library evaluation tables for language-specific research, common pitfalls.
5. **Insufficient coverage handling** — when researcher returns `## Insufficient Coverage`, presents specific gaps and offers proceed/provide-additional-context/cancel.
6. **Dual-flow transition** — routes to step-preferences (research-first) or step-generate (preferences-first, after preferences already collected).

### step-preferences.md

Adaptive user preference collection via AskUserQuestion loops:

1. **Strategy determination** — research-first flow uses research-informed questions with concrete options from findings; preferences-first flow uses broader style questions.
2. **Adaptive question loop** — no hardcoded question count. Questions are derived from convention area and research findings. Library selection presented as health/soundness + feature comparison tables when research found options.
3. **Conflict detection** — when user selection contradicts a research recommendation, presents the trade-off and asks user to decide. Never silently overrides.
4. **Preference confirmation** — summarizes all collected preferences and loops until user confirms.
5. **Dual-flow transition** — routes to step-generate (research-first) or step-research (preferences-first, to pass user_preferences to researcher for focused research).

### step-generate.md

Generation pipeline — the convergence point for both flows:

1. **Input assembly** — assembles research_results, user_preferences, output_path, convention type. Builds delta test instructions. Includes tech-neutrality check for base conventions only.
2. **Generator dispatch** — dispatches `convention-generator` with full XML input set including optional `<feedback>` tag for re-generation cycles.
3. **Result handling** — handles `GENERATION COMPLETE` and `GENERATION FAILED` with retry/cancel.
4. **Orchestrator light review** — reads generated file, checks frontmatter format (base vs lang-specific), verifies footer comment, scans base conventions for technology-specific terms. Issues collected as warnings, not blockers.
5. **Empty convention handling** — when all rules filtered by delta test: explains why, shows filtered rules, offers force-create/skip/adjust-preferences.
6. **Preview and approval cycle** — shows full file content plus generation report (rules included, rules removed by delta test, tech-neutrality results, confidence, warnings). Three options: approve, request changes (collect feedback and re-dispatch), cancel.
7. **Create_base_first handling** — after base convention approved, re-initializes for language-specific convention creation.

### step-update.md

Update mode for existing conventions:

1. **Existing file display** — reads and shows current convention content.
2. **Strategy choice** — presents full-rewrite vs surgical-edit with clear trade-off explanation.
3. **Full-rewrite path** — delegates to create flow, asks flow selection (research-first/preferences-first), passes existing convention to researcher as context so research focuses on improvements.
4. **Surgical-edit path** — adaptive change collection loop (modify/add/remove), presents change summary for confirmation, dispatches generator with `mode=surgical-edit`, `<existing_content>`, and `<requested_changes>`.
5. **Diff preview** — structured change report showing rules added, modified, removed, and unchanged count (not raw diff).
6. **Revert on cancel** — writes original `existing_convention_content` back on cancel, restoring the file to its pre-update state.

## Workflows Enabled

**Create flow (research-first):**
`step-init` → `step-research` → `step-preferences` → `step-generate` → preview/approve → done

**Create flow (preferences-first):**
`step-init` → `step-preferences` → `step-research` → `step-generate` → preview/approve → done

**Update flow (full rewrite):**
`step-init` → `step-update` → (flow selection) → `step-research` or `step-preferences` → `step-generate` → preview/approve → done

**Update flow (surgical edit):**
`step-init` → `step-update` → change collection → generator dispatch → diff preview/approve → done

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All step files are complete with no placeholder or TODO content.

## Self-Check: PASSED

Files created:
- skills/convention/step-research.md — FOUND
- skills/convention/step-preferences.md — FOUND
- skills/convention/step-generate.md — FOUND
- skills/convention/step-update.md — FOUND

Commits:
- 2a3d017 — Task 1 (step-research.md, step-preferences.md)
- de3259e — Task 2 (step-generate.md, step-update.md, step-preferences.md adaptive fix)

Cross-references intact:
- All 5 step files referenced in SKILL.md
- convention-researcher referenced in step-research.md
- convention-generator referenced in step-generate.md and step-update.md
- AskUserQuestion used throughout all 4 new step files
- $CLAUDE_SKILL_DIR used in all step transitions
