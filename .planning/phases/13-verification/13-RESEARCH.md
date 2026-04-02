# Phase 13: Verification - Research

**Researched:** 2026-04-02
**Domain:** Claude Code agent authoring (spec-verifier), SKILL.md orchestrator updates, test fixture design
**Confidence:** HIGH

## Summary

Phase 13 creates the spec-verifier agent (`agents/spec-verifier.md`) -- an opus-model, read-only verification agent that checks consolidated spec files for correctness, consistency, and compliance with consolidation rules. The agent is schema-parameterized: section presence checks use schema-declared sections, not hardcoded lists, and 6 historically service-specific checks are either universalized or conditionalized based on document content.

The deliverables are well-scoped: one new agent file following the established pattern (case-validator.md is the closest structural reference), one SKILL.md update (remove skip branch in Step 5, wire verifier dispatch with updated input contract), one IMPL-SPEC annotation ("Transferred to agents/spec-verifier.md"), and test fixtures to validate zero false positives on non-service projects.

All 27 decisions from CONTEXT.md are locked. The architecture is fully defined: orchestrator pre-parses schema via schema-parser.ts and passes JSON via `<schema_data>` tag, verifier receives phase CONTEXT.md path via `<phase_context_file>`, and verifier performs conditional section re-evaluation as a cross-check on the sonnet consolidator. No external dependencies beyond the existing codebase.

**Primary recommendation:** Build the agent prompt by translating IMPL-SPEC's 27 verification checks (minus dropped V-23) directly into agent instructions, applying the D-01 through D-06 universalization/conditionalization decisions to each check, and following the case-validator.md structure for frontmatter, methodology, input/output contract, and quality gate patterns.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** V-04 (schema-defined sections present) -- retain as-is, already universal. Checks against schema-declared sections.
- **D-02:** V-10 (cross-component operation references) -- universalize. Replace service-biased examples with structural placeholders. Check logic unchanged.
- **D-03:** V-11 (interface-operation mapping) -- conditionalize. Execute only when Public Interface section contains operation-to-entry mapping. Skip with reason when no mapping exists.
- **D-04:** V-15 (error identifier consistency) -- conditionalize. Execute cross-component comparison only when structured error identifiers exist in 2+ component Error Handling sections. Skip with reason when insufficient identifiers found.
- **D-05:** V-27 (schema registry match) -- retain as-is, already universal. Compares specs/ against schema component list.
- **D-06:** V-29 (E2E spec references) -- retain as-is, already conditional on E2E opt-in via schema.
- **D-07:** Orchestrator pre-parses schema via schema-parser.ts in Step 1 and passes the JSON result to verifier via `<schema_data>` dispatch tag.
- **D-08:** Add `<phase_context_file>` to input contract for V-20, V-21 automation.
- **D-09:** `<phase_cases_file>` retained for V-14 and source-document comparisons.
- **D-10:** Verifier reads current phase documents + specs/ only.
- **D-11:** Verifier performs full conditional section re-evaluation; contradictions with consolidator reported as T2.
- **D-12:** V-20 (semantic correctness) -- automated via CONTEXT.md comparison. T2.
- **D-13:** V-21 (completeness) -- automated via decision list extraction. T2.
- **D-14:** V-22 (classification accuracy) -- partially automated. T2 for mismatches, T3 for ambiguities.
- **D-15:** V-23 (case-briefer compatibility) -- dropped. Covered by existing checks.
- **D-16:** V-24 (E2E accuracy) -- human-only. Presented as checklist.
- **D-17:** Total check count is 27 (dynamic, not hardcoded).
- **D-18:** Skipped checks explicitly listed with reasons.
- **D-19:** Objective tag wording: "Check all applicable verification items".
- **D-20:** Model: opus. Fixed, no downgrade.
- **D-21:** maxTurns: removed. Not included in agent frontmatter.
- **D-22:** Tools: Read, Grep, Glob only. No Write, no Bash.
- **D-23:** Verifier agent prompt follows Phase 12.1 neutralization: structural placeholders, no service-biased examples.
- **D-24:** Validate using 3 example schemas from docs/examples/. Minimal test fixtures.
- **D-25:** Fixture scope: minimal -- enough to test skip/pass logic, not full consolidation output.
- **D-26:** SKILL.md Step 5 skip branch removed in Phase 13.
- **D-27:** IMPL-SPEC spec-verifier section gets "Transferred to agents/spec-verifier.md" comment.

