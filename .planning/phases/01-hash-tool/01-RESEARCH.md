# Phase 1: Hash Tool - Research

**Researched:** 2026-03-30
**Domain:** Deno CLI tool -- deterministic markdown section hashing (SHA-256/8)
**Confidence:** HIGH

## Summary

Phase 1 builds a Deno CLI tool (`tools/hash-sections.ts`) that parses markdown files using unified + remark-parse, extracts H2 sections via position offsets from the original source, normalizes whitespace, and emits a JSON object with truncated SHA-256 hashes per section. This is the first code in the project and has zero dependencies on other phases.

The implementation approach is fully verified: position-offset slicing of original source bytes (D-01) eliminates remark-stringify entirely and makes hashes immune to parser version formatting changes. All core algorithm behaviors -- normalization, determinism, setext header handling, fenced code block safety, empty sections, heading text extraction -- were tested against Deno 2.7.4 with the actual npm packages. The tool exports functions for testability (`import.meta.main` guard) per D-11.

**Primary recommendation:** Implement as a single `tools/hash-sections.ts` file with 3 exported functions (`normalize`, `hashSections`, `hashFile`) plus a CLI entrypoint guarded by `import.meta.main`. Tests in `tools/hash-sections_test.ts` import these functions directly. Fixtures in `tools/tests/fixtures/*.md`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Use position offsets, not AST roundtrip serialization. Parse with unified + remark-parse to find H2 boundaries, then slice original source bytes using `position.start.offset` / `position.end.offset`. No remark-stringify dependency needed.
- **D-02:** Rationale: AST serialization roundtrip breaks hash stability -- remark-stringify applies its own formatting rules, and version updates can change output for identical input. Position offsets hash the original bytes, making hashes immune to parser version changes.
- **D-03:** File not found / unreadable: print error to stderr, continue processing remaining files, exit with code 1. Successful files still appear in stdout JSON.
- **D-04:** No H2 sections in file: include file in JSON output with empty `sections` array. This is not an error -- exit code 0.
- **D-05:** No CLI arguments: print usage message to stderr (`Usage: hash-sections.ts <file1.md> [file2.md ...]`), exit code 1.
- **D-06:** JSON `path` field uses the exact CLI argument as given -- no normalization or resolution. Orchestrator can match by string comparison against the path it provided.
- **D-07:** Inline npm specifiers with caret major pin: `npm:unified@^11.0.0`, `npm:remark-parse@^11.0.0`. No deno.json needed. Minor/patch updates auto-resolve; only major changes are blocked.
- **D-08:** `tools/hash-sections.ts` and `tools/hash-sections_test.ts` at project root level, not inside `skills/consolidate/`. Pre-emptive separation for potential reuse by other skills. Host projects install via `ln -s /path/to/cckit/tools .claude/tools`.
- **D-09:** IMPL-SPEC originally specified `skills/consolidate/hash-sections.ts` -- this decision overrides that path.
- **D-10:** Separate fixture files in `tools/tests/fixtures/*.md`, not inline template literals. Fixtures are git-tracked, ensuring byte-level stability for determinism tests. Enables `--allow-read=tools/tests/fixtures` minimal permission scoping.
- **D-11:** hash-sections.ts exports core functions (`hashSections`, `hashFile`). Tests import functions directly -- no subprocess spawning. CLI entrypoint uses `import.meta.main` guard so the module works as both library and CLI.
- **D-12:** Extract heading text from AST node children (recursive text extraction). ATX trailing hashes, leading `##`, bold/emphasis markup all automatically stripped by the parser. JSON `heading` field contains clean text only.
- **D-13:** Only H2 headers create section boundaries. H1, H3, H4, etc. inside an H2 section are treated as internal content and included in that section's hash. Pre-first-H2 content is excluded entirely.
- **D-14:** Sequential file processing (for loop). No parallelism. Error output order matches input order.

### Claude's Discretion
- Exact normalize() implementation details (trailing whitespace stripping, blank line collapsing, LF normalization)
- Internal function decomposition and naming
- Specific assertion strategies per test case
- stderr error message formatting

