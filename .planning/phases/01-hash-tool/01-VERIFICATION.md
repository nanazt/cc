---
phase: 01-hash-tool
verified: 2026-03-30T14:30:00Z
status: passed
score: 20/20 must-haves verified
re_verification: false
---

# Phase 01: Hash Tool Verification Report

**Phase Goal:** Developers can compute deterministic section hashes for any markdown file via CLI
**Verified:** 2026-03-30T14:30:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

All 20 truths span both plans (01-01 and 01-02).

#### Plan 01-01 Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | hashSections() returns deterministic SHA-256/8 hashes for each H2 section | VERIFIED | sha256Hex8() uses Web Crypto; `.slice(0,8)` confirmed at line 39; determinism test passes |
| 2 | Position offsets slice original source bytes (no AST roundtrip serialization) | VERIFIED | `position!.start.offset!` at lines 72, 75; no remark-stringify import anywhere |
| 3 | Pre-first-H2 content is excluded from output | VERIFIED | basic.md has H1 + preamble paragraph; test asserts `sections.length === 2` (not 3+) |
| 4 | Fenced code blocks with ## inside do not create false section boundaries | VERIFIED | code-block.md + tilde-fence.md; both tests assert `sections.length === 1` and pass |
| 5 | normalize() strips trailing whitespace, collapses blank lines, normalizes LF | VERIFIED | Lines 24-27 implement all three transforms; normalization tests pass |
| 6 | JSON output matches schema: `{ files: [{ path, sections: [{ heading, hash }] }] }` | VERIFIED | CLI output for basic.md confirmed via behavioral spot-check; `JSON.stringify({ files }, null, 2)` at line 123 |
| 7 | Multiple CLI file paths produce multiple entries in files array | VERIFIED | CLI spot-check with basic.md + multi-file-a.md produces 2-entry files array |
| 8 | File errors go to stderr, processing continues, exit code 1 if any error | VERIFIED | Nonexistent file: outputs `{"files":[]}` to stdout, exits code 1; no-args exits code 1 |

#### Plan 01-02 Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 9 | All 10 test cases pass via deno test | VERIFIED | `10 passed | 0 failed` confirmed by live run |
| 10 | Tests import functions directly from hash-sections.ts (no subprocess spawning) | VERIFIED | Line 2: `from "./hash-sections.ts"`; no `Deno.Command` or `Deno.Process` in test file |
| 11 | Test 1 verifies basic H2 extraction with nested H3 and pre-H2 exclusion | VERIFIED | Test asserts `sections.length === 2`, headings "Section One"/"Section Two", 8-char hex hashes |
| 12 | Test 2 verifies fenced code block does not create false section boundary | VERIFIED | Asserts `sections.length === 1`, heading "Real Section" |
| 13 | Test 3 verifies tilde fence handled identically to backtick fence | VERIFIED | Asserts `sections.length === 1`, heading "Tilde Test" |
| 14 | Test 4 verifies trailing whitespace normalization produces identical hashes | VERIFIED | normalize() direct equality + hashSections end-to-end equality both asserted |
| 15 | Test 5 verifies blank line collapsing produces identical hashes | VERIFIED | normalize() direct equality + hashSections end-to-end equality both asserted |
| 16 | Test 6 verifies determinism over 10 consecutive runs | VERIFIED | Loop of 10, all hashes compared to first result |
| 17 | Test 7 verifies JSON output format matches IMPL-SPEC schema | VERIFIED | hashFile() path/sections shape asserted; hash regex validated |
| 18 | Test 8 verifies header rename changes hash | VERIFIED | assertNotEquals on "Original Name" vs "Changed Name" hashes |
| 19 | Test 9 verifies empty section produces valid hash | VERIFIED | `sections.length === 2`; empty section hash is 8-char hex |
| 20 | Test 10 verifies multi-file produces files array with correct entries | VERIFIED | hashFile called on both fixtures; headings, paths, and hash inequality all asserted |