### Claude's Discretion
- Agent prompt internal structure, section ordering, and wording
- Check execution order within tiers
- Finding output format details beyond the defined summary line
- XML dispatch tag naming (beyond `<schema_data>` and `<phase_context_file>` which are locked)
- Test fixture content details (component names, operation names, rule examples)

### Deferred Ideas (OUT OF SCOPE)
- Verifier model downgrade monitoring
- V-23 resurrection
- IMPL-SPEC deletion (Phase 14)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VRFY-01 | Verifier checks are parameterized against active schema (not hardcoded archetypes) | D-01 (V-04 uses schema sections), D-07 (schema data passed via `<schema_data>` tag), schema-parser.ts JSON output provides sections, components, meta for parameterization |
| VRFY-02 | Service-specific checks (V-04, V-10, V-11, V-15, V-27, V-29) are universalized or made conditional | D-01 through D-06 define the exact disposition of each check: retain (V-04, V-27, V-29), universalize (V-10), conditionalize (V-11, V-15) |
| VRFY-03 | Verifier produces no false positives on non-service projects | D-24/D-25 define validation approach: 3 example schemas (microservice, CLI, library), minimal test fixtures with 2 components each, verify skip/pass logic |
</phase_requirements>

## Standard Stack

This phase does not introduce new libraries or tools. It uses the existing cckit agent/skill authoring conventions.

### Core
| Artifact | Type | Purpose | Why Standard |
|----------|------|---------|--------------|
| `agents/spec-verifier.md` | Agent definition | Verification agent (opus, read-only) | Follows established agent pattern from case-validator.md, spec-consolidator.md |
| `skills/consolidate/SKILL.md` | Skill definition | Orchestrator Step 5 update | Existing skill, remove skip branch and wire dispatch |
| `docs/IMPL-SPEC.md` | Reference doc | Annotate as transferred | Transition document; content moves to agent file |

### Supporting
| Artifact | Type | Purpose | When to Use |
|----------|------|---------|-------------|
| `tools/schema-parser.ts` | Deno tool | Pre-parses schema for `<schema_data>` | Already exists; orchestrator invokes before verifier dispatch |
| `docs/examples/schema-*.md` | Example schemas | Basis for test fixtures | 3 project types: microservice (with type override), CLI, library |

### Alternatives Considered
None. All decisions are locked in CONTEXT.md. No alternative evaluation needed.

## Architecture Patterns

### Recommended File Structure

```
agents/
  spec-verifier.md          # NEW: opus, Read+Grep+Glob, read-only
skills/
  consolidate/
    SKILL.md                 # MODIFIED: Step 5 skip branch removed, dispatch wired
docs/
  IMPL-SPEC.md              # MODIFIED: "Transferred" annotation on spec-verifier section
tests/
  fixtures/
    verification/            # NEW: minimal spec fixtures for 3 project types
      microservice/
        specs/auth/context.md
        specs/auth/cases.md
        specs/billing/context.md
        specs/billing/cases.md
      cli/
        specs/init/context.md
        specs/init/cases.md
        specs/config/context.md
        specs/config/cases.md
      library/
        specs/parser/context.md
        specs/parser/cases.md
        specs/emitter/context.md
        specs/emitter/cases.md
```

### Pattern 1: Agent Definition Structure (YAML Frontmatter + Markdown Body)

**What:** All cckit agents follow the same structure: YAML frontmatter (name, description, tools, model) followed by a Markdown body containing mission, methodology, input contract, output contract, quality gate.

