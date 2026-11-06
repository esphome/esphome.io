// Tests for the link-in-bio page: the rule shared by the build and the page
// (src/lib/bio-schedule.mjs) and the build itself (src/lib/bio.ts).
import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, test } from "node:test";
import * as data from "../src/data/bio.ts";
import { autoImage, BioConfigError, parseEnd, parseTime, resolve, validate, youtubeId } from "../src/lib/bio.ts";
import { isOpen, isShowing, select } from "../src/lib/bio-schedule.mjs";

const NOW = "2026-11-06T12:00:00Z";
// The images in src/assets/bio/, which the real data file uses, and some made up for the tests.
const ASSETS = fs.readdirSync("src/assets/bio");
const IMAGES = [...ASSETS, "a.webp", "now.webp", "soon.webp"];
const VIDEO = "https://www.youtube.com/watch?v=XyAL1to3Lm4";

const post = (day, title, label = "News", image = `/images/${day}.webp`) => ({
  title,
  url: `/blog/${day}/`,
  date: new Date(`${day}T00:00:00Z`),
  note: `${label} · ${day}`,
  image,
});

const POSTS = [
  post("2026-10-21", "2026.10.0", "Release"),
  post("2026-10-14", "Voice"),
  post("2026-09-16", "2026.9.0", "Release"),
  post("2026-08-19", "2026.8.0", "Release"),
  post("2026-08-04", "Desktop app"),
];

const config = (overrides = {}) => ({
  latest: [],
  latestCount: 3,
  sections: [{ title: "Featured", links: [{ label: "Store", url: "https://store.example/" }] }],
  ...overrides,
});

const build = (cfg, now = NOW, posts = POSTS) => {
  validate(cfg, IMAGES);
  return resolve(cfg, posts, new Date(now));
};

const byTitle = (lists) => Object.fromEntries(lists.map((list) => [list.title, list]));

// What the build shows: the titles of the entries it didn't hide.
const shown = (lists) =>
  Object.fromEntries(lists.map((list) => [list.title, list.entries.filter((e) => !e.hidden).map((e) => e.title)]));

// What the page's script shows at `time`: the same rule, fed the way the
// script feeds it, from the rendered data attributes (strings, not Dates).
const showingAt = (lists, time) => {
  const attrs = lists.map((list) => ({
    limit: list.limit ?? Infinity,
    claims: list.claims,
    entries: list.entries.map((e) => ({
      key: e.key,
      url: e.url,
      rank: e.rank,
      variant: e.variant,
      starts: e.starts?.toISOString(),
      ends: e.ends?.toISOString(),
    })),
  }));
  const picks = select(attrs, Date.parse(time));
  return Object.fromEntries(
    lists.map((list, index) => [
      list.title,
      list.entries.filter((_, i) => isShowing(attrs[index].entries[i], picks[index])).map((e) => e.title),
    ]),
  );
};

const assertInvalid = (cfg, message) =>
  assert.throws(
    () => validate(cfg, IMAGES),
    (error) => error instanceof BioConfigError && error.message === `src/data/bio.ts ${message}`,
  );

const latestItem = (fields) => config({ latest: [{ title: "Item", url: "/item/", starts: "2026-11-01", ...fields }] });
const link = (fields) =>
  config({ sections: [{ title: "Featured", links: [{ label: "Store", url: "/store/", ...fields }] }] });

