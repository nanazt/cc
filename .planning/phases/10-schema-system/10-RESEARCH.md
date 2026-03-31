# Phase 10: Schema System - Research

**Researched:** 2026-03-31
**Domain:** Markdown AST parsing, Deno CLI tools, schema validation
**Confidence:** HIGH

## Summary

Phase 10 builds two Deno CLI tools (`schema-parser.ts` and `schema-bootstrap.ts`), updates `docs/MODEL.md` to add section override syntax, and updates 3 existing schema examples. All decisions are locked in CONTEXT.md (D-01 through D-21). The technology stack is identical to the existing `hash-sections.ts` tool with one critical addition: `remark-gfm` is required to parse GFM tables into proper AST nodes.

The existing `hash-sections.ts` provides the exact Deno tool pattern: unified + remark-parse for AST parsing, CLI interface (path arg, JSON to stdout, errors to stderr), `import.meta.main` guard for CLI entrypoint, and `jsr:@std/assert` for tests. The schema parser extends this pattern with GFM table extraction and structural validation. The bootstrap tool is simpler -- it generates a fixed markdown string and writes it to disk.

**Primary recommendation:** Use `remark-gfm` for table parsing (verified: without it, tables render as paragraph text nodes, not structured `Table`/`TableRow`/`TableCell` nodes). Both tools should export their core logic as testable functions and use `import.meta.main` for CLI entrypoint, matching `hash-sections.ts` exactly.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Named section blocks -- `## Sections: {type-name}` blocks alongside `## Sections: default`. Components table gains a `Type` column to map components to their section block.
- D-02: Override completely replaces the default -- both mandatory and conditional sections. If an override block omits `### Conditional Sections`, that type has no conditional sections.
- D-03: Type names must be kebab-case (lowercase ASCII + hyphens). Enforced by parser validation.
- D-04: Components with an empty Type column use `## Sections: default`.
- D-05: `## Sections: default` is always explicit in the schema file. Parser has a defensive fallback to built-in 7+2 (MODEL.md parsing rule 5) but intended usage requires the block to be present.
- D-06: Bootstrap tool is a separate Deno script: `tools/schema-bootstrap.ts`.
- D-07: Generated starter schema: minimal skeleton with Meta defaults (version=1, rule-prefix=CR, e2e-flows=false), empty Components table (with Type column, no example rows), full `## Sections: default` (7+2), and a comment referencing `docs/examples/` for guidance.
- D-08: CLI: `deno run --allow-write --allow-read tools/schema-bootstrap.ts <output-path>`. Refuses to overwrite existing files (exit 1). No `--force` flag.
- D-09: On decline during `/consolidate` flow: abort consolidation with message explaining the schema is required and how to create one manually.
- D-10: Previous decision (bootstrapping in orchestrator) revised -- moved to separate Deno tool for consistency with hash-sections.ts pattern and to enable independent testing.
- D-11: Deno parser tool: `tools/schema-parser.ts`. AST-based parsing using unified + remark-parse, same stack as hash-sections.ts.
- D-12: CLI: `deno run --allow-read tools/schema-parser.ts <schema-path>`. JSON to stdout, errors to stderr + exit 1. Follows hash-sections.ts pattern.
- D-13: JSON output: top-level keys `meta`, `components`, `sections`. Detailed JSON schema defined at implementation time, not here.
- D-14: Strict validation with clear errors: line numbers, what's wrong, how to fix. Errors array in JSON output when validation fails.
- D-15: Core validations confirmed: (1) Required sections exist; (2) Type reference consistency; (3) Type name kebab-case enforcement; (4) Additional validations added at implementation time.
- D-16: Tests required (Deno test), test cases and scope defined by planner.
- D-17: Update existing 3 examples (not add new ones). Add Type column to Components table in all 3.
- D-18: Microservice example demonstrates section override (at least one component with a custom type and `## Sections: {type}` block). CLI and library examples use default only.
- D-19: Examples serve as test fixtures for schema-parser_test.ts -- parser tests read `docs/examples/` directly.
- D-20: Phase 10 updates MODEL.md to add: section override format, Type column in Components table, override parsing rules, type name constraints.
- D-21: Remove "Per-component section overrides are deferred" language. Replace with the override mechanism specification.

