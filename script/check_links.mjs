#!/usr/bin/env node
/**
 * Validate every internal link in the built site.
 *
 * `script/lint.mjs` only sees Markdown `[text](/path/)` syntax in the sources, so links
 * emitted by JSX components (ImgTable, the generated sidebar, ...) are never checked, and
 * neither is the mapping from a source filename to the route Astro actually emits.
 * This runs after `npm run build` and checks the HTML that ships, honouring the
 * `netlify.toml` redirect table.
 *
 * Usage:
 *   npm run build
 *   node script/check_links.mjs
 */

import { readdirSync, readFileSync, existsSync } from "fs";
import { join, relative, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const SKIP_DIRS = new Set(["_astro", "pagefind"]);
const MAX_HOPS = 5;

function htmlFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) out.push(...htmlFiles(join(dir, entry.name)));
    } else if (entry.name.endsWith(".html")) {
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

/** `/foo` and `/foo/` address the same page; index.html is implicit. */
const asRoute = (p) => (p.endsWith("/") ? p : `${p}/`);

/**
 * Parse the `[[redirects]]` blocks of netlify.toml. Not a TOML parser: the table is a flat
 * list of `from`/`to`/`status` triples, and anything richer should fail loudly here rather
 * than be silently mis-parsed.
 */
function loadRedirects() {
  const toml = readFileSync(join(ROOT, "netlify.toml"), "utf-8");
  const rules = [];
  for (const block of toml.split("[[redirects]]").slice(1)) {
    const stop = block.search(/^\s*\[\[?[a-z]/im);
    const body = stop === -1 ? block : block.slice(0, stop);
    const from = body.match(/^\s*from\s*=\s*"([^"]+)"/m);
    const to = body.match(/^\s*to\s*=\s*"([^"]+)"/m);
    if (from && to) rules.push({ from: from[1], to: to[1] });
  }
  return rules;
}

/**
 * Apply the first matching rule. `from` may contain a `*` wildcard (the table uses both the
 * trailing `/foo*` form and the mid-path `/*.html` form); whatever it captures fills `:splat`.
 */
function redirect(path, rules) {
  for (const { from, to } of rules) {
    if (from.includes("*")) {
      const pattern = new RegExp(`^${from.split("*").map(escapeRegExp).join("(.*)")}$`);
      const match = path.match(pattern);
      if (match) return to.replace(":splat", match[1]);
    } else if (path === from || asRoute(path) === asRoute(from)) {
      return to.replace(":splat", "");
    }
  }
  return null;
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isExternal = (url) => /^[a-z][a-z0-9+.-]*:/i.test(url);
/** A path is asset-like when it has a short extension that isn't the legacy `.html` form. */
const isAsset = (path) => /\.[a-z0-9]{2,5}$/i.test(path) && !path.endsWith(".html");

function main() {
  if (!existsSync(DIST)) {
    console.error("dist/ not found — run `npm run build` first.");
    process.exit(1);
  }

  const pages = htmlFiles(DIST);
  if (pages.length === 0) {
    console.error("dist/ contains no HTML — run `npm run build` first.");
    process.exit(1);
  }
  const anchors = new Map();
  for (const file of pages) {
    const route = `/${relative(DIST, file).replace(/index\.html$/, "")}`;
    const html = readFileSync(file, "utf-8");
    anchors.set(route, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }

  const rules = loadRedirects();
  const broken = new Map();

  for (const file of pages) {
    const source = `/${relative(DIST, file).replace(/index\.html$/, "")}`;
    const html = readFileSync(file, "utf-8");
    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
      if (href.startsWith("//") || !(href.startsWith("/") || href.startsWith("#"))) continue;

      if (href === "#_top") continue; // reserved browser target, always scrolls to the top
      const [target, fragment] = href.split("#");
      // A bare `#anchor` resolves against the page it sits on.
      const reason = resolve(target === "" ? source : target.split("?")[0], fragment, rules, anchors);
      if (reason) {
        if (!broken.has(href)) broken.set(href, { reason, pages: new Set() });
        broken.get(href).pages.add(source);
      }
    }
  }

  if (broken.size === 0) {
    console.log(`✓ All internal links in ${pages.length} built pages resolve.`);
    return;
  }

  const rows = [...broken.entries()].sort((a, b) => b[1].pages.size - a[1].pages.size);
  for (const [href, { reason, pages: sources }] of rows) {
    const [first] = sources;
    const more = sources.size > 1 ? ` and ${sources.size - 1} more page(s)` : "";
    console.log(`${href}\n  ${reason}\n  linked from ${first}${more}\n`);
  }
  console.error(`✗ ${broken.size} broken internal link(s) in the built site`);
  process.exit(1);
}

/** Returns null when the link resolves, otherwise a human-readable reason. */
function resolve(target, fragment, rules, anchors) {
  let path = target;
  for (let hop = 0; hop <= MAX_HOPS; hop++) {
    if (isExternal(path)) return null;

    if (isAsset(path)) {
      if (existsSync(join(DIST, path))) return null;
    } else {
      const route = asRoute(path);
      const ids = anchors.get(route);
      if (ids) {
        if (!fragment || ids.has(fragment) || ids.has(decodeURIComponent(fragment))) return null;
        return `page exists but has no anchor #${fragment}`;
      }
    }

    const next = redirect(path, rules);
    if (next === null) return "no such page, asset, or redirect";
    path = next.split("?")[0].split("#")[0];
  }
  return `redirect loop (more than ${MAX_HOPS} hops)`;
}

main();
