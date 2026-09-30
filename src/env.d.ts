/// <reference path="../.astro/types.d.ts" />
/// <reference types="@astrojs/starlight/virtual-internal" />

declare module "virtual:esphome-route-index" {
  export const allRoutes: { url: string; title: string }[];
}

// Starlight generates a `virtual:starlight/components/<Name>` module per overridable
// component, resolving to whichever implementation (default or user override) is active.
// It ships ambient types for the fixed-name virtual modules (e.g. `virtual:starlight/user-config`)
// but not for these dynamically-named ones, so declare the handful we import directly.
declare module "virtual:starlight/components/SiteTitle" {
  const SiteTitle: import("astro/runtime/server/index.js").AstroComponentFactory;
  export default SiteTitle;
}

declare module "virtual:starlight/components/Search" {
  const Search: import("astro/runtime/server/index.js").AstroComponentFactory;
  export default Search;
}

declare module "virtual:starlight/components/ThemeSelect" {
  const ThemeSelect: import("astro/runtime/server/index.js").AstroComponentFactory;
  export default ThemeSelect;
}