### Claude's Discretion
- Internal JSON schema structure (field names, nesting) for parser output
- Test case selection and count for both tools
- Exact error message wording
- Internal code organization within each tool file
- Whether to share utilities between parser and bootstrap (or keep fully independent)

### Deferred Ideas (OUT OF SCOPE)
- Per-component section overrides (individual component, not type-based)
- Schema synchronization details (deletion, rename detection) -- Phase 11
- IMPL-SPEC.md rewrite -- Phase 11
- SKILL.md orchestrator integration -- Phase 11
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SCHEMA-01 | Plugin bootstraps a starter schema when no schema file exists on first `/consolidate` run | Bootstrap tool pattern verified: `Deno.writeTextFile` with `createNew: true` for atomic no-overwrite; Deno file existence check via `Deno.stat` + `NotFound` error. D-06 through D-10 specify behavior. |
| SCHEMA-02 | User can override sections for specific unit types within the schema | AST parsing verified: `## Sections: {type-name}` headings extractable via regex on heading text. D-01 through D-05 specify syntax. remark-gfm required for table parsing. |
| SCHEMA-03 | Conditional sections use behavioral conditions (not type checks) | Condition text extractable from unordered list items: `strong` node gives name, text after `-- Include when:` gives behavioral condition. Existing MODEL.md already uses behavioral conditions. |
| SCHEMA-04 | Schema examples ship as reference material for common project types | 3 existing examples at `docs/examples/schema-*.md` need Type column added (D-17). Microservice example needs section override block (D-18). Examples double as test fixtures (D-19). |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Deno | >=2.7 (installed: 2.7.4) | Runtime | First-class TypeScript, built-in test runner, permission sandbox. Already used for hash-sections.ts. |
| `npm:unified` | 11.0.5 | Pipeline processor | Already in project for hash-sections.ts. Composes parser plugins. |
| `npm:remark-parse` | 11.0.0 | Markdown-to-AST parser | Already in project. CommonMark parsing. |
| `npm:remark-gfm` | 4.0.1 | GFM extension (tables) | **NEW dependency.** Required -- without it, markdown tables parse as paragraph text nodes, not structured `Table`/`TableRow`/`TableCell` AST nodes. Verified experimentally. |
| `npm:mdast-util-to-string` | 4.0.0 | Extract text from AST nodes | Already used in hash-sections.ts. Extracts cell/heading text cleanly. |
| `npm:@types/mdast` | 4.0.4 | TypeScript types | Already in project. Includes `Table`, `TableRow`, `TableCell` GFM types. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `jsr:@std/assert` | (Deno built-in) | Test assertions | Tests for both tools. Already used in hash-sections_test.ts. |

### What NOT to Use
| Instead of | Why Not |
|------------|---------|
| `remark-stringify` | Not needed for parsing. Only needed for hash-sections.ts serialization. |
| `gray-matter` / YAML parsers | Schema has no YAML frontmatter. Meta is a markdown table. |
| Custom regex table parser | remark-gfm gives typed AST nodes with position info for error reporting. |
| `micromark-extension-gfm-table` alone | Lower-level; remark-gfm bundles it with proper unified integration. |

**New dependency note:** `remark-gfm@4.0.1` is the only new npm dependency. It depends on `mdast-util-gfm@3.1.0` and `micromark-extension-gfm@3.0.0`. These are downloaded on first run and cached by Deno's global cache. No `deno.json` or import map changes needed -- `npm:` specifiers handle it.

## Architecture Patterns

### Recommended Project Structure
```
tools/
  schema-parser.ts          # Parser tool (reads schema, outputs JSON)
  schema-parser_test.ts     # Parser tests (uses examples as fixtures)
  schema-bootstrap.ts       # Bootstrap tool (generates starter schema)
  schema-bootstrap_test.ts  # Bootstrap tests
  hash-sections.ts          # Existing (reference pattern)
  hash-sections_test.ts     # Existing (reference pattern)
  tests/fixtures/           # Existing hash-sections fixtures
docs/
  MODEL.md                  # Updated with section override syntax
  examples/
    schema-microservice.md  # Updated: Type column + section override
    schema-cli.md           # Updated: Type column
    schema-library.md       # Updated: Type column
```

