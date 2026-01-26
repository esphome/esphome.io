/**
 * Remark Directive Plugins for ESPHome Documentation
 *
 * Transforms :::directive syntax into HTML at build time.
 * This replaces Hugo shortcodes with standard remark-directive syntax.
 *
 * Supported directives:
 * - ::anchor{#id} - Named anchor points
 * - ::img{src="..." alt="..." caption="..."} - Images with optional caption
 * - ::apiref{text="..." path="..."} - C++ API reference links
 * - ::pr{#number repo="..."} - GitHub PR links
 * - ::ghuser{name="..."} - GitHub user profile links
 * - :::collapse[Title]\n...\n::: - Collapsible sections
 * - :::imgtable\n...\n::: - Component card grids
 * - :::feature-grid\n...\n::: - Feature card grids (JSON content)
 * - :::getting-started-grid\n...\n::: - Getting started cards (JSON content)
 * - :::changelogs\n::: - Auto-generated changelog list
 * - :::render-automations\n::: - Automation list rendering
 */

import type { Plugin } from 'unified';
import type { Root, Node, Parent } from 'mdast';
import { visit } from 'unist-util-visit';
import { h } from 'hastscript';
import { toHtml } from 'hast-util-to-html';

// Type definitions for directive nodes
interface DirectiveNode extends Node {
  type: 'textDirective' | 'leafDirective' | 'containerDirective';
  name: string;
  attributes?: Record<string, string>;
  children?: Node[];
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
}

interface TextNode extends Node {
  type: 'text';
  value: string;
}

// API docs base URL
const API_DOCS_URL = 'https://api-docs.esphome.io';

/**
 * Process API reference path to match Hugo's transformation
 */
function processApiPath(path: string): string {
  // Get last path element
  const parts = path.split('/');
  let processed = parts[parts.length - 1];

  // Replace special characters
  processed = processed
    .replace(/_/g, '__')
    .replace(/\./g, '_8')
    .replace(/:/g, '_1');

  // Convert capital letters to lowercase with underscore prefix
  processed = processed.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);

  return processed;
}

/**
 * Parse CSV-like content (for imgtable)
 */
function parseCSVContent(content: string): string[][] {
  const lines = content.trim().split('\n');
  return lines
    .filter((line) => line.trim())
    .map((line) => {
      // Simple CSV parsing with quote handling
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
}

/**
 * Get text content from children nodes
 */
function getTextContent(children: Node[] | undefined): string {
  if (!children) return '';

  return children
    .map((child) => {
      if (child.type === 'text') {
        return (child as TextNode).value;
      }
      if ('children' in child) {
        return getTextContent((child as Parent).children as Node[]);
      }
      return '';
    })
    .join('');
}

/**
 * Main remark directive plugin
 */
export const remarkDirectives: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, (node) => {
      const directive = node as unknown as DirectiveNode;

      // Handle text directives (inline) - ::name{attrs}
      if (directive.type === 'textDirective') {
        handleTextDirective(directive);
      }

      // Handle leaf directives (block, no content) - ::name{attrs}
      if (directive.type === 'leafDirective') {
        handleLeafDirective(directive);
      }

      // Handle container directives (block with content) - :::name\n...\n:::
      if (directive.type === 'containerDirective') {
        handleContainerDirective(directive);
      }
    });
  };
};

/**
 * Handle inline text directives
 */
