---
phase: 19-first-convention-commit
plan: 02
subsystem: conventions
tags: [convention, commit, hook, pretooluse, shell, jq]

requires:
  - phase: 19-first-convention-commit-01
    provides: conventions/commit/CONVENTION.md (convention file read at runtime by hook)
provides:
  - "conventions/commit/hooks/validate.sh — PreToolUse hook for convention injection and validation"
  - "settings.json updated to register new hook"
  - "Old validate-commit-scope.sh removed"
affects: [convention-installation, phase-20]

tech-stack:
  added: []
  patterns: [pretooluse-additionalcontext-injection, dual-path-convention-discovery]

key-files:
  created:
    - conventions/commit/hooks/validate.sh
  modified:
    - .claude/settings.json

key-decisions:
  - "Used jq -Rs for convention file reading instead of --rawfile to guarantee JSON escaping across macOS sh"
  - "Single hook script serves dual purpose: convention injection via additionalContext + mechanical validation via deny"
  - "Dual-path convention discovery: publisher (conventions/commit/) then consumer (.claude/rules/)"

patterns-established:
  - "PreToolUse hook with additionalContext for convention awareness injection"
  - "Mechanical validation limited to format/scope/GSD-references per D-14"

requirements-completed: [COMMIT-01]

duration: 15min
completed: 2026-04-06
---

# Plan 02: Convention injection hook and settings migration

**PreToolUse hook at conventions/commit/hooks/validate.sh injects convention content via additionalContext and mechanically validates commit format, scope patterns, and GSD references**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-06T13:00:00Z
- **Completed:** 2026-04-06T13:15:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Hook script combines convention content injection (additionalContext) with mechanical validation (deny)
- All 12 test cases pass: passthrough, allow-with-injection, deny for 8 violation types, no-convention passthrough, gsd-tools detection
- Old validate-commit-scope.sh functionality fully subsumed
- Settings.json migrated to new hook

## Task Commits

1. **Task 1: Create convention injection and validation hook** - `d201740` (feat)
2. **Task 2: Update settings.json and remove old hook** - `58e1adb` (chore)

## Files Created/Modified
- `conventions/commit/hooks/validate.sh` - PreToolUse hook (108 lines, executable)
- `.claude/settings.json` - Hook registration updated
- `.claude/hooks/validate-commit-scope.sh` - Deleted (subsumed)

## Decisions Made
- Used `jq -Rs` pipe instead of `jq --rawfile` for convention file reading — macOS `/bin/sh` echo interprets `\n` in captured output, causing JSON corruption when testing; `-Rs` avoids this by reading stdin directly
- Kept `[A-Z]{2,}-[0-9]+` pattern for requirement ID detection — covers PIPE-01, MODEL-03 etc.; potential false positives (HTTP-2, TLS-1) accepted as low-risk tradeoff

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
- **macOS echo interprets escape sequences:** During testing, `echo "$OUTPUT"` corrupted jq's properly-escaped JSON strings by interpreting `\n` as literal newlines. Fixed by piping hook output directly to jq in tests. The hook itself outputs to stdout without echo, so production behavior is correct.

## User Setup Required
None - hook is automatically active via settings.json registration.

## Next Phase Readiness
- Convention file + hook are both in place
- Phase 20 can proceed with CLAUDE.md migration and installer work

---
*Phase: 19-first-convention-commit*
*Completed: 2026-04-06*
