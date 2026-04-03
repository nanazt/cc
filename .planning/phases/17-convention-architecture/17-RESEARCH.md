# Phase 17: Convention Architecture - Research

**Researched:** 2026-04-03
**Domain:** Convention file structure, authoring principles, Claude Code rules format
**Confidence:** HIGH

## Summary

Phase 17 produces a single architecture document (`docs/CONVENTIONS.md`) that defines how cckit conventions are structured, named, discovered, and installed. This phase creates no actual conventions -- it establishes the container format that all downstream phases (18-23) follow.

The critical technical finding is that conventions are Claude Code **rules** (`.claude/rules/*.md` files), not skills. Rules are passive behavioral guidance loaded into context automatically. The frontmatter format is minimal: only `description` and `paths` are standard fields. However, there is a significant operational caveat: the `paths` frontmatter has known bugs in Claude Code (issue #17204, still open as of 2026-03-30). The confirmed working format for path-scoped lazy loading requires `paths:` as a single unquoted CSV line plus `alwaysApply: false` -- not a YAML array. The architecture document must specify this exact format to prevent downstream convention authors from hitting silent failures.

The source structure uses a dedicated `conventions/` directory at project root with per-area subdirectories. Each area contains a `CONVENTION.md` (base, optional) and/or `{lang}.md` (language-specific). The installer (Phase 20) copies these to the host project's `.claude/rules/` with a `cckit-` prefix. No manifest file, no custom config format, no cckit-specific frontmatter fields.

**Primary recommendation:** Write `docs/CONVENTIONS.md` as a complete architecture specification covering source structure, naming rules, frontmatter format (with the working `paths` syntax), delta test definition, hook architecture, installer discovery contract, and installed file naming. Also update REQUIREMENTS.md per decision D-27.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Conventions are Claude Code Rules (installed to `.claude/rules/`), not Skills
- D-02: "Tech pack" terminology is retired. Use "language-specific convention"
- D-03: Conventions live in `conventions/` directory at project root, separate from `skills/`
- D-04: Base convention file is `CONVENTION.md`. Language-specific files are `{lang}.md` (e.g., `rust.md`, `typescript.md`)
- D-05: Directory naming is decided per-convention at creation time. Short, intuitive area name. Kebab-case for compound words only
- D-06: Source structure example provided (commit/, coding/, test/, error/ directories)
- D-07: Base conventions are optional. Only created when they pass the delta test
- D-08: When base exists, language-specific conventions are additive
- D-09: When base does not exist, language-specific conventions are standalone
- D-10: Within same convention, base and language-specific files are installed together. Across different areas, conventions are independent
- D-11: Convention frontmatter uses only Claude Code standard fields: `description` and `paths` (optional). Zero cckit-specific fields
- D-12: `paths` is optional. Omitted = convention always loads. Present = loads only for matching files
- D-13: `paths` values are defaults. Users can customize after installation
- D-14: No prescribed internal structure for convention files. The /convention skill determines optimal structure per convention area
- D-15: Delta test is embedded in the /convention skill's authoring process (Phase 18). No separate validation infrastructure
- D-16: Hooks live inside the convention directory they enforce
- D-17: Installer copies both rule files and hook scripts
- D-18: Installation via Deno remote script (milestone decision, confirmed)
- D-19: Installed files use `cckit-` prefix in host project
- D-20: Installer discovers conventions by scanning `conventions/` directory. No manifest file
- D-21: Self-application via `deno run tools/install.ts --self`
- D-22: Host project's CLAUDE.md always takes precedence over cckit rules (built-in Claude Code priority)
- D-23: No explicit size limit. Delta test naturally keeps conventions concise
- D-24: Existing convention content in CLAUDE.md will migrate to convention files
- D-25: Primary deliverable is `docs/CONVENTIONS.md`
- D-26: No `.claude-plugin/plugin.json` in v0.2.0
- D-27: REQUIREMENTS.md must be updated to reflect discussion outcomes

### Claude's Discretion
- Architecture document internal structure and presentation
- Convention directory names for future conventions

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ARCH-01 | Layered structure: base (`CONVENTION.md`) and language-specific (`{lang}.md`) in separate files within `conventions/{area}/`. Base is optional | Decisions D-03 through D-10 fully specify the source structure. Claude Code rules format supports this via independent files in `.claude/rules/` |
| ARCH-02 | Language-specific conventions named by language, discoverable by directory scan, opt-in via installer selection | Decision D-20 defines directory scan discovery. Installer naming convention (D-19: `cckit-` prefix) documented. No manifest needed |
| ARCH-03 | Delta test: conventions only teach what LLM doesn't already know or where user style diverges from defaults | Decision D-15 embeds delta test in /convention skill (Phase 18). Phase 17 defines the principle; Phase 18 implements it |
| ARCH-04 | When base exists, it stands alone with real value. If it cannot pass delta test, omit it | Decision D-07 makes base optional. Architecture document must specify the "skip base" pattern |
</phase_requirements>

## Standard Stack

### Core

No new libraries or tools are needed for Phase 17. The deliverable is a documentation artifact (`docs/CONVENTIONS.md`).

| Artifact | Format | Purpose | Why Standard |
|----------|--------|---------|--------------|
| `docs/CONVENTIONS.md` | Markdown | Architecture specification | Follows existing pattern (`docs/MODEL.md`, `docs/STACK.md`) |
| `.claude/rules/*.md` | Markdown + YAML frontmatter | Installed convention format | Claude Code native rules format |

### Supporting

| Technology | Version | Purpose | When to Use |
|------------|---------|---------|-------------|
| Claude Code rules | Current | Target format for conventions | Every convention file ends up as a `.claude/rules/` file in host projects |
| Deno | >= 2.7 | Installer runtime (Phase 20) | Architecture must account for installer discovery contract |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `.claude/rules/` (rules) | `.claude/skills/` (skills with `user-invocable: false`) | Research recommended skills; user decided rules. Rules are simpler -- no skill frontmatter complexity, no context budget competition with action skills |
| `conventions/` directory | Skills inside `skills/` directory | User decided clear separation -- conventions are behavioral guidance, skills are action workflows |
| Deno installer | Claude Code native plugin system | Research recommended plugins; user confirmed Deno installer. Plugin manifest deferred to post-v0.2.0 |

## Architecture Patterns

### Source Structure (cckit repository)

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

### Installed Structure (host project)

```
.claude/
+-- rules/
|   +-- cckit-commit.md            # base convention
|   +-- cckit-coding.md            # base convention
|   +-- cckit-coding-rust.md       # language-specific convention
|   +-- cckit-test.md              # base convention
|   +-- cckit-test-rust.md         # language-specific convention
|   +-- cckit-error-rust.md        # language-specific only
+-- hooks/
    +-- cckit-commit-validate.sh   # enforcement hook
```

### Pattern 1: Convention File Format (Rules)

**What:** Each convention file is a Claude Code rule with optional YAML frontmatter.
**When to use:** Every convention file follows this pattern.

Base convention (always loads):
```markdown
---
description: "Commit message format and quality standards for consistent version history"
---

# Commit Conventions

[convention content -- directives, not explanations]
```

Language-specific convention (loads for matching files):
```markdown
---
description: "Rust-specific coding conventions: idioms, patterns, clippy alignment"
paths: "**/*.rs"
alwaysApply: false
---

# Rust Coding Conventions

[convention content]
```

**Critical frontmatter note:** The `paths` field has known bugs in Claude Code (GitHub issue #17204, open as of 2026-03-30). The confirmed working format for path-scoped lazy loading requires ALL of:
1. `paths:` as a **single unquoted CSV line** (not a YAML array, not quoted)
2. `alwaysApply: false` explicitly set
3. Both fields together -- `paths:` alone still loads eagerly

Working format:
```yaml
---
description: "Rust coding conventions"
paths: **/*.rs
alwaysApply: false
---
```

Non-working formats (will silently fail or load eagerly):
```yaml
# BAD: YAML array -- does not lazy-load
paths:
  - "**/*.rs"

# BAD: quoted string -- does not load at all
paths: "**/*.rs"
```

Source: [GitHub issue #17204](https://github.com/anthropics/claude-code/issues/17204), confirmed by community testing with InstructionsLoaded hook audit (2026-03-20).

### Pattern 2: Naming Convention

**What:** Systematic naming maps source files to installed files.
**When to use:** Installer discovery and installation.

| Source File | Installed As | Rule |
|-------------|-------------|------|
| `conventions/commit/CONVENTION.md` | `.claude/rules/cckit-commit.md` | `cckit-{area}.md` |
| `conventions/coding/CONVENTION.md` | `.claude/rules/cckit-coding.md` | `cckit-{area}.md` |
| `conventions/coding/rust.md` | `.claude/rules/cckit-coding-rust.md` | `cckit-{area}-{lang}.md` |
| `conventions/error/rust.md` | `.claude/rules/cckit-error-rust.md` | `cckit-{area}-{lang}.md` |

Hooks follow a parallel pattern:
| Source File | Installed As |
|-------------|-------------|
| `conventions/commit/hooks/validate.sh` | `.claude/hooks/cckit-commit-validate.sh` |

### Pattern 3: Delta Test (Conceptual)

**What:** Each rule in a convention must pass: "Would Claude already do this without being told?" If yes, remove the rule.
**When to use:** During convention authoring (Phase 18 /convention skill).

This is not a runtime check or automated validation. It is an authoring discipline embedded in the /convention skill's generation process. The architecture document defines the principle; the skill implements it.

**Delta test criteria:**
1. **Default behavior test:** Ask Claude to perform the task without the convention loaded. Does it already follow the rule?
2. **Style divergence test:** Does the user want behavior that differs from Claude's default? (e.g., specific commit scope naming rules)
3. **Consistency test:** Would Claude's behavior vary across sessions without the rule? If yes, the rule adds value by making behavior consistent.

A convention that fails the delta test (all rules are things Claude already knows) should not be created. This is why base conventions are optional (D-07).

### Pattern 4: Hook Architecture

**What:** Enforceable conventions pair a rule file (guidance) with a hook script (enforcement).
**When to use:** Conventions where violations are mechanically detectable (commit format, file naming).

```
conventions/commit/
+-- CONVENTION.md           # Claude reads this as guidance
+-- hooks/
    +-- validate.sh         # Runs as PreToolUse hook on git commit
```

Hooks are shell scripts that receive JSON on stdin from Claude Code's hook system. They output a JSON response with `permissionDecision` (allow/deny) and `permissionDecisionReason`. The existing `.claude/hooks/validate-commit-scope.sh` in cckit is the reference implementation for this pattern.

Hook integration in host project requires the installer to update `.claude/settings.json` with the hook configuration, or the user to do it manually. Architecture document should specify this contract.

### Anti-Patterns to Avoid

- **Convention-as-skill:** Using `skills/` with `user-invocable: false` for conventions. Decided against -- rules are the correct mechanism for passive behavioral guidance.
- **Custom frontmatter fields:** Adding cckit-specific YAML fields like `type: convention` or `technology: rust`. Violates D-11. Convention files must be pure Claude Code rule files.
- **Manifest file:** Creating a `conventions.json` or similar registry. Violates D-20. Directory scan is the discovery mechanism.
- **Prescribed content structure:** Defining required sections/headings within convention files. Violates D-14. Each convention's internal structure is determined by the /convention skill.
- **Monolithic convention file:** One file with all conventions. Violates independence principle (D-10) and makes selective installation impossible.
- **Cross-convention references:** Convention A referencing Convention B. Violates independence (D-10). Each convention must be installable alone.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rule file format | Custom convention format | Claude Code `.claude/rules/` native format | Claude Code already knows how to load these. Custom formats require custom loaders |
| Path scoping | Custom path matching logic | Claude Code `paths` frontmatter (with working syntax) | Built into Claude Code. Document the working syntax to avoid known bugs |
| Precedence/override | Custom override mechanism | Claude Code's built-in priority (CLAUDE.md > rules) | D-22 explicitly relies on this |
| Convention discovery | Manifest file or registry | Directory scanning of `conventions/` | D-20. Simpler, no sync issues |
| Hook execution | Custom hook runner | Claude Code's PreToolUse/PostToolUse hook system | Already exists and works (cckit uses it for commit scope validation) |

**Key insight:** The architecture document defines conventions as pure Claude Code rules. No custom runtime, no custom format, no custom loader. The only custom element is the installer (Phase 20) that copies files from `conventions/` to `.claude/rules/` with the `cckit-` prefix.

## Common Pitfalls

### Pitfall 1: Silent Path Scoping Failures

**What goes wrong:** Convention files with `paths` frontmatter use the documented YAML array format, which does not work for lazy loading. Rules either load eagerly (wasting context) or not at all (convention ignored).
**Why it happens:** Official Claude Code docs show a format (`paths:` as YAML array) that has bugs. The working format (`paths:` as unquoted CSV + `alwaysApply: false`) is community-discovered.
**How to avoid:** Architecture document must specify the exact working frontmatter format. Include the non-working formats explicitly so downstream authors know what to avoid.
**Warning signs:** Convention loads at session start even for non-matching files. Or convention never loads despite working with matching files. Use `InstructionsLoaded` hook to audit.

### Pitfall 2: Technology Bias in Convention Content

**What goes wrong:** Convention rules assume specific languages, frameworks, or tools. "Use `const` by default" only makes sense in JavaScript/TypeScript.
**Why it happens:** Convention authors think in their own stack. This is cckit's most recurring problem (documented across v0.1.0 pitfalls).
**How to avoid:** Universality test per convention line: "Could a Rust CLI, Go API, Python ML pipeline, Swift iOS app, and documentation site all follow this?" Language-specific content goes in `{lang}.md` files, not in `CONVENTION.md`.
**Warning signs:** Convention contains language-specific syntax, framework names, tool names, file extension assumptions, or package manager references.

### Pitfall 3: Convention Bloat (Style Guide Syndrome)

**What goes wrong:** Convention file becomes a 500-line style guide with rationale, philosophy, and examples. Claude doesn't need persuasion -- it needs directives.
**Why it happens:** Authors write for human audiences instead of for an LLM.
**How to avoid:** Every line must be a directive ("Always X", "Never Y", "When Z, do W"). Rationale goes in docs/, not in the installed file. The delta test naturally keeps content concise by removing things Claude already knows.
**Warning signs:** Convention exceeds 200 lines. More than 30% of content is rationale. Examples outnumber rules.

### Pitfall 4: Research Recommendations vs User Decisions

**What goes wrong:** Phase 17 executor uses patterns from the research documents (ARCHITECTURE.md, SUMMARY.md) that were superseded by discussion decisions. For example, using skills format instead of rules, or creating a plugin manifest.
**Why it happens:** Research documents recommended different approaches than what the user decided.
**How to avoid:** CONTEXT.md decisions are authoritative. Research documents are background context only. Specifically: no plugin manifest (D-26), no skills for conventions (D-01), no config file (D-20), no tech pack terminology (D-02).
**Warning signs:** Architecture document references plugin.json, user-invocable: false, or tech packs.

### Pitfall 5: Description Field Uncertainty

**What goes wrong:** Convention files use `description` frontmatter field, but its behavior in `.claude/rules/` files is not clearly documented in official Claude Code docs (it is documented for skills and commands, but rules docs only show `paths`).
**Why it happens:** The `description` field is standard in skills but its behavior in rules is less documented.
**How to avoid:** Include `description` per D-11 (it is a Claude Code standard field) but do not rely on it for functional behavior (like discovery or matching). Use it as human-readable metadata. The community testing (issue #17204 comment from maxjeltes) shows `description` is present in working examples alongside `paths` and `alwaysApply: false`.
**Warning signs:** Architecture assumes `description` drives loading behavior when it may only serve as documentation.

## Code Examples

### Example 1: Base Convention File (Always-Loading)

```markdown
---
description: "Commit message format and quality standards"
---

# Commit Conventions

- Use Conventional Commits 1.0.0 format: type(scope): subject
- Scope must name a codebase noun (module, component, tool)
- Subject line under 72 characters
- Body explains why, not what
- [additional delta-test-passing rules]
```

Source: Derived from cckit's own CLAUDE.md commit conventions section and decision D-04.

### Example 2: Language-Specific Convention File (Path-Scoped)

```markdown
---
description: "Rust-specific coding conventions"
paths: **/*.rs
alwaysApply: false
---

# Rust Coding Conventions

- Prefer `&str` over `String` in function parameters
- Use `thiserror` for library error types, `anyhow` for application error types
- [additional Rust-specific rules that pass delta test]
```

Source: Decision D-04, D-12, and working frontmatter format from GitHub issue #17204.

### Example 3: Hook Script (Enforcement)

```bash
#!/bin/sh
# Validate commit message format
# Input: JSON on stdin with .tool_input.command
CMD=$(jq -r '.tool_input.command')

case "$CMD" in
  *git\ commit*) ;;
  *) exit 0 ;;
esac

# Extract and validate commit message format
# [validation logic]

if [ "$INVALID" = "true" ]; then
  cat <<'JSON'
{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Commit message does not follow convention format."}}
JSON
fi
exit 0
```

Source: Existing `.claude/hooks/validate-commit-scope.sh` in cckit repository.

### Example 4: Installer Discovery (Conceptual)

The installer discovers conventions by scanning the `conventions/` directory:

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

Source: Decisions D-19, D-20.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Conventions in CLAUDE.md | Conventions as `.claude/rules/` files | Claude Code rules feature (2025) | Modular, path-scopable, team-shareable |
| Skills with `user-invocable: false` | Rules in `.claude/rules/` | Phase 17 discussion (2026-04-03) | Simpler format, no skill budget competition |
| "Tech pack" terminology | "Language-specific convention" | Phase 17 discussion (2026-04-03) | Natural language, no jargon |
| Plugin manifest distribution | Deno installer script | Phase 17 discussion (confirmed) | Simpler for v0.2.0, plugin deferred |

**Deprecated/outdated (within this project):**
- Research recommendation to use Claude Code plugin system -- superseded by user decision D-26 (no plugin manifest in v0.2.0)
- Research recommendation to use skills for conventions -- superseded by user decision D-01 (rules, not skills)
- "Tech pack" terminology -- superseded by user decision D-02

## Open Questions

1. **`description` field behavior in rules**
   - What we know: Claude Code docs show `description` as a standard field for skills and commands. Community testing includes it in working rules frontmatter. Decision D-11 lists it as a standard field.
   - What's unclear: Whether `description` has any functional effect in `.claude/rules/` files (does Claude Code use it for anything, or is it pure documentation?).
   - Recommendation: Include `description` in convention files as specified by D-11. It serves as human-readable metadata regardless of Claude Code's use of it. Flag for validation when first convention is authored (Phase 19).

2. **Hook integration contract**
   - What we know: Hooks work via `.claude/settings.json` configuration (cckit already uses this for commit scope validation). Decision D-17 says installer copies hook scripts.
   - What's unclear: Does the installer need to modify the host project's `.claude/settings.json` to register hooks? Or does the user do this manually?
   - Recommendation: Architecture document should define the hook registration contract. The installer (Phase 20) implements it. For Phase 17, document both the script format and the settings.json configuration needed.

3. **`alwaysApply` field requirement**
   - What we know: Community testing (GitHub issue #17204) shows `alwaysApply: false` is required alongside `paths:` for lazy loading to work.
   - What's unclear: Whether this is a bug or intended behavior. Whether it will be fixed in future Claude Code versions.
   - Recommendation: Architecture document should specify `alwaysApply: false` as required for path-scoped conventions. Document it as a known Claude Code behavior. If fixed later, the field becomes harmless.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Deno test (built-in) |
| Config file | none (Deno test needs no config) |
| Quick run command | `deno test --allow-read --allow-write tools/` |
| Full suite command | `deno test --allow-read --allow-write tools/` |

### Phase Requirements to Test Map

Phase 17 is a documentation phase. Its deliverables are:
1. `docs/CONVENTIONS.md` -- architecture document
2. Updated `.planning/REQUIREMENTS.md` -- terminology and requirement adjustments

These are not testable via automated tests. Verification is structural review:

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ARCH-01 | Layered structure specified | manual-only | N/A -- review docs/CONVENTIONS.md for structure spec | N/A |
| ARCH-02 | Discovery rules specified | manual-only | N/A -- review docs/CONVENTIONS.md for discovery contract | N/A |
| ARCH-03 | Delta test defined | manual-only | N/A -- review docs/CONVENTIONS.md for delta test section | N/A |
| ARCH-04 | Base standalone value principle | manual-only | N/A -- review docs/CONVENTIONS.md for base optionality rules | N/A |

**Justification for manual-only:** Phase 17 produces specification documents, not code. Automated tests are not applicable. The architecture document's correctness is validated by downstream phases (18-23) successfully using it as their reference.

### Sampling Rate
- **Per task commit:** Structural review of document sections
- **Per wave merge:** Full document review against ARCH requirements
- **Phase gate:** All ARCH-01 through ARCH-04 addressed in document

### Wave 0 Gaps
None -- no automated test infrastructure needed for a documentation phase.

## Sources

### Primary (HIGH confidence)
- [Claude Code Memory Documentation](https://code.claude.com/docs/en/memory) -- `.claude/rules/` format, frontmatter, loading behavior, path scoping, symlink support
- [GitHub Issue #17204](https://github.com/anthropics/claude-code/issues/17204) -- Critical: `paths` frontmatter format bugs, confirmed working format (`paths:` CSV + `alwaysApply: false`)
- cckit CONTEXT.md (17-CONTEXT.md) -- 27 locked decisions from discuss phase
- cckit REQUIREMENTS.md -- ARCH-01 through ARCH-04 requirements
- Existing cckit codebase -- `.claude/hooks/validate-commit-scope.sh` (hook format reference), `docs/MODEL.md` and `docs/STACK.md` (architecture document pattern)

### Secondary (MEDIUM confidence)
- [Claude Code Rules Directory Guide](https://claudefa.st/blog/guide/mechanics/rules-directory) -- Rules format details, naming conventions
- `.planning/research/ARCHITECTURE.md` -- Plugin architecture analysis (many recommendations superseded by user decisions, but useful for anti-pattern awareness)
- `.planning/research/PITFALLS.md` -- Technology bias and convention bloat pitfalls (directly applicable)
- `.planning/research/FEATURES.md` -- Ecosystem patterns (file copy model confirmed as cckit's approach)

### Tertiary (LOW confidence)
- `description` field behavior in `.claude/rules/` -- included in community working examples but not explicitly documented in official Claude Code docs for rules (documented for skills)
- `alwaysApply` field stability -- working now per community testing but may change in future Claude Code versions

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, pure documentation deliverable
- Architecture: HIGH -- all decisions locked in CONTEXT.md, Claude Code rules format verified against official docs and community testing
- Pitfalls: HIGH -- frontmatter bugs verified via GitHub issue with reproduction steps; technology bias pitfall documented across both v0.1.0 and v0.2.0 research

**Research date:** 2026-04-03
**Valid until:** 2026-05-03 (30 days -- Claude Code rules format is stable; watch issue #17204 for `paths` bug resolution)
