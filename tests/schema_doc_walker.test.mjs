import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { parseMdx, Report, SchemaStore, Walker } from "../script/schema_doc.mjs";

/** A tiny schema bundle and docs tree on disk; returns what a walk emitted. */
async function walk({ schema, pages }) {
  const root = mkdtempSync(join(tmpdir(), "schema-doc-"));
  const schemaDir = join(root, "schema");
  const docsRoot = join(root, "docs");
  const componentsRoot = join(docsRoot, "components");
  mkdirSync(schemaDir);
  for (const [name, doc] of Object.entries(schema)) {
    writeFileSync(join(schemaDir, `${name}.json`), JSON.stringify(doc));
  }
  for (const [rel, body] of Object.entries(pages)) {
    const path = join(componentsRoot, rel);
    mkdirSync(join(path, ".."), { recursive: true });
    writeFileSync(path, `---\ntitle: Test Page\n---\n\n${body}`);
  }
  const store = new SchemaStore({ dir: schemaDir });
  await store.init();
  await store.loadAll();
  const report = new Report();
  for (const rel of Object.keys(pages)) {
    const walker = new Walker(store, report, join(componentsRoot, rel), { emit: true, docsRoot, componentsRoot });
    await walker.init();
    await walker.walk(parseMdx(join(componentsRoot, rel)));
  }
  return { store, report, docs: (file, ...path) => path.reduce((o, k) => o?.[k], store.files.get(file))?.docs };
}

const core = (components, platforms = {}) => ({
  core: {
    components: Object.fromEntries(components.map((c) => [c, {}])),
    platforms,
    action: {},
    condition: {},
    schemas: {},
  },
});
const schema = (config_vars, extra = {}) => ({ type: "schema", schema: { config_vars }, ...extra });

test("a bus heading re-targets only its own subtree", async () => {
  const { docs, report, store } = await walk({
    schema: {
      esphome: core(["bmp581_i2c", "bmp581_spi"], { sensor: {} }),
      sensor: { sensor: { schemas: {}, components: { bmp581_i2c: {}, bmp581_spi: {} } } },
      bmp581_i2c: { "bmp581_i2c.sensor": { schemas: { CONFIG_SCHEMA: schema({ address: { key: "Optional" } }) } } },
      bmp581_spi: { "bmp581_spi.sensor": { schemas: { CONFIG_SCHEMA: schema({ cs_pin: { key: "Required" } }) } } },
    },
    pages: {
      "sensor/bmp581.mdx": [
        "The BMP581 sensor.",
        "## Over SPI",
        "- **cs_pin** (**Required**, pin): Chip select.",
        "## Configuration variables",
        "- **address** (*Optional*, int): The I²C address.",
        "",
      ].join("\n\n"),
    },
  });
  assert.match(
    docs("bmp581_spi", "bmp581_spi.sensor", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", "cs_pin"),
    /Chip select/,
  );
  assert.match(
    docs("bmp581_i2c", "bmp581_i2c.sensor", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", "address"),
    /I²C address/,
  );
  // The page has no bmp581 entry of its own: both bus variants get its intro
  const components = store.files.get("sensor").sensor.components;
  assert.match(components.bmp581_i2c.docs, /The BMP581 sensor/);
  assert.match(components.bmp581_spi.docs, /The BMP581 sensor/);
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "unmatched_key" || f.kind === "missing_schema_entry"),
    [],
  );
});

test("a heading naming two actions documents the options of both", async () => {
  const { docs } = await walk({
    schema: {
      esphome: core(["lvgl"]),
      lvgl: {
        lvgl: {
          schemas: { CONFIG_SCHEMA: schema({}) },
          action: {
            "page.next": schema({ animation: { key: "Optional" } }),
            "page.previous": schema({ animation: { key: "Optional" } }),
          },
        },
      },
    },
    pages: {
      "lvgl/index.mdx": [
        "LVGL.",
        "## `lvgl.page.next` / `lvgl.page.previous` Action",
        "Flip pages.",
        "- **animation** (*Optional*, string): The animation.",
        "",
      ].join("\n\n"),
    },
  });
  for (const name of ["page.next", "page.previous"]) {
    assert.match(docs("lvgl", "lvgl", "action", name, "schema", "config_vars", "animation"), /The animation/);
    assert.equal(docs("lvgl", "lvgl", "action", name), "Flip pages.");
  }
});

test("nested options left out of the docs are reported", async () => {
  const { report } = await walk({
    schema: {
      esphome: core(["graph"]),
      graph: {
        graph: {
          schemas: {
            CONFIG_SCHEMA: schema({
              legend: { key: "Optional", ...schema({ name_font: { key: "Required" }, border: { key: "Optional" } }) },
            }),
          },
        },
      },
    },
    pages: {
      "graph.mdx": [
        "A graph.",
        "## Configuration variables",
        "- **legend** (*Optional*, mapping): Legend options.\n  - **border** (*Optional*, boolean): Draw a border.",
        "",
      ].join("\n\n"),
    },
  });
  const missing = report.findings.filter((f) => f.kind === "undocumented_key").map((f) => `${f.schema}:${f.key}`);
  assert.deepEqual(missing, ["graph.CONFIG_SCHEMA/legend:name_font"]);
});

test("an unused schema marker is reported", async () => {
  const { report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: { foo: { schemas: { CONFIG_SCHEMA: schema({ bar: { key: "Optional" } }) } } },
    },
    pages: {
      "foo.mdx": ["Foo.", "{/* schema: foo.CONFIG_SCHEMA */}", "## Notes", "Nothing here.", "## See Also", ""].join(
        "\n\n",
      ),
    },
  });
  assert.equal(report.findings.filter((f) => f.kind === "unused_schema_marker").length, 1);
});

test("a key both bus variants declare is documented in both", async () => {
  const { docs } = await walk({
    schema: {
      esphome: core(["foo_i2c", "foo_spi"], { sensor: {} }),
      sensor: { sensor: { schemas: {}, components: { foo_i2c: {}, foo_spi: {} } } },
      foo_i2c: { "foo_i2c.sensor": { schemas: { CONFIG_SCHEMA: schema({ temperature: { key: "Optional" } }) } } },
      foo_spi: { "foo_spi.sensor": { schemas: { CONFIG_SCHEMA: schema({ temperature: { key: "Optional" } }) } } },
    },
    pages: {
      "sensor/foo.mdx": [
        "Foo.",
        "## Configuration variables",
        "- **temperature** (*Optional*): The temperature sensor.",
        "",
      ].join("\n\n"),
    },
  });
  for (const bus of ["foo_i2c", "foo_spi"]) {
    assert.match(
      docs(bus, `${bus}.sensor`, "schemas", "CONFIG_SCHEMA", "schema", "config_vars", "temperature"),
      /temperature sensor/,
    );
  }
});

test("text after a colon-before-type annotation is kept as the description", async () => {
  const { docs } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: { foo: { schemas: { CONFIG_SCHEMA: schema({ restore_value: { key: "Optional" } }) } } },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Configuration variables",
        "- **restore_value**: (*Optional*, bool) Restore the value on boot.",
        "",
      ].join("\n\n"),
    },
  });
  assert.match(
    docs("foo", "foo", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", "restore_value"),
    /^\*\*bool\*\*: Restore the value on boot/,
  );
});

test("a type annotation holding a link keeps the link and the whole description", async () => {
  const { docs } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: {
          schemas: {
            CONFIG_SCHEMA: schema({
              preset_change: { key: "Optional" },
              restore_from: { key: "Optional" },
              plain: { key: "Optional" },
            }),
          },
        },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Configuration variables",
        [
          "- **preset_change**: (*Optional*, [Action](/automations/actions/#all-actions)) Runs when the preset changes.",
          "- **restore_from**: (*Optional*, enum): Where to restore from.",
          "- **plain** (*Optional*, [Time](/guides/configuration-types/#time)): The interval.",
        ].join("\n"),
        "",
      ].join("\n\n"),
    },
  });
  const field = (k) => docs("foo", "foo", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", k);
  assert.match(
    field("preset_change"),
    /^\*\*\[Action\]\(https:\/\/esphome\.io\/automations\/actions\/#all-actions\)\*\*: Runs when the preset changes\./,
  );
  assert.match(field("restore_from"), /^\*\*enum\*\*: Where to restore from\./);
  assert.match(
    field("plain"),
    /^\*\*\[Time\]\(https:\/\/esphome\.io\/guides\/configuration-types\/#time\)\*\*: The interval\./,
  );
});

test("a platform heading nested under the hub's options starts that platform's section", async () => {
  const { docs } = await walk({
    schema: {
      esphome: core(["mits"], { select: {} }),
      select: { select: { schemas: {}, components: { mits: {} } } },
      mits: {
        mits: { schemas: { CONFIG_SCHEMA: schema({ uart_id: { key: "Optional" } }) } },
        "mits.select": { schemas: { CONFIG_SCHEMA: schema({ vane: { key: "Optional" } }) } },
      },
    },
    pages: {
      "mits.mdx": [
        "Mits.",
        "## Configuration variables",
        "- **uart_id** (*Optional*, ID): The UART.",
        "### Select",
        "- **vane** (*Optional*, string): The vane select.",
        "",
      ].join("\n\n"),
    },
  });
  assert.match(docs("mits", "mits", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", "uart_id"), /The UART/);
  assert.match(docs("mits", "mits.select", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", "vane"), /vane select/);
});

test("a bare code heading on a top-level page does not switch to another component", async () => {
  const { docs, report } = await walk({
    schema: {
      esphome: core(["i2c", "host"]),
      i2c: { i2c: { schemas: { CONFIG_SCHEMA: schema({ device: { key: "Optional" } }) } } },
      host: { host: { schemas: { CONFIG_SCHEMA: schema({ board: { key: "Optional" } }) } } },
    },
    pages: {
      "i2c.mdx": [
        "I2C.",
        "## Configuration variables",
        "### `host`",
        "- **device** (*Optional*, string): The device path.",
        "",
      ].join("\n\n"),
    },
  });
  assert.match(docs("i2c", "i2c", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", "device"), /device path/);
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "unmatched_key"),
    [],
  );
});

test("options after a sub-schema heading fall back to the parent schema", async () => {
  const { docs, report } = await walk({
    schema: {
      esphome: core(["radar"]),
      radar: {
        radar: {
          schemas: {
            CONFIG_SCHEMA: schema({
              sensitivity: { key: "Optional", ...schema({ level: { key: "Optional" } }) },
              custom_mode: { key: "Optional" },
            }),
          },
        },
      },
    },
    pages: {
      "radar.mdx": [
        "Radar.",
        "## Configuration variables",
        "### Sensitivity",
        "- **level** (*Optional*, int): Sensitivity level.",
        "- **custom_mode** (*Optional*, int): Custom mode.",
        "",
      ].join("\n\n"),
    },
  });
  const cv = (...k) => docs("radar", "radar", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", ...k);
  assert.match(cv("sensitivity", "schema", "config_vars", "level"), /Sensitivity level/);
  assert.match(cv("custom_mode"), /Custom mode/);
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "unmatched_key"),
    [],
  );
});

test("enum bullets with a (Default) note before a hyphen keep their description", async () => {
  const { store } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: {
          schemas: {
            CONFIG_SCHEMA: schema({
              restore_mode: { key: "Optional", type: "enum", values: { RESTORE_DEFAULT_OFF: null, ALWAYS_ON: null } },
            }),
          },
        },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Configuration variables",
        "- **restore_mode** (*Optional*): Control how the switch attempts to restore state.\n  - `RESTORE_DEFAULT_OFF` (Default) - Attempt to restore state and default to OFF.\n  - `ALWAYS_ON`: Always initialize as ON.",
        "",
      ].join("\n\n"),
    },
  });
  const values = store.files.get("foo").foo.schemas.CONFIG_SCHEMA.schema.config_vars.restore_mode.values;
  assert.match(values.RESTORE_DEFAULT_OFF.docs, /^Attempt to restore state/);
  assert.equal(values.RESTORE_DEFAULT_OFF.default, true);
  assert.match(values.ALWAYS_ON.docs, /^Always initialize/);
  assert.equal(values.ALWAYS_ON.default, undefined);
});

