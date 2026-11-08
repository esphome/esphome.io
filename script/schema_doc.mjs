#!/usr/bin/env node
/**
 * Add the component documentation to the ESPHome language schema.
 *
 * The schema JSON produced by esphome's script/build_language_schema.py lists
 * every config key; this script parses the docs MDX with remark, routes every
 * "Configuration variables" section to a schema from the page path, the
 * heading structure or an explicit `{/* schema: <ref> *\/}` marker, and writes
 * the descriptions into the schema (`docs` fields) for the VS Code extension
 * and the ESPHome Builder editor.
 *
 * Without --emit it only reports what does not line up: documented keys the
 * schema does not have, schema keys the docs do not mention, Required/Optional
 * disagreements and sections it could not route. With --strict every finding
 * except the informational ones (no intro paragraph, nested list ignored) fails
 * the run, undocumented schema keys included. A run that cannot match most of
 * its sections or keys fails, and with --emit writes nothing, so a changed
 * schema layout does not ship an empty bundle.
 *
 * Usage:
 *   node script/schema_doc.mjs --schema-dir DIR --emit OUT_DIR [--deploy-url https://esphome.io]
 *   node script/schema_doc.mjs [--schema-dir DIR | --schema-url URL] [--file SUBSTR] [--json OUT] [--verbose] [--strict]
 */

import { existsSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import Slugger from "github-slugger";
import { toString } from "mdast-util-to-string";
import remarkMath from "remark-math";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";

const DOCS_ROOT = join("src", "content", "docs");
const COMPONENTS_ROOT = join(DOCS_ROOT, "components");
const DEFAULT_SCHEMA_URL = "https://schema.esphome.io/dev";
// Today's tree writes about 7500 option descriptions; a schema layout change that loses a fifth of them must
// not ship a bundle
const MIN_EMITTED_PROPS = 6000;
// Floors for the intros, each well under today's count, so a layout change that loses them does not write a bundle
const MIN_EMITTED_INTROS = {
  componentDocs: 100,
  platformDocs: 300,
  actionDocs: 200,
  conditionDocs: 20,
  registryDocs: 20,
  enumDocs: 100,
  platformIndexDocs: 10,
};

const CONFIG_VARS_RE = /^Configuration (variables|options):?$/i;
const MARKER_RE = /^\s*\/\*\s*schema:\s*(\S+)\s*\*\/\s*$/;
const REGISTRY_TYPES = new Set(["action", "condition", "filter", "effects"]);

// Bus and base schema keys that the extractor copies into every device schema;
// they are documented once on the bus page, not per component.
const INHERITED_KEYS = new Set([
  "id",
  "address",
  "i2c_id",
  "spi_id",
  "uart_id",
  "cs_pin",
  "data_rate",
  "spi_mode",
  "psram_dma",
  "release_device",
  "update_interval",
]);

// Platform registries documented as headings: [registry key, title suffix]
const REGISTRY_NAME_ODDITIES = {
  "light.effects": { automation_light: "automation", e1_31: "e131" },
};

const COMPONENT_REGISTRIES = {
  light: [["effects", " Effect"]],
  binary_sensor: [["filter", null]],
  text_sensor: [["filter", null]],
  sensor: [["filter", " Filter"]],
};

const isMain = process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;

const { values: args } = parseArgs({
  args: isMain ? undefined : [],
  options: {
    "schema-dir": { type: "string" },
    "schema-url": { type: "string", default: DEFAULT_SCHEMA_URL },
    file: { type: "string" },
    json: { type: "string" },
    verbose: { type: "boolean", short: "v", default: false },
    strict: { type: "boolean", default: false },
    resolve: { type: "string" },
    emit: { type: "string" },
    "deploy-url": { type: "string", default: "https://esphome.io" },
  },
});

// ---------------------------------------------------------------------------
// Schema access
// ---------------------------------------------------------------------------

export class SchemaStore {
  constructor({ dir, url }) {
    this.dir = dir;
    this.url = url;
    this.files = new Map();
    this.core = null;
    this.componentIntros = new Set(); // components whose intro this run has written
  }

  /** Load esphome.json, whose `core` lists every component and platform. */
  async init() {
    const esphome = await this.file("esphome");
    if (!esphome?.core) {
      throw new Error(`esphome.json not found in ${this.dir ?? this.url}; is this a language schema bundle?`);
    }
    this.core = esphome.core;
  }

  /** The parsed JSON for one schema file, or null when the bundle has no such file. */
  async file(name) {
    if (this.files.has(name)) return this.files.get(name);
    let doc = null;
    if (this.dir) {
      const path = join(this.dir, `${name}.json`);
      if (existsSync(path)) {
        try {
          doc = JSON.parse(readFileSync(path, "utf8"));
        } catch (err) {
          throw new Error(`${path}: ${err.message}`, { cause: err });
        }
      }
    } else {
      const url = `${this.url}/${name}.json`;
      const res = await fetch(url);
      if (res.ok) doc = await res.json();
      else if (res.status !== 404) throw new Error(`${url}: HTTP ${res.status}`);
    }
    this.files.set(name, doc);
    return doc;
  }

  /** Whether `name` is a platform such as sensor or light. */
  isPlatform(name) {
    return Object.hasOwn(this.core.platforms, name);
  }

  /** Whether `name` is a component with a top-level schema. */
  isComponent(name) {
    return Object.hasOwn(this.core.components, name);
  }

  /** A component or platform component the bundle knows about (no fetch for made-up names). */
  async knownComponent(name) {
    if (this.isComponent(name) || this.files.get(name)) return true;
    if (this.dir && existsSync(join(this.dir, `${name}.json`))) return true;
    if (!this.platformComponents) {
      this.platformComponents = new Set();
      for (const platform of Object.keys(this.core.platforms)) {
        const doc = await this.file(platform);
        for (const comp of Object.keys(doc?.[platform]?.components ?? {})) this.platformComponents.add(comp);
      }
    }
    return this.platformComponents.has(name);
  }

  /**
   * Resolve a schema reference to its inner schema.
   *   comp.NAME                 -> file comp, top comp, schemas.NAME
   *   comp.platform.NAME        -> file comp, top comp.platform, schemas.NAME
   *   comp.action.x[.y]        -> registry entry
   *   comp.platform.action.x   -> registry entry on a platform component
   *   core.action.x             -> esphome.json core registry
   *   ref[VARIANT]              -> one variant of a typed schema
   */
  async resolve(ref) {
    if (ref.includes("/")) {
      const [base, ...props] = ref.split("/");
      let inner = await this.resolve(base);
      for (const prop of props) inner = await this.nestedInner(inner, prop);
      return inner;
    }
    if (ref.includes("+")) {
      const parts = ref.split("+");
      const inners = await Promise.all(parts.map((r) => this.resolve(r)));
      if (inners.some((i) => !i)) return null;
      const variants = inners.flatMap((i) => i.variants);
      // foo_i2c + foo_spi are one component with two wirings: a key both declare
      // is the same option, so its docs go to both
      const comps = parts.map((r) => r.split(".")[0]);
      const bases = new Set(comps.map((c) => c.replace(/_(i2c|spi)$/, "")));
      // A heading naming several actions documents each of them too
      const registryUnion = parts.every((r) => /\.(action|condition|filter|effects)\./.test(r));
      const multi = (bases.size === 1 && comps.every((c) => /_(i2c|spi)$/.test(c))) || registryUnion;
      // A platform page's hub schema is audited on its own page; bus wirings and
      // grouped actions are only documented here, so audit all of them
      const out = { variants, primaryCount: multi ? variants.length : inners[0].variants.length, multi };
      if (!multi && inners[0].typedKey) {
        // A typed platform joined with its hub: the discriminator and the variant
        // group stay the platform's; the hub is not another variant
        Object.assign(out, {
          typedKey: inners[0].typedKey,
          entry: inners[0].entry,
          typedCount: inners[0].variants.length,
        });
      }
      return out;
    }
    if (ref.endsWith(".*")) {
      // Every schema of a platform base page (sensor/index.mdx documents
      // SENSOR_SCHEMA and the derived schemas that add filters, triggers, ...)
      const top = ref.slice(0, -2);
      const doc = await this.file(top.split(".")[0]);
      const upper = top.toUpperCase();
      const rank = (topName, schemaName) => {
        if (topName === top && (schemaName === `${upper}_SCHEMA` || schemaName === `_${upper}_SCHEMA`)) return 0;
        if (/_(ACTION|CONDITION)_SCHEMA$/.test(schemaName)) return 3;
        return topName === top ? 1 : 2;
      };
      const variants = Object.entries(doc ?? {})
        .filter(([, body]) => body && typeof body === "object" && body.schemas)
        .flatMap(([topName, body]) =>
          Object.entries(body.schemas).map(([schemaName, entry]) => [rank(topName, schemaName), entry]),
        )
        .filter(([r]) => r < 3)
        .sort((a, b) => a[0] - b[0]);
      const inners = variants.map(([r, entry]) => [r, toInner(entry)]).filter(([, i]) => i);
      const flat = inners.flatMap(([, i]) => i.variants);
      const primaryCount = inners.filter(([r]) => r === 0).reduce((n, [, i]) => n + i.variants.length, 0);
      if (!flat.length) return null;
      // Without a base schema every schema of the file is audited, and keys the
      // platform components declare have nowhere to be created
      return { variants: flat, primaryCount: primaryCount || flat.length, baseRef: top, hasBase: primaryCount > 0 };
    }
    let variant = null;
    const m = ref.match(/^(.*)\[([^\]]+)\]$/);
    if (m) [, ref, variant] = m;
    const found = await this.lookup(ref);
    if (!found) return null;
    if (variant && found.entry?.type !== "typed") return null;
    // Registry entries the extractor emitted as {} exist but have no keys
    return toInner(found.entry, variant) ?? (found.registry ? { variants: [{}] } : null);
  }

  /** Whether a reference resolves to a schema. */
  async exists(ref) {
    return (await this.resolve(ref)) !== null;
  }

  /** The raw JSON object a plain (non-union) reference points at. */
  async entry(ref) {
    return (await this.lookup(ref.replace(/\[[^\]]+\]$/, "")))?.entry ?? null;
  }

  /** {entry, registry} for a plain reference, or null. */
  async lookup(ref) {
    const parts = ref.split(".");
    if (parts[0] === "core") {
      const registry = REGISTRY_TYPES.has(parts[1]);
      const entry = registry ? this.core?.[parts[1]]?.[parts.slice(2).join(".")] : this.core?.schemas?.[parts[1]];
      return entry ? { entry, registry } : null;
    }
    const doc = await this.file(parts[0]);
    if (!doc) return null;
    for (const topLen of [1, 2]) {
      const top = doc[parts.slice(0, topLen).join(".")];
      if (!top) continue;
      const rest = parts.slice(topLen);
      if (rest.length === 0) continue;
      if (REGISTRY_TYPES.has(rest[0])) {
        const entry = top[rest[0]]?.[rest.slice(1).join(".")];
        if (entry) return { entry, registry: true };
      } else if (rest.length === 1 && top.schemas?.[rest[0]]) {
        return { entry: top.schemas[rest[0]], registry: false };
      }
    }
    return null;
  }

  /** Read every schema file of the bundle, so an emit run writes them all back. */
  async loadAll() {
    const names = readdirSync(this.dir).filter((n) => n.endsWith(".json"));
    await Promise.all(names.map((n) => this.file(basename(n, ".json"))));
  }

  /** Write every loaded schema file to `dir`. */
  save(dir) {
    for (const [name, doc] of this.files) {
      if (doc) writeFileSync(join(dir, `${name}.json`), `${JSON.stringify(doc, null, 2)}\n`);
    }
  }

  /**
   * Like findProp but also says which schema object holds the key (owner) and
   * which top-level variant of the section led to it (root), so a refined copy
   * of an inherited key lands on a schema that really accepts the key.
   */
  async findPropOwner(inner, name, inherited = false, seen = new Set(), root = null) {
    if (!inner) return null;
    if (inner.typedKey === name) {
      const typedEntries = inner.entries ?? [inner.entry];
      return { prop: SchemaStore.typedKeyProp(inner), owner: null, inherited, typedEntries };
    }
    for (const variantInner of inner.variants) {
      const top = root ?? variantInner;
      if (variantInner.config_vars && Object.hasOwn(variantInner.config_vars, name)) {
        return { prop: variantInner.config_vars[name], owner: variantInner, inherited, root: top };
      }
      for (const ext of variantInner.extends ?? []) {
        if (seen.has(ext)) continue;
        seen.add(ext);
        const found = await this.findPropOwner(await this.resolveExtends(ext), name, true, seen, top);
        if (found) return found;
      }
    }
    return null;
  }

  /** The variants a key is shared across: the typed group, or every member of a bus union. */
  groupVariants(inner) {
    return inner.typedCount ? inner.variants.slice(0, inner.typedCount) : inner.variants;
  }

  /**
   * The definition of a key in every typed variant, own or inherited, each
   * once. A docs-only copy that emitPropDocs refined onto a variant stands in
   * for an inherited definition, so nested options and enum values are read
   * from that one.
   */
  async propHolders(inner, name) {
    const out = [];
    const seen = new Set();
    for (const variantInner of inner ? this.groupVariants(inner) : []) {
      const own = variantInner.config_vars?.[name];
      let prop = own;
      if (!own || ("docs" in own && Object.keys(own).every((k) => k === "docs" || k === "key"))) {
        const base = await this.findPropOwner({ variants: [{ extends: variantInner.extends }] }, name);
        prop = base?.prop ?? own;
      }
      if (!prop || seen.has(prop)) continue;
      seen.add(prop);
      out.push({ prop, owner: variantInner, inherited: prop !== own });
    }
    return out;
  }

  /**
   * The schema behind a nested key, from every definition the section's own
   * variants hold (typed group, bus union, or the platform part of a hub union),
   * as one inner so docs reach each of them.
   */
  async nestedInner(inner, name) {
    if (!inner) return null;
    const scope =
      inner.typedCount || inner.multi
        ? inner
        : { variants: inner.variants.slice(0, inner.primaryCount ?? inner.variants.length) };
    const holders = await this.propHolders(scope, name);
    const props = holders.length ? holders.map((h) => h.prop) : [await this.findProp(inner, name)];
    const inners = props.map((prop) => propInner(prop)).filter(Boolean);
    if (inners.length <= 1) return inners[0] ?? null;
    const variants = inners.flatMap((i) => i.variants);
    const merged = { variants, primaryCount: variants.length, multi: true };
    const typedKey = inners[0].typedKey;
    if (typedKey && inners.every((i) => i.typedKey === typedKey)) {
      // The same typed schema under several outer variants: one discriminator, documented on every entry
      Object.assign(merged, { typedKey, typedCount: variants.length, entries: inners.map((i) => i.entry) });
    }
    return merged;
  }

  /** The names of the schemas a component file holds for `topRef`. */
  async schemaNames(topRef) {
    const parts = topRef.split(".");
    const doc = await this.file(parts[0]);
    return Object.keys(doc?.[topRef]?.schemas ?? {});
  }

  /** Follow a schema's extends chain once so a broken reference is reported even when no key needed it. */
  async verifyExtends(inner, seen = (this.verifiedExtends ??= new Set())) {
    for (const variantInner of inner?.variants ?? []) {
      for (const ext of variantInner.extends ?? []) {
        if (seen.has(ext)) continue;
        seen.add(ext);
        await this.verifyExtends(await this.resolveExtends(ext), seen);
      }
    }
  }

  /** Resolve an `extends` reference, remembering the ones the bundle cannot satisfy. */
  async resolveExtends(ref) {
    const inner = await this.resolve(ref);
    if (!inner) (this.unresolvedExtends ??= new Set()).add(ref);
    return inner;
  }

  /**
   * The discriminator of a typed schema as a config var. The bundle does not say whether it is
   * required (a typed schema may have a default type), so that is left unknown; its choices are
   * the typed entry's types, so a bullet per choice describes that type.
   */
  static typedKeyProp(inner) {
    const entries = inner.entries ?? [inner.entry];
    // The choices are read from the first entry; a write goes to the same choice of every entry
    return { type: "enum", values: entries[0]?.types ?? {}, typedEntries: entries };
  }

  /** Find a config var by name, following extends. */
  async findProp(inner, name, seen = new Set()) {
    if (!inner) return null;
    if (inner.typedKey === name) return SchemaStore.typedKeyProp(inner);
    for (const variantInner of inner.variants) {
      if (variantInner.config_vars && Object.hasOwn(variantInner.config_vars, name)) {
        return variantInner.config_vars[name];
      }
      for (const ext of variantInner.extends ?? []) {
        if (seen.has(ext)) continue;
        seen.add(ext);
        const found = await this.findProp(await this.resolveExtends(ext), name, seen);
        if (found) return found;
      }
    }
    return null;
  }

  /** Every definition of a key across typed variants and extends. */
  async findProps(inner, name, seen = new Set()) {
    const props = [];
    if (!inner) return props;
    if (inner.typedKey === name) props.push(SchemaStore.typedKeyProp(inner));
    for (const variantInner of inner.variants) {
      const own = variantInner.config_vars?.[name];
      if (own) {
        props.push(own);
        // A redeclared key shadows the inherited one, as findPropOwner resolves it;
        // a bare {} the extractor could not describe does not
        if ("key" in own) continue;
      }
      for (const ext of variantInner.extends ?? []) {
        if (seen.has(ext)) continue;
        seen.add(ext);
        props.push(...(await this.findProps(await this.resolveExtends(ext), name, seen)));
      }
    }
    return props;
  }

  /** Platform component schemas (loaded files only) that extend a platform base schema. */
  async childrenOf(baseTop) {
    this.childrenCache ??= new Map();
    if (this.childrenCache.has(baseTop)) return this.childrenCache.get(baseTop);
    const children = [];
    const platformDoc = await this.file(baseTop);
    for (const comp of Object.keys(platformDoc?.[baseTop]?.components ?? {})) {
      const doc = await this.file(comp);
      const inner = toInner(doc?.[`${comp}.${baseTop}`]?.schemas?.CONFIG_SCHEMA);
      if (inner) children.push(...inner.variants);
    }
    this.childrenCache.set(baseTop, children);
    return children;
  }

  /** Look for a key one or two levels below this schema (documented flat). */
  async findNestedProps(inner, name, depth = 2, seen = new Set()) {
    const found = [];
    if (!inner || depth === 0) return found;
    for (const variantInner of inner.variants) {
      for (const child of Object.values(variantInner.config_vars ?? {})) {
        const childInner = propInner(child);
        if (!childInner) continue;
        const direct = await this.findProp(childInner, name);
        if (direct) found.push(direct);
        found.push(...(await this.findNestedProps(childInner, name, depth - 1, seen)));
      }
      // A sub-schema the base declares is as reachable as one declared here
      for (const ext of variantInner.extends ?? []) {
        if (seen.has(ext)) continue;
        seen.add(ext);
        found.push(...(await this.findNestedProps(await this.resolveExtends(ext), name, depth, seen)));
      }
    }
    return found;
  }

  /** `target_N` / `gX` in the docs stand for target_1, target_2, ... in the schema. */
  numberedFamily(inner, name) {
    const m = name.match(/^(.*?)_?[NX]$/);
    if (!m || !m[1]) return [];
    const re = new RegExp(`^${m[1]}_?\\d+$`);
    const keys = [];
    for (const variantInner of inner.variants) {
      for (const k of Object.keys(variantInner.config_vars ?? {})) if (re.test(k)) keys.push(k);
    }
    return keys;
  }

  /** Keys declared directly on this schema (not inherited), excluding generated ids. */
  ownKeys(inner) {
    const keys = new Set();
    for (const variantInner of inner.variants.slice(0, inner.primaryCount ?? inner.variants.length)) {
      for (const [k, v] of Object.entries(variantInner.config_vars ?? {})) {
        if (v.key !== "Required" && v.key !== "Optional") continue;
        if (v.visibility === "yaml_only") continue;
        if (INHERITED_KEYS.has(k)) continue;
        keys.add(k);
      }
    }
    if (inner.typedKey && !inner.selected) keys.add(inner.typedKey);
    return keys;
  }
}

