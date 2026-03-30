# Project Research Summary

**Project:** cckit (Claude Code Toolkit)
**Domain:** v2.0 Universal Consolidation -- redesigning the consolidation pipeline from service-archetype-specific to project-type-agnostic
**Researched:** 2026-03-31
**Confidence:** HIGH (all research based on direct codebase analysis and official documentation)

## Executive Summary

The v1 consolidation pipeline is structurally sound but architecturally constrained. Its merge rules, hash tool, verification framework, and orchestrator-agent dispatch pattern are all proven and project-type-agnostic at their core. What is NOT agnostic is the vocabulary ("service", "archetype"), the template system (3 fixed archetype templates), the classification mechanism (archetype detection from PROJECT.md topology), and the E2E flow assumption (always-on). The v2 redesign is therefore a vocabulary/schema/template problem, not a technology or architecture problem. Zero new runtime dependencies are needed. The entire change happens in the prompt-engineering layer: skills, agents, and templates.

The recommended approach replaces fixed archetype templates with a user-authored schema that declares consolidation units and their section structures. The user defines what their project's components are and what sections their specs should contain. A sensible default covers 80% of projects without customization. This inverts the v1 model: instead of the plugin telling the project "you have domain services, gateways, and event processors," the project tells the plugin "I have these units with these sections." The `{Unit}.{Operation}` naming convention, the 11 merge rules, the hash-based change detection, and the parallel agent dispatch all carry forward unchanged.

The primary risk is navigating between over-abstraction (removing all structure, leaving agents with no guidance) and under-abstraction (renaming "service" to "component" without changing the underlying data model). Research identified one critical design decision that must be resolved before implementation: whether structure is defined via a schema file or via template files. All other decisions have strong consensus across researchers. Secondary risks include the load-bearing nature of the `{Service}.{Op}` naming convention (six consumption points across the codebase) and the verifier's service-specific checks (6 of 28 checks need updating).

## Key Findings

### Recommended Stack

No technology changes from v1. The entire v2 change is in the prompt-engineering layer.

**Core technologies (unchanged):**
- **Deno >= 2.7**: Runtime for hash-sections.ts -- already project-type-agnostic
- **unified 11.0.5 + remark-parse/stringify 11.0.0**: Markdown AST processing -- operates on structure, not content semantics
- **Web Crypto API**: SHA-256 hashing via crypto.subtle.digest -- zero dependencies
- **SKILL.md + Agent .md**: Claude Code plugin format -- content rewrites needed, format unchanged
- **sonnet (consolidator, e2e) + opus (verifier)**: Agent model assignments unchanged

**What changes:**
- 3 archetype template files -> 1 default + user override mechanism (or user-authored schema file -- see Critical Decision below)
- Template examples directory added (reference material, not consumed by pipeline)
- Test fixtures added for universal scenarios (generic component, CLI tool, library)

**What NOT to add:** No schema definition language, no project type detection, no template inheritance, no YAML/JSON config files, no runtime schema validation tool. Markdown is the schema language.

### Expected Features

**Must have (table stakes):**
- User-declared consolidation units (replaces fixed archetype classification)
- Default section structure that works for any project type without customization
- User-overridable section structures per unit (escape hatch for specific needs)
- All 11 merge rules (already universal -- operation replacement, PR-to-SR promotion, TR exclusion, etc.)
- `{Unit}.{Operation}` naming convention (universal; works for Auth.Login, CLI.ParseArgs, Parser.Tokenize)
- Component discovery from operation headings (unchanged algorithm, new terminology)
- `specs/{unit}/context.md + cases.md` output structure
- INDEX.md with "Component" + optional "Type" column

**Should have (differentiators):**
- Opt-in cross-unit flow documentation (replaces mandatory E2E flows)
- Universal verifier with schema-aware checks (parameterized against active schema, not hardcoded archetypes)
- Template/schema examples for common project types (microservice, CLI, library)
- Template validation check (V-04 generalized: schema-declared sections present)
- /case audit for service-biased language (low effort, mostly find-and-replace)

**Defer:**
- Template inheritance/composition -- wait for evidence that flat files are insufficient
- Template marketplace/sharing -- format must stabilize first
- Behavioral test DSL for conditional sections -- natural language conditions sufficient
- Auto-generating PROJECT.md topology -- out of scope for consolidation tool

### Architecture Approach