**When to use:** Always -- this is the only agent format.

**Reference:** `agents/case-validator.md` is the closest structural reference (opus, read-only, structured findings output).

Key structural elements from case-validator.md to replicate:
```
---
name: spec-verifier
description: >
  {multi-line description}
tools:
  - Read
  - Grep
  - Glob
model: opus
---

# {Agent Title}

{Mission paragraph}

## Input Contract
{XML dispatch tag table}

## Methodology / Check Descriptions
{Tiered check definitions}

## Output Contract / Return Protocol
{Return format + summary line}

## Quality Gate
{Pre-return checklist}
```

**Critical differences from IMPL-SPEC frontmatter:**
- No `maxTurns` field (D-21: removed)
- Objective tag wording uses "Check all applicable verification items" not "Check all 28" (D-19)

### Pattern 2: XML Dispatch Tags for Agent Input

**What:** Orchestrator passes structured data to agents via XML tags in the dispatch prompt.

**When to use:** Every agent dispatch in the /consolidate pipeline.

**Reference:** `agents/spec-consolidator.md` uses `<component>`, `<sections>`, `<conditional_sections>`, etc.

The spec-verifier input contract extends the IMPL-SPEC version with two new tags from CONTEXT.md decisions:

| Tag | Source | Purpose | New? |
|-----|--------|---------|------|
| `<objective>` | IMPL-SPEC | Mission statement | No (wording changed per D-19) |
| `<specs_dir>` | IMPL-SPEC | Path to specs/ root | No |
| `<index_file>` | IMPL-SPEC | Path to INDEX.md | No |
| `<phase_id>` | IMPL-SPEC | Phase being verified | No |
| `<phase_cases_file>` | IMPL-SPEC | Source CASES.md path | No (D-09 retains) |
| `<project_file>` | IMPL-SPEC | Path to PROJECT.md | No |
| `<changed_components>` | IMPL-SPEC | JSON manifest | No |
| `<e2e_dir>` | IMPL-SPEC | E2E flows directory | No |
| `<schema_data>` | D-07 | Pre-parsed schema JSON | **Yes** |
| `<phase_context_file>` | D-08 | Path to phase CONTEXT.md | **Yes** |

### Pattern 3: Tiered Findings Output

**What:** Verification findings are classified into 3 tiers plus a human-only checklist.

**When to use:** The verifier return protocol.

```
T1 (block confirmation) -- Automated, must-fix before commit
T2 (developer decides) -- Semi-automated, developer reviews
T3 (informational) -- Automated, no action required
Human-Only -- Presented as checklist, not automated
```

### Pattern 4: Conditional Check Execution

**What:** Some checks execute conditionally based on document content, not hardcoded type checks.

**When to use:** V-11 and V-15 specifically.

**V-11 (interface-operation mapping):**
- Execute only when Public Interface section contains operation-to-entry mapping (route table, method list, etc.)
- Skip with reason: "Skipped: V-11 (no interface mapping found in Public Interface section)"

**V-15 (error identifier consistency):**
- Execute cross-component comparison only when structured error identifiers found in 2+ component Error Handling sections
- Skip with reason: "Skipped: V-15 (structured error identifiers found in fewer than 2 components)"

**V-29 (E2E spec references):**
- Already conditional on `<e2e_dir>` being provided (E2E flows enabled in schema)

### Pattern 5: Conditional Section Re-evaluation (D-11)

**What:** Verifier independently re-evaluates whether conditional sections (State Lifecycle, Event Contracts) should be included/excluded, using phase CONTEXT.md + CASES.md + existing specs. If the verifier's assessment contradicts the consolidator's decision (visible via HTML comments in spec files), it reports a T2 finding.

**Why:** Consolidator runs sonnet; verifier runs opus. Higher-capability model cross-checks lower-capability model's judgment on conditional section evaluation.