test("an enum bullet that is only `VALUE` (Default) marks the default and writes no text", async () => {
  const { store } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: {
          schemas: { CONFIG_SCHEMA: schema({ mode: { key: "Optional", type: "enum", values: { A: null, B: null } } }) },
        },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Configuration variables",
        "- **mode** (*Optional*): The mode.\n  - `A` (Default)\n  - `B`: Mode B.",
        "",
      ].join("\n\n"),
    },
  });
  const values = store.files.get("foo").foo.schemas.CONFIG_SCHEMA.schema.config_vars.mode.values;
  assert.deepEqual(values.A, { default: true });
  assert.match(values.B.docs, /^Mode B/);
});

test("a sibling heading ends a heading-opened sub-schema section", async () => {
  const { docs } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: {
          schemas: {
            CONFIG_SCHEMA: schema({
              project: { key: "Optional", ...schema({ name: { key: "Required" } }) },
              area: { key: "Optional", ...schema({ name: { key: "Required" } }) },
            }),
          },
        },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Project information",
        "- **name** (**Required**, string): The project name.",
        "## Area Configuration",
        "- **name** (**Required**, string): Display name for the area.",
        "",
      ].join("\n\n"),
    },
  });
  const cv = (...k) => docs("foo", "foo", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", ...k);
  assert.match(cv("project", "schema", "config_vars", "name"), /project name/);
  assert.match(cv("area", "schema", "config_vars", "name"), /Display name for the area/);
});

test("a `variant` Platform heading documents that typed variant of the page's platform", async () => {
  const { docs, report } = await walk({
    schema: {
      esphome: core(["vbus"], { sensor: {} }),
      sensor: { sensor: { schemas: {}, components: { vbus: {} } } },
      vbus: {
        vbus: { schemas: { CONFIG_SCHEMA: schema({ uart_id: { key: "Optional" } }) } },
        "vbus.sensor": {
          schemas: {
            CONFIG_SCHEMA: {
              type: "typed",
              typed_key: "model",
              types: {
                deltasol_c: { config_vars: { temperature_1: { key: "Optional" } } },
                custom: { config_vars: { sensors: { key: "Optional" } } },
              },
            },
          },
        },
      },
    },
    pages: {
      "vbus.mdx": [
        "VBus.",
        "## Sensor",
        "### Configuration variables",
        "- **model** (**Required**): The controller model.",
        "- **temperature_1** (*Optional*): Temperature sensor 1.",
        "## `custom` VBus sensors",
        "### Configuration variables",
        "- **sensors** (*Optional*): A list of sensor definitions with a lambda.",
        "",
      ].join("\n\n"),
    },
  });
  const types = (...k) => docs("vbus", "vbus.sensor", "schemas", "CONFIG_SCHEMA", "types", ...k);
  assert.match(types("deltasol_c", "config_vars", "temperature_1"), /Temperature sensor 1/);
  assert.match(types("custom", "config_vars", "sensors"), /sensor definitions/);
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "unmatched_key" || (f.kind === "undocumented_key" && f.key === "model")),
    [],
  );
});

test("a typed platform joined with its hub keeps the discriminator and variant group", async () => {
  const { docs, report } = await walk({
    schema: {
      esphome: core(["ble"], { sensor: {} }),
      sensor: { sensor: { schemas: {}, components: { ble: {} } } },
      ble: {
        ble: {
          schemas: {
            CONFIG_SCHEMA: schema({ mac_address: { key: "Required" }, update_interval: { key: "Optional" } }),
          },
        },
        "ble.sensor": {
          schemas: {
            CONFIG_SCHEMA: {
              type: "typed",
              typed_key: "type",
              types: {
                rssi: { config_vars: { update_interval: { key: "Optional" } } },
                characteristic: { config_vars: { update_interval: { key: "Optional" }, notify: { key: "Optional" } } },
              },
            },
          },
        },
      },
    },
    pages: {
      "sensor/ble.mdx": [
        "BLE sensor.",
        "## Configuration variables",
        "- **type** (**Required**): One of `rssi`, `characteristic`.",
        "- **update_interval** (*Optional*): The interval to poll the device.",
        "- **notify** (*Optional*, boolean): Ask for notifications.",
        "- **mac_address** (**Required**): The hub's address.",
        "",
      ].join("\n\n"),
    },
  });
  const types = (...k) => docs("ble", "ble.sensor", "schemas", "CONFIG_SCHEMA", "types", ...k);
  const hub = (...k) => docs("ble", "ble", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", ...k);
  assert.match(docs("ble", "ble.sensor", "schemas", "CONFIG_SCHEMA"), /^One of/);
  assert.match(types("rssi", "config_vars", "update_interval"), /interval to poll/);
  assert.match(types("characteristic", "config_vars", "update_interval"), /interval to poll/);
  assert.match(types("characteristic", "config_vars", "notify"), /notifications/);
  assert.equal(hub("update_interval"), undefined);
  assert.match(hub("mac_address"), /hub's address/);
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "unmatched_key"),
    [],
  );
});

test("nested bullets under a key created from platform children are written to every child", async () => {
  const { docs, store } = await walk({
    schema: {
      esphome: core(["foo", "bar"], { sensor: {} }),
      sensor: {
        sensor: {
          schemas: { SENSOR_SCHEMA: schema({ name: { key: "Optional" } }) },
          components: { foo: {}, bar: {} },
        },
      },
      foo: {
        "foo.sensor": {
          schemas: {
            CONFIG_SCHEMA: schema({
              mode: { key: "Optional", type: "enum", values: { FAST: null, SLOW: null } },
            }),
          },
        },
      },
      bar: {
        "bar.sensor": {
          schemas: {
            CONFIG_SCHEMA: schema({
              mode: { key: "Optional", type: "enum", values: { FAST: null, SLOW: null } },
            }),
          },
        },
      },
    },
    pages: {
      "sensor/index.mdx": [
        "Sensors.",
        "## Base Sensor Configuration",
        "- **name** (*Optional*, string): The name.",
        "- **mode** (*Optional*, string): The sampling mode.\n  - `FAST`: Sample quickly.\n  - `SLOW`: Sample slowly.",
        "",
      ].join("\n\n"),
    },
  });
  assert.match(docs("sensor", "sensor", "schemas", "SENSOR_SCHEMA", "schema", "config_vars", "mode"), /sampling mode/);
  for (const comp of ["foo", "bar"]) {
    const values = store.files.get(comp)[`${comp}.sensor`].schemas.CONFIG_SCHEMA.schema.config_vars.mode.values;
    assert.match(values.FAST.docs, /^Sample quickly/);
    assert.match(values.SLOW.docs, /^Sample slowly/);
  }
});

test("a rerun over an emitted bundle still writes nested descriptions through the platform children", async () => {
  const bundle = {
    esphome: core(["foo", "bar"], { sensor: {} }),
    sensor: {
      sensor: {
        schemas: { SENSOR_SCHEMA: schema({ name: { key: "Optional" } }) },
        components: { foo: {}, bar: {} },
      },
    },
    foo: {
      "foo.sensor": {
        schemas: {
          CONFIG_SCHEMA: schema({
            mode: { key: "Optional", type: "enum", values: { FAST: null, SLOW: null } },
          }),
        },
      },
    },
    bar: {
      "bar.sensor": {
        schemas: {
          CONFIG_SCHEMA: schema({
            mode: { key: "Optional", type: "enum", values: { FAST: null, SLOW: null } },
          }),
        },
      },
    },
  };
  const page = [
    "Sensors.",
    "## Base Sensor Configuration",
    "- **name** (*Optional*, string): The name.",
    "- **mode** (*Optional*, string): The sampling mode.\n  - `FAST`: Sample quickly.\n  - `SLOW`: Sample slowly.",
    "",
  ].join("\n\n");
  const first = await walk({ schema: bundle, pages: { "sensor/index.mdx": page } });
  // The saved bundle holds the docs-only `mode` the first run created on the base schema
  const emitted = Object.fromEntries(first.store.files);
  const { store, report } = await walk({
    schema: emitted,
    pages: { "sensor/index.mdx": page.replace("Sample quickly.", "Sample fast.") },
  });
  for (const comp of ["foo", "bar"]) {
    const values = store.files.get(comp)[`${comp}.sensor`].schemas.CONFIG_SCHEMA.schema.config_vars.mode.values;
    assert.match(values.FAST.docs, /^Sample fast/);
  }
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "nested_list_ignored"),
    [],
  );
});

