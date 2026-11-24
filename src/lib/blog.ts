/**
 * Data and pagination helpers for the blog listing pages (src/pages/blog/[...listing].astro).
 *
 * starlight-blog renders its own index, tag and author pages as a single column with no way to
 * override the markup, so ESPHome renders those URLs itself. The route in src/pages/blog/ has a
 * static `blog` segment, which Astro ranks above the plugin's `[...prefix]/...` routes, so for
 * every path both generate, ours is built and the plugin's is skipped with a warning.
 *
 * URL scheme:
 *   /blog/                          newest posts, latest one featured
 *   /blog/tags/<tag>/               posts with a tag (same URL as starlight-blog used)
 *   /blog/tags/<tag>/<year>/        posts with a tag from one year (noindex)
 *   /blog/authors/<author>/         everything by one author (same URL as starlight-blog used)
 *   /blog/<year>/                   posts published in a year
 *   .../page/<n>/                   later pages of each
 * Page 1 never gets a /page/1/ URL, so there is only one URL for it.
 *
 * Only tag and year combine, and only where the tag has posts in that year. An author page is
 * always that person's full list of posts.
 */
import type { ImageMetadata } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { slug } from "github-slugger";

import { authors as authorConfig } from "../authors.mjs";
import { blogTagIntros } from "../data/blogTagIntros";

/**
 * Posts on the first page of /blog/: the featured post plus twelve cards, which fill the last row of
 * both the two- and three-column grids.
 */
export const FIRST_PAGE_SIZE = 13;
/** Posts on every other listing page: four rows of three cards. */
export const PAGE_SIZE = 12;
/** Categories listed in the filters drawer before the rest go under "More categories". */
const TOP_TAGS = 7;
/** Reading speed for the estimated reading time on cards, in words per minute. */
const WORDS_PER_MINUTE = 230;

const BLOG_DESCRIPTION = "Release notes, project news and announcements from the ESPHome team.";

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
  /** Estimated reading time in whole minutes, at least 1. */
  readingTime: number;
}

export type FacetKind = "tag" | "author" | "year";

/** One value of a filter (a tag, an author or a year) with the number of posts that have it. */
export interface Facet {
  kind: FacetKind;
  slug: string;
  label: string;
  count: number;
  picture?: string;
}

/** The filters a listing applies. Tag and year combine; author is always on its own. */
export interface Filters {
  tag?: Facet;
  year?: Facet;
  author?: Facet;
}

/** A link in the filters drawer: where choosing it leads from the current page. */
export interface DrawerItem {
  label: string;
  /** Posts on the page the link leads to. */
  count: number;
  href: string;
  current: boolean;
  picture?: string;
}

export interface Drawer {
  /** "All posts": removes the tag, keeps the year. */
  allTags: DrawerItem;
  /** The tags with the most posts, by count. */
  topTags: DrawerItem[];
  /** The rest of the tags, alphabetically. */
  moreTags: DrawerItem[];
  /** True when the current tag is in `moreTags`, so its <details> opens. */
  moreOpen: boolean;
  /** "All": removes the year, keeps the tag. */
  allYears: DrawerItem;
  years: DrawerItem[];
  /** Always the author's full list of posts. */
  authors: DrawerItem[];
}

export interface ActiveFilter {
  kind: FacetKind;
  /** "Category", "Year" or "Author". */
  name: string;
  label: string;
  /** The page with only this filter removed. */
  removeHref: string;
}

export interface Crumb {
  name: string;
  href: string;
}

export type PageItem = { number: number; href: string; current: boolean } | null;

