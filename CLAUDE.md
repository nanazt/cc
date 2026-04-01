# nanaz/cc

Personal Claude Code toolkit. Skills, agents, and directives for use across projects.

## Language

All content (code, docs, commit messages) in English.

## Structure

```
skills/        -- Claude Code skills (installed to .claude/skills/)
agents/        -- Agent definitions (installed to .claude/agents/)
directives/    -- Detailed behavioral guidelines (referenced from host CLAUDE.md)
docs/          -- Implementation specs, research
```

## Installation

Copy or symlink into a host project's `.claude/` directory:

```bash
ln -s /path/to/cckit/skills/case .claude/skills/case
ln -s /path/to/cckit/agents/case-briefer.md .claude/agents/case-briefer.md
```

## Current Tools

### Skills

| Skill | Purpose | Status |
|-------|---------|--------|
| `/case` | Behavioral case discovery (S/F/E tables) for GSD phases | Working (migrated from madome) |
| `/consolidate` | Per-component spec consolidation after phase ship | v1 exists, v2 in development (see docs/IMPL-SPEC.md) |

### Agents

| Agent | Used By | Model |
|-------|---------|-------|
| case-briefer | /case | sonnet |
| case-validator | /case | opus |

## GSD Workflow Integration

These tools extend the GSD workflow but are manually invoked (no /gsd:next integration):

```
discuss -> /case -> plan -> execute -> verify -> ship -> /consolidate
```

Host project CLAUDE.md should include an Extended Workflow section documenting this pipeline.

## Commit Conventions

Conventional Commits 1.0.0. Scope is a codebase noun, not a phase number.

Types: feat, fix, docs, refactor, test, chore

Scope examples:

```
feat(case): add PR/TR classification to discuss step
fix(hash-tool): correct empty section handling
docs: update IMPL-SPEC with review findings
refactor(briefer): extract operation discovery into helper
```

Rules:
- Scope must name a tool, module, or component (e.g., hash-tool, case, consolidate)
- Never use phase numbers, requirement IDs, or internal planning references
- Never use "state" as a scope — STATE.md changes are bundled into the related commit (e.g., context capture, plan creation) rather than committed separately
- Body should explain why, not dump planning context
- Keep the subject line understandable to someone with no .planning/ access

**CRITICAL — applies to ALL agents (including GSD executor subagents):**

GSD-internal references must NEVER appear in commit messages — not in subject, not in body. This includes:
- Phase numbers: `phase 11`, `phase 9`
- Plan IDs: `11-01`, `plan 02`, `09-01`
- Requirement IDs: `PIPE-01`, `MODEL-03`, `CASE-05`
- Decision IDs: `D-03`, `D-15`
- Progress fractions: `plan 1/3`, `progress 71%`

Bad examples (all violate this rule):
```
docs(consolidate): complete 11-01 orchestrator plan execution     ← plan ID
docs(consolidator): complete plan 02 — spec-consolidator agents   ← plan number
docs(consolidate): evolve PROJECT.md after phase 11 completion    ← phase number
docs(consolidate): mark PIPE-06 done, progress 100%              ← requirement ID
```

Good examples (describe what was done, not which plan):
```
docs(consolidate): complete orchestrator plan execution
docs(consolidator): complete spec-consolidator and e2e-flows agents
docs(consolidate): evolve PROJECT.md after pipeline completion
docs(consolidate): complete verification and state updates
```

If a GSD workflow template suggests a commit message containing these references, rewrite it to follow this rule before committing.

## GSD Reference Boundary

GSD-internal references (D-nn decisions, phase numbers, requirement IDs like MODEL-01, plan IDs like 09-01) exist only inside `.planning/`. They must never appear in any file outside `.planning/`:

- Code and comments (`src/`, `tools/`, etc.)
- Documentation (`docs/`)
- Skills and agents (`skills/`, `agents/`, `directives/`)
- Consolidated specs (`specs/`)
- Commit messages

If a GSD decision needs to be expressed in a deliverable, state the decision itself — not its ID.

<!-- GSD:project-start source:PROJECT.md -->
## Project

**cckit — Claude Code Toolkit**

A personal Claude Code toolkit that packages skills, agents, and behavioral directives for installation into arbitrary host projects. Currently ships `/case` (behavioral case discovery) and `/consolidate` (spec consolidation after phase ship) as GSD workflow extensions: `discuss -> /case -> plan -> execute -> verify -> ship -> /consolidate`.

