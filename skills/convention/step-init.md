# Step: Init

## Step 1: Parse Arguments

Parse `$ARGUMENTS`:
- `area` = first word (required). The convention area name (e.g., `commit`, `coding`, `test`).
- `lang` = second word (optional). The target language (e.g., `rust`, `typescript`).

If `area` is empty or missing, report:

```
Convention area is required. Usage: /convention {area} [lang]
```

...and stop. Do not proceed to the next step.

Normalize both values to lowercase.

---

## Step 2: Read Config

Read `.claude/cckit.json` if it exists:

```bash
cat .claude/cckit.json 2>/dev/null
```

Parse the JSON and extract:
- `publisher` (boolean, default `false`) — determines output path strategy
- `convention.tools` (string[], default `[]`) — additional tool names for the researcher agent

If the file does not exist, cannot be read, or is invalid JSON, use defaults:
- `publisher = false`
- `convention_tools = []`

Store both values for use throughout this and subsequent steps.

---

## Step 3: Resolve Output Path

Path resolution for base conventions depends on `artifact_type` (determined in Step 7a).
For initial mode detection (Step 4), check BOTH possible filenames.

### Step 3a: Preliminary Path Check (for mode detection only)

**Publisher mode (`publisher == true`):**
- Check both: `conventions/{area}/CONVENTION.md` and `conventions/{area}/SKILL.md`

**Consumer mode (`publisher == false` or absent):**
- Check both: `.claude/rules/cckit-{area}.md` and `.claude/skills/cckit-{area}/SKILL.md`

If `lang` was provided, the target file is the lang path (always rule-type):
- Publisher: `conventions/{area}/{lang}.md`
- Consumer: `.claude/rules/cckit-{area}-{lang}.md`

Store these candidate paths for mode detection in Step 4. Final path is resolved after artifact type is determined in Step 7b.

---

## Step 4: Detect Mode (Create vs Update)

Check whether a convention file already exists for this area. For lang-specific invocations, check the lang path. For base conventions, check BOTH filenames:

**Lang-specific:**
```bash
test -f {lang_path} && echo "UPDATE" || echo "CREATE"
```

**Base convention (publisher mode):**
```bash
test -f conventions/{area}/CONVENTION.md && echo "UPDATE" || \
test -f conventions/{area}/SKILL.md && echo "UPDATE" || echo "CREATE"
```

**Base convention (consumer mode):**
```bash
test -f .claude/rules/cckit-{area}.md && echo "UPDATE" || \
test -f .claude/skills/cckit-{area}/SKILL.md && echo "UPDATE" || echo "CREATE"
```

- Any file found → `mode = "update"`, `resolved_path` = the existing file path
- No file found → `mode = "create"`, final `resolved_path` determined in Step 7b

Store `mode` for routing.

---

## Step 5: Convention Naming (Create Mode Only)

Skip this step entirely if `mode == "update"`.

Skip this step if the convention area directory or prefix already exists (meaning other files for this area have been created before).

**Publisher mode check:**
```bash
test -d conventions/{area} && echo "EXISTS" || echo "NEW"
```

**Consumer mode check:**
```bash
ls .claude/rules/cckit-{area}* 2>/dev/null | head -1
```

Only when creating a **new** convention area (directory or prefix does not yet exist), present the naming context in conversation text:

```
The convention area name determines the directory (publisher mode) or file prefix (consumer mode).

Common convention areas: commit, coding, test, error, documentation, workflow, security, release

You provided: {area}
```

Then ask via AskUserQuestion:

> Convention area name?

Provide options including:
1. The user-provided area name (as typed)
2. Common alternatives relevant to the area (infer from context)
3. "Other (type a custom name)"

If the user selects "Other", accept their typed response as the area name. Re-normalize to lowercase. Re-resolve the output path using the new area name (repeat Step 3 logic). Store the updated area name and resolved path.

---

## Step 6: Handle Missing Base (Lang-Specific Only)

Skip this step if `lang` is empty (not a lang-specific invocation).

Check whether a base convention already exists for this area:

**Publisher mode:**
```bash
test -f conventions/{area}/CONVENTION.md && echo "BASE_EXISTS" || \
test -f conventions/{area}/SKILL.md && echo "BASE_EXISTS" || echo "NO_BASE"
```

**Consumer mode:**
```bash
test -f .claude/rules/cckit-{area}.md && echo "BASE_EXISTS" || \
test -f .claude/skills/cckit-{area}/SKILL.md && echo "BASE_EXISTS" || echo "NO_BASE"
```

If the base convention already exists, skip this step and continue.

If the base convention does **not** exist, present context in conversation text:

```
You're creating a language-specific convention ({area}/{lang}) but no base convention
exists for the '{area}' area yet.

A base convention provides tech-neutral rules that apply regardless of language.
A standalone language-specific convention is fully self-contained.
```

Then ask via AskUserQuestion:

> How to proceed?

Options:
1. "Create base first, then {lang}" — set `create_base_first = true`
2. "Proceed as standalone {lang} convention" — self-contained, no base dependency
3. "Cancel" — stop

If the user selects "Cancel", stop without proceeding.

Store `create_base_first` flag (true or false) for subsequent steps.

---

## Step 7: Flow Selection (Create Mode Only)

Skip this step entirely if `mode == "update"`.

Present context in conversation text:

```
I can approach this two ways:

**Research-first:** I research best practices for {area} conventions, present
findings, then ask about your preferences informed by what I find.

**Preferences-first:** I ask about your style preferences first, then do targeted
research to fill gaps and find options for what you haven't decided.
```

Then ask via AskUserQuestion:

> Convention workflow?

Options:
1. "Research first"
2. "Preferences first"

Store the selection as `selected_flow`.

---

## Step 7a: Artifact Type Detection (Create Mode Only)

Skip this step entirely if `mode == "update"` (artifact type is determined by the existing file).
Skip this step if `lang` is present (language-specific conventions are always rule-type).

Apply the three-criteria test to determine whether this convention should be a rule or a skill:

**Criterion 1: Event-Driven Loading** — Does this convention primarily apply during a
specific action or event (commit, PR, deploy, test run) rather than continuously?
- YES → Skill candidate. Context cost is wasted when the event is not happening.
- NO → Rule candidate. Continuous applicability justifies always-on loading.

**Criterion 2: Tool Access Need** — Would this convention benefit from Claude having
tool access (Read, Bash, Grep) when applying it?
- YES → Skill. Rules cannot grant tool access.
- NO → Continue to next criterion.

**Criterion 3: Context Size** — Is the convention content large enough (>50 lines) that
always-loading it wastes significant context?
- YES → Skill candidate. On-demand loading preserves context budget.
- NO → Rule. Small conventions have negligible context cost.

Present the recommendation in conversation text:

```
Based on the {area} convention area:
- Event-driven: {yes/no — reasoning}
- Tool access needed: {yes/no — reasoning}
- Expected size: {small/large — reasoning}

Recommendation: {Rule / Skill} — {one-sentence reasoning}
```

Then ask via AskUserQuestion:

> Convention type?

Options:
1. "Rule (always-loaded, passive)"
2. "Skill (on-demand, context-aware)"

Store the selection as `artifact_type` ("rule" or "skill").

---

## Step 7b: Final Path Resolution (Create Mode Only)

Skip this step if `mode == "update"` (resolved_path already set in Step 4).

Resolve the definitive output path using `artifact_type`:

**Publisher mode:**
- Rule-type base: `conventions/{area}/CONVENTION.md`
- Skill-type base: `conventions/{area}/SKILL.md`
- Lang: `conventions/{area}/{lang}.md`

**Consumer mode:**
- Rule-type base: `.claude/rules/cckit-{area}.md`
- Skill-type base: `.claude/skills/cckit-{area}/SKILL.md`
- Lang: `.claude/rules/cckit-{area}-{lang}.md`

Store the resolved target path as `resolved_path`.

---

## Step 8: Initialize .state/ Directory (Create Mode Only)

Skip this step entirely if `mode == "update"`.

Create the .state/ directory and write init.json:

If publisher mode:
  `state_dir = conventions/{area}/.state/`
If consumer mode:
  `state_dir = .convention-state/{area}/`

```bash
mkdir -p {state_dir}
```

Write the following JSON to `{state_dir}/init.json`:

```json
{
  "area": "{area}",
  "lang": "{lang or null}",
  "publisher": {publisher},
  "convention_tools": {convention_tools array},
  "resolved_path": "{resolved_path}",
  "mode": "{mode}",
  "artifact_type": "{rule or skill}",
  "selected_flow": "{selected_flow}",
  "create_base_first": {create_base_first}
}
```

Store `state_dir` for use in subsequent steps.

---

## Transition

When all applicable steps above are complete, pass the following values forward to the next step:

- `area` — convention area name (final, after any renaming in Step 5)
- `lang` — language identifier, or nil if not provided
- `publisher` — boolean, from config detection
- `convention_tools` — string list, from config detection
- `resolved_path` — final output path
- `mode` — "create" or "update"
- `artifact_type` — "rule" or "skill" (create mode only; update mode reads from existing file)
- `state_dir` — path to .state/ directory (create mode only)
- `selected_flow` — "Research first" or "Preferences first" (create mode only)
- `create_base_first` — boolean (lang-specific create mode only)

**Create mode, research-first:**
```bash
Read "$CLAUDE_SKILL_DIR/step-research.md"
```

**Create mode, preferences-first:**
```bash
Read "$CLAUDE_SKILL_DIR/step-preferences.md"
```

**Update mode:**
```bash
Read "$CLAUDE_SKILL_DIR/step-update.md"
```
