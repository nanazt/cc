# Phase 17: Convention Architecture - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Define the layered convention file structure and authoring principles that all downstream convention work follows. This phase produces an architecture document (`docs/CONVENTIONS.md`) — it does not create any actual conventions.

Scope: file structure, naming, frontmatter schema, authoring principles, delta test definition, hook architecture, installer discovery contract.

Not in scope: actual convention content (Phase 19+), /convention skill implementation (Phase 18), installer implementation (Phase 20).

</domain>

<decisions>
## Implementation Decisions

### Convention Format
- **D-01:** Conventions are Claude Code **Rules** (installed to `.claude/rules/`), not Skills. Conventions are passive behavioral guidance — they don't need tool access or interactive workflows. Rules are the exact Claude Code mechanism for this.
- **D-02:** "Tech pack" terminology is **retired** across the entire project. Use "language-specific convention" in natural language. No special term needed — file naming makes the relationship self-evident.

### File Structure
- **D-03:** Conventions live in a dedicated `conventions/` directory at project root, separate from `skills/` (which holds action skills like /case and /consolidate).
- **D-04:** Base convention file is named `CONVENTION.md`. Language-specific files are named `{lang}.md` (e.g., `rust.md`, `typescript.md`, `python.md`).
- **D-05:** Directory naming is decided per-convention at creation time. Rule: short, intuitive area name. Kebab-case for compound words only.
- **D-06:** Source structure example:
  ```
  conventions/
  ├── commit/
  │   └── CONVENTION.md              # base only (no lang-specific needed)
  ├── coding/
  │   ├── CONVENTION.md              # base
  │   └── rust.md                    # language-specific
  ├── test/
  │   ├── CONVENTION.md              # base
  │   └── rust.md                    # language-specific
  └── error/
      └── rust.md                    # language-specific only (no base)
  ```

### Base Convention Rules
- **D-07:** Base conventions are **optional**. A base is only created when it passes the delta test (ARCH-03). If the base would only contain things the LLM already knows, skip it — ship language-specific conventions only.
- **D-08:** When base exists, language-specific conventions are **additive** — they add language-specific rules without duplicating base content. Claude loads both.
- **D-09:** When base does not exist, language-specific conventions are **standalone** — fully self-contained.
- **D-10:** Within the same convention, base and language-specific files are installed together (installer handles this). Across different convention areas, conventions are **independent** — no cross-references, each installable alone.

### Frontmatter
- **D-11:** Convention frontmatter uses only Claude Code standard fields: `description` and `paths` (optional). Zero cckit-specific fields. No `type`, `technology`, or custom metadata.
- **D-12:** `paths` is optional. Omitted = convention always loads (e.g., commit convention). Present = convention loads only for matching files (e.g., `paths: "*.rs"` for Rust-specific).
- **D-13:** `paths` values are defaults. Users can customize the installed file's `paths` field after installation.

### Convention Content
- **D-14:** No prescribed internal structure for convention files. The `/convention` skill (Phase 18) researches and determines the optimal structure for each convention. Phase 17 defines the container, not the content format.

### Delta Test
- **D-15:** Delta test is embedded in the `/convention` skill's authoring process (Phase 18). No separate validation infrastructure. The skill self-tests each rule during generation: "Would Claude already do this without being told?" → Yes → remove.

### Enforcement Hooks
- **D-16:** Hooks live inside the convention directory they enforce:
  ```
  conventions/commit/
  ├── CONVENTION.md      # guidance
  └── hooks/
      └── validate.sh    # enforcement
  ```
- **D-17:** Installer copies both rule files and hook scripts. Host receives: `.claude/rules/cckit-commit.md` + `.claude/hooks/cckit-commit-validate.sh`.

### Installation
- **D-18:** Installation via Deno remote script (milestone decision, confirmed). Not native Claude Code plugin system.
- **D-19:** Installed files use `cckit-` prefix in host project: `cckit-commit.md`, `cckit-coding.md`, `cckit-coding-rust.md`. Prevents collision with host's own rules.
- **D-20:** Installer discovers conventions by scanning `conventions/` directory. No manifest file needed. `CONVENTION.md` or `{lang}.md` presence = convention exists.
- **D-21:** Self-application via `deno run tools/install.ts --self`. Installs cckit's own conventions into its `.claude/rules/`. Same path as any host project.

