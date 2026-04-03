# Project Research Summary

**Project:** cckit (Claude Code Toolkit)
**Domain:** v0.2.0 Portable Conventions -- convention packaging and distribution for Claude Code
**Researched:** 2026-04-03
**Confidence:** HIGH (all research grounded in official Claude Code plugin docs, Deno stdlib verification, and ecosystem analysis)

## Executive Summary

The v0.2.0 milestone adds a convention distribution system to cckit: packaging behavioral rules (commit style, coding standards, test conventions, etc.) and installing them into host projects where Claude Code consumes them. The ecosystem survey reveals that cckit's model is "file copy with selective activation" -- closest to EditorConfig/GNU Stow patterns, not ESLint-style runtime config composition. Convention artifacts are markdown files that Claude Code reads as-is from `.claude/rules/` or as skills. There is no merge engine and the research unanimously recommends not building one.

The critical finding is a fundamental architectural disagreement between researchers. STACK.md designed a custom Deno installer script (`deno run https://...`) using `@std/jsonc`, `@std/fs`, `@std/path`, and `@std/cli` to copy convention files into host projects. ARCHITECTURE.md discovered Claude Code's native plugin system (`.claude-plugin/plugin.json`, namespaced skills, hooks, `claude plugin install`) and argues it makes the custom installer unnecessary -- conventions become skills with `user-invocable: false` inside a standard plugin. **This synthesis recommends the native plugin approach** (see "Key Conflict Resolution" below), which eliminates the installer script, the JSONC config file, and the file-copy machinery entirely. The Deno stdlib additions from STACK.md are not needed for the distribution mechanism, though Deno remains the runtime for existing tools (hash-sections.ts, schema-parser.ts).

The primary risks are: (1) technology bias creeping into convention content -- cckit's recurring problem, now amplified because conventions directly prescribe behavior; (2) convention bloat that consumes Claude Code's context budget without improving output quality; and (3) the plugin system's lack of per-skill enable/disable, which means selective convention installation requires either `paths`-based auto-loading or splitting into multiple plugins. All three are manageable with the prevention strategies identified in PITFALLS.md.

## Key Conflict Resolution: Native Plugin vs Custom Installer

The researchers produced incompatible recommendations for the distribution mechanism. This must be resolved before roadmap creation.

### Option A: Custom Deno Installer (STACK.md)

Build `tools/install.ts` that reads a `.cckit.jsonc` config, selectively copies convention files from cckit into the host project's `.claude/` directory. Remote execution via `deno run https://raw.githubusercontent.com/.../install.ts`. Stack additions: `@std/jsonc`, `@std/fs`, `@std/path`, `@std/cli`.

| Strength | Weakness |
|----------|----------|
| Full control over installation behavior | Duplicates what Claude Code's plugin system already does |
| Selective per-convention installation via config | Requires host to have Deno installed (user-facing dependency) |
| Dry-run, conflict detection, atomic install | Maintenance burden for edge cases (Windows paths, permissions, partial install) |
| Self-documenting JSONC config | Creates a parallel config surface alongside Claude Code's settings |
| Works without Claude Code plugin infrastructure | Files are copies, not plugin-managed -- no namespace, no hooks integration |

### Option B: Native Claude Code Plugin (ARCHITECTURE.md)

Add `.claude-plugin/plugin.json` manifest to cckit. Conventions become skills (`user-invocable: false`) inside the existing `skills/` directory. Hooks provide enforcement via `hooks/hooks.json`. Distribution via `claude plugin install`, `--plugin-dir`, or marketplace.

| Strength | Weakness |
|----------|----------|
| Zero custom installer code to write or maintain | No per-skill enable/disable within a single plugin |
| Automatic namespacing (`cckit:case`, `cckit:consolidate`) | Plugin system is newer, documentation may evolve |
| Hooks integrate with Claude Code's lifecycle events | Marketplace submission may require approval |
| Settings hierarchy handles scoping (user/project/local) | `--plugin-dir` requires local clone (no single-URL install) |
| Self-application via `claude --plugin-dir .` is trivial | Skill description budget (8k chars default) limits convention count |
| Existing directory structure already matches plugin layout | Path-based selectivity is coarser than per-convention config |

### Recommendation: Native Plugin (Option B)

**Use Claude Code's native plugin system. Do not build a custom installer.**

