/**
 * Component exports for use in MDX files.
 *
 * In MDX files, import components like:
 *   import { PR, GhUser, ComponentGrid } from '@components';
 *
 * Or import individual components:
 *   import PR from '@components/PR.astro';
 */

// Re-export all components for convenience
// Note: Astro components need to be imported directly in MDX files
// This file is mainly for documentation purposes

export const components = {
  PR: '@components/PR.astro',
  GhUser: '@components/GhUser.astro',
  Img: '@components/Img.astro',
  ApiRef: '@components/ApiRef.astro',
  ApiClass: '@components/ApiClass.astro',
  ApiStruct: '@components/ApiStruct.astro',
  ComponentGrid: '@components/ComponentGrid.astro',
  Option: '@components/Option.astro',
  FeatureGrid: '@components/FeatureGrid.astro',
  GettingStartedGrid: '@components/GettingStartedGrid.astro',
  Changelogs: '@components/Changelogs.astro',
  ApiKeyInput: '@components/ApiKeyInput.astro',
  RenderAutomations: '@components/RenderAutomations.astro',
};

export default components;
