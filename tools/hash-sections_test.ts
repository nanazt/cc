import { assertEquals, assertNotEquals, assertMatch } from "jsr:@std/assert";
import { normalize, hashSections, hashFile } from "./hash-sections.ts";

const FIXTURES = new URL("./tests/fixtures/", import.meta.url).pathname;

Deno.test("basic H2 extraction", async () => {
  const source = await Deno.readTextFile(`${FIXTURES}basic.md`);
  const sections = await hashSections(source);

  assertEquals(sections.length, 2);
  assertEquals(sections[0].heading, "Section One");
  assertEquals(sections[1].heading, "Section Two");
  assertMatch(sections[0].hash, /^[0-9a-f]{8}$/);
  assertMatch(sections[1].hash, /^[0-9a-f]{8}$/);
});

Deno.test("code block safety", async () => {
  const source = await Deno.readTextFile(`${FIXTURES}code-block.md`);
  const sections = await hashSections(source);

  assertEquals(sections.length, 1);
  assertEquals(sections[0].heading, "Real Section");
});

Deno.test("tilde fence handling", async () => {
  const source = await Deno.readTextFile(`${FIXTURES}tilde-fence.md`);
  const sections = await hashSections(source);

  assertEquals(sections.length, 1);
  assertEquals(sections[0].heading, "Tilde Test");
});

Deno.test("normalization: trailing whitespace", async () => {
  // normalize() directly
  assertEquals(normalize("text   \n"), normalize("text\n"));

  // hashSections with trailing whitespace vs without
  const withTrailing = "## Test\nSome text   \nMore text\t\n";
  const withoutTrailing = "## Test\nSome text\nMore text\n";
  const sectionsA = await hashSections(withTrailing);
  const sectionsB = await hashSections(withoutTrailing);

  assertEquals(sectionsA[0].hash, sectionsB[0].hash);
});

Deno.test("normalization: consecutive blank lines", async () => {
  // normalize() directly
  assertEquals(normalize("a\n\n\n\nb"), normalize("a\n\nb"));

  // hashSections with 4 blank lines vs 1
  const withManyBlanks = "## Test\nParagraph one.\n\n\n\n\nParagraph two.\n";
  const withOneBLank = "## Test\nParagraph one.\n\nParagraph two.\n";
  const sectionsA = await hashSections(withManyBlanks);
  const sectionsB = await hashSections(withOneBLank);

  assertEquals(sectionsA[0].hash, sectionsB[0].hash);
});

Deno.test("determinism", async () => {
  const source = await Deno.readTextFile(`${FIXTURES}determinism.md`);

  const results: string[] = [];
  for (let i = 0; i < 10; i++) {
    const sections = await hashSections(source);
    results.push(sections[0].hash);
  }

  for (let i = 1; i < 10; i++) {
    assertEquals(results[i], results[0]);
  }
});

Deno.test("JSON output format", async () => {
  const result = await hashFile(`${FIXTURES}json-format.md`);

  // path is a string ending with json-format.md
  assertEquals(typeof result.path, "string");
  assertEquals(result.path.endsWith("json-format.md"), true);

  // sections is an array with at least one entry
  assertEquals(Array.isArray(result.sections), true);
  assertEquals(result.sections.length >= 1, true);

  // each section has heading (string) and hash (string)
  for (const section of result.sections) {
    assertEquals(typeof section.heading, "string");
    assertEquals(typeof section.hash, "string");
    assertMatch(section.hash, /^[0-9a-f]{8}$/);
  }
});

Deno.test("header included in hash", async () => {
  const sectionsA = await hashSections(
    "## Original Name\n\nSome content here.\n",
  );
  const sectionsB = await hashSections(
    "## Changed Name\n\nSome content here.\n",
  );

  assertNotEquals(sectionsA[0].hash, sectionsB[0].hash);
});

Deno.test("empty section", async () => {
  const source = await Deno.readTextFile(`${FIXTURES}empty-section.md`);
  const sections = await hashSections(source);

  assertEquals(sections.length, 2);
  assertEquals(sections[0].heading, "Empty");
  assertEquals(sections[1].heading, "Has Content");
  assertEquals(sections[0].hash.length, 8);
  assertMatch(sections[0].hash, /^[0-9a-f]{8}$/);
});

Deno.test("multiple files", async () => {
  const fileA = await hashFile(`${FIXTURES}multi-file-a.md`);
  const fileB = await hashFile(`${FIXTURES}multi-file-b.md`);

  assertEquals(fileA.sections.length, 1);
  assertEquals(fileA.sections[0].heading, "Alpha");
  assertEquals(fileA.path.includes("multi-file-a.md"), true);

  assertEquals(fileB.sections.length, 1);
  assertEquals(fileB.sections[0].heading, "Beta");
  assertEquals(fileB.path.includes("multi-file-b.md"), true);

  // Different content = different hash
  assertNotEquals(fileA.sections[0].hash, fileB.sections[0].hash);
});
