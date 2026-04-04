---
phase: 18-convention-skill
plan: 01
subsystem: agents
tags: [convention, research-agent, generator-agent, delta-test, subagent-architecture]
dependency_graph:
  requires: [docs/CONVENTIONS.md]
  provides: [agents/convention-researcher.md, agents/convention-generator.md]
  affects: [skills/convention/SKILL.md (plan 02), skills/convention/step-*.md (plan 02)]
tech_stack:
  added: []
  patterns: [orchestrator+subagent dispatch, opus-for-research, sonnet-for-generation, structured-input-output-contracts]
key_files:
  created:
    - agents/convention-researcher.md
    - agents/convention-generator.md
  modified: []
decisions:
  - "Research agent uses opus model with web tools (WebSearch, WebFetch, Read, Grep, Glob) — no Write, no user interaction"
  - "Generator agent uses sonnet model with file tools (Read, Grep, Glob, Write) — no web research, no user interaction"
  - "Delta test embedded in generator via three criteria: default behavior, style divergence, consistency"
  - "Tech-neutrality check is conditional in generator — only activated for base conventions via <tech_neutrality_check> tag"
  - "Both agents reference docs/CONVENTIONS.md as the authoritative format spec"
metrics:
  duration: "~4 minutes"
  completed_date: "2026-04-04"
  tasks_completed: 2
  files_created: 2
---

# Phase 18 Plan 01: Convention Subagent Definitions — Summary

Two subagent definitions for the `/convention` skill: `convention-researcher` (opus, deep web research) and `convention-generator` (sonnet, convention file creation with delta test self-filtering).

## What Was Built

### agents/convention-researcher.md

Opus model research agent. Receives convention area, target language, and host project context. Performs web research (WebSearch, WebFetch), codebase analysis (Grep, Glob, Read), evaluates libraries with health/soundness + feature comparison tables, and identifies delta test candidates (HIGH/LOW/NO-DELTA). Returns a structured research report. No file writing, no user interaction.

Key capabilities:
- 5-step methodology: parse inputs, research best practices, evaluate libraries, identify delta candidates, compile report
- Library evaluation covers maintenance, adoption, API stability, docs, security, ecosystem
- Delta assessment on every practice (HIGH/LOW/NO-DELTA with reasoning)
- Returns `RESEARCH COMPLETE` / `RESEARCH FAILED` protocol
- Quality gate with 12 checklist items including min-3-sources and min-3-libraries requirements

### agents/convention-generator.md

Sonnet model generator agent. Receives research results, user preferences, and convention spec. Applies delta test self-filtering (three criteria), handles both create mode and surgical-edit mode, enforces `docs/CONVENTIONS.md` frontmatter format (unquoted glob paths, alwaysApply: false), adds generation footer, and produces a generation report alongside the file.

Key capabilities:
- Create mode: 10-step process including delta test, tech-neutrality check (base only), frontmatter enforcement, footer
- Surgical-edit mode: 7-step process for targeted rule modifications
- Edge cases: empty convention (all rules filtered), feedback re-generation, conflicting instructions
- Returns `GENERATION COMPLETE` / `GENERATION FAILED` with full generation report
- Quality gate with 13 checklist items

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Functionality] Added CONVENTIONS.md orientation to researcher Step 1**
- **Found during:** Task 2 (final verification — success criteria said "Both agents reference docs/CONVENTIONS.md")
- **Issue:** Researcher had no reference to CONVENTIONS.md; success criteria required both agents to reference it
- **Fix:** Added Step 1 instruction for researcher to read docs/CONVENTIONS.md for orientation so findings align with the architecture's delta test vocabulary
- **Files modified:** agents/convention-researcher.md
- **Commit:** 7e473a7

**2. [Rule 2 - Prohibited Content] Removed WebSearch and AskUserQuestion mentions from generator quality gate**
- **Found during:** Task 2 verification (acceptance criteria: grep count of WebSearch in generator must be 0)
- **Issue:** Original quality gate text said "No web research performed (generator does NOT use WebSearch or WebFetch)" and "No user interaction attempted (generator does NOT use AskUserQuestion)" — both mentioned tool names would have failed the grep count check
- **Fix:** Rewrote quality gate lines to avoid naming the forbidden tools: "No web research performed (generator uses only local file tools)" and "No user interaction attempted (generator does NOT invoke interactive question tools)"
- **Files modified:** agents/convention-generator.md
- **Commit:** 671913d (included in original commit)

## Known Stubs

None. Both agent definitions are complete and functional. They have no stub content, no placeholder data sources, and no TODOs blocking their purpose.

## Self-Check

Checked file existence:
- `agents/convention-researcher.md` — FOUND
- `agents/convention-generator.md` — FOUND

Checked commit hashes:
- `66eae31` (researcher initial) — FOUND
- `671913d` (generator) — FOUND
- `7e473a7` (researcher CONVENTIONS.md fix) — FOUND

## Self-Check: PASSED
