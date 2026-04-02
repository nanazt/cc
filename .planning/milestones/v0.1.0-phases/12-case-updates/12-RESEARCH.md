# Phase 12: /case Updates - Research

**Researched:** 2026-04-01
**Domain:** Claude Code skill/agent prompt engineering -- vocabulary migration, feature additions
**Confidence:** HIGH

## Summary

Phase 12 is a prompt-engineering phase: all deliverables are Markdown files (skills, agents, docs) with no runtime code changes. The changes fall into four categories: (1) vocabulary migration from v1 service-biased terms to v2 universal terms, (2) addition of PR/TR rule classification interaction during discussion, (3) addition of supersession metadata support in CASES.md output, and (4) specs/ priority lookup for the case-briefer agent.

The existing codebase is well-structured with clear separation between skill steps and agent definitions. The v1 patterns (AskUserQuestion for developer interaction, conditional sections in CASES.md output, inline detection + finalize review for CB) provide direct templates for the new TR and supersession features. No external dependencies, no runtime tooling, no code compilation -- purely text editing of prompt files.

**Primary recommendation:** Execute as a series of mechanical term replacements followed by targeted feature additions. Each deliverable file can be treated independently. The existing CB (Configuration Behaviors) pattern in step-discuss.md and step-finalize.md is the proven template for both TR classification and supersession detection.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: All rules default to PR (permanent). TR (temporary) is the exception, not the default.
- D-02: Claude autonomously judges rule content and proposes TR classification. No hardcoded detection patterns in skill text.
- D-03: Developer can also initiate TR classification directly ("this is temporary").
- D-04: TR detection occurs at 3 points: Step 2.5 (Phase Rules confirmation), mid-discussion (per-operation), and finalize TR review pass.
- D-05: Finalize includes a dedicated TR review pass as safety net. Skipped if no TR rules exist.
- D-06: Inline detection during per-operation discussion + finalize guard step (Supersession Review, conditional). Same pattern as CB.
- D-07: Table format per IMPL-SPEC: Superseded Operations (`Old Operation | Replacement | Reason`) and Superseded Rules (`Phase | Rule ID | Reason`).
- D-08: Sections omitted from CASES.md when empty (conditional, like CB section).
- D-09: OR-N native in /case output. R1 becomes OR-1. No consolidation-time transform.
- D-10: All rule prefixes unified with consistent format -- dash + number, NO padding anywhere.
- D-11: Overrides Phase 9 D-11 GR-XX (zero-padded) format. All prefixes now GR-N style.
- D-12: Inherits line format: `Inherits: PR-1, GR-1` (consistent no-padding style).
- D-13: specs/ lookup applies to current phase operations only. case-briefer checks `specs/{component}/cases.md` first.
- D-14: spec = existing consolidated state (historical). Phase dir CONTEXT.md = current phase changes. Two distinct sources.
- D-15: When no specs/ exists, briefer uses phase directories only. Silent fallback.
- D-16: Briefer flags "this operation exists in spec but has new decisions in current phase" without merging.
- D-17: Mechanical acceptance only for case-validator: TR-N, OR-N as valid prefixes; supersession sections as valid.
- D-18: No format enforcement (no v1 vs v2 detection), no intelligent TR content validation.
- D-19: Existing 5 checks (A-E) updated with v2 prefix regex. No new check categories.
- D-20: Phase 12 performs 1:1 term replacement: service->component, SR->GR, {Service}->{Component}, cross-service->cross-component, etc.
- D-21: Full example rewrite deferred to separate phase.
- D-22: Phase Rules section: PR-N and TR-N distinguished by prefix only. List structure maintained.
- D-23: Superseded Operations and Superseded Rules sections placed after Phase Rules / Global Rules, before first Operation section. Conditional -- omitted when empty.
- D-24: "SR Candidates" section renamed to "GR Candidates".
- D-25: "System Rules" label in Phase Rules section renamed to "Global Rules".
- D-26: Briefer does NOT distinguish TR. Classifies as GR-candidate, PR-candidate, or OR-specific only.
- D-27: Step 4.5 classification: SR-candidate->GR-candidate, R->OR (mechanical rename).
- D-28: MODEL.md Rule System table updated to reflect GR-N (no-padding) format.