describe("the shared rule", () => {
  test("an item is open from starts until ends", () => {
    const item = { starts: "2026-11-06T00:00:00Z", ends: "2026-11-07T00:00:00Z" };
    assert.equal(isOpen(item, "2026-11-05T23:59:59Z"), false);
    assert.equal(isOpen(item, "2026-11-06T00:00:00Z"), true);
    assert.equal(isOpen(item, "2026-11-07T00:00:00Z"), false);
    assert.equal(isOpen({}, NOW), true);
    assert.equal(isOpen({ starts: "", ends: null }, NOW), true);
  });

  test("keeps to the limit, and to every entry without one", () => {
    const entries = ["a", "b", "c"].map((key) => ({ key, url: `/${key}/` }));
    assert.deepEqual(select([{ entries, limit: 2 }, { entries }], NOW), [
      ["a", "b"],
      ["a", "b", "c"],
    ]);
  });

  test("gives a shared link to the highest rank that is up", () => {
    const entries = [
      { key: "post", url: "/x/" },
      { key: "picked", url: "/x/", rank: 1, starts: "2026-11-07" },
    ];
    assert.deepEqual(select([{ entries, claims: true }], NOW), [["post"]]);
    assert.deepEqual(select([{ entries, claims: true }], "2026-11-08"), [["picked"]]);
  });

  test("between equals, gives a shared link to the earlier list, then the earlier entry", () => {
    const entries = [
      { key: "a", url: "/x/" },
      { key: "b", url: "/x/" },
    ];
    const lists = [
      { entries, claims: true },
      { entries, claims: true },
      { entries, claims: false },
    ];
    assert.deepEqual(select(lists, NOW), [["a"], [], ["a", "b"]]);
  });

  test("counts a hero and a row version of one item once", () => {
    const entries = [
      { key: "0", url: "/a/", variant: "hero" },
      { key: "0", url: "/a/", variant: "row" },
      { key: "1", url: "/b/" },
    ];
    assert.deepEqual(select([{ entries, limit: 2, claims: true }], NOW), [["0", "1"]]);
  });

  test("shows a hero only in first place and a row anywhere else", () => {
    assert.equal(isShowing({ key: "a", variant: "hero" }, ["a", "b"]), true);
    assert.equal(isShowing({ key: "b", variant: "hero" }, ["a", "b"]), false);
    assert.equal(isShowing({ key: "a", variant: "row" }, ["a", "b"]), false);
    assert.equal(isShowing({ key: "b", variant: "row" }, ["a", "b"]), true);
    assert.equal(isShowing({ key: "b" }, ["a", "b"]), true);
    assert.equal(isShowing({ key: "c" }, ["a", "b"]), false);
  });
});

describe("dates", () => {
  test("reads days and times as UTC unless they carry an offset", () => {
    assert.equal(parseTime("2026-11-15", "x").toISOString(), "2026-11-15T00:00:00.000Z");
    assert.equal(parseTime("2026-11-15T17:30", "x").toISOString(), "2026-11-15T17:30:00.000Z");
    assert.equal(parseTime("2026-11-15T17:30:00Z", "x").toISOString(), "2026-11-15T17:30:00.000Z");
    assert.equal(parseTime("2026-11-15T18:30:00+01:00", "x").toISOString(), "2026-11-15T17:30:00.000Z");
    assert.equal(parseTime(undefined, "x"), null);
    assert.equal(parseTime(null, "x"), null);
  });

  test("keeps a day-only ends up through that day", () => {
    assert.equal(parseEnd("2026-11-15", "x").toISOString(), "2026-11-16T00:00:00.000Z");
    assert.equal(parseEnd("2026-11-15T20:00:00Z", "x").toISOString(), "2026-11-15T20:00:00.000Z");
    assert.equal(parseEnd(undefined, "x"), null);
  });

  test("rejects anything that isn't an ISO date", () => {
    for (const value of ["15/11/2026", "2026-11-15 17:30", "2026-02-30", "2026-13-01", "2026-11-15T25:00:00Z"]) {
      assert.throws(() => parseTime(value, "x"), BioConfigError, value);
    }
  });
});

describe("YouTube links", () => {
  test("reads the video ID from the usual links", () => {
    for (const value of [
      "XyAL1to3Lm4",
      VIDEO,
      "https://m.youtube.com/watch?v=XyAL1to3Lm4",
      "https://youtu.be/XyAL1to3Lm4",
      "https://www.youtube.com/live/XyAL1to3Lm4",
      "https://youtube.com/shorts/XyAL1to3Lm4",
      "https://www.youtube.com/embed/XyAL1to3Lm4",
    ]) {
      assert.equal(youtubeId(value), "XyAL1to3Lm4", value);
    }
  });

  test("rejects channels, playlists and other sites", () => {
    for (const value of [
      undefined,
      "not a link",
      "https://www.youtube.com/@esphome",
      "https://www.youtube.com/playlist?list=PL123",
      "https://www.youtube.com/watch?v=short",
      "https://vimeo.com/XyAL1to3Lm4",
    ]) {
      assert.equal(youtubeId(value), null, String(value));
    }
  });
});

