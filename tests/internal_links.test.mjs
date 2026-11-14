import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { needsAnchorTrailingSlash, withAnchorTrailingSlash } from "../src/lib/internal-links.mjs";

describe("needsAnchorTrailingSlash", () => {
  test("flags a site-relative page link whose anchor follows a slash-less path", () => {
    assert.equal(needsAnchorTrailingSlash("/components/wifi#manual-ips"), true);
    assert.equal(needsAnchorTrailingSlash("/guides/configuration-types#id"), true);
  });

  test("flags version-numbered pages, whose dotted last segment is not a file extension", () => {
    assert.equal(needsAnchorTrailingSlash("/changelog/2025.10.0#changes"), true);
  });

  test("accepts a link that already has the slash", () => {
    assert.equal(needsAnchorTrailingSlash("/components/wifi/#manual-ips"), false);
    assert.equal(needsAnchorTrailingSlash("/#buy"), false);
  });

  test("ignores links without an anchor", () => {
    assert.equal(needsAnchorTrailingSlash("/components/wifi"), false);
    assert.equal(needsAnchorTrailingSlash("/components/wifi/"), false);
  });

  test("ignores a bare in-page anchor, which is not a site-relative path", () => {
    assert.equal(needsAnchorTrailingSlash("#configuration-variables"), false);
  });

  test("ignores external and protocol-relative URLs", () => {
    assert.equal(needsAnchorTrailingSlash("https://example.com/docs#section"), false);
    assert.equal(needsAnchorTrailingSlash("//example.com/docs#section"), false);
  });

  test("ignores relative links", () => {
    assert.equal(needsAnchorTrailingSlash("wifi#manual-ips"), false);
  });

  test("ignores paths carrying a query string", () => {
    assert.equal(needsAnchorTrailingSlash("/search?q=wifi#results"), false);
  });

  test("ignores file and legacy .html paths", () => {
    assert.equal(needsAnchorTrailingSlash("/components/esphome.html#node-name"), false);
    assert.equal(needsAnchorTrailingSlash("/images/badge.SVG#icon"), false);
    assert.equal(needsAnchorTrailingSlash("/files/firmware.bin#part"), false);
  });

  test("flags a dotted segment whose extension is not a known file type", () => {
    assert.equal(needsAnchorTrailingSlash("/components/foo.bar#baz"), true);
  });

  test("flags a path whose last segment starts with a dot", () => {
    // A leading dot does not introduce an extension, even when what follows it is one, so this
    // stays a page link rather than being mistaken for a file.
    assert.equal(needsAnchorTrailingSlash("/guides/.html#section"), true);
    assert.equal(needsAnchorTrailingSlash("/guides/.hidden#section"), true);
  });
});

describe("withAnchorTrailingSlash", () => {
  test("inserts the slash before the anchor", () => {
    assert.equal(withAnchorTrailingSlash("/components/wifi#manual-ips"), "/components/wifi/#manual-ips");
  });

  test("leaves every other link untouched", () => {
    assert.equal(withAnchorTrailingSlash("/components/wifi/#manual-ips"), "/components/wifi/#manual-ips");
    assert.equal(withAnchorTrailingSlash("/components/wifi"), "/components/wifi");
    assert.equal(withAnchorTrailingSlash("#configuration-variables"), "#configuration-variables");
    assert.equal(withAnchorTrailingSlash("https://example.com/docs#section"), "https://example.com/docs#section");
  });
});
