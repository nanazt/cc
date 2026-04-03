# Phase 18: /convention Skill - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the `/convention` skill — a research-driven, interactive convention authoring tool that can create and update convention files following the architecture defined in Phase 17 (docs/CONVENTIONS.md).

Scope: SKILL.md file, research agent, generator agent, orchestration logic, preference collection, delta test integration, tech-neutrality validation, preview/review flow, update mode, cckit.json config schema (publisher + convention.tools).

Not in scope: actual convention content (Phase 19+), installer implementation (Phase 20), CLAUDE.md migration (D-24 — handled per-convention in downstream phases), subcommands (list/validate/diff — not needed).

</domain>

<decisions>
## Implementation Decisions

### Invocation & Routing
- **D-01:** Invocation format is `/convention {area} [lang]`. Single command. Area is required, language is optional.
- **D-02:** Skill auto-detects create vs update mode based on whether the convention file already exists at the target path.
- **D-03:** No subcommands (list, validate, diff). Single command is sufficient. List is trivially `ls conventions/` or `ls .claude/rules/cckit-*`.

### Convention Naming
- **D-04:** When creating a new convention, the skill uses AskUserQuestion to present recommended directory names and allows user to input a custom name via "Other".

### Authoring Workflow
- **D-05:** Skill presents the user with a choice between **research-first** flow (research → results → preferences → generate) and **preferences-first** flow (preferences → targeted research → generate). User picks.
- **D-06:** Interaction length is **adaptive** — no fixed question count. The skill asks as many or as few questions as the convention area requires. Never hardcode "ask N questions then check."
- **D-07:** Phase announcements provide progress feedback: "Researching..." → "Research complete. Summary:" → "Collecting preferences..." → "Generating..." → "Preview:". No silent waits.

### Update Mode
- **D-08:** When updating, the skill analyzes the scope of requested changes and presents the user with a choice: **full rewrite** (re-research, re-generate with delta test re-validation) or **surgical edit** (modify specific rules only). User always decides.
- **D-09:** Update supports: content modification, rule addition, rule removal.

### Research Strategy
- **D-10:** Default research tool set: WebSearch, Context7, WebFetch, Codebase analysis (Grep/Glob/Read).
- **D-11:** Additional tools can be configured via `.claude/cckit.json` `convention.tools` field. cckit can set default tool configuration.
- **D-12:** Research agent operates with **full autonomy** on depth — no fixed search counts or time limits. The agent prompt specifies expected quality level, and the agent decides when it has sufficient information.
- **D-13:** Research agent receives: convention area name, target language (if applicable), and host project context (CLAUDE.md summary, technology stack, existing conventions).
- **D-14:** Research agent returns a **structured report** (best practices list, library comparisons, recommendations). The orchestrator synthesizes this into a user-facing summary before presenting.

### Library Evaluation (SKILL-02)
- **D-15:** Library recommendations include two tables: **health/soundness table** (maintenance status, community adoption, API stability, documentation quality, security, ecosystem compatibility) and **feature comparison table**. Followed by a recommendation with reasoning. User makes the final selection.

### Agent Architecture
- **D-16:** Two agents: **Research agent** (opus model) and **Generator agent** (sonnet model). The main skill acts as orchestrator and performs lightweight validation.
- **D-17:** Agent definition files: `agents/convention-researcher.md` and `agents/convention-generator.md`. Follows existing pattern (case-briefer, spec-consolidator).
- **D-18:** Generator handles convention file generation only. Delta test criteria and tech-neutrality criteria are embedded in the Generator's prompt, but the orchestrator performs a light review pass after generation.

### Delta Test (SKILL-03)
- **D-19:** Delta test is embedded in the Generator agent's prompt. Generator self-filters rules during generation: "Would Claude already do this without being told?" → Yes → remove. The generation report includes removed rules and reasons.
- **D-20:** Orchestrator performs a lightweight post-generation check to catch obvious violations the Generator might have missed.

### Tech-Neutrality Validation (SKILL-06)
- **D-21:** Tech-neutrality check is embedded in the Generator's prompt for base conventions only. Language-specific conventions are inherently language-specific and skip this check.

### User Preference Collection (SKILL-04)
- **D-22:** Preferences are collected via **research-informed questions** — concrete options derived from research results, presented via AskUserQuestion. Users can discover options they didn't know existed.
- **D-23:** When user preferences conflict with best practices: inform the user of the trade-off and let them decide. Never silently override or block.

### Preview & Review
- **D-24:** **Creation mode**: always show full preview before writing. User can approve, request changes (feedback + regenerate), or cancel.
- **D-25:** **Update mode**: show diff preview (changes only). Same approve/feedback/cancel options.
- **D-26:** On preview rejection: ask "What would you change?" → incorporate feedback → re-run Generator → show new preview.

### Output Path & Config
- **D-27:** Output path determined by `.claude/cckit.json` `publisher` flag. `publisher: true` → `conventions/{area}/`. No flag or false → `.claude/rules/` with `cckit-` prefix.
- **D-28:** Phase 18 cckit.json schema: `publisher` (boolean) and `convention.tools` (string[]). Installer-related fields deferred to Phase 20.

### Multi-Language Support
- **D-29:** One language per invocation. `/convention coding rust` creates Rust coding convention only.
- **D-30:** If a language-specific convention is requested but no base exists: ask user — (1) create base first, (2) proceed as standalone, (3) cancel. If user chooses base first and all rules fail delta test, base is skipped and proceeds to standalone.

