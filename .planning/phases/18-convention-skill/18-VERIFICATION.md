---
phase: 18-convention-skill
verified: 2026-04-04T12:54:23Z
status: passed
score: 5/5 must-haves verified
---

# Phase 18: /convention Skill Verification Report

**Phase Goal:** A `/convention` skill exists that can research, author, and validate convention files following the architecture from Phase 17
**Verified:** 2026-04-04T12:54:23Z
**Status:** passed
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can invoke `/convention` to research best practices for a named convention area and receive a structured summary of findings | VERIFIED | `skills/convention/SKILL.md` exists with `name: convention`, `argument-hint: "{area} [lang]"`, `disable-model-invocation: true`. `step-research.md` dispatches `convention-researcher` agent (opus) with `<convention_area>`, `<target_language>`, `<host_project_context>` XML tags. Researcher returns structured report with Best Practices, Library Evaluation, Delta Test Summary. Step 4 presents research as numbered list with source attribution and delta classification. |
| 2 | User can answer interactive questions about their style preferences, and the skill incorporates those preferences into the generated convention | VERIFIED | `step-preferences.md` implements adaptive AskUserQuestion loop (7 AskUserQuestion references). Questions derived from research findings (research-first) or broader style exploration (preferences-first). Preferences passed forward as `user_preferences` to `step-generate.md`, which embeds them in the `<user_preferences>` XML tag dispatched to `convention-generator`. Generator Step 3 parses preferences and overrides research recommendations where they conflict. |
| 3 | The skill generates convention files that follow ARCH rules -- base and tech pack are separate files in correct locations | VERIFIED | `step-init.md` resolves paths: publisher mode = `conventions/{area}/CONVENTION.md` (base) / `conventions/{area}/{lang}.md` (lang); consumer mode = `.claude/rules/cckit-{area}.md` (base) / `.claude/rules/cckit-{area}-{lang}.md` (lang). Generator enforces `docs/CONVENTIONS.md` format: base = `description` only, lang = `description` + `paths: **/*.{ext}` (unquoted glob) + `alwaysApply: false`. Step-generate performs orchestrator light review of frontmatter format. Step-init handles missing-base scenario with 3 options. |
| 4 | The skill identifies what the LLM already knows vs. what needs explicit teaching, and the generated convention only includes the delta | VERIFIED | Researcher marks every practice as HIGH-DELTA / LOW-DELTA / NO-DELTA (16 delta references in researcher). Generator applies 3-criteria delta test: default behavior, style divergence, consistency (13 delta references in generator). `step-generate.md` embeds `<delta_test_instructions>` in dispatch. Generation report includes "Rules Removed by Delta Test" with reasoning. Empty convention handling offers force-create / skip / adjust when all rules filtered. |
| 5 | The skill works when invoked from any project, not just cckit | VERIFIED | `step-init.md` defaults `publisher = false` when `.claude/cckit.json` absent. Consumer mode paths (`.claude/rules/cckit-{area}.md`) are project-relative. No hardcoded cckit paths. `step-research.md` builds host project context by reading CLAUDE.md and scanning for technology indicator files (package.json, Cargo.toml, go.mod, etc.). Only cckit itself sets `publisher: true` in `.claude/cckit.json`. |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `agents/convention-researcher.md` | Research subagent definition (opus, web tools, delta assessment) | VERIFIED | 212 lines, model: opus, tools: Read/Grep/Glob/WebSearch/WebFetch, no Write, 5-step methodology, structured output contract, quality gate with 12 items |
| `agents/convention-generator.md` | Generator subagent definition (sonnet, file tools, delta test) | VERIFIED | 228 lines, model: sonnet, tools: Read/Grep/Glob/Write, no WebSearch/WebFetch, create mode (10 steps) + surgical-edit mode (7 steps), quality gate with 13 items |
| `skills/convention/SKILL.md` | Main orchestrator skill with frontmatter, philosophy, routing | VERIFIED | 137 lines, correct frontmatter (name, argument-hint, allowed-tools, disable-model-invocation), philosophy, formatting, 2 agent types, step routing table referencing all 5 step files |
| `skills/convention/step-init.md` | Argument parsing, config detection, path resolution, mode detection | VERIFIED | 210 lines, 7 steps: parse args, read config, resolve path, detect mode, naming, missing-base handling, flow selection. Uses AskUserQuestion (3 refs). $CLAUDE_SKILL_DIR transitions (3 refs) |
| `skills/convention/step-research.md` | Research agent dispatch and result presentation | VERIFIED | 166 lines, builds host project context, dispatches convention-researcher with XML tags, handles RESEARCH COMPLETE/FAILED, presents findings with delta summary, handles insufficient coverage |
| `skills/convention/step-preferences.md` | Adaptive preference collection via AskUserQuestion | VERIFIED | 118 lines, adaptive question loop (no fixed count), research-informed options, conflict detection with trade-off presentation, preference summary and confirmation loop |
| `skills/convention/step-generate.md` | Generator dispatch, preview, approval, rejection cycle | VERIFIED | 247 lines, assembles inputs with delta test + tech-neutrality check, dispatches convention-generator, orchestrator light review, empty convention handling (force-create/skip/adjust), preview/approve/request changes cycle with feedback re-generation |
| `skills/convention/step-update.md` | Update mode: full-rewrite vs surgical-edit | VERIFIED | 274 lines, reads existing convention, presents full-rewrite vs surgical-edit choice, full-rewrite delegates to create flow with existing content as context, surgical-edit collects changes via adaptive loop, dispatches generator in surgical-edit mode, structured diff preview, revert on cancel |
| `.claude/cckit.json` | Publisher config for cckit | VERIFIED | Valid JSON, `publisher: true`, `convention.tools: []` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `SKILL.md` | `step-init.md` | Step routing table | WIRED | 4 references to step-init in SKILL.md routing |
| `SKILL.md` | `step-research.md` | Step routing table | WIRED | 5 references in SKILL.md |
| `SKILL.md` | `step-preferences.md` | Step routing table | WIRED | 5 references in SKILL.md |
| `SKILL.md` | `step-generate.md` | Step routing table | WIRED | 4 references in SKILL.md |
| `SKILL.md` | `step-update.md` | Step routing table | WIRED | 3 references in SKILL.md |
| `step-research.md` | `agents/convention-researcher.md` | Agent dispatch `convention-researcher` | WIRED | 1 dispatch reference with full XML tag set |
| `step-generate.md` | `agents/convention-generator.md` | Agent dispatch `convention-generator` | WIRED | 2 references (normal + re-generation dispatch) |
| `step-update.md` | `agents/convention-generator.md` | Agent dispatch for surgical-edit | WIRED | 1 dispatch with mode=surgical-edit |
| `step-init.md` | `.claude/cckit.json` | Config detection | WIRED | 2 references, reads cckit.json for publisher flag |
| `step-preferences.md` | `step-generate.md` | Transition after preferences | WIRED | 2 references via $CLAUDE_SKILL_DIR |
| `step-research.md` | `step-preferences.md` | Transition (research-first) | WIRED | 3 references via $CLAUDE_SKILL_DIR |
| `step-update.md` | `step-research.md` | Full-rewrite delegates | WIRED | 2 references via $CLAUDE_SKILL_DIR |
| All agents | `docs/CONVENTIONS.md` | Format spec reference | WIRED | Referenced in researcher Step 1, generator Steps 1/7, SKILL.md purpose, step-generate Step 1, step-update dispatch |

