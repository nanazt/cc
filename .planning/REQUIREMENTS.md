# Requirements: cckit

**Defined:** 2026-03-30
**Core Value:** Consolidate phase-scoped planning decisions into persistent, per-service spec files as authoritative source of truth.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Hash Tool

- [x] **HASH-01**: hash-sections.ts produces deterministic SHA-256/8 hashes for H2 sections in markdown files
- [x] **HASH-02**: AST-based parsing (unified + remark-parse) handles all CommonMark edge cases (fenced code blocks, setext headers, ATX trailing hashes)
- [x] **HASH-03**: Normalization: trailing whitespace stripped, consecutive blank lines collapsed, LF line endings
- [x] **HASH-04**: Pre-first-H2 content excluded from hashing
- [x] **HASH-05**: JSON output format matches IMPL-SPEC schema (files array with path, sections array with heading + hash)
- [x] **HASH-06**: Multiple file paths accepted as CLI arguments
- [x] **HASH-07**: 10 test cases pass (basic extraction, code block safety, tilde fence, normalization x2, determinism, JSON format, header-in-hash, empty section, multi-file)

### Templates

- [ ] **TMPL-01**: Domain service template defines 8 context.md sections (Domain Model, Adapter Contracts, Business Rules, Error Categories, Service Interface, Configuration, Cross-Service Dependencies, State Management)
- [ ] **TMPL-02**: Domain service template defines cases.md format (per-operation sections with SR, OR, Side Effects, Cases table)
- [ ] **TMPL-03**: Gateway/BFF template defines 7 context.md sections (Route/Endpoint Table, Middleware Stack, Composition Patterns, Error Translation, External API Conventions, Configuration, Identity Propagation)
- [ ] **TMPL-04**: Gateway cases.md is conditional — only when gateway has behavioral operations passing "judgment seat" test
- [ ] **TMPL-05**: Event-driven template defines 7 context.md sections (Event Subscriptions, Event Publications, Processing Logic, Idempotency, Error Categories, Configuration, State Management)
- [ ] **TMPL-06**: v1-to-v2 section renames applied (Ports->Adapter Contracts, gRPC Interface->Service Interface, Orchestration Patterns->Composition Patterns, Error Handling->Error Translation, REST Conventions->External API Conventions)

### Spec Consolidator Agent

- [ ] **CONS-01**: Agent reads phase CONTEXT.md, CASES.md, and PROJECT.md via XML dispatch tags
- [ ] **CONS-02**: Operation-level replacement — later phase replaces entire operation section
- [ ] **CONS-03**: PR-to-SR mechanical promotion with sequential renumbering (no collisions)
- [ ] **CONS-04**: TR entries excluded from output
- [ ] **CONS-05**: R-to-OR transformation in output
- [ ] **CONS-06**: GR referenced only (`See GR-XX`), never content-duplicated
- [ ] **CONS-07**: Superseded operations removed from existing spec
- [ ] **CONS-08**: Superseded rules skipped during SR promotion
- [ ] **CONS-09**: Section-level rewrite for context.md (latest wins per section, unchanged sections preserved)
- [ ] **CONS-10**: Provenance tags on every rule and decision entry — `(Source: Phase {id})`
- [ ] **CONS-11**: Forward Concerns excluded from output
- [ ] **CONS-12**: Template sections match assigned archetype
- [ ] **CONS-13**: `Last consolidated: Phase {id} (YYYY-MM-DD)` header updated
- [ ] **CONS-14**: Return protocol: `## CONSOLIDATION COMPLETE` or `## CONSOLIDATION FAILED` with structured data
- [ ] **CONS-15**: Quality gate checklist (13 items) self-verified before return

### E2E Flows Agent

- [ ] **E2E-01**: Generates per-user-action flow files at `specs/e2e/{flow-name}.md`
- [ ] **E2E-02**: Flow format: Step Table (6 columns), Mermaid sequence diagram, Error Paths, Spec References
- [ ] **E2E-03**: Hash-based change detection — compare spec_hashes against existing flow's Spec References
- [ ] **E2E-04**: Unchanged flows skipped (all hashes match, no participants affected)
- [ ] **E2E-05**: New flows only created when confirmed by developer (via `<new_flows>` tag)
- [ ] **E2E-06**: Level B granularity — cross-service hops plus key internal logic with side effects
- [ ] **E2E-07**: Return protocol: `## E2E FLOWS COMPLETE` or `## E2E FLOWS FAILED`

