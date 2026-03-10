/**
 * MDAST node utilities: text extraction, markdown serialization, slugification.
 */

/**
 * Slugify text to a URL-safe anchor string.
 * Mirrors the Python slugify() in schema_doc.py.
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^\w\s-]/g, '')        // keep alphanumeric, spaces, hyphens
    .replace(/[-\s]+/g, '-')         // collapse whitespace/hyphens
    .replace(/^-+|-+$/g, '');        // trim edge hyphens
}

/**
 * Extract all plain text from a node (recursively).
 * inlineCode is included as raw value (no backticks).
 */
export function getText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value ?? '';
  if (node.type === 'inlineCode') return node.value ?? '';
  if (node.children) return node.children.map(getText).join('');
  return '';
}

/**
 * Convert a MDAST node (or subtree) back to a markdown string.
 * Local links are kept as-is; call convertLinks() separately to resolve them.
 */
export function toMarkdown(node) {
  if (!node) return '';
  switch (node.type) {
    case 'text':
      return node.value ?? '';
    case 'inlineCode':
      return `\`${node.value}\``;
    case 'strong':
      return `**${children(node).map(toMarkdown).join('')}**`;
    case 'emphasis':
      return `*${children(node).map(toMarkdown).join('')}*`;
    case 'link':
      return `[${children(node).map(toMarkdown).join('')}](${node.url})`;
    case 'paragraph':
      return children(node).map(toMarkdown).join('');
    case 'heading': {
      const prefix = '#'.repeat(node.depth ?? 1);
      return `${prefix} ${children(node).map(toMarkdown).join('')}`;
    }
    // MDX elements: try to extract text content
    case 'mdxJsxTextElement':
      return children(node).map(toMarkdown).join('');
    default:
      if (node.children) return node.children.map(toMarkdown).join('');
      return '';
  }
}

function children(node) {
  return node.children ?? [];
}

/**
 * Return the heading text as a plain string (for matching and slugification).
 */
export function headingText(node) {
  return getText(node).trim();
}

/**
 * Return true if a heading node looks like a "Configuration variables:" section.
 */
export function isConfigVarsHeading(node) {
  if (node.type !== 'heading') return false;
  return /^configuration\s+(variables|options):?$/i.test(headingText(node));
}

/**
 * Convert a paragraph node's children to a flat markdown string,
 * joining lines that were soft-wrapped.
 */
export function paragraphToMarkdown(node) {
  if (!node || node.type !== 'paragraph') return '';
  return toMarkdown(node).replace(/\n/g, ' ').trim();
}

/**
 * Given a listItem node, extract the config-var data:
 *   { name, types, description }
 *
 * Matches the pattern:  **name** (*Optional*, type): description
 * or just:              **name**: description
 * or enum:              `value` - description  /  **value** - description
 *
 * Returns null if the list item doesn't match any known pattern.
 */
export function parseListItemHead(listItem) {
  const para = (listItem.children ?? []).find(c => c.type === 'paragraph');
  if (!para) return null;

  const ch = para.children ?? [];
  if (ch.length === 0) return null;

  const first = ch[0];

  // Config-var pattern: starts with **name**
  if (first.type === 'strong') {
    const name = getText(first);
    if (!name) return null;

    // Rebuild everything after the strong node as markdown
    const rest = ch.slice(1).map(toMarkdown).join('');

    // Match: ( optionality, type ): description
    // or:    ( optionality ): description
    // or:    : description
    const typeMatch = rest.match(/^\s*\(([^)]*)\):\s*([\s\S]*)/);
    if (typeMatch) {
      return { kind: 'prop', name, types: typeMatch[1].trim(), description: typeMatch[2].trim() };
    }
    const simpleMatch = rest.match(/^:\s*([\s\S]*)/);
    if (simpleMatch) {
      return { kind: 'prop', name, types: null, description: simpleMatch[1].trim() };
    }
    // **name** with no colon — just the bold text, no description
    return { kind: 'prop', name, types: null, description: rest.trim() };
  }

  // Enum pattern: `value` - description  or  `value`: description  or  `value` (description)
  if (first.type === 'inlineCode') {
    const value = first.value ?? '';
    const rest = ch.slice(1).map(toMarkdown).join('');
    const descMatch = rest.match(/^\s*(?:-|:)\s*([\s\S]*)/);
    const parenMatch = rest.match(/^\s*\(([\s\S]*)\)/);
    const desc = descMatch?.[1]?.trim() ?? parenMatch?.[1]?.trim() ?? rest.trim();
    return { kind: 'enum', value, description: desc };
  }

  // Enum pattern: **value** - description
  if (first.type === 'strong' && ch.length > 1) {
    // handled above as prop — re-check: if text has " - " after the strong
    // (already handled above, this branch won't normally fire)
  }

  return null;
}