describe("validation: a mistake names the item", () => {
  test("accepts the real data file, whose images are all in src/assets/bio/", () =>
    assert.equal(validate(data, ASSETS), true));

  test("accepts a full example", () =>
    assert.equal(
      validate(
        config({
          latest: [
            {
              title: "A",
              url: "https://a.example/",
              starts: "2026-11-01",
              ends: "2026-11-02",
              label: "Event",
              note: "x",
              image: "a.webp",
            },
            { title: "B", url: "/b/", starts: "2026-11-01", image: "https://example.com/b.webp" },
            {
              type: "youtube",
              video: VIDEO,
              title: "Stream",
              airs: "2026-11-15T18:00:00Z",
              starts: "2026-11-12",
              ends: "2026-11-20",
            },
          ],
          sections: [
            { title: "Featured", links: [{ label: "Sale", url: "/sale/", starts: "2026-11-27", ends: "2026-11-30" }] },
          ],
        }),
        IMAGES,
      ),
      true,
    ));

  test("checks the shape of the file", () => {
    assertInvalid(config({ latest: {} }), "latest: must be a list");
    assertInvalid(config({ latest: ["x"] }), "latest[0]: must be an object with title, url and starts");
    assertInvalid(config({ sections: {} }), "sections: must be a list");
    assertInvalid(config({ sections: [null] }), "sections[0]: must be an object with title and links");
    assertInvalid(config({ sections: [{ links: [{ label: "A", url: "/a/" }] }] }), "sections[0].title: is required");
    assertInvalid(
      config({ sections: [{ title: "Featured", links: [] }] }),
      'sections[0] ("Featured").links: must be a non-empty list',
    );
    assertInvalid(
      config({ sections: [{ title: "Featured", links: [7] }] }),
      'sections[0] ("Featured").links[0]: must be an object with label and url',
    );
  });

  test("checks latestCount", () => {
    for (const latestCount of [0, 11, 2.5, undefined]) {
      assertInvalid(config({ latestCount }), "latestCount: must be a whole number from 1 to 10");
    }
  });

  test("needs a title, a link and starts on an item in Latest", () => {
    assertInvalid(latestItem({ title: "" }), "latest[0].title: is required");
    assertInvalid(
      latestItem({ url: "item/" }),
      'latest[0] ("Item").url: must be a site path like /blog/ or a full https:// URL',
    );
    assertInvalid(
      latestItem({ url: undefined }),
      'latest[0] ("Item").url: must be a site path like /blog/ or a full https:// URL',
    );
    assertInvalid(
      latestItem({ starts: undefined }),
      'latest[0] ("Item").starts: is required: when it appears, e.g. "2026-11-01"',
    );
  });

  test("checks the optional text and image of an item in Latest", () => {
    assertInvalid(latestItem({ label: " " }), 'latest[0] ("Item").label: must be text, or left out');
    assertInvalid(latestItem({ note: "" }), 'latest[0] ("Item").note: must be text, or left out');
    for (const image of ["missing.webp", "/images/bio/a.webp", "http://example.com/a.webp"]) {
      assertInvalid(
        latestItem({ image }),
        `latest[0] ("Item").image: "${image}" is not in src/assets/bio/. Save the image there and give its file name, e.g. "2026-11-community-day.webp", or use "auto"`,
      );
    }
    assertInvalid(latestItem({ type: "video" }), 'latest[0] ("Item").type: must be "youtube", or left out for a link');
  });

  test("rejects ends before starts", () => {
    assertInvalid(latestItem({ ends: "2026-10-31" }), 'latest[0] ("Item").ends: must be after starts');
    assertInvalid(
      latestItem({ starts: "2026-11-01T12:00:00Z", ends: "2026-11-01T12:00:00Z" }),
      'latest[0] ("Item").ends: must be after starts',
    );
    assertInvalid(
      link({ starts: "2026-11-02", ends: "2026-11-01" }),
      'sections[0] ("Featured").links[0] ("Store").ends: must be after starts',
    );
  });

  test("names the key to use for any other date key", () => {
    assertInvalid(latestItem({ date: "2026-11-01" }), 'latest[0] ("Item").date: is not a key here. Use starts');
    assertInvalid(latestItem({ start: "2026-11-01" }), 'latest[0] ("Item").start: is not a key here. Use starts');
    assertInvalid(latestItem({ expires: "2026-11-01" }), 'latest[0] ("Item").expires: is not a key here. Use ends');
    assertInvalid(
      link({ expires: "2026-11-01" }),
      'sections[0] ("Featured").links[0] ("Store").expires: is not a key here. Use ends',
    );
  });

  test("rejects a date that isn't YYYY-MM-DD", () =>
    assertInvalid(
      latestItem({ starts: "01/11/2026" }),
      'latest[0] ("Item").starts: "01/11/2026" is not a date. Use YYYY-MM-DD, or YYYY-MM-DDTHH:MM:SSZ for a time',
    ));

  test("checks links", () => {
    assertInvalid(link({ label: "" }), 'sections[0] ("Featured").links[0].label: is required');
    assertInvalid(
      link({ url: "http://store.example/" }),
      'sections[0] ("Featured").links[0] ("Store").url: must be a site path like /blog/ or a full https:// URL',
    );
    assertInvalid(
      link({ ends: "soon" }),
      'sections[0] ("Featured").links[0] ("Store").ends: "soon" is not a date. Use YYYY-MM-DD, or YYYY-MM-DDTHH:MM:SSZ for a time',
    );
  });

  test("checks YouTube items", () => {
    const video = (fields) =>
      config({ latest: [{ type: "youtube", video: VIDEO, title: "Stream", airs: "2026-11-15T18:00:00Z", ...fields }] });
    assert.equal(validate(video({})), true);
    assertInvalid(
      video({ video: "https://www.youtube.com/@esphome" }),
      'latest[0] ("Stream").video: must be a YouTube video ID or link, e.g. https://www.youtube.com/watch?v=XyAL1to3Lm4',
    );
    assertInvalid(
      video({ airs: undefined }),
      'latest[0] ("Stream").airs: is required: when it goes out, e.g. "2026-11-15T18:00:00Z"',
    );
    assertInvalid(
      video({ airs: "Sunday" }),
      'latest[0] ("Stream").airs: "Sunday" is not a date. Use YYYY-MM-DD, or YYYY-MM-DDTHH:MM:SSZ for a time',
    );
    assertInvalid(video({ ends: "2026-11-15T17:00:00Z" }), 'latest[0] ("Stream").ends: must be after airs');
    assertInvalid(video({ date: "2026-11-15" }), 'latest[0] ("Stream").date: is not a key here. Use airs');
    assertInvalid(video({ start: "2026-11-15" }), 'latest[0] ("Stream").start: is not a key here. Use airs');
  });
});