Rationale:
1. **cckit already has the directory structure of a plugin.** Adding `plugin.json` is additive; building an installer is new infrastructure.
2. **The installer script is the highest-risk component.** PITFALLS.md dedicated its two most severe critical pitfalls to installer edge cases (Pitfall 2: cross-platform failures, Pitfall 11: remote script caching). Eliminating the installer eliminates these pitfalls entirely.
3. **Convention-as-skill is architecturally cleaner** than convention-as-copied-file. Skills get namespacing, lifecycle integration, and context budget management from Claude Code. Copied files are inert.
4. **The JSONC config becomes unnecessary.** Convention selectivity is handled by `paths` frontmatter (auto-loading by file pattern) and Claude Code's existing settings hierarchy. No second config surface.
5. **The Deno stdlib additions (`@std/jsonc`, `@std/fs`, `@std/path`, `@std/cli`) are not needed.** This keeps the dependency footprint unchanged from v0.1.0.

**What is lost:** The `deno run https://...` single-command remote install experience. Mitigation: `claude plugin install` is the equivalent UX in the plugin world. For users without marketplace access, `git clone` + `claude --plugin-dir /path/to/cckit` works. A thin shell script wrapping the clone + plugin-dir setup could replace the Deno installer at a fraction of the complexity.

**When to reconsider:** If Claude Code's plugin system proves too limiting (no per-skill toggles, budget exhaustion at 10+ conventions, marketplace not available), a lightweight installer focused solely on selective convention copying can be built later. The convention content (SKILL.md files) is the same regardless of distribution mechanism.

## Key Findings

### Recommended Stack

No new dependencies needed. The entire v0.2.0 change happens in plugin metadata and skill content.

**Core technologies (unchanged from v0.1.0):**
- **Deno >= 2.7**: Runtime for hash-sections.ts, schema-parser.ts, schema-bootstrap.ts -- unchanged
- **unified 11 + remark-parse 11**: Markdown AST -- unchanged, not used by convention system
- **SKILL.md + Agent .md**: Plugin format for skills and agents -- conventions use the same format
- **Claude Code plugin system**: NEW usage, not a new dependency -- `.claude-plugin/plugin.json` manifest, `hooks/hooks.json`

**What to add:**
- `.claude-plugin/plugin.json` -- plugin manifest (single JSON file)
- `hooks/hooks.json` -- convention enforcement hooks
- `skills/[convention-name]/SKILL.md` -- one per convention type

**What NOT to add:**
- `@std/jsonc`, `@std/fs`, `@std/path`, `@std/cli` -- not needed without installer script
- `.cckit.jsonc` config file -- not needed with plugin system
- `tools/install.ts` -- not needed
- Template engines, schema validators, color libraries -- explicitly rejected

### Expected Features

**Must have (table stakes):**
- Convention packaging as skills with `user-invocable: false` (T4)
- Plugin manifest making cckit installable via `claude plugin install` (T2)
- Correct placement in Claude Code's discovery paths (skills/, hooks/) (T1)
- Technology-neutral convention content passing universality test (T4)
- Self-application via `claude --plugin-dir .` for dogfooding (D1)

**Should have (differentiators):**
- Convention catalog (`--list` equivalent via skill descriptions)
- Hooks for enforceable conventions (commit format validation)
- Version tracking in `plugin.json`
- Convention dependency recommendations in skill descriptions (D3)
- Unified artifact installation -- skills, agents, conventions all in one plugin (D6)

**Defer (v2+):**
- Per-convention enable/disable (requires multiple plugins or plugin system evolution)
- Convention uninstall mechanism (plugin system handles this)
- Convention versioning with semantic behavioral change tracking (D2)
- Convention update diffing
- Self-applicable exclusion system (D1 full implementation -- start with manual testing)

### Architecture Approach

cckit becomes a Claude Code plugin by adding a `.claude-plugin/plugin.json` manifest. The existing `skills/` and `agents/` directories are auto-discovered by the plugin system. Conventions are new skills with `user-invocable: false` and `disable-model-invocation: false`, meaning Claude loads them automatically as background knowledge when working with files matching the skill's `paths` pattern. Enforceable conventions (commit format) pair a guidance skill with a hook in `hooks/hooks.json`. The existing skills (`/case`, `/consolidate`) become `cckit:case` and `cckit:consolidate` under plugin namespacing.

**Major components:**
1. **Plugin manifest** (`.claude-plugin/plugin.json`) -- identity, version, makes cckit installable
2. **Convention skills** (`skills/[name]/SKILL.md`) -- behavioral directives, one per convention domain
3. **Enforcement hooks** (`hooks/hooks.json`) -- lifecycle hooks for mechanically verifiable conventions
4. **Existing skills** (`skills/case/`, `skills/consolidate/`) -- unchanged, gain namespace prefix
5. **Existing agents** (`agents/*.md`) -- unchanged, discovered by plugin system

### Critical Pitfalls

