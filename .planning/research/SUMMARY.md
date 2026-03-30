# Project Research Summary

**Project:** cckit (Claude Code Toolkit)
**Domain:** Claude Code multi-agent plugin toolkit (skill orchestration, spec consolidation, case discovery)
**Researched:** 2026-03-30
**Confidence:** HIGH

## Executive Summary

cckit is a Claude Code plugin project implementing a spec-driven consolidation pipeline via the Orchestrator-Agent pattern. The dominant insight across all four research areas is that this is not a traditional software application — it is a collection of LLM behavioral artifacts (SKILL.md orchestrators, agent .md subagents, Deno tooling) that follow Claude Code's established conventions. The recommended approach is to replicate and extend the already-working `/case` architecture: a SKILL.md state machine dispatches specialized agents via XML dispatch tags, agents return structured completion protocols, and all side-channel state (hashes, classifications, developer input) flows through the orchestrator. The one non-LLM component (hash-sections.ts) should be built first because it is the only piece testable without LLM execution and its correctness gates all E2E flow work.

The critical risk is implementation complexity collapsing under the weight of 11 merge rules, 28 verification checks, and parallel agent dispatch — the same failure mode that killed v1. The mitigation is disciplined phase decomposition: build hash tool independently, validate templates structurally, test spec-consolidator with fixture phase documents before wiring up the full orchestrator, and never combine untested pieces. A secondary risk is the AST serialization roundtrip problem in hash-sections.ts — the correct implementation must hash original source bytes using AST node position offsets, not serialized AST output, to ensure cross-version hash stability.

The project's feature set is completely specified in IMPL-SPEC.md. There are no design gaps requiring invention — the research validates the spec's decisions and identifies one implementation trap (hash roundtrip) and one architectural gap (maxTurns exhaustion handling) that must be addressed during build. The recommended build order is: hash tool, templates, spec-consolidator agent, orchestrator steps 1–3, e2e-flows agent, spec-verifier agent, orchestrator steps 4–7.

## Key Findings

### Recommended Stack

This project has no server, no framework, and no build step. The stack has two layers: (1) prompt-engineering artifacts as Markdown with YAML frontmatter, consumed by Claude Code's runtime; and (2) a single Deno TypeScript tool for deterministic section hashing. Deno is the right choice for the hash tool because it runs TypeScript with zero config, has a built-in test runner, and its `--allow-read` permission sandbox is appropriate for a tool that should never write or call the network. The unified/remark-parse ecosystem provides AST-based markdown parsing that eliminates ~40 lines of fragile regex with ~10 lines of tree traversal.

**Core technologies:**
- **Deno >= 2.7**: runtime for hash-sections.ts — zero-config TypeScript, built-in test runner, permission sandbox, npm: specifiers
- **unified@11.0.5 + remark-parse@11.0.0**: AST parsing pipeline — CommonMark-compliant, eliminates regex edge cases, provides node position offsets needed for source-byte hashing
- **remark-stringify@11.0.0**: AST serialization — required for the pipeline but NOT for hashing (see Pitfall 1)
- **Web Crypto API (built-in)**: SHA-256 computation — zero dependencies, W3C standard
- **SKILL.md + Agent .md format**: Claude Code plugin layer — YAML frontmatter configures invocation; Markdown body is the system prompt

### Expected Features

The IMPL-SPEC defines the complete feature surface. There are no gaps in the must-have tier. The spec-consolidator's 11 merge rules are individually sound; the risk is their interactions during LLM execution, not their design.

**Must have (table stakes):**
- 7-step orchestrator pipeline (SKILL.md) — without this, nothing dispatches
- spec-consolidator agent with 11 merge rules — core value proposition; latest-wins semantics, PR-to-SR promotion, TR/Forward Concerns exclusion, provenance tagging
- /case PR/TR distinction — consolidator cannot classify rule permanence; /case must do it first
- /case Superseded Operations and Superseded Rules sections — mechanical instructions for removing stale content
- hash-sections.ts with 10 test cases — gates E2E flow change detection
- Templates (domain-service, gateway-bff) — define section schema per archetype; consolidator cannot produce consistent output without them
- Confirmation summary + commit/rollback — developer must approve before changes commit; no silent writes
- INDEX.md generation — consumer navigation; full rewrite per run
- case-briefer specs/ priority lookup — post-consolidation, specs/ is authoritative; briefer must read it first
- case-validator TR/OR recognition — prevents false negatives on new rule tier prefixes

