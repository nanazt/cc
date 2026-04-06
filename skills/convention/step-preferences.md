# Step: Preferences

## Step 1: Determine Question Strategy

Display progress announcement:

```
Collecting your preferences...
```

Examine the available context to shape the questioning approach:

**Research-first flow** (research-first, research_results available): Questions are research-informed. Derive specific, concrete options from the research findings — present options the user may not have known existed. The research report's practices and library recommendations provide the raw material for questions.

**Preferences-first flow** (preferences-first, no research_results yet): Questions are broader, exploring the user's existing style preferences and constraints. The goal is to collect enough preference signal so the researcher can do targeted, focused research in the next step.

Identify which preference areas are relevant to this convention area by examining:
- The convention area name and what it covers
- Research findings (if available): specific practices, library options, configurable behaviors
- Whether the convention is base (tech-neutral) or language-specific

The number and depth of questions vary by convention area — some areas need 2-3 questions, others need 8-10. This is an adaptive question loop: never hardcode a question count. Ask what the situation requires.

---

## Step 2: Adaptive Question Loop

For each preference area relevant to this convention:

**2a: Present context in conversation text.** Before each AskUserQuestion, explain:
- What this preference controls
- What the options are and why they differ
- If research-informed: reference the specific finding or library evaluation that surfaced this option

For example, for a commit convention: explain what the subject line length affects (terminal wrapping, readability, tool compatibility), then ask via AskUserQuestion with specific length options from research findings.

**2b: Ask via AskUserQuestion.** Keep the question text itself brief — one line. Detailed context stays in the conversation text above. Provide concrete, specific options derived from research or common patterns. Avoid open-ended "what do you prefer?" questions without options.

**2c: Record the user's selection.** Accumulate all preferences as a structured list.

**2d: Handle preference conflicts with research (per research-informed questioning).** If the user's selection conflicts with a recommendation from the research report:

Present in conversation text:
```
Note: Your preference for {selected option} differs from the commonly recommended {recommended option}.
Trade-off: {explain the practical trade-off in 1-2 sentences}.
```

Then AskUserQuestion: "Keep your preference?" with options:
1. "Yes, keep {selected option}"
2. "Switch to {recommended option}"
3. "Tell me more about this trade-off"

If the user selects "Tell me more": explain the trade-off in more depth in conversation text, then repeat the question. Never silently override the user's preference.

**Loop:** Continue through all relevant preference areas. Typical preference areas that may apply depending on the convention:

- Format preferences (e.g., line lengths, naming conventions, file organization)
- Strictness level (strict enforcement vs. flexible guidance)
- Library selection (when research found library options: present the health/soundness table and feature comparison, ask user to select)
- Existing practices to preserve (things already in use in the host project)
- Practices to explicitly exclude (things from research the user disagrees with)
- Edge case handling preferences

Not every area applies to every convention — use judgment based on the area.

---

## Step 2a: Hook Confirmation (When Research Recommends Hook)

Skip this step if `research_results` does not contain a `## Hook Recommendation` section, or if the recommendation is "No".

When the researcher recommends a hook:

Present in conversation text:

```
The research identified {N} mechanically verifiable rules in this convention area.
A PreToolUse hook can enforce these rules automatically:

Hookable rules:
{list each [HOOK:yes] rule from research by name}

Trigger event: {trigger event from hook recommendation}
```

Then ask via AskUserQuestion:

> Generate an enforcement hook for this convention?

Options:
1. "Yes, generate hook + tests"
2. "No, convention only"

Store the selection as `hook_confirmed` (true or false).

If `hook_confirmed` is true, also store the list of [HOOK:yes] rule names as `hook_rules` for the generator.

---

## Step 3: Preference Summary and Confirmation

After collecting all preferences, present a summary in conversation text:

```
Here's what I'll use to generate your convention:

- {Preference 1}: {value}
- {Preference 2}: {value}
- ...
{if hook_confirmed is set:}
- Hook generation: {Yes — {N} hookable rules / No}
```

AskUserQuestion: "Preferences look correct?" with options:
1. "Yes, proceed to generation"
2. "I want to change something"
3. "Add another preference"

- **Proceed:** Continue to transition.
- **Change something:** Ask via AskUserQuestion: "Which preference would you like to change?" (present the list as options). After the user selects, re-run the relevant question from Step 2 for that preference area. Return to the summary.
- **Add another:** Present context explaining what additional preference areas could be specified. Ask via AskUserQuestion: "What preference area?" (free-form or from a list of remaining areas). Collect the new preference and return to the summary.

Loop until the user confirms.

Store all collected preferences as a structured `user_preferences` summary.

---

## Step 3a: Persist Preferences

Write all collected preferences to `.state/preferences.json`:

```json
{
  "preferences": [
    { "key": "{preference_key}", "value": "{value}", "source": "{user/research-confirmed}" }
  ],
  "hook_confirmed": {true/false},
  "hook_rules": ["{rule_name}", ...],
  "artifact_type": "{rule or skill from init}"
}
```

Use the Write tool to write preferences JSON to `{state_dir}/preferences.json`.

This makes preferences available to step-generate for post-generation verification without relying on implicit context.

---

## Step 4: Transition

**If selected_flow == "Research first" (research already completed):**

Read `$CLAUDE_SKILL_DIR/step-generate.md`.

Pass forward:
- `area`, `lang`, `publisher`, `convention_tools`, `resolved_path`, `mode`, `create_base_first`
- `selected_flow`
- `state_dir` — path to .state/ directory
- `artifact_type` — "rule" or "skill"
- `hook_confirmed` — boolean (whether to generate hook)
- `hook_rules` — list of hookable rule names (if hook_confirmed)
- `research_results` — full research report text
- `user_preferences` — structured summary of all collected preferences
- `additional_context` — any user-provided context (may be empty)

**If selected_flow == "Preferences first" (research not yet done):**

Read `$CLAUDE_SKILL_DIR/step-research.md`.

Pass forward:
- `area`, `lang`, `publisher`, `convention_tools`, `resolved_path`, `mode`, `create_base_first`
- `selected_flow`
- `state_dir` — path to .state/ directory
- `artifact_type` — "rule" or "skill"
- `hook_confirmed` — boolean (whether to generate hook)
- `hook_rules` — list of hookable rule names (if hook_confirmed)
- `user_preferences` — structured summary of all collected preferences (researcher will use preferences to focus research)

After step-research.md completes, it transitions directly to step-generate.md (not back here) with research_results + user_preferences combined.
