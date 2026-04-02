# Phase 15: Fix Artifact Paths and Remove Stale Doc - Research

**Researched:** 2026-04-02
**Domain:** Mechanical cleanup -- path string replacement and file deletion
**Confidence:** HIGH

## Summary

Phase 15 is a purely mechanical cleanup phase with zero behavioral changes. Two integration gaps from the v2.0 milestone audit need closing: INT-02 (7 incorrect `.planning/specs/` path references in `skills/consolidate/SKILL.md`) and INT-03 (stale `docs/IMPL-SPEC.md` document). Both are fully scoped with exact line numbers and verified replacement strings.

The path correction is a simple find-and-replace: `.planning/specs/` becomes `specs/` in all 7 occurrences. Every other production file in the codebase (agents, MODEL.md, test fixtures, CLAUDE.md, docs/STACK.md) already uses the correct `specs/` path. The IMPL-SPEC.md deletion removes a 810-line stale document that was explicitly flagged for deletion after Phase 14. An orphaned `.gitignore` entry for this file also needs removal.

**Primary recommendation:** Execute as a single plan with two tasks -- one for path replacement in SKILL.md, one for IMPL-SPEC.md deletion + .gitignore cleanup + memory file update. No research uncertainty; all targets verified.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Fix all 7 occurrences of `.planning/specs/` to `specs/` in `skills/consolidate/SKILL.md` (lines 21, 120, 121, 133, 141, 264, 266)
- **D-02:** Remove `.gitignore` entry for `docs/IMPL-SPEC.md` (line 230) -- entry is orphaned after file deletion
- **D-03:** Hard delete via `git rm docs/IMPL-SPEC.md` -- no redirect stub, no CLAUDE.md memo. MODEL.md and agent frontmatter are already the authoritative sources (Phase 14 decision). Stale documentation risks more confusion than a missing file.
- **D-04:** Update project memory (`project_impl_spec_stale.md`) after deletion to reflect completion

### Claude's Discretion
- Exact replacement strings in SKILL.md -- straightforward find-and-replace, no judgment needed
- Git commit message wording

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INT-02 (PIPE-01, PIPE-05, CASE-08) | SKILL.md uses `.planning/specs/` path but agents and MODEL.md use `specs/` (project-root relative) | All 7 occurrences verified at exact lines; replacement string confirmed by cross-referencing agents/, docs/MODEL.md, and project memory |
| INT-03 (PIPE-06) | IMPL-SPEC.md Step 5 documents stale conditional skip branch removed by Phase 13 | File confirmed at 810 lines, git-tracked despite .gitignore entry; no production files reference it outside .planning/ |
</phase_requirements>

## Architecture Patterns

### File Targets (Complete Inventory)

```
skills/consolidate/SKILL.md  -- 7 path replacements (lines 21, 120, 121, 133, 141, 264, 266)
docs/IMPL-SPEC.md            -- delete (810 lines, git-tracked)
.gitignore                   -- remove line 230 (orphaned ignore entry)
```

### Replacement Map

Every occurrence is the same mechanical substitution: `.planning/specs/` becomes `specs/`.

| Line | Context | Before | After |
|------|---------|--------|-------|
| 21 | `<purpose>` section -- output directory description | `at \`.planning/specs/{component}/\`` | `at \`specs/{component}/\`` |
| 120 | Step 2 dispatch table -- output_context tag | `\`.planning/specs/{component}/context.md\`` | `\`specs/{component}/context.md\`` |
| 121 | Step 2 dispatch table -- output_cases tag | `\`.planning/specs/{component}/cases.md\`` | `\`specs/{component}/cases.md\`` |
| 133 | Step 2 error handling -- abort git command | `git checkout -- .planning/specs/` | `git checkout -- specs/` |
| 141 | Step 3 -- INDEX.md write path | `Write \`.planning/specs/INDEX.md\`` | `Write \`specs/INDEX.md\`` |
| 264 | Step 7 commit -- git stage path | `Stage \`.planning/specs/\`` | `Stage \`specs/\`` |
| 266 | Step 7 rollback -- git checkout path | `git checkout -- .planning/specs/` | `git checkout -- specs/` |

### Cross-Reference Verification (Already Correct)

These files already use `specs/` (no changes needed):

