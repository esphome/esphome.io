#!/usr/bin/env tsx
/**
 * Content Migration Script
 *
 * Migrates Hugo content files to Astro Starlight MDX format.
 *
 * Usage:
 *   npx tsx scripts/migrate-content.ts
 *   npx tsx scripts/migrate-content.ts --dry-run
 *   npx tsx scripts/migrate-content.ts --single content/components/sensor/dht.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// Configuration
const SOURCE_DIR = 'content';
const TARGET_DIR = 'src/content/docs';
const DRY_RUN = process.argv.includes('--dry-run');
const SINGLE_FILE = process.argv.find((arg, i) => process.argv[i - 1] === '--single');

// Statistics
const stats = {
  processed: 0,
  skipped: 0,
  errors: 0,
  shortcodesConverted: {
    pr: 0,
    ghuser: 0,
    img: 0,
    imgtable: 0,
    docref: 0,
    anchor: 0,
    apiref: 0,
    apiclass: 0,
    apistruct: 0,
    option: 0,
    collapse: 0,
    math: 0,
    break: 0,
    changelogs: 0,
    featureGrid: 0,
    gettingStartedGrid: 0,
    renderAutomations: 0,
    include: 0,
  },
};

// Component imports that need to be added to MDX files
const componentImports: Record<string, string> = {
  pr: "import PR from '@/components/PR.astro';",
  ghuser: "import GhUser from '@/components/GhUser.astro';",
  img: "import Img from '@/components/Img.astro';",
  imgtable: "import ComponentGrid from '@/components/ComponentGrid.astro';",
  apiref: "import ApiRef from '@/components/ApiRef.astro';",
  apiclass: "import ApiClass from '@/components/ApiClass.astro';",
  apistruct: "import ApiStruct from '@/components/ApiStruct.astro';",
  option: "import Option from '@/components/Option.astro';",
  changelogs: "import Changelogs from '@/components/Changelogs.astro';",
  'feature-grid': "import FeatureGrid from '@/components/FeatureGrid.astro';",
  'getting-started-grid': "import GettingStartedGrid from '@/components/GettingStartedGrid.astro';",
  'render-automations': "import RenderAutomations from '@/components/RenderAutomations.astro';",
  'api-key-input': "import ApiKeyInput from '@/components/ApiKeyInput.astro';",
};

/**
 * Parse frontmatter from markdown content
 */
function parseFrontmatter(content: string): { frontmatter: Record<string, any>; body: string } {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) {
    return { frontmatter: {}, body: content };
  }

  const fmContent = fmMatch[1];
  const body = fmMatch[2];

  // Simple YAML parsing for common cases
  const frontmatter: Record<string, any> = {};
  let currentKey = '';
  let inMultiLine = false;
  let multiLineValue = '';
  let indent = 0;

  for (const line of fmContent.split('\n')) {
    if (inMultiLine) {
      const lineIndent = line.search(/\S|$/);
      if (lineIndent > indent || line.trim() === '') {
        multiLineValue += (multiLineValue ? '\n' : '') + line.trim();
        continue;
      } else {
        frontmatter[currentKey] = multiLineValue;
        inMultiLine = false;
      }
    }

    const keyMatch = line.match(/^(\w+):\s*(.*)$/);
    if (keyMatch) {
      const [, key, value] = keyMatch;
      if (value.trim() === '' || value.trim() === '|' || value.trim() === '>') {
        currentKey = key;
        inMultiLine = true;
        multiLineValue = '';
        indent = 2;
      } else if (value.startsWith('"') && value.endsWith('"')) {
        frontmatter[key] = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        frontmatter[key] = value.slice(1, -1);
      } else {
        frontmatter[key] = value;
      }
    }
  }

  if (inMultiLine) {
    frontmatter[currentKey] = multiLineValue;
  }

  return { frontmatter, body };
}

/**
 * Generate a title from a file path
 */
function generateTitleFromPath(filePath: string): string {
  // Get the base name without extension
  let name = path.basename(filePath, path.extname(filePath));

  // Handle index files - use parent directory name
  if (name === '_index' || name === 'index') {
    const dir = path.dirname(filePath);
    name = path.basename(dir);
  }

  // Convert underscores and hyphens to spaces
  name = name.replace(/[_-]/g, ' ');

  // Capitalize first letter of each word
  name = name.replace(/\b\w/g, (c) => c.toUpperCase());

  return name;
}

