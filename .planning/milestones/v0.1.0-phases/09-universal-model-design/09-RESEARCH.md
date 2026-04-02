# Phase 9: Universal Model Design - Research

**Researched:** 2026-03-31
**Domain:** Documentation-only design specification -- defining the project-type-agnostic consolidation model
**Confidence:** HIGH

## Summary

Phase 9 is a pure documentation phase. It produces `docs/MODEL.md` (the model specification) and three starter schema examples in `docs/examples/`. No code changes, no agent rewrites, no IMPL-SPEC modifications. All 30 implementation decisions are locked in CONTEXT.md (D-01 through D-30), covering the default section list, rule prefix system, schema file format, component discovery, conditional sections, and merge rules. The research challenge is not "what to decide" but "how to structure the deliverables so they serve as the authoritative reference for Phases 10-14."

The primary risk is completeness: MODEL.md must contain enough specificity that Phase 10 (Schema System) and Phase 11 (Pipeline) can implement mechanically from the spec without requiring new design decisions. Every concept that downstream phases touch -- section definitions, naming conventions, rule tiers, discovery algorithm, conditional evaluation, merge rule adaptations -- must be defined in MODEL.md with enough precision that an implementer can write code (or prompts) directly from it.

**Primary recommendation:** Structure MODEL.md as a formal specification with numbered definitions, concrete examples for each concept, and a complete schema format reference. Use the three starter examples as validation artifacts -- each example should demonstrate every concept from MODEL.md applied to a specific project type.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** 7 mandatory sections + 2 conditional sections for `context.md`.
- **D-02:** Mandatory sections (FEATURES proposal, descriptive guide style):
  1. **Overview** -- What this component does and why it exists
  2. **Public Interface** -- Operations, commands, endpoints, or API surface this component exposes to consumers
  3. **Domain Model** -- Entities, types, and data structures this component owns
  4. **Behavior Rules** -- Business rules, constraints, and invariants governing this component's behavior
  5. **Error Handling** -- Error categories, failure modes, and recovery strategies
  6. **Dependencies** -- What this component requires from other components or external systems
  7. **Configuration** -- Environment variables, feature flags, and tunable parameters
- **D-03:** Conditional sections:
  - **State Lifecycle** -- Include when: component manages stateful entities with lifecycle transitions
  - **Event Contracts** -- Include when: component produces or consumes events/messages
- **D-04:** Neutrality test passed for web service, CLI tool, and library project types.
- **D-05:** Guide text style is descriptive (enumerates examples).
- **D-06:** cases.md format unchanged from v1.
- **D-07:** SR renamed to CR (Component Rule). Abbreviation changes from SR-N to CR-N.
- **D-08:** "Component" chosen over "unit" (avoids "unit test" association).
- **D-09:** PR to CR mechanical promotion, identical to v1's PR to SR.
- **D-10:** Operation naming format `{Component}.{Operation}` is fixed (not configurable).
- **D-11:** Full rule prefix system: GR-XX, CR-N, OR-N, PR-N, TR-N.
- **D-12:** "component" unified everywhere.
- **D-13:** Schema file explains terminology at the top.
- **D-14:** Schema approach: Option B (schema file), single `.planning/consolidation.schema.md`.
- **D-15:** Schema location: `.planning/consolidation.schema.md`.
- **D-16:** No per-component section overrides. All components use same 7+2 structure.
- **D-17:** Meta fields: version (1), rule-prefix (CR), e2e-flows (false).
- **D-18:** No `specs-dir` or `operation-prefix` meta fields.
- **D-19:** Bootstrapping: confirmation before creation.
- **D-20:** 3 starter schema examples in `docs/examples/`.
- **D-21:** 2-stage discovery: CASES.md headings primary, CONTEXT.md fallback, ask developer on miss.
- **D-22:** Schema is authoritative component registry.
- **D-23:** Schema synchronization: grows automatically, deletion/rename deferred to Phase 11.
- **D-24:** Conditional sections evaluated by agent inference from natural language conditions.
- **D-25:** Inclusion/exclusion reasoning logged as HTML comments in spec files.
- **D-26:** Future conditional sections added by updating cckit's default schema or user's own schema.
- **D-27:** All 11 v1 merge rules carry over unchanged in logic. Terminology changes only.
- **D-28:** Deliverable: `docs/MODEL.md`.
- **D-29:** Deliverable: 3 starter schema examples.
- **D-30:** No code changes in Phase 9.

