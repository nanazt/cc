# Architecture Patterns

**Domain:** Claude Code multi-agent skill pipeline (plugin toolkit)
**Researched:** 2026-03-30
**Confidence:** HIGH (derived from working /case implementation + detailed IMPL-SPEC.md)

## Recommended Architecture

The consolidate v2 pipeline follows the **Orchestrator-Agent** pattern already proven by /case: a SKILL.md orchestrator owns the pipeline state machine, dispatches specialized agents for isolated subtasks, and gates progression on structured return protocols. The key architectural insight from /case is that Claude Code skills are NOT traditional code -- they are markdown instruction files that program LLM behavior. The "component boundaries" are prompt boundaries.

### System Context

```
Host Project (.planning/)
  |
  +-- phases/{NN}-CONTEXT.md, {NN}-CASES.md   (input: phase decisions)
  +-- PROJECT.md                                (input: service topology, GR rules)
  +-- specs/{service}/context.md, cases.md      (output: consolidated specs)
  +-- specs/e2e/{flow}.md                       (output: cross-service flows)
  +-- specs/INDEX.md                            (output: navigation index)

Plugin Project (cckit/)
  |
  +-- skills/consolidate/
  |     +-- SKILL.md           (orchestrator: 7+2 step state machine)
  |     +-- hash-sections.ts   (Deno tool: deterministic section hashing)
  |     +-- hash-sections_test.ts
  |     +-- templates/
  |           +-- domain-service.md
  |           +-- gateway-bff.md
  |           +-- event-driven.md
  |
  +-- agents/
        +-- spec-consolidator.md  (sonnet: per-service merge)
        +-- e2e-flows.md          (sonnet: cross-service flow docs)
        +-- spec-verifier.md      (opus: 28-check verification)
```

### Component Boundaries

| Component | Responsibility | Communicates With | Tool Access |
|-----------|---------------|-------------------|-------------|
| **SKILL.md orchestrator** | Pipeline state machine: phase resolution, service classification, agent dispatch, hash computation, INDEX.md writes, confirmation flow, commit/rollback | All agents (dispatch), hash tool (Bash), developer (AskUserQuestion) | Agent, Bash, Read, Write, Glob, Grep, AskUserQuestion |
| **spec-consolidator agent** | Per-service: read phase docs + existing spec, apply merge rules (PR->SR promotion, TR exclusion, R->OR rename, supersession), write spec files | Orchestrator only (dispatched, returns structured result) | Read, Grep, Glob, Write |
| **e2e-flows agent** | Cross-service: read consolidated specs, generate/update E2E flow docs with step tables, Mermaid diagrams, spec reference hashes | Orchestrator only (receives hash JSON as input, never computes) | Read, Grep, Glob, Write |
| **spec-verifier agent** | Read-only: execute 28 verification checks (T1/T2/T3 tiered), return structured findings | Orchestrator only (dispatched, returns findings in response -- no file writes) | Read, Grep, Glob |
| **hash-sections.ts** | Deterministic SHA-256/8 section hashing of markdown files via AST parsing | Orchestrator invokes via Bash, output consumed by orchestrator, passed to e2e-flows | Deno runtime (unified, remark-parse) |
| **Templates** | Section schema definitions per service archetype | Read by spec-consolidator (referenced in dispatch prompt or read from disk) | None (static files) |

### The Orchestrator Owns All State

This is the most important architectural decision, carried forward from /case. The orchestrator:

1. **Owns pipeline progression.** Agents never invoke other agents or advance the pipeline. Each agent completes its isolated task and returns.
2. **Owns all side-channel data.** Hash computation happens in the orchestrator (via Bash + Deno), not in agents. The E2E agent receives hashes as input and compares only.
3. **Owns developer interaction.** All `AskUserQuestion` calls happen in the orchestrator. Agents never prompt the developer directly.
4. **Owns error recovery.** Fail-fast + selective retry: re-dispatch only the failed agent, rollback all on abort.
5. **Owns the commit decision.** Agents write files, but the orchestrator gates commit on developer confirmation after verification.

This prevents the distributed state problem where agent A's output depends on agent B's state that depends on developer input -- all coordination flows through one point.

## Data Flow

### Primary Pipeline (7+2 Steps)

