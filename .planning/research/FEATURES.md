# Feature Landscape: Portable Conventions

**Domain:** Convention distribution system for Claude Code toolkit
**Researched:** 2026-04-03
**Supersedes:** Previous FEATURES.md (2026-03-31, Universal Consolidation Model)
**Research mode:** Ecosystem

## The Distribution Problem

cckit currently ships skills (`/case`, `/consolidate`) and agents that are installed manually into host projects. The v0.2.0 milestone adds a new artifact type -- conventions -- covering coding style, workflow, documentation, commits, tests, project structure, security, AI collaboration, release/versioning, and error handling. These conventions need a distribution mechanism: packaging, selective installation, and configuration.

The question is not "how do we build another ESLint" but rather "how do convention distribution systems work, and which patterns apply to distributing markdown-based behavioral directives into `.claude/` folders?"

## Ecosystem Patterns Surveyed

Before defining features, here is what the ecosystem does. Every successful convention distribution system shares the same core anatomy, though implementations differ.

### Pattern 1: Shareable Config (ESLint, Prettier, Stylelint, Commitlint)

**Mechanism:** Convention is an npm package. Users install it, then reference it via `extends` in their local config. The tool merges the shared config with local overrides at runtime.

**Key properties:**
- Package naming convention enables discovery (e.g., `eslint-config-*`, `@scope/eslint-config`)
- Composition via `extends` array -- configs chain recursively
- Local overrides always win (last-write-wins or explicit override)
- Runtime resolution -- the tool reads the config at execution time, not at install time
- ESLint's 2025 flat config evolution added `defineConfig()` for type-safe composition

**Relevance to cckit:** Claude Code loads `.claude/rules/*.md` at session start. This is analogous to ESLint loading config at lint time. cckit conventions are the "shareable config" and the `.claude/rules/` directory is the "extends target." The key difference: ESLint configs are JSON/JS objects merged programmatically. cckit conventions are markdown files loaded by Claude Code as-is -- no merge engine exists. Each file is atomic.

### Pattern 2: File Copy / Scaffold (EditorConfig, Yeoman, degit)

**Mechanism:** Convention is a file that gets copied into the project. No runtime resolution -- the file IS the convention.

**Key properties:**
- `.editorconfig` is dropped into the repo root; editors read it directly
- Yeoman/degit copy template files into a project during scaffolding
- No composition -- the file is the complete convention
- Updates require re-running the scaffolder or manually updating the file
- EditorConfig supports directory hierarchy (child overrides parent) but not cross-project sharing via packages

**Relevance to cckit:** This is the closest match to cckit's situation. Conventions are markdown files that get copied into `.claude/rules/`, `.claude/skills/`, or project root. There is no runtime merge -- Claude Code reads each file independently. The installer's job is to copy the right files to the right places.

### Pattern 3: Dotfiles Manager (chezmoi, GNU Stow)

**Mechanism:** A source-of-truth repo contains all config files. A manager tool creates symlinks or copies to target locations, with selective activation per machine/project.

**Key properties:**
- chezmoi: template-based (handles machine-specific differences), supports secrets, full file encryption
- GNU Stow: symlink farm -- "packages" are directories, you stow/unstow what you need
- Both support selective adoption: install only the conventions you want
- Stow's model is particularly relevant: each convention is a "package" (directory), and you choose which to activate

**Relevance to cckit:** The Stow model maps directly. Each convention type (coding, workflow, commit, etc.) is a "package." The installer selectively copies chosen packages to the host project's `.claude/` directory. No symlinks needed -- cckit conventions are installed as copies so they work without cckit being present.

### Pattern 4: Git Hooks Distribution (Husky, lint-staged)

**Mechanism:** Convention enforcement via git hooks, distributed through version control.

**Key properties:**
- Husky stores hooks in `.husky/` (tracked), configures git to look there
- `prepare` script auto-installs hooks on `npm install`
- Hooks enforce conventions at commit/push time (not just document them)
- lint-staged limits enforcement scope to staged files only