### Claude's Discretion
- Internal structure and organization of docs/MODEL.md
- Exact content of starter schema examples (within the decided model)
- Section ordering within the schema format specification
- Wording of bootstrapping prompts and error messages

### Deferred Ideas (OUT OF SCOPE)
- Per-component section overrides -- deferred until proven necessary
- Schema synchronization details (deletion, rename) -- deferred to Phase 11
- Template inheritance/composition -- deferred per research recommendation
- Operation prefix configurability -- deferred. `{Component}.{Operation}` fixed for now
- IMPL-SPEC.md rewrite -- Phase 11 (PIPE-06)
- /case skill changes -- Phase 12 (CASE-01 through CASE-08)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MODEL-01 | User can declare consolidation units in a schema file without being constrained to predefined archetypes | D-14 (schema file approach), D-22 (schema is authoritative registry), D-13 (terminology explanation). MODEL.md must specify the Components table format and how units are declared. |
| MODEL-02 | User can define custom section structures per unit type via the schema | D-16 locks this to "no per-component overrides for now" -- all components use 7+2. MODEL.md must document this as a design constraint with the deferred override mechanism noted. |
| MODEL-03 | Components without a custom type use a sensible default section structure that works for any project type | D-01/D-02/D-03 define the exact 7+2 section list. D-04 confirms neutrality test passed. MODEL.md must include the full section definitions with guide text. |
| MODEL-04 | Schema includes meta configuration (operation-prefix format, rule-prefix naming, e2e-flows toggle) | D-17/D-18 define exactly 3 meta fields. MODEL.md must specify the Meta table format and field semantics. |
| MODEL-05 | Default section list passes the neutrality test (meaningful for web service, CLI tool, library, documentation project) | D-04 confirms test passed. The 3 starter examples (D-20/D-29) serve as concrete evidence. Each example must show all 7 mandatory sections producing meaningful content. |
</phase_requirements>

## Standard Stack

This phase produces documentation only. No runtime dependencies.

### Core
| Artifact | Format | Purpose | Why |
|----------|--------|---------|-----|
| `docs/MODEL.md` | Markdown | Model specification | Authoritative reference for Phases 10-14 |
| `docs/examples/schema-microservice.md` | Markdown (schema format) | Starter example | Demonstrates model for backend service projects |
| `docs/examples/schema-cli.md` | Markdown (schema format) | Starter example | Demonstrates model for CLI tool projects |
| `docs/examples/schema-library.md` | Markdown (schema format) | Starter example | Demonstrates model for library projects |

### Supporting
No supporting libraries. This is a documentation-only phase.

### Alternatives Considered
N/A -- deliverable format is locked (Markdown documentation).

## Architecture Patterns

### Recommended Document Structure for MODEL.md

```
docs/
├── MODEL.md                    # Model specification (primary deliverable)
├── IMPL-SPEC.md               # v1 design doc (untouched in Phase 9)
└── examples/
    ├── schema-microservice.md  # Starter schema: backend services
    ├── schema-cli.md           # Starter schema: CLI application
    └── schema-library.md       # Starter schema: reusable library
```

### Pattern 1: Specification-First Documentation

**What:** MODEL.md is structured as a formal specification, not a narrative explanation. Each concept has a definition, constraints, and examples. Downstream phases reference MODEL.md sections by heading.

**When to use:** When the document serves as the authoritative source of truth for multiple downstream implementers (Phases 10-14).

**Recommended MODEL.md structure:**