### Spec Verifier Agent

- [ ] **VRFY-01**: 28 verification checks executed across 4 tiers (T1 blocks, T2 developer-decides, T3 info, Human-only)
- [ ] **VRFY-02**: Read-only — never modifies spec files
- [ ] **VRFY-03**: Each finding references specific file path and section
- [ ] **VRFY-04**: T1 findings: V-01 provenance, V-02 empty sections, V-07/V-08 INDEX.md validity, V-09 no fabricated cases, V-16 latest-wins, V-17 Forward Concerns leak, V-25/V-26 GR reference validity, V-29 E2E spec references
- [ ] **VRFY-05**: T2 findings: V-05 SR format, V-10 cross-service refs, V-11 gateway routes, V-14 PR-to-SR count, V-15 error consistency, V-18 backfill provenance, V-27 service topology match, V-28 SR keyword overlap
- [ ] **VRFY-06**: Return protocol: `## VERIFICATION COMPLETE` or `## VERIFICATION FAILED` with tiered findings

### Orchestrator (SKILL.md)

- [ ] **ORCH-01**: Step 1 — resolve phase directory, read documents, classify services (2-step algorithm), determine archetype, read existing specs
- [ ] **ORCH-02**: Step 2 — parallel dispatch of spec-consolidator agents per service
- [ ] **ORCH-03**: Step 3 — collect results, build changed_services manifest, update INDEX.md v2 format
- [ ] **ORCH-04**: Step 3.5 — identify E2E flows (existing + new candidates), developer confirmation for new flows
- [ ] **ORCH-05**: Step 3.7 — orphan directory detection and cleanup with developer confirmation
- [ ] **ORCH-06**: Step 4 — Deno prerequisite check, hash computation, E2E agent dispatch
- [ ] **ORCH-07**: Step 5 — spec-verifier dispatch with all required input tags
- [ ] **ORCH-08**: Step 6 — confirmation summary (services, E2E, verification findings, exclusions)
- [ ] **ORCH-09**: Step 7 — commit on confirmation, rollback (`git checkout -- .planning/specs/`) on rejection
- [ ] **ORCH-10**: Fail-fast + selective retry — retry failed agent only, abort triggers full rollback
- [ ] **ORCH-11**: Out-of-order consolidation warning (existing spec newer than source phase)
- [ ] **ORCH-12**: T1 findings block confirmation with warning

### /case Updates

- [ ] **CASE-01**: PR/TR distinction — discuss step asks "permanent (PR) or temporary (TR)?", finalize step reviews full PR/TR list
- [ ] **CASE-02**: Superseded Operations section — table with Old Operation, Replacement, Reason columns
- [ ] **CASE-03**: Superseded Rules section — table with Phase, Rule ID, Reason columns
- [ ] **CASE-04**: OR-N prefix produced natively (replacing R-N) for future phases

### Consumer Updates

- [ ] **CSMR-01**: case-briefer reads specs/{service}/cases.md first, falls back to phase directories if not found
- [ ] **CSMR-02**: case-briefer always reads Forward Concerns from phase CASES.md (never from specs/)
- [ ] **CSMR-03**: case-validator recognizes TR-N as valid rule tier
- [ ] **CSMR-04**: case-validator recognizes OR-N as valid rule tier
- [ ] **CSMR-05**: case-validator recognizes Superseded Operations and Superseded Rules as valid sections

### Testing

- [ ] **TEST-01**: Fixture set: synthetic phase directory with CONTEXT.md, CASES.md, PROJECT.md
- [ ] **TEST-02**: Fixture set: existing specs/ directory for merge testing
- [ ] **TEST-03**: Fixture set: multi-phase scenario (Phase 1 infra + Phase 2 behavioral)
- [x] **TEST-04**: hash-sections_test.ts — 10 test cases per IMPL-SPEC

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Installation

- **INST-01**: Global install option (available to all projects)
- **INST-02**: Per-project install option (scoped to single project)
- **INST-03**: Install command or script that handles both modes

### Advanced