function handleTextDirective(node: DirectiveNode): void {
  const attrs = node.attributes || {};

  switch (node.name) {
    case 'anchor': {
      // ::anchor{#id}
      const id = attrs.id || attrs[''] || '';
      node.data = {
        hName: 'a',
        hProperties: { class: 'anchor', id, role: 'none' },
      };
      break;
    }

    case 'pr': {
      // ::pr{#123 repo="esphome"}
      const number = attrs.id || attrs[''] || attrs.number || '';
      const repo = attrs.repo || 'esphome';
      const href = `https://github.com/esphome/${repo}/pull/${number}`;
      node.data = {
        hName: 'a',
        hProperties: {
          href,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      };
      // Set link text
      if (!node.children || node.children.length === 0) {
        node.children = [{ type: 'text', value: `${repo}#${number}` } as TextNode];
      }
      break;
    }

    case 'ghuser': {
      // ::ghuser{name="octocat"}
      const name = attrs.name || '';
      const text = attrs.text || `@${name}`;
      node.data = {
        hName: 'a',
        hProperties: {
          href: `https://github.com/${name}`,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      };
      if (!node.children || node.children.length === 0) {
        node.children = [{ type: 'text', value: text } as TextNode];
      }
      break;
    }

    case 'apiref': {
      // ::apiref{text="Sensor class" path="esphome::sensor::Sensor"}
      const text = attrs.text || 'API Reference';
      const path = attrs.path || '';
      const processedPath = processApiPath(path);
      node.data = {
        hName: 'a',
        hProperties: { href: `${API_DOCS_URL}/${processedPath}` },
      };
      if (!node.children || node.children.length === 0) {
        node.children = [{ type: 'text', value: text } as TextNode];
      }
      break;
    }

    default:
      // Unknown directive, leave as-is
      break;
  }
}

/**
 * Handle leaf directives (block level, no children)
 */
function handleLeafDirective(node: DirectiveNode): void {
  const attrs = node.attributes || {};

  switch (node.name) {
    case 'anchor': {
      // ::anchor{#id}
      const id = attrs.id || attrs[''] || '';
      node.data = {
        hName: 'a',
        hProperties: { class: 'anchor', id, role: 'none' },
      };
      break;
    }

    case 'img': {
      // ::img{src="..." alt="..." caption="..." class="..." width="..." height="..."}
      const src = attrs.src || '';
      const alt = attrs.alt || 'Image';
      const caption = attrs.caption || '';
      const className = attrs.class || '';
      const width = attrs.width || '';
      const height = attrs.height || '';

      const imgProps: Record<string, unknown> = { src, alt, loading: 'lazy' };
      if (width) imgProps.width = width;
      if (height) imgProps.height = height;
      if (className && !caption) imgProps.class = className;

      if (caption) {
        // Wrap in figure with caption
        const figureProps: Record<string, unknown> = {};
        if (className) figureProps.class = className;

        const hast = h('figure', figureProps, [
          h('img', imgProps),
          h('figcaption', caption),
        ]);
        node.data = {
          hName: 'figure',
          hProperties: figureProps,
        };
        // We need to add children for the figure
        node.children = [
          {
            type: 'html',
            value: toHtml(hast),
          } as unknown as Node,
        ];
      } else {
        node.data = {
          hName: 'img',
          hProperties: imgProps,
        };
      }
      break;
    }

    case 'break': {
      // ::break{}
      node.data = {
        hName: 'hr',
        hProperties: {},
      };
      break;
    }

    default:
      break;
  }
}

/**
 * Handle container directives (block level with children)
 */
function handleContainerDirective(node: DirectiveNode): void {
  const attrs = node.attributes || {};
  const content = getTextContent(node.children);

  switch (node.name) {
    case 'collapse': {
      // :::collapse[Title]\n...\n:::
      // The title comes from the directive label (first child paragraph sometimes)
      const isOpen = attrs.open === 'true' || attrs.open === '';

      node.data = {
        hName: 'details',
        hProperties: isOpen ? { open: true } : {},
      };

      // Wrap children in summary + div structure
      const summaryNode: Node = {
        type: 'html',
        value: '<summary></summary>',
      } as unknown as Node;

      // Keep existing children as the details content
      const originalChildren = node.children || [];
      node.children = [
        summaryNode,
        {
          type: 'html',
          value: '<div>',
        } as unknown as Node,
        ...originalChildren,
        {
          type: 'html',
          value: '</div>',
        } as unknown as Node,
      ];
      break;
    }

    case 'imgtable': {
      // :::imgtable\nTitle, Link, Image, [class]\n...\n:::
      const rows = parseCSVContent(content);
      const cards = rows
        .map((row) => {
          const [title, link, image, ...rest] = row;
          let cssClass = '';
          let caption = '';

          // Parse remaining parameters
          for (const param of rest) {
            if (param === 'dark-invert') {
              cssClass = param;
            } else if (param) {
              caption = caption ? `${caption} & ${param}` : param;
            }
          }

          // Break title on non-alphabetic characters for wrapping
          const brokenTitle = title.replace(/([^a-zA-Z])/g, '$1\u200B');

          return `
          <div class="component-card">
            <a href="${link}">
              <div class="component-icon${cssClass ? ` ${cssClass}` : ''}">
                <img src="${image}" alt="" loading="lazy">
              </div>
              <div class="component-name">${brokenTitle}</div>
              ${caption ? `<div class="component-caption">${caption}</div>` : ''}
            </a>
          </div>
        `;
        })
        .join('\n');

      node.data = {
        hName: 'div',
        hProperties: { class: 'component-grid' },
      };
      node.children = [
        {
          type: 'html',
          value: cards,
        } as unknown as Node,
      ];
      break;
    }

    case 'feature-grid': {
      // :::feature-grid\n[{icon, title, description}, ...]\n:::
      try {
        const features = JSON.parse(content);
        const cards = features
          .map(
            (f: { icon: string; title: string; description: string }) => `
          <div class="feature-card">
            <div class="feature-icon">
              <img src="/images/icons/${f.icon}.svg" alt="" aria-hidden="true">
            </div>
            <div class="feature-text">${f.title}</div>
            <p>${f.description}</p>
          </div>
        `
          )
          .join('\n');

        node.data = {
          hName: 'div',
          hProperties: { class: 'feature-grid' },
        };
        node.children = [
          {
            type: 'html',
            value: cards,
          } as unknown as Node,
        ];
      } catch {
        // Invalid JSON, leave as-is
        console.warn('Invalid JSON in feature-grid directive');
      }
      break;
    }

    case 'getting-started-grid': {
      // :::getting-started-grid\n[{icon, title, description, steps, url, button_text}, ...]\n:::
      try {
        const items = JSON.parse(content);
        const cards = items
          .map(
            (item: {
              icon: string;
              title: string;
              description: string;
              steps?: string[];
              url?: string;
              button_text?: string;
            }) => `
          <div class="feature-card">
            <div class="feature-icon">
              <img src="/images/icons/${item.icon}.svg" alt="" aria-hidden="true">
            </div>
            <div class="getting-started-heading">${item.title}</div>
            <p>${item.description}</p>
            ${
              item.steps && item.steps.length > 0
                ? `<ol>${item.steps.map((s: string) => `<li>${s}</li>`).join('')}</ol>`
                : ''
            }
            ${item.url ? `<a href="${item.url}" class="btn btn-primary">${item.button_text || 'Learn More'}</a>` : ''}
          </div>
        `
          )
          .join('\n');

        node.data = {
          hName: 'div',
          hProperties: { class: 'getting-started-grid' },
        };
        node.children = [
          {
            type: 'html',
            value: cards,
          } as unknown as Node,
        ];
      } catch {
        console.warn('Invalid JSON in getting-started-grid directive');
      }
      break;
    }

    case 'changelogs': {
      // :::changelogs\n:::
      // This will be populated at build time by fetching changelog data
      node.data = {
        hName: 'div',
        hProperties: {
          class: 'changelogs-container',
          'data-changelogs': 'true',
        },
      };
      // Placeholder - actual content will be injected at build/render time
      node.children = [
        {
          type: 'html',
          value: '<!-- Changelogs will be rendered here -->',
        } as unknown as Node,
      ];
      break;
    }

    case 'render-automations': {
      // :::render-automations\n:::
      // Placeholder for automation rendering
      node.data = {
        hName: 'div',
        hProperties: {
          class: 'automations-container',
          'data-automations': 'true',
        },
      };
      node.children = [
        {
          type: 'html',
          value: '<!-- Automations will be rendered here -->',
        } as unknown as Node,
      ];
      break;
    }

    case 'option': {
      // :::option[option_name]\n...\n:::
      const optionName = attrs.name || '';
      node.data = {
        hName: 'div',
        hProperties: { class: 'option' },
      };
      // Prepend option title
      const titleNode: Node = {
        type: 'html',
        value: `<span class="option-title"><code>${optionName}</code></span>`,
      } as unknown as Node;
      node.children = [titleNode, ...(node.children || [])];
      break;
    }

    default:
      // Unknown container directive - wrap in a div with the directive name as class
      node.data = {
        hName: 'div',
        hProperties: { class: `directive-${node.name}` },
      };
      break;
  }
}

export default remarkDirectives;
