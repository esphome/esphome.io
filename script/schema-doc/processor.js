/**
 * Per-file MDAST processor.
 *
 * Walks the flat list of top-level MDAST children, maintaining a state machine
 * that mirrors schema_doc.py's main loop. For each file it:
 *   1. Reads the component/platform context from filename + folder
 *   2. Extracts the leading description paragraph and stores it in the schema
 *   3. Walks headings to detect component, platform, action, condition sections
 *   4. For "Configuration variables" headings, processes the following list(s)
 *      as config-var entries and writes docs to schema properties
 */

import {
  isConfigVarsHeading,
  headingText,
  paragraphToMarkdown,
  parseListItemHead,
  slugify,
} from "./nodes.js";
import { loadSchema, findSchemaProp } from "./schema.js";
import { anchorToUrl, sourceToUrlPath } from "./anchors.js";

// ─── Stats ────────────────────────────────────────────────────────────────────

export const stats = {
  coreDocs: 0,
  corePlatformDocs: 0,
  platformDocs: 0,
  props: 0,
  enumDocs: 0,
  actionDocs: 0,
  conditionDocs: 0,
};

// ─── Options (set by index.js) ─────────────────────────────────────────────────

let deployUrl = "https://esphome.io";
let debugLevel = 0;

export function initProcessor(options) {
  deployUrl = options.deployUrl ?? "https://esphome.io";
  debugLevel = options.debugLevel ?? 0;
}

// ─── Link conversion ──────────────────────────────────────────────────────────

/**
 * Convert all local `[text](#anchor)` links in a markdown string to full URLs.
 */
function convertLinks(text) {
  if (!text) return text;
  return text.replace(/\[([^\]]*)\]\(#([^)]*)\)/g, (match, title, anchor) => {
    const url = anchorToUrl(anchor, deployUrl);
    if (!url) return match; // leave unresolved links as-is
    return `[${title}](${url})`;
  });
}

// ─── See-also state ───────────────────────────────────────────────────────────

function makeSeeAlso(sourceFile, title, slug) {
  const urlPath = sourceToUrlPath(sourceFile);
  const anchor = slug ? `#${slug}` : "";
  return `*See also: [${title}](${deployUrl}${urlPath}${anchor})*`;
}

// ─── Platform / component helpers ─────────────────────────────────────────────

let esphomeCore = null; // esphome.json["core"]

function getCore() {
  if (!esphomeCore) {
    const e = loadSchema("esphome");
    esphomeCore = e?.core ?? { components: {}, platforms: {} };
  }
  return esphomeCore;
}

