/**
 * Structural integrity tests for the /convention skill.
 *
 * All deliverables are markdown instruction files and one JSON config — not
 * executable code. Each test reads the file and asserts required content is
 * present (or absent). Tests are named after the behavior they protect.
 */

import { assert, assertEquals, assertStringIncludes } from "jsr:@std/assert@1";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function read(path: string): Promise<string> {
  return await Deno.readTextFile(path);
}

function countOccurrences(haystack: string, needle: string): number {
  // Count non-overlapping occurrences of needle in haystack (case-sensitive)
  let count = 0;
  let idx = 0;
  while ((idx = haystack.indexOf(needle, idx)) !== -1) {
    count++;
    idx += needle.length;
  }
  return count;
}

function countMatches(haystack: string, pattern: RegExp): number {
  const global = new RegExp(
    pattern.source,
    "g" + pattern.flags.replace("g", ""),
  );
  return (haystack.match(global) ?? []).length;
}

// ---------------------------------------------------------------------------
// SKILL-01 — convention-researcher agent structural contract
// ---------------------------------------------------------------------------

Deno.test(
  "convention-researcher has correct frontmatter model, tools, and return protocol",
  async () => {
    const src = await read("agents/convention-researcher.md");

    // Frontmatter: model must be opus
    assertStringIncludes(src, "model: opus");

    // Frontmatter: required tools present
    assertStringIncludes(src, "WebSearch");
    assertStringIncludes(src, "WebFetch");
    assertStringIncludes(src, "Read");
    assertStringIncludes(src, "Grep");
    assertStringIncludes(src, "Glob");

    // Frontmatter: Write must NOT be present in the tools list
    // The tools section ends before the model line — extract just the YAML block
    const frontmatterMatch = src.match(/^---\n([\s\S]+?)\n---/);
    assert(frontmatterMatch !== null, "frontmatter block not found");
    const frontmatter = frontmatterMatch[1];
    assert(
      !frontmatter.includes("Write"),
      "Write must not appear in researcher frontmatter tools list",
    );

    // Return protocol: RESEARCH COMPLETE and RESEARCH FAILED
    assertStringIncludes(src, "## RESEARCH COMPLETE");
    assertStringIncludes(src, "## RESEARCH FAILED");

    // Methodology: 5 steps present
    assertStringIncludes(src, "Step 1");
    assertStringIncludes(src, "Step 2");
    assertStringIncludes(src, "Step 3");
    assertStringIncludes(src, "Step 4");
    assertStringIncludes(src, "Step 5");

    // Output contract sections
    assertStringIncludes(src, "Best Practices");
    assertStringIncludes(src, "Library Evaluation");
    assertStringIncludes(src, "Delta Test Summary");

    // No AskUserQuestion in tools
    assert(
      !frontmatter.includes("AskUserQuestion"),
      "AskUserQuestion must not appear in researcher tools",
    );
  },
);

// ---------------------------------------------------------------------------
// SKILL-01 (step-research side) — step-research references researcher agent
// ---------------------------------------------------------------------------

Deno.test(
  "step-research dispatches convention-researcher and handles both RESEARCH COMPLETE and RESEARCH FAILED",
  async () => {
    const src = await read("skills/convention/step-research.md");

    assertStringIncludes(src, "convention-researcher");
    assertStringIncludes(src, "RESEARCH COMPLETE");
    assertStringIncludes(src, "RESEARCH FAILED");

    // Required XML tags in the dispatch block
    assertStringIncludes(src, "<convention_area>");
    assertStringIncludes(src, "<target_language>");
    assertStringIncludes(src, "<host_project_context>");
  },
);

// ---------------------------------------------------------------------------
// SKILL-02 — researcher has Library Evaluation with both required tables
// ---------------------------------------------------------------------------

Deno.test(
  "convention-researcher output contract specifies Library Evaluation with health/soundness and feature comparison tables",
  async () => {
    const src = await read("agents/convention-researcher.md");

    assertStringIncludes(src, "Library Evaluation");
    assertStringIncludes(src, "Health and Soundness");
    assertStringIncludes(src, "Feature Comparison");

    // The health table must have "Maintenance" and "Adoption" as columns
    assertStringIncludes(src, "Maintenance");
    assertStringIncludes(src, "Adoption");

    // A recommendation subsection must be present
    assertStringIncludes(src, "Recommendation");
  },
);

// ---------------------------------------------------------------------------
// SKILL-03 — delta test present in both researcher and generator
// ---------------------------------------------------------------------------

Deno.test(
  "convention-researcher assesses HIGH-DELTA / LOW-DELTA / NO-DELTA for every practice",
  async () => {
    const src = await read("agents/convention-researcher.md");

    assertStringIncludes(src, "HIGH-DELTA");
    assertStringIncludes(src, "LOW-DELTA");
    assertStringIncludes(src, "NO-DELTA");

    // "delta" should appear at least 5 times (case-insensitive) as required by plan
    const deltaCount = countMatches(src, /delta/i);
    assert(
      deltaCount >= 5,
      `Expected at least 5 occurrences of "delta" in researcher, got ${deltaCount}`,
    );
  },
);

Deno.test(
  "convention-generator applies 3-criteria delta test: default behavior, style divergence, consistency",
  async () => {
    const src = await read("agents/convention-generator.md");

    // Three specific criteria labels
    assertStringIncludes(src, "Default behavior");
    assertStringIncludes(src, "Style divergence");
    assertStringIncludes(src, "Consistency");

    // "delta" must appear multiple times
    const deltaCount = countMatches(src, /delta/i);
    assert(
      deltaCount >= 3,
      `Expected at least 3 occurrences of "delta" in generator, got ${deltaCount}`,
    );
  },
);

