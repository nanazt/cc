# Phase 19: First Convention -- Commit - Research

**Researched:** 2026-04-06
**Domain:** Commit message convention authoring + Claude Code PreToolUse hook implementation
**Confidence:** HIGH

## Summary

Phase 19 has two deliverables: (1) a commit message convention file at `conventions/commit/CONVENTION.md` authored via the `/convention` skill, and (2) a PreToolUse hook that injects convention content and mechanically validates commit messages. Both are well-understood domains with clear implementation paths.

The convention file is authored by running `/convention commit`, which triggers the full research-preferences-generate pipeline built in Phase 18. The content must pass the delta test -- only rules that change Claude's default behavior survive. Based on analysis of cckit's existing CLAUDE.md commit rules and the Conventional Commits 1.0.0 specification, the strongest delta-test candidates are: scope naming strategy (codebase nouns only), GSD reference prohibition, commit granularity guidance, and subject line "why not what" framing. Standard Conventional Commits format, imperative mood, and type definitions are likely NO-DELTA (Claude already knows these).

The hook leverages Claude Code's `additionalContext` mechanism in PreToolUse hooks, which injects text into Claude's context before tool execution. This is the correct mechanism for convention awareness. Mechanical validation (format checks, scope pattern checks, GSD reference detection) uses the existing `deny` pattern already proven in `validate-commit-scope.sh`. The two concerns (injection and validation) can coexist in a single hook script or be split into two hooks -- both patterns work with Claude Code's parallel hook execution.

**Primary recommendation:** Plan 01 runs `/convention commit` interactively (the skill handles all research, preferences, and generation). Plan 02 implements a PreToolUse hook script at `conventions/commit/hooks/validate.sh` that combines convention content injection via `additionalContext` with mechanical validation via `deny`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: cckit targets GSD workflow users. Conventions work without GSD, but skills require GSD. "Arbitrary project" means "any project using GSD." PROJECT.md must be updated.
- D-02: Content covers scope naming strategy, commit granularity/atomicity, and subject/body quality rules. Final content delegated to /convention skill's researcher.
- D-03: Convention explicitly includes a GSD reference prohibition rule stated directly (not abstracted).
- D-04: Strict delta test. Remove everything Claude already knows from training data.
- D-05: Empty convention is a valid outcome if delta test eliminates all rules.
- D-06: Three quality criteria: practicality (helpful for cckit commits), conciseness (not too many rules), example quality (concrete, genuinely helpful).
- D-07: Single phase with 2 plans. Plan 01: PROJECT.md update + `/convention commit`. Plan 02: GSD commit convention injection hook.
- D-08: Verification is NOT part of the plan -- handled by /gsd-verify-work.
- D-09: CLAUDE.md commit rules migration deferred to Phase 20.
- D-10: Self-application deferred to Phase 20 installer. Phase 19 only creates source file.
- D-11: Phase 19.1 merged into Phase 19 as Plan 02. ROADMAP must be updated to remove Phase 19.1.
- D-12: Mechanism: PreToolUse hook detects `git commit` and `gsd-tools commit`, injects convention content as awareness context.
- D-13: On violation: hook denies the commit and explains which rules were violated.
- D-14: Hook validates only mechanically verifiable rules. Semantic quality injected as convention content for AI judgment, not enforced mechanically.
- D-15: Implementation details (hook architecture, discovery path) delegated to Plan 02 researcher.
- D-16: Phase 19 is separate from Phase 18 -- convention file is a product deliverable.

### Claude's Discretion
- Convention internal structure (section ordering, grouping) -- determined by /convention skill's generator
- Research depth and sources -- determined by convention-researcher agent
- Hook implementation specifics -- determined by Plan 02 researcher

### Deferred Ideas (OUT OF SCOPE)
- Self-application to .claude/rules/ (Phase 20 installer)
- CLAUDE.md migration of commit conventions section (Phase 20)
- Convention hook installation in host projects (Phase 20 installer)
- Technology-neutral redefinition across all docs (broader scope)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| COMMIT-01 | Commit message format convention | Convention authored via `/convention commit` skill pipeline; delta test filters NO-DELTA rules; GSD reference prohibition is HIGH-DELTA; hook provides mechanical enforcement + awareness injection |
</phase_requirements>

## Standard Stack

