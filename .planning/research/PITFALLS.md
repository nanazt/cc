# Domain Pitfalls: Universalizing a Domain-Specific Tool

**Domain:** Redesigning a service-oriented consolidation tool into a project-type-agnostic one
**Researched:** 2026-03-31
**Overall confidence:** HIGH (based on direct codebase analysis, not external sources)

This document catalogs pitfalls specific to the v2 universal redesign. It supersedes the v1 PITFALLS.md which covered implementation-level risks (AST serialization, parallel writes, SR renumbering). Those implementation pitfalls remain valid for execution phases but are not repeated here.

---

## Critical Pitfalls

Mistakes that cause rewrites or fundamental design failures. These block the redesign if not addressed.

### Pitfall 1: The "Service" Is Baked Into the Data Model, Not Just the Language

**What goes wrong:** You rename "service" to "component" or "unit" everywhere in user-facing text, but the underlying data model -- directory layout, file naming, agent dispatch granularity, INDEX.md structure -- still assumes a 1:1 mapping between "thing being consolidated" and "service with operations." A CLI tool project, a design system, or a documentation project has no natural "service" boundary, so the data model silently rejects them.

**Why it happens:** The v1 architecture is service-shaped at every level:
- `specs/{service}/context.md` -- directory-per-service
- `spec-consolidator` dispatched one-per-service in parallel
- `{Service}.{OperationName}` naming convention hardcoded throughout
- INDEX.md structured as a service table + operation index
- Service classification algorithm (Step 1) assumes `## {Service}.{Op}` headings exist

Renaming "service" to "component" in prose changes nothing if the code path still requires `## ComponentName.OperationName` headings to extract anything.

**Consequences:** The "universal" tool works perfectly for projects that happen to look like services, and fails silently or produces empty/wrong output for everything else. Users of CLI tools, libraries, or non-code projects get no value.

**Concrete examples in current codebase:**

| Location | Service Assumption | What Breaks |
|----------|-------------------|-------------|
| IMPL-SPEC lines 510-518 | Service classification: scan for `## {Service}.{Op}` headings | CLI tool has no `{Service}.{Op}` headings -- classification yields zero, triggers error |
| IMPL-SPEC lines 116-123 | Archetype from PROJECT.md "service topology table" | No service topology table in a CLI project's PROJECT.md |
| IMPL-SPEC line 7 | "classifies decisions by service" | What is the "service" in a single-binary CLI? |
| IMPL-SPEC line 132 | "Service Interface -- operations in `{Service}.{Op}` format" | A library exposes functions/methods, not `{Service}.{Op}` |
| consolidate SKILL.md line 20 | "per-service spec files at `.planning/specs/{service}.md`" | File path assumes service-as-directory |
| consolidate SKILL.md lines 66-69 | Hardcoded service name signals: "auth", "user", "catalog", "gateway" | A CLI project has none of these |
| case-briefer.md line 33 | "Service topology -- which services exist, their roles" | No services in a library project |
| case-briefer.md line 79 | "Scan CONTEXT.md for `{Service}.{OperationName}` patterns" | No such patterns in non-service projects |

**Prevention:**
1. Define the "consolidation unit" abstractly FIRST (before touching any code). The unit is "a coherent grouping of operations that share context" -- could be a service, module, command group, or the entire project.
2. Make the naming convention (`{Unit}.{Operation}`) configurable or discoverable from PROJECT.md, not hardcoded as `{Service}.{Op}`.
3. Redesign the directory layout to use the unit name: `specs/{unit}/` where unit is developer-defined.
4. The classification algorithm in Step 1 must support multiple discovery strategies, not just `## {Service}.{Op}` heading scan.

**Detection:** Try the design on paper against three project types: (a) microservice backend, (b) single-binary CLI with subcommands, (c) React component library. If any of the three can't produce meaningful output, the model is still service-shaped.

**Phase to address:** Phase 1 (Consolidation Model Redesign). This is foundational -- everything else builds on the unit definition.

---

### Pitfall 2: Over-Abstraction -- Making It So Generic It Loses All Value

**What goes wrong:** In the rush to remove service assumptions, you abstract away the structure that makes consolidation useful. The template becomes a blank page with no guidance. The agent prompt says "consolidate decisions into sections" without defining what sections are meaningful. The output is a formless dump that no downstream consumer (case-briefer, planner, executor) can reliably parse.

**Why it happens:** The v1 templates (domain-service, gateway-bff, event-driven) are valuable precisely because they tell the consolidator "a domain service needs Domain Model, Adapter Contracts, Business Rules, Error Categories, Service Interface, Configuration, Cross-Service Dependencies." Remove the archetype, and there is no guidance about what sections to produce.