/** Normalise a config var / schema entry to { variants: [{config_vars, extends}] }. */
export function toInner(entry, variant = null) {
  if (!entry || typeof entry !== "object") return null;
  if (entry.type === "typed") {
    const types = variant ? { [variant]: entry.types?.[variant] } : (entry.types ?? {});
    const variants = Object.values(types).filter(Boolean);
    const inner = { variants, typedKey: entry.typed_key ?? "type", entry };
    // ref[VARIANT] documents one variant's options; the discriminator belongs to the whole schema
    if (variant) inner.selected = true;
    return variants.length ? inner : null;
  }
  if (entry.schema && typeof entry.schema === "object") {
    return { variants: [entry.schema] };
  }
  if (entry.config_vars || entry.extends) {
    return { variants: [entry] };
  }
  return null;
}

/** The schema a config var opens (nested mapping, trigger or typed), or null. */
function propInner(prop) {
  if (!prop) return null;
  if (prop.type === "enum") return null;
  return toInner(prop);
}

// ---------------------------------------------------------------------------
// Doc walking
// ---------------------------------------------------------------------------

function listMdx(dir) {
  const out = [];
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...listMdx(path));
    else if (name.endsWith(".mdx")) out.push(path);
  }
  return out;
}

/** Parse a docs page to mdast, keeping the source for raw bullet text and the frontmatter title. */
export function parseMdx(path) {
  let src = readFileSync(path, "utf8")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n");
  let title = null;
  // Frontmatter is not markdown; blank it but keep offsets and line numbers stable.
  src = src.replace(/^---\n([\s\S]*?)\n---\n/, (fm, body) => {
    const m = body.match(/^title:\s*(.+)$/m);
    if (m) title = m[1].trim().replace(/^(["'])(.*)\1$/, "$2");
    return fm.replace(/[^\n]/g, " ");
  });
  const tree = unified().use(remarkParse).use(remarkMath).use(remarkMdx).parse(src);
  tree.source = src;
  tree.title = title;
  return tree;
}

// ---------------------------------------------------------------------------
// Emitting docs into the schema
// ---------------------------------------------------------------------------

/** Site path of a doc page: /components/sensor/bme280 */
export function pageUrl(file, docsRoot = DOCS_ROOT) {
  const rel = relative(docsRoot, file)
    .replace(/\\/g, "/")
    .replace(/\.mdx$/, "");
  return `/${rel.replace(/\/index$/, "")}/`;
}

/** Rewrite the page's relative links to absolute links on the deployed site. */
export function convertLinks(text, url, deployUrl) {
  if (text == null) return text;
  return text.replace(/\[([^\]]*)\]\(([^)]*)\)/g, (all, title, href) => {
    if (/^https?:\/\//.test(href)) return all;
    if (href.startsWith("/")) return `[${title}](${deployUrl}${href})`;
    if (href.startsWith("#")) return `[${title}](${deployUrl}${url}${href})`;
    if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return all;
    // "../foo" or "images/x.png": relative to the page, as the site resolves it
    return `[${title}](${new URL(href, `${deployUrl}${url.replace(/\/+$/, "")}/`).href})`;
  });
}

/** Source text of a node with line breaks collapsed, as the Python walker produced it. */
function nodeText(tree, node) {
  return tree.source
    .slice(node.position.start.offset, node.position.end.offset)
    .split("\n")
    .map((l) => l.trim())
    .join(" ")
    .trim();
}

/** Text of a list item: all of its paragraphs, not its nested lists. */
function itemText(tree, item) {
  return item.children
    .filter((c) => c.type === "paragraph")
    .map((c) => nodeText(tree, c))
    .join(" ");
}

const PAREN = "\\((?:[^()]|\\([^()]*\\))*\\)";
const TYPE_GROUP = `((?:${PAREN}\\s*)*${PAREN})`;
// A bullet that was meant to be an option but does not start with a bold key
const LOOKS_LIKE_OPTION_RE = /^`[a-z0-9_]+`\s*\(|\(\s*(?:\*\*|\*)?(?:required|optional)\b/i;
const LAST_PAREN_RE = new RegExp(`\\(((?:[^()]|\\([^()]*\\))*)\\)\\s*$`);
const PROP_RE = new RegExp(`^\\*\\*(\\w+)\\*\\*(?::\\s*${TYPE_GROUP}(?::\\s*|\\s+|$)|(?: ${TYPE_GROUP})?: )(.*)$`);
const ENUM_RE = /^(?:`([^`]*)`|\*\*([^*]*)\*\*)\s*(?:(?:-|:)\s*(.*)|\(([^)]*)\)(?:\s*(?::|-)\s*(.*))?)?$/;

/** <EnumValues values={[ {value: "X", default: true, description: "Y"}, … ]} /> */
const ENUM_VALUE_FIELDS = ["value", "description", "default"];

export function parseEnumValues(node) {
  const attr = node.attributes?.find((a) => a.name === "values");
  const expr = attr?.value?.data?.estree?.body?.[0]?.expression;
  if (!expr) return { error: "missing values={[...]} prop" };
  const literal = (n) => {
    if (n.type === "Literal") return n.value;
    if (n.type === "UnaryExpression" && n.operator === "-" && n.argument.type === "Literal") return -n.argument.value;
    throw new Error(`${n.type} is not a literal`);
  };
  let entries;
  try {
    if (expr.type !== "ArrayExpression") throw new Error("values is not an array literal");
    entries = expr.elements.map((el) => {
      if (el?.type !== "ObjectExpression") throw new Error("each entry must be an object literal");
      return Object.fromEntries(
        el.properties.map((prop) => {
          if (prop.type !== "Property" || prop.computed) throw new Error("each field must be a plain key: value pair");
          return [prop.key.name ?? prop.key.value, literal(prop.value)];
        }),
      );
    });
  } catch (err) {
    return { error: err.message };
  }
  if (!entries.every((e) => "value" in e)) {
    return { error: "each entry needs a 'value'" };
  }
  const unknown = entries.flatMap((e) => Object.keys(e).filter((k) => !ENUM_VALUE_FIELDS.includes(k)));
  if (unknown.length) return { error: `unknown field '${unknown[0]}'` };
  const bad = entries.find(
    (e) =>
      !["string", "number"].includes(typeof e.value) ||
      ("description" in e && typeof e.description !== "string") ||
      ("default" in e && typeof e.default !== "boolean"),
  );
  if (bad)
    return { error: `entry ${JSON.stringify(bad.value)}: value is a string, description a string, default a boolean` };
  return { entries };
}

/** Lower snake_case of a heading, for matching component and platform names. */
function slug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/** `name` Action -> {name, type} using the inlineCode node, not the text. */
export function registryHeading(node) {
  const codes = node.children.filter((c) => c.type === "inlineCode");
  if (!codes.length) return null;
  const rest = toString({ children: node.children.filter((c) => c.type !== "inlineCode") })
    .replace(/\s*\/\s*/g, " ")
    .trim();
  const m = rest.match(/^(Action|Condition)s?$/i);
  if (!m) return null;
  return { name: codes[0].value, names: codes.map((c) => c.value), type: m[1].toLowerCase() };
}

/** `time.on_time` Trigger -> on_time */
function triggerHeading(node) {
  const code = node.children.find((c) => c.type === "inlineCode");
  if (!code) return null;
  const rest = toString({ children: node.children.filter((c) => c.type !== "inlineCode") }).trim();
  if (!/^Trigger$/i.test(rest)) return null;
  return code.value;
}

/** The code span of a heading that is nothing but `name`, else null. */
function bareCodeHeading(node) {
  const c = node.children;
  if (c.length === 1 && c[0].type === "inlineCode") return c[0].value;
  if (c.length >= 1 && c[0].type === "inlineCode" && c.slice(1).every((n) => n.type === "text" && !n.value.trim())) {
    return c[0].value;
  }
  return null;
}

/** Extract {key, optionality, line} from a list item's first paragraph. */
export function parseItem(item) {
  const para = item.children.find((c) => c.type === "paragraph");
  if (!para) return null;
  const [first, ...rest] = para.children;
  if (!first || first.type !== "strong") return null;
  const key = toString(first).trim();
  const line = para.position.start.line;
  let optionality = null;
  // Expected shape: **key** (**Required**, type): ...  /  **key** (*Optional*, type): ...
  // A header bullet "**key**: (*Optional*, list)" introduces a nested list with no text of its own.
  const colonParen = rest[0]?.type === "text" && /^:\s*\(\s*$/.test(rest[0].value);
  const header = colonParen && /\)\s*$/.test(toString(para));
  const hasParen = header || (rest[0]?.type === "text" && /^\s*\(/.test(rest[0].value));
  if (rest[0]?.type === "text" && /^:?\s*\(\s*$/.test(rest[0].value)) {
    const marker = rest[1];
    if (marker && (marker.type === "strong" || marker.type === "emphasis")) {
      const word = toString(marker).trim().toLowerCase();
      if (word === "required" || word === "optional") optionality = word;
    }
  } else if (rest[0]?.type === "text") {
    // The marker is sometimes left plain: **key** (Optional, int): ...
    const m = rest[0].value.match(/^:?\s*\(\s*(required|optional)\b/i);
    if (m) optionality = m[1].toLowerCase();
  }
  // YAML keys are lower snake_case; `target_N` / `gX` stand for numbered families
  const prose = !/^[a-z0-9_]+[NX]?$/.test(key);
  return { key, optionality, hasParen, header, prose, line };
}

export class Report {
  constructor() {
    this.findings = [];
    this.sections = [];
    this.stats = {
      files: 0,
      sections: 0,
      sectionsUnroutable: 0,
      sectionsByMarker: 0,
      keysMatched: 0,
      keysMatchedNested: 0,
      keysUnmatched: 0,
      keysOrphaned: 0,
      keysHeld: 0,
      keysUndocumented: 0,
      optionalityMismatch: 0,
      proseBullets: 0,
      emitted: {
        props: 0,
        propsRefined: 0,
        propsSkipped: 0,
        enumDocs: 0,
        actionDocs: 0,
        conditionDocs: 0,
        registryDocs: 0,
        componentDocs: 0,
        platformDocs: 0,
        platformIndexDocs: 0,
      },
    };
  }

  /** Record one finding. */
  add(kind, file, line, detail) {
    this.findings.push({ kind, file, line, ...detail });
  }
}

/** An entry an emission created from docs alone: a key and its text, no definition. */
const isDocsOnly = (prop) => Object.keys(prop).every((k) => k === "key" || k === "docs");

export class Walker {
  constructor(
    store,
    report,
    file,
    { emit = false, deployUrl = "https://esphome.io", docsRoot = DOCS_ROOT, componentsRoot = COMPONENTS_ROOT } = {},
  ) {
    this.store = store;
    this.report = report;
    this.file = file;
    this.emit = emit;
    this.deployUrl = deployUrl;
    this.componentsRoot = componentsRoot;
    this.url = pageUrl(file, docsRoot);
    this.lastHeadingSlug = null;
    this.lastEnumProps = [];
    this.slugger = new Slugger();
    this.tree = null;
    this.rel = relative(componentsRoot, file).replace(/\\/g, "/");
    this.switchDepth = null; // depth of the heading that re-targeted defaultRef
    this.stem = basename(file, ".mdx");
    this.folder = basename(dirname(file));
    this.section = null; // { inner, ref, depth, documented:Set, subStack:[] }
    this.pendingMarker = null;
    this.pendingRegistry = null; // ref set by a `x.y` Action heading
    this.defaultRef = null;
    this.componentRef = null; // top ref like "uart" or "template.sensor" for named-schema lookup
    this.holdEmit = null; // depth of a heading whose option bullets are only counted, neither written nor audited
  }

  /** Whether docs are written right now: emitting, and not under a heading that holds its bullets back. */
  get writing() {
    return this.emit && this.holdEmit === null;
  }

  /** Work out which schema this page documents by default from its path. */
  async init() {
    const { store } = this;
    const inComponents = this.file.startsWith(this.componentsRoot);
    if (!inComponents) {
      this.defaultRef = null;
      this.componentRef = "core";
      return;
    }
    const folderIsPlatform = this.folder !== "components" && store.isPlatform(this.folder);
    if (this.stem === "index" && this.folder === "components") return;
    if (folderIsPlatform && this.stem === "index") {
      this.defaultRef = `${this.folder}.*`;
      this.componentRef = this.folder;
    } else if (folderIsPlatform) {
      this.componentRef = `${this.stem}.${this.folder}`;
      this.defaultRef = await this.componentSchemaRef(this.stem, this.folder);
      const hubRef = await this.componentSchemaRef(this.stem);
      if (hubRef) {
        // sensor/bh1745.mdx documents the bh1745 hub and its sensor platform in one page
        this.defaultRef = this.defaultRef ? `${this.defaultRef}+${hubRef}` : hubRef;
        this.componentRef = this.stem;
      }
    } else if (this.folder === "filter" && store.isPlatform(basename(dirname(dirname(this.file))))) {
      const platform = basename(dirname(dirname(this.file)));
      this.componentRef = platform;
      this.defaultRef = `${platform}.filter.${this.stem}`;
    } else {
      const comp = this.stem === "index" ? this.folder : this.stem;
      this.componentRef = comp;
      this.defaultRef = await this.componentSchemaRef(comp);
    }
  }

  /** foo.CONFIG_SCHEMA, or the union of foo_i2c/foo_spi when foo itself has none. */
  async componentSchemaRef(name, platform = null) {
    const { store } = this;
    const suffix = platform ? `.${platform}.CONFIG_SCHEMA` : ".CONFIG_SCHEMA";
    if ((await store.knownComponent(name)) && (await store.exists(`${name}${suffix}`))) return `${name}${suffix}`;
    const buses = [];
    for (const bus of ["i2c", "spi"]) {
      const candidate = `${name}_${bus}`;
      if ((await store.knownComponent(candidate)) && (await store.exists(`${candidate}${suffix}`))) {
        buses.push(`${candidate}${suffix}`);
      }
    }
    return buses.length ? buses.join("+") : null;
  }

  /**
   * output/mcp4728.mdx documents the hub at page level and its output platform under "## MCP4728 Output": when
   * such a heading exists the page-level options are the hub's alone, not the hub and platform joined.
   */
  splitHubFromPlatform_(tree) {
    const platform = this.folder !== "components" && this.store.isPlatform(this.folder) ? this.folder : null;
    const hubRef = `${this.stem}.CONFIG_SCHEMA`;
    if (!platform || !this.defaultRef?.includes("+") || !this.defaultRef.split("+").includes(hubRef)) return;
    const wanted = new Set([platform, `${platform}s`, `${slug(this.stem)}_${platform}`]);
    const headings = tree.children.filter((n) => n.type === "heading").map((n) => slug(toString(n)));
    if (!headings.some((h) => wanted.has(h))) return;
    this.defaultRef = hubRef;
    this.componentRef = this.stem;
  }

  /** Keep the page's own schema so a bus heading can hand back to it. */
  rememberPageDefaults() {
    this.pageDefault = { defaultRef: this.defaultRef, componentRef: this.componentRef };
  }

  /** Re-target the page at another component or platform component, if it has a schema. */
  async switchComponent(name) {
    // A heading such as "FooBar Component" / "Sensor" re-targets the rest of the page
    const platform = this.folder !== "components" && this.store.isPlatform(this.folder) ? this.folder : null;
    for (const ref of [
      await this.componentSchemaRef(name),
      platform && (await this.componentSchemaRef(name, platform)),
    ]) {
      if (ref) {
        this.defaultRef = ref;
        this.componentRef = ref.split("+")[0].replace(/\.CONFIG_SCHEMA$/, "");
        return true;
      }
    }
    return false;
  }

  /** The action/condition reference an `x.y` heading names, resolved against this page. */
  async registryRef(name, type) {
    const { store } = this;
    const parts = name.split(".");
    const candidates = [];
    if (parts.length === 1) {
      candidates.push(`${this.componentRef}.${type}.${name}`);
      candidates.push(`core.${type}.${name}`);
    } else if (parts.length === 2) {
      candidates.push(`${parts[0]}.${type}.${parts[1]}`);
    } else if (store.isPlatform(parts[0])) {
      candidates.push(`${parts[1]}.${parts[0]}.${type}.${parts.slice(2).join(".")}`);
    } else {
      candidates.push(`${parts[0]}.${type}.${parts.slice(1).join(".")}`);
    }
    for (const ref of candidates) if (await store.exists(ref)) return ref;
    return null;
  }

  /**
   * A filter or effect entry a heading names ("Strobe Effect", `delta`): `{ ref }` when the
   * bundle has it, `{ missing }` for a suffixed heading whose entry does not exist, null for
   * any other heading. A bare `name` heading without an entry is left alone: on the pages
   * that document filters that way it is usually a trigger such as `on_press`.
   */
  async findRegistryEntry(headingText) {
    const { store } = this;
    const platform = store.isPlatform(this.folder) ? this.folder : this.componentRef;
    for (const [registry, suffix] of COMPONENT_REGISTRIES[platform] ?? []) {
      let name = null;
      if (suffix === null) {
        const m = headingText.match(/^`(.+)`$/);
        if (m) name = m[1];
      } else if (headingText.endsWith(suffix)) {
        name = slug(headingText.slice(0, -suffix.length));
        name = REGISTRY_NAME_ODDITIES[`${platform}.${registry}`]?.[name] ?? name;
      }
      if (name) {
        const ref = `${platform}.${registry}.${name}`;
        if (await store.exists(ref)) return { ref };
        if (suffix !== null) return { missing: `${registry} '${name}'` };
      }
    }
    return null;
  }

  /** Start the config section the bullets that follow belong to. */
  async openSection(ref, depth, line, source) {
    const { store, report } = this;
    if (this.pendingMarker) {
      // The marker names the schema for whatever section comes next
      ref = this.pendingMarker.ref;
      source = "marker";
      this.pendingMarker = null;
    }
    if (this.section && this.section.ref === ref) {
      this.section.depth = Math.max(this.section.depth, depth);
      return;
    }
    await this.closeSection();
    report.stats.sections++;
    if (source === "marker") report.stats.sectionsByMarker++;
    const inner = ref ? await store.resolve(ref) : null;
    if (!inner) {
      report.stats.sectionsUnroutable++;
      report.add("unroutable_section", this.rel, line, {
        detail: ref ? `schema '${ref}' not found` : "no schema for this page section",
      });
      this.section = null;
      this.failedSection = { depth, defaultRef: this.defaultRef };
      return;
    }
    this.failedSection = null;
    // A heading that routes on its own, under a trigger the bundle could not place, gets its options written;
    // the page's default schema, whether a heading or a bare list reopened it, stays held
    if (source !== "default" && source !== "implicit") this.holdEmit = null;
    if (inner.baseRef && !inner.hasBase) {
      report.add("missing_base_schema", this.rel, line, {
        schema: ref,
        detail: `${inner.baseRef} has no ${inner.baseRef.toUpperCase()}_SCHEMA to hold keys its platforms share`,
      });
    }
    this.section = { ref, inner, depth, documented: new Set(), line, continued: false, source };
    // Grouped actions are audited one by one; a bus union or a hub joined with its platform stays one audit,
    // since the hub is audited on its own page
    if (ref.includes("+") && /^[^/]*\.(action|condition|filter|effects)\./.test(ref)) {
      this.section.members = await this.unionMembers_(ref, line);
    }
    this.lastEnumProps = [];
    report.sections.push({ file: this.rel, line, ref, source });
    await store.verifyExtends(inner);
  }

  /** A key documented by its own heading counts for the audit of the schema that holds it. */
  markDocumented(ref, key, line) {
    if (this.section?.ref === ref) {
      this.section.documented.add(key);
      return;
    }
    const audit = this.audits.get(ref);
    if (audit) audit.documented.add(key);
    else this.audits.set(ref, { inners: [], documented: new Set([key]), line });
  }

  /** Fold a closed section's documented keys into its schema's audit, which runs once at the end of the page. */
  reportUndocumented(s) {
    // "## Actions" opens the union of the actions under it; when nothing was listed there the actions are
    // audited by their own sections
    if (s.auditIfUsed && s.documented.size === 0) return;
    // What a heading naming several actions documented counts for each of them
    if (s.members) {
      for (const member of s.members) this.mergeAudit_(member.ref, member.inner, s.documented, s.line);
      return;
    }
    this.mergeAudit_(s.ref, s.inner, s.documented, s.line);
  }

  // A schema documented in several sections of a page is audited once, at the end
  mergeAudit_(ref, inner, documented, line) {
    const audit = this.audits.get(ref);
    if (audit) {
      for (const key of documented) audit.documented.add(key);
      if (!audit.inners.includes(inner)) audit.inners.push(inner);
    } else {
      this.audits.set(ref, { inners: [inner], documented: new Set(documented), line });
    }
  }

  /** The member schemas of a union reference such as `a+b/options`, each with its own nested path, for the audit. */
  async unionMembers_(ref, line) {
    const [base, ...props] = ref.split("/");
    const members = [];
    for (const part of base.split("+")) {
      let inner = await this.store.resolve(part);
      for (const prop of props) inner = await this.store.nestedInner(inner, prop);
      this.addMember_(members, [part, ...props].join("/"), inner, line);
    }
    return members;
  }

  /** The members of a union section one level further down, for a `prop` sub-section. */
  async nestedMembers_(members, prop, line) {
    const out = [];
    for (const m of members) {
      this.addMember_(out, `${m.ref}/${prop}`, await this.store.nestedInner(m.inner, prop), line);
    }
    return out;
  }

  /** Keep a resolved member for the audit; one the grouped heading's path does not reach is reported instead. */
  addMember_(members, ref, inner, line) {
    if (inner) {
      members.push({ ref, inner });
      return;
    }
    this.report.add("unroutable_section", this.rel, line, {
      detail: `schema '${ref}' not found under a grouped heading`,
    });
  }

  /** Report the keys of every schema the page documented that none of its sections mentioned. */
  reportAudits() {
    for (const [ref, audit] of this.audits) {
      // The same reference may cover one nested schema per typed variant
      const expected = new Set(audit.inners.flatMap((inner) => [...this.store.ownKeys(inner)]));
      for (const key of expected) {
        if (!audit.documented.has(key)) {
          this.report.stats.keysUndocumented++;
          this.report.add("undocumented_key", this.rel, audit.line, { schema: ref, key });
        }
      }
    }
  }

  /** Leave a `prop` sub-section, reporting what its docs left out. */
  popSubSection(audit = true) {
    if (audit) this.reportUndocumented(this.section);
    this.section = this.section.parent;
  }

  /** End the current section, reporting what its bullets left out. */
  async closeSection() {
    while (this.section?.parent) this.popSubSection();
    const s = this.section;
    if (!s) return;
    this.section = null;
    this.lastEnumProps = [];
    this.reportUndocumented(s);
  }

  // -- emit helpers ---------------------------------------------------------

  links(text) {
    return convertLinks(text, this.url, this.deployUrl);
  }

  /** A description plus the See-also link to the section it came from. */
  withSeeAlso(text) {
    const anchor = this.lastHeadingSlug ? `#${this.lastHeadingSlug}` : "";
    return `${this.links(text)}\n\n*See also: [${this.title}](${this.deployUrl}${this.url}${anchor})*`;
  }

  /** First paragraph after index in the top-level children, or null if a code block comes first. */
  leadParagraph(children, index) {
    for (let i = index; i < children.length; i++) {
      const n = children[i];
      if (["mdxjsEsm", "mdxJsxFlowElement", "mdxFlowExpression", "heading", "html", "blockquote"].includes(n.type)) {
        continue;
      }
      if (n.type === "paragraph") return nodeText(this.tree, n);
      return null;
    }
    return null;
  }

  /** Write the page/section intro for the component or platform entry the docs describe. */
  async emitComponentDocs(name, platform, text, line = 1) {
    const { store, report } = this;
    const target = platform ? `${name}.${platform}` : name;
    // The entry is checked before the intro: a missing one is a mismatch, a missing paragraph only a note
    const entry = platform ? (await store.file(platform))?.[platform]?.components?.[name] : store.core.components[name];
    if (!entry) {
      const where = platform ? `${platform}.json has no component ${name}` : `core.components has no ${name}`;
      report.add("missing_schema_entry", this.rel, line, { detail: where });
      return;
    }
    if (!text) {
      report.add("no_intro_paragraph", this.rel, line, { detail: `no paragraph to describe ${target}` });
      return;
    }
    if (platform) {
      if (!this.emit) return;
      entry.docs = this.withSeeAlso(text);
      report.stats.emitted.platformDocs++;
      return;
    }
    // The first page of this run to introduce a component wins; a rerun over an emitted bundle
    // still replaces the intro an earlier run wrote
    if (this.emit && !store.componentIntros.has(name)) {
      store.componentIntros.add(name);
      entry.docs = this.withSeeAlso(text);
      report.stats.emitted.componentDocs++;
    }
  }

  /** Write the paragraph under an action, condition, filter or effect heading. */
  async emitRegistryDocs(ref, type, text, line = 1) {
    const entry = await this.store.entry(ref);
    if (!entry) {
      this.report.add("missing_schema_entry", this.rel, line, { detail: `${ref} has no schema entry` });
      return;
    }
    if (!text) {
      this.report.add("no_intro_paragraph", this.rel, line, { detail: `no paragraph to describe ${ref}` });
      return;
    }
    if (!this.emit) return;
    entry.docs = this.links(text);
    const e = this.report.stats.emitted;
    if (type === "action") e.actionDocs++;
    else if (type === "condition") e.conditionDocs++;
    else e.registryDocs++;
  }

  /** The schema's spelling of an enum value, matched case-insensitively. */
  enumValueKey(prop, value) {
    value = String(value).replace(/^`|`$/g, ""); // **`value`**: bold around code keeps the backticks
    if (Object.hasOwn(prop.values, value)) return value;
    const lower = value.toLowerCase();
    return Object.keys(prop.values).find((k) => k.toLowerCase() === lower) ?? null;
  }

  /**
   * Record a choice's docs and default on the enum, or on that type of every entry of a typed discriminator.
   * isDefault true sets the flag, false clears it (an explicit `default: false`), undefined leaves it alone.
   */
  writeEnumValue(prop, key, docs, isDefault) {
    const targets = prop.typedEntries ? prop.typedEntries.map((e) => e.types) : [prop.values];
    for (const values of targets) {
      // A variant that does not declare this choice is left alone: the docs never add a type
      if (!Object.hasOwn(values, key)) continue;
      const value = (values[key] ||= {});
      if (isDefault === true) value.default = true;
      else if (isDefault === false) delete value.default;
      if (docs !== undefined) value.docs = docs;
    }
  }

  /** The enum definitions a bullet's key has in this section, for an <EnumValues/> block that follows it. */
  async enumHolders(inner, key, found) {
    const holders = inner.typedKey || inner.multi ? await this.store.propHolders(inner, key) : [];
    const props = holders.length ? holders.map((h) => h.prop) : [found.prop];
    return props.filter((p) => p?.type === "enum");
  }

  /**
   * An <EnumValues/> block: attach its descriptions to the enum definitions it follows. A choice is written
   * to every definition that declares it and is unknown only when none does.
   */
  enumValuesBlock(node, props) {
    const line = node.position.start.line;
    const { entries, error } = parseEnumValues(node);
    if (error) {
      this.report.add("malformed_enum_values", this.rel, line, { detail: error });
      return;
    }
    const enums = this.enumTargets(props, line);
    if (enums === null) {
      this.report.add("enum_values_without_enum", this.rel, line, {
        detail: "<EnumValues> does not follow an enum option",
      });
      return;
    }
    if (!enums.length) return;
    const defaults = new Map();
    for (const entry of entries) {
      const holders = this.enumHoldersOf(enums, entry.value);
      if (!holders.length) {
        this.report.add("unknown_enum_value", this.rel, line, {
          key: String(entry.value),
          detail: `not one of ${this.enumChoices(enums)}`,
        });
        continue;
      }
      if (!this.writing) continue;
      for (const [prop, key] of holders) {
        this.writeEnumValue(prop, key, entry.description ? this.links(entry.description) : undefined, entry.default);
        if (entry.default) defaults.set(prop, key);
      }
      this.report.stats.emitted.enumDocs++;
    }
    this.settleDefaults(defaults);
  }

  /**
   * A list or block that marks a default names every choice, so the mark is the whole truth: on a rerun over
   * an emitted bundle the flag moves instead of piling up on the old choice.
   */
  settleDefaults(defaults) {
    for (const [prop, kept] of defaults) {
      const targets = prop.typedEntries ? prop.typedEntries.map((e) => e.types) : [prop.values];
      for (const values of targets) {
        // A target without the chosen choice was not written to, so its own default stands
        if (!Object.hasOwn(values, kept)) continue;
        for (const [key, value] of Object.entries(values)) {
          if (key !== kept && value?.default) delete value.default;
        }
      }
    }
  }

  /** The enum definitions among props, or null when none is an enum; definitions without values are reported. */
  enumTargets(props, line) {
    const enums = (props ?? []).filter((p) => p?.type === "enum");
    if (!enums.length) return null;
    const withValues = enums.filter((p) => p.values);
    if (!withValues.length) {
      this.report.add("enum_without_values", this.rel, line, { detail: "the schema lists no values for this enum" });
    }
    return withValues;
  }

  /** The [definition, key] pairs among enums that declare a documented choice. */
  enumHoldersOf(enums, raw) {
    const holders = [];
    for (const prop of enums) {
      const key = this.enumValueKey(prop, raw);
      if (key !== null) holders.push([prop, key]);
    }
    return holders;
  }

  enumChoices(enums) {
    return [...new Set(enums.flatMap((p) => Object.keys(p.values)))].join(", ");
  }

  /** Write the descriptions of a `value`: text bullet list to the enum's values. */
  emitEnumList(props, listNode) {
    const enums = this.enumTargets(props, listNode.position.start.line);
    if (!enums?.length) return;
    const defaults = new Map();
    for (const item of listNode.children) {
      if (!item.children.some((c) => c.type === "paragraph")) continue;
      const line = item.position.start.line;
      const m = ENUM_RE.exec(itemText(this.tree, item));
      if (!m) {
        this.report.add("malformed_enum_bullet", this.rel, line, { detail: "expected `value`: description" });
        continue;
      }
      const holders = this.enumHoldersOf(enums, m[1] ?? m[2]);
      const note = m[4];
      // "(default)" or "(*default*)" after the value
      const noteDefault = note !== undefined && /^\*{0,2}default\*{0,2}$/i.test(note.trim());
      let desc = m[3] ?? m[5] ?? (noteDefault ? undefined : note);
      // "(default)" after the value, or a description that is only the word, marks the default value
      const descDefault = desc !== undefined && /^\*{0,2}default\*{0,2}$/i.test(desc.trim());
      if (descDefault) desc = undefined;
      const isDefault = noteDefault || descDefault;
      if (!holders.length) {
        this.report.add("unknown_enum_value", this.rel, line, {
          key: m[1] ?? m[2],
          detail: `not one of ${this.enumChoices(enums)}`,
        });
        continue;
      }
      if (!this.writing || (!desc && !isDefault)) continue;
      for (const [prop, key] of holders) {
        this.writeEnumValue(prop, key, desc ? this.links(desc) : undefined, isDefault ? true : undefined);
        if (isDefault) defaults.set(prop, key);
      }
      if (desc) this.report.stats.emitted.enumDocs++;
    }
    this.settleDefaults(defaults);
  }

  /** Attach a config bullet's description to the schema, as the old Python generator did. */
  async emitPropDocs(found, sectionInner, item, parsed) {
    if (!this.writing || !found || parsed.header) return;
    const m = PROP_RE.exec(itemText(this.tree, item));
    if (!m) return;
    const typeText = (m[2] ?? m[3])?.match(LAST_PAREN_RE)?.[1];
    const docText = m[4];
    if (found.typedEntries) {
      for (const entry of found.typedEntries) entry.docs = this.withSeeAlso(docText);
      this.report.stats.emitted.props++;
      return;
    }
    if (sectionInner.variants.length > 1 && (sectionInner.typedKey || sectionInner.multi)) {
      // Typed schema, bus union or a heading covering several actions: document the
      // key in every variant that has it, whether it declares or inherits it
      if (await this.emitPropDocsTyped(sectionInner, item, parsed)) return;
    }
    const { prop, inherited } = found;
    const e = this.report.stats.emitted;
    let converted = this.withSeeAlso(docText);
    if (typeText) {
      const typeParts = typeText.split(",").map((t) => t.trim());
      if (typeParts.length > 1 && !/\[templatable\]/.test(typeParts[1])) {
        converted = `**${this.links(typeParts[1])}**: ${converted}`;
      }
    }
    if (prop.docs === converted) {
      e.propsSkipped++;
      return;
    }
    if (inherited && "docs" in prop) {
      // The base schema already carries different docs: describe it at this level instead of changing the
      // shared base, with a copy of the inherited definition so a consumer that lets a local entry shadow
      // the base keeps the type and sub-schema. The copy is shallow on purpose: nested options and enum
      // values are shared with the base, so their text reaches every schema that inherits the key. The
      // variant whose extends chain reached the key is the one that accepts it.
      const target = found.root ?? sectionInner.variants[0];
      target.config_vars ??= {};
      const refined = (target.config_vars[parsed.key] ??= { ...prop });
      refined.docs = converted;
      e.propsRefined++;
      return;
    }
    prop.docs = converted;
    e.props++;
  }

  /** Document a key in every typed variant (or grouped action) that has it; returns how many did. */
  async emitPropDocsTyped(sectionInner, item, parsed) {
    let written = 0;
    for (const variant of this.store.groupVariants(sectionInner)) {
      const single = { variants: [variant] };
      const found = await this.store.findPropOwner(single, parsed.key);
      if (!found) continue;
      await this.emitPropDocs(found, single, item, parsed);
      written++;
    }
    return written;
  }

  // -- walking --------------------------------------------------------------

  async walk(tree) {
    this.tree = tree;
    this.audits = new Map();
    this.splitHubFromPlatform_(tree);
    this.report.stats.files++;
    this.title = tree.title;
    if (!this.title) {
      this.report.add("missing_title", this.rel, 1, { detail: "frontmatter has no title:" });
      this.title = this.stem;
    }
    {
      const text = this.leadParagraph(tree.children, 0);
      const platform = this.folder !== "components" && this.store.isPlatform(this.folder) ? this.folder : null;
      if (platform && this.stem === "index") {
        if (!text) {
          this.report.add("no_intro_paragraph", this.rel, 1, { detail: `no paragraph to describe ${platform}` });
        } else if (this.emit && this.store.core.platforms[platform]) {
          this.store.core.platforms[platform].docs = this.links(text);
          this.report.stats.emitted.platformIndexDocs++;
        }
      } else if (platform) {
        // A page for a component split by bus (bmp581 documents bmp581_i2c and bmp581_spi) has no entry of its
        // own: the intro goes to each platform component the page's schema union names
        const own = (await this.store.file(platform))?.[platform]?.components?.[this.stem];
        const names =
          !own && this.defaultRef ? [...new Set(this.defaultRef.split("+").map((r) => r.split(".")[0]))] : [this.stem];
        for (const name of names) await this.emitComponentDocs(name, platform, text);
        if (this.store.isComponent(this.stem)) await this.emitComponentDocs(this.stem, null, text);
      } else if (
        this.componentRef !== "core" &&
        this.folder !== "filter" &&
        (this.stem !== "index" || this.folder !== "components")
      ) {
        await this.emitComponentDocs(this.stem === "index" ? this.folder : this.stem, null, text);
      }
    }
    this.rememberPageDefaults();
    for (let i = 0; i < tree.children.length; i++) {
      const node = tree.children[i];
      if (node.type === "heading") await this.heading(node, tree.children, i);
      else if (node.type === "paragraph") await this.paragraph(node);
      else if (node.type === "list") await this.list(node);
      else if (node.type === "mdxFlowExpression") this.expression(node);
      else if (node.type === "mdxJsxFlowElement" && node.name === "EnumValues") {
        this.enumValuesBlock(node, this.lastEnumProps);
      }
    }
    await this.closeSection();
    this.reportAudits();
    this.dropMarker();
  }

  /** A {/* schema: ref *\/} marker: remember it for the next section. */
  expression(node) {
    const m = node.value.match(MARKER_RE);
    if (!m) {
      if (/schema/i.test(node.value)) {
        this.report.add("malformed_schema_marker", this.rel, node.position.start.line, {
          detail: `expected {/* schema: <ref> */}, got ${node.value.trim()}`,
        });
      }
      return;
    }
    this.dropMarker();
    this.pendingMarker = { ref: m[1], line: node.position.start.line };
  }

  /** Report a marker that applied to nothing and forget it. */
  dropMarker() {
    if (!this.pendingMarker) return;
    this.report.add("unused_schema_marker", this.rel, this.pendingMarker.line, {
      detail: `{/* schema: ${this.pendingMarker.ref} */} did not apply to any section`,
    });
    this.pendingMarker = null;
  }

  /** A bold "Configuration variables:" paragraph acts as a section heading. */
  async paragraph(node) {
    const text = toString(node).trim();
    if (CONFIG_VARS_RE.test(text) && node.children.length === 1 && node.children[0].type === "strong") {
      // **Configuration variables:** used as a pseudo heading under an action, nested in the open section
      await this.openConfigSection((this.section?.depth ?? 1) + 1, node.position.start.line);
    }
  }

  /** Open the section a "Configuration variables" heading introduces. */
  async openConfigSection(depth, line) {
    // A heading nested under an action heading opened its own section, so the action's
    // pending reference is stale: "#### Configuration variables" lists the nested options
    if (this.pendingRegistry && this.section?.source === "heading" && this.section.depth > this.pendingRegistryDepth) {
      this.pendingRegistry = null;
    }
    // "### Configuration variables" under "## `on_boot`" or "## Light state" lists
    // that schema's options, until an unrelated heading has intervened
    if (
      this.section &&
      (this.section.ref.includes("/") || this.section.source === "heading") &&
      !this.section.interrupted &&
      depth > this.section.depth &&
      !this.pendingMarker &&
      !this.pendingRegistry
    ) {
      return;
    }
    if (this.pendingMarker) {
      await this.openSection(this.pendingMarker.ref, depth, line, "marker");
    } else if (this.pendingRegistry) {
      const ref = this.pendingRegistry;
      this.pendingRegistry = null;
      await this.openSection(ref, depth, line, "registry");
      // The action heading owns the section, whatever heading reopened it
      if (this.section) this.section.ownerDepth = this.pendingRegistryDepth;
    } else if (
      this.failedSection &&
      depth > this.failedSection.depth &&
      this.failedSection.defaultRef === this.defaultRef
    ) {
      // "### Configuration variables" under a heading that matched no schema
      this.report.stats.sections++;
      this.report.stats.sectionsUnroutable++;
      this.report.add("unroutable_section", this.rel, line, { detail: "options of a section that matched no schema" });
    } else {
      await this.openSection(this.defaultRef, depth, line, "default");
    }
  }

  /** Route a heading: section breaks, actions, component switches, sub-schemas. */
  async heading(node, siblings = [], index = 0) {
    const { store } = this;
    const text = toString(node).trim();
    const line = node.position.start.line;
    this.lastHeadingSlug = this.slugger.slug(toString(node).replace(/\./g, "-"));
    this.lastHeadingDepth = node.depth;
    this.lastEnumProps = [];
    if (this.failedSection && node.depth <= this.failedSection.depth) this.failedSection = null;
    if (this.holdEmit !== null && node.depth <= this.holdEmit) this.holdEmit = null;
    const intro = () => this.leadParagraph(siblings, index + 1);

    // A bus or component heading re-targets the page only for its own subtree; its section ends with it,
    // so bullets under the next heading reach the page's own schema again
    if (this.switchDepth !== null && node.depth <= this.switchDepth) {
      if (this.section) await this.closeSection();
      this.defaultRef = this.pageDefault.defaultRef;
      this.componentRef = this.pageDefault.componentRef;
      this.switchDepth = null;
    }

    if (CONFIG_VARS_RE.test(text)) {
      await this.openConfigSection(node.depth, line);
      return;
    }

    if (this.section) this.section.enumProp = null;
    // A marker applies to the section right after it; a second heading means it was not used
    if (this.pendingMarker && this.pendingMarker.line < (this.lastMarkerHeadingLine ?? 0)) this.dropMarker();
    this.lastMarkerHeadingLine = line;
    // Leave `prop` sub-sections that this heading is not nested under
    while (this.section?.parent && node.depth <= this.section.depth) this.popSubSection();
    // "## Project information" opened the `project` sub-schema; a sibling heading ends it
    if (this.section && !this.section.parent && this.section.ref.includes("/") && node.depth <= this.section.depth) {
      await this.closeSection();
    }
    if (this.pendingRegistry && node.depth <= this.pendingRegistryDepth) this.pendingRegistry = null;
    const lastWord = slug(text).split("_").pop();
    const isBreak =
      /^see also$/i.test(text) ||
      store.isPlatform(lastWord) ||
      ["action", "actions", "condition", "conditions", "component", "components", "hub"].includes(lastWord) ||
      bareCodeHeading(node) !== null ||
      (this.section?.depth >= node.depth && node.depth <= 1);
    if (this.section && isBreak && node.depth <= this.section.depth) await this.closeSection();
    else if (this.section && !CONFIG_VARS_RE.test(text)) {
      this.section.continued = true;
      // A sibling heading ends what a heading-selected schema covers
      if (node.depth <= this.section.depth) this.section.interrupted = true;
    }

    const trigPath = triggerHeading(node);
    const trig = trigPath?.split(".").pop();
    if (trig) {
      // The page's own schema is tried after the current one: a hub documents its triggers after
      // the sections of its platforms. nestedInner sees through a docs-only copy of an inherited trigger.
      // "`vane.on_state`" is first read as the nested key path vane/on_state, then as the component-qualified
      // name "time.on_time", whose last word is the trigger
      const pageRef = this.pageDefault?.defaultRef;
      const nestedPath = trigPath.split(".").slice(0, -1);
      // "### `on_done` Trigger" under "## `foo.do` Action" is the action's trigger before the component's
      const ownerDepth = this.section?.ownerDepth ?? this.section?.depth;
      const sectionRef = this.section && node.depth > ownerDepth ? this.section.ref : null;
      const refs = [sectionRef, this.defaultRef, pageRef].filter((r, i, all) => r && all.indexOf(r) === i);
      for (const ref of refs) {
        if (!ref) continue;
        for (const path of nestedPath.length ? [nestedPath, []] : [[]]) {
          const holder = path.length ? `${ref}/${path.join("/")}` : ref;
          if (!(await store.nestedInner(await store.resolve(holder), trig))) continue;
          this.markDocumented(holder, trig, line);
          await this.openSection(`${holder}/${trig}`, node.depth, line, "heading");
          return;
        }
      }
      // Platform index pages document triggers the bundle does not place under the platform's schemas;
      // their options are neither written nor audited, since the text may belong to another trigger's key of
      // the same name. On a component page the options are not the component's: drop them until this
      // heading's subtree ends, as for an unknown action
      this.report.add("unresolved_trigger", this.rel, line, {
        detail: `trigger '${trig}' not under ${this.defaultRef}`,
      });
      if (this.defaultRef && !this.defaultRef.endsWith(".*")) {
        this.pendingRegistry = null;
        await this.closeSection();
        this.failedSection = { depth: node.depth, defaultRef: this.defaultRef };
        return;
      }
      this.holdEmit = node.depth;
    }

    // A heading such as "## Typed Read/Write Actions" with no code span introduces the action headings nested
    // under it, and a list right under it holds what those actions share; "## All actions" covers every action
    const plainRegistry = /^(action|condition)s?$/.exec(lastWord)?.[1];
    if (plainRegistry && !node.children.some((c) => c.type === "inlineCode")) {
      const names = [];
      for (let i = index + 1; i < siblings.length; i++) {
        const next = siblings[i];
        if (next.type !== "heading") continue;
        if (next.depth <= node.depth) break;
        const sub = registryHeading(next);
        if (sub && sub.type === plainRegistry) names.push(...sub.names);
      }
      const refs = [];
      for (const name of names) {
        const r = await this.registryRef(name, plainRegistry);
        if (r) refs.push(r);
      }
      if (!refs.length && /^(all_)?(actions|conditions)$/.test(slug(text))) {
        const comp = this.componentRef?.split(".")[0];
        for (const name of Object.keys((await store.file(comp))?.[this.componentRef]?.[plainRegistry] ?? {})) {
          refs.push(`${this.componentRef}.${plainRegistry}.${name}`);
        }
      }
      if (refs.length) {
        const ref = refs.join("+");
        await this.closeSection();
        await this.openSection(ref, node.depth, line, "registry");
        if (this.section) {
          this.section.ownerDepth = node.depth;
          this.section.auditIfUsed = true;
        }
        this.pendingRegistry = ref;
        this.pendingRegistryDepth = node.depth;
        return;
      }
    }

    const reg = registryHeading(node);
    if (reg) {
      const refs = [];
      for (const name of reg.names) {
        const r = await this.registryRef(name, reg.type);
        if (r) refs.push(r);
        else if (reg.names.length > 1) {
          this.report.add("unknown_registry_entry", this.rel, line, { detail: `${reg.type} '${name}' not in schema` });
        }
      }
      for (const r of refs) await this.emitRegistryDocs(r, reg.type, intro(), line);
      if (refs.length) {
        // Many action docs list options directly under the heading; a heading
        // naming several actions documents the options of each of them
        const ref = refs.join("+");
        await this.openSection(ref, node.depth, line, "registry");
        if (this.section) this.section.ownerDepth = node.depth;
        this.pendingRegistry = ref;
        this.pendingRegistryDepth = node.depth;
      } else {
        this.report.add("unknown_registry_entry", this.rel, line, {
          detail: `${reg.type} '${reg.name}' not in schema`,
        });
        this.pendingRegistry = null;
        // Its options are not the component's: drop them until this heading's subtree ends
        await this.closeSection();
        this.failedSection = { depth: node.depth, defaultRef: this.defaultRef };
      }
      return;
    }

    const registryEntry = await this.findRegistryEntry(
      node.children.some((c) => c.type === "inlineCode") ? `\`${bareCodeHeading(node) ?? ""}\`` : text,
    );
    if (registryEntry?.ref) {
      await this.emitRegistryDocs(registryEntry.ref, "registry", intro(), line);
      await this.openSection(registryEntry.ref, node.depth, line, "registry");
      if (this.section) this.section.ownerDepth = node.depth;
      this.pendingRegistry = registryEntry.ref;
      this.pendingRegistryDepth = node.depth;
      return;
    }
    if (registryEntry?.missing) {
      // Its options are not the platform's: drop them until this heading's subtree ends, as for an
      // unknown action
      this.report.add("unknown_registry_entry", this.rel, line, { detail: `${registryEntry.missing} not in schema` });
      this.pendingRegistry = null;
      await this.closeSection();
      this.failedSection = { depth: node.depth, defaultRef: this.defaultRef };
      return;
    }

    // "## `custom` VBus sensors": a typed variant of this page's sensor platform
    const variantCode =
      bareCodeHeading(node) === null ? node.children.find((c) => c.type === "inlineCode")?.value : null;
    if (variantCode && this.stem !== "index") {
      const words = slug(toString({ children: node.children.filter((c) => c.type !== "inlineCode") })).split("_");
      const candidates = [words.slice(-2).join("_"), words.at(-1) ?? ""].map((w) => w.replace(/s$/, ""));
      const platformWord = candidates.find((w) => w && store.isPlatform(w));
      if (platformWord) {
        const ref = `${this.stem}.${platformWord}.CONFIG_SCHEMA[${variantCode}]`;
        if (await store.exists(ref)) {
          await this.closeSection();
          this.defaultRef = ref;
          this.componentRef = `${this.stem}.${platformWord}`;
          this.switchDepth = null;
          return;
        }
      }
    }

    const switched = async (name, scoped = false) => {
      if (!(await this.switchComponent(name))) return false;
      await this.closeSection();
      this.switchDepth = scoped ? node.depth : null;
      const [comp, platform] = this.componentRef.split(".");
      await this.emitComponentDocs(comp, platform ?? null, intro(), line);
      return true;
    };
    // A heading that names a schema the bundle lacks: its options are not the
    // page component's, so routing stays blocked until this subtree ends
    const unresolved = async (name) => {
      this.report.add("unresolved_component_heading", this.rel, line, {
        detail: `"${text}" names no schema (tried ${name})`,
      });
      this.pendingRegistry = null;
      await this.closeSection();
      this.failedSection = { depth: node.depth, defaultRef: this.defaultRef };
    };
    // "Over SPI" on a component whose schema is typed by bus: that variant
    const busVariant = async (kind) => {
      const ref = `${this.pageDefault.defaultRef}[${kind}]`;
      if (!this.pageDefault.defaultRef || !(await store.resolve(ref))) return false;
      await this.closeSection();
      this.defaultRef = ref;
      this.switchDepth = node.depth;
      return true;
    };
    if (text === "Component/Hub" || text === "Hub Component") {
      if (await switched(this.stem)) return;
      await unresolved(this.stem);
      return;
    } else if (/ Component$/.test(text)) {
      const name = slug(text.replace(/ Component$/, "").replace(/\./g, ""));
      if (await switched(name)) return;
      await unresolved(name);
      return;
    }
    // Bus headings describe one wiring of the same component; the sibling
    // sections that follow belong to the page again
    if (/Over SPI$/i.test(text)) {
      if ((await switched(`${this.stem}_spi`, true)) || (await busVariant("spi"))) return;
      await unresolved(`${this.stem}_spi`);
      return;
    }
    if (/Over I²C$/i.test(text)) {
      if ((await switched(`${this.stem}_i2c`, true)) || (await busVariant("i2c"))) return;
      await unresolved(`${this.stem}_i2c`);
      return;
    }
    if (this.stem !== "index") {
      // "## `ttp229_bsf` Binary Sensor" names the component the platform belongs to; otherwise it is the page's
      const code = node.children.find((c) => c.type === "inlineCode")?.value;
      const owner = code && (await store.knownComponent(code)) ? code : this.stem;
      let platformName = slug(text);
      for (const prefix of new Set([`${slug(owner)}_`, `${slug(this.componentRef?.split(".")[0] ?? "")}_`])) {
        if (platformName.startsWith(prefix)) platformName = platformName.slice(prefix.length);
      }
      // "## Sensors" on a hub page is its sensor platform, when it has one
      const singular = platformName.replace(/s$/, "");
      if (
        !store.isPlatform(platformName) &&
        store.isPlatform(singular) &&
        (await this.componentSchemaRef(owner, singular))
      ) {
        platformName = singular;
      }
      if (store.isPlatform(platformName)) {
        const ref = await this.componentSchemaRef(owner, platformName);
        if (ref) {
          // "### Select" nested under the hub's options still starts the select platform's section
          await this.closeSection();
          this.defaultRef = ref;
          this.componentRef = `${owner}.${platformName}`;
          this.switchDepth = null;
          await this.emitComponentDocs(owner, platformName, intro(), line);
          return;
        }
      }
      // "## Clockless" in fastled.mdx -> fastled_clockless, "## I²C" in bmp581.mdx -> bmp581_i2c
      const alias = slug(text.replace(/²/g, "2"));
      if (await switched(`${this.stem}_${alias}`, alias === "i2c" || alias === "spi")) return;
      if (store.isPlatform(platformName) && bareCodeHeading(node) === null) {
        // The platform's schema is not in the bundle: its options must not reopen the hub's. A bare code
        // heading ("## `switch`" among lvgl's widgets) is a key or sibling schema, looked up below
        await unresolved(`${owner}.${platformName}`);
        return;
      }
    }

    // A heading naming a sibling schema, e.g. "Light state" -> LIGHT_STATE_SCHEMA
    if (this.componentRef && this.componentRef !== "core") {
      const candidate = `${slug(text).toUpperCase()}_SCHEMA`;
      if ((await store.schemaNames(this.componentRef)).includes(candidate)) {
        await this.openSection(`${this.componentRef}.${candidate}`, node.depth, line, "heading");
        return;
      }
    }

    const code = bareCodeHeading(node);
    const inPlatformDir = this.folder !== "components" && store.isPlatform(this.folder);
    if (
      code &&
      inPlatformDir &&
      /^[a-z0-9_]+$/.test(code) &&
      !(this.section && (await store.findProp(this.section.inner, code))) &&
      (await this.componentSchemaRef(code, this.folder))
    ) {
      // climate/climate_ir.mdx: "### `gree`" documents the gree climate platform
      if (await switched(code)) return;
    }

    // "## Legend Options" documents the `legend` sub-schema of the current schema
    const baseRef = this.section?.ref ?? this.defaultRef;
    const underFailed =
      !this.section &&
      this.failedSection &&
      node.depth > this.failedSection.depth &&
      this.failedSection.defaultRef === this.defaultRef;
    if (baseRef && !baseRef.includes("/") && !underFailed) {
      // The open section's inner keeps the union of a grouped action heading; resolving its ref again would not
      const base = this.section ? this.section.inner : await store.resolve(baseRef);
      let first = slug(text);
      let nested = first && (await store.nestedInner(base, first));
      if (!nested) {
        first = first.split("_")[0];
        nested = first && (await store.nestedInner(base, first));
      }
      if (nested) {
        let parent = this.section && !this.section.parent ? this.section : null;
        if (!this.section && baseRef === this.defaultRef && bareCodeHeading(node) === null) {
          // A word heading may name a sub-schema by accident ("## Main Configuration"
          // matched lvgl's `main` style state): keep the page schema underneath so
          // bullets the sub-schema lacks fall back to it
          await this.closeSection();
          parent = { ref: baseRef, inner: base, depth: node.depth, documented: new Set(), line };
          this.report.stats.sections++;
          this.report.sections.push({ file: this.rel, line, ref: `${baseRef}/${first}`, source: "heading" });
        }
        if (parent) {
          parent.documented.add(first);
          this.section = {
            ...parent,
            inner: nested,
            ref: `${parent.ref}/${first}`,
            // A grouped section's members move down with it, so the audit sees each action's nested options
            members: parent.members ? await this.nestedMembers_(parent.members, first, line) : undefined,
            depth: node.depth,
            documented: new Set(),
            parent,
            source: "heading",
            continued: false,
            interrupted: false,
            line,
          };
        } else {
          await this.openSection(`${baseRef}/${first}`, node.depth, line, "heading");
        }
        return;
      }
    }

    // `prop` sub-heading inside an open section: describe a nested schema
    if (code && this.section && node.depth > this.section.depth) {
      const prop = await store.findProp(this.section.inner, code);
      if (prop?.type === "enum") {
        this.lastEnumProps = [prop];
        this.section.enumProp = prop;
        this.section.documented.add(code);
        return;
      }
      const inner = await store.nestedInner(this.section.inner, code);
      if (inner) {
        this.section.documented.add(code);
        this.section = {
          ...this.section,
          inner,
          ref: `${this.section.ref}/${code}`,
          members: this.section.members ? await this.nestedMembers_(this.section.members, code, line) : undefined,
          depth: node.depth,
          documented: new Set(),
          parent: this.section,
          source: "heading",
          continued: false,
          interrupted: false,
          line,
        };
      }
    }
  }

  /** A top-level bullet list: the options of the open section, if any. */
  async list(node) {
    if (this.section) {
      await this.listItems(node);
      return;
    }
    const first = node.children[0] && parseItem(node.children[0]);
    const line = node.position.start.line;
    // "## Base Fan Configuration" / "## A4988 Component" go straight into the
    // option list without a "Configuration variables" heading. After a section
    // that could not be routed the bullets are dropped rather than sent to the
    // page's own schema, unless a heading has since switched to another component.
    const blocked = this.failedSection?.defaultRef === this.defaultRef;
    if (this.defaultRef && !blocked && first?.hasParen && !first.prose) {
      await this.openSection(this.defaultRef, this.lastHeadingDepth ?? 2, line, "implicit");
    }
    if (this.section) {
      await this.listItems(node);
      return;
    }
    const options = node.children.map((item) => parseItem(item)).filter((p) => p?.hasParen && !p.prose);
    if (options.length) {
      this.report.stats.keysOrphaned += options.length;
      this.report.add("orphan_option_list", this.rel, line, {
        key: options[0].key,
        detail: `${options.length} option bullet(s) outside any schema section`,
      });
    }
  }

  async listItems(node) {
    if (this.section.enumProp) {
      this.emitEnumList([this.section.enumProp], node);
      return;
    }
    await this.items(node, this.section.inner, this.section.documented);
  }

  /** Required/Optional in the docs against every definition of the key in the schema. */
  async checkOptionality(inner, parsed, key = parsed.key) {
    if (!parsed.optionality) return;
    const props = await this.store.findProps(inner, key);
    const marked = props.map((p) => p.key?.toLowerCase()).filter((k) => k === "required" || k === "optional");
    // A generated id is optional to the user: "id (Optional)" on a hub joined with a platform agrees with it
    const generated = props.some((p) => p.key === "GeneratedID");
    parsed.optionalityAgrees = marked.includes(parsed.optionality) || (generated && parsed.optionality === "optional");
    if (marked.length && !parsed.optionalityAgrees) {
      this.report.stats.optionalityMismatch++;
      this.report.add("optionality_mismatch", this.rel, parsed.line, {
        schema: this.section?.ref,
        key,
        detail: `docs say ${parsed.optionality}, schema says ${marked[0]}`,
      });
    }
  }

  /** Nested bullets and <EnumValues> blocks under a matched bullet, for every schema holding the key. */
  async nestedContent(item, inner, key, found, ref = this.section?.ref) {
    const lists = item.children.filter((c) => c.type === "list");
    const blocks = item.children.filter((c) => c.type === "mdxJsxFlowElement" && c.name === "EnumValues");
    if (!lists.length && !blocks.length) return;
    // In a typed schema (or a heading covering several actions) the same key may
    // exist in several variants; descend into each
    const holders = inner.typedKey || inner.multi ? await this.store.propHolders(inner, key) : [];
    const props = holders.length ? holders.map((h) => h.prop) : [found.prop];
    const line = item.position.start.line;
    const nestedRef = `${ref}/${key}`;
    const nested = props.map((prop) => propInner(prop)).filter(Boolean);
    if (nested.length) {
      // One walk over the definitions of every variant, so a key only one of them has is matched there
      // and not reported unmatched on the others; each definition is still audited for keys the docs miss
      const merged = nested.length === 1 ? nested[0] : await this.store.nestedInner(inner, key);
      const documented = new Set();
      for (const list of lists) await this.items(list, merged, documented, nestedRef);
      for (const nestedInner of nested)
        this.reportUndocumented({ inner: nestedInner, documented, ref: nestedRef, line });
    }
    const flat = props.filter((prop) => !propInner(prop));
    const enums = flat.filter((prop) => prop.type === "enum");
    if (enums.length) {
      for (const list of lists) this.emitEnumList(enums, list);
    } else if (lists.length && flat.length) {
      this.report.add("nested_list_ignored", this.rel, line, {
        key,
        detail: `${key} is a ${flat[0].type ?? "plain"} value; its nested bullets have no schema to match`,
      });
    }
    for (const jsx of blocks) this.enumValuesBlock(jsx, props);
  }

  /**
   * A key documented on a platform page but declared only by that platform's
   * components: describe it on the base schema so every platform shows the
   * hover text. Returns the created entry as a match, or null.
   */
  async createFromChildren(inner, parsed, item, documented) {
    const { store, report } = this;
    if (!inner.hasBase) return null;
    const children = (await store.childrenOf(inner.baseRef)).filter((v) => v.config_vars?.[parsed.key]);
    if (!children.length) return null;
    report.stats.keysMatched++;
    documented.add(parsed.key);
    this.checkBullet(item, parsed);
    await this.checkOptionality({ variants: children }, parsed);
    const childProp = children[0].config_vars[parsed.key];
    if (!this.emit) return { prop: childProp, inherited: false, created: true, children };
    const base = inner.variants[0];
    base.config_vars ??= {};
    // The key joins the base schema only once it has docs; a header or malformed bullet writes none
    const existing = base.config_vars[parsed.key];
    const created = existing ?? {};
    if ("key" in childProp) created.key ??= childProp.key;
    await this.emitPropDocs({ prop: created, inherited: false }, inner, item, parsed);
    if (!existing && "docs" in created) base.config_vars[parsed.key] = created;
    return { prop: created, inherited: false, created: true, children };
  }

  /** A bullet the generator will not be able to turn into docs. */
  checkBullet(item, parsed) {
    if (!parsed.header && !PROP_RE.test(itemText(this.tree, item))) {
      this.report.add("malformed_prop_bullet", this.rel, parsed.line, {
        key: parsed.key,
        detail: "expected **key** (type): description",
      });
    }
  }

  /** Match each option bullet of a list against the schema and emit its docs. */
  async items(listNode, inner, documented, ref = this.section?.ref) {
    const { store, report } = this;
    let siblingListReported = false;
    for (const item of listNode.children) {
      this.lastEnumProps = [];
      const parsed = parseItem(item);
      if (!parsed || parsed.prose) {
        if (parsed?.optionality || (!parsed && LOOKS_LIKE_OPTION_RE.test(itemText(this.tree, item)))) {
          // "`baud_rate` (**Required**, int): ..." or a key that is not lower snake_case
          report.add("malformed_prop_bullet", this.rel, item.position.start.line, {
            key: parsed?.key ?? itemText(this.tree, item).match(/^`([^`]+)`/)?.[1] ?? "",
            detail: parsed ? "option keys are lower snake_case" : "expected **key** (type): description",
          });
        } else {
          report.stats.proseBullets++;
        }
        // "Or a key-value mapping is given, then there are these settings:" lists the options under it
        for (const child of item.children) {
          if (child.type === "list") await this.items(child, inner, documented, ref);
        }
        continue;
      }
      const chosenByHeading = this.section?.source === "heading" || this.section?.source === "registry";
      if (chosenByHeading && this.section.interrupted && parsed.hasParen && ref === this.section.ref) {
        // A sibling heading came between this list and the heading that chose the schema: the list may
        // belong to something else, so it is reported rather than written over the previous schema
        if (!siblingListReported) {
          report.add("option_list_after_sibling_heading", this.rel, parsed.line, { schema: ref, key: parsed.key });
          siblingListReported = true;
        }
        report.stats.keysOrphaned++;
        continue;
      }
      if (this.holdEmit !== null) {
        // Under a trigger the bundle cannot place: the bullet is neither matched against the page schema
        // nor written nor audited; it counts on the unmatched side of the emit guard
        report.stats.keysHeld++;
        continue;
      }
      let found;
      if (inner.baseRef) {
        // A platform base page: the base schema first, then a key only the
        // platform components declare (created on the base), then the other
        // schemas of the file
        found = await store.findPropOwner({ variants: inner.variants.slice(0, inner.primaryCount) }, parsed.key);
        // A docs-only entry is what an earlier emission created on the base; its nested text
        // still has to reach the children that define the key
        if (!found || isDocsOnly(found.prop)) {
          found = (await this.createFromChildren(inner, parsed, item, documented)) ?? found;
        }
      }
      found ??= await store.findPropOwner(inner, parsed.key);
      if (!found && this.section?.parent && inner === this.section.inner) {
        // "### Sensitivity" opened the `sensitivity` sub-schema, but the bullets that
        // follow may still be the parent's options: fall back to the nearest ancestor
        let ancestor = this.section.parent;
        while (ancestor && !(found = await store.findPropOwner(ancestor.inner, parsed.key))) ancestor = ancestor.parent;
        if (found) {
          // A sub-schema heading whose bullets all belong to an ancestor was a misroute
          while (this.section !== ancestor) this.popSubSection(this.section.documented.size > 0);
          inner = this.section.inner;
          documented = this.section.documented;
        }
      }
      if (!found && this.section?.continued && inner === this.section.inner && !parsed.hasParen) {
        // After an unrelated heading, a bare "**word**: text" bullet is prose unless it names a key
        report.stats.proseBullets++;
        continue;
      }
      if (!found) {
        const family = store.numberedFamily(inner, parsed.key);
        if (family.length) {
          report.stats.keysMatched++;
          this.checkBullet(item, parsed);
          for (const k of family) {
            documented.add(k);
            const member = await store.findPropOwner(inner, k);
            await this.checkOptionality(inner, parsed, k);
            await this.emitPropDocs(member, inner, item, { ...parsed, key: k });
            await this.nestedContent(item, inner, k, member, ref);
          }
          continue;
        }
        const nestedProps = await store.findNestedProps(inner, parsed.key);
        if (nestedProps.length) {
          // Two sub-schemas with the same key (on_boot/on_shutdown priority)
          // cannot be told apart from a flat list, and every sub-schema has an
          // `id`: match, but do not document
          if (nestedProps.length === 1 && parsed.key !== "id") {
            report.stats.keysMatchedNested++;
          } else {
            report.stats.keysOrphaned++;
          }
          if (nestedProps.length === 1 && parsed.key === "id") {
            report.add("nested_id_skipped", this.rel, item.position.start.line, {
              key: parsed.key,
              detail: "an id bullet of a sub-schema is not written from a flat list; a sub-heading places it",
            });
          }
          if (nestedProps.length > 1) {
            report.add("ambiguous_nested_key", this.rel, item.position.start.line, {
              key: parsed.key,
              detail: `${nestedProps.length} sub-schemas have it; a {/* schema: */} marker or a sub-heading picks one`,
            });
          }
          if (nestedProps.length === 1 && parsed.key !== "id") {
            this.checkBullet(item, parsed);
            await this.checkOptionality({ variants: [{ config_vars: { [parsed.key]: nestedProps[0] } }] }, parsed);
            found = { prop: nestedProps[0], inherited: false };
            const holder = { variants: [{ config_vars: { [parsed.key]: nestedProps[0] } }] };
            await this.emitPropDocs(found, holder, item, parsed);
            this.lastEnumProps = await this.enumHolders(holder, parsed.key, found);
            await this.nestedContent(item, { variants: [] }, parsed.key, found, ref);
          }
          continue;
        }
      }
      if (found?.created) {
        // The base schema only got the key's docs; its type and values live on
        // the platform components, each of which gets the nested text
        const childFound = { prop: found.children[0].config_vars[parsed.key], inherited: false };
        const childInner = { variants: found.children, multi: true };
        this.lastEnumProps = await this.enumHolders(childInner, parsed.key, childFound);
        await this.nestedContent(item, childInner, parsed.key, childFound, ref);
        continue;
      }
      if (!found) {
        report.stats.keysUnmatched++;
        report.add("unmatched_key", this.rel, parsed.line, {
          schema: this.section?.ref,
          key: parsed.key,
        });
        continue;
      }
      report.stats.keysMatched++;
      documented.add(parsed.key);
      this.checkBullet(item, parsed);
      await this.checkOptionality(inner, parsed);
      await this.emitPropDocs(found, inner, item, parsed);
      this.lastEnumProps = await this.enumHolders(inner, parsed.key, found);
      await this.nestedContent(item, inner, parsed.key, found, ref);
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (args.emit && !args["schema-dir"]) {
    console.error("--emit needs --schema-dir");
    return 2;
  }
  if (args.emit && args.file) {
    // The output would look like a full bundle while only the matched pages have docs
    console.error("--emit documents every page; --file is for report runs");
    return 2;
  }
  const store = new SchemaStore({ dir: args["schema-dir"], url: args["schema-url"] });
  await store.init();
  if (args.emit) await store.loadAll();
  if (args.resolve) {
    const inner = await store.resolve(args.resolve);
    console.log(inner ? JSON.stringify([...store.ownKeys(inner)]) : "not found");
    return inner ? 0 : 1;
  }
  const report = new Report();

  let files = listMdx(COMPONENTS_ROOT);
  files.push(join(DOCS_ROOT, "automations", "actions.mdx"));
  if (args.file) {
    files = files.filter((f) => f.includes(args.file));
    if (!files.length) {
      console.error(`--file ${args.file} matches no page`);
      return 2;
    }
  }

  // Platform index pages first so base-schema docs are in place before the
  // platform components refine them (platform components refine base docs).
  const fileOrder = (f) => {
    if (basename(f) === "index.mdx") return 0;
    return dirname(f) === COMPONENTS_ROOT ? 1 : 2;
  };
  files.sort((a, b) => fileOrder(a) - fileOrder(b) || a.localeCompare(b));
  for (const file of files) {
    let tree;
    try {
      tree = parseMdx(file);
    } catch (err) {
      report.add("parse_error", relative(COMPONENTS_ROOT, file), err.line ?? 0, { detail: err.message });
      continue;
    }
    const walker = new Walker(store, report, file, { emit: Boolean(args.emit), deployUrl: args["deploy-url"] });
    await walker.init();
    await walker.walk(tree);
  }

  const parseErrors = report.findings.filter((f) => f.kind === "parse_error").length;
  for (const ref of store.unresolvedExtends ?? []) {
    report.add("unresolved_extends", "(schema bundle)", 0, { detail: `extends '${ref}' points at no schema` });
  }

  const s = report.stats;
  // A changed schema layout must not ship a bundle with no docs
  let broken = null;
  if (parseErrors) {
    broken = `${parseErrors} page(s) could not be parsed`;
  } else if (s.sectionsUnroutable * 2 > s.sections) {
    broken = `${s.sectionsUnroutable} of ${s.sections} sections match no schema`;
  } else if (s.keysUnmatched + s.keysOrphaned + s.keysHeld > s.keysMatched + s.keysMatchedNested) {
    const unplaced = s.keysUnmatched + s.keysOrphaned + s.keysHeld;
    const total = s.keysMatched + s.keysMatchedNested + unplaced;
    broken = `${unplaced} of ${total} documented keys match no schema key or sit under an unplaced trigger`;
  } else if (args.emit && s.emitted.props + s.emitted.propsRefined + s.emitted.propsSkipped < MIN_EMITTED_PROPS) {
    // Unchanged descriptions count too: an in-place run over a documented bundle writes few new ones
    const described = s.emitted.props + s.emitted.propsRefined + s.emitted.propsSkipped;
    broken = `only ${described} options have a description, ${MIN_EMITTED_PROPS} expected at least`;
  } else if (args.emit) {
    const short = Object.entries(MIN_EMITTED_INTROS).find(([kind, floor]) => s.emitted[kind] < floor);
    if (short) broken = `only ${s.emitted[short[0]]} ${short[0]}, ${short[1]} expected at least`;
  }
  // Kinds that are observations rather than mismatches
  const informational = new Set(["no_intro_paragraph", "nested_list_ignored", "nested_id_skipped"]);
  const strict = (kind) => !informational.has(kind);
  const strictCounts = new Map();
  for (const f of report.findings) if (strict(f.kind)) strictCounts.set(f.kind, (strictCounts.get(f.kind) ?? 0) + 1);
  // A page the script could not read blocks a write even without --strict. Broken extends chains do not: the
  // published bundle carries some today, and they come from the schema generator rather than the docs
  const structural = ["parse_error", "malformed_enum_values"].filter((k) => strictCounts.has(k));
  if (args.emit && structural.length && !broken) {
    broken = structural.map((k) => `${k} ${strictCounts.get(k)}`).join(", ");
  }
  if (args.strict && strictCounts.size && !broken) {
    const total = [...strictCounts.values()].reduce((a, b) => a + b, 0);
    broken = `--strict: ${total} finding(s): ${[...strictCounts].map(([k, n]) => `${k} ${n}`).join(", ")}`;
  }
  if (args.emit) {
    if (broken) {
      console.error(`not writing ${args.emit}: ${broken}`);
    } else {
      store.save(args.emit);
    }
    console.log(JSON.stringify(report.stats.emitted, null, 2));
  }

  if (args.json) {
    writeFileSync(
      args.json,
      JSON.stringify({ stats: report.stats, sections: report.sections, findings: report.findings }, null, 2),
    );
  }

  const order = [
    "parse_error",
    "unroutable_section",
    "orphan_option_list",
    "option_list_after_sibling_heading",
    "missing_base_schema",
    "unknown_registry_entry",
    "missing_schema_entry",
    "malformed_enum_values",
    "enum_values_without_enum",
    "malformed_enum_bullet",
    "unknown_enum_value",
    "malformed_prop_bullet",
    "unused_schema_marker",
    "malformed_schema_marker",
    "unresolved_extends",
    "enum_without_values",
    "unmatched_key",
    "optionality_mismatch",
    "unresolved_component_heading",
    "missing_title",
    "undocumented_key",
    "no_intro_paragraph",
    "nested_list_ignored",
    "unresolved_trigger",
    "ambiguous_nested_key",
    "nested_id_skipped",
  ];
  // Kinds the report lists only with --verbose; a kind missing from `order` is always shown
  const verboseOnly = new Set([
    "undocumented_key",
    "no_intro_paragraph",
    "nested_list_ignored",
    "ambiguous_nested_key",
    "nested_id_skipped",
  ]);
  const shown = (kind) => args.verbose || !verboseOnly.has(kind) || !order.includes(kind);
  for (const f of report.findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)) {
    if (!shown(f.kind)) continue;
    const what = f.key ? `'${f.key}'` : "";
    console.log(
      `${f.file}:${f.line}: ${f.kind} ${what} ${f.schema ? `[${f.schema}]` : ""} ${f.detail ?? ""}`
        .replace(/\s+/g, " ")
        .trim(),
    );
  }

  const hidden = new Map();
  for (const f of report.findings) if (!shown(f.kind)) hidden.set(f.kind, (hidden.get(f.kind) ?? 0) + 1);
  console.log(
    [
      `files ${s.files}`,
      `sections ${s.sections} (unroutable ${s.sectionsUnroutable}, by marker ${s.sectionsByMarker})`,
      `keys matched ${s.keysMatched} (+${s.keysMatchedNested} via nested schema), not in schema ${s.keysUnmatched}, outside any section ${s.keysOrphaned}, under unplaced triggers ${s.keysHeld}, in schema but undocumented ${s.keysUndocumented}`,
      `optionality mismatches ${s.optionalityMismatch}`,
      `prose bullets skipped ${s.proseBullets}`,
      ...(hidden.size ? [`not shown without --verbose: ${[...hidden].map(([k, n]) => `${k} ${n}`).join(", ")}`] : []),
    ].join("\n"),
  );
  if (broken) {
    console.error(broken);
    return 1;
  }
  return 0;
}

if (isMain) process.exitCode = await main();