This phase produces markdown files and a shell script -- no libraries to install.

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| `/convention` skill | Phase 18 | Convention authoring pipeline | Already built and structurally validated [VERIFIED: codebase] |
| `jq` | 1.7.1 | JSON parsing in hook scripts | Already available on system, same tool used by existing hook [VERIFIED: `jq --version`] |
| Claude Code hooks API | Current | PreToolUse hook for injection + validation | Official mechanism for pre-execution interception [CITED: code.claude.com/docs/en/hooks] |

### Supporting
| Tool | Purpose | When to Use |
|------|---------|-------------|
| `convention-researcher` agent (opus) | Research commit best practices | Dispatched by `/convention` during Plan 01 execution |
| `convention-generator` agent (sonnet) | Generate convention file with delta test | Dispatched by `/convention` during Plan 01 execution |

No `npm install` or `deno add` needed -- this phase produces content artifacts and a shell script only.

## Architecture Patterns

### Deliverable Structure

```
conventions/
  commit/
    CONVENTION.md              # Base commit convention (Plan 01 output)
    hooks/
      validate.sh              # PreToolUse hook script (Plan 02 output)
```

This follows the convention architecture spec in `docs/CONVENTIONS.md`. [VERIFIED: docs/CONVENTIONS.md source structure example]

### Pattern 1: Convention File Format (Base, Always-Loading)

**What:** A markdown file with minimal frontmatter, containing only rules that pass the delta test.
**When to use:** Commit convention is base (tech-neutral), so no `paths` scoping needed -- it loads in every Claude session.
**Example:**

```markdown
---
description: "Commit message format and quality standards"
---

[rules that pass delta test]

<!-- Generated by /convention, 2026-04-06T00:00:00Z -->
```

Source: `docs/CONVENTIONS.md` frontmatter specification [VERIFIED: codebase]

### Pattern 2: PreToolUse Hook with `additionalContext` Injection

**What:** A hook script that reads stdin JSON, checks if the command is a git commit, and returns `additionalContext` to inject convention awareness into Claude's context while also mechanically validating the commit message format.
**When to use:** Every commit command (both `git commit` and `gsd-tools commit`).
**Key discovery:** Claude Code's PreToolUse hooks support an `additionalContext` field in the output JSON. This text is added to Claude's context before the tool executes. This is the correct mechanism for convention awareness injection -- it does not require modifying the commit command itself. [CITED: code.claude.com/docs/en/hooks]

**Example (validated hook output for injection):**

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "additionalContext": "COMMIT CONVENTION: [convention content here]"
  }
}
```

**Example (validated hook output for denial):**

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Commit message violates convention: scope 'phase-19' contains a phase number. Use a codebase noun."
  }
}
```

Source: Claude Code hooks reference [CITED: code.claude.com/docs/en/hooks]

### Pattern 3: Dual-Purpose Hook (Inject + Validate)

**What:** A single hook script that serves two purposes:
1. **Always** injects convention content via `additionalContext` (so Claude is aware of conventions before writing the commit message)
2. **When commit message is present in the command** validates mechanically checkable rules and denies on violation

**Why dual-purpose:** The hook fires on the Bash tool PreToolUse. At this point, the command string is available. If the command contains a commit message (e.g., `git commit -m "..."`) the hook can validate it mechanically. If it's just `git commit` (interactive), the hook can only inject awareness. Both paths benefit from `additionalContext`.

**Decision precedence:** When a hook returns `deny`, the `additionalContext` is NOT delivered because the tool call is blocked. This means injection and validation must be sequenced: first check validity; if invalid, deny (Claude gets the denial reason and retries); if valid or no message extractable, allow with `additionalContext` injected. [CITED: code.claude.com/docs/en/hooks]

### Pattern 4: Convention File Discovery in Hook

**What:** The hook script needs to find and read the convention file content to inject it via `additionalContext`.
**Discovery strategy (Plan 02 researcher scope per D-15):**

The hook is registered in `.claude/settings.json` with its path. It can locate the convention file relative to the project root (available as `cwd` in the stdin JSON). Discovery order:

1. Check `conventions/commit/CONVENTION.md` (publisher/source mode)
2. Check `.claude/rules/cckit-commit.md` (consumer/installed mode)
3. If neither exists, skip injection (no convention available)

This makes the hook work for both cckit itself (publisher) and host projects (consumer). [ASSUMED]

### Anti-Patterns to Avoid

