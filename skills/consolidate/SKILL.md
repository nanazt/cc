---
name: consolidate
description: >
  Consolidate a shipped phase's decisions into per-component spec files.
  Reads schema for component registry and section structures, dispatches
  parallel consolidation agents, generates E2E flows when enabled, runs
  verification. Triggers: after ship, spec consolidation, phase completed.
argument-hint: "[phase-number]"
allowed-tools:
  - Agent
  - Bash
  - Read
  - Write
  - Glob
  - Grep
  - AskUserQuestion
disable-model-invocation: true
---

<purpose>
After a phase ships, consolidate its decisions into per-component spec files at `.planning/specs/{component}/`. Each spec file is the **current truth** about a component — latest decision wins. Use "component" throughout, never "service" in user-facing text.
</purpose>

<principles>
- **Latest decision wins.** New phase overrides prior decisions. Replace, don't append.
- **Component-centric.** Classify by component, not by phase.
- **Provenance inline.** `(Source: Phase {id})` on each entry. Git is the changelog.
- **CR referenced, never copied.** `See CR-01` only.
- **Forward Concerns stay in phase CASES.md.** Specs = confirmed decisions only.
- **Use `{Component}.{OperationName}` format.** Required for briefer grep discoverability.
</principles>

<what_to_exclude>
These are phase-contextual and do NOT belong in component specs:
- Infrastructure setup (Docker, ports, compose files)
- Testing strategy (test layers, testcontainers config, test counts)
- Discussion rationale / audit trail
- Research findings
- Planning artifacts (task decomposition, execution order)

**Report exclusions.** When presenting the summary, explicitly list what categories were excluded and why.
</what_to_exclude>

<procedure>

## Step 1: Read Phase Documents, Parse Schema, Discover Components

### 1a: Resolve phase directory

```bash
find .planning/phases -maxdepth 1 -type d -name "${PHASE}*" 2>/dev/null
```

### 1b: Parse schema

Check for `.planning/consolidation.schema.md`. If missing, offer bootstrap:

```bash
deno run --allow-read --allow-write tools/schema-bootstrap.ts .planning/consolidation.schema.md
```

After bootstrap, ask the developer to populate the Components table, then re-parse.

Parse schema via Bash:

```bash
deno run --allow-read tools/schema-parser.ts .planning/consolidation.schema.md
```

Parse the JSON stdout. Extract:
- `meta.e2eFlows` (boolean) — store for Steps 3.5/4 gating
- `meta.rulePrefix` (string, e.g. "CR") — use for rule promotion prefix
- `components[]` — component registry: `{ name, description, type }`
- `sections` — section structure map: `Record<string, { context[], conditional[] }>`

Resolve section structure per component:
- If `component.type` is non-empty → use `sections[component.type]`
- If `component.type` is empty → use `sections["default"]`

### 1c: Read phase documents (priority order — later overrides earlier)

1. `{phase_dir}/{padded}-CONTEXT.md` — primary decision source
2. `{phase_dir}/{padded}-CASES.md` — behavioral specs, rules
3. `{phase_dir}/CASE-SCRATCH.md` — only if CASES.md does not exist (pre-finalization fallback)

Also read `.planning/PROJECT.md` for GR references.

### 1d: Discover affected components

Discovery follows a 2-step algorithm (no keyword fallback):

1. Scan CASES.md (or CASE-SCRATCH.md) for `## {Component}.{Op}` heading patterns. Extract unique component names from the prefix before the dot.
2. If zero: scan CONTEXT.md for component names matching schema `components[].name`.
3. If still zero: AskUserQuestion — "Could not identify affected components. Which components does this phase affect?"

Cross-reference discovered components against schema:
- In schema → proceed
- Not in schema → AskUserQuestion: "Component '{name}' discovered in phase documents but not in schema. Add to schema?" If confirmed, add a row to the schema Components table.

### 1e: Read existing spec files

For each affected component, check `specs/{component}/context.md` and `specs/{component}/cases.md`. If they exist, read them for merge.

