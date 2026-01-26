import { defineCollection, z } from 'astro:content';

// Common frontmatter schema for all documentation pages
// All fields are optional to handle files without frontmatter
// Using nullable() to handle explicit null values in YAML
const docsSchema = z.object({
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  // SEO metadata (flattened from Hugo's params.seo)
  seo: z.object({
    description: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
  }).nullable().optional(),
  // Navigation
  weight: z.number().nullable().optional(),
  // Draft status
  draft: z.boolean().nullable().optional().default(false),
  // Allow any additional fields from Hugo frontmatter
}).passthrough().optional().default({});

// Components collection - sensor, switch, light, etc.
const components = defineCollection({
  type: 'content',
  schema: docsSchema,
});

// Guides collection
const guides = defineCollection({
  type: 'content',
  schema: docsSchema,
});

// Cookbook collection
const cookbook = defineCollection({
  type: 'content',
  schema: docsSchema,
});

// Automations collection
const automations = defineCollection({
  type: 'content',
  schema: docsSchema,
});

// Changelog collection
const changelog = defineCollection({
  type: 'content',
  schema: docsSchema,
});

// Projects collection
const projects = defineCollection({
  type: 'content',
  schema: docsSchema,
});

// Web API collection
const webapi = defineCollection({
  type: 'content',
  schema: docsSchema,
});

export const collections = {
  components,
  guides,
  cookbook,
  automations,
  changelog,
  projects,
  webapi,
};