### Claude's Discretion
- Exact wording of TR proposal prompts during discussion
- Order of 1:1 term replacements across files
- Internal organization of changes within each deliverable file
- Whether to batch or sequence file updates during execution

### Deferred Ideas (OUT OF SCOPE)
- Full /case example rewrite (project-type-agnostic beyond term replacement) -- separate phase after Phase 12
- Per-component section overrides -- deferred from Phase 9
- Spec-vs-code drift detection -- deferred to future gsd:verify expansion
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CASE-01 | /case skill contains no service-biased language or assumptions | Term replacement inventory (complete list below); all 6 skill/agent files audited |
| CASE-02 | case-briefer uses "component topology" instead of "service topology" | 5 service-biased references in case-briefer.md identified at specific line numbers |
| CASE-03 | /case produces PR/TR-classified rules (permanent vs temporary) | TR interaction pattern documented; mirrors existing CB pattern from step-discuss.md |
| CASE-04 | CASES.md includes Superseded Operations table when applicable | IMPL-SPEC superseded_operations contract verified; table format matches D-07 |
| CASE-05 | CASES.md includes Superseded Rules table when applicable | IMPL-SPEC superseded_rules contract verified; table format matches D-07 |
| CASE-06 | Rules use OR-N prefix natively | R->OR-N replacement mapped across all skill files; Inherits line format updated |
| CASE-07 | case-validator accepts TR-N, OR-N and recognizes supersession sections | Validator already technology-neutral; only prefix regex and section recognition additions needed |
| CASE-08 | case-briefer reads `specs/{unit}/cases.md` first, falling back to phase directories | New Step 1 substep for briefer; silent fallback when no specs/ exists |
</phase_requirements>

## Architecture Patterns

### Deliverable File Map

All changes are edits to existing Markdown files. No new files are created.

```
skills/case/
  SKILL.md           -- Rule tier conventions, canonical example, formatting section
  step-init.md       -- briefer dispatch, minor terminology
  step-discuss.md    -- Step 2.5 Phase Rules, mid-discussion PR promotion, SR-candidate discovery
  step-finalize.md   -- CASES.md output format template, cross-operation concerns
  README.md          -- 3-tier rule hierarchy description, artifact listing

agents/
  case-briefer.md    -- Component topology, specs/ lookup, GR/PR/OR classification
  case-validator.md  -- TR-N/OR-N prefix acceptance, supersession section recognition

docs/
  MODEL.md           -- Rule System table: GR-XX -> GR-N
```

### Change Category Map

Each deliverable receives changes from 1-4 of these categories:

| Category | Files Affected | Complexity |
|----------|---------------|------------|
| Term replacement (v1->v2 vocabulary) | SKILL.md, step-init.md, step-discuss.md, step-finalize.md, README.md, case-briefer.md | Low -- mechanical find/replace |
| Rule prefix unification (R->OR-N, SR->GR, padding removal) | SKILL.md, step-discuss.md, step-finalize.md, README.md, case-briefer.md, MODEL.md | Low -- mechanical find/replace |
| TR classification (new feature) | step-discuss.md, step-finalize.md, SKILL.md | Medium -- new interaction flow, mirrors CB pattern |
| Supersession metadata (new feature) | step-discuss.md, step-finalize.md, SKILL.md | Medium -- new interaction flow, mirrors CB pattern |
| specs/ priority lookup (new feature) | case-briefer.md | Medium -- new Step 1 substep |
| Validator v2 acceptance | case-validator.md | Low -- regex update + section list |

### Pattern: CB-Style Inline Detection + Finalize Guard

The existing Configuration Behaviors (CB) pattern in step-discuss.md (3c-vii) and step-finalize.md (4d) is the template for both TR classification and supersession detection:

1. **Inline detection** during per-operation discussion (Claude notices a signal)
2. **Capture internally** with a working label
3. **Consolidation** at finalize with developer review
4. **Conditional section** in CASES.md output (omit when empty)

