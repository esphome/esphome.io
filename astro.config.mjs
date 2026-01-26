import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkDocref from './src/plugins/remark-docref.ts';
import remarkInclude from './src/plugins/remark-include.ts';
import remarkShortcodes from './src/plugins/remark-shortcodes.ts';

// Get environment variables for API docs URL
const apiDocsUrl = process.env.API_DOCS_URL || 'https://api-docs.esphome.io';

export default defineConfig({
  site: process.env.SITE_URL || 'https://esphome.io',
  integrations: [
    starlight({
      title: 'ESPHome',
      logo: {
        light: './src/assets/logo-text.svg',
        dark: './src/assets/logo-text-dark.svg',
        replacesTitle: true,
      },
      social: {
        github: 'https://github.com/esphome/esphome',
        discord: 'https://discord.gg/KhAMKrd',
      },
      customCss: [
        './src/styles/custom.css',
        'katex/dist/katex.min.css',
      ],
      editLink: {
        baseUrl: 'https://github.com/esphome/esphome-docs/edit/current/',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'From Home Assistant', slug: 'guides/getting_started_hassio' },
            { label: 'Command Line', slug: 'guides/getting_started_command_line' },
            { label: 'Ready-Made Projects', slug: 'projects' },
            { label: 'Migrate from Tasmota', slug: 'guides/migrate_sonoff_tasmota' },
            { label: 'FAQ', slug: 'guides/faq' },
          ],
        },
        {
          label: 'Components',
          collapsed: true,
          items: [
            { label: 'Overview', slug: 'components' },
            {
              label: 'Core',
              collapsed: true,
              autogenerate: { directory: 'components/core' },
            },
            {
              label: 'Sensors',
              collapsed: true,
              autogenerate: { directory: 'components/sensor' },
            },
            {
              label: 'Binary Sensors',
              collapsed: true,
              autogenerate: { directory: 'components/binary_sensor' },
            },
            {
              label: 'Output',
              collapsed: true,
              autogenerate: { directory: 'components/output' },
            },
            {
              label: 'Switch',
              collapsed: true,
              autogenerate: { directory: 'components/switch' },
            },
            {
              label: 'Button',
              collapsed: true,
              autogenerate: { directory: 'components/button' },
            },
            {
              label: 'Fan',
              collapsed: true,
              autogenerate: { directory: 'components/fan' },
            },
            {
              label: 'Light',
              collapsed: true,
              autogenerate: { directory: 'components/light' },
            },
            {
              label: 'Text Sensor',
              collapsed: true,
              autogenerate: { directory: 'components/text_sensor' },
            },
            {
              label: 'Cover',
              collapsed: true,
              autogenerate: { directory: 'components/cover' },
            },
            {
              label: 'Climate',
              collapsed: true,
              autogenerate: { directory: 'components/climate' },
            },
            {
              label: 'Display',
              collapsed: true,
              autogenerate: { directory: 'components/display' },
            },
            {
              label: 'Touchscreen',
              collapsed: true,
              autogenerate: { directory: 'components/touchscreen' },
            },
            {
              label: 'Media Player',
              collapsed: true,
              autogenerate: { directory: 'components/media_player' },
            },
            {
              label: 'Number',
              collapsed: true,
              autogenerate: { directory: 'components/number' },
            },
            {
              label: 'Select',
              collapsed: true,
              autogenerate: { directory: 'components/select' },
            },
            {
              label: 'Lock',
              collapsed: true,
              autogenerate: { directory: 'components/lock' },
            },
            {
              label: 'Valve',
              collapsed: true,
              autogenerate: { directory: 'components/valve' },
            },
            {
              label: 'Text',
              collapsed: true,
              autogenerate: { directory: 'components/text' },
            },
            {
              label: 'Datetime',
              collapsed: true,
              autogenerate: { directory: 'components/datetime' },
            },
            {
              label: 'Update',
              collapsed: true,
              autogenerate: { directory: 'components/update' },
            },
            {
              label: 'Alarm Control Panel',
              collapsed: true,
              autogenerate: { directory: 'components/alarm_control_panel' },
            },
            {
              label: 'Event',
              collapsed: true,
              autogenerate: { directory: 'components/event' },
            },
          ],
        },
        {
          label: 'Automations',
          slug: 'automations',
        },
        {
          label: 'Cookbook',
          collapsed: true,
          autogenerate: { directory: 'cookbook' },
        },
        {
          label: 'Guides',
          collapsed: true,
          autogenerate: { directory: 'guides' },
        },
        {
          label: 'Changelog',
          collapsed: true,
          items: [
            { label: 'Overview', slug: 'changelog' },
          ],
        },
      ],
      head: [
        {
          tag: 'meta',
          attrs: {
            name: 'theme-color',
            content: '#00bfff',
          },
        },
      ],
      components: {
        // Override Starlight components if needed
      },
      pagefind: true,
    }),
    mdx(),
  ],
  markdown: {
    remarkPlugins: [
      remarkMath,
      remarkDocref,
      remarkInclude,
      remarkShortcodes,
    ],
    rehypePlugins: [
      rehypeKatex,
    ],
  },
  vite: {
    define: {
      'import.meta.env.API_DOCS_URL': JSON.stringify(apiDocsUrl),
    },
  },
});
