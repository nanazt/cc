# Phase 1: Hash Tool - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Deno CLI tool that computes deterministic SHA-256/8 hashes for each H2 section in markdown files. Accepts one or more file paths, outputs JSON to stdout. This is the foundational tool for E2E flow change detection in later phases.

</domain>

<decisions>
## Implementation Decisions

### Hashing strategy
- **D-01:** Use position offsets, not AST roundtrip serialization. Parse with unified + remark-parse to find H2 boundaries, then slice original source bytes using `position.start.offset` / `position.end.offset`. No remark-stringify dependency needed.
- **D-02:** Rationale: AST serialization roundtrip breaks hash stability — remark-stringify applies its own formatting rules, and version updates can change output for identical input. Position offsets hash the original bytes, making hashes immune to parser version changes.

### Error handling
- **D-03:** File not found / unreadable: print error to stderr, continue processing remaining files, exit with code 1. Successful files still appear in stdout JSON.
- **D-04:** No H2 sections in file: include file in JSON output with empty `sections` array. This is not an error — exit code 0.
- **D-05:** No CLI arguments: print usage message to stderr (`Usage: hash-sections.ts <file1.md> [file2.md ...]`), exit code 1.

### Output format
- **D-06:** JSON `path` field uses the exact CLI argument as given — no normalization or resolution. Orchestrator can match by string comparison against the path it provided.

### Version pinning
- **D-07:** Inline npm specifiers with caret major pin: `npm:unified@^11.0.0`, `npm:remark-parse@^11.0.0`. No deno.json needed. Minor/patch updates auto-resolve; only major changes are blocked.

### File location
- **D-08:** `tools/hash-sections.ts` and `tools/hash-sections_test.ts` at project root level, not inside `skills/consolidate/`. Pre-emptive separation for potential reuse by other skills. Host projects install via `ln -s /path/to/cckit/tools .claude/tools`.
- **D-09:** IMPL-SPEC originally specified `skills/consolidate/hash-sections.ts` — this decision overrides that path. Orchestrator (SKILL.md) must reference `tools/hash-sections.ts` instead.

### Test fixtures
- **D-10:** Separate fixture files in `tools/tests/fixtures/*.md`, not inline template literals. Fixtures are git-tracked, ensuring byte-level stability for determinism tests. Enables `--allow-read=tools/tests/fixtures` minimal permission scoping.

### Test approach
- **D-11:** hash-sections.ts exports core functions (`hashSections`, `hashFile`). Tests import functions directly — no subprocess spawning. CLI entrypoint uses `import.meta.main` guard so the module works as both library and CLI.

### Heading text extraction
- **D-12:** Extract heading text from AST node children (recursive text extraction). ATX trailing hashes, leading `##`, bold/emphasis markup all automatically stripped by the parser. JSON `heading` field contains clean text only.

### Section boundaries
- **D-13:** Only H2 headers create section boundaries. H1, H3, H4, etc. inside an H2 section are treated as internal content and included in that section's hash. Pre-first-H2 content is excluded entirely.

### Processing order
- **D-14:** Sequential file processing (for loop). No parallelism. Error output order matches input order. 2-10 files at ~ms each makes parallelism unnecessary.

### Claude's Discretion
- Exact normalize() implementation details (trailing whitespace stripping, blank line collapsing, LF normalization)
- Internal function decomposition and naming
- Specific assertion strategies per test case
- stderr error message formatting

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Hash tool specification
- `docs/IMPL-SPEC.md` -- Hash Tool section (lines 46-111): algorithm, output schema, test case definitions, dependency versions. Note: D-01 (position offsets) and D-08 (file location) override IMPL-SPEC's original design.

### Requirements
- `.planning/REQUIREMENTS.md` -- HASH-01 through HASH-07, TEST-04: acceptance criteria for hash tool

### Known concerns
- `.planning/STATE.md` -- Blockers/Concerns section: "AST serialization roundtrip breaks hash stability" (resolved by D-01 position offset approach)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `skills/consolidate/SKILL.md`: Existing v1 orchestrator — will need path update from `skills/consolidate/hash-sections.ts` to `tools/hash-sections.ts` when wiring Step 4 (Phase 6)

### Established Patterns
- No TypeScript/Deno code exists yet — this is the first code file in the project
- Skill/agent files use YAML frontmatter + Markdown body pattern

### Integration Points
- Orchestrator SKILL.md Step 4 will invoke hash tool via `deno run --no-lock --allow-read tools/hash-sections.ts <files>`
- E2E flows agent (Phase 6) consumes JSON output for change detection

</code_context>

<specifics>
## Specific Ideas

- remark-stringify dependency eliminated entirely — position offset approach means only unified + remark-parse are needed
- CLAUDE.md Technology Stack section lists remark-stringify as a dependency — this can be updated after Phase 1 implementation

</specifics>

<deferred>
## Deferred Ideas

- UTF-8 BOM handling and non-UTF-8 file encoding — low probability in practice, defer unless encountered
- Extracting hash tool to a standalone distributable package — wait for v2 installation requirements (INST-01/02/03)

</deferred>

---

*Phase: 01-hash-tool*
*Context gathered: 2026-03-30*
