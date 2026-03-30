# Feature Landscape: Universal Consolidation Model

**Domain:** Project-type-agnostic spec consolidation for Claude Code toolkit
**Researched:** 2026-03-31
**Supersedes:** Previous FEATURES.md (2026-03-30, service-specific IMPL-SPEC analysis)
**Research mode:** Ecosystem + Feasibility

## The Core Problem

The v1 IMPL-SPEC has 144 lines referencing service/archetype/protocol-specific terms. Three fixed archetypes (domain-service, gateway-bff, event-driven) assume the host project is a microservice backend. The entire consolidation pipeline -- from service classification to template selection to verification checks -- is wired to this assumption.

The universal model must pass the CLAUDE.md neutrality test: **Could a team using any project type -- web services, CLI tools, mobile apps, libraries, documentation, system software, or non-code projects -- install this and use it without editing the plugin?**

This means every concept in the consolidation pipeline must be re-examined: What is the unit being consolidated? What determines its structure? Where does the template come from?

## What "Consolidation Unit" Means Without "Service"

**Finding:** No existing tool, framework, or standard provides a universal consolidation unit that works across all project types. ADRs (Architecture Decision Records) come closest but are decision-focused, not spec-focused. The W3C/FAST component spec pattern (overview + dependencies + API surface + behavior) is project-type-neutral but still needs customization.

**Recommendation: "Component" as the universal unit.**

A "component" is the smallest independently specifiable unit in the host project. What that means depends on the project:

| Project Type | Component Examples |
|-------------|-------------------|
| Microservice backend | auth service, gateway, user service |
| CLI tool | `init` command group, `config` subsystem, output formatter |
| Library/SDK | public API module, plugin interface, serialization layer |
| Mobile app | authentication flow, offline sync engine, push notification handler |
| Desktop app | file manager, preferences system, plugin host |
| Game | combat system, inventory, save/load |
| Documentation project | style guide, API reference, tutorial pipeline |
| System software | scheduler, memory allocator, device driver |
| Monolith | billing module, notification module, search module |

**The key insight:** The user defines what their components are. The tool does not classify or guess. The host project's PROJECT.md declares components in a topology table, and the consolidation tool trusts that declaration.

**Confidence: HIGH** -- This is a design decision, not a discovery. The evidence supports it: every project type naturally decomposes into components, but what a component IS varies too much to automate classification.

## Table Stakes

Features the universal model must have or it fails the neutrality test.

### T1: User-Declared Component Topology

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Component declaration in PROJECT.md | Replaces the 3-archetype classification system. Users declare their components and (optionally) their types. Without this, the tool guesses -- which the v1 IMPL-SPEC explicitly rejected for service classification. | Low | Simple table: `Name, Type (optional), Description`. No fixed type vocabulary. |
| No fixed archetype vocabulary | The v1 archetypes (domain-service, gateway-bff, event-driven) are backend-specific. A CLI tool has no "gateway." A library has no "event-driven service." Fixed archetypes fail the neutrality test. | N/A (removal) | Removing code is negative complexity. The challenge is replacing what archetypes provided: template selection. |
| Component discovery from operation headings | Retain v1's primary classification signal: `## {Component}.{Operation}` heading patterns in CASES.md. This pattern is already project-type-neutral -- it just used service names as the component prefix. | Low | Rename "service" to "component" in the scanning logic. The algorithm is identical. |
| Fallback to PROJECT.md topology scan | Retain v1's secondary classification signal: scan CONTEXT.md for component names matching PROJECT.md entries. | Low | Same algorithm, different terminology. |
| On-miss: ask the developer | Retain v1's error-on-miss behavior. No keyword guessing. | Low | Already designed correctly. |

