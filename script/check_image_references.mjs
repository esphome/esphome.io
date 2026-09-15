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
 * is not reliable).
 *
 * Resolution rules (matching resolveImagePath):
 *   - "http://" or "https://" prefix: external, skipped.
 *   - "/" prefix: maps to `public<string>` (e.g. /images/foo.svg -> public/images/foo.svg).
 *   - anything else: maps to `public/images/<string>`.
 *
 * Usage:
 *   node script/check_image_references.mjs   # exit 0 if all resolve, 1 if any are missing
 */

import { readFileSync, existsSync, readdirSync } from "fs";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO_ROOT = join(__dirname, "..");
const CONTENT_DIR = join(REPO_ROOT, "src/content/docs");

// Matches an <ImgTable items={[ ... ]} /> block. The captured group 1 is the
// items text; group 2 is used only to know where the block starts.
const TABLE_RE = /<ImgTable items=\{\[\n([\s\S]*?)\]\} \/>/g;

// Matches a double-quoted string literal (no escaped quotes appear in item data).
const STRING_RE = /"([^"]*)"/g;

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
 * Resolve an ImgTable image string to a path under `public/`, or null when the
 * reference is external and should not be checked.
 *
 * @param {string} image The raw image string from an ImgTable item
 * @returns {string|null} Repo-relative path to the expected file, or null
 */
function resolveImageFile(image) {
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return null;
  }
  if (image.startsWith("/")) {
    return join("public", image);
  }
  return join("public", "images", image);
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
    const itemsText = match[1];
    // Line number (1-indexed) where the items text begins. The opener line is
    // consumed by the regex, so the first item line is one after it.
    const blockStartLine = content.slice(0, match.index).split("\n").length + 1;

    const itemLines = itemsText.split("\n");
    for (let i = 0; i < itemLines.length; i++) {
      const line = itemLines[i];
      const trimmed = line.trim();
      if (trimmed.length === 0) continue;
      // Skip commented-out lines. The release-post template ships a commented
      // example item (`// ["Component Name", ..., "image.png"]`) that must not
      // be treated as a live reference.
      if (trimmed.startsWith("//")) continue;

      const strings = [...line.matchAll(STRING_RE)].map((m) => m[1]);
      // A valid item has at least title, link and image. Skip anything shorter
      // (blank continuations or non-item lines).
      if (strings.length < 3) continue;

      const image = strings[2];
      const resolved = resolveImageFile(image);
      if (resolved === null) continue;

      if (!existsSync(join(REPO_ROOT, resolved))) {
        missing.push({ line: blockStartLine + i, image, resolved });
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
