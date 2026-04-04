---
phase: 18-convention-skill
plan: 02
subsystem: skills
tags: [convention, skill, claude-code, step-routing, config]

# Dependency graph
requires: []
provides:
  - skills/convention/SKILL.md — orchestrator skill with frontmatter, philosophy, routing table, 2 agent types, 5 step file references
  - skills/convention/step-init.md — initialization step covering argument parsing, config detection, path resolution, mode detection, naming, missing-base handling, flow selection
  - .claude/cckit.json — publisher config file for cckit itself (publisher: true, empty tools)
affects: [18-convention-skill, 19-commit-convention]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Step-routing skill pattern: SKILL.md orchestrator + step files for complex multi-phase workflows"
    - "Publisher-flag config detection: mechanical cckit.json detection over directory heuristics"
    - "AskUserQuestion-only user interaction: all decisions route through the tool, never inline"

key-files:
  created:
    - skills/convention/SKILL.md
    - skills/convention/step-init.md
    - .claude/cckit.json
  modified: []

key-decisions:
  - "SKILL.md follows /case pattern: frontmatter + philosophy + routing table + step files"
  - "cckit.json publisher flag distinguishes cckit (conventions/) from consumer projects (.claude/rules/)"
  - "step-init handles all context setup: args, config, path resolution, mode, naming, missing-base, flow selection"
  - "step-init routes to step-research.md, step-preferences.md, or step-update.md based on mode and flow"

patterns-established:
  - "Convention skill step files: plain markdown, no frontmatter, numbered steps, Transition section at end"
  - "Pass-forward pattern: step-init stores all context vars (area, lang, publisher, resolved_path, mode, selected_flow, create_base_first)"

requirements-completed: [SKILL-04, SKILL-05, SKILL-07]

# Metrics
duration: 5min
completed: 2026-04-04
---

# Phase 18 Plan 02: Convention Skill Entry Point Summary

**`/convention` skill orchestrator with 5-step routing, publisher config detection, and adaptive create/update workflow initialization**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-04T12:31:28Z
- **Completed:** 2026-04-04T12:36:31Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Created `skills/convention/SKILL.md` — the main skill orchestrator with frontmatter (name, argument-hint, allowed-tools, disable-model-invocation), philosophy (delta test, research-first, adaptive interaction, AskUserQuestion mandate), formatting rules, 2 agent types (convention-researcher/opus, convention-generator/sonnet), and step routing table covering all 5 step files
- Created `skills/convention/step-init.md` — 7-step initialization covering argument parsing, cckit.json config detection, publisher/consumer path resolution, create/update mode detection, convention naming with AskUserQuestion, missing-base handling (3 options), and flow selection (research-first / preferences-first)
- Created `.claude/cckit.json` — cckit's own config file with `publisher: true` (conventions output to `conventions/{area}/`) and empty `convention.tools` array

## Task Commits

1. **Task 1: Create SKILL.md orchestrator and cckit.json config** - `910a726` (feat)
2. **Task 2: Create step-init.md initialization step** - `4993181` (feat)

## Files Created/Modified

- `skills/convention/SKILL.md` — Main /convention skill orchestrator: frontmatter, philosophy, step routing table, agent types, success criteria
- `skills/convention/step-init.md` — Init step: argument parsing, config detection, path resolution, mode detection, naming, missing-base handling, flow selection
- `.claude/cckit.json` — cckit publisher config (publisher: true, empty convention tools)

## Decisions Made

- Modeled SKILL.md directly after `/case` SKILL.md pattern (not /consolidate) — /case is the more relevant reference for interactive multi-step skills with AskUserQuestion
- step-init covers all 7 decisions from CONTEXT.md in scope: D-01 (args), D-02 (mode), D-04 (naming), D-05 (flow), D-27 (config), D-28 (config schema), D-30 (missing base)
- cckit.json uses empty `convention.tools` array as default — no MCP tools configured out of the box

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Known Stubs

None. This plan creates the skill entry point and initialization step. The remaining step files (step-research.md, step-preferences.md, step-generate.md, step-update.md) and agent files (convention-researcher.md, convention-generator.md) are deliverables of subsequent plans in this phase.

## Next Phase Readiness

- `/convention` skill is now invokable — Claude Code will load SKILL.md when user runs `/convention {area} [lang]`
- step-init.md handles all initialization logic and routes to the correct next step
- Remaining plans (03+) will add step-research.md, step-preferences.md, step-generate.md, step-update.md, convention-researcher.md, convention-generator.md

---
*Phase: 18-convention-skill*
*Completed: 2026-04-04*
