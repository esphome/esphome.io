import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { blogSchema } from "starlight-blog/schema";

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: (context) =>
        blogSchema(context).extend({
          /**
           * If set, the post is a crosspost and its blog grid card gets a
           * "shared from <crosspostSource>" badge. See CrosspostBadges.astro.
           */
          crosspostSource: z.string().optional(),
          /**
           * Remote cover image URL for a crosspost card. Rendered as a plain
           * <img> (not Astro's <Image>) so it is never fetched/cached at build
           * and can be published before the post. See CrosspostBadges.astro.
           */
          crosspostCover: z.string().optional(),
          /**
           * Anchors on this page that no longer resolve because the section they
           * pointed at moved to its own page, mapped to the URL that now covers it.
           * Keys omit the leading "#". A URL fragment is never sent to the server,
           * so Netlify cannot redirect these. See AnchorRedirects.astro.
           *
           * Targets are restricted to site-relative paths. AnchorRedirects.astro
           * feeds them to location.replace(), so allowing an absolute URL would turn
           * a typo into an open redirect, and a "javascript:" URL into an XSS sink.
           * Rejecting a leading "//" keeps protocol-relative URLs out too.
           */
          anchorRedirects: z
            .record(
              z.string(),
              z
                .string()
                .regex(/^\/(?!\/)/, 'anchor redirect targets must be site-relative paths starting with a single "/"'),
            )
            .optional(),
        }),
    }),
  }),
  faq: defineCollection({
    loader: glob({ pattern: "**/*.yaml", base: "./src/data/faq" }),
    schema: z.object({
      items: z.array(
        z.object({
          title: z.string(),
          content: z.string(),
        }),
      ),
    }),
  }),
};
