# Domain Pitfalls: Convention Distribution for Claude Code Toolkit

**Domain:** Installable convention distribution system for Claude Code
**Researched:** 2026-04-03
**Overall confidence:** HIGH (codebase analysis + Claude Code official docs + ecosystem research)

This document catalogs pitfalls specific to the v0.2.0 Portable Conventions milestone. It supersedes the v0.1.0 PITFALLS.md which covered universalization of the consolidation tool. Those pitfalls remain relevant for the consolidation pipeline but are archived in `.planning/milestones/v0.1.0-phases/`.

---

## Critical Pitfalls

Mistakes that cause rewrites or fundamental design failures. These block the distribution system if not addressed.

### Pitfall 1: Config File Hell -- Too Many Knobs, Too Few Defaults

**What goes wrong:** The config system offers fine-grained control over which conventions to install, how to customize each one, where to place files, and how to handle conflicts. The resulting config file is 50+ lines before the user has done anything useful. Every new convention package adds more config surface. The config becomes harder to understand than the conventions it manages.

**Why it happens:** Convention systems feel incomplete without customization. "What if someone wants commit conventions but not test conventions?" leads to per-convention toggles. "What if someone wants a different commit prefix format?" leads to per-convention options. "What if two conventions conflict?" leads to priority/ordering config. Each decision is locally reasonable; collectively they produce a configuration language.

**Warning signs:**
- The config file has more than 15 lines for a typical installation
- There are nested options (convention-specific sub-configuration)
- Users need documentation to understand what the config file means
- The config schema needs its own validation tool
- Config changes require re-running the installer

**Consequences:** Users avoid the tool because the setup cost exceeds the value. Teams argue about config settings instead of shipping code. Config files diverge across projects, defeating the purpose of standardized conventions.

**Concrete risk for cckit:** The schema system already has `consolidation.schema.md` with Meta, Components, Sections, and Conditional Sections. Adding a conventions config file creates a second configuration surface. Users now maintain two config files in `.planning/` that interact in non-obvious ways (does the coding convention affect how consolidation sections are named?).

**Prevention:**
1. **Convention over configuration, literally.** Install everything by default. Let users remove what they do not want, not opt into what they do. The config file should be a blocklist, not an allowlist.
2. **Flat config, no nesting.** The config should be a list of convention names to exclude, not a tree of per-convention options. If a convention needs customization, it is not generic enough.
3. **One config surface.** Do not create a new config format. Consider whether the existing `.claude/` structure (skills, agents, CLAUDE.md) can carry convention configuration without a separate file.
4. **The 5-line test:** A typical project's config file should be 5 lines or fewer. If the default installation requires zero config, the system passes.

**Detection:** Create the config file for 5 different project types (Rust CLI, React app, Go API, Python library, documentation site). If any config exceeds 10 lines, the system is too complex.

**Phase to address:** Infrastructure phase (config system design). This is foundational -- every convention phase builds on the config model.

---

### Pitfall 2: The Installer That Works on Your Machine

**What goes wrong:** The Deno-based remote installer (`deno run https://...`) works on macOS with Deno 2.7+ installed, a standard shell, and expected directory permissions. It fails silently or crashes on: Deno not installed, Deno version too old, Windows path separators, read-only `.claude/` directory, existing files with conflicting content, missing `git` (if the installer checks repo state), CI environments where stdin is not a terminal, network interruptions mid-download, and corporate proxies that intercept HTTPS.

**Why it happens:** Installer scripts are tested in the author's environment. Each edge case requires specific handling code. The "happy path" works in demos; the "real path" involves dozens of environment combinations the author never tested.

**Specific edge cases for cckit's `deno run https://...` approach:**

