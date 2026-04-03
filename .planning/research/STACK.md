# Technology Stack: v0.2.0 Portable Conventions

**Project:** cckit (Claude Code Toolkit)
**Milestone:** v0.2.0 Portable Conventions
**Researched:** 2026-04-03
**Scope:** Stack additions for installation infrastructure and convention distribution. Excludes already-validated stack (Deno runtime, unified, remark-parse, hash-sections, schema system, consolidation pipeline).

## Executive Summary

The convention distribution system needs **four standard library additions** and **zero third-party dependencies**. The installer is a single Deno script that reads a JSONC config file, resolves which convention packages to install, and copies files into the host project's `.claude/` directory. Everything required is available in the Deno standard library (`@std/jsonc`, `@std/fs`, `@std/path`, `@std/cli`) plus Deno's built-in file system APIs.

The critical design choice is **JSONC for the config format** -- it is Deno's own config format (`deno.json`/`deno.jsonc`), supports comments for self-documenting convention selections, and has a stable stdlib parser. No TOML, no YAML, no custom format.

## Recommended Stack Additions

### Config Format: JSONC via @std/jsonc

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `jsr:@std/jsonc` | `^1.0.2` | Parse `.cckit.jsonc` config files | Deno's own config format. Users already know it from `deno.json`. Comments allow self-documenting convention choices. Official stdlib parser -- stable, maintained, tiny. |

**Why JSONC over alternatives:**

| Format | Verdict | Reason |
|--------|---------|--------|
| JSONC | **Use this** | Deno's own format. Users know it from `deno.json`. `@std/jsonc` is stdlib -- zero third-party deps. Comments enable self-documenting config. |
| TOML | Rejected | Better type system but foreign to the Deno ecosystem. Would require `@std/toml` (extra dep) and introduce a format users don't use in this context. Deno chose JSONC for its own config, not TOML. |
| YAML | Rejected | Indentation-sensitive, implicit type coercion footguns (`norway: false` problem). Not aligned with Deno conventions. |
| Plain JSON | Rejected | No comments. Config files need comments to explain convention choices ("why did we enable this?"). |

**Config file name:** `.cckit.jsonc` -- dotfile convention for project-level config, `.jsonc` extension signals comment support. Consistent with `.eslintrc.json`, `.prettierrc.json` patterns.

### File System Operations: Deno Built-ins + @std/fs + @std/path

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `Deno.readTextFile` | (built-in) | Read config files, convention source files | Stable API, async, `--allow-read`. Already used in existing tools. |
| `Deno.writeTextFile` | (built-in) | Write installed convention files | Stable API, async, `--allow-write`. Already used in schema-bootstrap.ts. |
| `Deno.mkdir` | (built-in) | Create `.claude/` subdirectories | Stable API. `{ recursive: true }` handles nested creation like `mkdir -p`. |
| `Deno.readDir` | (built-in) | Enumerate convention package contents | Stable API, returns async iterator of `Deno.DirEntry`. |
| `Deno.stat` / `Deno.lstat` | (built-in) | Check file existence, detect symlinks | Stable API. Use `lstat` to distinguish symlinks from regular files when checking for conflicts. |
| `Deno.copyFile` | (built-in) | Copy individual convention files to target | Stable API. Copies contents + permissions. |
| `jsr:@std/fs` | `^1.0.23` | `ensureDir`, `exists`, `walk` higher-level utilities | `ensureDir` is idempotent mkdir (no error if exists). `walk` handles recursive convention directory traversal. `exists` for pre-flight checks. |
| `jsr:@std/path` | `^1.1.4` | `join`, `resolve`, `relative`, `dirname`, `basename` | Cross-platform path manipulation. Required for computing relative paths between cckit source and host project target. |

**Why per-file `Deno.copyFile` instead of `@std/fs` directory `copy`:**

The `@std/fs` `copy` function copies directory **contents** in bulk. The installer needs per-file control because:
- Config may select only some convention packages (selective install)
- Each file copy should be logged (dry-run mode, user feedback)
- Conflict detection needs per-file decisions (skip vs overwrite)
- Some files need merge behavior (CLAUDE.md sections), not raw copy

Explicit file-by-file operations with `Deno.copyFile` + `walk` give full control over all of these.