### Override & Precedence
- **D-22:** Host project's CLAUDE.md always takes precedence over cckit rules. This is Claude Code's built-in priority — no custom override mechanism needed.

### Convention Size
- **D-23:** No explicit size limit. Delta test naturally keeps conventions concise by removing content the LLM already knows.

### CLAUDE.md Migration
- **D-24:** Existing convention content in cckit's CLAUDE.md (commit conventions, naming rules, etc.) will migrate to convention files. CLAUDE.md retains only cckit-specific project instructions.

### Architecture Document
- **D-25:** Phase 17's primary deliverable is `docs/CONVENTIONS.md` — a research-backed, high-quality architecture document. Researcher investigates convention architecture patterns; executor writes the document incorporating all decisions from this context.

### Plugin & Distribution
- **D-26:** No `.claude-plugin/plugin.json` in v0.2.0. Plugin manifest deferred — not needed for Deno installer approach.

### Requirements Update
- **D-27:** REQUIREMENTS.md must be updated to reflect discussion outcomes: retire "tech pack" terminology, adjust ARCH-01 (base is optional), adjust ARCH-02 (no config file — paths field + installer).

### Claude's Discretion
- Architecture document internal structure and presentation — researcher/executor decide the best way to organize docs/CONVENTIONS.md
- Convention directory names for future conventions — decided per-convention at creation time

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Research
- `.planning/research/ARCHITECTURE.md` — Plugin architecture analysis and convention skill format (note: many recommendations superseded by discussion decisions — rules format replaces skills, Deno installer replaces plugin system)
- `.planning/research/SUMMARY.md` — Key conflict resolution and overall recommendations
- `.planning/research/PITFALLS.md` — Risk prevention strategies (technology bias, context budget, convention interaction)
- `.planning/research/FEATURES.md` — Feature prioritization

### Requirements
- `.planning/REQUIREMENTS.md` — ARCH-01 through ARCH-04 (will be updated per D-27)

### Existing Patterns
- `skills/case/SKILL.md` — Existing action skill pattern (for understanding how conventions/ differs from skills/)
- `docs/MODEL.md` — Consolidation model (example of existing docs/ architecture document)
- `docs/STACK.md` — Technology stack documentation (example of docs/ document)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `docs/MODEL.md`, `docs/STACK.md` — Established pattern for architecture documents in docs/
- `skills/case/SKILL.md`, `skills/consolidate/SKILL.md` — Existing skill format. Convention format (rules) is deliberately different.
- `.claude/hooks/validate-commit-scope.sh` — Existing hook for cckit's own commit validation. Convention hooks will be separate (cckit-distributed vs project-specific).

### Established Patterns
- Frontmatter-based metadata in SKILL.md files
- CLAUDE.md as project-level instruction source (conventions will migrate out of here)
- docs/ directory for internal architecture documentation

### Integration Points
- `conventions/` directory — new, created at project root alongside `skills/`, `agents/`, `tools/`
- `docs/CONVENTIONS.md` — new file in existing docs/ directory
- `CLAUDE.md` — will be modified (convention content removed after migration)
- `.planning/REQUIREMENTS.md` — will be updated (terminology + adjusted requirements)

</code_context>

<specifics>
## Specific Ideas

- User explicitly rejected the research recommendation to use native Claude Code plugin system — Deno installer was decided during milestone creation and stands
- "Tech pack" terminology was found to be unappealing ("짜치는") — retired in favor of natural language ("language-specific convention")
- Custom frontmatter fields were rejected in favor of using only Claude Code standard fields (description, paths) — keeps convention files as pure Claude Code rule files with zero cckit-specific metadata
- Convention content structure is intentionally left undefined — the /convention skill should research and determine the best format per convention area, not follow a rigid template

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 17-convention-architecture*
*Context gathered: 2026-04-03*
