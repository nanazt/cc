---
name: consolidate-specs
description: >
  Use when a phase has shipped and its decisions need to be consolidated
  into per-service spec files. Triggers: after ship, spec consolidation,
  update service specs, phase completed.
argument-hint: "[phase-number]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - Edit
  - AskUserQuestion
disable-model-invocation: true
---

<purpose>
After a phase ships, consolidate its decisions into per-service spec files at `.planning/specs/{service}.md`. Each spec file is the **current truth** about a service — latest decision wins.
</purpose>

<principles>
- **Latest decision wins.** New phase overrides prior decisions. Replace, don't append.
- **Service-centric.** Classify by service, not by phase.
- **Provenance inline.** `(Source: Phase {id} D-{n})` on each entry. Git is the changelog.
- **SR referenced, never copied.** `See SR-01` only.
- **Forward Concerns stay in phase CASES.md.** Specs = confirmed decisions only.
- **Use `{Service}.{OperationName}` format.** Required for briefer grep discoverability.
</principles>

<what_to_exclude>
These are phase-contextual and do NOT belong in service specs:
- Infrastructure setup (Docker, ports, compose files)
- Testing strategy (test layers, testcontainers config, test counts)
- Discussion rationale / audit trail
- Research findings
- Planning artifacts (task decomposition, execution order)

**Report exclusions.** When presenting the summary, explicitly list what categories were excluded and why.
</what_to_exclude>

<procedure>

## Step 1: Identify Phase and Read Documents

### 1a: Resolve phase directory

```bash
find .planning/phases -maxdepth 1 -type d -name "${PHASE}*" 2>/dev/null
```

### 1b: Read phase documents (priority order — later overrides earlier)

1. `{phase_dir}/{padded}-CONTEXT.md` — primary decision source
2. `{phase_dir}/{padded}-CASES.md` — behavioral specs, rules (PR/R), error categories
3. `{phase_dir}/CASE-SCRATCH.md` — only if CASES.md doesn't exist (pre-finalization)

Also read `.planning/PROJECT.md` for SR references.

### 1c: Identify affected services

| Service | Signals |
|---------|---------|
| auth | authentication, passkey, credential, session, token, JWT, WebAuthn |
| user | user profile, handle, display name, user entity |
| catalog | book, tag, category, metadata, search |
| gateway | route, middleware, REST endpoint, HTTP, orchestration |

### 1d: Read existing spec files

For each affected service, check `specs/{service}.md`. If exists, read it for merge.

## Step 2: Write Spec Files

### Domain service template (auth, user, catalog)

```markdown
# {Service} Service Spec

Last consolidated: Phase {id} ({YYYY-MM-DD})

> System-wide rules (SR-XX) defined in PROJECT.md. Referenced, not duplicated.

## Domain Model

Entities, fields, constraints.

## Ports

Trait interfaces and method signatures.

## Business Rules

Rules governing behavior. Reference SR/PR. Include `(Source: Phase {id} D-{n})`.

## Error Categories

| Category | Identifier | Description |
|----------|-----------|-------------|

## gRPC Interface

Use `{Service}.{OperationName}` format for each operation.
Inputs, outputs, key constraints per operation.

## Configuration

Environment variables and tunable parameters.

## Cross-Service Dependencies

What this service requires from others.
```

### Gateway template

```markdown
# Gateway Service Spec

Last consolidated: Phase {id} ({YYYY-MM-DD})

> System-wide rules (SR-XX) defined in PROJECT.md. Referenced, not duplicated.

## Route Table

| Tier | Method | Path | Description | Source |
|------|--------|------|-------------|--------|

## Middleware Stack

Ordered middleware with purpose.

## Orchestration Patterns

How gateway composes backend calls.

## Error Handling

REST error format, gRPC-to-HTTP mapping.

## REST Conventions

Naming, pagination, request/response patterns.

## Configuration

Environment variables, listen address, timeouts.
```

### Classification rules

- **Include:** Domain model, ports, business rules, error categories, gRPC interface, configuration, cross-service dependencies, orchestration patterns
- **Exclude:** Infrastructure (Docker, ports), testing strategy, discussion rationale, research findings

### New vs existing spec files

**New file:** Create from template. If earlier phases had decisions about this service, backfill them.

**Existing file:** Section-level merge. For each section:
- New content from this phase → rewrite section with merged content (latest wins)
- No new content → leave unchanged

Update `Last consolidated` line.

### Update INDEX.md

For each service with operations, use this format:

```markdown
## {service}

**Spec:** [{service}.md]({service}.md)

| Operation | Cases Source | Phase |
|-----------|-------------|-------|
| {Service}.{OperationName} | `phases/{dir}/{padded}-CASES.md` | {id} |
```

**Important:** Link to finalized `CASES.md`, not `CASE-SCRATCH.md` (internal/temporary). If CASES.md doesn't exist yet (pre-/case phases), note `Phase {N} CONTEXT (predates /case)`.

## Step 3: Confirm

Present summary to developer via AskUserQuestion (one-liner for the question, detail above):

```
Phase {id} consolidation:

Services updated:
  - {service}.md: [new/updated] — sections: {list}

Services unchanged:
  - {service}.md: no new decisions from this phase

INDEX.md: {N} operations added/updated

Excluded (phase-contextual):
  - Infrastructure: Docker compose, port assignments, startup behavior
  - Testing: test layers, testcontainers config, mock strategy
  - Discussion: rationale, audit trail
```

</procedure>

<backfill>
When creating a NEW spec file, check if earlier phases had decisions about this service. Backfill those into the new file. Backfill is only for new files — existing files are updated incrementally.
</backfill>
