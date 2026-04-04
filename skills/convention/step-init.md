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

Based on the `publisher` flag:

**Publisher mode (`publisher == true`):**
- Base path: `conventions/{area}/CONVENTION.md`
- Lang path: `conventions/{area}/{lang}.md`

**Consumer mode (`publisher == false` or absent):**
- Base path: `.claude/rules/cckit-{area}.md`
- Lang path: `.claude/rules/cckit-{area}-{lang}.md`

If `lang` was provided, the target file is the lang path. Otherwise, the target file is the base path.

Store the resolved target path as `resolved_path` for use in subsequent steps.

---

## Step 4: Detect Mode (Create vs Update)

Check whether the target file already exists:

```bash
test -f {resolved_path} && echo "UPDATE" || echo "CREATE"
```

- File exists → `mode = "update"`
- File does not exist → `mode = "create"`

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
test -f conventions/{area}/CONVENTION.md && echo "BASE_EXISTS" || echo "NO_BASE"
```

**Consumer mode:**
```bash
test -f .claude/rules/cckit-{area}.md && echo "BASE_EXISTS" || echo "NO_BASE"
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

## Transition

When all applicable steps above are complete, pass the following values forward to the next step:

- `area` — convention area name (final, after any renaming in Step 5)
- `lang` — language identifier, or nil if not provided
- `publisher` — boolean, from config detection
- `convention_tools` — string list, from config detection
- `resolved_path` — final output path
- `mode` — "create" or "update"
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
