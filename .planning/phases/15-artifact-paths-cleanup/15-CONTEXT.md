# Phase 15: Fix Artifact Paths and Remove Stale Doc - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix incorrect `specs/` path references in production artifacts and delete stale IMPL-SPEC.md documentation. Pure mechanical cleanup — no behavioral changes, no new features.

</domain>

<decisions>
## Implementation Decisions

### Cleanup Scope
- **D-01:** Fix all 7 occurrences of `.planning/specs/` → `specs/` in `skills/consolidate/SKILL.md` (lines 21, 120, 121, 133, 141, 264, 266)
- **D-02:** Remove `.gitignore` entry for `docs/IMPL-SPEC.md` (line 230) — entry is orphaned after file deletion

### IMPL-SPEC Removal
- **D-03:** Hard delete via `git rm docs/IMPL-SPEC.md` — no redirect stub, no CLAUDE.md memo. MODEL.md and agent frontmatter are already the authoritative sources (Phase 14 decision). Stale documentation risks more confusion than a missing file.
- **D-04:** Update project memory (`project_impl_spec_stale.md`) after deletion to reflect completion

### Claude's Discretion
- Exact replacement strings in SKILL.md — straightforward find-and-replace, no judgment needed
- Git commit message wording

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Path Convention
- `docs/MODEL.md` — Authoritative v2 model specification; defines `specs/{component}/` as the correct path format
- `skills/consolidate/SKILL.md` — The orchestrator prompt containing the 7 incorrect path references

### Audit Evidence
- `.planning/v2.0-MILESTONE-AUDIT.md` — INT-02 (path mismatch) and INT-03 (stale IMPL-SPEC) gap definitions

</canonical_refs>

<code_context>
## Existing Code Insights

### Files to Modify
- `skills/consolidate/SKILL.md` — 7 occurrences of `.planning/specs/` at lines 21, 120, 121, 133, 141, 264, 266
- `.gitignore` — line 230 contains `docs/IMPL-SPEC.md`

### Files to Delete
- `docs/IMPL-SPEC.md` — 43KB stale document, git-tracked + .gitignore (contradictory state)

### Already Clean (no changes needed)
- `agents/` — zero `.planning/specs/` references
- `skills/case/` — zero `.planning/specs/` references
- `CLAUDE.md` — no IMPL-SPEC.md references

### Integration Points
- After path fix, SKILL.md will align with agents, MODEL.md, and test fixtures (all already use `specs/`)
- After IMPL-SPEC.md deletion, no production file references it (only `.planning/` historical records)

</code_context>

<specifics>
## Specific Ideas

- Memory file `project_impl_spec_stale.md` should be updated post-deletion to prevent future sessions from flagging it as a pending task
- The `.gitignore` entry for IMPL-SPEC.md was likely added as a temporary measure; removing it with the file is cleaner than leaving an orphaned ignore rule

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 15-artifact-paths-cleanup*
*Context gathered: 2026-04-02*