/** Return platform name if `title` maps to a known platform, else null. */
function titleToPlatform(title, configComponent) {
  const core = getCore();
  let t = title.toLowerCase().replace(/`/g, "");
  // strip leading "componentName " prefix (e.g. "adc sensor" → "sensor")
  if (configComponent && t.startsWith(configComponent.toLowerCase() + " ")) {
    t = t.slice(configComponent.length + 1);
  }
  const name = t.replace(/\s+/g, "_");
  if (name in core.platforms) return name;
  return null;
}

/** Return true if the title signals a section break (new component/platform). */
function isBreakTitle(text) {
  const lower = text.toLowerCase();
  const last = lower.split(/\s+/).pop();
  if (titleToPlatform(lower, null)) return true;
  if (["action", "condition", "component"].includes(last)) return true;
  return false;
}

// ─── Config-var list processing ───────────────────────────────────────────────

/**
 * Process a MDAST list node as a config-vars list against `schema`.
 * `schema` is the inner schema object with {config_vars, extends}.
 */
function processConfigList(
  listNode,
  schema,
  sourceFile,
  docTitle,
  seeAlsoSlug,
  parentSchema,
) {
  if (!listNode || listNode.type !== "list") return;
  if (!schema) return;

  for (const item of listNode.children ?? []) {
    if (item.type !== "listItem") continue;

    const head = parseListItemHead(item);
    if (!head) continue;

    if (head.kind === "prop") {
      const matched = findSchemaProp(schema, head.name);
      if (!matched) {
        // Check parent schema (for sub-section headings returning to parent)
        if (parentSchema && findSchemaProp(parentSchema, head.name)) return;
        if (debugLevel > 4) {
          console.log(`  [skip] prop "${head.name}" not in schema`);
        }
        continue;
      }

      const rawDoc = buildPropDoc(head, sourceFile, docTitle, seeAlsoSlug);
      if (rawDoc) matched.docs = rawDoc;
      stats.props++;

      // Recurse into nested list if the matched prop has a sub-schema or enum values
      const nestedList = (item.children ?? []).find((c) => c.type === "list");
      if (nestedList) {
        const subSchema = getSubSchema(matched);
        if (subSchema) {
          processConfigList(
            nestedList,
            subSchema,
            sourceFile,
            docTitle,
            seeAlsoSlug,
            schema,
          );
        } else if (matched.type === "typed") {
          // Process the same nested list against all typed variants
          for (const typedName of Object.keys(matched.types ?? {})) {
            processConfigList(
              nestedList,
              matched.types[typedName],
              sourceFile,
              docTitle,
              seeAlsoSlug,
              schema,
            );
          }
        } else if (matched.type === "enum") {
          processEnumList(nestedList, matched);
        }
      }
    } else if (head.kind === "enum") {
      // Enum values are usually in the nested list of a schema-typed prop
      // handled in the parent recursion above
    }
  }
}

/**
 * Process a list as enum values for the given config var.
 * The list items use pattern:  `value` - description  or  **value** - description
 */
function processEnumList(listNode, configVar) {
  if (!listNode || listNode.type !== "list") return;
  const values = configVar.values;
  if (!values) return;

  for (const item of listNode.children ?? []) {
    const head = parseListItemHead(item);
    if (!head) continue;

    let enumValue = null;
    let description = head.description;

    if (head.kind === "enum") {
      enumValue = head.value;
    } else if (head.kind === "prop") {
      // **value** - description pattern
      enumValue = head.name;
      description = head.description;
    }

    if (enumValue && enumValue in values) {
      values[enumValue] = values[enumValue] ?? {};
      const doc = convertLinks(description);
      if (doc) {
        values[enumValue].docs = doc;
        stats.enumDocs++;
      }
    }
  }
}

/** Return the inner schema object from a config var (if it has one). */
function getSubSchema(configVar) {
  if (!configVar) return null;
  if (
    (configVar.type === "schema" || configVar.type === "trigger") &&
    configVar.schema
  ) {
    return configVar.schema;
  }
  return null;
}

/** Build the doc string for a prop, including type prefix and see-also. */
function buildPropDoc(head, sourceFile, docTitle, seeAlsoSlug) {
  const desc = convertLinks(head.description ?? "");
  if (!desc && !head.types) return null;

  const seeAlso = makeSeeAlso(sourceFile, docTitle, seeAlsoSlug);

  if (head.types) {
    const typeParts = head.types.split(",").map((s) => s.trim());
    // typeParts[0] = optionality, typeParts[1+] = type info
    const typeInfo = typeParts.slice(1).join(", ");
    const TEMPLATABLE_ANCHOR = "[templatable](#config-templatable)";
    if (typeInfo && typeInfo !== TEMPLATABLE_ANCHOR) {
      const convertedType = convertLinks(typeInfo);
      return `**${convertedType}**: ${desc}\n\n${seeAlso}`;
    }
  }
  return `${desc}\n\n${seeAlso}`;
}

// ─── Heading interpretation ───────────────────────────────────────────────────

/**
 * Parse an action/condition heading.
 * Matches headings whose first content node is inlineCode and ends with " Action" or " Condition".
 *
 * Returns { configType: "action"|"condition", parts: string[] } or null.
 *
 * `parts` is the dot-separated identifier split, e.g.:
 *   "`homeassistant.event` Action" → parts = ["homeassistant", "event"]
 *   "`respond` Action" → parts = ["respond"]
 */
function parseActionConditionHeading(node) {
  if (node.type !== "heading") return null;
  const ch = node.children ?? [];
  if (ch.length === 0 || ch[0].type !== "inlineCode") return null;

  const fullText = headingText(node); // "homeassistant.event Action"
  const lower = fullText.toLowerCase();

  let configType = null;
  if (lower.endsWith(" action")) configType = "action";
  else if (lower.endsWith(" condition")) configType = "condition";
  // Note: "Trigger" headings like `on_client_connected Trigger` refer to config vars
  // (type: "trigger" in CONFIG_SCHEMA), not top-level component triggers.
  // They're already documented via the config vars list, so we skip them here.
  if (!configType) return null;

  const identifier = ch[0].value ?? ""; // "homeassistant.event"
  const parts = identifier.split(".");
  return { configType, parts };
}

/**
 * Parse a "component title" heading.
 * Returns the component name if it looks like "Foo Component" or "Foo Bar Component".
 * Returns "Component/Hub" for the special hub pattern.
 */
function parseComponentTitle(text) {
  if (text === "Component/Hub") return "Component/Hub";
  if (text.endsWith(" Component")) {
    return text
      .replace(/ Component$/, "")
      .replace(/`/g, "")
      .replace(/\./g, "")
      .toLowerCase()
      .replace(/\s+/g, "_");
  }
  return null;
}