The architecture preserves the proven orchestrator-agent pipeline (SKILL.md state machine dispatching parallel spec-consolidator agents) while replacing the archetype-driven classification with schema-driven unit resolution. The orchestrator reads a structural declaration (schema or template files), extracts unit names from CASES.md headings, resolves section structure per unit, and dispatches agents with explicit section lists instead of template type tags. E2E flows become conditional (only when cross-unit communication exists). The hash tool requires zero changes.

**Major components (with v2 change level):**
1. **SKILL.md orchestrator** -- REWRITE: schema/template reading replaces archetype determination; unit terminology; E2E opt-in gate; bootstrapping flow
2. **spec-consolidator agent** -- MODIFY: receives `<sections>` instead of `<template_type>`; SR -> UR/SR rename; reads section list from dispatch, not template file
3. **spec-verifier agent** -- MODIFY: V-04, V-11, V-27 updated; checks parameterized against schema
4. **e2e-flows agent** -- MODIFY: unit terminology; opt-in gating by orchestrator
5. **case-briefer agent** -- MINOR: "service topology" -> "component topology" in a few lines
6. **hash-sections.ts** -- NO CHANGE: already universal
7. **/case skill** -- NO CHANGE: already largely universal
8. **templates/** -- REPLACE: 3 archetype files deleted, replaced by default + examples

### Critical Pitfalls

1. **"Service" is baked into the data model, not just the language** -- Renaming vocabulary without changing the underlying classification algorithm, dispatch granularity, and directory layout produces a cosmetically neutral tool that still only works for services. Prevention: define the universal unit abstractly first, test the design against CLI tool + library + documentation project on paper before writing any code.

2. **Over-abstraction removes the structure that makes consolidation useful** -- The v1 archetypes are valuable because they tell the agent exactly what sections to produce. Remove them without replacement and the output becomes a formless dump. Prevention: user-defined section schemas with a sensible default that covers 80% of projects. The default must be opinionated (7-8 sections), not a blank page.

3. **`{Service}.{Op}` naming convention is load-bearing infrastructure** -- Six consumption points across the codebase parse this pattern programmatically. Changing it without updating all six simultaneously creates silent breakage in LLM-consumed prompts (degraded output quality, not error messages). Prevention: map all consumption points, update atomically, make the convention configurable via schema.

4. **Verifier's 28 checks assume service architecture** -- 6 of 28 checks are service-specific (V-04, V-10, V-11, V-15, V-27, V-29). Universalizing consolidation without updating the verifier generates false positives that erode trust. Prevention: re-derive checks from universal model, parameterize against active schema, make E2E checks conditional.

5. **Template extensibility anti-patterns** -- Inheritance, configuration explosion, and modification-based extension all fail in LLM-agent pipelines where behavior is non-deterministic. Prevention: composition over inheritance, schema is data not code, custom schemas completely replace defaults (no merging).

## Critical Design Decision: Schema File vs Template Files

**This is the single most important decision for requirements definition.** The four research streams produced two distinct approaches:

### Option A: Template Files (STACK.md, FEATURES.md)

A single `templates/default.md` ships with the plugin. Host projects override by placing files in `.planning/specs/_templates/{type}.md`. Three-level lookup: component-specific override -> project-wide override -> plugin default. Templates ARE the schema -- section headings define the structure, guide text below each heading instructs the agent.

**Pros:** Markdown templates are self-documenting. No new concepts (agents already read Markdown). No parser needed. Consistent with the "everything is prompt content" philosophy.

**Cons:** No explicit unit registry. Template resolution is prompt-instructed behavior (fuzzy). No place to configure operation-prefix format or rule-prefix naming.

### Option B: Schema File (ARCHITECTURE.md)

A single `.planning/consolidation.schema.md` authored by the host project. Contains a Units table (explicit registry), Meta section (operation-prefix, rule-prefix, e2e-flows toggle), default Sections block, and per-unit section overrides. No template files ship with the plugin -- only starter examples in `docs/examples/`.

**Pros:** Explicit unit registry (no guessing). Configurable naming conventions. E2E opt-in flag. Single source of truth. Orchestrator reads one file instead of probing filesystem.

**Cons:** New artifact for users to author. Bootstrapping needed for first run. More upfront friction.

### Recommendation

**Option B (schema file) is stronger.** The explicit unit registry eliminates the ambiguity in template-based discovery. The meta section provides a clean place for configuration that otherwise has no home. The bootstrapping UX ("No schema found -- create from starter?") is already a pattern the v1 IMPL-SPEC uses for error recovery. The schema file is still Markdown, still self-documenting, still readable by agents without a parser.

The template approach (Option A) works for the "what sections should specs have?" question but does not answer "what units exist?" or "what naming convention does this project use?" -- those answers must come from somewhere, and a schema file consolidates them.

**This decision should be validated during requirements definition** -- both approaches are implementable, but the choice affects every downstream phase.

## Implications for Roadmap

Based on research, the v2 work decomposes into 5 phases (down from 8 in v1, because the hash tool is complete and several v1 phases collapse).

### Phase 1: Universal Model Design
**Rationale:** Everything downstream depends on the unit/schema/naming decisions. This phase produces the conceptual foundation: what is a unit, how are units declared, what sections do specs contain, what is the naming convention.
**Delivers:** Consolidation schema format specification, default section list, naming convention definition, verification check redesign sketch
**Addresses:** T1 (user-declared topology), T2 (schema-free templates), the "component" vs "unit" terminology decision, SR vs UR vs CR prefix decision
**Avoids:** Pitfall 1 (service data model), Pitfall 2 (over-abstraction), Pitfall 3 (naming convention)

### Phase 2: Schema System + Consolidator Agent
**Rationale:** The consolidator is the core agent. It needs the schema system to know what to produce. These are tightly coupled and should ship together so the consolidation pipeline is end-to-end testable.
**Delivers:** Schema format (or template system), spec-consolidator agent rewrite, default section structure, example schemas for 3 project types
**Addresses:** T2 (templates), T3 (merge rules -- carry-over), T4 (output structure)
**Avoids:** Pitfall 5 (no replacement discovery mechanism), Pitfall 6 (extensibility anti-patterns)

### Phase 3: Orchestrator Rewrite
**Rationale:** The orchestrator (SKILL.md) wires everything together. It depends on the schema system (Phase 2) and drives the consolidator agent. Schema reading, unit resolution, conditional E2E gating, and bootstrapping flow all live here.
**Delivers:** Rewritten /consolidate SKILL.md, schema bootstrapping UX, conditional E2E dispatch, INDEX.md updates
**Addresses:** T1 (component discovery), T4 (output structure), conditional E2E
**Avoids:** Pitfall 1 (service classification in Step 1), Pitfall 8 (E2E assumes multi-service)

### Phase 4: Verifier + /case Updates
**Rationale:** The verifier and /case updates are independent of each other but both depend on the universal model being stable. Group them because both are modification work (not greenfield) and both are lower risk.
**Delivers:** Universal spec-verifier with schema-aware checks, /case language audit, case-briefer terminology fixes
**Addresses:** Verification (differentiator), T5 (/case audit)
**Avoids:** Pitfall 7 (verifier assumes services), Pitfall 10 (/case service language)

### Phase 5: Cross-Unit Flows + Polish
**Rationale:** E2E flows are opt-in and may not be needed by any immediate test project. Defer until the core pipeline is proven. Polish includes migration guide, template library, backfill docs.
**Delivers:** Opt-in cross-unit flow generation, migration guide for v1 users, template example library, consumer updates (case-briefer reads specs/ first)
**Addresses:** E2E differentiator, migration, documentation
**Avoids:** Pitfall 8 (E2E for non-service projects)

### Phase Ordering Rationale

- **Phase 1 before everything**: The model design decisions (unit definition, schema format, naming convention) are load-bearing. Getting them wrong means rewriting Phases 2-5.
- **Phase 2 before Phase 3**: The orchestrator dispatches the consolidator. The consolidator must exist and be testable before the orchestrator can wire it up.
- **Phase 3 before Phase 4**: The verifier checks the orchestrator's output. The /case updates reference the universal model vocabulary established in earlier phases.
- **Phase 5 last**: E2E flows are opt-in and the lowest priority feature. Migration/polish only matter after the core pipeline works.
- **Phase 4 items can partially parallel Phase 3**: /case language audit is independent of the orchestrator rewrite.

### Research Flags

Phases likely needing `/gsd:research-phase` during planning:
- **Phase 1:** Critical. The schema format decision (template files vs schema file) needs concrete examples worked out for 3 project types before implementation.
- **Phase 2:** Moderate. Default section list needs validation -- the 7-8 section proposals from STACK.md and FEATURES.md differ slightly and must be reconciled.

Phases with standard patterns (skip research):
- **Phase 3:** The orchestrator is a state machine rewrite with well-understood steps. The v1 IMPL-SPEC provides the exact structure to modify.
- **Phase 4:** Verifier check updates and /case language fixes are mechanical. PITFALLS.md provides the exact line numbers and replacements.
- **Phase 5:** E2E flow modification is straightforward once the universal model is established.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Zero technology changes. All research confirmed v1 stack is already universal at the runtime layer. |
| Features | HIGH | Clear table stakes / differentiator / anti-feature separation. All 11 merge rules confirmed universal. Strong consensus across researchers. |
| Architecture | HIGH | Derived from complete codebase analysis. Pipeline pattern proven in v1. Changes are well-scoped (vocabulary, schema, template). |
| Pitfalls | HIGH | All pitfalls derived from direct code analysis with specific line numbers. Concrete prevention strategies provided. |

**Overall confidence:** HIGH

### Gaps to Address

- **Schema format vs template files**: The critical design decision. Both approaches are well-articulated but the choice must be made before Phase 1 planning. Recommend resolving during requirements definition by working through a concrete CLI-tool example with each approach.

- **Default section list**: STACK.md proposes 5 mandatory + 3 conditional sections (Purpose, Interface, Rules, Dependencies, Configuration + State Management, Error Categories, Event Contracts). FEATURES.md proposes 7 mandatory + 1 conditional (Overview, Public Interface, Domain Model, Behavior Rules, Error Handling, Dependencies, Configuration + State Lifecycle). These need reconciliation -- the right answer is probably 5-6 mandatory sections that pass the "does this make sense for a CLI tool?" test.

- **Terminology: "component" vs "unit"**: STACK.md and FEATURES.md use "component". ARCHITECTURE.md uses "unit" (and proposes UR prefix). Both work. "Unit" is more abstract and shorter in schemas; "component" is more intuitive for developers. Recommendation: use "component" in user-facing text, allow either in documentation. The rule prefix question (SR "Spec Rule" vs UR "Unit Rule" vs CR "Component Rule") needs a decision.

- **Conditional section evaluation**: FEATURES.md flags this as an open question. Can the consolidation agent reliably evaluate natural language conditions ("Does this component manage stateful entities?")? Recommendation from FEATURES.md: start with user-declared conditions (in schema or template), defer agent inference.

- **Operation prefix configurability**: ARCHITECTURE.md proposes making `{unit}.{operation}` configurable via schema (some projects use `module::function` or flat names). This interacts with the six consumption points identified in Pitfall 3. Needs design attention in Phase 1.

## Sources

### Primary (HIGH confidence)
- `docs/IMPL-SPEC.md` -- v1 design document, 891 lines, full analysis
- `skills/consolidate/SKILL.md` -- v1 consolidate skill, 203 lines
- `skills/case/SKILL.md` -- /case orchestrator, 231 lines
- `skills/case/step-*.md` -- all /case step files, full analysis
- `agents/case-briefer.md` -- 299 lines, service-bias audit
- `agents/case-validator.md` -- 257 lines, confirmed universal
- `tools/hash-sections.ts` -- confirmed universal, no changes needed
- `.planning/PROJECT.md` -- project context and neutrality constraints
- [Claude Code Skills Docs](https://code.claude.com/docs/en/skills) -- SKILL.md format, `${CLAUDE_SKILL_DIR}` reference (March 2026)
- [Claude Code Subagents Docs](https://code.claude.com/docs/en/sub-agents) -- Agent .md format (March 2026)

### Secondary (MEDIUM confidence)
- [Agent Skills Standard](https://agentskills.io) -- open standard for skill format
- [W3C/FAST Component Spec Template](https://eisenbergeffect.medium.com/writing-component-specs-111f154d6f46) -- overview + dependencies + API + behavior pattern
- [Red Hat Software Catalog Templates](https://developers.redhat.com/articles/2026/01/19/depth-look-software-catalog-and-templates) -- type field flexibility pattern
- Template example section lists (microservice, CLI, library) -- speculative, need validation

### Tertiary (LOW confidence)
- Default section list specifics -- both proposals are informed guesses that need validation against real projects
- Conditional section evaluation reliability -- untested with current agent models

---
*Research completed: 2026-03-31*
*Ready for roadmap: yes*