**Implementation approach:**
1. Read conditional section list from `<schema_data>`
2. Read phase CONTEXT.md and CASES.md for evidence
3. Read each component's context.md to find HTML comments logging inclusion/exclusion
4. Compare verifier's independent assessment against consolidator's logged decision
5. Report contradictions as T2 findings

### Anti-Patterns to Avoid
- **Hardcoded section lists:** Never list section names in the agent prompt. Always read from `<schema_data>`.
- **Hardcoded check count:** Never say "Check all 28 items" (or any number). Use "Check all applicable verification items" (D-19).
- **Service-biased examples:** All check descriptions use structural placeholders (`[Component]`, `[OperationName]`, `[error description] (ErrorName)`). No HTTP status codes, no route paths, no API-specific terminology.
- **maxTurns in frontmatter:** Explicitly removed per D-21. Causes premature cutoff.
- **Write tool on verifier:** Agent is read-only by design (D-22). Findings returned in response, never written to files.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Schema parsing | Inline schema parsing in agent | Orchestrator pre-parses via schema-parser.ts, passes JSON in `<schema_data>` | Agent has no Bash tool; schema parser is a Deno tool; consistent with existing dispatch pattern |
| Section list resolution | Hardcoded section names in check descriptions | Read section names from `<schema_data>` JSON | Schema may have type-specific overrides; hardcoding breaks VRFY-01 |
| Hash computation | Any hash logic in verifier | E2E agent already handles hashes; verifier only checks E2E Spec References table integrity | Verifier does not compute hashes; V-29 checks that E2E references resolve to existing spec sections |

## Common Pitfalls

### Pitfall 1: IMPL-SPEC Divergence from CONTEXT.md Decisions
**What goes wrong:** IMPL-SPEC defines 28 checks with some now-stale details (V-23 included, maxTurns present, "Check all 28" wording, some service-biased language). Blindly copying IMPL-SPEC creates inconsistencies with CONTEXT.md decisions.
**Why it happens:** IMPL-SPEC was written before Phase 13 discuss. CONTEXT.md decisions override it.
**How to avoid:** Use IMPL-SPEC as the check inventory, but apply every D-01 through D-27 transformation. Cross-reference each check against CONTEXT.md before writing the agent prompt.
**Warning signs:** Agent prompt says "28 checks", mentions V-23, includes maxTurns, uses "service" language.

### Pitfall 2: Hardcoded Section Names in V-04
**What goes wrong:** V-04 checks that schema-defined sections are present in context.md. If check description lists "Overview, Public Interface, Domain Model..." it becomes hardcoded and breaks for type-override components (e.g., api-gateway type has different sections).
**Why it happens:** IMPL-SPEC describes V-04 generically, but implementation temptation is to enumerate defaults.
**How to avoid:** V-04 must read the component's resolved section list from `<schema_data>` (accounting for type overrides) and check against that list, not against any hardcoded default.
**Warning signs:** Agent prompt mentions specific section names in V-04 description.

### Pitfall 3: False Positives on Conditional Section Skip
**What goes wrong:** V-11 or V-15 fires as a finding on a CLI or library project where no interface mapping or structured error identifiers exist.
**Why it happens:** Checks are not conditionalized -- they assume all components have route tables and error identifier tables.
**How to avoid:** Per D-03 and D-04, these checks must inspect actual content before executing. If no qualifying content found, skip with explicit reason.
**Warning signs:** Running verifier against CLI fixture produces V-11 or V-15 findings.

### Pitfall 4: Test Fixture Scope Creep
**What goes wrong:** Test fixtures become full consolidation output (50+ lines per file) instead of minimal structures that test check skip/pass logic.
**Why it happens:** Desire for "realistic" test data.
**How to avoid:** Per D-25, fixtures need just enough content to exercise: (a) section presence checks, (b) conditional check skip logic, (c) basic structural checks (provenance, naming format). 10-20 lines per file is sufficient.
**Warning signs:** Fixtures contain multi-paragraph sections, detailed domain content, or complete case tables with many rows.