### CLI Argument Parsing: @std/cli

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `jsr:@std/cli` | `^1.0.0` | `parseArgs` for installer CLI flags | Parses `--dry-run`, `--force`, `--config <path>` flags. Stdlib, handles boolean flags, string args, aliases. The installer has 3-4 flags total -- does not need a framework. |

### Remote Execution: Deno Built-in (No Library)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `deno run <URL>` | (built-in) | Execute installer from remote URL | Core Deno capability since 1.0. The script URL is fetched, cached in `~/.cache/deno`, and executed. Arguments after the URL pass to `Deno.args`. No library needed. |

Remote execution is a first-class Deno feature. The pattern:

```bash
deno run --allow-read=. --allow-write=.claude/,./CLAUDE.md \
  https://raw.githubusercontent.com/nanazt/cc/master/tools/install.ts
```

Deno caches the script on first run. Subsequent runs use the cached version unless `--reload` is passed.

## What NOT to Add

| Technology | Why Not |
|------------|---------|
| `npm:commander` / `npm:yargs` | Heavyweight CLI frameworks. 3-4 flags do not warrant a framework. `@std/cli/parseArgs` is sufficient. |
| `npm:inquirer` / `npm:prompts` | Interactive prompts add complexity and break CI usage. Config file declares intent; installer executes it. Non-interactive by design. |
| `npm:glob` / `npm:fast-glob` | Deno's `@std/fs/walk` handles recursive file discovery natively. |
| `npm:chalk` / `npm:picocolors` | Console coloring is unnecessary for an installer that runs once. Use plain text output. Deno's `%c` CSS-style console formatting is available if needed later. |
| `npm:fs-extra` | Node.js utility. Everything it provides is available through Deno built-ins + `@std/fs`. |
| `npm:zod` / schema validators | Config has approximately 5 fields. TypeScript interfaces + manual validation with clear error messages is sufficient. Zod adds an npm dependency for trivial gain. |
| `@std/toml` | Not needed. Config format is JSONC. |
| `@std/yaml` | Not needed. Config format is JSONC. Frontmatter in skills/agents is consumed by Claude Code, not by installer code. |
| Any HTTP server framework | The installer is not a server. Pure file operations. |
| Any bundler (esbuild, etc.) | Deno runs TypeScript directly. Remote `deno run` fetches and caches. No build step. |
| `npm:semver` | Convention packages do not have semver dependencies between them. Version tracking is cckit's concern, not the installer's. |
| Template engines (Handlebars, etc.) | CLAUDE.md section merging is string manipulation (find section marker, append/replace). Does not warrant a template engine. |

## Permissions Model

The installer needs exactly two Deno permissions:

| Permission | Scope | Why |
|------------|-------|-----|
| `--allow-read` | Project directory, cckit convention source dir | Read config, read convention source files, check existing files for conflicts |
| `--allow-write` | Project `.claude/` directory, project root (for CLAUDE.md) | Write convention files, create directories, update CLAUDE.md |

**What is NOT needed:**

| Permission | Why Not Needed |
|------------|----------------|
| `--allow-net` | Not needed for local runs. For remote `deno run`, Deno auto-grants net for fetching the script itself. The script does no further network access -- convention files ship in the repo. |
| `--allow-env` | Installer does not read environment variables. |
| `--allow-run` | Installer does not spawn subprocesses. |
| `--allow-sys` | Installer does not read system info. |

**Scoped permissions for production use:**

```bash
# Remote execution (narrow scope)
deno run --allow-read=. --allow-write=.claude/,./CLAUDE.md \
  https://raw.githubusercontent.com/nanazt/cc/master/tools/install.ts

# Local development / self-application (broader for convenience)
deno run --allow-read --allow-write tools/install.ts
```

## Import Strategy: Inline jsr: Specifiers

Use inline `jsr:` specifiers in source files, consistent with the existing `npm:` specifier pattern used by hash-sections.ts, schema-parser.ts, and schema-bootstrap.ts.

```typescript
// Convention: inline specifiers, matching existing codebase pattern
import { parse as parseJsonc } from "jsr:@std/jsonc@^1.0.2";
import { ensureDir, exists, walk } from "jsr:@std/fs@^1.0.23";
import { join, resolve, relative } from "jsr:@std/path@^1.1.4";
import { parseArgs } from "jsr:@std/cli@^1.0.0/parse-args";
```