```
Developer invokes: /consolidate {phase-number}
         |
         v
[Step 1] Orchestrator: Identify Phase, Read Documents, Classify Services
         |  - Resolve phase directory
         |  - Read CONTEXT.md, CASES.md, PROJECT.md
         |  - 2-step service classification (operation headings > CONTEXT.md names)
         |  - Determine archetype per service from PROJECT.md topology
         |  - Read existing specs/ if present
         |  - Out-of-order consolidation warning check
         |
         v
[Step 2] Orchestrator dispatches N spec-consolidator agents (PARALLEL)
         |  - One agent per affected service
         |  - Each receives: phase docs, template type, existing spec, merge params
         |  - Each writes: specs/{service}/context.md + cases.md
         |  - Returns: structured completion message with operation counts, SR promotions
         |  - FAIL: halt, analyze, offer retry (failed agent only) or abort (rollback all)
         |
         v
[Step 3] Orchestrator: Collect Results, Update INDEX.md
         |  - Parse consolidator returns into changed_services manifest
         |  - Rewrite INDEX.md entirely (services table + E2E table + operation index)
         |
         v
[Step 3.5] Orchestrator: Identify E2E Flows
         |  - Scan existing specs/e2e/
         |  - Detect new flow candidates from cross-service dependencies
         |  - Developer confirms new flows via AskUserQuestion
         |
         v
[Step 3.7] Orchestrator: Orphan Directory Cleanup
         |  - Detect service dirs with 0 operations
         |  - Developer confirms removal
         |
         v
[Step 4] Orchestrator: Compute hashes (Bash -> Deno), dispatch e2e-flows agent (SEQUENTIAL)
         |  - Prerequisite: `which deno` check
         |  - Run hash-sections.ts on ALL spec files
         |  - Dispatch e2e-flows with hash JSON + changed_services + flow lists
         |  - FAIL: skip E2E, do NOT rollback service specs
         |
         v
[Step 5] Orchestrator: Dispatch spec-verifier agent (SEQUENTIAL)
         |  - Receives: specs dir, index, phase id, project file, changed services
         |  - Returns: T1/T2/T3 tiered findings (ephemeral, not persisted)
         |  - FAIL: mark UNVERIFIED, proceed to confirmation
         |
         v
[Step 6] Orchestrator: Present Confirmation Summary
         |  - Services updated/unchanged, E2E flows, verification findings
         |  - T1 findings = warning, not auto-block
         |  - Developer: confirm or reject
         |
         v
[Step 7] Orchestrator: Commit or Rollback
           - Confirm: stage + commit specs/
           - Reject: git checkout -- .planning/specs/
```

### Data Dependencies (What Flows Between Components)

```
Phase Docs (CONTEXT.md, CASES.md)
  |
  +---> spec-consolidator [per service]
  |       |
  |       +--> specs/{service}/context.md, cases.md  (files on disk)
  |       +--> completion message (structured text)   (to orchestrator)
  |
  +---> orchestrator collects completion messages
          |
          +--> changed_services manifest (JSON)
          |      |
          |      +---> e2e-flows agent
          |      +---> spec-verifier agent
          |
          +--> INDEX.md (rewritten by orchestrator)
          |
          +--> hash-sections.ts (Bash invocation)
                 |
                 +--> spec_hashes (JSON)
                        |
                        +---> e2e-flows agent (compares, never computes)
```

### Agent Communication Contract

Agents do NOT communicate with each other. All inter-agent data flows through the orchestrator:

1. **Orchestrator -> Agent:** XML dispatch tags (`<objective>`, `<service>`, `<files_to_read>`, etc.)
2. **Agent -> Orchestrator:** Structured return protocol (`## CONSOLIDATION COMPLETE` / `## CONSOLIDATION FAILED` with parseable fields)
3. **Between agents:** Never direct. Orchestrator parses Agent A's return, builds Agent B's dispatch prompt.

This is the same pattern as /case (case-briefer returns CASE-BRIEFING.md, orchestrator reads it, uses it to drive discussion, then dispatches case-validator with accumulated state).

## Patterns to Follow

### Pattern 1: Step-File Decomposition (from /case)

**What:** Break complex orchestrator logic into separate step files loaded on demand.

**When:** Orchestrator SKILL.md exceeds ~300 lines or has distinct phases with different behavioral modes.

**How /case does it:** SKILL.md contains routing logic + shared context. Step files (step-init.md, step-discuss.md, step-finalize.md) contain per-phase instructions. Orchestrator reads the next step file when transitioning.

**Recommendation for /consolidate:** The 7+2 steps are sequential and less conversational than /case's discussion loop. The SKILL.md itself should contain all steps inline. Step-file decomposition is warranted only if individual steps grow complex enough to warrant isolation (Step 2's parallel dispatch + error handling is the most likely candidate). Start monolithic, extract if needed.

