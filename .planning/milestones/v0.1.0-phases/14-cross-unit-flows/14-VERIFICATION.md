---
phase: 14-cross-unit-flows
verified: 2026-04-02T12:00:00Z
status: passed
score: 12/12 must-haves verified
re_verification: false
---

# Phase 14: Cross-Unit Flows Verification Report

**Phase Goal:** Projects with cross-unit communication can opt into flow documentation; projects without it are unaffected
**Verified:** 2026-04-02T12:00:00Z
**Status:** passed
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Dependencies section in MODEL.md specifies a structured format with bold component names | VERIFIED | `### Dependencies Format` at line 72 with `**{component-name}** -- {description}` pattern |
| 2 | spec-consolidator agent is instructed to write Dependencies using the structured format | VERIFIED | Line 62 contains "Dependencies section format:" paragraph with bold component name as parsing anchor |
| 3 | SKILL.md Step 3.5 parses structured dependency entries by bold component name instead of scanning natural language | VERIFIED | Line 178 specifies `- **{name}** --` pattern matching; old text "check Dependencies section for cross-component references" is absent |
| 4 | e2e-flows.md Step Table template uses {operation} without HTTP call bias | VERIFIED | Line 52 uses `{operation}` only; grep for "HTTP call" returns 0 matches |
| 5 | No external file references IMPL-SPEC as a current document | VERIFIED | 0 occurrences in docs/STACK.md, 0 in CLAUDE.md; all remaining IMPL-SPEC references are inside .planning/ |
| 6 | Microservice fixture has a schema with e2eFlows=true and CLI/library fixtures have e2eFlows=false | VERIFIED | schema-parser.ts output confirms e2eFlows=true (microservice), false (cli), false (library) |
| 7 | Microservice fixture has a specs/e2e/ directory with a cross-component flow file | VERIFIED | `tests/fixtures/verification/microservice/specs/e2e/auth-billing-flow.md` exists with all 5 sections |
| 8 | Auth and billing fixture specs use structured Dependencies format with bold component names | VERIFIED | auth/context.md: `- **billing** --`; billing/context.md: `- **auth** --` |
| 9 | INDEX.md E2E Flows section is populated for the microservice fixture | VERIFIED | Table row with "auth-billing-flow" and link to `e2e/auth-billing-flow.md`; "No E2E flows." removed |
| 10 | CLI and library fixtures have no specs/e2e/ directory, confirming skip behavior | VERIFIED | `test ! -d` passes for both cli/specs/e2e and library/specs/e2e |
| 11 | Flow file follows the 5-section format from e2e-flows.md agent spec | VERIFIED | Title+description, Step Table (6 columns, 2 rows), Sequence Diagram (Mermaid), Error Paths, Spec References all present |
| 12 | Flow file Spec References table references sections that exist in auth and billing fixture specs | VERIFIED | All 4 hashes match real computed values: auth/context.md Overview=2f0f576f, auth/cases.md Auth.Login=2a3bdb65, billing/context.md Overview=0dbef436, billing/cases.md Billing.CreateSubscription=b0f6db8e |

