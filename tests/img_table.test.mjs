import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { resolveImagePath, resolveLinkPath } from "../src/lib/img-table.mjs";

describe("resolveImagePath", () => {
  test("resolves badges to the generated badge URL", () => {
    assert.equal(resolveImagePath("badge:ESP32_S3"), "/images/badges/esp32_s3.svg");
  });

  test("keeps absolute paths", () => {
    assert.equal(resolveImagePath("/images/foo.svg"), "/images/foo.svg");
  });

  test("keeps http and https URLs", () => {
    assert.equal(resolveImagePath("http://example.com/a.png"), "http://example.com/a.png");
    assert.equal(resolveImagePath("https://example.com/a.png"), "https://example.com/a.png");
  });

  test("maps bare filenames under /images/", () => {
    assert.equal(resolveImagePath("foo.svg"), "/images/foo.svg");
  });
});

describe("resolveLinkPath", () => {
  test("adds a trailing slash to a plain page link", () => {
    assert.equal(resolveLinkPath("/components/dht"), "/components/dht/");
  });

  test("keeps a link that already ends with a slash", () => {
    assert.equal(resolveLinkPath("/components/dht/"), "/components/dht/");
  });

  test("puts the slash before an anchor rather than after it", () => {
    assert.equal(resolveLinkPath("/components/light#light-effects"), "/components/light/#light-effects");
    assert.equal(resolveLinkPath("/components/light/#light-effects"), "/components/light/#light-effects");
  });

  test("leaves a legacy .html link with an anchor alone", () => {
    assert.equal(resolveLinkPath("/components/api.html#services"), "/components/api.html#services");
  });
});