### Data-Flow Trace (Level 4)

Not applicable -- this phase produces skill definitions (markdown instruction files) and agent definitions, not components that render dynamic data. The artifacts are instructions consumed by Claude Code at runtime, not code that fetches/renders data.

### Behavioral Spot-Checks

Step 7b: SKIPPED (no runnable entry points). The /convention skill is a set of markdown instruction files for Claude Code's skill system. It cannot be invoked outside of a Claude Code session. Verification of runtime behavior requires human testing (see Human Verification section).

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| SKILL-01 | 01, 03 | Skill researches best practices for a given convention area | SATISFIED | convention-researcher agent with WebSearch/WebFetch, step-research dispatches with convention_area tag, presents findings |
| SKILL-02 | 01, 03 | Skill compares and recommends libraries for language-specific conventions | SATISFIED | Researcher Step 3: Library Evaluation with health/soundness + feature comparison tables, recommendation with reasoning |
| SKILL-03 | 01, 03 | Skill identifies what LLM already knows vs what needs explicit teaching | SATISFIED | Researcher delta assessment (HIGH/LOW/NO-DELTA), generator delta test (3 criteria), generation report shows filtered rules |
| SKILL-04 | 02, 03 | Skill collects user's personal style preferences via interactive questioning | SATISFIED | step-preferences.md adaptive AskUserQuestion loop, research-informed options, preference summary confirmation |
| SKILL-05 | 02, 03 | Skill generates convention file following ARCH rules (base/language-specific separation) | SATISFIED | Generator enforces docs/CONVENTIONS.md format, separate base/lang paths, correct frontmatter (unquoted glob, alwaysApply), footer |
| SKILL-06 | 01, 03 | Skill validates tech-neutrality for base conventions | SATISFIED | Generator Step 5: tech-neutrality check conditional on base conventions, step-generate includes check only when lang is nil |
| SKILL-07 | 02, 03 | Skill works in any project, not just cckit | SATISFIED | Default publisher=false, consumer paths (.claude/rules/), host project context built from project's own CLAUDE.md and tech stack files |

