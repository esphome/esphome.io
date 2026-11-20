/**
 * Data and pagination helpers for the blog listing pages (src/pages/blog/[...listing].astro).
 *
 * starlight-blog renders its own index, tag and author pages as a single column with no way to
 * override the markup, so ESPHome renders those URLs itself. The route in src/pages/blog/ has a
 * static `blog` segment, which Astro ranks above the plugin's `[...prefix]/...` routes, so for
 * every path both generate, ours is built and the plugin's is skipped with a warning.
 *
 * URL scheme (every page is indexable and canonical to itself):
 *   /blog/                         newest posts, latest one featured
 *   /blog/page/<n>/                older posts
 *   /blog/tags/<tag>/[page/<n>/]   posts with a tag (same URL as starlight-blog used)
 *   /blog/authors/<author>/[...]   posts by an author (same URL as starlight-blog used)
 *   /blog/<year>/[page/<n>/]       posts published in a year
 * Page 1 never gets a /page/1/ URL, so there is only one URL for it.
 */
import type { ImageMetadata } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { slug } from "github-slugger";

import { authors as authorConfig } from "../authors.mjs";

/** Posts on the first page of /blog/: the featured post plus three rows of three cards. */
export const FIRST_PAGE_SIZE = 10;
/** Posts on every other listing page: four rows of three cards. */
export const PAGE_SIZE = 12;

type DocsEntry = CollectionEntry<"docs">;
type CoverImage = ImageMetadata | string;

export interface BlogAuthor {
  name: string;
  slug: string;
  picture?: string;
}

export interface BlogTag {
  label: string;
  slug: string;
}

export interface BlogPost {
  href: string;
  title: string;
  excerpt: string;
  date: Date;
  year: number;
  tags: BlogTag[];
  authors: BlogAuthor[];
  cover?: { alt: string; image: CoverImage; light?: CoverImage };
  /** Site a crosspost is shared from (`crosspostSource`); the post page redirects there. */
  source?: string;
}

export type ListingKind = "all" | "tag" | "author" | "year";

export interface Facet {
  kind: ListingKind;
  /** URL slug for the facet value; empty for "all". */
  slug: string;
  label: string;
  count: number;
  /** Base URL of the listing, with a trailing slash. */
  href: string;
  picture?: string;
}

export interface BlogFacets {
  all: Facet;
  tags: Facet[];
  authors: Facet[];
  years: Facet[];
}

export interface ListingPage {
  /** The facet this listing filters on. */
  facet: Facet;
  /** 1-based page number. */
  page: number;
  totalPages: number;
  posts: BlogPost[];
  /** True on the first page of the unfiltered blog, where the newest post gets the featured card. */
  featured: boolean;
  prevHref?: string;
  nextHref?: string;
}

type AuthorConfig = { name: string; picture?: string };

function resolveAuthors(entry: DocsEntry): BlogAuthor[] {
  const raw = entry.data.authors;
  const list = raw === undefined ? Object.keys(authorConfig) : Array.isArray(raw) ? raw : [raw];

  return list.map((author) => {
    const data: AuthorConfig =
      typeof author === "string" ? (authorConfig as Record<string, AuthorConfig>)[author] : author;
    if (!data) throw new Error(`Blog author '${String(author)}' in '${entry.id}' is not in src/authors.mjs.`);
    // Same slug function starlight-blog uses, so author URLs do not change.
    return { name: data.name, slug: slug(data.name), picture: data.picture };
  });
}

function toPost(entry: DocsEntry): BlogPost {
  const { data } = entry;
  const date = data.date as Date;
  const cover = data.cover;

  return {
    href: `/${entry.id}/`,
    title: data.title,
    // The description is a one-sentence summary on every post. Excerpts can be a whole opening
    // paragraph (crossposts copy the original article's), which is too long for a card.
    excerpt: data.description ?? (typeof data.excerpt === "string" ? data.excerpt : undefined) ?? "",
    date,
    year: date.getUTCFullYear(),
    tags: (data.tags ?? []).map((label: string) => ({ label, slug: slug(label) })),
    authors: resolveAuthors(entry),
    cover: cover
      ? "image" in cover
        ? { alt: cover.alt, image: cover.image }
        : { alt: cover.alt, image: cover.dark, light: cover.light }
      : data.crosspostCover
        ? // Crossposts set `crosspostCover` (a URL) instead of `cover`; see content.config.ts.
          { alt: data.title, image: data.crosspostCover }
        : undefined,
    source: data.crosspostSource,
  };
}

let cachedPosts: BlogPost[] | undefined;

