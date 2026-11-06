// The link-in-bio page at /bio/, built from src/data/bio.ts.
//
// The page is what the "link in bio" on ESPHome's social profiles points at.
// Its Latest list mixes the items added by hand in bio.ts with the site's
// newest blog posts, which src/components/BioLists.astro passes in. Nothing is
// fetched here, so the page can't slow down or break the build for reasons
// outside the repository.
//
// bio.ts is edited by people who don't run the site locally, so every mistake
// fails the build and names the item at fault, rather than silently rendering
// something wrong on the live page.
//
// Plain enough for Node to run without a build step (tests/bio.test.mjs).
import type { ImageMetadata } from "astro";
import { isShowing, select } from "./bio-schedule.mjs";

type Raw = Record<string, unknown>;

export class BioConfigError extends Error {}

const fail = (keyPath: string, message: string): never => {
  throw new BioConfigError(`src/data/bio.ts ${keyPath}: ${message}`);
};

const blank = (value: unknown) => value === undefined || value === null || String(value).trim() === "";
const isMap = (value: unknown): value is Raw => value !== null && typeof value === "object" && !Array.isArray(value);
const has = (object: Raw, key: string) => Object.prototype.hasOwnProperty.call(object, key);

// -- Dates --------------------------------------------------------------------

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})?)?$/;

// Dates must be ISO. A lenient parser would happily read "31/11/2026" or
// "01/11/2026" as some other day instead of rejecting it. Times without a
// zone are UTC.
export function parseTime(value: unknown, keyPath: string): Date | null {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  const example = "Use YYYY-MM-DD, or YYYY-MM-DDTHH:MM:SSZ for a time";
  if (!ISO_DATE.test(text)) fail(keyPath, `"${value}" is not a date. ${example}`);
  let iso = text.length === 10 ? `${text}T00:00:00` : text;
  if (!/(Z|[+-]\d{2}:\d{2})$/.test(iso)) iso += "Z";
  const date = new Date(iso);
  // Rejects days that don't exist, such as 2026-02-30.
  const calendar = new Date(`${text.slice(0, 10)}T00:00:00Z`);
  if (
    Number.isNaN(date.getTime()) ||
    Number.isNaN(calendar.getTime()) ||
    !calendar.toISOString().startsWith(text.slice(0, 10))
  ) {
    fail(keyPath, `"${value}" is not a date. ${example}`);
  }
  return date;
}

// A time was given, not just a day.
const hasTime = (value: unknown) => /T\d{2}:\d{2}/.test(String(value));

const DAY_MS = 24 * 60 * 60 * 1000;

const SITE = "https://esphome.io";
const SITE_HOST = new URL(SITE).hostname;
// The Open Home Foundation's social preview images, which the blog's release
// posts already use as covers.
const OG_ENDPOINT = "https://assets.openhomefoundation.org/opengraph";
const startOfDay = (date: Date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

// Without `ends`, a video comes down at the end of the day after it airs, so a
// livestream doesn't linger once it's over.
const videoEnd = (airs: Date) => new Date(startOfDay(airs).getTime() + 2 * DAY_MS);

// An `ends` with only a day keeps the item up through that whole day:
// `ends: "2026-11-15"` hides it at midnight UTC as the 16th begins. With a
// time, it hides at that time.
export function parseEnd(value: unknown, keyPath: string): Date | null {
  const date = parseTime(value, keyPath);
  if (!date || hasTime(value)) return date;
  return new Date(date.getTime() + DAY_MS);
}

const DAY = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
const DAY_NO_YEAR = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
const TIME = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" });

// -- YouTube ------------------------------------------------------------------

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

// Accepts a bare video ID or any of the usual YouTube links.
export function youtubeId(value: unknown): string | null {
  const text = String(value ?? "").trim();
  if (YOUTUBE_ID.test(text)) return text;
  let url;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m)\./, "");
  let id = null;
  if (host === "youtu.be") id = url.pathname.slice(1);
  else if (host === "youtube.com") {
    id = url.searchParams.get("v") ?? url.pathname.match(/^\/(?:live|shorts|embed)\/([^/]+)/)?.[1] ?? null;
  }
  return id && YOUTUBE_ID.test(id) ? id : null;
}

// -- Validation ---------------------------------------------------------------

// The item's place in the file, and its title so it's easy to find.
const itemPath = (list: string, index: number, item: unknown) => {
  const name = isMap(item) ? (item.title ?? item.label) : undefined;
  return `${list}[${index}]${blank(name) ? "" : ` ("${name}")`}`;
};

