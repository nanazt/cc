# Architecture: Portable Convention Distribution

**Domain:** Convention packaging and installation for Claude Code toolkit (cckit)
**Researched:** 2026-04-03
**Confidence:** HIGH (based on official Claude Code plugin documentation, codebase analysis, and verified .claude/ directory structure)

## Executive Summary

cckit already ships skills (`skills/`) and agents (`agents/`) that Claude Code can consume. The v0.2.0 milestone adds a third artifact type: **conventions** -- behavioral rules, coding standards, and project structure guidelines that are installed into a host project's `.claude/` directory and consumed as CLAUDE.md instructions, skills, or hooks.

The critical architectural insight is that Claude Code's **native plugin system** (`.claude-plugin/plugin.json` manifest, namespaced skills, plugin hooks, `bin/` directory, settings.json) is the correct distribution mechanism. cckit should be structured as a Claude Code plugin. This avoids building a custom installer script entirely -- Claude Code already handles installation, enabling/disabling, scoping (user/project/local), and namespacing. The "Deno remote installer" idea from the original milestone description should be replaced with native plugin distribution, optionally supplemented by a plugin marketplace entry.

Conventions themselves are not a new artifact format. They are **skills with `user-invocable: false`** (background knowledge Claude loads automatically when relevant) and **hooks** (automated enforcement). A "commit convention" is a PreToolUse hook that validates commit messages + a skill with commit guidelines. A "coding convention" is a skill with coding standards that Claude loads when writing code. This maps perfectly to Claude Code's existing architecture.

The self-application pattern (dogfooding) works naturally: cckit enables itself as a plugin via `--plugin-dir .` during development or by adding its own path to `enabledPlugins` in `.claude/settings.local.json`.

---

## Key Architectural Decision: Native Plugin vs Custom Installer

### Recommendation: Native Claude Code Plugin

**Use Claude Code's native plugin system.** Do not build a custom Deno installer script.

### Evidence

Claude Code's plugin system (documented at [code.claude.com/docs/en/plugins](https://code.claude.com/docs/en/plugins)) provides everything the v0.2.0 milestone requires:

| Requirement | Plugin System Support |
|---|---|
| Selective installation | `enabledPlugins` in settings.json, per-plugin enable/disable |
| Project-only (no global) | `--scope project` installs to `.claude/settings.json` |
| Convention packaging | Skills (`user-invocable: false`) + hooks (`hooks/hooks.json`) |
| Self-application | `--plugin-dir .` or `enabledPlugins` entry |
| Versioning | `plugin.json` version field, semver |
| Namespacing | Automatic `cckit:skill-name` prefix |
| Distribution | Plugin marketplace or `--plugin-dir` for local |

A custom Deno installer would duplicate all of this and fight against Claude Code's expectations. The plugin system is the sanctioned mechanism for exactly this use case.

### What Changes from Original Milestone Description

| Original Plan | Revised Plan |
|---|---|
| Deno-based remote installer (`deno run https://...`) | Native plugin installation (`claude plugin install cckit@marketplace` or `--plugin-dir`) |
| Custom config file for selective convention installation | Convention skills with `disable-model-invocation: false` + `paths` frontmatter for targeting |
| Config file location and format | Standard `plugin.json` manifest + convention skills individually enableable |
| Convention "packages" as separate entities | Convention skills within the plugin's `skills/` directory |

### What Stays the Same

- Conventions researched and authored individually (phased)
- Technology-neutral and project-type-agnostic
- Self-applicable to cckit
- Deno runtime still used for existing tools (hash-sections.ts, schema-parser.ts)
- Existing skills (`/case`, `/consolidate`) and agents unchanged

---

## Component Architecture

### Directory Structure (cckit as Plugin)

cckit needs a `.claude-plugin/plugin.json` manifest to become a plugin. The existing directory structure maps almost directly to the plugin layout:

```
cckit/                              # Plugin root
├── .claude-plugin/
│   └── plugin.json                 # NEW: Plugin manifest
├── skills/
│   ├── case/                       # EXISTING: /cckit:case
│   │   ├── SKILL.md
│   │   ├── step-discuss.md
│   │   ├── step-finalize.md
│   │   └── step-init.md
│   ├── consolidate/                # EXISTING: /cckit:consolidate
│   │   └── SKILL.md
│   ├── commit-conventions/         # NEW: Convention skill
│   │   └── SKILL.md
│   ├── coding-conventions/         # NEW: Convention skill
│   │   └── SKILL.md
│   ├── test-conventions/           # NEW: Convention skill
│   │   └── SKILL.md
│   └── [other-conventions]/        # NEW: Future convention skills
│       └── SKILL.md
├── agents/                         # EXISTING: unchanged
│   ├── case-briefer.md
│   ├── case-validator.md
│   ├── e2e-flows.md
│   ├── spec-consolidator.md
│   └── spec-verifier.md
├── hooks/                          # NEW: Plugin hooks directory
│   └── hooks.json                  # Convention enforcement hooks
├── bin/                            # NEW: CLI tools exposed to Bash
│   └── (symlinks or wrappers)
├── tools/                          # EXISTING: Deno runtime tools
│   ├── hash-sections.ts
│   ├── schema-bootstrap.ts
│   └── schema-parser.ts
├── docs/                           # EXISTING: unchanged
├── directives/                     # EXISTING: can remain empty or hold raw content
├── tests/                          # EXISTING: unchanged
├── CLAUDE.md                       # EXISTING: project instructions
└── .claude/                        # EXISTING: cckit's own Claude Code settings
    ├── settings.json
    └── settings.local.json
```

### New Files Required

| File | Purpose | Priority |
|---|---|---|
| `.claude-plugin/plugin.json` | Plugin manifest -- makes cckit installable as a Claude Code plugin | Phase 1 (infrastructure) |
| `hooks/hooks.json` | Convention enforcement hooks (commit validation, etc.) | Phase 1 (infrastructure) |
| `skills/commit-conventions/SKILL.md` | Commit message conventions as background knowledge | Phase 2+ (individual conventions) |
| `skills/coding-conventions/SKILL.md` | Coding standards as background knowledge | Phase 2+ |
| `skills/[convention-name]/SKILL.md` | Each convention as a separate skill | Phase 2+ |

### Modified Files

| File | Change | Priority |
|---|---|---|
| `.claude/settings.local.json` | Add cckit self-reference in `enabledPlugins` for dogfooding | Phase 1 |
| `.gitignore` | No change needed -- `.claude/settings.local.json` already gitignored by Claude Code default behavior | -- |

### Unchanged Files

All existing skills, agents, tools, docs, and tests remain unchanged. The plugin manifest wraps them; it does not restructure them.

---

## Convention Skill Format

Conventions are skills with specific frontmatter patterns that distinguish them from action skills like `/case` and `/consolidate`.

### Convention Skill Template

```yaml
---
name: [convention-name]
description: >
  [Convention purpose]. Applies when [trigger conditions].
  Loaded automatically when Claude is [working with relevant files/tasks].
user-invocable: false
disable-model-invocation: false
paths: "**/*"
---

# [Convention Name]

[Convention content -- rules, standards, examples]
```

Key frontmatter differences from action skills:

| Field | Action Skill (`/case`) | Convention Skill |
|---|---|---|
| `user-invocable` | `true` (default) | `false` -- conventions are background knowledge, not commands |
| `disable-model-invocation` | `true` -- user triggers manually | `false` (default) -- Claude loads automatically when relevant |
| `paths` | not set | set to target relevant files (e.g., `"*.ts,*.js"` for coding conventions) |
| `allowed-tools` | extensive list | minimal or none -- conventions provide guidance, not tool access |

### Convention Categories Mapped to Skill + Hook

| Convention | Skill (guidance) | Hook (enforcement) | Notes |
|---|---|---|---|
| Commit | `skills/commit-conventions/SKILL.md` | `hooks/hooks.json` PreToolUse on `Bash(git commit*)` | Hook validates format; skill teaches style |
| Coding | `skills/coding-conventions/SKILL.md` | Optional PostToolUse linting | Skill is primary; hook optional |
| Documentation | `skills/doc-conventions/SKILL.md` | None | Pure guidance |
| Test | `skills/test-conventions/SKILL.md` | None | Pure guidance |
| Workflow | `skills/workflow-conventions/SKILL.md` | None | Pure guidance |
| Project structure | `skills/structure-conventions/SKILL.md` | None | Pure guidance |
| Security | `skills/security-conventions/SKILL.md` | Optional PreToolUse checks | Hook can block dangerous patterns |
| AI collaboration | `skills/ai-collab-conventions/SKILL.md` | None | Pure guidance |
| Release/versioning | `skills/release-conventions/SKILL.md` | None | Pure guidance |
| Error handling | `skills/error-conventions/SKILL.md` | None | Pure guidance |