| Edge Case | What Breaks | How Common |
|-----------|-------------|------------|
| Deno not installed | Script cannot run at all | Very common -- Deno is not mainstream |
| Deno < 2.7 | `npm:` specifiers or APIs may differ | Common -- users install once and forget |
| `--allow-read --allow-write` not granted | Deno permission prompt blocks in CI | Common in automated setups |
| `.claude/` directory does not exist | Write fails if installer assumes it exists | Common for new projects |
| `.claude/skills/` has existing skills with same names | Overwrite destroys user customization | Moderate -- users who already use Claude Code skills |
| Windows backslash paths | Path joins produce `\.claude\skills\` which Deno may handle differently | Moderate on Windows |
| Running from wrong directory | Installs to wrong project | Common -- user forgets to `cd` first |
| Network timeout mid-install | Partial installation state | Rare but catastrophic |
| `.claude/` is gitignored | User runs installer, conventions vanish on next clone | Moderate -- many gitignore templates exclude dotfiles |

**Consequences:** Users who hit edge cases get a broken or partial installation, lose trust in the tool, and revert manually. Worse, a partial installation (some files written, some not) leaves the project in an inconsistent state that is hard to diagnose.

**Prevention:**
1. **Preflight checks.** Before writing any files, validate: Deno version, target directory exists and is writable, `.claude/` directory state, no name collisions. Report all issues at once (not fail-on-first).
2. **Atomic installation.** Write to a temp directory first, then move atomically. If any step fails, nothing is partially installed. The project directory is either fully updated or unchanged.
3. **Idempotent by design.** Running the installer twice produces the same result. Files that already match are skipped. Files that differ are reported (not silently overwritten).
4. **No stdin dependency.** The installer must work non-interactively. Use flags for choices (`--exclude coding,test`) instead of interactive prompts. CI environments cannot answer questions.
5. **Explicit CWD.** Accept an optional target directory argument. Default to CWD but warn if no `.git/` or `CLAUDE.md` is found at the target (suggests wrong directory).

**Detection:** Create a test matrix: macOS + Deno 2.7, macOS + no Deno, Linux + Deno 2.8, Windows + Deno 2.7, CI (no TTY). Run the installer on each. Count failures.

**Phase to address:** Infrastructure phase (installer implementation). Test matrix should be defined before coding.

---

### Pitfall 3: Conventions That Assume a Tech Stack

**What goes wrong:** Convention packages contain advice that only applies to specific technologies. The "coding conventions" package says "use ESLint" or "prefer `const` over `let`." The "test conventions" package assumes Jest or pytest. The "commit conventions" package assumes npm scripts for hooks. A Rust project, a Go project, or a documentation project gets conventions that do not apply and may conflict with their tooling.

**Why it happens:** Convention authors think in terms of their own stack. JavaScript/TypeScript is the most common Claude Code context, so examples and rules naturally gravitate toward that ecosystem. The cckit CLAUDE.md explicitly warns about this (Technology Neutrality section), but convention content is where the bias actually manifests.

**This is cckit's #1 recurring problem.** The v0.1.0 milestone was dominated by technology neutrality issues. The existing PITFALLS.md (v0.1.0) documented 10 pitfalls, of which 6 were variations of "hidden service/technology assumptions." Conventions are even more susceptible because they directly prescribe behavior rather than organizing information.

**Concrete examples of bias that will creep in:**

| Convention Area | Biased Version | Neutral Version |
|----------------|----------------|-----------------|
| Coding | "Use `const` by default, `let` when needed" | "Prefer immutable bindings where the language supports them" |
| Testing | "Write unit tests with Jest" | "Write unit tests using the project's test framework" |
| Commit | "Run `npm run lint` in pre-commit hook" | "Run the project's lint command before committing" |
| Documentation | "Use JSDoc for function documentation" | "Document public interfaces using the project's documentation standard" |
| Error handling | "Throw typed errors extending Error" | "Use the project's error propagation pattern" |
| Project structure | "src/ for source, dist/ for build output" | "Follow the project's established directory layout" |

**The spectrum of abstraction:**

```
Too specific                    Sweet spot                    Too abstract
"Use ESLint with        "Enforce consistent style     "Write good code"
 airbnb config"          using your project's linter"