**The spectrum:**
```
Too specific (v1)              Sweet spot               Too generic
3 fixed archetypes  ->  User-defined section schemas  ->  "Write whatever"
                        with sensible defaults
```

**Consequences:**
- Consolidator agent produces inconsistent output across runs (non-deterministic without structure)
- case-briefer can't find operations reliably (no predictable section to scan)
- Verifier has nothing to verify against (V-04 "archetype-appropriate sections" becomes meaningless)
- The tool produces output but it's not useful -- a slower form of failure

**Concrete risk in current codebase:**
- The 28-check verifier (IMPL-SPEC lines 747-795) has multiple checks that depend on archetype structure: V-04 (archetype-appropriate sections), V-11 (gateway routes resolve), V-27 (service topology match). Remove archetypes without replacing them with something equally structured, and half the verifier becomes dead code.
- case-briefer Step 4.6 searches for `{Service}.{OperationName}` patterns. Without a convention for how operations are named in specs, the briefer's lookup becomes a fragile text search.

**Prevention:**
1. Replace fixed archetypes with user-defined section schemas, NOT with no schemas. The default schema should cover 80% of projects without customization.
2. Provide a "starter schema" that projects adopt and customize. The starter schema encodes the same structural wisdom as v1's domain-service template but uses neutral language.
3. Keep the verifier checks but parameterize them against the active schema: "are the sections declared in the schema present in the output?"
4. The operation naming convention must exist (even if configurable). Without it, cross-referencing between specs, INDEX.md, and briefer output falls apart.

**Detection:** If you can't write a concrete example of what the consolidated output looks like for a CLI project, the abstraction is too thin.

**Phase to address:** Phase 1 (Consolidation Model Redesign). The schema system design determines the template phase.

---

### Pitfall 3: The "{Service}.{Op}" Convention Is Load-Bearing Infrastructure, Not Just a Label

**What goes wrong:** You treat `{Service}.{OperationName}` as a cosmetic convention that can be swapped to `{Unit}.{Op}` and everything works. In reality, this naming convention is a machine-readable contract that multiple components parse programmatically.

**Why it happens:** The naming convention appears in prose as a formatting guide, but it is actually a structural dependency used for:

1. **case-briefer operation discovery** (case-briefer.md line 79): grep for `{Service}.{OperationName}` patterns to cross-reference operations
2. **Service classification** (IMPL-SPEC line 510-512): scan `## {Service}.{Op}` headings to extract unique service names
3. **INDEX.md Operation Index** (IMPL-SPEC line 694): table columns assume `Operation | Service` decomposition
4. **E2E flow Ref column** (IMPL-SPEC line 318): `auth/cases.md#Auth.RegisterBegin` -- encodes both service path and operation heading
5. **Verifier V-03** (IMPL-SPEC line 779): regex check for `{Service}.{Op}` PascalCase format
6. **SKILL.md formatting** (consolidate SKILL.md line 29): "Required for briefer grep discoverability"

**Consequences:** Changing the naming convention without updating all six consumption points creates silent breakage. The briefer can't find operations. The verifier reports false positives. E2E flow references become dead links. Worse, because these are LLM-consumed prompts (not compiled code), the breakage manifests as degraded output quality, not error messages.

**Prevention:**
1. Map every location that parses or generates `{Service}.{Op}` patterns before changing anything. The list above is a starting point.
2. Define the new naming convention explicitly and mechanically (e.g., `{Unit}.{Op}` or `{Module}.{Op}`).
3. Update all six consumption points atomically. Partial migration = guaranteed breakage.
4. Consider whether the new convention needs a configurable separator or format, and if so, where that configuration lives (PROJECT.md? skill argument?).

**Detection:** Grep the entire codebase for `Service\.` and `{Service}` patterns. Every hit is a potential breakage point.

**Phase to address:** Phase 1 (model redesign defines the convention), then enforced across Phases 2-5 as each component is updated.

---

## Moderate Pitfalls

Mistakes that cause significant rework or degraded quality but don't invalidate the architecture.

### Pitfall 4: Under-Abstraction -- "Universal Language" Still Thinking in Services

**What goes wrong:** You rewrite all user-facing text to say "component" instead of "service," but the conceptual model embedded in the templates, prompts, and examples still assumes a service architecture. The section names, the example operations, the cross-reference patterns all encode service-oriented thinking.

**Concrete examples of hidden service thinking in current codebase:**

