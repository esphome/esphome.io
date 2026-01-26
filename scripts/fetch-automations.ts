/**
 * Fetch Automations Data Script
 *
 * Fetches automation data from ESPHome repository and generates
 * a data file for use in documentation.
 *
 * This is similar to the Hugo data fetching but outputs JSON
 * that can be imported in Astro pages.
 *
 * Usage: npx tsx scripts/fetch-automations.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Output directory for data files
const DATA_DIR = './src/data';

// GitHub raw content URLs
const ESPHOME_RAW_BASE = 'https://raw.githubusercontent.com/esphome/esphome/dev';

interface AutomationItem {
  name: string;
  description?: string;
  component?: string;
  docs?: string;
}

interface ComponentData {
  actions?: AutomationItem[];
  conditions?: AutomationItem[];
  triggers?: AutomationItem[];
}

/**
 * Fetch JSON data from a URL
 */
async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }
    return (await response.json()) as T;
  } catch (error) {
    console.warn(`Error fetching ${url}:`, error);
    return null;
  }
}

/**
 * Fetch automation data from ESPHome repository
 */
async function fetchAutomations(): Promise<void> {
  console.log('Fetching automation data from ESPHome repository...\n');

  // This would typically fetch from a generated manifest or known locations
  // For now, we'll create a placeholder structure

  const automations = {
    actions: [] as AutomationItem[],
    conditions: [] as AutomationItem[],
    triggers: [] as AutomationItem[],
    fetchedAt: new Date().toISOString(),
  };

  // Example: fetch component manifest if available
  // const manifest = await fetchJson<ComponentData>(`${ESPHOME_RAW_BASE}/esphome/components/manifest.json`);

  // For now, create sample data structure
  // In a real implementation, this would parse ESPHome source or fetch from an API

  console.log('Note: Automation data fetching is a placeholder.');
  console.log('In production, this would fetch from ESPHome repository.\n');

  // Ensure data directory exists
  fs.mkdirSync(DATA_DIR, { recursive: true });

  // Write automations data
  const outputPath = path.join(DATA_DIR, 'automations.json');
  fs.writeFileSync(outputPath, JSON.stringify(automations, null, 2));
  console.log(`✓ Wrote automations data to ${outputPath}`);
}

/**
 * Fetch version data
 */
async function fetchVersion(): Promise<void> {
  console.log('\nFetching version data...\n');

  // Try to read from existing data/version.yaml or create default
  const versionData = {
    version: '2026.1.2',
    release: '2026.1.2',
    fetchedAt: new Date().toISOString(),
  };

  // Check if Hugo data file exists
  const hugoVersionPath = './data/version.yaml';
  if (fs.existsSync(hugoVersionPath)) {
    try {
      const content = fs.readFileSync(hugoVersionPath, 'utf-8');
      // Simple YAML parsing for version data
      const versionMatch = content.match(/version:\s*["']?([^"'\n]+)["']?/);
      const releaseMatch = content.match(/release:\s*["']?([^"'\n]+)["']?/);

      if (versionMatch) versionData.version = versionMatch[1].trim();
      if (releaseMatch) versionData.release = releaseMatch[1].trim();

      console.log(`Found existing version data: ${versionData.version}`);
    } catch (e) {
      console.warn('Could not parse Hugo version data:', e);
    }
  }

  // Ensure data directory exists
  fs.mkdirSync(DATA_DIR, { recursive: true });

  // Write version data
  const outputPath = path.join(DATA_DIR, 'version.json');
  fs.writeFileSync(outputPath, JSON.stringify(versionData, null, 2));
  console.log(`✓ Wrote version data to ${outputPath}`);
}

/**
 * Fetch changelog entries
 */
async function fetchChangelogs(): Promise<void> {
  console.log('\nScanning changelog entries...\n');

  const changelogDir = './content/changelog';
  const changelogs: Array<{
    version: string;
    date?: string;
    path: string;
  }> = [];

  if (fs.existsSync(changelogDir)) {
    const files = fs.readdirSync(changelogDir);

    for (const file of files) {
      if (file.endsWith('.md') && file !== '_index.md') {
        // Extract version from filename (e.g., "2024.1.0.md" -> "2024.1.0")
        const version = file.replace('.md', '');
        changelogs.push({
          version,
          path: `/changelog/${version}/`,
        });
      }
    }

    // Sort by version (reverse chronological)
    changelogs.sort((a, b) => {
      // Compare version strings
      const aParts = a.version.split('.').map((p) => parseInt(p) || 0);
      const bParts = b.version.split('.').map((p) => parseInt(p) || 0);

      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aVal = aParts[i] || 0;
        const bVal = bParts[i] || 0;
        if (aVal !== bVal) return bVal - aVal;
      }
      return 0;
    });

    console.log(`Found ${changelogs.length} changelog entries`);
  } else {
    console.log('No changelog directory found');
  }

  // Ensure data directory exists
  fs.mkdirSync(DATA_DIR, { recursive: true });

  // Write changelog data
  const outputPath = path.join(DATA_DIR, 'changelogs.json');
  fs.writeFileSync(outputPath, JSON.stringify(changelogs, null, 2));
  console.log(`✓ Wrote changelog data to ${outputPath}`);
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log('ESPHome Data Fetching');
  console.log('=====================\n');

  await fetchAutomations();
  await fetchVersion();
  await fetchChangelogs();

  console.log('\n=====================');
  console.log('Data fetching complete!');
}

// Run main
main().catch(console.error);
