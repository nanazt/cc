# Phase 13: Verification - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Create the spec-verifier agent (`agents/spec-verifier.md`) with schema-parameterized checks that produce accurate findings on any project type. Update SKILL.md Step 5 to remove the skip branch. Validate zero false positives against non-service project types.

**Deliverables:**
- `agents/spec-verifier.md` (new) -- opus, read-only verification agent
- `skills/consolidate/SKILL.md` Step 5 update -- remove skip branch, wire verifier dispatch
- `docs/IMPL-SPEC.md` -- mark spec-verifier section as "Transferred to agents/spec-verifier.md"
- Test fixtures -- minimal specs/ structures for 3 project types (microservice, CLI, library)

**Not in scope:** E2E flow generation (Phase 14), IMPL-SPEC deletion (after Phase 14), installation mechanism.

</domain>

<decisions>
## Implementation Decisions

### Check universalization strategy (VRFY-02)
- **D-01:** V-04 (schema-defined sections present) -- retain as-is, already universal. Checks against schema-declared sections.
- **D-02:** V-10 (cross-component operation references) -- universalize. Replace service-biased examples with structural placeholders. Check logic unchanged.
- **D-03:** V-11 (interface-operation mapping) -- conditionalize. Execute only when Public Interface section contains operation-to-entry mapping. Skip with reason when no mapping exists.
- **D-04:** V-15 (error identifier consistency) -- conditionalize. Execute cross-component comparison only when structured error identifiers exist in 2+ component Error Handling sections. Skip with reason when insufficient identifiers found.
- **D-05:** V-27 (schema registry match) -- retain as-is, already universal. Compares specs/ against schema component list.
- **D-06:** V-29 (E2E spec references) -- retain as-is, already conditional on E2E opt-in via schema.

### Schema data flow
- **D-07:** Orchestrator pre-parses schema via schema-parser.ts in Step 1 and passes the JSON result to verifier via `<schema_data>` dispatch tag. Verifier does not call schema-parser.ts or read schema file directly. Consistent with spec-consolidator and e2e-flows dispatch pattern.

### Verifier input contract
- **D-08:** Add `<phase_context_file>` to input contract -- path to current phase's CONTEXT.md. Enables V-20, V-21 automation and conditional section re-evaluation.
- **D-09:** `<phase_cases_file>` retained (already exists in IMPL-SPEC contract). Provides current phase's CASES.md for V-14 and other source-document comparisons.
- **D-10:** Verifier reads current phase documents + specs/ only. No access to other phases' documents.

### Conditional section re-evaluation
- **D-11:** Verifier performs full re-evaluation of conditional sections (State Lifecycle, Event Contracts) using phase CONTEXT.md + CASES.md + consolidated specs. If verifier's assessment contradicts consolidator's inclusion/exclusion decision, report as T2 finding. Consolidator is sonnet; verifier is opus -- higher-capability model cross-checking lower-capability model's judgment.

### Human-only check reclassification
- **D-12:** V-20 (semantic correctness) -- automated. Compare CONTEXT.md decisions against spec content. T2.
- **D-13:** V-21 (completeness) -- automated. Extract decision list from CONTEXT.md, verify each is present in specs. T2.
- **D-14:** V-22 (classification accuracy) -- partially automated. Compare CASES.md operation-component assignments against spec placement. Flag mismatches as T2, remaining ambiguities as T3.
- **D-15:** V-23 (case-briefer compatibility) -- dropped. Covered by V-01 (provenance), V-02 (non-empty sections), V-03 (operation name format), V-05 (CR format), V-07 (INDEX.md match), V-17 (no Forward Concerns in specs).
- **D-16:** V-24 (E2E accuracy) -- human-only. Flow correctness requires domain knowledge that verifier cannot assess. Presented as checklist in verification output.

### Check count and reporting
- **D-17:** Total check count is 27 (original 28 minus V-23). Count is dynamic, not hardcoded -- summary reports `Checked=N/Total`.
- **D-18:** Skipped checks (conditionalized V-11, V-15, or E2E-related when E2E disabled) are explicitly listed with reasons: `Skipped: V-11 (no interface mapping), V-15 (no structured error names)`.
- **D-19:** Objective tag wording: "Check all applicable verification items" (not "Check all 28").

### Agent configuration
- **D-20:** Model: opus. Fixed assignment, no downgrade. Firm decision from Phase 11.
- **D-21:** maxTurns: removed. Not included in agent frontmatter. Does not help and can cut off verification prematurely.
- **D-22:** Tools: Read, Grep, Glob only. No Write (read-only by design), no Bash (schema data pre-parsed by orchestrator).

### Technology neutralization (12.1 alignment)
- **D-23:** Verifier agent prompt follows Phase 12.1 neutralization principle: structural placeholders in check descriptions, no service-biased examples. Check logic is universal; illustrative examples use `[Component]`, `[OperationName]`, `[error description] (ErrorName)` patterns.

### False-positive validation (VRFY-03)
- **D-24:** Validate using 3 example schemas from docs/examples/ (microservice, CLI, library). Create minimal test fixtures: 2 components per schema, each with context.md + cases.md. Verify conditionalized checks skip correctly and no false positives on non-service types.
- **D-25:** Fixture scope: minimal -- enough to test skip/pass logic, not full consolidation output.

