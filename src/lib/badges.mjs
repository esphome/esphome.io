/**
 * Component name badges.
 *
 * An `ImgTable` item can use `badge:<Name>` instead of an image file, e.g.
 * `["ADE7880", "/components/sensor/ade7880/", "badge:ADE7880"]`. The badge SVG
 * is generated at build time by `src/pages/images/badges/[name].svg.ts` using
 * @esphome/component-image-generator, and served from `badgeImagePath(name)`.
 *
 * Names use letters, digits, hyphens and underscores. Underscores are rendered as
 * spaces, and the URL uses the lowercased name.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const BADGE_PREFIX = "badge:";

const BADGE_NAME_RE = /^[A-Za-z0-9_-]+$/;

// A quoted `badge:` string literal in MDX source. Group 2 is the name.
const BADGE_REF_RE = /(["'`])badge:(.*?)\1/g;

/**
 * The badge name of an `ImgTable` image value, or null when it is not a badge.
 *
 * @param {string} image
 * @returns {string | null}
 */
export function badgeName(image) {
  return image.startsWith(BADGE_PREFIX) ? image.slice(BADGE_PREFIX.length) : null;
}

/**
 * Whether a badge name only uses letters, digits, hyphens and underscores.
 *
 * @param {string} name
 * @returns {boolean}
 */
export function isValidBadgeName(name) {
  return BADGE_NAME_RE.test(name);
}

/**
 * Public URL of the generated badge for a name.
 *
 * @param {string} name
 * @returns {string}
 */
export function badgeImagePath(name) {
  return `/images/badges/${name.toLowerCase()}.svg`;
}

/**
 * Every badge name referenced in a piece of MDX source, in order of appearance.
 *
 * @param {string} content
 * @returns {string[]}
 */
export function findBadgeNames(content) {
  return Array.from(content.matchAll(BADGE_REF_RE), (match) => match[2]);
}

/**
 * Collect the sorted, de-duplicated badge names referenced by every `.mdx`
 * file under `dir`. Throws when a name is not valid.
 *
 * @param {string} dir
 * @returns {string[]}
 */
export function collectBadgeNames(dir) {
  /** @type {Set<string>} */
  const names = new Set();
  for (const entry of readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".mdx")) continue;
    const file = join(entry.parentPath, entry.name);
    for (const name of findBadgeNames(readFileSync(file, "utf-8"))) {
      if (!isValidBadgeName(name)) {
        throw new Error(
          `${file}: invalid badge name ${JSON.stringify(name)}, use letters, digits, hyphens and underscores only`,
        );
      }
      names.add(name);
    }
  }
  return [...names].sort();
}