// Keys that were renamed, or are easy to reach for. Naming the right key
// beats an item that silently ignores its dates.
function validateWindow(item: Raw, keyPath: string, video = false) {
  const renamed = { expires: "ends", start: video ? "airs" : "starts", date: video ? "airs" : "starts" };
  for (const [old, current] of Object.entries(renamed)) {
    if (has(item, old)) fail(`${keyPath}.${old}`, `is not a key here. Use ${current}`);
  }
  const starts = parseTime(item.starts, `${keyPath}.starts`);
  const ends = parseEnd(item.ends, `${keyPath}.ends`);
  if (starts && ends && ends <= starts) fail(`${keyPath}.ends`, "must be after starts");
}

// A full https:// URL with a host. A prefix check alone would let through
// "https://" on its own.
function isHttpsUrl(text: string) {
  if (!text.startsWith("https://")) return false;
  try {
    return new URL(text).hostname !== "";
  } catch {
    return false;
  }
}

// A path on this site starts with one slash. Browsers read "//example.com/"
// and "/\example.com/" as links to another site.
const isSitePath = (text: string) => /^\/(?![/\\])/.test(text);

function requireUrl(item: Raw, keyPath: string) {
  const url = String(item.url ?? "");
  if (isSitePath(url) || isHttpsUrl(url)) return;
  fail(`${keyPath}.url`, "must be a site path like /blog/ or a full https:// URL");
}

/**
 * An esphome.io URL as a path on the site, so it matches the blog's own links.
 * Any other URL comes back as it is.
 */
export function sitePath(url: string): string {
  if (!isHttpsUrl(url)) return url;
  const parsed = new URL(url);
  return parsed.hostname === SITE_HOST ? parsed.pathname + parsed.search + parsed.hash : url;
}

function requireText(item: Raw, key: string, keyPath: string, optional = false) {
  if (optional && item[key] === undefined) return;
  if (blank(item[key])) fail(`${keyPath}.${key}`, optional ? "must be text, or left out" : "is required");
}

/**
 * Checks bio.ts. `images` are the file names in src/assets/bio/, which an
 * item's `image` can name.
 */
export function validate(bio: Raw, images: string[] = []): true {
  if (!Array.isArray(bio.latest)) fail("latest", "must be a list");
  (bio.latest as unknown[]).forEach((item, index) => validateLatest(item, itemPath("latest", index, item), images));

  const count = bio.latestCount;
  if (!Number.isInteger(count) || (count as number) < 1 || (count as number) > 10) {
    fail("latestCount", "must be a whole number from 1 to 10");
  }

  if (!Array.isArray(bio.sections)) fail("sections", "must be a list");
  (bio.sections as unknown[]).forEach((section, index) => {
    const keyPath = itemPath("sections", index, section);
    if (!isMap(section)) return fail(keyPath, "must be an object with title and links");
    requireText(section, "title", keyPath);
    if (!Array.isArray(section.links) || section.links.length === 0)
      fail(`${keyPath}.links`, "must be a non-empty list");
    (section.links as unknown[]).forEach((link, linkIndex) => {
      const linkPath = itemPath(`${keyPath}.links`, linkIndex, link);
      if (!isMap(link)) return fail(linkPath, "must be an object with label and url");
      requireText(link, "label", linkPath);
      requireUrl(link, linkPath);
      validateWindow(link, linkPath);
    });
  });

  return true;
}

// An item in Latest. `starts` is when it appears, and also where it sits and
// the date shown on it, as a post's publish date is, so it is required: a
// scheduled item comes in at the top. A YouTube video takes its link and
// picture from the video, and its place and date from when it `airs`;
// `starts` on a video only shows it early.
function validateLatest(item: unknown, keyPath: string, images: string[]) {
  if (!isMap(item)) return fail(keyPath, "must be an object with title, url and starts");
  requireText(item, "title", keyPath);
  requireText(item, "label", keyPath, true);
  const video = item.type === "youtube";
  validateWindow(item, keyPath, video);

  if (video) {
    if (!youtubeId(item.video)) {
      fail(`${keyPath}.video`, "must be a YouTube video ID or link, e.g. https://www.youtube.com/watch?v=XyAL1to3Lm4");
    }
    if (blank(item.airs)) fail(`${keyPath}.airs`, 'is required: when it goes out, e.g. "2026-11-15T18:00:00Z"');
    const airs = parseTime(item.airs, `${keyPath}.airs`) as Date;
    const ends = parseEnd(item.ends, `${keyPath}.ends`);
    if (ends && ends <= airs) fail(`${keyPath}.ends`, "must be after airs");
    // Without `ends`, the video comes down by itself: it must start before then.
    const starts = parseTime(item.starts, `${keyPath}.starts`);
    const end = ends ?? videoEnd(airs);
    if (!ends && starts && end <= starts) {
      const lastDay = DAY.format(new Date(end.getTime() - 1));
      fail(
        `${keyPath}.starts`,
        `must be before the video comes down at the end of ${lastDay} (UTC), the day after it airs. Use an earlier starts, or add an ends`,
      );
    }
    return;
  }
  if (has(item, "type")) fail(`${keyPath}.type`, 'must be "youtube", or left out for a link');

  requireUrl(item, keyPath);
  requireText(item, "note", keyPath, true);
  // A file in src/assets/bio/, so the build can make the thumbnail and the
  // card's smaller sizes from it.
  const image = item.image;
  if (image !== undefined && image !== "auto" && !isHttpsUrl(String(image)) && !images.includes(String(image))) {
    fail(
      `${keyPath}.image`,
      `"${image}" is not in src/assets/bio/. Save the image there and give its file name, e.g. "2026-11-community-day.webp", or use "auto"`,
    );
  }
  if (blank(item.starts)) fail(`${keyPath}.starts`, 'is required: when it appears, e.g. "2026-11-01"');
}