**Core Value:** Consolidate phase-scoped planning decisions into persistent spec files that downstream agents (case-briefer, planner, executor) can consume as authoritative source of truth. The consolidation model must be project-type agnostic — not limited to services, backends, or any specific architecture style.

### Constraints

- **Runtime**: Deno required for hash-sections.ts (npm:unified, npm:remark-parse)
- **Agent models**: consolidation agents use sonnet; verifier uses opus (downgrade candidate after usage data)
- **No hardcoded project references**: Skills and agents must be technology-neutral and project-neutral
- **GSD conventions**: Depends on CONTEXT.md, CASES.md, ROADMAP.md, PROJECT.md phase directory structure
- **Content language**: All code, docs, commit messages in English (per CLAUDE.md)

### Technology Neutrality

cckit is a **plugin installed into arbitrary host projects**. Every artifact it produces — skills, agents, templates, directives — must work regardless of the host project's type, language, framework, or infrastructure.

**"Arbitrary" means truly arbitrary:** web services, CLI tools, mobile/desktop clients, system software, OS components, libraries, and even non-code projects (documentation, design systems, research). No artifact should assume the host project is a backend service or follows any specific architecture style.

**Default stance: technology-neutral and project-type-agnostic.**

- Templates and section schemas must not assume a specific project type (service, CLI, client, etc.). Prefer user-defined/extensible structures over hardcoded categories.
- Guide text, placeholder content, and examples use abstract terms — no real project names, no framework-specific patterns, no architecture-specific assumptions.
- Judgment criteria are expressed as behavioral tests ("does this code examine state, apply rules, and branch?"), not technology or architecture checks ("is this a gRPC service?", "is this a microservice?").

**Exceptions exist** — some artifacts are inherently technology-specific:

- `hash-sections.ts` depends on Deno + unified/remark-parse. This is acceptable because it is a build tool, not a host-facing artifact.
- Agent model assignments (sonnet/opus) are vendor-specific by nature.
- When a skill or directive explicitly targets a named technology (e.g., a future Rust-specific directive), mark it clearly in its description and frontmatter.