**Score:** 12/12 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `docs/MODEL.md` | Structured Dependencies format specification | VERIFIED | `### Dependencies Format` subsection at line 72 with bold anchor pattern and example |
| `agents/spec-consolidator.md` | Updated Dependencies output instruction | VERIFIED | "Dependencies section format:" paragraph at line 62 with bold component name instruction |
| `skills/consolidate/SKILL.md` | Updated Step 3.5 structured dependency parsing | VERIFIED | Line 178 uses `- **{name}** --` pattern matching against schema component registry |
| `agents/e2e-flows.md` | Bias-free Step Table template | VERIFIED | Line 52 uses `{operation}` only; zero "HTTP call" occurrences |
| `docs/STACK.md` | IMPL-SPEC references replaced | VERIFIED | 0 IMPL-SPEC occurrences; replaced with "MODEL.md and agent frontmatter", "from MODEL.md", "Rejected early in project design" |
| `CLAUDE.md` | IMPL-SPEC commit example replaced | VERIFIED | 0 IMPL-SPEC occurrences; line 58 reads `docs: update MODEL.md with section override syntax` |
| `tests/fixtures/verification/microservice/consolidation.schema.md` | Schema with e2eFlows=true | VERIFIED | `e2e-flows | true` in Meta table; auth (api-gateway type), billing (untyped) |
| `tests/fixtures/verification/cli/consolidation.schema.md` | Schema with e2eFlows=false | VERIFIED | `e2e-flows | false` in Meta table; init, config (both untyped) |
| `tests/fixtures/verification/library/consolidation.schema.md` | Schema with e2eFlows=false | VERIFIED | `e2e-flows | false` in Meta table; parser, emitter (both untyped) |
| `tests/fixtures/verification/microservice/specs/e2e/auth-billing-flow.md` | Cross-component E2E flow file | VERIFIED | Complete 5-section flow file with real hashes, universal terminology |
| `tests/fixtures/verification/microservice/specs/auth/context.md` | Structured Dependencies with bold billing reference | VERIFIED | `- **billing** -- payment processing for premium account upgrades` |
| `tests/fixtures/verification/microservice/specs/billing/context.md` | Structured Dependencies with bold auth reference | VERIFIED | `- **auth** -- caller identity and session validation` |
| `tests/fixtures/verification/microservice/specs/INDEX.md` | E2E Flows section with flow table entry | VERIFIED | Table row: Auth-Billing Flow linking to e2e/auth-billing-flow.md |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| docs/MODEL.md | agents/spec-consolidator.md | Dependencies section format specification consumed by consolidator | WIRED | Both reference `**{component-name}** --` pattern; consolidator instruction says "bold component name is the parsing anchor" |
| docs/MODEL.md | skills/consolidate/SKILL.md | Step 3.5 parses Dependencies using MODEL.md-defined format | WIRED | SKILL.md Step 3.5 uses `**{name}** --` pattern; MODEL.md defines same pattern as parsing anchor |
| microservice schema | microservice specs/ | Schema Components table matches existing spec directories | WIRED | Schema lists auth, billing; specs/ contains auth/, billing/, e2e/ directories |
| auth-billing-flow.md | auth/context.md | Spec References table references auth sections | WIRED | auth/context.md Overview hash 2f0f576f matches flow file entry |
| auth-billing-flow.md | billing/cases.md | Spec References table references billing operations | WIRED | billing/cases.md Billing.CreateSubscription hash b0f6db8e matches flow file entry |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Microservice schema parses with e2eFlows=true | `deno run --allow-read tools/schema-parser.ts .../microservice/consolidation.schema.md` | `"e2eFlows": true` | PASS |
| CLI schema parses with e2eFlows=false | `deno run --allow-read tools/schema-parser.ts .../cli/consolidation.schema.md` | `"e2eFlows": false` | PASS |
| Library schema parses with e2eFlows=false | `deno run --allow-read tools/schema-parser.ts .../library/consolidation.schema.md` | `"e2eFlows": false` | PASS |
| hash-sections.ts processes flow file | `deno run --allow-read tools/hash-sections.ts .../auth-billing-flow.md` | 4 section hashes (Step Table, Sequence Diagram, Error Paths, Spec References) | PASS |
| Flow file hashes match real computed values | hash-sections.ts on auth/billing specs | All 4 hashes verified: 2f0f576f, 2a3bdb65, 0dbef436, b0f6db8e | PASS |
| All deno tests pass | `deno test tools/ --allow-read --allow-write` | 40 passed, 0 failed | PASS |
| No "service" terminology in e2e flow file | `grep -ri "service" .../specs/e2e/` | 0 matches | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| FLOW-01 | 14-02 | E2E flow generation is opt-in via schema flag (not default) | SATISFIED | Microservice schema has `e2e-flows | true`; CLI and library schemas have `e2e-flows | false`; schema-parser defaults to false |
| FLOW-02 | 14-02 | Orchestrator skips flow steps when E2E is disabled | SATISFIED | SKILL.md Step 3.5: "If false: Skip Steps 3.5 and 4 entirely"; CLI/library fixtures have no e2e/ directory |
| FLOW-03 | 14-01, 14-02 | When enabled, flow agent uses universal unit terminology | SATISFIED | e2e-flows.md template uses `{operation}` (no "HTTP call"); flow file uses "Component" column header; 0 "service" occurrences in e2e/ |
| FLOW-04 | 14-01, 14-02 | Hash-based change detection works with universal unit structure | SATISFIED | Flow file Spec References contain real 8-char hashes from hash-sections.ts; e2e-flows agent hash comparison logic documented |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | - | - | - | No anti-patterns detected in any modified file |

Zero TODO/FIXME/PLACEHOLDER markers found. Zero empty implementations. Zero stub patterns.

### Human Verification Required

### 1. Structured Dependencies Round-Trip

**Test:** Run `/consolidate` on a project with cross-component dependencies and verify the spec-consolidator produces bold-formatted Dependencies entries.
**Expected:** Dependencies section in output contains `- **{component}** -- {description}` for cross-component references and plain text for external dependencies.
**Why human:** Requires running the full consolidation pipeline with an LLM agent processing real phase documents.

### 2. E2E Flow Skip Path

**Test:** Run `/consolidate` on a project with schema `e2e-flows: false` and verify no flow-related prompts appear.
**Expected:** Console output shows "E2E flows disabled in schema. Skipping." and no flow files are created.
**Why human:** Requires interactive orchestrator execution to observe skip behavior.

### 3. E2E Flow Discovery from Structured Dependencies

**Test:** Run `/consolidate` on a project with schema `e2e-flows: true` where component specs have bold Dependencies entries, and verify Step 3.5 discovers flow candidates.
**Expected:** Orchestrator presents discovered flow candidates for confirmation based on bold component names in Dependencies sections.
**Why human:** Requires interactive orchestrator execution with LLM agent parsing real spec files.

### Gaps Summary

No gaps found. All 12 observable truths verified. All 13 artifacts exist, are substantive, and are properly wired. All 4 FLOW requirements satisfied with implementation evidence. All 4 commits exist in git. All 40 deno tests pass. Zero anti-patterns detected.

---

_Verified: 2026-04-02T12:00:00Z_
_Verifier: Claude (gsd-verifier)_
