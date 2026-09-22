import { defineRouteMiddleware } from "@astrojs/starlight/route-data";
import GithubSlugger from "github-slugger";

// Eagerly import all sensor filter MDX files to extract their headings.
const filterModules = import.meta.glob("./content/docs/components/sensor/filter/*.mdx", {
  eager: true,
});

// Build the list of filter TOC entries once at module load time.
const slugger = new GithubSlugger();
const filterTocEntries = Object.entries(filterModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, module]) => {
    const title = (module as { frontmatter?: { title?: string } }).frontmatter?.title;
    if (!title) return null;
    return {
      depth: 3 as const,
      slug: slugger.slug(title),
      text: title,
      children: [],
    };
  })
  .filter(Boolean);

export const onRequest = defineRouteMiddleware(async (context, next) => {
  // Let Starlight generate the default route data first.
  await next();

  const route = context.locals.starlightRoute;

  // Crossposts redirect off-site. Send the full referring path (not just the origin)
  // so the destination can attribute the visit. Prepended so it is parsed before the
  // redirect tags in the page's own `head`.
  if (route.entry.data.crosspostSource) {
    route.head.unshift({
      tag: "meta",
      attrs: { name: "referrer", content: "no-referrer-when-downgrade" },
    });
  }

  if (!route.toc) return;

  // Find the "Sensor Filters" heading in the TOC — only present on the sensor index page.
  const sensorFiltersEntry = route.toc.items.find((item) => item.slug === "sensor-filters");
  if (!sensorFiltersEntry || sensorFiltersEntry.children.length > 0) return;

  // Inject filter headings as children of the "Sensor Filters" TOC entry.
  sensorFiltersEntry.children = filterTocEntries.map((entry) => ({
    ...entry!,
    children: [],
  }));
});
