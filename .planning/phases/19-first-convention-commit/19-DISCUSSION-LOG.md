# Phase 19: First Convention — Commit - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-06
**Phase:** 19-first-convention-commit
**Areas discussed:** CLAUDE.md migration, Self-application method, Execution strategy, Full review, Phase 19.1 relationship, Convention quality criteria, GSD injection implementation, Hook scope, ROADMAP modification, Phase 20 impact, Success criteria

---

## Session 1 (Original Discussion)

### Pre-Discussion: Phase Identity

| Option | Description | Selected |
|--------|-------------|----------|
| Phase 18 verify로 합치기 | Phase 19를 제거하고 verify-work 18로 검증 | |
| 그대로 진행 (deliverable 초점) | Phase 19 유지, 좋은 commit convention 만들기에 초점 | ✓ |
| 경량 실행 (/gsd-quick) | /gsd-quick으로 간단히 실행 | |

**User's choice:** 그대로 진행 (deliverable 초점)
**Notes:** User initially questioned whether Phase 19 should have been Phase 18's verify-work step. Concluded that the convention file itself is a product deliverable, not just a skill validation artifact.

---

### Project Identity (Emergent)

| Option | Description | Selected |
|--------|-------------|----------|
| GSD 사용자 전제 | cckit은 GSD workflow 사용 프로젝트 대상 | ✓ |
| Convention만 범용 | Conventions는 범용, skills는 GSD 전제 | |
| 지금은 보류 | Phase 19 scope을 넘는 논의로 보류 | |

**User's choice:** GSD 사용자 전제
**Notes:** User realized "cckit은 GSD를 사용하는 게 전제조건인 프로젝트" — fundamental shift in project identity from "any project" to "any project using GSD."

---

### Convention Content Direction

| Option | Description | Selected |
|--------|-------------|----------|
| Scope 네이밍 전략 | Scope 정하는 방법, 일관성 유지 | ✓ |
| Commit 단위/입도 | 적절한 커밋 크기, atomic commit | ✓ |
| Subject/body 품질 규칙 | Subject 길이, 동사 형태, body의 why-first | ✓ |
| Research에 위임 | Researcher가 조사 후 사용자가 판단 | ✓ |

**User's choice:** All four — content areas identified but final details delegated to researcher
**Notes:** GSD reference prohibition rule must be included explicitly in the convention

---

### GSD Reference Rule Expression

| Option | Description | Selected |
|--------|-------------|----------|
| 범용적 표현 | "프로젝트 관리 메타데이터를 커밋에 넣지 마라"로 추상화 | |
| GSD 명시적 언급 | GSD phase/plan ID를 직접 언급하여 금지 | ✓ |
| Convention 외부에서 처리 | cckit CLAUDE.md에만 두고 convention에는 미포함 | |

**User's choice:** GSD 참조 금지 (explicit GSD mention)
**Notes:** cckit targets GSD users, so direct mention is appropriate without technology-neutral abstraction

---

### Delta Test Baseline

| Option | Description | Selected |
|--------|-------------|----------|
| 엄격하게 | Claude가 이미 아는 것 모두 제거, 프로젝트-특화 규칙만 | ✓ |
| 적당히 | 기초는 제거하되 자주 틀리는 규칙은 강화로 유지 | |
| 느슨하게 | 완전한 참조 문서 역할 | |

**User's choice:** 엄격하게
**Notes:** Empty convention (all rules filtered) is a valid and honest outcome

---

### Empty Convention Risk

| Option | Description | Selected |
|--------|-------------|----------|
| 그게 맞는 결과 | 불필요 판단 자체가 유효한 deliverable | ✓ |
| Scope 네이밍은 반드시 포함 | Claude가 scope을 잘 못하는 건 경험적 사실 | |
| 최소 5개 규칙 보장 | 너무 적으면 기준 느슨하게 조정 | |

**User's choice:** 그게 맞는 결과
**Notes:** Success criteria redefined as "useful convention OR justified determination that one isn't needed"

---

### Execution Strategy (Original)

| Option | Description | Selected |
|--------|-------------|----------|
| 단일 plan | Plan 1개: /convention commit 실행 | |
| 2-plan | Plan 01: convention 실행, Plan 02: PROJECT.md 업데이트 | |
| 3-plan | 준비 + 실행 + 검증 | |