**Relevance to cckit:** cckit conventions are behavioral directives for Claude Code, not enforcement hooks. However, some convention types (commit conventions) could optionally include a commitlint config or hook alongside the Claude directive. This is a differentiator, not table stakes.

## Key Insight: cckit's Distribution is "File Copy with Selective Activation"

After surveying the ecosystem, cckit's model is closest to **Pattern 2 (file copy) with Pattern 3's selective activation (Stow)**. The convention artifacts are markdown files. The installer copies selected files to the host project. There is no runtime merge engine -- Claude Code reads each file as-is.

This is simpler than ESLint-style config composition. It is also more limited -- you cannot "extend" a convention with local overrides at the file level. But this matches how Claude Code works: each `.claude/rules/` file is an independent instruction set.

## Table Stakes

Features users expect. Missing = convention distribution system feels broken or useless.

### T1: Selective Installation

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| Choose which convention types to install | Every convention ecosystem supports selective adoption. Installing ALL conventions when you only want commit + coding is hostile. ESLint lets you pick configs; Stow lets you pick packages; chezmoi lets you pick targets. | Med | Config system (T3) |
| Per-type granularity | Convention types (coding, workflow, commit, test, etc.) are the selection unit. Not per-file -- too granular. Not all-or-nothing -- too coarse. | Low | Convention packaging structure |
| Install to correct `.claude/` subdirectory | Conventions must land in the right place: rules go to `.claude/rules/`, skills go to `.claude/skills/`. Wrong placement = convention not loaded by Claude Code. | Low | Knowledge of Claude Code directory structure |
| Overwrite protection | If a file already exists in the target, warn before overwriting. ESLint prompts; chezmoi uses diffs; Stow refuses conflicts. Silent overwrite destroys user customizations. | Low | File existence check |

**Complexity note:** The selection UX is the real complexity. The file copy is trivial. The config file that records what's selected (T3) is what makes this work across repeated installs.

### T2: Remote Execution

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| `deno run https://...` single-command install | PROJECT.md explicitly specifies this. Deno natively supports running remote modules with permissions. No pre-install step needed (unlike npm which requires `npm init` first). | Med | Deno runtime on host machine |
| Scoped permissions | Deno's security model requires explicit `--allow-read` and `--allow-write`. The installer should request only `.claude/` directory access, not full filesystem. Principle of least privilege. | Low | Deno permission flags |
| No global installation | PROJECT.md specifies "project-only (no global)." The installer writes to the current project's `.claude/` directory, never to `~/.claude/`. Global conventions are the user's responsibility. | Low | CWD-relative path resolution |
| Offline-capable after first run | Deno caches remote modules. After the first `deno run https://...`, the script should work offline (conventions bundled in the module, not fetched separately). | Med | Convention content bundled in installer module |

**Complexity note:** The Deno remote execution pattern is well-established. The real work is the installer logic, not the remote loading mechanism.

### T3: Config System

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| Settings file for convention selection | Every shareable config ecosystem uses a config file: `.eslintrc`, `.prettierrc`, `commitlint.config.js`, `.editorconfig`. cckit needs one too. Records which conventions are installed and any per-convention settings. | Med | Config format decision |
| Config file lives in project root or `.claude/` | Must be discoverable by the installer on subsequent runs. Recommended: `.claude/cckit.json` or `cckit.json` at project root. | Low | Path convention decision |
| Idempotent re-installation | Running the installer again with the same config should produce the same result. Already-installed conventions are not re-copied unless the source has changed. Idempotency is fundamental to every package manager (npm, apt, brew). | Med | Content hashing or version comparison |
| Config format: JSON | JSON is universal, parseable by Deno without dependencies, and understood by every developer. YAML requires a parser dependency. TOML is gaining ground but adds complexity for minimal gain. JSON's lack of comments is the only downside -- mitigated by keeping the config simple. | Low | None |

