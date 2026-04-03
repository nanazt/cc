# Convention Architecture

Version: 1.0
Status: Specification
Applies to: cckit v0.2.0+

---

## Overview

This document defines the architecture for cckit conventions — installable behavioral directives packaged as Claude Code rules. All downstream convention authoring (Phases 18–23) references this document as the authoritative specification.

**Scope:** File structure, naming, frontmatter format, delta test definition, hook architecture, installer discovery contract, and content principles. Not in scope: convention content (Phase 19+), `/convention` skill implementation (Phase 18), installer implementation (Phase 20).

**What conventions are:** Claude Code rules (`.claude/rules/*.md` files) — passive behavioral guidance that Claude loads automatically. Not skills, not agents. Rules are the correct mechanism for passive, always-on behavioral directives.

---

## Source Structure

Conventions live in a `conventions/` directory at the project root, separate from `skills/` (action workflows) and `agents/` (subagent definitions).

Each convention area is a subdirectory with a short, intuitive name. Directory names are lowercase. Kebab-case applies only to compound words.

Within each area directory:

| File | Purpose | Required? |
|------|---------|----------|
| `CONVENTION.md` | Base convention — tech-neutral, always-loading | Optional (see Delta Test) |
| `{lang}.md` | Language-specific convention — e.g., `rust.md`, `typescript.md` | Optional |
| `hooks/` | Enforcement scripts for this convention area | Optional |

**Canonical source structure example:**

```
conventions/
+-- commit/
|   +-- CONVENTION.md              # base only (no language-specific needed)
|   +-- hooks/
|       +-- validate.sh            # enforcement hook
+-- coding/
|   +-- CONVENTION.md              # base
|   +-- rust.md                    # language-specific
+-- test/
|   +-- CONVENTION.md              # base
|   +-- rust.md                    # language-specific
+-- error/
    +-- rust.md                    # language-specific only (no base)
```

Directory names (`commit/`, `coding/`, `test/`, `error/`) are decided per-convention at creation time. Use the most intuitive name — there is no prescribed vocabulary.

---

## Convention File Format

Convention files are Claude Code rules. Each file is a Markdown document with optional YAML frontmatter.

### Frontmatter Fields

Convention files use only Claude Code standard fields:

| Field | Required? | Purpose |
|-------|----------|---------|
| `description` | Yes | Human-readable summary of the convention |
| `paths` | Optional | File glob that scopes when this convention loads |
| `alwaysApply` | Required when `paths` present | Must be `false` for path-scoped lazy loading |

Zero cckit-specific fields. No `type`, `technology`, `area`, or other custom metadata. Convention files must be pure Claude Code rule files with no cckit-proprietary fields.

### Base Convention (Always-Loading)

A base convention loads in every Claude session — no file path filter. Example frontmatter:

```markdown
---
description: "Commit message format and quality standards"
---
```

When `paths` is absent, the convention loads for all files. `alwaysApply` can be explicitly set to `true`, but is not required — omitting it has the same effect.

### Language-Specific Convention (Path-Scoped)

A language-specific convention loads only when Claude is working with matching files. Example frontmatter:

```markdown
---
description: "Rust coding conventions"
paths: **/*.rs
alwaysApply: false
---
```

### Critical: Working `paths` Syntax

