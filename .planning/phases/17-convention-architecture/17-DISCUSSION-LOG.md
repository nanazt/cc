# Phase 17: Convention Architecture - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-03
**Phase:** 17-convention-architecture
**Areas discussed:** File organization, Base ↔ Lang-specific relationship, Delta test, Convention frontmatter, Base file naming, Host installation layout, Convention content structure, Self-application, Convention dependencies, Convention size, Host override, CLAUDE.md migration, Architecture document, Directory naming, REQUIREMENTS update, Enforcement hooks, Installer discovery, Plugin manifest

---

## File Organization

| Option | Description | Selected |
|--------|-------------|----------|
| Flat siblings | skills/commit-conventions/ (base) + skills/commit-conventions-rust/ (tech pack) | |
| Nested tech packs | skills/commit/ with rust/ subdirectory | |
| Conventions directory | conventions/ separate from skills/ | ✓ |

**User's choice:** Conventions 전용 디렉토리
**Notes:** User also specified that language-specific conventions should be files within the same directory (rust.md), not separate directories.

---

## Base ↔ Language-specific Relationship

| Option | Description | Selected |
|--------|-------------|----------|
| Extend (additive) | Tech pack adds rules, no duplication | |
| Override (selective replace) | Tech pack can replace base sections | |
| Standalone (independent) | Each file fully self-contained | |

**User's choice:** Other — user questioned whether base is even necessary, leading to a separate decision about base optionality.

---

## Base Convention Optionality

| Option | Description | Selected |
|--------|-------------|----------|
| Base mandatory (ARCH-01 literal) | Every convention must have a base | |
| Base optional | Base only when delta test passes | ✓ |
| No base (tech pack only) | Remove base layer entirely | |

**User's choice:** Base 선택적
**Notes:** When base exists → additive layering. When base absent → language-specific is standalone.

---

## Convention Format (Pivotal Decision)

User raised a fundamental question: "does a convention need to be a skill?" This led to comparing Skills, Rules, and CLAUDE.md formats.

| Option | Description | Selected |
|--------|-------------|----------|
| Skills (user-invocable: false) | Research recommendation | |
| Rules (.claude/rules/) | Passive behavioral guidance format | ✓ |
| CLAUDE.md fragments | Inline in project instructions | |

**User's choice:** Rules
**Notes:** Conventions are passive guidance, not interactive workflows. Rules are the correct Claude Code mechanism.

---

## Frontmatter Design

| Option | Description | Selected |
|--------|-------------|----------|
| Installer-specific (name, type, technology, paths) | cckit custom fields | |
| Frontmatter 없음 | File/directory names encode everything | |
| Claude Code standard only (description, paths) | No custom fields | ✓ |

**User's choice:** description + paths only
**Notes:** User explicitly rejected `type` and `technology` fields ("type이랑 technology 제거하고 description으로 퉁치면안됨?"). Also corrected that Claude Code rules use `paths` not `globs`.

---

## "Tech Pack" Terminology

User found the term unappealing ("Tech Pack이라는 용어 너무 짜치는데"). With frontmatter simplified to standard fields only, the term became unnecessary. Retired across the project.

---

## Delta Test Method

| Option | Description | Selected |
|--------|-------------|----------|
| Authoring시 내장 | /convention skill self-tests during generation | ✓ |
| 별도 검증 단계 | Validator agent tests each rule post-authoring | |
| Manual review | Human judges each rule | |

**User's choice:** Authoring시 내장
**Notes:** User requested detailed pros/cons before deciding. Chose after reviewing comparison table.

---

## Base File Naming

| Option | Description | Selected |
|--------|-------------|----------|
| CONVENTION.md | Role-evident naming | ✓ |
| base.md | Short, layer-indicating | |
| {category}.md | coding.md, commit.md | |

**User's choice:** CONVENTION.md

---

## Host Installation Layout