| Artifact | Surface Text (seems neutral) | Hidden Assumption |
|----------|------------------------------|-------------------|
| IMPL-SPEC domain-service template | "Adapter Contracts" (renamed from "Ports") | Assumes hexagonal architecture with adapters. A CLI tool has no adapters. |
| IMPL-SPEC domain-service template | "Cross-Service Dependencies" | Assumes multiple services exist. A monolith or CLI has internal module dependencies, not "cross-service" ones. |
| IMPL-SPEC gateway template | "Error Translation" (renamed from "Error Handling") | Assumes a gateway translating between protocols. |
| IMPL-SPEC gateway template | "Identity Propagation" | Assumes distributed identity across service boundaries. |
| IMPL-SPEC event-driven template | "Event Subscriptions" / "Event Publications" | Assumes pub/sub messaging between services. |
| case-briefer.md | "Cross-service interaction patterns" | Assumes multiple services interact. |
| step-discuss.md line 231 | "Downstream service timeout" | Assumes downstream services exist. |
| step-discuss.md line 246 | "`PERMISSION_DENIED (InsufficientQuota)` -- gRPC" | gRPC-specific error example in supposedly neutral context. |
| consolidate SKILL.md | "Service-centric. Classify by service, not by phase." (line 24) | Principle assumes services are the natural grouping. |

**The test from CLAUDE.md:** "Could a team using Python/Django, Rust/Axum, Go/gRPC, or Node/Express install this and use it without editing the plugin?" This test only covers backend services. The real test is: could a team building a CLI tool, a Figma plugin, a documentation site, or an Ansible playbook use this?

**Prevention:**
1. For each template section, ask: "What is the ROLE this section serves, independent of architecture?" E.g., "Adapter Contracts" -> "Integration Points" (things this component connects to). "Cross-Service Dependencies" -> "External Dependencies" (things this component requires from outside itself).
2. For examples in prompts, use diverse project types. Don't show only `Auth.RegisterBegin` -- also show `cli.ParseArgs`, `Button.Render`, `deploy.Validate`.
3. For the error format examples in step-discuss.md, show non-HTTP/non-gRPC examples first (domain error, CLI exit code), then protocol-specific ones.

**Detection:** Read each template section name and ask: "Does this section make sense for a CLI tool? A React component library? A Terraform module?" If the answer is no for any of these, the section name is service-biased.

**Phase to address:** Phase 2 (Template/Schema System). But the conceptual work happens in Phase 1 when defining what sections mean.

---

### Pitfall 5: Archetype Removal Without a Replacement Discovery Mechanism

**What goes wrong:** V1 uses PROJECT.md's service topology table to determine which archetype template to apply. V2 removes archetypes. But nothing replaces the discovery mechanism. The orchestrator doesn't know what section schema to apply because there is no source of truth for "what kind of thing is this consolidation unit?"

**Why it happens:** Removing fixed archetypes feels like simplification -- fewer moving parts. But the archetype served two roles: (a) a template for what sections to produce, and (b) a classification mechanism for knowing which template to apply. Removing (a) without replacing (b) leaves the system with no way to make decisions.

**Current dependency chain:**
```
PROJECT.md topology table -> archetype classification -> template selection -> agent dispatch with template
```

Remove the archetype, and either:
- The developer must explicitly declare the schema for each unit (high friction)
- The tool must infer it somehow (fragile)
- A default schema is always used (loses the specificity that made archetypes useful)

**Prevention:**
1. Replace the topology table with a more general "consolidation units" declaration in PROJECT.md. Each unit has a name and optionally a schema reference.
2. Provide a default schema that works for most units. Schema customization is opt-in, not required.
3. If a unit has no declared schema, apply the default. If a unit has a custom schema, use that.
4. The discovery mechanism becomes: read PROJECT.md -> find declared units -> look up their schemas -> dispatch accordingly.

**Phase to address:** Phase 1 (model redesign must define how units and schemas are declared).

---

### Pitfall 6: Template Extensibility Anti-Patterns

**What goes wrong:** The template/schema system is designed to be extensible, but the extensibility mechanism itself has common failure modes.

**Anti-pattern 6a: Extension by modification.** Users must fork and edit the default template to customize. This creates drift -- when the plugin updates the default template, user customizations are lost or conflict.

**Anti-pattern 6b: Extension by configuration explosion.** The schema has so many optional fields and conditional sections that the configuration itself becomes harder to understand than just writing the output manually.

**Anti-pattern 6c: Extension by inheritance.** A schema "extends" a base schema, and changes in the base silently change the derived schema in unexpected ways. Especially dangerous with LLM-consumed templates where a section rename in the base changes what the agent produces.

