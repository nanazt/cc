/**
 * schema-parser.ts
 *
 * Parses a consolidation schema file and outputs structured JSON.
 * Uses unified + remark-parse + remark-gfm for AST-based parsing.
 *
 * Usage: deno run --allow-read tools/schema-parser.ts <schema-path>
 */

import { unified } from "npm:unified@^11.0.0";
import remarkParse from "npm:remark-parse@^11.0.0";
import remarkGfm from "npm:remark-gfm@^4.0.0";
import { toString } from "npm:mdast-util-to-string@^4.0.0";
import type {
  Heading,
  List,
  ListItem,
  Paragraph,
  Root,
  RootContent,
  Table,
} from "npm:@types/mdast@^4.0.0";

// ------------------------------------------------------------------ interfaces

export interface SchemaMeta {
  version: number;
  rulePrefix: string;
  e2eFlows: boolean;
}

export interface SchemaComponent {
  name: string;
  description: string;
  type: string;
}

export interface ContextSection {
  name: string;
  guide: string;
}

export interface ConditionalSection {
  name: string;
  condition: string;
}

export interface SectionBlock {
  context: ContextSection[];
  conditional: ConditionalSection[];
}

export interface SchemaOutput {
  meta: SchemaMeta;
  components: SchemaComponent[];
  sections: Record<string, SectionBlock>;
}

export interface ValidationError {
  line: number;
  message: string;
  fix: string;
}

export interface ParseResult {
  data?: SchemaOutput;
  errors: ValidationError[];
}

// ------------------------------------------------------------------ constants

const KEBAB_CASE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

const DEFAULT_META: SchemaMeta = {
  version: 1,
  rulePrefix: "CR",
  e2eFlows: false,
};

// ------------------------------------------------------------------ AST utilities

function parseTree(source: string): Root {
  return unified().use(remarkParse).use(remarkGfm).parse(source);
}

/**
 * Walk top-level H2 children and collect sections.
 * Each section includes the heading text and the slice of sibling nodes until
 * the next H2.
 */
interface H2Section {
  headingText: string;
  headingLine: number;
  children: RootContent[];
}

function collectH2Sections(tree: Root): H2Section[] {
  const result: H2Section[] = [];

  // Find H2 node indices
  const h2Indices: number[] = [];
  for (let i = 0; i < tree.children.length; i++) {
    const node = tree.children[i];
    if (node.type === "heading" && (node as Heading).depth === 2) {
      h2Indices.push(i);
    }
  }

  for (let j = 0; j < h2Indices.length; j++) {
    const headingNode = tree.children[h2Indices[j]] as Heading;
    const start = h2Indices[j] + 1;
    const end =
      j + 1 < h2Indices.length ? h2Indices[j + 1] : tree.children.length;
    result.push({
      headingText: toString(headingNode).trim(),
      headingLine: headingNode.position?.start.line ?? 0,
      children: tree.children.slice(start, end),
    });
  }

  return result;
}

/**
 * Extract table data from the first Table node in a children list.
 * Returns null if no table found.
 * Handles rows with fewer cells than headers (Pitfall 2: defensive access).
 */
function extractTable(
  children: RootContent[],
): {
  headers: string[];
  rows: Record<string, string>[];
  rowLines: number[];
} | null {
  const tableNode = children.find((n) => n.type === "table") as
    | Table
    | undefined;
  if (!tableNode) return null;

  const headerCells = tableNode.children[0].children;
  const headers = headerCells.map((cell) => toString(cell).trim());

  const rows: Record<string, string>[] = [];
  const rowLines: number[] = [];

  for (const row of tableNode.children.slice(1)) {
    const record: Record<string, string> = {};
    for (let i = 0; i < headers.length; i++) {
      record[headers[i]] =
        i < row.children.length ? toString(row.children[i]).trim() : "";
    }
    rows.push(record);
    rowLines.push(row.position?.start.line ?? 0);
  }

  return { headers, rows, rowLines };
}

/**
 * Parse the Meta table from a section's children.
 * Returns defaults if no table found.
 */
