# Phase 18: /convention Skill - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-04
**Phase:** 18-convention-skill
**Areas discussed:** Authoring workflow, Research strategy, D-01 boundary revisit, Agent architecture, Delta test mechanics, Cross-project portability, Convention preview/review, Library comparison format, Tech-neutrality check, Preference collection, Edge cases, Multi-language workflow, Subcommands, Research output format, Research depth/limits, Config schema, Convention naming, Interaction length, Skill file placement, Agent file placement, Progress feedback, Phase 19 relationship, Generated file annotations, Preview rejection handling, Base-first flow detail, Research query formulation, Host project understanding, CLAUDE.md migration, Skill testing strategy

---

## Invocation

| Option | Description | Selected |
|--------|-------------|----------|
| Area argument | `/convention commit` — area name as arg, auto-detect create/update | ✓ |
| Mode-first argument | `/convention create commit` vs `/convention update commit` | |
| No argument | Interactive selection of area | |

**User's choice:** Area argument
**Notes:** None

---

## Authoring Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Research-first | Research → results → preferences → generate | |
| Preferences-first | Preferences → targeted research → generate | |

**User's choice:** Both — user selects which flow at invocation time
**Notes:** User specifically wanted both options available. "둘 다 할 수 있도록 사용자에게 선택지를 주면 안 됨?"

---

## Update Mode

| Option | Description | Selected |
|--------|-------------|----------|
| Full rewrite | Re-read, re-research, re-generate entire convention | |
| Surgical edit | Modify specific rules only | |
| Both modes | Skill analyzes scope, presents choice to user | ✓ |

**User's choice:** Skill analyzes change scope and presents options; user always decides
**Notes:** "작은 수정인지 아닌지 판단하고 사용자에게 선택지를 주는 방식. 작은 수정이 아니더라도 사용자가 선택해야함."

---

## Research Tools

| Option | Description | Selected |
|--------|-------------|----------|
| WebSearch | Best practice search | ✓ |
| Context7 library docs | Library documentation lookup | ✓ |
| WebFetch (URL direct) | Direct URL content fetch | ✓ |
| Codebase analysis | Grep/Glob/Read for host project patterns | ✓ |

**User's choice:** All four + configurable additional tools via cckit.json
**Notes:** "더 있음?" — User wanted extensibility. Decided: default tools + user-configurable via `convention.tools` in cckit.json + cckit can set defaults.

---

## Agent Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Research + Generator + Validator | 3-agent full separation | |
| Research + Generator | 2-agent, orchestrator validates | ✓ |
| Research only | Single subagent, skill generates directly | |

**User's choice:** Research(opus) + Generator(sonnet), orchestrator does light validation
**Notes:** Initially discussed 3-agent (R+G+V). User flagged: "컨벤션 하나 정하자고 에이전트를 3개나 쓰네. 너무 과한가?" Agreed that 2-agent + orchestrator check is the right balance between quality and overhead.

---

## Agent Models

| Option | Description | Selected |
|--------|-------------|----------|
| Research=opus, Generator=sonnet | Quality research + efficient generation | ✓ |
| Both sonnet | Cost-efficient | |
| Configurable | User can override models | |

**User's choice:** Research opus, Generator sonnet
**Notes:** "리서치는 opus, Generator는 Sonnet"

---

## D-01 Boundary Revisit

| Option | Description | Selected |
|--------|-------------|----------|
| D-01 keep + hooks formalize | Convention = Rule + optional Hook. Skills are separate | ✓ |
| Expand to Rules or Skills | Conventions can be either format | |

**User's choice:** D-01 keep + hooks formalize
**Notes:** Claude presented analysis explaining that conventions requiring tool access are skills by definition. Hooks fill the enforcement gap. User agreed.

---

## Delta Test Mechanics

