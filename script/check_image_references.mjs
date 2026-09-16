#!/usr/bin/env node
/**
 * Check that every image referenced by an `ImgTable` entry exists on disk.
 *
 * The `ImgTable` component (src/components/ImgTable.astro) takes each image as a
 * plain string and resolves it to a runtime URL. Because the strings are not
 * Astro `import`s, `npm run build` does not validate them: a reference to a
 * missing `public/images/*` file compiles fine and only 404s in the browser.
 * This script closes that gap by mirroring ImgTable's `resolveImagePath()` rules
 * and confirming each resolved file is present.
 *
 * Scans every `.mdx` file under src/content/docs/ for `ImgTable` usages and, for
 * each item `[title, link, image, ...]`, keys off the image at position 2 (items
 * may carry optional caption / "dark-invert" params after it, so the last element
 * is not reliable). The items expression is tokenized rather than matched line by
 * line, so single- or double-quoted values, tuples split across several physical
 * lines, and commented-out example items are all handled correctly.
 *
 * Resolution rules (matching resolveImagePath):
 *   - "http://", "https://" or "//" (protocol-relative) prefix: external, skipped.
 *   - "/" prefix: maps to `public<string>` (e.g. /images/foo.svg -> public/images/foo.svg).
 *   - anything else: maps to `public/images/<string>`.
 *
 * Usage:
 *   node script/check_image_references.mjs   # exit 0 if all resolve, 1 if any are missing
 */

import { readFileSync, statSync, readdirSync } from "fs";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO_ROOT = join(__dirname, "..");
const CONTENT_DIR = join(REPO_ROOT, "src/content/docs");

// Matches an <ImgTable items={[ ... ]} /> block, tolerating whitespace and
// newline variations in the opening tag, inside the JSX expression braces
// (e.g. `items={ [ ... ] }`), and before the self-closing `/>`. Group 1 is the
// opening tag (used to locate where the items text begins); group 2 is the
// items text itself.
const TABLE_RE = /(<ImgTable\s+items\s*=\s*\{\s*\[)([\s\S]*?)\]\s*\}\s*\/>/g;

/** Recursively collect every `.mdx` file under `dir`. */
function collectMdxFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...collectMdxFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      found.push(full);
    }
  }
  return found;
}

/**
 * Tokenize the text inside `items={[ ... ]}` into item tuples.
 *
 * Walks the expression character by character so it is not fooled by values that
 * span several physical lines, single- vs double-quoted strings, `//` sequences
 * inside a string (e.g. `https://`), or commented-out example items. Each yielded
 * tuple lists the string literals it contains together with the 1-indexed line on
 * which each literal opened.
 *
 * @param {string} itemsText Text between the outer `[` and `]` of the items array
 * @param {number} startLine 1-indexed line in the file where `itemsText` begins
 * @returns {Generator<{strings: Array<{value: string, line: number}>}>}
 */
function* parseTuples(itemsText, startLine) {
  let depth = 0;
  let line = startLine;
  let quote = null; // active string delimiter, or null when outside a string
  let value = "";
  let valueLine = 0;
  let strings = [];
  const n = itemsText.length;

  for (let i = 0; i < n; i++) {
    const c = itemsText[i];

    if (quote !== null) {
      if (c === "\\") {
        value += itemsText[i + 1] ?? "";
        i++;
      } else if (c === quote) {
        strings.push({ value, line: valueLine });
        quote = null;
      } else {
        if (c === "\n") line++;
        value += c;
      }
      continue;
    }

    if (c === "\n") {
      line++;
    } else if (c === "/" && itemsText[i + 1] === "/") {
      // Line comment: skip to end of line (the newline is counted next pass).
      while (i + 1 < n && itemsText[i + 1] !== "\n") i++;
    } else if (c === "/" && itemsText[i + 1] === "*") {
      i += 2;
      while (i < n && !(itemsText[i] === "*" && itemsText[i + 1] === "/")) {
        if (itemsText[i] === "\n") line++;
        i++;
      }
      i++; // consume the "/" of the closing "*/"
    } else if (c === '"' || c === "'" || c === "`") {
      quote = c;
      value = "";
      valueLine = line;
    } else if (c === "[") {
      if (depth === 0) strings = [];
      depth++;
    } else if (c === "]") {
      depth--;
      if (depth === 0) yield { strings };
    }
  }
}

/**
 * Resolve an ImgTable image string to a path under `public/`, or null when the
 * reference is external and should not be checked.
 *
 * @param {string} image The raw image string from an ImgTable item
 * @returns {string|null} Repo-relative path to the expected file, or null
 */
function resolveImageFile(image) {
  // Protocol-relative ("//cdn.example/x.svg") and absolute http(s) URLs are
  // external; ImgTable serves them as-is, so there is nothing on disk to check.
  if (image.startsWith("//") || image.startsWith("http://") || image.startsWith("https://")) {
    return null;
  }
  if (image.startsWith("/")) {
    return join("public", image);
  }
  return join("public", "images", image);
}

/** True only when `path` exists and is a regular file (not a directory). */
function isRegularFile(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

/**
 * Extract missing image references from a single file's content.
 *
 * @param {string} content File contents
 * @returns {Array<{line: number, image: string, resolved: string}>} Missing refs
 */
function findMissingRefs(content) {
  const missing = [];
  let match;
  TABLE_RE.lastIndex = 0;
  while ((match = TABLE_RE.exec(content)) !== null) {
    // Absolute 1-indexed line where the captured items text begins, derived from
    // the opening tag's length so it stays correct regardless of tag formatting.
    const itemsOffset = match.index + match[1].length;
    const itemsStartLine = content.slice(0, itemsOffset).split("\n").length;

    for (const { strings } of parseTuples(match[2], itemsStartLine)) {
      // A valid item has at least title, link and image.
      if (strings.length < 3) continue;

      const { value: image, line } = strings[2];
      const resolved = resolveImageFile(image);
      if (resolved === null) continue;

      if (!isRegularFile(join(REPO_ROOT, resolved))) {
        missing.push({ line, image, resolved });
      }
    }
  }
  return missing;
}

// ── entry point ──────────────────────────────────────────────────────────────

const files = collectMdxFiles(CONTENT_DIR).sort();
const failures = [];

for (const file of files) {
  const content = readFileSync(file, "utf-8");
  const missing = findMissingRefs(content);
  for (const m of missing) {
    failures.push({ file: relative(REPO_ROOT, file), ...m });
  }
}

if (failures.length === 0) {
  console.log("All ImgTable image references resolve to existing files.");
  process.exit(0);
}

console.error("ImgTable references point to image files that do not exist:\n");
for (const f of failures) {
  console.error(`  ${f.file}:${f.line}: "${f.image}" -> ${f.resolved} (missing)`);
}
console.error(`\nFound ${failures.length} missing image reference(s).`);
process.exit(1);
