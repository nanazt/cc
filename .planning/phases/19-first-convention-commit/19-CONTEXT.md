# Phase 19: First Convention — Commit - Context

**Gathered:** 2026-04-06
**Updated:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Create the first commit message convention using the `/convention` skill, producing `conventions/commit/CONVENTION.md`. Validate the authoring pipeline end-to-end while focusing on deliverable quality. Additionally, implement a GSD commit convention injection hook that ensures commit messages follow conventions (previously Phase 19.1, now integrated).

Scope: commit message convention content, GSD reference prohibition rule, PROJECT.md identity update, convention injection hook for GSD commit workflow.

Not in scope: self-application to cckit (deferred to Phase 20 installer), CLAUDE.md migration (deferred to Phase 20), pipeline edge case testing (verify-work), installer (Phase 20), other conventions (Phase 21+).

</domain>

<decisions>
## Implementation Decisions

### Project Identity
- **D-01:** cckit targets GSD workflow users. Conventions work without GSD, but skills (/case, /consolidate, /convention) require GSD. "Arbitrary project" means "any project using GSD," not "any project whatsoever." PROJECT.md must be updated to reflect this.

### Convention Content Direction
- **D-02:** Content covers scope naming strategy, commit granularity/atomicity, and subject/body quality rules. Final content details delegated to the /convention skill's researcher — user reviews after research.
- **D-03:** Convention explicitly includes a GSD reference prohibition rule: GSD phase numbers, plan IDs, requirement IDs, and decision IDs must not appear in commit messages. This is stated directly (not abstracted to "project management metadata") because cckit targets GSD users.

### Delta Test
- **D-04:** Strict delta test. Remove everything Claude already knows from training data: basic Conventional Commits format, imperative mood, 72-character subject lines, standard type list. Only rules that genuinely change Claude's behavior survive.
- **D-05:** Empty convention is a valid outcome. If delta test eliminates all rules, the conclusion "commit convention is unnecessary" is a legitimate Phase 19 deliverable. Success criteria: "useful convention OR justified determination that one isn't needed."

### Quality Criteria (NEW)
- **D-06:** Three additional quality criteria beyond ROADMAP success criteria:
  - **Practicality:** Convention is actually helpful when applied to cckit's own commits
  - **Conciseness:** Number of rules is appropriate — too many means they won't be read
  - **Example quality:** Examples are concrete and genuinely helpful, not generic

### Execution Strategy (REVISED)
- **D-07:** Single phase with 2 plans (was: 2 plans with self-apply → now: Plan 01 + Plan 02 with injection hook).
  - **Plan 01:** Update PROJECT.md with GSD user premise (D-01) + run `/convention commit` to generate the convention file
  - **Plan 02:** Implement GSD commit convention injection hook (previously Phase 19.1)
- **D-08:** Verification is NOT part of the plan — handled by `/gsd-verify-work` after execution. Plan produces deliverables only.

### CLAUDE.md Migration (NEW)
- **D-09:** CLAUDE.md commit rules migration is deferred to Phase 20. Convention file is created in Phase 19, but CLAUDE.md's Commit Conventions section remains untouched until installer infrastructure is ready to handle self-application.

### Self-Application (REVISED)
- **D-10:** Self-application is deferred to Phase 20 installer. Phase 19 only creates the convention source file at `conventions/commit/CONVENTION.md`. No manual copy to `.claude/rules/`.

### Phase 19.1 Integration (NEW)
- **D-11:** Phase 19.1 (GSD Commit Convention Injection) is merged into Phase 19 as Plan 02. ROADMAP must be updated to remove Phase 19.1 as a separate phase.

