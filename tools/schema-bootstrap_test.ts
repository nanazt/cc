import {
  assertEquals,
  assertStringIncludes,
  assertRejects,
} from "jsr:@std/assert";
import { generateStarterSchema, writeSchema } from "./schema-bootstrap.ts";

// --- generateStarterSchema() tests ---

Deno.test("generateStarterSchema returns string with schema title", () => {
  const schema = generateStarterSchema();
  assertEquals(typeof schema, "string");
  assertStringIncludes(schema, "# Consolidation Schema");
});

Deno.test("generateStarterSchema output contains Meta version=1", () => {
  const schema = generateStarterSchema();
  assertStringIncludes(schema, "| version | 1 |");
});

Deno.test("generateStarterSchema output contains Meta rule-prefix=CR", () => {
  const schema = generateStarterSchema();
  assertStringIncludes(schema, "| rule-prefix | CR |");
});

Deno.test("generateStarterSchema output contains Meta e2e-flows=false", () => {
  const schema = generateStarterSchema();
  assertStringIncludes(schema, "| e2e-flows | false |");
});

Deno.test(
  "generateStarterSchema output contains 3-column Components table",
  () => {
    const schema = generateStarterSchema();
    assertStringIncludes(schema, "| Component | Description | Type |");
  },
);

Deno.test("generateStarterSchema output contains Sections: default", () => {
  const schema = generateStarterSchema();
  assertStringIncludes(schema, "## Sections: default");
});

Deno.test(
  "generateStarterSchema output contains all 7 mandatory context sections",
  () => {
    const schema = generateStarterSchema();
    assertStringIncludes(schema, "**Overview**");
    assertStringIncludes(schema, "**Public Interface**");
    assertStringIncludes(schema, "**Domain Model**");
    assertStringIncludes(schema, "**Behavior Rules**");
    assertStringIncludes(schema, "**Error Handling**");
    assertStringIncludes(schema, "**Dependencies**");
    assertStringIncludes(schema, "**Configuration**");
  },
);

Deno.test(
  "generateStarterSchema output contains both conditional sections",
  () => {
    const schema = generateStarterSchema();
    assertStringIncludes(schema, "**State Lifecycle**");
    assertStringIncludes(schema, "**Event Contracts**");
  },
);

Deno.test(
  "generateStarterSchema output contains docs/examples/ reference comment",
  () => {
    const schema = generateStarterSchema();
    assertStringIncludes(schema, "docs/examples/");
  },
);

// --- writeSchema() tests ---

Deno.test(
  "writeSchema creates file at specified path with correct content",
  async () => {
    const dir = await Deno.makeTempDir();
    const path = `${dir}/test-schema.md`;
    try {
      await writeSchema(path);
      const content = await Deno.readTextFile(path);
      assertEquals(content, generateStarterSchema());
    } finally {
      await Deno.remove(dir, { recursive: true });
    }
  },
);

Deno.test(
  "writeSchema throws AlreadyExists when file already exists",
  async () => {
    const dir = await Deno.makeTempDir();
    const path = `${dir}/existing-schema.md`;
    try {
      // Create the file first
      await Deno.writeTextFile(path, "existing content");
      // writeSchema should throw because file already exists
      await assertRejects(() => writeSchema(path), Deno.errors.AlreadyExists);
    } finally {
      await Deno.remove(dir, { recursive: true });
    }
  },
);