export interface ListingPage {
  filters: Filters;
  /** Page heading (h1) and the base of the <title>. */
  heading: string;
  /** Meta description. */
  description: string;
  /** Line under the heading: the blog's own on /blog/, a tag's from blogTagIntros, else none. */
  intro?: string;
  /** Posts matching the filters, across all pages. */
  count: number;
  /** Pages above this one, after Home. Empty on page 1 of /blog/, which shows no breadcrumbs. */
  breadcrumbs: Crumb[];
  activeFilters: ActiveFilter[];
  drawer: Drawer;
  /** Combined tag and year pages are thin, so they stay out of search results. */
  noindex: boolean;
  /** URL of page 1, with a trailing slash. */
  baseHref: string;
  /** 1-based page number. */
  page: number;
  totalPages: number;
  posts: BlogPost[];
  /** The newest post, shown as the wide card. Only on page 1 of the unfiltered blog. */
  featured?: BlogPost;
  prevHref?: string;
  nextHref?: string;
  /** Page numbers for wide screens and the short list for phones; `null` is a gap. */
  pageItems: PageItem[];
  compactPageItems: PageItem[];
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

/** Minutes to read a post's MDX body, counting words outside imports, JSX tags and code fences' markers. */
function readingTime(body: string | undefined): number {
  const text = (body ?? "")
    .replace(/^import .*$/gm, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/[`#*_>|[\]()-]/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
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
    readingTime: readingTime(entry.body),
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

/** A post's values for one kind of filter. */
function valuesOf(post: BlogPost, kind: FacetKind): { slug: string; label: string; picture?: string }[] {
  if (kind === "tag") return post.tags;
  if (kind === "author") return post.authors.map((a) => ({ slug: a.slug, label: a.name, picture: a.picture }));
  return [{ slug: String(post.year), label: String(post.year) }];
}

function matches(post: BlogPost, filters: Filters): boolean {
  return (Object.values(filters) as (Facet | undefined)[]).every(
    (facet) => !facet || valuesOf(post, facet.kind).some((value) => value.slug === facet.slug),
  );
}

const byCountThenLabel = (a: { count: number; label: string }, b: { count: number; label: string }) =>
  b.count - a.count || a.label.localeCompare(b.label);

/** Every value of one kind of filter among `posts`, with its post count. Years newest first, the rest by count. */
function facetsOf(posts: BlogPost[], kind: FacetKind): Facet[] {
  const facets = new Map<string, Facet>();
  for (const post of posts) {
    for (const value of valuesOf(post, kind)) {
      const facet = facets.get(value.slug) ?? { kind, ...value, count: 0 };
      facet.count += 1;
      facets.set(value.slug, facet);
    }
  }
  const list = [...facets.values()];
  return kind === "year" ? list.toSorted((a, b) => Number(b.slug) - Number(a.slug)) : list.toSorted(byCountThenLabel);
}

/** URL of page 1 of the listing for a set of filters. */
export function filtersHref({ tag, year, author }: Filters): string {
  if (author) return `/blog/authors/${author.slug}/`;
  if (tag && year) return `/blog/tags/${tag.slug}/${year.slug}/`;
  if (tag) return `/blog/tags/${tag.slug}/`;
  if (year) return `/blog/${year.slug}/`;
  return "/blog/";
}

export function pageHref(baseHref: string, page: number): string {
  return page === 1 ? baseHref : `${baseHref}page/${page}/`;
}

/**
 * Page numbers for the pagination bar, with `null` for a gap. The wide list keeps the first, last
 * and neighbouring pages; the compact one, for phones, only the first, current and last.
 */
export function getPageNumbers(current: number, total: number, compact = false): (number | null)[] {
  const wanted = compact ? [1, current, total] : [1, total, current - 1, current, current + 1];
  const sorted = [...new Set(wanted.filter((n) => n >= 1 && n <= total))].toSorted((a, b) => a - b);
  const result: (number | null)[] = [];
  for (const [index, page] of sorted.entries()) {
    const previous = sorted[index - 1];
    // In the wide list a gap of one page shows that page instead of "…", which takes the same room.
    if (!compact && previous !== undefined && page - previous === 2) result.push(previous + 1);
    else if (previous !== undefined && page - previous > 1) result.push(null);
    result.push(page);
  }
  return result;
}

function pageItems(current: number, total: number, baseHref: string, compact: boolean): PageItem[] {
  return getPageNumbers(current, total, compact).map((number) =>
    number === null ? null : { number, href: pageHref(baseHref, number), current: number === current },
  );
}

const FILTER_NAMES: Record<FacetKind, string> = { tag: "Category", year: "Year", author: "Author" };

function heading({ tag, year, author }: Filters): string {
  if (tag && year) return `${tag.label} from ${year.label}`;
  if (tag) return tag.label;
  if (author) return `Posts by ${author.label}`;
  if (year) return `Posts from ${year.label}`;
  return "Blog";
}

function description({ tag, year, author }: Filters): string {
  if (!tag && !year && !author) return BLOG_DESCRIPTION;
  const parts = [tag && `in ${tag.label}`, author && `by ${author.label}`, year && `from ${year.label}`];
  return `ESPHome blog posts ${parts.filter(Boolean).join(" ")}.`;
}

function intro(filters: Filters): string | undefined {
  const { tag, year, author } = filters;
  if (!tag && !year && !author) return BLOG_DESCRIPTION;
  if (tag && !year) return blogTagIntros[tag.slug];
  return undefined;
}

function breadcrumbs({ tag, year }: Filters): Crumb[] {
  const crumbs = [{ name: "Blog", href: "/blog/" }];
  if (tag && year) crumbs.push({ name: tag.label, href: filtersHref({ tag }) });
  return crumbs;
}

function activeFilters(filters: Filters): ActiveFilter[] {
  return (["tag", "year", "author"] as const).flatMap((kind) => {
    const facet = filters[kind];
    if (!facet) return [];
    const rest = { ...filters, [kind]: undefined };
    return [{ kind, name: FILTER_NAMES[kind], label: facet.label, removeHref: filtersHref(rest) }];
  });
}

interface Catalog {
  posts: BlogPost[];
  tags: Facet[];
  authors: Facet[];
}

/** The filters drawer as seen from a page: what each choice gives from here, with its post count. */
function drawer(catalog: Catalog, { tag, year, author }: Filters): Drawer {
  const inYear = year ? catalog.posts.filter((p) => matches(p, { year })) : catalog.posts;
  const inTag = tag ? catalog.posts.filter((p) => matches(p, { tag })) : catalog.posts;

  const tags = facetsOf(inYear, "tag").map((t) => ({
    label: t.label,
    count: t.count,
    href: filtersHref({ tag: t, year }),
    current: tag?.slug === t.slug,
  }));
  const moreTags = tags.slice(TOP_TAGS).toSorted((a, b) => a.label.localeCompare(b.label));

  return {
    allTags: { label: "All posts", count: inYear.length, href: filtersHref({ year }), current: !tag && !author },
    topTags: tags.slice(0, TOP_TAGS),
    moreTags,
    moreOpen: moreTags.some((t) => t.current),
    allYears: { label: "All", count: inTag.length, href: filtersHref({ tag }), current: !year && !author },
    years: facetsOf(inTag, "year").map((y) => ({
      label: y.label,
      count: y.count,
      href: filtersHref({ tag, year: y }),
      current: year?.slug === y.slug,
    })),
    authors: catalog.authors.map((a) => ({
      label: a.label,
      count: a.count,
      href: filtersHref({ author: a }),
      current: author?.slug === a.slug,
      picture: a.picture,
    })),
  };
}

function paginate(catalog: Catalog, filters: Filters): ListingPage[] {
  const matching = catalog.posts.filter((p) => matches(p, filters));
  const unfiltered = !filters.tag && !filters.year && !filters.author;
  const firstSize = unfiltered ? FIRST_PAGE_SIZE : PAGE_SIZE;
  const totalPages = Math.max(1, 1 + Math.ceil(Math.max(0, matching.length - firstSize) / PAGE_SIZE));
  const baseHref = filtersHref(filters);

  const shared = {
    filters,
    heading: heading(filters),
    description: description(filters),
    intro: intro(filters),
    count: matching.length,
    breadcrumbs: breadcrumbs(filters),
    activeFilters: activeFilters(filters),
    drawer: drawer(catalog, filters),
    noindex: Boolean(filters.tag && filters.year),
    baseHref,
    totalPages,
  };

  return Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    const start = page === 1 ? 0 : firstSize + (page - 2) * PAGE_SIZE;
    const end = page === 1 ? firstSize : start + PAGE_SIZE;
    const posts = matching.slice(start, end);
    const featured = unfiltered && page === 1 ? posts[0] : undefined;

    return {
      ...shared,
      // Page 1 of the main blog has no breadcrumbs: it is the top of the blog.
      breadcrumbs: unfiltered && page === 1 ? [] : shared.breadcrumbs,
      page,
      posts: featured ? posts.slice(1) : posts,
      featured,
      prevHref: page > 1 ? pageHref(baseHref, page - 1) : undefined,
      nextHref: page < totalPages ? pageHref(baseHref, page + 1) : undefined,
      pageItems: pageItems(page, totalPages, baseHref, false),
      compactPageItems: pageItems(page, totalPages, baseHref, true),
    };
  });
}

/** Every listing page, in the order /blog/, tags, authors, years, then each tag's years. */
export async function getListingPages(): Promise<ListingPage[]> {
  const posts = await getBlogPosts();
  const catalog: Catalog = { posts, tags: facetsOf(posts, "tag"), authors: facetsOf(posts, "author") };
  const years = facetsOf(posts, "year");
  const yearsBySlug = new Map(years.map((y) => [y.slug, y]));

  const filterSets: Filters[] = [
    {},
    ...catalog.tags.map((tag) => ({ tag })),
    ...catalog.authors.map((author) => ({ author })),
    ...years.map((year) => ({ year })),
    // Only the years a tag has posts in. The year facet keeps its own total count.
    ...catalog.tags.flatMap((tag) =>
      facetsOf(
        posts.filter((p) => matches(p, { tag })),
        "year",
      ).map((y) => ({ tag, year: yearsBySlug.get(y.slug) })),
    ),
  ];

  return filterSets.flatMap((filters) => paginate(catalog, filters));
}

/** Static paths for every listing page. `listing` is the path after /blog/, or undefined for /blog/ itself. */
export async function getListingStaticPaths() {
  const listings = await getListingPages();
  return listings.map((listing) => {
    const path = pageHref(listing.baseHref, listing.page)
      .replace(/^\/blog\//, "")
      .replace(/\/$/, "");
    return { params: { listing: path || undefined }, props: { listing } };
  });
}
