# Phase 13: Verification - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-04-02
**Phase:** 13-verification
**Areas discussed:** Check universalization strategy, Schema data flow, False-positive validation, Skip branch cleanup, 12.1 technology neutralization impact, Check count reporting, Test fixture scope, IMPL-SPEC handling, Conditional section re-evaluation, Human-only check reclassification

---

## Check Universalization Strategy (V-11)

| Option | Description | Selected |
|--------|-------------|----------|
| Conditionalize | Execute only when interface-operation mapping exists. Skip otherwise. | ✓ |
| Universalize | Rename "routes" to "interface entries", apply to all projects. | |
| Drop | Remove V-11 entirely. | |

**User's choice:** Conditionalize
**Notes:** User requested detailed explanation of all options with pros/cons before deciding. "Routes" is a web service concept; CLI tools and libraries don't have routes. Conditionalize aligns with Phase 9's behavioral condition pattern.

---

## Check Universalization Strategy (V-15)

| Option | Description | Selected |
|--------|-------------|----------|
| Conditionalize | Execute cross-comparison only when structured error identifiers exist in 2+ components. | ✓ |
| Universalize | Redefine "error categories" as "identifiable error names". | |
| Drop | Remove V-15 entirely. | |

**User's choice:** Conditionalize
**Notes:** User needed explanation that "error category table" assumes a structured format that not all project types use. Simple libraries may have prose-only Error Handling sections.

---

## Check Universalization Strategy (V-04, V-10, V-27, V-29)

| Option | Description | Selected |
|--------|-------------|----------|
| V-10 universalize, rest retain | V-10 examples replaced with placeholders. V-04, V-27, V-29 already universal. | ✓ |
| V-10 also conditionalize | Make V-10 conditional on cross-component references existing. | |

**User's choice:** V-10 universalize, rest retain
**Notes:** Straightforward -- these checks are already universal or need only example text updates.

---

## Schema Data Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Orchestrator pre-parses and passes via tag | Step 1 JSON passed as `<schema_data>` dispatch tag. | ✓ |
| Verifier calls schema-parser.ts directly | Verifier uses Bash to run parser. | |
| Verifier reads schema.md directly | LLM self-interpretation of markdown. | |

**User's choice:** Orchestrator pre-parses and passes via tag
**Notes:** User needed detailed explanation of each option. Consistent with existing spec-consolidator and e2e-flows dispatch pattern. Keeps verifier read-only (no Bash tool needed).

---

## False-positive Validation (VRFY-03)

| Option | Description | Selected |
|--------|-------------|----------|
| Example schema dry-run | Create fixtures for 3 example schemas, verify skip/pass logic. | ✓ |
| Real project test | Run on actual host project. | |
| Logic review only | Review prompt without execution. | |
| Validate at adoption | Build now, test when first used. | |

**User's choice:** Example schema dry-run
**Notes:** User confirmed after detailed explanation. Leverages existing docs/examples/ schemas.

---

## Skip Branch Cleanup

| Option | Description | Selected |
|--------|-------------|----------|
| Include in Phase 13 | Verifier creation + skip branch removal together. | ✓ |
| Separate task | Split into independent work items. | |

**User's choice:** Include in Phase 13
**Notes:** Natural pairing -- the skip branch exists specifically to be removed when verifier is created.

---

## 12.1 Technology Neutralization Impact

| Option | Description | Selected |
|--------|-------------|----------|
| Apply to verifier prompt | Structural placeholders, no service-biased examples. | ✓ |
| Not necessary | Verifier is internal tool, functional correctness sufficient. | |

**User's choice:** Apply to verifier prompt
**Notes:** Consistent with project-wide neutralization principle.

---

## Check Count Reporting

| Option | Description | Selected |
|--------|-------------|----------|
| Dynamic "Checked=N/Total, Skipped=M" | Total is dynamic, skipped checks listed with reasons. | ✓ |
| Static "28" with skip notes | Keep "28" but note skips. | |
| No skip reporting | Only show executed checks. | |

**User's choice:** Dynamic with skip listing
**Notes:** User pointed out total count may change in future updates. Wants to see what was skipped and why.

