#!/usr/bin/env node
/**
 * schema-doc — add docs from MDAST exports to ESPHome JSON schema files.
 *
 * Usage:
 *   node script/schema-doc/index.js <schema-dir> [options]
 *
 * Options:
 *   --mdast-dir <dir>    Directory containing dist-mdast JSON files (default: dist-mdast)
 *   --single <filter>    Process only files whose path contains <filter>
 *   --debug-level <n>    Verbosity level (default: 0)
 *   --deploy-url <url>   Base URL for generated links (default: https://esphome.io)
 *
 * Examples:
 *   node script/schema-doc/index.js ~/.esphome-language-server/dev/schema
 *   node script/schema-doc/index.js ~/.esphome-language-server/dev/schema --single api
 *   node script/schema-doc/index.js ~/.esphome-language-server/dev/schema --debug-level 3
 */

import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

import { buildAnchors, missingAnchors } from "./anchors.js";
import { initSchema, saveAllSchemas, loadSchema } from "./schema.js";
import { initProcessor, processFile, stats } from "./processor.js";

// ─── Argument parsing ─────────────────────────────────────────────────────────

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    "mdast-dir": { type: "string", default: "dist-mdast" },
    single: { type: "string", default: "" },
    "debug-level": { type: "string", default: "0" },
    "deploy-url": { type: "string", default: "https://esphome.io" },
  },
  allowPositionals: true,
});

const schemaDir = positionals[0];
if (!schemaDir) {
  console.error(
    "Usage: node script/schema-doc/index.js <schema-dir> [options]",
  );
  process.exit(1);
}

const mdastDir = path.resolve(values["mdast-dir"]);
const singleFilter = values["single"];
const debugLevel = parseInt(values["debug-level"], 10) || 0;
const deployUrl = values["deploy-url"];

if (!fs.existsSync(schemaDir)) {
  console.error(`Schema dir not found: ${schemaDir}`);
  process.exit(1);
}
if (!fs.existsSync(mdastDir)) {
  console.error(`MDAST dir not found: ${mdastDir}`);
  process.exit(1);
}

// ─── Initialize modules ───────────────────────────────────────────────────────

initSchema(path.resolve(schemaDir));
initProcessor({ deployUrl, debugLevel });

// ─── Build file list ──────────────────────────────────────────────────────────

/** Walk a directory recursively, collecting .json file paths. */
function collectJsonFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...collectJsonFiles(full));
    else if (entry.name.endsWith(".json")) results.push(full);
  }
  return results;
}

// Files to process (components + actions)
let processFiles = collectJsonFiles(path.join(mdastDir, "components"));
const actionsFile = path.join(mdastDir, "automations", "actions.json");
if (fs.existsSync(actionsFile)) processFiles.push(actionsFile);

// Extra files used only for anchor resolution (not processed for docs)
const anchorOnlyFiles = [
  path.join(mdastDir, "automations", "templates.json"), // config-lambda, config-templatable
  path.join(mdastDir, "guides", "configuration-types.json"), // config-id, config-pin_schema
  path.join(mdastDir, "web-api", "index.json"), // api-rest
];

// ─── Build anchor map ─────────────────────────────────────────────────────────

console.log("Building anchor map...");
buildAnchors([...processFiles, ...anchorOnlyFiles]);

// ─── Apply single-file filter ─────────────────────────────────────────────────

if (singleFilter) {
  const before = processFiles.length;
  const normalized = singleFilter.replace(/\\/g, "/");
  processFiles = processFiles.filter((f) =>
    f.replace(/\\/g, "/").includes(normalized),
  );
  console.log(
    `Filter "${singleFilter}": ${processFiles.length}/${before} files`,
  );
}

// ─── Process files ────────────────────────────────────────────────────────────

console.log(`Processing ${processFiles.length} files...`);

for (const mdastFile of processFiles) {
  if (!fs.existsSync(mdastFile)) {
    if (debugLevel > 0) console.log(`  [skip] missing: ${mdastFile}`);
    continue;
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(mdastFile, "utf-8"));
  } catch (e) {
    console.error(`  [error] parsing ${mdastFile}: ${e.message}`);
    continue;
  }

  if (debugLevel > 1) {
    const rel = path.relative(mdastDir, mdastFile);
    console.log(`  Processing: ${rel}`);
  }

  try {
    processFile(data);
  } catch (e) {
    const rel = path.relative(mdastDir, mdastFile);
    console.error(`  [error] ${rel}: ${e.message}`);
    if (debugLevel > 2) console.error(e.stack);
  }
}

// ─── Save schemas ─────────────────────────────────────────────────────────────

console.log("Saving schemas...");
saveAllSchemas();

// ─── Report ───────────────────────────────────────────────────────────────────

console.log("\n── Stats ──");
console.log(`  core component docs:    ${stats.coreDocs}`);
console.log(`  core platform docs:     ${stats.corePlatformDocs}`);
console.log(`  platform component docs:${stats.platformDocs}`);
console.log(`  config props:           ${stats.props}`);
console.log(`  enum values:            ${stats.enumDocs}`);
console.log(`  action docs:            ${stats.actionDocs}`);
console.log(`  condition docs:         ${stats.conditionDocs}`);

if (missingAnchors.size > 0) {
  console.log(`\n── Missing anchors (${missingAnchors.size}) ──`);
  for (const a of [...missingAnchors].slice(0, 20)) {
    console.log(`  #${a}`);
  }
  if (missingAnchors.size > 20) {
    console.log(`  ... and ${missingAnchors.size - 20} more`);
  }
}