**The test:** Could any project — regardless of type, language, or domain — install this and use it without editing the plugin? If the artifact assumes a specific project type or architecture style, it is too specific.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Runtime: Deno
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Deno | `>=2.7` (latest stable: 2.7.7) | Runtime for `hash-sections.ts` | First-class TypeScript, built-in test runner, Web Crypto API for SHA-256, `npm:` specifiers eliminate package.json/node_modules. Single-file scripts just work. |
### Markdown AST: unified + remark-parse
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `npm:unified` | `11.0.5` | Pipeline processor | Composes parser + compiler plugins. Stable, no changes in 1+ year. |
| `npm:remark-parse` | `11.0.0` | Markdown-to-AST parser | CommonMark-compliant. Handles fenced code blocks, setext headers, ATX trailing hashes automatically. Eliminates ~40 lines of fragile regex. |
| `npm:remark-stringify` | `11.0.0` | AST-to-Markdown serializer | Needed for deterministic section serialization before hashing. Normalizes AST back to text. |
### Crypto: Web Crypto API (built-in)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `crypto.subtle.digest` | (Deno built-in) | SHA-256 computation | Web standard, zero dependencies. Available in Deno without imports. |
### Claude Code Plugin Layer
| Technology | Format | Purpose | Why |
|------------|--------|---------|-----|
| SKILL.md | YAML frontmatter + Markdown body | Skill definitions (`/case`, `/consolidate`) | Claude Code [Agent Skills standard](https://agentskills.io). Frontmatter configures invocation; body is the system prompt. |
| Agent .md | YAML frontmatter + Markdown body | Subagent definitions (`case-briefer`, `spec-consolidator`) | Claude Code native subagent format. Frontmatter sets model, tools, description; body is the system prompt. |
## Frontmatter Conventions
### SKILL.md Frontmatter
| Field | Required | This Project Uses |
|-------|----------|-------------------|
| `name` | No (defaults to dir name) | Yes |
| `description` | Recommended | Yes |
| `argument-hint` | No | Yes (`[phase-number]`) |
| `disable-model-invocation` | No | Yes (both skills) |
| `user-invocable` | No | No (defaults true) |
| `allowed-tools` | No | Yes |
| `model` | No | No (inherits session) |
| `effort` | No | No |
| `context` | No | No (skills run inline) |
| `agent` | No | No |
| `hooks` | No | No |
| `paths` | No | No |
| `shell` | No | No |
### Agent .md Frontmatter
| Field | Required | This Project Uses |
|-------|----------|-------------------|
| `name` | Yes | Yes |
| `description` | Yes | Yes |
| `tools` | No | Yes (restricted per agent) |
| `disallowedTools` | No | No |
| `model` | No | Yes (`sonnet` or `opus` per IMPL-SPEC) |
| `permissionMode` | No | No |
| `maxTurns` | No | Consider for verifier |
| `skills` | No | No |
| `mcpServers` | No | No |
| `hooks` | No | No |
| `memory` | No | No |
| `background` | No | No |
| `effort` | No | Consider for verifier |
| `isolation` | No | No |
| `initialPrompt` | No | No |
### Agent Model Assignments (from IMPL-SPEC)
| Agent | Model | Rationale |
|-------|-------|-----------|
| `spec-consolidator` | `sonnet` | Balanced capability/speed for structured merge operations |
| `e2e-flows` | `sonnet` | Structured output generation, no deep reasoning needed |
| `spec-verifier` | `opus` | 28-check verification needs strongest reasoning; downgrade candidate after usage data |
| `case-briefer` | `sonnet` | Extraction from planning docs, no deep reasoning |
| `case-validator` | `opus` | Cross-referencing gaps requires strong analytical reasoning |
## Testing
### Deno Test (built-in)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `deno test` | (built-in) | Test runner for `hash-sections_test.ts` | Zero-config, built-in assertions, `--allow-read` permission scoping. No external test framework needed. |
### Skill/Agent Testing
| Approach | What It Validates |
|----------|-------------------|
| YAML frontmatter linting | Required fields present, field value constraints |
| Dry-run with fixture data | Skill produces expected artifacts from known input |
| `spec-verifier` agent | 28-check read-only verification pass (T1/T2/T3 findings) |
## Deno Configuration
### Minimal `deno.json` (optional)
## What NOT to Use
| Technology | Why Not |
|------------|---------|
| Node.js | Requires tsconfig.json, build step or tsx, package.json. Deno does this with zero config. |
| Bun | Similar DX to Deno but lacks Deno's permission sandbox. No benefit over Deno for this use case. |
| Jest/Vitest/Mocha | External test frameworks. Deno's built-in test runner handles all 10 test cases without dependencies. |
| `remark` (combined package) | Bundles `unified` + `remark-parse` + `remark-stringify`. We only need parse + stringify separately for the pipeline, and explicit imports make dependencies clear. |
| `mdast-util-to-string` | Tempting for section serialization, but it strips formatting. We need full markdown serialization (including code blocks, emphasis, etc.) for accurate hashing. `remark-stringify` is correct. |
| `gray-matter` / YAML parsers | Not needed. Skills and agents are consumed by Claude Code, not by our code. The hash tool operates on markdown sections, not frontmatter. |
| `esbuild` / bundlers | No build step. Deno runs TypeScript directly. Bundling would add complexity for zero benefit. |
| `prettier` / formatters | Not applicable to prompt-engineering Markdown. Formatting is semantic in skills/agents (whitespace matters for readability by Claude). |
| Docker | Overkill. The hash tool is `deno run` with one permission flag. |
## Installation (for hash tool dependencies)
# First run fetches npm:unified, npm:remark-parse, npm:remark-stringify
# Subsequent runs use Deno's global cache (~/.cache/deno or DENO_DIR)
## Alternatives Considered
| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Runtime | Deno 2.7+ | Node.js 22+ | Zero-config TypeScript, built-in test runner, permission sandbox, npm: specifiers |
| Runtime | Deno 2.7+ | Bun 1.2+ | No permission sandbox, less mature ecosystem |
| Markdown parser | unified + remark-parse | `markdown-it` | Not AST-based (token stream). unified/remark gives mdast tree for structural traversal. |
| Markdown parser | unified + remark-parse | Manual regex | IMPL-SPEC explicitly rejected. 40+ lines of fragile code vs. 10 lines of AST traversal. |
| AST serializer | remark-stringify | `mdast-util-to-string` | Strips formatting; hashes would miss code block / emphasis changes (false negatives). |
| Test runner | Deno test | Vitest | External dependency, requires config. Deno test is built-in and sufficient for 10 test cases. |
| Agent model | sonnet (default) / opus (verifier) | haiku | Too weak for consolidation reasoning. Haiku 4.5 is fast but consolidation needs sonnet-level structured output. |
## Sources
- [Deno Releases (GitHub)](https://github.com/denoland/deno/releases) -- Deno 2.7.7, March 2026
- [Deno Configuration Docs](https://docs.deno.com/runtime/fundamentals/configuration/) -- deno.json, import maps, npm: specifiers
- [Deno Testing Docs](https://docs.deno.com/runtime/fundamentals/testing/) -- built-in test runner, assertions
- [Claude Code Skills Docs](https://code.claude.com/docs/en/skills) -- SKILL.md frontmatter reference, full field list
- [Claude Code Subagents Docs](https://code.claude.com/docs/en/sub-agents) -- Agent .md frontmatter reference, model options
- [unified (npm)](https://www.npmjs.com/package/unified?activeTab=versions) -- v11.0.5 latest
- [remark-parse (npm)](https://www.npmjs.com/package/remark-parse) -- v11.0.0 latest
- [remark-stringify (npm)](https://www.npmjs.com/package/remark-stringify) -- v11.0.0 latest
- [Agent Skills Standard](https://agentskills.io) -- Open standard Claude Code follows
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

### Content Authoring Rules

Skills, agents, and directives in cckit teach **structure and specificity level** — never prescribe domain-specific content. Claude already knows HTTP, gRPC, CLI patterns from training data; cckit's job is to direct behavior, not teach domains.

**Bias definition:** Content is biased if it assumes a specific communication protocol, storage mechanism, auth mechanism, architecture pattern, or project type.

**When bias is found:**
- Replace with structural placeholders (`[OperationName]`, `[error description] (ErrorName)`)
- NOT with "neutral-sounding concrete examples" — those still anchor to specific domains
- Non-biased content stays as-is

**No example exemptions:** All examples — whether educational, template, or illustrative — follow the same abstraction level. No "educational" exception for concrete domain examples.

**Specificity criterion:** "Be specific enough that a test can assert against it." This applies to all Expected Outcomes and behavioral descriptions.

**Extensible sections:** Use open format (`- [describe each X]`) instead of fixed category lists. Fixed categories anchor Claude to specific architecture patterns. Use fixed categories only when every item is meaningful across all project types.

**Adaptation instruction pattern:** One global instruction per skill ("adapt to host project") + inline annotations only where the gap between placeholder and correct output is non-obvious.

### Standard Vocabulary

| Term | Replaces | Why |
|------|----------|-----|
| `Caller:` | `Auth:` | Universal — HTTP sender, CLI invoker, library consumer all qualify |
| `[error description] (ErrorName)` | HTTP status codes, gRPC codes | Domain-level error identity; protocol mapping is implementation's concern |
| `[OperationName]` | Concrete operation names | Structural placeholder for any operation |
| Component | Service | Not all projects have services |
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Generated by GSD from questionnaire. Run `/gsd:profile-user --refresh` to update.

| Dimension | Rating | Confidence |
|-----------|--------|------------|
| Communication | conversational | MEDIUM |
| Decisions | deliberate-informed | MEDIUM |
| Explanations | detailed | MEDIUM |
| Debugging | diagnostic | MEDIUM |
| UX Philosophy | design-conscious | MEDIUM |
| Vendor Choices | thorough-evaluator | MEDIUM |
| Frustrations | instruction-adherence | MEDIUM |
| Learning | guided | MEDIUM |

**Directives:**
- **Communication:** Use a natural conversational tone. Explain reasoning briefly alongside code. Engage with the developer's questions.
- **Decisions:** Present options in a structured comparison table with pros/cons. Let the developer make the final call.
- **Explanations:** Explain the approach, key trade-offs, and code structure alongside the implementation. Use headers to organize.
- **Debugging:** Diagnose the root cause before presenting the fix. Explain what went wrong and why the fix addresses it.
- **UX Philosophy:** Invest in UX quality: thoughtful spacing, smooth transitions, responsive layouts. Treat design as a first-class concern.
- **Vendor Choices:** When a library or tool choice arises, proactively research alternatives: read docs, compare benchmarks, usability, ecosystem fit. Present a structured comparison table. However, when the developer explicitly names a specific tool, respect that choice. The final selection is always the developer's.
- **Frustrations:** Follow instructions precisely. Re-read constraints before responding. If requirements conflict, flag the conflict rather than silently choosing.
- **Learning:** Explain concepts in context of the developer's codebase. Use their actual code as examples when teaching.
<!-- GSD:profile-end -->