```

**Prevention:**
1. **Apply the cckit universality test to every convention line.** "Could a Rust CLI, a Go API, a Python ML pipeline, a Swift iOS app, and a documentation site all follow this convention without modification?" If no, the convention is too specific.
2. **Structural conventions, not tooling conventions.** Teach "what to do" (validate inputs, handle errors, test edge cases), not "which tool to use" (ESLint, pytest, cargo test).
3. **One convention, one pass.** After writing each convention package, review every line and ask: "Does this assume a language, framework, runtime, or build tool?" Mark and rewrite any that do.
4. **Convention review checklist per package** (see Detection below).

**Detection:** For each convention package, apply this checklist:

- [ ] Contains no language-specific syntax examples
- [ ] Contains no framework names (React, Django, Spring, etc.)
- [ ] Contains no tool names (ESLint, prettier, Jest, cargo, etc.)
- [ ] Contains no file extension assumptions (.js, .py, .rs, etc.)
- [ ] Contains no package manager references (npm, pip, cargo, etc.)
- [ ] Every recommendation can be followed by any project type
- [ ] Examples use structural placeholders, not concrete code

**Phase to address:** Every convention package phase. This must be checked per-convention, not just at design time. The infrastructure phase should define the review checklist; each convention phase applies it.

---

## Moderate Pitfalls

Mistakes that cause significant rework or degraded quality but do not invalidate the architecture.

### Pitfall 4: Update Mechanism Creates Merge Conflicts

**What goes wrong:** User installs conventions v1.0. They customize some conventions (add project-specific rules to CLAUDE.md, modify a skill's behavior). cckit releases v1.1 with updated conventions. User runs the installer again. Their customizations are overwritten, or the installer refuses to update because files have diverged, or worse -- the installer partially updates, leaving a mix of v1.0 and v1.1 content.

**Why it happens:** Convention files are not code with clear merge semantics. A CLAUDE.md section about commit conventions has no "diff boundary" -- you cannot merge two versions of prose the way you merge two versions of a function. Installers that copy files have two bad options: overwrite (lose customization) or skip (stay outdated).

**The ESLint shareable config lesson:** ESLint's ecosystem solved this by making configs composable (extend a base, override specific rules). But ESLint configs are structured JSON/JS with well-defined merge semantics. CLAUDE.md and SKILL.md are unstructured markdown where "merge" is undefined.

**Concrete risk for cckit:** The installer writes to `.claude/skills/` and potentially to `CLAUDE.md`. If a user has modified a cckit-installed skill's SKILL.md (changed a description, added a project-specific instruction), the next update either destroys that change or cannot proceed.

**Prevention:**
1. **Separate managed from user content.** cckit-managed files should be clearly identified (e.g., a comment header `<!-- managed by cckit v1.0 -- do not edit -->`). User customizations go in separate files that cckit never touches.
2. **Override, do not modify.** cckit installs base convention files. Users create override files (e.g., `.claude/skills/my-overrides/SKILL.md`) that cckit never writes to. The skill system's precedence rules handle composition.
3. **Hash-based staleness detection.** Store a hash of the installed content. On update, compare the current file hash against the installed hash. If they match, safe to update. If they differ, the user has customized -- warn and offer options (skip, backup + overwrite, show diff).
4. **Version manifest.** Maintain a small manifest (`.claude/.cckit-manifest.json`) tracking which files were installed, their versions, and content hashes. This is the installer's memory of what it put there.

**Detection:** Simulate: install v1.0, modify one file, run v1.1 installer. Does it handle the conflict gracefully? Does it report what happened?

**Phase to address:** Infrastructure phase (update mechanism design). Must be designed before the first convention is shipped, because the update mechanism constrains how conventions are structured.

---

### Pitfall 5: Convention Versioning Without Semver Discipline

**What goes wrong:** Convention v1.0 says "always include a test plan in PR descriptions." Convention v1.1 changes this to "include a test plan for non-trivial PRs." A user on v1.0 has trained their team around the strict rule. Updating to v1.1 silently relaxes the convention. There was no major version bump to signal this behavioral change. The user does not notice the shift until PR quality degrades.

**Why it happens:** Convention changes are behavioral, not syntactic. A changed convention does not produce a compilation error or test failure. The impact is subtle and delayed. Authors treat convention updates as "improvements" (minor version) when they are actually "behavioral changes" (major version).

**The core problem:** What constitutes a "breaking change" for a convention? In code, breaking = API change. In conventions, breaking = behavioral expectation change. But convention authors do not have this vocabulary.

**Prevention:**
1. **Define "breaking" for conventions.** A convention change is breaking if: a project following the old convention would need to change its behavior to follow the new one. Adding a new convention is minor. Rewording for clarity is patch. Changing expected behavior is major.
2. **Changelog per convention package.** Each convention package has a CHANGELOG section documenting what changed and why. This is the signal users need to evaluate updates.
3. **Pin by default, update explicitly.** The manifest records the installed version. `deno run https://... update` shows what would change before applying. Users opt into updates after reviewing the diff.
4. **Convention diffing.** The update command should show a human-readable diff of what changed in convention text, not just file diffs. "Commit conventions: CHANGED -- test plan requirement relaxed from 'always' to 'non-trivial PRs only'."

