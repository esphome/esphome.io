/**
 * ESPHome Documentation Content Migration Script
 *
 * Migrates content from Hugo format to Astro format:
 * - Transforms frontmatter structure
 * - Converts Hugo shortcodes to remark-directive syntax
 * - Copies content to appropriate Astro content collections
 * - Preserves directory structure for URL compatibility
 *
 * Usage: npx tsx scripts/migrate-content.ts
 */

import { glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

// Source and destination directories
const SOURCE_DIR = './content';
const DEST_DIR = './src/content';

// Collection mapping based on top-level directories
const COLLECTION_MAP: Record<string, string> = {
  components: 'components',
  guides: 'guides',
  cookbook: 'cookbook',
  automations: 'automations',
  changelog: 'changelog',
  projects: 'projects',
  'web-api': 'webapi',
};

// Statistics
const stats = {
  processed: 0,
  shortcodesConverted: 0,
  errors: [] as string[],
};

/**
 * Transform Hugo frontmatter to Astro format
 */
function transformFrontmatter(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  // Copy basic fields
  if (data.title) result.title = data.title;
  if (data.description) result.description = data.description;
  if (data.weight) result.weight = data.weight;
  if (data.draft) result.draft = data.draft;

  // Flatten params.seo to seo
  if (data.params && typeof data.params === 'object') {
    const params = data.params as Record<string, unknown>;
    if (params.seo) {
      result.seo = params.seo;
    }
  }

  return result;
}

/**
 * Convert Hugo shortcodes to remark-directive syntax
 */
function convertShortcodes(content: string): string {
  let result = content;
  let conversions = 0;

  // {{< anchor "id" >}} -> ::anchor{#id}
  result = result.replace(/\{\{<\s*anchor\s+"([^"]+)"\s*>\}\}/g, (_, id) => {
    conversions++;
    return `::anchor{#${id}}`;
  });

  // {{< pr number="123" >}} or {{< pr number="123" repo="esphome" >}} -> ::pr{#123}
  result = result.replace(
    /\{\{<\s*pr\s+(?:number="(\d+)")?(?:\s+repo="([^"]+)")?\s*>\}\}/g,
    (_, number, repo) => {
      conversions++;
      if (repo && repo !== 'esphome') {
        return `::pr{#${number} repo="${repo}"}`;
      }
      return `::pr{#${number}}`;
    }
  );

  // {{< ghuser name="user" >}} -> ::ghuser{name="user"}
  result = result.replace(/\{\{<\s*ghuser\s+name="([^"]+)"\s*>\}\}/g, (_, name) => {
    conversions++;
    return `::ghuser{name="${name}"}`;
  });

  // {{< apiref "text" "path" >}} -> ::apiref{text="text" path="path"}
  result = result.replace(
    /\{\{<\s*apiref\s+"([^"]+)"\s+"([^"]+)"\s*>\}\}/g,
    (_, text, apiPath) => {
      conversions++;
      return `::apiref{text="${text}" path="${apiPath}"}`;
    }
  );

  // {{< img src="..." alt="..." caption="..." >}} -> ::img{src="..." alt="..." caption="..."}
  result = result.replace(/\{\{<\s*img\s+([^>]+)>\}\}/g, (_, attrs) => {
    conversions++;
    // Parse attributes
    const attrMap: Record<string, string> = {};
    const attrRegex = /(\w+)="([^"]+)"/g;
    let match;
    while ((match = attrRegex.exec(attrs)) !== null) {
      attrMap[match[1]] = match[2];
    }

    const parts = Object.entries(attrMap)
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ');
    return `::img{${parts}}`;
  });

  // {{< break >}} -> ::break{}
  result = result.replace(/\{\{<\s*break\s*>\}\}/g, () => {
    conversions++;
    return '::break{}';
  });

  // {{< collapse >}}...{{< /collapse >}} -> :::collapse\n...\n:::
  result = result.replace(
    /\{\{<\s*collapse(?:\s+"([^"]*)")?\s*>\}\}([\s\S]*?)\{\{<\s*\/collapse\s*>\}\}/g,
    (_, open, inner) => {
      conversions++;
      const openAttr = open === 'False' ? '' : ' open';
      return `:::collapse${openAttr}\n${inner.trim()}\n:::`;
    }
  );

  // {{< imgtable >}}...{{< /imgtable >}} -> :::imgtable\n...\n:::
  result = result.replace(
    /\{\{<\s*imgtable\s*>\}\}([\s\S]*?)\{\{<\s*\/imgtable\s*>\}\}/g,
    (_, inner) => {
      conversions++;
      return `:::imgtable\n${inner.trim()}\n:::`;
    }
  );

  // {{< feature-grid >}}...{{< /feature-grid >}} -> :::feature-grid\n...\n:::
  result = result.replace(
    /\{\{<\s*feature-grid\s*>\}\}([\s\S]*?)\{\{<\s*\/feature-grid\s*>\}\}/g,
    (_, inner) => {
      conversions++;
      return `:::feature-grid\n${inner.trim()}\n:::`;
    }
  );

  // {{< getting-started-grid >}}...{{< /getting-started-grid >}} -> :::getting-started-grid\n...\n:::
  result = result.replace(
    /\{\{<\s*getting-started-grid\s*>\}\}([\s\S]*?)\{\{<\s*\/getting-started-grid\s*>\}\}/g,
    (_, inner) => {
      conversions++;
      return `:::getting-started-grid\n${inner.trim()}\n:::`;
    }
  );

  // {{< changelogs >}} -> :::changelogs\n:::
  result = result.replace(/\{\{<\s*changelogs\s*>\}\}/g, () => {
    conversions++;
    return ':::changelogs\n:::';
  });

  // {{< render-automations >}} -> :::render-automations\n:::
  result = result.replace(/\{\{<\s*render-automations\s*>\}\}/g, () => {
    conversions++;
    return ':::render-automations\n:::';
  });

  // {{< option "name" >}} -> Start of option block (special handling)
  result = result.replace(/\{\{<\s*option\s+"([^"]+)"\s*>\}\}/g, (_, name) => {
    conversions++;
    return `:::option{name="${name}"}`;
  });

  // Handle option closing if present
  result = result.replace(/\{\{<\s*\/option\s*>\}\}/g, () => {
    return ':::';
  });

  // {{< docref "path" "text" >}} -> [text](path)
  // docref is essentially a smart link, convert to standard markdown
  result = result.replace(
    /\{\{<\s*docref\s+"([^"]+)"(?:\s+"([^"]+)")?\s*>\}\}/g,
    (_, docPath, text) => {
      conversions++;
      const linkText = text || docPath.split('/').pop() || 'Link';
      return `[${linkText}](${docPath})`;
    }
  );

  // {{< include "path" >}} -> We'll handle includes differently in Astro
  // For now, leave a comment marker
  result = result.replace(/\{\{<\s*include\s+"([^"]+)"\s*>\}\}/g, (match, includePath) => {
    conversions++;
    return `<!-- TODO: Include ${includePath} -->`;
  });

  // {{< math >}}...{{< /math >}} -> $$...$$
  result = result.replace(
    /\{\{<\s*math\s*>\}\}([\s\S]*?)\{\{<\s*\/math\s*>\}\}/g,
    (_, inner) => {
      conversions++;
      return `$$${inner.trim()}$$`;
    }
  );

  stats.shortcodesConverted += conversions;
  return result;
}