// ─── Oddities ────────────────────────────────────────────────────────────────

/**
 * Some files don't directly correspond to a single component by filename.
 */
function isOddityNotSpecificComponent(folder, file) {
  if (folder === "binary_sensor" && file === "ttp229") return true;
  if (folder === "climate" && file === "climate_ir") return true;
  if (folder === "display") {
    return [
      "lcd_display",
      "ssd1306",
      "ssd1322",
      "ssd1325",
      "ssd1327",
      "ssd1331",
      "ssd1351",
      "st7567",
    ].includes(file);
  }
  if (folder === "light" && file === "fastled") return true;
  return false;
}

/**
 * Some titles need remapping.
 */
function normalizeTitle(folder, file, title) {
  if (folder === "light" && file === "fastled") {
    if (title === "Clockless") return "fastled_clockless Component";
    if (title === "SPI") return "fastled_spi Component";
  }
  if (folder === "components" && file === "dfrobot_sen0395") {
    if (title === "Hub Component") return "Component/Hub";
  }
  if (folder === "components" && file === "sn74hc595") {
    if (title === "Over SPI") return ""; // typed schema, skip
  }
  return title;
}

// ─── Main file processor ──────────────────────────────────────────────────────

/**
 * Process a single MDAST document and write docs into schema files.
 *
 * @param {object} data  Parsed content of a dist-mdast/*.json file
 */
