# Roadmap: cckit

## Milestones

- ✅ **v1.0 Hash Tool** — Phase 1 (shipped 2026-03-30)
- ✅ **v0.1.0 Universal Consolidation** — Phases 9-16 (shipped 2026-04-03)
- 🚧 **v0.2.0 Portable Conventions** — Phases 17-23 (in progress)

## Phases

<details>
<summary>✅ v1.0 Hash Tool (Phase 1) — SHIPPED 2026-03-30</summary>

- [x] **Phase 1: Hash Tool** — Deno SHA-256 section hashing with AST-based parsing and 10 test cases

Phases 2-8 from v1.0 are **superseded** by v0.1.0 requirements. They assumed fixed service archetypes which violates the technology neutrality principle.

</details>

<details>
<summary>✅ v0.1.0 Universal Consolidation (Phases 9-16) — SHIPPED 2026-04-03</summary>

- [x] Phase 9: Universal Model Design (2/2 plans) — completed 2026-03-31
- [x] Phase 10: Schema System (2/2 plans) — completed 2026-03-31
- [x] Phase 11: Consolidation Pipeline (3/3 plans) — completed 2026-03-31
- [x] Phase 12: /case Updates (2/2 plans) — completed 2026-04-01
- [x] Phase 12.1: /case Technology Neutralization (2/2 plans) — completed 2026-04-01
- [x] Phase 13: Verification (2/2 plans) — completed 2026-04-02
- [x] Phase 14: Cross-Unit Flows (2/2 plans) — completed 2026-04-02
- [x] Phase 15: Fix Artifact Paths and Remove Stale Doc (1/1 plan) — completed 2026-04-02
- [x] Phase 16: Align E2E Flows Dispatch Contract (1/1 plan) — completed 2026-04-02

Full details: [milestones/v0.1.0-ROADMAP.md](milestones/v0.1.0-ROADMAP.md)

</details>

### 🚧 v0.2.0 Portable Conventions (In Progress)

**Milestone Goal:** Research-driven, high-quality conventions packaged as installable artifacts with selective project installation. Open milestone -- convention phases can be added later.

- [x] **Phase 17: Convention Architecture** — Define layered convention file structure (base + language-specific) and authoring principles (completed 2026-04-03)
- [x] **Phase 18: /convention Skill** — Build the research-driven convention authoring tool (completed 2026-04-04)
- [ ] **Phase 19: First Convention — Commit** — Validate skill + architecture end-to-end with commit conventions
- [ ] **Phase 20: Installation Infrastructure** — Plugin manifest and convention distribution mechanism
- [ ] **Phase 21: Code Convention + Rust Code Tech Pack** — Coding conventions (base + Rust) via /convention skill
- [ ] **Phase 22: Test & Error Conventions + Rust Tech Packs** — Test and error handling conventions (base + Rust) via /convention skill
- [ ] **Phase 23: Documentation, Workflow & Security Conventions** — Remaining base conventions via /convention skill

## Phase Details

### Phase 17: Convention Architecture
**Goal**: Convention file structure and authoring principles are defined so that all downstream convention work follows a consistent, validated format
**Depends on**: Nothing (first phase of v0.2.0)
**Requirements**: ARCH-01, ARCH-02, ARCH-03, ARCH-04
**Success Criteria** (what must be TRUE):
  1. A convention architecture document exists that specifies base (tech-neutral, optional) and language-specific file locations, naming, and frontmatter format
  2. The architecture defines how language-specific conventions are organized per-language and opt-in via installer selection, with clear discoverability rules
  3. The architecture includes a "delta test" -- conventions only teach what the LLM does not already know or where user style diverges from defaults
  4. A base convention template exists that demonstrates standalone value without any language-specific convention
**Plans**: 1 plan

Plans:
- [x] 17-01-PLAN.md — Convention architecture document and requirements update

### Phase 18: /convention Skill
**Goal**: A `/convention` skill exists that can research, author, and validate convention files following the architecture from Phase 17
**Depends on**: Phase 17
**Requirements**: SKILL-01, SKILL-02, SKILL-03, SKILL-04, SKILL-05, SKILL-06, SKILL-07
**Success Criteria** (what must be TRUE):
  1. User can invoke `/convention` to research best practices for a named convention area and receive a structured summary of findings
  2. User can answer interactive questions about their style preferences, and the skill incorporates those preferences into the generated convention
  3. The skill generates convention files that follow ARCH rules -- base and tech pack are separate files in correct locations
  4. The skill identifies what the LLM already knows vs. what needs explicit teaching, and the generated convention only includes the delta
  5. The skill works when invoked from any project, not just cckit