For TR: Claude notices a rule is temporary (D-02), proposes TR classification, developer confirms. At finalize, TR review pass presents all TR-classified rules for final confirmation (D-05).

For Supersession: Claude notices restructuring signals internally (D-06). At finalize, Supersession Review presents detected supersessions. Same conditional pattern as CB.

### Pattern: AskUserQuestion for All Developer-Facing Decisions

All confirmation, decision, and review questions use the AskUserQuestion tool. This is already established and must be maintained for TR proposals, supersession confirmation, and finalize review passes.

### Anti-Patterns to Avoid
- **Mixing term replacement with feature additions in the same edit pass:** Keep vocabulary migration edits separate from structural additions for reviewability.
- **Adding new CASES.md sections without the conditional omission rule:** Superseded Operations, Superseded Rules, and TR review all follow the same pattern -- omit when empty, just like CB and Forward Concerns.
- **Duplicating GR content into specs/:** The GR-N rule references use `See GR-N` notation only. Never copy rule content. This is unchanged from v1.

## Term Replacement Inventory

### Complete Replacement Table

Verified by grep across all files in scope. Each row lists the v1 term, v2 replacement, and exact files/lines where it appears.

| v1 Term | v2 Term | Files Affected |
|---------|---------|---------------|
| `R1, R2, R3` (operation rules) | `OR-1, OR-2, OR-3` | SKILL.md (L118, L145), step-discuss.md (L80, L280), step-finalize.md (L65, L197-199), README.md (L68) |
| `Inherits: PR1, PR2, SR-01` | `Inherits: PR-1, PR-2, GR-1` | SKILL.md (L120, L148), step-discuss.md (L81, L281), step-finalize.md (L200) |
| `SR-01, SR-02` (system-wide rules) | `GR-1, GR-2` (global rules) | SKILL.md (L147-150), step-discuss.md (L15-16, L59-65, L81, L84), step-finalize.md (L181, L183-185, L200, L265), README.md (L40, L60, L68, L84), case-briefer.md (L71, L75, L167, L211-215, L282) |
| `System Rules` (label) | `Global Rules` (label) | step-discuss.md (L5, L14, L84), step-finalize.md (L183), README.md (L40, L60) |
| `SR Candidates` (section) | `GR Candidates` (section) | step-discuss.md (L65), step-finalize.md (L265), README.md (L60) |
| `SR-candidate` (classification) | `GR-candidate` (classification) | step-discuss.md (L59, L62), case-briefer.md (L69, L71) |
| `Per SR-XX` (derivation prefix) | `Per GR-N` (derivation prefix) | SKILL.md (L150), step-finalize.md (L181) |
| `Overrides SR-XX:` (override format) | `Overrides GR-N:` (override format) | SKILL.md (L149) |
| `Service topology` | `Component topology` | case-briefer.md (L33) |
| `Cross-service interaction patterns` | `Cross-component interaction patterns` | case-briefer.md (L36) |
| `cross-service` (in decision tree) | `cross-component` | case-briefer.md (L130) |
| `{Service}.{OperationName}` | `{Component}.{OperationName}` | case-briefer.md (L79) |
| `Service.Operation` (in table) | `Component.Operation` | case-briefer.md (L178) |
| `service contract` | `component contract` | case-briefer.md (L45, L130) |
| `All services/phases` (scope text) | `All components/phases` | case-briefer.md (L71, L215) |
| `GR-XX` (zero-padded global rule) | `GR-N` (no-padding) | MODEL.md (L136, L392) |
| `GR-01` (example) | `GR-1` (example) | MODEL.md (L136) |
| `system-wide rule (all services, all phases)` | `global rule (all components, all phases)` | step-discuss.md (L61) |

### case-validator.md: No Term Replacements Needed

