import Slugger from "github-slugger";

/**
 * The one definition of a heading anchor id, shared by the rehype plugin that assigns the ids
 * (src/lib/rehype-heading-slugs.mjs), the link checker that validates links against them
 * (script/lint.mjs via script/heading-anchors.mjs) and the schema bundler that records them
 * (script/schema_doc.mjs). An approximation in any of those silently accepts, or emits, links to
 * anchors the site never renders.
 *
 * Creates a slug function for one page.
 *
 * A fresh slugger per page is what gives repeated headings their `-1`, `-2` suffixes, so the
 * returned function is stateful and must be called once per heading, in document order.
 *
 * ESPHome action/condition/trigger headings contain dots (e.g. `light.turn_on`). github-slugger
 * drops `.` entirely, producing mashed anchors like `lightturn_on`, so `.` is mapped to `-` first
 * and the anchor becomes `light-turn_on`. A numbered heading such as `2. Web Server` therefore
 * yields `2--web-server`: the dot becomes one hyphen and the space after it another.
 *
 * @returns {(text: string) => string}
 */
export function createHeadingSlugger() {
  const slugger = new Slugger();
  return (text) => slugger.slug(text.replace(/\./g, "-"));
}
