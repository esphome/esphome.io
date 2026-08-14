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
