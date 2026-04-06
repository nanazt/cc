# Step: Update

This step handles updating an existing convention file. It is reached when step-init detects the target file already exists (`mode == "update"`).

## Step 1: Read Existing Convention

Read the existing convention file from `resolved_path`.

Display in conversation text:

```
Found existing convention at {resolved_path}. Here's the current content:
```

Display the full file content in a markdown code block.

Store the file content as `existing_convention_content` for use in subsequent steps.

Detect the artifact type from the file:
- If `resolved_path` ends with `SKILL.md`: `artifact_type = "skill"`
- If `resolved_path` ends with `CONVENTION.md`: `artifact_type = "rule"`
- If `resolved_path` is a consumer path (`.claude/rules/`): `artifact_type = "rule"`
- If `resolved_path` is a consumer path (`.claude/skills/`): `artifact_type = "skill"`

Store `artifact_type` for use in generator dispatch.

Check if hooks exist for this convention area:

**Publisher mode:**
```bash
ls conventions/{area}/hooks/validate.sh 2>/dev/null && echo "HOOKS_EXIST" || echo "NO_HOOKS"
```

**Consumer mode:**
```bash
ls .claude/hooks/cckit-{area}-validate.sh 2>/dev/null && echo "HOOKS_EXIST" || echo "NO_HOOKS"
```

Store `hooks_exist` (true/false).

If hooks exist, display a note:
```
This convention has enforcement hooks at {hook_path}. When you update the convention,
hooks and tests will be automatically regenerated to match the new rules.
```

---

## Step 2: Update Strategy Choice

Analyze the existing convention (length, number of rules, structure) and present the update options.

Present in conversation text:

```
How would you like to update this convention?

Full rewrite: Re-research the area, re-collect preferences, and generate a
completely new version. The delta test is re-validated. Best when conventions
have drifted significantly or you want a fresh start with current best practices.
{if hooks_exist:}Hooks and tests will be regenerated alongside the convention.{end if}

Surgical edit: Modify specific rules only. Add new rules, change existing ones,
or remove rules you no longer want. Best for targeted changes with minimal
disruption to existing rules.
{if hooks_exist:}Hooks will be regenerated after edits to stay in sync.{end if}
```

AskUserQuestion: "Update approach?" with options:
1. "Full rewrite"
2. "Surgical edit"

---

## Step 3a: Full Rewrite Path

If user selects full rewrite:

This is the create workflow re-run on an existing file. Transition to the create flow:

Present context in conversation text:

```
I can approach the rewrite two ways:

Research-first: I research current best practices for {area} conventions,
present findings, then ask about your preferences informed by what I find.

Preferences-first: I ask about your style preferences first, then do targeted
research to fill gaps and find options for what you haven't decided.
```

AskUserQuestion: "Convention workflow?" with options:
1. "Research first"
2. "Preferences first"

Store selection as `selected_flow`.

Pass `existing_convention_content` to the researcher so it can focus on gaps and improvements since the convention was written (Step 2 of step-research.md will include the `<existing_convention>` tag when mode == "update").

**Research-first:**
Read `$CLAUDE_SKILL_DIR/step-research.md`.

Pass forward:
- `area`, `lang`, `publisher`, `convention_tools`, `resolved_path`
- `mode` = "update" (preserves the existing_convention tag in research dispatch)
- `selected_flow` = "Research first"
- `create_base_first` = false
- `artifact_type` -- "rule" or "skill" (detected from existing file)
- `hooks_exist` -- boolean
- `state_dir` -- path to .state/ directory (if .state/ was initialized)

**Preferences-first:**
Read `$CLAUDE_SKILL_DIR/step-preferences.md`.

Pass forward:
- `area`, `lang`, `publisher`, `convention_tools`, `resolved_path`
- `mode` = "update"
- `selected_flow` = "Preferences first"
- `create_base_first` = false
- `artifact_type` -- "rule" or "skill" (detected from existing file)
- `hooks_exist` -- boolean
- `state_dir` -- path to .state/ directory (if .state/ was initialized)

The rewrite uses `mode = "create"` in the generator dispatch (step-generate.md overwrites the file). The existing convention is context for the researcher, not a constraint on the generator.

Note: The full rewrite path passes through step-research and step-preferences which will initialize .state/ and collect hook confirmation. step-generate handles hook regeneration as part of its standard flow when hook_confirmed is true.

---

## Step 3b: Surgical Edit Path

If user selects surgical edit:

Present in conversation text:

```
What changes would you like to make? You can:
- Modify existing rules (change wording, strictness, scope)
- Add new rules
- Remove rules that are no longer relevant
```

Use an adaptive loop to collect all requested changes:

**Change collection loop:**

1. AskUserQuestion: "What change would you like to make?" (free-form, or offer these options if the convention structure suggests specific targets: list rule headings/numbers from the existing convention as options, plus "Describe a new rule" and "Remove a rule")

2. Record the requested change. Classify internally as: modify, add, or remove.

3. AskUserQuestion: "Any more changes?" with options:
   1. "Add another change"
   2. "That's all"

4. If "Add another change": loop back to step 1.
   If "That's all": proceed to Step 4b.

After all changes are collected, present a summary in conversation text:

```
Changes to apply:
{if any modify:}
- Modify:
  - {describe each modification}
{if any add:}
- Add:
  - {describe each new rule}
{if any remove:}
- Remove:
  - {describe each rule to remove}
```

AskUserQuestion: "Changes look correct?" with options:
1. "Yes, apply changes"
2. "Adjust the list"

If "Adjust the list": allow the user to remove entries from the change list or add new ones. Loop back to summary until confirmed.

Store the confirmed list as `requested_changes`.

---

