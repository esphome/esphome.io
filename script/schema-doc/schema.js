/**
 * Schema I/O and property lookup utilities.
 *
 * Schemas are JSON files in a directory, loaded on demand and cached.
 * The "esphome.json" file contains the master component/platform registry
 * under esphome_json.core.{components, platforms}.
 */

import fs from "node:fs";
import path from "node:path";

let schemaDir = "";

/** name → parsed JSON object */
const cache = new Map();

export function initSchema(dir) {
  schemaDir = dir;
}

/**
 * Load a schema by component name. Returns the parsed JSON or null.
 * Special case: "core" → "esphome".
 */
export function loadSchema(name) {
  if (name === "core") name = "esphome";
  if (cache.has(name)) return cache.get(name);

  const file = path.join(schemaDir, name + ".json");
  if (!fs.existsSync(file)) {
    return null;
  }
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch (e) {
    console.error(`Error reading ${file}: ${e.message}`);
    return null;
  }
  cache.set(name, data);
  return data;
}

/** Save all modified schemas back to disk. */
export function saveAllSchemas() {
  for (const [name, data] of cache) {
    const file = path.join(schemaDir, name + ".json");
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
  }
}

/**
 * Check if a schema file exists (without loading it).
 */
export function schemaExists(name) {
  if (name === "core") name = "esphome";
  const file = path.join(schemaDir, name + ".json");
  return fs.existsSync(file);
}

/**
 * Recursively search for a config var by name inside a schema object.
 *
 * A "schema object" is the inner object with {config_vars, extends}.
 * Mirrors Python's find_schema_prop().
 */
export function findSchemaProp(schema, propName) {
  if (!schema) return null;

  // Direct match in config_vars
  if (schema.config_vars) {
    const prop = schema.config_vars[propName];
    if (prop != null) return prop;
  }

  // Search through extends
  for (const extended of schema.extends ?? []) {
    const parts = extended.split(".");
    const extJson = loadSchema(parts[0]);
    if (!extJson) continue;

    let extNode;
    if (parts.length === 3) {
      // e.g. "sensor.adc.CONFIG_SCHEMA" → extJson["sensor.adc"]["schemas"]["CONFIG_SCHEMA"]
      extNode = extJson[`${parts[0]}.${parts[1]}`]?.schemas?.[parts[2]];
    } else {
      // e.g. "sensor._SENSOR_SCHEMA" → extJson["sensor"]["schemas"]["_SENSOR_SCHEMA"]
      extNode = extJson[parts[0]]?.schemas?.[parts[1]];
    }

    if (!extNode) continue;

    // Recurse into the extended schema
    if (extNode.type === "schema" && extNode.schema) {
      const found = findSchemaProp(extNode.schema, propName);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Get the CONFIG_SCHEMA for a component.
 * Returns the inner schema object (with config_vars / extends), not the wrapper.
 */
export function getComponentSchema(componentName) {
  const json = loadSchema(componentName);
  if (!json) return null;
  return json[componentName]?.schemas?.CONFIG_SCHEMA?.schema ?? null;
}

/**
 * Get the CONFIG_SCHEMA for a platform component (e.g. adc sensor).
 * componentName = "adc", platformName = "sensor"
 * → adc.json["adc.sensor"]["schemas"]["CONFIG_SCHEMA"].schema
 */
export function getPlatformComponentSchema(componentName, platformName) {
  const json = loadSchema(componentName);
  if (!json) return null;
  const key = `${componentName}.${platformName}`;
  return json[key]?.schemas?.CONFIG_SCHEMA?.schema ?? null;
}

/**
 * Get the PLATFORM_SCHEMA for a platform (e.g. the sensor SENSOR_SCHEMA).
 * Used when the doc file is the platform index (e.g. sensor/index.mdx).
 */
export function getPlatformSchema(platformName) {
  const json = loadSchema(platformName);
  if (!json) return null;
  const upper = platformName.toUpperCase();
  return (
    json[platformName]?.schemas?.[`${upper}_SCHEMA`]?.schema ??
    json[platformName]?.schemas?.CONFIG_SCHEMA?.schema ??
    null
  );
}

/**
 * Return the action schema for a given component + action name.
 * e.g. component="api", actionName="respond" → api.json["api"]["action"]["respond"]
 */
export function getActionSchema(componentName, actionName) {
  const json = loadSchema(componentName);
  return json?.[componentName]?.action?.[actionName] ?? null;
}

/**
 * Return the condition schema for a given component + condition name.
 */
export function getConditionSchema(componentName, conditionName) {
  const json = loadSchema(componentName);
  return json?.[componentName]?.condition?.[conditionName] ?? null;
}

/**
 * Return the action schema for a platform component.
 * e.g. platform="sensor", component="adc", action="reset"
 * → adc.json["adc.sensor"]["action"]["reset"]
 */
export function getPlatformActionSchema(
  componentName,
  platformName,
  actionName,
) {
  const json = loadSchema(componentName);
  const key = `${componentName}.${platformName}`;
  return json?.[key]?.action?.[actionName] ?? null;
}