describe("the Latest list", () => {
  test("fills up with the newest posts", () => {
    const lists = build(config());
    assert.deepEqual(shown(lists).Latest, ["2026.10.0", "Voice", "2026.9.0"]);
    assert.deepEqual(byTitle(lists).Latest.entries[1].note, "News · 2026-10-14");
  });

  test("leaves out posts that can never show", () =>
    assert.deepEqual(
      byTitle(build(config())).Latest.entries.map((e) => e.title),
      ["2026.10.0", "Voice", "2026.9.0"],
    ));

  test("puts an item added by hand in its place by starts, with its date", () => {
    const lists = build(
      config({ latest: [{ title: "Meetup", url: "/meetup/", starts: "2026-10-15", label: "Event" }] }),
    );
    assert.deepEqual(shown(lists).Latest, ["2026.10.0", "Meetup", "Voice"]);
    assert.equal(byTitle(lists).Latest.entries[1].note, "Event · October 15, 2026");
  });

  test("shows the date alone without a label, and the note instead of both", () => {
    const lists = build(
      config({
        latest: [
          { title: "A", url: "/a/", starts: "2026-11-02" },
          { title: "B", url: "/b/", starts: "2026-11-01", label: "Event", note: "This Saturday" },
        ],
      }),
    );
    assert.deepEqual(
      byTitle(lists).Latest.entries.map((e) => e.note),
      ["November 2, 2026", "This Saturday", "Release · 2026-10-21"],
    );
  });

  test("puts an item added by hand before a post on the same day", () =>
    assert.deepEqual(
      shown(build(config({ latest: [{ title: "Same day", url: "/s/", starts: "2026-10-21" }] }))).Latest,
      ["Same day", "2026.10.0", "Voice"],
    ));

  test("renders a future item hidden, and brings it in at the top when it starts", () => {
    const lists = build(config({ latest: [{ title: "Soon", url: "/soon/", starts: "2026-11-20T09:00:00Z" }] }));
    const soon = byTitle(lists).Latest.entries.filter((e) => e.title === "Soon");
    assert.ok(soon.length > 0 && soon.every((e) => e.hidden));
    assert.deepEqual(showingAt(lists, "2026-11-20T08:59:59Z").Latest, ["2026.10.0", "Voice", "2026.9.0"]);
    assert.deepEqual(showingAt(lists, "2026-11-20T09:00:00Z").Latest, ["Soon", "2026.10.0", "Voice"]);
  });

  test("renders the post that moves up when an item ends", () => {
    const lists = build(config({ latest: [{ title: "Now", url: "/now/", starts: "2026-11-01", ends: "2026-11-07" }] }));
    assert.deepEqual(shown(lists).Latest, ["Now", "2026.10.0", "Voice"]);
    assert.deepEqual(showingAt(lists, "2026-11-07T23:59:59Z").Latest, ["Now", "2026.10.0", "Voice"]);
    assert.deepEqual(showingAt(lists, "2026-11-08T00:00:00Z").Latest, ["2026.10.0", "Voice", "2026.9.0"]);
  });

  test("leaves out an item that has ended", () =>
    assert.deepEqual(
      byTitle(
        build(config({ latest: [{ title: "Old", url: "/old/", starts: "2026-11-01", ends: "2026-11-05" }] })),
      ).Latest.entries.map((e) => e.title),
      ["2026.10.0", "Voice", "2026.9.0"],
    ));

  test("shows a post in its own place before and after an item added by hand that links to it", () => {
    const lists = build(
      config({
        latest: [{ title: "Voice is here", url: "/blog/2026-10-14/", starts: "2026-11-10", ends: "2026-11-12" }],
      }),
    );
    assert.deepEqual(shown(lists).Latest, ["2026.10.0", "Voice", "2026.9.0"]);
    assert.deepEqual(showingAt(lists, "2026-11-11T00:00:00Z").Latest, ["Voice is here", "2026.10.0", "2026.9.0"]);
    assert.deepEqual(showingAt(lists, "2026-11-13T00:00:00Z").Latest, ["2026.10.0", "Voice", "2026.9.0"]);
  });

  test("leaves out a post for good once an item added by hand takes its link for good", () =>
    assert.deepEqual(
      byTitle(
        build(config({ latest: [{ title: "Voice is here", url: "/blog/2026-10-14/", starts: "2026-11-01" }] })),
      ).Latest.entries.map((e) => e.title),
      ["Voice is here", "2026.10.0", "2026.9.0"],
    ));

  test("gives an item that might come first a hero and a row version", () => {
    const lists = build(
      config({ latest: [{ title: "Soon", url: "/soon/", starts: "2026-11-20", image: "soon.webp" }] }),
    );
    const entries = byTitle(lists).Latest.entries.map((e) => [e.title, e.variant, e.card]);
    assert.deepEqual(entries, [
      ["Soon", undefined, true],
      ["2026.10.0", "hero", true],
      ["2026.10.0", "row", false],
      ["Voice", undefined, false],
      ["2026.9.0", undefined, false],
    ]);
    // Before Soon starts, the post is first and shows as the card; after, as a row.
    const shownVersion = (time) => {
      const latest = byTitle(lists).Latest;
      const attrs = latest.entries.map((e) => ({ ...e, starts: e.starts?.toISOString(), ends: e.ends?.toISOString() }));
      const [keys] = select([{ entries: attrs, limit: latest.limit, claims: true }], Date.parse(time));
      return attrs.filter((e) => e.title === "2026.10.0" && isShowing(e, keys)).map((e) => e.variant);
    };
    assert.deepEqual(shownVersion(NOW), ["hero"]);
    assert.deepEqual(shownVersion("2026-11-20T00:00:00Z"), ["row"]);
  });

  test("keeps an item without an image as a row, even in first place", () => {
    const lists = build(config({ latest: [{ title: "Plain", url: "/plain/", starts: "2026-11-01" }] }), NOW, [
      { ...post("2026-10-21", "Old"), image: undefined },
    ]);
    assert.deepEqual(
      byTitle(lists).Latest.entries.map((e) => [e.title, e.card, e.image]),
      [
        ["Plain", false, null],
        ["Old", false, null],
      ],
    );
  });
});