**Detection:** Write a CHANGELOG entry for every convention change. If you cannot clearly articulate what behavior changed, the change is insufficiently understood.

**Phase to address:** Infrastructure phase (versioning scheme). Convention phases apply the scheme.

---

### Pitfall 6: Self-Referential Complexity -- cckit Applying Conventions to Itself

**What goes wrong:** cckit's v0.2.0 goal is "self-applicable to cckit." This means the convention distribution system must be able to install conventions into the cckit project itself. But cckit's CLAUDE.md already has extensive conventions (commit format, technology neutrality, GSD workflow, content authoring rules). Installing cckit's own conventions into cckit either duplicates existing content, conflicts with it, or creates a circular dependency where the tool's behavior depends on its own output.

**Why it happens:** Dogfooding is desirable ("eat your own dog food"), but self-application of a convention tool is structurally different from using it on other projects. cckit already IS the convention source. Installing conventions from cckit into cckit is like copying a book into itself.

**Concrete conflicts:**

| Existing cckit Convention | Convention Package Equivalent | Conflict |
|--------------------------|-------------------------------|----------|
| CLAUDE.md "Commit Conventions" section | Commit conventions package | Duplicate. Which is authoritative? |
| CLAUDE.md "Content Authoring Rules" | Coding conventions package (partial overlap) | Partial overlap. Some rules match, some are cckit-specific. |
| CLAUDE.md "GSD Workflow Enforcement" | Workflow conventions package | cckit has GSD-specific workflow rules that do not generalize. |
| `.claude/skills/` already has /case, /consolidate | Convention packages are also skills | Namespace collision risk if convention skills share names. |

**Prevention:**
1. **Layered precedence, not merging.** cckit's own CLAUDE.md conventions take precedence. Installed convention packages provide defaults that cckit's existing rules override. No merging of duplicate content.
2. **Self-application test as a gate.** Before shipping any convention package, install it into cckit itself. If it produces duplicates, conflicts, or nonsensical instructions, the package is not generic enough.
3. **Project-specific exclusions are normal.** cckit excluding some conventions from self-installation is not a failure -- it proves the config system works. The cckit config file should naturally exclude conventions that overlap with its existing CLAUDE.md.
4. **Avoid circular reads.** The installer must not read CLAUDE.md to decide what to install. It reads only the config file (or uses defaults). CLAUDE.md is an output target, not an input source.

**Detection:** Run the full installation on the cckit project. Count duplicates, conflicts, and nonsensical instructions. Target: zero of each.

**Phase to address:** Config system phase AND each convention package phase (self-application test).

---