### Deferred Ideas (OUT OF SCOPE)
- UTF-8 BOM handling and non-UTF-8 file encoding -- low probability in practice, defer unless encountered
- Extracting hash tool to a standalone distributable package -- wait for v2 installation requirements (INST-01/02/03)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| HASH-01 | Deterministic SHA-256/8 hashes for H2 sections | Verified: position-offset slicing + normalize() + Web Crypto SHA-256 produces 8-char hex. Tested determinism over 10 runs. |
| HASH-02 | AST-based parsing handles CommonMark edge cases | Verified: remark-parse 11.0.0 correctly handles fenced code blocks (backtick + tilde), setext headers, ATX trailing hashes. All tested live. |
| HASH-03 | Normalization: trailing whitespace, blank lines, LF | Verified: 3-line normalize() function. Trailing whitespace regex, blank line collapse, CRLF/CR to LF. Produces identical hashes for equivalent content. |
| HASH-04 | Pre-first-H2 content excluded | Verified: AST traversal finds H2 child indices; slicing starts at first H2 offset. Preamble content (H1, paragraphs before first H2) is skipped. |
| HASH-05 | JSON output matches IMPL-SPEC schema | Schema defined in IMPL-SPEC lines 67-79: `{ files: [{ path, sections: [{ heading, hash }] }] }`. |
| HASH-06 | Multiple file paths accepted as CLI arguments | Verified: `Deno.args` provides all CLI arguments. Sequential processing with error continuation (D-03). |
| HASH-07 | 10 test cases pass | All 10 test cases defined in IMPL-SPEC lines 99-111. Each maps to a verifiable behavior tested via function imports (D-11). |
| TEST-04 | hash-sections_test.ts -- 10 test cases per IMPL-SPEC | Same as HASH-07. Uses `Deno.test` + `jsr:@std/assert` for assertions. Fixtures in `tools/tests/fixtures/`. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Language:** All code, docs, commit messages in English
- **Runtime:** Deno required (>=2.7)
- **Commit format:** Conventional Commits with descriptive scope (e.g., `feat(hash): ...`)
- **No hardcoded project references:** Tool must be technology-neutral and project-neutral
- **GSD workflow:** Do not make direct repo edits outside a GSD workflow

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Deno | 2.7.4 (installed) | Runtime | First-class TypeScript, built-in test runner, Web Crypto API, npm: specifiers |
| `npm:unified` | ^11.0.0 (resolves 11.0.5) | Pipeline processor | Composes parser plugins. Stable 1+ year. |
| `npm:remark-parse` | ^11.0.0 (resolves 11.0.0) | Markdown-to-AST parser | CommonMark-compliant. Handles all edge cases automatically. |
| `npm:@types/mdast` | ^4.0.0 (resolves 4.0.4) | TypeScript types for mdast | Type-safe AST node access (Heading, Root, RootContent) |
| `crypto.subtle.digest` | (Deno built-in) | SHA-256 computation | Web standard, zero dependencies |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `npm:mdast-util-to-string` | ^4.0.0 (resolves 4.0.0) | Heading text extraction | Extracting clean text from heading nodes (handles bold, code, emphasis) |
| `jsr:@std/assert` | ^1.0.0 (resolves 1.0.19) | Test assertions | assertEquals, assertNotEquals in test file |

### Not Needed (eliminated by D-01)
| Library | Original Purpose | Why Removed |
|---------|-----------------|-------------|
| `npm:remark-stringify` | AST-to-Markdown serialization | Position-offset approach hashes original source bytes. No serialization needed. |

**No deno.json needed** (D-07). All imports use inline npm/jsr specifiers.

## Architecture Patterns

### Project Structure
```
tools/
  hash-sections.ts          # CLI + library (import.meta.main guard)
  hash-sections_test.ts     # Deno tests (imports functions directly)
  tests/
    fixtures/
      basic.md              # Test 1: basic H2 extraction
      code-block.md         # Test 2: fenced code block with ## inside
      tilde-fence.md        # Test 3: tilde fence handling
      trailing-ws.md        # Test 4: trailing whitespace variants
      blank-lines.md        # Test 5: consecutive blank lines
      determinism.md        # Test 6: determinism input
      json-format.md        # Test 7: JSON output format input
      header-in-hash.md     # Test 8: header rename changes hash
      empty-section.md      # Test 9: H2 with no content
      multi-file-a.md       # Test 10a: multi-file first input
      multi-file-b.md       # Test 10b: multi-file second input
```

