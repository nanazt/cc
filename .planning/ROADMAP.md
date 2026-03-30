# Roadmap: cckit

## Overview

Build the consolidate v2 pipeline bottom-up along the dependency chain: deterministic hash tool first (only testable non-LLM piece), then templates (section schema), then spec-consolidator agent (core write path), then /case updates (classification prerequisite), then orchestrator core (wiring Steps 1-3.7), then e2e-flows agent (cross-service docs), then spec-verifier with full orchestrator integration (Steps 4-7), and finally consumer updates (case-briefer/case-validator adaptation). Each phase delivers a verifiable capability that unblocks the next.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Hash Tool** - Deno SHA-256 section hashing with AST-based parsing and 10 test cases
- [ ] **Phase 2: Templates** - Service archetype templates defining section schemas for consolidator
- [ ] **Phase 3: Spec Consolidator Agent** - Per-service merge agent with 11 rules, tested against fixture phase documents
- [ ] **Phase 4: /case Updates** - PR/TR classification, superseded sections, OR-N prefix, and validator recognition
- [ ] **Phase 5: Orchestrator Core** - SKILL.md Steps 1-3.7 wiring classification, dispatch, collection, and INDEX.md
- [ ] **Phase 6: E2E Flows Agent** - Cross-service flow documentation with hash-based change detection
- [ ] **Phase 7: Spec Verifier + Full Integration** - 28-check read-only verifier and orchestrator Steps 4-7
- [ ] **Phase 8: Consumer Updates** - case-briefer specs/ priority lookup and Forward Concerns sourcing

## Phase Details

### Phase 1: Hash Tool
**Goal**: Developers can compute deterministic section hashes for any markdown file via CLI
**Depends on**: Nothing (first phase)
**Requirements**: HASH-01, HASH-02, HASH-03, HASH-04, HASH-05, HASH-06, HASH-07, TEST-04
**Success Criteria** (what must be TRUE):
  1. Running `deno run hash-sections.ts <file>` produces JSON with SHA-256/8 hashes for each H2 section
  2. Hashing the same file twice produces identical output (deterministic)
  3. CommonMark edge cases (fenced code blocks, setext headers, ATX trailing hashes) parse correctly without false section splits
  4. All 10 test cases pass via `deno test`
  5. Pre-first-H2 content is excluded from hash output
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md -- Fixtures + hash-sections.ts implementation (HASH-01 through HASH-06)
- [ ] 01-02-PLAN.md -- 10 test cases in hash-sections_test.ts (HASH-07, TEST-04)

### Phase 2: Templates
**Goal**: Consolidator has authoritative section schemas for each service archetype
**Depends on**: Nothing (independent of Phase 1, but ordered for review before consolidator work)
**Requirements**: TMPL-01, TMPL-02, TMPL-03, TMPL-04, TMPL-05, TMPL-06
**Success Criteria** (what must be TRUE):
  1. Domain service template contains all 8 context.md sections and cases.md format per IMPL-SPEC
  2. Gateway/BFF template contains all 7 context.md sections with conditional cases.md documented
  3. Event-driven template contains all 7 context.md sections
  4. All v1-to-v2 section renames are applied (Ports to Adapter Contracts, gRPC Interface to Service Interface, etc.)
**Plans**: TBD

Plans:
- [ ] 02-01: TBD

### Phase 3: Spec Consolidator Agent
**Goal**: A dispatched agent can merge phase planning documents into per-service spec files following all 11 rules
**Depends on**: Phase 2 (templates define section schema)
**Requirements**: CONS-01, CONS-02, CONS-03, CONS-04, CONS-05, CONS-06, CONS-07, CONS-08, CONS-09, CONS-10, CONS-11, CONS-12, CONS-13, CONS-14, CONS-15, TEST-01, TEST-02, TEST-03
**Success Criteria** (what must be TRUE):
  1. Agent dispatched with XML tags produces specs/{service}/context.md and cases.md with correct section structure
  2. PR rules are mechanically promoted to SR with sequential numbering; TR entries are excluded from output
  3. Superseded operations are removed and superseded rules are skipped during promotion
  4. Context.md sections follow latest-wins semantics (unchanged sections preserved, changed sections replaced)
  5. Every rule and decision entry carries provenance tags citing source phase
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

