---
phase: quick
plan: 260402-rc9
subsystem: case
tags: [technology-neutrality, terminology, case-skill]
key-files:
  modified:
    - skills/case/step-discuss.md
    - agents/case-briefer.md
decisions:
  - '"External dependency" is the correct neutral term for any out-of-process dependency that can become unresponsive — covers CLI subprocesses, library I/O, network calls, not just downstream services'
  - '"Interface contract" with broadened parenthetical examples covers REST, RPC, CLI commands, library exports, event listeners without assuming service architecture'
metrics:
  duration: 5
  completed: 2026-04-02
  tasks: 1
  files: 2
---

# Quick Task 260402-rc9: Fix Remaining Technology Bias in /case Skill

**One-liner:** Replace two service-architecture-specific terms with universal equivalents in step-discuss.md and case-briefer.md.

## Objective

Two terms in the /case skill ecosystem assumed the host project uses service-oriented architecture. This excluded CLI tools, libraries, embedded systems, and any non-service project type from accurately using the skill's guidance.

## Changes Made

### Edit 1 — skills/case/step-discuss.md line 234

| Before | After |
|--------|-------|
| `Downstream service timeout -> [specific status] (ErrorName)` | `External dependency timeout -> [specific status] (ErrorName)` |

Reasoning: "Downstream service" is meaningful only in service architectures. "External dependency" covers any out-of-process resource outside the code's control — database calls, network I/O, subprocesses, OS resources. It pairs naturally with the existing "Database unavailable" line above it (database is one kind of external dependency; this line covers all others).

### Edit 2 — agents/case-briefer.md line 60

| Before | After |
|--------|-------|
| `Service contract definitions (RPC methods, message handlers, etc.)` | `Interface contract definitions (exported functions, protocol methods, handler registrations, etc.)` |

Reasoning: "Service contract" assumes service-oriented architecture. "Interface contract" is universal — any formally declared callable interface with defined signatures qualifies. The broadened parenthetical examples span REST routes, RPC methods, CLI handlers, library exports, event listeners, and any other calling convention.

## Verification

```
grep -rn "Downstream service|Service contract" skills/ agents/  →  0 matches
grep -n "External dependency timeout" skills/case/step-discuss.md  →  1 match (line 234)
grep -n "Interface contract definitions" agents/case-briefer.md  →  1 match (line 60)
git diff --stat  →  2 files changed, 2 insertions(+), 2 deletions(-)
```

## Commits

| Hash | Description |
|------|-------------|
| 885d7c2 | fix(case): replace service-specific terms with technology-neutral equivalents |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- skills/case/step-discuss.md: modified (2 +-) — confirmed
- agents/case-briefer.md: modified (2 +-) — confirmed
- Commit 885d7c2: confirmed in git log