- **Modifying the commit command via `updatedInput`:** Do not try to rewrite the `git commit -m "..."` command. The hook should validate the message or inject context, not alter the command. `updatedInput` replaces the entire tool input and could break the command structure.
- **Hardcoding convention content in the hook script:** The hook should read the convention file at runtime, not embed rules. This keeps the hook generic and reusable across convention updates.
- **Blocking all commits on missing convention:** If no convention file is found, the hook should silently pass through. Projects without conventions keep default behavior (per D-13 intent from Phase 19.1 success criteria).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Convention authoring pipeline | Manual markdown writing | `/convention commit` skill | Skill handles research, delta test, user preferences, tech-neutrality check -- all validated in Phase 18 |
| Commit message parsing in hook | Regex from scratch | Pattern from existing `validate-commit-scope.sh` | Already proven pattern for extracting scope from commit messages in PreToolUse hooks |
| JSON parsing in shell | `sed`/`awk` hacks | `jq` | Available on system (v1.7.1), already used by existing hook, reliable JSON handling |
| Convention injection mechanism | Custom context modification | Claude Code `additionalContext` in PreToolUse output | Official API mechanism designed for exactly this purpose |

**Key insight:** Phase 19 Plan 01 is primarily an invocation of existing infrastructure (`/convention commit`) -- the skill and agents handle the hard work. Plan 02 extends a proven hook pattern (`validate-commit-scope.sh`) with the newly discovered `additionalContext` injection mechanism.

## Common Pitfalls

### Pitfall 1: Delta Test Eliminating All Rules
**What goes wrong:** The convention researcher finds many commit best practices, but Claude already follows all of them by default. The delta test removes everything, leaving an empty convention.
**Why it happens:** Conventional Commits 1.0.0 format is well-represented in training data. Claude already uses imperative mood, proper type prefixes, 72-char subjects, etc.
**How to avoid:** D-05 explicitly acknowledges this as a valid outcome. However, the GSD reference prohibition (D-03) and scope naming strategy (codebase nouns only) are almost certainly HIGH-DELTA because they are project-methodology-specific rules that Claude cannot derive from training data alone.
**Warning signs:** If the researcher returns mostly NO-DELTA practices, the convention may end up very short. This is acceptable per D-05 and D-06 (conciseness criterion).

### Pitfall 2: Hook Complexity Creep
**What goes wrong:** The validation hook tries to check too many rules mechanically, becoming fragile and hard to maintain.
**Why it happens:** D-14 draws a clear line between mechanically verifiable rules (format, scope patterns, length, GSD references) and semantic rules (quality, granularity, appropriateness). But it's tempting to add more checks.
**How to avoid:** Stick strictly to D-14's enumeration. Mechanical checks only: Conventional Commits format regex, scope pattern (no bare numbers), subject line length, allowed type list, GSD reference patterns. Everything else is convention content for AI judgment via `additionalContext`.
**Warning signs:** If the hook script exceeds ~80 lines, it's probably doing too much.

### Pitfall 3: Hook Blocking gsd-tools Commit
**What goes wrong:** The hook intercepts `node gsd-tools commit` but the command string extraction fails because `gsd-tools commit` wraps `git commit` differently.
**Why it happens:** `gsd-tools commit` constructs a `git commit` command internally and runs it via Bash. The PreToolUse hook fires on the outer Bash command (which contains `node gsd-tools commit ...`), not on the inner `git commit`.
**How to avoid:** The hook should match both patterns: commands containing `git commit` AND commands containing `gsd-tools.*commit`. For `gsd-tools commit`, the commit message is a positional argument, not a `-m` flag -- the extraction regex must handle both formats.
**Warning signs:** Test both invocation patterns during development.

### Pitfall 4: Convention File Not Found at Hook Runtime
**What goes wrong:** The hook runs but cannot find the convention file because the path resolution is wrong.
**Why it happens:** The hook runs from the project root (`cwd` from stdin JSON), but the convention file path depends on whether the project is cckit (publisher mode) or a consumer (installed mode).
**How to avoid:** Use the dual-path discovery strategy (Pattern 4 above). Fall back gracefully -- if no convention file found, exit 0 without injection or validation.
**Warning signs:** Hook silently not injecting conventions. Add a debug mode or log to stderr (non-blocking, shown in verbose mode).