### T2: Schema-Free Templates (Convention Over Configuration)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Default template with universal sections | Replace 3 archetype-specific templates with ONE default template that works for any component. Sections must be abstract enough for any project type. | Med | See "Default Template Design" below. |
| User-overridable templates | Host project can provide custom templates at `.planning/specs/_templates/{type}.md` that override the default. This is how a microservice project gets its domain-service sections back. | Med | Filesystem convention: template exists = use it. No template = use default. |
| Template type field in topology (optional) | Components can optionally declare a type in PROJECT.md topology that maps to a custom template. Untyped components use the default. | Low | `Type` column in topology table. Blank = default. |
| Conditional sections (behavioral test) | Some sections only apply when conditions are met. The condition is a behavioral test, not a type check. Example: "State Lifecycle" section appears when the component manages stateful entities, regardless of whether it's a service, CLI subsystem, or game mechanic. | Med | Section metadata in template: `<!-- condition: manages stateful entities -->`. Agent evaluates at consolidation time. |

### T3: Merge Rules (Universal)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Operation-level replacement | Identical to v1. Latest phase wins the entire operation section. Project-type-neutral -- operations exist in every project type. | Med | No change needed. |
| PR-to-SR promotion | Identical to v1. Phase Rules promote to Component Rules. Rename "Service Rule" to "Component Rule" in output (prefix stays SR for familiarity, or becomes CR). | Med | Terminology decision needed: SR vs CR prefix. See Pitfalls. |
| TR exclusion | Identical to v1. Temp rules never enter specs. | Low | No change needed. |
| R-to-OR transformation | Identical to v1. Operation Rules renamed at consolidation time. | Low | No change needed. |
| GR reference-only | Identical to v1. Global Rules referenced, never duplicated. | Low | No change needed. |
| Provenance tagging | Identical to v1. `(Source: Phase {id})` inline. | Med | No change needed. |
| Forward Concerns exclusion | Identical to v1. | Low | No change needed. |
| Superseded operations removal | Identical to v1. | Med | No change needed. |
| Superseded rules skip | Identical to v1. | Low | No change needed. |

**Key finding:** All 11 merge rules are already project-type-neutral. They operate on operations, rules, and sections -- none of which assume a specific project type. The bias was in templates and classification, not merge logic.

### T4: Output Structure (Universal)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| `specs/{component}/context.md` | Identical structure to v1, but "service" -> "component" in all generated text. | Low | Path structure is already universal. |
| `specs/{component}/cases.md` | Identical to v1. Cases are behavioral -- they work for any component type. | Low | No structural change. |
| `specs/INDEX.md` | Replace "Archetype" column with "Type" column (blank for untyped). Replace "Services" heading with "Components". | Low | Cosmetic rename + optional column. |
| No `specs/e2e/` by default | E2E cross-component flows are a differentiator, not table stakes. Many project types (libraries, CLI tools, documentation) have no meaningful cross-component flows. Generating empty e2e/ directories fails the neutrality test. | N/A (deferral) | E2E flows become opt-in, not default. |

### T5: /case Skill Updates (Universal)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Audit /case for service-biased language | /case SKILL.md currently says "Service" in rule examples and operation naming. Must use "Component" or be truly generic. | Low | Text replacement + review. No structural change to the skill. |
| PR/TR rule distinction | Same as v1. Not project-type-specific. | Med | Already correctly designed. |
| Superseded Operations section | Same as v1. Not project-type-specific. | Med | Already correctly designed. |
| Superseded Rules section | Same as v1. Not project-type-specific. | Low | Already correctly designed. |
| OR-N prefix (native) | Same as v1. Not project-type-specific. | Low | Already correctly designed. |

## Default Template Design

The default template must work for ANY component type without modification. Sections must be abstract enough to be meaningful for a web service, CLI command group, library module, game system, or documentation pipeline.

**Recommended default sections for `context.md`:**