### Phase 4: /case Updates
**Goal**: /case produces PR/TR-classified rules and supersession metadata that consolidator can consume mechanically
**Depends on**: Nothing (independent skill update, but must complete before orchestrator wires Step 1)
**Requirements**: CASE-01, CASE-02, CASE-03, CASE-04, CSMR-03, CSMR-04, CSMR-05
**Success Criteria** (what must be TRUE):
  1. Discuss step prompts "permanent (PR) or temporary (TR)?" for each rule; finalize step presents full PR/TR list for review
  2. CASES.md output includes Superseded Operations table (Old Operation, Replacement, Reason) when applicable
  3. CASES.md output includes Superseded Rules table (Phase, Rule ID, Reason) when applicable
  4. Rules use OR-N prefix natively in output (not R-N)
  5. case-validator accepts TR-N, OR-N as valid rule tiers and recognizes Superseded Operations/Rules as valid sections
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

### Phase 5: Orchestrator Core
**Goal**: Running `/consolidate {phase}` performs a complete consolidation cycle: classify services, dispatch consolidators, collect results, generate INDEX.md
**Depends on**: Phase 2 (templates), Phase 3 (consolidator agent), Phase 4 (/case PR/TR ready)
**Requirements**: ORCH-01, ORCH-02, ORCH-03, ORCH-04, ORCH-05, ORCH-08, ORCH-09, ORCH-10, ORCH-11, ORCH-12
**Success Criteria** (what must be TRUE):
  1. Orchestrator resolves phase directory, classifies services via 2-step algorithm, and determines archetype per service
  2. Consolidator agents are dispatched in parallel (one per service) and results are collected into changed_services manifest
  3. INDEX.md is generated in v2 format after consolidation completes
  4. Developer sees confirmation summary and can approve (commit) or reject (rollback via git checkout)
  5. Failed agent triggers selective retry; abort triggers full rollback with diff-aware warning
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

### Phase 6: E2E Flows Agent
**Goal**: Cross-service user flows are documented with Mermaid diagrams and hash-based staleness detection
**Depends on**: Phase 1 (hash tool), Phase 3 (consolidated specs to reference), Phase 5 (orchestrator dispatch infra)
**Requirements**: E2E-01, E2E-02, E2E-03, E2E-04, E2E-05, E2E-06, E2E-07, ORCH-06
**Success Criteria** (what must be TRUE):
  1. E2E agent produces per-flow files at specs/e2e/{flow-name}.md with Step Table, Mermaid diagram, Error Paths, and Spec References
  2. Hash comparison detects changed specs; unchanged flows (all hashes match) are skipped
  3. New flows are only created after developer confirmation via `<new_flows>` tag
  4. Orchestrator Step 4 wires Deno prerequisite check, hash computation, and E2E agent dispatch
**Plans**: TBD

Plans:
- [ ] 06-01: TBD

### Phase 7: Spec Verifier + Full Integration
**Goal**: Consolidated specs pass 28 automated verification checks before commit, and the full 7-step pipeline runs end-to-end
**Depends on**: Phase 5 (orchestrator skeleton), Phase 6 (E2E agent for V-29 check)
**Requirements**: VRFY-01, VRFY-02, VRFY-03, VRFY-04, VRFY-05, VRFY-06, ORCH-07
**Success Criteria** (what must be TRUE):
  1. Spec-verifier executes 28 checks across T1/T2/T3 tiers without modifying any spec file
  2. Each finding references specific file path and section; T1 findings block confirmation with warning
  3. Orchestrator Steps 4-7 are fully wired: hash computation, E2E dispatch, verifier dispatch, confirmation with tiered findings
  4. UNKNOWN agent return state (maxTurns exhaustion) is handled as retry, not success
**Plans**: TBD

Plans:
- [ ] 07-01: TBD

### Phase 8: Consumer Updates
**Goal**: case-briefer and case-validator work correctly against the new specs/ directory structure
**Depends on**: Phase 7 (pipeline validated end-to-end)
**Requirements**: CSMR-01, CSMR-02
**Success Criteria** (what must be TRUE):
  1. case-briefer reads specs/{service}/cases.md first, falling back to phase directories only when spec does not exist
  2. case-briefer always reads Forward Concerns from phase CASES.md (never from specs/)
**Plans**: TBD

Plans:
- [ ] 08-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Hash Tool | 0/2 | Planned | - |
| 2. Templates | 0/0 | Not started | - |
| 3. Spec Consolidator Agent | 0/0 | Not started | - |
| 4. /case Updates | 0/0 | Not started | - |
| 5. Orchestrator Core | 0/0 | Not started | - |
| 6. E2E Flows Agent | 0/0 | Not started | - |
| 7. Spec Verifier + Full Integration | 0/0 | Not started | - |
| 8. Consumer Updates | 0/0 | Not started | - |