test("an orphan list is reported even when its first bullet is prose", async () => {
  const { report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: { foo: { schemas: { CONFIG_SCHEMA: schema({ name: { key: "Optional" } }) } } },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Advanced",
        "{/* schema: foo.MISSING */}",
        "### Configuration variables",
        "- **Note**: read this first.\n- **name** (*Optional*, string): The name.\n- **pin** (*Optional*, pin): The pin.",
        "",
      ].join("\n\n"),
    },
  });
  assert.deepEqual(
    report.findings.map((f) => [f.kind, f.line, f.key, f.detail]),
    [
      ["unroutable_section", 11, undefined, "schema 'foo.MISSING' not found"],
      ["orphan_option_list", 13, "name", "2 option bullet(s) outside any schema section"],
    ],
  );
});

test("nested bullets under an inherited key refined on typed variants reach the base definition", async () => {
  const { docs, store, report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: {
          schemas: {
            BASE_SCHEMA: schema({
              mode: { key: "Optional", type: "enum", values: { FAST: null, SLOW: null }, docs: "Base text." },
              filter: {
                key: "Optional",
                type: "schema",
                schema: { config_vars: { threshold: { key: "Optional" } } },
                docs: "Base filter.",
              },
            }),
            CONFIG_SCHEMA: {
              type: "typed",
              typed_key: "model",
              types: {
                a: { config_vars: { pin_a: { key: "Required" } }, extends: ["foo.BASE_SCHEMA"] },
                b: { config_vars: { pin_b: { key: "Required" } }, extends: ["foo.BASE_SCHEMA"] },
              },
            },
          },
        },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Configuration variables",
        "- **model** (**Required**): The model.",
        "- **mode** (*Optional*): The mode.\n  - `FAST`: Sample quickly.\n  - `SLOW`: Sample slowly.",
        "- **filter** (*Optional*): The filter.\n  - **threshold** (*Optional*, int): The threshold.",
        "",
      ].join("\n\n"),
    },
  });
  const types = (...k) => docs("foo", "foo", "schemas", "CONFIG_SCHEMA", "types", ...k);
  assert.match(types("a", "config_vars", "mode"), /^The mode/);
  assert.match(types("b", "config_vars", "mode"), /^The mode/);
  const base = store.files.get("foo").foo.schemas.BASE_SCHEMA.schema.config_vars;
  assert.equal(base.mode.docs, "Base text.");
  assert.match(base.mode.values.FAST.docs, /^Sample quickly/);
  assert.match(base.mode.values.SLOW.docs, /^Sample slowly/);
  assert.match(base.filter.schema.config_vars.threshold.docs, /The threshold/);
  assert.deepEqual(
    report.findings.filter((f) =>
      ["nested_list_ignored", "enum_values_without_enum", "unmatched_key"].includes(f.kind),
    ),
    [],
  );
});

test("nested enum values of a key one typed variant owns and another inherits reach both definitions", async () => {
  const { store, report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: {
          schemas: {
            BASE_SCHEMA: schema({ mode: { key: "Optional", type: "enum", values: { FAST: null, SLOW: null } } }),
            CONFIG_SCHEMA: {
              type: "typed",
              typed_key: "model",
              types: {
                a: { config_vars: { mode: { key: "Optional", type: "enum", values: { FAST: null, SLOW: null } } } },
                b: { config_vars: { pin: { key: "Required" } }, extends: ["foo.BASE_SCHEMA"] },
              },
            },
          },
        },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Configuration variables",
        "- **model** (**Required**): The model.",
        "- **mode** (*Optional*): The mode.\n  - `FAST`: Sample quickly.\n  - `SLOW`: Sample slowly.",
        "",
      ].join("\n\n"),
    },
  });
  const own = store.files.get("foo").foo.schemas.CONFIG_SCHEMA.types.a.config_vars.mode;
  const base = store.files.get("foo").foo.schemas.BASE_SCHEMA.schema.config_vars.mode;
  for (const prop of [own, base]) {
    assert.match(prop.docs, /^The mode/);
    assert.match(prop.values.FAST.docs, /^Sample quickly/);
    assert.match(prop.values.SLOW.docs, /^Sample slowly/);
  }
  assert.deepEqual(
    report.findings.filter((f) => ["nested_list_ignored", "unmatched_key"].includes(f.kind)),
    [],
  );
});

test("bullets after a section that could not be routed are dropped and reported, not sent to the page schema", async () => {
  const { docs, report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: { foo: { schemas: { CONFIG_SCHEMA: schema({ name: { key: "Optional" } }) } } },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Configuration variables",
        "- **name** (*Optional*, string): The name.",
        "## Advanced",
        "{/* schema: foo.MISSING */}",
        "### Configuration variables",
        "- **name** (*Optional*, string): Text for another schema.",
        "#### Details",
        "- **name** (*Optional*, string): Text for another schema.",
        "",
      ].join("\n\n"),
    },
  });
  assert.match(docs("foo", "foo", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", "name"), /: The name\./);
  assert.deepEqual(
    report.findings.map((f) => [f.kind, f.line]),
    [
      ["unroutable_section", 15],
      ["orphan_option_list", 17],
      ["orphan_option_list", 21],
    ],
  );
});

test("options of an action the schema does not have are dropped, not written to the component", async () => {
  const { docs, report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: { foo: { schemas: { CONFIG_SCHEMA: schema({ name: { key: "Optional" } }) } }, action: {} },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Configuration variables",
        "- **name** (*Optional*, string): The name.",
        "## `foo.missing` Action",
        "- **name** (*Optional*, string): Text for the action.",
        "### Configuration variables",
        "- **name** (*Optional*, string): Text for the action.",
        "## `foo.other` Action",
        "- **name** (*Optional*, string): Text for the other action.",
        "",
      ].join("\n\n"),
    },
  });
  assert.match(docs("foo", "foo", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", "name"), /: The name\./);
  assert.deepEqual(
    report.findings.map((f) => [f.kind, f.line]),
    [
      ["unknown_registry_entry", 11],
      ["orphan_option_list", 13],
      ["unroutable_section", 15],
      ["orphan_option_list", 17],
      ["unknown_registry_entry", 19],
      ["orphan_option_list", 21],
    ],
  );
});

test("options under an effect or filter heading the schema lacks are dropped, not written to the platform", async () => {
  const { docs, report, store } = await walk({
    schema: {
      esphome: core([], { light: {} }),
      light: {
        light: {
          schemas: { LIGHT_SCHEMA: schema({ name: { key: "Optional" } }) },
          effects: { strobe: { schema: { config_vars: { name: { key: "Optional" } } } } },
        },
      },
    },
    pages: {
      "light/index.mdx": [
        "Lights.",
        "## Base Light Configuration",
        "- **name** (*Optional*, string): The light name.",
        "## Strobe Effect",
        "A strobe.",
        "- **name** (*Optional*, string): The effect name.",
        "## Missing Effect",
        "Not in the schema.",
        "- **name** (*Optional*, string): Text for the missing effect.",
        "### Configuration variables",
        "- **name** (*Optional*, string): Text for the missing effect.",
        "## Other Effect",
        "Also not in the schema.",
        "",
      ].join("\n\n"),
    },
  });
  assert.match(docs("light", "light", "schemas", "LIGHT_SCHEMA", "schema", "config_vars", "name"), /The light name/);
  assert.match(store.files.get("light").light.effects.strobe.schema.config_vars.name.docs, /The effect name/);
  assert.deepEqual(
    report.findings.map((f) => [f.kind, f.line]),
    [
      ["unknown_registry_entry", 17],
      ["orphan_option_list", 21],
      ["unroutable_section", 23],
      ["orphan_option_list", 25],
      ["unknown_registry_entry", 27],
    ],
  );
});

test("a nested typed schema that two outer variants define keeps its discriminator", async () => {
  const options = () => ({
    key: "Optional",
    type: "typed",
    typed_key: "kind",
    types: { fast: { config_vars: { speed: { key: "Optional" } } }, slow: { config_vars: {} } },
  });
  const { docs, report, store } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: {
          schemas: {
            CONFIG_SCHEMA: {
              type: "typed",
              typed_key: "model",
              types: { a: { config_vars: { options: options() } }, b: { config_vars: { options: options() } } },
            },
          },
        },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Configuration variables",
        "- **model** (**Required**): The model.",
        "- **options** (*Optional*): The options.",
        "## `options` Trigger",
        "- **kind** (**Required**): The kind.\n  - `fast` (*default*): Quick.\n  - `slow`: Careful.",
        "- **speed** (*Optional*, int): The speed.",
        "",
      ].join("\n\n"),
    },
  });
  const types = (...k) => docs("foo", "foo", "schemas", "CONFIG_SCHEMA", "types", ...k);
  for (const model of ["a", "b"]) {
    assert.match(types(model, "config_vars", "options"), /^The kind/);
    assert.match(types(model, "config_vars", "options", "types", "fast", "config_vars", "speed"), /The speed/);
    // The choices of the shared discriminator are described on both outer variants
    const kinds = store.files.get("foo").foo.schemas.CONFIG_SCHEMA.types[model].config_vars.options.types;
    assert.match(kinds.fast.docs, /Quick/);
    assert.equal(kinds.fast.default, true);
    assert.match(kinds.slow.docs, /Careful/);
  }
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "unmatched_key").map((f) => f.key),
    [],
  );
});

test("a nested key only one typed variant has is matched, not reported unmatched on the others", async () => {
  const options = (extra = {}) => ({
    key: "Optional",
    type: "schema",
    schema: { config_vars: { x: { key: "Optional" }, ...extra } },
  });
  const { docs, report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: {
          schemas: {
            CONFIG_SCHEMA: {
              type: "typed",
              typed_key: "model",
              types: {
                a: { config_vars: { options: options() } },
                b: { config_vars: { options: options({ extra: { key: "Optional" } }) } },
              },
            },
          },
        },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Configuration variables",
        "- **model** (**Required**): The model.",
        "- **options** (*Optional*): The options.\n  - **x** (*Optional*, int): The x.\n  - **extra** (*Optional*, int): The extra.",
        "",
      ].join("\n\n"),
    },
  });
  const types = (...k) => docs("foo", "foo", "schemas", "CONFIG_SCHEMA", "types", ...k);
  assert.match(types("a", "config_vars", "options", "schema", "config_vars", "x"), /The x/);
  assert.match(types("b", "config_vars", "options", "schema", "config_vars", "x"), /The x/);
  assert.match(types("b", "config_vars", "options", "schema", "config_vars", "extra"), /The extra/);
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "unmatched_key"),
    [],
  );
});

