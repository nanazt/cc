---
phase: quick
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - CLAUDE.md
  - .planning/PROJECT.md
  - docs/STACK.md
autonomous: true
requirements: []
must_haves:
  truths:
    - "CLAUDE.md Skills table shows /consolidate as validated v2"
    - "CLAUDE.md Agents table lists all 4 agents with correct models"
    - "CLAUDE.md Structure block accurately describes directives/ and tools/"
    - "docs/STACK.md dependency list matches actual imports in tools/*.ts"
    - "PROJECT.md Constraints section accurately describes existing agents"
  artifacts:
    - path: "CLAUDE.md"
      provides: "Accurate manual sections"
      contains: "spec-consolidator"
    - path: "docs/STACK.md"
      provides: "Corrected dependency list"
      contains: "mdast-util-to-string"
    - path: ".planning/PROJECT.md"
      provides: "Corrected constraints"
  key_links:
    - from: "CLAUDE.md GSD:project block"
      to: ".planning/PROJECT.md"
      via: "GSD sync"
      pattern: "GSD:project-start source:PROJECT.md"
    - from: "CLAUDE.md GSD:stack block"
      to: "docs/STACK.md"
      via: "GSD sync"
      pattern: "GSD:stack-start source:docs/STACK.md"
---

<objective>
Update CLAUDE.md manual sections and GSD source files to match actual project state after Phases 9-12.1 completion.

Purpose: CLAUDE.md is the primary project instruction file read by every Claude session. Stale information causes incorrect assumptions (wrong agent list, wrong dependency claims, outdated status).

Output: Accurate CLAUDE.md, PROJECT.md (Constraints), and docs/STACK.md
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.planning/PROJECT.md
@docs/STACK.md
@tools/hash-sections.ts (lines 1-4: actual imports)
@tools/schema-parser.ts (lines 1-13: actual imports)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update CLAUDE.md manual sections</name>
  <files>CLAUDE.md</files>
  <action>
Edit ONLY the manual sections of CLAUDE.md (lines 1-104, before the first GSD block). Do NOT touch anything between GSD comment markers.

**1. Structure block (line 9-15):** Update the description table:
```
skills/        -- Claude Code skills (installed to .claude/skills/)
agents/        -- Agent definitions (installed to .claude/agents/)
directives/    -- Detailed behavioral guidelines (currently empty; guidelines are inline in CLAUDE.md)
tools/         -- Runtime tools (Deno): hash-sections, schema-bootstrap, schema-parser
docs/          -- Implementation specs, research, stack documentation
```

**2. Skills table (lines 20-24):** Update /consolidate status:
```
| `/consolidate` | Per-component spec consolidation after phase ship | Working (v2 validated) |
```

**3. Agents table (lines 28-32):** Add spec-consolidator and e2e-flows:
```
| Agent | Used By | Model |
|-------|---------|-------|
| case-briefer | /case | sonnet |
| case-validator | /case | opus |
| spec-consolidator | /consolidate | sonnet |
| e2e-flows | /consolidate | sonnet |
```

All four agent .md files exist in agents/. Models confirmed from frontmatter: case-briefer=sonnet, case-validator=opus, spec-consolidator=sonnet, e2e-flows=sonnet.
  </action>
  <verify>
    <automated>grep -c "spec-consolidator" CLAUDE.md && grep -c "e2e-flows" CLAUDE.md && grep "tools/" CLAUDE.md | head -2 && grep "Working (v2 validated)" CLAUDE.md</automated>
  </verify>
  <done>
- Agents table has 4 rows (case-briefer, case-validator, spec-consolidator, e2e-flows) with correct models
- /consolidate shows "Working (v2 validated)"
- Structure block includes tools/ and updated directives/ description
- No GSD-marked blocks were modified
  </done>
</task>

<task type="auto">
  <name>Task 2: Fix GSD source files (PROJECT.md Constraints + STACK.md dependencies)</name>
  <files>.planning/PROJECT.md, docs/STACK.md</files>
  <action>
Two GSD-synced blocks in CLAUDE.md contain inaccuracies. Fix the SOURCE files so the next GSD sync propagates correct information.

**A. PROJECT.md Constraints (line 69):**

Current: `- **Agent models**: consolidation agents use sonnet; verifier uses opus (downgrade candidate after usage data)`