The case-validator is already technology-neutral. Grep confirms zero matches for "service", "Service", "SR-", or "SR" as a word boundary. Only additions needed: TR-N and OR-N prefix acceptance, supersession section recognition.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| TR interaction pattern | New interaction paradigm | Existing CB inline-detect + finalize-review pattern | Proven, developer already familiar, same UX flow |
| Supersession interaction pattern | New review mechanism | Existing CB consolidation pattern (4d) | Same conditional section pattern, same "omit when empty" rule |
| Rule prefix regex | Complex regex for all prefix variants | Simple `(GR\|CR\|OR\|PR\|TR)-\d+` pattern | All prefixes now follow identical format (D-10) |

## Common Pitfalls

### Pitfall 1: Inconsistent Prefix Formats After Migration
**What goes wrong:** Some occurrences of the old format (R1, PR1, SR-01) survive in examples, canonical patterns, or edge cases, creating contradictory instructions.
**Why it happens:** The old format appears in multiple files across different contexts (examples, conventions text, template output). Grep-only auditing may miss dynamic references.
**How to avoid:** After each file edit, run a comprehensive grep for old-format patterns (`R\d` not preceded by O/P/T/C/G, `SR-\d`, `PR\d` not followed by dash). Verify every canonical example and template block.
**Warning signs:** Mixed prefix styles in the same file (e.g., `OR-1` in conventions text but `R1` in the canonical example).

### Pitfall 2: Missing Conditional Omission for New Sections
**What goes wrong:** Superseded Operations/Rules sections appear as empty tables in CASES.md output when no supersessions exist, cluttering the document.
**Why it happens:** The "omit when empty" pattern is easy to describe in the finalize step but requires explicit instruction text telling the orchestrator to check and skip.
**How to avoid:** Follow the exact same pattern as CB and Forward Concerns sections -- both have explicit "Omit this section if [none discovered]" instructions in the output format template.
**Warning signs:** The new section headings appear in the output format without conditional omission notes.

### Pitfall 3: Briefer specs/ Lookup Scope Creep
**What goes wrong:** The briefer reads specs/ for dependency phases too, not just the current phase's component, leading to noise in the briefing.
**Why it happens:** D-13 explicitly scopes the lookup to "the current phase's operations only" but the implementation prompt may not enforce this clearly.
**How to avoid:** The briefer's new Step 1 substep must explicitly state: "For each component referenced in THIS phase's CONTEXT.md, check specs/{component}/cases.md. Do NOT read specs/ for dependency phases."
**Warning signs:** The briefer prompt mentions specs/ without scoping it to the current phase.

### Pitfall 4: TR Classification Ambiguity Between Briefer and Protester
**What goes wrong:** The briefer starts proposing TR classifications, contradicting D-26 which reserves TR judgment for the Protester.
**Why it happens:** The boundary between GR/PR/OR classification (briefer's job per D-26/D-27) and TR classification (Protester's job) is subtle.
**How to avoid:** The briefer's Step 4.5 must explicitly state it classifies constraints as GR-candidate, PR-candidate, or OR-specific only. The text "TR judgment is the Protester's responsibility" should appear as a constraint.
**Warning signs:** Any mention of "TR" or "temporary" in the briefer's classification logic.

### Pitfall 5: GR-XX Surviving in MODEL.md While Being GR-N in /case
**What goes wrong:** MODEL.md still says GR-XX (zero-padded) but /case says GR-N (no-padding), creating contradictory authoritative sources.
**Why it happens:** D-28 explicitly requires MODEL.md update but only for the Rule System table. Other MODEL.md references (Merge Rules section) also use GR-XX.
**How to avoid:** Update ALL GR-XX references in MODEL.md, not just the Rule System table. The merge rules text at L392 also references GR-XX.
**Warning signs:** Grep for `GR-XX` in MODEL.md returns any matches after the edit.

## Feature Addition Details

### TR Classification Mechanism

Three interaction points, all following "Claude proposes, developer confirms" pattern:

**Point 1: Step 2.5 (Phase Rules confirmation)**
- After presenting Phase Rules, Claude reviews each and may propose: "PR-3 looks temporary (only needed during migration). Classify as TR-3?"
- Developer confirms or rejects
- This is the same Step 2.5 flow, just with an additional classification check