test("an enum bullet whose description is only *Default* marks the default value", async () => {
  const { store, report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: {
          schemas: {
            CONFIG_SCHEMA: schema({
              bit_rate: { key: "Optional", type: "enum", values: { "125KBPS": null, "250KBPS": null } },
            }),
          },
        },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Configuration variables",
        "- **bit_rate** (*Optional*, enum): The bit rate.\n  - `125KBPS` - *Default*\n  - `250KBPS` - Fast.",
        "",
      ].join("\n\n"),
    },
  });
  const values = store.files.get("foo").foo.schemas.CONFIG_SCHEMA.schema.config_vars.bit_rate.values;
  assert.equal(values["125KBPS"].default, true);
  assert.equal(values["125KBPS"].docs, undefined);
  assert.match(values["250KBPS"].docs, /Fast/);
  assert.deepEqual(report.findings, []);
});

test("docs that disagree with the schema on Required are reported, not written into the key", async () => {
  const { docs, report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: { foo: { schemas: { CONFIG_SCHEMA: schema({ cs_pin: { key: "Required", type: "pin" } }) } } },
    },
    pages: {
      "foo.mdx": ["Foo.", "## Configuration variables", "- **cs_pin** (*Optional*, pin): The CS pin.", ""].join("\n\n"),
    },
  });
  const prop = (() => {
    const vars = docs("foo", "foo", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", "cs_pin");
    return vars;
  })();
  assert.match(prop, /The CS pin/);
  assert.deepEqual(
    report.findings.map((f) => [f.kind, f.key]),
    [["optionality_mismatch", "cs_pin"]],
  );
});

test("a page-specific description of an inherited key copies the whole definition onto the child", async () => {
  const { store } = await walk({
    schema: {
      esphome: core(["foo", "bar"]),
      foo: {
        foo: {
          schemas: {
            CONFIG_SCHEMA: {
              type: "schema",
              schema: {
                config_vars: { address: { key: "Optional", type: "integer", docs: "Base text." } },
              },
            },
          },
        },
      },
      bar: {
        bar: {
          schemas: {
            CONFIG_SCHEMA: { type: "schema", schema: { config_vars: {}, extends: ["foo.CONFIG_SCHEMA"] } },
          },
        },
      },
    },
    pages: {
      "bar.mdx": ["Bar.", "## Configuration variables", "- **address** (*Optional*, int): The bar address.", ""].join(
        "\n\n",
      ),
    },
  });
  const copy = store.files.get("bar").bar.schemas.CONFIG_SCHEMA.schema.config_vars.address;
  assert.match(copy.docs, /The bar address/);
  assert.equal(copy.key, "Optional");
  assert.equal(copy.type, "integer");
  assert.equal(store.files.get("foo").foo.schemas.CONFIG_SCHEMA.schema.config_vars.address.docs, "Base text.");
});

test("a heading that routes on its own under an unplaced trigger gets its options written", async () => {
  const { store, report } = await walk({
    schema: {
      esphome: core([], { gizmo: {} }),
      gizmo: {
        gizmo: {
          schemas: { GIZMO_SCHEMA: schema({ name: { key: "Optional" } }) },
          action: { do: schema({ speed: { key: "Optional" } }) },
        },
      },
    },
    pages: {
      "gizmo/index.mdx": [
        "Gizmos.",
        "## `gizmo.on_missing` Trigger",
        "- **name** (*Optional*, string): Text that belongs to the trigger.",
        "### `gizmo.do` Action",
        "Does it.",
        "- **speed** (*Optional*, int): The speed.",
        "",
      ].join("\n\n"),
    },
  });
  const gizmo = store.files.get("gizmo").gizmo;
  assert.equal(gizmo.schemas.GIZMO_SCHEMA.schema.config_vars.name.docs, undefined);
  assert.match(gizmo.action.do.schema.config_vars.speed.docs, /The speed/);
  // The held bullet is not documented, so the platform's own audit still misses `name`
  assert.deepEqual(
    report.findings.map((f) => [f.kind, f.line]),
    [
      ["unresolved_trigger", 7],
      ["undocumented_key", 9],
    ],
  );
  assert.equal(report.stats.keysHeld, 1);
});

test("a top-level <EnumValues> block reaches every typed variant that has the option before it", async () => {
  const typed = (extra = {}) => ({
    config_vars: { mode: { key: "Optional", type: "enum", values: { FAST: null, SLOW: null } }, ...extra },
  });
  const { store } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: {
          schemas: {
            CONFIG_SCHEMA: {
              type: "typed",
              typed_key: "model",
              types: { a: typed(), b: typed({ pin: { key: "Required" } }) },
            },
          },
        },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Configuration variables",
        "- **model** (**Required**): The model.",
        "- **mode** (*Optional*): The mode.",
        '<EnumValues values={[{ value: "FAST", default: true, description: "Sample quickly" }, { value: "SLOW", description: "Sample slowly" }]} />',
        "",
      ].join("\n\n"),
    },
  });
  for (const variant of ["a", "b"]) {
    const values = store.files.get("foo").foo.schemas.CONFIG_SCHEMA.types[variant].config_vars.mode.values;
    assert.deepEqual(values.FAST, { default: true, docs: "Sample quickly" });
    assert.equal(values.SLOW.docs, "Sample slowly");
  }
});

test("a variant's own Required key is not excused by an inherited Optional one", async () => {
  const { report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: {
          schemas: {
            BASE_SCHEMA: schema({ mode: { key: "Optional" } }),
            CONFIG_SCHEMA: {
              type: "schema",
              schema: { config_vars: { mode: { key: "Required" } }, extends: ["foo.BASE_SCHEMA"] },
            },
          },
        },
      },
    },
    pages: {
      "foo.mdx": ["Foo.", "## Configuration variables", "- **mode** (*Optional*, string): The mode.", ""].join("\n\n"),
    },
  });
  assert.deepEqual(
    report.findings.map((f) => [f.kind, f.key, f.detail]),
    [["optionality_mismatch", "mode", "docs say optional, schema says required"]],
  );
});

test("a Hub Component heading is the page's own hub, not an unresolved component", async () => {
  const { docs, report } = await walk({
    schema: {
      esphome: core(["foo"], { sensor: {} }),
      sensor: { sensor: { schemas: {}, components: { foo: {} } } },
      foo: {
        foo: { schemas: { CONFIG_SCHEMA: schema({ uart_id: { key: "Optional" } }) } },
        "foo.sensor": { schemas: { CONFIG_SCHEMA: schema({ distance: { key: "Optional" } }) } },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Hub Component",
        "The hub.",
        "### Configuration variables",
        "- **uart_id** (*Optional*, ID): The UART.",
        "## Sensor",
        "### Configuration variables",
        "- **distance** (*Optional*): Distance.",
        "",
      ].join("\n\n"),
    },
  });
  assert.match(docs("foo", "foo", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", "uart_id"), /The UART/);
  assert.match(docs("foo", "foo.sensor", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", "distance"), /Distance/);
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "unresolved_component_heading"),
    [],
  );
});

test("a platform index without a base schema does not get platform keys created on a derived schema", async () => {
  const { store, report } = await walk({
    schema: {
      esphome: core(["foo"], { gizmo: {} }),
      gizmo: {
        gizmo: {
          schemas: { BASIC_GIZMO_SCHEMA: schema({ name: { key: "Optional" } }) },
          components: { foo: {} },
        },
      },
      foo: { "foo.gizmo": { schemas: { CONFIG_SCHEMA: schema({ speed: { key: "Optional" } }) } } },
    },
    pages: {
      "gizmo/index.mdx": [
        "Gizmos.",
        "## Base Gizmo Configuration",
        "- **name** (*Optional*, string): The name.",
        "- **speed** (*Optional*, int): The speed.",
        "",
      ].join("\n\n"),
    },
  });
  const basic = store.files.get("gizmo").gizmo.schemas.BASIC_GIZMO_SCHEMA.schema.config_vars;
  assert.match(basic.name.docs, /The name/);
  assert.equal(basic.speed, undefined);
  assert.deepEqual(
    report.findings.map((f) => [f.kind, f.key]),
    [
      ["missing_base_schema", undefined],
      ["unmatched_key", "speed"],
    ],
  );
});

test("options under a Component heading the schema lacks are dropped, not written to the page component", async () => {
  const { docs, report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: { schemas: { CONFIG_SCHEMA: schema({ id: { key: "GeneratedID" }, address: { key: "Optional" } }) } },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Configuration variables",
        "- **address** (*Optional*, int): The hub address.",
        "## Lambda Hook Component",
        "A helper.",
        "### Configuration variables",
        "- **id** (**Required**, ID): The ID to use in lambdas.",
        "- **address** (**Required**, int): The address every call targets.",
        "## Other",
        "",
      ].join("\n\n"),
    },
  });
  assert.match(docs("foo", "foo", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", "address"), /The hub address/);
  assert.equal(docs("foo", "foo", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", "id"), undefined);
  assert.deepEqual(
    report.findings.map((f) => [f.kind, f.line]),
    [
      ["unresolved_component_heading", 11],
      ["unroutable_section", 15],
      ["orphan_option_list", 17],
    ],
  );
});

test("an Over SPI heading on a component typed by bus documents that variant", async () => {
  const { docs, report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: {
          schemas: {
            CONFIG_SCHEMA: {
              type: "typed",
              typed_key: "type",
              types: {
                gpio: { config_vars: { data_pin: { key: "Required" }, sr_count: { key: "Optional" } } },
                spi: { config_vars: { spi_id: { key: "Optional" }, sr_count: { key: "Optional" } } },
              },
            },
          },
        },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Over GPIO",
        "### Configuration variables",
        "- **type** (**Required**): `gpio` or `spi`.",
        "- **data_pin** (**Required**, pin): The data pin.",
        "- **sr_count** (*Optional*, int): Chained registers.",
        "## Over SPI",
        "### Configuration variables",
        "- **spi_id** (*Optional*, ID): The SPI bus.",
        "- **sr_count** (*Optional*, int): Chained registers over SPI.",
        "## Pin configuration",
        "",
      ].join("\n\n"),
    },
  });
  const types = (...k) => docs("foo", "foo", "schemas", "CONFIG_SCHEMA", "types", ...k);
  assert.match(types("gpio", "config_vars", "data_pin"), /The data pin/);
  assert.match(types("gpio", "config_vars", "sr_count"), /Chained registers\./);
  assert.match(types("spi", "config_vars", "spi_id"), /The SPI bus/);
  assert.match(types("spi", "config_vars", "sr_count"), /over SPI/);
  assert.deepEqual(report.findings, []);
});