## Step 4b: Dispatch Generator for Surgical Edit

Display progress announcement:

```
Applying changes...
```

Dispatch the generator in surgical-edit mode:

```
Agent(
  subagent_type: "convention-generator",
  prompt: "<objective>
Apply surgical edits to the existing '{area}' convention{', targeting ' + lang if lang else ''}.
</objective>

<convention_spec>
Read docs/CONVENTIONS.md for the authoritative convention file format specification.
</convention_spec>

<research_results>
Not applicable for surgical edit — use existing convention as context.
</research_results>

<user_preferences>
{existing convention represents prior preferences; apply changes as requested}
</user_preferences>

<delta_test_instructions>
For newly added or significantly modified rules only:
- Would Claude already follow this rule without being told? If yes → flag in report.
- Does the user explicitly want this behavior? If yes → KEEP (user explicitly requested).
New rules requested by the user are kept even if they would fail the default delta test,
because the user's explicit request serves as the style divergence override.
</delta_test_instructions>

<output_path>{resolved_path}</output_path>
<mode>surgical-edit</mode>

<existing_content>
{full content of existing_convention_content variable}
</existing_content>

<requested_changes>
{structured list of requested_changes from Step 3b}
</requested_changes>",
  run_in_background: false
)
```

**Handle generator failure:**

If the return message contains `## GENERATION FAILED`:

Present the failure reason in conversation text.

AskUserQuestion: "Generation failed. How would you like to proceed?" with options:
1. "Retry"
2. "Cancel update"

- **Retry:** Re-dispatch with the same inputs.
- **Cancel update:** Revert the file to its original content by writing `existing_convention_content` back to `resolved_path`. Report: "Update cancelled. Convention restored to original."

---

## Step 4c: Hook Regeneration on Surgical Edit

If `hooks_exist` is true:

After the surgical edit generator returns successfully, re-dispatch the generator
to regenerate hooks. The generator needs the updated convention content to generate
hooks that match the new rules.

Present in conversation text:
```
Updating enforcement hooks to match the edited convention...
```

Read the hook recommendation data. If the convention was previously generated with
research data, read `{state_dir}/research.md` if available. Otherwise, identify
[HOOK:yes] rules from the updated convention by scanning for rules that are
mechanically verifiable (format patterns, naming rules, structural requirements).

Dispatch the generator:
```
Agent(
  subagent_type: "convention-generator",
  prompt: "<objective>
Regenerate the enforcement hook and test suite for the '{area}' convention
to match the updated convention rules.
</objective>

<convention_spec>
Read docs/CONVENTIONS.md for the authoritative convention file format specification.
</convention_spec>

<artifact_type>{artifact_type}</artifact_type>

<hook_confirmed>true</hook_confirmed>
<hook_rules>{list of mechanically verifiable rules from the updated convention}</hook_rules>
<hook_trigger>{original trigger event -- read from existing validate.sh case pattern}</hook_trigger>

<existing_content>
{updated convention file content after surgical edit}
</existing_content>

<output_path>{resolved_path}</output_path>
<mode>hook-regenerate</mode>",
  run_in_background: false
)
```

If hook regeneration fails:
```
AskUserQuestion: "Hook regeneration failed. Hooks may be out of sync." with options:
1. "Retry hook regeneration"
2. "Skip hooks (update convention only)"
```

Skip option leaves the old hooks in place. Note in output that hooks may be
out of sync with convention rules.

---

## Step 5b: Diff Preview and Approval

When the generator returns `## GENERATION COMPLETE`:

Display progress announcement:

```
Changes preview:
```

Present a structured change report (not raw diff output) in conversation text:

```
Changes made:

Rules added ({count}):
{for each added rule: - {rule name}: {brief content description}}

Rules modified ({count}):
{for each modified rule: - {rule name}: {before} → {after (brief)}}

Rules removed ({count}):
{for each removed rule: - {rule name}: removed}

Unchanged rules: {count}

{if hooks_exist and hook regenerated:}
Hook status: Regenerated to match updated rules
- Hookable rules: {list}
- Test fixtures: {count} updated
{end if}
{if hooks_exist and hook NOT regenerated:}
Hook status: NOT updated -- may be out of sync with convention changes
{end if}
```

Extract the change summary from the generator's `## Changes Made` section in its return message.

If hooks were regenerated, optionally show hook diff:
```
{hook changes}
```

But do NOT add a separate approval gate for hooks -- the hook approval is bundled
with the convention approval. Hooks are artifacts of the convention, not independent.

AskUserQuestion: "Update preview" with options:
1. "Approve changes"
2. "Request adjustments"
3. "Cancel update"

**Approve:**
The generator already wrote the updated file.
Proceed to the Transition section.

**Request adjustments:**
Present in conversation text: "What adjustments would you like?"
AskUserQuestion: "Your adjustments:" (free-form feedback).

Append the new feedback to `requested_changes` and re-dispatch the generator (return to Step 4b) with the accumulated change list. After generation, return to Step 5b with the new preview.

**Cancel update:**
Revert the file to its original content:
```bash
# Re-write existing_convention_content back to resolved_path
```
Report: "Update cancelled. Convention restored to original."
Stop.

---

## Transition

When the user approves the changes:

Display: "Convention updated at {resolved_path}."

{if hooks_exist and hooks regenerated:}
Display: "Hooks regenerated at {hook_path}."
Display: "Run `bash {test_path}` to verify hook behavior."
{end if}

{if hooks_exist and hooks NOT regenerated:}
Display: "Warning: Hooks at {hook_path} were not regenerated and may be out of sync."
{end if}

Done. Update complete.

**Note on create_base_first:** This flag is only relevant in create mode. Step-update does not need to handle it — the flag is false for all update flows.
