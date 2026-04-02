# Phase 14: Cross-Unit Flows - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-04-02
**Phase:** 14-cross-unit-flows
**Areas discussed:** Validation scope, IMPL-SPEC cleanup, Milestone boundary, IMPL-SPEC reference cleanup, Test fixture design, e2e-flows agent review, Flow discovery mechanism, Deliverables confirmation

---

## Validation Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Test fixtures | Phase 13 pattern extension. e2eFlows=true/false scenarios. | |
| Code review only | Logical analysis only. Fast but may miss edge cases. | |
| Dry-run with example data | Actual /consolidate execution. Most thorough but expensive. | |

**User's choice:** Test fixtures (after detailed explanation of FLOW requirements and validation methods)
**Notes:** User initially asked for detailed explanation of what FLOW-01~04 actually validate before choosing method. Also confirmed that SKILL.md's ~30 lines of E2E content do not need conditional removal when e2eFlows=false -- current "check flag -> skip" approach is sufficient.

---

## IMPL-SPEC Cleanup

| Option | Description | Selected |
|--------|-------------|----------|
| Phase 14에 포함 | IMPL-SPEC deletion as Phase 14 deliverable. | |
| 별도 작업으로 분리 | FLOW only in Phase 14, IMPL-SPEC as separate task. | |

**User's choice:** Initially selected "Phase 14에 포함" but later revised to archiving with /gsd:complete-milestone (see IMPL-SPEC Reference Cleanup below).
**Notes:** User confirmed all IMPL-SPEC content has been transferred to deliverables. Only spec-verifier section has explicit "Transferred" marking.

---

## Milestone Boundary

| Option | Description | Selected |
|--------|-------------|----------|
| /gsd:complete-milestone로 분리 | Phase 14 focuses on FLOW. Milestone cleanup via dedicated workflow. | ✓ |
| Phase 14에 포함 | All milestone tasks in one phase. | |

**User's choice:** /gsd:complete-milestone로 분리
**Notes:** User asked for explanation of why recommendation changed from initial "Phase 14에 포함" to "/gsd:complete-milestone로 분리". Claude explained the shift was based on detailed analysis showing dedicated workflow provides more systematic review and lower risk of missing items.

---

## IMPL-SPEC Reference Cleanup

| Option | Description | Selected |
|--------|-------------|----------|
| 외부만 정리 | docs/STACK.md, CLAUDE.md only. .planning/ left as historical. | |
| 전부 정리 | All 56 files including .planning/. | |
| 삭제만, 참조 방치 | Delete IMPL-SPEC.md, don't update any references. | |

**User's choice:** External files only -- but revised IMPL-SPEC handling: do NOT delete in Phase 14, archive with /gsd:complete-milestone instead.
**Notes:** User was surprised by 56 .planning/ references. Claude explained IMPL-SPEC was the central design document for v2.0, making ~8 references per phase natural. User pointed out that archiving IMPL-SPEC with /gsd:complete-milestone (alongside .planning/ artifacts) is more consistent than deleting it separately. External references (docs/STACK.md: 3, CLAUDE.md: 1) still cleaned up in Phase 14.

---

## Test Fixture Design

| Option | Description | Selected |
|--------|-------------|----------|
| 기존 fixture 확장 | Extend microservice fixture with e2eFlows=true. CLI/library stay false. | ✓ |
| 별도 fixture 생성 | New tests/fixtures/e2e/ directory. Avoids touching existing fixtures. | |

**User's choice:** 기존 fixture 확장
**Notes:** Microservice fixture (auth + billing) provides natural cross-component scenario for E2E flow testing.

---

## e2e-flows Agent Review

| Option | Description | Selected |
|--------|-------------|----------|
| 수정 | Fix "HTTP call" bias in Step Table template. | ✓ |
| 유지 | Keep as-is; most cross-component communication is HTTP. | |

**User's choice:** 수정
**Notes:** Line 52 of agents/e2e-flows.md: `{operation or HTTP call}` -> `{operation}`. Single bias found; rest of agent already uses universal terminology.

---

## Flow Discovery Mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| 현재 로직 충분 | Claude parses natural language Dependencies section. User confirmation as safety net. | |
| 구조화 필요 | Structured format in Dependencies section (e.g., `- **billing** -- purpose`). | ✓ |

**User's choice:** 구조화 필요
**Notes:** User agreed structuring is correct but asked about change impact. Claude analyzed: ~10 lines across 3 files (MODEL.md, spec-consolidator.md, SKILL.md Step 3.5). User confirmed inclusion in Phase 14 scope.

---

## Deliverables Confirmation

5 deliverables confirmed:
1. FLOW-01~04 test fixtures (extend microservice with e2eFlows=true)
2. FLOW requirement validation
3. Dependencies section structuring (~10 lines, 3 files)
4. e2e-flows.md bias fix (1 location)
5. External IMPL-SPEC reference cleanup (4 locations)

Excluded from Phase 14:
- IMPL-SPEC.md deletion -> /gsd:complete-milestone
- PROJECT.md/REQUIREMENTS.md updates -> /gsd:complete-milestone
- .planning/ IMPL-SPEC references -> historical, no change

---

## Claude's Discretion

- Structured dependency format exact syntax
- Test fixture content details
- IMPL-SPEC reference replacement text
- Test fixture directory organization

## Deferred Ideas

- IMPL-SPEC.md deletion -- /gsd:complete-milestone
- Per-component dependency detail level -- refine if flow quality insufficient
