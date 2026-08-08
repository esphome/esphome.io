// The site builds with Astro's default `directory` format, so every page is served as
// `/path/to/page/`. Links are authored both with and without the trailing slash; the bare
// form is a non-canonical URL that only resolves via a host redirect. This is the single
// rule both link surfaces canonicalise with: rendered Markdown (see
// `rehype-internal-trailing-slash.mjs`) and `ImgTable` card links.
export function withTrailingSlash(href) {
  // Site-absolute only: `//host/path` is protocol-relative and therefore external.
  if (typeof href !== "string" || !href.startsWith("/") || href.startsWith("//")) return href;

  const [, path, query = "", hash = ""] = /^([^?#]*)(\?[^#]*)?(#.*)?$/.exec(href);
  if (path === "/" || path.endsWith("/")) return href;
  // A dot in the last segment means a file (`/images/x.png`, `/api/class_foo.html`), not a
  // page directory.
  if (path.slice(path.lastIndexOf("/") + 1).includes(".")) return href;

  return `${path}/${query}${hash}`;
}
