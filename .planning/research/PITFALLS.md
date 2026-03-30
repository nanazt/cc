# Domain Pitfalls

**Domain:** Claude Code multi-agent plugin toolkit (spec consolidation, case discovery, agent orchestration)
**Researched:** 2026-03-30

## Critical Pitfalls

Mistakes that cause rewrites, silent data corruption, or fundamental design failures.

### Pitfall 1: AST Serialization Is Not Roundtrip-Safe

**What goes wrong:** The hash-sections.ts tool parses markdown into an mdast AST, then serializes AST nodes back to markdown text for hashing. mdast-util-to-markdown explicitly documents that "complete roundtripping is impossible" -- the serialized output may differ from the original input even when the source content is unchanged. This means identical spec files could produce different hashes across runs if the serialization path changes between unified/remark versions.

**Why it happens:** mdast-util-to-markdown normalizes formatting during serialization: ATX headings replace setext, fenced code defaults change, whitespace is reformatted. The AST captures semantics, not exact syntax. When hashing serialized-from-AST output rather than the original byte range, you hash remark's normalization choices, not the document content.

**Consequences:** E2E flow files regenerated unnecessarily on every consolidation run (false staleness). Developer loses trust in hash stability. Worst case: a remark version bump silently changes all hashes, triggering full E2E rewrites.

