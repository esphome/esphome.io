#!/usr/bin/env node
/**
 * One-time verification: Compare migrated Starlight site against live esphome.io
 *
 * Usage:
 *   npm run build  # Build site first
 *   node script/verify_migration.mjs
 */

import { readdir, readFile } from 'fs/promises';
import { join, relative } from 'path';
import { JSDOM } from 'jsdom';

const LIVE_SITE = 'https://esphome.io';
const DIST_DIR = 'dist';
const CONCURRENCY = 10;

/**
 * Convert local dist path to live site URL
 * Starlight: /components/sensor/dht/index.html
 * Hugo:      /components/sensor/dht.html
 *
 * Special handling for changelog URLs where Starlight removes dots:
 * Starlight: /changelog/2021100/index.html -> Hugo: /changelog/2021.10.0.html
 */
function localToLiveUrl(localPath) {
  let path = localPath;

  if (path.endsWith('/index.html')) {
    path = path.slice(0, -11) + '.html';
  } else if (path === 'index.html') {
    path = '/';
  }

  if (path === '.html') {
    path = '/';
  }

  // Handle changelog URLs - restore dots in version numbers
  // Starlight removes dots: 2021.10.0 -> 2021100, 2023.2.0 -> 202320
  if (path.startsWith('changelog/')) {
    // Year-based versions (2021.x.0, 2022.x.0, etc.)
    // 7 chars = double digit month: 2021100 -> 2021.10.0
    // 6 chars = single digit month: 202180 -> 2021.8.0
    path = path.replace(/changelog\/(\d{4})(\d{1,2})0\.html$/, (match, year, month) => {
      return `changelog/${year}.${month}.0.html`;
    });

    // v1.x.0 versions
    // v1100 -> v1.10.0, v170 -> v1.7.0
    path = path.replace(/changelog\/v1(\d{1,2})0\.html$/, (match, minor) => {
      return `changelog/v1.${minor}.0.html`;
    });
  }

  return new URL(path, LIVE_SITE).href;
}

/**
 * Extract comparable content from HTML
 */
function extractContent(html) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // Title
  let title = doc.querySelector('title')?.textContent?.trim() || '';
  title = title.replace(/\s*[|—-]\s*ESPHome.*$/, '');

  // Main content
  const main = doc.querySelector('article') ||
               doc.querySelector('main') ||
               doc.querySelector('.content') ||
               doc.querySelector('.document');

  let contentText = '';
  if (main) {
    // Remove non-content elements
    main.querySelectorAll('nav, aside, footer, script, style').forEach(el => el.remove());
    contentText = main.textContent?.replace(/\s+/g, ' ').trim() || '';
  }

  // Headings
  const headings = new Set();
  doc.querySelectorAll('h1, h2, h3').forEach(h => {
    let text = h.textContent?.trim() || '';
    text = text.replace(/[¶#]$/, '').trim().toLowerCase();
    if (text) headings.add(text);
  });

  return { title, content: contentText, headings };
}

/**
 * Calculate word-based Jaccard similarity
 */
function wordSimilarity(s1, s2) {
  const words1 = new Set(s1.toLowerCase().match(/\w+/g) || []);
  const words2 = new Set(s2.toLowerCase().match(/\w+/g) || []);

  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Recursively get all HTML files
 */
async function* getHtmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* getHtmlFiles(fullPath);
    } else if (entry.name.endsWith('.html')) {
      yield fullPath;
    }
  }
}

/**
 * Check a single page
 */
async function checkPage(localFile) {
  const relPath = relative(DIST_DIR, localFile);
  const liveUrl = localToLiveUrl(relPath);

  const result = {
    local: relPath,
    liveUrl,
    status: 'ok',
    issues: [],
    similarity: 1.0,
  };

  // Skip non-doc pages
  const skipPatterns = ['404', 'pagefind', 'sitemap', '_astro'];
  if (skipPatterns.some(p => relPath.includes(p))) {
    result.status = 'skipped';
    return result;
  }

  // Read local file
  let localHtml, localData;
  try {
    localHtml = await readFile(localFile, 'utf-8');
    localData = extractContent(localHtml);
  } catch (e) {
    result.status = 'error';
    result.issues.push(`Failed to read local: ${e.message}`);
    return result;
  }

  // Fetch live page
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const resp = await fetch(liveUrl, {
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timeout);

    if (resp.status === 404) {
      result.status = 'new_page';
      return result;
    }

    if (!resp.ok) {
      result.status = 'error';
      result.issues.push(`HTTP ${resp.status}`);
      return result;
    }

    const liveHtml = await resp.text();
    const liveData = extractContent(liveHtml);

    // Compare content
    const similarity = wordSimilarity(localData.content, liveData.content);
    result.similarity = similarity;

    if (similarity < 0.5) {
      result.status = 'content_diff';
      result.issues.push(`Low similarity: ${Math.round(similarity * 100)}%`);
    } else if (similarity < 0.7) {
      result.status = 'content_diff';
      result.issues.push(`Moderate diff: ${Math.round(similarity * 100)}%`);
    }

  } catch (e) {
    result.status = 'error';
    if (e.name === 'AbortError') {
      result.issues.push('Timeout');
    } else {
      result.issues.push(`Failed to fetch: ${e.message}`);
    }
  }

  return result;
}