**Anti-pattern 6d: Extension by interception.** Users can add "hooks" or "plugins" to the consolidation pipeline. But hooks in an LLM-agent pipeline are fundamentally different from hooks in deterministic code -- the agent may or may not honor them, and there is no way to test hook behavior reliably.

**Prevention:**
1. **Prefer composition over inheritance.** A schema lists its sections explicitly. "Extending" means adding sections to the list, not inheriting from a base.
2. **Keep the extension surface small.** For v2, the only extension point should be: "declare additional sections in your schema." Not: hooks, plugins, conditional logic, or pipeline modifications.
3. **Schema is data, not code.** The schema is a markdown structure definition (section names + descriptions), not executable logic. The agent interprets it; the user only declares structure.
4. **Default schema is a recommendation, not a base class.** If a user defines a custom schema, it completely replaces the default for that unit. No merging, no inheritance.

**Phase to address:** Phase 2 (Template/Schema System design).

---

### Pitfall 7: The Verifier's 28 Checks Assume Service Architecture

**What goes wrong:** The verifier (spec-verifier agent) has 28 checks, many of which are service-specific. Universalizing the consolidation model without updating the verifier leaves it checking for things that don't exist in non-service projects, generating false positives that erode trust.

**Service-specific checks that need rethinking:**

| Check | What It Assumes | Problem for Non-Services |
|-------|-----------------|--------------------------|
| V-04 | "Archetype-appropriate sections present" | No archetypes in v2 |
| V-10 | "Cross-service operation references resolve" | No cross-service refs in a CLI tool |
| V-11 | "Gateway routes resolve" | No gateway |
| V-15 | "Error categories consistent across services" | May only have one unit |
| V-27 | "specs/ service list matches PROJECT.md service topology" | No service topology in non-service projects |
| V-29 | "E2E Spec References validity" | No E2E flows for a library |

**Prevention:**
1. Re-derive the verification checks from the universal model. Some checks generalize (V-04 becomes "schema-declared sections present"). Some become conditional (V-11 only runs if a gateway/routing unit exists). Some are removed.
2. The verifier reads the active schema to know what to check -- it doesn't hardcode archetype expectations.
3. E2E-related checks become conditional: only run when E2E flows are configured.

**Phase to address:** Phase 5 (Verifier Agent) -- but the check redesign should be sketched during Phase 1 so the model accounts for verification needs.

---

### Pitfall 8: E2E Flows Are Inherently Multi-Service -- What Replaces Them?

**What goes wrong:** E2E flow documentation (`specs/e2e/{flow}.md`) traces a user action across multiple services. For a single-unit project (CLI tool, library), E2E flows have no meaning. For a multi-module project that isn't service-based, the E2E concept needs reinterpretation.

**Risk:** Either E2E flows are kept as-is (only useful for service projects, breaking universality) or they are removed entirely (losing a genuinely valuable feature for projects that do have multiple interacting units).

**Prevention:**
1. Make E2E flow generation conditional: only triggered when multiple consolidation units exist and cross-unit dependencies are declared.
2. Rename from "E2E flows" to "cross-unit flows" or "interaction flows" -- the concept generalizes.
3. For single-unit projects, the E2E agent is simply not dispatched. The orchestrator checks the unit count and skips.

**Phase to address:** Phase 4 (E2E Flows Agent) -- but the conditional dispatch logic should be designed in Phase 1.

---

## Minor Pitfalls

### Pitfall 9: "Operation" May Not Be the Right Universal Term

**What goes wrong:** The term "operation" works for services (gRPC operations, REST endpoints) and CLIs (subcommands), but is awkward for other project types. A React component library's "operations" might be "render scenarios" or "user interactions." A Terraform module's "operations" might be "resource lifecycle actions."

**Prevention:** Keep "operation" as the default term but document that it means "a discrete unit of behavior that can be specified with success/failure/edge cases." Users will naturally adapt. Don't over-rotate on terminology -- the structure (S/F/E tables) is what matters, not the label.

**Phase to address:** Minor. Mention in documentation. No code change needed unless the term causes confusion during real usage.

---

### Pitfall 10: /case Skill Has Less Service Bias Than Expected, but Some Exists

**What goes wrong:** The /case skill is already largely technology-neutral (it talks about "operations," "callers," "expected outcomes"), but it has a few service-biased spots that would confuse users of non-service projects.

**Specific locations:**

