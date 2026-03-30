# Phase 2: Templates - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-30
**Phase:** 02-templates
**Areas discussed:** Template content depth, Template file location, Conditional section handling, cases.md template detail, Technology neutrality, Gateway cases.md conditional, v1→v2 rename approach, Event-driven operation naming

---

## Template Content Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Schema + guide (recommended) | H2 headings + purpose description + table column schema. Consolidator understands section purpose and structures output correctly | ✓ |
| Schema only | H2 headings + 1-line description. Minimal — consolidator supplements from IMPL-SPEC | |
| Schema + guide + examples | Guide plus example content per section. Risk of example data being copied or confused with real data | |

**User's choice:** Schema + guide
**Notes:** None

---

## Template File Location

| Option | Description | Selected |
|--------|-------------|----------|
| skills/consolidate/templates/ (recommended) | IMPL-SPEC original path. Templates are consolidate-specific, not cross-skill assets | ✓ |
| templates/ (project root) | Follow Phase 1 pattern of extracting to root. Opens reuse by other skills | |
| skills/consolidate/ inline | No templates/ subdirectory, files alongside SKILL.md | |

**User's choice:** skills/consolidate/templates/
**Notes:** None

---

## Conditional Section Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Inline marker (recommended) | `## Section Name (conditional)` with guide text explaining inclusion criteria | ✓ |
| YAML metadata block | Frontmatter listing conditional sections and conditions | |
| Guide text only | Natural language explanation in section body, no structural marker | |

**User's choice:** Inline marker
**Notes:** User confirmed 3 conditional sections are sufficient (matches IMPL-SPEC exactly)

---

## cases.md Template Detail

| Option | Description | Selected |
|--------|-------------|----------|
| Full operation structure (recommended) | Example operation with SR/OR/Side Effects/Cases table using {placeholder} notation | ✓ |
| Heading pattern only | ## {Service}.{Op} and sub-section names, no table structure | |
| Archetype-specific separation | Full structure for domain/event-driven, conditional guide for gateway | |

**User's choice:** Full operation structure
**Notes:** None

---

## Technology Neutrality (user-initiated)

User raised a cross-cutting concern: all template content must be technology-neutral and generic. This affected all previously-discussed areas and the remaining ones.

**User's input:** "완전 기술 중립적이고 범용적으로 사용할 수 있어야해. 이 프로젝트의 목적 자체가 뭔지 한번 생각해보면 내가 이렇게 말하는 이유를 알겠지?"

| Option | Description | Selected |
|--------|-------------|----------|
| Abstract descriptions only (recommended) | Role-based language, no protocol/technology mentions in guide text | ✓ |
| Abstract + technology hints | Role-based with parenthetical protocol-specific notes | |

**User's choice:** Abstract descriptions only
**Notes:** User requested this principle be codified in CLAUDE.md for future AI sessions. Added "Technology Neutrality" section to CLAUDE.md with default stance, exceptions, and a concrete test.

---

## Gateway cases.md Conditional

Resolved via technology neutrality discussion. Judgment seat test criteria expressed in behavioral terms (examine state → apply rules → branch), not technology terms.

**User's choice:** Behavioral test criteria in template guide text (folded into D-12)

---

## v1→v2 Rename Approach

Resolved: templates use v2 names only. v1→v2 mapping is consolidator agent's responsibility (Phase 3).

**User's choice:** Confirmed (folded into D-13, D-14)

---

## Event-driven Operation Naming

Resolved: {Service}.On{Event} pattern per IMPL-SPEC, already technology-neutral.

**User's choice:** Confirmed (folded into D-08)

---

## Claude's Discretion

- Exact wording of guide text within each section
- Table column ordering
- Template file preamble (optional)
- Internal organization of cases.md template section

## Deferred Ideas

- Template versioning mechanism — defer to v2
- Template validation/lint tool — not required for v1