describe("image: auto", () => {
  const OG = "https://assets.openhomefoundation.org/opengraph?url=";

  test("uses a blog post's own cover", () => {
    assert.equal(autoImage("/blog/2026-10-14/", POSTS), "/images/2026-10-14.webp");
    assert.equal(autoImage("https://esphome.io/blog/2026-10-14/", POSTS), "/images/2026-10-14.webp");
  });

  test("uses the social preview image of any other page", () => {
    assert.equal(autoImage("/install/", POSTS), `${OG}https%3A%2F%2Fesphome.io%2Finstall%2F`);
    assert.equal(
      autoImage("https://www.openhomefoundation.org/community-day/", POSTS),
      `${OG}https%3A%2F%2Fwww.openhomefoundation.org%2Fcommunity-day%2F`,
    );
    assert.equal(
      autoImage("/blog/2026-10-14/", [{ ...POSTS[1], image: undefined }]),
      `${OG}https%3A%2F%2Fesphome.io%2Fblog%2F2026-10-14%2F`,
    );
  });

  test("is accepted by validation and fills in the image", () => {
    const lists = build(
      config({ latest: [{ title: "Install", url: "/install/", starts: "2026-11-01", image: "auto" }] }),
    );
    assert.equal(byTitle(lists).Latest.entries[0].image, `${OG}https%3A%2F%2Fesphome.io%2Finstall%2F`);
    assert.equal(byTitle(lists).Latest.entries[0].card, true);
  });
});