**Why not use `deno.json` imports / import map:**

The project currently has no `deno.json`. All existing tools use direct specifiers (`npm:unified@^11.0.0`, `npm:remark-parse@^11.0.0`). Adding `deno.json` solely for import mapping introduces a new convention without corresponding benefit. Inline specifiers are self-documenting -- you see the package and version at the import site.

**When to add `deno.json`:** If the project accumulates 5+ files importing the same packages, centralizing versions in `deno.json` imports becomes worthwhile. For now, 1-2 new files (install.ts, possibly a config.ts) do not justify it.

## Config File Design (`.cckit.jsonc`)

```jsonc
{
  // Which convention packages to install
  // Each name maps to a directory in cckit's conventions/ folder
  "conventions": [
    "commit",       // Conventional Commits rules
    "workflow",     // GSD workflow integration
    "coding"        // Code style conventions
  ],

  // Where to install (relative to project root)
  // Default: ".claude/"
  "target": ".claude/",

  // What to do when a file already exists at the target
  // "skip" = keep existing (safe default)
  // "overwrite" = replace with convention version
  // "merge" = append convention sections (for CLAUDE.md only)
  "onConflict": "skip"
}
```

**Design principles:**
- Flat structure. No nesting beyond the `conventions` array.
- String array for `conventions` -- each maps to a convention package directory.
- Sensible defaults: `target` is `.claude/`, `onConflict` is `"skip"` (never destroy user content without explicit opt-in).
- Comments explain each field in place (JSONC advantage over JSON).
- Extensible: new fields can be added later without breaking existing configs.

## Stack Architecture: How It Fits Together

```
User invokes (remote):
  deno run --allow-read --allow-write https://raw.githubusercontent.com/.../install.ts

User invokes (local / self-application):
  deno run --allow-read --allow-write tools/install.ts

install.ts execution flow:
  1. parseArgs(Deno.args)        <- @std/cli     : --dry-run, --force, --config
  2. Deno.readTextFile(config)   <- built-in     : read .cckit.jsonc
  3. parseJsonc(configText)      <- @std/jsonc   : parse JSONC to object
  4. validate(config)            <- manual TS    : check required fields, types
  5. for each convention:
     a. resolve source paths     <- @std/path    : join(cckit, 'conventions', name)
     b. walk(source)             <- @std/fs      : enumerate convention files
     c. for each file:
        - resolve target path    <- @std/path    : join(projectRoot, target, ...)
        - ensureDir(parent)      <- @std/fs      : create target directories
        - check exists(target)   <- @std/fs      : conflict detection
        - apply onConflict       <- manual TS    : skip / overwrite / merge
        - Deno.copyFile / merge  <- built-in     : write to target
        - log action             <- console      : "installed: .claude/skills/..."
  6. summary report              <- console      : "3 conventions, 12 files installed"
```

## Existing Stack (Unchanged)

Listed for completeness. No changes needed for v0.2.0.

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| Deno | `>=2.7` (latest: 2.7.x, March 2026) | Runtime | Unchanged |
| `npm:unified` | `^11.0.0` | Pipeline processor | Unchanged |
| `npm:remark-parse` | `^11.0.0` | Markdown-to-AST | Unchanged |
| `npm:mdast-util-to-string` | `^4.0.0` | AST text extraction | Unchanged |
| `npm:remark-gfm` | `^4.0.0` | GFM table parsing | Unchanged |
| `npm:@types/mdast` | `^4.0.0` | TypeScript AST types | Unchanged |
| `crypto.subtle.digest` | (built-in) | SHA-256 hashing | Unchanged |
| `deno test` | (built-in) | Test runner | Unchanged |

## Dependency Count

**Before v0.2.0:** 5 npm packages (unified, remark-parse, mdast-util-to-string, remark-gfm, @types/mdast), 0 jsr packages.

**After v0.2.0:** Same 5 npm packages + 4 jsr standard library packages (@std/jsonc, @std/fs, @std/path, @std/cli).

