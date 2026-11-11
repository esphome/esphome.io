/**
 * Component name badges, generated at build time for every `badge:<Name>`
 * image referenced from the docs (see src/lib/badges.mjs).
 */

import path from "node:path";
import { createBadgeEndpoint } from "@esphome/component-image-generator/astro";
import { collectBadgeNames } from "../../../lib/badges.mjs";

export const { getStaticPaths, GET, prerender } = createBadgeEndpoint(() =>
  collectBadgeNames(path.resolve("src/content/docs")),
);