export function processFile(data) {
  const sourceFile = data.source; // e.g. "C:/.../src/content/docs/components/api.mdx"
  const frontmatter = data.frontmatter ?? {};
  const docTitle = frontmatter.title ?? "";

  // Derive filename and folder from source path
  const normalized = sourceFile.replace(/\\/g, "/");
  const pathAfterDocs = normalized.split("/src/content/docs/")[1] ?? "";
  const pathParts = pathAfterDocs.replace(/\.[^.]+$/, "").split("/");
  // e.g. ["components", "api"]  or  ["components", "sensor", "adc"]  or  ["automations", "actions"]
  const fileName = pathParts[pathParts.length - 1]; // "api"
  const contentFolder = pathParts[pathParts.length - 2] ?? ""; // "components" or "sensor"

  const core = getCore();
  const topChildren = data.mdast?.children ?? [];

  // ── Initial context ───────────────────────────────────────────────────────

  let configComponent = null; // current component key (for schema lookup)
  let platformName = contentFolder !== "components" ? contentFolder : null;
  let isComponent = false;
  let isPlatform = false;
  let seeAlsoSlug = null;

  // Skip components/index.mdx
  if (fileName === "index" && contentFolder === "components") return;

  // ── Find first paragraph (component/platform description) ─────────────────

  // Find the first substantive description paragraph.
  // We scan the leading children (imports, an optional heading, a code example, etc.)
  // but stop as soon as we hit a list — that signals config-var content has begun.
  // We also skip bare section markers like "Configuration variables:".
  let firstParaDoc = null;
  const SKIP_TYPES = new Set([
    "mdxjsEsm",
    "mdxJsxFlowElement",
    "heading",
    "code",
    "blockquote",
    "html",
    "thematicBreak",
    "table",
  ]);
  for (const c of topChildren) {
    if (c.type === "list") break; // entering config-vars territory, stop
    if (SKIP_TYPES.has(c.type)) continue;
    if (c.type === "paragraph") {
      const text = paragraphToMarkdown(c);
      // Skip bare section markers like "Configuration variables:"
      if (
        isConfigVarsHeading({
          type: "heading",
          children: [{ type: "text", value: text }],
        })
      )
        break;
      if (text) {
        firstParaDoc = text;
        break;
      }
    }
  }

  // ── Initial component / platform detection ────────────────────────────────

  if (fileName in core.components) {
    // This file documents a top-level component (e.g. api.mdx → api)
    const esphomeJson = loadSchema("esphome");
    if (esphomeJson && firstParaDoc) {
      const seeAlso = makeSeeAlso(sourceFile, docTitle, null);
      esphomeJson.core.components[fileName].docs =
        `${convertLinks(firstParaDoc)}\n\n${seeAlso}`;
      stats.coreDocs++;
    }
    configComponent = fileName;
    isComponent = true;
  } else if (
    contentFolder !== "components" &&
    contentFolder in core.platforms
  ) {
    if (fileName === "index") {
      // Platform index (e.g. sensor/index.mdx) → docs go to esphome.json core.platforms[name]
      const esphomeJson = loadSchema("esphome");
      if (esphomeJson && firstParaDoc) {
        const seeAlso = makeSeeAlso(sourceFile, docTitle, null);
        esphomeJson.core.platforms[contentFolder].docs =
          `${convertLinks(firstParaDoc)}\n\n${seeAlso}`;
        stats.corePlatformDocs++;
      }
      isPlatform = true;
      configComponent = contentFolder;
    } else if (!isOddityNotSpecificComponent(contentFolder, fileName)) {
      // Platform component (e.g. sensor/adc.mdx → adc sensor)
      const platformJson = loadSchema(contentFolder);
      if (
        platformJson &&
        platformJson[contentFolder]?.components?.[fileName] != null
      ) {
        if (firstParaDoc) {
          const seeAlso = makeSeeAlso(sourceFile, docTitle, null);
          platformJson[contentFolder].components[fileName].docs =
            `${convertLinks(firstParaDoc)}\n\n${seeAlso}`;
          stats.platformDocs++;
        }
        isPlatform = true;
        configComponent = fileName;
      }
    }
  } else if (contentFolder === "automations") {
    configComponent = "core";
  }

  // ── Walk top-level children ───────────────────────────────────────────────

  let titleSchema = null; // schema from action/condition heading
  let inConfigVars = false;
  let configSchema = null; // current schema to fill config vars into

  let i = 0;
  while (i < topChildren.length) {
    const node = topChildren[i];

    if (node.type === "heading") {
      const text = headingText(node);
      const normalized2 = normalizeTitle(contentFolder, fileName, text);

      // Empty means skip (oddity)
      if (normalized2 === "") {
        i++;
        inConfigVars = false;
        continue;
      }

      // Update see-also slug on every heading
      seeAlsoSlug = slugify(text);

      // ── "Configuration variables:" heading ──────────────────────────────
      if (isConfigVarsHeading(node)) {
        inConfigVars = true;
        configSchema = resolveConfigSchema(
          titleSchema,
          configComponent,
          isPlatform,
          isComponent,
          platformName,
        );
        if (!configSchema && debugLevel > 1) {
          console.log(
            `  [warn] ${fileName}: no schema for config vars at "${text}"`,
          );
        }
        titleSchema = null; // consumed
        i++;
        continue;
      }

      // Any other heading exits config-var mode
      inConfigVars = false;

      // ── Action / Condition heading ──────────────────────────────────────
      const acResult = parseActionConditionHeading(node);
      if (acResult) {
        const { configType, parts } = acResult;
        titleSchema = resolveActionConditionSchema(
          configType,
          parts,
          configComponent,
          text,
        );

        if (titleSchema) {
          // Get the description paragraph immediately following this heading
          const nextPara = topChildren[i + 1];
          if (nextPara?.type === "paragraph") {
            const acDoc = convertLinks(paragraphToMarkdown(nextPara));
            titleSchema.docs = acDoc;
            if (configType === "action") stats.actionDocs++;
            else if (configType === "condition") stats.conditionDocs++;
          }
        } else if (debugLevel > 2) {
          console.log(
            `  [miss] ${fileName}: ${configType} "${text}" not found`,
          );
        }
        i++;
        continue;
      }

      // ── Component / Platform / "Over SPI|I2C" headings ──────────────────
      const compName = parseComponentTitle(normalized2);

      if (normalized2 === "Component/Hub") {
        platformName = null;
        i++;
        continue;
      }

      if (compName) {
        // "Foo Component" heading
        const result = handleComponentHeading(
          compName,
          platformName,
          sourceFile,
          docTitle,
          topChildren[i + 1],
        );
        if (result.configComponent) {
          configComponent = result.configComponent;
          isComponent = result.isComponent;
          isPlatform = result.isPlatform;
        }
        i++;
        continue;
      }

      // "Over SPI" / "Over I2C" headings
      if (normalized2.endsWith("Over SPI")) {
        const result = handleComponentHeading(
          `${fileName}_spi`,
          platformName,
          sourceFile,
          docTitle,
          topChildren[i + 1],
        );
        if (result.configComponent) configComponent = result.configComponent;
        i++;
        continue;
      }
      if (
        normalized2.endsWith("Over I²C") ||
        normalized2.endsWith("Over I2C")
      ) {
        const result = handleComponentHeading(
          `${fileName}_i2c`,
          platformName,
          sourceFile,
          docTitle,
          topChildren[i + 1],
        );
        if (result.configComponent) configComponent = result.configComponent;
        i++;
        continue;
      }

      // Platform title (e.g. "Sensor", "Binary Sensor", "ADC Sensor")
      const platform = titleToPlatform(
        normalized2,
        configComponent ?? fileName,
      );
      if (platform && fileName !== "index") {
        platformName = platform;
        const compForPlatform = configComponent ?? fileName;
        const result = handlePlatformComponentHeading(
          compForPlatform,
          platform,
          sourceFile,
          docTitle,
          topChildren[i + 1],
        );
        if (result.configComponent) {
          configComponent = result.configComponent;
          isComponent = result.isComponent;
          isPlatform = result.isPlatform;
        }
        i++;
        continue;
      }

      // Break-title check
      if (isBreakTitle(normalized2)) {
        // heading signals a break, reset config vars state
      }

      i++;
      continue;
    }

    // ── List node ───────────────────────────────────────────────────────────
    if (node.type === "list" && inConfigVars && configSchema) {
      processConfigList(
        node,
        configSchema,
        sourceFile,
        docTitle,
        seeAlsoSlug,
        null,
      );
      i++;
      continue;
    }

    i++;
  }
}

