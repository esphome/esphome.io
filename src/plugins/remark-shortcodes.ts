/**
 * Remark plugin to transform various Hugo shortcodes to their Astro/MDX equivalents.
 *
 * Transforms:
 *   {{< anchor "id" >}} → <a id="id"></a> (or remove if Starlight auto-anchors)
 *   {{< break >}} → <br />
 *   {{< math >}}...{{< /math >}} → $$...$$ (for rehype-katex)
 *   {{< collapse >}}...{{< /collapse >}} → <details><summary></summary>...</details>
 *   {{< redirect "url" >}} → (removed, handled in config)
 *   {{< seo ... >}} → (removed, handled in frontmatter)
 */

import { visit } from 'unist-util-visit';
import type { Root, Text, Html } from 'mdast';

// Regex patterns for various shortcodes
const PATTERNS = {
  // Simple inline shortcodes
  anchor: /\{\{<\s*anchor\s+["']([^"']+)["']\s*>\}\}/g,
  break: /\{\{<\s*break\s*>\}\}/g,
  redirect: /\{\{<\s*redirect\s+["']([^"']+)["']\s*>\}\}/g,
  seo: /\{\{<\s*seo\s+[^>]*>\}\}/g,

  // Block shortcodes with content
  mathOpen: /\{\{<\s*math\s*>\}\}/g,
  mathClose: /\{\{<\s*\/math\s*>\}\}/g,
  collapseOpen: /\{\{<\s*collapse(?:\s+["']?([^"'>]*)["']?)?\s*>\}\}/g,
  collapseClose: /\{\{<\s*\/collapse\s*>\}\}/g,

  // HTML file include (simple replacement)
  htmlFile: /\{\{<\s*html_file\s+["']([^"']+)["']\s*>\}\}/g,
};

export default function remarkShortcodes() {
  return (tree: Root) => {
    // First pass: handle simple text/html node replacements
    visit(tree, ['text', 'html'], (node, index, parent) => {
      if (!parent || index === undefined) return;

      let content = (node as Text | Html).value;
      let modified = false;

      // Transform anchor shortcodes
      // Since Starlight auto-generates anchors for headings, we can create a hidden anchor
      content = content.replace(PATTERNS.anchor, (_, id) => {
        modified = true;
        return `<a id="${id}" aria-hidden="true"></a>`;
      });

      // Transform break shortcodes
      content = content.replace(PATTERNS.break, () => {
        modified = true;
        return '<br />';
      });

      // Remove redirect shortcodes (these should be handled in Astro config)
      content = content.replace(PATTERNS.redirect, () => {
        modified = true;
        return '';
      });

      // Remove seo shortcodes (these should be handled in frontmatter)
      content = content.replace(PATTERNS.seo, () => {
        modified = true;
        return '';
      });

      // Transform math shortcodes to $$ notation for rehype-katex
      content = content.replace(PATTERNS.mathOpen, () => {
        modified = true;
        return '\n$$\n';
      });
      content = content.replace(PATTERNS.mathClose, () => {
        modified = true;
        return '\n$$\n';
      });

      // Transform collapse shortcodes to details/summary
      content = content.replace(PATTERNS.collapseOpen, (_, openState) => {
        modified = true;
        const isOpen = openState && openState.toLowerCase() !== 'false' ? ' open' : '';
        return `<details${isOpen}>\n<summary></summary>\n`;
      });
      content = content.replace(PATTERNS.collapseClose, () => {
        modified = true;
        return '\n</details>';
      });

      // Transform html_file shortcodes to a comment (should be handled during migration)
      content = content.replace(PATTERNS.htmlFile, (_, filePath) => {
        modified = true;
        return `{/* TODO: Include HTML file "${filePath}" */}`;
      });

      if (modified) {
        (node as Text | Html).value = content;
      }
    });

    // Second pass: clean up empty text nodes
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index === undefined) return;
      const textNode = node as Text;
      if (textNode.value.trim() === '') {
        // Keep whitespace nodes for formatting
      }
    });
  };
}
