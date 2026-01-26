#!/usr/bin/env tsx
/**
 * Fetch Automations Data Script
 *
 * Fetches automations data from data.esphome.io and processes it
 * for use with the RenderAutomations component.
 *
 * Usage:
 *   npx tsx scripts/fetch-automations.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Data sources
const DATA_SOURCES = {
  current: 'https://data.esphome.io/release/automations.json',
  beta: 'https://data.esphome.io/beta/automations.json',
  next: 'https://data.esphome.io/dev/automations.json',
};

// Output directory
const OUTPUT_DIR = 'src/data/automations';

/**
 * Collate automations data by category and domain
 *
 * This replicates the functionality of the collate_automations.sh script
 * The input data has format: { automations: { actions: ["domain.action", ...], conditions: [...] } }
 */
function collateAutomations(data: any): any {
  const result: Record<string, Record<string, string[]>> = {
    actions: {},
    conditions: {},
    triggers: {},
  };

  const automations = data.automations || data;

  // Process actions (array of strings like "sensor.set_value")
  if (automations.actions && Array.isArray(automations.actions)) {
    for (const actionKey of automations.actions) {
      const parts = actionKey.split('.');
      const domain = parts.length > 1 ? capitalizeFirst(parts[0]) : 'Core';
      const actionName = parts.length > 1 ? parts.slice(1).join('.') : actionKey;

      if (!result.actions[domain]) {
        result.actions[domain] = [];
      }
      result.actions[domain].push(actionName);
    }
  }

  // Process conditions (array of strings like "binary_sensor.is_on")
  if (automations.conditions && Array.isArray(automations.conditions)) {
    for (const conditionKey of automations.conditions) {
      const parts = conditionKey.split('.');
      const domain = parts.length > 1 ? capitalizeFirst(parts[0]) : 'Core';
      const conditionName = parts.length > 1 ? parts.slice(1).join('.') : conditionKey;

      if (!result.conditions[domain]) {
        result.conditions[domain] = [];
      }
      result.conditions[domain].push(conditionName);
    }
  }

  // Process triggers if present (same format)
  if (automations.triggers && Array.isArray(automations.triggers)) {
    for (const triggerKey of automations.triggers) {
      const parts = triggerKey.split('.');
      const domain = parts.length > 1 ? capitalizeFirst(parts[0]) : 'Core';
      const triggerName = parts.length > 1 ? parts.slice(1).join('.') : triggerKey;

      if (!result.triggers[domain]) {
        result.triggers[domain] = [];
      }
      result.triggers[domain].push(triggerName);
    }
  }

  // Sort domains alphabetically and entries within each domain
  for (const category of Object.keys(result)) {
    const sorted: Record<string, string[]> = {};
    const domains = Object.keys(result[category]).sort();
    for (const domain of domains) {
      sorted[domain] = result[category][domain].sort();
    }
    result[category] = sorted;
  }

  return { automations: result };
}

/**
 * Capitalize first letter of a string
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Fetch data from a URL
 */
async function fetchData(url: string): Promise<any> {
  console.log(`Fetching: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log('Fetching automations data...\n');

  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Fetch and process each data source
  for (const [branch, url] of Object.entries(DATA_SOURCES)) {
    try {
      const rawData = await fetchData(url);
      const collatedData = collateAutomations(rawData);

      const outputPath = path.join(OUTPUT_DIR, `${branch}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(collatedData, null, 2), 'utf-8');
      console.log(`  Wrote: ${outputPath}`);

      // Log some stats
      const actionCount = Object.values(collatedData.automations.actions as Record<string, string[]>)
        .reduce((sum, arr) => sum + arr.length, 0);
      const conditionCount = Object.values(collatedData.automations.conditions as Record<string, string[]>)
        .reduce((sum, arr) => sum + arr.length, 0);
      const triggerCount = Object.values(collatedData.automations.triggers as Record<string, string[]>)
        .reduce((sum, arr) => sum + arr.length, 0);
      console.log(`    Actions: ${actionCount}, Conditions: ${conditionCount}, Triggers: ${triggerCount}\n`);
    } catch (error) {
      console.error(`  Error fetching ${branch} data:`, error);
    }
  }

  console.log('Done!');
}

// Run
main().catch(console.error);