### Pitfall 7: Convention Packages That Are Actually Style Guides

**What goes wrong:** A "convention package" is supposed to be instructions Claude follows during development. Instead, it becomes a long-form document explaining why certain practices are good, with examples, rationale, and philosophical justification. Claude does not need persuasion -- it needs instructions. The 2000-line style guide gets loaded into context, consuming tokens without improving behavior.

**Why it happens:** Convention authors are often writing for humans (team members who need to understand and agree with the conventions). Claude does not need to agree -- it needs actionable rules. The habit of writing for human audiences produces conventions that are informative but not directive.

**The SKILL.md lesson from Claude Code docs:** Skills should be "under 500 lines" with "reference material in separate files." Conventions that balloon into style guides violate this principle and degrade Claude's performance by consuming context window budget.

**Warning signs:**
- Convention file exceeds 200 lines
- More than 30% of content is rationale ("because...", "this matters because...")
- Examples outnumber rules
- Convention reads like a blog post, not a checklist
- Convention includes "when to break this rule" discussions

**Prevention:**
1. **Rule: every convention line must be a directive, not an explanation.** "Always X" or "Never Y" or "When Z, do W." Remove all rationale from the installed content. Rationale belongs in docs/, not in installed conventions.
2. **200-line budget per convention package.** If a convention exceeds 200 lines after removing rationale, it is trying to cover too much. Split it.
3. **The Claude test:** Give Claude a 50-line convention and a 500-line convention covering the same topic. Compare output quality. If there is no difference, the 450 extra lines are waste.
4. **Separate reference from directive.** Convention packages install directives (short, actionable). Reference material (examples, rationale, edge case discussions) lives in `docs/` and is not installed.

**Detection:** For each convention package, count directive lines vs. explanatory lines. Ratio should be at least 3:1 directive to explanation.

**Phase to address:** Every convention package phase. Enforce as a review criterion.

---

### Pitfall 8: Plugin System Mismatch -- Conventions as Skills vs. CLAUDE.md Content

**What goes wrong:** Some conventions are best expressed as CLAUDE.md content (always-active behavioral instructions). Others are best expressed as skills (invocable workflows). Others might be agents (specialized subagent behaviors). The distribution system treats them all the same way, installing everything as one type. This either puts workflow-specific content into always-active CLAUDE.md (wasting context on irrelevant instructions) or puts always-active conventions into skills (where Claude may not load them).

**Why it happens:** The Claude Code plugin system has distinct mechanisms for different purposes. From the official docs:

| Mechanism | When Claude Sees It | Best For |
|-----------|-------------------|----------|
| CLAUDE.md | Always in context | Conventions that should always apply (commit format, naming) |
| Skills (auto-invokable) | Description always in context; full content when invoked | Conventions tied to specific actions (review checklist, deploy procedure) |
| Skills (`disable-model-invocation`) | Only when user invokes | Workflows the user controls |
| Skills (`user-invocable: false`) | When Claude decides | Background knowledge Claude applies selectively |

Choosing wrong means either: context waste (everything in CLAUDE.md, most of it irrelevant to the current task) or context absence (important conventions in skills that Claude does not invoke for the current task).

**Concrete example:** "Always use conventional commits" belongs in CLAUDE.md -- it applies to every commit. "Run security audit checklist" belongs in a skill -- it applies only during security reviews. If both are installed as CLAUDE.md content, every interaction pays the token cost of the security checklist.

**Prevention:**
1. **Categorize each convention at authoring time.** Convention package metadata declares the delivery mechanism: `delivery: claude-md`, `delivery: skill`, `delivery: agent`. The installer routes content accordingly.
2. **Default to CLAUDE.md for simple conventions.** Most conventions ("use conventional commits", "write tests for public APIs") are short, always-active rules. They belong in CLAUDE.md.
3. **Use skills only for procedural conventions.** Multi-step processes (code review workflow, release checklist) that Claude should follow step-by-step when invoked belong in skills.
4. **Budget awareness.** Track total installed CLAUDE.md content size. Warn if conventions would push CLAUDE.md past a reasonable threshold (suggest moving some to skills).