test("a trigger section reaches that trigger in every typed variant", async () => {
  const trigger = () => ({ key: "Optional", type: "schema", schema: { config_vars: { then: { key: "Optional" } } } });
  const { store, report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: {
          schemas: {
            CONFIG_SCHEMA: {
              type: "typed",
              typed_key: "model",
              types: {
                a: { config_vars: { on_event: trigger() } },
                b: { config_vars: { on_event: trigger(), pin: { key: "Required" } } },
              },
            },
          },
        },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Configuration variables",
        "- **model** (**Required**): The model.",
        "- **pin** (**Required**, pin): The pin.",
        "## `on_event` Trigger",
        "Fires on an event.",
        "### Configuration variables",
        "- **then** (*Optional*, Automation): What to run.",
        "",
      ].join("\n\n"),
    },
  });
  for (const variant of ["a", "b"]) {
    const onEvent = store.files.get("foo").foo.schemas.CONFIG_SCHEMA.types[variant].config_vars.on_event;
    assert.match(onEvent.schema.config_vars.then.docs, /What to run/);
  }
  // The heading documents the trigger, so the audit of the parent schema does not miss it
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "undocumented_key" && f.key === "on_event"),
    [],
  );
});

test("the discriminator of a typed schema is neither required by assumption nor an enum without values", async () => {
  const { store, report } = await walk({
    schema: {
      esphome: core([], { sensor: {} }),
      sensor: { sensor: { schemas: { SENSOR_SCHEMA: schema({}) }, components: { uptime: {} } } },
      uptime: {
        "uptime.sensor": {
          schemas: {
            CONFIG_SCHEMA: {
              type: "typed",
              typed_key: "type",
              types: { seconds: { config_vars: {} }, timestamp: { config_vars: {} } },
            },
          },
        },
      },
    },
    pages: {
      "sensor/uptime.mdx": [
        "Uptime.",
        "## Configuration variables",
        "- **type** (*Optional*): Either:\n  - `seconds` (*default*): A simple counter.\n  - `timestamp`: When ESPHome booted.",
        "",
      ].join("\n\n"),
    },
  });
  const entry = store.files.get("uptime")["uptime.sensor"].schemas.CONFIG_SCHEMA;
  assert.match(entry.docs, /^Either:/);
  assert.match(entry.types.seconds.docs, /A simple counter/);
  assert.equal(entry.types.seconds.default, true);
  assert.match(entry.types.timestamp.docs, /When ESPHome booted/);
  assert.deepEqual(
    report.findings.filter((f) => ["optionality_mismatch", "enum_without_values"].includes(f.kind)),
    [],
  );
});

test("a hub trigger documented after a platform section is found on the page's own schema", async () => {
  const trigger = { key: "Optional", type: "schema", schema: { config_vars: { then: { key: "Optional" } } } };
  const { store, report } = await walk({
    schema: {
      esphome: core(["modem"], { binary_sensor: {} }),
      binary_sensor: { binary_sensor: { schemas: { BINARY_SENSOR_SCHEMA: schema({}) }, components: { modem: {} } } },
      modem: {
        modem: { schemas: { CONFIG_SCHEMA: schema({ on_sms: trigger }) } },
        "modem.binary_sensor": { schemas: { CONFIG_SCHEMA: schema({ registered: { key: "Optional" } }) } },
      },
    },
    pages: {
      "modem.mdx": [
        "Modem.",
        "## Component/Hub",
        "### Configuration variables",
        "- **on_sms** (*Optional*, Automation): See below.",
        "## Binary Sensor",
        "### Configuration variables",
        "- **registered** (*Optional*): Registered on the network.",
        "## `on_sms` Trigger",
        "Fires on a message.",
        "### Configuration variables",
        "- **then** (*Optional*, Automation): What to run.",
        "",
      ].join("\n\n"),
    },
  });
  const onSms = store.files.get("modem").modem.schemas.CONFIG_SCHEMA.schema.config_vars.on_sms;
  assert.match(onSms.schema.config_vars.then.docs, /What to run/);
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "unresolved_trigger"),
    [],
  );
});

test("a trigger section reaches an inherited trigger through a docs-only copy on the child", async () => {
  const { store, report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: {
          schemas: {
            BASE_SCHEMA: schema({
              on_event: { key: "Optional", type: "schema", schema: { config_vars: { then: { key: "Optional" } } } },
            }),
            // An earlier page refined the inherited trigger into a copy that holds only docs
            CONFIG_SCHEMA: {
              type: "schema",
              schema: { config_vars: { on_event: { key: "Optional", docs: "x" } }, extends: ["foo.BASE_SCHEMA"] },
            },
          },
        },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## `on_event` Trigger",
        "Fires on an event.",
        "### Configuration variables",
        "- **then** (*Optional*, Automation): What to run.",
        "",
      ].join("\n\n"),
    },
  });
  const base = store.files.get("foo").foo.schemas.BASE_SCHEMA.schema.config_vars.on_event;
  assert.match(base.schema.config_vars.then.docs, /What to run/);
  assert.deepEqual(
    report.findings.filter((f) => ["unmatched_key", "unroutable_section", "unresolved_trigger"].includes(f.kind)),
    [],
  );
});

test("options under a trigger heading a component page cannot place are dropped, not written to it", async () => {
  const { docs, report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: { foo: { schemas: { CONFIG_SCHEMA: schema({ id: { key: "GeneratedID" }, name: { key: "Optional" } }) } } },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Configuration variables",
        "- **name** (*Optional*, string): The name.",
        "## `foo.on_missing` Trigger",
        "- **name** (*Optional*, string): Text for the missing trigger.",
        "### Configuration variables",
        "- **name** (*Optional*, string): Text for the missing trigger.",
        "",
      ].join("\n\n"),
    },
  });
  assert.match(docs("foo", "foo", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", "name"), /The name\./);
  assert.deepEqual(
    report.findings.map((f) => [f.kind, f.line]),
    [
      ["unresolved_trigger", 11],
      ["orphan_option_list", 13],
      ["unroutable_section", 15],
      ["orphan_option_list", 17],
    ],
  );
});

test("a trigger a platform index page cannot place is reported; its bullets are counted, not written", async () => {
  const { store, report } = await walk({
    schema: {
      esphome: core([], { gizmo: {} }),
      gizmo: { gizmo: { schemas: { GIZMO_SCHEMA: schema({ name: { key: "Optional" }, mode: { key: "Optional" } }) } } },
    },
    pages: {
      "gizmo/index.mdx": [
        "Gizmos.",
        "## Configuration variables",
        "- **name** (*Optional*, string): The name.",
        "## `gizmo.on_missing` Trigger",
        "- **then** (*Optional*, Automation): What to run.",
        "- **name** (*Optional*, string): Text that belongs to the trigger, not the platform.",
        "## Other",
        "- **mode** (*Optional*, string): The mode.",
        "",
      ].join("\n\n"),
    },
  });
  const base = store.files.get("gizmo").gizmo.schemas.GIZMO_SCHEMA.schema.config_vars;
  assert.match(base.name.docs, /The name\./);
  assert.match(base.mode.docs, /The mode\./);
  assert.deepEqual(
    report.findings.map((f) => [f.kind, f.line]),
    [["unresolved_trigger", 11]],
  );
  assert.equal(report.stats.keysHeld, 2);
});

test("a platform key documented on the base page is not created on the base schema without docs", async () => {
  const { store, report } = await walk({
    schema: {
      esphome: core(["foo"], { gizmo: {} }),
      gizmo: { gizmo: { schemas: { GIZMO_SCHEMA: schema({ name: { key: "Optional" } }) }, components: { foo: {} } } },
      foo: {
        "foo.gizmo": { schemas: { CONFIG_SCHEMA: schema({ speed: { key: "Optional" }, mode: { key: "Optional" } }) } },
      },
    },
    pages: {
      "gizmo/index.mdx": [
        "Gizmos.",
        "## Configuration variables",
        "- **speed** (*Optional*, int): The speed.",
        "- **mode**: (*Optional*, string)",
        "",
      ].join("\n\n"),
    },
  });
  const base = store.files.get("gizmo").gizmo.schemas.GIZMO_SCHEMA.schema.config_vars;
  assert.match(base.speed.docs, /The speed/);
  assert.equal(base.mode, undefined);
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "unmatched_key"),
    [],
  );
});

test("a sibling-schema heading keeps its section through a nested configuration heading", async () => {
  const { docs, report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: {
          schemas: {
            CONFIG_SCHEMA: schema({ name: { key: "Optional" } }),
            LIGHT_STATE_SCHEMA: schema({ brightness: { key: "Optional" } }),
          },
        },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Configuration variables",
        "- **name** (*Optional*, string): The name.",
        "## Light state",
        "A light state has these variables:",
        "### Configuration variables",
        "- **brightness** (*Optional*, percentage): The brightness.",
        "## Unrelated",
        "### Configuration variables",
        "- **name** (*Optional*, string): Still the name.",
        "",
      ].join("\n\n"),
    },
  });
  assert.match(
    docs("foo", "foo", "schemas", "LIGHT_STATE_SCHEMA", "schema", "config_vars", "brightness"),
    /The brightness/,
  );
  assert.match(docs("foo", "foo", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", "name"), /Still the name/);
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "unmatched_key"),
    [],
  );
});