**Complexity note:** The config system's complexity scales with what it configures. Start minimal: `{ "conventions": ["coding", "commit", "workflow"] }`. Expand later if needed.

### T4: Convention Packaging Structure

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| Each convention type is a self-contained directory | Maps to Stow's "package" model. `conventions/coding/`, `conventions/commit/`, etc. Each directory contains the files that get installed. | Low | Directory structure convention |
| Manifest per convention | Each convention directory needs a manifest describing: what files it contains, where each file installs to (rules/, skills/, project root), and what the convention does. This is analogous to `package.json` in npm packages. | Med | Manifest format decision |
| Convention files are plain markdown | Conventions are `.md` files that Claude Code reads from `.claude/rules/`. No special format beyond what Claude Code already expects (optional YAML frontmatter for path scoping). | Low | Claude Code `.claude/rules/` format |
| Technology-neutral content | Per CLAUDE.md: every artifact must pass the neutrality test. Convention files must not assume a specific project type, language, or framework. This is an authoring constraint, not an installer feature. | N/A | CLAUDE.md conventions (already established) |

### T5: Dry Run / Preview

| Feature | Why Expected | Complexity | Dependencies |
|---------|--------------|------------|--------------|
| Show what will be installed before installing | Every package manager supports `--dry-run` or equivalent. `pip install --dry-run`, `npm pack --dry-run`, `git add -n`. Users need to see what files will be created/modified before committing to the installation. | Low | Installer logic (suppress write, print plan) |
| List files that would be created | Show full paths of files that will be written to `.claude/`. | Low | Path resolution logic |
| Flag files that would be overwritten | Highlight conflicts where a file already exists. | Low | File existence check |

## Differentiators

Features that set cckit apart from generic convention tools. Not expected, but valuable.

### D1: Self-Applicable Conventions

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| cckit uses its own convention system | "Eat your own dog food." cckit's CLAUDE.md conventions are installed via the same system it distributes to host projects. Proves the system works; catches design flaws early. | Med | Config system (T3), convention packaging (T4) |

**Why this matters:** ESLint uses its own rules internally. Prettier formats its own codebase. If cckit cannot use its own convention distribution for itself, something is wrong with the abstraction.

### D2: Convention Versioning

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| Version tracking per installed convention | Config file records which version of each convention was installed. On re-run, the installer can show what changed since last install. | Med | Config system (T3), version metadata in conventions |
| Update notification | When running the installer, show which conventions have newer versions available compared to what's installed. | Med | Version comparison logic |

**Why this matters:** Without versioning, users have no way to know if their installed conventions are stale. ESLint shareable configs use semver via npm. cckit can track versions in the config file without a package registry.

### D3: Convention Dependency Declaration

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| Convention A declares it recommends Convention B | Some conventions naturally pair: "commit" conventions reference "workflow" conventions. Rather than hard dependencies (which create coupling), use soft recommendations: "This convention works best alongside: workflow, documentation." | Low | Manifest metadata |

**Why this matters:** Commitlint configs extend other configs. ESLint configs can extend chains. cckit conventions are simpler (no runtime merge), but users benefit from knowing which conventions complement each other.

### D4: Convention Description / Catalog

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| `--list` flag shows all available conventions | Before installing, users want to browse what's available. Description, file count, what it covers. Analogous to `npm search` or ESLint's config inspector. | Low | Manifest metadata |
| Rich description per convention | Each convention has a one-paragraph description explaining what behavioral standards it installs. | Low | Manifest content |

### D5: Uninstall / Remove

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| Remove installed convention files | `deno run https://... --remove coding` deletes the files that were installed for the "coding" convention and updates the config file. | Med | Config system tracking installed files |
| Clean removal without orphans | Only remove files that cckit installed, never user-created files in `.claude/rules/`. The config file must track exactly which files cckit owns. | Med | File ownership tracking in config |

