# Phase 1: Hash Tool - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-30
**Phase:** 01-hash-tool
**Areas discussed:** Hashing strategy, Error handling, Output path format, CLI no-args behavior, Version pinning, File location, Test fixtures, Test approach, Heading text extraction, H1/H3 handling, Processing order

---

## Hashing Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Position offsets | AST for H2 boundaries, slice original source bytes via position.start/end. No remark-stringify needed. | :white_check_mark: |
| AST roundtrip serialization (IMPL-SPEC original) | Serialize AST nodes back to markdown via remark-stringify, then hash. Risk: stringify formatting changes break hash stability. | |
| Hybrid | Position offsets when available, remark-stringify fallback. Added complexity, two code paths. | |

**User's choice:** Position offsets
**Notes:** User asked why remark-stringify updates would change hashes. Explained that remark-stringify applies its own formatting rules (list indentation, emphasis markers, blank line placement) which can change between versions, producing different text for identical input.

---

## Error Handling (File Errors)

| Option | Description | Selected |
|--------|-------------|----------|
| stderr + continue | Print error to stderr, continue processing remaining files, exit code 1. JSON contains only successful files. | :white_check_mark: |
| Immediate abort | Stop at first error, exit code 1, no JSON output. | |
| JSON error field | Include error entries in JSON output, exit code always 0. | |

**User's choice:** stderr + continue

---

## Error Handling (Empty Sections)

| Option | Description | Selected |
|--------|-------------|----------|
| Empty sections array | File included in JSON with `sections: []`. Not an error, exit code 0. | :white_check_mark: |
| stderr warning + exclude | Warning to stderr, file excluded from JSON. | |

**User's choice:** Empty sections array

---

## Output Path Format

| Option | Description | Selected |
|--------|-------------|----------|
| CLI argument as-is | Return exact path string the user provided. Predictable, simple matching. | :white_check_mark: |
| Normalized relative path | Resolve and normalize to cwd-relative path. Consistent but caller must predict format. | |

**User's choice:** CLI argument as-is
**Notes:** User initially rejected the question, asked for rationale. Explained that CLI-as-is allows orchestrator to match by exact string comparison, normalization creates unpredictability, and path handling is the caller's responsibility.

---

## CLI No-Args Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Usage message + exit 1 | Print usage to stderr, exit code 1. Standard CLI convention. | :white_check_mark: |
| Empty JSON + exit 0 | Return `{ "files": [] }`. Pipeline-friendly but hides misuse. | |

**User's choice:** Usage message + exit 1

---

## Version Pinning Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| ^ caret major pin | `npm:unified@^11.0.0`. Minor/patch auto-update, major blocked. | :white_check_mark: |
| ~ tilde minor pin | Patch-only auto-update. More conservative. | |
| Exact pin | `npm:unified@11.0.5`. Maximum stability, no auto-updates. | |

**User's choice:** ^ caret major pin
**Notes:** User asked whether minor/major-only pinning was possible. Explained semver range syntax and risk analysis: position offsets make hashes immune to parser formatting changes, so only major breaking changes (AST position schema changes) could affect stability.

---

## File Location

| Option | Description | Selected |
|--------|-------------|----------|
| tools/ (pre-emptive separation) | `tools/hash-sections.ts` at project root level. Ready for multi-skill reuse. | :white_check_mark: |
| skills/consolidate/ (IMPL-SPEC original) | Co-located with consolidate skill. IMPL-SPEC File Inventory location. | |

**User's choice:** tools/ (pre-emptive separation)
**Notes:** User initially questioned whether other skills could reuse the hash tool. After analysis showing only consolidate as confirmed consumer but ADV-01 (drift detection) as potential v2 consumer, user decided to pre-emptively separate. Confirmed that SKILL.md can call tools/ path via Bash without issues.

---

## Test Fixtures

| Option | Description | Selected |
|--------|-------------|----------|
| Separate fixture files | `tools/tests/fixtures/*.md`. Git-tracked, byte-stable, minimal permission scoping. | :white_check_mark: |
| Inline template literals | Markdown strings directly in test file. Co-located but subject to editor/OS line ending differences. | |

**User's choice:** Separate fixture files

---

## Test Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Function import | Export core functions, tests import directly. `import.meta.main` for CLI guard. | :white_check_mark: |
| Subprocess CLI execution | Tests spawn `deno run` process, parse JSON output. E2E style but slower and harder to debug. | |

**User's choice:** Function import

---

## Heading Text Extraction

| Option | Description | Selected |
|--------|-------------|----------|
| AST children text | Recursive text extraction from heading node children. ATX hashes, markup auto-stripped. | :white_check_mark: |
| Source slice + manual strip | Slice source bytes at heading position, manually remove ## prefix and trailing hashes. Preserves markdown formatting. | |

**User's choice:** AST children text

---

## H1/H3 Section Handling

| Option | Description | Selected |
|--------|-------------|----------|
| H2-only boundaries | Only H2 creates section boundaries. H1, H3, H4 etc. are internal content. | :white_check_mark: |
| H1 also as boundary | H1 and H2 both create boundaries. Handles non-standard markdown but differs from IMPL-SPEC. | |

**User's choice:** H2-only boundaries

---

## Processing Order

| Option | Description | Selected |
|--------|-------------|----------|
| Sequential | For-loop, one file at a time. Simple, predictable error order. | :white_check_mark: |
| Promise.allSettled parallel | All files simultaneously. Faster for many files but non-deterministic stderr order. | |

**User's choice:** Sequential
**Notes:** User asked for explanation. Detailed analysis showed 2-10 files at ms-each makes parallelism immeasurable, while sequential guarantees deterministic error ordering and simpler debugging.

---

## Claude's Discretion

- normalize() implementation details
- Internal function decomposition and naming
- Specific assertion strategies per test case
- stderr error message formatting

## Deferred Ideas

- UTF-8 BOM / non-UTF-8 encoding handling — low probability, defer unless encountered
- Standalone distributable package — wait for v2 installation requirements