No orphaned requirements found. All 7 SKILL requirements mapped to Phase 18 in REQUIREMENTS.md are claimed by at least one plan.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | - | - | - | All 9 files scanned clean: no TODO, FIXME, PLACEHOLDER, coming soon, or not yet implemented markers found |

### Human Verification Required

### 1. End-to-End Create Flow

**Test:** Invoke `/convention commit` from a non-cckit project (no .claude/cckit.json). Verify the full flow: init -> research -> preferences -> generate -> preview -> approve.
**Expected:** Convention file created at `.claude/rules/cckit-commit.md` with proper frontmatter (description only for base), delta-tested rules, and footer comment. Research results presented as numbered list. Preferences collected via AskUserQuestion. Preview shown before writing.
**Why human:** Requires a live Claude Code session with tool access, web research capability, and interactive AskUserQuestion dialogue.

### 2. Language-Specific with Missing Base

**Test:** Invoke `/convention coding rust` in a project with no existing coding convention. Verify the missing-base scenario presents 3 options (create base first, standalone, cancel).
**Expected:** AskUserQuestion presents the 3 options. Selecting "Create base first" creates base, then automatically starts lang-specific creation.
**Why human:** Interactive multi-step flow requiring real AskUserQuestion tool responses.

### 3. Surgical Edit Update Flow

**Test:** After creating a convention, invoke `/convention commit` again (target exists). Select "Surgical edit", add a rule, modify a rule, remove a rule.
**Expected:** Structured change report (not raw diff) showing added/modified/removed rules. Generator dispatched with mode=surgical-edit. File updated correctly.
**Why human:** Requires existing convention file and interactive change collection loop.

### 4. Empty Convention Handling

**Test:** Invoke `/convention` for an area where Claude already follows all best practices. Observe the delta test filtering all rules.
**Expected:** Message explaining all rules filtered. Three options offered: force-create, skip, adjust preferences.
**Why human:** Depends on actual research results and delta test outcomes in a live session.

### 5. Publisher vs Consumer Mode

**Test:** Compare `/convention commit` output paths in a project with `.claude/cckit.json` (publisher: true) vs without.
**Expected:** Publisher: `conventions/commit/CONVENTION.md`. Consumer: `.claude/rules/cckit-commit.md`.
**Why human:** Requires two separate project directories with different configs.

### Gaps Summary

No gaps found. All 5 success criteria are verified through artifact existence, substantive content analysis, and wiring checks. All 9 artifacts exist, are non-trivial (118-274 lines for step files, 212-228 lines for agents), contain no stubs or placeholders, and are properly cross-referenced. All 7 requirements (SKILL-01 through SKILL-07) are satisfied with supporting evidence in the codebase.

The skill is a set of instruction files (not executable code), so behavioral verification requires human testing in a live Claude Code session. Five human verification tests are documented above.

---

_Verified: 2026-04-04T12:54:23Z_
_Verifier: Claude (gsd-verifier)_
