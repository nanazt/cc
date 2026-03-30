import { unified } from "npm:unified@^11.0.0";
import remarkParse from "npm:remark-parse@^11.0.0";
import { toString } from "npm:mdast-util-to-string@^4.0.0";
import type { Heading, Root } from "npm:@types/mdast@^4.0.0";

interface Section {
  heading: string;
  hash: string;
}

interface FileResult {
  path: string;
  sections: Section[];
}

/**
 * Normalize section text before hashing.
 * - Normalizes line endings to LF
 * - Strips trailing whitespace per line
 * - Collapses 3+ consecutive newlines to 2
 */
export function normalize(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n");
}

/**
 * Compute SHA-256 and return first 8 hex characters.
 */
async function sha256Hex8(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 8);
}

/**
 * Parse markdown source and return hashes for each H2 section.
 * Pre-first-H2 content is excluded (D-13).
 * Position offsets slice original source bytes — no AST roundtrip (D-01).
 */
export async function hashSections(source: string): Promise<Section[]> {
  const tree: Root = unified().use(remarkParse).parse(source);

  // Collect indices of H2 nodes in tree.children
  const h2Indices: number[] = [];
  for (let i = 0; i < tree.children.length; i++) {
    const node = tree.children[i];
    if (node.type === "heading" && (node as Heading).depth === 2) {
      h2Indices.push(i);
    }
  }

  // No H2 sections: return empty array (D-04)
  if (h2Indices.length === 0) {
    return [];
  }

  const sections: Section[] = [];
  for (let j = 0; j < h2Indices.length; j++) {
    const headingNode = tree.children[h2Indices[j]] as Heading;

    // Extract clean heading text (D-12): strips ## markers, bold/emphasis/code markup
    const heading = toString(headingNode);

    // Slice original source bytes using position offsets (D-01)
    const startOffset = headingNode.position!.start.offset!;
    const endOffset =
      j + 1 < h2Indices.length
        ? tree.children[h2Indices[j + 1]].position!.start.offset!
        : source.length;

    const sectionText = source.slice(startOffset, endOffset);
    const hash = await sha256Hex8(normalize(sectionText));

    sections.push({ heading, hash });
  }

  return sections;
}

/**
 * Hash all H2 sections in a file.
 * Returns the path as given (no normalization, D-06).
 */
export async function hashFile(path: string): Promise<FileResult> {
  const source = await Deno.readTextFile(path);
  const sections = await hashSections(source);
  return { path, sections };
}

// CLI entrypoint (D-11: import.meta.main guard)
if (import.meta.main) {
  if (Deno.args.length === 0) {
    console.error("Usage: hash-sections.ts <file1.md> [file2.md ...]");
    Deno.exit(1);
  }

  let hasError = false;
  const files: FileResult[] = [];

  // Sequential processing (D-14: no parallelism)
  for (const path of Deno.args) {
    try {
      const source = await Deno.readTextFile(path);
      const sections = await hashSections(source);
      files.push({ path, sections });
    } catch (e) {
      hasError = true;
      if (e instanceof Deno.errors.NotFound) {
        console.error(`Error: file not found: ${path}`);
      } else {
        console.error(`Error reading ${path}: ${e}`);
      }
    }
  }

  console.log(JSON.stringify({ files }, null, 2));

  if (hasError) {
    Deno.exit(1);
  }
}
