---
name: create-blog-post
description: Use this if the user wants to convert a blog post from Google Docs markdown to the format used on the ESPHome website, or wants to publish an externally linked (crosspost) blog post that redirects to an article hosted on another site.
---

# Create Blog Post

Convert a draft markdown file into a properly formatted ESPHome blog post (Astro/Starlight MDX).

There are two kinds of blog posts this skill handles:

- **Standard blog posts** — full content hosted on the ESPHome website, converted from a Google Docs markdown draft.
  This is the default path, described in the sections below.
- **Externally linked (crosspost) blog posts** — a short teaser that redirects readers to an article hosted on another
  site (for example, the Open Home Foundation blog). If the user asks to "publish a blog that is externally linked",
  "create a crosspost", "add an external blog post", or similar, follow the
  [Externally linked (crosspost) blog posts](#externally-linked-crosspost-blog-posts) section instead.

## Usage

Place your draft blog post markdown file in the repository root `create-blog-post/` directory
(e.g., `/workspaces/esphome-docs/create-blog-post/`), then run:

```shell
/create-blog-post
```

## What This Skill Does

Automates conversion of a draft markdown file with metadata into a production-ready ESPHome blog post:

- Extracts metadata (blog title, author, publish date, description)
- Removes "# Blog notes/preparations" section and lines with ☝️ emoji
- Removes the `### **– Summary break / Read more –**` marker (Starlight has no excerpt marker)
- Processes an optional lead image and any additional images (optimized, imported via the `Image`/`Figure` components)
- Sets the OpenGraph/Twitter image via the Open Home Foundation OG generator URL (based on the post's blog URL)
- Keeps links as Markdown (internal links relative with a trailing slash; external links as standard Markdown)
- Formats content (removes bold from headings, ensures headings start at H2, fixes link references)
- Converts callouts to GitHub-style alerts (`> [!NOTE]`, etc.)
- Creates a properly formatted MDX post in `src/content/docs/blog/` with Starlight front matter

## Required Files in `create-blog-post/` Directory

1. **Draft markdown file** (any `.md` filename)
1. **`art.*`** - Optional lead image shown at the top of the post (any common image format: `.webp`, `.png`, `.jpg`, `.jpeg`).
   The social/OpenGraph image is generated automatically (see below) and does not need to be supplied.
1. **`image2.*`, `image3.*`, etc.** - Additional images (optional, any common image format)

## Draft File Format

```markdown
# Metadata

**Blog title:** Your Blog Title

**Author:** Author Name

**Publish date:** DD-MM-YYYY

**Description** (used for the page meta/SEO description, ~120-158 characters):
Concise summary that describes what readers will find. Include the main keyword.

# Blog notes/preparations

☝️ Any lines with the pointer emoji can be removed during processing

# Blog content

![][image1]

Your intro paragraph here...

### **– Summary break / Read more –**

Rest of content...
```

**Notes:**

- If present, the `![][image1]` reference at the start of the "# Blog content" section is replaced with the optional
  `art.*` lead image. If there is no lead image, the post simply starts with text.
- The URL slug is optional and will be auto-generated from the blog title if not provided in metadata.
- Lines beginning with the ☝️ emoji are instructions and will be removed during processing.
- The `### **– Summary break / Read more –**` marker will be removed (there is no Jekyll-style excerpt on this site).

## Output

Creates a production-ready blog post at:

- `src/content/docs/blog/YYYY/MM/DD/<slug>.mdx` - The formatted MDX blog post
- `src/content/docs/blog/YYYY/MM/DD/images/<slug>-hero.webp` - Optional lead image (optimized from `create-blog-post/art.*`, if provided)
- `src/content/docs/blog/YYYY/MM/DD/images/<slug>-2.webp`, `<slug>-3.webp`, etc. - Additional images (optimized)

The social/OpenGraph image is not stored in the repo — it is generated on demand by the Open Home Foundation OG
generator and referenced from the post's front matter (see [Build Blog Post](#6-build-blog-post)).

## Conversion Process

### 1. Pre-process Draft

Before doing anything else, strip out embedded base64 image data from the draft file using a shell command.
**Do not read the draft file before this step** — the base64 data can make the file extremely large.

Google Docs markdown exports include image references like `![][image1]` in the content body, with corresponding
base64 definitions at the bottom of the file in the format:

```text
[image1]: <data:image/png;base64,iVBORw0KGgo... (potentially megabytes of data)>
```

Run this `sed` command via the terminal to strip them in-place:

```shell
sed -i '/^\[image[0-9]*\]: <data:/d' "create-blog-post/draft.md"
```

- This removes all lines matching the base64 image definition pattern.
- The `![][image1]` references in the content body are preserved — they will be replaced with proper image references later.
- Only after this command completes should you read the draft file.

### 2. Parse Metadata

- Extract blog title, author, publish date, and description.
- Auto-generate the URL slug from the blog title (lowercase, hyphens for spaces, remove special characters).
- Remove the "# Blog notes/preparations" section and all content under it (up to "# Blog content").
- Remove all lines that start with the ☝️ emoji (instruction lines).
- Remove the `### **– Summary break / Read more –**` marker entirely.

### 3. Process Images

ESPHome follows the image conventions in [CONTRIBUTING.md](../../../CONTRIBUTING.md): single-use blog images are stored
in a local `images/` directory next to the MDX file, optimized, and rendered through the `Image` or `Figure` component
via an `import`.

Before processing images, ensure the `cwebp` tool is installed. If not, install it:

```shell
# Check if cwebp is available, install if missing
which cwebp || sudo apt-get install -y webp
```

**Lead image (`art.*`, optional):**

This is only the in-page lead image at the top of the post — it is **not** the social/OpenGraph image (that is
generated via a URL; see [Build Blog Post](#6-build-blog-post)). Skip this section if no `art.*` file is provided.

- Find the `art` image in `create-blog-post/` (any extension: `.webp`, `.png`, `.jpg`, `.jpeg`).
- Optimize and convert to WebP at a maximum width of 1000px (per CONTRIBUTING.md — max ~1000x800):
  `cwebp -resize 1000 0 -q 85 input -o src/content/docs/blog/images/<slug>-hero.webp` (the `0` height preserves the aspect ratio).
- If the source is already `.webp`, still re-encode it with the resize to keep it small.
- At the top of the MDX file (after the front matter) add the imports:

  ```mdx
  import { Image } from 'astro:assets';
  import heroImg from './images/<slug>-hero.webp';
  ```

- Replace the `![][image1]` reference in the "# Blog content" section with:

  ```mdx
  <Image src={heroImg} alt="Blog Title" layout="constrained" />
  ```

- Alt text uses the blog title.

**Additional images (if any):**

- Find `image2.*`, `image3.*`, etc. in `create-blog-post/` (any extension).
- Optimize and convert to WebP at a maximum width of 900px:
  `cwebp -resize 900 0 -q 85 input -o src/content/docs/blog/images/<slug>-2.webp`.
- Import each one at the top of the MDX file:

  ```mdx
  import image2Img from './images/<slug>-2.webp';
  ```

- Replace the corresponding reference in the content. If the image has a caption, use the `Figure` component:

  ```mdx
  import Figure from '@components/Figure.astro';

  <Figure src={image2Img} alt="Description" caption="Optional caption text" />
  ```

  Otherwise use `Image`:

  ```mdx
  <Image src={image2Img} alt="Description" layout="constrained" />
  ```

- Variable names follow camelCase with an `Img` suffix (e.g., `heroImg`, `image2Img`).

### 4. Transform Links

Per CONTRIBUTING.md, prefer Markdown over raw HTML. Keep all links as Markdown links.

**Internal links** (`esphome.io`):

- Convert to relative Markdown links starting with `/` and ending with a trailing slash: `[text](/components/wifi/)`.

**External links** (any other domain):

- Keep as standard Markdown links: `[text](https://example.com/)`.
- Do **not** convert to raw `<a target="_blank">` tags.

### 5. Clean Content

- **Headings**: Remove bold formatting (`## **Title**` → `## Title`).
- **Heading levels**: Content must start at H2. The page `title` comes from the front matter — do not add an H1 (`#`)
  in the body. If the content starts with an H1, demote all headings one level so the body begins at H2.
- **Backticks**: Strip erroneous escaped backtick (`` \` ``) characters (preserve real code blocks / inline code).
- **Callouts**: Convert any blockquote-style notes/warnings to GitHub-style alerts
  (`> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, `> [!CAUTION]`).
- **Line length**: Wrap prose at a maximum of 120 characters where practical.
- **Text content**: Do not change the author's wording, phrasing, or writing style. If you spot obvious typos or locale
  spelling issues (such as British English instead of American English — the docs use American English), do not fix them
  silently. Collect them and ask the user for confirmation before applying any changes.
- **Emojis**: Preserve all emojis that appear in the blog content. Do not strip them out.
- **Apostrophes and quotes**: Convert straight apostrophes (`'`) and speech marks (`"`) in prose — including quoted
  statements, such as in blockquotes — to their curly equivalents (`’`, `“`/`”`). Only apply this to body text — never
  to front matter, HTML attribute values, URLs, code blocks/inline code, component props, or import statements.

### 6. Build Blog Post

- Create `src/content/docs/blog/<slug>.mdx`.
- Add Starlight front matter. `title` and `description` are required and must be quoted strings. Also set the
  social/OpenGraph image via the OG generator, using the post's blog URL (`https://esphome.io/blog/<slug>`):

  ```yaml
  ---
  title: "Your Blog Title"
  description: "The description from the draft metadata."
  head:
    - tag: meta
      attrs:
        property: "og:image"
        content: "https://assets.openhomefoundation.org/opengraph?url=https://esphome.io/blog/<slug>"
    - tag: meta
      attrs:
        name: "twitter:image"
        content: "https://assets.openhomefoundation.org/opengraph?url=https://esphome.io/blog/<slug>"
  ---
  ```

  These `head` entries override the site-wide default OG image (set in `astro.config.mjs`) for this post. The generator
  renders the OpenGraph image on demand from the post's URL, so no image file needs to be created or committed. Always
  reference this as a remote URL — never import it through Astro (`astro:assets`/`import`), because the generator output
  can change and must not be fingerprinted or cached. Set the same URL on the `cover.image` front-matter field too.

- After the front matter, add the component imports (`Image`, `Figure` as needed, and each image import).
- Add a byline line with the author and publish date near the top of the body (there is no author/date field in the
  Starlight docs schema, so this is rendered as content), for example:

  ```mdx
  *By Author Name · 13 January 2026*
  ```

- If a lead image was provided, add it (`<Image src={heroImg} ... />`).
- Add the intro paragraph, followed by the remaining content.

## Example

1. Place in the repository root `create-blog-post/`:
   - `draft-new-feature.md` - Your draft file
   - `art.png` - Hero image
   - `image2.png`, `image3.png` - Additional images (if any)
1. Run `/create-blog-post`

This would create:

- `src/content/docs/blog/new-feature.mdx`
- `src/content/docs/blog/images/new-feature-hero.webp`
- `src/content/docs/blog/images/new-feature-2.webp`, `new-feature-3.webp` (if additional images exist)

## Important Notes

**Image references:**

- Draft: `![][image1]` (at the start of the "# Blog content" section, if present) → Output: optional `<slug>-hero.webp` lead image (max 1000px wide).
- Draft: `![][image2]` → Look for `image2.*` (any format), optimize to `<slug>-2.webp` (max 900px wide).
- Draft: `![][image3]` → Look for `image3.*` (any format), optimize to `<slug>-3.webp` (max 900px wide).
- Source images can be any common format (`.webp`, `.png`, `.jpg`, `.jpeg`) — all are optimized to `.webp`.
- All blog images live in `src/content/docs/blog/images/` and are referenced via `import` and the `Image`/`Figure` component.

**Requirements:**

- If a lead image is provided, its reference should appear at the start of the "# Blog content" section.
- `cwebp` is required for optimization — the skill will auto-install it via `sudo apt-get install -y webp` if not present.
- The OpenGraph image requires no source file; it is generated from the post URL.

**Content processing:**

- Remove the "# Blog notes/preparations" section entirely.
- Remove all lines starting with the ☝️ emoji (instruction lines).
- Remove the `### **– Summary break / Read more –**` marker.
- Convert callouts to GitHub-style alerts.

**Output format:**

- Filename: `src/content/docs/blog/<slug>.mdx`.
- Image directory: `src/content/docs/blog/images/`.
- Front matter: quoted `title` and `description`. Do not repeat the title as an H1 in the body; body starts at H2.

**OpenGraph / cover image:**

- **Always reference a remote URL.** Never import the OpenGraph or `cover.image` through Astro (no local file,
  no `import`, no `astro:assets`). These images are served live from a remote generator whose output can change over
  time, so Astro must not fingerprint, optimize, or cache them.
- **Standard posts:** use the Open Home Foundation OG generator, which renders the image on demand from the post URL:
  `https://assets.openhomefoundation.org/opengraph?url=https://esphome.io/blog/<slug>`. Set it on both the
  `cover.image` field and the `og:image` / `twitter:image` `head` meta tags. No source file is created or committed.
- **Crossposts:** use the source site's own card image instead of the generator (for example, the Open Home
  Foundation site card at `https://www.openhomefoundation.org/assets/images/blog/<slug>/card.webp`) — again as a remote
  URL only, set on `og:image`, `twitter:image`, and the `crosspostCover` field (never the plugin's `cover`).

**Link handling:**

- Internal `esphome.io` links → relative Markdown links with a trailing slash.
- External links → standard Markdown links (no raw `<a target="_blank">`).

## Externally linked (crosspost) blog posts

A crosspost is a short blog entry that does not host the full article. It shows a teaser and redirects the reader to an
article hosted on another site (for example, the Open Home Foundation blog). Use this path when the user asks to publish
an externally linked blog, add a crosspost, or link out to an article on another site.

Unlike a standard post, a crosspost has no draft file and no local images to process. It is a single MDX file whose
front matter drives the redirect, the canonical URL, the social image, and the "shared from" badge. See the existing
example at `src/content/docs/blog/2026/07/30/making-our-web-analytics-open-source-with-plausible.mdx`.

### 1. Collect the details

Gather the following from the user with the ask-questions tool (`vscode_askQuestions`), pre-filling any values already
provided. If a source URL is available, fetch it first to pre-fill the title, description, teaser, author, and date.

- **Title** — sentence-style capitalization.
- **External URL** — the final published URL on the source site (must start with `https://`). If the user only has a
  deploy-preview link (for example a Netlify preview), work out the live URL and confirm it before continuing — the
  canonical link, the redirect, and the social image all depend on it.
- **External source** — the name of the hosting site, shown on the badge (for example, `Open Home Foundation`). Stored
  in the `crosspostSource` field.
- **Teaser** — a short opening paragraph. Used as both the `excerpt` and the page body. Offer to draft one from the
  article for the user's review.
- **Description** — the SEO/OpenGraph description (~120–158 characters).
- **Author** — must match a top-level key in [`src/authors.mjs`](../../../src/authors.mjs) (for example `darren` or
  `jesse`). Verify it exists; if not, it must be added there before publishing.
- **Publish date** — in `YYYY-MM-DD` format. Used for the filename path, `date`, and ordering.
- **Category/tag** — the blog tag (for example, `Announcements`).
- **Social image** — by default point `og:image`, `twitter:image`, and `crosspostCover` at the source article's card
  image. For Open Home Foundation articles this is usually
  `https://www.openhomefoundation.org/assets/images/blog/<slug>/card.webp`. Confirm the URL resolves. Note the crosspost
  card image uses the dedicated `crosspostCover` field (not the plugin's `cover`) so it renders as a plain `<img>` — see
  the note under [Build the crosspost](#3-build-the-crosspost).

### 2. Validate the details

- Verify the **author** exists as a top-level key in `src/authors.mjs`. If missing, stop and ask the user to add it.
- Verify the **external URL** starts with `https://` and is the final published URL, not a preview/deploy-preview link.
- Generate the URL slug from the title (lowercase, hyphens for spaces, remove special characters), unless the user
  provides one. If the source URL already has a clean slug in its path, prefer reusing that.

### 3. Build the crosspost

Create the file in the same dated location as a standard post, using the publish date:
`src/content/docs/blog/YYYY/MM/DD/<slug>.mdx`.

```mdx
---
head:
  - tag: link
    attrs:
      rel: "canonical"
      href: "<EXTERNAL_URL>"
  - tag: meta
    attrs:
      http-equiv: "refresh"
      content: "0; url=<EXTERNAL_URL>"
  - tag: script
    content: |
      window.location.replace("<EXTERNAL_URL>");
  - tag: meta
    attrs:
      property: "og:image"
      content: "<SOCIAL_IMAGE_URL>"
  - tag: meta
    attrs:
      name: "twitter:image"
      content: "<SOCIAL_IMAGE_URL>"
  - tag: meta
    attrs:
      property: "og:image:alt"
      content: "<TITLE>"
title: "<TITLE>"
description: "<DESCRIPTION>"
crosspostSource: "<EXTERNAL SOURCE>"
crosspostCover: "<SOCIAL_IMAGE_URL>"
excerpt: "<TEASER PARAGRAPH>"
date: YYYY-MM-DD
authors:
  - <authorKey>
tags:
  - <Category>
---

<TEASER PARAGRAPH>
```

Notes:

- Keep all three redirect `head` entries: the canonical `link`, the `http-equiv="refresh"` meta, and the
  `window.location.replace` script. Together they send visitors to the source article and tell search engines the
  canonical version lives off-site.
- `crosspostSource` opts the post into the "shared from &lt;source&gt;" pill on the blog grid (see
  [`CrosspostBadges.astro`](../../../src/components/CrosspostBadges.astro)). It must be the plain source name only.
- `crosspostCover` is the blog-grid card image — point it at the same `<SOCIAL_IMAGE_URL>` as `og:image`. Never use the
  starlight-blog `cover` field for a crosspost: that renders through Astro's `<Image>`, which probes and caches the
  remote image at build time (and fails if the source image is not live yet). `crosspostCover` is drawn as a plain
  `<img>` client-side, so it updates the moment the source image is published — no rebuild needed.
- The body is only the teaser paragraph (the same text as `excerpt`). Do not paste the full article — the reader is
  redirected on load.
- Apply the same prose rules as standard posts (curly apostrophes/quotes in body text, sentence-style title).
- Do not add a byline or any comments markup: the page redirects immediately, so on-page content beyond the teaser is
  never seen.

### 4. Crosspost summary

After creating the file, summarize for the user:

- The output file path.
- Title, external source, external URL, author (and whether verified in `src/authors.mjs`), date, and tag.
- The teaser and description used, and the social image URL.
- A note that the page sets its canonical to the external URL, redirects to the source on load, and shows the
  "shared from" badge on the blog index.

## Git Workflow

Per CONTRIBUTING.md, target the correct base branch and use a focused branch/commit:

- New content generally targets the `current` branch; new-feature content that ships with an unreleased ESPHome version
  targets `next`. Confirm with the user which branch applies.
- Branch from the target: `git checkout -b blog-<slug> current`.
- Commit message format: `[blog] Add <slug> post`.

## Post-processing summary

After the blog post has been created, output a summary to the user covering:

**Metadata:**

- Title, author, publish date, description.

**Images:**

- Each source image, its original dimensions/format, and where it was output (with the optimization applied).
- The OpenGraph image URL set in the front matter (generated via the OG generator).

**Content transformations:**

- A bulleted list of every notable transformation applied, such as:
  - Sections/content removed (base64 data, blog notes, instruction lines, summary-break marker)
  - Image references replaced with `Image`/`Figure` components
  - Link handling (internal to relative Markdown with trailing slash; external left as Markdown)
  - Callouts converted to GitHub-style alerts
  - Heading changes (bold removed, promoted/demoted to start at H2)
  - Escape-character cleanup
  - Apostrophe/quote curling (straight to typographic)

**Proposed text changes (requires user approval):**

- If any typos or locale spelling issues were spotted (such as British to American English), list each one and ask the
  user whether to apply them. Do not apply these changes until the user confirms.
