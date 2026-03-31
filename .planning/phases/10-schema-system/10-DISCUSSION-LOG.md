# Phase 10: Schema System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-31
**Phase:** 10-schema-system
**Areas discussed:** Section override syntax, Bootstrapping experience, Schema parsing approach, Example update strategy, Schema validation/error handling, Phase 10 deliverable scope, Parser/bootstrap CLI interface

---

## Section Override Syntax

| Option | Description | Selected |
|--------|-------------|----------|
| Named section blocks | `## Sections: {type-name}` blocks + Type column in Components table | ✓ |
| Inline per-component | Sections column directly in Components table | |
| Separate override file | Overrides in a separate .md file | |

**User's choice:** Named section blocks
**Notes:** Most natural extension of existing schema format. Type column in Components maps to Sections blocks.

### Follow-up: Override scope

| Option | Description | Selected |
|--------|-------------|----------|
| Default fallback + full replacement | Override replaces both mandatory and conditional sections entirely | ✓ |
| Default fallback + mandatory only | Override replaces mandatory only, conditional inherited from default | |
| Claude decides | | |

**User's choice:** Default fallback + full replacement
**Notes:** Consistent with SC2 ("the override completely replaces the default for that type")

### Follow-up: Type name constraints

| Option | Description | Selected |
|--------|-------------|----------|
| Slug format (kebab-case) | Lowercase ASCII + hyphens only | ✓ |
| Free format | Any characters allowed | |
| Claude decides | | |

**User's choice:** Slug format (kebab-case)

### Follow-up: Missing conditional in override

| Option | Description | Selected |
|--------|-------------|----------|
| Explicit exclusion | No `### Conditional Sections` = no conditionals for that type | ✓ |
| Default conditional inherited | Missing conditional = inherit from default | |
| Claude decides | | |

**User's choice:** Explicit exclusion
**Notes:** Consistent with "full replacement" principle.

### Follow-up: Sections: default required?

| Option | Description | Selected |
|--------|-------------|----------|
| Optional (parser falls back to built-in) | | |
| Always explicit | Every schema must have `## Sections: default` | ✓ |
| Claude decides | | |

**User's choice:** Always explicit
**Notes:** Parser still has defensive fallback (MODEL.md parsing rule 5), but intended usage requires explicit declaration.

---

## Bootstrapping Experience

### Starter schema content

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal skeleton | Meta defaults, empty Components (with Type column), full Sections: default, docs/examples/ reference comment | ✓ |
| Extract from CASES.md | Pre-populate Components from existing CASES.md headings | |
| Project type selection | Ask user to choose project type, copy from docs/examples/ | |

**User's choice:** Minimal skeleton
**Notes:** Most neutral and simple. No example rows in Components table.

### Decline behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Abort + guidance | Stop consolidation, explain schema is required, show manual creation method | ✓ |
| Proceed without schema | Use built-in defaults | |
| Claude decides | | |

**User's choice:** Abort + guidance

### Bootstrap code location

| Option | Description | Selected |
|--------|-------------|----------|
| Orchestrator internal | Bootstrap logic in SKILL.md prompt | |
| Separate Deno tool | `tools/schema-bootstrap.ts` | ✓ |
| Claude decides | | |

**User's choice:** Separate Deno tool
**Notes:** Initially decided as orchestrator internal, then revised for consistency with hash-sections.ts pattern and independent testability.

### Hint rows in empty table

| Option | Description | Selected |
|--------|-------------|----------|
| Empty table + docs reference | Header only, comment pointing to docs/examples/ | ✓ |
| Example rows included | 1-2 commented example rows showing format | |
| Claude decides | | |

**User's choice:** Empty table + docs reference

---

## Schema Parsing Approach

### Parsing method

| Option | Description | Selected |
|--------|-------------|----------|
| Agent direct parsing | Orchestrator agent reads markdown directly | |
| Deno parser tool | schema-parser.ts with AST-based parsing → JSON | ✓ |
| Hybrid | Deno for structure, agent for interpretation | |

**User's choice:** Deno parser tool + bootstrapping also as tool (revised from orchestrator)
**Notes:** User requested detailed comparison of all options. After analysis of pros/cons and consistency with bootstrapping decision, chose to move both parsing and bootstrapping to Deno tools. Explicitly requested two separate files (not combined).

### JSON output format definition timing