```markdown
# Consolidation Model

## Terminology
- Component definition
- "A component is the smallest independently specifiable unit..."

## Default Section Structure
- 7 mandatory sections (D-02) with full definitions and guide text
- 2 conditional sections (D-03) with inclusion conditions
- Neutrality test results

## Rule System
- Full prefix table (GR, CR, OR, PR, TR) with D-11
- PR to CR mechanical promotion (D-09)
- Merge rules (D-27) -- adapted from v1 with terminology changes

## Schema Format
- Complete schema file specification
- Meta section (D-17)
- Components table (MODEL-01)
- Section definitions block
- Conditional sections block

## Component Discovery
- 2-stage algorithm (D-21)
- Schema authority (D-22)
- Bootstrapping (D-19)

## Conditional Section Evaluation
- Agent inference mechanism (D-24)
- HTML comment logging (D-25)

## Examples
- Cross-reference to docs/examples/
```

### Pattern 2: Schema Examples as Validation

**What:** Each starter schema example must instantiate every concept from MODEL.md for a specific project type. The example is not just a template -- it is proof that the model works for that project type.

**When to use:** For the 3 examples (D-20, D-29).

**Structure for each example:**

```markdown
# Consolidation Schema

## Meta
| Key | Value |
|-----|-------|
| version | 1 |
| rule-prefix | CR |
| e2e-flows | {true for microservice, false for cli/library} |

## Components
| Component | Description |
|-----------|-------------|
| {name} | {what it does} |
| {name} | {what it does} |

## Sections: default
### Context Sections
1. **Overview** -- {project-type-specific guide text}
2. **Public Interface** -- {project-type-specific guide text}
...7 sections...

### Conditional Sections
- **State Lifecycle** -- Include when: {condition}
- **Event Contracts** -- Include when: {condition}
```

### Pattern 3: Cross-Reference Architecture

**What:** MODEL.md must be written with awareness that it will be consumed by multiple downstream agents and phases. Use stable section headings that can be referenced (e.g., "see MODEL.md ## Rule System").

**Anti-Patterns to Avoid:**
- **Narrative-heavy, reference-light:** MODEL.md that reads like an essay but cannot be precisely referenced by downstream agents. Use definitions, tables, and explicit constraints -- not flowing prose.
- **Duplicate content across examples:** The 3 examples should not repeat the model specification. They instantiate it. Full definitions live in MODEL.md only.
- **v1 language leakage:** Any residual "service", "archetype", "SR-N", "template_type" terminology in deliverables. These are superseded.
- **Implicit knowledge:** Concepts that are "obvious" from the discuss session but not written down. If Phase 11 needs it, MODEL.md must state it explicitly.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Schema format specification | Ad-hoc prose description | Formal format spec with field-level definitions in a table | Downstream parsers (Phase 10 orchestrator) need precise format, not narrative |
| Neutrality validation | Assumptions about section universality | Explicit examples in each starter schema showing what each section contains for that project type | Assertions without evidence are unconvincing; examples are proof |
| Merge rule adaptation | Rewrite merge rules from scratch | v1's 11 rules with 3 terminology substitutions (D-27) | Rules are already universal; only labels change |

## Common Pitfalls

### Pitfall 1: Specification Underspecification
**What goes wrong:** MODEL.md defines concepts at a high level but lacks the precision needed for mechanical implementation. Phase 10 (Schema System) or Phase 11 (Pipeline) hits ambiguities and must make design decisions that should have been made in Phase 9.
**Why it happens:** Phase 9 is "just documentation" so there is temptation to defer specifics to implementation phases.
**How to avoid:** For every concept in MODEL.md, ask: "Could an implementer write the code/prompt for this from the spec alone, without asking the designer a question?" If not, the spec is underspecified.
**Warning signs:** Sentences like "the orchestrator determines..." or "the agent evaluates..." without specifying the exact algorithm or criteria.

### Pitfall 2: v1 Terminology Leakage
**What goes wrong:** Residual "service", "SR-N", "archetype", "template_type" language appears in MODEL.md or examples because the author is deeply familiar with v1 and slips into old patterns.
**Why it happens:** v1 IMPL-SPEC has been the reference document for months. The terminology is deeply ingrained.
**How to avoid:** After writing MODEL.md, search for: "service" (except in the microservice example context), "SR-" (should be "CR-"), "archetype", "template_type", "SvcR", "domain-service", "gateway-bff", "event-driven". Each hit is a potential leak.
**Warning signs:** Section names or rule prefixes that match v1 terminology.