### Pitfall 5: validate-commit-scope.sh Overlap with New Hook
**What goes wrong:** The existing `validate-commit-scope.sh` hook and the new `conventions/commit/hooks/validate.sh` both check commit messages, causing duplicate validation or conflicting denials.
**Why it happens:** Both hooks fire on PreToolUse Bash commands containing `git commit`.
**How to avoid:** The new convention hook should subsume the existing `validate-commit-scope.sh` functionality. Plan 02 should either: (a) merge the existing hook's checks into the new hook and remove the old one, or (b) ensure the checks are complementary and non-overlapping. Since the old hook checks scope patterns (bare numbers, "state" scope) and the new hook will also check scopes, option (a) -- merging -- is cleaner. The old hook at `.claude/hooks/validate-commit-scope.sh` was created before the convention architecture existed and can be migrated into the convention-scoped hook.
**Warning signs:** Two deny responses for the same violation pattern.

## Code Examples

### Example 1: Convention File Content (Expected Shape)

Based on delta test analysis of what Claude already knows vs. what needs teaching:

```markdown
---
description: "Commit message format and quality standards"
---

# Commit Convention

## Scope Rules

Scope names a codebase noun -- a tool, module, or component visible in the directory
structure. Never use phase numbers, sprint IDs, or project management references as scopes.

Good: feat(parser), fix(auth), docs(api)
Bad: feat(phase-3), fix(sprint-12), docs(JIRA-456)

## GSD Reference Prohibition

GSD-internal references must never appear in commit messages -- not in subject, not in body:
- Phase numbers: "phase 11", "phase 9"
- Plan IDs: "11-01", "plan 02"
- Requirement IDs: "PIPE-01", "MODEL-03"
- Decision IDs: "D-03", "D-15"
- Progress fractions: "plan 1/3", "progress 71%"

Describe what was done, not which planning artifact drove it.

## Subject Line Quality

The subject line explains why the change matters, not what files changed.
Focus on the behavioral impact or the problem being solved.

Good: fix(parser): handle nested arrays without stack overflow
Bad: fix(parser): update parser.ts line 42

## Commit Granularity

One logical change per commit. If explaining the commit requires "and" between
unrelated changes, split into separate commits.

<!-- Generated by /convention, 2026-04-06T00:00:00Z -->
```

**Note:** This is an illustrative example of expected shape. The actual content will be determined by the `/convention` skill's research-preferences-generate pipeline, which applies the delta test rigorously. [ASSUMED]

### Example 2: Hook Script Structure (validate.sh)

```bash
#!/bin/sh
# Convention injection + mechanical validation for commit messages.
# Registered as PreToolUse hook on Bash matcher.
# Reads convention file and injects via additionalContext.
# Validates mechanically checkable rules and denies on violation.

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command')
CWD=$(echo "$INPUT" | jq -r '.cwd')

# Only process commit commands
case "$CMD" in
  *git\ commit*|*gsd-tools*commit*) ;;
  *) exit 0 ;;
esac

# --- Convention file discovery ---
CONV_FILE=""
if [ -f "$CWD/conventions/commit/CONVENTION.md" ]; then
  CONV_FILE="$CWD/conventions/commit/CONVENTION.md"
elif [ -f "$CWD/.claude/rules/cckit-commit.md" ]; then
  CONV_FILE="$CWD/.claude/rules/cckit-commit.md"
fi

# --- Extract commit message (if present in command) ---
MSG=$(echo "$CMD" | grep -oP '(?<=-m\s")[^"]*' 2>/dev/null)
if [ -z "$MSG" ]; then
  MSG=$(echo "$CMD" | grep -oP "(?<=-m\s')[^']*" 2>/dev/null)
fi
# Also handle heredoc format from GSD: -m "$(cat <<'EOF'...EOF)"
# This is complex to extract; fall back to awareness injection only

# --- Mechanical validation (when message available) ---
if [ -n "$MSG" ]; then
  # [validation checks here -- format, scope, GSD references, etc.]
  # If invalid: output deny JSON and exit 0
fi

# --- Convention injection (when convention file found) ---
if [ -n "$CONV_FILE" ]; then
  CONTENT=$(cat "$CONV_FILE")
  jq -n --arg ctx "COMMIT CONVENTION (follow these rules):\n$CONTENT" \
    '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow","additionalContext":$ctx}}'
fi

exit 0
```