| Option | Description | Selected |
|--------|-------------|----------|
| Define at implementation time | Top-level keys (meta, components, sections) confirmed; details at implementation | ✓ |
| Define now in CONTEXT.md | Full JSON schema in CONTEXT.md | |

**User's choice:** Define at implementation time

### Test strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Same pattern as hash-sections | Deno test with fixture-based assertions | |
| Define at implementation time | Test scope and cases by planner | ✓ |
| Claude decides | | |

**User's choice:** Define at implementation time
**Notes:** "Tests required, Deno test" confirmed. Details left to planner.

---

## Example Update Strategy

### Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Update existing 3 | Add Type column + override to existing examples | ✓ |
| Add 4th example | Keep existing, add new override-focused example | |
| Both (4 total) | Update 3 + add 1 new | |

**User's choice:** Update existing 3

### Which example gets override

| Option | Description | Selected |
|--------|-------------|----------|
| Microservice | Most natural — diverse component types | ✓ |
| CLI | Possible but less natural for overrides | |
| Library | Least natural — typically uniform structure | |
| Claude decides | | |

**User's choice:** Microservice

### Examples as test fixtures

| Option | Description | Selected |
|--------|-------------|----------|
| Examples = test fixtures | schema-parser_test.ts reads docs/examples/ directly | ✓ |
| Separate fixtures | Independent test fixtures | |
| Claude decides | | |

**User's choice:** Examples = test fixtures
**Notes:** User confirmed: "examples should be tested too, so this is correct"

### MODEL.md update timing

| Option | Description | Selected |
|--------|-------------|----------|
| Phase 10 | Update MODEL.md with override syntax in this phase | ✓ |
| Phase 11 | Defer to IMPL-SPEC rewrite | |
| Claude decides | | |

**User's choice:** Phase 10
**Notes:** MODEL.md is "single authoritative v2 model source" — schema format changes must be reflected here.

---

## Schema Validation / Error Handling

### Validation strictness

| Option | Description | Selected |
|--------|-------------|----------|
| Strict + clear errors | Errors array, exit code 1, line numbers, fix suggestions | ✓ |
| Lenient + warnings | Parse what's possible, report problems as warnings | |
| Claude decides | | |

**User's choice:** Strict + clear errors

### Validation scope

| Option | Description | Selected |
|--------|-------------|----------|
| Core validations confirmed | Required sections, Type reference consistency, kebab-case. Details at implementation | ✓ |
| Full list now | Define every validation check now | |
| Define at implementation | All checks by planner | |

**User's choice:** Core validations confirmed

---

## Phase 10 Deliverable Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Tools + docs only | parser, bootstrap, tests, MODEL.md, examples. SKILL.md is Phase 11 | ✓ |
| Tools + docs + orchestrator | Above + SKILL.md update with schema call logic | |
| Claude decides | | |

**User's choice:** Tools + docs only
**Notes:** User asked for explanation of "deliverable" concept. After detailed comparison, chose tools-only scope to keep Phase 10 boundary clean.

---

## Parser/Bootstrap CLI Interface

### schema-parser.ts CLI

| Option | Description | Selected |
|--------|-------------|----------|
| hash-sections.ts pattern | `deno run --allow-read schema-parser.ts <path>`. JSON stdout, stderr errors, exit 1 on failure | ✓ |
| Claude decides | | |

**User's choice:** hash-sections.ts pattern
**Notes:** User noted "keep consistent with existing tools"

### schema-bootstrap.ts CLI

| Option | Description | Selected |
|--------|-------------|----------|
| Path arg + refuse overwrite | `deno run --allow-write --allow-read schema-bootstrap.ts <path>`. Exit 1 if exists. No --force | ✓ |
| stdout output | Output to stdout, user redirects to file | |
| Fixed path | Always write to `.planning/consolidation.schema.md` | |
| Claude decides | | |

**User's choice:** Path arg + refuse overwrite
**Notes:** User explicitly requested consistency with existing tools.

---

## Claude's Discretion

- Internal JSON schema structure for parser output
- Test case selection and count
- Exact error message wording
- Code organization within tool files
- Shared utilities between parser and bootstrap (or independent)

## Deferred Ideas

- Per-component section overrides (individual, not type-based)
- Schema synchronization (deletion, rename) — Phase 11
- IMPL-SPEC.md rewrite — Phase 11
- SKILL.md orchestrator integration — Phase 11