**Rationale:** /case needs step files because the discussion step involves unbounded back-and-forth with the developer. /consolidate steps are mostly automated with punctuated developer checkpoints. Different interaction model = different decomposition strategy.

### Pattern 2: Structured Return Protocol

**What:** Every agent ends with a parseable completion/failure block that the orchestrator can mechanically extract.

**Example:**
```
## CONSOLIDATION COMPLETE
Service: auth
Files written: specs/auth/context.md, specs/auth/cases.md
Operations: 5
New SRs promoted: 3 (from PR-1, PR-2, PR-3: SR-4, SR-5, SR-6)
Superseded operations removed: 1 (Auth.OldOp)
```

**Why:** The orchestrator needs to build downstream dispatch prompts (changed_services manifest for E2E and verifier agents). Structured returns enable mechanical parsing without fragile text extraction.

**Pattern from /case:** case-briefer returns `## BRIEFING COMPLETE` with counts; case-validator returns `## VALIDATION COMPLETE` with gap counts. Consolidate follows the same convention.

### Pattern 3: XML Dispatch Tags for Agent Input

**What:** Wrap all agent input in XML tags with a documented input contract table.

**Example:**
```xml
<objective>Consolidate Phase 3A decisions for auth service.</objective>
<service>auth</service>
<template_type>domain-service</template_type>
<files_to_read>
- .planning/phases/3A/3A-CONTEXT.md
- .planning/phases/3A/3A-CASES.md
</files_to_read>
```

**Why:** XML tags are unambiguous delimiters that LLMs parse reliably. The input contract table in the agent definition documents what tags are required/optional, preventing dispatch errors.

### Pattern 4: Fail-Fast with Selective Retry

**What:** On agent failure, halt pipeline immediately. Offer retry of the specific failed agent, or abort with full rollback.

**Why:** Continuing with partial results produces inconsistent specs. But retrying ALL agents wastes tokens when only one failed. The orchestrator knows which agent failed and can re-dispatch just that one.

**Rollback granularity:**
- Retry: targets failed agent only
- Abort: `git checkout -- .planning/specs/` (all-or-nothing at commit level)
- E2E failure: skip E2E, keep service specs (degraded but usable)
- Verifier failure: mark UNVERIFIED, keep all files (read-only agent, no damage possible)

### Pattern 5: Template-Driven Section Schema

**What:** Define expected sections per service archetype as template files. The consolidator agent reads the template to know what sections to produce.

**Why:** Different service types have fundamentally different spec structures (domain service has Domain Model + Adapter Contracts; gateway has Route Table + Middleware Stack). Templates make this explicit and extensible.

**Three archetypes:** domain-service, gateway-bff, event-driven. Determined from PROJECT.md service topology at runtime, not hardcoded per service name.

### Pattern 6: Provenance Everywhere

**What:** Every rule, constraint, and significant decision in consolidated specs carries `(Source: Phase {id})` or `(Source: Phase {id} D-{n})` inline.

**Why:** Without provenance, specs become opaque -- nobody knows which phase introduced a rule, making it impossible to judge whether it should be superseded. Provenance enables the verifier (V-01) to mechanically check attribution and enables humans to trace decisions.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Agent-Side Hash Computation

**What:** Letting the E2E agent compute SHA-256 hashes inline during reasoning.

**Why bad:** Non-deterministic normalization (logic lives in LLM reasoning, varies between runs), 3-5x token cost for hash computation reasoning, shell escaping fragility with rich markdown. Explicitly rejected in IMPL-SPEC.md resolved item A1.

**Instead:** Orchestrator runs a dedicated Deno script (hash-sections.ts) and passes the deterministic JSON output to the E2E agent as read-only input.

### Anti-Pattern 2: Keyword-Based Service Classification

**What:** Guessing which services a phase affects by scanning for keywords like "authentication", "user profile", etc.

**Why bad:** Masks structural problems in phase documents. If operation headings don't contain `{Service}.{Op}` format, the documents have a convention violation that keyword guessing would hide.

**Instead:** 2-step classification: (1) operation headings in CASES.md, (2) service names in CONTEXT.md matching PROJECT.md topology. On miss: error + ask developer. (The v1 SKILL.md used keyword fallback; v2 explicitly rejects it.)

### Anti-Pattern 3: Inter-Agent Communication

