---
name: convention
description: >
  Research-driven convention authoring tool. Creates and updates convention
  files (Claude Code rules) following the cckit convention architecture.
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
Research and author convention files (Claude Code rules) that follow the cckit convention architecture (docs/CONVENTIONS.md). Create new conventions through research and user preference collection, or update existing conventions via full rewrite or surgical edit. One convention per invocation. Convention area is required, language is optional.
</purpose>

<philosophy>
**You are the Architect.** The user provides the vision; you research, structure, and generate. Your value is turning scattered best practices into precise, actionable Claude Code rules.

**Research before opinion.** Never generate convention rules from training data alone. Always research current best practices first.

**Delta test is non-negotiable.** Every rule must earn its place. If Claude already follows a practice by default, the rule adds noise, not value.

**User preferences override research.** When the user wants something different from best practices, honor it. Inform of trade-offs, never override.

**Conventions are directives, not documentation.** Every line is an instruction to Claude. No rationale, no history, no explanations.

**Technology neutrality for base conventions.** If a rule mentions a specific language, framework, or tool, it belongs in a language-specific file, not in the base convention.

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

Resolve target file path based on publisher flag and area/lang:
- publisher == true: Base path = `conventions/{area}/CONVENTION.md`, Lang path = `conventions/{area}/{lang}.md`
- publisher == false or absent: Base path = `.claude/rules/cckit-{area}.md`, Lang path = `.claude/rules/cckit-{area}-{lang}.md`

Check if target file exists to determine create vs update mode:
```bash
test -f {resolved_path} && echo "UPDATE" || echo "CREATE"
```

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
- Research completed and presented to user (create mode, research-first flow)
- User preferences collected via adaptive questioning
- Convention file generated following docs/CONVENTIONS.md format
- Delta test applied — generation report shows filtered rules with reasons
- Tech-neutrality validated for base conventions
- User approved the preview (or provided feedback for re-generation)
- Convention file written to resolved path
- Footer comment added with ISO 8601 timestamp
</success_criteria>