function parseMeta(children: RootContent[]): SchemaMeta {
  const tableData = extractTable(children);
  if (!tableData) return { ...DEFAULT_META };

  const meta = { ...DEFAULT_META };
  for (const row of tableData.rows) {
    const key = (row["Key"] ?? "").toLowerCase().trim();
    const value = (row["Value"] ?? "").trim();
    if (key === "version") {
      const parsed = parseInt(value, 10);
      if (!isNaN(parsed)) meta.version = parsed;
    } else if (key === "rule-prefix") {
      if (value) meta.rulePrefix = value;
    } else if (key === "e2e-flows") {
      meta.e2eFlows = value.toLowerCase() === "true";
    }
  }
  return meta;
}

/**
 * Parse a numbered/bullet list item to extract context section { name, guide }.
 * Uses AST to avoid Pitfall 6 (splitting on " -- " in guide text).
 */
function parseContextListItem(item: ListItem): ContextSection {
  const para = item.children[0] as Paragraph;
  if (!para || para.type !== "paragraph") return { name: "", guide: "" };

  // Find the strong (bold) node — that's the section name
  const strongNode = para.children.find((c) => c.type === "strong");
  const name = strongNode ? toString(strongNode).trim() : "";

  // Guide text: the text node that starts with " -- "
  let guide = "";
  for (const child of para.children) {
    if (child.type === "text") {
      const val = (child as { type: "text"; value: string }).value;
      const dashIdx = val.indexOf(" -- ");
      if (dashIdx !== -1) {
        guide = val.slice(dashIdx + 4).trim();
        break;
      }
    }
  }

  return { name, guide };
}

/**
 * Parse a bullet list item to extract conditional section { name, condition }.
 * Extracts text after "Include when:" from the text node.
 */
function parseConditionalListItem(item: ListItem): ConditionalSection {
  const para = item.children[0] as Paragraph;
  if (!para || para.type !== "paragraph") return { name: "", condition: "" };

  const strongNode = para.children.find((c) => c.type === "strong");
  const name = strongNode ? toString(strongNode).trim() : "";

  let condition = "";
  for (const child of para.children) {
    if (child.type === "text") {
      const val = (child as { type: "text"; value: string }).value;
      const includeWhenIdx = val.indexOf("Include when:");
      if (includeWhenIdx !== -1) {
        condition = val.slice(includeWhenIdx + "Include when:".length).trim();
        break;
      }
    }
  }

  return { name, condition };
}

/**
 * Find sub-sections (H3) within a section's children.
 * Returns a map of H3 heading text (lowercased) -> children nodes.
 */
function collectH3Subsections(
  children: RootContent[],
): Map<string, RootContent[]> {
  const result = new Map<string, RootContent[]>();

  const h3Indices: number[] = [];
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    if (node.type === "heading" && (node as Heading).depth === 3) {
      h3Indices.push(i);
    }
  }

  for (let j = 0; j < h3Indices.length; j++) {
    const headingNode = children[h3Indices[j]] as Heading;
    const headingKey = toString(headingNode).toLowerCase().trim();
    const start = h3Indices[j] + 1;
    const end = j + 1 < h3Indices.length ? h3Indices[j + 1] : children.length;
    result.set(headingKey, children.slice(start, end));
  }

  return result;
}

/**
 * Parse a SectionBlock (context + conditional) from section children.
 */
function parseSectionBlock(children: RootContent[]): SectionBlock {
  const h3Map = collectH3Subsections(children);

  // Context sections
  const context: ContextSection[] = [];
  const contextChildren = h3Map.get("context sections");
  if (contextChildren) {
    const listNode = contextChildren.find((n) => n.type === "list") as
      | List
      | undefined;
    if (listNode) {
      for (const item of listNode.children) {
        const parsed = parseContextListItem(item as ListItem);
        if (parsed.name) context.push(parsed);
      }
    }
  }

  // Conditional sections (optional per design)
  const conditional: ConditionalSection[] = [];
  const conditionalChildren = h3Map.get("conditional sections");
  if (conditionalChildren) {
    const listNode = conditionalChildren.find((n) => n.type === "list") as
      | List
      | undefined;
    if (listNode) {
      for (const item of listNode.children) {
        const parsed = parseConditionalListItem(item as ListItem);
        if (parsed.name) conditional.push(parsed);
      }
    }
  }

  return { context, conditional };
}

// ------------------------------------------------------------------ validation

