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

---

## Step 2: Update Strategy Choice

Analyze the existing convention (length, number of rules, structure) and present the update options.

Present in conversation text:

```
How would you like to update this convention?

Full rewrite: Re-research the area, re-collect preferences, and generate a
completely new version. The delta test is re-validated. Best when conventions
have drifted significantly or you want a fresh start with current best practices.

Surgical edit: Modify specific rules only. Add new rules, change existing ones,
or remove rules you no longer want. Best for targeted changes with minimal
disruption to existing rules.
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

**Preferences-first:**
Read `$CLAUDE_SKILL_DIR/step-preferences.md`.

Pass forward:
- `area`, `lang`, `publisher`, `convention_tools`, `resolved_path`
- `mode` = "update"
- `selected_flow` = "Preferences first"
- `create_base_first` = false

The rewrite uses `mode = "create"` in the generator dispatch (step-generate.md overwrites the file). The existing convention is context for the researcher, not a constraint on the generator.

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
```

Extract the change summary from the generator's `## Changes Made` section in its return message.

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

Done. Update complete.

**Note on create_base_first:** This flag is only relevant in create mode. Step-update does not need to handle it — the flag is false for all update flows.