**Out-of-order check:** Compare existing spec's `Last consolidated: Phase {id}` against the source phase. If source is chronologically older, WARN (do not block): "Warning: {component} spec was last consolidated from a newer phase. Proceeding may overwrite newer content."

## Step 2: Dispatch Per-Component Spec-Consolidator Agents (Parallel)

For each affected component, build a dispatch prompt containing these XML tags:

| Tag | Required | Contents |
|-----|----------|----------|
| `<objective>` | Yes | "Consolidate Phase {id} decisions for {component} into specs/{component}/." |
| `<component>` | Yes | Component name (lowercase) |
| `<sections>` | Yes | JSON array of context sections from schema resolution (the `context[]` array from the resolved SectionBlock) |
| `<conditional_sections>` | Yes | JSON array of conditional sections with condition text (the `conditional[]` array). Include as `[]` if empty. |
| `<rule_prefix>` | Yes | The `meta.rulePrefix` value (e.g. "CR") |
| `<files_to_read>` | Yes | Phase CONTEXT.md, CASES.md, PROJECT.md paths |
| `<existing_spec>` | No | Path to existing specs/{component}/context.md (omit for new) |
| `<existing_cases>` | No | Path to existing specs/{component}/cases.md (omit for new) |
| `<output_context>` | Yes | `.planning/specs/{component}/context.md` |
| `<output_cases>` | Yes | `.planning/specs/{component}/cases.md` |
| `<phase_id>` | Yes | Phase identifier string |
| `<superseded_operations>` | No | JSON from CASES.md Superseded Operations table (if present) |
| `<superseded_rules>` | No | JSON from CASES.md Superseded Rules table (if present) |

Extract `<superseded_operations>` and `<superseded_rules>` from source CASES.md if those sections exist.

Dispatch all agents in parallel using the Agent tool. Collect return messages. Parse `## CONSOLIDATION COMPLETE` or `## CONSOLIDATION FAILED` from each.

**Error handling (fail-fast + selective retry):**
- If ANY agent returns `## CONSOLIDATION FAILED`: halt, report failure with context, offer:
  - **retry:** Re-dispatch the failed agent only. On retry success, proceed normally.
  - **abort:** `git checkout -- .planning/specs/`

## Step 3: Collect Results, Update INDEX.md

Parse each successful consolidator return for: component name, files written, operation count, promoted CRs (rule_prefix-N), applied supersessions.

Build `<changed_components>` manifest JSON.

Write `.planning/specs/INDEX.md` (fully rewritten each run — not surgically edited):

```markdown
# Spec Index

Last updated: {YYYY-MM-DD}

## Components

| Component | Type | Description | Files | Last Consolidated |
|-----------|------|-------------|-------|-------------------|
| {name} | {type or empty} | {description} | [context]({name}/context.md) [cases]({name}/cases.md) | Phase {id} ({date}) |

## E2E Flows

| Flow | File | Participants | Last Updated |
|------|------|-------------|--------------|
{rows if any, or "No E2E flows."}

## Operation Index

| Operation | Component | Cases Source | Phase |
|-----------|-----------|-------------|-------|
| {Component}.{Op} | {component} | [cases.md]({component}/cases.md) | {id} |
```

Type column is always displayed — leave empty for untyped components.

**Error handling:** INDEX.md write failure is non-fatal. Warn and proceed.

## Step 3.5: Identify E2E Flows (Conditional)

Check `meta.e2eFlows` from Step 1.

- **If false:** Skip Steps 3.5 and 4 entirely. Log: "E2E flows disabled in schema. Skipping."
- **If true:** Proceed with flow discovery:
  1. Scan existing `specs/e2e/` for current flow files.
  2. For each changed component, check Dependencies section for cross-component references.
  3. New flow candidates → AskUserQuestion for confirmation: "New E2E flow candidates detected: {list}. Create these? (confirm / modify / skip)"
  4. Build `<existing_flows>` and `<new_flows>` lists.

