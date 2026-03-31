import { assertEquals, assertExists, assert } from "jsr:@std/assert";
import { parseSchema } from "./schema-parser.ts";
import { generateStarterSchema } from "./schema-bootstrap.ts";

const EXAMPLES = new URL("../docs/examples/", import.meta.url).pathname;

// --- Fixture-based tests ---

Deno.test("cli example: meta fields correct", async () => {
  const source = await Deno.readTextFile(`${EXAMPLES}schema-cli.md`);
  const result = parseSchema(source);
  assertEquals(result.errors, []);
  assertExists(result.data);
  assertEquals(result.data!.meta.version, 1);
  assertEquals(result.data!.meta.rulePrefix, "CR");
  assertEquals(result.data!.meta.e2eFlows, false);
});

Deno.test("cli example: 4 components, all empty type", async () => {
  const source = await Deno.readTextFile(`${EXAMPLES}schema-cli.md`);
  const result = parseSchema(source);
  assertEquals(result.errors, []);
  assertExists(result.data);
  assertEquals(result.data!.components.length, 4);
  for (const comp of result.data!.components) {
    assertEquals(comp.type, "");
  }
});

Deno.test(
  "cli example: sections.default has 7 context, 2 conditional",
  async () => {
    const source = await Deno.readTextFile(`${EXAMPLES}schema-cli.md`);
    const result = parseSchema(source);
    assertEquals(result.errors, []);
    assertExists(result.data);
    assertExists(result.data!.sections["default"]);
    assertEquals(result.data!.sections["default"].context.length, 7);
    assertEquals(result.data!.sections["default"].conditional.length, 2);
  },
);

Deno.test(
  "microservice example: auth component has type api-gateway",
  async () => {
    const source = await Deno.readTextFile(`${EXAMPLES}schema-microservice.md`);
    const result = parseSchema(source);
    assertEquals(result.errors, []);
    assertExists(result.data);
    const auth = result.data!.components.find((c) => c.name === "auth");
    assertExists(auth);
    assertEquals(auth!.type, "api-gateway");
  },
);

Deno.test(
  "microservice example: sections has both default and api-gateway keys",
  async () => {
    const source = await Deno.readTextFile(`${EXAMPLES}schema-microservice.md`);
    const result = parseSchema(source);
    assertEquals(result.errors, []);
    assertExists(result.data);
    assertExists(result.data!.sections["default"]);
    assertExists(result.data!.sections["api-gateway"]);
  },
);

Deno.test(
  "microservice example: api-gateway has context sections, empty conditional",
  async () => {
    const source = await Deno.readTextFile(`${EXAMPLES}schema-microservice.md`);
    const result = parseSchema(source);
    assertEquals(result.errors, []);
    assertExists(result.data);
    const agSection = result.data!.sections["api-gateway"];
    assertExists(agSection);
    assert(agSection.context.length > 0);
    assertEquals(agSection.conditional.length, 0);
  },
);

Deno.test("library example: 4 components all empty type", async () => {
  const source = await Deno.readTextFile(`${EXAMPLES}schema-library.md`);
  const result = parseSchema(source);
  assertEquals(result.errors, []);
  assertExists(result.data);
  assertEquals(result.data!.components.length, 4);
  for (const comp of result.data!.components) {
    assertEquals(comp.type, "");
  }
});

Deno.test("all 3 examples parse with no errors", async () => {
  for (const name of [
    "schema-cli.md",
    "schema-microservice.md",
    "schema-library.md",
  ]) {
    const source = await Deno.readTextFile(`${EXAMPLES}${name}`);
    const result = parseSchema(source);
    assertEquals(
      result.errors,
      [],
      `Expected no errors for ${name}, got: ${JSON.stringify(result.errors)}`,
    );
  }
});

// --- Behavioral condition test ---

Deno.test(
  "conditional section State Lifecycle has correct behavioral condition text",
  async () => {
    const source = await Deno.readTextFile(`${EXAMPLES}schema-cli.md`);
    const result = parseSchema(source);
    assertEquals(result.errors, []);
    assertExists(result.data);
    const conditionals = result.data!.sections["default"].conditional;
    const stateLc = conditionals.find((c) => c.name === "State Lifecycle");
    assertExists(stateLc);
    assertEquals(
      stateLc!.condition,
      "component manages stateful entities with lifecycle transitions",
    );
  },
);

// --- Validation error tests (inline schema strings) ---

Deno.test("missing Meta section uses defaults, no errors", () => {
  const source = `# Schema

## Components

| Component | Description | Type |
|-----------|-------------|------|

## Sections: default

### Context Sections
1. **Overview** -- What this component does

### Conditional Sections
- **State Lifecycle** -- Include when: test condition
`;
  const result = parseSchema(source);
  assertEquals(result.errors, []);
  assertExists(result.data);
  assertEquals(result.data!.meta.version, 1);
  assertEquals(result.data!.meta.rulePrefix, "CR");
  assertEquals(result.data!.meta.e2eFlows, false);
});

