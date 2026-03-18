#!/usr/bin/env node
/**
 * Check (and optionally fix) alphabetical ordering of ImgTable blocks
 * in the components index page.
 *
 * Only operates on tables below the "## Network Protocols" heading.
 * Within each table the pinned order is:
 *   1. "Core" item   — at most one, the first name ending with " Core"
 *   2. "Template" items — names starting with "Template " (e.g. "Template Sensor")
 * All remaining items must be sorted case-insensitively by display name.
 *
 * Usage:
 *   node script/check_component_index.mjs                # check only (exit 1 if unsorted)
 *   node script/check_component_index.mjs --fix          # rewrite the file in-place
 *   node script/check_component_index.mjs --suggestions  # output JSON for CI review comments
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INDEX_REL = "src/content/docs/components/index.mdx";
const INDEX_PATH = join(__dirname, "..", INDEX_REL);
const SORT_AFTER_HEADING = "## Network Protocols";

// ── helpers ──────────────────────────────────────────────────────────────────

/** Extract the display name from a raw item line, e.g. '  ["Foo", …],' → 'Foo' */
function getName(line) {
  const m = line.match(/\["([^"]+)"/);
  return m ? m[1] : "";
}

/**
 * Identify the single "Core" entry in a table, if any.
 *
 * Each table has at most one core item — the primary entry point for
 * the section (e.g. "Sensor Core", "Display Core", "Switch Core").
 * A core item's display name ends with " Core".
 *
 * Only the *first* matching item is treated as core. This avoids
 * false positives like "Display Menu Core", which lives in the
 * Display Components table but is not the section's core item
 * (that role belongs to "Display Core").
 *
 * Product names that happen to contain "Core" as a substring
 * (e.g. "iAQ-Core") are not matched because the regex requires
 * a preceding whitespace character.
 */
function identifyCoreItem(lines) {
  for (let i = 0; i < lines.length; i++) {
    const name = getName(lines[i]);
    if (/\sCore$/i.test(name)) {
      return i;
    }
  }
  return -1;
}

/**
 * Decide whether an item is a "Template" entry.
 *
 * A template item's display name starts with "Template " (e.g.
 * "Template Sensor", "Template Switch"). These are pinned right
 * after Core items in each table, before the alphabetically sorted
 * remainder.
 */
function isTemplateItem(name) {
  return /^Template\s/i.test(name);
}

/** Normalize an item line to consistent 2-space indent + trailing comma */
function normalizeLine(line) {
  const stripped = line.trim().replace(/,$/, "");
  return `  ${stripped},`;
}

// ── main logic ───────────────────────────────────────────────────────────────

function processFile(content) {
  const headingIdx = content.indexOf(SORT_AFTER_HEADING);
  if (headingIdx === -1) {
    console.error(`Could not find "${SORT_AFTER_HEADING}" in ${INDEX_PATH}`);
    process.exit(2);
  }

  const before = content.slice(0, headingIdx);
  const after = content.slice(headingIdx);
  // Line number where the "after" region starts (1-indexed)
  const afterStartLine = before.split("\n").length;

  const tableRe = /(<ImgTable items=\{\[\n)([\s\S]*?)(\]\} \/>)/g;

  const results = []; // { section, startLine, endLine, original, fixed }
  let tableIndex = 0;

  const replaced = after.replace(
    tableRe,
    (match, prefix, itemsText, suffix, offset) => {
      tableIndex++;

      // Section heading for context
      const textBefore = after.slice(0, offset);
      const headingMatch = textBefore.match(/^(#{2,3}) (.+)$/gm);
      const sectionName = headingMatch
        ? headingMatch[headingMatch.length - 1].replace(/^#+\s*/, "")
        : `table #${tableIndex}`;

      // Parse item lines (skip blanks)
      const allItemLines = itemsText.split("\n");
      const lines = allItemLines.filter((l) => l.trim().length > 0);

      if (lines.length <= 1) return match;

      // Core item stays first (at most one), then Template items, then the rest sorted
      const coreIdx = identifyCoreItem(lines);
      const coreLines = coreIdx >= 0 ? [lines[coreIdx]] : [];
      const templateLines = lines.filter(
        (_, i) => i !== coreIdx && isTemplateItem(getName(lines[i])),
      );
      const restLines = lines.filter(
        (_, i) => i !== coreIdx && !isTemplateItem(getName(lines[i])),
      );

      const sorted = [...restLines].sort((a, b) =>
        getName(a).toLowerCase().localeCompare(getName(b).toLowerCase()),
      );

      const expectedOrder = [...coreLines, ...templateLines, ...sorted];
      const isFullyOrdered = lines.every(
        (line, i) => getName(line) === getName(expectedOrder[i]),
      );

      if (!isFullyOrdered) {
        // Compute 1-indexed line numbers in the original file.
        // offset is the position within `after`; the items text starts
        // after the prefix (<ImgTable items={[\n).
        const prefixLines = prefix.split("\n").length - 1; // lines consumed by prefix
        const linesBeforeInAfter = after.slice(0, offset).split("\n").length - 1;
        const startLine = afterStartLine + linesBeforeInAfter + prefixLines;
        const endLine = startLine + allItemLines.filter((l) => l.trim().length > 0).length - 1;

        const originalBlock = lines.map(normalizeLine).join("\n");
        const fixedBlock = [...coreLines, ...templateLines, ...sorted]
          .map(normalizeLine)
          .join("\n");

        results.push({
          section: sectionName,
          startLine,
          endLine,
          original: originalBlock,
          fixed: fixedBlock,
        });
      }

      // Build the fixed version (used by --fix)
      const fixedResult = [...coreLines, ...templateLines, ...sorted]
        .map(normalizeLine)
        .join("\n");

      return `${prefix}${fixedResult}\n${suffix}`;
    },
  );

  return { before, after: replaced, results };
}

// ── entry point ──────────────────────────────────────────────────────────────

const mode = process.argv.includes("--fix")
  ? "fix"
  : process.argv.includes("--suggestions")
    ? "suggestions"
    : "check";

const content = readFileSync(INDEX_PATH, "utf-8");
const { before, after, results } = processFile(content);

if (results.length === 0) {
  console.log("All ImgTable blocks are correctly sorted.");
  process.exit(0);
}

switch (mode) {
  case "fix":
    writeFileSync(INDEX_PATH, before + after, "utf-8");
    console.log(`Fixed ${results.length} ImgTable block(s) in ${INDEX_PATH}`);
    process.exit(0);
    break;

  case "suggestions":
    // Output JSON consumed by the GitHub Actions workflow.
    // Each entry has the file path, line range, and the suggested replacement.
    console.log(
      JSON.stringify({
        file: INDEX_REL,
        suggestions: results.map((r) => ({
          section: r.section,
          startLine: r.startLine,
          endLine: r.endLine,
          body: r.fixed,
        })),
      }),
    );
    process.exit(1);
    break;

  default:
    console.error(
      "Component index ImgTable blocks are not sorted correctly:\n",
    );
    for (const r of results) {
      console.error(`  ${r.section} (lines ${r.startLine}-${r.endLine})`);
    }
    console.error(
      "\nRun `node script/check_component_index.mjs --fix` to fix automatically.",
    );
    process.exit(1);
}