1. **Technology bias in convention content** -- cckit's recurring problem. Every convention line must pass: "Could a Rust CLI, Go API, Python ML pipeline, Swift iOS app, and documentation site all follow this?" Prevention: universality checklist applied per convention line, structural directives not tooling directives.

2. **Convention bloat consuming context budget** -- Claude Code's skill description budget defaults to 8k chars. At 10+ conventions (~500 chars each), descriptions alone approach the limit. Prevention: aggressive description trimming (250 char max), `paths`-based targeting so irrelevant conventions do not load, monitor budget during authoring.

3. **Config complexity creep** -- Temptation to add per-convention options, custom scoping, override mechanisms. Prevention: zero-config default (all conventions active via `paths`), no custom config file, rely on Claude Code's existing settings.

4. **Self-application circularity** -- cckit's CLAUDE.md already has conventions that overlap with convention skills. Prevention: layered precedence (CLAUDE.md wins), self-application test as gate before shipping each convention.

5. **Convention interaction effects** -- Individual conventions work; combinations produce unexpected behavior (20-line function limit + comprehensive test requirement = 200-line test files). Prevention: bundle testing after 3+ conventions exist, scope annotations in convention content.

## Implications for Roadmap

### Phase 1: Plugin Infrastructure

**Rationale:** Everything downstream depends on cckit being a valid Claude Code plugin. This is purely additive -- no existing functionality changes.
**Delivers:** `.claude-plugin/plugin.json`, empty `hooks/hooks.json`, verification that existing skills/agents work under plugin namespace (`cckit:case`, `cckit:consolidate`), self-application with `--plugin-dir .`
**Addresses:** T2 (distribution mechanism), D1 (self-applicable foundation), D6 (unified artifact installation)
**Avoids:** Pitfall 2 (installer edge cases -- eliminated entirely), Pitfall 1 (config complexity -- no config file needed)

### Phase 2: First Convention -- Commit Conventions

**Rationale:** Commit conventions are the most universally applicable, the most mechanically enforceable (hook validates format), and cckit already has a commit convention in CLAUDE.md to validate against. Proves the skill + hook pattern end-to-end.
**Delivers:** `skills/commit-conventions/SKILL.md`, commit validation hook in `hooks/hooks.json`, tested on cckit itself
**Addresses:** T4 (convention packaging), T1 (correct placement)
**Avoids:** Pitfall 3 (tech bias -- commit conventions are naturally language-agnostic), Pitfall 7 (style guide bloat -- commit conventions are inherently concise)

### Phase 3: Second Convention -- Coding Conventions

**Rationale:** Coding conventions are where technology bias is hardest to avoid. Doing this second (not first) means the convention authoring pattern is already proven, so focus is entirely on content quality. Also tests `paths`-based targeting (coding conventions should load for source files, not documentation).
**Delivers:** `skills/coding-conventions/SKILL.md` with `paths` targeting source files, tested on cckit and one external project
**Addresses:** T4 (convention packaging), Pitfall 3 (technology neutrality -- this convention is the hardest test)
**Avoids:** Pitfall 7 (style guide bloat -- 200-line budget enforced)

### Phase 4: Additional Conventions (Batch)

**Rationale:** After the skill + hook pattern is proven and the technology-neutral authoring discipline is established, remaining conventions follow the same template. These are independent of each other and can be authored in any order.
**Delivers:** Convention skills for test, documentation, workflow, project structure, security, error handling (subset based on priority)
**Addresses:** Full convention catalog, D4 (convention descriptions)
**Avoids:** Pitfall 10 (interaction effects -- test combinations after 3+ conventions exist)

### Phase 5: Polish and Distribution

**Rationale:** Distribution details (marketplace, versioning, update strategy) only matter after conventions exist and are proven useful.
**Delivers:** Plugin marketplace submission (if available), version tracking, documentation, migration guide for manual-install users
**Addresses:** D2 (versioning), D5 (uninstall -- handled by plugin system)
**Avoids:** Pitfall 5 (versioning discipline -- define "breaking" for conventions before publishing)

### Phase Ordering Rationale

- **Phase 1 before everything:** Cannot author conventions without the plugin scaffold to test them in.
- **Phase 2 before Phase 3:** Commit conventions are simpler (language-agnostic, short, enforceable). Prove the pattern on easy ground before tackling coding conventions where technology bias is the primary risk.
- **Phase 3 before Phase 4:** Coding conventions are the hardest technology-neutrality test. If they pass, remaining conventions follow the same discipline.
- **Phase 4 conventions are independent:** No ordering dependencies between test, docs, workflow, security conventions. Can be prioritized by user demand.
- **Phase 5 last:** Distribution polish only matters after there is something worth distributing.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** Convention-as-skill pattern needs concrete examples validated against Claude Code's skill loading behavior. How does `user-invocable: false` interact with `paths` targeting? Does the full SKILL.md body load or just the description?
- **Phase 3:** Technology-neutral coding conventions require surveying what structural coding principles are truly universal. Research should produce a candidate list before authoring begins.