test("a bold configuration label stays inside the sub-schema section it follows", async () => {
  const { docs, report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: {
          schemas: {
            CONFIG_SCHEMA: schema({
              name: { key: "Optional" },
              legend: { key: "Optional", type: "schema", schema: { config_vars: { border: { key: "Optional" } } } },
            }),
          },
        },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Configuration variables",
        "- **name** (*Optional*, string): The name.",
        "### Legend Options",
        "**Configuration variables:**",
        "- **border** (*Optional*, boolean): Draw a border.",
        "",
      ].join("\n\n"),
    },
  });
  assert.match(
    docs(
      "foo",
      "foo",
      "schemas",
      "CONFIG_SCHEMA",
      "schema",
      "config_vars",
      "legend",
      "schema",
      "config_vars",
      "border",
    ),
    /Draw a border/,
  );
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "unmatched_key"),
    [],
  );
});

test("a nested key only one typed variant has is still audited", async () => {
  const options = (extra = {}) => ({
    key: "Optional",
    type: "schema",
    schema: { config_vars: { x: { key: "Optional" }, ...extra } },
  });
  const { report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: {
          schemas: {
            CONFIG_SCHEMA: {
              type: "typed",
              typed_key: "model",
              types: {
                a: { config_vars: { options: options() } },
                b: { config_vars: { options: options({ extra: { key: "Optional" } }) } },
              },
            },
          },
        },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Configuration variables",
        "- **model** (**Required**): The model.",
        "- **options** (*Optional*): The options.\n  - **x** (*Optional*, int): X.",
        "",
      ].join("\n\n"),
    },
  });
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "undocumented_key").map((f) => [f.schema, f.key]),
    [["foo.CONFIG_SCHEMA/options", "extra"]],
  );
});

test("nested audits two levels down are kept apart per branch", async () => {
  const branch = (...keys) => ({
    key: "Optional",
    type: "schema",
    schema: {
      config_vars: {
        options: {
          key: "Optional",
          type: "schema",
          schema: { config_vars: Object.fromEntries(keys.map((k) => [k, { key: "Optional" }])) },
        },
      },
    },
  });
  const { report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: { foo: { schemas: { CONFIG_SCHEMA: schema({ left: branch("a"), right: branch("b", "c") }) } } },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Configuration variables",
        "- **left** (*Optional*): Left.\n  - **options** (*Optional*): Options.\n    - **a** (*Optional*, int): A.",
        "- **right** (*Optional*): Right.\n  - **options** (*Optional*): Options.\n    - **c** (*Optional*, int): C.",
        "",
      ].join("\n\n"),
    },
  });
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "undocumented_key").map((f) => [f.schema, f.key]),
    [["foo.CONFIG_SCHEMA/right/options", "b"]],
  );
});

test("a rerun over an emitted bundle replaces a changed component intro", async () => {
  const bundle = { esphome: core(["radar"]), radar: { radar: { schemas: { CONFIG_SCHEMA: schema({}) } } } };
  const first = await walk({ schema: bundle, pages: { "radar.mdx": "Radar.\n" } });
  const emitted = Object.fromEntries(first.store.files);
  assert.match(emitted.esphome.core.components.radar.docs, /^Radar\./);
  const { store } = await walk({ schema: emitted, pages: { "radar.mdx": "Radar sensor.\n" } });
  assert.match(store.core.components.radar.docs, /^Radar sensor\./);
});

test("options under a sub-section heading nested in an action heading go to the nested schema", async () => {
  const { docs } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: {
          schemas: { CONFIG_SCHEMA: schema({}) },
          action: {
            do: schema({
              mode: { key: "Optional" },
              options: { key: "Optional", ...schema({ mode: { key: "Optional" } }) },
            }),
          },
        },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## `foo.do` Action",
        "Does it.",
        "- **mode** (*Optional*, string): The action mode.",
        "### Options",
        "#### Configuration variables",
        "- **mode** (*Optional*, string): The option mode.",
        "",
      ].join("\n\n"),
    },
  });
  const action = (...k) => docs("foo", "foo", "action", "do", "schema", "config_vars", ...k);
  assert.match(action("mode"), /The action mode/);
  assert.match(action("options", "schema", "config_vars", "mode"), /The option mode/);
});

test("a choice one outer variant's typed schema lacks is not added to it", async () => {
  const options = (types) => ({ key: "Optional", type: "typed", typed_key: "kind", types });
  const { store } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: {
          schemas: {
            CONFIG_SCHEMA: {
              type: "typed",
              typed_key: "model",
              types: {
                a: { config_vars: { options: options({ fast: { config_vars: {} }, slow: { config_vars: {} } }) } },
                b: { config_vars: { options: options({ fast: { config_vars: {}, default: true } }) } },
              },
            },
          },
        },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Configuration variables",
        "- **model** (**Required**): The model.",
        "- **options** (*Optional*): The options.",
        "## `options` Trigger",
        "- **kind** (**Required**): The kind.\n  - `fast`: Quick.\n  - `slow` (*default*): Careful.",
        "",
      ].join("\n\n"),
    },
  });
  const types = (model) => store.files.get("foo").foo.schemas.CONFIG_SCHEMA.types[model].config_vars.options.types;
  assert.match(types("a").slow.docs, /Careful/);
  assert.equal(types("a").slow.default, true);
  assert.match(types("b").fast.docs, /Quick/);
  assert.equal("slow" in types("b"), false);
  // b's own default is not touched by a default chosen among a's choices
  assert.equal(types("b").fast.default, true);
});

test("a rerun that marks another choice as the default moves the flag", async () => {
  const bundle = {
    esphome: core(["foo"]),
    foo: {
      foo: {
        schemas: {
          CONFIG_SCHEMA: schema({
            mode: { key: "Optional", type: "enum", values: { FAST: null, SLOW: null } },
            level: { key: "Optional", type: "enum", values: { LOW: null, HIGH: null } },
          }),
        },
      },
    },
  };
  const page = (fast, low) =>
    [
      "Foo.",
      "## Configuration variables",
      "- **mode** (*Optional*): The mode.",
      `<EnumValues values={[{ value: "FAST", description: "Quick"${fast ? ", default: true" : ""} }, { value: "SLOW", description: "Careful"${fast ? "" : ", default: true"} }]} />`,
      `- **level** (*Optional*): The level.\n  - \`LOW\`${low ? " (default)" : ""}: Soft.\n  - \`HIGH\`${low ? "" : " (default)"}: Loud.`,
      "",
    ].join("\n\n");
  const first = await walk({ schema: bundle, pages: { "foo.mdx": page(true, true) } });
  const emitted = Object.fromEntries(first.store.files);
  const { store } = await walk({ schema: emitted, pages: { "foo.mdx": page(false, false) } });
  const vars = store.files.get("foo").foo.schemas.CONFIG_SCHEMA.schema.config_vars;
  assert.equal(vars.mode.values.FAST.default, undefined);
  assert.equal(vars.mode.values.SLOW.default, true);
  assert.equal(vars.level.values.LOW.default, undefined);
  assert.equal(vars.level.values.HIGH.default, true);
});

test("an explicit default: false in a rerun clears the old default", async () => {
  const bundle = {
    esphome: core(["foo"]),
    foo: {
      foo: {
        schemas: {
          CONFIG_SCHEMA: schema({ mode: { key: "Optional", type: "enum", values: { FAST: null, SLOW: null } } }),
        },
      },
    },
  };
  const page = (fastDefault) =>
    [
      "Foo.",
      "## Configuration variables",
      "- **mode** (*Optional*): The mode.",
      `<EnumValues values={[{ value: "FAST", description: "Quick", default: ${fastDefault} }, { value: "SLOW", description: "Careful", default: ${!fastDefault} }]} />`,
      "",
    ].join("\n\n");
  const first = await walk({ schema: bundle, pages: { "foo.mdx": page(true) } });
  const emitted = Object.fromEntries(first.store.files);
  const { store } = await walk({ schema: emitted, pages: { "foo.mdx": page(false) } });
  const values = store.files.get("foo").foo.schemas.CONFIG_SCHEMA.schema.config_vars.mode.values;
  assert.equal(values.FAST.default, undefined);
  assert.equal(values.SLOW.default, true);
});

test("a sibling heading after a bus section routes its bullets to the page's own schema", async () => {
  const { docs, report } = await walk({
    schema: {
      esphome: core(["ina_i2c", "ina_spi"], { sensor: {} }),
      sensor: { sensor: { schemas: {}, components: { ina_i2c: {}, ina_spi: {} } } },
      ina_i2c: {
        "ina_i2c.sensor": {
          schemas: { CONFIG_SCHEMA: schema({ address: { key: "Optional" }, current: { key: "Optional" } }) },
        },
      },
      ina_spi: {
        "ina_spi.sensor": {
          schemas: { CONFIG_SCHEMA: schema({ cs_pin: { key: "Required" }, current: { key: "Optional" } }) },
        },
      },
    },
    pages: {
      "sensor/ina.mdx": [
        "The INA sensor.",
        "## Over SPI",
        "- **cs_pin** (**Required**, pin): Chip select.",
        "## Sensors",
        "- **current** (*Optional*): The current.",
        "",
      ].join("\n\n"),
    },
  });
  for (const bus of ["ina_i2c", "ina_spi"]) {
    assert.match(
      docs(bus, `${bus}.sensor`, "schemas", "CONFIG_SCHEMA", "schema", "config_vars", "current"),
      /The current/,
    );
  }
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "unmatched_key"),
    [],
  );
});

test("an enum choice only some typed variants accept is written to those and is not unknown", async () => {
  const mode = (values) => ({ key: "Optional", type: "enum", values });
  const { store, report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: {
          schemas: {
            CONFIG_SCHEMA: {
              type: "typed",
              typed_key: "model",
              types: {
                a: { config_vars: { mode: mode({ FAST: null }) } },
                b: { config_vars: { mode: mode({ FAST: null, SLOW: null }) } },
              },
            },
          },
        },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Configuration variables",
        "- **model** (**Required**): The model.",
        "- **mode** (*Optional*): The mode.\n  - `FAST`: Quick.\n  - `SLOW`: Careful.",
        '<EnumValues values={[{ value: "SLOW", default: true }]} />',
        "",
      ].join("\n\n"),
    },
  });
  const values = (model) => store.files.get("foo").foo.schemas.CONFIG_SCHEMA.types[model].config_vars.mode.values;
  assert.match(values("a").FAST.docs, /Quick/);
  assert.equal("SLOW" in values("a"), false);
  assert.match(values("b").SLOW.docs, /Careful/);
  assert.equal(values("b").SLOW.default, true);
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "unknown_enum_value"),
    [],
  );
});