describe("YouTube items", () => {
  const stream = (fields = {}) =>
    config({
      latest: [
        {
          type: "youtube",
          video: VIDEO,
          title: "Stream",
          airs: "2026-11-15T18:00:00Z",
          label: "Livestream",
          ...fields,
        },
      ],
    });

  test("is always a large card, in one version, wherever it is", () => {
    const lists = build(stream({ airs: "2026-10-15T18:00:00Z", ends: "2026-11-30" }));
    const videos = byTitle(lists).Latest.entries.filter((e) => e.video);
    assert.deepEqual(
      videos.map((e) => [e.card, e.variant]),
      [[true, undefined]],
    );
    assert.deepEqual(shown(lists).Latest, ["2026.10.0", "Stream", "Voice"]);
  });

  test("links to the video and uses its thumbnail", () => {
    const [entry] = byTitle(build(stream({ starts: "2026-11-01" }))).Latest.entries;
    assert.equal(entry.url, VIDEO);
    assert.equal(entry.image, "https://i.ytimg.com/vi/XyAL1to3Lm4/hqdefault.jpg");
    assert.equal(entry.video, true);
  });

  test("says when an upcoming stream starts, in UTC, and carries the note for after", () => {
    const [entry] = byTitle(build(stream())).Latest.entries;
    assert.equal(entry.note, "Livestream · Starts November 15 · 18:00 UTC");
    assert.equal(entry.noteAfter, "Livestream · November 15, 2026");
    assert.equal(entry.airs.toISOString(), "2026-11-15T18:00:00.000Z");
  });

  test("leaves the time out when only a day is given", () =>
    assert.equal(
      byTitle(build(stream({ airs: "2026-11-15" }))).Latest.entries[0].note,
      "Livestream · Starts November 15",
    ));

  test("shows the date once it has aired, in date order", () => {
    const lists = build(stream({ airs: "2026-10-15T18:00:00Z", label: undefined, ends: "2026-11-30" }));
    const latest = byTitle(lists).Latest;
    assert.deepEqual(shown(lists).Latest, ["2026.10.0", "Stream", "Voice"]);
    const entry = latest.entries.find((e) => e.title === "Stream");
    assert.equal(entry.note, "October 15, 2026");
    assert.equal(entry.noteAfter, null);
    assert.equal(entry.airs, null);
  });

  test("can show before it airs", () => {
    const lists = build(stream({ starts: "2026-11-12" }));
    assert.deepEqual(shown(lists).Latest, ["2026.10.0", "Voice", "2026.9.0"]);
    assert.deepEqual(showingAt(lists, "2026-11-12T00:00:00Z").Latest, ["Stream", "2026.10.0", "Voice"]);
  });

  test("comes down at the end of the day after it airs, unless ends says otherwise", () => {
    const lists = build(stream());
    assert.equal(byTitle(lists).Latest.entries[0].ends.toISOString(), "2026-11-17T00:00:00.000Z");
    assert.deepEqual(showingAt(lists, "2026-11-16T23:59:59Z").Latest[0], "Stream");
    assert.deepEqual(showingAt(lists, "2026-11-17T00:00:00Z").Latest, ["2026.10.0", "Voice", "2026.9.0"]);
    assert.equal(
      byTitle(build(stream({ ends: "2026-11-20" }))).Latest.entries[0].ends.toISOString(),
      "2026-11-21T00:00:00.000Z",
    );
  });
});