### Pitfall 3: Example Sections That Don't Pass the Neutrality Test
**What goes wrong:** The 7 mandatory sections produce meaningful content for the microservice example but have empty or forced content for the CLI or library examples, revealing that the section is not truly universal.
**Why it happens:** The section list was designed and validated primarily against service projects (the original domain).
**How to avoid:** Write the CLI and library examples FIRST. If any mandatory section feels forced or empty for those project types, the section definition or guide text needs adjustment. D-04 confirms the test was passed in the discuss session, but the concrete examples are the real proof.
**Warning signs:** Sections in non-service examples that contain only placeholder text or repetitive content.

### Pitfall 4: Schema Format Ambiguity
**What goes wrong:** The schema format specification in MODEL.md is ambiguous about parsing details. Phase 10 must decide: Is the Components table parsed by heading? By position? What if there is no Meta section? What if a section name has special characters?
**Why it happens:** Markdown-as-schema is intentionally lightweight, but lightness can become ambiguity.
**How to avoid:** Define the schema format with explicit parsing rules: "The Components table is identified by the `## Components` heading. Each row in the table below it defines one component. The table must have at least Component and Description columns." Cover edge cases: empty schema, missing sections, whitespace handling.
**Warning signs:** Format spec that works for the happy path but leaves edge cases undefined.

### Pitfall 5: Merge Rule Terminology Inconsistency
**What goes wrong:** MODEL.md documents merge rules using mixed v1/v2 terminology. Rule 2 says "PR to CR promotion" in the definition but examples still show "SR-N".
**Why it happens:** Copying from IMPL-SPEC (which uses v1 terms) and only partially updating.
**How to avoid:** Write the merge rules section from scratch using v2 terminology exclusively. Cross-reference against D-27 and D-11 for the complete prefix table.
**Warning signs:** Any occurrence of "SR-N" in the merge rules section (should be "CR-N").

### Pitfall 6: Conditional Section Evaluation Left Vague
**What goes wrong:** MODEL.md says "agent inference evaluates natural language conditions" but does not specify what the agent should look for, what constitutes evidence of a condition being met, or how to handle ambiguity.
**Why it happens:** D-24 defines the mechanism (agent inference) but not the evaluation criteria.
**How to avoid:** For each conditional section, specify: (1) the condition text, (2) what evidence in phase documents would trigger inclusion, (3) concrete examples of "include" vs "exclude" decisions, (4) the HTML comment format for logging the decision (D-25).
**Warning signs:** Conditional section definitions that provide a condition but no guidance on how to evaluate it.

## Code Examples

No code in this phase. All deliverables are Markdown documentation.

### Schema Format Example (for MODEL.md)

The complete schema format that MODEL.md must specify:

```markdown
# Consolidation Schema

A component is the smallest independently specifiable unit in your project.

## Meta

| Key | Value |
|-----|-------|
| version | 1 |
| rule-prefix | CR |
| e2e-flows | false |

## Components

| Component | Description |
|-----------|-------------|
| auth | Authentication and session management |
| user | User profile and account operations |

## Sections: default

### Context Sections
1. **Overview** -- What this component does and why it exists
2. **Public Interface** -- Operations, commands, endpoints, or API surface this component exposes to consumers
3. **Domain Model** -- Entities, types, and data structures this component owns
4. **Behavior Rules** -- Business rules, constraints, and invariants governing this component's behavior
5. **Error Handling** -- Error categories, failure modes, and recovery strategies
6. **Dependencies** -- What this component requires from other components or external systems
7. **Configuration** -- Environment variables, feature flags, and tunable parameters

### Conditional Sections
- **State Lifecycle** -- Include when: component manages stateful entities with lifecycle transitions
- **Event Contracts** -- Include when: component produces or consumes events/messages
```