/**
 * Process items with limited concurrency
 */
async function processWithConcurrency(items, fn, limit) {
  const results = [];
  const executing = new Set();

  for (const item of items) {
    const promise = fn(item).then(result => {
      executing.delete(promise);
      return result;
    });
    executing.add(promise);
    results.push(promise);

    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

async function main() {
  // Collect all HTML files
  const htmlFiles = [];
  for await (const file of getHtmlFiles(DIST_DIR)) {
    htmlFiles.push(file);
  }

  console.log(`Found ${htmlFiles.length} HTML files to verify\n`);

  const results = {
    ok: [],
    new_page: [],
    content_diff: [],
    error: [],
    skipped: [],
  };

  const statusChars = {
    ok: '.',
    new_page: '+',
    content_diff: '!',
    error: 'x',
    skipped: '-',
  };

  let count = 0;
  const allResults = await processWithConcurrency(
    htmlFiles,
    async (file) => {
      const result = await checkPage(file);
      count++;
      process.stdout.write(statusChars[result.status]);
      if (count % 80 === 0) {
        process.stdout.write(` [${count}/${htmlFiles.length}]\n`);
      }
      return result;
    },
    CONCURRENCY
  );

  // Categorize results
  for (const result of allResults) {
    results[result.status].push(result);
  }

  console.log(`\n\n${'='.repeat(50)}`);
  console.log('RESULTS');
  console.log('='.repeat(50));
  console.log(`  OK (match):        ${results.ok.length.toString().padStart(4)}`);
  console.log(`  New pages:         ${results.new_page.length.toString().padStart(4)}`);
  console.log(`  Content diff:      ${results.content_diff.length.toString().padStart(4)}`);
  console.log(`  Errors:            ${results.error.length.toString().padStart(4)}`);
  console.log(`  Skipped:           ${results.skipped.length.toString().padStart(4)}`);
  console.log('='.repeat(50));

  const totalCompared = results.ok.length + results.content_diff.length;
  if (totalCompared > 0) {
    const matchRate = (results.ok.length / totalCompared * 100).toFixed(1);
    console.log(`\nMatch rate: ${matchRate}%`);
  }

  // Show content differences
  if (results.content_diff.length > 0) {
    console.log(`\n--- Pages with content differences (${results.content_diff.length}) ---`);
    const sorted = results.content_diff.sort((a, b) => a.similarity - b.similarity);
    for (const r of sorted.slice(0, 30)) {
      console.log(`  ${Math.round(r.similarity * 100).toString().padStart(3)}%  ${r.local}`);
      for (const issue of r.issues) {
        console.log(`         ${issue}`);
      }
    }
  }

  // Show errors
  if (results.error.length > 0) {
    console.log(`\n--- Errors (${results.error.length}) ---`);
    for (const r of results.error.slice(0, 20)) {
      console.log(`  ${r.local}: ${r.issues.join(', ')}`);
    }
  }

  // Show new pages
  if (results.new_page.length > 0) {
    console.log(`\n--- New pages not on live site (${results.new_page.length}) ---`);
    for (const r of results.new_page.slice(0, 20)) {
      console.log(`  ${r.local}`);
    }
    if (results.new_page.length > 20) {
      console.log(`  ... and ${results.new_page.length - 20} more`);
    }
  }

  // Exit code
  if (totalCompared > 0 && results.ok.length / totalCompared >= 0.9) {
    console.log('\n✓ Verification PASSED');
    process.exit(0);
  } else {
    console.log('\n✗ Verification needs review');
    process.exit(1);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