**Plans**: Plan 01 (research, complete), Plan 02 (/convention skill entry point, complete), Plan 03 (step files — complete)
**UI hint**: yes
**Discuss notes**: Revisit D-01 boundary — are all conventions rules, or do some need to be skills (e.g., conventions requiring tool access or interactive workflows)?

Plans:
- [x] 18-01-PLAN.md — Convention researcher and generator agents
- [x] 18-02-PLAN.md — SKILL.md orchestrator and step-init
- [x] 18-03-PLAN.md — step-research, step-preferences, step-generate, step-update

### Phase 19: First Convention — Commit
**Goal**: A complete commit message convention exists (base + no tech pack needed), authored via `/convention`, validating the entire authoring pipeline end-to-end. A PreToolUse hook enforces convention rules on commit messages.
**Depends on**: Phase 18
**Requirements**: COMMIT-01
**Success Criteria** (what must be TRUE):
  1. A commit message convention file exists in the correct location per the architecture, with proper frontmatter
  2. The convention provides real value -- it teaches commit structure, scope conventions, and message quality rules that improve Claude's commit output
  3. The convention passes the ARCH-03 delta test -- it does not restate what the LLM already knows about conventional commits
  4. The convention is technology-neutral -- any project type can use it without modification
  5. A PreToolUse hook exists that injects convention content and mechanically validates commit messages
**Plans**: 2 plans

Plans:
- [ ] 19-01-PLAN.md — PROJECT.md identity update + commit convention via /convention skill
- [ ] 19-02-PLAN.md — PreToolUse convention injection and validation hook

### Phase 19.1: Convention Skill Improvements (INSERTED)

**Goal:** The /convention skill handles hooks, detects CLAUDE.md conflicts, maintains convention-hook sync on updates, scaffolds test infrastructure, and chooses the right output artifact type (rule vs skill) — addressing gaps discovered during Phase 19 execution.
**Requirements**: CONV-01 through CONV-14 (phase-local, mapped to scope items below)
**Depends on:** Phase 19
**Plans:** 4/4 plans complete

Scope:
1. Output artifact type selection -- skill judges whether convention is best expressed as a rule or skill; three-criteria test
2. Hook awareness + scaffolding integrated into step-generate -- generator produces hook + test + fixtures alongside convention
3. CLAUDE.md conflict detection -- step-generate light review cross-references existing project rules
4. Update-mode hook sync -- step-update auto-regenerates hook + test alongside convention
5. Research-to-Generator structured delta transfer -- [DELTA:new/known/varies] + [HOOK:yes/no] classification tags
6. Test infrastructure scaffolding -- auto-generated test.sh + fixtures/ when hooks are created
7. Post-generation user preferences verification -- step-generate validates output against collected preferences
8. convention_tools config activation -- step-init reads MCP tool names from cckit.json, passes to researcher
9. Step-to-step variable persistence -- .state/ directory with init.json, research.md, preferences.json
10. docs/CONVENTIONS.md full architecture update -- rule/skill binary, unified discovery, anti-pattern correction
11. Commit convention migration -- CONVENTION.md to SKILL.md with content preserved
12. Hook unified discovery path -- SKILL.md -> CONVENTION.md -> skills/ -> rules/
13. writing-skills integration -- generator invokes writing-skills for skill-type output
14. Filename convention -- Rule-type = CONVENTION.md, Skill-type = SKILL.md

Plans:
- [x] 19.1-01-PLAN.md — Architecture doc, orchestrator, and step-init foundation
- [x] 19.1-02-PLAN.md — Research pipeline: researcher agent, step-research, step-preferences
- [x] 19.1-03-PLAN.md — Generate pipeline: generator agent, step-generate overhaul
- [x] 19.1-04-PLAN.md — Update mode, commit migration, hook discovery, test fixtures

### Phase 20: Installation Infrastructure
**Goal**: Users can install, select, preview, and update cckit conventions in their projects
**Depends on**: Phase 19 (needs at least one convention to test against)
**Requirements**: INST-01, INST-02, INST-03, INST-04, INST-05, INST-06
**Success Criteria** (what must be TRUE):
  1. User can install cckit conventions into a host project with a single command
  2. User can configure which conventions to install via a config file, and only selected conventions are installed
  3. User can preview what an installation would change before committing to it (dry-run)
  4. Installer warns and requires confirmation before overwriting existing convention files in the host project
  5. User can update previously installed conventions to the latest version, and cckit can install its own conventions into itself