Deno.test("type name UPPER-case produces kebab-case validation error", () => {
  const source = `# Schema

## Components

| Component | Description | Type |
|-----------|-------------|------|
| auth | Authentication | UPPER-case |

## Sections: default

### Context Sections
1. **Overview** -- What this component does

## Sections: UPPER-case

### Context Sections
1. **Overview** -- Override overview
`;
  const result = parseSchema(source);
  assert(result.errors.length > 0, "Expected validation errors");
  const kebabError = result.errors.find((e) =>
    e.message.includes("kebab-case"),
  );
  assertExists(kebabError, "Expected an error mentioning kebab-case");
});

Deno.test(
  "type orphan in Components but no Sections block produces error",
  () => {
    const source = `# Schema

## Components

| Component | Description | Type |
|-----------|-------------|------|
| auth | Authentication | orphan-type |

## Sections: default

### Context Sections
1. **Overview** -- What this component does
`;
    const result = parseSchema(source);
    assert(
      result.errors.length > 0,
      "Expected validation errors for missing section block",
    );
    const refError = result.errors.find(
      (e) =>
        e.message.includes("orphan-type") || e.message.includes("no matching"),
    );
    assertExists(refError, "Expected an error about missing section block");
  },
);

Deno.test("duplicate component names produce validation error", () => {
  const source = `# Schema

## Components

| Component | Description | Type |
|-----------|-------------|------|
| auth | Authentication | |
| auth | Duplicate auth | |

## Sections: default

### Context Sections
1. **Overview** -- What this component does
`;
  const result = parseSchema(source);
  assert(
    result.errors.length > 0,
    "Expected validation error for duplicate component names",
  );
  const dupError = result.errors.find((e) => e.message.includes("auth"));
  assertExists(dupError, "Expected error mentioning the duplicate name");
});

Deno.test("validation errors have line, message, and fix fields", () => {
  const source = `# Schema

## Components

| Component | Description | Type |
|-----------|-------------|------|
| auth | Authentication | UPPER-CASE |

## Sections: default

### Context Sections
1. **Overview** -- What this component does

## Sections: UPPER-CASE

### Context Sections
1. **Overview** -- Override
`;
  const result = parseSchema(source);
  assert(result.errors.length > 0, "Expected errors");
  for (const err of result.errors) {
    assertEquals(typeof err.line, "number");
    assertEquals(typeof err.message, "string");
    assertEquals(typeof err.fix, "string");
  }
});

// --- Edge case tests ---

Deno.test("empty Components table is valid, returns empty array", () => {
  const source = `# Schema

## Components

| Component | Description | Type |
|-----------|-------------|------|

## Sections: default

### Context Sections
1. **Overview** -- What this component does

### Conditional Sections
- **State Lifecycle** -- Include when: condition text
`;
  const result = parseSchema(source);
  assertEquals(result.errors, []);
  assertExists(result.data);
  assertEquals(result.data!.components, []);
});

Deno.test("bootstrap output parses successfully with correct defaults", () => {
  const source = generateStarterSchema();
  const result = parseSchema(source);
  assertEquals(
    result.errors,
    [],
    `Expected no errors, got: ${JSON.stringify(result.errors)}`,
  );
  assertExists(result.data);
  assertEquals(result.data!.meta.version, 1);
  assertEquals(result.data!.meta.rulePrefix, "CR");
  assertEquals(result.data!.meta.e2eFlows, false);
  assertEquals(result.data!.components, []);
  assertExists(result.data!.sections["default"]);
  assertEquals(result.data!.sections["default"].context.length, 7);
  assertEquals(result.data!.sections["default"].conditional.length, 2);
});

// --- Section content tests ---

Deno.test(
  "context section extraction: first default section is Overview with correct guide",
  async () => {
    const source = await Deno.readTextFile(`${EXAMPLES}schema-cli.md`);
    const result = parseSchema(source);
    assertEquals(result.errors, []);
    assertExists(result.data);
    const first = result.data!.sections["default"].context[0];
    assertEquals(first.name, "Overview");
    assertEquals(first.guide, "What this component does and why it exists");
  },
);

Deno.test(
  "conditional section extraction: first conditional is State Lifecycle",
  async () => {
    const source = await Deno.readTextFile(`${EXAMPLES}schema-cli.md`);
    const result = parseSchema(source);
    assertEquals(result.errors, []);
    assertExists(result.data);
    const first = result.data!.sections["default"].conditional[0];
    assertEquals(first.name, "State Lifecycle");
    assertEquals(
      first.condition,
      "component manages stateful entities with lifecycle transitions",
    );
  },
);

Deno.test("microservice example: e2e-flows is true", async () => {
  const source = await Deno.readTextFile(`${EXAMPLES}schema-microservice.md`);
  const result = parseSchema(source);
  assertEquals(result.errors, []);
  assertExists(result.data);
  assertEquals(result.data!.meta.e2eFlows, true);
});
