# Feature Landscape

**Domain:** Claude Code plugin toolkit (skills + agents for spec consolidation and behavioral case discovery)
**Researched:** 2026-03-30

## Table Stakes

Features the tool must have or it is broken. Derived from IMPL-SPEC.md requirements cross-referenced against Claude Code skill conventions and spec-driven development patterns.

### Consolidate v2 Core

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| 7-step orchestrator pipeline (SKILL.md) | Without the orchestrator, nothing dispatches. This is the skill itself. | High | Steps 1-7 as specified in IMPL-SPEC. Steps 3.5 and 3.7 are correctly scoped as sub-steps, not separate steps. |
| spec-consolidator agent | Per-service consolidation is the core value proposition. No agent = no consolidation. | High | Parallel dispatch per service. Merge rules (11 total) are where correctness lives. |
| Merge rules: operation-level replacement | Latest-wins semantics are fundamental. Without this, specs accumulate stale content. | Med | Full operation section replace, not case-level merge. Correct design -- case-level merge is fragile. |
| Merge rules: PR-to-SR promotion | Rule tier promotion is what makes specs "the current truth." Without it, rules stay phase-scoped and useless to downstream consumers. | Med | Mechanical rename + renumbering. No judgment calls -- correct. |
| Merge rules: TR exclusion | If temp rules leak into specs, consumers treat them as permanent. | Low | Simple skip. |
| Merge rules: R-to-OR transformation | Output normalization for the v2 rule tier system. Without it, mixed R/OR prefixes confuse consumers. | Low | Consolidation-time rename only. |
| Merge rules: GR reference-only | Duplicating global rules into service specs causes drift when GR changes. | Low | `See GR-XX` pattern. |
| Merge rules: provenance tagging | Without provenance, no one can trace why a decision exists or which phase introduced it. | Med | `(Source: Phase {id})` inline. Critical for auditability. |
| Merge rules: Forward Concerns exclusion | Forward Concerns are speculative. Leaking them into "current truth" specs misleads consumers. | Low | Simple exclusion. |
| INDEX.md generation | Without an index, consumers cannot discover what specs exist. | Med | Full rewrite on each run -- correct for consistency. |
| Service classification (2-step) | Orchestrator must know which services a phase affects. Wrong classification = wrong specs. | Med | Operation headings > CONTEXT.md scan > error. No keyword fallback -- correct. |
| Template archetypes (domain-service, gateway-bff) | Without templates, agents produce inconsistent section structures across services. | Med | Two archetypes needed now. Event-driven deferred (no real service exists). |
| Confirmation summary + commit/rollback | Developer must approve before changes are permanent. No silent commits. | Med | Tier 1 findings block confirmation. Rollback via `git checkout`. |
| hash-sections.ts (Deno tool) | E2E flows depend on deterministic hashing for change detection. Without it, every E2E flow rewrites every time. | Med | AST-based (unified + remark-parse). 10 test cases. First-run network requirement documented. |

### /case Skill Updates

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| PR/TR rule distinction | Consolidator cannot make PR/TR judgment calls. /case must classify before consolidation. Without this, all rules promote to SR indiscriminately. | Med | Discuss step + finalize confirmation. |
| Superseded Operations section | Without explicit supersession, stale operations persist in specs. The consolidator needs a mechanical instruction to remove them. | Med | Table format: Old Operation, Replacement, Reason. |
| Superseded Rules section | Same as above for rules. Without explicit supersession, contradicting SRs accumulate. | Low | Table format: Phase, Rule ID, Reason. |
| OR-N prefix (native) | Eliminates consolidation-time R-to-OR transform for new phases. Consistency. | Low | Output format change in /case. |

### Consumer Updates

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| case-briefer: specs/ priority lookup | After consolidation, specs/ is authoritative. Briefer must read specs/ first, phase dirs second. Without this, briefer uses stale phase data when consolidated specs exist. | Low | Lookup order change: specs/{service} > phase dirs. |
| case-validator: TR/OR recognition | Validator must not flag new rule tiers as malformed. | Low | Pattern update. |

### Infrastructure

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Test fixtures | Skills and agents need isolated, reproducible validation independent of host project state. Without fixtures, you cannot verify correctness. | Med | Separate from any host project. |
| hash-sections_test.ts | The hash tool is a correctness-critical component. 10 specified test cases cover the key edge cases. | Med | Deno test runner. |

## Differentiators

