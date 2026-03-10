/**
 * Build a map of anchor slug → source file path from all MDAST files.
 *
 * Handles:
 *   - heading nodes  → slugify the heading text
 *   - <span id="..."> elements (mdxJsxFlowElement with name "span")
 */

import fs from 'node:fs';
import { slugify, getText } from './nodes.js';

/** Map: anchor-slug → source-file-path (the .mdx source, not the .json) */
const anchors = new Map();

/** Missing anchors encountered during link conversion */
export const missingAnchors = new Set();

/**
 * Build the anchor map from a list of MDAST JSON file paths.
 * @param {string[]} mdastFiles  Absolute paths to .json files in dist-mdast/
 */
export function buildAnchors(mdastFiles) {
  for (const file of mdastFiles) {
    if (!fs.existsSync(file)) continue;
    let data;
    try {
      data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    } catch {
      continue;
    }
    const source = data.source; // original .mdx path
    if (data.mdast) walkNode(data.mdast, source);
  }
}

function walkNode(node, source) {
  if (!node) return;

  if (node.type === 'heading') {
    const text = getText(node).trim();
    if (text) {
      const slug = slugify(text);
      if (!anchors.has(slug)) anchors.set(slug, source);
    }
  } else if (node.type === 'mdxJsxFlowElement' && node.name === 'span') {
    const idAttr = (node.attributes ?? []).find(a => a.name === 'id');
    if (idAttr && typeof idAttr.value === 'string') {
      anchors.set(idAttr.value, source);
    }
  }

  if (node.children) {
    for (const child of node.children) walkNode(child, source);
  }
}

/** Resolve an anchor slug to its source file path, or null. */
export function resolveAnchor(anchor) {
  return anchors.get(anchor) ?? null;
}

/** Check if an anchor is registered. */
export function hasAnchor(anchor) {
  return anchors.has(anchor);
}

/**
 * Convert a source file path to a URL path (without deploy base URL).
 * e.g. ".../src/content/docs/components/api.mdx" → "/components/api"
 */
export function sourceToUrlPath(sourcePath) {
  const normalized = sourcePath.replace(/\\/g, '/');
  const marker = '/src/content/docs/';
  const idx = normalized.indexOf(marker);
  if (idx === -1) return '';

  const relative = normalized.slice(idx + marker.length);
  // remove extension
  const withoutExt = relative.replace(/\.[^./]+$/, '');
  const parts = withoutExt.split('/');
  // index file → just the directory
  if (parts[parts.length - 1] === 'index') parts.pop();
  return '/' + parts.join('/');
}

/**
 * Convert a local #anchor reference to a full URL.
 * Returns null if the anchor is not found.
 */
export function anchorToUrl(anchor, deployUrl) {
  const source = resolveAnchor(anchor);
  if (!source) {
    if (!missingAnchors.has(anchor)) missingAnchors.add(anchor);
    return null;
  }
  return deployUrl + sourceToUrlPath(source) + '#' + anchor;
}
