import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { GET, getStaticPaths, prerender } from "../src/pages/images/badges/[name].svg.ts";

/** Concatenated source of every MDX file under src/content/docs. */
function readAllDocs() {
  const dir = path.resolve("src/content/docs");
  let all = "";
  for (const entry of fs.readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (entry.isFile() && entry.name.endsWith(".mdx")) {
      all += fs.readFileSync(path.join(entry.parentPath, entry.name), "utf-8") + "\n";
    }
  }
  return all;
}

describe("badge endpoint", () => {
  test("is prerendered", () => {
    assert.equal(prerender, true);
  });

  test("getStaticPaths lists the badges used in the docs", async () => {
    const paths = await getStaticPaths();
    assert.ok(paths.length > 0);
    assert.deepEqual(
      paths.find((p) => p.params.name === "esp32"),
      { params: { name: "esp32" }, props: { name: "ESP32" } },
    );
    const docs = readAllDocs();
    for (const { props } of paths) {
      assert.ok(
        [`"badge:${props.name}"`, `'badge:${props.name}'`, `\`badge:${props.name}\``].some((s) => docs.includes(s)),
        `badge:${props.name} not found in docs`,
      );
    }
  });

  test("GET returns an SVG response", async () => {
    const response = GET({ props: { name: "ESP32" } });
    assert.match(response.headers.get("Content-Type"), /^image\/svg\+xml/);
    const body = await response.text();
    assert.ok(body.startsWith("<svg"));
    assert.ok(body.includes('aria-label="ESP32"'));
  });
});