### Selective Convention Installation

Claude Code's plugin system does not support enabling individual skills within a plugin. The plugin is either enabled or disabled as a whole. However, there are two mechanisms for selectivity:

**Mechanism 1: `paths` frontmatter.** Each convention skill specifies file patterns where it applies. A commit convention uses `paths: "**/*"` (always active). A coding convention might use `paths: "*.ts,*.tsx,*.js,*.jsx"`. Claude only loads the skill when working with matching files.

**Mechanism 2: `disable-model-invocation: true` per convention.** A convention skill with `disable-model-invocation: true` is never auto-loaded. The host project's CLAUDE.md can selectively reference it: "When writing code, load the cckit:coding-conventions skill." This is explicit opt-in.

**Mechanism 3 (if granularity needed): Multiple plugins.** If truly independent selection is required, cckit could be split into multiple plugins: `cckit-core` (skills + agents), `cckit-conventions-commit`, `cckit-conventions-coding`, etc. This is the nuclear option and should be deferred unless user demand warrants it.

**Recommendation:** Start with Mechanism 1 (paths-based auto-loading). All conventions ship in a single plugin. The `paths` field provides natural selectivity. If evidence shows users need granular enable/disable, evaluate Mechanism 3 later.

---

## Plugin Manifest Design

### `.claude-plugin/plugin.json`

```json
{
  "name": "cckit",
  "description": "Claude Code toolkit: behavioral quality standards as installable artifacts. Skills for case discovery (/case), spec consolidation (/consolidate), and project conventions.",
  "version": "0.2.0",
  "author": {
    "name": "syr"
  },
  "repository": "https://github.com/syr/cckit",
  "license": "MIT",
  "keywords": [
    "conventions",
    "quality",
    "case-discovery",
    "consolidation",
    "standards"
  ]
}
```

No custom component paths needed -- cckit already uses the default plugin directory names (`skills/`, `agents/`, `hooks/`).

### `hooks/hooks.json`

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(git commit*)",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/validate-commit-conventions.sh",
            "statusMessage": "Validating commit conventions..."
          }
        ]
      }
    ]
  }
}
```

Note: The existing `.claude/hooks/validate-commit-scope.sh` is cckit's **own** project hook (validates cckit's commit scopes). The `hooks/hooks.json` contains hooks that the **plugin distributes to host projects**. These are different concerns with different locations.

---

## Self-Application Pattern (Dogfooding)

### How cckit Uses Its Own Conventions

cckit should consume its own convention skills during development. There are two approaches:

**Approach A: `--plugin-dir .` flag (recommended for development)**

```bash
claude --plugin-dir .
```

This loads cckit as a plugin from the current directory. Convention skills become active, hooks fire. No permanent config change needed. Ideal for development sessions.

**Approach B: `enabledPlugins` in settings.local.json**

```json
{
  "enabledPlugins": {
    "cckit@local": true
  }
}
```

This approach requires the plugin to be "installed" which may not apply for the source directory itself. Approach A is cleaner.

**Approach C: Separate `.claude/skills/` symlinks (fallback)**

If plugin self-loading proves awkward, symlink convention skills into cckit's own `.claude/skills/`:

```bash
ln -s ../../skills/commit-conventions .claude/skills/commit-conventions
```

This makes conventions available without the plugin machinery, but duplicates the path and is fragile.

**Recommendation:** Use Approach A (`--plugin-dir .`) for development. Document it in CLAUDE.md or a startup script. This is the approach Claude Code's own docs recommend for plugin development.

### Interaction Between Plugin and Project Configs

When cckit is loaded as a plugin via `--plugin-dir .`:

| Source | What It Provides |
|---|---|
| `.claude/settings.json` | cckit project permissions, model, hooks (project-specific) |
| `.claude-plugin/plugin.json` | Plugin manifest -- identity, version |
| `skills/` | All skills (both action and convention) load as plugin skills |
| `agents/` | All agents load as plugin agents |
| `hooks/hooks.json` | Plugin hooks fire alongside project hooks |
| `CLAUDE.md` | Project instructions (loaded independently of plugin) |

There is no conflict. Project settings and plugin settings serve different purposes and merge cleanly per Claude Code's settings hierarchy.

---

## Data Flow: Convention Source to Host Project

```
1. Author writes convention
   └─> skills/[convention-name]/SKILL.md