**Point 2: Mid-discussion (per-operation)**
- During step-discuss.md per-operation probing, when a new rule is discovered
- Claude proposes: "This sounds temporary -- classify as TR-N instead of OR-N?"
- Same interaction pattern as mid-discussion PR promotion (step-discuss.md L53-65)

**Point 3: Finalize TR review pass (step-finalize.md)**
- New step between existing cross-operation checks and validation
- Presents all TR-classified rules for final confirmation
- Skipped entirely when no TR rules exist (D-05)
- Template: same as CB consolidation (step 4d)

**CASES.md output format change:**
- Phase Rules section lists both PR-N and TR-N entries. Distinguished by prefix only (D-22).
- No subsections, no tables -- same list format as current Phase Rules.

### Supersession Detection Mechanism

**Inline detection (step-discuss.md):**
- During per-operation discussion, Claude watches for restructuring signals: operation renamed, split, merged, moved, or removed
- Captured internally (not surfaced mid-discussion)
- This mirrors CB detection in 3c-vii

**Finalize guard step (step-finalize.md):**
- New step 4f: Supersession Review
- Conditional -- skipped when no restructuring detected
- Presents detected supersessions as tables matching IMPL-SPEC contract:
  - Superseded Operations: `Old Operation | Replacement | Reason` (types: Renamed, Split, Merged, Moved, Removed)
  - Superseded Rules: `Phase | Rule ID | Reason`
- Developer confirms/edits

**CASES.md output format change:**
- Two new conditional sections placed after Phase Rules / Global Rules, before first Operation section (D-23)
- Omitted when empty (D-08)

### specs/ Priority Lookup for case-briefer

**New substep in briefer Step 1:**
1. Extract component names from current phase's CONTEXT.md
2. For each component, check if `specs/{component}/cases.md` exists
3. If exists: read it and summarize existing operations for reference
4. If not exists: silent fallback to phase directories only (D-15)

**New output section in CASE-BRIEFING.md:**
- When spec exists: note which operations are already consolidated
- Flag operations that exist in spec AND have new decisions in current phase (D-16)
- Do NOT merge spec content with phase content -- they are distinct sources (D-14)

### case-validator Updates

**Prefix regex update (D-19):**
- Current implicit regex recognizes: R-N, PR-N (v1 formats)
- Updated regex: `(GR|CR|OR|PR|TR)-\d+` (all v2 prefixes, no padding)
- Applied across all 5 checks (A-E)

**Section recognition additions:**
- Superseded Operations recognized as valid CASES.md section
- Superseded Rules recognized as valid CASES.md section
- These sections are valid but optional (no gap reported when absent)

## Code Examples

### TR Classification Prompt (Step 2.5 addition)

```markdown
After presenting Phase Rules for confirmation, review each rule's content:

If a rule describes behavior that is explicitly temporary, migration-only, or
development-only (e.g., "use mock SMTP during development", "maintain v1 compatibility
until migration completes"), propose TR classification:

  This rule sounds temporary: PR-3 "[rule text]"
  Reclassify as TR-3? TR rules are excluded from consolidated specs.

Developer can confirm (reclassifies to TR-3) or reject (stays as PR-3).
```

### Supersession Review (Finalize step addition)

```markdown
### 4f: Supersession review

If restructuring was detected during per-operation discussion (operations renamed,
split, merged, moved, or removed), present a supersession summary:

  I detected these structural changes:

  Superseded Operations:
  | Old Operation | Replacement | Reason |
  |---|---|---|
  | Component.OldOp | Component.NewOp | Renamed |

  Superseded Rules:
  | Phase | Rule ID | Reason |
  |---|---|---|
  | 8 | PR-2 | Replaced by PR-1 in this phase |

  Confirm these supersession entries? Any to add, remove, or adjust?

If no restructuring was detected, skip this step silently (same as CB when none exist).
```

### specs/ Lookup (Briefer Step 1 addition)

