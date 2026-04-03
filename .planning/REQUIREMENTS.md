# Requirements: cckit v0.2.0 Portable Conventions

**Defined:** 2026-04-03
**Core Value:** Encode behavioral quality standards as installable artifacts — project-type agnostic.

## v0.2.0 Requirements

Requirements for the Portable Conventions milestone. Each maps to roadmap phases.

### Installation (INST)

- [ ] **INST-01**: User can install cckit conventions via `deno run https://...`
- [ ] **INST-02**: User can select which conventions to install via `.claude/cckit.json` config
- [ ] **INST-03**: User can dry-run installation to preview what would change
- [ ] **INST-04**: Installer warns before overwriting existing files and requires confirmation
- [ ] **INST-05**: User can update previously installed conventions to latest version
- [ ] **INST-06**: cckit can install its own conventions into itself (self-application)

### Convention Architecture (ARCH)

- [x] **ARCH-01**: Conventions use a layered structure: base (tech-neutral, `CONVENTION.md`) and language-specific (`{lang}.md`) in separate files within the same `conventions/{area}/` directory. Base is optional — only created when it passes the delta test (ARCH-03)
- [x] **ARCH-02**: Language-specific conventions are named by language (`rust.md`, `typescript.md`), discoverable by directory scan, and opt-in via installer selection
- [x] **ARCH-03**: Conventions only teach what LLM doesn't already know or where user style diverges from defaults (delta test, embedded in /convention skill authoring process)
- [x] **ARCH-04**: When a base convention exists, it stands alone with real value — not empty abstraction. If it cannot pass the delta test, it is omitted and only language-specific conventions are shipped

### /convention Skill (SKILL)

- [ ] **SKILL-01**: Skill researches best practices for a given convention area
- [ ] **SKILL-02**: Skill compares and recommends libraries for language-specific conventions
- [ ] **SKILL-03**: Skill identifies what LLM already knows vs what needs explicit teaching
- [ ] **SKILL-04**: Skill collects user's personal style preferences via interactive questioning
- [ ] **SKILL-05**: Skill generates convention file following ARCH rules (base/language-specific separation)
- [ ] **SKILL-06**: Skill validates tech-neutrality for base conventions
- [ ] **SKILL-07**: Skill works in any project, not just cckit (for project-specific conventions)

### Conventions — Base (authored via /convention)

- [ ] **COMMIT-01**: Commit message format convention
- [ ] **CODE-01**: Universal coding principles convention
- [ ] **TEST-01**: Test structure and naming convention
- [ ] **DOC-01**: Documentation structure convention (README, changelog, etc.)
- [ ] **WFLOW-01**: Development workflow convention (PR, branch, review)
- [ ] **SEC-01**: Security basics convention (secrets, validation, OWASP)
- [ ] **ERR-01**: Error handling patterns convention (errors, logging, failures)

### Conventions — Rust Language-Specific (authored via /convention)

- [ ] **CODE-R01**: Rust coding conventions (idioms, patterns, clippy rules)
- [ ] **TEST-R01**: Rust test conventions with framework recommendation
- [ ] **ERR-R01**: Rust error handling conventions with library recommendation

## Future Requirements

Deferred to later phases in this open milestone or subsequent milestones.

### Additional Rust Language-Specific Conventions

- **DOC-R01**: Rust documentation conventions (rustdoc, docs.rs)
- **SEC-R01**: Rust security conventions
- **WFLOW-R01**: Rust workflow conventions (cargo, clippy CI)

### Other Language-Specific Conventions

- **CODE-T01**: TypeScript coding conventions
- **CODE-P01**: Python coding conventions
- **CODE-G01**: Go coding conventions

### Additional Convention Types

- **STRUCT-01**: Project structure conventions (directory layout, file naming)
- **AI-01**: AI collaboration conventions (CLAUDE.md patterns, prompt engineering)
- **REL-01**: Release and versioning conventions (SemVer, changelog format)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Claude Code plugin manifest | Deferred — Deno installer chosen for v0.2.0 |
| Convention enforcement hooks | v0.2.0 focuses on guidance, not automated enforcement |
| Global installation | Project-only by design |
| Runtime config merging | Anti-feature per research — convention files are atomic |
| Convention auto-updates | Updates are explicit by user action only |
| Per-line convention overrides | Conventions are file-level; local CLAUDE.md takes precedence |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ARCH-01 | Phase 17 | Complete |
| ARCH-02 | Phase 17 | Complete |
| ARCH-03 | Phase 17 | Complete |
| ARCH-04 | Phase 17 | Complete |
| SKILL-01 | Phase 18 | Pending |
| SKILL-02 | Phase 18 | Pending |
| SKILL-03 | Phase 18 | Pending |
| SKILL-04 | Phase 18 | Pending |
| SKILL-05 | Phase 18 | Pending |
| SKILL-06 | Phase 18 | Pending |
| SKILL-07 | Phase 18 | Pending |
| COMMIT-01 | Phase 19 | Pending |
| INST-01 | Phase 20 | Pending |
| INST-02 | Phase 20 | Pending |
| INST-03 | Phase 20 | Pending |
| INST-04 | Phase 20 | Pending |
| INST-05 | Phase 20 | Pending |
| INST-06 | Phase 20 | Pending |
| CODE-01 | Phase 21 | Pending |
| CODE-R01 | Phase 21 | Pending |
| TEST-01 | Phase 22 | Pending |
| TEST-R01 | Phase 22 | Pending |
| ERR-01 | Phase 22 | Pending |
| ERR-R01 | Phase 22 | Pending |
| DOC-01 | Phase 23 | Pending |
| WFLOW-01 | Phase 23 | Pending |
| SEC-01 | Phase 23 | Pending |

**Coverage:**
- v0.2.0 requirements: 27 total
- Mapped to phases: 27
- Unmapped: 0

---
*Requirements defined: 2026-04-03*
*Last updated: 2026-04-03 after Phase 17 plan-phase (retired obsolete terminology, aligned with CONTEXT.md D-27)*