**What:** Agent A writing a file that Agent B reads, or agents sharing state outside the orchestrator.

**Why bad:** Creates hidden dependencies. If Agent A fails and is retried, Agent B may have already consumed stale output. The orchestrator loses visibility into what data each agent consumed.

**Instead:** All inter-agent data flows through the orchestrator. The orchestrator parses Agent A's return and builds Agent B's dispatch prompt. File system is used for final output (specs/ files), not for inter-agent messaging.

### Anti-Pattern 4: Monolithic Agent Doing Everything

**What:** One agent that reads all phase docs, consolidates all services, generates E2E flows, and verifies.

**Why bad:** Context window pressure (all services' specs + all E2E flows + all verification state in one context). No parallelism. No selective retry. No separation of concerns between write (consolidator) and read-only verify (verifier).

**Instead:** Decompose by responsibility: per-service consolidation (parallel), cross-service E2E (sequential, needs consolidated output), verification (sequential, read-only). The orchestrator coordinates.

### Anti-Pattern 5: Persisting Verification Findings

**What:** Writing verifier output to a file that accumulates across runs.

**Why bad:** Verification findings are ephemeral -- they describe the current state of specs/ relative to the current consolidation. Persisting them creates stale references that confuse future runs.

**Instead:** Verifier returns findings in its response message only. Orchestrator includes them in the confirmation summary. After commit or rollback, findings are gone. Git log has the commit message; the findings served their purpose.

## Suggested Build Order

Build order is driven by dependency chains and testability.

### Phase 1: Hash Tool (standalone, zero LLM dependencies)

**Build:** `hash-sections.ts` + `hash-sections_test.ts`

**Why first:**
- Only non-LLM component. Can be built and tested with `deno test` independently.
- Validates the unified/remark-parse AST approach before any agent depends on it.
- Unblocks Step 4 of the pipeline (hash computation before E2E dispatch).
- If the hash approach has problems, better to discover them before building agents that consume hash output.

**Dependencies:** Deno runtime, npm:unified, npm:remark-parse.
**Testable in isolation:** Yes (10 test cases defined in IMPL-SPEC).

### Phase 2: Templates (static files, define section schemas)

**Build:** `templates/domain-service.md`, `templates/gateway-bff.md`, `templates/event-driven.md`

**Why second:**
- Static markdown files with no runtime behavior.
- Define the section schema that spec-consolidator will use.
- Must exist before spec-consolidator can reference them.
- Quick to produce, provides structural foundation.

**Dependencies:** None.
**Testable in isolation:** Review only (no automated tests -- they are reference documents).

### Phase 3: spec-consolidator Agent

**Build:** `agents/spec-consolidator.md`

**Why third:**
- Core write path. Everything downstream depends on consolidated specs existing.
- Merge rules (PR->SR promotion, TR exclusion, R->OR rename, supersession) are the most complex logic.
- Can be tested by manually dispatching against a fixture phase.
- Does not depend on hash tool or E2E agent.

**Dependencies:** Templates (Phase 2). Phase docs from host project for testing.
**Testable in isolation:** Yes (dispatch with test fixtures, inspect output files).

### Phase 4: Orchestrator SKILL.md (Steps 1-3)

**Build:** `skills/consolidate/SKILL.md` -- Steps 1 through 3.7 (phase resolution, service classification, parallel consolidator dispatch, INDEX.md update, E2E flow identification, orphan cleanup).

**Why fourth:**
- Can exercise the full dispatch-collect-index pipeline with the spec-consolidator from Phase 3.
- Steps 3.5 and 3.7 (E2E identification and orphan cleanup) are orchestrator-only logic that can be stubbed for E2E agent dispatch.
- E2E and verifier dispatch (Steps 4-5) can be placeholder stubs initially.

**Dependencies:** spec-consolidator agent (Phase 3).
**Testable:** Yes, with manual invocation against a host project. Steps 4-7 can return early with "E2E and verification not yet implemented."

### Phase 5: e2e-flows Agent

**Build:** `agents/e2e-flows.md`

**Why fifth:**
- Depends on consolidated specs existing (Phase 3) and hash tool (Phase 1).
- The orchestrator skeleton from Phase 4 provides the dispatch infrastructure.
- Can be tested by pointing at already-consolidated specs.

**Dependencies:** Hash tool (Phase 1), consolidated specs (Phase 3 output).
**Testable in isolation:** Yes (dispatch with pre-consolidated specs + hash JSON).

### Phase 6: spec-verifier Agent

**Build:** `agents/spec-verifier.md`

**Why sixth:**
- Read-only agent. Can be developed against output from any prior phase.
- 28 verification checks are individually testable.
- Does not block other components.
- opus model cost means it is worth deferring until there are real specs to verify.

**Dependencies:** Consolidated specs + E2E flows to verify against.
**Testable in isolation:** Yes (dispatch against pre-built specs, check findings).

### Phase 7: Orchestrator SKILL.md (Steps 4-7) + Integration

**Build:** Complete SKILL.md with E2E dispatch (Step 4), verifier dispatch (Step 5), confirmation summary (Step 6), commit/rollback (Step 7).

**Why last:**
- Steps 4-7 are coordination logic that plugs in the components from Phases 1, 5, and 6.
- Integration testing requires all components to exist.
- Confirmation summary format and commit message are polish items.

**Dependencies:** All prior phases.
**Testable:** Full end-to-end against a real host project phase.

### Build Order Dependency Graph

```
Phase 1: hash-sections.ts ----+
                               |
Phase 2: templates -----------+---> Phase 3: spec-consolidator ---> Phase 4: orchestrator (1-3.7)
                                                                        |
                              Phase 1 ----+                             |
                                          |                             v
                              Phase 3 ----+--> Phase 5: e2e-flows ---> Phase 7: orchestrator (4-7)
                                                                        ^
                              Phase 3 ---------> Phase 6: verifier ----+
```

## How /case Architecture Informs /consolidate Design

### Direct Patterns to Reuse

| /case Pattern | /consolidate Application |
|---------------|------------------------|
| SKILL.md as state machine with step routing | SKILL.md owns 7+2 step pipeline progression |
| Agent dispatch via Agent tool with XML tags | Same pattern for all three agents |
| Structured return protocol (`## COMPLETE` / `## FAILED`) | Same pattern, extended with parseable fields |
| `disable-model-invocation: true` frontmatter | Prevents subagents from triggering other skills |
| Agent frontmatter with explicit tool list | Each agent gets minimum required tools |
| Quality gate checklists in agent definitions | All three agents have quality gates |
| AskUserQuestion for developer checkpoints | Used for E2E flow confirmation, orphan cleanup, final commit |

### Key Differences from /case

| Dimension | /case | /consolidate |
|-----------|-------|-------------|
| **Interaction model** | Conversational (unbounded discussion loop per operation) | Pipeline (mostly automated, punctuated developer checkpoints) |
| **Agent count** | 2 (briefer + validator) | 3 (consolidator + e2e + verifier) |
| **Parallelism** | Sequential (briefer then discussion then validator) | Parallel consolidators, sequential E2E + verifier |
| **File output** | Single file (CASES.md) via orchestrator | Multiple files (N service specs + E2E flows + INDEX) via agents |
| **External tool** | None | Deno hash script (Bash invocation) |
| **Step decomposition** | Separate step files (init/discuss/finalize) | Inline in SKILL.md (steps are shorter, less conversational) |
| **Error recovery** | Minimal (validator findings presented to developer) | Fail-fast + selective retry + git rollback |

### Architectural Lesson: Who Writes Files

In /case, the orchestrator writes CASE-SCRATCH.md and CASES.md. Agents return data in their response, the orchestrator assembles and writes.

In /consolidate, agents write spec files directly (spec-consolidator writes context.md + cases.md, e2e-flows writes flow files). The orchestrator writes only INDEX.md. This is a deliberate difference: consolidation output is per-service, and routing each service's full spec content through the orchestrator would waste context window on passthrough. The tradeoff: the orchestrator has less direct control over file content, compensated by the verifier's 28-check validation pass.

## Sources

- `/Users/syr/Developments/cckit/docs/IMPL-SPEC.md` -- authoritative design document (HIGH confidence)
- `/Users/syr/Developments/cckit/skills/case/SKILL.md` -- working reference implementation (HIGH confidence)
- `/Users/syr/Developments/cckit/agents/case-briefer.md` -- agent contract pattern reference (HIGH confidence)
- `/Users/syr/Developments/cckit/agents/case-validator.md` -- verification agent pattern reference (HIGH confidence)
- `/Users/syr/Developments/cckit/skills/consolidate/SKILL.md` -- v1 skill being replaced (HIGH confidence, for contrast)
- `/Users/syr/Developments/cckit/.planning/PROJECT.md` -- project context and constraints (HIGH confidence)