// ─── Schema resolution helpers ────────────────────────────────────────────────

function resolveConfigSchema(
  titleSchema,
  configComponent,
  isPlatform,
  isComponent,
  platformName,
) {
  if (titleSchema) return titleSchema;
  if (!configComponent) return null;

  const jsonConfig = loadSchema(configComponent);
  if (!jsonConfig) return null;

  if (isComponent) {
    return jsonConfig[configComponent]?.schemas?.CONFIG_SCHEMA?.schema ?? null;
  }
  if (isPlatform && configComponent) {
    if (configComponent === platformName) {
      // Platform index
      const upper = platformName.toUpperCase();
      return (
        jsonConfig[configComponent]?.schemas?.[`${upper}_SCHEMA`]?.schema ??
        jsonConfig[configComponent]?.schemas?.CONFIG_SCHEMA?.schema ??
        null
      );
    }
    if (platformName) {
      return (
        jsonConfig[`${configComponent}.${platformName}`]?.schemas?.CONFIG_SCHEMA
          ?.schema ?? null
      );
    }
  }

  // Fallback: try component CONFIG_SCHEMA
  return jsonConfig[configComponent]?.schemas?.CONFIG_SCHEMA?.schema ?? null;
}

function resolveActionConditionSchema(
  configType,
  parts,
  configComponent,
  titleText,
) {
  const core = getCore();

  if (parts.length === 1) {
    // `action` in current component
    if (!configComponent) return null;
    const json = loadSchema(configComponent);
    return json?.[configComponent]?.[configType]?.[parts[0]] ?? null;
  }

  if (parts.length === 2) {
    // `component.action`
    const json = loadSchema(parts[0]);
    if (json) {
      // Try: component.action.name  (e.g. api.action.respond)
      return json[parts[0]]?.[configType]?.[parts[1]] ?? null;
    }
  }

  if (parts.length === 3) {
    // `platform.component.action` (e.g. sensor.adc.reset)
    if (!(parts[1] in core.components)) {
      if (debugLevel > 1)
        console.log(
          `  [warn] action "${titleText}": "${parts[1]}" not in components`,
        );
    }
    const json = loadSchema(parts[1]);
    return json?.[`${parts[1]}.${parts[0]}`]?.[configType]?.[parts[2]] ?? null;
  }

  return null;
}