**User's choice:** Custom — PROJECT.md 업데이트 + convention commit 실행 + self-application (검증은 verify-work에서)
**Notes:** Verification not included in plan — handled by /gsd-verify-work after execution. Two plans: (1) PROJECT.md update, (2) /convention commit + self-application.

---

## Session 2 (Context Update)

### CLAUDE.md Migration

| Option | Description | Selected |
|--------|-------------|----------|
| Phase 19에서 즉시 마이그레이션 | Convention 생성 후 CLAUDE.md에서 commit rules 제거 | |
| Phase 20 installer 이후로 보류 | Convention 파일만 생성, CLAUDE.md는 installer가 self-apply 할 때 정리 | ✓ |
| 중복 허용 (최소화) | CLAUDE.md는 최소한의 pointer만 남기고 convention 파일로 상세 내용 이동 | |

**User's choice:** Phase 20 installer 이후로 마이그레이션 보류
**Notes:** Convention file is created but CLAUDE.md commit section stays as-is until Phase 20

---

### Self-Application Method

| Option | Description | Selected |
|--------|-------------|----------|
| Self-apply 생략 | Convention 파일만 생성, cckit 자체 적용은 Phase 20 이후 | ✓ |
| 수동 복사 | conventions/commit/CONVENTION.md → .claude/rules/cckit-commit.md 수동 복사 | |
| Symlink | conventions/commit/CONVENTION.md에서 .claude/rules/로 symlink 생성 | |

**User's choice:** Self-apply 생략
**Notes:** Phase 19 focuses purely on convention file creation

---

### Execution Strategy (Revised — Initial)

| Option | Description | Selected |
|--------|-------------|----------|
| 단일 Plan | PROJECT.md + /convention commit 한번에 | ✓ |
| 2-Plan 유지 (범위 수정) | Plan 01: PROJECT.md, Plan 02: /convention commit (self-apply 제거) | |
| 3-Plan | Plan 01: PROJECT.md, Plan 02: /convention commit, Plan 03: 품질 검증 | |

**User's choice:** 단일 Plan (추천)
**Notes:** User requested trade-off analysis before deciding. Chose single plan after seeing self-apply and CLAUDE.md migration both removed.

---

### Phase 19.1 Relationship

| Option | Description | Selected |
|--------|-------------|----------|
| 19 끝나면 19.1로 순차 진행 | Phase 19는 convention만, 19.1이 GSD 통합 처리 | |
| 19.1을 19에 통합 | GSD commit injection을 Phase 19 내에서 함께 처리 | ✓ |
| 19.1 삭제/보류 | GSD 통합은 Phase 20 이후로 보류 | |

**User's choice:** 19.1을 19에 통합
**Notes:** Plan structure revised from single plan to 2-plan to accommodate injection work

---

### Execution Strategy (Revised — Final)

| Option | Description | Selected |
|--------|-------------|----------|
| 단일 Plan 유지 | PROJECT.md + /convention commit + GSD injection 모두 하나의 plan | |
| 2-Plan (권장) | Plan 01: PROJECT.md + /convention commit, Plan 02: GSD injection 구현 | ✓ |
| 3-Plan | Plan 01: PROJECT.md, Plan 02: /convention commit, Plan 03: GSD injection | |

**User's choice:** 2-Plan (권장)
**Notes:** 19.1 integration necessitated returning to 2-plan structure

---

### Convention Quality Criteria

| Option | Description | Selected |
|--------|-------------|----------|
| ROADMAP criteria로 충분 | 4개 기존 criteria | |
| 실용성 기준 추가 | cckit 자체 commit에 적용 시 실제 도움이 되는지 | ✓ |
| 간결성 기준 추가 | 규칙 수가 적절한지 | ✓ |
| 예제 품질 기준 추가 | 예제가 구체적이고 실제 도움이 되는지 | ✓ |

**User's choice:** All three additional criteria
**Notes:** Added as D-06 in updated context

---

### GSD Injection Mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Agent prompt injection | GSD executor/planner agent prompt에 convention 내용 주입 | |
| Commit hook validation | gsd-tools commit에 convention 검증 단계 추가 | ✓ |
| 둘 다 | Agent 인지 + commit 시점 검증 | |