// -- Resolution ---------------------------------------------------------------

/**
 * An image: a file name in src/assets/bio/ or a URL (items added by hand), or
 * a post's cover, which is an imported image or a URL.
 */
export type ImageSource = string | ImageMetadata;

/** A blog post, as src/components/BioLists.astro passes it in. */
export interface Post {
  title: string;
  url: string;
  date: Date;
  /** Shown under the title, e.g. "Release · October 21, 2026". */
  note: string;
  image?: ImageSource;
}

/** One rendered item, with what the rule in bio-schedule.mjs needs to show and hide it. */
export interface Entry {
  key: string;
  url: string;
  /** How strong its claim to its link is: 1 for an item added by hand, 0 for a post. */
  rank: number;
  starts: Date | null;
  ends: Date | null;
  /** "hero" shows only in first place, "row" anywhere else. */
  variant?: "hero" | "row";
  /** Not showing at build time. */
  hidden: boolean;
  title: string;
  note: string | null;
  /** For a video that hasn't aired at build time: when it airs, and the note to show from then. */
  airs: Date | null;
  noteAfter: string | null;
  image: ImageSource | null;
  /** Shown as the large card. */
  card: boolean;
  video: boolean;
  highlight: boolean;
}

export interface List {
  title: string;
  /** Its place among the page's lists. */
  order: number;
  limit: number | null;
  /** Latest's links each show only once (see select in bio-schedule.mjs). */
  claims: boolean;
  entries: Entry[];
  /** Nothing is showing yet, but something will. */
  hidden: boolean;
}

interface Item {
  title: string;
  url: string;
  date: Date;
  rank: number;
  starts: Date | null;
  ends: Date | null;
  note: string | null;
  noteAfter: string | null;
  airs: Date | null;
  image: ImageSource | null;
  video: boolean;
}

const join = (parts: (string | null | undefined)[]) => parts.filter(Boolean).join(" · ");

// `image: "auto"` reuses what the site already has for social previews: a
// blog post's own cover, or, for any other page, the Open Home Foundation's
// social preview image of it.
export function autoImage(url: string, posts: Post[]): ImageSource {
  const path = sitePath(url);
  if (!isSitePath(path)) return `${OG_ENDPOINT}?url=${encodeURIComponent(url)}`;
  const post = posts.find((candidate) => candidate.url === path);
  return post?.image ?? `${OG_ENDPOINT}?url=${encodeURIComponent(SITE + path)}`;
}

// The items added by hand, ready to merge with the posts.
function handPicked(latest: Raw[], posts: Post[], now: Date): Item[] {
  return latest.map((item, index) => {
    const keyPath = itemPath("latest", index, item);
    const starts = parseTime(item.starts, `${keyPath}.starts`);
    const ends = parseEnd(item.ends, `${keyPath}.ends`);
    const label = item.label as string | undefined;
    if (item.type === "youtube") {
      const id = youtubeId(item.video);
      const airs = parseTime(item.airs, `${keyPath}.airs`) as Date;
      // Before it airs: "Livestream · Starts November 15 · 18:00 UTC". The
      // script on the page swaps in `noteAfter` once it has started.
      const upcoming = airs > now;
      const before = join([
        label,
        `Starts ${DAY_NO_YEAR.format(airs)}`,
        hasTime(item.airs) ? `${TIME.format(airs)} UTC` : null,
      ]);
      const after = join([label, DAY.format(airs)]);
      return {
        title: item.title as string,
        url: `https://www.youtube.com/watch?v=${id}`,
        date: airs,
        rank: 1,
        starts,
        ends: ends ?? videoEnd(airs),
        note: upcoming ? before : after,
        noteAfter: upcoming ? after : null,
        airs: upcoming ? airs : null,
        image: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        video: true,
      };
    }
    return {
      title: item.title as string,
      // An esphome.io URL as a path, so it matches the post it links to.
      url: sitePath(item.url as string),
      date: starts as Date,
      rank: 1,
      starts,
      ends,
      note: (item.note as string | undefined) ?? join([label, DAY.format(starts as Date)]),
      noteAfter: null,
      airs: null,
      image:
        item.image === "auto" ? autoImage(item.url as string, posts) : ((item.image as string | undefined) ?? null),
      video: false,
    };
  });
}