| Option | Description | Selected |
|--------|-------------|----------|
| Generator self-test | Generator applies delta test during generation | ✓ |
| Post-generation validation | Separate validation pass after generation | |
| User-interactive validation | User confirms each rule | |

**User's choice:** Generator self-test (with orchestrator light check)
**Notes:** Originally Generator self-test, later refined when user flagged "Generator의 책임이 너무 많아지는거아님?" — kept Generator self-test but added orchestrator light check.

---

## Cross-Project Output Path

| Option | Description | Selected |
|--------|-------------|----------|
| cckit.json publisher flag | `publisher: true` → conventions/, else → .claude/rules/ | ✓ |
| Auto-detect (directory presence) | Check conventions/ directory existence | |
| Separate config field | output_path field only | |
| CLAUDE.md marker | Marker in CLAUDE.md | |

**User's choice:** cckit.json publisher flag
**Notes:** User proposed this approach: "설정파일에 히든 설정을 넣어서 cckit인지 아닌지를 판별하는건어떰? 기계적으로."

---

## Convention Preview

| Option | Description | Selected |
|--------|-------------|----------|
| Diff preview for updates | Creation = full preview, update = diff preview | ✓ |
| Always preview | Full content every time | |
| Preview on request | Default is write directly | |

**User's choice:** Diff preview for updates (creation always full)

---

## Library Comparison Format

| Option | Description | Selected |
|--------|-------------|----------|
| Health table + comparison | Soundness metrics + feature comparison + recommendation | ✓ |
| Single scored table | Combined scoring | |
| Narrative format | Prose analysis | |

**User's choice:** Health table + comparison
**Notes:** User insisted on soundness/health evaluation: "건전성 같은 것들도 평가해야하지않을까?"

---

## Tech-Neutrality Check

**User's choice:** Built into Generator prompt (base conventions only), orchestrator light check
**Notes:** Folded into Generator responsibilities after the 2-agent architecture decision.

---

## Preference Collection

| Option | Description | Selected |
|--------|-------------|----------|
| Research-informed questions | Concrete options from research results | ✓ |
| Open-ended questions | Free-form questions | |
| Example-based | Show real examples for comparison | |

**User's choice:** Research-informed questions

---

## Edge Cases

### Empty Convention (all rules fail delta test)

| Option | Description | Selected |
|--------|-------------|----------|
| Report + skip creation | Inform user, offer force-create or skip | ✓ |
| Force creation anyway | Always produce something | |
| Suggest alternatives | Redirect to related areas | |

### Preference vs Best Practice Conflict

| Option | Description | Selected |
|--------|-------------|----------|
| Inform + respect user | Explain trade-off, user decides | ✓ |
| Block with explanation | Refuse until user forces | |
| Silent inclusion | Apply preference without warning | |

---

## Multi-Language Workflow

| Option | Description | Selected |
|--------|-------------|----------|
| One language per invocation | `/convention coding rust` — one at a time | ✓ |
| Batch language support | Multiple languages at once | |
| Interactive language selection | Skill asks which language | |

**User's choice:** One language per invocation

---

## Subcommands

| Option | Description | Selected |
|--------|-------------|----------|
| No subcommands needed | Single /convention command sufficient | ✓ |
| list/validate/diff | Additional utility commands | |

**User's choice:** None needed
**Notes:** User said "없어도될거같은데". Claude agreed — YAGNI.

---

## Research Output Format

| Option | Description | Selected |
|--------|-------------|----------|
| Structured report + user summary | Agent returns structured data, orchestrator summarizes | ✓ |
| User-facing report directly | Agent output shown directly | |
| Internal only | Hidden from user | |

---

## Research Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Agent autonomy | Agent decides when sufficient | ✓ |
| User-controlled depth | --depth flag | |
| Fixed scope | Hardcoded search counts | |

---

## Config Schema

| Option | Description | Selected |
|--------|-------------|----------|
| publisher + convention.tools | Two fields for Phase 18 | ✓ |
| publisher only | Minimal | |
| Full schema | All fields upfront | |

