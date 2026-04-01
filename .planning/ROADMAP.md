# Roadmap: cckit

## Milestones

- [x] **v1.0 Hash Tool** - Phase 1 (shipped)
- [ ] **v2.0 Universal Consolidation** - Phases 9-14 (in progress)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

<details>
<summary>v1.0 Hash Tool (Phase 1) - SHIPPED</summary>

- [x] **Phase 1: Hash Tool** - Deno SHA-256 section hashing with AST-based parsing and 10 test cases

Phases 2-8 from v1.0 are **superseded** by v2.0 requirements. They assumed fixed service archetypes which violates the technology neutrality principle.

</details>

### v2.0 Universal Consolidation

- [x] **Phase 9: Universal Model Design** - Define project-type-agnostic consolidation units, default sections, and naming conventions (completed 2026-03-31)
- [x] **Phase 10: Schema System** - User-authored schema file with bootstrap, overrides, and conditional sections (completed 2026-03-31)
- [x] **Phase 11: Consolidation Pipeline** - Orchestrator + consolidator agent rewrite with schema-driven dispatch and IMPL-SPEC (completed 2026-03-31)
- [x] **Phase 12: /case Updates** - Remove service bias, add PR/TR classification, supersession sections, OR-N prefix, specs/ lookup (completed 2026-04-01)
- [ ] **Phase 13: Verification** - Universal verifier with schema-parameterized checks and no false positives on non-service projects
- [ ] **Phase 14: Cross-Unit Flows** - Opt-in E2E flow generation with universal unit terminology and hash-based change detection

## Phase Details

### Phase 9: Universal Model Design
**Goal**: The consolidation model is defined in a way that works for any project type -- web service, CLI tool, library, documentation project
**Depends on**: Nothing (v1 hash tool carries over unchanged)
**Requirements**: MODEL-01, MODEL-02, MODEL-03, MODEL-04, MODEL-05
**Success Criteria** (what must be TRUE):
  1. A consolidation unit can be declared without selecting from predefined archetypes -- the user names it and the system accepts it
  2. Custom section structures can be defined per unit type, and these definitions are the authoritative source for what the consolidator produces
  3. A default section list exists that passes the neutrality test: each section name is meaningful whether the project is a web service, CLI tool, library, or documentation project
  4. Meta configuration (operation-prefix format, rule-prefix naming, e2e-flows toggle) has a defined home in the model
  5. The model specification is documented with concrete examples for at least 3 project types (microservice, CLI tool, library)
**Plans:** 2/2 plans complete
Plans:
- [x] 09-01-PLAN.md -- Write complete model specification (docs/MODEL.md)
- [x] 09-02-PLAN.md -- Create 3 starter schema examples and verify deliverables

### Phase 10: Schema System
**Goal**: Users have a concrete schema file they can author, and new projects get a working starter schema automatically
**Depends on**: Phase 9 (model defines what the schema must express)
**Requirements**: SCHEMA-01, SCHEMA-02, SCHEMA-03, SCHEMA-04
**Success Criteria** (what must be TRUE):
  1. Running `/consolidate` on a project with no schema file bootstraps a starter schema (with confirmation) that works immediately without edits
  2. User can override section structure for a specific unit type within the schema, and the override completely replaces the default for that type
  3. Conditional sections use behavioral conditions ("Does this component manage persistent state?") not type checks ("Is this a domain service?")
  4. Reference schema examples for at least 3 common project types ship as documentation
**Plans:** 2/2 plans complete
Plans:
- [x] 10-01-PLAN.md -- Update MODEL.md + examples with override syntax, create bootstrap tool
- [x] 10-02-PLAN.md -- Create schema parser with AST-based parsing, validation, and tests

### Phase 11: Consolidation Pipeline
**Goal**: The full consolidation cycle runs end-to-end using schema-driven dispatch instead of archetype classification
**Depends on**: Phase 10 (orchestrator reads schema; consolidator receives section list from schema)
**Requirements**: PIPE-01, PIPE-02, PIPE-03, PIPE-04, PIPE-05, PIPE-06
**Success Criteria** (what must be TRUE):
  1. Orchestrator reads the schema file to resolve unit names and their section structures -- no archetype classification step exists
  2. Consolidator agent receives an explicit section list via dispatch XML and produces output matching that structure exactly
  3. All 11 merge rules produce correct results with universal model (operation replacement, PR promotion, TR exclusion, latest-wins, provenance tagging)
  4. INDEX.md uses "Component" heading with optional "Type" column; `specs/{unit}/context.md` and `cases.md` are produced for each unit
  5. IMPL-SPEC.md is fully rewritten to reflect the universal design (no archetype references, schema-driven pipeline documented)