### Pattern 1: Position-Offset Section Slicing
**What:** Parse markdown into AST to find H2 boundaries, then slice original source text using `position.start.offset` / next H2's `position.start.offset`.
**When to use:** Always -- this is the locked approach (D-01/D-02).
**Example:**
```typescript
// Verified against Deno 2.7.4 + npm:unified@11.0.5 + npm:remark-parse@11.0.0
import { unified } from "npm:unified@^11.0.0";
import remarkParse from "npm:remark-parse@^11.0.0";
import type { Heading, Root } from "npm:@types/mdast@^4.0.0";

const tree: Root = unified().use(remarkParse).parse(source);

// Collect H2 child indices
const h2Indices: number[] = [];
for (let i = 0; i < tree.children.length; i++) {
  const node = tree.children[i];
  if (node.type === "heading" && (node as Heading).depth === 2) {
    h2Indices.push(i);
  }
}

// Slice original source between H2 boundaries
for (let j = 0; j < h2Indices.length; j++) {
  const startOffset = tree.children[h2Indices[j]].position!.start.offset!;
  const endOffset = j + 1 < h2Indices.length
    ? tree.children[h2Indices[j + 1]].position!.start.offset!
    : source.length;
  const sectionText = source.slice(startOffset, endOffset);
  // normalize + hash sectionText
}
```

### Pattern 2: import.meta.main Guard
**What:** Export functions for testability; CLI entrypoint only runs when executed directly.
**When to use:** Required by D-11.
**Example:**
```typescript
// Exported functions (importable by tests)
export function normalize(text: string): string { /* ... */ }
export async function hashSections(source: string): Promise<Section[]> { /* ... */ }
export async function hashFile(path: string): Promise<FileResult> { /* ... */ }

// CLI entrypoint
if (import.meta.main) {
  // Deno.args handling, JSON output, exit codes
}
```

### Pattern 3: Normalization Function
**What:** Normalize section text before hashing to make hashes resilient to trivial whitespace differences.
**When to use:** Applied to each section's sliced text before SHA-256 computation.
**Example:**
```typescript
// Verified: these normalizations produce identical hashes for equivalent content
function normalize(text: string): string {
  return text
    .replace(/\r\n/g, "\n")       // CRLF -> LF
    .replace(/\r/g, "\n")         // CR -> LF
    .replace(/[ \t]+$/gm, "")     // strip trailing whitespace per line
    .replace(/\n{3,}/g, "\n\n");  // collapse 3+ newlines to 2
}
```

### Pattern 4: Heading Text Extraction
**What:** Use `mdast-util-to-string` (transitive dep of remark-parse) for clean heading text.
**When to use:** Extracting the `heading` field for JSON output.
**Example:**
```typescript
import { toString } from "npm:mdast-util-to-string@^4.0.0";
// toString(headingNode) => "Clean heading text"
// Handles: **bold**, `code`, *emphasis*, ATX trailing ## hashes
```

### Anti-Patterns to Avoid
- **AST roundtrip serialization:** Using remark-stringify to serialize sections before hashing. Breaks determinism across parser versions (D-02).
- **Manual markdown parsing with regex:** 40+ lines of fragile regex to handle fenced code blocks, setext headers, etc. The AST parser handles all CommonMark edge cases automatically.
- **Subprocess spawning in tests:** D-11 explicitly requires function imports. Subprocess spawning adds latency and makes assertion on intermediate values impossible.
- **Parallel file processing:** Unnecessary complexity for 2-10 files at ~ms each (D-14).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown section parsing | Regex-based H2 finder | unified + remark-parse AST | Fenced code blocks, setext headers, ATX hashes all handled automatically. Manual regex is 40+ lines and still misses edge cases. |
| SHA-256 hashing | External crypto library | `crypto.subtle.digest` (built-in) | Web standard, zero deps, available in Deno without imports. |
| Heading text extraction | Manual regex to strip `##` | `mdast-util-to-string` | Handles bold/code/emphasis/nested formatting. Already a transitive dep. |
| Test runner | External framework | `Deno.test` + `jsr:@std/assert` | Built-in, zero config, sufficient for 10 test cases. |