**Should have (differentiators):**
- spec-verifier agent (28 checks, opus) — T1/T2/T3 tiered findings; read-only safety net before commit
- e2e-flows agent — cross-service Mermaid diagrams with hash-based change detection
- Fail-fast + selective retry — retry only the failed agent, not all; better DX than "start over"
- Out-of-order consolidation warning — prevents accidental data loss when consolidating phases out of sequence
- Orphan directory cleanup (Step 3.7) — hygiene; developer confirmation required

**Defer (v2+):**
- Event-driven archetype template — no real event-driven service exists to validate against; ship as experimental or defer
- Installation/distribution mechanism — symlink approach works now; solve after core tool validates
- Spec-vs-code drift detection — different problem domain; future gsd:verify expansion
- Rule tier rename migration (SR->GR, SvcR->SR) — orthogonal 6+ file atomic change; separate task

### Architecture Approach

The consolidate v2 pipeline follows the Orchestrator-Agent pattern proven by /case. The SKILL.md owns all pipeline state: phase resolution, service classification, parallel agent dispatch, hash computation (via Bash+Deno), INDEX.md writes, developer checkpoints (AskUserQuestion), and commit/rollback. Agents are isolated workers that receive complete XML dispatch contracts and return structured completion protocols. No inter-agent communication; all data flows through the orchestrator. The key difference from /case is that consolidate agents write spec files directly (avoiding orchestrator passthrough cost), compensated by the verifier's 28-check post-write validation.

**Major components:**
1. **SKILL.md orchestrator** — 7+2 step state machine; owns all side-channel state and developer interaction
2. **spec-consolidator agent (sonnet)** — per-service merge with 11 rules; writes specs/{service}/ directly
3. **hash-sections.ts (Deno)** — deterministic SHA-256/8 section hashing via AST position offsets
4. **e2e-flows agent (sonnet)** — cross-service flow docs with Mermaid; compares hashes but never computes them
5. **spec-verifier agent (opus)** — 28-check read-only verification; ephemeral findings, never persisted
6. **Templates (domain-service, gateway-bff)** — section schema per archetype; static files read by consolidator
7. **Updated /case skill** — PR/TR classification, Superseded sections, OR-N prefix output

### Critical Pitfalls

1. **AST serialization roundtrip breaks hash stability** — remark-stringify output differs from source syntax even for unchanged content; hash original source bytes using AST node `position.start.offset` / `position.end.offset`, not serialized output. Must resolve before hash tool ships.

2. **Subagent context isolation causes silent information loss** — subagents start with empty context; everything the orchestrator learned in Step 1 must be serialized into dispatch XML tags. Add `<orchestrator_notes>` for edge-case context (warnings, out-of-order detection, developer overrides). Never let subagents re-derive what the orchestrator already classified.

3. **Parallel write conflicts on shared files** — spec-consolidator agents write to isolated per-service paths, but LLM non-determinism may cause "helpful" writes to INDEX.md. Agent prompt must include an explicit exclusion list: "Write ONLY to specs/{service}/context.md and specs/{service}/cases.md."

4. **maxTurns exhaustion returns neither COMPLETE nor FAILED** — orchestrator must handle a third UNKNOWN state (no completion header found) and treat it as retry, not success. Set generous defaults (20+ turns for consolidators).

5. **Rollback destroys unrelated manual edits** — `git checkout -- .planning/specs/` reverts all changes, not just the current consolidation's writes. Before rollback, diff against the orchestrator's known-written files and warn if unrelated edits exist.

## Implications for Roadmap

Based on research, the dependency graph is clear and non-negotiable: the hash tool must exist before E2E work begins; templates must exist before the consolidator can be tested; the consolidator must produce output before the orchestrator, E2E agent, or verifier can do anything useful. The suggested phase structure mirrors this chain.

### Phase 1: Hash Tool
**Rationale:** Only non-LLM component; fully testable with `deno test` before any agent work. If the AST approach has problems, discover them here before 3 agents depend on the output. Pitfall 1 (roundtrip) must be resolved here.
**Delivers:** `skills/consolidate/hash-sections.ts` + `hash-sections_test.ts` with all 10 test cases passing; `deno.json` with import maps
**Addresses:** Infrastructure prerequisite for e2e-flows and spec-verifier (V-29)
**Avoids:** Pitfall 1 (hash by source bytes, not serialized AST), Pitfall 7 (document `deno cache` pre-warm)