/**
 * Convert Hugo frontmatter to Starlight format
 */
function convertFrontmatter(fm: Record<string, any>, filePath: string): string {
  const newFm: Record<string, any> = {};

  // Copy title or generate from path
  if (fm.title) {
    newFm.title = fm.title;
  } else {
    // Generate title from file path
    newFm.title = generateTitleFromPath(filePath);
  }

  // Convert description - handle nested params.seo.description
  if (fm.description) {
    newFm.description = fm.description;
  }

  // Handle weight for sidebar ordering
  if (fm.weight) {
    newFm.sidebar = { order: parseInt(fm.weight, 10) };
  }

  // Build frontmatter string
  const lines = ['---'];

  // Helper to escape YAML string values
  const escapeYamlString = (str: string): string => {
    // If string contains special characters, use single quotes
    if (str.includes('"') || str.includes(':') || str.includes('#') || str.includes('\n')) {
      // Escape single quotes by doubling them
      return `'${str.replace(/'/g, "''")}'`;
    }
    return `"${str}"`;
  };

  if (newFm.title) {
    lines.push(`title: ${escapeYamlString(newFm.title)}`);
  }

  if (newFm.description) {
    lines.push(`description: ${escapeYamlString(newFm.description)}`);
  }

  if (newFm.sidebar) {
    lines.push(`sidebar:`);
    if (newFm.sidebar.order !== undefined) {
      lines.push(`  order: ${newFm.sidebar.order}`);
    }
  }

  lines.push('---');

  return lines.join('\n');
}

/**
 * Convert shortcodes to MDX components
 */