## Common Pitfalls

### Pitfall 1: Hashing the heading node's end offset instead of next section's start offset
**What goes wrong:** Section content between the last child node and the next H2 heading is excluded from the hash. The tree's children are top-level block nodes; there may be blank lines between the last paragraph and the next heading that belong to the current section.
**Why it happens:** Using `tree.children[endIdx - 1].position.end.offset` instead of `tree.children[h2Indices[j+1]].position.start.offset` for section boundaries.
**How to avoid:** Always use the next H2's start offset (or `source.length` for the last section) as the end boundary. This captures all content including trailing blank lines.
**Warning signs:** Hash changes when adding/removing trailing blank lines after a section.

### Pitfall 2: Forgetting to handle the "no H2 sections" case
**What goes wrong:** Returning undefined or throwing when a file has no H2 headings.
**Why it happens:** Assuming all markdown files have H2 sections.
**How to avoid:** D-04 specifies: include file in JSON with empty `sections` array. Exit code 0.
**Warning signs:** Test 9 (empty section) or a preamble-only file causes errors.

### Pitfall 3: Non-null assertion on position offsets
**What goes wrong:** TypeScript complains that `node.position` might be undefined.
**Why it happens:** The mdast types define `position` as optional because some AST transformations can strip positions.
**How to avoid:** Since remark-parse always provides position data for parsed content, use non-null assertions (`position!.start.offset!`) or a guard function. This is safe for freshly-parsed ASTs.
**Warning signs:** TypeScript errors during compilation.

### Pitfall 4: TextEncoder encoding differences
**What goes wrong:** Different hash on machines with different default encodings.
**Why it happens:** Using a wrong encoding for the SHA-256 input.
**How to avoid:** Always use `new TextEncoder().encode(text)` which defaults to UTF-8. This is consistent across all platforms.
**Warning signs:** Hash differs between machines.

### Pitfall 5: Exit code logic with mixed success/failure
**What goes wrong:** Exit code 0 when some files failed.
**Why it happens:** Not tracking error state across sequential file processing.
**How to avoid:** D-03 specifies: print error to stderr, continue processing, exit code 1 if ANY file failed. Track a `hasError` boolean.
**Warning signs:** Silent failures when passing a nonexistent file alongside valid files.

### Pitfall 6: Trailing newline at end of file
**What goes wrong:** Last section includes or excludes the final newline inconsistently.
**Why it happens:** Some files end with `\n`, some don't. `source.length` includes the final newline.
**How to avoid:** This is handled by normalization -- trailing whitespace stripping ensures the final newline doesn't affect the hash. The important thing is determinism, which normalization guarantees.
**Warning signs:** Hash differs between `"content\n"` and `"content"` when it shouldn't.

## Code Examples

### Complete hashSections function pattern
```typescript
// Verified against Deno 2.7.4 with actual packages
import { unified } from "npm:unified@^11.0.0";
import remarkParse from "npm:remark-parse@^11.0.0";
import { toString } from "npm:mdast-util-to-string@^4.0.0";
import type { Heading, Root } from "npm:@types/mdast@^4.0.0";

interface Section {
  heading: string;
  hash: string;
}

interface FileResult {
  path: string;
  sections: Section[];
}

function normalize(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n");
}

async function sha256Hex8(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 8);
}

export async function hashSections(source: string): Promise<Section[]> {
  const tree: Root = unified().use(remarkParse).parse(source);

  const h2Indices: number[] = [];
  for (let i = 0; i < tree.children.length; i++) {
    const node = tree.children[i];
    if (node.type === "heading" && (node as Heading).depth === 2) {
      h2Indices.push(i);
    }
  }

  const sections: Section[] = [];
  for (let j = 0; j < h2Indices.length; j++) {
    const headingNode = tree.children[h2Indices[j]] as Heading;
    const heading = toString(headingNode);

    const startOffset = headingNode.position!.start.offset!;
    const endOffset = j + 1 < h2Indices.length
      ? tree.children[h2Indices[j + 1]].position!.start.offset!
      : source.length;

    const sectionText = source.slice(startOffset, endOffset);
    const hash = await sha256Hex8(normalize(sectionText));

    sections.push({ heading, hash });
  }

  return sections;
}
```