Source: Pattern derived from existing `validate-commit-scope.sh` [VERIFIED: codebase] + Claude Code hooks `additionalContext` API [CITED: code.claude.com/docs/en/hooks]

### Example 3: Hook Registration in settings.json

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "conventions/commit/hooks/validate.sh",
            "statusMessage": "Checking commit convention..."
          }
        ]
      }
    ]
  }
}
```

Source: Existing `.claude/settings.json` hook registration pattern [VERIFIED: codebase]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Exit code 2 for blocking | JSON `permissionDecision: "deny"` on exit 0 | Claude Code hooks maturation | Both work; JSON approach provides richer feedback via `permissionDecisionReason` |
| No context injection in hooks | `additionalContext` field in PreToolUse output | Claude Code hooks v2+ | Enables convention awareness without modifying tool input |
| `validate-commit-scope.sh` as standalone | Convention-scoped hook at `conventions/commit/hooks/validate.sh` | Phase 19 (this phase) | Centralizes all commit validation in the convention's hook directory per architecture spec |

**Deprecated/outdated:**
- Using exit code 2 for hook blocking still works but the JSON output pattern is preferred for richer feedback [CITED: code.claude.com/docs/en/hooks]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Hook can discover convention file via dual-path lookup (publisher + consumer) relative to `cwd` from stdin JSON | Architecture Patterns, Pattern 4 | LOW -- `cwd` is documented in hook input format; file existence check is reliable |
| A2 | Convention content shape shown in Example 1 approximates what the /convention skill will produce | Code Examples | LOW -- actual content determined by skill pipeline; example is illustrative only |
| A3 | `additionalContext` text is visible to Claude in the same turn as the tool execution | Architecture Patterns, Pattern 2 | MEDIUM -- if not visible, the injection mechanism would not work; official docs say it is "added to Claude's context" |
| A4 | When `permissionDecision` is `deny`, `additionalContext` is NOT delivered | Architecture Patterns, Pattern 3 | MEDIUM -- if additionalContext IS delivered on deny, the sequencing logic simplifies but the core approach remains valid |

## Open Questions

1. **Commit message extraction from heredoc format**
   - What we know: GSD commit templates use `git commit -m "$(cat <<'EOF'...EOF)"` format. Simple `-m` regex extraction may not capture this.
   - What's unclear: Whether the entire heredoc is expanded in the command string that reaches the hook, or whether it arrives as the literal heredoc syntax.
   - Recommendation: Test during Plan 02 implementation. If heredoc syntax arrives unexpanded, the hook should fall back to awareness injection only (no mechanical validation for that commit). This is acceptable because Claude already has the convention content via `additionalContext`.

2. **Existing hook migration strategy**
   - What we know: `validate-commit-scope.sh` at `.claude/hooks/` checks scope patterns. The new convention hook will also check scopes.
   - What's unclear: Whether to remove the old hook entirely or keep it as a fallback.
   - Recommendation: Plan 02 should migrate the old hook's functionality into the new convention hook and update `.claude/settings.json` to reference the new hook. The old hook file can be deleted or kept as a reference. This avoids duplicate validation.

3. **ROADMAP update mechanics**
   - What we know: D-11 says Phase 19.1 must be removed from ROADMAP as a separate phase.
   - What's unclear: Whether this update should be in Plan 01 (alongside PROJECT.md update) or Plan 02 (alongside hook implementation).
   - Recommendation: Include ROADMAP update in Plan 01 since it's a doc update alongside PROJECT.md, keeping Plan 02 focused on hook implementation.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| jq | Hook script JSON parsing | Yes | 1.7.1-apple | -- |
| Deno | hash-sections.ts (not directly needed) | Yes | 2.7.9 | -- |
| Node.js | gsd-tools (for testing gsd-tools commit) | Yes | v25.6.0 | -- |
| Claude Code | Hook API, /convention skill | Yes | Current | -- |
| `/convention` skill | Plan 01 convention authoring | Yes | Phase 18 (complete) | -- |
| `conventions/` directory | Convention file output | No (does not exist yet) | -- | Created by Plan 01 |
| `.claude/rules/` directory | Consumer install path | No (does not exist yet) | -- | Created by Phase 20 installer |

**Missing dependencies with no fallback:** None -- all external tools are available.

**Missing dependencies with fallback:**
- `conventions/` directory: Created as part of Plan 01 execution (first convention file creates the directory)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Deno test (built-in) |
| Config file | None (implicit, uses `--allow-read --allow-write` flags) |
| Quick run command | `deno test --allow-read --allow-write tools/convention-skill_test.ts` |
| Full suite command | `deno test --allow-read --allow-write tools/` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COMMIT-01a | Convention file exists at `conventions/commit/CONVENTION.md` with proper frontmatter | structural | `deno test --allow-read tools/convention-commit_test.ts::convention-file-exists` | No -- Wave 0 |
| COMMIT-01b | Convention file has `description` frontmatter, no `paths` field (base convention) | structural | `deno test --allow-read tools/convention-commit_test.ts::base-frontmatter-format` | No -- Wave 0 |
| COMMIT-01c | Convention file has footer comment with timestamp | structural | `deno test --allow-read tools/convention-commit_test.ts::footer-comment-present` | No -- Wave 0 |
| COMMIT-01d | Convention file does not contain NO-DELTA content (basic CC format, imperative mood, standard types) | manual-only | Manual review: delta test is a judgment call | -- |
| COMMIT-01e | Convention file is technology-neutral | structural | `deno test --allow-read tools/convention-commit_test.ts::tech-neutrality-scan` | No -- Wave 0 |
| COMMIT-01f | Hook script exists at `conventions/commit/hooks/validate.sh` | structural | `deno test --allow-read tools/convention-commit_test.ts::hook-script-exists` | No -- Wave 0 |
| COMMIT-01g | Hook script is executable and handles non-commit commands gracefully | structural | `deno test --allow-read tools/convention-commit_test.ts::hook-script-executable` | No -- Wave 0 |
| COMMIT-01h | settings.json registers the convention hook | structural | `deno test --allow-read tools/convention-commit_test.ts::hook-registered` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `deno test --allow-read tools/convention-commit_test.ts`
- **Per wave merge:** `deno test --allow-read --allow-write tools/`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `tools/convention-commit_test.ts` -- structural integrity tests for commit convention deliverables (convention file, hook script, settings.json registration)
- [ ] Framework install: Not needed -- Deno test is already available and used by existing tests

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | -- |
| V3 Session Management | No | -- |
| V4 Access Control | No | -- |
| V5 Input Validation | Yes | `jq` for JSON parsing in hook (no raw shell string eval) |
| V6 Cryptography | No | -- |

### Known Threat Patterns for Hook Scripts

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Shell injection via commit message content | Tampering | Use `jq` for JSON parsing; never `eval` stdin content; quote all variables |
| Path traversal in convention file discovery | Tampering | Validate `cwd` from stdin; use absolute paths resolved from `cwd` |
| Denial of service via large convention file | Denial of Service | Convention files are small (< 5KB typically); no mitigation needed |

## Sources

### Primary (HIGH confidence)
- `docs/CONVENTIONS.md` -- Convention architecture specification (file structure, naming, frontmatter, hook architecture) [VERIFIED: codebase read]
- `skills/convention/SKILL.md` -- Skill orchestrator definition and step routing [VERIFIED: codebase read]
- `skills/convention/step-research.md`, `step-preferences.md`, `step-generate.md`, `step-init.md` -- Full skill pipeline steps [VERIFIED: codebase read]
- `agents/convention-researcher.md`, `agents/convention-generator.md` -- Agent definitions [VERIFIED: codebase read]
- `.claude/hooks/validate-commit-scope.sh` -- Existing PreToolUse hook pattern [VERIFIED: codebase read]
- `.claude/settings.json` -- Current hook registration format [VERIFIED: codebase read]
- [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks) -- `additionalContext`, `updatedInput`, `permissionDecision` values, hook input/output format [CITED: official docs]

### Secondary (MEDIUM confidence)
- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) -- Official specification for commit message format [CITED: official specification]
- `.claude/cckit.json` -- Publisher mode configuration (`publisher: true`) [VERIFIED: codebase read]

### Tertiary (LOW confidence)
- None -- all findings verified against codebase or official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all tools are already in the codebase or are system utilities
- Architecture: HIGH -- convention file format, hook patterns, and Claude Code APIs are well-documented
- Pitfalls: HIGH -- based on analysis of existing hook code and Claude Code documentation
- Hook `additionalContext` behavior: MEDIUM -- documented in official docs but untested in this specific context (convention injection)

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (stable -- convention architecture and Claude Code hooks API are mature)