### Phase 2: Templates
**Rationale:** Static files with zero runtime behavior; quick to produce; define the section schema that spec-consolidator depends on. Can be reviewed and adjusted before any agent code is written.
**Delivers:** `skills/consolidate/templates/domain-service.md`, `gateway-bff.md` (event-driven deferred)
**Avoids:** Inconsistent spec structure across services

### Phase 3: spec-consolidator Agent
**Rationale:** Core write path. All downstream components (INDEX.md, E2E, verifier, orchestrator) depend on consolidated specs existing. Test with manual dispatch against fixture phase documents before wiring into orchestrator.
**Delivers:** `agents/spec-consolidator.md` with all 11 merge rules; fixture-based validation
**Addresses:** 7 table-stakes merge rule features
**Avoids:** Pitfall 2 (complete dispatch contract), Pitfall 3 (explicit exclusion list), Pitfall 6 (prescribe rule application order: supersessions first, then exclusions, then transformations)

### Phase 4: /case Updates
**Rationale:** The orchestrator's Step 1 depends on PR/TR classification happening before consolidation. Updating /case before building the full orchestrator means the classification system is ready when the orchestrator wires Step 1.
**Delivers:** PR/TR distinction in discuss/finalize, Superseded Operations/Rules sections, OR-N prefix output; case-validator TR/OR recognition
**Addresses:** `/case PR/TR distinction`, consumer update features

### Phase 5: Orchestrator SKILL.md (Steps 1–3.7)
**Rationale:** With templates, consolidator, and /case updates in place, the orchestrator can run a complete consolidation cycle (classify -> dispatch -> collect -> index). Steps 4–7 can be stubs that return early.
**Delivers:** Working end-to-end consolidation without E2E flows or verification; confirmation summary; commit/rollback
**Addresses:** 7-step pipeline table stakes; service classification; INDEX.md generation
**Avoids:** Pitfall 4 (one-agent-per-service invariant), Pitfall 10 (diff-aware rollback warning)

### Phase 6: e2e-flows Agent
**Rationale:** Depends on consolidated specs (Phase 3 output) and hash tool (Phase 1). The orchestrator skeleton from Phase 5 provides dispatch infrastructure; wire Step 4 to point at this agent.
**Delivers:** `agents/e2e-flows.md`; hash-based change detection; Mermaid flow docs in specs/e2e/
**Addresses:** e2e-flows differentiator feature
**Avoids:** Pitfall 13 (use changed_services manifest as primary trigger, not only hash comparison)

### Phase 7: spec-verifier Agent + Full Orchestrator Integration
**Rationale:** Read-only agent; safe to develop last because it cannot corrupt output. Wiring Steps 4–7 into the orchestrator completes the full pipeline. Integration test with all components.
**Delivers:** `agents/spec-verifier.md` (28 checks); complete SKILL.md; full pipeline end-to-end
**Addresses:** spec-verifier differentiator; confirmation summary with T1/T2/T3 findings
**Avoids:** Pitfall 8 (UNKNOWN return state in orchestrator), Pitfall 9 (synthetic fixture project before first real run)

### Phase 8: Consumer Updates + Polish
**Rationale:** case-briefer and case-validator updates are low-complexity and independent of the consolidation pipeline. Ship after Phase 7 validates the pipeline works.
**Delivers:** case-briefer specs/ priority lookup; CLAUDE.md snippet template; backfill strategy documentation
**Addresses:** Consumer update features; adoption enablement

### Phase Ordering Rationale

