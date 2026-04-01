# cckit

Personal Claude Code toolkit that packages behavioral quality standards as installable artifacts.

## Language

All content (code, docs, commit messages) in English.

## Structure

```
skills/        -- Claude Code skills (installed to .claude/skills/)
agents/        -- Agent definitions (installed to .claude/agents/)
directives/    -- Detailed behavioral guidelines (currently empty; guidelines are inline in CLAUDE.md)
tools/         -- Runtime tools (Deno): hash-sections, schema-bootstrap, schema-parser
docs/          -- Implementation specs, research, stack documentation
```

## Current Tools

### Skills

| Skill | Purpose | Status |
|-------|---------|--------|
| `/case` | Behavioral case discovery (S/F/E tables) for GSD phases | Working (migrated from madome) |
| `/consolidate` | Per-component spec consolidation after phase ship | Working (v2 validated) |

### Agents

| Agent | Used By | Model |
|-------|---------|-------|
| case-briefer | /case | sonnet |
| case-validator | /case | opus |
| spec-consolidator | /consolidate | sonnet |
| e2e-flows | /consolidate | sonnet |

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

**Core Value:** Encode behavioral quality standards as installable artifacts — so projects get consistent case discovery, spec consolidation, and code conventions without reinventing them. All artifacts must be project-type agnostic.

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

<!-- GSD:stack-start source:docs/STACK.md -->
## Technology Stack

- **Runtime:** Deno >=2.7 (hash-sections.ts)
- **Markdown AST:** unified 11 + remark-parse 11 + remark-stringify 11
- **Plugin format:** SKILL.md / Agent .md (YAML frontmatter + Markdown body)
- **Agent models:** sonnet (default), opus (verifier/validator)
- **Tests:** `deno test` (built-in)

Full details: `docs/STACK.md`
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
