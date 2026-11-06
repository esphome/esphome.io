// The link-in-bio page at https://esphome.io/bio/, the one link on ESPHome's
// social profiles. The page is this file, top to bottom. It is built by
// src/pages/bio.astro, with the rules in src/lib/bio.ts. A mistake here fails
// the build and names the item at fault, so nothing broken reaches the live
// page.
//
// What fills the page by itself
//   Blog posts and release notes appear in the Latest list on their own when
//   they're published. The list keeps the newest few (`latestCount`), so
//   older ones drop off by themselves. They never need adding or dating here.
//
// What you add by hand: `starts` and `ends`
//   Anything you add by hand (an item in `latest`, a link in `sections`)
//   uses the same two keys:
//     - `starts`: when it appears. In `latest` it's required, and it also
//       sets the item's place and the date shown on it, just like a blog
//       post's publish date. A date in the past shows it right away; a future
//       one makes it wait, then come in at the top of the list. On links
//       it's optional: without it, a link shows as soon as the change is live.
//     - `ends`: when it goes. Optional: without it, the item stays until you
//       delete it.
//   A YouTube video or livestream also has `airs`: when it goes out, which
//   sets its place and date. Without `ends` it comes down at the end of the
//   day after it airs.
//
//   Write dates and times like this, in quotes. Times are UTC unless you add
//   an offset:
//     starts: "2026-11-15"                  // from midnight UTC, Nov 15
//     starts: "2026-11-15T17:30:00Z"        // from 17:30 UTC
//     starts: "2026-11-15T18:30:00+01:00"   // the same moment, in CET
//     ends: "2026-11-15"                    // up through the whole of Nov 15
//     ends: "2026-11-15T20:00:00Z"          // down at 20:00 UTC
//
//   You don't need to deploy anything when `starts` or `ends` passes: the
//   page checks the time with the website (not the visitor's own clock) and
//   shows or hides items itself. Delete ended items whenever it suits you.
//
//   Scheduled items are in the page before they show, so anyone who reads
//   the page's source can see them early. Don't schedule anything that must
//   stay secret until it starts: merge it at the time instead.
//
// Images
//   Optional. YouTube items use the video's thumbnail by themselves. For
//   anything else in `latest`, set `image` to one of these:
//     image: "auto"                                 // the link's social preview image
//     image: "2026-11-community-day.webp"           // a file in src/assets/bio/
//     image: "https://example.com/banner.webp"      // an image the linked site hosts
//   Try "auto" first: a blog post's own image, or the preview image of any
//   other page. For a new image, save it in src/assets/bio/ with the year and
//   month first in its name. Make it 1200 × 630 pixels, WebP or JPEG, under
//   about 200 KB, and keep text and faces away from the edges: the cards crop
//   to fit. One image is enough: the build makes the smaller sizes itself.
//   Only an item with an image can be the large card at the top of the list.
import type { StarlightIcon } from "@astrojs/starlight/types";

/** A link in the Latest list. */
export interface LatestLink {
  title: string;
  url: string;
  /** When it appears. Also sets its place in the list and the date shown on it. */
  starts: string;
  /** Optional. When it goes. */
  ends?: string;
  /** Optional. A word shown before the date, e.g. "Event" gives "Event · November 3, 2026". */
  label?: string;
  /** Optional. Shown under the title instead of the label and date. */
  note?: string;
  /** Optional. "auto", a file name in src/assets/bio/, or an https:// URL (see Images at the top). */
  image?: string;
}

/** A YouTube video or livestream in the Latest list. It uses the video's thumbnail. */
export interface LatestVideo {
  type: "youtube";
  /** The video's link or ID. A scheduled livestream has its own link as soon as it's set up. */
  video: string;
  title: string;
  /** When it goes out. Sets its place in the list and the date shown on it. */
  airs: string;
  /** Optional. Show it from before it airs, e.g. a few days ahead. */
  starts?: string;
  /** Optional. Without it, it comes down at the end of the day after it airs. */
  ends?: string;
  /** Optional. A word shown before the date, e.g. "Livestream". */
  label?: string;
}

export type LatestItem = LatestLink | LatestVideo;

export interface BioLink {
  label: string;
  url: string;
  /** Shows the link in the accent colour. Use it for one link at most. */
  highlight?: boolean;
  /** Optional. When it appears. */
  starts?: string;
  /** Optional. When it goes. */
  ends?: string;
}

export interface BioSection {
  title: string;
  links: BioLink[];
}

export interface Social {
  /** A name from Starlight's icon set: https://starlight.astro.build/reference/icons/ */
  icon: StarlightIcon;
  label: string;
  url: string;
}

/** From the homepage hero (src/components/Homepage/Hero.astro). */
export const tagline = "Custom smart home devices, built by you";

/**
 * Latest: what we're posting about on social, alongside the blog posts and
 * release notes that fill the list by themselves, newest first.
 */
export const latest: LatestItem[] = [
  {
    title: "Community Day 2026",
    url: "https://www.openhomefoundation.org/community-day/",
    note: "Find or host a meetup near you on Saturday, November 7",
    image: "2026-11-community-day.webp",
    starts: "2026-11-03",
    ends: "2026-11-07",
  },
  // A scheduled announcement: it comes in at the top when `starts` passes.
  // {
  //   title: "Example announcement",
  //   url: "https://example.com/",
  //   label: "Event",
  //   starts: "2026-11-20T09:00:00Z",
  //   ends: "2026-11-22",
  // },
  // A YouTube video or livestream. Before it airs it reads
  // "Livestream · Starts November 15 · 18:00 UTC"; after, the date it aired.
  // {
  //   type: "youtube",
  //   video: "https://www.youtube.com/watch?v=VIDEO_ID",
  //   title: "Title as it appears on YouTube",
  //   airs: "2026-11-15T18:00:00Z",
  //   label: "Livestream",
  //   starts: "2026-11-12",   // optional: show it from a few days before
  // },
];

/** How many items the Latest list shows in all. */
export const latestCount = 5;

/** Links under the Latest list. Give one `starts` and `ends` to show it only for a while. */
export const sections: BioSection[] = [
  {
    title: "Featured",
    links: [{ label: "Merch store", url: "https://store.openhomefoundation.org/" }],
  },
  {
    title: "Get started",
    links: [
      { label: "Get started with ESPHome", url: "/install/getting-started/", highlight: true },
      { label: "Documentation", url: "/components/" },
      { label: "Chat with us on Discord", url: "https://esphome.io/chat" },
    ],
  },
];

export const socials: Social[] = [
  { icon: "github", label: "GitHub", url: "https://github.com/esphome/esphome" },
  { icon: "discord", label: "Discord", url: "https://esphome.io/chat" },
];