test("a platform heading that names a component routes to that component's platform", async () => {
  const { docs, report } = await walk({
    schema: {
      esphome: core(["ttp229_lsf", "ttp229_bsf"], { binary_sensor: {} }),
      binary_sensor: { binary_sensor: { schemas: {}, components: { ttp229_lsf: {}, ttp229_bsf: {} } } },
      ttp229_lsf: {
        ttp229_lsf: { schemas: { CONFIG_SCHEMA: schema({ address: { key: "Optional" } }) } },
        "ttp229_lsf.binary_sensor": { schemas: { CONFIG_SCHEMA: schema({ channel: { key: "Required" } }) } },
      },
      ttp229_bsf: {
        ttp229_bsf: { schemas: { CONFIG_SCHEMA: schema({ sdo_pin: { key: "Required" } }) } },
        "ttp229_bsf.binary_sensor": { schemas: { CONFIG_SCHEMA: schema({ channel: { key: "Required" } }) } },
      },
    },
    pages: {
      "binary_sensor/ttp229.mdx": [
        "Touch pads.",
        "## `ttp229_bsf` Component",
        "### Configuration variables",
        "- **sdo_pin** (**Required**, pin): The data pin.",
        "## `ttp229_bsf` Binary Sensor",
        "- **channel** (**Required**, int): The pad.",
        "",
      ].join("\n\n"),
    },
  });
  assert.match(
    docs("ttp229_bsf", "ttp229_bsf", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", "sdo_pin"),
    /data pin/,
  );
  assert.match(
    docs("ttp229_bsf", "ttp229_bsf.binary_sensor", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", "channel"),
    /The pad/,
  );
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "unmatched_key"),
    [],
  );
});

test("a generated id documented as optional agrees with the schema", async () => {
  const { report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: { foo: { schemas: { CONFIG_SCHEMA: schema({ id: { key: "GeneratedID" } }) } } },
    },
    pages: {
      "foo.mdx": ["Foo.", "## Configuration variables", "- **id** (*Optional*, ID): The id.", ""].join("\n\n"),
    },
  });
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "optionality_mismatch"),
    [],
  );
});

test("a hub page with its own platform heading keeps the page-level options for the hub", async () => {
  const { docs, report } = await walk({
    schema: {
      esphome: core(["mcp4728"], { output: {} }),
      output: { output: { schemas: {}, components: { mcp4728: {} } } },
      mcp4728: {
        mcp4728: { schemas: { CONFIG_SCHEMA: schema({ id: { key: "GeneratedID" }, address: { key: "Optional" } }) } },
        "mcp4728.output": {
          schemas: { CONFIG_SCHEMA: schema({ id: { key: "Required" }, channel: { key: "Required" } }) },
        },
      },
    },
    pages: {
      "output/mcp4728.mdx": [
        "A four channel DAC.",
        "## Configuration variables",
        "- **id** (*Optional*, ID): The hub id.",
        "- **address** (*Optional*, int): The I²C address.",
        "## MCP4728 Output",
        "### Configuration variables",
        "- **id** (**Required**, ID): The output id.",
        "- **channel** (**Required**, string): The channel.",
        "",
      ].join("\n\n"),
    },
  });
  const hub = (key) => docs("mcp4728", "mcp4728", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", key);
  const out = (key) => docs("mcp4728", "mcp4728.output", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", key);
  assert.match(hub("id"), /hub id/);
  assert.match(hub("address"), /address/);
  assert.match(out("id"), /output id/);
  assert.match(out("channel"), /channel/);
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "unmatched_key" || f.kind === "optionality_mismatch"),
    [],
  );
});

test("a dotted trigger heading reaches a trigger nested under a key of the schema", async () => {
  const trigger = { key: "Optional", type: "trigger", schema: { config_vars: { then: { key: "Optional" } } } };
  const { store, report } = await walk({
    schema: {
      esphome: core(["cn105"]),
      cn105: {
        cn105: { schemas: { CONFIG_SCHEMA: schema({ vane: { key: "Optional", ...schema({ on_state: trigger }) } }) } },
      },
    },
    pages: {
      "cn105.mdx": [
        "A heat pump.",
        "## Configuration variables",
        "- **vane** (*Optional*): Vane automations.",
        "  - **on_state** (*Optional*, Automation): See below.",
        "## `vane.on_state` Trigger",
        "Fires with the vane state.",
        "### Configuration variables",
        "- **then** (*Optional*, Automation): What to run.",
        "",
      ].join("\n\n"),
    },
  });
  const vane = store.files.get("cn105").cn105.schemas.CONFIG_SCHEMA.schema.config_vars.vane;
  assert.match(vane.schema.config_vars.on_state.schema.config_vars.then.docs, /What to run/);
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "unresolved_trigger"),
    [],
  );
});

test("a component-qualified trigger heading still resolves by its last word", async () => {
  const trigger = { key: "Optional", type: "trigger", schema: { config_vars: { then: { key: "Optional" } } } };
  const { store, report } = await walk({
    schema: {
      esphome: core(["time"]),
      time: { time: { schemas: { CONFIG_SCHEMA: schema({ on_time: trigger }) } } },
    },
    pages: {
      "time.mdx": [
        "Time.",
        "## `time.on_time` Trigger",
        "### Configuration variables",
        "- **then** (*Optional*, Automation): What to run.",
        "",
      ].join("\n\n"),
    },
  });
  const onTime = store.files.get("time").time.schemas.CONFIG_SCHEMA.schema.config_vars.on_time;
  assert.match(onTime.schema.config_vars.then.docs, /What to run/);
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "unresolved_trigger"),
    [],
  );
});

test("a platform heading without a schema in the bundle blocks its options", async () => {
  const { docs, report } = await walk({
    schema: {
      esphome: core(["foo"], { select: {} }),
      select: { select: { schemas: {}, components: {} } },
      foo: { foo: { schemas: { CONFIG_SCHEMA: schema({ name: { key: "Optional" } }) } } },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Configuration variables",
        "- **name** (*Optional*, string): The hub name.",
        "## Select",
        "- **name** (**Required**, string): The select name.",
        "",
      ].join("\n\n"),
    },
  });
  assert.match(docs("foo", "foo", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", "name"), /hub name/);
  assert.equal(report.findings.filter((f) => f.kind === "unresolved_component_heading").length, 1);
});

test("a sub-heading under a grouped action heading documents the options of every action", async () => {
  const options = { key: "Optional", ...schema({ speed: { key: "Optional" }, mode: { key: "Optional" } }) };
  const { docs, report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: {
          schemas: { CONFIG_SCHEMA: schema({}) },
          action: { next: schema({ options }), previous: schema({ options }) },
        },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## `foo.next` / `foo.previous` Action",
        "Step.",
        "### Options",
        "- **speed** (*Optional*, int): How fast.",
        "",
      ].join("\n\n"),
    },
  });
  for (const name of ["next", "previous"]) {
    assert.match(
      docs("foo", "foo", "action", name, "schema", "config_vars", "options", "schema", "config_vars", "speed"),
      /How fast/,
    );
  }
  // The nested option left out is reported for each action's own options
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "undocumented_key").map((f) => [f.schema, f.key]),
    [
      ["foo.action.next/options", "mode"],
      ["foo.action.previous/options", "mode"],
    ],
  );
});

test("a code sub-heading two levels under a grouped action heading audits each action's nested schema", async () => {
  const inner = { key: "Optional", ...schema({ depth: { key: "Optional" }, omitted: { key: "Optional" } }) };
  const options = { key: "Optional", ...schema({ speed: { key: "Optional" }, inner }) };
  const { docs, report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: {
          schemas: { CONFIG_SCHEMA: schema({}) },
          action: { next: schema({ options }), previous: schema({ options }) },
        },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## `foo.next` / `foo.previous` Action",
        "Step.",
        "### Options",
        "- **speed** (*Optional*, int): How fast.",
        "- **inner** (*Optional*): Nested.",
        "#### `inner`",
        "- **depth** (*Optional*, int): How deep.",
        "",
      ].join("\n\n"),
    },
  });
  for (const name of ["next", "previous"]) {
    const vars = ["foo", "foo", "action", name, "schema", "config_vars", "options", "schema", "config_vars"];
    assert.match(docs(...vars, "inner", "schema", "config_vars", "depth"), /How deep/);
  }
  // The nested schema of each action is audited on its own, and nothing leaks into the options audit
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "undocumented_key").map((f) => [f.schema, f.key]),
    [
      ["foo.action.next/options/inner", "omitted"],
      ["foo.action.previous/options/inner", "omitted"],
    ],
  );
});

test("a grouped action whose member lacks the nested path is reported instead of dropped", async () => {
  const options = { key: "Optional", ...schema({ speed: { key: "Optional" } }) };
  const { report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: {
          schemas: { CONFIG_SCHEMA: schema({}) },
          action: { next: schema({ options }), previous: schema({ other: { key: "Optional" } }) },
        },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## `foo.next` / `foo.previous` Action",
        "Step.",
        "### Options",
        "- **speed** (*Optional*, int): How fast.",
        "",
      ].join("\n\n"),
    },
  });
  const unroutable = report.findings.filter((f) => f.kind === "unroutable_section");
  assert.deepEqual(
    unroutable.map((f) => f.detail),
    ["schema 'foo.action.previous/options' not found under a grouped heading"],
  );
});

test("a trigger heading under an action heading reaches the action's own trigger", async () => {
  const trigger = { key: "Optional", type: "trigger", schema: { config_vars: { then: { key: "Optional" } } } };
  const { store, report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: {
          schemas: { CONFIG_SCHEMA: schema({ on_done: trigger }) },
          action: { do: schema({ id: { key: "Required" }, on_done: trigger }) },
        },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## `foo.do` Action",
        "Does it.",
        "### Configuration variables",
        "- **id** (**Required**, ID): The target.",
        "### `on_done` Trigger",
        "#### Configuration variables",
        "- **then** (*Optional*, Automation): After the action.",
        "",
      ].join("\n\n"),
    },
  });
  const action = store.files.get("foo").foo.action.do.schema.config_vars.on_done;
  assert.match(action.schema.config_vars.then.docs, /After the action/);
  const component = store.files.get("foo").foo.schemas.CONFIG_SCHEMA.schema.config_vars.on_done;
  assert.equal(component.schema.config_vars.then.docs, undefined);
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "unresolved_trigger"),
    [],
  );
});