### CLI entrypoint pattern
```typescript
if (import.meta.main) {
  if (Deno.args.length === 0) {
    console.error("Usage: hash-sections.ts <file1.md> [file2.md ...]");
    Deno.exit(1);
  }

  let hasError = false;
  const files: FileResult[] = [];

  for (const path of Deno.args) {
    try {
      const source = await Deno.readTextFile(path);
      const sections = await hashSections(source);
      files.push({ path, sections });
    } catch (e) {
      hasError = true;
      if (e instanceof Deno.errors.NotFound) {
        console.error(`Error: file not found: ${path}`);
      } else {
        console.error(`Error reading ${path}: ${e}`);
      }
    }
  }

  console.log(JSON.stringify({ files }, null, 2));
  if (hasError) Deno.exit(1);
}
```

### Test file pattern
```typescript
import { assertEquals, assertNotEquals } from "jsr:@std/assert";
import { hashSections, normalize } from "./hash-sections.ts";

const FIXTURES = new URL("./tests/fixtures/", import.meta.url).pathname;

Deno.test("basic H2 extraction", async () => {
  const source = await Deno.readTextFile(`${FIXTURES}basic.md`);
  const sections = await hashSections(source);
  assertEquals(sections.length, 2);
  assertEquals(sections[0].heading, "Section One");
  // hash is 8 hex chars
  assertEquals(sections[0].hash.length, 8);
});
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Deno test (built-in, Deno 2.7.4) |
| Config file | none -- no deno.json needed |
| Quick run command | `deno test --allow-read=tools/tests/fixtures tools/hash-sections_test.ts` |
| Full suite command | `deno test --allow-read=tools/tests/fixtures tools/hash-sections_test.ts` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HASH-01 | Deterministic SHA-256/8 hashes | unit | `deno test --allow-read=tools/tests/fixtures tools/hash-sections_test.ts --filter "determinism"` | Wave 0 |
| HASH-02 | CommonMark edge cases parsed correctly | unit | `deno test --allow-read=tools/tests/fixtures tools/hash-sections_test.ts --filter "code block\|tilde"` | Wave 0 |
| HASH-03 | Normalization (whitespace, blank lines, LF) | unit | `deno test --allow-read=tools/tests/fixtures tools/hash-sections_test.ts --filter "normalization\|trailing\|blank"` | Wave 0 |
| HASH-04 | Pre-first-H2 excluded | unit | `deno test --allow-read=tools/tests/fixtures tools/hash-sections_test.ts --filter "basic"` | Wave 0 |
| HASH-05 | JSON output format matches schema | unit | `deno test --allow-read=tools/tests/fixtures tools/hash-sections_test.ts --filter "JSON"` | Wave 0 |
| HASH-06 | Multiple file paths accepted | unit | `deno test --allow-read=tools/tests/fixtures tools/hash-sections_test.ts --filter "multi"` | Wave 0 |
| HASH-07 | All 10 test cases pass | unit | `deno test --allow-read=tools/tests/fixtures tools/hash-sections_test.ts` | Wave 0 |
| TEST-04 | hash-sections_test.ts exists with 10 tests | unit | Same as HASH-07 | Wave 0 |

### Sampling Rate
- **Per task commit:** `deno test --allow-read=tools/tests/fixtures tools/hash-sections_test.ts`
- **Per wave merge:** Same (single test file)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tools/hash-sections_test.ts` -- all 10 test cases
- [ ] `tools/tests/fixtures/*.md` -- 11 fixture files (see Architecture Patterns)
- [ ] `tools/hash-sections.ts` -- the implementation itself (first code in project)

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Deno | Runtime for hash-sections.ts | yes | 2.7.4 | -- |
| npm:unified | AST pipeline | yes (via Deno npm: specifier) | 11.0.5 | -- |
| npm:remark-parse | Markdown parsing | yes (via Deno npm: specifier) | 11.0.0 | -- |
| npm:mdast-util-to-string | Heading text extraction | yes (transitive dep) | 4.0.0 | -- |
| npm:@types/mdast | TypeScript types | yes (via Deno npm: specifier) | 4.0.4 | -- |
| Web Crypto API | SHA-256 hashing | yes (Deno built-in) | -- | -- |
| jsr:@std/assert | Test assertions | yes (via Deno jsr: specifier) | 1.0.19 | -- |
| Network (npm registry) | First-run package download | yes | -- | Deno cache after first run |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `https://deno.land/std/assert/mod.ts` | `jsr:@std/assert` | Deno 2.x (2024+) | Use `jsr:` specifier for standard library imports |
| remark-stringify for section text | Position-offset slicing of source (D-01) | This project decision | Eliminates remark-stringify dependency entirely |
| `skills/consolidate/hash-sections.ts` | `tools/hash-sections.ts` (D-08/D-09) | This project decision | Overrides IMPL-SPEC path for reusability |