## Step 3.7: Orphan Directory Cleanup

1. Scan `specs/` for component directories not in the `<changed_components>` manifest.
2. For each, count operations in that component's spec files.
3. If 0 operations (all superseded/moved): flag as orphan candidate.
4. AskUserQuestion: "Orphan spec directories (0 operations): {list}. Remove?"
5. If confirmed: delete the directory.
6. Also offer to remove the component from the schema file. If confirmed: remove the row from the schema's Components table.

## Step 4: Dispatch E2E Flows Agent (Conditional)

Only runs if `meta.e2eFlows` was true (checked in Step 3.5).

1. Verify Deno: `which deno`. If missing: report error, mark "E2E flows: SKIPPED", continue — do NOT rollback component specs.
2. Compute section hashes for all spec files:
   ```bash
   deno run --no-lock --allow-read tools/hash-sections.ts {all spec files}
   ```
3. Parse hash JSON output: `{ files: [{ path, sections: [{ heading, hash }] }] }`.
4. Build dispatch prompt with XML tags for the e2e-flows agent (include `<existing_flows>`, `<new_flows>`, `<spec_hashes>`, `<phase_id>`).
5. Dispatch the e2e-flows agent (sequential, after Step 3).
6. Parse return.

**Error handling:** E2E agent failure does NOT rollback component spec consolidation. Mark "E2E flows: SKIPPED (agent failed)" in summary.

## Step 5: Dispatch Spec-Verifier Agent (Conditional)

<!-- Remove this skip branch once agents/spec-verifier.md exists in the agents/ directory -->

Check if `agents/spec-verifier.md` exists (use Glob).

- **Absent:** Log "Verification skipped (spec-verifier agent not yet created)". Mark output as "UNVERIFIED" in the confirmation summary.
- **Present:** Build dispatch prompt with full XML contract and dispatch the spec-verifier agent. Collect return: `## VERIFICATION COMPLETE` or `## VERIFICATION FAILED`.

**Error handling:** Verifier failure → mark "UNVERIFIED", proceed. Verifier is read-only: no rollback.

## Step 6: Present Confirmation Summary

```
Phase {id} consolidation summary:

## Components Updated
{For each updated component:}
  - {component} ({type or "default"}): context.md + cases.md
    Operations: {count} ({list})
    New CRs promoted: {count} ({rule_prefix}-{list})
    Superseded operations removed: {count} ({list})

## Components Unchanged
  - {component}: no new decisions from this phase

## E2E Flows
  - Status: {OK / SKIPPED (reason) / DISABLED}
  {if enabled: Updated, Created, Skipped lists}

## Verification
  - Status: {PASS / FINDINGS / UNVERIFIED}
  {if findings: T1/T2/T3 lists}

## Orphan Directories
  - {list or "None."}

## Excluded (phase-contextual)
  - Infrastructure, Testing, Discussion
```

Present via AskUserQuestion: "Phase {id} consolidation ready. {N} components, {N} operations, {N} findings. Confirm commit?"

If T1 findings are present, warn: "T1 (must-fix) findings detected. Review before committing."

## Step 7: Commit or Rollback

- **Confirmed:** Stage `.planning/specs/`, commit:
  `consolidate: Phase {id} -> specs/ ({component list})`
- **Rejected:** `git checkout -- .planning/specs/`. Report rollback.

</procedure>

<backfill>
When creating a NEW spec file for a component with no prior consolidated history, check whether earlier phases produced decisions about this component. If so, backfill those decisions into the new file before adding the current phase's content. Backfill applies to new files only — existing files are updated incrementally by the normal merge process.

To identify backfill candidates: scan `.planning/phases/` for CONTEXT.md and CASES.md files that reference this component by name (using `{Component}.{Op}` heading patterns). Present the list to the developer: "Earlier phase decisions found for {component}: {phase list}. Backfill these into the new spec?" Backfill each confirmed phase via a separate consolidator dispatch before processing the current phase.
</backfill>
