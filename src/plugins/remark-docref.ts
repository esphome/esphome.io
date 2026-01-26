/**
 * Remark plugin to transform Hugo docref shortcodes to markdown links.
 *
 * Transforms:
 *   {{< docref "components/sensor/dht" >}}
 *   {{< docref "components/sensor/dht" "DHT Sensor Guide" >}}
 *   {{< docref "components/sensor/dht#configuration" >}}
 *
 * To markdown links with proper path resolution.
 */

import { visit } from 'unist-util-visit';
import type { Root, Text, Link, Html } from 'mdast';

// Regex to match docref shortcodes
const DOCREF_REGEX = /\{\{<\s*docref\s+["']([^"']+)["'](?:\s+["']([^"']+)["'])?(?:\s+(\w+))?\s*>\}\}/g;

export default function remarkDocref() {
  return (tree: Root) => {
    visit(tree, ['text', 'html'], (node, index, parent) => {
      if (!parent || index === undefined) return;

      const content = (node as Text | Html).value;
      const matches = [...content.matchAll(DOCREF_REGEX)];

      if (matches.length === 0) return;

      const newNodes: (Text | Link)[] = [];
      let lastIndex = 0;

      for (const match of matches) {
        const [fullMatch, pathWithAnchor, customText] = match;
        const matchIndex = match.index!;

        // Add text before the match
        if (matchIndex > lastIndex) {
          newNodes.push({
            type: 'text',
            value: content.slice(lastIndex, matchIndex),
          });
        }

        // Parse path and anchor
        let path = pathWithAnchor;
        let anchor = '';
        if (pathWithAnchor.includes('#')) {
          const parts = pathWithAnchor.split('#');
          path = parts[0];
          anchor = parts[1];
        }

        // Normalize path - ensure it starts with / and ends without extension
        let normalizedPath = path;
        if (!normalizedPath.startsWith('/')) {
          normalizedPath = '/' + normalizedPath;
        }
        // Remove .md or .html extensions if present
        normalizedPath = normalizedPath.replace(/\.(md|html)$/, '');
        // Remove trailing slash
        normalizedPath = normalizedPath.replace(/\/$/, '');
        // Remove index suffix
        normalizedPath = normalizedPath.replace(/\/index$/, '');

        // Add trailing slash for Starlight URLs
        const url = normalizedPath + '/' + (anchor ? '#' + anchor : '');

        // Determine link text
        const linkText = customText || path.split('/').pop() || path;

        // Create link node
        newNodes.push({
          type: 'link',
          url: url,
          children: [{ type: 'text', value: linkText }],
        });

        lastIndex = matchIndex + fullMatch.length;
      }

      // Add remaining text after last match
      if (lastIndex < content.length) {
        newNodes.push({
          type: 'text',
          value: content.slice(lastIndex),
        });
      }

      // Replace the node with new nodes
      if (newNodes.length > 0) {
        parent.children.splice(index, 1, ...newNodes);
      }
    });
  };
}