The spec-verifier agent does not exist yet (it is listed under Active requirements as unchecked). Update to reflect actual state:

```
- **Agent models**: consolidation agents (spec-consolidator, e2e-flows) and case-briefer use sonnet; case-validator uses opus
```

This accurately reflects the 4 existing agents and their models without referencing a non-existent verifier.

**B. docs/STACK.md Markdown AST table (lines 15-18):**

Current lists `remark-stringify 11.0.0` as a dependency. But no tool imports remark-stringify. The actual imports are:
- `npm:unified@^11.0.0` (hash-sections.ts, schema-parser.ts)
- `npm:remark-parse@^11.0.0` (hash-sections.ts, schema-parser.ts)
- `npm:mdast-util-to-string@^4.0.0` (hash-sections.ts, schema-parser.ts)
- `npm:remark-gfm@^4.0.0` (schema-parser.ts only)
- `npm:@types/mdast@^4.0.0` (hash-sections.ts, type import)

Replace the remark-stringify row with mdast-util-to-string and add remark-gfm:

```
| `npm:mdast-util-to-string` | `4.0.0` | AST node text extraction | Extracts clean text from heading nodes for section identification. Used by hash-sections.ts and schema-parser.ts. |
| `npm:remark-gfm` | `4.0.0` | GFM table parsing | Extends remark-parse with GitHub Flavored Markdown (tables, task lists). Used by schema-parser.ts. |
```

Also update the "What NOT to Use" section (line 110) which currently says mdast-util-to-string should not be used ("Tempting for section serialization, but it strips formatting"). This is outdated -- the code actually uses it for heading text extraction (not section serialization), and remark-stringify is the one that is NOT used. Remove the mdast-util-to-string entry from "What NOT to Use" and add a remark-stringify entry explaining it is not needed since section hashing uses source slicing rather than AST round-trip serialization.

Also in the "Alternatives Considered" table (line 129), update the remark-stringify row to reflect that mdast-util-to-string is used for heading extraction and remark-stringify is not used at all.

Finally, update the STACK.md CLAUDE.md summary line. The current GSD:stack block in CLAUDE.md (line 147) reads "remark-stringify 11". This syncs from STACK.md content. After fixing STACK.md, the summary should list mdast-util-to-string instead.

**C. docs/STACK.md Agent Model table (lines 76-82):**

The table lists spec-verifier with opus. Since spec-verifier does not exist yet, add a note: "(not yet implemented)" after the spec-verifier row to avoid confusion. Do NOT remove it since IMPL-SPEC still plans for it.
  </action>
  <verify>
    <automated>grep "mdast-util-to-string" docs/STACK.md && grep "remark-gfm" docs/STACK.md && grep "spec-consolidator, e2e-flows" .planning/PROJECT.md</automated>
  </verify>
  <done>
- docs/STACK.md lists mdast-util-to-string and remark-gfm as actual dependencies
- docs/STACK.md no longer claims remark-stringify is a project dependency
- docs/STACK.md "What NOT to Use" no longer lists mdast-util-to-string
- PROJECT.md Constraints lists actual agent names and models without referencing non-existent verifier
- spec-verifier row in STACK.md agent table marked as not yet implemented
  </done>
</task>

</tasks>

<verification>
After both tasks:
1. `grep "spec-consolidator" CLAUDE.md` returns a match in the Agents table
2. `grep "e2e-flows" CLAUDE.md` returns a match in the Agents table
3. `grep "tools/" CLAUDE.md` shows the new Structure entry
4. `grep "v2 validated" CLAUDE.md` shows updated consolidate status
5. `grep "remark-stringify" docs/STACK.md` returns zero matches in the dependency table (may still appear in Alternatives Considered as "not used")
6. `grep "mdast-util-to-string" docs/STACK.md` returns matches
7. No content between GSD comment markers in CLAUDE.md was changed (diff check)
</verification>

<success_criteria>
- CLAUDE.md manual sections accurately reflect actual project state
- All 4 agents listed with correct models
- /consolidate shows validated v2 status
- Structure block includes tools/ directory
- directives/ description reflects empty state
- GSD source files corrected so next sync propagates accurate info
</success_criteria>

<output>
After completion, create `.planning/quick/260401-tgz-update-claude-md-manual-sections-to-matc/260401-tgz-SUMMARY.md`
</output>