Features that improve quality or experience beyond baseline functionality. Not strictly required for v2 to work, but significantly improve the tool.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| e2e-flows agent | Cross-service flow documentation with Mermaid diagrams and hash-based change detection. Significantly aids understanding of multi-service interactions. Without it, cross-service behavior is only discoverable by reading multiple specs. | High | Depends on hash tool. Can be deferred to a later phase without breaking core consolidation. |
| spec-verifier agent (28 checks) | Catches consolidation errors before they become trusted. T1/T2/T3 tiered findings with structured output. Without it, consolidation is "trust the agent" -- still works, just riskier. | High | Opus model. 28 checks across 4 tiers. Read-only by design. |
| Orphan directory cleanup (Step 3.7) | Prevents stale service directories from accumulating after operations move between services. Nice-to-have hygiene. | Low | Developer confirmation required. Non-fatal failure. |
| Out-of-order consolidation warning | Prevents accidental data loss when consolidating phases out of sequence. Edge case but high-impact when hit. | Low | Warn-only, no block. |
| Fail-fast + selective retry | Better DX than "everything failed, start over." Retries only the failed agent, not all. | Med | Per-agent retry with full rollback on abort. |
| E2E hash-based change detection | Avoids unnecessary E2E rewrites. Without it, all E2E flows regenerate on every run (wasteful but not wrong). | Med | Compare spec hashes against existing flow's Spec References table. |
| Event-driven archetype template | Future-proofing. No real event-driven service exists yet. Template is synthesized from patterns, not validated. | Low | Defer until an event-driven service exists. Flag as unvalidated. |
| CLAUDE.md snippet template | Guides host project developers on reading priority and spec modification rules. Documentation, not functionality. | Low | One-time addition after first consolidation run. |
| Backfill strategy (Phase 1 + Phase 2) | Enables adoption in projects with existing phases. Without it, consolidation only works for future phases. | Med | Phase 1: context.md only. Phase 2: /case first, then consolidate. |

## Anti-Features

Features to explicitly NOT build. These are tempting but wrong.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Keyword-based service classification | Masks structural problems in phase documents. If operation headings and CONTEXT.md scanning both miss, the phase doc is malformed. Guessing the answer hides the problem. | 2-step classification only. On miss, error and ask developer. |
| Case-level merge (within operations) | /case produces complete per-operation specs. Merging individual cases across phases creates conflicts, ordering issues, and stale partial entries. | Operation-level replacement. Latest phase wins the entire operation section. |
| Automatic PR/TR classification | The consolidator is mechanical. It cannot make judgment calls about rule permanence. Automating this produces silent misclassification. | /case skill classifies during discuss + finalize. Human-in-the-loop. |
| Manual spec file editing (by developers) | Specs must be machine-maintained for consistency. Manual edits bypass merge rules, provenance, and verification. They drift on next consolidation. | "Never modify specs/ manually. Always use /consolidate." |
| Spec-vs-code drift detection (Layer 3) | Massively increases scope. Requires parsing proto files, code, and comparing against specs. Different problem domain (verification, not consolidation). | Deferred to future gsd:verify expansion. Separate tool. |
| GR content duplication into specs | Global rules change at the project level. Duplicating content means N+1 places to update. References (`See GR-XX`) maintain single source of truth. | Reference only. Verifier checks for accidental duplication (V-26). |
| /gsd:next integration | Manual invocation preserves developer control over when to consolidate. Auto-triggering after ship adds complexity and removes the "review before consolidate" decision point. | Developer manually runs `/consolidate {phase}` after ship. |
| Installation/distribution mechanism | Premature to solve before the core tool works. Installation method depends on whether skills are project-local, global, or symlinked. | Deferred. Current approach: symlink or copy into `.claude/`. |
| Proto/Common service handling | No shared-library service exists that needs spec consolidation. Building for hypothetical archetypes wastes effort. | Deferred. When needed, add a `template_type: none` or skip logic. |
| Persisted verifier findings | Verification findings are ephemeral -- relevant only at consolidation time. Persisting them creates stale artifacts that need their own lifecycle management. | Findings shown in confirmation summary only. Never written to file. |
| Rule tier rename migration (SR->GR, SvcR->SR) | 6+ file atomic change that is orthogonal to consolidation implementation. Bundling it risks the core deliverable. | Separate atomic task. Both renames happen together or neither. |

## Feature Dependencies

```
hash-sections.ts -----> e2e-flows agent (requires hash JSON input)
                  \---> spec-verifier (V-29 checks hash references)

spec-consolidator ----> INDEX.md update (needs consolidation results)
                  \---> e2e-flows agent (needs changed_services manifest)
                  \---> spec-verifier (needs consolidated files to verify)

/case PR/TR distinction --> spec-consolidator TR exclusion (must classify before consolidation)
/case Superseded Operations --> spec-consolidator supersession handling
/case Superseded Rules --> spec-consolidator SR skip logic

Templates (domain-service, gateway-bff) --> spec-consolidator (needs template sections)

case-briefer specs/ lookup --> spec-consolidator (specs/ must exist first)
case-validator TR/OR recognition --> /case OR-N prefix (both use new tier prefixes)

Test fixtures --> hash-sections_test.ts (hash tests need fixture markdown files)
```

**Critical path:** /case updates -> spec-consolidator -> INDEX.md -> hash tool -> e2e-flows -> spec-verifier -> confirmation

## MVP Recommendation

**Phase 1 -- Core Pipeline (table stakes):**
1. hash-sections.ts + tests (no upstream dependency, can validate independently)
2. Templates: domain-service + gateway-bff (spec-consolidator needs them)
3. spec-consolidator agent (the core value)
4. SKILL.md orchestrator (Steps 1-3, 6-7, skip 3.5/3.7/4/5)
5. /case updates: PR/TR distinction, Superseded Operations/Rules, OR-N prefix