### Skip branch cleanup
- **D-26:** SKILL.md Step 5 skip branch ("`if agents/spec-verifier.md absent → UNVERIFIED`") removed in Phase 13. Verifier creation and skip branch removal happen together.

### IMPL-SPEC handling
- **D-27:** After Phase 13, add "Transferred to agents/spec-verifier.md" comment to IMPL-SPEC spec-verifier section header. Content retained as reference until Phase 14 deletion.

### Claude's Discretion
- Agent prompt internal structure, section ordering, and wording
- Check execution order within tiers
- Finding output format details beyond the defined summary line
- XML dispatch tag naming (beyond `<schema_data>` and `<phase_context_file>` which are locked)
- Test fixture content details (component names, operation names, rule examples)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Verification design
- `docs/IMPL-SPEC.md` -- "Verification Checks (28)" section: full check definitions by tier, "Agent: spec-verifier" section: input contract, return protocol, quality gate checklist. Reference document -- V-23 is dropped and maxTurns removed per this context.

### Model specification
- `docs/MODEL.md` -- Authoritative v2 model. Section structure (7+2), rule prefix system, component discovery, conditional section evaluation. Verifier checks are parameterized against this model.

### Schema tools
- `tools/schema-parser.ts` -- Outputs structured JSON that orchestrator passes to verifier via `<schema_data>`.

### Schema examples (test fixture basis)
- `docs/examples/schema-microservice.md` -- Microservice example with section override
- `docs/examples/schema-cli.md` -- CLI example, default sections only
- `docs/examples/schema-library.md` -- Library example, default sections only

### Existing agents (pattern reference)
- `agents/case-validator.md` -- Read-only validation agent pattern (opus, Read+Grep tools). Closest structural reference for spec-verifier.
- `agents/spec-consolidator.md` -- Dispatch tag pattern (`<component>`, `<sections>`, etc.). Reference for `<schema_data>` tag design.
- `agents/e2e-flows.md` -- Hash comparison pattern. Reference for V-29 implementation.

### Orchestrator (update target)
- `skills/consolidate/SKILL.md` -- Step 5: skip branch to remove, dispatch logic to wire. Step 1: schema parsing that feeds `<schema_data>`.

### Prior phase decisions
- `.planning/phases/11-consolidation-pipeline/11-CONTEXT.md` -- D-18 (opus fixed), D-20 (error handling), D-21 (skip branch design).
- `.planning/phases/09-universal-model-design/09-CONTEXT.md` -- D-24/D-25 (conditional section evaluation by agent with HTML comment logging).
- `.planning/phases/12.1-case-example-rewrite/12.1-CONTEXT.md` -- Technology neutralization principle: structural placeholders, no domain-specific examples.

### Technology neutrality
- `CLAUDE.md` -- "Technology Neutrality" section and "Content Authoring Rules".

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `agents/case-validator.md`: Closest structural reference. Read-only opus agent with Read+Grep tools. 5-check methodology with structured findings output.
- `agents/spec-consolidator.md`: Dispatch tag pattern reference. `<component>`, `<sections>`, `<conditional_sections>` tags show how orchestrator passes structured data.
- `skills/consolidate/SKILL.md` Step 5: Existing skip branch code to replace with verifier dispatch.

### Established Patterns
- YAML frontmatter + Markdown body for agent definitions
- XML dispatch tags for agent input contracts
- Tiered findings output (T1 blocks, T2 developer decides, T3 informational)
- Orchestrator dispatches agents via Agent tool with structured prompt
- `disable-model-invocation: true` on skills to prevent autonomous triggering

### Integration Points
- `skills/consolidate/SKILL.md` Step 1 → `<schema_data>` → verifier dispatch in Step 5
- `skills/consolidate/SKILL.md` Step 5 → `agents/spec-verifier.md` (Agent dispatch)
- Verifier reads `specs/` directory (output of Steps 2-3)
- Verifier reads phase CONTEXT.md + CASES.md (source documents)
- Verifier return → orchestrator confirmation summary (Step 6)

</code_context>

<specifics>
## Specific Ideas

- Verifier is the quality gate between consolidation and commit. It catches consolidator mistakes before specs become authoritative.
- Sonnet (consolidator) writes, opus (verifier) checks -- intentional capability asymmetry for cross-validation.
- maxTurns was explicitly rejected by the user as unhelpful. Never include in agent frontmatter.
- V-23 drop was validated by tracing every case-briefer parsing dependency to an existing check. Not a shortcuts -- verified redundancy.
- Conditional section re-evaluation leverages the fact that verifier already reads phase CONTEXT.md and CASES.md. No additional file reads needed beyond what D-08/D-09 provide.
- Test fixtures are minimal by design -- they validate check skip/pass logic, not consolidation output quality.

</specifics>

<deferred>
## Deferred Ideas

- **Verifier model downgrade monitoring** -- Track whether T2 findings from V-20/V-21/V-22 fire frequently. If they rarely produce actionable findings after several runs, these specific checks could move to sonnet. The agent model (opus) stays fixed per user decision.
- **V-23 resurrection** -- If case-briefer compatibility issues emerge in practice that existing checks miss, re-evaluate adding a dedicated compatibility check.
- **IMPL-SPEC deletion** -- After Phase 14 completion, delete entire IMPL-SPEC.md file.

None -- discussion stayed within phase scope.

</deferred>

---

*Phase: 13-verification*
*Context gathered: 2026-04-02*