---

## Test Fixture Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal | 2 components per schema, context.md + cases.md. Test skip/pass logic. | ✓ |
| Realistic | Full consolidation output level detail. | |
| Snapshot-based | Copy real project output for microservice fixture. | |

**User's choice:** Minimal
**Notes:** Straightforward decision.

---

## IMPL-SPEC Handling

| Option | Description | Selected |
|--------|-------------|----------|
| "Transferred" comment | Add note to section header. Content retained until Phase 14 deletion. | ✓ |
| Leave as-is | No marking. File deletes after Phase 14 anyway. | |
| Delete section | Remove spec-verifier section now. | |

**User's choice:** "Transferred" comment
**Notes:** User initially asked whether IMPL-SPEC transfer completes in Phase 13. Clarified: Phase 14 (Cross-Unit Flows) is the last remaining section. Full deletion after Phase 14.

---

## Conditional Section Re-evaluation

| Option | Description | Selected |
|--------|-------------|----------|
| Phase document full re-evaluation | Read CONTEXT.md + CASES.md, independently judge conditional sections. | ✓ |
| Specs-based only re-evaluation | Judge from consolidated specs content only. | |
| HTML comment + contradiction only | Read consolidator's comment, flag only obvious contradictions. | |
| Comment existence only | Check HTML comment exists, don't evaluate content. | |
| Mandatory only | Skip conditional section validation entirely. | |

**User's choice:** Phase document full re-evaluation (with current phase scope)
**Notes:** Extensive discussion. User initially leaned toward full re-evaluation. Claude argued for specs-based limitation citing maxTurns. User corrected: maxTurns should be removed entirely (prior feedback). With that constraint gone, user confirmed full re-evaluation but scoped to current phase documents + specs/ only (not other phases).

---

## Human-only Check Reclassification (V-20~V-24)

**V-20, V-21:**

| Option | Description | Selected |
|--------|-------------|----------|
| Automate (T2) | CONTEXT.md comparison enables automation. | ✓ |
| Checklist only | Keep as human checklist. | |

**V-22:**

| Option | Description | Selected |
|--------|-------------|----------|
| Partially automate (T2/T3) | Auto-compare assignments, flag ambiguities for human. | ✓ |
| Full automate | Opus attempts all. | |
| Checklist only | Human checklist. | |

**V-23:**

| Option | Description | Selected |
|--------|-------------|----------|
| Drop | Covered by V-01, V-02, V-03, V-05, V-07, V-17. Verified redundancy. | ✓ |
| Keep | Maintain for explicitness. | |

**V-24:**

| Option | Description | Selected |
|--------|-------------|----------|
| Human check | Domain knowledge required. Present as checklist. | ✓ |
| Automate attempt | Opus best-effort as T3. | |
| Drop | Other checks cover. | |

**Notes:** Extensive discussion. User challenged multiple proposals:
1. Rejected initial "Drop V-23/V-24" -- "someone needs to judge these"
2. Rejected "human checklist for V-23" -- "you said humans can't judge this either"
3. Challenged "all automated" -- "can it really automate everything?"
4. For V-23: challenged "is dropping really safe?" -- Claude verified by tracing every case-briefer parsing dependency to an existing check
5. User insight on V-23: "shouldn't they be compatible by design?" -- confirmed MODEL.md format contract ensures compatibility, making verification redundant

---

## maxTurns

**Decision:** Remove from verifier frontmatter entirely.
**Notes:** User's prior firm decision that maxTurns is unhelpful. Claude incorrectly used maxTurns as an argument against full conditional section re-evaluation, which the user corrected. This feedback applies to all future agent definitions in cckit.

---

## Claude's Discretion

- Agent prompt internal structure, section ordering, and wording
- Check execution order within tiers
- Finding output format details beyond the defined summary line
- XML dispatch tag naming (beyond locked names)
- Test fixture content details

## Deferred Ideas

- Verifier model downgrade monitoring (track if T2 checks from V-20/V-21/V-22 rarely fire)
- V-23 resurrection if compatibility issues emerge in practice
- IMPL-SPEC deletion after Phase 14