**Why this matters:** Every package manager supports uninstall. Without it, users must manually find and delete convention files -- error-prone and hostile.

### D6: Existing cckit Artifact Integration

| Feature | Value Proposition | Complexity | Dependencies |
|---------|-------------------|------------|--------------|
| Install skills and agents alongside conventions | cckit already has `/case` and `/consolidate` skills plus agents. The convention installer could optionally install these too, unifying all cckit artifact installation into one command. | Med | Existing skill/agent packaging |
| Single installer for all cckit artifacts | Instead of separate installation instructions for skills vs. conventions, one `deno run` command handles everything. | Med | Unified manifest system |

**Why this matters:** Users should not need two different installation processes for cckit artifacts. The convention installer is the natural place to unify this.

## Anti-Features

Features to explicitly NOT build.

### AF1: Runtime Convention Merging

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| ESLint-style runtime merge of convention files | Claude Code reads `.claude/rules/` files as-is. There is no merge engine and building one would mean reimplementing Claude Code's loading behavior. Convention composition should happen at authoring time, not install time. | Ship each convention as a complete, self-contained markdown file. No `extends` keyword, no merge syntax. |

**Ecosystem lesson:** ESLint's shareable config system is powerful but complex. The config cascade has caused years of user confusion (eslintrc vs flat config migration). Prettier explicitly chose "one config, override if you want" for simplicity. cckit should follow Prettier's model.

### AF2: Automatic Convention Updates

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Auto-updating conventions on every `deno run` | Auto-updates are hostile. They change behavioral directives without user consent, potentially altering how Claude Code behaves on their project mid-session. | Show available updates, let the user decide. `--update` flag for explicit opt-in. |

**Ecosystem lesson:** npm never auto-updates dependencies. brew does not auto-upgrade. Auto-update is universally considered an anti-pattern in developer tools because it breaks reproducibility.

### AF3: Convention Enforcement / Linting

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Building a linter that checks if code follows installed conventions | cckit distributes behavioral directives for Claude Code, not enforcement tools. The conventions tell Claude what to do -- Claude is the enforcement. Building a separate linter duplicates what Claude already does and violates cckit's role as a plugin platform, not a standalone tool. | Conventions are directives. Claude enforces them. If programmatic enforcement is needed (e.g., commitlint), recommend the established tool -- don't rebuild it. |

### AF4: GUI / Web Interface

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Web-based convention browser or config editor | Over-engineering for a CLI tool that installs markdown files. ESLint's config inspector is cool but ESLint has millions of users and hundreds of rules. cckit has ~10 convention types. | CLI `--list` flag with terminal-friendly output. |

### AF5: Template Variable Substitution

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Convention files with `{{projectName}}` placeholders that get filled at install time | Adds templating engine dependency. Convention files should work as-is for any project. If a convention needs to reference the project name, Claude can read it from CLAUDE.md/PROJECT.md at runtime. | Write conventions that are project-type agnostic by design (already a CLAUDE.md requirement). No runtime interpolation needed. |

**Ecosystem lesson:** chezmoi uses templates for machine-specific dotfile differences. cckit conventions are technology-neutral by design -- there should be nothing machine-specific or project-specific to template.

### AF6: Plugin System for Convention Types

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Third-party convention type registration | This is a personal toolkit, not an ecosystem platform. Adding a plugin API before having even 10 convention types is premature abstraction. | Hard-code the convention types. If someone wants custom types, they can fork or contribute. |

### AF7: Convention File Path Scoping at Install Time

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Installer modifies convention YAML frontmatter to scope to specific paths in the host project | This would require the installer to understand the host project's directory structure, violating technology neutrality. Path scoping is the host project's concern. | Ship conventions without path scoping. If a user wants to scope a convention to `src/backend/`, they add the frontmatter themselves after install. |

## Feature Dependencies