// Up from now on, until it's removed: nothing about it will change.
const fixed = (item: Item, now: Date) => (!item.starts || item.starts <= now) && !item.ends;

// The items of Latest that might ever show, each marked `sure` if it is
// certain to show whenever the list gets that far: it is up for good and
// nothing could take its link. Once there are `limit` sure items, nothing
// after them can show. Leaving out what can never show keeps the page small:
// the blog has hundreds of posts.
function canShow(items: Item[], limit: number, now: Date) {
  // Who gets a link when both are up: the higher rank, then the earlier item.
  // The same order as select.
  const beats = (other: number, me: number) =>
    items[other].rank > items[me].rank || (items[other].rank === items[me].rank && other < me);
  const kept: (Item & { sure: boolean })[] = [];
  let sure = 0;
  items.forEach((item, position) => {
    if (sure >= limit) return;
    const rivals = items.flatMap((other, index) => (other.url === item.url && beats(index, position) ? [other] : []));
    // Something always up takes the link.
    if (rivals.some((rival) => fixed(rival, now))) return;
    const isSure = fixed(item, now) && rivals.length === 0;
    kept.push({ ...item, sure: isSure });
    if (isSure) sure++;
  });
  return kept;
}

function latestList(bio: Raw, posts: Post[], now: Date): Omit<List, "hidden"> {
  const limit = bio.latestCount as number;
  const items = [
    ...handPicked(bio.latest as Raw[], posts, now),
    ...posts.map((post) => ({
      ...post,
      rank: 0,
      starts: null,
      ends: null,
      noteAfter: null,
      airs: null,
      image: post.image ?? null,
      video: false,
    })),
  ]
    .filter((item) => !(item.ends && item.ends <= now))
    // Newest first. The sort is stable, so on the same date an item added by
    // hand comes before a post.
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  // The large first card goes to an item that might come first: one with
  // nothing sure to show before it. Those get a hero version and, unless
  // they are always first, a row version too. Without an image an item stays
  // a row rather than a card with a hole. A video is always a large card,
  // wherever it is.
  const kept = canShow(items, limit, now);
  const entries = kept.flatMap((item, index) => {
    const { sure: _sure, date: _date, ...rest } = item;
    const row = { ...rest, key: String(index), hidden: false, card: item.video, highlight: false };
    if (item.video || !item.image || kept.slice(0, index).some((before) => before.sure)) return [row];
    const hero = { ...row, card: true };
    if (index === 0) return [hero];
    return [
      { ...hero, variant: "hero" as const },
      { ...row, variant: "row" as const },
    ];
  });
  return { title: "Latest", order: 0, limit, claims: true, entries };
}

// Links, minus those that have ended. Links have no limit and don't claim,
// so the store can be in Latest and Featured at once.
function linkList(section: Raw, order: number, now: Date): Omit<List, "hidden"> {
  const keyPath = itemPath("sections", order - 1, section);
  const entries = (section.links as Raw[]).flatMap((link, index) => {
    const linkPath = itemPath(`${keyPath}.links`, index, link);
    const starts = parseTime(link.starts, `${linkPath}.starts`);
    const ends = parseEnd(link.ends, `${linkPath}.ends`);
    if (ends && ends <= now) return [];
    return [
      {
        key: String(index),
        url: link.url as string,
        rank: 0,
        starts,
        ends,
        hidden: false,
        title: link.label as string,
        note: null,
        airs: null,
        noteAfter: null,
        image: null,
        card: false,
        video: false,
        highlight: link.highlight === true,
      },
    ];
  });
  return { title: section.title as string, order, limit: null, claims: false, entries };
}

/**
 * Every list on the page, in order: Latest, then the link sections. Each
 * entry is marked `hidden` if it isn't showing at `now`; the rule in
 * bio-schedule.mjs shows it when its time comes. Lists with nothing to render
 * are left out.
 */
export function resolve(bio: Raw, posts: Post[], now: Date): List[] {
  const lists = [
    latestList(bio, posts, now),
    ...(bio.sections as Raw[]).map((section, index) => linkList(section, index + 1, now)),
  ];
  const picks = select(lists, now);
  return lists.flatMap((list, index) => {
    if (list.entries.length === 0) return [];
    const entries = list.entries.map((entry) => ({ ...entry, hidden: !isShowing(entry, picks[index]) }));
    return [{ ...list, entries, hidden: entries.every((entry) => entry.hidden) }];
  });
}