function validateTypeName(name: string, line: number): ValidationError | null {
  if (!KEBAB_CASE.test(name)) {
    const suggestion = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return {
      line,
      message: `Type "${name}" is not kebab-case`,
      fix: `Rename to "${suggestion}" (lowercase ASCII letters, digits, and hyphens only, e.g., "api-gateway")`,
    };
  }
  return null;
}

// ------------------------------------------------------------------ main parser

/**
 * Parse a consolidation schema markdown string into structured JSON.
 * Returns errors array (empty on success) and optionally data.
 * data is present only when errors is empty (mutually exclusive).
 */
export function parseSchema(source: string): ParseResult {
  const errors: ValidationError[] = [];
  const tree = parseTree(source);
  const h2Sections = collectH2Sections(tree);

  // Build a lookup map by heading text (lowercased)
  const sectionMap = new Map<string, H2Section>();
  for (const section of h2Sections) {
    sectionMap.set(section.headingText.toLowerCase(), section);
  }

  // 1. Parse Meta
  const metaSection = sectionMap.get("meta");
  const meta = metaSection
    ? parseMeta(metaSection.children)
    : { ...DEFAULT_META };

  // 2. Parse Components
  const components: SchemaComponent[] = [];
  const componentSection = sectionMap.get("components");
  const seenNames = new Set<string>();

  if (componentSection) {
    const tableData = extractTable(componentSection.children);
    if (tableData) {
      for (let i = 0; i < tableData.rows.length; i++) {
        const row = tableData.rows[i];
        const line = tableData.rowLines[i];
        const name = (row["Component"] ?? "").trim();
        const description = (row["Description"] ?? "").trim();
        const type = (row["Type"] ?? "").trim();

        if (!name) continue;

        // Duplicate component name check
        if (seenNames.has(name)) {
          errors.push({
            line,
            message: `Duplicate component name "${name}" in Components table`,
            fix: `Each component must have a unique name. Remove or rename the duplicate "${name}" row.`,
          });
          continue;
        }
        seenNames.add(name);

        // Type name kebab-case validation
        if (type) {
          const typeError = validateTypeName(type, line);
          if (typeError) errors.push(typeError);
        }

        components.push({ name, description, type });
      }
    }
  }

  // 3. Parse Section blocks (## Sections: {type-name})
  const sections: Record<string, SectionBlock> = {};
  const sectionBlockRegex = /^sections:\s*(.+)$/i;

  for (const h2 of h2Sections) {
    const match = h2.headingText.match(sectionBlockRegex);
    if (!match) continue;

    const typeName = match[1].trim();

    // Validate type name for non-default blocks
    if (typeName !== "default") {
      const typeError = validateTypeName(typeName, h2.headingLine);
      if (typeError) {
        errors.push(typeError);
        // Still parse the block so other validations can proceed
      }
    }

    sections[typeName] = parseSectionBlock(h2.children);
  }

  // 4. Cross-reference validation: every non-empty Type in Components must have a Sections block
  for (const comp of components) {
    if (comp.type && !sections[comp.type]) {
      // Find the component row line for error reporting
      const compSection = sectionMap.get("components");
      const tableData = compSection ? extractTable(compSection.children) : null;
      let line = 0;
      if (tableData) {
        const idx = tableData.rows.findIndex(
          (r) => r["Component"] === comp.name,
        );
        if (idx >= 0) line = tableData.rowLines[idx];
      }
      errors.push({
        line,
        message: `Type "${comp.type}" in Components table has no matching "## Sections: ${comp.type}" block`,
        fix: `Add a "## Sections: ${comp.type}" block to the schema, or remove the type from the "${comp.name}" component row.`,
      });
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    data: { meta, components, sections },
    errors: [],
  };
}

// ------------------------------------------------------------------ CLI entrypoint

if (import.meta.main) {
  if (Deno.args.length === 0) {
    console.error("Usage: schema-parser.ts <schema-path>");
    Deno.exit(1);
  }

  const schemaPath = Deno.args[0];

  try {
    const source = await Deno.readTextFile(schemaPath);
    const result = parseSchema(source);

    if (result.errors.length > 0) {
      console.error(JSON.stringify({ errors: result.errors }, null, 2));
      Deno.exit(1);
    }

    console.log(JSON.stringify(result.data, null, 2));
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      console.error(`Error: file not found: ${schemaPath}`);
    } else {
      console.error(`Error: ${e}`);
    }
    Deno.exit(1);
  }
}