**User's choice:** Commit hook validation
**Notes:** User clarified the real mechanism: Claude Code hook detects commit commands → injects convention content → AI becomes aware of conventions. Not agent-level prompt modification.

---

### Convention Violation Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| 경고만 | Convention 위반 경고하지만 commit 진행 | |
| 차단 + 이유 설명 | Convention 위반 시 commit 차단, 위반 규칙 설명 | ✓ |
| 자동 수정 | Convention에 맞게 commit message 자동 수정 후 commit 진행 | |

**User's choice:** 차단 + 이유 설명
**Notes:** AI sees denial reason and fixes the message

---

### Hook Implementation Approach

| Option | Description | Selected |
|--------|-------------|----------|
| 기존 hook 확장 | validate-commit-scope.sh 확장 | |
| 새 hook 분리 | 새로운 inject-convention.sh 생성 | |
| Research에 위임 | Plan 02 researcher가 Claude Code hook API 조사 후 결정 | ✓ |

**User's choice:** Research에 위임
**Notes:** Direction recorded (PreToolUse hook, convention injection), details left to researcher

---

### Hook Detection Scope

| Option | Description | Selected |
|--------|-------------|----------|
| git commit만 | AI 직접 git commit만 감지 | |
| git commit + gsd-tools commit | 둘 다 감지 | ✓ |
| gsd-tools commit만 | gsd-tools commit만 감지 | |

**User's choice:** git commit + gsd-tools commit 둘 다
**Notes:** User noted "둘 다 하는게 일관적". Clarified that injection must happen BEFORE execution (PreToolUse), since post-execution injection is meaningless for git commit.

---

### Hook Validation Scope

Mechanically verifiable (hook enforces):
- Conventional Commits format
- Scope pattern (no phase numbers)
- Subject line length
- Allowed type list
- GSD reference prohibition patterns

Not mechanically verifiable (convention awareness only):
- Subject/body semantic quality
- Scope appropriateness
- Commit granularity/atomicity

**User's choice:** Confirmed this split — "기계적으로 검증할 수 있는 부분만 검증해야해"

---

### ROADMAP Modification Scope

| Option | Description | Selected |
|--------|-------------|----------|
| 맞음, 이대로 | 19.1 제거 + Phase 19 설명/기준/Plan 수 업데이트 | ✓ |
| ROADMAP 수정은 Plan에서 | Context에 결정만 기록, 실제 수정은 planning/execution | |
| 다른 범위 | 추가 수정 사항 있음 | |

**User's choice:** 맞음, 이대로
**Notes:** ROADMAP changes: remove Phase 19.1, update Phase 19 description/criteria/plan count

---

### Phase 20 Impact Recording

| Option | Description | Selected |
|--------|-------------|----------|
| Deferred Ideas에 기록 | Phase 20이 처리해야 할 사항을 deferred ideas로 남김 | ✓ |
| Context에 명시적 섹션 | Phase 20 영향을 별도 섹션으로 명시 | |
| 기록 불필요 | Phase 20은 자체 discuss에서 처리 | |

**User's choice:** Deferred Ideas에 기록
**Notes:** Self-apply, CLAUDE.md migration, hook installation all deferred to Phase 20

---

### Success Criteria

Updated to 8 criteria:
1. Convention file at correct location with proper frontmatter
2. Real value — commit structure, scope, message quality rules
3. ARCH-03 delta test passed
4. Technology-neutral
5. GSD commit injection hook operational (mechanical validation + convention injection)
6. Practicality — actually helpful for cckit commits
7. Conciseness — appropriate number of rules
8. Example quality — concrete and genuinely helpful

**User's choice:** Confirmed as appropriate

---

## Claude's Discretion

- Convention internal structure (section ordering, grouping) — determined by /convention skill's generator
- Research depth and sources — determined by convention-researcher agent
- Hook implementation specifics — determined by Plan 02 researcher
- Self-application method (deferred to Phase 20)

## Deferred Ideas

- Self-application infrastructure (installer) — Phase 20
- CLAUDE.md commit rules migration — Phase 20
- Convention hook installation to host projects — Phase 20
- Discuss workflow improvement: checkpoint should persist before phase directory creation
- "Technology-neutral" redefinition across all project docs — broader scope than Phase 19
