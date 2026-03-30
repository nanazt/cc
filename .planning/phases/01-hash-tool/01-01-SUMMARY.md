---
phase: 01-hash-tool
plan: "01"
subsystem: testing
tags: [deno, typescript, unified, remark-parse, sha256, markdown, ast]

# Dependency graph
requires: []
provides:
  - tools/hash-sections.ts: Deno CLI + library for deterministic SHA-256/8 section hashing
  - tools/tests/fixtures/*.md: 11 fixture files covering all 10 hash-sections test cases
affects:
  - 01-hash-tool (plan 02: hash-sections_test.ts test file)
  - future phases requiring hash-sections.ts CLI invocation

# Tech tracking
tech-stack:
  added:
    - "npm:unified@^11.0.0 (AST pipeline processor)"
    - "npm:remark-parse@^11.0.0 (CommonMark markdown-to-AST parser)"
    - "npm:mdast-util-to-string@^4.0.0 (heading text extraction)"
    - "npm:@types/mdast@^4.0.0 (TypeScript types for mdast AST)"
    - "Web Crypto API (crypto.subtle.digest, Deno built-in)"
  patterns:
    - "Position-offset section slicing: parse AST for H2 boundaries, slice original source bytes (not AST roundtrip)"
    - "import.meta.main guard: dual library/CLI mode without subprocess overhead"
    - "Fixture-based testing: separate git-tracked .md files for byte-level hash stability"
    - "normalize() before hashing: CRLF/CR->LF, trailing whitespace strip, blank line collapse"

key-files:
  created:
    - tools/hash-sections.ts
    - tools/tests/fixtures/basic.md
    - tools/tests/fixtures/code-block.md
    - tools/tests/fixtures/tilde-fence.md
    - tools/tests/fixtures/trailing-ws.md
    - tools/tests/fixtures/blank-lines.md
    - tools/tests/fixtures/determinism.md
    - tools/tests/fixtures/json-format.md
    - tools/tests/fixtures/header-in-hash.md
    - tools/tests/fixtures/empty-section.md
    - tools/tests/fixtures/multi-file-a.md
    - tools/tests/fixtures/multi-file-b.md
  modified: []

key-decisions:
  - "D-01: Position-offset slicing of original source bytes instead of AST roundtrip serialization -- hashes immune to parser version changes"
  - "D-10: Separate fixture files in tools/tests/fixtures/*.md (git-tracked, not inline template literals) for byte-level stability"
  - "D-11: import.meta.main guard enables dual library/CLI mode -- tests import functions directly, no subprocess spawning"

patterns-established:
  - "Pattern 1: Hash original source bytes via position offsets -- never serialize AST back to markdown before hashing"
  - "Pattern 2: normalize() applied to each sliced section before SHA-256 -- trailing whitespace, blank lines, CRLF normalized"
  - "Pattern 3: CLI entrypoint uses import.meta.main guard -- functions exported for test imports"

requirements-completed: [HASH-01, HASH-02, HASH-03, HASH-04, HASH-05, HASH-06]

# Metrics
duration: 3min
completed: "2026-03-30"
---

# Phase 01 Plan 01: Hash Tool Implementation Summary

**Deno SHA-256/8 section hashing tool using unified + remark-parse AST with position-offset source slicing, plus 11 test fixture files**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-30T13:52:41Z
- **Completed:** 2026-03-30T13:55:39Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments

- `tools/hash-sections.ts` implements 3 exported functions (`normalize`, `hashSections`, `hashFile`) plus a CLI entrypoint that processes one or more markdown files and outputs a JSON schema matching `{ files: [{ path, sections: [{ heading, hash }] }] }`
- Position-offset approach (D-01) hashes original source bytes directly using `position!.start.offset!` from remark-parse AST — no remark-stringify dependency, hashes immune to parser version changes
- 11 fixture files covering all 10 test cases: basic H2 extraction, fenced code block safety (backtick + tilde), normalization edge cases, determinism, JSON format, header-in-hash, empty sections, and multi-file inputs

## Task Commits

Each task was committed atomically:

1. **Task 1: Create test fixture files** - `00b51b7` (feat)
2. **Task 2: Implement hash-sections.ts** - `167d6cd` (feat)

**Plan metadata:** _(added after state update)_

## Files Created/Modified

- `tools/hash-sections.ts` - Core implementation: normalize(), hashSections(), hashFile(), CLI entrypoint
- `tools/tests/fixtures/basic.md` - Test 1: two H2 sections with H1 preamble and nested H3
- `tools/tests/fixtures/code-block.md` - Test 2: backtick-fenced block containing ## fake heading
- `tools/tests/fixtures/tilde-fence.md` - Test 3: tilde-fenced block containing ## fake heading
- `tools/tests/fixtures/trailing-ws.md` - Test 4: lines with actual trailing spaces and tabs
- `tools/tests/fixtures/blank-lines.md` - Test 5: 4 consecutive blank lines between paragraphs
- `tools/tests/fixtures/determinism.md` - Test 6: varied content for determinism verification
- `tools/tests/fixtures/json-format.md` - Test 7: two H2 sections for JSON schema validation
- `tools/tests/fixtures/header-in-hash.md` - Test 8: H2 "Original Name" to verify heading included in hash
- `tools/tests/fixtures/empty-section.md` - Test 9: ## Empty immediately followed by ## Has Content
- `tools/tests/fixtures/multi-file-a.md` - Test 10a: ## Alpha
- `tools/tests/fixtures/multi-file-b.md` - Test 10b: ## Beta

## Decisions Made

- All decisions (D-01 through D-14) carried forward from CONTEXT.md with no deviations
- Used `mdast-util-to-string@^4.0.0` for heading text extraction as recommended in RESEARCH.md (correct use case: heading text, not section serialization)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. First run of `deno run --allow-read tools/hash-sections.ts` will fetch npm packages from registry; subsequent runs use Deno cache.

## Next Phase Readiness

- `tools/hash-sections.ts` is ready for plan 02 which adds `tools/hash-sections_test.ts` with all 10 test cases
- CLI produces valid JSON matching IMPL-SPEC schema; all verification checks pass
- Fixture files are byte-stable and ready for hash assertion tests

---
*Phase: 01-hash-tool*
*Completed: 2026-03-30*

## Self-Check: PASSED

Files verified:
- FOUND: tools/hash-sections.ts
- FOUND: tools/tests/fixtures/basic.md
- FOUND: tools/tests/fixtures/code-block.md
- FOUND: tools/tests/fixtures/tilde-fence.md
- FOUND: tools/tests/fixtures/trailing-ws.md
- FOUND: tools/tests/fixtures/blank-lines.md
- FOUND: tools/tests/fixtures/determinism.md
- FOUND: tools/tests/fixtures/json-format.md
- FOUND: tools/tests/fixtures/header-in-hash.md
- FOUND: tools/tests/fixtures/empty-section.md
- FOUND: tools/tests/fixtures/multi-file-a.md
- FOUND: tools/tests/fixtures/multi-file-b.md

Commits verified:
- FOUND: 00b51b7 (Task 1)
- FOUND: 167d6cd (Task 2)
