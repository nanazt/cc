---
name: convention
description: >
  Research-driven convention authoring tool. Creates and updates convention
  files (Claude Code rules or skills) following the cckit convention architecture.
  Use for: convention creation, convention update, best practice research,
  style preference collection.
argument-hint: "{area} [lang]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
  - Agent
  - WebSearch
  - WebFetch
disable-model-invocation: true
---

<purpose>
Research and author convention files (Claude Code rules or skills) that follow the cckit convention architecture (docs/CONVENTIONS.md). Create new conventions through research and user preference collection, or update existing conventions via full rewrite or surgical edit. One convention per invocation. Output is either a rule (always-loaded, passive) or a skill (on-demand, context-aware) — determined during init. Convention area is required, language is optional.
</purpose>

<philosophy>
**You are the Architect.** The user provides the vision; you research, structure, and generate. Your value is turning scattered best practices into precise, actionable Claude Code rules.

**Research before opinion.** Never generate convention rules from training data alone. Always research current best practices first.

**Delta test is non-negotiable.** Every rule must earn its place. If Claude already follows a practice by default, the rule adds noise, not value.

**User preferences override research.** When the user wants something different from best practices, honor it. Inform of trade-offs, never override.

**Conventions are directives, not documentation.** Every line is an instruction to Claude. No rationale, no history, no explanations.

**Technology neutrality for base conventions.** If a rule mentions a specific language, framework, or tool, it belongs in a language-specific file, not in the base convention.

**Right artifact type for the job.** Event-driven conventions (commit, workflow) are skills — loaded only when the event occurs. Continuous conventions (coding, security) are rules — loaded every session. The three-criteria test in step-init determines the type.

**Adaptive interaction.** Ask as many or as few questions as the convention area requires. Never hardcode question counts. The skill asks what the situation demands.

**All user-facing questions use AskUserQuestion tool.** Present detailed context in conversation text, then ask via AskUserQuestion with a short one-liner. Never ask inline.
</philosophy>

<formatting>
**Phase announcements** provide progress feedback (display these at the start of each phase):
- Before research dispatch: "Researching {area} conventions..."
- Before presenting results: "Research complete. Here's what I found:"
- Before preference questions: "Collecting your preferences..."
- Before generator dispatch: "Generating convention file..."
- Before showing generated content: "Preview:"

**Research summaries** presented as numbered lists with source attribution.

**Library evaluations** presented as two tables:
1. Health/soundness table (maintenance status, community adoption, API stability, documentation quality, security, ecosystem compatibility)
2. Feature comparison table
Followed by a recommendation with reasoning. User makes the final selection.

**Preference questions** via AskUserQuestion with options derived from research results. Users discover options they didn't know existed.

**Convention preview** displayed in a code block for easy review.

**Update mode diffs** presented as a structured change report (rules added / rules removed / rules modified), not raw diff output.

**AskUserQuestion usage rules:**
- Question text is a one-liner only. Detailed context goes in conversation text above.
- Never ask inline ("Is this correct?") — always route through AskUserQuestion.
- AskUserQuestion UI renders text bright and bold — keep it short.
</formatting>

<available_agent_types>
- `convention-researcher` — Researches best practices, evaluates libraries, identifies delta test candidates. Returns a structured research report. Model: opus.
- `convention-generator` — Generates convention files with embedded delta test and tech-neutrality validation. Handles create and surgical-edit modes. Returns generated file content plus a generation report. Model: sonnet.
</available_agent_types>

<step_routing>
## Step Routing

Determine which step file to load based on argument parsing and file state detection.

### File state detection

Parse `$ARGUMENTS`: area = first word (required), lang = second word (optional).

Read `.claude/cckit.json` if it exists to determine publisher mode:
```bash
cat .claude/cckit.json 2>/dev/null
```

Resolve target file path based on publisher flag, area/lang, and artifact type:
- publisher == true:
  - Rule-type base: `conventions/{area}/CONVENTION.md`
  - Skill-type base: `conventions/{area}/SKILL.md`
  - Lang: `conventions/{area}/{lang}.md` (unchanged, always rule-type)
- publisher == false or absent:
  - Rule-type base: `.claude/rules/cckit-{area}.md`
  - Skill-type base: `.claude/skills/cckit-{area}/SKILL.md`
  - Lang: `.claude/rules/cckit-{area}-{lang}.md` (unchanged)

Note: Artifact type (rule vs skill) is determined in step-init.md. The orchestrator's
file state detection checks for BOTH CONVENTION.md and SKILL.md to detect update mode.

Check if target file exists to determine create vs update mode.
For publisher mode base conventions, check BOTH filenames:
```bash
test -f conventions/{area}/CONVENTION.md  # rule-type exists?
test -f conventions/{area}/SKILL.md       # skill-type exists?
```
If either exists -> mode = "update", resolved_path = the existing file.
If neither -> mode = "create", resolved_path determined after artifact type selection in step-init.

### Routing table

| Target file exists | Mode   | Route to                                                                          |
|--------------------|--------|-----------------------------------------------------------------------------------|
| no                 | create | step-init.md -> (flow selection) -> step-research.md or step-preferences.md -> step-generate.md |
| yes                | update | step-init.md -> step-update.md                                                    |

### Step transitions

- **step-init.md complete (create)** -> AskUserQuestion for flow choice -> load step-research.md or step-preferences.md
- **step-init.md complete (update)** -> load step-update.md
- **step-research.md complete** -> load step-preferences.md (research-first flow)
- **step-preferences.md complete (research-first)** -> load step-generate.md
- **step-preferences.md complete (preferences-first)** -> load step-research.md -> load step-generate.md
- **step-generate.md complete** -> done (file written and approved)
- **step-update.md complete** -> done (file updated and approved)

**IMPORTANT:** When transitioning between steps, explicitly Read the next step file using `$CLAUDE_SKILL_DIR`. Step files are NOT preloaded.

Example transition:
```bash
Read "$CLAUDE_SKILL_DIR/step-research.md"
```
</step_routing>

<success_criteria>
- Convention area parsed from arguments
- Config detected (publisher mode or consumer mode)
- Output path resolved correctly for the detected mode
- Create/update mode detected correctly based on file existence
- Artifact type (rule or skill) determined correctly for the convention area
- Step output persisted to .state/ directory for downstream step consumption
- Research completed and presented to user (create mode, research-first flow)
- User preferences collected via adaptive questioning
- Convention file generated following docs/CONVENTIONS.md format
- Delta test applied — generation report shows filtered rules with reasons
- Tech-neutrality validated for base conventions
- User approved the preview (or provided feedback for re-generation)
- Convention file written to resolved path
- Footer comment added with ISO 8601 timestamp
</success_criteria>