### Merge Rule Terminology Mapping (for MODEL.md)

From D-27, the 3 terminology changes to document:

| Rule # | v1 Term | v2 Term |
|--------|---------|---------|
| 1 | `{Service}.{Op}` | `{Component}.{Op}` |
| 2 | PR to SR promotion | PR to CR promotion |
| 8 | "archetype sections" | "schema-defined sections" |

### Rule Prefix Reference (for MODEL.md)

From D-11:

| Prefix | Full Name | Scope | Example |
|--------|-----------|-------|---------|
| GR-XX | Global Rule | Project-wide, defined in PROJECT.md | GR-01: All timestamps use UTC |
| CR-N | Component Rule | Single component (promoted from PR at consolidation) | CR-1: Passwords require minimum 12 characters |
| OR-N | Operation Rule | Single operation | OR-1: Input email must be normalized to lowercase |
| PR-N | Phase Rule | Phase-scoped (promotes to CR at consolidation) | PR1: Rate limiting applies to all auth endpoints |
| TR-N | Temp Rule | Phase-scoped (excluded from specs, never consolidated) | TR1: Use mock SMTP during Phase 3 |

### HTML Comment Format for Conditional Sections (from D-25)

```markdown
<!-- State Lifecycle: Included -- CONTEXT.md mentions session state transitions: created -> active -> expired -->
## State Lifecycle
...

<!-- Event Contracts: Excluded -- No event production or consumption patterns found in phase documents -->
```

## State of the Art

| Old Approach (v1) | Current Approach (v2) | Decision | Impact |
|--------------------|----------------------|----------|--------|
| 3 fixed archetype templates | Single schema file per project | D-14 | Eliminates hardcoded project type assumptions |
| SERVICE as consolidation unit | COMPONENT as consolidation unit | D-08, D-12 | Universal vocabulary across all project types |
| SR-N (Service Rule) prefix | CR-N (Component Rule) prefix | D-07 | Prefix semantically matches universal model |
| Archetype classification from topology | 2-stage discovery from CASES.md + CONTEXT.md | D-21 | No archetype determination needed |
| Template files in plugin | Schema file in host project `.planning/` | D-14, D-15 | User-authored, not plugin-imposed |
| Mandatory E2E flows | E2E opt-in via schema flag | D-17 (e2e-flows: false) | Libraries and CLIs are not forced into multi-component flow docs |
| Per-archetype section lists | Single 7+2 section list for all components | D-16 | Simplicity; overrides deferred until proven necessary |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual review (documentation-only phase) |
| Config file | N/A |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MODEL-01 | Schema file allows declaring units without archetypes | manual-only | Review `docs/examples/` -- all 3 declare components freely | N/A |
| MODEL-02 | Custom section structures per unit type | manual-only | Review MODEL.md -- documents the deferred override mechanism | N/A |
| MODEL-03 | Default sections work for any project type | manual-only | Review all 3 examples -- each section has meaningful content | N/A |
| MODEL-04 | Meta configuration has defined home | manual-only | Review MODEL.md schema format -- Meta table with 3 fields | N/A |
| MODEL-05 | Default sections pass neutrality test | manual-only | Review CLI + library examples -- no forced/empty sections | N/A |

**Justification for manual-only:** Phase 9 produces specification documents, not executable code. Validation is structural review: does MODEL.md contain all required definitions? Do examples instantiate every concept? Are there terminology leaks?

### Sampling Rate
- **Per task:** Read deliverable, check against requirements
- **Phase gate:** All 5 success criteria from ROADMAP verified manually

### Wave 0 Gaps
None -- no test infrastructure needed for a documentation phase.

## Open Questions

1. **MODEL.md internal section ordering**
   - What we know: The concepts to cover are fully defined (D-01 through D-30)
   - What's unclear: The optimal ordering for downstream consumers. Should it be conceptual (terminology -> sections -> rules -> schema -> discovery) or use-case-driven (how to read a schema -> how to write a schema -> reference)?
   - Recommendation: Conceptual ordering. MODEL.md is a reference spec, not a tutorial. Agents will reference specific sections by heading, not read sequentially.

