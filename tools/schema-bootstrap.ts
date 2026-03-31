/**
 * schema-bootstrap.ts
 *
 * Generates a starter consolidation schema at a specified path.
 * Refuses to overwrite existing files (exit 1).
 *
 * Usage: deno run --allow-read --allow-write tools/schema-bootstrap.ts <output-path>
 */

const STARTER_SCHEMA = `# Consolidation Schema

A component is the smallest independently specifiable unit in your project.

<!-- See docs/examples/ for complete schema examples -->

## Meta

| Key | Value |
|-----|-------|
| version | 1 |
| rule-prefix | CR |
| e2e-flows | false |

## Components

| Component | Description | Type |
|-----------|-------------|------|

## Sections: default

### Context Sections
1. **Overview** -- What this component does and why it exists
2. **Public Interface** -- Operations, commands, endpoints, or API surface this component exposes to consumers
3. **Domain Model** -- Entities, types, and data structures this component owns
4. **Behavior Rules** -- Business rules, constraints, and invariants governing this component's behavior
5. **Error Handling** -- Error categories, failure modes, and recovery strategies
6. **Dependencies** -- What this component requires from other components or external systems
7. **Configuration** -- Environment variables, feature flags, and tunable parameters

### Conditional Sections
- **State Lifecycle** -- Include when: component manages stateful entities with lifecycle transitions
- **Event Contracts** -- Include when: component produces or consumes events/messages
`;

/**
 * Returns the complete starter schema as a string.
 */
export function generateStarterSchema(): string {
  return STARTER_SCHEMA;
}

/**
 * Writes the starter schema to outputPath.
 * Throws Deno.errors.AlreadyExists if the file already exists.
 */
export async function writeSchema(outputPath: string): Promise<void> {
  const content = generateStarterSchema();
  await Deno.writeTextFile(outputPath, content, { createNew: true });
}

// CLI entrypoint
if (import.meta.main) {
  if (Deno.args.length === 0) {
    console.error("Usage: schema-bootstrap.ts <output-path>");
    Deno.exit(1);
  }

  const outputPath = Deno.args[0];

  try {
    await writeSchema(outputPath);
    console.log(`Created: ${outputPath}`);
  } catch (e) {
    if (e instanceof Deno.errors.AlreadyExists) {
      console.error(`Error: ${outputPath} already exists. Will not overwrite.`);
      Deno.exit(1);
    }
    throw e;
  }
}