The `paths` frontmatter field has known behavior constraints in Claude Code (GitHub issue #17204, open as of 2026-03-30). For path-scoped lazy loading to work correctly, **all three conditions must hold**:

1. `paths` must be a **single unquoted glob** (not a YAML array, not a quoted string)
2. `alwaysApply: false` must be explicitly present
3. Both fields must appear together

**Working format:**

```yaml
---
description: "Rust coding conventions"
paths: **/*.rs
alwaysApply: false
---
```

**Non-working formats (will silently fail or load eagerly):**

```yaml
# BAD: YAML array -- does not lazy-load
paths:
  - "**/*.rs"

# BAD: quoted string -- does not load at all
paths: "**/*.rs"
```

Downstream convention authors must use the working format. If the underlying Claude Code behavior changes in a future version, the `alwaysApply: false` field becomes harmless.

---

## Base and Language-Specific Relationship

### Base Is Optional

A base convention (`CONVENTION.md`) is only created when it passes the delta test (see [Delta Test](#delta-test)). If no rules in the base would add value beyond what Claude already knows, the base is omitted. An area can ship language-specific conventions without any base.

### When Base Exists: Additive Language-Specific

Language-specific conventions extend the base without duplicating it. Claude loads both files and applies both sets of directives. Authors write language-specific content only — rules that are already in the base do not appear in the language-specific file.

### When Base Does Not Exist: Standalone Language-Specific

Language-specific conventions are fully self-contained. They include all necessary directives without reference to a base convention that does not exist.

### Within-Area: Installed Together

The installer treats base and language-specific files within the same area as a group. When a user selects a convention area, they receive all files in that area (base if present, plus the language-specific files they selected).

### Across Areas: Fully Independent

Conventions in different areas have no cross-references. A `coding/rust.md` convention makes no assumptions about whether `error/rust.md` is installed. Each convention area must be installable alone without depending on another area's conventions.

---

## Delta Test

**Definition:** Each rule in a convention must pass: "Would Claude already do this without being told?"

The delta test applies to every proposed rule during convention authoring. The test has three criteria:

1. **Default behavior test** — Ask Claude to perform the task without the convention loaded. Does it already follow the rule? If yes, the rule adds no value.
2. **Style divergence test** — Does the user want behavior different from Claude's default? If the user wants a specific format Claude would not produce by default, the rule passes.
3. **Consistency test** — Would Claude's behavior vary meaningfully across sessions without this rule? If yes, the rule adds consistency value.

A rule passes the delta test when it satisfies at least one of: style divergence, or consistency improvement. A rule that fails all three criteria is removed.

**When the base is skipped:** If every candidate rule for a base convention fails the delta test, the base is not created. This is not a failure — it means Claude already follows all these rules by default and a base convention would only add noise.

The delta test is embedded in the `/convention` skill's authoring process (Phase 18). No separate validation infrastructure is needed. The test naturally keeps conventions concise.

---

## Naming and Installation

### Source-to-Installed Mapping

The installer copies convention files from `conventions/` to the host project's `.claude/rules/` with a `cckit-` prefix. This prefix prevents collision with the host project's own rules.

| Source File | Installed As | Rule |
|-------------|-------------|------|
| `conventions/commit/CONVENTION.md` | `.claude/rules/cckit-commit.md` | `cckit-{area}.md` |
| `conventions/coding/CONVENTION.md` | `.claude/rules/cckit-coding.md` | `cckit-{area}.md` |
| `conventions/coding/rust.md` | `.claude/rules/cckit-coding-rust.md` | `cckit-{area}-{lang}.md` |
| `conventions/error/rust.md` | `.claude/rules/cckit-error-rust.md` | `cckit-{area}-{lang}.md` |

### Installed Structure (host project)

```
.claude/
+-- rules/
|   +-- cckit-commit.md            # base convention
|   +-- cckit-coding.md            # base convention
|   +-- cckit-coding-rust.md       # language-specific
|   +-- cckit-test.md              # base convention
|   +-- cckit-test-rust.md         # language-specific
|   +-- cckit-error-rust.md        # language-specific only (no base)
+-- hooks/
    +-- cckit-commit-validate.sh   # enforcement hook
```

### Installer Discovery Contract

The installer discovers conventions by scanning the `conventions/` directory. No manifest file is needed.

Discovery algorithm:

```
For each subdirectory in conventions/:
  area_name = directory name
  If CONVENTION.md exists:
    -> install as .claude/rules/cckit-{area_name}.md
  For each {lang}.md file:
    -> install as .claude/rules/cckit-{area_name}-{lang}.md
  If hooks/ directory exists:
    For each script in hooks/:
      -> install as .claude/hooks/cckit-{area_name}-{script_name}
```

Presence of `CONVENTION.md` or `{lang}.md` in the area directory signals that a convention exists. No manifest file, no registry file.

### Self-Application

cckit installs its own conventions into itself via:

```
deno run tools/install.ts --self
```

This follows the same path as any host project — conventions install to cckit's own `.claude/rules/` directory with the `cckit-` prefix.

### User Customization

After installation, users can edit the installed convention files — including the `paths` field values — to match their project's file layout. The installed file is the user's local copy.

---

## Hook Architecture

### Structure

Hooks live inside the convention directory they enforce:

```
conventions/commit/
+-- CONVENTION.md
+-- hooks/
    +-- validate.sh
```

This co-locates the guidance (rule file) and enforcement (hook script) for the same convention area.

### Hook Format

Hooks are shell scripts designed for Claude Code's PreToolUse/PostToolUse hook system. They receive JSON on stdin and emit JSON on stdout.

Required output format for a blocking hook:

```json
{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"[reason]"}}
```

For a permitting hook (or when the command does not match), the script exits with code 0 without writing JSON (allows by default).

**Reference implementation:** `.claude/hooks/validate-commit-scope.sh` in this repository demonstrates the complete pattern — reads `.tool_input.command` from stdin JSON, filters to relevant commands, validates, and emits the deny response when validation fails.

Example structure (abridged):

```bash
#!/bin/sh
CMD=$(jq -r '.tool_input.command')

# Only check commands that contain "git commit"
case "$CMD" in
  *git\ commit*) ;;
  *) exit 0 ;;
esac

# Validate commit message
if [ "$INVALID" = "true" ]; then
  cat <<'JSON'
{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Commit message does not follow convention format."}}
JSON
fi
exit 0
```

### Hook Registration

The installer must register hooks in the host project's `.claude/settings.json`. The required settings.json structure for a PreToolUse hook:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [".claude/hooks/cckit-commit-validate.sh"]
      }
    ]
  }
}
```

The installer adds hook entries to the existing `settings.json` (creating it if absent). The Phase 20 installer specification defines the exact merge behavior when `settings.json` already contains hooks.

---

## Override and Precedence

Claude Code's built-in priority applies: **host project's CLAUDE.md always takes precedence over `.claude/rules/` files.** No custom override mechanism is needed — this is a property of Claude Code's native context loading order.

Users who want to override a cckit convention for a specific project:
1. Add the override rule to the project's CLAUDE.md (highest precedence)
2. Or edit the installed convention file directly in `.claude/rules/cckit-*.md`

Convention files installed in `.claude/rules/` take precedence over general LLM behavior but are overridden by explicit CLAUDE.md content.

---

## Convention Content Principles

### Directives, Not Explanations

Convention files are instructions to Claude, not documentation for humans. Every line should be actionable:

- Good: `Always use Conventional Commits 1.0.0 format: type(scope): subject`
- Bad: `Conventional Commits is a specification for adding human and machine readable meaning to commit messages...`

Rationale and philosophy belong in `docs/`, not in installed convention files.

### Technology Neutrality for Base Conventions

Base conventions (`CONVENTION.md`) must apply across all project types. Test: "Could a Rust CLI, Go API, Python ML pipeline, and a documentation site all follow this rule?" If the answer depends on the stack, the rule belongs in a language-specific file, not in the base.

Language-specific conventions (`{lang}.md`) deliberately contain language-specific rules — that is their purpose.

### No Prescribed Internal Structure

Convention file internal organization is not prescribed. The `/convention` skill (Phase 18) researches and determines the optimal structure for each convention area. Some areas may benefit from grouping rules under headings; others may work better as a flat list. Phase 17 defines the container format — not the content format.

---

## Anti-Patterns

| Anti-Pattern | Why Avoid | Correct Approach |
|--------------|-----------|-----------------|
| Convention-as-skill | Skills (`skills/`) are action workflows with tool access. Conventions are passive behavioral guidance. | Use `.claude/rules/` files, not skills. |
| Custom frontmatter fields | `type: convention`, `technology: rust`, or other cckit-specific fields break convention file portability and violate D-11. | Use only `description`, `paths`, `alwaysApply`. |
| Manifest file | A `conventions.json` or similar registry file creates sync issues and adds complexity with no benefit. | Installer discovers conventions by directory scanning. Presence = convention exists. |
| Prescribed content structure | Requiring fixed sections (e.g., "### Overview", "### Rules") across all conventions forces inappropriate uniformity. | No prescribed structure. Each convention's internal organization is skill-determined. |
| Monolithic convention file | One large file with all conventions (e.g., `all-conventions.md`) makes selective installation impossible. | One file per convention area and language. |
| Cross-convention references | Convention A referencing Convention B breaks independent installability. | Each convention is fully self-contained and installable alone. |
| Tech-stack assumptions in base | Base conventions that assume a specific language, framework, or tool bias against the cckit technology neutrality principle. | Base conventions use structural, universal directives only. Language-specific content goes in `{lang}.md`. |

---

## Relationship to Other Artifacts

| Artifact | Relationship |
|----------|-------------|
| `conventions/` directory | Source repository for convention files. Does not exist yet — created incrementally as phases 19-23 produce conventions. |
| `skills/case/`, `skills/consolidate/` | Separate category. Action skills use `SKILL.md` format with Claude Code tool access. Conventions use rules format with no tool access. |
| `tools/install.ts` | Phase 20 implementation. Reads `conventions/` per the discovery contract defined in this document. |
| `docs/MODEL.md` | Sibling architecture document. Covers consolidation model, not conventions. |
| CLAUDE.md | Host project instructions that override all convention rules. Existing cckit CLAUDE.md convention content will migrate to `conventions/` files when authored. |

---

## Summary Table: Key Architecture Properties

| Property | Value |
|----------|-------|
| Convention format | Claude Code rules (`.claude/rules/` files) |
| Source directory | `conventions/{area}/` |
| Base file name | `CONVENTION.md` |
| Language-specific file name | `{lang}.md` (e.g., `rust.md`, `typescript.md`) |
| Base optional? | Yes — only when delta test justifies it |
| Installed prefix | `cckit-` |
| Discovery mechanism | Directory scan (no manifest) |
| Frontmatter fields | `description`, `paths` (opt), `alwaysApply` (required when paths present) |
| Custom cckit frontmatter fields | None |
| Conventions independent across areas | Yes — each installable alone |
| Override mechanism | Claude Code built-in (CLAUDE.md > rules) |
| Hook co-location | `conventions/{area}/hooks/` |
| Hook format | Shell script, JSON stdin/stdout |
| Self-application command | `deno run tools/install.ts --self` |

---

*Last updated: 2026-04-03*