```
T1 (Selective Install) --> T3 (Config System)     [config records selections]
T1 (Selective Install) --> T4 (Convention Packaging) [need packaged conventions to select from]
T2 (Remote Execution)  --> T4 (Convention Packaging) [need something to install]
T3 (Config System)     --> T4 (Convention Packaging) [config references convention names]
T5 (Dry Run)           --> T1 (Selective Install)    [preview uses same selection logic]

D1 (Self-Applicable)   --> T1 + T3 + T4             [full system needed]
D2 (Versioning)        --> T3 (Config System)        [versions stored in config]
D5 (Uninstall)         --> T3 (Config System)        [config tracks installed files]
D6 (Artifact Integration) --> T2 + T4               [unified installer + manifest]
```

## MVP Recommendation

Build in this order based on dependencies:

**Phase 1 -- Infrastructure:**
1. T4: Convention packaging structure (directories, manifests)
2. T3: Config system (JSON file, convention selection)
3. T1: Selective installation (choose types, copy files, overwrite protection)
4. T2: Remote execution (`deno run https://...`)
5. T5: Dry run (low cost once T1 exists)

**Phase 2 -- First Convention:**
6. One convention type (coding or commit -- most universally useful) to validate the infrastructure end-to-end

**Phase 3 -- Differentiators (after infrastructure proves itself):**
7. D4: Convention catalog (`--list`)
8. D5: Uninstall (`--remove`)
9. D2: Version tracking

**Defer:**
- D1 (Self-Applicable): Apply after 2-3 conventions exist. Requires the system to be stable.
- D3 (Dependency Declaration): Add when convention inter-relationships become apparent through usage.
- D6 (Artifact Integration): Unify skill/agent/convention installation after convention installer is proven. Retrofitting existing skills into the manifest system is non-trivial.

## Sources

- [ESLint Shareable Configs](https://eslint.org/docs/latest/extend/shareable-configs) -- naming conventions, package structure, extends mechanism
- [Prettier Sharing Configurations](https://prettier.io/docs/sharing-configurations) -- minimal shareable config model
- [Commitlint Shareable Config](https://commitlint.js.org/concepts/shareable-config.html) -- extends chaining, naming pattern
- [Stylelint Config Standard](https://stylelint.io/user-guide/configure/) -- extends array, override pattern
- [ESLint Flat Config Extends](https://eslint.org/blog/2025/03/flat-config-extends-define-config-global-ignores/) -- 2025 evolution of config composition
- [Claude Code .claude Directory](https://code.claude.com/docs/en/claude-directory) -- rules/ auto-loading, skills/ placement
- [Claude Code Skills](https://code.claude.com/docs/en/skills) -- SKILL.md format, installation paths
- [Claude Code Rules](https://claudelog.com/faqs/what-are-claude-rules/) -- .claude/rules/ automatic loading, path scoping
- [Deno Run](https://docs.deno.com/runtime/reference/cli/run/) -- remote URL execution, permission flags
- [Deno Install](https://docs.deno.com/runtime/reference/cli/install/) -- script installer naming conventions
- [Deno Security](https://docs.deno.com/runtime/fundamentals/security/) -- permission model for scoped access
- [chezmoi](https://www.chezmoi.io/why-use-chezmoi/) -- template-based dotfiles, selective activation
- [GNU Stow](https://gist.github.com/andreibosco/cb8506780d0942a712fc) -- symlink farm, package-based selective install
- [Husky + lint-staged](https://dev.to/hkp22/automating-code-quality-git-hooks-husky-and-lint-staged-for-streamlined-linting-formatting-5ep4) -- git hooks distribution, enforcement pattern
- [EditorConfig Distribution](https://github.com/editorconfig/editorconfig/issues/456) -- file hierarchy model, no package distribution
- [ESLint Config Inspector](https://eslint.org/blog/2024/04/eslint-config-inspector/) -- visual config browsing
