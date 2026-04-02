---
phase: 12-case-updates
plan: 01
subsystem: case
tags: [case, vocabulary, terminology, rule-prefixes, universal]

# Dependency graph
requires:
  - phase: 09-universal-model-design
    provides: component/CR terminology decisions that drove the GR-N/OR-N prefix design
provides:
  - "v2 universal vocabulary across all /case skill files (OR-N, PR-N, GR-N format)"
  - "case-briefer uses component topology language throughout"
  - "MODEL.md Rule System table uses GR-N no-padding format"
  - "case-validator references OR section (not R section)"
affects: [12-02, 12.1-case-example-rewrite]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Rule prefix unified format: dash + number, no padding (OR-1, PR-1, GR-1, CR-1, TR-1)"
    - "GR-candidate classification replaces SR-candidate for PROJECT.md promotion candidates"
    - "Global Rules replaces System Rules as label across all /case files"

key-files:
  created: []
  modified:
    - skills/case/SKILL.md
    - skills/case/step-init.md
    - skills/case/step-discuss.md
    - skills/case/step-finalize.md
    - skills/case/README.md
    - agents/case-briefer.md
    - agents/case-validator.md
    - docs/MODEL.md

key-decisions:
  - "OR-N is the native operation rule prefix in /case output (no consolidation-time transform needed)"
  - "All rule prefixes follow dash+number no-padding: OR-1, PR-1, GR-1, CR-1, TR-1"
  - "GR-candidate replaces SR-candidate in case-briefer Step 4.5 classification"
  - "MODEL.md Rule System table and Merge Rules updated to GR-N (overrides Phase 9 D-11 zero-padding)"

requirements-completed: [CASE-01, CASE-02, CASE-06, CASE-07]

# Metrics
duration: 15min
completed: 2026-04-01
---

# Phase 12 Plan 01: /case v2 Vocabulary Migration Summary

**Mechanical 1:1 term replacement across 8 files: R1/PR1/SR-01 -> OR-1/PR-1/GR-1, service topology -> component topology, System Rules -> Global Rules, SR Candidates -> GR Candidates**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-01T07:29:03Z
- **Completed:** 2026-04-01T07:37:02Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- All 5 /case skill files updated to v2 universal vocabulary — no SR-XX, no bare R1/PR1, no "System Rules" label remaining
- case-briefer fully migrated: service topology -> component topology, SR-candidate -> GR-candidate, {Service} -> {Component}, cross-service -> cross-component
- MODEL.md Rule System table updated: GR-XX/GR-01 -> GR-N/GR-1, bare PR1/TR1 -> PR-1/TR-1 with dash format
- case-validator updated: Operation Rules (R section) -> Operation Rules (OR section), Rule R3 example -> Rule OR-3

## Task Commits

Each task was committed atomically:

1. **Task 1: Vocabulary migration and prefix unification in /case skill files and README** - `d36920c` (feat)
2. **Task 2: Vocabulary migration in case-briefer, case-validator, and MODEL.md** - `9d88f09` (feat)

## Files Created/Modified

- `skills/case/SKILL.md` - Rule tier conventions block rewritten to 5-tier OR-N/PR-N/TR-N/GR-N/CR-N; canonical example updated to OR-1/OR-2 + Inherits: PR-1, PR-2, GR-1
- `skills/case/step-init.md` - "service topology" -> "component topology" in briefer dispatch
- `skills/case/step-discuss.md` - Phase Rules heading, GR-candidate discovery, OR-1 in 3a rules example, PR-[N] in promotion text
- `skills/case/step-finalize.md` - Output format: PR-1/GR-1/OR-1 examples, Global Rules heading, GR Candidates section
- `skills/case/README.md` - 5-tier hierarchy description with GR/OR, GR Candidates, component topology in pipeline position
- `agents/case-briefer.md` - Component topology, cross-component, {Component}, GR-candidate, Global Candidates output section
- `agents/case-validator.md` - OR section reference, OR-3 example in quality gate
- `docs/MODEL.md` - Rule System table GR-N/GR-1, PR-1/TR-1 examples; Merge Rules GR-N notation

## Decisions Made

None beyond plan — all changes were specified in the plan and executed mechanically.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing] Added README.md Pipeline Position section update**
- **Found during:** Task 2 verification
- **Issue:** README.md line 84 still contained "service topology, auth policy, system-wide rules, cross-service patterns" in the pipeline position section — was not in the initial Task 1 edit scope
- **Fix:** Updated to "component topology, auth policy, global rules, cross-component patterns"
- **Files modified:** skills/case/README.md
- **Committed in:** `9d88f09` (Task 2 commit — bundled with other Task 2 changes)

---

**Total deviations:** 1 auto-fixed (1 missing update found during verification)
**Impact on plan:** Minor — the README pipeline position description described the briefer's PROJECT.md extraction using old vocabulary. Fixed to match v2 terminology consistently.

## Issues Encountered

None - pure text replacement with no ambiguous cases. The one remaining MODEL.md occurrence of `{Service}` is intentionally in the "Terminology Mapping from v1" table (Old Term column documenting what changed FROM), not a live usage.

## Next Phase Readiness

- Plan 01 complete: all vocabulary migration and prefix unification done
- Plan 02 ready: adds PR/TR classification, supersession metadata, specs/ priority lookup, validator section recognition
- The 5-tier rule hierarchy (OR/PR/TR/GR/CR with dash+number no-padding) is now consistently documented across all /case files

---
*Phase: 12-case-updates*
*Completed: 2026-04-01*