| File | Line | Issue |
|------|------|-------|
| step-init.md | 62 | "architecture reference (service topology, patterns)" -- assumes PROJECT.md has service topology |
| step-discuss.md | 61 | "all services, all phases" -- language for SR-candidate discovery assumes services |
| step-discuss.md | 231 | "Downstream service timeout" -- infrastructure probe assumes downstream services |
| step-discuss.md | 246 | "`PERMISSION_DENIED (InsufficientQuota)` -- gRPC" -- protocol-specific example |
| case-briefer.md | 33 | "Service topology -- which services exist" -- extraction step assumes services |
| case-briefer.md | 79 | `{Service}.{OperationName}` pattern scan -- hardcoded naming format |
| case-briefer.md | 165 | "Service topology: [summary]" -- output template assumes services |

**Prevention:** Fix these individually. Most are one-line changes:
- "service topology" -> "project structure" or "component structure"
- "all services, all phases" -> "project-wide, all phases"
- "Downstream service timeout" -> "External dependency timeout"
- Add non-gRPC error examples alongside the gRPC one (already partially done -- line 244 shows domain-level and HTTP examples)

**Phase to address:** The /case review phase. Low effort, mostly find-and-replace with judgment.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Phase 1: Model Redesign | Pitfall 1 (service data model), Pitfall 2 (over-abstraction), Pitfall 3 (naming convention) | Define the universal unit, default schema, and naming convention together. Test against 3 project types on paper before coding. |
| Phase 2: Template/Schema | Pitfall 6 (extensibility anti-patterns), Pitfall 4 (under-abstraction in section names) | Composition over inheritance. Schema is data, not code. Neutral section names. |
| Phase 3: Consolidator Agent | Pitfall 1 (dispatch still per-service), Pitfall 3 (naming convention consumed by agent) | Agent dispatch uses unit names from Phase 1 model. Operation naming follows Phase 1 convention. |
| Phase 4: E2E / Cross-Unit | Pitfall 8 (E2E assumes multi-service) | Conditional dispatch. Skip for single-unit projects. |
| Phase 5: Verifier Agent | Pitfall 7 (checks assume services) | Re-derive checks from universal model. Parameterize against active schema. |
| /case Review | Pitfall 10 (minor service language) | One-line fixes in step files and briefer. |

## Artifacts Most Likely to Have Hidden Service Assumptions

Ranked by density of service-specific logic, highest risk first:

| Rank | Artifact | Risk Level | Service Assumption Density | Notes |
|------|----------|------------|---------------------------|-------|
| 1 | `docs/IMPL-SPEC.md` | CRITICAL | Very High | Entire document built around service topology, archetypes, `{Service}.{Op}` convention. Needs full rewrite, not patching. |
| 2 | `skills/consolidate/SKILL.md` | CRITICAL | High | Per-service file layout, hardcoded service signals (auth/user/catalog/gateway), service-centric principles. Full rewrite. |
| 3 | `agents/case-briefer.md` | MODERATE | Medium | Step 1 extracts "service topology," Step 4.6 scans for `{Service}.{Op}` patterns. Fixable with targeted edits. |
| 4 | Template files (Phase 2 not yet written) | MODERATE | High (by design) | v1 templates are archetype-specific. v2 templates are the replacement -- no legacy to fix, but risk of recreating the same bias. |
| 5 | `skills/case/SKILL.md` | LOW | Low | Mostly technology-neutral. Uses "operation" throughout. `{Service}.{Op}` format appears only in formatting examples. |
| 6 | `skills/case/step-discuss.md` | LOW | Low | A few service-specific examples (gRPC, downstream service). Easy fixes. |
| 7 | `skills/case/step-init.md` | LOW | Very Low | One reference to "service topology." |
| 8 | `agents/case-validator.md` | LOW | Very Low | Validates against planning artifacts, not services. No service-specific logic. |
| 9 | `skills/consolidate/hash-sections.ts` | NONE | None | Pure markdown AST tool. Already universal. |

## Sources

All findings derived from direct codebase analysis:
- `docs/IMPL-SPEC.md` -- full read, 891 lines
- `skills/consolidate/SKILL.md` -- full read, 203 lines
- `skills/case/SKILL.md` -- full read, 231 lines
- `skills/case/step-init.md` -- full read, 126 lines
- `skills/case/step-discuss.md` -- full read, 322 lines
- `skills/case/step-finalize.md` -- full read, 326 lines
- `agents/case-briefer.md` -- full read, 299 lines
- `agents/case-validator.md` -- full read, 257 lines
- `.planning/PROJECT.md` -- full read, 103 lines
- `CLAUDE.md` -- full read, Technology Neutrality section