- **ADV-01**: Spec-vs-code drift detection (Layer 3 verification)
- **ADV-02**: Proto/Common service handling (template_type: none)
- **ADV-03**: Rule tier rename migration tool (SR->GR, SvcR->SR atomic rename)

## Out of Scope

| Feature | Reason |
|---------|--------|
| /gsd:next integration | Manual invocation preserves developer control over consolidation timing |
| Keyword-based service classification | Masks structural problems in phase documents |
| Case-level merge (within operations) | /case produces complete per-operation specs; case-level merge creates conflicts |
| Automatic PR/TR classification | Consolidator is mechanical; cannot make judgment calls |
| Manual spec file editing | Specs must be machine-maintained for consistency |
| GR content duplication into specs | Creates N+1 update points; references maintain single source of truth |
| Persisted verifier findings | Ephemeral; relevant only at consolidation time |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| HASH-01 | Phase 1 | Complete |
| HASH-02 | Phase 1 | Complete |
| HASH-03 | Phase 1 | Complete |
| HASH-04 | Phase 1 | Complete |
| HASH-05 | Phase 1 | Complete |
| HASH-06 | Phase 1 | Complete |
| HASH-07 | Phase 1 | Complete |
| TMPL-01 | Phase 2 | Pending |
| TMPL-02 | Phase 2 | Pending |
| TMPL-03 | Phase 2 | Pending |
| TMPL-04 | Phase 2 | Pending |
| TMPL-05 | Phase 2 | Pending |
| TMPL-06 | Phase 2 | Pending |
| CONS-01 | Phase 3 | Pending |
| CONS-02 | Phase 3 | Pending |
| CONS-03 | Phase 3 | Pending |
| CONS-04 | Phase 3 | Pending |
| CONS-05 | Phase 3 | Pending |
| CONS-06 | Phase 3 | Pending |
| CONS-07 | Phase 3 | Pending |
| CONS-08 | Phase 3 | Pending |
| CONS-09 | Phase 3 | Pending |
| CONS-10 | Phase 3 | Pending |
| CONS-11 | Phase 3 | Pending |
| CONS-12 | Phase 3 | Pending |
| CONS-13 | Phase 3 | Pending |
| CONS-14 | Phase 3 | Pending |
| CONS-15 | Phase 3 | Pending |
| TEST-01 | Phase 3 | Pending |
| TEST-02 | Phase 3 | Pending |
| TEST-03 | Phase 3 | Pending |
| CASE-01 | Phase 4 | Pending |
| CASE-02 | Phase 4 | Pending |
| CASE-03 | Phase 4 | Pending |
| CASE-04 | Phase 4 | Pending |
| CSMR-03 | Phase 4 | Pending |
| CSMR-04 | Phase 4 | Pending |
| CSMR-05 | Phase 4 | Pending |
| ORCH-01 | Phase 5 | Pending |
| ORCH-02 | Phase 5 | Pending |
| ORCH-03 | Phase 5 | Pending |
| ORCH-04 | Phase 5 | Pending |
| ORCH-05 | Phase 5 | Pending |
| ORCH-08 | Phase 5 | Pending |
| ORCH-09 | Phase 5 | Pending |
| ORCH-10 | Phase 5 | Pending |
| ORCH-11 | Phase 5 | Pending |
| ORCH-12 | Phase 5 | Pending |
| E2E-01 | Phase 6 | Pending |
| E2E-02 | Phase 6 | Pending |
| E2E-03 | Phase 6 | Pending |
| E2E-04 | Phase 6 | Pending |
| E2E-05 | Phase 6 | Pending |
| E2E-06 | Phase 6 | Pending |
| E2E-07 | Phase 6 | Pending |
| ORCH-06 | Phase 6 | Pending |
| VRFY-01 | Phase 7 | Pending |
| VRFY-02 | Phase 7 | Pending |
| VRFY-03 | Phase 7 | Pending |
| VRFY-04 | Phase 7 | Pending |
| VRFY-05 | Phase 7 | Pending |
| VRFY-06 | Phase 7 | Pending |
| ORCH-07 | Phase 7 | Pending |
| CSMR-01 | Phase 8 | Pending |
| CSMR-02 | Phase 8 | Pending |
| TEST-04 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 66 total
- Mapped to phases: 66
- Unmapped: 0

---
*Requirements defined: 2026-03-30*
*Last updated: 2026-03-30 after roadmap creation*