**Score:** 20/20 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `tools/hash-sections.ts` | Hash tool implementation + CLI entrypoint | VERIFIED | 128 lines (min_lines: 60 satisfied); exports normalize, hashSections, hashFile confirmed |
| `tools/tests/fixtures/basic.md` | Test 1 fixture: two H2 sections with nested H3 | VERIFIED | Contains ## Section One, ## Section Two, ### Subsection; H1 preamble present |
| `tools/tests/fixtures/code-block.md` | Test 2 fixture: backtick fence with ## inside | VERIFIED | Triple-backtick block contains `## Fake Heading` |
| `tools/tests/fixtures/tilde-fence.md` | Test 3 fixture: tilde fence with ## inside | VERIFIED | ~~~ block contains `## Another Fake` |
| `tools/tests/fixtures/trailing-ws.md` | Test 4 fixture: lines with trailing spaces/tabs | VERIFIED | `cat -v` shows trailing spaces and tab chars confirmed |
| `tools/tests/fixtures/blank-lines.md` | Test 5 fixture: 3+ consecutive blank lines | VERIFIED | File exists; blank line normalization test passes |
| `tools/tests/fixtures/determinism.md` | Test 6 fixture: varied content | VERIFIED | File exists; determinism test passes 10 iterations |
| `tools/tests/fixtures/json-format.md` | Test 7 fixture: two H2 sections | VERIFIED | File exists; JSON format test passes |
| `tools/tests/fixtures/header-in-hash.md` | Test 8 fixture: H2 "Original Name" | VERIFIED | File exists; test uses inline strings (fixture not directly loaded in test — test constructs strings directly, which is equivalent per plan) |
| `tools/tests/fixtures/empty-section.md` | Test 9 fixture: ## Empty then ## Has Content | VERIFIED | `## Empty` immediately followed by `## Has Content` confirmed |
| `tools/tests/fixtures/multi-file-a.md` | Test 10a fixture: ## Alpha | VERIFIED | `## Alpha` heading present |
| `tools/tests/fixtures/multi-file-b.md` | Test 10b fixture: ## Beta | VERIFIED | `## Beta` heading present |
| `tools/hash-sections_test.ts` | 10 Deno test cases | VERIFIED | 128 lines (min_lines: 80 satisfied); 10 Deno.test() calls confirmed |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| tools/hash-sections.ts | npm:unified, npm:remark-parse | inline npm specifiers | VERIFIED | `npm:unified@^11.0.0` at line 1; `npm:remark-parse@^11.0.0` at line 2 |
| tools/hash-sections.ts | crypto.subtle.digest | Web Crypto API built-in | VERIFIED | `crypto.subtle.digest("SHA-256", data)` at line 35 |
| tools/hash-sections.ts | import.meta.main | CLI guard | VERIFIED | `if (import.meta.main)` at line 98 |
| tools/hash-sections_test.ts | tools/hash-sections.ts | direct function imports | VERIFIED | `from "./hash-sections.ts"` at line 2; normalize, hashSections, hashFile all imported |
| tools/hash-sections_test.ts | tools/tests/fixtures/ | Deno.readTextFile | VERIFIED | FIXTURES constant at line 4; fixture paths used in 8 of 10 tests |
| tools/hash-sections_test.ts | jsr:@std/assert | assertEquals, assertNotEquals, assertMatch | VERIFIED | `from "jsr:@std/assert"` at line 1; all three assertions used |

### Data-Flow Trace (Level 4)