/** Published blog posts, newest first. Drafts are left out of production builds, as starlight-blog does. */
export async function getBlogPosts(): Promise<BlogPost[]> {
  if (cachedPosts) return cachedPosts;

  const entries = await getCollection(
    "docs",
    (entry) =>
      entry.id.startsWith("blog/") && entry.data.date !== undefined && !(import.meta.env.PROD && entry.data.draft),
  );

  cachedPosts = entries.map(toPost).toSorted((a, b) => b.date.getTime() - a.date.getTime());
  return cachedPosts;
}

function countBy<T>(posts: BlogPost[], keys: (post: BlogPost) => T[], id: (value: T) => string) {
  const counts = new Map<string, { value: T; count: number }>();
  for (const post of posts) {
    for (const value of keys(post)) {
      const key = id(value);
      const current = counts.get(key);
      counts.set(key, { value, count: (current?.count ?? 0) + 1 });
    }
  }
  return [...counts.values()];
}

/** Every tag, author and year with its post count, for the filter bar and drawer. */
export function getFacets(posts: BlogPost[]): BlogFacets {
  const byCountThenLabel = (a: Facet, b: Facet) => b.count - a.count || a.label.localeCompare(b.label);

  return {
    all: { kind: "all", slug: "", label: "All posts", count: posts.length, href: "/blog/" },
    tags: countBy(
      posts,
      (p) => p.tags,
      (t) => t.slug,
    )
      .map(({ value, count }) => ({
        kind: "tag" as const,
        slug: value.slug,
        label: value.label,
        count,
        href: `/blog/tags/${value.slug}/`,
      }))
      .toSorted(byCountThenLabel),
    authors: countBy(
      posts,
      (p) => p.authors,
      (a) => a.slug,
    )
      .map(({ value, count }) => ({
        kind: "author" as const,
        slug: value.slug,
        label: value.name,
        count,
        href: `/blog/authors/${value.slug}/`,
        picture: value.picture,
      }))
      .toSorted(byCountThenLabel),
    years: countBy(
      posts,
      (p) => [p.year],
      (y) => String(y),
    )
      .map(({ value, count }) => ({
        kind: "year" as const,
        slug: String(value),
        label: String(value),
        count,
        href: `/blog/${value}/`,
      }))
      .toSorted((a, b) => Number(b.slug) - Number(a.slug)),
  };
}

function pageHref(facet: Facet, page: number) {
  return page === 1 ? facet.href : `${facet.href}page/${page}/`;
}

function paginate(facet: Facet, posts: BlogPost[], withFeatured: boolean): ListingPage[] {
  const firstSize = withFeatured ? FIRST_PAGE_SIZE : PAGE_SIZE;
  const totalPages = Math.max(1, 1 + Math.ceil(Math.max(0, posts.length - firstSize) / PAGE_SIZE));

  return Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    const start = page === 1 ? 0 : firstSize + (page - 2) * PAGE_SIZE;
    const end = page === 1 ? firstSize : start + PAGE_SIZE;

    return {
      facet,
      page,
      totalPages,
      posts: posts.slice(start, end),
      featured: withFeatured && page === 1,
      prevHref: page > 1 ? pageHref(facet, page - 1) : undefined,
      nextHref: page < totalPages ? pageHref(facet, page + 1) : undefined,
    };
  });
}

/** Static paths for every listing page. `listing` is the path after /blog/, or undefined for /blog/ itself. */
export async function getListingStaticPaths() {
  const posts = await getBlogPosts();
  const facets = getFacets(posts);

  const listings: ListingPage[] = [
    ...paginate(facets.all, posts, true),
    ...facets.tags.flatMap((f) =>
      paginate(
        f,
        posts.filter((p) => p.tags.some((t) => t.slug === f.slug)),
        false,
      ),
    ),
    ...facets.authors.flatMap((f) =>
      paginate(
        f,
        posts.filter((p) => p.authors.some((a) => a.slug === f.slug)),
        false,
      ),
    ),
    ...facets.years.flatMap((f) =>
      paginate(
        f,
        posts.filter((p) => String(p.year) === f.slug),
        false,
      ),
    ),
  ];

  return listings.map((listing) => {
    const path = pageHref(listing.facet, listing.page)
      .replace(/^\/blog\//, "")
      .replace(/\/$/, "");
    return { params: { listing: path || undefined }, props: { listing, facets } };
  });
}

/** Page numbers to show in the pagination bar, with `null` for a gap. Always keeps first, last and neighbours. */
export function getPageNumbers(current: number, total: number): (number | null)[] {
  const pages = new Set([1, total, current - 1, current, current + 1].filter((n) => n >= 1 && n <= total));
  const sorted = [...pages].toSorted((a, b) => a - b);
  const result: (number | null)[] = [];
  for (const [index, page] of sorted.entries()) {
    const previous = sorted[index - 1];
    if (previous !== undefined && page - previous === 2) result.push(previous + 1);
    else if (previous !== undefined && page - previous > 2) result.push(null);
    result.push(page);
  }
  return result;
}

export { pageHref };