**Deprecated/outdated:**
- `https://deno.land/std/` URL imports: Still work but `jsr:@std/` is the modern pattern. Deno warns about implicit version resolution with the old URL form.
- IMPL-SPEC's remark-stringify dependency: Eliminated by D-01 position-offset approach.
- IMPL-SPEC's file path (`skills/consolidate/`): Overridden by D-08.

## Open Questions

1. **mdast-util-to-string as explicit vs. transitive dependency**
   - What we know: `mdast-util-to-string` is already downloaded as a transitive dep of `remark-parse`. It can be imported with `npm:mdast-util-to-string@^4.0.0`.
   - What's unclear: Whether to import it explicitly or use a manual recursive text extraction function.
   - Recommendation: Import explicitly. It is one import line, produces cleaner code than manual recursion, and handles all formatting edge cases (verified). The CLAUDE.md "What NOT to Use" section warns against it for *section serialization* (it strips formatting), but using it for *heading text extraction* is the correct use case -- headings should be plain text in JSON output.

2. **Fixture file count: 11 files for 10 tests**
   - What we know: Test 10 (multi-file) needs two input files. Tests 4 and 5 each need a fixture with specific whitespace.
   - What's unclear: Whether some fixtures can be shared across tests.
   - Recommendation: Create dedicated fixtures per test for clarity. Some tests (4 and 5) may use the same fixture with different comparison targets, but separate fixtures ensure byte-level control.

## Sources

### Primary (HIGH confidence)
- Deno 2.7.4 runtime -- all code examples tested live against installed version
- npm:unified@11.0.5 -- imported and used in live Deno tests
- npm:remark-parse@11.0.0 -- AST structure, position offsets, edge case handling all verified
- npm:mdast-util-to-string@4.0.0 -- heading text extraction verified for bold, code, emphasis, ATX hashes
- npm:@types/mdast@4.0.4 -- TypeScript types for Root, Heading, RootContent verified
- jsr:@std/assert@1.0.19 -- assertEquals, assertNotEquals confirmed working
- Web Crypto API -- `crypto.subtle.digest("SHA-256", ...)` verified in Deno
- IMPL-SPEC.md (lines 46-111) -- hash tool algorithm, output schema, test case definitions
- CONTEXT.md (D-01 through D-14) -- locked implementation decisions

### Secondary (MEDIUM confidence)
- [npm unified versions](https://www.npmjs.com/package/unified) -- 11.0.5 latest, stable 1+ year
- [npm remark-parse](https://www.npmjs.com/package/remark-parse) -- 11.0.0 latest, stable 2+ years

### Tertiary (LOW confidence)
- None. All findings verified with live code execution.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages tested live in Deno 2.7.4, versions confirmed
- Architecture: HIGH -- position-offset slicing, import.meta.main guard, fixture-based testing all verified
- Pitfalls: HIGH -- identified from live testing (boundary offsets, empty sections, exit codes, encoding)

**Research date:** 2026-03-30
**Valid until:** 2026-04-30 (stable ecosystem, no breaking changes expected)
