# ESPHome Documentation Migration Report

## Hugo to Starlight (Astro) Migration

**Date:** February 2026
**Branch:** `starlight-migration`
**Target:** `current`

---

## Executive Summary

The ESPHome documentation has been migrated from Hugo to Starlight (Astro). This migration modernizes the documentation platform while preserving all existing content, URLs, and SEO metadata.

**Key Results:**
- 774 pages successfully migrated
- 99.7% URL preservation (747/749 live URLs maintained)
- All SEO metrics maintained or improved
- Git history preserved for all content files

---

## What Changed

### Platform

| Before | After |
|--------|-------|
| Hugo (Go-based SSG) | Astro/Starlight (Node.js-based SSG) |
| Custom Hugo theme | Starlight's built-in theme |
| reStructuredText-style shortcodes | Astro/MDX components |

### Directory Structure

```
Before (Hugo):                    After (Starlight):
├── content/                      ├── src/content/docs/
│   ├── components/               │   ├── components/
│   ├── automations/              │   ├── automations/
│   ├── guides/                   │   ├── guides/
│   ├── cookbook/                 │   ├── cookbook/
│   └── changelog/                │   └── changelog/
├── static/images/                ├── public/images/
├── themes/esphome-theme/         ├── src/components/
└── hugo.yaml                     └── astro.config.mjs
```

### File Format Changes

- Content files: `.md` → `.mdx` (for files using components)
- Index files: `_index.md` → `index.md` or `index.mdx`
- 65 changelog files converted to MDX with Astro components

### Shortcode to Component Conversions

| Hugo Shortcode | Astro Component | Count |
|----------------|-----------------|-------|
| `{{< pr "123" >}}` | `<PR pr="123" />` | 11,502 |
| `{{< ghuser "name" >}}` | `<GHUser name="name" />` | 10,045 |
| `:corepr:` (Sphinx) | `[#123](url)` | 123 |

### Configuration

**Site Title Format:**
```
Page Title - ESPHome - Smart Home Made Simple
```

**Build Commands:**
```bash
npm install    # Install dependencies
npm run dev    # Development server
npm run build  # Production build
```

---

## Verification Results

### URL Preservation

- **Total live URLs:** 749
- **URLs preserved:** 747 (99.7%)
- **Missing:** 2 (Hugo taxonomy pages: `/categories/`, `/tags/`)

The missing URLs are Hugo-specific taxonomy pages. Redirects have been added.

### SEO Audit Results

| Metric | Local | Live | Status |
|--------|-------|------|--------|
| Has title | 100% | 100% | ✅ Match |
| Has description | 100% | 80% | ✅ Improved |
| Has canonical URL | 100% | 2% | ✅ Improved |
| Has og:title | 100% | 100% | ✅ Match |
| Has og:description | 100% | 80% | ✅ Improved |
| Has og:image | 100% | 68% | ✅ Improved |
| Single H1 | 100% | 98% | ✅ Improved |
| robots.txt | Present | Present | ✅ Match |
| Sitemap | 774 URLs | Present | ✅ Match |

### Content Verification

- **Average content similarity:** 86.2%
- Differences primarily due to navigation/UI text changes between themes

---

## SEO Considerations

### Preserved
- All page URLs (with 2 redirect exceptions)
- Page titles match live site format
- Meta descriptions preserved from frontmatter
- Canonical URLs on all pages
- Open Graph metadata for social sharing
- Twitter Card metadata
- Single H1 per page structure
- robots.txt with same content policies
- XML sitemap with all pages

### Improved
- Canonical URLs: 2% → 100%
- Meta descriptions: 80% → 100%
- og:image: 68% → 100%

### Pre-existing Content Issues
These exist in the original content (not caused by migration):
- 318 pages with short titles (<30 chars)
- 210 pages with short descriptions (<50 chars)

---

## New Features

### Dynamic Changelog
- Sidebar automatically sorted newest to oldest
- `/changelog/` redirects to latest release
- No manual updates needed when new releases are added

### Improved Navigation
- Collapsible sidebar sections
- Better mobile experience
- Built-in search via Pagefind

---

## Files Changed

### Added
- `astro.config.mjs` - Starlight configuration
- `package.json` - Node.js dependencies
- `tsconfig.json` - TypeScript configuration
- `src/components/PR.astro` - PR link component
- `src/components/GHUser.astro` - GitHub user link component
- `src/styles/custom.css` - Custom styling
- `public/robots.txt` - Robots configuration

### Deleted
- `themes/esphome-theme/` - Entire Hugo theme directory
- `hugo.yaml` - Hugo configuration

### Modified
- `netlify.toml` - Updated build commands and added redirects
- All 65 changelog files - Converted to MDX with components
- `src/content/docs/index.mdx` - Homepage

---

## Redirects

The following redirects ensure backward compatibility:

| From | To | Reason |
|------|-----|--------|
| `/*.html` | `/:splat/` | Hugo used .html, Starlight uses trailing slashes |
| `/changelog/` | `/changelog/[latest]/` | Dynamic redirect to latest release |
| `/categories/*` | `/` | Hugo taxonomy pages |
| `/tags/*` | `/` | Hugo taxonomy pages |

Plus existing redirects for moved components and deprecated pages.

---

## Build & Development

### Requirements
- Node.js 20+
- npm

### Commands
```bash
npm install      # Install dependencies
npm run dev      # Start dev server (with hot reload)
npm run build    # Production build
npm run preview  # Preview production build
```

### CI/CD
- Netlify builds automatically on push
- Build command: `npm run build`
- Publish directory: `dist`

---

## Rollback Plan

If issues are discovered post-deployment:

1. The `current` branch contains the working Hugo version
2. Revert the merge commit or reset to pre-merge state
3. Hugo build will work immediately without additional setup

---

## Post-Migration Checklist

- [ ] Monitor 404s in analytics for missed URL patterns
- [ ] Check Google Search Console for crawl errors
- [ ] Verify all CI/CD pipelines use Node.js 20+
- [ ] Update any external links pointing to old URL patterns

---

## Questions?

For questions about this migration, please open an issue on the [esphome-docs repository](https://github.com/esphome/esphome-docs/issues).
