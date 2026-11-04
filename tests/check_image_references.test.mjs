import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { after, before, describe, test } from "node:test";
import { findMissingRefs } from "../script/check_image_references.mjs";

const SCRIPT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../script/check_image_references.mjs");

/**
 * Wrap items in an ImgTable block, one item per line starting at line 2.
 *
 * @param {string[]} items
 * @returns {string}
 */
function table(items) {
  return `<ImgTable items={[\n${items.join("\n")}\n]} />`;
}

describe("findMissingRefs", () => {
  test("skips valid badges", () => {
    assert.deepEqual(findMissingRefs(table([`  ["ESP32", "/components/esp32/", "badge:ESP32_S3"],`])), []);
  });

  test("reports invalid badge names", () => {
    const content = table([`  ["A", "/a/", "badge:ESP.NOW"],`, `  ["B", "/b/", "badge:"],`]);
    assert.deepEqual(findMissingRefs(content), [
      {
        line: 2,
        image: "badge:ESP.NOW",
        problem: "invalid badge name, use letters, digits, hyphens and underscores only",
      },
      { line: 3, image: "badge:", problem: "invalid badge name, use letters, digits, hyphens and underscores only" },
    ]);
  });

  test("reports missing files with the resolved path", () => {
    const content = table([`  ["A", "/a/", "nope-missing.svg"],`, `  ["B", "/b/", "/images/nope-abs.svg"],`]);
    assert.deepEqual(findMissingRefs(content), [
      { line: 2, image: "nope-missing.svg", problem: "public/images/nope-missing.svg (missing)" },
      { line: 3, image: "/images/nope-abs.svg", problem: "public/images/nope-abs.svg (missing)" },
    ]);
  });

  test("accepts existing files", () => {
    assert.deepEqual(findMissingRefs(table([`  ["Host", "/components/host/", "host.svg"],`])), []);
  });

  test("skips external URLs", () => {
    const content = table([
      `  ["A", "/a/", "https://example.com/a.svg"],`,
      `  ["B", "/b/", "http://example.com/b.svg"],`,
      `  ["C", "/c/", "//example.com/c.svg"],`,
    ]);
    assert.deepEqual(findMissingRefs(content), []);
  });

  test("skips items with fewer than three strings", () => {
    assert.deepEqual(findMissingRefs(table([`  ["A", "/a/"],`])), []);
  });

  test("returns nothing for content without an ImgTable", () => {
    assert.deepEqual(findMissingRefs("plain text"), []);
  });

  test("treats a directory as missing", () => {
    assert.equal(findMissingRefs(table([`  ["A", "/a/", "/images"],`])).length, 1);
  });

  test("handles comments, escapes and multi-line strings", () => {
    const content = table([
      `  // ["C", "/c/", "commented-out.svg"],`,
      `  /* ["D", "/d/", "block-commented.svg"],`,
      `  */`,
      `  ["E\\"q", "/e/", "esc-missing.svg"],`,
      `  ["F", "/f/", "multi`,
      `line.svg"],`,
    ]);
    const result = findMissingRefs(content);
    assert.deepEqual(
      result.map((r) => r.image),
      ["esc-missing.svg", "multi\nline.svg"],
    );
  });
});

describe("CLI", () => {
  /** @type {string} */
  let tmp;

  before(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "check-images-"));
  });

  after(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  /**
   * Run the real script in a subprocess, optionally preloading a module first.
   *
   * @param {string[]} nodeArgs
   * @returns {import("node:child_process").SpawnSyncReturns<string>}
   */
  function run(nodeArgs) {
    return spawnSync(process.execPath, [...nodeArgs, SCRIPT], { encoding: "utf-8", cwd: tmp });
  }

  test("exits 0 with a success message on the real docs", () => {
    const result = run([]);
    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), "All ImgTable image references resolve to existing files.");
    assert.equal(result.stderr, "");
  });

  test("exits 1 and lists every problem", () => {
    // Preload a module that makes the script see one extra docs file with two problems.
    const preload = path.join(tmp, "preload.mjs");
    fs.writeFileSync(
      preload,
      `import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";
const content = ${JSON.stringify(table([`  ["A", "/a/", "badge:ESP.NOW"],`, `  ["B", "/b/", "missing-file.svg"],`]))};
const readdirSync = fs.readdirSync;
const readFileSync = fs.readFileSync;
fs.readdirSync = (dir, opts) =>
  String(dir).endsWith("docs")
    ? [{ name: "x.mdx", isDirectory: () => false, isFile: () => true }]
    : readdirSync(dir, opts);
fs.readFileSync = (file, ...rest) => (String(file).endsWith("x.mdx") ? content : readFileSync(file, ...rest));
syncBuiltinESMExports();
`,
    );
    const result = run(["--import", pathToFileURL(preload).href]);
    assert.equal(result.status, 1);
    assert.equal(result.stdout, "");
    assert.ok(result.stderr.includes(`src/content/docs/x.mdx:2: "badge:ESP.NOW" -> invalid badge name`));
    assert.ok(
      result.stderr.includes(
        `src/content/docs/x.mdx:3: "missing-file.svg" -> public/images/missing-file.svg (missing)`,
      ),
    );
    assert.ok(result.stderr.includes("Found 2 broken image reference(s)."));
  });
});