| Option | Description | Selected |
|--------|-------------|----------|
| cckit- prefix | cckit-coding.md, cckit-coding-rust.md | ✓ |
| cckit/ subdirectory | .claude/rules/cckit/*.md | |
| No prefix | coding.md (collision risk) | |

**User's choice:** cckit- prefix

---

## Convention Content Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal template | Principles / Rules / Examples | |
| Strict template | 4 mandatory sections | |
| Free markdown | No prescribed structure | ✓ |

**User's choice:** 자유 마크다운
**Notes:** "/convention skill에서 알아서 리서치해서 최적의 형태로 작성하게해야함"

---

## Self-Application

| Option | Description | Selected |
|--------|-------------|----------|
| Installer self-run | deno run tools/install.ts --self | ✓ |
| Symlink | ln -s from conventions/ to .claude/rules/ | |
| CLAUDE.md reference | Direct reference without copying | |

**User's choice:** Installer self-run

---

## Cross-Convention Dependencies

| Option | Description | Selected |
|--------|-------------|----------|
| Independent | No cross-references between convention areas | ✓ |
| Soft reference | "Works well with X" mentions allowed | |

**User's choice:** 독립
**Notes:** Within same convention (base + lang-specific) = installed together. Between different areas = independent.

---

## Convention Size

| Option | Description | Selected |
|--------|-------------|----------|
| No limit (delta test handles it) | Natural conciseness via delta test | ✓ |
| Soft guideline (200 lines) | Recommended max, not enforced | |
| Hard limit | Enforced maximum | |

**User's choice:** 없음 — delta test가 해결

---

## Host Override

| Option | Description | Selected |
|--------|-------------|----------|
| CLAUDE.md priority | Claude Code's built-in precedence | ✓ |
| Edit installed files | Direct modification of .claude/rules/ | |
| Override files | .override.md pattern | |

**User's choice:** CLAUDE.md 우선

---

## CLAUDE.md Migration

| Option | Description | Selected |
|--------|-------------|----------|
| Migrate to conventions | Move content out of CLAUDE.md | ✓ |
| Coexist | Keep both, accept duplication | |
| Decide after conventions exist | Compare then decide | |

**User's choice:** Convention으로 마이그레이션

---

## Architecture Document Location

| Option | Description | Selected |
|--------|-------------|----------|
| docs/CONVENTIONS.md | Alongside MODEL.md, STACK.md | ✓ |
| conventions/ARCHITECTURE.md | At conventions root | |
| CLAUDE.md inline | No separate document | |

**User's choice:** docs/CONVENTIONS.md
**Notes:** "이거 문서 자체는 리서치해서 최고품질로 작성되는거지??" — confirmed research-backed.

---

## Directory Naming

| Option | Description | Selected |
|--------|-------------|----------|
| Area name directly | commit/, coding/, test/ | ✓ |
| Prefixed | base-commit/, lang-coding-rust/ | |
| Claude decides | Phase 17 executor determines | |

**User's choice:** 영역명 그대로
**Notes:** "폴더 이름 자체는 컨벤션 추가할때마다 알아서 판단해서 이름 짓게하는게나음"

---

## REQUIREMENTS Update

| Option | Description | Selected |
|--------|-------------|----------|
| CONTEXT.md only | Record in context, don't touch REQUIREMENTS | |
| REQUIREMENTS.md only | Update source of truth | |
| Both | Update REQUIREMENTS + record in CONTEXT | ✓ |

**User's choice:** 둘 다
**Notes:** "둘 다 해야 다음 페이즈에서 AI가 햇갈리지 않아할거같은데 동의해?" — agreed.

---

## Enforcement Hooks

| Option | Description | Selected |
|--------|-------------|----------|
| Convention 내부 | hooks/ subdirectory inside convention directory | ✓ |
| hooks/ 중앙 디렉토리 | Central hooks/ at project root | |
| No hooks | Guidance only, no enforcement | |

**User's choice:** Convention 내부

---

## Installer Discovery

| Option | Description | Selected |
|--------|-------------|----------|
| Directory scan | Scan conventions/ for CONVENTION.md or {lang}.md | ✓ |
| Manifest file | conventions/manifest.json | |
| Phase 20 decides | Defer to installation phase | |

**User's choice:** 디렉토리 스캔

---

## Plugin Manifest

| Option | Description | Selected |
|--------|-------------|----------|
| Not now | No .claude-plugin/ in v0.2.0 | ✓ |
| Add | Create plugin.json alongside Deno installer | |
| Phase 20 decides | Defer | |

**User's choice:** 지금은 안 함

---

## Claude's Discretion

- Architecture document internal structure
- Convention directory names for future conventions

## Deferred Ideas

None — discussion stayed within phase scope.

## Installation Decision Clarification

User confirmed that Deno remote script installation was decided during milestone creation. Research recommendation for native plugin system was noted but does NOT override the user's decision. STATE.md entry "Research recommends native Claude Code plugin system..." is a research finding, not an adopted decision.
