# Requirements: cckit

**Defined:** 2026-03-30 (v1), 2026-03-31 (v2.0)
**Core Value:** Consolidate phase-scoped planning decisions into persistent spec files as authoritative source of truth. Project-type agnostic.

## v1.0 Requirements (Completed / Superseded)

### Hash Tool (Complete)

- [x] **HASH-01**: hash-sections.ts produces deterministic SHA-256/8 hashes for H2 sections in markdown files
- [x] **HASH-02**: AST-based parsing (unified + remark-parse) handles all CommonMark edge cases (fenced code blocks, setext headers, ATX trailing hashes)
- [x] **HASH-03**: Normalization: trailing whitespace stripped, consecutive blank lines collapsed, LF line endings
- [x] **HASH-04**: Pre-first-H2 content excluded from hashing
- [x] **HASH-05**: JSON output format matches IMPL-SPEC schema (files array with path, sections array with heading + hash)
- [x] **HASH-06**: Multiple file paths accepted as CLI arguments
- [x] **HASH-07**: 10 test cases pass (basic extraction, code block safety, tilde fence, normalization x2, determinism, JSON format, header-in-hash, empty section, multi-file)
- [x] **TEST-04**: hash-sections_test.ts -- 10 test cases per IMPL-SPEC

### v1 Templates / Consolidator / Orchestrator / Verifier / E2E (Superseded by v2.0)

v1 requirements TMPL-01 through TMPL-06, CONS-01 through CONS-15, ORCH-01 through ORCH-12, E2E-01 through E2E-07, VRFY-01 through VRFY-06, CASE-01 through CASE-04, CSMR-01 through CSMR-05, TEST-01 through TEST-03 are **superseded** by v2.0 requirements below. They assumed fixed service archetypes which violates the technology neutrality principle.

## v2.0 Requirements

### Universal Model (MODEL)

- [x] **MODEL-01**: User can declare consolidation units in a schema file without being constrained to predefined archetypes
- [x] **MODEL-02**: User can define custom section structures per unit type via the schema
- [x] **MODEL-03**: Components without a custom type use a sensible default section structure that works for any project type
- [x] **MODEL-04**: Schema includes meta configuration (operation-prefix format, rule-prefix naming, e2e-flows toggle)
- [x] **MODEL-05**: Default section list passes the neutrality test (meaningful for web service, CLI tool, library, documentation project)

### Schema System (SCHEMA)

- [x] **SCHEMA-01**: Plugin bootstraps a starter schema when no schema file exists on first `/consolidate` run
- [x] **SCHEMA-02**: User can override sections for specific unit types within the schema
- [x] **SCHEMA-03**: Conditional sections use behavioral conditions (not type checks)
- [x] **SCHEMA-04**: Schema examples ship as reference material for common project types

### Consolidation Pipeline (PIPE)

- [ ] **PIPE-01**: Orchestrator reads schema to resolve unit names and section structures (replaces archetype classification)
- [ ] **PIPE-02**: Consolidator agent receives explicit section list via dispatch (not template type)
- [ ] **PIPE-03**: All 11 merge rules function correctly with universal model
- [ ] **PIPE-04**: INDEX.md uses "Component" heading with optional "Type" column
- [ ] **PIPE-05**: `specs/{unit}/context.md` and `cases.md` output structure works for any unit type
- [ ] **PIPE-06**: IMPL-SPEC is fully rewritten to reflect universal design

### Verification (VRFY)

- [ ] **VRFY-01**: Verifier checks are parameterized against active schema (not hardcoded archetypes)
- [ ] **VRFY-02**: Service-specific checks (V-04, V-10, V-11, V-15, V-27, V-29) are universalized or made conditional
- [ ] **VRFY-03**: Verifier produces no false positives on non-service projects

### /case Updates (CASE)

