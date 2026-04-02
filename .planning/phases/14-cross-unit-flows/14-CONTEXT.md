# Phase 14: Cross-Unit Flows - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Validate that E2E flow generation is properly opt-in via schema flag, orchestrator correctly skips flow steps when disabled, flow agent uses universal terminology, and hash-based change detection works with the universal unit structure. Fix identified biases, structure the Dependencies section for reliable flow discovery, and clean up external IMPL-SPEC references.

**Deliverables:**
1. FLOW-01~04 test fixtures (extend existing `tests/fixtures/verification/`)
2. FLOW requirement validation via fixtures
3. Dependencies section structuring in `docs/MODEL.md`, `agents/spec-consolidator.md`, `skills/consolidate/SKILL.md` Step 3.5
4. e2e-flows.md bias fix ("HTTP call" neutralization)
5. External IMPL-SPEC reference cleanup (`docs/STACK.md`, `CLAUDE.md`)

**Not in scope:** IMPL-SPEC.md deletion (handled by `/gsd:complete-milestone`), PROJECT.md/REQUIREMENTS.md updates (milestone-level), `.planning/` internal IMPL-SPEC references (historical artifacts).

</domain>

<decisions>
## Implementation Decisions

### Validation approach
- **D-01:** FLOW-01~04 validated via test fixtures following the Phase 13 pattern. Extend existing `tests/fixtures/verification/` directory.
- **D-02:** Microservice fixture extended with `e2eFlows=true` schema and `specs/e2e/` flow file. auth->billing dependency provides natural cross-component scenario.
- **D-03:** CLI and library fixtures remain `e2eFlows=false`, used to verify skip logic (FLOW-02).

### IMPL-SPEC handling
- **D-04:** IMPL-SPEC.md is NOT deleted in Phase 14. It is archived together with other `.planning/` artifacts by `/gsd:complete-milestone`.
- **D-05:** External references to IMPL-SPEC (docs/STACK.md: 3 locations, CLAUDE.md: 1 location) are updated in Phase 14 to point to current authoritative sources.
- **D-06:** `.planning/` internal references (56 files) are left unchanged as historical artifacts. They were accurate at the time of writing; modifying them would distort history.

### Milestone boundary
- **D-07:** Phase 14 focuses exclusively on FLOW validation and identified fixes. Milestone-level cleanup (PROJECT.md, REQUIREMENTS.md, Out of Scope resolution, archiving) is handled by `/gsd:complete-milestone` as a separate workflow.

### Dependencies section structuring
- **D-08:** Dependencies section in MODEL.md gains a structured format for explicit cross-component references (e.g., `- **billing** -- payment processing for premium accounts`). Replaces free-text prose.
- **D-09:** spec-consolidator.md updated to follow structured dependency format when writing Dependencies sections.
- **D-10:** SKILL.md Step 3.5 updated to parse structured dependency entries instead of scanning natural language. Total change ~10 lines across 3 files.

### e2e-flows agent bias fix
- **D-11:** Step Table template in `agents/e2e-flows.md` line 52: `{operation or HTTP call}` changed to `{operation}`. "HTTP call" is protocol-specific bias per Phase 12.1 neutralization principle.

### E2E skip behavior
- **D-12:** SKILL.md's current "check flag -> skip if false" approach for E2E content (~30 lines) is sufficient. No need to conditionally remove E2E instructions from the skill file. Claude reads the entire skill and skips based on the flag.