2. Convention tested on cckit itself
   └─> claude --plugin-dir .
   └─> Verify skill loads, guidance applies, hooks fire

3. Plugin distributed
   └─> Option A: Marketplace (claude plugin install cckit@marketplace)
   └─> Option B: Local dir (claude --plugin-dir /path/to/cckit)
   └─> Option C: Git clone + --plugin-dir

4. Host project enables plugin
   └─> enabledPlugins: { "cckit@marketplace": true }
   └─> OR --plugin-dir flag

5. Claude Code loads plugin at session start
   └─> Skill descriptions enter context budget
   └─> Hooks registered for lifecycle events
   └─> Agents available for delegation

6. During session, Claude auto-loads convention skills
   └─> When working with files matching skill's `paths` pattern
   └─> Guidance applies to Claude's behavior
   └─> Hooks enforce rules automatically
```

---

## Integration Points Between New and Existing Components

### No-Change Components

| Component | Why Unchanged |
|---|---|
| `tools/hash-sections.ts` | Runtime tool, not a plugin component. Used by `/consolidate` skill internally. |
| `tools/schema-parser.ts` | Same -- internal tool. |
| `tools/schema-bootstrap.ts` | Same -- internal tool. |
| `agents/*.md` | Agent definitions already match plugin directory layout. No modification needed. |
| `skills/case/SKILL.md` | Already a valid plugin skill. Gets namespaced as `cckit:case`. |
| `skills/consolidate/SKILL.md` | Same. Gets namespaced as `cckit:consolidate`. |
| `docs/` | Documentation. Not a plugin component. |
| `CLAUDE.md` | Project-level instructions. Not distributed by plugin. |

### New-to-Existing Touchpoints

| New Component | Touches | Nature of Interaction |
|---|---|---|
| `.claude-plugin/plugin.json` | `skills/`, `agents/`, `hooks/` | Manifest wraps existing dirs. No file changes in those dirs. |
| `hooks/hooks.json` | Existing `.claude/hooks/validate-commit-scope.sh` | **No conflict.** Plugin hooks (`hooks/hooks.json`) and project hooks (`.claude/settings.json` hooks section) are independent. Plugin hooks apply to **host projects**. Project hooks apply to **cckit development**. |
| Convention skills | Existing action skills | Co-exist in `skills/` directory. Different frontmatter patterns (convention: `user-invocable: false`; action: `disable-model-invocation: true`). |
| `bin/` directory (future) | `tools/` directory | If Deno tools need to be exposed to host projects' Bash tool, symlinks or wrapper scripts in `bin/` can call tools from `tools/`. Not needed for v0.2.0 initial phases. |

### Naming Collision Prevention

When cckit is installed as a plugin, all skills get the `cckit:` namespace prefix:

| Skill | Standalone Name | Plugin Name |
|---|---|---|
| case | `/case` | `/cckit:case` |
| consolidate | `/consolidate` | `/cckit:consolidate` |
| commit-conventions | (not invocable) | Background knowledge, auto-loaded |
| coding-conventions | (not invocable) | Background knowledge, auto-loaded |

Convention skills with `user-invocable: false` never appear in the `/` menu and are never invoked by name. They only matter as background context.

---

## Scalability Considerations

| Concern | At 1-3 Conventions | At 10 Conventions | At 20+ Conventions |
|---|---|---|---|
| Skill description budget | Trivial. ~500 chars per convention, well within 8k default budget. | ~5k chars. Approaching default budget limit. May need `SLASH_COMMAND_TOOL_CHAR_BUDGET` increase. | Exceeds default budget. Consider splitting into multiple plugins or using `paths` to reduce active descriptions. |
| Session start time | Imperceptible. | Minimal. Skill loading is file reads. | Measurable if hooks are complex. Keep hooks lightweight. |
| Convention conflicts | None. Each convention covers a distinct domain. | Low risk. Review for overlapping guidance. | Higher risk. Need explicit precedence rules in convention content. |
| Plugin size | <100 KB | <500 KB | <1 MB. Still fine for plugin caching. |

---

## Build Order (Dependency-Respecting)

### Phase 1: Plugin Infrastructure (no conventions yet)

**Goal:** Make cckit installable as a Claude Code plugin without changing any existing functionality.

1. Create `.claude-plugin/plugin.json` manifest
2. Create empty `hooks/hooks.json` (valid JSON structure, no hooks yet)
3. Verify existing skills load correctly under plugin namespace (`cckit:case`, `cckit:consolidate`)
4. Verify existing agents are discoverable
5. Test self-application with `claude --plugin-dir .`
6. Document plugin usage in docs/

**Dependencies:** None. Pure additive.
**Risk:** LOW. Adding a manifest does not change existing behavior.

### Phase 2: First Convention (commit conventions)

**Goal:** Prove the convention-as-skill pattern works end-to-end.

1. Research commit convention content (Conventional Commits, scope rules, etc.)
2. Author `skills/commit-conventions/SKILL.md` with `user-invocable: false`
3. Create `hooks/validate-commit-conventions.sh` script
4. Wire script into `hooks/hooks.json`
5. Test on cckit itself (existing `.claude/hooks/validate-commit-scope.sh` should be subsumed or kept separate)
6. Verify convention loads as background knowledge in host project sessions

**Dependencies:** Phase 1 (plugin infrastructure).
**Risk:** LOW. Well-understood domain, clear enforcement via hooks.

### Phase 3+: Additional Conventions (incremental)

Each convention follows the same pattern:
1. Research the convention domain
2. Author `skills/[name]/SKILL.md`
3. Optionally add hooks to `hooks/hooks.json`
4. Test on cckit
5. Test on a separate host project

**Dependencies:** Phase 1. Each convention is independent of other conventions.
**Risk:** MEDIUM for conventions that need hooks (enforcement complexity). LOW for pure guidance conventions.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Custom Installer Script

**What:** Building a Deno script that copies files into `.claude/skills/`, modifies CLAUDE.md, or writes config files in the host project.
**Why bad:** Fights against Claude Code's plugin system. Creates maintenance burden for something Claude Code already does. Risk of corrupting host project's `.claude/` directory.
**Instead:** Use native plugin installation via `claude plugin install` or `--plugin-dir`.

### Anti-Pattern 2: Convention Config File

**What:** A `cckit.config.json` or `.cckit.yaml` that lists which conventions to enable.
**Why bad:** Claude Code already has `enabledPlugins` for plugin-level control and `paths` frontmatter for skill-level targeting. A custom config file is a parallel system that Claude Code doesn't know about.
**Instead:** Use `paths` frontmatter for per-convention targeting. If granular enable/disable is needed, use multiple smaller plugins.

### Anti-Pattern 3: Conventions as CLAUDE.md Fragments

**What:** Distributing conventions as text blocks that get appended to the host project's CLAUDE.md.
**Why bad:** CLAUDE.md is hand-edited and project-specific. Injecting toolkit content into it creates merge conflicts, staleness, and confusion about what's project-specific vs what's from the toolkit.
**Instead:** Use skills (`user-invocable: false`). Claude Code loads skill content into context separately from CLAUDE.md. No merging needed.

### Anti-Pattern 4: One Monolithic Convention Skill

**What:** A single `skills/all-conventions/SKILL.md` containing all conventions.
**Why bad:** Violates the "individually researched, added as phases" requirement. Cannot use `paths` for targeting. Always loads entire convention set into context.
**Instead:** One skill per convention domain. Lean, focused, independently targetable.

### Anti-Pattern 5: Restructuring Existing Directories

**What:** Moving `skills/` to `src/skills/`, adding custom paths in plugin.json, reorganizing agents.
**Why bad:** Breaks existing installations, adds config complexity for zero benefit. The current layout already matches plugin conventions.
**Instead:** Add the manifest around the existing structure. The plugin system auto-discovers `skills/`, `agents/`, `hooks/` at the plugin root.

---

## Patterns to Follow

### Pattern 1: Guidance + Enforcement Separation

**What:** Every enforced convention has two components: a skill (teaches the "why" and "how") and a hook (prevents violations). The skill makes Claude do it right. The hook catches mistakes.
**When:** Conventions where violations are mechanically detectable (commit format, file naming, import patterns).
**Example:**
```
skills/commit-conventions/SKILL.md   -- Teaches commit style
hooks/hooks.json                     -- Blocks malformed commits
```

### Pattern 2: Progressive Convention Loading

**What:** Use `paths` frontmatter so conventions only load when Claude is working with relevant files. A test convention loads when editing test files. A coding convention loads when editing source files.
**When:** Always. Keeps context budget lean.
**Example:**
```yaml
---
name: test-conventions
paths: "**/*_test.*,**/*.test.*,**/*.spec.*,**/tests/**"
user-invocable: false
---
```

### Pattern 3: Self-Contained Convention Skills

**What:** Each convention skill contains all its rules in the SKILL.md body. No external references to CLAUDE.md, no "see docs/CONVENTIONS.md" pointers. The skill IS the convention.
**When:** Always. Skills must work when installed in arbitrary host projects that don't have cckit's docs/ directory.

### Pattern 4: Technology-Neutral Convention Framing

**What:** Convention content uses structural language, not technology-specific instructions. "Functions should do one thing" not "React components should have one responsibility." Host project's CLAUDE.md provides the technology context.
**When:** Always. Per cckit's core constraint of project-type agnosticism.

---

## Open Questions

### Q1: Plugin Marketplace vs Direct Installation

cckit could be distributed via:
- **Official Anthropic marketplace** -- widest reach, requires submission approval
- **Custom/team marketplace** -- self-hosted, immediate
- **Git clone + `--plugin-dir`** -- simplest, no marketplace needed
- **GitHub release + `--plugin-dir`** -- versioned, no marketplace needed

The marketplace question does not affect architecture (the plugin structure is the same regardless). It can be deferred to post-implementation.

### Q2: Existing `.claude/hooks/validate-commit-scope.sh` Overlap

cckit currently has a project-specific commit scope validator in `.claude/hooks/`. The new plugin hooks will include a convention commit validator in `hooks/hooks.json`. When running with `--plugin-dir .`, both fire. They should be compatible (project hook checks cckit-specific scopes; plugin hook checks general commit format). Verify during Phase 2.

### Q3: Convention Skill Size Limits

Claude Code's skill description budget defaults to 8k chars (1% of context). With 10+ convention skills, descriptions alone approach this limit. Monitor during convention authoring. If needed, trim descriptions aggressively (250 char max per skill) or increase `SLASH_COMMAND_TOOL_CHAR_BUDGET`.

### Q4: Existing `directives/` Directory Role

The `directives/` directory is currently empty. With conventions now implemented as skills, `directives/` may be unnecessary. Options:
- **Remove it** -- conventions are skills, not a separate artifact type
- **Keep as raw content** -- store convention research/source material here, compiled into skills
- **Repurpose** -- use for non-skill content like `.claude/rules/*.md` files if ever needed

Recommendation: Keep for now, decide after first conventions are authored.

---

## Sources

- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills) -- Skill format, frontmatter fields, `user-invocable`, `paths`, `disable-model-invocation`
- [Claude Code Plugins Documentation](https://code.claude.com/docs/en/plugins) -- Plugin structure, manifest, distribution
- [Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference) -- Complete manifest schema, directory layout, `bin/`, `hooks/hooks.json`, environment variables
- [Claude Code Hooks Documentation](https://code.claude.com/docs/en/hooks) -- Hook lifecycle events, handler types, settings.json format
- [Claude Code Subagents Documentation](https://code.claude.com/docs/en/sub-agents) -- Agent markdown format, frontmatter fields
- [Claude Code Settings Documentation](https://code.claude.com/docs/en/settings) -- Settings hierarchy, scopes, `enabledPlugins`
- [Deno Run Documentation](https://docs.deno.com/runtime/reference/cli/run/) -- URL execution pattern (evaluated and rejected in favor of native plugins)
- cckit codebase analysis: skills/, agents/, tools/, .claude/, CLAUDE.md, docs/STACK.md, docs/MODEL.md