All additions are official Deno standard library. No third-party dependencies added.

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Config format | JSONC (`@std/jsonc`) | TOML (`@std/toml`) | Foreign to Deno ecosystem. Extra cognitive load. |
| Config format | JSONC (`@std/jsonc`) | YAML (`@std/yaml`) | Indentation-sensitive, implicit type coercion, not Deno-idiomatic. |
| Config format | JSONC (`@std/jsonc`) | Plain JSON | No comments. Config needs self-documentation. |
| CLI parsing | `@std/cli/parseArgs` | `npm:commander` | 3-4 flags. Stdlib is sufficient. No npm dep. |
| File copy | `Deno.copyFile` per file | `@std/fs/copy` directory | Need per-file control for selective install, conflict detection, dry-run, logging. |
| Path handling | `@std/path` | Manual string concat | Cross-platform correctness (Windows separators, edge cases). |
| Config validation | TypeScript interfaces + manual | `npm:zod` | Config has ~5 fields. Zod is overkill, adds npm dep. |
| Import style | Inline `jsr:` specifiers | `deno.json` import map | Matches existing `npm:` pattern. No config file ceremony. |
| Remote hosting | raw.githubusercontent.com | deno.land/x or JSR | cckit is a personal toolkit on GitHub. No need for a registry. raw.githubusercontent.com is sufficient and free. |

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| JSONC as config format | HIGH | Deno's own format. `@std/jsonc` v1.0.2 verified on JSR. |
| Deno built-in FS APIs | HIGH | Well-documented stable APIs. Already used by existing tools in this codebase. |
| `@std/fs` utilities | HIGH | v1.0.23, stable 1.0.x series. Verified on JSR. |
| `@std/cli/parseArgs` | HIGH | Stdlib, verified on JSR, documented in official Deno examples. |
| `@std/path` utilities | HIGH | v1.1.4, verified on JSR. |
| Remote `deno run` pattern | HIGH | Core Deno feature since 1.0. Verified with real-world examples, official docs. |
| Permission scoping | HIGH | Verified in official Deno security docs. Scoped `--allow-read` and `--allow-write` are stable. |
| No `deno.json` needed | MEDIUM | Correct for current scale (1-2 new files). May want to revisit if convention count grows significantly. |

## Sources

- [Deno Standard Library](https://docs.deno.com/runtime/fundamentals/standard_library/) -- JSR-hosted stdlib overview
- [@std/jsonc on JSR](https://jsr.io/@std/jsonc) -- v1.0.2, JSONC parser
- [@std/jsonc versions](https://jsr.io/@std/jsonc/versions) -- version history
- [@std/fs on JSR](https://jsr.io/@std/fs) -- v1.0.23, filesystem utilities (ensureDir, exists, walk)
- [@std/path on JSR](https://jsr.io/@std/path) -- v1.1.4, path utilities
- [@std/cli/parseArgs on JSR](https://jsr.io/@std/cli/doc/parse-args) -- CLI argument parsing
- [Deno File System APIs](https://docs.deno.com/api/deno/file-system) -- Deno.copyFile, Deno.mkdir, Deno.readDir, Deno.stat
- [Deno.copyFile API](https://docs.deno.com/api/deno/~/Deno.copyFile) -- copyFile signature
- [Deno Security and Permissions](https://docs.deno.com/runtime/fundamentals/security/) -- permission model, scoped flags
- [Deno CLI: deno run](https://docs.deno.com/runtime/reference/cli/run/) -- remote URL execution, argument ordering
- [Building Scripts and CLIs with Deno](https://deno.com/learn/scripts-clis) -- remote script patterns
- [Deno 2.7 Release](https://deno.com/blog/v2.7) -- latest stable release (February 2026)
- [Deno 2.5: Permissions in config file](https://deno.com/blog/v2.5) -- permission sets feature
- [Deno Releases (GitHub)](https://github.com/denoland/deno/releases) -- version history
- [JSON vs YAML vs TOML in 2026](https://dev.to/jsontoall_tools/json-vs-yaml-vs-toml-which-configuration-format-should-you-use-in-2026-1hlb) -- format comparison
- [Parsing and serializing YAML (Deno)](https://docs.deno.com/examples/parsing_serializing_yaml/) -- @std/yaml reference (considered, rejected)
- [Parsing and serializing TOML (Deno)](https://docs.deno.com/examples/parsing_serializing_toml/) -- @std/toml reference (considered, rejected)