2. **Guide text specificity in examples**
   - What we know: D-05 says descriptive style. D-02 provides the base guide text for each section.
   - What's unclear: Should the starter examples use the exact same guide text as the default, or adapt it to the project type? E.g., "Public Interface" guide text for a CLI might emphasize "subcommands, flags, and output formats" vs the default "Operations, commands, endpoints, or API surface."
   - Recommendation: Use the default guide text in all examples. The guide text is descriptive enough to be interpreted per project type. Project-specific adaptation is the user's choice, not the starter's job. This also keeps examples simpler and demonstrates that the default works without modification.

3. **Depth of merge rule documentation in MODEL.md**
   - What we know: D-27 says all 11 rules carry over with 3 terminology changes. The full rule definitions exist in IMPL-SPEC.md.
   - What's unclear: Should MODEL.md replicate the full merge rule definitions, or reference IMPL-SPEC.md and only document the 3 changes?
   - Recommendation: MODEL.md should contain the complete merge rules in v2 terminology. IMPL-SPEC.md will be rewritten in Phase 11 (PIPE-06); until then MODEL.md is the authoritative source. Referencing a to-be-rewritten document creates a circular dependency.

4. **Bootstrapping prompt wording**
   - What we know: D-19 says confirmation before creation.
   - What's unclear: Exact wording is Claude's discretion per CONTEXT.md.
   - Recommendation: Include a sample bootstrapping prompt in MODEL.md so Phase 10 implementers have a reference, but mark it as "recommended wording" not "exact wording."

## Project Constraints (from CLAUDE.md)

- **Language:** All content in English
- **Technology neutrality:** Every artifact must work regardless of host project type, language, framework, or infrastructure
- **Neutrality test:** "Could any project -- regardless of type, language, or domain -- install this and use it without editing the plugin?"
- **No hardcoded project references:** Skills and agents must be technology-neutral and project-neutral
- **Commit conventions:** Conventional Commits 1.0.0, scope is a codebase noun (e.g., `docs(model): ...`), never phase numbers
- **GSD workflow:** Use GSD entry points for file changes
- **Content language:** All code, docs, commit messages in English

## Sources

### Primary (HIGH confidence)
- `09-CONTEXT.md` -- 30 locked decisions (D-01 through D-30) defining the complete model
- `.planning/REQUIREMENTS.md` -- MODEL-01 through MODEL-05 acceptance criteria
- `.planning/research/SUMMARY.md` -- Executive summary validating schema approach and stack decisions
- `.planning/research/ARCHITECTURE.md` -- Schema file format specification, dispatch changes, rule renames
- `.planning/research/FEATURES.md` -- Default section design (7+1 proposal that evolved to 7+2 via discuss)
- `.planning/research/STACK.md` -- Generic default sections (5+3 proposal, superseded by discuss decisions)
- `.planning/research/PITFALLS.md` -- 10 pitfalls with prevention strategies
- `docs/IMPL-SPEC.md` -- v1 design document (merge rules, verification checks, pipeline steps)
- `skills/consolidate/SKILL.md` -- v1 orchestrator (service-biased, to be rewritten in Phase 11)

### Secondary (MEDIUM confidence)
- `.planning/ROADMAP.md` -- Phase dependency graph and success criteria
- `.planning/STATE.md` -- Project state and accumulated context
- `.planning/PROJECT.md` -- Core value and constraints

### Tertiary (LOW confidence)
- Conditional section evaluation reliability -- D-24 commits to agent inference but real-world accuracy is untested. MODEL.md should document this as a known limitation with fallback guidance.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Phase produces documentation only; no stack decisions needed
- Architecture: HIGH -- All 30 decisions locked in CONTEXT.md; document structure is Claude's discretion
- Pitfalls: HIGH -- Derived from v2 research documents and direct analysis of CONTEXT.md gaps

**Research date:** 2026-03-31
**Valid until:** Indefinite (decisions are locked; only new discuss sessions could change them)
