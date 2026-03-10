import fs from "fs";
import path from "path";

export function remarkExportAst() {
  return (tree, file) => {
    const sourcePath = file.history?.[0];
    if (!sourcePath) return;

    // Normalize path to forward slashes for matching
    const normalized = sourcePath.replace(/\\/g, "/");

    if (
      !normalized.includes("/src/content/docs/components") &&
      !normalized.includes("/src/content/docs/automations")
    ) {
      return;
    }

    const baseDir = path.resolve("dist-mdast");

    // Extract path relative to src/content/docs
    const relativePath = normalized.split("/src/content/docs/")[1];

    if (!relativePath) return;

    // Replace .mdx → .json
    const outputRelative = relativePath.replace(/\.mdx$/, ".json");

    const outputPath = path.join(baseDir, outputRelative);

    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    fs.writeFileSync(
      outputPath,
      JSON.stringify(
        {
          source: sourcePath,
          frontmatter: file.data?.astro?.frontmatter ?? {},
          mdast: tree,
        },
        null,
        2,
      ),
    );
  };
}
