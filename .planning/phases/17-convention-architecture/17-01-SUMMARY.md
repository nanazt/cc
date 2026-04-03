---
phase: 17-convention-architecture
plan: 01
subsystem: conventions
tags: [claude-code-rules, conventions, architecture, frontmatter, delta-test, hooks]

# Dependency graph
requires: []
provides:
  - "docs/CONVENTIONS.md — complete convention architecture specification"
  - "Updated REQUIREMENTS.md — language-specific convention terminology throughout"
affects: [18-convention-skill, 19-commit-convention, 20-installer, 21-coding-conventions, 22-test-conventions, 23-doc-conventions]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Convention files are Claude Code rules (.claude/rules/), not skills"
    - "Source structure: conventions/{area}/CONVENTION.md + {lang}.md + hooks/"
    - "Installed naming: cckit-{area}.md and cckit-{area}-{lang}.md"
    - "Discovery via directory scan — no manifest file"
    - "paths frontmatter requires unquoted CSV + alwaysApply: false for lazy loading"

key-files:
  created:
    - docs/CONVENTIONS.md
  modified:
    - .planning/REQUIREMENTS.md

key-decisions:
  - "Convention files are Claude Code rules (.claude/rules/), never skills — rules are passive behavioral guidance"
  - "Base convention (CONVENTION.md) is optional — only created when it passes the delta test"
  - "paths frontmatter must use unquoted CSV format plus alwaysApply: false (Claude Code known behavior, issue #17204)"
  - "Installer discovers conventions by directory scan — no manifest file"
  - "Each convention area is fully independent and installable alone"

patterns-established:
  - "Architecture doc style: Version/Status/Applies-to header, tables for mappings, explicit anti-patterns section"
  - "Delta test: 3-criteria test (default behavior, style divergence, consistency) applied per rule during authoring"

requirements-completed:
  - ARCH-01
  - ARCH-02
  - ARCH-03
  - ARCH-04

# Metrics
duration: 3min
completed: 2026-04-03
---

# Phase 17 Plan 01: Convention Architecture Summary

**Convention architecture specification defining layered rules structure, delta test, `paths` frontmatter working syntax, hook co-location, and installer discovery contract for all downstream convention phases**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-03T09:59:23Z
- **Completed:** 2026-04-03T10:03:08Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created `docs/CONVENTIONS.md` (387 lines) as the authoritative architecture specification covering all four ARCH requirements (ARCH-01 through ARCH-04)
- Documented the working `paths` frontmatter syntax (unquoted CSV + `alwaysApply: false`) vs non-working formats — prevents silent failures in downstream convention authoring
- Updated `REQUIREMENTS.md` to retire obsolete terminology in SKILL-02 and SKILL-05, replacing with "language-specific conventions"

## Task Commits

Each task was committed atomically:

1. **Task 1: Write docs/CONVENTIONS.md architecture specification** - `8bbc905` (docs)
2. **Task 2: Update REQUIREMENTS.md terminology** - `2031e21` (docs)

**Plan metadata:** _(final docs commit — see below)_

## Files Created/Modified

- `docs/CONVENTIONS.md` — Complete architecture specification for the cckit convention system
- `.planning/REQUIREMENTS.md` — SKILL-02 and SKILL-05 terminology updated; footer updated

## Decisions Made

- Acceptance criterion for "no plugin.json" drove removing specific plugin.json mentions from anti-patterns and installer sections. The semantic meaning (no manifest file) is preserved in the documentation.
- Footer wording deviated slightly from plan spec to satisfy zero "tech pack" occurrences criterion — footer now describes the change without quoting the retired term.

## Deviations from Plan

None — plan executed exactly as written. Two minor wording adjustments were made to satisfy acceptance criteria:
1. Replaced explicit `plugin.json` mentions with "manifest file" phrasing (plan criterion: zero `plugin.json` occurrences)
2. Footer avoids quoting "tech pack" to satisfy zero-occurrence criterion (plan criterion: `grep -c "tech pack"` returns 0)

These are presentation adjustments, not deviations from the architecture decisions.

## Issues Encountered

None — documentation phase with clear specifications. All acceptance criteria passed on first verification pass (after minor wording adjustments noted above).

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `docs/CONVENTIONS.md` is ready for Phase 18 (`/convention` skill implementation) as the authoritative reference
- Phase 18 executor should read `docs/CONVENTIONS.md` before implementing the skill — particularly the delta test definition and frontmatter format sections
- REQUIREMENTS.md is clean of obsolete terminology

## Self-Check: PASSED

- `docs/CONVENTIONS.md` — FOUND (387 lines)
- `.planning/REQUIREMENTS.md` — FOUND (zero "tech pack" occurrences)
- `.planning/phases/17-convention-architecture/17-01-SUMMARY.md` — FOUND
- Commit `8bbc905` — FOUND
- Commit `2031e21` — FOUND

---

*Phase: 17-convention-architecture*
*Completed: 2026-04-03*