test("a sub-heading under an unknown action does not fall back to the page schema", async () => {
  const options = { key: "Optional", ...schema({ mode: { key: "Optional" } }) };
  const { docs, report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: { foo: { schemas: { CONFIG_SCHEMA: schema({ options }) }, action: {} } },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## `foo.missing` Action",
        "Gone.",
        "### Options",
        "- **mode** (*Optional*, string): The action's mode.",
        "",
      ].join("\n\n"),
    },
  });
  assert.equal(
    docs("foo", "foo", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", "options", "schema", "config_vars", "mode"),
    undefined,
  );
  assert.equal(report.findings.filter((f) => f.kind === "unknown_registry_entry").length, 1);
});

test("a missing schema entry is reported even when the page has no intro", async () => {
  const { report } = await walk({
    schema: { esphome: core([]) },
    pages: { "foo.mdx": ["## Configuration variables", "- **bar** (*Optional*, int): Bar.", ""].join("\n\n") },
  });
  assert.equal(report.findings.filter((f) => f.kind === "missing_schema_entry").length, 1);
});

test("a bullet two sub-schemas share is reported as ambiguous", async () => {
  const sub = { key: "Optional", ...schema({ priority: { key: "Optional" } }) };
  const { report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: { foo: { schemas: { CONFIG_SCHEMA: schema({ on_boot: sub, on_shutdown: sub }) } } },
    },
    pages: {
      "foo.mdx": ["Foo.", "## Configuration variables", "- **priority** (*Optional*, float): The priority.", ""].join(
        "\n\n",
      ),
    },
  });
  assert.equal(report.findings.filter((f) => f.kind === "ambiguous_nested_key").length, 1);
  // Not written, so not matched: it counts on the unplaced side of the emit guard
  assert.equal(report.stats.keysMatchedNested, 0);
  assert.equal(report.stats.keysOrphaned, 1);
});

test("a plural sibling heading ends an action's section", async () => {
  const { docs, report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: { schemas: { CONFIG_SCHEMA: schema({}) }, action: { send: schema({ address: { key: "Required" } }) } },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## `foo.send` Action",
        "Sends.",
        "- **address** (**Required**, int): The send address.",
        "## Typed Read/Write Actions",
        "### Common Configuration Variables",
        "- **address** (**Required**, int): The typed address.",
        "",
      ].join("\n\n"),
    },
  });
  assert.match(docs("foo", "foo", "action", "send", "schema", "config_vars", "address"), /send address/);
  assert.equal(report.findings.filter((f) => f.kind === "orphan_option_list" || f.kind === "unmatched_key").length, 1);
});

test("a flat bullet matched inside one sub-schema keeps its enum for the block that follows", async () => {
  const mode = { key: "Optional", type: "enum", values: { FAST: null, SLOW: null } };
  const { store, report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: { foo: { schemas: { CONFIG_SCHEMA: schema({ options: { key: "Optional", ...schema({ mode }) } }) } } },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Configuration variables",
        "- **mode** (*Optional*, enum): The mode.",
        '<EnumValues values={[{ value: "FAST", description: "Quick" }, { value: "SLOW", description: "Careful" }]} />',
        "",
      ].join("\n\n"),
    },
  });
  const values =
    store.files.get("foo").foo.schemas.CONFIG_SCHEMA.schema.config_vars.options.schema.config_vars.mode.values;
  assert.match(values.FAST.docs, /Quick/);
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "enum_values_without_enum"),
    [],
  );
});

test("a plain Actions heading documents what every action of the component takes", async () => {
  const { docs } = await walk({
    schema: {
      esphome: core(["dfp"]),
      dfp: {
        dfp: {
          schemas: { CONFIG_SCHEMA: schema({ id: { key: "GeneratedID" } }) },
          action: { play: schema({ id: { key: "GeneratedID" } }), pause: schema({ id: { key: "GeneratedID" } }) },
        },
      },
    },
    pages: {
      "dfp.mdx": [
        "A player.",
        "## Configuration variables",
        "- **id** (*Optional*, ID): The player.",
        "## `dfp.play` Action",
        "Plays.",
        "## All actions",
        "- **id** (*Optional*, ID): The player to act on.",
        "",
      ].join("\n\n"),
    },
  });
  for (const name of ["play", "pause"]) {
    assert.match(docs("dfp", "dfp", "action", name, "schema", "config_vars", "id"), /to act on/);
  }
  assert.match(docs("dfp", "dfp", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", "id"), /The player\./);
});

test("a plural platform heading splits a hub page and routes to the platform", async () => {
  const { docs } = await walk({
    schema: {
      esphome: core(["mk2"], { sensor: {} }),
      sensor: { sensor: { schemas: {}, components: { mk2: {} } } },
      mk2: {
        mk2: { schemas: { CONFIG_SCHEMA: schema({ id: { key: "GeneratedID" }, uart_id: { key: "Optional" } }) } },
        "mk2.sensor": { schemas: { CONFIG_SCHEMA: schema({ id: { key: "GeneratedID" }, tag: { key: "Required" } }) } },
      },
    },
    pages: {
      "sensor/mk2.mdx": [
        "A router.",
        "## Configuration Variables",
        "- **id** (*Optional*, ID): The hub.",
        "- **uart_id** (*Optional*, ID): The bus.",
        "## Sensors",
        "- **tag** (**Required**, string): The tag.",
        "",
      ].join("\n\n"),
    },
  });
  assert.match(docs("mk2", "mk2", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", "id"), /The hub/);
  assert.match(docs("mk2", "mk2.sensor", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", "tag"), /The tag/);
});

test("a flat bullet reaches a sub-schema the base declares", async () => {
  const { docs } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: {
          schemas: {
            BASE_SCHEMA: schema({ options: { key: "Optional", ...schema({ threshold: { key: "Optional" } }) } }),
            CONFIG_SCHEMA: {
              type: "schema",
              schema: { config_vars: { pin: { key: "Required" } }, extends: ["foo.BASE_SCHEMA"] },
            },
          },
        },
      },
    },
    pages: {
      "foo.mdx": ["Foo.", "## Configuration variables", "- **threshold** (*Optional*, int): The threshold.", ""].join(
        "\n\n",
      ),
    },
  });
  assert.match(
    docs(
      "foo",
      "foo",
      "schemas",
      "BASE_SCHEMA",
      "schema",
      "config_vars",
      "options",
      "schema",
      "config_vars",
      "threshold",
    ),
    /The threshold/,
  );
});

test("options nested under a prose bullet are routed", async () => {
  const { docs, report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: { foo: { schemas: { CONFIG_SCHEMA: schema({ pulse_length: { key: "Required" } }) } } },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Configuration variables",
        "- Or a key-value mapping is given, then there are these settings:\n\n  - **pulse_length** (**Required**, int): The pulse length.",
        "",
      ].join("\n\n"),
    },
  });
  assert.match(docs("foo", "foo", "schemas", "CONFIG_SCHEMA", "schema", "config_vars", "pulse_length"), /pulse length/);
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "unmatched_key" || f.kind === "undocumented_key"),
    [],
  );
});

test("an option list after a sibling heading is reported rather than written over the previous schema", async () => {
  const { docs, report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: { schemas: { CONFIG_SCHEMA: schema({}) }, action: { send: schema({ address: { key: "Required" } }) } },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## `foo.send` Action",
        "- **address** (**Required**, int): The send address.",
        "## Notes on addressing",
        "- **address** (**Required**, int): Something else.",
        "",
      ].join("\n\n"),
    },
  });
  assert.match(docs("foo", "foo", "action", "send", "schema", "config_vars", "address"), /send address/);
  assert.equal(report.findings.filter((f) => f.kind === "option_list_after_sibling_heading").length, 1);
  assert.equal(report.stats.keysOrphaned, 1);
});

test("a trigger heading under a heading naming two actions reaches both actions' triggers", async () => {
  const trigger = { key: "Optional", type: "trigger", schema: { config_vars: { then: { key: "Optional" } } } };
  const { docs } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: {
          schemas: { CONFIG_SCHEMA: schema({}) },
          action: { next: schema({ on_done: trigger }), previous: schema({ on_done: trigger }) },
        },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## `foo.next` / `foo.previous` Action",
        "Step.",
        "### `on_done` Trigger",
        "- **then** (*Optional*, Automation): After the step.",
        "",
      ].join("\n\n"),
    },
  });
  for (const name of ["next", "previous"]) {
    assert.match(
      docs("foo", "foo", "action", name, "schema", "config_vars", "on_done", "schema", "config_vars", "then"),
      /After the step/,
    );
  }
});

test("common options under a grouped heading and each action's own options audit together", async () => {
  const { report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: {
        foo: {
          schemas: { CONFIG_SCHEMA: schema({}) },
          action: {
            read: schema({ address: { key: "Required" }, count: { key: "Required" } }),
            write: schema({ address: { key: "Required" }, value: { key: "Required" } }),
          },
        },
      },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## Typed Actions",
        "### Common Configuration Variables",
        "- **address** (**Required**, int): The address.",
        "### `foo.read` Action",
        "- **count** (**Required**, int): How many.",
        "### `foo.write` Action",
        "- **value** (**Required**, int): What to write.",
        "",
      ].join("\n\n"),
    },
  });
  assert.deepEqual(
    report.findings.filter((f) => f.kind === "undocumented_key"),
    [],
  );
});

test("an unresolved heading under an action does not leave the action's options pending", async () => {
  const { docs, report } = await walk({
    schema: {
      esphome: core(["foo"]),
      foo: { foo: { schemas: { CONFIG_SCHEMA: schema({}) }, action: { do: schema({ mode: { key: "Optional" } }) } } },
    },
    pages: {
      "foo.mdx": [
        "Foo.",
        "## `foo.do` Action",
        "- **mode** (*Optional*, string): The action's mode.",
        "### Missing Component",
        "#### Configuration variables",
        "- **mode** (*Optional*, string): The missing component's mode.",
        "",
      ].join("\n\n"),
    },
  });
  assert.match(docs("foo", "foo", "action", "do", "schema", "config_vars", "mode"), /action's mode/);
  assert.equal(report.findings.filter((f) => f.kind === "unresolved_component_heading").length, 1);
});