describe("links", () => {
  test("show inside their window and are left out once ended", () => {
    const lists = build(
      config({
        sections: [
          {
            title: "Featured",
            links: [
              { label: "Store", url: "/store/", highlight: true },
              { label: "Sale", url: "/sale/", starts: "2026-11-27T08:00:00Z", ends: "2026-11-30" },
              { label: "Survey", url: "/survey/", ends: "2026-11-01" },
            ],
          },
        ],
      }),
    );
    const featured = byTitle(lists).Featured;
    assert.deepEqual(
      featured.entries.map((e) => [e.title, e.hidden, e.highlight]),
      [
        ["Store", false, true],
        ["Sale", true, false],
      ],
    );
    assert.deepEqual(showingAt(lists, "2026-11-28T00:00:00Z").Featured, ["Store", "Sale"]);
    assert.deepEqual(showingAt(lists, "2026-12-01T00:00:00Z").Featured, ["Store"]);
  });

  test("don't take a link from Latest", () => {
    const lists = build(
      config({ sections: [{ title: "Featured", links: [{ label: "Voice", url: "/blog/2026-10-14/" }] }] }),
    );
    assert.deepEqual(shown(lists), { Latest: ["2026.10.0", "Voice", "2026.9.0"], Featured: ["Voice"] });
  });

  test("bring a section in hidden when its only link starts later", () => {
    const lists = build(link({ starts: "2026-11-27" }));
    assert.equal(byTitle(lists).Featured.hidden, true);
    assert.deepEqual(showingAt(lists, "2026-11-27T00:00:00Z").Featured, ["Store"]);
  });

  test("leave out a section whose links have all ended", () =>
    assert.deepEqual(
      build(link({ ends: "2026-11-01" })).map((list) => list.title),
      ["Latest"],
    ));
});

describe("the page and the build agree", () => {
  test("the page's rule shows what the build shows, at build time", () => {
    const cfg = config({
      latestCount: 4,
      latest: [
        { title: "Now", url: "/now/", starts: "2026-11-01", ends: "2026-11-07", image: "now.webp" },
        { title: "Soon", url: "/soon/", starts: "2026-11-20", image: "soon.webp" },
        { title: "Voice is here", url: "/blog/2026-10-14/", starts: "2026-11-10", ends: "2026-11-12" },
        { type: "youtube", video: VIDEO, title: "Stream", airs: "2026-11-15T18:00:00Z", starts: "2026-11-12" },
      ],
      sections: [
        { title: "Featured", links: [{ label: "Sale", url: "/sale/", starts: "2026-11-27" }] },
        { title: "Get started", links: [{ label: "Install", url: "/install/" }] },
      ],
    });
    for (const time of [
      "2026-11-06T12:00:00Z",
      "2026-11-11T00:00:00Z",
      "2026-11-16T00:00:00Z",
      "2026-11-28T00:00:00Z",
    ]) {
      assert.deepEqual(showingAt(build(cfg, time), time), shown(build(cfg, time)), time);
    }
  });

  test("the real data file builds, and the page agrees with it", () => {
    const lists = build(data, NOW);
    assert.deepEqual(shown(lists).Latest, ["Community Day 2026", "2026.10.0", "Voice", "2026.9.0", "2026.8.0"]);
    assert.deepEqual(showingAt(lists, NOW), shown(lists));
    assert.deepEqual(showingAt(lists, "2026-11-08T00:00:00Z").Latest, [
      "2026.10.0",
      "Voice",
      "2026.9.0",
      "2026.8.0",
      "Desktop app",
    ]);
  });
});
