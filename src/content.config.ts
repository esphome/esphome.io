import { defineCollection, z } from "astro:content";
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
};