function convertShortcodes(content: string): { content: string; usedComponents: Set<string> } {
  const usedComponents = new Set<string>();
  let result = content;

  // PR shortcode: {{< pr number="123" >}} or {{< pr number=123 >}} or {{< pr number="123" repo="esphome-docs" >}}
  result = result.replace(
    /\{\{<\s*pr\s+number=["']?(\d+)["']?(?:\s+repo=["']?([^"'\s>]+)["']?)?\s*>\}\}/gi,
    (_, number, repo) => {
      usedComponents.add('pr');
      stats.shortcodesConverted.pr++;
      return repo ? `<PR number={${number}} repo="${repo}" />` : `<PR number={${number}} />`;
    }
  );

  // GhUser shortcode: {{< ghuser name="user" >}} or {{< ghuser name="user" text="Custom Text" >}}
  result = result.replace(
    /\{\{<\s*ghuser\s+name=["']([^"']+)["'](?:\s+text=["']([^"']+)["'])?\s*>\}\}/gi,
    (_, name, text) => {
      usedComponents.add('ghuser');
      stats.shortcodesConverted.ghuser++;
      return text ? `<GhUser name="${name}" text="${text}" />` : `<GhUser name="${name}" />`;
    }
  );

  // Img shortcode - supports multiline attributes
  result = result.replace(
    /\{\{<\s*img\s+([\s\S]+?)>\}\}/gi,
    (match, attrs) => {
      usedComponents.add('img');
      stats.shortcodesConverted.img++;

      // Parse attributes - use more permissive patterns for quoted values
      const srcMatch = attrs.match(/src="([^"]+)"/);
      const altMatch = attrs.match(/alt="([^"]+)"/);
      const captionMatch = attrs.match(/caption="([^"]+)"/);
      const classMatch = attrs.match(/class="([^"]+)"/);
      const widthMatch = attrs.match(/width="?([0-9.%]+)"?/);
      const heightMatch = attrs.match(/height="?([0-9.%]+)"?/);

      const props: string[] = [];
      if (srcMatch) props.push(`src="${srcMatch[1]}"`);
      if (altMatch) {
        // Escape angle brackets in alt text
        const escapedAlt = altMatch[1].replace(/</g, '&lt;').replace(/>/g, '&gt;');
        props.push(`alt="${escapedAlt}"`);
      }
      if (captionMatch) props.push(`caption="${captionMatch[1]}"`);
      if (classMatch) props.push(`class="${classMatch[1]}"`);
      if (widthMatch) props.push(`width="${widthMatch[1]}"`);
      if (heightMatch) props.push(`height="${heightMatch[1]}"`);

      return `<Img ${props.join(' ')} />`;
    }
  );

  // ApiRef shortcode: {{< apiref "path" >}} or {{< apiref "text" "path" >}}
  // Single arg: path only, use filename as text
  // Two args: text and path
  result = result.replace(
    /\{\{<\s*apiref\s+["']([^"']+)["'](?:\s+["']([^"']+)["'])?\s*>\}\}/gi,
    (_, first, second) => {
      usedComponents.add('apiref');
      stats.shortcodesConverted.apiref++;
      if (second) {
        // Two arguments: text, path
        return `<ApiRef text="${first}" path="${second}" />`;
      } else {
        // One argument: path only, derive text from filename
        const text = first.split('/').pop()?.replace(/\.[^.]+$/, '') || first;
        return `<ApiRef text="${text}" path="${first}" />`;
      }
    }
  );

  // ApiClass shortcode: {{< apiclass "text" "path" >}}
  result = result.replace(
    /\{\{<\s*apiclass\s+["']([^"']+)["']\s+["']([^"']+)["']\s*>\}\}/gi,
    (_, text, apiPath) => {
      usedComponents.add('apiclass');
      stats.shortcodesConverted.apiclass++;
      return `<ApiClass text="${text}" path="${apiPath}" />`;
    }
  );

  // ApiStruct shortcode: {{< apistruct "text" "path" >}}
  result = result.replace(
    /\{\{<\s*apistruct\s+["']([^"']+)["']\s+["']([^"']+)["']\s*>\}\}/gi,
    (_, text, apiPath) => {
      usedComponents.add('apistruct');
      stats.shortcodesConverted.apistruct++;
      return `<ApiStruct text="${text}" path="${apiPath}" />`;
    }
  );

  // Changelogs shortcode: {{< changelogs >}}
  result = result.replace(
    /\{\{<\s*changelogs\s*>\}\}/gi,
    () => {
      usedComponents.add('changelogs');
      stats.shortcodesConverted.changelogs++;
      return '<Changelogs />';
    }
  );

  // api-key-input shortcode: {{< api-key-input >}}
  result = result.replace(
    /\{\{<\s*api-key-input\s*>\}\}/gi,
    () => {
      usedComponents.add('api-key-input');
      return '<ApiKeyInput />';
    }
  );

  // render-automations shortcode: {{< render-automations "category" >}}
  result = result.replace(
    /\{\{<\s*render-automations\s+["']([^"']+)["']\s*>\}\}/gi,
    (_, category) => {
      usedComponents.add('render-automations');
      stats.shortcodesConverted.renderAutomations++;
      return `<RenderAutomations category="${category}" />`;
    }
  );

  // Feature-grid shortcode: {{< feature-grid >}}JSON{{< /feature-grid >}}
  result = result.replace(
    /\{\{<\s*feature-grid\s*>\}\}\s*([\s\S]*?)\s*\{\{<\s*\/feature-grid\s*>\}\}/gi,
    (_, jsonContent) => {
      usedComponents.add('feature-grid');
      stats.shortcodesConverted.featureGrid++;
      try {
        const features = JSON.parse(jsonContent.trim());
        const featuresStr = JSON.stringify(features, null, 2);
        return `<FeatureGrid features={${featuresStr}} />`;
      } catch (e) {
        console.warn('Failed to parse feature-grid JSON, leaving as-is');
        return `{/* TODO: Convert feature-grid */}\n${jsonContent}`;
      }
    }
  );

  // Getting-started-grid shortcode: {{< getting-started-grid >}}JSON{{< /getting-started-grid >}}
  result = result.replace(
    /\{\{<\s*getting-started-grid\s*>\}\}\s*([\s\S]*?)\s*\{\{<\s*\/getting-started-grid\s*>\}\}/gi,
    (_, jsonContent) => {
      usedComponents.add('getting-started-grid');
      stats.shortcodesConverted.gettingStartedGrid++;
      try {
        const items = JSON.parse(jsonContent.trim());
        const itemsStr = JSON.stringify(items, null, 2);
        return `<GettingStartedGrid items={${itemsStr}} />`;
      } catch (e) {
        console.warn('Failed to parse getting-started-grid JSON, leaving as-is');
        return `{/* TODO: Convert getting-started-grid */}\n${jsonContent}`;
      }
    }
  );

  // Imgtable shortcode: {{< imgtable >}}CSV{{< /imgtable >}}
  result = result.replace(
    /\{\{<\s*imgtable\s*>\}\}\s*([\s\S]*?)\s*\{\{<\s*\/imgtable\s*>\}\}/gi,
    (_, csvContent) => {
      usedComponents.add('imgtable');
      stats.shortcodesConverted.imgtable++;

      // Parse CSV content
      const lines = csvContent.trim().split('\n').filter((l: string) => l.trim());
      const items: Array<{ title: string; link: string; image: string; darkInvert?: boolean; caption?: string }> = [];

      for (const line of lines) {
        // Simple CSV parsing (handles quotes)
        const parts = line.split(',').map((p: string) => p.trim().replace(/^["']|["']$/g, ''));
        if (parts.length >= 3) {
          const item: { title: string; link: string; image: string; darkInvert?: boolean; caption?: string } = {
            title: parts[0],
            link: parts[1].replace(/index$/, ''),
            image: parts[2],
          };

          // Check for additional params (dark-invert, caption)
          for (let i = 3; i < parts.length; i++) {
            if (parts[i] === 'dark-invert') {
              item.darkInvert = true;
            } else if (parts[i]) {
              item.caption = parts[i];
            }
          }

          items.push(item);
        }
      }

      const itemsStr = JSON.stringify(items, null, 2);
      return `<ComponentGrid items={${itemsStr}} />`;
    }
  );

  // Option shortcode: {{< option "name" >}}content{{< /option >}}
  result = result.replace(
    /\{\{<\s*option\s+["']([^"']+)["']\s*>\}\}\s*([\s\S]*?)\s*\{\{<\s*\/option\s*>\}\}/gi,
    (_, name, content) => {
      usedComponents.add('option');
      stats.shortcodesConverted.option++;
      return `<Option name="${name}">\n${content.trim()}\n</Option>`;
    }
  );

  // Include shortcode: {{< include "file.md" >}} - handled by remark plugin, but mark it
  result = result.replace(
    /\{\{<\s*include\s+["']([^"']+)["']\s*>\}\}/gi,
    (_, file) => {
      stats.shortcodesConverted.include++;
      return `{/* TODO: Include content from "${file}" - implement as MDX import or inline */}`;
    }
  );

  // Convert HTML comments to MDX comments
  result = result.replace(
    /<!--\s*([\s\S]*?)\s*-->/g,
    (_, content) => `{/* ${content.trim()} */}`
  );

  // Anchor shortcodes: {{< anchor "id" >}} -> hidden anchor element or remove
  const anchorMatches = result.match(/\{\{<\s*anchor\s+["'][^"']+["']\s*>\}\}/gi);
  if (anchorMatches) stats.shortcodesConverted.anchor += anchorMatches.length;
  result = result.replace(
    /\{\{<\s*anchor\s+["']([^"']+)["']\s*>\}\}/gi,
    (_, id) => `<a id="${id}" aria-hidden="true"></a>`
  );

  // Break shortcodes: {{< break >}} -> <br />
  const breakMatches = result.match(/\{\{<\s*break\s*>\}\}/gi);
  if (breakMatches) stats.shortcodesConverted.break += breakMatches.length;
  result = result.replace(
    /\{\{<\s*break\s*>\}\}/gi,
    () => '<br />'
  );

  // Math shortcodes: {{< math >}}...{{< /math >}} -> $$...$$
  const mathMatches = result.match(/\{\{<\s*math\s*>\}\}/gi);
  if (mathMatches) stats.shortcodesConverted.math += mathMatches.length;
  result = result.replace(
    /\{\{<\s*math\s*>\}\}/gi,
    () => '\n$$\n'
  );
  result = result.replace(
    /\{\{<\s*\/math\s*>\}\}/gi,
    () => '\n$$\n'
  );

  // Collapse shortcodes: {{< collapse >}}...{{< /collapse >}} -> <details>...</details>
  const collapseMatches = result.match(/\{\{<\s*collapse[^>]*>\}\}/gi);
  if (collapseMatches) stats.shortcodesConverted.collapse += collapseMatches.length;
  result = result.replace(
    /\{\{<\s*collapse(?:\s+["']?([^"'>]*)["']?)?\s*>\}\}/gi,
    (_, openState) => {
      const isOpen = openState && openState.toLowerCase() !== 'false' ? ' open' : '';
      return `<details${isOpen}>\n<summary></summary>\n`;
    }
  );
  result = result.replace(
    /\{\{<\s*\/collapse\s*>\}\}/gi,
    () => '\n</details>'
  );

  // Docref shortcodes: {{< docref "path" >}} or {{< docref "path" "text" >}} -> markdown link
  // Also handles Hugo's double-quote escaping: ""text""
  // Handles apostrophes inside double-quoted strings
  const docrefMatches = result.match(/\{\{<\s*docref\s+/gi);
  if (docrefMatches) stats.shortcodesConverted.docref += docrefMatches.length;
  // More flexible pattern that handles various quote escaping styles
  result = result.replace(
    /\{\{<\s*docref\s+"([^"\s]+)"(?:\s+"*([^>]+[^"\s])"*)?(?:\s+\w+)?\s*>\}\}/gi,
    (_, pathWithAnchor, customTextRaw) => {
      // Clean up the custom text - remove extra quotes
      const customText = customTextRaw ? customTextRaw.replace(/^"+|"+$/g, '').trim() : undefined;
      // Parse path and anchor
      let linkPath = pathWithAnchor;
      let anchor = '';
      if (pathWithAnchor.includes('#')) {
        const parts = pathWithAnchor.split('#');
        linkPath = parts[0];
        anchor = parts[1];
      }

      // Normalize path
      let normalizedPath = linkPath;
      if (!normalizedPath.startsWith('/')) {
        normalizedPath = '/' + normalizedPath;
      }
      normalizedPath = normalizedPath.replace(/\.(md|html)$/, '');
      normalizedPath = normalizedPath.replace(/\/$/, '');
      normalizedPath = normalizedPath.replace(/\/index$/, '');

      // Build URL
      const url = normalizedPath + '/' + (anchor ? '#' + anchor : '');

      // Determine link text
      const linkText = customText || linkPath.split('/').pop() || linkPath;

      return `[${linkText}](${url})`;
    }
  );

  // Redirect shortcodes: remove them (handled in Astro config)
  // Handles both {{< redirect "/path" >}} and {{< redirect url="/path" >}}
  result = result.replace(
    /\{\{<\s*redirect\s+(?:url=)?["']([^"']+)["']\s*>\}\}/gi,
    () => ''
  );

  // SEO shortcodes: remove them (handled in frontmatter)
  result = result.replace(
    /\{\{<\s*seo\s+[^>]*>\}\}/gi,
    () => ''
  );

  // html_file shortcodes: leave a TODO comment
  result = result.replace(
    /\{\{<\s*html_file\s+(?:file=)?["']([^"']+)["']\s*>\}\}/gi,
    (_, filePath) => `{/* TODO: Include HTML file "${filePath}" */}`
  );

  // Inline script tags cause issues in MDX - the curly braces are interpreted as expressions
  // Wrap script content to escape the braces or comment out
  result = result.replace(
    /<script>([\s\S]*?)<\/script>/gi,
    (_, content) => {
      // For now, comment out inline scripts with a TODO
      return `{/* TODO: Inline script - convert to Astro component or client-side JS\n${content}\n*/}`;
    }
  );

  // Inline style tags cause issues in MDX - the curly braces are interpreted as expressions
  result = result.replace(
    /<style>([\s\S]*?)<\/style>/gi,
    (_, content) => {
      // For now, comment out inline styles with a TODO
      return `{/* TODO: Inline style - convert to Astro component or CSS file\n${content}\n*/}`;
    }
  );

  // Remove stray HTML closing tags that don't have corresponding opening tags
  // These are usually formatting artifacts from the original docs
  result = result.replace(/<\/td><\/tr>/gi, '');

  // Escape curly braces in text that aren't part of JSX expressions or components
  // Pattern like {S2,S3,C3} or {lib, yaml} should become escaped versions
  // But don't escape braces that are part of component props like number={123}
  // Match { followed by word chars, commas, spaces that don't look like JSX }
  result = result.replace(/\{([a-zA-Z][a-zA-Z0-9,\s_-]*)\}/g, '&#123;$1&#125;');

  // Self-closing HTML void elements need explicit self-closing in JSX/MDX
  // Match: <tag attrs> where tag is a void element, convert to <tag attrs />
  const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'];
  for (const tag of voidElements) {
    // Match <tag ...> that doesn't already have /> and convert to <tag ... />
    const pattern = new RegExp(`<(${tag})([^>]*[^/])>`, 'gi');
    result = result.replace(pattern, '<$1$2 />');
    // Also handle <tag> with no attributes
    const simplePattern = new RegExp(`<(${tag})>`, 'gi');
    result = result.replace(simplePattern, '<$1 />');
  }

  // Convert angle-bracket URLs to proper markdown links (MDX interprets <url> as JSX)
  // Match <http://...> or <https://...> patterns that aren't already in markdown links
  result = result.replace(
    /<(https?:\/\/[^>]+)>/g,
    (_, url) => `[${url}](${url})`
  );

  // Convert angle-bracket email addresses to markdown links
  // Match <user@domain.com> patterns
  result = result.replace(
    /<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>/g,
    (_, email) => `[${email}](mailto:${email})`
  );

  // Escape angle brackets that would be interpreted as JSX
  // This handles C++ template syntax like optional<>, vector<int>, etc.
  // and comparison operators like <= and >=

  // Escape angle brackets that would be interpreted as JSX
  // IMPORTANT: Process these outside of code blocks to avoid breaking code examples

  // First, protect code blocks by replacing angle brackets inside them
  // Match fenced code blocks and inline code
  const codeBlockPlaceholders: string[] = [];
  result = result.replace(/```[\s\S]*?```|`[^`\n]+`/g, (match) => {
    const placeholder = `__CODE_BLOCK_${codeBlockPlaceholders.length}__`;
    codeBlockPlaceholders.push(match);
    return placeholder;
  });

  // Now apply escaping (outside code blocks)
  // Comparison operators: <= and >=
  result = result.replace(/<=/g, '&lt;=');
  result = result.replace(/>=/g, '&gt;=');

  // Version constraints and comparisons: < followed by digit (with optional space)
  result = result.replace(/<\s*(\d)/g, '&lt; $1');

  // Empty angle brackets: <>
  result = result.replace(/<>/g, '&lt;&gt;');

  // Ellipsis in angle brackets: <...>
  result = result.replace(/<\.\.\.>/g, '&lt;...&gt;');

  // Bi-directional arrow: <-> and similar patterns
  result = result.replace(/<->/g, '&lt;-&gt;');
  result = result.replace(/<-->/g, '&lt;--&gt;');

  // C++ types in angle brackets - match patterns that contain :: or * or &
  // These are clearly not HTML/JSX tags
  // Use a more restrictive pattern that doesn't span multiple lines
  result = result.replace(/<([^\n>]*(?:::|\*(?=[^*])|&(?!amp;|lt;|gt;|quot;))[^\n>]*)>/g, '&lt;$1&gt;');

  // Also escape incomplete C++ type patterns like <uint8_t) where > is missing
  // These are clearly not valid JSX but might be typos in docs
  result = result.replace(/<(std::[a-z_]+<[^>]*[^>\s])/gi, '&lt;$1');
  result = result.replace(/<(uint\d+_t|int\d+_t|size_t|float|double|bool|char|void|auto)([^a-zA-Z>])/g, '&lt;$1$2');

  // Restore code blocks
  result = result.replace(/__CODE_BLOCK_(\d+)__/g, (_, idx) => codeBlockPlaceholders[parseInt(idx)]);

  // Generic patterns like <word> that look like C++ or placeholders but aren't valid tags
  // Only match specific patterns we know are problematic, avoid being too greedy

  // C++ template patterns like <T>, <int>, <float>, <string>, etc. that aren't valid JSX
  // Only match if not preceded by a space and slash (closing tags like </div>)
  // and not followed by valid JSX patterns
  const cppTemplatePattern = /<([a-z_][a-z0-9_]*(?:\s*,\s*[a-z_][a-z0-9_]*)*)>/gi;

  // List of valid HTML/JSX tags we should NOT escape
  const validJsxTags = new Set([
    // HTML tags
    'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo',
    'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup',
    'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em',
    'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'label',
    'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'meta', 'meter', 'nav', 'noscript',
    'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'pre', 'progress',
    'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'slot', 'small', 'source',
    'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea',
    'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr',
    // Our custom components (uppercase)
    'pr', 'ghuser', 'img', 'apiref', 'apiclass', 'apistruct', 'option', 'changelogs',
    'featuregrid', 'gettingstartedgrid', 'renderautomations', 'componentgrid', 'apikeyinput',
  ]);

  result = result.replace(cppTemplatePattern, (match, inner) => {
    const tagName = inner.split(/\s*,\s*/)[0].toLowerCase();
    // If it looks like a valid HTML tag or component, leave it alone
    if (validJsxTags.has(tagName)) {
      return match;
    }
    // Escape the angle brackets using HTML entities
    return `&lt;${inner}&gt;`;
  });

  return { content: result, usedComponents };
}

/**
 * Process a single markdown file
 */
function processFile(sourcePath: string): void {
  const relativePath = path.relative(SOURCE_DIR, sourcePath);

  // Determine target path
  let targetPath = path.join(TARGET_DIR, relativePath);

  // Rename _index.md to index.mdx
  targetPath = targetPath.replace(/_index\.md$/, 'index.mdx');

  // Change .md to .mdx
  targetPath = targetPath.replace(/\.md$/, '.mdx');

  console.log(`Processing: ${relativePath} -> ${path.relative(TARGET_DIR, targetPath)}`);

  try {
    // Read source file
    const content = fs.readFileSync(sourcePath, 'utf-8');

    // Parse frontmatter and body
    const { frontmatter, body } = parseFrontmatter(content);

    // Convert frontmatter
    const newFrontmatter = convertFrontmatter(frontmatter, sourcePath);

    // Convert shortcodes
    const { content: convertedBody, usedComponents } = convertShortcodes(body);

    // Build imports
    const imports: string[] = [];
    for (const component of usedComponents) {
      if (componentImports[component]) {
        imports.push(componentImports[component]);
      }
    }

    // Combine parts
    const importBlock = imports.length > 0 ? imports.join('\n') + '\n\n' : '';
    const newContent = newFrontmatter + '\n\n' + importBlock + convertedBody;

    if (DRY_RUN) {
      console.log(`  [DRY RUN] Would write to: ${targetPath}`);
      console.log(`  Components used: ${[...usedComponents].join(', ') || 'none'}`);
    } else {
      // Create target directory
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });

      // Write file
      fs.writeFileSync(targetPath, newContent, 'utf-8');
    }

    stats.processed++;
  } catch (error) {
    console.error(`  Error processing ${sourcePath}:`, error);
    stats.errors++;
  }
}

/**
 * Main migration function
 */
async function migrate(): Promise<void> {
  console.log('ESPHome Docs Migration: Hugo to Astro Starlight');
  console.log('='.repeat(50));

  if (DRY_RUN) {
    console.log('Running in DRY RUN mode - no files will be written\n');
  }

  if (SINGLE_FILE) {
    // Process single file
    if (fs.existsSync(SINGLE_FILE)) {
      processFile(SINGLE_FILE);
    } else {
      console.error(`File not found: ${SINGLE_FILE}`);
      process.exit(1);
    }
  } else {
    // Find all markdown files
    const files = await glob(`${SOURCE_DIR}/**/*.md`);
    console.log(`Found ${files.length} markdown files to process\n`);

    for (const file of files) {
      processFile(file);
    }
  }

  // Print statistics
  console.log('\n' + '='.repeat(50));
  console.log('Migration Statistics');
  console.log('='.repeat(50));
  console.log(`Files processed: ${stats.processed}`);
  console.log(`Files skipped: ${stats.skipped}`);
  console.log(`Errors: ${stats.errors}`);
  console.log('\nShortcodes converted:');
  for (const [shortcode, count] of Object.entries(stats.shortcodesConverted)) {
    if (count > 0) {
      console.log(`  ${shortcode}: ${count}`);
    }
  }
}

// Run migration
migrate().catch(console.error);