| File | Occurrences of `specs/` | Status |
|------|-------------------------|--------|
| agents/spec-consolidator.md | 17 | Correct |
| agents/case-briefer.md | 5 | Correct |
| agents/e2e-flows.md | 5 | Correct |
| agents/spec-verifier.md | (in agents/) | Correct |
| docs/MODEL.md | 12 | Correct |
| CLAUDE.md | 0 (no IMPL-SPEC references) | Clean |
| docs/STACK.md | 0 (IMPL-SPEC refs removed Phase 14) | Clean |
| skills/case/ | 0 `.planning/specs/` references | Clean |

### IMPL-SPEC.md Deletion Details

- **File:** `docs/IMPL-SPEC.md` (810 lines, ~43KB)
- **Git status:** Tracked (despite being in .gitignore at line 230). The `.gitignore` entry was added as a temporary measure to suppress modification noise, not to prevent tracking.
- **Deletion method:** `git rm docs/IMPL-SPEC.md` removes both the git tracking and the working tree file.
- **No downstream references:** Phase 14 already replaced all external IMPL-SPEC references with MODEL.md and agent frontmatter references. Grep confirmed zero production-file references outside `.planning/`.
- **`.gitignore` cleanup:** Line 230 (`docs/IMPL-SPEC.md`) becomes orphaned after deletion and must be removed to avoid confusion.

### Memory File Update

After deletion, update `~/.claude/projects/-Users-syr-Developments-cckit/memory/project_impl_spec_stale.md` to reflect completion. The current content warns sessions not to use IMPL-SPEC as ground truth; post-deletion it should state the file was deleted in this phase.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Path replacement | Manual line-by-line editing | `sed 's|\.planning/specs/|specs/|g'` or Edit tool per-line | All 7 occurrences are identical substitutions; batch replacement is both safer and faster |
| Git removal of tracked+ignored file | Manual `rm` + `git add` | `git rm docs/IMPL-SPEC.md` | Single command handles both index and working tree |

## Common Pitfalls

### Pitfall 1: Partial Replacement
**What goes wrong:** Replacing `.planning/specs/` in some lines but missing others, leaving an inconsistent state.
**Why it happens:** Manual editing of 7 lines across a 275-line file.
**How to avoid:** After replacement, run `grep -c '\.planning/specs/' skills/consolidate/SKILL.md` and verify the count is 0. Then run `grep -c 'specs/' skills/consolidate/SKILL.md` to confirm the replacements exist (should find at least 7+ matches since `specs/` also appears in `<existing_spec>` and `<existing_cases>` tags that were already correct).
**Warning signs:** Any occurrence of `.planning/specs/` remaining after the edit.

### Pitfall 2: Forgetting .gitignore Cleanup
**What goes wrong:** File is deleted but `.gitignore` still references it, causing confusion for future developers who wonder why a non-existent file is being ignored.
**Why it happens:** The `.gitignore` entry is easy to overlook since the file deletion is the primary task.
**How to avoid:** Include the `.gitignore` edit in the same task as the file deletion.
**Warning signs:** `grep IMPL-SPEC .gitignore` returning a match after phase completion.

### Pitfall 3: Memory File Not Updated
**What goes wrong:** Future sessions see `project_impl_spec_stale.md` warning about a file that no longer exists, and may try to delete it again or flag it as a pending task.
**Why it happens:** Memory files are outside the repo and easy to forget.
**How to avoid:** Include memory update as an explicit task step.
**Warning signs:** Memory file still says "should be deleted" after the phase.

### Pitfall 4: Accidentally Modifying .planning/ Files
**What goes wrong:** The researcher's grep found `.planning/specs/` in many `.planning/` files (research, plans, audit, CONTEXT.md). Changing these would rewrite history.
**Why it happens:** Over-eager find-and-replace applied too broadly.
**How to avoid:** Target ONLY `skills/consolidate/SKILL.md`. Historical `.planning/` records are frozen artifacts and must not be modified.
**Warning signs:** Git diff showing changes in `.planning/` files.

## Code Examples

### Path Replacement in SKILL.md

The Edit tool should be used for each line, or a single sed command can batch the replacement:

```bash
# Verification before (should return 7)
grep -c '\.planning/specs/' skills/consolidate/SKILL.md

# Verification after (should return 0)
grep -c '\.planning/specs/' skills/consolidate/SKILL.md
```

### IMPL-SPEC.md Deletion

```bash
# Remove from git index and working tree
git rm docs/IMPL-SPEC.md

# Verify removal
ls docs/IMPL-SPEC.md 2>/dev/null && echo "STILL EXISTS" || echo "DELETED"
```