Not applicable. This phase produces a CLI tool and test suite, not a UI component that renders dynamic data from a store or API. The data flow is: file bytes -> AST parse -> position offsets -> slice -> normalize -> SHA-256 -> 8-char hex. This pipeline was verified via behavioral spot-checks.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| CLI produces valid JSON with 2 sections for basic.md | `deno run --allow-read tools/hash-sections.ts tools/tests/fixtures/basic.md` | `{"files":[{"path":"...","sections":[{"heading":"Section One","hash":"e6940f87"},{"heading":"Section Two","hash":"f7bc0a71"}]}]}` | PASS |
| Multi-file CLI produces 2 entries in files array | `deno run --allow-read tools/hash-sections.ts basic.md multi-file-a.md` | files array has 2 entries with correct paths and sections | PASS |
| Missing file exits with code 1 | `deno run --allow-read tools/hash-sections.ts nonexistent.md 2>/dev/null; echo $?` | exit: 1 (also outputs `{"files":[]}` to stdout as specified) | PASS |
| No-args exits with code 1 | `deno run --allow-read tools/hash-sections.ts 2>/dev/null; echo $?` | exit: 1 | PASS |
| deno test: 10 passed, 0 failed | `deno test --allow-read=tools/tests/fixtures tools/hash-sections_test.ts` | `ok \| 10 passed \| 0 failed (27ms)` | PASS |
| TypeScript type-check | `deno check tools/hash-sections.ts` | no output (clean) | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| HASH-01 | 01-01 | Deterministic SHA-256/8 hashes for H2 sections | SATISFIED | sha256Hex8 + hashSections implemented; basic test asserts 8-char hex hashes |
| HASH-02 | 01-01 | AST-based parsing handles CommonMark edge cases | SATISFIED | unified + remark-parse used; fenced code block tests (backtick + tilde) pass |
| HASH-03 | 01-01 | Normalization: trailing whitespace, blank lines, LF | SATISFIED | normalize() at lines 22-28; normalization tests pass both direct and end-to-end |
| HASH-04 | 01-01 | Pre-first-H2 content excluded from hashing | SATISFIED | h2Indices loop starts at first H2; basic.md preamble excluded (test asserts 2 sections not 3+) |
| HASH-05 | 01-01 | JSON output format matches IMPL-SPEC schema | SATISFIED | CLI outputs `{ files: [{ path, sections: [{ heading, hash }] }] }`; behavioral spot-check confirmed |
| HASH-06 | 01-01 | Multiple file paths accepted as CLI arguments | SATISFIED | `for (const path of Deno.args)` loop; multi-file spot-check produces 2 entries |
| HASH-07 | 01-02 | 10 test cases pass | SATISFIED | `10 passed \| 0 failed` confirmed by live run |
| TEST-04 | 01-02 | hash-sections_test.ts with 10 test cases per IMPL-SPEC | SATISFIED | hash-sections_test.ts exists with 10 Deno.test() calls covering all IMPL-SPEC test case definitions |

**Orphaned requirements check:** REQUIREMENTS.md maps HASH-01 through HASH-07 and TEST-04 to Phase 1. All 8 are claimed in plan frontmatter (HASH-01 through HASH-06 in 01-01, HASH-07 and TEST-04 in 01-02). No orphaned requirements.

### Anti-Patterns Found

None found. Scanned hash-sections.ts and hash-sections_test.ts:

- No TODO/FIXME/placeholder comments
- No `return null`, `return {}`, or `return []` without real data (the empty array return for no-H2 case is a documented design decision D-04, not a stub)
- No hardcoded empty data passed to rendering
- No console.log-only implementations
- No `remark-stringify` import (correctly excluded per D-01)
- No subprocess spawning in test file (no `Deno.Command` or `Deno.Process`)

### Human Verification Required

None. All behaviors are programmatically verifiable for this phase (CLI tool + test suite). No UI, no real-time behavior, no external service integration.

### Gaps Summary

No gaps. All 20 must-have truths verified, all 13 artifacts present and substantive, all 6 key links wired, all 8 requirements satisfied, all 6 behavioral spot-checks pass.

---

_Verified: 2026-03-30T14:30:00Z_
_Verifier: Claude (gsd-verifier)_
