/**
 * Which blog URLs are listing pages and which are posts. Kept free of `astro:content` so the
 * Starlight component overrides can import it cheaply. The URL scheme is described in blog.ts.
 *
 * starlight-blog's own check (isAnyBlogPostPage) only knows its /blog/<n>/, tags and authors
 * pages, so it would treat /blog/page/2/, /blog/2026/page/2/ or /blog/tags/releases/2026/ as a post. Use these instead.
 */
const LISTING_ID =
  /^blog(?:\/(?:page\/\d+|\d{4}(?:\/page\/\d+)?|tags\/[^/]+(?:\/\d{4})?(?:\/page\/\d+)?|authors\/[^/]+(?:\/page\/\d+)?))?\/?$/;

/** True for a Starlight route id (no leading slash) of a blog listing page, e.g. `blog/page/2`. */
export function isBlogListingId(id: string): boolean {
  return LISTING_ID.test(id);
}

/** True for a Starlight route id of a single blog post, e.g. `blog/2026/11/18/esphome-2026-11`. */
export function isBlogPostId(id: string): boolean {
  return id.startsWith("blog/") && !isBlogListingId(id);
}