### Pattern 1: Deno CLI Tool (from hash-sections.ts)
**What:** Export core logic as testable functions. CLI entrypoint behind `import.meta.main` guard. JSON to stdout, errors to stderr, exit codes for success/failure.
**When to use:** Both schema-parser.ts and schema-bootstrap.ts.
**Example:**
```typescript
// Core function: exported, testable
export function parseSchema(source: string): ParseResult {
  // ... AST parsing logic
}

// CLI entrypoint
if (import.meta.main) {
  if (Deno.args.length === 0) {
    console.error("Usage: schema-parser.ts <schema-path>");
    Deno.exit(1);
  }
  try {
    const source = await Deno.readTextFile(Deno.args[0]);
    const result = parseSchema(source);
    if (result.errors.length > 0) {
      console.error(JSON.stringify({ errors: result.errors }, null, 2));
      Deno.exit(1);
    }
    console.log(JSON.stringify(result.data, null, 2));
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      console.error(`Error: file not found: ${Deno.args[0]}`);
    } else {
      console.error(`Error: ${e}`);
    }
    Deno.exit(1);
  }
}
```

### Pattern 2: AST-Based Table Extraction
**What:** Use remark-gfm to parse GFM tables, then walk `Table > TableRow > TableCell` nodes to extract structured data. First row is always the header row.
**When to use:** Parsing `## Meta` and `## Components` tables.
**Example:**
```typescript
import { unified } from "npm:unified@^11.0.0";
import remarkParse from "npm:remark-parse@^11.0.0";
import remarkGfm from "npm:remark-gfm@^4.0.0";
import { toString } from "npm:mdast-util-to-string@^4.0.0";
import type { Table, TableRow, Heading, Root } from "npm:@types/mdast@^4.0.0";

function parseTree(source: string): Root {
  return unified().use(remarkParse).use(remarkGfm).parse(source);
}

function extractTableData(table: Table): { headers: string[]; rows: string[][] } {
  const headers = table.children[0].children.map(cell => toString(cell).trim());
  const rows = table.children.slice(1).map(row =>
    row.children.map(cell => toString(cell).trim())
  );
  return { headers, rows };
}
```

### Pattern 3: Section Block Extraction
**What:** Match `## Sections: {type-name}` headings via regex. Collect H3 children (`### Context Sections`, `### Conditional Sections`) and their list items until the next H2.
**When to use:** Parsing section override blocks.
**Example:**
```typescript
const sectionMatch = headingText.match(/^Sections:\s*(.+)$/i);
if (sectionMatch) {
  const typeName = sectionMatch[1].trim();
  // Collect children until next H2...
}
```

### Pattern 4: Validation Error with Line Number
**What:** Errors include line number, what went wrong, and how to fix.
**When to use:** All validation failures in schema-parser.ts.
**Example:**
```typescript
interface ValidationError {
  line: number;
  message: string;
  fix: string;
}

// Usage:
errors.push({
  line: node.position!.start.line,
  message: `Type "CLI" in Components table is not kebab-case`,
  fix: `Rename to "cli" (lowercase ASCII and hyphens only)`,
});
```

### Pattern 5: Atomic No-Overwrite (Bootstrap)
**What:** Use `Deno.writeTextFile(path, content, { createNew: true })` to atomically refuse to overwrite.
**When to use:** schema-bootstrap.ts file creation.
**Example:**
```typescript
try {
  await Deno.writeTextFile(outputPath, schemaContent, { createNew: true });
  console.log(`Created: ${outputPath}`);
} catch (e) {
  if (e instanceof Deno.errors.AlreadyExists) {
    console.error(`Error: ${outputPath} already exists. Will not overwrite.`);
    Deno.exit(1);
  }
  throw e;
}
```

### Anti-Patterns to Avoid
- **Regex table parsing:** Do not parse markdown tables with regex. GFM tables have edge cases (pipes in cell content, alignment markers, empty cells) that remark-gfm handles correctly via AST.
- **Parsing tables without remark-gfm:** Without the GFM plugin, tables appear as flat text in paragraph nodes. This was verified experimentally -- `remark-parse` alone does not parse GFM tables.
- **Shared state between parser and bootstrap:** Keep tools fully independent (separate files, no shared modules). They have different lifecycles and the bootstrap tool does not need AST parsing at all.
- **Modifying schema examples to include test-only content:** Examples double as test fixtures (D-19), but they should remain clean documentation. Test assertions should verify the examples parse correctly, not add artificial test markers.