// ---------------------------------------------------------------------------
// SKILL-04 — step-preferences uses AskUserQuestion and adaptive loop
// ---------------------------------------------------------------------------

Deno.test(
  "step-preferences collects preferences via AskUserQuestion with no hardcoded question count",
  async () => {
    const src = await read("skills/convention/step-preferences.md");

    // Must use the AskUserQuestion tool
    assertStringIncludes(src, "AskUserQuestion");

    // Must describe an adaptive loop (not a fixed count)
    assertStringIncludes(src, "adaptive");

    // Must not hardcode a specific question count — check that there is no
    // phrase like "ask 3 questions" or "exactly N questions"
    assert(
      !/ask \d+ question/i.test(src),
      "step-preferences must not hardcode a question count",
    );
    assert(
      !/fixed.{0,20}count/i.test(src),
      "step-preferences must not mention a fixed count",
    );

    // Must handle preference conflicts with research
    assertStringIncludes(src, "Trade-off");

    // Must transition to step-generate
    assertStringIncludes(src, "step-generate");
  },
);

// ---------------------------------------------------------------------------
// SKILL-05 — generator references CONVENTIONS.md and enforces frontmatter format
// ---------------------------------------------------------------------------

Deno.test(
  "convention-generator references docs/CONVENTIONS.md and enforces unquoted glob and alwaysApply frontmatter",
  async () => {
    const src = await read("agents/convention-generator.md");

    // Must reference the convention spec
    assertStringIncludes(src, "CONVENTIONS.md");

    // Must enforce unquoted glob paths
    assertStringIncludes(src, "unquoted");

    // Must require alwaysApply: false alongside paths
    assertStringIncludes(src, "alwaysApply: false");

    // Must include footer comment instruction
    assertStringIncludes(src, "Generated by /convention");

    // Return protocol
    assertStringIncludes(src, "## GENERATION COMPLETE");
    assertStringIncludes(src, "## GENERATION FAILED");
  },
);

Deno.test(
  "step-generate performs orchestrator light review of frontmatter format and footer",
  async () => {
    const src = await read("skills/convention/step-generate.md");

    // Orchestrator light review
    assertStringIncludes(src, "Orchestrator Light Review");

    // Must check frontmatter for base convention (description only, no paths)
    assertStringIncludes(src, "description");

    // Must check for footer comment
    assertStringIncludes(src, "Generated by /convention");

    // Must dispatch convention-generator
    assertStringIncludes(src, "convention-generator");

    // Re-generation on rejection (feedback tag)
    const feedbackCount = countOccurrences(src, "feedback");
    assert(
      feedbackCount >= 2,
      `Expected at least 2 occurrences of "feedback" in step-generate, got ${feedbackCount}`,
    );

    // Empty convention handling (force_create)
    assertStringIncludes(src, "force_create");
  },
);

// ---------------------------------------------------------------------------
// SKILL-06 — tech-neutrality check conditional on base conventions only
// ---------------------------------------------------------------------------

Deno.test(
  "convention-generator tech_neutrality_check is conditional on base convention (lang is nil)",
  async () => {
    const src = await read("agents/convention-generator.md");

    // The check must exist
    assertStringIncludes(src, "tech_neutrality_check");

    // Must be described as conditional / base-only
    assertStringIncludes(src, "base convention");
  },
);

Deno.test(
  "step-generate includes tech_neutrality_check only when lang is nil",
  async () => {
    const src = await read("skills/convention/step-generate.md");

    assertStringIncludes(src, "tech_neutrality_check");

    // The condition that restricts it to base conventions
    // The file must mention "lang is nil" or equivalent condition
    assert(
      /lang.{0,20}nil/i.test(src),
      "step-generate must condition tech_neutrality_check on lang being nil",
    );
  },
);

// ---------------------------------------------------------------------------
// SKILL-07 — .claude/cckit.json structure and step-init publisher path resolution
// ---------------------------------------------------------------------------

Deno.test(
  "cckit.json is valid JSON with publisher boolean and convention.tools array",
  async () => {
    const raw = await read(".claude/cckit.json");

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      assert(false, `cckit.json must be valid JSON: ${e}`);
    }

    const obj = parsed as Record<string, unknown>;

    // publisher must be a boolean (true for cckit itself)
    assertEquals(typeof obj["publisher"], "boolean");

    // convention must be an object
    assert(
      typeof obj["convention"] === "object" && obj["convention"] !== null,
      "cckit.json must have a 'convention' object",
    );

    const convention = obj["convention"] as Record<string, unknown>;

    // convention.tools must be an array
    assert(
      Array.isArray(convention["tools"]),
      "cckit.json convention.tools must be an array",
    );
  },
);

Deno.test(
  "step-init resolves both publisher paths (conventions/{area}/) and consumer paths (.claude/rules/cckit-{area}.md)",
  async () => {
    const src = await read("skills/convention/step-init.md");

    // Publisher path pattern
    assertStringIncludes(src, "conventions/{area}/CONVENTION.md");

    // Consumer path pattern
    assertStringIncludes(src, ".claude/rules/cckit-{area}.md");

    // Must read cckit.json to detect publisher flag
    assertStringIncludes(src, "cckit.json");

    // Must route to step-research, step-preferences, and step-update
    assertStringIncludes(src, "step-research.md");
    assertStringIncludes(src, "step-preferences.md");
    assertStringIncludes(src, "step-update.md");
  },
);