**Detection:** After installing all conventions, measure total CLAUDE.md size. If it exceeds 500 lines, audit which conventions could be skills instead.

**Phase to address:** Infrastructure phase (delivery mechanism design) AND each convention package phase (categorization).

---

## Minor Pitfalls

### Pitfall 9: The .gitignore Problem

**What goes wrong:** Many `.gitignore` templates exclude `.claude/` or dotfiles broadly. User installs conventions, they work locally, but they are not committed to git. Teammate clones the repo and has no conventions. Worse, the user does not realize the conventions are gitignored until they notice inconsistent behavior across machines.

**Prevention:**
1. Post-installation check: verify `.claude/` is not gitignored. If it is, warn the user with specific instructions to un-ignore it.
2. Include a `.gitignore` entry in the installation documentation: "Add `!.claude/` to your `.gitignore` if your template excludes dotfiles."
3. Consider whether convention content should live outside `.claude/` (e.g., in a `conventions/` directory) to avoid gitignore conflicts. However, this breaks Claude Code's native discovery -- `.claude/` is the standard location.

**Phase to address:** Installer phase (post-installation validation).

---

### Pitfall 10: Convention Interaction Effects

**What goes wrong:** Individual conventions are well-designed, but combinations produce unexpected behavior. The "coding conventions" say "keep functions under 20 lines." The "test conventions" say "write comprehensive test cases for every branch." Claude follows both, producing 15-line functions with 200-line test files. Or: "documentation conventions" say "document every public function." "Coding conventions" say "prefer small, focused functions." Together they produce excessive documentation for trivial helper functions.

**Prevention:**
1. **Test convention combinations, not just individual conventions.** Define 3-4 standard convention bundles (e.g., "all conventions", "code + test", "code + docs") and test them together.
2. **Include interaction notes.** If a convention interacts with another, document the expected behavior: "When combined with test conventions, the 20-line function limit applies to production code, not test code."
3. **Priority/scope annotations.** Conventions can declare scope ("production code only", "test code only", "documentation only") to reduce cross-contamination.

**Phase to address:** Late-stage integration testing after multiple convention packages are shipped. Not addressable until at least 3 conventions exist.

---

### Pitfall 11: Remote Script Trust and Caching

**What goes wrong:** `deno run https://raw.githubusercontent.com/.../install.ts` fetches and executes code from the network. Deno caches the script after first fetch, so subsequent runs use the cached version -- even if the remote has been updated. Users expect "always get latest" but get "whatever was cached." Alternatively, users expect "stable, reproducible" but get "whatever the remote serves today" on first run.

**Prevention:**
1. **Version-pinned URLs.** Use tagged release URLs (`https://...@v0.2.0/install.ts`), not branch URLs. Users can pin to a specific version.
2. **`--reload` flag in install instructions.** Document that `deno run --reload https://...` forces a fresh fetch. Consider making this the default in install instructions.
3. **Hash verification.** After download, the script can verify its own integrity against a published hash. This is defense-in-depth against CDN/proxy tampering.
4. **Fallback for no-network.** The installer should work from a local clone too: `deno run tools/install.ts`. Remote URL is convenience, not the only path.