```markdown
### Step 1.5: Check consolidated specs (current phase only)

For each component referenced in this phase's CONTEXT.md:
1. Check if `specs/{component}/cases.md` exists
2. If yes: read it and note existing operations, their rules and case counts
3. If no: proceed with phase directories only (no warning, no fallback message)

When a spec exists:
- Include an "Existing Spec State" section in the briefing for that component
- Note: "Operation {Component.Op} exists in spec with {N} rules, {M} cases"
- If CONTEXT.md has decisions affecting this operation, flag: "Operation exists in spec
  but current phase has new decisions affecting it"

This lookup applies ONLY to the phase being discussed. Do NOT read specs/ for
dependency phases -- those are handled by Step 4.7 (Inherited Concerns).
```

### Updated Rule Tier Conventions (SKILL.md)

```markdown
**Rule tier conventions:**
- `OR-1, OR-2, OR-3` -- operation-specific rules (dash, no padding)
- `PR-1, PR-2, PR-3` -- phase-wide permanent rules (dash, no padding)
- `TR-1, TR-2, TR-3` -- phase-wide temporary rules (excluded from specs at consolidation)
- `GR-1, GR-2` -- global rules in PROJECT.md (dash, no padding)
- `CR-1, CR-2` -- component rules in specs/ (dash, no padding; promoted from PR at consolidation)
- Operation Rules reference Phase/Global Rules via `Inherits: PR-1, PR-2, GR-1` line
- Override format: `Overrides GR-N: [what changes] ([justification])`
- `Per GR-N` prefix when a Phase Rule derives from a Global Rule
```

### Updated Canonical Example (SKILL.md)