- [ ] **CASE-01**: /case skill contains no service-biased language or assumptions
- [ ] **CASE-02**: case-briefer uses "component topology" instead of "service topology"
- [ ] **CASE-03**: /case produces PR/TR-classified rules (permanent vs temporary)
- [ ] **CASE-04**: CASES.md includes Superseded Operations table when applicable
- [ ] **CASE-05**: CASES.md includes Superseded Rules table when applicable
- [ ] **CASE-06**: Rules use OR-N prefix natively
- [ ] **CASE-07**: case-validator accepts TR-N, OR-N and recognizes supersession sections
- [ ] **CASE-08**: case-briefer reads `specs/{unit}/cases.md` first, falling back to phase directories only when spec does not exist

### Cross-Unit Flows (FLOW)

- [ ] **FLOW-01**: E2E flow generation is opt-in via schema flag (not default)
- [ ] **FLOW-02**: Orchestrator skips flow steps when E2E is disabled
- [ ] **FLOW-03**: When enabled, flow agent uses universal unit terminology
- [ ] **FLOW-04**: Hash-based change detection works with universal unit structure

## Future Requirements

### Installation
- **INST-01**: Global install option (available to all projects)
- **INST-02**: Per-project install option (scoped to single project)
- **INST-03**: Install command or script that handles both modes

### Advanced
- **ADV-01**: Spec-vs-code drift detection (Layer 3 verification)
- **ADV-02**: Template inheritance/composition -- wait for evidence flat files are insufficient
- **ADV-03**: Template marketplace/sharing -- format must stabilize first
- **ADV-04**: Rule tier rename migration tool (atomic rename in existing projects)
- **ADV-05**: Auto-generating PROJECT.md topology

## Out of Scope

| Feature | Reason |
|---------|--------|
| /gsd:next integration | Manual invocation preserves developer control over consolidation timing |
| Fixed archetype templates | Violates technology neutrality -- replaced by user-defined schema |
| Keyword-based service classification | Masks structural problems in phase documents |
| Case-level merge (within operations) | /case produces complete per-operation specs; case-level merge creates conflicts |
| Automatic PR/TR classification | Consolidator is mechanical; cannot make judgment calls |
| Manual spec file editing | Specs must be machine-maintained for consistency |
| GR content duplication into specs | Creates N+1 update points; references maintain single source of truth |
| Persisted verifier findings | Ephemeral; relevant only at consolidation time |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| HASH-01~07, TEST-04 | v1.0 Phase 1 | Complete |
| MODEL-01 | Phase 9 | Complete |
| MODEL-02 | Phase 9 | Complete |
| MODEL-03 | Phase 9 | Complete |
| MODEL-04 | Phase 9 | Complete |
| MODEL-05 | Phase 9 | Complete |
| SCHEMA-01 | Phase 10 | Complete |
| SCHEMA-02 | Phase 10 | Complete |
| SCHEMA-03 | Phase 10 | Complete |
| SCHEMA-04 | Phase 10 | Complete |
| PIPE-01 | Phase 11 | Pending |
| PIPE-02 | Phase 11 | Pending |
| PIPE-03 | Phase 11 | Pending |
| PIPE-04 | Phase 11 | Pending |
| PIPE-05 | Phase 11 | Pending |
| PIPE-06 | Phase 11 | Pending |
| CASE-01 | Phase 12 | Pending |
| CASE-02 | Phase 12 | Pending |
| CASE-03 | Phase 12 | Pending |
| CASE-04 | Phase 12 | Pending |
| CASE-05 | Phase 12 | Pending |
| CASE-06 | Phase 12 | Pending |
| CASE-07 | Phase 12 | Pending |
| CASE-08 | Phase 12 | Pending |
| VRFY-01 | Phase 13 | Pending |
| VRFY-02 | Phase 13 | Pending |
| VRFY-03 | Phase 13 | Pending |
| FLOW-01 | Phase 14 | Pending |
| FLOW-02 | Phase 14 | Pending |
| FLOW-03 | Phase 14 | Pending |
| FLOW-04 | Phase 14 | Pending |

**Coverage:**
- v2.0 requirements: 30 total
- Mapped to phases: 30/30
- Unmapped: 0

---
*Requirements defined: 2026-03-30 (v1), 2026-03-31 (v2.0)*
*Last updated: 2026-03-31 -- v2.0 roadmap mapped*