## Recommended JSON Output Schema

Per D-13: top-level keys `meta`, `components`, `sections`. This is Claude's discretion. Recommended structure:

```typescript
interface SchemaOutput {
  meta: {
    version: number;
    rulePrefix: string;
    e2eFlows: boolean;
  };
  components: Array<{
    name: string;
    description: string;
    type: string; // empty string if no type specified
  }>;
  sections: {
    [typeName: string]: {  // "default", "api-service", etc.
      context: Array<{
        name: string;
        guide: string;
      }>;
      conditional: Array<{
        name: string;
        condition: string;  // text after "Include when:"
      }>;
    };
  };
}
```

**Rationale:**
- `meta` fields use camelCase (standard JSON convention for JS consumers)
- `components` is an array (preserves declaration order, which may matter for INDEX.md generation)
- `sections` is keyed by type name for O(1) lookup during dispatch
- Conditional section `condition` extracts the behavioral condition text after "Include when:" so the consuming agent gets just the condition, not the format prefix

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| GFM table parsing | Regex-based pipe-splitting | `remark-gfm` plugin | Handles empty cells, escaped pipes, alignment, cell whitespace. Provides position info for error messages. |
| Markdown heading extraction | Custom line-by-line parser | `unified` + `remark-parse` + heading traversal | AST gives clean heading text (strips `##` markers, handles bold/emphasis). Position offsets for line numbers. |
| Kebab-case validation | Character-by-character check | Regex: `/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/` | Verified regex covers all edge cases: rejects uppercase, underscores, leading/trailing hyphens, double hyphens, empty strings. |
| Atomic file creation | `stat` + `writeFile` (race condition) | `Deno.writeTextFile(path, content, { createNew: true })` | Single syscall, no TOCTOU race. Throws `Deno.errors.AlreadyExists` on conflict. |
| List item text extraction | Regex on raw markdown | `mdast-util-to-string` on AST nodes | Handles bold, emphasis, inline code in section names. |

## Common Pitfalls

### Pitfall 1: Tables Without remark-gfm
**What goes wrong:** remark-parse (CommonMark) does not parse GFM tables. Tables appear as paragraph text nodes with pipe characters, not structured `Table`/`TableRow`/`TableCell` AST nodes.
**Why it happens:** GFM tables are a GitHub extension, not part of CommonMark spec. remark-parse follows CommonMark only.
**How to avoid:** Add `.use(remarkGfm)` to the unified pipeline. Verified: `unified().use(remarkParse).use(remarkGfm).parse(source)` produces proper table nodes.
**Warning signs:** Table data comes back as a single text string with pipe characters instead of cell arrays.

### Pitfall 2: Missing Table Cells for Empty Type Column
**What goes wrong:** When a table row omits the trailing pipe for an empty last cell (e.g., `| parser | Parsing |` instead of `| parser | Parsing | |`), the AST produces fewer cells than headers.
**Why it happens:** GFM spec allows omitting trailing empty cells.
**How to avoid:** When reading cells, use defensive access: `cells[colIndex] ?? ""` or check `row.children.length` before accessing. Never assume all rows have the same number of cells as the header.
**Warning signs:** `undefined` when accessing the Type column on rows without explicit empty cell.

### Pitfall 3: Case-Insensitive Heading Matching
**What goes wrong:** Users might write `## meta` or `## META` instead of `## Meta`. Parser fails to find required sections.
**Why it happens:** MODEL.md parsing rule 7 requires case-insensitive heading comparison.
**How to avoid:** Always lowercase heading text before comparison: `toString(heading).toLowerCase().trim()`.
**Warning signs:** Parser reports "missing ## Meta section" when the section exists with different casing.