**Plans**: TBD

### Phase 21: Code Convention + Rust Code Tech Pack
**Goal**: Universal coding principles convention exists with a Rust-specific tech pack, validating the full base + tech pack layered architecture
**Depends on**: Phase 18 (uses /convention skill), Phase 17 (ARCH layering)
**Requirements**: CODE-01, CODE-R01
**Success Criteria** (what must be TRUE):
  1. A base coding convention exists that teaches universal principles (naming, structure, complexity, readability) without referencing any specific language
  2. A Rust code tech pack exists that layers Rust-specific idioms, patterns, and clippy rules on top of the base
  3. The base convention stands alone with real value -- a project without any tech pack installed still benefits
  4. The Rust tech pack extends (not duplicates) the base -- no content overlap between the two files
**Plans**: TBD

### Phase 22: Test & Error Conventions + Rust Tech Packs
**Goal**: Test and error handling conventions exist (base + Rust tech packs), authored via /convention skill
**Depends on**: Phase 18 (uses /convention skill)
**Requirements**: TEST-01, TEST-R01, ERR-01, ERR-R01
**Success Criteria** (what must be TRUE):
  1. A base test convention exists teaching universal test structure, naming, and organization principles
  2. A base error handling convention exists teaching universal error handling patterns (errors, logging, failure modes)
  3. Rust test tech pack exists (authored via /convention skill)
  4. Rust error handling tech pack exists (authored via /convention skill)
  5. All four conventions pass the delta test and technology-neutrality checks appropriate to their layer
**Plans**: TBD

### Phase 23: Documentation, Workflow & Security Conventions
**Goal**: Remaining base conventions complete the initial convention catalog
**Depends on**: Phase 18 (uses /convention skill)
**Requirements**: DOC-01, WFLOW-01, SEC-01
**Success Criteria** (what must be TRUE):
  1. A documentation convention exists teaching README structure, changelog format, and doc organization
  2. A workflow convention exists teaching branch strategy, PR format, and review practices
  3. A security convention exists teaching secrets handling, input validation, and baseline OWASP awareness
  4. All three conventions pass the delta test and are technology-neutral
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 17 -> 18 -> 19 -> 19.1 -> 20 -> 21 -> 22 -> 23
(Phases 21, 22, 23 can execute in any order after their dependencies are met)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Hash Tool | v1.0 | 2/2 | Complete | 2026-03-30 |
| 9. Universal Model Design | v0.1.0 | 2/2 | Complete | 2026-03-31 |
| 10. Schema System | v0.1.0 | 2/2 | Complete | 2026-03-31 |
| 11. Consolidation Pipeline | v0.1.0 | 3/3 | Complete | 2026-03-31 |
| 12. /case Updates | v0.1.0 | 2/2 | Complete | 2026-04-01 |
| 12.1. /case Technology Neutralization | v0.1.0 | 2/2 | Complete | 2026-04-01 |
| 13. Verification | v0.1.0 | 2/2 | Complete | 2026-04-02 |
| 14. Cross-Unit Flows | v0.1.0 | 2/2 | Complete | 2026-04-02 |
| 15. Fix Artifact Paths and Remove Stale Doc | v0.1.0 | 1/1 | Complete | 2026-04-02 |
| 16. Align E2E Flows Dispatch Contract | v0.1.0 | 1/1 | Complete | 2026-04-02 |
| 17. Convention Architecture | v0.2.0 | 1/1 | Complete    | 2026-04-03 |
| 18. /convention Skill | v0.2.0 | 3/3 | Complete    | 2026-04-04 |
| 19. First Convention — Commit | v0.2.0 | 0/2 | Not started | - |
| 19.1. Convention Skill Improvements | v0.2.0 | 4/4 | Complete    | 2026-04-06 |
| 20. Installation Infrastructure | v0.2.0 | 0/? | Not started | - |
| 21. Code Convention + Rust Code Tech Pack | v0.2.0 | 0/? | Not started | - |
| 22. Test & Error Conventions + Rust Tech Packs | v0.2.0 | 0/? | Not started | - |
| 23. Documentation, Workflow & Security Conventions | v0.2.0 | 0/? | Not started | - |
