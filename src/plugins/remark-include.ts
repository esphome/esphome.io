/**
 * Remark plugin to transform Hugo include shortcodes.
 *
 * Transforms:
 *   {{< include "file.md" >}}
 *
 * Note: In Astro/MDX, file includes are typically handled differently.
 * This plugin transforms the shortcode into a comment noting that
 * the content migration script should inline the content during migration.
 *
 * For runtime includes, consider using MDX imports instead.
 */

import { visit } from 'unist-util-visit';
import type { Root, Text, Html, Paragraph } from 'mdast';
import * as fs from 'fs';
import * as path from 'path';

// Regex to match include shortcodes
const INCLUDE_REGEX = /\{\{<\s*include\s+["']([^"']+)["']\s*>\}\}/g;

interface IncludeOptions {
  /**
   * Base directory for resolving include paths.
   * Defaults to process.cwd() + '/src/content/docs'
   */
  basePath?: string;
  /**
   * If true, will attempt to inline the content at build time.
   * If false, will leave a placeholder comment.
   */
  inline?: boolean;
}

export default function remarkInclude(options: IncludeOptions = {}) {
  const { basePath = process.cwd() + '/src/content/docs', inline = false } = options;

  return (tree: Root, file: any) => {
    visit(tree, ['text', 'html'], (node, index, parent) => {
      if (!parent || index === undefined) return;

      const content = (node as Text | Html).value;
      const matches = [...content.matchAll(INCLUDE_REGEX)];

      if (matches.length === 0) return;

      const newNodes: (Text | Html | Paragraph)[] = [];
      let lastIndex = 0;

      for (const match of matches) {
        const [fullMatch, includePath] = match;
        const matchIndex = match.index!;

        // Add text before the match
        if (matchIndex > lastIndex) {
          newNodes.push({
            type: 'text',
            value: content.slice(lastIndex, matchIndex),
          });
        }

        if (inline) {
          // Attempt to read and inline the file content
          try {
            // Resolve the include path relative to the current file or basePath
            let resolvedPath: string;

            if (includePath.startsWith('/')) {
              resolvedPath = path.join(basePath, includePath);
            } else if (file?.path) {
              // Relative to current file
              const fileDir = path.dirname(file.path);
              resolvedPath = path.join(fileDir, includePath);
            } else {
              resolvedPath = path.join(basePath, includePath);
            }

            // Normalize the path and add .md extension if not present
            let filePath = resolvedPath;
            if (!filePath.endsWith('.md') && !filePath.endsWith('.mdx')) {
              filePath = filePath + '.md';
            }

            if (fs.existsSync(filePath)) {
              const fileContent = fs.readFileSync(filePath, 'utf-8');
              // Remove frontmatter if present
              const contentWithoutFrontmatter = fileContent.replace(/^---[\s\S]*?---\n*/m, '');

              newNodes.push({
                type: 'html',
                value: `\n\n${contentWithoutFrontmatter}\n\n`,
              });
            } else {
              // File not found, add a warning comment
              newNodes.push({
                type: 'html',
                value: `<!-- INCLUDE NOT FOUND: ${includePath} -->`,
              });
              console.warn(`[remark-include] File not found: ${filePath}`);
            }
          } catch (error) {
            // Error reading file, add a comment
            newNodes.push({
              type: 'html',
              value: `<!-- INCLUDE ERROR: ${includePath} - ${error} -->`,
            });
            console.error(`[remark-include] Error including file ${includePath}:`, error);
          }
        } else {
          // Leave a placeholder comment for manual handling
          newNodes.push({
            type: 'html',
            value: `{/* TODO: Include content from "${includePath}" */}`,
          });
        }

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
