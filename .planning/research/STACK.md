# Technology Stack

**Project:** cckit (Claude Code Toolkit)
**Researched:** 2026-03-30

## Recommended Stack

This is a Claude Code plugin project, not a traditional application. The "stack" has two distinct layers: (1) prompt-engineering artifacts (skills, agents) authored as Markdown with YAML frontmatter, and (2) a single Deno TypeScript tool for deterministic section hashing. There is no server, no framework, no build step.

### Runtime: Deno

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Deno | `>=2.7` (latest stable: 2.7.7) | Runtime for `hash-sections.ts` | First-class TypeScript, built-in test runner, Web Crypto API for SHA-256, `npm:` specifiers eliminate package.json/node_modules. Single-file scripts just work. |

**Confidence:** HIGH (verified via [Deno releases](https://github.com/denoland/deno/releases), March 2026)

**Why not Node/Bun:** The hash tool is a single CLI script. Deno requires zero config for TypeScript execution, has a built-in test framework, and its `npm:` specifiers mean no `package.json`, no `node_modules`, no build step. Node would require `tsconfig.json` + `tsx`/`ts-node` + `package.json`. Bun has similar DX but Deno's security sandbox (`--allow-read` only) is a better fit for a tool that should never write or network.

### Markdown AST: unified + remark-parse

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `npm:unified` | `11.0.5` | Pipeline processor | Composes parser + compiler plugins. Stable, no changes in 1+ year. |
| `npm:remark-parse` | `11.0.0` | Markdown-to-AST parser | CommonMark-compliant. Handles fenced code blocks, setext headers, ATX trailing hashes automatically. Eliminates ~40 lines of fragile regex. |
| `npm:remark-stringify` | `11.0.0` | AST-to-Markdown serializer | Needed for deterministic section serialization before hashing. Normalizes AST back to text. |

**Confidence:** HIGH (versions verified via [npm registry](https://www.npmjs.com/package/unified?activeTab=versions) and [Cloudsmith](https://cloudsmith.com/navigator/npm/unified))

**Why these specific versions:** The IMPL-SPEC pins `unified@11.0.5` and `remark-parse@11.0.0`. These are the current latest on npm (unified 11.0.5 published ~1 year ago; remark-parse 11.0.0 published ~2 years ago). The unified ecosystem releases infrequently -- major versions are stable for years. Pin exact versions in import specifiers to guarantee hash determinism across environments.

**Why not manual regex:** The IMPL-SPEC explicitly rejected manual parsing. Fenced code block state tracking, setext header detection, and tilde fence handling are error-prone. The AST approach handles all CommonMark edge cases in ~10 lines of traversal code vs ~40+ lines of regex with remaining edge cases.

### Crypto: Web Crypto API (built-in)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `crypto.subtle.digest` | (Deno built-in) | SHA-256 computation | Web standard, zero dependencies. Available in Deno without imports. |

**Confidence:** HIGH (Web Crypto is a W3C standard built into Deno)

### Claude Code Plugin Layer

| Technology | Format | Purpose | Why |
|------------|--------|---------|-----|
| SKILL.md | YAML frontmatter + Markdown body | Skill definitions (`/case`, `/consolidate`) | Claude Code [Agent Skills standard](https://agentskills.io). Frontmatter configures invocation; body is the system prompt. |
| Agent .md | YAML frontmatter + Markdown body | Subagent definitions (`case-briefer`, `spec-consolidator`) | Claude Code native subagent format. Frontmatter sets model, tools, description; body is the system prompt. |

**Confidence:** HIGH (verified via [official Claude Code skills docs](https://code.claude.com/docs/en/skills) and [subagents docs](https://code.claude.com/docs/en/sub-agents), March 2026)

## Frontmatter Conventions

### SKILL.md Frontmatter

Based on official docs and existing `/case` skill pattern:

```yaml
---
name: consolidate                    # lowercase, hyphens only (max 64 chars)
description: >                       # Multi-line. Claude reads this for auto-invocation.
  Use when a phase has shipped...    # Front-load key trigger. Truncated at 250 chars in listing.
argument-hint: "[phase-number]"      # Shown in autocomplete
allowed-tools:                       # Tools available without per-use approval
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - Edit
  - AskUserQuestion
  - Agent                            # For spawning subagents
disable-model-invocation: true       # User-only invocation (no auto-trigger)
---
```

**Available fields (full reference):**

| Field | Required | This Project Uses |
|-------|----------|-------------------|
| `name` | No (defaults to dir name) | Yes |
| `description` | Recommended | Yes |
| `argument-hint` | No | Yes (`[phase-number]`) |
| `disable-model-invocation` | No | Yes (both skills) |
| `user-invocable` | No | No (defaults true) |
| `allowed-tools` | No | Yes |
| `model` | No | No (inherits session) |
| `effort` | No | No |
| `context` | No | No (skills run inline) |
| `agent` | No | No |
| `hooks` | No | No |
| `paths` | No | No |
| `shell` | No | No |

**String substitutions available:** `$ARGUMENTS`, `$ARGUMENTS[N]`, `$N`, `${CLAUDE_SESSION_ID}`, `${CLAUDE_SKILL_DIR}`

### Agent .md Frontmatter

Based on official docs and existing `case-briefer`/`case-validator` patterns:

```yaml
---
name: spec-consolidator              # lowercase, hyphens
description: >                       # When Claude should delegate to this agent
  Per-service consolidation with...
tools:                               # Allowlist (inherits all if omitted)
  - Read
  - Write
  - Glob
  - Grep
  - Bash
model: sonnet                        # sonnet | opus | haiku | inherit | full model ID
---
```

**Available fields (full reference):**

| Field | Required | This Project Uses |
|-------|----------|-------------------|
| `name` | Yes | Yes |
| `description` | Yes | Yes |
| `tools` | No | Yes (restricted per agent) |
| `disallowedTools` | No | No |
| `model` | No | Yes (`sonnet` or `opus` per IMPL-SPEC) |
| `permissionMode` | No | No |
| `maxTurns` | No | Consider for verifier |
| `skills` | No | No |
| `mcpServers` | No | No |
| `hooks` | No | No |
| `memory` | No | No |
| `background` | No | No |
| `effort` | No | Consider for verifier |
| `isolation` | No | No |
| `initialPrompt` | No | No |

### Agent Model Assignments (from IMPL-SPEC)

| Agent | Model | Rationale |
|-------|-------|-----------|
| `spec-consolidator` | `sonnet` | Balanced capability/speed for structured merge operations |
| `e2e-flows` | `sonnet` | Structured output generation, no deep reasoning needed |
| `spec-verifier` | `opus` | 28-check verification needs strongest reasoning; downgrade candidate after usage data |
| `case-briefer` | `sonnet` | Extraction from planning docs, no deep reasoning |
| `case-validator` | `opus` | Cross-referencing gaps requires strong analytical reasoning |

## Testing

### Deno Test (built-in)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `deno test` | (built-in) | Test runner for `hash-sections_test.ts` | Zero-config, built-in assertions, `--allow-read` permission scoping. No external test framework needed. |

**Confidence:** HIGH (verified via [Deno testing docs](https://docs.deno.com/runtime/fundamentals/testing/))

**Test invocation:**
```bash
deno test --allow-read skills/consolidate/hash-sections_test.ts
```

**Test structure:** Standard Deno test pattern with `Deno.test()` and `assertEquals`/`assertExists` from `@std/assert`:

```typescript
import { assertEquals } from "jsr:@std/assert";

Deno.test("basic H2 extraction", async () => {
  // Read fixture, invoke hash function, assert output
});
```

**Fixture-based testing:** Test fixtures live alongside the test file. Each fixture is a small `.md` file exercising a specific edge case (fenced code blocks, setext headers, consecutive blank lines, etc.). The IMPL-SPEC defines 10 test cases.

### Skill/Agent Testing

No automated test framework for prompt-based artifacts. Validation is structural:

| Approach | What It Validates |
|----------|-------------------|
| YAML frontmatter linting | Required fields present, field value constraints |
| Dry-run with fixture data | Skill produces expected artifacts from known input |
| `spec-verifier` agent | 28-check read-only verification pass (T1/T2/T3 findings) |

**Confidence:** MEDIUM (skill/agent testing is still an evolving practice in the Claude Code ecosystem)

## Deno Configuration

### Minimal `deno.json` (optional)

For this project, a `deno.json` is optional but recommended for import map convenience and test task definition:

```json
{
  "tasks": {
    "test": "deno test --allow-read",
    "hash": "deno run --no-lock --allow-read skills/consolidate/hash-sections.ts"
  },
  "imports": {
    "unified": "npm:unified@11.0.5",
    "remark-parse": "npm:remark-parse@11.0.0",
    "remark-stringify": "npm:remark-stringify@11.0.0"
  }
}
```

**Why `--no-lock`:** The IMPL-SPEC specifies `--no-lock` for the hash tool invocation. This is correct: the lockfile is unnecessary for a single-script tool with pinned versions, and avoiding it simplifies first-run behavior for host projects consuming the plugin.

**Why import maps:** Centralizes version pins. The `.ts` files import bare specifiers (`import { unified } from "unified"`) rather than inline `npm:` URLs, making the code cleaner and version management centralized.

**Alternative: inline `npm:` specifiers without `deno.json`:**
```typescript
import { unified } from "npm:unified@11.0.5";
import remarkParse from "npm:remark-parse@11.0.0";
```
This also works and requires zero config files. Trade-off: version pins scattered across source files vs. centralized in `deno.json`.

**Recommendation:** Use `deno.json` with import maps. The project already has multiple files that may share imports, and centralized version management is cleaner.

## What NOT to Use

| Technology | Why Not |
|------------|---------|
| Node.js | Requires tsconfig.json, build step or tsx, package.json. Deno does this with zero config. |
| Bun | Similar DX to Deno but lacks Deno's permission sandbox. No benefit over Deno for this use case. |
| Jest/Vitest/Mocha | External test frameworks. Deno's built-in test runner handles all 10 test cases without dependencies. |
| `remark` (combined package) | Bundles `unified` + `remark-parse` + `remark-stringify`. We only need parse + stringify separately for the pipeline, and explicit imports make dependencies clear. |
| `mdast-util-to-string` | Tempting for section serialization, but it strips formatting. We need full markdown serialization (including code blocks, emphasis, etc.) for accurate hashing. `remark-stringify` is correct. |
| `gray-matter` / YAML parsers | Not needed. Skills and agents are consumed by Claude Code, not by our code. The hash tool operates on markdown sections, not frontmatter. |
| `esbuild` / bundlers | No build step. Deno runs TypeScript directly. Bundling would add complexity for zero benefit. |
| `prettier` / formatters | Not applicable to prompt-engineering Markdown. Formatting is semantic in skills/agents (whitespace matters for readability by Claude). |
| Docker | Overkill. The hash tool is `deno run` with one permission flag. |

## Installation (for hash tool dependencies)

No installation step. Deno downloads npm packages on first run:

```bash
# First run fetches npm:unified, npm:remark-parse, npm:remark-stringify
deno run --no-lock --allow-read skills/consolidate/hash-sections.ts test.md

# Subsequent runs use Deno's global cache (~/.cache/deno or DENO_DIR)
```

**Network requirement:** First invocation requires network access (npm registry). Subsequent runs are fully offline from cache. Document this in the skill's setup notes.

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Runtime | Deno 2.7+ | Node.js 22+ | Zero-config TypeScript, built-in test runner, permission sandbox, npm: specifiers |
| Runtime | Deno 2.7+ | Bun 1.2+ | No permission sandbox, less mature ecosystem |
| Markdown parser | unified + remark-parse | `markdown-it` | Not AST-based (token stream). unified/remark gives mdast tree for structural traversal. |
| Markdown parser | unified + remark-parse | Manual regex | IMPL-SPEC explicitly rejected. 40+ lines of fragile code vs. 10 lines of AST traversal. |
| AST serializer | remark-stringify | `mdast-util-to-string` | Strips formatting; hashes would miss code block / emphasis changes (false negatives). |
| Test runner | Deno test | Vitest | External dependency, requires config. Deno test is built-in and sufficient for 10 test cases. |
| Agent model | sonnet (default) / opus (verifier) | haiku | Too weak for consolidation reasoning. Haiku 4.5 is fast but consolidation needs sonnet-level structured output. |

## Sources

- [Deno Releases (GitHub)](https://github.com/denoland/deno/releases) -- Deno 2.7.7, March 2026
- [Deno Configuration Docs](https://docs.deno.com/runtime/fundamentals/configuration/) -- deno.json, import maps, npm: specifiers
- [Deno Testing Docs](https://docs.deno.com/runtime/fundamentals/testing/) -- built-in test runner, assertions
- [Claude Code Skills Docs](https://code.claude.com/docs/en/skills) -- SKILL.md frontmatter reference, full field list
- [Claude Code Subagents Docs](https://code.claude.com/docs/en/sub-agents) -- Agent .md frontmatter reference, model options
- [unified (npm)](https://www.npmjs.com/package/unified?activeTab=versions) -- v11.0.5 latest
- [remark-parse (npm)](https://www.npmjs.com/package/remark-parse) -- v11.0.0 latest
- [remark-stringify (npm)](https://www.npmjs.com/package/remark-stringify) -- v11.0.0 latest
- [Agent Skills Standard](https://agentskills.io) -- Open standard Claude Code follows
