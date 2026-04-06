# Step: Generate

This step is the convergence point for both research-first and preferences-first flows. It assembles generator inputs, dispatches the convention-generator agent, performs an orchestrator review, handles the empty-convention edge case, and manages the preview/approval/rejection cycle.

## Step 1: Prepare Generator Input

Assemble generator inputs from the collected context.

Read `.state/` files for explicit context (reduce implicit dependency):
```bash
cat {state_dir}/init.json
cat {state_dir}/research.md
cat {state_dir}/preferences.json
```

From `init.json`, extract: `area`, `lang`, `resolved_path`, `mode`, `artifact_type`, `state_dir`.
From `preferences.json`, extract: `preferences`, `hook_confirmed`, `hook_rules`.
Use `research_results` from `research.md` (or from step-research implicit context if file unavailable).

- `output_path` — `resolved_path` from init.json (or from step-init implicit context)
- Determine convention type:
  - If `lang` is nil or absent: type = "base"
  - If `lang` is present: type = "language-specific, targeting {lang}"
- Read `docs/CONVENTIONS.md` so you can confirm the output format expectations

Determine `artifact_type` from `init.json` (or from step-init implicit context if unavailable).

Determine hook generation parameters:
- Read `hook_confirmed` and `hook_rules` from `preferences.json`
- If `hook_confirmed` is true, extract the hook trigger event from `research.md` (the
  `## Hook Recommendation` section's "Trigger event" field)

**For skill-type conventions (`artifact_type` == `"skill"`):**
Read writing-skills superpowers content and prepare it for injection into the generator prompt.
The writing-skills plugin provides skill authoring quality standards.

```bash
# Find and read writing-skills SKILL.md content
ls $HOME/.claude/plugins/cache/claude-plugins-official/superpowers/*/skills/writing-skills/SKILL.md 2>/dev/null | tail -1
```

Read the file and store its content as `skill_format_reference`. If the file cannot be found,
proceed without it — the generator has baseline skill format knowledge.

Build the delta test instructions (always provided):

```
For each candidate rule, apply the delta test:
- Default behavior test: Would Claude already follow this rule without being told?
  If yes, and neither of the next tests pass → REMOVE and record reason in report.
- Style divergence test: Does the user want behavior different from Claude's default?
  If yes → KEEP regardless of default behavior test.
- Consistency test: Would Claude's behavior vary meaningfully across sessions without
  this rule? If yes → KEEP for consistency value.
Report every removed rule with reasoning in the generation report.
```

Build tech-neutrality check (base conventions only):

```
Test every rule: 'Could a Rust CLI, Go API, Python ML pipeline, and a documentation
site all follow this rule?' If no → this rule belongs in a language-specific convention.
```

Include tech-neutrality check only when `lang` is nil (base convention). Skip entirely for language-specific conventions.

---

## Step 2: Dispatch Generator Agent

Display progress announcement:

```
Generating convention file...
```

Dispatch the generator agent:

```
Agent(
  subagent_type: "convention-generator",
  prompt: "<objective>
Generate a {base or language-specific} convention file for the '{area}' area{', targeting ' + lang if lang else ''}.
</objective>

<convention_spec>
Read docs/CONVENTIONS.md for the authoritative convention file format specification.
</convention_spec>

<research_results>
{full research report text from research_results variable}
</research_results>

<user_preferences>
{structured preferences from user_preferences variable}
</user_preferences>

<delta_test_instructions>
For each candidate rule, apply the delta test:
- Default behavior test: Would Claude already follow this rule without being told?
  If yes, and neither of the next tests pass → REMOVE and record reason in report.
- Style divergence test: Does the user want behavior different from Claude's default?
  If yes → KEEP regardless of default behavior test.
- Consistency test: Would Claude's behavior vary meaningfully across sessions without
  this rule? If yes → KEEP for consistency value.
Report every removed rule with reasoning in the generation report.
</delta_test_instructions>

{if lang is nil:}
<tech_neutrality_check>
Test every rule: 'Could a Rust CLI, Go API, Python ML pipeline, and a documentation
site all follow this rule?' If no → this rule belongs in a language-specific convention.
</tech_neutrality_check>
{end if}

{if additional_context is not empty:}
<additional_context>
{additional_context — user-provided URLs or context from research step}
</additional_context>
{end if}

{if feedback is set from a prior rejection:}
<feedback>
{feedback variable — user's feedback from the previous preview rejection}
</feedback>
{end if}

<artifact_type>{artifact_type from init — "rule" or "skill"}</artifact_type>

{if hook_confirmed is true:}
<hook_confirmed>true</hook_confirmed>
<hook_rules>{list of [HOOK:yes] rule names from preferences}</hook_rules>
<hook_trigger>{trigger event from research hook recommendation}</hook_trigger>
{end if}

{if artifact_type == "skill" and skill_format_reference is available:}
<skill_format_reference>
{writing-skills SKILL.md content}
</skill_format_reference>
{end if}

<state_dir>{state_dir}</state_dir>

<output_path>{resolved_path}</output_path>
<mode>create</mode>",
  run_in_background: false
)
```

---

## Step 3: Handle Generator Result

Parse the generator's return message:

- If the return message contains `## GENERATION COMPLETE`: proceed to Step 4.
- If the return message contains `## GENERATION FAILED`:

Present the failure reason in conversation text.

AskUserQuestion: "Generation failed. How would you like to proceed?" with options:
1. "Retry"
2. "Cancel"

- **Retry:** Re-dispatch the generator with the same inputs (same prompt as Step 2, no `<feedback>` tag on a fresh retry). If the retry also fails, present the same options again.
- **Cancel:** Clean up state: `rm -rf {state_dir}`. Stop. Report: "Convention generation cancelled."

---

## Step 4: Orchestrator Light Review

Perform a lightweight post-generation check. Read the generated file from `resolved_path`.

**Frontmatter format check:**
- Base convention: must have `description`, must NOT have `paths` or `alwaysApply`
- Language-specific: must have `description`, `paths` (single unquoted glob), and `alwaysApply: false`

**Footer check:**
- File must end with a comment: `<!-- Generated by /convention, {timestamp} -->`

**Skill-type frontmatter check (when `artifact_type` is `"skill"`):**
- Must have `name`, `description`, `user-invocable: false`
- Must NOT have `paths` or `alwaysApply`
- Name should follow pattern `cckit-{area}`

**Tech-neutrality scan (base conventions only):**
- Quick scan for obvious technology-specific terms: specific programming language names, framework names, tool names appearing as requirements rather than examples
- If found: flag as a warning (do not block generation)

**CLAUDE.md Conflict Detection:**

Read the host project's CLAUDE.md:
```bash
cat CLAUDE.md 2>/dev/null || cat .claude/CLAUDE.md 2>/dev/null
```

If CLAUDE.md exists, scan for content that overlaps with the generated convention area:
- Look for section headings containing the convention area name (e.g., `## Commit Conventions`
  for a commit convention, `## Coding Standards` for a coding convention)
- Look for keywords from the generated convention rules appearing in CLAUDE.md with potentially
  different instructions

If overlap is found, add a conflict warning to `orchestrator_warnings`:
```
CLAUDE.md conflict: Section "{section name}" in CLAUDE.md contains {area} rules that may
overlap with the generated convention. CLAUDE.md takes precedence at runtime (Claude Code's
built-in priority), so conflicting rules in the convention will be overridden.
```

Note: This is a lightweight text-based scan, not a semantic analysis. The purpose is to flag
obvious overlaps, not to guarantee conflict-free operation.

**Parse generation report:**
- Extract "Rules Included" count
- Extract "Rules Removed by Delta Test" list
- Extract "Tech-Neutrality Results" if present (base conventions)
- Extract "Confidence" level

Store any issues found as `orchestrator_warnings` (list of strings). Issues are warnings only — they do not block the flow but are displayed alongside the preview.

---

## Step 4a: Preferences Verification

Read `{state_dir}/preferences.json` to get the user's collected preferences.

For each preference entry, check whether the generated convention reflects it:

1. Read the generated convention file from `resolved_path`
2. For each preference in `preferences.json`:
   - Search the convention content for evidence that the preference is reflected
   - A preference is "matched" if the convention contains a rule that aligns with the preference value
   - A preference is "mismatched" if the convention contains a rule that contradicts the preference value
   - A preference is "missing" if no convention rule addresses the preference topic

If any preferences are mismatched or missing:

Compile a correction list and re-dispatch the generator with a `<feedback>` tag:
```
Preferences verification found mismatches:
{for each mismatch or missing preference:}
- Preference "{key}": user selected "{value}" but convention {shows different value / does not address this}
{end for}

Regenerate to incorporate these preferences.
```

Re-dispatch follows the same path as Step 2, with the `<feedback>` tag added. Return to
Step 4 after re-generation.

If all preferences match: proceed to Step 5. Store verification result: "All preferences verified."

---

## Step 5: Handle Empty Convention

Check the "Rules Included" count from the generation report:

If the count is 0 (all rules filtered by the delta test and tech-neutrality check):

Present in conversation text:

```
All candidate rules for the '{area}' convention were filtered by the delta test.
Claude already follows these practices by default, so a convention file would not
add value.

Rules filtered:
{list each removed rule with its removal reason from the generation report}
```

AskUserQuestion: "All rules were filtered. How would you like to proceed?" with options:
1. "Force-create anyway (keep all rules)"
2. "Skip this convention (no file created)"
3. "Adjust preferences and re-generate"

- **Force-create:** Re-dispatch the generator with all inputs from Step 2 PLUS `<force_create>true</force_create>` tag. Delta test filtering is disabled; all rules are kept.
- **Skip:** Delete the generated file if it was written (use Bash: `rm -f {resolved_path}`). Clean up state: `rm -rf {state_dir}`. Report: "Convention skipped — not needed. All rules are already followed by Claude by default." Stop.
- **Adjust preferences:** Return to step-preferences. Read `$CLAUDE_SKILL_DIR/step-preferences.md` and pass forward all current variables. After preferences are re-collected, step-preferences will transition back here via step-generate.md.

If "Rules Included" count is greater than 0, proceed directly to Step 6.

---

## Step 6: Preview and Approval

Display progress announcement:

```
Preview:
```

Display the generated convention file content in a markdown code block (read from `resolved_path`).

After the preview, display the generation report summary:

```
Generation report:
- Rules included: {count}
- Rules removed by delta test: {removed_count}
  {if removed_count > 0: list each removed rule with reason}
- Tech-neutrality: {if base: passed N, failed N | if lang-specific: not applicable}
- Confidence: {level} — {reasoning}
{if hook artifacts in report:}
- Hook script: {path}
- Test script: {path}
- Test fixtures: {count} fixtures
- Hookable rules: {list}
{end if}
{if orchestrator_warnings contains CLAUDE.md conflict:}
- CLAUDE.md conflict: {warning text}
  Options will be presented after approval.
{end if}
{if other orchestrator_warnings:}
- Warnings: {list each warning}
{end if}
```

AskUserQuestion: "Convention preview" with options:
1. "Approve and write"
2. "Request changes"
3. "Cancel"

**Approve:**
The generator already wrote the file in Step 2 (convention file is at `resolved_path`).

**CLAUDE.md Conflict Resolution (when CLAUDE.md conflicts were detected):**

If `orchestrator_warnings` contains CLAUDE.md conflict warnings, present resolution options
after the user approves the convention preview:

Present in conversation text:
```
The generated convention overlaps with rules in your CLAUDE.md:
{list each conflict}

At runtime, CLAUDE.md takes precedence. You can:
```

AskUserQuestion: "How to handle CLAUDE.md overlap?" with options:
1. "Convention priority — I'll update CLAUDE.md to remove the overlapping rules"
2. "CLAUDE.md priority — keep CLAUDE.md rules, convention provides additional coverage"
3. "Keep both — accept the overlap, CLAUDE.md wins at runtime"

Store the resolution choice. If option 1: note in output that user should update CLAUDE.md
(the convention skill does not modify CLAUDE.md automatically).

Proceed to the Transition section after conflict resolution (or immediately if no conflicts).

**Request changes:**
Present in conversation text: "What would you like to change about this convention?"
Then AskUserQuestion: "Your feedback:" (free-form text input).

Store the user's response as `feedback`.
Re-dispatch the generator (return to Step 2) with all inputs from the original dispatch PLUS the `<feedback>` tag containing the user's feedback. The generator adjusts only what the feedback targets — it does not start over.

After re-generation, return to Step 4 (orchestrator review) and then Step 6 (new preview).

**Cancel:**
Delete the generated file: `rm -f {resolved_path}`.
```bash
rm -rf {state_dir}
```
Report: "Convention cancelled."
Stop.

---

## Step 6a: Cleanup .state/ Directory

After the user approves the convention (and hook artifacts if generated):

```bash
rm -rf {state_dir}
```

Clean up the `.state/` directory. It exists only during the authoring session.

If the directory does not exist (e.g., user cancelled and re-ran), skip silently.

**Error/cancel cleanup:** `.state/` is also removed on all other exit paths:
- Step 5 "Skip this convention" path: `rm -rf {state_dir}` before stopping
- Step 6 "Cancel" path: already included above
- Step 3 generation failure "Cancel" path: `rm -rf {state_dir}` before stopping

---

## Transition

When the user approves the preview and `.state/` has been cleaned up (Step 6a):

Display: "Convention written to {resolved_path}."

```
{if hook was generated:}
Hook written to {hook_path}.
Test suite written to {test_path} with {N} fixtures.

Note: Hook registration in .claude/settings.json is handled by the installer (Phase 20),
not by the convention skill. For immediate use, register the hook manually in settings.json.
{end if}
```

**If `create_base_first` flag is true (user wanted base convention first, then language-specific):**

Display: "Base convention complete. Now creating the {lang}-specific convention."

Re-initialize for the language-specific file:
- Re-resolve `resolved_path` using the lang path (step-init Step 3 logic with lang set)
- Set `mode = "create"`
- Set `create_base_first = false`

Read `$CLAUDE_SKILL_DIR/step-init.md` to restart the flow for the language-specific convention.

**Otherwise:**

Done. Convention authoring complete.