| # | Section | What It Captures | Why Universal |
|---|---------|-----------------|---------------|
| 1 | **Overview** | One-paragraph description of what this component does and why it exists | Every component has a purpose |
| 2 | **Public Interface** | Operations, functions, commands, endpoints, events -- whatever this component exposes to consumers | Every component has a boundary |
| 3 | **Domain Model** | Entities, types, data structures this component owns | Most components manage some data |
| 4 | **Behavior Rules** | Business rules, constraints, invariants governing how this component operates | Any component with behavioral logic has rules |
| 5 | **Error Handling** | Error categories, failure modes, recovery strategies | Any component can fail |
| 6 | **Dependencies** | What this component requires from other components or external systems | Most components have dependencies |
| 7 | **Configuration** | Tunable parameters, environment variables, settings | Most components have configuration |
| 8 | **State Lifecycle** | (conditional) Stateful entity lifecycle transitions | Only for components managing stateful entities |

**What changed from v1 archetypes:**
- "Adapter Contracts" (hexagonal architecture jargon) -> "Public Interface"
- "Service Interface" (assumes service) -> part of "Public Interface"
- "Cross-Service Dependencies" (assumes services) -> "Dependencies"
- "Route/Endpoint Table" (gateway-specific) -> available via custom template
- "Middleware Stack" (gateway-specific) -> available via custom template
- "Event Subscriptions/Publications" (event-driven-specific) -> available via custom template
- "Composition Patterns" (gateway-specific) -> available via custom template

**Confidence: MEDIUM** -- The section list is a best guess. It needs validation across 3-4 different project types. The conditional section mechanism (State Lifecycle) needs careful design to avoid becoming an implicit archetype system.

## Differentiators