### Convention Format Boundary (D-01 Revisit)
- **D-31:** Phase 17 D-01 **confirmed**: Conventions are Claude Code Rules. Convention package = Rule (guidance) + optional Hook (enforcement). Anything requiring tool access or interactive workflows is a skill, not a convention.

### Edge Cases
- **D-32:** If all rules fail delta test (empty convention): report to user — "All rules in this area are already followed by Claude by default. A convention file is not needed." Offer force-create or skip.
- **D-33:** If research finds insufficient information: report findings so far, ask user if they want to proceed with limited research or provide additional context/URLs.

### Generated File Metadata
- **D-34:** Generated convention files include a comment footer: `<!-- Generated by /convention, YYYY-MM-DDTHH:MM:SSZ -->`. No skill version number. Timestamp in ISO 8601 with seconds.

### Skill & Agent Placement
- **D-35:** Skill file: `skills/convention/SKILL.md`. Follows existing pattern.
- **D-36:** Agent files: `agents/convention-researcher.md`, `agents/convention-generator.md`. Follows existing pattern.

### Testing
- **D-37:** Phase 18 self-verification via dry-run test: run the skill to generate a test convention, verify output structure and quality, delete test output.

### Phase 19 Relationship
- **D-38:** Phase 19 (First Convention — Commit) is an end-to-end validation of this skill. Phase 19 = invoke `/convention commit` and verify the complete pipeline works.

### Claude's Discretion
- Agent prompt internal structure and wording — researcher/planner decide optimal prompt design
- Generator's internal approach to rule organization within convention files (D-14 from Phase 17)
- Research report internal structure — as long as it's structured and usable by the orchestrator

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Architecture
- `docs/CONVENTIONS.md` — Convention architecture specification (Phase 17 deliverable). Authoritative source for file structure, naming, frontmatter format, delta test definition, hook architecture, installer discovery contract, content principles, and anti-patterns.

### Requirements
- `.planning/REQUIREMENTS.md` — SKILL-01 through SKILL-07 requirements for this phase

### Existing Skill Patterns
- `skills/case/SKILL.md` — Existing action skill with briefer+validator agent pattern. Reference for SKILL.md structure, AskUserQuestion usage, and orchestration flow.
- `skills/consolidate/SKILL.md` — Existing action skill with automated pipeline pattern. Reference for agent dispatch.

### Existing Agent Patterns
- `agents/case-briefer.md` — Sonnet agent for /case. Reference for agent file format.
- `agents/case-validator.md` — Opus agent for /case. Reference for validation agent design.
- `agents/spec-consolidator.md` — Sonnet agent for /consolidate. Reference for generation agent design.

### Prior Phase Context
- `.planning/phases/17-convention-architecture/17-CONTEXT.md` — Phase 17 decisions (D-01 through D-27). Many decisions carry forward and must not be contradicted.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `skills/case/SKILL.md` — Proven pattern for interactive, conversation-driven skills with AskUserQuestion, agent dispatch, and structured output
- `skills/consolidate/SKILL.md` — Pattern for automated pipeline skills with multiple agents
- `agents/case-briefer.md`, `agents/case-validator.md` — Agent definition format with frontmatter, model specification, and structured prompts
- `.claude/hooks/validate-commit-scope.sh` — Reference implementation for enforcement hooks

### Established Patterns
- SKILL.md frontmatter: `name`, `description`, `argument-hint`, `allowed-tools`, `disable-model-invocation`
- Agent dispatch via `Agent()` tool call with `subagent_type`, `model`, and structured prompt
- AskUserQuestion for all user-facing decisions (per memory: "Discuss format: table + AskUserQuestion")
- Orchestrator pattern: main skill coordinates agents and handles user interaction

### Integration Points
- `skills/convention/SKILL.md` — new file, follows existing skills/ structure
- `agents/convention-researcher.md` — new agent definition
- `agents/convention-generator.md` — new agent definition
- `.claude/cckit.json` — new config file (publisher + convention.tools fields)
- `conventions/` directory — will be created by Phase 19 when first convention is generated (not Phase 18)

</code_context>

<specifics>
## Specific Ideas

- User emphasized convention **update capability** (modify, add, remove rules) as a first-class feature, not an afterthought — the skill must handle updates from day one, not just creation
- User rejected fixed question counts — "명확하게 질문 몇개 이런식으로 지정하는 거 굉장히 안 좋음" (hardcoding question counts is very bad). Interaction length must be adaptive.
- User wanted research done by a dedicated subagent specifically for quality — not inline in the main skill
- User prioritized library **soundness/health evaluation** (maintenance, adoption, stability, security) alongside functional comparison — not just feature lists
- Generator's responsibility was explicitly limited after user flagged overload concern — "Generator의 책임이 너무 많아지는거아님?" Led to keeping 2-agent + orchestrator check instead of 3-agent.
- Convention naming uses AskUserQuestion with recommendations + free-form input, not automatic naming
- Config uses mechanical detection (cckit.json publisher flag) rather than heuristic detection — user was emphatic about this ("설정파일에 히든 설정을 넣어서 cckit인지 아닌지를 판별")

</specifics>

<deferred>
## Deferred Ideas

- **CLAUDE.md migration (D-24)** — Moving existing convention content from CLAUDE.md to convention files is handled per-convention in downstream phases (19+), not in Phase 18
- **Subcommands** (list, validate, diff) — May be added in a future phase if proven needed. Not required for initial skill
- **convention.defaultFlow config field** — Could save user's preferred flow (research-first/preferences-first) to skip asking each time. Deferred as UX convenience, not functional requirement

</deferred>

---

*Phase: 18-convention-skill*
*Context gathered: 2026-04-04*