### Claude's Discretion
- Exact structured dependency format syntax (bullet style, separator character)
- Test fixture content details (component names, operation names, flow narrative)
- IMPL-SPEC reference replacement text in docs/STACK.md and CLAUDE.md
- Test fixture directory organization within `tests/fixtures/verification/`

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Model specification
- `docs/MODEL.md` -- Dependencies section (#6) is the update target for structured format. Also defines the `e2e-flows` meta flag.

### Orchestrator (update target)
- `skills/consolidate/SKILL.md` -- Step 3.5 (flow discovery, update for structured deps), Step 4 (E2E dispatch, no changes needed). Also line 175 where `meta.e2eFlows` skip occurs.

### E2E flows agent (update target)
- `agents/e2e-flows.md` -- Line 52 Step Table template bias fix. Otherwise complete and universal.

### Schema tools
- `tools/schema-parser.ts` -- Line 29/77/177-178: `e2eFlows` parsing with `false` default. No changes needed.
- `tools/hash-sections.ts` -- Path-agnostic hashing. No changes needed.

### Existing test fixtures (extension target)
- `tests/fixtures/verification/microservice/` -- Extend with e2eFlows=true schema and specs/e2e/ directory.
- `tests/fixtures/verification/cli/` -- Keep e2eFlows=false for skip validation.
- `tests/fixtures/verification/library/` -- Keep e2eFlows=false for skip validation.

### External reference targets
- `docs/STACK.md` -- Lines 62, 74, 130: IMPL-SPEC references to update.
- `CLAUDE.md` -- Line 58: IMPL-SPEC mention in commit example.

### Prior phase context
- `.planning/phases/11-consolidation-pipeline/11-CONTEXT.md` -- D-16/D-17 (agent models), D-20 (error handling), pipeline structure.
- `.planning/phases/12.1-case-example-rewrite/12.1-CONTEXT.md` -- Technology neutralization principle.
- `.planning/phases/13-verification/13-CONTEXT.md` -- Test fixture design pattern, verifier decisions.

### Technology neutrality
- `CLAUDE.md` -- "Technology Neutrality" section and "Content Authoring Rules".

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `tests/fixtures/verification/microservice/`: auth + billing components with specs/, INDEX.md. Auth already has Dependencies section with cross-component reference. Direct extension target.
- `tests/fixtures/verification/cli/` and `library/`: Complete fixtures for skip validation (e2eFlows=false scenarios).
- `agents/e2e-flows.md`: Complete agent with input contract, flow format, hash comparison logic, quality gate. One bias fix needed.

### Established Patterns
- Phase 13 test fixture pattern: minimal specs/ structure per project type, structural differentiation (microservice triggers certain checks, CLI/library do not)
- `meta.e2eFlows` flag: parsed by schema-parser.ts, checked by SKILL.md Step 3.5, gates Steps 3.5 and 4
- XML dispatch tags for agent input contracts
- Hash-sections.ts path-agnostic output format: `{ files: [{ path, sections: [{ heading, hash }] }] }`

### Integration Points
- Schema file `meta.e2eFlows` -> `tools/schema-parser.ts` -> SKILL.md Step 1 -> Step 3.5 gate -> Step 4 dispatch
- SKILL.md Step 4 -> `tools/hash-sections.ts` -> `<spec_hashes>` -> `agents/e2e-flows.md`
- Dependencies section (MODEL.md #6) -> spec-consolidator writes -> SKILL.md Step 3.5 reads for flow discovery

</code_context>

<specifics>
## Specific Ideas

- Phase 12.1 technology neutralization direction is already reflected in Phase 14 artifacts. "component" terminology consistent throughout. Only one bias remaining: "HTTP call" in e2e-flows.md Step Table template.
- IMPL-SPEC.md has all content transferred to deliverables (verified: hash tool -> tools/, agents -> agents/, orchestrator -> SKILL.md, model -> MODEL.md, verifier -> spec-verifier.md). Only spec-verifier section has explicit "Transferred" marking; others are implicitly transferred.
- Dependencies structuring is a small change (~10 lines across 3 files) that makes flow discovery deterministic rather than relying on natural language parsing.
- The user prefers structured approaches over "Claude will figure it out" — explicit formatting over NLP-dependent behavior.

</specifics>

<deferred>
## Deferred Ideas

- **IMPL-SPEC.md deletion** -- Archived with `/gsd:complete-milestone`, not deleted in Phase 14.
- **Per-component Dependencies detail level** -- How much detail each dependency entry needs (just name, or name + purpose + data exchanged). Left to Claude's discretion for now; can be refined if flow quality is insufficient.

None beyond these -- discussion stayed within phase scope.

</deferred>

---

*Phase: 14-cross-unit-flows*
*Context gathered: 2026-04-02*
