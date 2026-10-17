import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { unified } from "unified";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";

import { parseEnumValues, parseItem, registryHeading, SchemaStore, toInner } from "../script/schema_doc.mjs";

const parse = (md) => unified().use(remarkParse).use(remarkMdx).parse(md);

test("parseItem reads key and optionality from a config bullet", () => {
  const tree = parse("- **baud_rate** (**Required**, int): The baud rate.\n- **tx_pin** (*Optional*, pin): TX.\n");
  const [a, b] = tree.children[0].children.map(parseItem);
  assert.deepEqual([a.key, a.optionality], ["baud_rate", "required"]);
  assert.deepEqual([b.key, b.optionality], ["tx_pin", "optional"]);
});

test("parseItem recognises a header bullet that only introduces a nested list", () => {
  const tree = parse("- **preset**: (*Optional*, list)\n  - **name** (**Required**, string): Preset name.\n");
  const item = parseItem(tree.children[0].children[0]);
  assert.deepEqual([item.key, item.optionality, item.header, item.hasParen], ["preset", "optional", true, true]);
});

test("parseItem reads a plain Required/Optional marker and flags a bad key", () => {
  const tree = parse("- **baud_rate** (Optional, int): Plain marker.\n- **Baud_Rate** (**Required**, int): Bad key.\n");
  const [a, b] = tree.children[0].children.map(parseItem);
  assert.deepEqual([a.optionality, a.prose], ["optional", false]);
  assert.deepEqual([b.optionality, b.prose], ["required", true]);
});

test("parseItem marks non-key bullets as prose", () => {
  const tree = parse("- **Side** (wall mounted): angle is measured from +X.\n- plain text bullet\n");
  const [a, b] = tree.children[0].children.map(parseItem);
  assert.equal(a.prose, true);
  assert.equal(b, null);
});

test("registryHeading uses the inline code, not the heading text", () => {
  const tree = parse("## `uart.write` Action\n");
  const reg = registryHeading(tree.children[0]);
  assert.deepEqual([reg.name, reg.type], ["uart.write", "action"]);
  const two = registryHeading(parse("## `fan.is_on` / `fan.is_off` Condition\n").children[0]);
  assert.deepEqual(two.names, ["fan.is_on", "fan.is_off"]);
  assert.equal(registryHeading(parse("## Debugging\n").children[0]), null);
});

test("toInner exposes the typed key and all variants", () => {
  const inner = toInner({
    type: "typed",
    typed_key: "role",
    types: { client: { config_vars: { host: { key: "Required" } } }, server: { config_vars: {} } },
  });
  assert.equal(inner.typedKey, "role");
  assert.equal(inner.variants.length, 2);
  assert.equal(toInner({ type: "typed", typed_key: "role", types: { client: {} } }, "server"), null);
});

test("SchemaStore resolves components, platforms, registries and extends", async () => {
  const dir = mkdtempSync(join(tmpdir(), "schema-"));
  writeFileSync(
    join(dir, "esphome.json"),
    JSON.stringify({
      core: {
        components: { foo: {} },
        platforms: { sensor: {} },
        action: { delay: { schema: { config_vars: { delay: { key: "Required" } } } } },
        schemas: { COMPONENT_SCHEMA: { schema: { config_vars: { setup_priority: { key: "Optional" } } } } },
      },
    }),
  );
  writeFileSync(
    join(dir, "foo.json"),
    JSON.stringify({
      foo: {
        schemas: {
          CONFIG_SCHEMA: {
            type: "schema",
            schema: {
              config_vars: { id: { key: "GeneratedID" }, pin: { key: "Required" } },
              extends: ["core.COMPONENT_SCHEMA"],
            },
          },
        },
        action: { toggle: {} },
      },
      "foo.sensor": {
        schemas: {
          CONFIG_SCHEMA: {
            type: "schema",
            schema: { config_vars: { target_1: { key: "Optional" }, target_2: { key: "Optional" } } },
          },
        },
      },
    }),
  );
  const store = new SchemaStore({ dir });
  await store.init();

  const foo = await store.resolve("foo.CONFIG_SCHEMA");
  assert.ok(await store.findProp(foo, "pin"));
  assert.ok(await store.findProp(foo, "setup_priority"), "follows extends into core");
  assert.deepEqual([...store.ownKeys(foo)], ["pin"], "ids are not reported as undocumented");

  assert.ok(await store.resolve("core.action.delay"));
  assert.ok(await store.resolve("foo.action.toggle"), "an empty registry entry still exists");
  assert.equal(await store.resolve("foo.action.missing"), null);

  const sensor = await store.resolve("foo.sensor.CONFIG_SCHEMA");
  assert.deepEqual(store.numberedFamily(sensor, "target_N"), ["target_1", "target_2"]);
  assert.equal((await store.resolve("foo.*")).variants.length, 2, "wildcard unions every schema in the file");
});

test("parseEnumValues reads the <EnumValues> JSX block", () => {
  const block = `<EnumValues values={[
  { value: "ANY",     default: true, description: "Trigger on any edge change (high to low or low to high)" },
  { value: "RISING",  description: "Trigger only on rising edge (low to high)" },
  { value: "2x", },
]} />
`;
  const node = parse(block).children[0];
  assert.deepEqual(parseEnumValues(node).entries, [
    { value: "ANY", default: true, description: "Trigger on any edge change (high to low or low to high)" },
    { value: "RISING", description: "Trigger only on rising edge (low to high)" },
    { value: "2x" },
  ]);
  assert.deepEqual(
    parseEnumValues(parse('<EnumValues values={[{ value: "X", default: true }]} />\n').children[0]).entries,
    [{ value: "X", default: true }],
  );
  assert.match(parseEnumValues(parse("<EnumValues values={[{ default: true }]} />\n").children[0]).error, /value/);
  // A misspelled field is an error, not a silently dropped description
  assert.match(
    parseEnumValues(parse('<EnumValues values={[{ value: "X", descripton: "Ex" }]} />\n').children[0]).error,
    /unknown field 'descripton'/,
  );
  for (const bad of ['{ value: "X", description: 123 }', '{ value: "X", default: "yes" }', "{ value: true }"]) {
    assert.match(parseEnumValues(parse(`<EnumValues values={[${bad}]} />\n`).children[0]).error, /value is a string/);
  }
  // Text that looks like a field or a trailing comma inside a string stays as written
  assert.deepEqual(
    parseEnumValues(
      parse(
        '<EnumValues values={[{ value: "A", description: "Default value: 1" }, { value: -1, description: "Literal A, }" }]} />\n',
      ).children[0],
    ).entries,
    [
      { value: "A", description: "Default value: 1" },
      { value: -1, description: "Literal A, }" },
    ],
  );
  assert.match(
    parseEnumValues(parse("<EnumValues values={[{ value: name }]} />\n").children[0]).error,
    /not a literal/,
  );
  assert.match(parseEnumValues(parse("<EnumValues values={items} />\n").children[0]).error, /not an array/);
});
