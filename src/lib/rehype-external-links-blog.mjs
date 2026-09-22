import { visit } from "unist-util-visit";

// Blog posts are written for readers coming in from social/RSS, so external links should
// open in a new tab and not leak referrer/opener info. Scoped to the blog only per editorial
// decision - the rest of the docs site keeps default link behavior.

const SITE_HOSTNAMES = new Set(["esphome.io", "www.esphome.io"]);

function isExternal(href) {
  let url;
  try {
    url = new URL(href, "https://esphome.io");
  } catch {
    return false;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  return !SITE_HOSTNAMES.has(url.hostname);
}

export function rehypeExternalLinksBlog() {
  return function (tree, file) {
    const isBlogPost = Boolean(file.history[0]?.includes("/content/docs/blog/"));
    if (!isBlogPost) return;

    visit(tree, "element", (node) => {
      if (node.tagName !== "a") return;
      const href = node.properties?.href;
      if (typeof href !== "string" || !isExternal(href)) return;

      node.properties.target = "_blank";
      node.properties.rel = "noreferrer noopener";
    });
  };
}