```
Rules:
  - OR-1: constraint not in diagram
  - OR-2: another constraint. Design intent: developer's proposed approach
  - Inherits: PR-1, PR-2, GR-1
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SR (Service Rule) prefix | CR (Component Rule) and GR (Global Rule) prefixes | Phase 9 (2026-03-31) | All rule references must use new prefixes |
| GR-XX (zero-padded) | GR-N (no-padding) | Phase 12 D-11 (overrides Phase 9 D-11) | MODEL.md and all /case references updated |
| R1, R2 (operation rules) | OR-1, OR-2 (operation rules) | Phase 12 D-09 | Native OR-N in /case output |
| PR1 (no dash) | PR-1 (with dash) | Phase 12 D-10 | All prefixes unified: dash + number |
| Service topology (briefer) | Component topology (briefer) | Phase 12 D-20 | 1:1 term replacement |
| No TR classification | PR/TR distinction | Phase 12 D-01 through D-05 | New interaction flow during discussion |
| No supersession tracking | Superseded Operations/Rules tables | Phase 12 D-06 through D-08 | New CASES.md sections |
| No specs/ lookup in briefer | specs/ priority lookup | Phase 12 D-13 through D-16 | New briefer substep |

**Deprecated/outdated:**
- `R1, R2, R3` format: replaced by `OR-1, OR-2, OR-3`
- `SR-01, SR-02` format: replaced by `GR-1, GR-2`
- `PR1, PR2` format: replaced by `PR-1, PR-2`
- `SR Candidates` section: renamed to `GR Candidates`
- `System Rules` label: renamed to `Global Rules`

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Manual verification (prompt engineering files, no runtime code) |
| Config file | None -- no automated test framework applies |
| Quick run command | `grep -rn 'SR-\|SR \|{Service}\|service topology\| R[0-9]' skills/case/ agents/case-briefer.md agents/case-validator.md` (should return 0 matches) |
| Full suite command | Manual review of each deliverable against CONTEXT.md decisions |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CASE-01 | No service-biased language in /case skill | grep-audit | `grep -rni 'service\b' skills/case/ \| grep -v 'cross-component'` | N/A (verification command) |
| CASE-02 | "component topology" in case-briefer | grep-verify | `grep -n 'component topology' agents/case-briefer.md` | N/A |
| CASE-03 | PR/TR classification in discuss+finalize | manual | Read step-discuss.md and step-finalize.md for TR interaction flow | N/A |
| CASE-04 | Superseded Operations table in finalize output format | manual | Read step-finalize.md output format template | N/A |
| CASE-05 | Superseded Rules table in finalize output format | manual | Read step-finalize.md output format template | N/A |
| CASE-06 | OR-N prefix native | grep-verify | `grep -n 'OR-[0-9]' skills/case/SKILL.md` | N/A |
| CASE-07 | case-validator accepts TR-N, OR-N + supersession sections | manual | Read agents/case-validator.md for prefix list and section recognition | N/A |
| CASE-08 | case-briefer specs/ lookup | manual | Read agents/case-briefer.md Step 1 for specs/ substep | N/A |

### Sampling Rate
- **Per task commit:** Run quick grep commands to verify no old-format terms survive
- **Per wave merge:** Full manual review of all deliverables against CONTEXT.md decisions
- **Phase gate:** All grep audits return 0 matches for old terms; manual review confirms all 8 requirements

### Wave 0 Gaps
None -- no test infrastructure needed. Verification is grep-based audit + manual review of prompt text.

## Open Questions

1. **MODEL.md GR-XX scope beyond Rule System table**
   - What we know: D-28 says "MODEL.md Rule System table updated to reflect GR-N format." MODEL.md also uses GR-XX in the Merge Rules section (L392).
   - What's unclear: Should the Merge Rules section also be updated, or just the Rule System table?
   - Recommendation: Update ALL GR-XX references in MODEL.md for consistency. The D-28 text says "Rule System table" but leaving contradictory GR-XX elsewhere in the same file creates confusion. This falls under Claude's discretion for internal organization.

2. **IMPL-SPEC.md GR-XX references**
   - What we know: IMPL-SPEC.md has 6 GR-XX references. IMPL-SPEC is listed as a canonical reference for supersession table format but is NOT in the deliverable list.
   - What's unclear: Should IMPL-SPEC.md GR-XX references be updated in Phase 12?
   - Recommendation: Do NOT update IMPL-SPEC.md. It is not in the deliverable list and Phase 13 (Verification) will likely touch it. Flag for Phase 13 planning.

3. **README.md scope**
   - What we know: README.md contains multiple SR references and old rule hierarchy description. It is NOT explicitly listed in the CONTEXT.md deliverables.
   - What's unclear: Whether README.md should be updated as part of the vocabulary migration.
   - Recommendation: Update it. README.md is part of the /case skill package and contains service-biased language that violates CASE-01. The deliverable list says "skills/case/SKILL.md (update)" but the skill package includes README.md. Omitting it would leave contradictory content in the same directory.

## Sources

### Primary (HIGH confidence)
- `/Users/syr/Developments/cckit/skills/case/SKILL.md` -- Full source read, line-level grep audit
- `/Users/syr/Developments/cckit/skills/case/step-init.md` -- Full source read
- `/Users/syr/Developments/cckit/skills/case/step-discuss.md` -- Full source read, line-level grep audit
- `/Users/syr/Developments/cckit/skills/case/step-finalize.md` -- Full source read, line-level grep audit
- `/Users/syr/Developments/cckit/skills/case/README.md` -- Full source read, line-level grep audit
- `/Users/syr/Developments/cckit/agents/case-briefer.md` -- Full source read, line-level grep audit
- `/Users/syr/Developments/cckit/agents/case-validator.md` -- Full source read, confirmed zero service-biased terms
- `/Users/syr/Developments/cckit/docs/MODEL.md` -- Full source read, GR-XX locations identified
- `/Users/syr/Developments/cckit/docs/IMPL-SPEC.md` -- Partial read, superseded table contracts verified
- `/Users/syr/Developments/cckit/.planning/phases/12-case-updates/12-CONTEXT.md` -- All 28 decisions analyzed
- `/Users/syr/Developments/cckit/.planning/phases/09-universal-model-design/09-CONTEXT.md` -- Phase 9 rule prefix decisions verified

### Secondary (MEDIUM confidence)
- None -- all findings verified against source files

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no external dependencies; pure text editing of existing Markdown files
- Architecture: HIGH -- all patterns (CB inline detect, AskUserQuestion, conditional sections) already exist in codebase and were directly verified
- Pitfalls: HIGH -- complete grep audit of all files identifies every instance needing change; patterns are mechanical

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (stable -- no external dependencies that could change)