### Pitfall 5: Forgetting to Update SKILL.md Dispatch Tags
**What goes wrong:** Step 5 in SKILL.md dispatches the verifier but does not pass `<schema_data>` or `<phase_context_file>`, which are new tags not in the original IMPL-SPEC dispatch.
**Why it happens:** SKILL.md Step 5 currently just says "Build dispatch prompt with full XML contract" -- the specific tags are defined in the agent input contract. The new tags from D-07 and D-08 must be reflected in Step 5's dispatch logic.
**How to avoid:** When updating SKILL.md Step 5, explicitly enumerate all dispatch tags in the updated text, including the two new ones.
**Warning signs:** SKILL.md Step 5 references "IMPL-SPEC contract" without listing tags, or omits `<schema_data>` / `<phase_context_file>`.

### Pitfall 6: Mixing Up V-20/V-21 Automation Level
**What goes wrong:** V-20 and V-21 were listed as "Human-Only" in IMPL-SPEC. CONTEXT.md D-12/D-13 reclassify them as automated T2 checks. If the agent still presents them as human-only checklists, the automation improvement is lost.
**Why it happens:** Copying IMPL-SPEC classification without applying D-12/D-13 overrides.
**How to avoid:** V-20 and V-21 are now automated checks: compare CONTEXT.md decisions against spec content. V-22 is partially automated. Only V-24 remains human-only.
**Warning signs:** Agent output section has V-20 or V-21 in "Human-Only Checks" instead of "Tier 2 Findings".

## Code Examples

### Example 1: Agent Frontmatter (applying D-20, D-21, D-22)

```yaml
---
name: spec-verifier
description: >
  Verifies consolidated spec files for syntactic correctness, cross-component
  consistency, and compliance with consolidation rules. Read-only: never
  modifies spec files. Returns structured findings.
tools:
  - Read
  - Grep
  - Glob
model: opus
---
```

Note: No `maxTurns` field (D-21). Tools are Read, Grep, Glob only -- no Write, no Bash (D-22).

### Example 2: Schema Data Structure (from schema-parser.ts)

The `<schema_data>` tag carries the full JSON output of schema-parser.ts:

```json
{
  "meta": {
    "version": 1,
    "rulePrefix": "CR",
    "e2eFlows": false
  },
  "components": [
    { "name": "init", "description": "Project scaffolding...", "type": "" },
    { "name": "config", "description": "Configuration management...", "type": "" }
  ],
  "sections": {
    "default": {
      "context": [
        { "name": "Overview", "guide": "What this component does and why it exists" },
        { "name": "Public Interface", "guide": "Operations, commands, endpoints..." }
      ],
      "conditional": [
        { "name": "State Lifecycle", "condition": "component manages stateful entities with lifecycle transitions" },
        { "name": "Event Contracts", "condition": "component produces or consumes events/messages" }
      ]
    }
  }
}
```

The verifier uses `components[].type` to resolve which `sections` block applies (empty type = "default"). V-04 checks section names from the resolved block, not from a hardcoded list.

### Example 3: Conditionalized Check (V-11) Pattern

```markdown
### V-11: Interface-Operation Mapping

**Tier:** T2
**Condition:** Execute only when a component's Public Interface section contains
operation-to-entry mapping (e.g., a table mapping routes/commands to operations).
Skip when no such mapping exists.

**Check:** For each entry in the Public Interface mapping, verify the referenced
operation (`[Component].[OperationName]`) exists in the component's cases.md.

**Skip reason:** "Skipped: V-11 (no interface mapping in [component] Public Interface)"
```

### Example 4: Return Protocol (applying D-17, D-18)