- Phases 1–3 are driven by the dependency chain: hash tool unblocks E2E, templates unblock consolidator, consolidator unblocks everything else.
- Phase 4 (/case updates) is placed before the orchestrator because classification must work before orchestration is wired end-to-end. It could slip to after Phase 5 without blocking Phase 5 development, but is better done earlier to avoid drift.
- Phase 5 deliberately builds the orchestrator in two passes (Steps 1–3.7 now, Steps 4–7 in Phase 7). This lets the core consolidation pipeline be used and validated before E2E and verification layers are added.
- Phases 6–7 are the "quality gate" layer — important but not required to get value from consolidation. The pipeline works without them (manual verification substitutes until they ship).
- Phase 8 is polish that improves adoption but does not affect correctness.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (spec-consolidator):** The 11 merge rules interact. The agent prompt ordering (supersessions before transformations) needs to be validated against real CASES.md structure. First fixture run may surface rule precedence issues.
- **Phase 5 (orchestrator):** maxTurns calibration is deferred to first usage (IMPL-SPEC Open Question #1). Monitor aggressively on first real consolidation; may require prompt iteration.
- **Phase 7 (verifier):** 28 checks are comprehensive but V-28 (SR keyword overlap / NLP-light detection) is flagged as ambitious. May need to downgrade to exact-match duplicate detection at implementation time.

Phases with standard patterns (skip research-phase):
- **Phase 1 (hash tool):** Algorithm is fully specified in IMPL-SPEC. Deno + unified/remark-parse stack is verified. Ten test cases are defined. Straightforward implementation.
- **Phase 2 (templates):** Static markdown. Section schemas are defined in IMPL-SPEC. Review-only validation.
- **Phase 4 (/case updates):** Incremental additions to an existing working skill. Pattern is established; no unknowns.
- **Phase 8 (consumer updates):** Low-complexity changes to existing agents; lookup order change and pattern recognition update.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Deno 2.7.7 verified via GitHub releases; unified@11.0.5, remark-parse@11.0.0 verified via npm registry; Claude Code skill/agent frontmatter verified via official docs (March 2026) |
| Features | HIGH | All features derived directly from IMPL-SPEC.md (authoritative design document); no external inference required |
| Architecture | HIGH | Architecture derived from working /case implementation (direct evidence) + IMPL-SPEC resolved design decisions; no unknowns |
| Pitfalls | HIGH | Critical pitfalls verified against official sources: mdast-util-to-markdown roundtrip limitation (documented), Claude Code context isolation (documented), v1 monolithic failure (direct project history) |

**Overall confidence:** HIGH

### Gaps to Address

- **maxTurns calibration (Pitfall 8):** IMPL-SPEC correctly defers this to first real usage. Set generous defaults (20+ for consolidators, 15 for verifier) and monitor turn counts on first run. Adjust before shipping Phase 7 if turn counts approach limits.
- **V-28 SR keyword overlap (FEATURES.md):** NLP-light keyword extraction for detecting semantically contradicting SRs may be too ambitious for reliable LLM execution. Plan to implement as exact-match duplicate detection first; escalate to semantic detection only if the simpler check is insufficient.
- **Backfill multi-phase same-service scenario (Pitfall 4):** IMPL-SPEC handles this implicitly (one agent per service), but the invariant needs an explicit test fixture: two phases both affecting the same service, consolidated in a single invocation. Verify SR numbering is sequential and phase-ordered.
- **Idempotency:** IMPL-SPEC does not explicitly validate what happens when `/consolidate {phase}` is run twice. Latest-wins semantics should make it safe, but add a fixture test confirming idempotent behavior before first real run.

## Sources

### Primary (HIGH confidence)
- `/Users/syr/Developments/cckit/docs/IMPL-SPEC.md` — authoritative design spec; all features, merge rules, verification checks
- `/Users/syr/Developments/cckit/skills/case/SKILL.md` — working reference implementation for orchestrator pattern
- [Deno Releases (GitHub)](https://github.com/denoland/deno/releases) — Deno 2.7.7, March 2026
- [Claude Code Skills Docs](https://code.claude.com/docs/en/skills) — SKILL.md frontmatter full reference
- [Claude Code Subagents Docs](https://code.claude.com/docs/en/sub-agents) — agent frontmatter, context isolation behavior
- [unified (npm)](https://www.npmjs.com/package/unified?activeTab=versions) — v11.0.5 latest confirmed
- [remark-parse (npm)](https://www.npmjs.com/package/remark-parse) — v11.0.0 latest confirmed
- [mdast-util-to-markdown](https://github.com/syntax-tree/mdast-util-to-markdown) — roundtrip impossibility documented explicitly

### Secondary (MEDIUM confidence)
- [Multi-agent coordination patterns (Tacnode)](https://tacnode.io/post/multi-agent-coordination) — parallel file write race conditions
- [MAST failure taxonomy (arXiv 2503.13657)](https://arxiv.org/abs/2503.13657) — specification failures are 41.8% of multi-agent failures
- [Claude Code sub-agent best practices](https://claudefa.st/blog/guide/agents/sub-agent-best-practices) — dispatch contract completeness

### Tertiary (LOW confidence)
- [Agent Skills Standard (agentskills.io)](https://agentskills.io) — open standard Claude Code follows; less authoritative than official Claude Code docs

---
*Research completed: 2026-03-30*
*Ready for roadmap: yes*
