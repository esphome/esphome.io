import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { resolveImagePath } from "../src/lib/img-table.mjs";

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