### Pitfall 4: H1 Heading Interference
**What goes wrong:** The schema file starts with `# Consolidation Schema` (H1). Parser must not confuse H1 with H2 sections.
**Why it happens:** Heading depth filtering is easy to forget.
**How to avoid:** Always filter for `heading.depth === 2` (or `=== 3` for sub-sections). The H1 is informational only.
**Warning signs:** "Consolidation Schema" appears as a parsed section name.

### Pitfall 5: Bootstrap Tool Permission Scope
**What goes wrong:** Bootstrap needs `--allow-write` (to create the file) AND `--allow-read` (to check parent directory existence or for future validation). Forgetting `--allow-read` causes permission errors.
**Why it happens:** Deno's permission model is granular. Write doesn't imply read.
**How to avoid:** Document CLI as `deno run --allow-write --allow-read tools/schema-bootstrap.ts <output-path>` (per D-08).
**Warning signs:** `PermissionDenied` errors during bootstrap.

### Pitfall 6: Section Name Extraction from Bold Text
**What goes wrong:** Extracting section name from `**Overview** -- guide text` by splitting on ` -- ` could fail if guide text contains ` -- `.
**Why it happens:** The `--` separator can appear in guide text.
**How to avoid:** Use AST structure: the first child of the list item's paragraph is a `strong` node containing the name. The remaining text nodes contain the guide. No string splitting needed.
**Warning signs:** Section names include part of the guide text, or guide text is truncated.

### Pitfall 7: Confusing `## Sections: default` with Missing Section Block
**What goes wrong:** Parser incorrectly triggers the fallback to built-in 7+2 when `## Sections: default` exists but has unexpected formatting.
**Why it happens:** D-05 specifies a defensive fallback to built-in 7+2 when the block is missing, but the block should be present in normal usage.
**How to avoid:** Match heading text with regex `/^sections:\s*(.+)$/i` after lowercasing. Only trigger fallback when no `## Sections: default` heading is found at all.
**Warning signs:** Parser silently uses built-in sections instead of user-defined ones.

## Code Examples

### Full AST Pipeline for Schema Parsing
```typescript
// Source: Verified experimentally (2026-03-31)
import { unified } from "npm:unified@^11.0.0";
import remarkParse from "npm:remark-parse@^11.0.0";
import remarkGfm from "npm:remark-gfm@^4.0.0";
import { toString } from "npm:mdast-util-to-string@^4.0.0";
import type { Heading, Root, Table, List } from "npm:@types/mdast@^4.0.0";

function parseTree(source: string): Root {
  return unified().use(remarkParse).use(remarkGfm).parse(source);
}

// Extract heading text, case-insensitive comparison
function headingText(node: Heading): string {
  return toString(node).trim();
}

// Check if heading matches a section block pattern
function sectionBlockType(heading: Heading): string | null {
  const text = headingText(heading);
  const match = text.match(/^sections:\s*(.+)$/i);
  return match ? match[1].trim() : null;
}
```

### Table Extraction with Defensive Cell Access
```typescript
// Source: Verified experimentally (2026-03-31)
function extractTable(table: Table): { headers: string[]; rows: Record<string, string>[] } {
  const headerCells = table.children[0].children;
  const headers = headerCells.map(cell => toString(cell).trim());

  const rows = table.children.slice(1).map((row, rowIndex) => {
    const record: Record<string, string> = {};
    for (let i = 0; i < headers.length; i++) {
      // Defensive: row may have fewer cells than headers
      record[headers[i]] = i < row.children.length
        ? toString(row.children[i]).trim()
        : "";
    }
    return record;
  });

  return { headers, rows };
}
```

### Section List Item Parsing (Context + Conditional)
```typescript
// Source: Verified experimentally (2026-03-31)
interface SectionDef {
  name: string;
  guide: string;
}

interface ConditionalSectionDef {
  name: string;
  condition: string;
}

function parseMandatorySection(listItem: any): SectionDef {
  const para = listItem.children[0]; // paragraph node
  const strongNode = para.children.find((c: any) => c.type === "strong");
  const name = strongNode ? toString(strongNode) : "";
  const textNode = para.children.find((c: any) =>
    c.type === "text" && c.value.includes(" -- ")
  );
  const guide = textNode ? textNode.value.replace(/^\s*--\s*/, "") : "";
  return { name, guide };
}

function parseConditionalSection(listItem: any): ConditionalSectionDef {
  const para = listItem.children[0];
  const strongNode = para.children.find((c: any) => c.type === "strong");
  const name = strongNode ? toString(strongNode) : "";
  const textNode = para.children.find((c: any) =>
    c.type === "text" && c.value.includes("Include when:")
  );
  const condition = textNode
    ? textNode.value.replace(/^.*Include when:\s*/, "")
    : "";
  return { name, condition };
}
```