**Phase 2 -- Verification + E2E:**
1. spec-verifier agent (28 checks)
2. e2e-flows agent
3. Orchestrator Steps 3.5, 3.7, 4, 5 (E2E flow identification, orphan cleanup, E2E dispatch, verification dispatch)

**Phase 3 -- Consumer Updates + Polish:**
1. case-briefer specs/ priority lookup
2. case-validator TR/OR recognition
3. Backfill strategy execution (Phase 1 + Phase 2 in host project)
4. CLAUDE.md snippet template

**Defer:** Event-driven template, installation mechanism, spec-vs-code drift detection, rule tier rename migration.

**Rationale:** Phase 1 delivers a working consolidation pipeline. Phase 2 adds quality gates. Phase 3 integrates with existing consumers. This ordering means you can start consolidating real phases after Phase 1 ships, with manual verification substituting for the automated verifier until Phase 2.

## Complexity Assessment

| Component | Complexity | Risk | Notes |
|-----------|------------|------|-------|
| spec-consolidator agent | High | Medium | 11 merge rules. Correctness is critical. Most complex single component. |
| e2e-flows agent | High | Medium | Mermaid generation + hash comparison. Depends on hash tool reliability. |
| spec-verifier agent | High | Low | Read-only. If it fails, consolidation still works (UNVERIFIED). |
| SKILL.md orchestrator | High | Medium | 7+2 steps, parallel dispatch, error handling, retry logic, rollback. |
| hash-sections.ts | Medium | Low | Well-specified algorithm. AST-based. 10 test cases. Deno dependency is the main risk. |
| Templates | Medium | Low | Structural. domain-service and gateway-bff are well-understood from IMPL-SPEC. |
| /case PR/TR distinction | Medium | Low | Extends existing working skill. Incremental change. |
| /case Superseded sections | Medium | Low | New output sections. Incremental. |
| Consumer updates | Low | Low | Lookup order change + pattern recognition update. |
| Test fixtures | Medium | Low | Effort but straightforward. |

## IMPL-SPEC Gap Analysis

Features specified in IMPL-SPEC that are well-designed and should be implemented as-is:
- All 11 merge rules (complete, no gaps found)
- 28 verification checks (comprehensive, tiered correctly)
- Hash tool algorithm (AST-based approach eliminates edge cases vs manual regex)
- Service classification (2-step with explicit rejection of keyword fallback)
- Return protocols for all agents (structured, parseable)
- Quality gate checklists for all agents (self-verification before return)

Potential over-engineering in IMPL-SPEC:
- **V-28 SR keyword overlap detection**: NLP-light keyword extraction for contradicting SRs is ambitious. Start with exact-match duplicate detection. Semantic overlap is T3 informational at most, not T2. LOW confidence this check fires meaningfully in practice.
- **Event-driven template**: Synthesized from patterns, not validated against a real service. Ship it as "experimental" or defer entirely. The IMPL-SPEC correctly flags this as an open question.
- **maxTurns calibration**: Correctly deferred to first real usage. No action needed now.

Potential gaps in IMPL-SPEC:
- **Error recovery for partial parallel dispatch**: IMPL-SPEC specifies fail-fast + retry for individual agents, but does not address what happens if the orchestrator itself crashes mid-pipeline (e.g., context window exhaustion during parallel dispatch). Mitigation: the orchestrator should write a `.planning/specs/.consolidation-state` breadcrumb after Step 2 completes, enabling resume on re-invocation. LOW complexity addition. MEDIUM confidence this matters in practice (context window is large but multi-service parallel dispatch is token-heavy).
- **Idempotency**: IMPL-SPEC does not explicitly state what happens if `/consolidate {phase}` is run twice for the same phase. Latest-wins semantics should make this safe (same input = same output), but worth a test fixture validating idempotent re-consolidation. LOW complexity.
- **Skill token budget**: Anthropic best practices recommend skills under 2,000 tokens. The SKILL.md orchestrator will likely exceed this significantly given the 7+2 step pipeline with error handling. This is acceptable because the orchestrator is always explicitly invoked (not auto-discovered), but worth noting. The skill content is instruction-heavy by necessity.

## Sources

- IMPL-SPEC.md (authoritative design document, `/Users/syr/Developments/cckit/docs/IMPL-SPEC.md`)
- PROJECT.md (project context, `/Users/syr/Developments/cckit/.planning/PROJECT.md`)
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
- [Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)
- [Spec-Driven Development in the Age of AI](https://medium.com/@nprasads/spec-driven-development-in-the-age-of-ai-from-specs-as-documents-to-specs-as-executable-truth-9b9e066712b1)
- [GitHub Spec Kit](https://github.com/github/spec-kit)
- [Multi-Agent Orchestration Patterns](https://www.heyuan110.com/posts/ai/2026-02-26-multi-agent-orchestration/)