Features that set the universal model apart. Not required but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Custom template library | Host project provides `.planning/specs/_templates/` with named templates. Components declare their type, type maps to template. This is how microservice projects recover domain-service/gateway sections. | Med | Convention-based: `_templates/{type}.md`. No registration, no config file. Template exists = available. |
| Template inheritance | Custom templates can extend the default by marking sections as `<!-- inherit -->`. Reduces duplication when a custom template only needs 2 extra sections. | Med | Nice for projects with many component types that share a common core. Defer if complexity unclear. |
| Cross-component flow documentation (opt-in E2E) | Replaces mandatory e2e-flows with opt-in. Host project declares flows in PROJECT.md or a `_flows/` directory. Only projects that need cross-component flow docs get them. | High | The hash-based change detection, Mermaid diagrams, and step tables are still valuable -- they just should not be assumed. |
| Verification agent (universal checks) | The 28-check verifier needs trimming. V-04 (archetype-appropriate sections) and V-11 (gateway routes resolve) are archetype-specific. Universal verifier checks structural integrity, provenance, and cross-references without assuming a template. | High | Reduce 28 checks to ~20 universal checks + template-specific check injection. |
| Template validation check | Verifier confirms that a component's spec sections match its declared template (default or custom). Replaces V-04's hardcoded archetype check. | Med | Template-aware, not archetype-aware. |
| Backfill strategy | Same as v1 -- enables adoption in projects with existing phases. | Med | Project-type-neutral already. |
| CLAUDE.md snippet template | Same as v1 but with "component" terminology. | Low | Cosmetic update. |
| Migration guide from v1 IMPL-SPEC | Projects that adopted the v1 service-specific structure need a path to universal. Rename specs/{service}/ -> specs/{component}/, update INDEX.md, update PROJECT.md topology. | Low | Documentation, not code. One-time task per host project. |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Automatic component type inference | Same reason v1 rejected keyword-based service classification. The tool cannot reliably guess whether a component is a "service," "module," "command group," or "subsystem." Wrong classification = wrong template = wrong sections. | User declares type in PROJECT.md topology. No type = default template. |
| Fixed archetype vocabulary | Any fixed set of types (even expanded beyond 3) will eventually fail for some project type. "Plugin host" is not a "service." "Combat system" is not a "module." The vocabulary is unbounded. | Open vocabulary. User-defined types. Templates are files, not enum values. |
| Template marketplace / sharing | Premature. The template format needs to stabilize first. Sharing templates across projects adds versioning, compatibility, and distribution problems. | Each project defines its own templates. If patterns emerge, extract manually. |
| Project type detection | Scanning for `Cargo.toml`, `package.json`, `Podfile`, etc. to infer project type is fragile, wrong for monorepos, and wrong for non-code projects. | User tells the tool what their project is via PROJECT.md. |
| Universal section renaming for v1 compatibility | Maintaining both "Service Interface" and "Public Interface" section names creates ambiguity. One name, one meaning. | Clean break. Migration guide for existing v1 users. |
| Mandatory E2E flows | Imposing cross-component flow documentation on projects that don't need it (single-component libraries, documentation projects) is anti-universal. | E2E flows are opt-in. Only generated when the project declares flows. |
| Behavioral test DSL for conditional sections | A formal DSL for section conditions (`when: manages_state AND has_events`) is over-engineering. The consolidation agent can evaluate natural language conditions ("Does this component manage stateful entities?"). | Natural language conditions in template comments. Agent evaluates during consolidation. |
| Auto-generating PROJECT.md topology | The tool should not scan the codebase to build the topology table. That's the developer's job (or a separate tool's job). Consolidation consumes the topology; it does not produce it. | Developer maintains PROJECT.md. `/consolidate` reads it. |

## Feature Dependencies

```
PROJECT.md topology declaration
    |
    v
Component discovery (from operation headings + topology scan)
    |
    v
Template resolution (default or custom from _templates/{type}.md)
    |
    +-------> spec-consolidator agent (uses resolved template)
    |              |
    |              v
    |         specs/{component}/context.md + cases.md
    |              |
    |              v
    |         INDEX.md update
    |              |
    |              +-------> [opt-in] E2E flows (hash tool -> e2e agent)
    |              |
    |              v
    |         spec-verifier (universal checks + template-specific checks)
    |              |
    |              v
    |         Confirmation summary + commit/rollback
    |
    v
/case skill (produces operation headings in {Component}.{Op} format)
    |
    +-------> PR/TR distinction
    +-------> Superseded Operations/Rules
    +-------> OR-N prefix
```

**What changed from v1 dependency graph:**
- Template resolution is now a distinct step (was implicit archetype lookup)
- E2E flows are a conditional branch (was always-on)
- Verifier checks are template-aware (was archetype-hardcoded)

## MVP Recommendation

The universal model changes what Phase 1 looks like. Templates and classification are simpler (no archetypes to implement), but the default template design is a new risk.

**Phase 1 -- Universal Core Pipeline:**

1. **Default template** (`context.md` with 7+1 universal sections) -- validate against 2-3 project type scenarios
2. **Custom template convention** (`_templates/{type}.md` filesystem lookup) -- the escape hatch
3. **spec-consolidator agent** with merge rules (all 11 rules carry over unchanged)
4. **SKILL.md orchestrator** (Steps 1-3, 6-7, terminology universalized, no E2E steps)
5. **INDEX.md** with "Component" + optional "Type" column
6. **/case audit** for service-biased language

Prioritize:
1. Default template design (highest risk -- wrong sections = wrong specs for entire project)
2. Custom template convention (escape hatch -- lets microservice projects recover v1 sections)
3. Merge rules in consolidator (carry-over, well-designed, low risk)

Defer:
- E2E flows: Opt-in, not default. Add when a project actually needs cross-component flow docs.
- Verification: Universal checks are a subset of v1's 28. Implement after the core pipeline proves correct.
- Template inheritance: Only needed if custom templates share significant structure. Wait for evidence.
- /case PR/TR distinction: Already designed. Implement when /case itself is being updated.

**Phase 2 -- Quality + Opt-In Features:**

1. **spec-verifier** with ~20 universal checks + template-specific check injection
2. **E2E flows** as opt-in with project declaration
3. **/case updates** (PR/TR, supersession, OR-N prefix)
4. **Consumer updates** (case-briefer, case-validator)

**Phase 3 -- Polish:**

1. **Migration guide** for v1 users
2. **Template library** examples (microservice, CLI, library archetypes as sample templates)
3. **Backfill strategy** documentation

## Complexity Assessment

| Component | Complexity | Risk | Change from v1 |
|-----------|------------|------|----------------|
| Default template design | Med | **High** | NEW. Wrong section choices affect all untyped components. |
| Custom template convention | Med | Low | NEW. Filesystem-based, simple resolution logic. |
| Terminology universalization | Low | Low | NEW. Rename "service" -> "component" across all artifacts. |
| spec-consolidator agent | High | Med | MODIFIED. Template resolution changes, but merge rules identical. |
| SKILL.md orchestrator | High | Med | MODIFIED. Simpler (no archetype determination step), but template resolution added. |
| Merge rules (11 total) | Med | Low | UNCHANGED. Already project-type-neutral. |
| INDEX.md format | Low | Low | MODIFIED. Column rename + optional Type. |
| /case audit | Low | Low | NEW. Text replacement, no structural changes. |
| E2E flows (opt-in) | High | Med | MODIFIED. Conditional execution path instead of always-on. |
| Verifier (universal) | High | Med | MODIFIED. Fewer checks, template-awareness added. |
| hash-sections.ts | Med | Low | UNCHANGED. Already project-type-neutral. |

## Open Questions

1. **Rule prefix: SR vs CR?** "Service Rule" becomes "Component Rule" in the universal model. Should the prefix change from SR to CR? Pro: consistency. Con: SR is already established in v1 users' projects, and "SR" could be reinterpreted as "Spec Rule" without a prefix change. **Recommendation:** Keep SR prefix, redefine as "Spec Rule." Avoids breaking change.

2. **Conditional section evaluation:** How reliable is the consolidation agent at evaluating natural language conditions ("Does this component manage stateful entities?")? If unreliable, conditional sections should be user-declared rather than agent-inferred. **Recommendation:** Start with user-declared (in topology table or template override). Agent inference is a future enhancement.

3. **Topology table format:** What columns does the universal topology table need? Minimum: `Name, Type (optional), Description`. Possible additions: `Status (active/deprecated)`, `Owner`, `Tags`. **Recommendation:** Minimum viable columns. Add columns when a real need emerges.

4. **Template section ordering:** Should the default template enforce section ordering, or should sections be unordered? The hash tool operates on H2 sections by heading name, so ordering is cosmetic. **Recommendation:** Templates define a recommended ordering. Agent follows it for new specs. Existing specs are not reordered.

5. **"Component" terminology in /case:** The /case skill uses `{Service}.{Operation}` format for operation headings. Should this become `{Component}.{Operation}`? The format is already abstract -- "Service" is just the prefix. But calling it "Component" in the skill's documentation is more accurate. **Recommendation:** Keep the `{X}.{Op}` format. Rename the documentation to use "Component" but do not force users to change their operation heading prefixes.

## Sources

- IMPL-SPEC.md (v1 design document, `/Users/syr/Developments/cckit/docs/IMPL-SPEC.md`) -- 144 lines of service-biased terminology identified
- PROJECT.md (project context with technology neutrality principle, `/Users/syr/Developments/cckit/.planning/PROJECT.md`)
- CLAUDE.md (neutrality test definition, `/Users/syr/Developments/cckit/CLAUDE.md`)
- /case SKILL.md (current skill with operation heading format, `/Users/syr/Developments/cckit/skills/case/SKILL.md`)
- /consolidate v1 SKILL.md (service-biased v1 skill, `/Users/syr/Developments/cckit/skills/consolidate/SKILL.md`)
- [Architecture Decision Records](https://adr.github.io/) -- closest existing pattern to project-agnostic spec consolidation; decision-focused not spec-focused
- [W3C/FAST Component Spec Template](https://eisenbergeffect.medium.com/writing-component-specs-111f154d6f46) -- overview + dependencies + API surface + behavior pattern
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills) -- filesystem-based progressive disclosure supports extensible templates
- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents) -- agent dispatch model unchanged
- [Red Hat Software Catalog Templates](https://developers.redhat.com/articles/2026/01/19/depth-look-software-catalog-and-templates) -- type field does not restrict values, organizations customize entities as fit
- [IEEE 830 SRS Template](https://github.com/jam01/SRS-Template) -- general template adaptable to different project needs
