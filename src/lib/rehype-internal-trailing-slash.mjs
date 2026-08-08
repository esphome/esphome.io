import { visit } from "unist-util-visit";

import { withTrailingSlash } from "./canonical-url.mjs";

// Canonicalise site-absolute links written in Markdown/MDX at build time. This fixes every
// existing link and keeps new content correct without churning hundreds of content files.
export function rehypeInternalTrailingSlash() {
  return function (tree) {
    visit(tree, "element", (node) => {
      if (node.tagName !== "a") return;
      const href = node.properties?.href;
      if (typeof href !== "string") return;
      node.properties.href = withTrailingSlash(href);
    });
  };
}