```markdown
## VERIFICATION COMPLETE

### Tier 1 Findings (block confirmation)
None.

### Tier 2 Findings (developer decides)
1. V-14: auth -- 3 PRs in source CASES.md but only 2 new CRs in specs/auth/cases.md
   attributed to this phase. Missing: PR-2 (rate limit enforcement).

### Tier 3 Findings (informational)
1. V-03: config -- Operation "config.reload" uses camelCase instead of PascalCase
   ("Config.Reload" expected).

### Human-Only Checks
- [ ] V-24: Verify E2E flow steps match intended system behavior (if applicable)

### Skipped Checks
- V-11: No interface mapping found in any component's Public Interface section
- V-15: Structured error identifiers found in fewer than 2 components

Summary: Checked=24/27 Skipped=2 | T1=0 T2=1 T3=1 | Verdict: FINDINGS
```

### Example 5: SKILL.md Step 5 After Update

```markdown
## Step 5: Dispatch Spec-Verifier Agent

Build dispatch prompt for `agents/spec-verifier.md` with these XML tags:

| Tag | Required | Contents |
|-----|----------|----------|
| `<objective>` | Yes | "Verify consolidated specs for Phase {id}. Check all applicable verification items." |
| `<schema_data>` | Yes | Full JSON output from schema-parser.ts (parsed in Step 1) |
| `<specs_dir>` | Yes | Path to `specs/` directory root |
| `<index_file>` | Yes | Path to `specs/INDEX.md` |
| `<phase_id>` | Yes | Phase identifier being verified |
| `<phase_context_file>` | Yes | Path to phase CONTEXT.md |
| `<phase_cases_file>` | No | Path to source phase CASES.md. Omit for Phase 1 backfill. |
| `<project_file>` | Yes | Path to PROJECT.md |
| `<changed_components>` | Yes | JSON manifest from consolidator results |
| `<e2e_dir>` | No | Path to `specs/e2e/`. Omit if E2E flows disabled or no flows exist. |

Dispatch the spec-verifier agent. Collect return: `## VERIFICATION COMPLETE` or `## VERIFICATION FAILED`.

