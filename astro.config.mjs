import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { remarkDirectives } from './plugins/remark-directives';

export default defineConfig({
  site: 'https://esphome.io',

  // Output static HTML
  output: 'static',

  // Build configuration
  build: {
    format: 'directory',
  },

  // Redirect .html URLs to clean URLs
  redirects: {
    '/[...slug].html': '/[...slug]/',
  },

  // Markdown configuration
  markdown: {
    remarkPlugins: [
      'remark-gfm',
      'remark-math',
      'remark-directive',
      remarkDirectives,
    ],
    rehypePlugins: [
      ['rehype-katex', { strict: false }],
    ],
    shikiConfig: {
      theme: 'monokai',
      wrap: true,
    },
  },

  // Integrations
  integrations: [
    sitemap(),
  ],

  // Vite configuration
  vite: {
    css: {
      preprocessorOptions: {},
    },
  },
});