### Bootstrap Template Generation
```typescript
// Source: Decisions D-07, D-08
const STARTER_SCHEMA = `# Consolidation Schema

A component is the smallest independently specifiable unit in your project.

<!-- See docs/examples/ for complete schema examples -->

## Meta

| Key | Value |
|-----|-------|
| version | 1 |
| rule-prefix | CR |
| e2e-flows | false |

## Components

| Component | Description | Type |
|-----------|-------------|------|

## Sections: default

### Context Sections
1. **Overview** -- What this component does and why it exists
2. **Public Interface** -- Operations, commands, endpoints, or API surface this component exposes to consumers
3. **Domain Model** -- Entities, types, and data structures this component owns
4. **Behavior Rules** -- Business rules, constraints, and invariants governing this component's behavior
5. **Error Handling** -- Error categories, failure modes, and recovery strategies
6. **Dependencies** -- What this component requires from other components or external systems
7. **Configuration** -- Environment variables, feature flags, and tunable parameters

### Conditional Sections
- **State Lifecycle** -- Include when: component manages stateful entities with lifecycle transitions
- **Event Contracts** -- Include when: component produces or consumes events/messages
`;
```

### Kebab-Case Validation
```typescript
// Source: Verified experimentally (2026-03-31)
const KEBAB_CASE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

function validateTypeName(name: string, line: number): ValidationError | null {
  if (!KEBAB_CASE.test(name)) {
    return {
      line,
      message: `Type "${name}" is not kebab-case`,
      fix: `Use lowercase ASCII letters, digits, and hyphens (e.g., "${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}")`,
    };
  }
  return null;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Fixed 3 service archetypes | User-defined components via schema | Phase 9 (2026-03-31) | No predefined categories. Schema is the authority. |
| `## Sections` (single block) | `## Sections: {type-name}` (multiple blocks) | Phase 10 (this phase) | Type-based section overrides replace one-size-fits-all. |
| No Type column in Components | Type column maps components to section blocks | Phase 10 (this phase) | Components can opt into custom section structures. |
| "Per-component section overrides deferred" | Override mechanism specified | Phase 10 (this phase) | MODEL.md language updated from deferred to implemented. |

## Open Questions

1. **JSON output error format when validation fails**
   - What we know: D-14 says errors array with line numbers, message, fix suggestion
   - What's unclear: Should the error JSON include partial parse results alongside errors, or only errors?
   - Recommendation: Errors-only on validation failure (cleaner contract). Successful parse returns data-only. The two are mutually exclusive outputs.

2. **Shared utilities between parser and bootstrap**
   - What we know: D-07 specifies the starter schema content. The parser needs to parse this exact format. Both tools need the 7+2 default sections.
   - What's unclear: Whether duplicating the 7+2 defaults in both files is acceptable, or whether a shared constants module is warranted.
   - Recommendation: Keep tools independent (2 files, no shared module). The bootstrap template is a string literal; the parser extracts from AST. They don't share code paths. Duplicating the 7+2 list in both is acceptable -- it's a specification constant, not business logic.

3. **Additional validations beyond D-15 core list**
   - What we know: D-15 lists 3 core validations. D-15.4 says "additional validations added at implementation time."
   - What's unclear: Which additional validations to add.
   - Recommendation: Add these beyond D-15 core: (a) duplicate component names, (b) duplicate section names within a block, (c) empty section names, (d) `## Sections: default` present when any components exist, (e) type names in Sections blocks that no component references (orphaned types -- warning, not error).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Deno | Both tools | Yes | 2.7.4 | -- |