**Error handling:** Verifier failure -> mark "UNVERIFIED", proceed. Verifier is read-only: no rollback.
```

## Verification Check Inventory (27 Checks)

Complete reconciled check list incorporating all CONTEXT.md decisions:

### Tier 1 -- Blocks Confirmation (10 checks)

| ID | Description | CONTEXT.md Disposition |
|----|-------------|------------------------|
| V-01 | Every rule/decision entry has `(Source: Phase {id})` provenance | Unchanged |
| V-02 | No empty sections in any spec file | Unchanged |
| V-07 | INDEX.md Components table matches specs/ directory contents | Unchanged |
| V-08 | INDEX.md links resolve to existing files | Unchanged |
| V-09 | No fabricated behavioral cases (cases only from CASES.md source) | Unchanged |
| V-16 | Latest-wins applied: no duplicate operations across phases | Unchanged |
| V-17 | Forward Concerns from CASES.md not in specs/ | Unchanged |
| V-25 | GR references resolve to PROJECT.md entries | Unchanged |
| V-26 | No GR content duplication (only `See GR-XX` references) | Unchanged |
| V-29 | E2E Spec References validity | D-06: retain, already conditional on E2E opt-in |

### Tier 2 -- Developer Decides (10 checks)

| ID | Description | CONTEXT.md Disposition |
|----|-------------|------------------------|
| V-05 | CR format consistency | Unchanged |
| V-10 | Cross-component operation references resolve | D-02: universalize examples |
| V-11 | Interface-operation mapping | D-03: conditionalize (skip when no mapping) |
| V-14 | All PRs promoted to CR (delta comparison) | Unchanged |
| V-15 | Error identifier consistency across components | D-04: conditionalize (skip when < 2 components have identifiers) |
| V-18 | Backfill provenance correctness | Unchanged |
| V-20 | Semantic correctness (CONTEXT.md vs spec) | D-12: **promoted from Human-Only to automated T2** |
| V-21 | Completeness (all CONTEXT.md decisions present) | D-13: **promoted from Human-Only to automated T2** |
| V-22 | Classification accuracy (operation-component assignment) | D-14: **partially automated T2/T3** |
| V-27 | specs/ component list matches schema registry | D-05: retain, already universal |
| V-28 | CR keyword overlap detection | Unchanged |

Note: This is 11 checks in T2 but the original IMPL-SPEC had 8 T2 checks. The increase comes from V-20, V-21 promoted from Human-Only and V-22 partially promoted.

### Tier 3 -- Informational (6 checks)

| ID | Description | CONTEXT.md Disposition |
|----|-------------|------------------------|
| V-03 | Operation names follow `{Component}.{Op}` PascalCase format | Unchanged |
| V-04 | Schema-defined sections present | D-01: retain, already universal (uses `<schema_data>`) |
| V-06 | No phase-contextual content | Unchanged |
| V-12 | INDEX.md has no stale entries | Unchanged |
| V-13 | INDEX.md attribution matches provenance | Unchanged |
| V-19 | Shared type consistency across components | Unchanged |

### Human-Only (1 check)

| ID | Description | CONTEXT.md Disposition |
|----|-------------|------------------------|
| V-24 | E2E accuracy: flow steps match intended behavior | D-16: remains human-only |

### Dropped (1 check)

| ID | Description | CONTEXT.md Disposition |
|----|-------------|------------------------|
| V-23 | Case-briefer compatibility | D-15: dropped (covered by V-01, V-02, V-03, V-05, V-07, V-17) |

### Plus: Conditional Section Re-evaluation (D-11)

This is not a numbered V-check from IMPL-SPEC but a new verification behavior from CONTEXT.md. It should be integrated into the agent methodology as an additional check (or embedded within V-04's section check logic). When the verifier's independent assessment of conditional section inclusion/exclusion contradicts the consolidator's HTML comment, report as T2.

**Total: 27 numbered checks + 1 conditional section re-evaluation behavior + 1 human-only checklist item = 27 automated/semi-automated + 1 human-only.**

## State of the Art

| Old Approach (IMPL-SPEC) | Current Approach (CONTEXT.md) | Impact |
|---------------------------|-------------------------------|--------|
| 28 checks, V-23 included | 27 checks, V-23 dropped | One fewer check; V-23 verified redundant |
| V-20/V-21/V-22 human-only | V-20/V-21 automated T2, V-22 partially automated | 3 human-only checks reduced to 1 (V-24 only) |
| maxTurns: 15 in frontmatter | maxTurns removed | Prevents premature cutoff |
| "Check all 28" objective | "Check all applicable verification items" | Dynamic, not count-dependent |
| Service-biased examples in check descriptions | Structural placeholders | Technology neutral per 12.1 |
| No schema data in verifier input | `<schema_data>` tag with pre-parsed JSON | Parameterization without Bash tool |
| No phase CONTEXT.md access | `<phase_context_file>` tag | Enables V-20, V-21, conditional re-evaluation |
| No conditional section re-evaluation | Verifier cross-checks consolidator's evaluation | Opus validates sonnet's judgment |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Deno test (built-in) |
| Config file | None (uses `deno test` defaults) |
| Quick run command | `deno test --allow-read --allow-write` |
| Full suite command | `deno test --allow-read --allow-write` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VRFY-01 | Checks parameterized against schema | manual | Manual: dispatch verifier with CLI schema, verify V-04 checks CLI sections not default sections | N/A -- agent behavior, not unit-testable |
| VRFY-02 | Service-specific checks universalized/conditionalized | manual | Manual: review agent prompt for V-10 universalization, V-11/V-15 conditionalization | N/A -- prompt content review |
| VRFY-03 | Zero false positives on non-service projects | manual | Manual: dispatch verifier against CLI + library fixtures, verify no false positives | N/A -- requires live agent execution |

**Note on test type:** The spec-verifier is an LLM agent, not a Deno program. Its correctness cannot be verified via `deno test`. Validation requires running the actual `/consolidate` pipeline against test fixtures and inspecting verifier output. The test fixtures themselves are minimal spec directory structures, not Deno test files.

### Sampling Rate
- **Per task commit:** Review agent prompt against CONTEXT.md decisions
- **Per wave merge:** Run `/consolidate` against one test fixture (CLI recommended -- most likely to produce false positives)
- **Phase gate:** Full verification against all 3 fixture types with zero false positives

### Wave 0 Gaps
None -- no Deno test infrastructure needed. Fixtures are directory structures with markdown files, not code.

## Open Questions

1. **Conditional section re-evaluation numbering**
   - What we know: D-11 defines a new verification behavior not in the original V-01 through V-28 numbering. It produces T2 findings.
   - What's unclear: Should it get a new V number (e.g., V-30) or be integrated into V-04's section check? The total "27" count from D-17 does not seem to include this behavior.
   - Recommendation: Integrate into V-04 as an extended section check. V-04 already checks section presence; extending it to validate conditional section decisions is a natural grouping. This preserves the 27-check count from D-17.

2. **Test fixture INDEX.md and PROJECT.md**
   - What we know: V-07, V-08, V-12, V-13 check INDEX.md. V-25, V-26 check PROJECT.md. Fixtures need these files too.
   - What's unclear: Whether each project type fixture needs its own INDEX.md and PROJECT.md.
   - Recommendation: Include minimal INDEX.md in each fixture. A single shared minimal PROJECT.md (or one per fixture if GR references differ) suffices.

3. **Fixture location**
   - What we know: D-24 says "docs/examples/" but the schema examples already live there. Test fixtures are different artifacts (spec directory structures, not schemas).
   - What's unclear: Whether fixtures should go in `tests/fixtures/verification/` (following Deno test convention) or `docs/examples/fixtures/`.
   - Recommendation: Use `tests/fixtures/verification/` to keep test artifacts separate from documentation examples. This aligns with existing test file locations in `tools/`.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Deno | schema-parser.ts (orchestrator Step 1) | Yes | 2.7.9 | -- |

No additional external dependencies. Phase 13 creates markdown files only.

## Sources

### Primary (HIGH confidence)
- `agents/case-validator.md` -- Structural reference for opus read-only agent with tiered findings. Read in full.
- `agents/spec-consolidator.md` -- Dispatch tag pattern reference. Read in full.
- `agents/e2e-flows.md` -- Hash comparison and E2E conditional pattern. Read in full.
- `skills/consolidate/SKILL.md` -- Current Step 5 skip branch to replace. Read in full.
- `docs/IMPL-SPEC.md` -- Agent contract (lines 343-418), verification checks (lines 690-740). Read relevant sections.
- `docs/MODEL.md` -- Section structure (7+2), conditional evaluation, schema format. Read in full.
- `tools/schema-parser.ts` -- JSON output interface definitions (SchemaOutput, SchemaMeta, etc.). Read interfaces.
- `docs/examples/schema-*.md` -- All 3 example schemas read in full.
- `.planning/phases/13-verification/13-CONTEXT.md` -- All 27 decisions. Read in full.
- `.planning/phases/11-consolidation-pipeline/11-CONTEXT.md` -- D-18 (opus fixed), D-20 (error handling), D-21 (skip branch). Grep-verified.
- `.planning/phases/09-universal-model-design/09-CONTEXT.md` -- D-24/D-25 (conditional section evaluation). Grep-verified.

### Secondary (MEDIUM confidence)
- None. All findings sourced from primary project artifacts.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- No new libraries; all artifacts follow existing patterns
- Architecture: HIGH -- All decisions locked in CONTEXT.md; agent pattern well-established by 4 existing agents
- Pitfalls: HIGH -- Derived from concrete divergences between IMPL-SPEC and CONTEXT.md decisions

**Research date:** 2026-04-02
**Valid until:** Indefinite (all sources are project-internal, not version-dependent)