**User's choice:** publisher + convention.tools. Rest in Phase 20.
**Notes:** User asked about minimal (publisher only). Claude explained convention.tools is needed for the already-decided "configurable tools" requirement.

---

## Convention Naming

| Option | Description | Selected |
|--------|-------------|----------|
| AskUserQuestion with recommendations | Propose names + allow custom input | ✓ |
| Area arg = directory name | Automatic | |
| Free-form user input | Always manual | |

**User's choice:** AskUserQuestion with recommendations + custom input via Other

---

## Interaction Length

| Option | Description | Selected |
|--------|-------------|----------|
| Adaptive (no fixed count) | Skill adapts to complexity | ✓ |
| Fixed quick mode | Always ≤3 questions | |
| User-controlled | --quick/--thorough flags | |

**User's choice:** Adaptive
**Notes:** User was emphatic: "명확하게 질문 몇개 이런식으로 지정하는 거 굉장히 안 좋음"

---

## Skill File Placement

| Option | Description | Selected |
|--------|-------------|----------|
| skills/convention/SKILL.md | Existing pattern | ✓ |
| skills/convention.md | Flat file | |

---

## Agent File Placement

| Option | Description | Selected |
|--------|-------------|----------|
| agents/ directory | agents/convention-researcher.md, convention-generator.md | ✓ |
| Inline in SKILL.md | Agent prompts inside skill file | |
| skills/convention/agents/ | Co-located with skill | |

---

## Progress Feedback

| Option | Description | Selected |
|--------|-------------|----------|
| Phase announcements | Step-by-step status messages | ✓ |
| Minimal | Results only | |
| Detailed streaming | Real-time findings | |

---

## Phase 19 Relationship

| Option | Description | Selected |
|--------|-------------|----------|
| Phase 19 = /convention commit | E2E validation of the skill | ✓ |
| Phase 19 = manual + validation | Manual authoring, skill validates | |
| Phase 19 = skill test + convention | Test skill first, then create | |

---

## Generated File Metadata

| Option | Description | Selected |
|--------|-------------|----------|
| Comment footer (date only) | `<!-- Generated by /convention, ISO-8601-with-seconds -->` | ✓ |
| No metadata | Pure convention file | |

**Notes:** "convention스킬 버전은표시안함. 날짜는 초단위까지 기록."

---

## Preview Rejection Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Feedback + regenerate | Ask what to change, re-run Generator | ✓ |
| Direct edit | User edits the file | |
| Options menu | Choose between regenerate/edit/cancel | |

---

## Base-First Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Ask user | Present: create base / standalone / cancel | ✓ |
| Auto standalone | Proceed as standalone automatically | |
| Always base first | Always attempt base creation | |

---

## Research Query Input

| Option | Description | Selected |
|--------|-------------|----------|
| Area + lang + project context | Full context including CLAUDE.md, tech stack | ✓ |
| Area + lang only | General research, no project context | |

---

## CLAUDE.md Migration (D-24)

| Option | Description | Selected |
|--------|-------------|----------|
| Not in Phase 18 scope | Handled per-convention in downstream phases | ✓ |
| Manual, separate task | /convention creates, user manually migrates | |
| Skill-assisted migration | Skill detects and extracts from CLAUDE.md | |

---

## Skill Testing Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Dry-run test | Generate test convention, verify, delete | ✓ |
| Phase 19 is the test | No Phase 18 self-verification | |
| Unit test for agents | Mock-based agent testing | |

---

## Claude's Discretion

- Agent prompt internal structure and wording
- Generator's approach to rule organization within convention files
- Research report internal structure

## Deferred Ideas

- CLAUDE.md migration (D-24) — handled per-convention in downstream phases
- Subcommands (list/validate/diff) — future phase if needed
- convention.defaultFlow config field — UX convenience, not functional requirement
