import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightBlog from "starlight-blog";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: "https://esphome.io",
  vite: {
    resolve: {
      alias: {
        "@components": path.resolve(__dirname, "./src/components"),
      },
    },
  },
  integrations: [
    starlight({
      title: "ESPHome",
      favicon: "/favicon.ico",
      plugins: [
        //starlightBlog({
        //  title: 'Blog',
        //}),
      ],
      logo: {
        light: "./src/assets/logo.svg",
        dark: "./src/assets/logo.svg",
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/esphome/esphome",
        },
        {
          icon: "discord",
          label: "Discord",
          href: "https://discord.gg/KhAMKrd",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/esphome/esphome-docs/edit/current/",
      },
      customCss: ["./src/styles/custom.css"],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            {
              label: "From Home Assistant",
              link: "/guides/getting_started_hassio/",
            },
            {
              label: "Using Command Line",
              link: "/guides/getting_started_command_line/",
            },
            { label: "Ready-Made Projects", link: "/projects/" },
            {
              label: "Migrate from Tasmota",
              link: "/guides/migrate_sonoff_tasmota/",
            },
            { label: "FAQ and Tips", link: "/guides/faq/" },
          ],
        },
        {
          label: "Next Steps",
          items: [
            { label: "Documentation", link: "/components/" },
            { label: "Automations", link: "/automations/" },
            {
              label: "Configuration Types",
              link: "/guides/configuration-types/",
            },
            { label: "Device Examples", link: "https://devices.esphome.io/" },
            { label: "DIY Examples", link: "/guides/diy/" },
            { label: "Sharing ESPHome Devices", link: "/guides/creators/" },
            { label: "Made for ESPHome", link: "/guides/made_for_esphome/" },
          ],
        },
        {
          label: "Components",
          collapsed: true,
          autogenerate: { directory: "components" },
        },
        {
          label: "Automations",
          collapsed: true,
          autogenerate: { directory: "automations" },
        },
        {
          label: "Guides",
          collapsed: true,
          autogenerate: { directory: "guides" },
        },
        {
          label: "Cookbook",
          collapsed: true,
          autogenerate: { directory: "cookbook" },
        },
        {
          label: "Keeping Up",
          items: [
            { label: "Blog", link: "/blog/" },
            { label: "Changelog", link: "/changelog/" },
            { label: "Discord", link: "https://discord.gg/KhAMKrd" },
            {
              label: "Forums",
              link: "https://community.home-assistant.io/c/esphome/",
            },
            { label: "Development", link: "https://developers.esphome.io" },
            { label: "Supporters", link: "/guides/supporters/" },
          ],
        },
        {
          label: "Changelog",
          collapsed: true,
          autogenerate: { directory: "changelog" },
        },
      ],
      head: [
        {
          tag: "link",
          attrs: {
            rel: "icon",
            href: "/favicon.ico",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:image",
            content: "https://esphome.io/images/logo.svg",
          },
        },
        {
          tag: "meta",
          attrs: {
            name: "twitter:image",
            content: "https://esphome.io/images/logo.svg",
          },
        },
        {
          tag: "meta",
          attrs: {
            name: "twitter:card",
            content: "summary_large_image",
          },
        },
      ],
    }),
  ],
});
