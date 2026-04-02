# Phase 15: Fix Artifact Paths and Remove Stale Doc - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-02
**Phase:** 15-artifact-paths-cleanup
**Areas discussed:** Cleanup scope, IMPL-SPEC deletion post-processing

---

## Cleanup Scope

| Option | Description | Selected |
|--------|-------------|----------|
| SKILL.md + .gitignore (recommended) | Fix SKILL.md 7 path references + remove .gitignore IMPL-SPEC entry. Covers all discovered issues | ✓ |
| SKILL.md only (strict) | Only fix SKILL.md paths per Success Criteria. Leave .gitignore as-is | |

**User's choice:** SKILL.md + .gitignore (recommended)
**Notes:** None — straightforward selection

---

## IMPL-SPEC Deletion Post-Processing

| Option | Description | Selected |
|--------|-------------|----------|
| Clean delete only (recommended) | git rm + .gitignore cleanup. No stub or memo needed — MODEL.md and agent frontmatter already authoritative | ✓ |
| Redirect stub | Replace with 1-line file pointing to MODEL.md | |
| Delete + CLAUDE.md memo | Add note to CLAUDE.md that IMPL-SPEC was replaced by MODEL.md | |

**User's choice:** Clean delete only
**Notes:** User asked "will future AI sessions be confused?" — explained that (1) missing file = Claude won't try to reference it, (2) stale file is worse than absent file, (3) memory file update completes the signal chain for future sessions.

---

## Claude's Discretion

- Exact string replacements in SKILL.md (mechanical find-and-replace)
- Git commit message wording

## Deferred Ideas

None — discussion stayed within phase scope