Phases with standard patterns (skip research):
- **Phase 1:** Plugin manifest format is documented in Claude Code's official plugin reference. Straightforward file creation.
- **Phase 4:** Each convention follows the Phase 2/3 template. Authoring is the work, not design.
- **Phase 5:** Marketplace submission is a documentation/process task, not a technical design problem.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | No new dependencies. Existing stack confirmed unchanged. STACK.md's installer additions rejected in favor of native plugin system. |
| Features | HIGH | Clear table stakes / differentiator / anti-feature separation. Ecosystem survey well-grounded in ESLint, Prettier, Stow, chezmoi patterns. |
| Architecture | HIGH | Native plugin system documented in official Claude Code docs. Existing cckit directory structure already matches plugin layout. |
| Pitfalls | HIGH | All pitfalls derived from codebase analysis and ecosystem experience. Installer pitfalls (2, 11) eliminated by architectural choice. |

**Overall confidence:** HIGH

### Gaps to Address

- **Skill loading behavior for `user-invocable: false` conventions:** ARCHITECTURE.md describes the `paths` + `disable-model-invocation` pattern, but the exact context budget behavior (does Claude load full SKILL.md or just description?) needs validation during Phase 1. If full body loads for all matching skills, budget exhaustion is a real risk.

- **Plugin system per-skill selectivity:** Claude Code's plugin system enables/disables plugins as a whole, not individual skills. If a user wants commit conventions but not coding conventions, the current answer is `paths` targeting (coding conventions only load for source files). If that is insufficient, the fallback is multiple smaller plugins. This needs user testing to determine if it is a real problem.

- **Hook behavior in plugin context:** ARCHITECTURE.md describes `hooks/hooks.json` for enforcement, but the interaction between plugin hooks and project hooks (cckit already has `.claude/hooks/validate-commit-scope.sh`) needs testing. Both should fire without conflict, but this is unverified.

- **Marketplace availability timeline:** If the Claude Code plugin marketplace is not available or requires approval, distribution falls back to `git clone` + `--plugin-dir`. This is functional but less ergonomic than `deno run https://...`. The UX gap may need a thin wrapper script.

- **`directives/` directory purpose:** Currently empty. Conventions are now skills, not directives. Decision needed: remove, repurpose as raw research material, or keep empty. Low priority.

## Sources

### Primary (HIGH confidence)
- [Claude Code Plugins Documentation](https://code.claude.com/docs/en/plugins) -- plugin structure, manifest, distribution, `--plugin-dir`
- [Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference) -- complete manifest schema, `hooks/hooks.json`, `bin/`, environment variables
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills) -- skill format, `user-invocable`, `paths`, `disable-model-invocation`
- [Claude Code Hooks Documentation](https://code.claude.com/docs/en/hooks) -- hook lifecycle, handler types
- [Claude Code Settings Documentation](https://code.claude.com/docs/en/settings) -- settings hierarchy, `enabledPlugins`
- [@std/jsonc on JSR](https://jsr.io/@std/jsonc) -- v1.0.2 (evaluated, not adopted)
- [@std/fs on JSR](https://jsr.io/@std/fs) -- v1.0.23 (evaluated, not adopted)
- [@std/path on JSR](https://jsr.io/@std/path) -- v1.1.4 (evaluated, not adopted)
- [@std/cli on JSR](https://jsr.io/@std/cli) -- v1.0.0 (evaluated, not adopted)
- [Deno Standard Library](https://docs.deno.com/runtime/fundamentals/standard_library/) -- stdlib overview

### Secondary (MEDIUM confidence)
- [ESLint Shareable Configs](https://eslint.org/docs/latest/extend/shareable-configs) -- distribution pattern analysis
- [Prettier Sharing Configurations](https://prettier.io/docs/sharing-configurations) -- minimal config model
- [GNU Stow](https://gist.github.com/andreibosco/cb8506780d0942a712fc) -- selective activation pattern
- [chezmoi](https://www.chezmoi.io/why-use-chezmoi/) -- dotfiles management patterns
- [EditorConfig](https://github.com/editorconfig/editorconfig/issues/456) -- file copy distribution model

### Tertiary (LOW confidence)
- Convention content quality at scale -- untested beyond theoretical analysis
- Plugin system behavior with 10+ skills -- budget exhaustion risk is inferred, not measured
- Marketplace availability and submission process -- not publicly documented

---
*Research completed: 2026-04-03*
*Ready for roadmap: yes*
