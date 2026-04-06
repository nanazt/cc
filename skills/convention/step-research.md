# Step: Research

## Step 1: Build Host Project Context

Read `.state/init.json` from `state_dir` (received from step-init) to confirm:
- `convention_tools` for research agent dispatch
- `artifact_type` to frame research appropriately (e.g., skill-type conventions may need event-trigger research)
- `area`, `lang` for research framing

If `state_dir` is available, read init.json:

```bash
cat {state_dir}/init.json
```

Gather host project context to pass to the researcher so the research stays relevant to the host project's stack and existing conventions.

Read `.claude/CLAUDE.md` or `CLAUDE.md` if either exists and summarize:
- Technology stack (languages, frameworks, runtime)
- Existing conventions or style constraints mentioned
- Any project-type signals (CLI, library, web service, etc.)

```bash
cat .claude/CLAUDE.md 2>/dev/null || cat CLAUDE.md 2>/dev/null | head -100
```

Scan for technology indicator files:

```bash
ls package.json Cargo.toml go.mod pyproject.toml build.gradle pom.xml mix.exs *.csproj 2>/dev/null
```

Check for already-installed convention files:

```bash
ls .claude/rules/cckit-* 2>/dev/null || ls conventions/ 2>/dev/null | head -20
```

Compile all findings into a compact context paragraph (3-6 sentences, not a raw file dump). If none of the above files exist or produce useful content, note: "No host project context available."

If `mode == "update"`, read the existing convention file from `resolved_path` so the researcher can focus on gaps and changes since the convention was written.

---

## Step 2: Dispatch Research Agent

Display progress announcement:

```
Researching {area} conventions{' for ' + lang if lang else ''}...
```

Build and dispatch the research agent:

```
Agent(
  subagent_type: "convention-researcher",
  prompt: "<objective>
Research best practices, community conventions, and library options
for the '{area}' convention area{', targeting ' + lang if lang else ''}.
</objective>

<convention_area>{area}</convention_area>
<target_language>{lang or 'none'}</target_language>

<host_project_context>
{compiled host project context from Step 1}
</host_project_context>

<research_tools>
Default: WebSearch, WebFetch, Read, Grep, Glob
Additional: {convention_tools from init.json or step-init pass-through, joined by comma, or 'none'}
</research_tools>

<convention_tools>{convention_tools from init.json, comma-separated, or 'none'}</convention_tools>

{if mode == 'update':}
<existing_convention>
{full content of the existing convention file at resolved_path}
</existing_convention>
{end if}",
  run_in_background: false
)
```

---

## Step 3: Handle Research Result

Parse the researcher's return message:

- If the return message contains `## RESEARCH COMPLETE`: proceed to Step 4 with the full report.
- If the return message contains `## RESEARCH FAILED`:

Present the failure reason in conversation text.

AskUserQuestion: "Research failed. How would you like to proceed?" with options:
1. "Retry research"
2. "Proceed with limited context"
3. "Cancel"

- **Retry:** Re-dispatch the researcher with the same inputs. If the retry also fails, present the same options again.
- **Proceed:** Continue to Step 4 with whatever partial findings exist in the return message.
- **Cancel:** Stop. Report: "Convention authoring cancelled."

---

## Step 4: Present Research Summary

Display progress announcement:

```
Research complete. Here's what I found:
```

Present the research findings in readable form:

**Best practices:** Display as a numbered list. For each practice, show the name (with [DELTA:class] and [HOOK:class] tags), description, and source.

**Delta summary:** Present after the practices list:

```
Delta summary: {total} practices found
  - {N} [DELTA:new] — will teach (Claude does not do this by default)
  - {N} [DELTA:varies] — consistency value (Claude does this inconsistently)
  - {N} [DELTA:known] — filtered (Claude already does this by default)

Hook summary: {N} of {total} rules are mechanically verifiable [HOOK:yes]
Hook recommended: {Yes/No} — {trigger event or reasoning}
```

**Library evaluation (if language-specific):** If the research report includes a Library Evaluation section, present it:
- Introduce with: "For {lang}, the researcher evaluated these libraries:"
- Present the health/soundness table as-is from the report
- Present the feature comparison table as-is from the report
- Present the recommendation with reasoning
- Note: "You'll make the final library selection during preference collection."

**Common pitfalls:** Present as a numbered list if the research report includes them.

**Insufficient coverage (per research quality contract):** If the research report includes an `## Insufficient Coverage` section, display it in conversation text:

```
The researcher found limited information in some areas:
{list each insufficient coverage item}
```

Then AskUserQuestion: "Research found limited coverage in some areas. How would you like to proceed?" with options:
1. "Proceed with available research"
2. "Provide additional context or URLs"
3. "Cancel"

- **Proceed:** Continue to Step 5.
- **Provide URLs:** Ask via AskUserQuestion: "Share the URLs or additional context:" (free-form). Note the user-provided context as a variable `additional_context` to pass to the generator later.
- **Cancel:** Stop.

---

## Step 4a: Persist Research Results

Write the full research report to `.state/research.md`:

```bash
# Write research_results to state_dir
```

Use the Write tool to write `research_results` (the full research report text from the researcher agent) to `{state_dir}/research.md`.

This makes research results available to step-generate without relying on implicit context passing. The generator will read this file directly.

---

## Step 5: Transition

Store the full research report content as `research_results`.

**If selected_flow == "Research first":**

Read `$CLAUDE_SKILL_DIR/step-preferences.md`.

Pass forward:
- `area`, `lang`, `publisher`, `convention_tools`, `resolved_path`, `mode`, `create_base_first`
- `selected_flow`
- `state_dir` — path to .state/ directory
- `artifact_type` — "rule" or "skill"
- `research_results` — full research report text
- `additional_context` — any user-provided URLs or context (may be empty)

Research results are also persisted at `{state_dir}/research.md` for downstream steps to read independently.

**If selected_flow == "Preferences first" (called after step-preferences already ran):**

Read `$CLAUDE_SKILL_DIR/step-generate.md`.

Pass forward:
- `area`, `lang`, `publisher`, `convention_tools`, `resolved_path`, `mode`, `create_base_first`
- `selected_flow`
- `state_dir` — path to .state/ directory
- `artifact_type` — "rule" or "skill"
- `research_results` — full research report text
- `user_preferences` — preferences collected earlier in step-preferences
- `additional_context` — any user-provided URLs or context (may be empty)

Research results are also persisted at `{state_dir}/research.md` for downstream steps to read independently.
