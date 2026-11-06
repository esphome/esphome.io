---
name: update-bio-page
description: Use this whenever someone wants to add, schedule, change, or remove anything on ESPHome's link-in-bio page (https://esphome.io/bio/, src/data/bio.ts) — a livestream, YouTube video, announcement, event, campaign, store link, or other featured link — even if they only say "put X on the bio page", "add the livestream to bio", "link in bio", or "show this from Friday until Sunday". Also use it to clean up old items ("tidy the bio page", "take the stream down"), and to explain why something is or isn't showing on the bio page.
---

# Update the Link-in-Bio Page

The link-in-bio page at `/bio/` is what ESPHome's social profiles link to. Everything on it is set in one file: `src/data/bio.ts`. Read the comments at the top of that file before editing. They are the reference for every key, and this skill doesn't repeat them.

The people asking for changes are usually from marketing or community teams, not developers. Ask in plain language, and don't make them write TypeScript or work out UTC themselves.

## 1. Work Out What They Want

Find out:

- **What it is:** a link, a YouTube video or livestream, or an announcement.
- **The title** as it should read on the page, and **the URL**.
- **When it should appear and disappear**, if it's time-limited, and in which time zone.
- **An image**, for an item in the Latest list (see [Images](#images)).
- **Where it goes**, if they have a view. Otherwise pick the place using step 3.

Whatever they asked for, also look for old items to clear out (see [Clear Out Old Items](#clear-out-old-items)). Ask about those in the same message as your other questions. If they only asked for a cleanup, go straight to that section.

Don't add blog posts or release notes by hand. They appear in the Latest list by themselves once published, and older ones drop off as new ones arrive. If someone asks to add one of those, tell them it will appear on its own.

## 2. Check What You Were Given, and Ask When It Doesn't Fit

Before you edit anything, compare the request with what the file needs. If something is missing, unclear, or doesn't match, ask the requester. Don't guess, and never make up a URL, title, date, or time. A wrong guess here goes live on a page linked from every social profile.

Ask when:

- **Something required is missing.** Every item needs a title and a URL. An item in the Latest list also needs to know when it appears (`starts`). If they want it up now, that's today. A YouTube item needs the video link and when it airs.
- **A link isn't what's needed.** For example, it isn't a full `https://` URL. Or it's a YouTube channel, playlist, or studio link instead of a single video. Or the livestream doesn't have its own link yet. Ask for the video link. For a livestream, YouTube creates one as soon as the stream is scheduled.
- **A time is ambiguous.** No time zone, a relative day ("Friday", "next week"), a time without a date, 12-hour time without AM or PM, or a vague time ("evening", "after the stream"). Work out the date you think they mean and ask them to confirm it.
- **The times don't add up.** An `ends` before `starts`, an `ends` that has already passed, an upcoming livestream whose `airs` has already passed, or an `ends` before a livestream airs.
- **An item in the Latest list has no image, and `image: "auto"` doesn't give a good one** (see [Images](#images)). Ask whether they have one rather than making one up. Explain that only an item with an image can show as the large card at the top of the list; without one, it shows as a smaller row with a grey box where the picture would be, even when it's the newest item. Don't ask for a YouTube item: it uses the video's thumbnail.
- **An image isn't what's needed.** It's much smaller than 1200 × 630, it's a very different shape (a square logo, a tall poster) so cropping would cut off text or faces, or it comes from another site and you don't know whether ESPHome may use it. Ask for a better one, or for confirmation that the crop or the source is fine.
- **"When it airs" and "when it shows" are mixed up.** For a livestream, check whether the time they gave is when the stream starts (`airs`) or when the item should appear on the page (`starts`).
- **It might be under embargo.** If it sounds like an unannounced release, product or news, confirm it's public before you schedule it. If it isn't public yet, explain that it has to be merged at launch time (see step 4).
- **It's already there.** If the file already has an item with the same URL or title, ask whether to update that item or add another.
- **They want to remove something that isn't there,** or that comes from the blog (a post or release notes), which can't be deleted from `bio.ts`. Explain what they're seeing and ask what they want.
- **They want something to stay at the top of Latest whatever its date.** The page has no pins: Latest is always newest first. An item with today's `starts` comes in at the top, and moves down as newer posts are published. Explain this and ask whether that's enough.
- **Where it goes isn't clear,** and the table in step 3 fits more than one place.
- **The wording breaks the writing rules,** such as all caps or a title much longer than the other items. Suggest a version and ask them to confirm it.
- **The file has old items in it.** List what you found and ask whether to remove them (see [Clear Out Old Items](#clear-out-old-items)).

How to ask:

- Ask all your questions in one message, not one at a time.
- Use plain language. Don't ask about keys. Ask "When should it disappear from the page?", not "What's the `ends` value?"
- Suggest an answer where there's a sensible default, so they can just say yes. For example: "Show it from 3 days before the stream? (I'd use Thursday, November 12)".
- Before you edit, repeat back the times you'll use, in their time zone and in UTC. For example: "Shows from Thursday, November 12; airs Sunday, November 15 at 19:00 CET (18:00 UTC); comes down at the end of Monday, November 16."
- If they can't answer yet, such as when there's no stream link, stop. Tell them what you still need, and don't add a placeholder.

## 3. Choose Where It Goes

| They want… | Put it in |
| --- | --- |
| A livestream or YouTube video in the Latest list | `latest`, with `type: "youtube"` and `airs` |
| An announcement, event or other link in the Latest list | `latest`, with `starts` |
| A button that sits below the Latest list (a campaign, the store) | `links` of the **Featured** section in `sections` |
| A permanent "how to get started" link | `links` of the **Get started** section in `sections` |

In the Latest list, an item's `starts` is when it appears, where it sits among the other items (newest first), and the date shown on it, just as a blog post's publish date is. So an item with a future `starts` comes in at the top of the list when that time comes. A YouTube item works the same way with `airs`. The list shows the newest `latestCount` items in all.

## 4. Schedule It

Everything added by hand uses `starts` (when it appears) and `ends` (when it goes). The page checks the time with the website's server (not the visitor's own clock), so a scheduled item appears and disappears on time without anyone deploying anything at that moment.

Scheduled items are in the page's source before they show. Anyone who reads the source can see them early, so don't schedule anything under embargo, such as an unannounced release. Merge that at launch time instead, and say so to the requester.

- **`starts` in the Latest list is required.** A past date shows the item as soon as the change is live; a future one makes it wait. On links `starts` is optional: without it, they show as soon as the change is live.
- **No `ends`:** it stays until someone deletes it. A YouTube item is the exception: it comes down at the end of the day after `airs`, unless `ends` says otherwise.
- **A date alone in `ends`** keeps the item up through that whole day (UTC).
- **Dates and times are strings in quotes,** in ISO format.
- **Times are UTC** unless they carry an offset. Convert the requester's local time and write it as UTC with `Z`, or keep their local time with an offset (`"2026-11-15T18:30:00+01:00"`). Add a comment with the local time so a reviewer can check it:

  ```ts
  starts: "2026-11-15T17:30:00Z", // 18:30 CET
  ```

- **Mind daylight saving time:** the offset depends on the date. For example, Central European Time is +01:00 in winter and +02:00 (CEST) from late March to late October. Check the offset for the actual day.

A livestream usually wants to show from a few days before it airs, so people see the "Starts November 15 · 18:00 UTC" note. In `latest`:

```ts
  {
    type: "youtube",
    video: "https://www.youtube.com/watch?v=VIDEO_ID",
    title: "Title as it appears on YouTube",
    airs: "2026-11-15T18:00:00Z",
    label: "Livestream",
    starts: "2026-11-12",
  },
```

A scheduled announcement in `latest`, which comes in at the top on November 20:

```ts
  {
    title: "Community meetup this Saturday",
    url: "https://example.com/meetup/",
    label: "Event",
    starts: "2026-11-20T09:00:00Z",
    ends: "2026-11-22",
  },
```

A time-limited button in the Featured section of `sections`:

```ts
  {
    title: "Featured",
    links: [
      { label: "Merch store", url: "https://store.openhomefoundation.org/" },
      {
        label: "Black Friday at the merch store",
        url: "https://store.openhomefoundation.org/",
        starts: "2026-11-27T08:00:00Z",
        ends: "2026-11-30",
      },
    ],
  },
```

There are no other date keys. If you use `date`, `start`, or `expires`, the build stops and names the key to use instead.

## 5. Write It Well

- Titles read like the blog's post titles: sentence-style capitalization, except for names (ESPHome, Home Assistant) and the exact title of a YouTube video.
- `label` is a short word shown before the date, such as `Livestream`, `Announcement`, or `Event`.
- `note` replaces the label and date line with a short sentence of its own, such as "Find or host a meetup near you on Saturday, November 7". Use it sparingly.
- Use site paths for links to this site (`/install/getting-started/`) and full URLs (`https://…`) for everything else.

### Images

An image is optional, but only an item with one can be the large card at the top of the Latest list. Links in the sections below Latest don't show images. A YouTube item uses the video's thumbnail automatically, so it needs no image file. For anything else in Latest, in this order:

1. **`image: "auto"`** uses the link's social preview image: a blog post's own image, or the Open Home Foundation's preview image of any other page. Try this first. It usually needs no new image. To see what it gives for a page that isn't a blog post, open `https://assets.openhomefoundation.org/opengraph?url=` followed by the page's full URL. If it's a good fit, don't ask the requester for an image.
1. **A full `https://` URL** of an image the linked site already hosts, such as the merch store's banner. The build makes a small copy for the row and smaller sizes for the card, but only for the hosts in `image.domains` in `astro.config.mjs` (the Open Home Foundation's sites). An image from any other host is sent at full size and shrunk by the browser, which is slower and can look jagged. In that case, save a copy in `src/assets/bio/` instead (next point). Don't add a new host to that list unless someone asks: the build downloads from those hosts every time it runs.
1. **A new image**, if the requester sends one:
   - **Where:** save it in `src/assets/bio/`, and set `image` to its file name: `image: "2026-11-community-day.webp"`. The build fails and names the item if the file isn't there.
   - **Name:** the year and month, then a short lowercase name with hyphens, such as `2026-11-community-day.webp`.
   - **Size and format:** 1200 × 630 pixels, WebP or JPEG, under about 200 KB. That size is for the large card at the top of Latest. Save only this one size: the build makes the small row thumbnail and the card's smaller sizes for phones from it. Any other shape is cropped to fit, so keep important text and faces away from the edges.
   - **Prepare it** with sharp, which the repository already has. This resizes and crops to 1200 × 630 from the centre and converts to WebP:

     ```shell
     node -e 'require("sharp")("path/to/original.png").resize(1200, 630, { fit: "cover" }).webp({ quality: 80 }).toFile("src/assets/bio/2026-11-example.webp").then((i) => console.log(i.width, i.height, Math.round(i.size / 1024) + " KB"))'
     ```

     Then open the result and check the crop hasn't cut off text, logos, or faces. If it has, ask the requester for a version made for a 1200 × 630 (social sharing) frame. Most social or Open Graph images are already this shape.

When you remove an item that used an image in `src/assets/bio/`, delete that too, unless something else uses it. Search the repository for its file name first.

## 6. Check It

From the repository root, with the Node version in `.node-version`:

```shell
npm run test:js
npm run build
```

The build checks `bio.ts` and fails with the item at fault if anything is wrong, such as a bad date, a missing title, or an `ends` before its `starts`. Fix what it names. If the fix needs information you don't have, ask the requester (see step 2) rather than guessing.

Then confirm the item is in `dist/bio/index.html`. A scheduled item that hasn't started yet is there with a `hidden` attribute and its `data-starts` and `data-ends` times. That's expected: the page reveals it when the time comes.

## 7. Hand It Over

Tell the requester, in plain language:

- What was added and where it will appear.
- When it appears and disappears, in their time zone as well as UTC.
- That it needs to be merged and deployed before `starts` (or, without a `starts`, that it goes live when deployed).
- What you removed, and anything you left in because they wanted to keep it.

Don't commit, push, or open a pull request unless asked.

## Clear Out Old Items

Items added by hand stay in `bio.ts` after they stop showing. They do no harm, but they make the file harder to read and easier to get wrong. Each time you edit the file, check for old items and offer to remove them.

### Find Them

Check today's date and time in UTC first. Then look for:

- **Ended items:** anything whose `ends` has passed. These never show again.
- **Finished videos:** a YouTube item with no `ends` has come down by the end of the day after its `airs`.
- **Items pushed out of Latest for good:** an item in `latest` whose `starts` has passed but that isn't in the built page (`dist/bio/index.html`, after `npm run build`). At least `latestCount` newer items are ahead of it, and newer posts keep coming, so it won't come back. The only exception is when something above it is scheduled to end.
- **Featured links that look time-limited but have no `ends`:** such as a sale, an event, a survey, or a livestream. Ask whether they're still current.

Leave these alone: the **Get started** links, `tagline`, `latestCount`, `socials`, and the commented-out examples in the file. Only change them if someone asks.

### Ask Before You Remove Anything

Never delete an item without the requester's OK, even one that has clearly ended. Someone might want to reuse it, or it might be the record of what ran.

- List each item in plain language, with why you think it's old. For example: "'Community Day 2026' (an event that ended on November 7) is no longer showing."
- Group them into "these have ended and no longer show" and "these are still showing, but might be out of date". Suggest removing the first group and ask about the second.
- If there's nothing old, don't mention it.

### Remove Them

- Delete the whole object for each item they agreed to remove, including any comment lines that belong only to it.
- If the item used an image in `src/assets/bio/`, delete that too, unless something else on the site uses it (search the repository for its file name first).
- To take something down now, delete it. To take it down later instead, give it an `ends`.
- Run the checks in step 6 again. The build should pass, and nothing that should still be showing should be missing from `dist/bio/index.html`.