**Prevention:**
1. Hash the **original source bytes** from the file, not the AST-serialized output. Use the AST only for H2 boundary detection (node positions), then slice the original file content between those byte offsets.
2. remark-parse AST nodes include `position.start.offset` and `position.end.offset` properties pointing back to the source. Use these to extract the original text.
3. Pin unified/remark-parse versions (already planned in IMPL-SPEC) and add a determinism test (test case #6), but treat pinning as defense-in-depth, not primary mitigation.

**Detection:** Test case #6 (determinism across 10 runs) catches within-version drift. Add a cross-version test: parse + serialize + hash with two different remark versions and assert hashes match. If they diverge, the serialization path is the problem.

**Phase relevance:** Hash tool implementation (early phase). Must be resolved before E2E agent work begins.

**Confidence:** HIGH -- mdast-util-to-markdown docs explicitly state roundtrip limitation. Source: [mdast-util-to-markdown GitHub](https://github.com/syntax-tree/mdast-util-to-markdown).

---

### Pitfall 2: Subagent Context Isolation Causes Silent Information Loss

**What goes wrong:** Each Claude Code subagent starts with a fresh context window containing only its system prompt and dispatch payload. It does not see the parent orchestrator's conversation history. The spec-consolidator agent receives phase documents via `<files_to_read>` but has no visibility into what the orchestrator learned during Step 1 (service classification, archetype determination, prior consolidation warnings). If the orchestrator discovers an edge case (e.g., out-of-order consolidation warning from Step 1.7), the subagent never knows.

**Why it happens:** Claude Code subagents are architecturally isolated by design -- this is a feature for context preservation, but a trap for multi-step workflows where upstream reasoning matters. The dispatch prompt is the sole communication channel; anything not serialized into XML tags is lost.

**Consequences:** Subagent makes decisions contradicting orchestrator's analysis. Example: orchestrator detects out-of-order consolidation and warns developer, but spec-consolidator proceeds to overwrite newer content because it was never told about the warning. Or: orchestrator classifies a service as gateway-bff, but ambiguous signals in the source docs cause the subagent to independently re-classify it as domain-service.

**Prevention:**
1. Treat the dispatch prompt as a **complete contract**. Every decision the orchestrator makes in Step 1 must be serialized into the dispatch XML tags. The current IMPL-SPEC input contract is good but verify that `<template_type>` is the resolved archetype, not raw signals for the subagent to re-derive.
2. Add a `<orchestrator_notes>` tag for edge-case context (warnings, override decisions, developer confirmations from AskUserQuestion).
3. Never rely on the subagent to replicate orchestrator-side logic. The orchestrator classifies; the subagent consumes the classification.

**Detection:** During first real consolidation run, compare orchestrator Step 1 output against subagent behavior. If the subagent re-derives any classification the orchestrator already computed, the dispatch contract has a gap.

**Phase relevance:** Orchestrator SKILL.md and agent prompt design. Must be addressed when writing dispatch logic.

**Confidence:** HIGH -- Claude Code docs confirm "Each subagent starts with a fresh conversation (no prior message history)." Source: [Claude Code subagent docs](https://code.claude.com/docs/en/sub-agents).

---

### Pitfall 3: Parallel Agent File Write Conflicts on INDEX.md

**What goes wrong:** Step 2 dispatches spec-consolidator agents in parallel, one per service. Each writes to `specs/{service}/context.md` and `specs/{service}/cases.md` -- these are isolated per-service paths, no conflict. But if any agent also touches `INDEX.md` or a shared file, parallel writes corrupt it. The IMPL-SPEC correctly assigns INDEX.md writing to the orchestrator (Step 3), but this separation must be enforced absolutely.

**Why it happens:** LLM agents are non-deterministic. A spec-consolidator might decide to "helpfully" update INDEX.md if its prompt isn't explicit about boundaries. Agent prompts that say "write the spec files" without explicitly saying "do NOT write INDEX.md" leave room for the model to expand scope.

**Consequences:** Corrupted INDEX.md, partial writes, merge conflicts. In Claude Code, parallel subagents share the working directory -- there is no git worktree isolation by default for subagents (worktree isolation is opt-in via the `isolation: worktree` frontmatter field).

**Prevention:**
1. Spec-consolidator agent prompt must include an explicit **exclusion list**: "Write ONLY to `specs/{service}/context.md` and `specs/{service}/cases.md`. Do NOT write to INDEX.md, e2e/, or any file outside your service directory."
2. Use the `tools` frontmatter field to restrict the agent to Write + Read + Grep + Glob (already in IMPL-SPEC), but recognize this doesn't prevent writing to wrong paths -- it only controls which tool types are available.
3. Spec-verifier V-07/V-08 partially catches post-hoc, but prevention is better than detection.

**Detection:** During development: run two spec-consolidator agents against the same service to confirm they don't touch shared files. In production: orchestrator Step 3 should read INDEX.md before writing it -- if it was modified since the orchestrator last read it (timestamp check), something wrote it unexpectedly.

**Phase relevance:** Agent prompt writing phase. The boundaries must be in the agent definition, not just the IMPL-SPEC.

**Confidence:** HIGH -- multi-agent file conflict is the #1 documented issue in parallel agent architectures. Source: [Multi-agent coordination patterns](https://tacnode.io/post/multi-agent-coordination).

---

### Pitfall 4: PR-to-SR Renumbering Collision Under Parallel Dispatch

**What goes wrong:** Multiple spec-consolidator agents run in parallel for different services. Each reads existing SRs from `specs/{service}/cases.md` and assigns new SR numbers starting from the highest existing + 1. Since each service has its own cases.md, the numbering is per-service -- no cross-service collision. **However**, if a future consolidation run touches the same service from two different phases (backfill scenario: `/consolidate 1` and `/consolidate 2` in sequence where both affect gateway), the second run must read the first run's output. This is a sequential dependency disguised as independent work.

**Why it happens:** The orchestrator dispatches per-service, not per-phase. If a single invocation `/consolidate 2` triggers backfill for Phase 1 gateway content AND Phase 2 gateway content, these must be merged in phase order within a single agent dispatch -- not split into two parallel agents for the same service.

**Consequences:** SR-1 from Phase 1 and SR-1 from Phase 2 collide. Or Phase 2 content overwrites Phase 1 backfill because "latest wins" is applied without phase ordering.

**Prevention:**
1. The IMPL-SPEC's service classification (Step 1) already groups by service. Verify that **one agent per service** is an invariant, even when multiple phases feed into that service.
2. Within a single agent dispatch, the `<files_to_read>` must list phase documents in chronological order, and the merge rules must apply in that order.
3. Add an explicit check in the orchestrator: if `<changed_services>` from Step 1 would dispatch two agents for the same service, merge them into one dispatch.

**Detection:** Test with a two-phase backfill scenario where both phases affect the same service. Verify SR numbering is sequential and phase-ordered.

**Phase relevance:** Orchestrator Step 2 dispatch logic. Specifically, the backfill strategy.

**Confidence:** MEDIUM -- the IMPL-SPEC appears to handle this correctly (one agent per service), but the backfill section's "Phase 1 can also be consolidated independently first" suggests separate invocations could create this condition. Needs explicit test.

---

### Pitfall 5: v1 Skill Failure Pattern -- Untestable Monolithic Procedures

**What goes wrong:** The v1 `/consolidate-specs` skill (SKILL.md in this repo) was never executed. It existed as a monolithic procedure document with hardcoded service names (`auth`, `user`, `catalog`, `gateway`), hardcoded signal keywords, project-specific templates, and no separation between orchestration logic and domain processing. The skill was too coupled to one project and too complex to validate incrementally.

**Why it happens:** Designing a skill as a single document with embedded classification logic, templates, and merge rules makes it impossible to test any piece in isolation. The developer can't validate service classification without running the full consolidation. The templates can't be tested without real phase documents. The merge rules can't be verified without existing spec files.

**Consequences:** The entire v1 skill was abandoned and rewritten as v2. The sunk cost wasn't just the skill definition -- it was the assumption that it would work, which blocked consolidation for multiple shipped phases.

**Prevention (v2 design already addresses most of this):**
1. Separate concerns: orchestrator (SKILL.md) handles flow control, agents handle domain logic, hash tool handles computation. Each is independently testable.
2. Templates are external files, not embedded in prompts. They can be validated structurally.
3. Service classification uses PROJECT.md topology, not hardcoded keywords.
4. **Remaining risk:** Agent prompts are still "monolithic documents" that can't be unit-tested. Write fixture-based integration tests that validate agent output against known inputs.

**Detection:** If a skill/agent hasn't been executed within one phase cycle of its creation, it's likely untestable or unclear. Track first-execution dates.

**Phase relevance:** All phases. The architectural split into orchestrator + agents + tool is the primary mitigation, but each agent prompt needs its own validation fixtures.

**Confidence:** HIGH -- direct evidence from this project's v1 history.

## Moderate Pitfalls

### Pitfall 6: Merge Rule Complexity Creates Unverifiable Transformations

**What goes wrong:** The IMPL-SPEC defines 11 merge rules for the spec-consolidator. Rules interact: superseded operations (rule 6) can remove sections that contain SRs being referenced by rule 5 (GR references). PR promotion (rule 2) must account for superseded rules (rule 7). The agent must apply all 11 rules correctly in a single pass with no way to verify intermediate states.

**Why it happens:** LLM agents execute merge rules through natural language reasoning, not programmatic logic. Unlike code where you can step through rule application, the agent reasons about all rules simultaneously. Rule interactions (PR promotion + supersession + renumbering + provenance) create a combinatorial space that exceeds reliable single-pass reasoning.

**Prevention:**
1. Order the rules in the agent prompt to minimize interactions: supersessions first (rules 6, 7), then exclusions (rules 3, 10, 11), then transformations (rules 2, 4), then structural rules (rules 1, 8, 9). The agent prompt should prescribe this order explicitly.
2. The spec-verifier (28 checks) is the safety net, but V-14 (PR count) and V-16 (latest-wins) are the critical cross-checks. Prioritize these.
3. Create test fixtures with known rule interactions: a fixture where superseded operations AND PR promotion AND R-to-OR transformation all apply to the same service.

**Detection:** V-14 (PR-to-SR count mismatch) is the canary. If promoted SR count doesn't match source PR count minus superseded rules, a merge rule misfired.

**Phase relevance:** Agent prompt writing + test fixture design.

---

### Pitfall 7: Deno npm Package Network Dependency in Offline/CI Environments

**What goes wrong:** `hash-sections.ts` uses `npm:unified@11.0.5` and `npm:remark-parse@11.0.0`. Deno downloads these on first run from the npm registry. In offline environments, air-gapped machines, or CI runners without network access to npm, the hash tool fails silently or with a cryptic Deno error. The IMPL-SPEC notes `--no-remote` cannot be used, but doesn't address CI or cached deployment.

**Why it happens:** Deno's npm: specifier model fetches packages lazily. Unlike a node_modules install step that fails visibly before execution, Deno defers the failure to runtime. The `DENO_DIR` cache is per-user and environment-specific -- a cached package on the developer's machine doesn't help a fresh CI runner.

**Consequences:** Consolidation completes for service specs (Steps 2-3) but E2E flows fail (Step 4) because the hash tool can't run. The IMPL-SPEC handles this gracefully (skip E2E, don't rollback service specs), but repeated E2E failures erode confidence in the tool.

**Prevention:**
1. Add a `deno cache` pre-warm step to the skill's installation/setup documentation. Run `deno cache skills/consolidate/hash-sections.ts` after installation to pre-fetch dependencies.
2. For CI: include the `deno cache` step in the CI pipeline before any consolidation run.
3. Consider vendoring: `deno vendor skills/consolidate/hash-sections.ts` creates a local copy of dependencies. This removes the network dependency entirely but adds vendored files to the repo.
4. The orchestrator's Step 4 Deno check (`which deno`) should also verify the cache: run `deno run --allow-read hash-sections.ts --version` (or a no-op invocation) to confirm packages resolve.

**Detection:** The orchestrator's existing `which deno` check catches missing Deno. Add a follow-up: attempt a dry-run of the hash tool with a known fixture file before the real invocation.

**Phase relevance:** Hash tool implementation + installation documentation.

---

### Pitfall 8: Agent maxTurns Exhaustion Without Meaningful Output

**What goes wrong:** A subagent hits its maxTurns limit mid-execution and returns whatever partial state it has accumulated. For the spec-consolidator, this could mean context.md is written but cases.md is not, or the quality gate checklist is incomplete. The orchestrator parses the return message for `## CONSOLIDATION COMPLETE` or `## CONSOLIDATION FAILED`, but a maxTurns-exhausted agent may return neither -- it just stops.

**Why it happens:** maxTurns counts tool-use turns, not reasoning steps. A consolidator that needs to Read 4 files, Grep for patterns, Write 2 files, and self-verify uses 7+ tool turns. If maxTurns is set too low, the agent cuts off before the quality gate. Claude Code's default behavior when maxTurns is exhausted is to return the agent's last message as-is.

**Consequences:** Partial spec files written to disk. Orchestrator fails to parse the return message, doesn't know whether to retry or rollback. Silent data corruption if the orchestrator assumes success.

**Prevention:**
1. The IMPL-SPEC defers maxTurns calibration to first usage (Open Question #1). This is correct, but set a generous default (20+ for consolidators, 15 for verifier) and monitor.
2. The orchestrator's return parsing must handle three states: COMPLETE, FAILED, and **UNKNOWN** (neither header found). UNKNOWN triggers retry, not success.
3. The agent prompt's return protocol should instruct: "If you are running low on turns, emit `## CONSOLIDATION FAILED` with reason `maxTurns approaching` before your last turn." This is aspirational (the agent may not track its turn count), but the instruction biases toward safe failure.

**Detection:** Monitor turn counts during first real consolidation runs. If any agent uses >80% of its maxTurns, increase the limit before it becomes a failure.

**Phase relevance:** Agent prompt design + orchestrator error handling.

---

### Pitfall 9: Test Fixtures That Don't Cover Rule Interactions

**What goes wrong:** The IMPL-SPEC defines 10 test cases for hash-sections_test.ts, all testing isolated behaviors (basic extraction, code blocks, normalization, determinism). This is correct for the hash tool. But the broader testing strategy -- validating the spec-consolidator agent's merge rules, the E2E agent's flow generation, and the verifier's 28 checks -- has no fixture plan. Without fixtures that exercise rule interactions, the first real consolidation run becomes the test.

**Why it happens:** Fixture design for LLM agents is harder than for deterministic code. You can't assert exact output; you assert structural properties (SR count, provenance tags present, superseded operations absent). The temptation is to defer fixture creation until "we see what the agent actually produces," which means the first production run is untested.

**Consequences:** First real consolidation run surfaces 3-5 issues that could have been caught with fixtures. Each requires re-running the skill, reviewing diffs, and potentially rolling back. The developer's confidence in the tool drops before it's even proven useful.

**Prevention:**
1. Create a **minimal synthetic project** fixture set: a fake PROJECT.md with 2 services, a Phase 1 CONTEXT.md (infrastructure, no CASES.md), and a Phase 2 CONTEXT.md + CASES.md with 3 operations, 2 PRs, 1 superseded operation.
2. Run the orchestrator against the fixture set. Assert:
   - Service classification finds exactly the 2 services
   - context.md contains correct sections per archetype
   - cases.md has 3 operation headings
   - 2 PRs promoted to SR-1 and SR-2
   - Superseded operation absent from output
   - INDEX.md has correct operation count
3. These fixtures double as regression tests when agent prompts change.

**Detection:** If test fixtures don't exist before the "first real run," this pitfall is active.

**Phase relevance:** Test fixture phase. Must precede first real consolidation.

---

### Pitfall 10: Orchestrator Rollback Destroys Manual Spec Edits

**What goes wrong:** The orchestrator's rollback mechanism is `git checkout -- .planning/specs/`. This reverts ALL changes to specs/, not just changes from the current consolidation run. If the developer has manually edited a spec file (despite the CLAUDE.md instruction "Never modify specs/ files manually"), rollback destroys those edits.

**Why it happens:** `git checkout --` reverts to the last committed state. It doesn't distinguish between "changes from this consolidation run" and "changes the developer made independently."

**Consequences:** Developer loses manual edits with no warning. The CLAUDE.md snippet says "Never modify specs/ files manually," but this constraint is unenforceable and developers will violate it (e.g., quick typo fix, adding a note for a colleague).

**Prevention:**
1. Before rollback, check `git diff --stat .planning/specs/` and compare against the orchestrator's known-written files. If there are diffs in files the orchestrator didn't touch, warn: "Rollback will also revert changes in {files} that were not part of this consolidation. Proceed?"
2. Consider `git stash` before starting consolidation, restoring on rollback only the orchestrator's changes.
3. At minimum, list all files that will be reverted in the rejection confirmation.

**Detection:** Any time `git checkout -- .planning/specs/` runs, check if the diff includes files not in the current consolidation's `changed_services` manifest.

**Phase relevance:** Orchestrator Step 7 implementation.

## Minor Pitfalls

### Pitfall 11: Provenance Tag Format Drift Across Agents

**What goes wrong:** The spec-consolidator produces `(Source: Phase 3A)` or `(Source: Phase 3A D-1)`. If the format varies slightly between agent runs (e.g., `(Source: Phase 3A)` vs `(Source: phase 3A)` vs `(Source: Phase 3a)`), the verifier's grep-based V-01 check produces false negatives.

**Prevention:** Include exact provenance format in the agent prompt with a regex example: `(Source: Phase {id})` where `{id}` is the exact string from `<phase_id>`. Verifier should normalize case before checking.

---

### Pitfall 12: Gateway cases.md "Judgment Seat" Test Is Subjective

**What goes wrong:** The IMPL-SPEC says gateway cases.md is created "ONLY when gateway has behavioral operations that pass the 'judgment seat' test." This test requires semantic understanding -- whether code "examines state, applies rules, and branches to different outcomes." An LLM agent will inconsistently apply this test across runs.

**Prevention:** Enumerate qualifying patterns explicitly in the gateway template rather than relying on a subjective test. Examples: "VerifyJwt middleware with token expiry branching = YES. PassthroughRoute = NO." The more examples, the more consistent the agent's judgment.

---

### Pitfall 13: E2E Flow Stale Hash False Negatives

**What goes wrong:** The hash comparison only detects changes in spec sections that the E2E flow references. If a new cross-service dependency is added to a service's context.md but the E2E flow's Spec References table doesn't reference that section, the flow won't be flagged as stale even though it's incomplete.

**Prevention:** The `<changed_services>` manifest (not just hashes) should be the primary trigger for E2E flow re-evaluation. Hash comparison is for detecting stale unchanged flows; the manifest is for detecting newly affected flows.

---

### Pitfall 14: Template Section Ordering Sensitivity

**What goes wrong:** If the spec-consolidator agent outputs sections in a different order than the template specifies, the verifier's V-04 check (archetype-appropriate sections present) passes but the output is inconsistent across services. Different section orders make specs harder to scan.

**Prevention:** The agent prompt should include explicit section ordering with numbering. The verifier should check order, not just presence.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Hash tool implementation | #1 (AST serialization roundtrip) | Use source byte offsets from AST positions, not serialized output |
| Hash tool implementation | #7 (Deno npm cache) | Add `deno cache` pre-warm to setup docs; test offline |
| Agent prompt writing | #2 (context isolation) | Complete dispatch contracts; `<orchestrator_notes>` tag |
| Agent prompt writing | #3 (parallel write conflicts) | Explicit exclusion lists in prompts |
| Agent prompt writing | #6 (merge rule complexity) | Prescribe rule application order; interaction test fixtures |
| Agent prompt writing | #8 (maxTurns exhaustion) | Generous defaults; UNKNOWN return state handling |
| Orchestrator implementation | #4 (SR renumbering collision) | One agent per service invariant; phase-ordered file reads |
| Orchestrator implementation | #10 (rollback destroys manual edits) | Diff-aware rollback with developer warning |
| Test fixture design | #9 (insufficient interaction coverage) | Synthetic project fixture set before first real run |
| First real consolidation | #5 (v1 lesson) | Incremental validation; don't accumulate untested phases |

## Sources

- [Claude Code subagent documentation](https://code.claude.com/docs/en/sub-agents) -- context isolation, maxTurns, tool restrictions
- [Claude Code sub-agent best practices](https://claudefa.st/blog/guide/agents/sub-agent-best-practices) -- parallel vs sequential patterns
- [mdast-util-to-markdown](https://github.com/syntax-tree/mdast-util-to-markdown) -- roundtrip impossibility documented
- [MAST: Multi-Agent System Failure Taxonomy (arXiv 2503.13657)](https://arxiv.org/abs/2503.13657) -- 14 failure modes in 3 categories; specification failures = 41.8%
- [Multi-agent coordination patterns (Tacnode)](https://tacnode.io/post/multi-agent-coordination) -- file write race conditions
- [Deno npm integration issues](https://github.com/denoland/deno/issues/28999) -- cache behavior
- cckit v1 SKILL.md (this repo) -- direct evidence of monolithic skill failure
- cckit IMPL-SPEC.md Resolved Review Items -- A1-D3 documenting already-caught design pitfalls