function handleComponentHeading(
  compName,
  platformName,
  sourceFile,
  docTitle,
  nextNode,
) {
  const core = getCore();
  const desc =
    nextNode?.type === "paragraph"
      ? convertLinks(paragraphToMarkdown(nextNode))
      : null;
  const seeAlso = makeSeeAlso(sourceFile, docTitle, null);

  // Try as platform component first
  if (platformName && platformName in core.platforms) {
    const platformJson = loadSchema(platformName);
    if (platformJson?.[platformName]?.components?.[compName] != null) {
      if (desc) {
        platformJson[platformName].components[compName].docs =
          `${desc}\n\n${seeAlso}`;
        stats.platformDocs++;
      }
      return {
        configComponent: compName,
        isComponent: false,
        isPlatform: true,
      };
    }
  }

  // Try as core component
  if (compName in core.components) {
    const esphomeJson = loadSchema("esphome");
    if (esphomeJson && desc) {
      esphomeJson.core.components[compName].docs = `${desc}\n\n${seeAlso}`;
      stats.coreDocs++;
    }
    return { configComponent: compName, isComponent: true, isPlatform: false };
  }

  if (debugLevel > 2) {
    console.log(`  [miss] component "${compName}" not found`);
  }
  return {};
}

function handlePlatformComponentHeading(
  compName,
  platform,
  sourceFile,
  docTitle,
  nextNode,
) {
  const core = getCore();
  const desc =
    nextNode?.type === "paragraph"
      ? convertLinks(paragraphToMarkdown(nextNode))
      : null;
  const seeAlso = makeSeeAlso(sourceFile, docTitle, null);

  if (platform in core.platforms) {
    const platformJson = loadSchema(platform);
    if (platformJson?.[platform]?.components?.[compName] != null) {
      if (desc) {
        platformJson[platform].components[compName].docs =
          `${desc}\n\n${seeAlso}`;
        stats.platformDocs++;
      }
      return {
        configComponent: compName,
        isComponent: false,
        isPlatform: true,
      };
    }
  }
  return {};
}
