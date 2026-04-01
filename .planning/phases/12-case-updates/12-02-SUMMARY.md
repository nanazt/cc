---
phase: 12-case-updates
plan: 02
subsystem: case
tags: [case, TR-classification, supersession, specs-lookup, validator, universal]

# Dependency graph
requires:
  - phase: 12-case-updates
    plan: 01
    provides: v2 vocabulary migration (OR-N/PR-N/GR-N format, component topology)
provides:
  - "PR/TR rule classification flow at Step 2.5, mid-discussion, and finalize TR review pass"
  - "Supersession inline detection in step-discuss.md section 3c-ix"
  - "Supersession Review (4f) and TR review pass (4g) in step-finalize.md"
  - "Superseded Operations and Superseded Rules conditional sections in CASES.md output format"
  - "case-briefer Step 1.5 specs/ priority lookup scoped to current phase only"
  - "case-validator Valid CASES.md Sections list with unified prefix regex and supersession recognition"
affects: [12.1-case-example-rewrite]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "TR classification: Claude proposes, developer confirms (same interaction as PR promotion)"
    - "Supersession detection: inline capture + finalize review (same pattern as Configuration Behaviors)"
    - "specs/ lookup: reference-not-merge — spec = historical consolidated state, CONTEXT.md = current changes"
    - "Conditional CASES.md sections: omit when empty (same as CB and Forward Concerns)"

key-files:
  created: []
  modified:
    - skills/case/step-discuss.md
    - skills/case/step-finalize.md
    - skills/case/SKILL.md
    - agents/case-briefer.md
    - agents/case-validator.md

key-decisions:
  - "TR classification follows existing CB/PR promotion interaction pattern — no new paradigm introduced"
  - "Supersession detection mirrors Configuration Behaviors: inline capture during discussion, Supersession Review at finalize (4f)"
  - "specs/ lookup is scoped to current phase components only, not dependency phases"
  - "Briefer does not classify TR — TR judgment is Protester's responsibility during discussion"
  - "Superseded Operations/Rules sections are conditional (omit when empty), matching CB and Forward Concerns"

requirements-completed: [CASE-03, CASE-04, CASE-05, CASE-07, CASE-08]

# Metrics
duration: 5min
completed: 2026-04-01
---

# Phase 12 Plan 02: /case Feature Additions Summary

**PR/TR classification, supersession metadata, specs/ priority lookup, and case-validator v2 acceptance — all following existing CB interaction patterns**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-04-01T07:40:05Z
- **Completed:** 2026-04-01T07:45:00Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- step-discuss.md: TR classification at Step 2.5 (Phase Rules confirmation) with "Reclassify as TR-N?" proposal; mid-discussion TR classification parallel to PR promotion; section 3c-ix (Supersession detection) with restructuring signal list
- step-finalize.md: Step 4f (Supersession Review) and Step 4g (TR review pass) inserted between 4e and Step 5; both conditional (skipped silently when empty); CASES.md output format Phase Rules updated to include TR-N entries; Superseded Operations and Superseded Rules conditional sections added before first Operation section; Step 6 summary block updated with TR and supersession counts
- SKILL.md: success criteria updated with "TR-classified rules" and "Supersession metadata" items
- case-briefer.md: Step 1.5 specs/ priority lookup (Glob-based, current phase only, silent fallback); Existing Spec State output section template; TR exclusion constraint in Step 4.5; three Quality Gate items for specs/ compliance
- case-validator.md: Valid CASES.md Sections list with unified prefix regex `(GR|CR|OR|PR|TR)-\d+`; Superseded Operations and Superseded Rules recognized as valid conditional sections; Check B coverage scope extended to include supersession tables; Check E exception for operations appearing only in Superseded Operations table

## Task Commits

Each task was committed atomically:

1. **Task 1: TR classification and supersession detection in step-discuss.md and SKILL.md** - `cbbf97d` (feat)
2. **Task 2: TR review pass, supersession review, and updated CASES.md format in step-finalize.md** - `0fa1af5` (feat)
3. **Task 3: specs/ priority lookup in case-briefer and v2 acceptance in case-validator** - `cf3ea46` (feat) + `a8b7d73` (fix — SR reference cleanup)

## Files Created/Modified

- `skills/case/step-discuss.md` - TR classification at Step 2.5 (lines 27-35) and mid-discussion (lines 68-72); section 3c-ix Supersession detection (lines 252-263)
- `skills/case/step-finalize.md` - Steps 4f and 4g added; Phase Rules output format with TR-N; Superseded Operations and Superseded Rules conditional sections; Step 6 summary with TR/supersession counts
- `skills/case/SKILL.md` - Two new success criteria items: TR-classified rules and Supersession metadata
- `agents/case-briefer.md` - Step 1.5 specs/ lookup; TR exclusion constraint; Existing Spec State output section; three Quality Gate items
- `agents/case-validator.md` - Valid CASES.md Sections list; unified prefix regex; Check B coverage scope; Check E supersession exception

## Decisions Made

None beyond plan — all changes were specified in the plan decisions (D-01 through D-19) and executed as directed. The only deviation was a one-line cleanup removing an informational "renamed from SR Candidates" note that triggered the old-format audit.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed old-format SR reference from validator valid sections list**
- **Found during:** Post-task verification (old-format audit)
- **Issue:** Added `- GR Candidates (renamed from SR Candidates)` as an informational note in the validator's Valid Sections list; the parenthetical contained "SR Candidates" which triggered the vocab audit check
- **Fix:** Removed the parenthetical, left `- GR Candidates` (the live label is correct; the historical context note is unnecessary)
- **Files modified:** agents/case-validator.md
- **Commit:** `a8b7d73`

---

**Total deviations:** 1 auto-fixed (1 cleanup caught during post-task verification)
**Impact on plan:** Minimal — one-line text removal. No functionality affected.

## Issues Encountered

None. All 5 acceptance criteria requirements satisfied:
- CASE-03: TR classification at 3 points (Step 2.5, mid-discussion, finalize TR review pass)
- CASE-04: Superseded Operations table in CASES.md output format (conditional)
- CASE-05: Superseded Rules table in CASES.md output format (conditional)
- CASE-07: case-validator recognizes TR-N/OR-N prefixes and Superseded sections
- CASE-08: case-briefer Step 1.5 specs/ lookup scoped to current phase, silent fallback

## Next Phase Readiness

- Phase 12 complete: all vocabulary migration (Plan 01) and feature additions (Plan 02) done
- Phase 12.1 ready: /case example rewrite (making examples project-type-agnostic beyond term replacement)
- The full CB-style interaction pattern (inline detect → capture → finalize review → conditional section) is now consistently applied to TR classification, supersession, AND configuration behaviors

---
*Phase: 12-case-updates*
*Completed: 2026-04-01*