### GSD Commit Injection Hook (NEW)
- **D-12:** Mechanism: Claude Code PreToolUse hook detects `git commit` and `gsd-tools commit` commands, then injects convention content as awareness context.
- **D-13:** On violation: hook denies the commit and explains which rules were violated, so the AI can fix the message and retry.
- **D-14:** Hook validates only mechanically verifiable rules: Conventional Commits format, scope patterns (no phase numbers), subject line length, allowed type list, GSD reference prohibition patterns. Semantic quality (why-first body, scope appropriateness, commit granularity) is injected as convention content for AI judgment, not enforced mechanically.
- **D-15:** Implementation details (specific hook architecture, convention file discovery path) are delegated to Plan 02's researcher to investigate Claude Code hook API behavior.

### Phase 18 Relationship
- **D-16:** Phase 19 is a separate phase (not Phase 18 UAT) because the convention file itself is a product deliverable, not just a skill validation artifact. The skill was validated structurally in Phase 18; Phase 19 validates content quality through real use.

### Claude's Discretion
- Convention internal structure (section ordering, grouping) — determined by /convention skill's generator
- Research depth and sources — determined by convention-researcher agent
- Hook implementation specifics — determined by Plan 02 researcher

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Convention Architecture
- `docs/CONVENTIONS.md` — Authoritative spec for convention file structure, naming, frontmatter, delta test, and hook architecture

### /convention Skill
- `skills/convention/SKILL.md` — Skill orchestrator (invocation: `/convention commit`)
- `skills/convention/step-research.md` — Research step workflow
- `skills/convention/step-preferences.md` — User preference collection
- `skills/convention/step-generate.md` — Convention generation with delta test
- `skills/convention/step-update.md` — Update mode (not needed for initial creation)

### Agents
- `agents/convention-researcher.md` — Research agent definition (opus model)
- `agents/convention-generator.md` — Generator agent definition (sonnet model)

### Existing Commit Rules
- `CLAUDE.md` §Commit Conventions — cckit's current commit rules (scope naming, GSD reference boundary) — informs what the convention should teach

### Hook Pattern Reference
- `.claude/hooks/validate-commit-scope.sh` — Existing PreToolUse hook for commit scope validation. Reference for hook implementation pattern.
- `.claude/settings.json` §hooks — Hook registration format and matcher configuration

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `/convention` skill: Complete authoring pipeline (research → preferences → generate → review)
- Convention agents: `convention-researcher.md` (opus), `convention-generator.md` (sonnet)
- `validate-commit-scope.sh`: Existing commit validation hook — pattern for convention hook implementation

### Established Patterns
- Convention output path: `conventions/{area}/CONVENTION.md` (publisher mode, per `.claude/cckit.json`)
- PreToolUse hook pattern: JSON stdin → command pattern matching → deny/allow with reason
- Frontmatter: `description` only, no `paths` for commit convention (always loads)

### Integration Points
- `conventions/` directory does not yet exist — will be created by first convention
- `.claude/cckit.json` has `publisher: true` for output to go to `conventions/commit/`
- `.claude/settings.json` hooks section — new hook registration needed for convention injection
- `.claude/hooks/` directory — new hook script for convention injection

</code_context>

<specifics>
## Specific Ideas

- GSD reference prohibition should be directly stated, not abstracted — cckit's audience uses GSD
- User wants researcher to investigate current best practices before committing to content areas
- If convention ends up nearly empty after delta test, that's a valid and honest outcome
- Hook validates mechanically verifiable rules only — semantic quality relies on convention awareness injection
- Both `git commit` and `gsd-tools commit` should trigger convention injection for consistency

</specifics>

<deferred>
## Deferred Ideas

### Phase 20 Impact
- Self-application: installer must handle `conventions/commit/CONVENTION.md` → `.claude/rules/cckit-commit.md`
- CLAUDE.md migration: installer should clean up CLAUDE.md commit conventions section during self-apply
- Convention hook installation: installer must also distribute hook scripts to host projects

### Other
- Discuss workflow improvement: checkpoint should be written even before phase directory exists (prevents resume loss)
- "Technology-neutral" redefinition across all docs/artifacts — broader than Phase 19 scope

</deferred>

---

*Phase: 19-first-convention-commit*
*Context gathered: 2026-04-06*
*Context updated: 2026-04-06*
