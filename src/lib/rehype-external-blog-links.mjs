import { visit } from "unist-util-visit";

// Open external links in blog posts in a new browser tab. Scoped to files under
// `src/content/docs/blog/` so the rest of the docs keep their default behaviour.
// A link is considered external when it uses an absolute http(s) URL that does
// not point at esphome.io (internal links in blog posts are written relative).
export function rehypeExternalBlogLinks() {
  return function (tree, file) {
    const filePath = file.history[0] || "";
    if (!filePath.includes("/content/docs/blog/")) return;

    visit(tree, "element", (node) => {
      if (node.tagName !== "a") return;
      const href = node.properties?.href;
      if (typeof href !== "string") return;

      const isExternal = /^https?:\/\//i.test(href) && !/^https?:\/\/(www\.)?esphome\.io(\/|$)/i.test(href);
      if (!isExternal) return;

      node.properties.target = "_blank";
      node.properties.rel = ["noopener", "noreferrer"];
    });
  };
}