**Phase to address:** Installer phase (URL strategy and caching documentation).

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Infrastructure: Config System | Pitfall 1 (config hell), Pitfall 4 (update conflicts) | Flat blocklist config. Hash-based staleness. Version manifest. |
| Infrastructure: Installer | Pitfall 2 (edge cases), Pitfall 11 (caching) | Preflight checks. Atomic installation. Idempotent. Version-pinned URLs. |
| Infrastructure: Delivery Mechanism | Pitfall 8 (skill vs CLAUDE.md) | Categorize each convention. Budget awareness. |
| Every Convention Package | Pitfall 3 (tech bias), Pitfall 7 (style guide bloat) | Universality checklist per line. 200-line budget. Directive-not-explanation. |
| Convention: Commit | Pitfall 3 (assumes npm scripts for hooks) | Structural convention: "use pre-commit validation" not "use husky." |
| Convention: Testing | Pitfall 3 (assumes specific test framework) | "Write tests for public interfaces" not "write Jest tests." |
| Convention: Coding | Pitfall 10 (interacts with test + docs conventions) | Scope annotations: "production code" qualifier. |
| Self-Application to cckit | Pitfall 6 (circular complexity) | Layered precedence. Exclusion list is expected. |
| Update/Versioning | Pitfall 5 (behavioral semver) | Define "breaking" for conventions. Changelog per package. |
| Late Integration | Pitfall 10 (convention interactions) | Bundle testing after 3+ conventions exist. |

## Integration-Specific Pitfalls (Existing cckit + New Distribution)

The distribution system is being added to an existing codebase with existing tools (hash-sections.ts, schema-parser.ts, schema-bootstrap.ts, /case, /consolidate). These integration-specific risks do not exist for greenfield projects.

### Integration Risk 1: Installer Conflicts with Existing Plugin Structure

cckit is already structured as a Claude Code plugin (skills/, agents/ at root). The installer must not assume it is installing into an empty `.claude/` directory. The target project may already have cckit's /case and /consolidate installed via a different mechanism (manual copy, git submodule, `--plugin-dir`).

**Mitigation:** Installer detects existing cckit artifacts and offers: skip (keep existing), update (replace with current version), or coexist (install conventions alongside existing skills without touching them).

### Integration Risk 2: Schema Parser Dependency for Convention Validation

The schema-parser.ts and schema-bootstrap.ts tools already exist and parse consolidation schemas. Convention packages may want to validate their own schemas or config. Reusing the existing parser is tempting but creates coupling -- convention config is structurally different from consolidation schemas.

**Mitigation:** Keep convention config independent of consolidation schema tooling. If both need markdown parsing, share the unified/remark dependency but not the parsing logic.

### Integration Risk 3: Deno Dependency Becomes User-Facing

Currently, Deno is an internal runtime dependency (hash-sections.ts runs on Deno but users interact through Claude Code skills). With `deno run https://...` as the installer, Deno becomes a user-facing dependency. Users must have Deno installed to use cckit conventions, even if they never use consolidation or case discovery.

**Mitigation:** Consider providing a non-Deno installation path (curl + shell script, or a pre-built binary) for users who only want conventions. Alternatively, accept the Deno requirement but document it prominently and provide clear installation instructions for Deno itself.

## Sources

- Direct codebase analysis: `tools/schema-parser.ts`, `tools/schema-bootstrap.ts`, `skills/consolidate/SKILL.md`, `CLAUDE.md`
- `.planning/PROJECT.md` -- v0.2.0 milestone context and constraints
- `.planning/research/STACK.md` (v0.1.0) -- existing stack decisions
- `.planning/research/ARCHITECTURE.md` (v0.1.0) -- existing architecture patterns
- [Claude Code Skills Docs](https://code.claude.com/docs/en/skills) -- skill installation paths, discovery, SKILL.md format, context loading behavior, supporting files pattern
- [Claude Code Plugins Docs](https://code.claude.com/docs/en/plugins) -- plugin structure, manifest, namespace collision, `--plugin-dir`, update mechanism, migration patterns
- [Deno run reference](https://docs.deno.com/runtime/reference/cli/run/) -- remote URL execution, caching, permission model
- [ESLint Shareable Configs](https://eslint.org/docs/latest/extend/shareable-configs) -- lessons from config distribution (dependency management, resolution, breaking changes)
- [AWS Well-Architected: Anti-patterns for Everything as Code](https://docs.aws.amazon.com/wellarchitected/latest/devops-guidance/anti-patterns-for-everything-as-code.html) -- configuration drift, snowflakes-as-code
