// Astro's `build.format` defaults to `directory`, so `/components/wifi/` is served from
// `/components/wifi/index.html`, and Netlify answers a request for the slash-less
// `/components/wifi` with a 301 to the slashed path. A site-relative link written without the
// trailing slash - `/components/wifi#manual-ips` - therefore costs every reader who follows it an
// extra round trip. The slash belongs before the `#`, which is easy to miss because the anchor
// hides the end of the path.
//
// `needsAnchorTrailingSlash` is the single definition of that rule, shared by the linter
// (script/lint.mjs) and by components that build hrefs from authored values (src/lib/img-table.mjs).

// Path extensions that name a file or a legacy `.html` route rather than a directory-style page.
// Those are served (or redirected) as-is, so a slash must not be inserted before the anchor.
// Version-numbered pages such as `/changelog/2025.10.0` end in `.0`, which is deliberately not
// listed here: they are ordinary pages and do need the slash.
const FILE_EXTENSIONS = new Set([
  "bin",
  "css",
  "gif",
  "html",
  "ico",
  "jpeg",
  "jpg",
  "js",
  "json",
  "mjs",
  "pdf",
  "png",
  "svg",
  "txt",
  "webp",
  "xml",
  "yaml",
  "yml",
  "zip",
]);

/**
 * Whether a link is a site-relative link to a page with an anchor and is missing the trailing
 * slash before the `#`.
 *
 * @param {string} href
 * @returns {boolean}
 */
export function needsAnchorTrailingSlash(href) {
  // Only site-relative paths. External and protocol-relative URLs are somebody else's routing.
  if (!href.startsWith("/") || href.startsWith("//")) return false;

  // No anchor at all. A bare in-page anchor such as `#configuration-variables` is already out,
  // having failed the leading-slash test above.
  const hash = href.indexOf("#");
  if (hash < 0) return false;

  const path = href.slice(0, hash);
  if (path.endsWith("/")) return false;
  // A query string would need the slash before the `?`, which no link here uses; leave it alone.
  if (path.includes("?")) return false;

  const segment = path.slice(path.lastIndexOf("/") + 1);
  const dot = segment.lastIndexOf(".");
  if (dot > 0 && FILE_EXTENSIONS.has(segment.slice(dot + 1).toLowerCase())) return false;

  return true;
}

/**
 * Insert the missing trailing slash before a link's anchor, leaving every other link untouched.
 *
 * @param {string} href
 * @returns {string}
 */
export function withAnchorTrailingSlash(href) {
  if (!needsAnchorTrailingSlash(href)) return href;
  const hash = href.indexOf("#");
  return `${href.slice(0, hash)}/${href.slice(hash)}`;
}