**Plans:** 3/3 plans complete
Plans:
- [x] 11-01-PLAN.md -- Rewrite orchestrator SKILL.md with schema-driven 7+2 step pipeline
- [x] 11-02-PLAN.md -- Create spec-consolidator and e2e-flows agents
- [x] 11-03-PLAN.md -- Rewrite IMPL-SPEC.md for universal v2 design

### Phase 12: /case Updates
**Goal**: /case skill and its agents produce output using universal vocabulary with PR/TR classification and supersession metadata
**Depends on**: Phase 9 (universal vocabulary must be stable before rewriting /case language)
**Requirements**: CASE-01, CASE-02, CASE-03, CASE-04, CASE-05, CASE-06, CASE-07, CASE-08
**Success Criteria** (what must be TRUE):
  1. /case skill text contains no service-biased language -- reading the skill prompts reveals no assumption that the target is a backend service
  2. case-briefer uses "component topology" instead of "service topology" and reads `specs/{unit}/cases.md` first, falling back to phase directories only when no spec exists
  3. /case discuss step prompts for PR (permanent) vs TR (temporary) classification on each rule; finalize step presents the full PR/TR list for review
  4. CASES.md output includes Superseded Operations and Superseded Rules tables when applicable; rules use OR-N prefix natively
  5. case-validator accepts TR-N, OR-N as valid rule formats and recognizes Superseded Operations/Rules as valid sections
**Plans:** 2/2 plans complete
Plans:
- [x] 12-01-PLAN.md -- Vocabulary migration and prefix unification across all /case files
- [x] 12-02-PLAN.md -- TR classification, supersession metadata, specs/ lookup, validator v2 completion

### Phase 12.1: /case Technology Neutralization (INSERTED)

**Goal:** All /case skill prompts and agent definitions contain zero technology-biased examples -- structural placeholders and rules teach format and quality bar while Claude adapts content to each host project's actual interfaces, protocols, and terminology
**Requirements**: CASE-01
**Depends on:** Phase 12
**Plans:** 2/2 plans complete

Plans:
- [x] 12.1-01-PLAN.md -- Neutralize SKILL.md (global adaptation instruction, canonical flow) and step-discuss.md (error naming block, side effects, inline examples)
- [x] 12.1-02-PLAN.md -- Neutralize step-finalize.md (output format, Expected Outcome), case-briefer.md, case-validator.md, delete README.md

### Phase 13: Verification
**Goal**: Verifier produces accurate findings on any project type without false positives from service-specific assumptions
**Depends on**: Phase 11 (verifier checks pipeline output; checks parameterized against active schema)
**Requirements**: VRFY-01, VRFY-02, VRFY-03
**Success Criteria** (what must be TRUE):
  1. Verifier checks are parameterized against the active schema -- section presence checks use schema-declared sections, not hardcoded lists
  2. The 6 service-specific checks (V-04, V-10, V-11, V-15, V-27, V-29) are either universalized or made conditional on schema configuration
  3. Running the verifier against a non-service project (CLI tool or library) produces zero false positives
**Plans**: TBD

### Phase 14: Cross-Unit Flows
**Goal**: Projects with cross-unit communication can opt into flow documentation; projects without it are unaffected
**Depends on**: Phase 11 (orchestrator dispatch infrastructure; hash tool from v1 for change detection)
**Requirements**: FLOW-01, FLOW-02, FLOW-03, FLOW-04
**Success Criteria** (what must be TRUE):
  1. E2E flow generation is controlled by a schema flag and defaults to off -- projects that do not set it never see flow-related prompts or output
  2. When E2E is disabled, the orchestrator skips all flow-related steps entirely (no hash computation, no agent dispatch, no flow output)
  3. When E2E is enabled, the flow agent uses universal unit terminology and hash-based change detection works with the universal unit directory structure
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 9 -> 10 -> 11 -> 12 -> 12.1 -> 13 -> 14
Note: Phase 12 depends only on Phase 9 and can run after Phase 9 completes, potentially parallel with Phases 10-11.

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Hash Tool | v1.0 | 2/2 | Complete | 2026-03-30 |
| 9. Universal Model Design | v2.0 | 2/2 | Complete   | 2026-03-31 |
| 10. Schema System | v2.0 | 2/2 | Complete    | 2026-03-31 |
| 11. Consolidation Pipeline | v2.0 | 3/3 | Complete    | 2026-03-31 |
| 12. /case Updates | v2.0 | 2/2 | Complete    | 2026-04-01 |
| 12.1. /case Technology Neutralization | v2.0 | 2/2 | Complete    | 2026-04-01 |
| 13. Verification | v2.0 | 0/0 | Not started | - |
| 14. Cross-Unit Flows | v2.0 | 0/0 | Not started | - |