/**
 * Determine the collection for a file based on its path
 */
function getCollection(filePath: string): string | null {
  const relativePath = path.relative(SOURCE_DIR, filePath);
  const topDir = relativePath.split(path.sep)[0];
  return COLLECTION_MAP[topDir] || null;
}

/**
 * Get the destination path for a file
 */
function getDestPath(filePath: string, collection: string): string {
  const relativePath = path.relative(SOURCE_DIR, filePath);
  const parts = relativePath.split(path.sep);

  // Skip the first part (it's the collection directory)
  const restPath = parts.slice(1).join(path.sep);

  // Handle _index.md files - rename to index.md for Astro
  const finalPath = restPath.replace(/_index\.md$/, 'index.md');

  return path.join(DEST_DIR, collection, finalPath);
}

/**
 * Process a single markdown file
 */
async function processFile(filePath: string): Promise<void> {
  try {
    const collection = getCollection(filePath);
    if (!collection) {
      // Root-level file like _index.md - skip for now or handle specially
      console.log(`Skipping root file: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const { data, content: body } = matter(content);

    // Transform frontmatter
    const newFrontmatter = transformFrontmatter(data);

    // Convert shortcodes
    const newBody = convertShortcodes(body);

    // Reconstruct the file
    const newContent = matter.stringify(newBody, newFrontmatter);

    // Determine destination path
    const destPath = getDestPath(filePath, collection);

    // Ensure directory exists
    const destDir = path.dirname(destPath);
    fs.mkdirSync(destDir, { recursive: true });

    // Write the file
    fs.writeFileSync(destPath, newContent);

    stats.processed++;
    console.log(`✓ ${filePath} -> ${destPath}`);
  } catch (error) {
    const errorMessage = `Error processing ${filePath}: ${error}`;
    stats.errors.push(errorMessage);
    console.error(`✗ ${errorMessage}`);
  }
}

/**
 * Copy image directories
 */
async function copyImages(): Promise<void> {
  console.log('\nCopying image directories...');

  const imageDirs = await glob(`${SOURCE_DIR}/**/images`, { nodir: false });

  for (const imageDir of imageDirs) {
    const relativePath = path.relative(SOURCE_DIR, imageDir);
    const parts = relativePath.split(path.sep);
    const topDir = parts[0];
    const collection = COLLECTION_MAP[topDir];

    if (!collection) continue;

    const restPath = parts.slice(1).join(path.sep);
    const destPath = path.join(DEST_DIR, collection, restPath);

    // Copy directory recursively
    if (fs.existsSync(imageDir)) {
      fs.mkdirSync(destPath, { recursive: true });
      const files = fs.readdirSync(imageDir);
      for (const file of files) {
        const srcFile = path.join(imageDir, file);
        const destFile = path.join(destPath, file);
        if (fs.statSync(srcFile).isFile()) {
          fs.copyFileSync(srcFile, destFile);
        }
      }
      console.log(`✓ Copied images: ${imageDir} -> ${destPath}`);
    }
  }
}

/**
 * Handle the root _index.md specially (homepage)
 */
async function processHomepage(): Promise<void> {
  const homePath = path.join(SOURCE_DIR, '_index.md');
  if (!fs.existsSync(homePath)) return;

  console.log('\nProcessing homepage...');

  const content = fs.readFileSync(homePath, 'utf-8');
  const { data, content: body } = matter(content);

  // Transform frontmatter
  const newFrontmatter = transformFrontmatter(data);

  // Convert shortcodes
  const newBody = convertShortcodes(body);

  // Reconstruct the file
  const newContent = matter.stringify(newBody, newFrontmatter);

  // Write to a special location that the homepage route will use
  const destPath = path.join(DEST_DIR, 'home.md');
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, newContent);

  console.log(`✓ Homepage: ${homePath} -> ${destPath}`);
}

/**
 * Main migration function
 */
async function migrate(): Promise<void> {
  console.log('ESPHome Documentation Migration');
  console.log('================================\n');
  console.log(`Source: ${SOURCE_DIR}`);
  console.log(`Destination: ${DEST_DIR}\n`);

  // Ensure destination directories exist
  for (const collection of Object.values(COLLECTION_MAP)) {
    fs.mkdirSync(path.join(DEST_DIR, collection), { recursive: true });
  }

  // Find all markdown files
  const files = await glob(`${SOURCE_DIR}/**/*.md`);
  console.log(`Found ${files.length} markdown files\n`);

  // Process homepage first
  await processHomepage();

  // Process all files
  console.log('\nProcessing content files...');
  for (const file of files) {
    // Skip the root _index.md (already handled)
    if (file === path.join(SOURCE_DIR, '_index.md')) continue;
    await processFile(file);
  }

  // Copy images
  await copyImages();

  // Print summary
  console.log('\n================================');
  console.log('Migration Summary');
  console.log('================================');
  console.log(`Files processed: ${stats.processed}`);
  console.log(`Shortcodes converted: ${stats.shortcodesConverted}`);

  if (stats.errors.length > 0) {
    console.log(`\nErrors (${stats.errors.length}):`);
    stats.errors.forEach((err) => console.log(`  - ${err}`));
  }

  console.log('\nMigration complete!');
}

// Run migration
migrate().catch(console.error);
