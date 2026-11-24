import { toString } from "mdast-util-to-string";
import remarkMath from "remark-math";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import remarkSmartypants from "remark-smartypants";
import { unified } from "unified";

import { createHeadingSlugger } from "../src/lib/heading-slugs.mjs";

// The page is parsed rather than scanned line by line so that `#` inside a fenced code block (a
// YAML comment, for instance) is not mistaken for a heading. That matters more than it used to:
// the slugger numbers repeated headings, so one phantom heading would shift the `-1`/`-2` suffix
// of every later duplicate. Fences also appear indented inside list items, which no line-based
// fence tracker gets right.
//
// remark-smartypants is part of Astro's default markdown pipeline and it reaches heading text:
// `I have a question... How can I contact you?` renders with a `…`, which github-slugger drops,
// where the literal `...` would have become three hyphens.
const processor = unified().use(remarkParse).use(remarkMath).use(remarkMdx).use(remarkSmartypants);

// Frontmatter is not markdown, and left in place its closing `---` turns the `description:` line
// into a setext heading. Blank it rather than cut it, so the line-based scan below still lines up
// with the file.
const FRONTMATTER_RE = /^---\n[\s\S]*?\n---\n/;

function blankFrontmatter(content) {
  return content.replace(FRONTMATTER_RE, (fm) => fm.replace(/[^\n]/g, " "));
}

// Explicit anchor targets, used where a heading anchor will not do (mid-list or mid-paragraph link
// targets). Matched against the raw source, because both spellings survive into the HTML and a
// stray extra id only ever loosens the link check.
const SPAN_ANCHOR_RE = /<span id="([^"]+)"><\/span>/;

/**
 * Every anchor id a page offers: one per heading, plus any explicit anchor target.
 *
 * @param {string} content Raw markdown or MDX source.
 * @returns {Set<string>}
 */
export function collectPageAnchors(content) {
  const source = blankFrontmatter(content.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n"));
  const anchors = new Set();
  const slugHeading = createHeadingSlugger();

  for (const node of headings(processor.runSync(processor.parse(source)))) {
    anchors.add(slugHeading(toString(node)));
  }

  for (const line of source.split("\n")) {
    const span = line.match(SPAN_ANCHOR_RE);
    if (span) anchors.add(span[1]);
  }

  return anchors;
}

/**
 * Heading nodes in document order, which is the order the slugger has to see them in.
 *
 * @param {{type: string, children?: unknown[]}} node
 * @returns {Generator<object>}
 */
function* headings(node) {
  if (node.type === "heading") yield node;
  for (const child of node.children ?? []) {
    yield* headings(child);
  }
}
