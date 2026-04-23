import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsDir = path.resolve(__dirname, "../content/docs");

function getTitle(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const match = content.match(/^title:\s*["']?([^"'\n]+)["']?/m);
  return match ? match[1].trim() : null;
}

function walk(dir, urlPath, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "images") continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(abs, `${urlPath}/${entry.name}`, out);
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      const slug = entry.name.replace(/\.mdx$/, "");
      if (slug === "404") continue;
      const title = getTitle(abs);
      const url = slug === "index" ? `${urlPath}/` : `${urlPath}/${slug}/`;
      out.push({
        url: url.replace(/^\/+/, "/"),
        title: title || slug,
      });
    }
  }
}

const routes = [];
walk(docsDir, "", routes);

// Keep changelog entries out of the suggestion pool — version numbers
// make noisy matches for real page lookups.
export const allRoutes = routes.filter((r) => !r.url.startsWith("/changelog"));
