import { visit } from "unist-util-visit";

import { createHeadingSlugger } from "./heading-slugs.mjs";

// This plugin pre-assigns heading ids using the shared slug rules in
// src/lib/heading-slugs.mjs. It runs before Astro's rehypeHeadingIds, which then
// reuses the id we set for both the element and the table-of-contents metadata.
//
// Text extraction mirrors @astrojs/markdown-remark's rehype-collect-headings so the
// only difference from the default slug is the `.` -> `-` mapping.

const rawNodeTypes = new Set(["text", "raw", "mdxTextExpression"]);
const codeTagNames = new Set(["code", "pre"]);

export function rehypeHeadingSlugs() {
  return function (tree, file) {
    const isMDX = Boolean(file.history[0]?.endsWith(".mdx"));
    const slugHeading = createHeadingSlugger();
    visit(tree, (node) => {
      if (node.type !== "element") return;
      const { tagName } = node;
      if (tagName[0] !== "h") return;
      if (!/^h[1-6]$/.test(tagName)) return;
      let text = "";
      visit(node, (child, _index, parent) => {
        if (child.type === "element" || parent == null) return;
        if (child.type === "raw" && /^\n?<.*>\n?$/.test(child.value)) return;
        if (rawNodeTypes.has(child.type)) {
          if (isMDX || codeTagNames.has(parent.tagName)) {
            text += child.value;
          } else {
            text += child.value.replace(/\{/g, "${");
          }
        }
      });
      node.properties = node.properties || {};
      if (typeof node.properties.id !== "string") {
        node.properties.id = slugHeading(text);
      }
    });
  };
}
