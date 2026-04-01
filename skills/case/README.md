# /case Skill

Behavioral case discovery through structured developer conversation. Runs before plan-phase to surface success, failure, and edge cases for each operation in a phase.

## Why It Exists

`gsd:discuss` produces design decisions (HOW — technology choices, architecture patterns), but not operation-level behavioral specifications (WHAT — inputs, outputs, error conditions, side effects). /case fills that gap. It identifies concrete operations from abstract requirements, then discovers their behavioral cases through conversation.

Without /case, the planner works from CONTEXT.md alone and behavioral coverage depends on whoever writes the plan remembering edge cases. With /case, the planner gets explicit S/F/E case tables and maps must-priority cases directly to test acceptance criteria.

## Components

The skill is a 3-agent system:

```
case-briefer (sonnet)        /case orchestrator (opus)        case-validator (sonnet)
    extracts operations  ──→    drives conversation with    ←──  cross-checks cases
    from planning docs          the developer, depth-first       against planning artifacts
         │                              │                              │
         ▼                              ▼                              ▼
    CASE-BRIEFING.md              CASE-SCRATCH.md                structured findings
                                        │                       (returned inline)
                                        ▼
                                  XX-CASES.md (final)
```

| File | Role |
|------|------|
| `.claude/skills/case/SKILL.md` | Orchestrator — the main skill that runs the conversation |
| `.claude/skills/case/step-*.md` | Step files — loaded on demand during conversation flow |
| case-briefer (subagent) | Reads CONTEXT.md/ROADMAP.md, extracts operations, scans dependency CASES.md for inherited concerns |
| case-validator (subagent) | Finds requirement gaps, decision gaps, consistency issues |

## Flow

1. **Init** — Load phase context via gsd-tools. Dispatch case-briefer to extract operations from planning documents and scan dependency phases' CASES.md for inherited concerns. Check for existing CASES.md or CASE-SCRATCH.md (resume support).

2. **Select** — Present discovered operations grouped by category. Developer picks which to discuss.

3. **Phase Rules + Inherited Concerns** — Present Phase Rules (PR) and Global Rules (GR) for confirmation. If dependency phases forwarded concerns, present them grouped by classification (behavioral, constraint, informational). Developer confirms, dismisses, or defers each.

4. **Discuss** — Depth-first per operation: anchor shared understanding, propose success cases, then systematically probe failures (input validation, auth, resource state, boundaries, concurrency, side effects, config-dependent behaviors, infrastructure). Confirmed inherited concerns are raised at the relevant operation. Each operation review is presented as an ASCII flow diagram. Each completed operation is saved to CASE-SCRATCH.md (table format) to survive context compression.

5. **Cross-Operation** — Check consistency across operations: error formats, auth patterns, event emission, cascade behavior. Consolidate configuration behaviors (CB) discovered during discussion. Identify cross-phase implications for downstream phases.

6. **Validate** — Dispatch case-validator to cross-check discovered cases against CONTEXT.md decisions, ROADMAP.md requirements, and the briefing. Developer reviews findings and incorporates confirmed gaps.

7. **Write** — Produce `{padded_phase}-CASES.md` with structured case tables, priority levels, open questions (with Forward column), and Forward Concerns section for downstream phases.

## Artifacts

All artifacts live in `.planning/phases/{padded_phase}-{name}/`:

| Artifact | Lifetime | Description |
|----------|----------|-------------|
| `CASE-BRIEFING.md` | Internal | Operation extraction from planning docs. Read by orchestrator, not edited manually. |
| `CASE-SCRATCH.md` | Internal | Per-operation case data saved during discussion. Enables resume after interruption. |
| `{padded}-CASES.md` | Downstream | Final output consumed by plan-phase and test-gen. |

The CASES.md output contains: Phase Rules (PR) + Global Rules (GR), per-operation sections (Rules, Side Effects, S/F/E case tables, Open Questions with Forward column), Forward Concerns, GR Candidates, Configuration Behaviors (CB), Cross-Operation Concerns, and Summary.

## Design Principles

**Technology-neutral.** Cases describe observable behavior ("validation error", "success"), not protocol specifics ("400 Bad Request", "201 Created"). The same CASES.md works whether the operation is exposed via REST, gRPC, CLI, or event handler.

**WHAT, not HOW.** Cases specify what the caller should observe, never implementation details. "What error does the caller see?" is in scope. "Should we use middleware for this?" is not. Exception: when the developer volunteers a specific implementation approach, it is recorded as a "Design intent:" note in Rules — preserving architectural decisions for the planner without the AI initiating implementation discussion.

**5-tier rule hierarchy.** Rules follow a scoped hierarchy: GR (Global Rules from PROJECT.md: GR-1), CR (Component Rules in specs/: CR-1), PR (Phase Rules, cross-cutting within phase: PR-1), TR (Temp Rules, phase-scoped, excluded from specs: TR-1), OR (Operation-specific: OR-1). Operations reference inherited rules via `Inherits: PR-1, GR-1` lines. When a phase-wide pattern looks global, it is flagged as a GR-candidate for PROJECT.md promotion.

**Error naming convention.** Failure case Expected Outcome includes a domain error name in parentheses after the error description: e.g., "400 Bad Request (DuplicateEmail)", "PERMISSION_DENIED (InsufficientQuota)". This names the error identity that maps to a code-level error variant. Omit only when the error is intentionally opaque.

**Propose, don't interrogate.** The orchestrator batches related probes and proposes expected cases for confirmation rather than asking twenty individual questions.

**Questions are first-class output.** When the developer says "I don't know," the answer is captured as an open question — never silently embedded as a guess. Open questions block readiness in the summary table.

## Pipeline Position

```
gsd:discuss → /case → (gsd:ui) → gsd:plan → /test-gen → gsd:execute
```

/case reads CONTEXT.md, ROADMAP.md, and dependency phases' CASES.md (for cross-phase forwarding). No implementation code, proto files, or tests exist at this point. The planner reads CASES.md downstream and maps must-priority cases to task acceptance criteria using `OperationName.S1` format.

**Cross-phase forwarding:** When a phase has dependencies (ROADMAP `Depends on`), the case-briefer automatically scans dependency CASES.md for forwarded concerns (Open Questions with `->XX` tags, Forward Concerns section entries, heuristic text matches). It also performs implicit dependency detection — if PROJECT.md states a system-wide policy (e.g., "all endpoints require authentication") and a completed phase implements it, that phase is included even without explicit `Depends on`. The briefer additionally extracts architectural context from PROJECT.md (component topology, auth policy, global rules, cross-component patterns). Inherited concerns surface for developer review before discussion begins. Priority resets at phase boundaries. Direct dependencies only.

Not every phase needs /case. Infrastructure phases, simple refactors, or time-constrained phases can skip it — the planner works from CONTEXT.md alone in that case.

## Usage

```
/case 03          # Run case discovery for phase 03
/case 12          # Run case discovery for phase 12
```

The phase number maps to a directory in `.planning/phases/`. The skill handles resume automatically if a previous session was interrupted.