### .gitignore Cleanup

Remove line 230 (`docs/IMPL-SPEC.md`). The surrounding context:
```
# End of https://www.toptal.com/developers/gitignore/api/macos,windows,node,linux,deno

docs/IMPL-SPEC.md    <-- REMOVE THIS LINE
.claude/worktrees
```

### Memory File Update

Update `~/.claude/projects/-Users-syr-Developments-cckit/memory/project_impl_spec_stale.md`:

```markdown
---
name: IMPL-SPEC.md deleted
description: docs/IMPL-SPEC.md was deleted as a gap closure item. The file was stale and contained incorrect paths. MODEL.md and agent frontmatter are the authoritative sources.
type: project
---

docs/IMPL-SPEC.md has been deleted. It was a stale transition document for Phases 11-14 that contained incorrect paths (`.planning/specs/` instead of the correct `specs/`).

**Current state:** Deleted. MODEL.md and agent frontmatter are the authoritative sources for consolidation pipeline documentation.
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Deno test (built-in) |
| Config file | none (deno.json in project root) |
| Quick run command | `deno test` |
| Full suite command | `deno test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INT-02 | SKILL.md contains zero `.planning/specs/` occurrences | smoke | `grep -c '\.planning/specs/' skills/consolidate/SKILL.md \| grep '^0$'` | N/A (grep check) |
| INT-02 | SKILL.md still contains `specs/` references (replacements worked) | smoke | `grep -c 'specs/' skills/consolidate/SKILL.md` (should be > 0) | N/A (grep check) |
| INT-03 | IMPL-SPEC.md does not exist | smoke | `test ! -f docs/IMPL-SPEC.md` | N/A (file absence check) |
| INT-03 | .gitignore does not reference IMPL-SPEC.md | smoke | `grep -c 'IMPL-SPEC' .gitignore \| grep '^0$'` | N/A (grep check) |

### Sampling Rate
- **Per task commit:** `grep -c '\.planning/specs/' skills/consolidate/SKILL.md` + `test ! -f docs/IMPL-SPEC.md`
- **Per wave merge:** `deno test` (existing test suite should still pass -- no behavioral changes)
- **Phase gate:** All smoke checks pass + full Deno test suite green

### Wave 0 Gaps
None -- this phase requires only file-existence and grep checks, no new test infrastructure.

## Project Constraints (from CLAUDE.md)

- **Commit conventions:** Conventional Commits 1.0.0, scope must name a tool/module/component (not phase numbers). GSD-internal references must NEVER appear in commit messages.
- **GSD Reference Boundary:** GSD-internal references exist only inside `.planning/`. Phase 15 work must not introduce them outside.
- **Content language:** All content in English.
- **Technology neutrality:** Not directly relevant to this mechanical cleanup, but the path fix ensures SKILL.md aligns with the universal `specs/` convention used by all other production artifacts.

## Open Questions

None. All targets are fully identified with exact line numbers, replacement strings verified, and downstream impact confirmed as zero.

## Sources

### Primary (HIGH confidence)
- `skills/consolidate/SKILL.md` -- direct inspection of all 7 occurrences (lines 21, 120, 121, 133, 141, 264, 266)
- `agents/spec-consolidator.md`, `agents/case-briefer.md`, `agents/e2e-flows.md` -- cross-reference verification (all use `specs/`)
- `docs/MODEL.md` -- canonical path convention verification (uses `specs/`)
- `.gitignore` line 230 -- confirmed orphaned entry
- `docs/IMPL-SPEC.md` -- confirmed exists, 810 lines, git-tracked
- `.planning/v2.0-MILESTONE-AUDIT.md` -- INT-02 and INT-03 gap definitions
- `~/.claude/projects/.../memory/feedback_specs_path.md` -- user-confirmed correct path is `specs/`
- `~/.claude/projects/.../memory/project_impl_spec_stale.md` -- user-confirmed IMPL-SPEC is stale

### Secondary (MEDIUM confidence)
None needed -- all findings from direct file inspection.

### Tertiary (LOW confidence)
None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no libraries involved, pure file edits
- Architecture: HIGH -- exact targets identified and verified with line numbers
- Pitfalls: HIGH -- simple operations with well-known failure modes

**Research date:** 2026-04-02
**Valid until:** Indefinite (static file targets, no version dependencies)
