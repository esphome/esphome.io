import { badgeImagePath, badgeName } from "./badges.mjs";
import { withAnchorTrailingSlash } from "./internal-links.mjs";

/**
 * Resolve an `ImgTable` image value to the URL used for its `<img>`.
 *
 * @param {string} image
 * @returns {string}
 */
export function resolveImagePath(image) {
  const badge = badgeName(image);
  if (badge !== null) {
    return badgeImagePath(badge);
  }

  // If it's already an absolute path or URL, use as-is
  if (image.startsWith("/") || image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  // Check if it looks like a component path (e.g., components/sensor/dht)
  // Try to resolve relative to /images/ first
  return `/images/${image}`;
}

/**
 * Resolve an `ImgTable` link value to the URL used for its `<a href>`.
 *
 * Entries are authored without the trailing slash as often as with it, so it is added here. A
 * link that carries an anchor needs the slash before the `#`, not after the anchor.
 *
 * @param {string} link
 * @returns {string}
 */
export function resolveLinkPath(link) {
  if (link.includes("#")) {
    return withAnchorTrailingSlash(link);
  }
  return link.endsWith("/") ? link : `${link}/`;
}