| `npm:unified` | schema-parser | Yes (Deno cache) | 11.0.5 | -- |
| `npm:remark-parse` | schema-parser | Yes (Deno cache) | 11.0.0 | -- |
| `npm:remark-gfm` | schema-parser | Yes (fetched, now cached) | 4.0.1 | -- |
| `npm:mdast-util-to-string` | schema-parser | Yes (Deno cache) | 4.0.0 | -- |
| `npm:@types/mdast` | schema-parser | Yes (Deno cache) | 4.0.4 | -- |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Deno test (built-in) |
| Config file | none (zero-config) |
| Quick run command | `deno test tools/schema-parser_test.ts tools/schema-bootstrap_test.ts --allow-read --allow-write` |
| Full suite command | `deno test tools/ --allow-read --allow-write` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SCHEMA-01 | Bootstrap creates starter schema; refuses overwrite | unit | `deno test tools/schema-bootstrap_test.ts --allow-read --allow-write -x` | Wave 0 |
| SCHEMA-02 | Parser extracts section overrides by type | unit | `deno test tools/schema-parser_test.ts --allow-read -x` | Wave 0 |
| SCHEMA-03 | Conditional sections have behavioral conditions | unit | `deno test tools/schema-parser_test.ts --allow-read -x` | Wave 0 |
| SCHEMA-04 | Examples parse successfully as valid schemas | unit | `deno test tools/schema-parser_test.ts --allow-read -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `deno test tools/schema-parser_test.ts tools/schema-bootstrap_test.ts --allow-read --allow-write`
- **Per wave merge:** `deno test tools/ --allow-read --allow-write`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tools/schema-parser_test.ts` -- covers SCHEMA-02, SCHEMA-03, SCHEMA-04
- [ ] `tools/schema-bootstrap_test.ts` -- covers SCHEMA-01

(Framework install not needed -- Deno test is built-in.)

## Project Constraints (from CLAUDE.md)

- **Language:** All content in English
- **Runtime:** Deno required; npm: specifiers for dependencies
- **Commit conventions:** Conventional Commits 1.0.0, scope is a codebase noun (e.g., `schema-parser`, `schema-bootstrap`, `model`), never phase numbers or requirement IDs
- **GSD reference boundary:** No decision IDs (D-nn), phase numbers, or requirement IDs in code, docs, or commit messages outside `.planning/`
- **Technology neutrality:** Schema examples must not assume a specific project type. Guide text uses abstract terms.
- **No hardcoded project references:** Tools must be project-neutral
- **Testing:** Deno built-in test runner, `jsr:@std/assert` for assertions
- **What NOT to use:** Node.js, Bun, Jest/Vitest/Mocha, gray-matter, esbuild, prettier, Docker

## Sources

### Primary (HIGH confidence)
- Experimental verification (2026-03-31): remark-parse without remark-gfm does NOT parse GFM tables -- tables appear as paragraph text nodes
- Experimental verification (2026-03-31): remark-gfm@4.0.1 produces proper `Table`/`TableRow`/`TableCell` AST nodes with position info
- Experimental verification (2026-03-31): `@types/mdast@4.0.4` includes GFM table types (`Table`, `TableRow`, `TableCell`)
- Experimental verification (2026-03-31): `Deno.writeTextFile` with `{ createNew: true }` throws `Deno.errors.AlreadyExists` -- atomic no-overwrite
- Experimental verification (2026-03-31): Missing trailing pipe in table rows produces fewer cells than headers -- defensive access required
- Experimental verification (2026-03-31): Kebab-case regex `/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/` handles all edge cases correctly
- `tools/hash-sections.ts` -- Reference Deno tool pattern (AST parsing, CLI, JSON output)
- `tools/hash-sections_test.ts` -- Reference test pattern (fixture-based, assertions)
- `docs/MODEL.md` -- Authoritative model specification (parsing rules, schema format)
- npm registry: unified@11.0.5, remark-parse@11.0.0, remark-gfm@4.0.1

### Secondary (MEDIUM confidence)
- None needed. All claims verified experimentally.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- identical to existing hash-sections.ts, plus remark-gfm verified experimentally
- Architecture: HIGH -- tool pattern established by hash-sections.ts, AST extraction verified
- Pitfalls: HIGH -- all pitfalls discovered through experimental verification, not speculation

**Research date:** 2026-03-31
**Valid until:** 2026-04-30 (stable libraries, no version churn expected)
