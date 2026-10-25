import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, before, describe, test } from "node:test";
import {
  BADGE_PREFIX,
  badgeImagePath,
  badgeName,
  collectBadgeNames,
  findBadgeNames,
  isValidBadgeName,
} from "../src/lib/badges.mjs";

describe("badgeName", () => {
  test("returns the name after the prefix", () => {
    assert.equal(BADGE_PREFIX, "badge:");
    assert.equal(badgeName("badge:ESP32"), "ESP32");
  });

  test("returns an empty string for a bare prefix", () => {
    assert.equal(badgeName("badge:"), "");
  });

  test("returns null for non-badge images", () => {
    assert.equal(badgeName("esp32.svg"), null);
    assert.equal(badgeName("/images/badge:x.svg"), null);
  });
});

describe("isValidBadgeName", () => {
  test("accepts letters, digits, hyphens and underscores", () => {
    assert.equal(isValidBadgeName("ESP32_S3"), true);
    assert.equal(isValidBadgeName("ESP-NOW"), true);
  });

  test("rejects empty names and other characters", () => {
    assert.equal(isValidBadgeName(""), false);
    assert.equal(isValidBadgeName("ESP.NOW"), false);
    assert.equal(isValidBadgeName("a b"), false);
  });
});

describe("badgeImagePath", () => {
  test("lowercases the name", () => {
    assert.equal(badgeImagePath("ESP32_S3"), "/images/badges/esp32_s3.svg");
  });
});

describe("findBadgeNames", () => {
  test("matches single, double and backtick quotes in order", () => {
    const content = `["a", "/a/", "badge:One"], ['b', '/b/', 'badge:Two'], [\`c\`, \`/c/\`, \`badge:Three\`]`;
    assert.deepEqual(findBadgeNames(content), ["One", "Two", "Three"]);
  });

  test("does not match mismatched quotes or unquoted text", () => {
    assert.deepEqual(findBadgeNames(`"badge:Bad' badge:Bare`), []);
  });

  test("returns an empty array when there are no badges", () => {
    assert.deepEqual(findBadgeNames("nothing here"), []);
  });

  test("keeps duplicates and invalid names", () => {
    assert.deepEqual(findBadgeNames(`"badge:A" "badge:A" "badge:"`), ["A", "A", ""]);
  });
});

describe("collectBadgeNames", () => {
  /** @type {string} */
  let tmp;

  before(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "badges-"));
  });

  after(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  test("collects sorted, de-duplicated names recursively, skipping other files", () => {
    const dir = path.join(tmp, "ok");
    fs.mkdirSync(path.join(dir, "sub", "deeper"), { recursive: true });
    // A directory whose name ends in .mdx must be skipped, not read as a file.
    fs.mkdirSync(path.join(dir, "folder.mdx"));
    fs.writeFileSync(path.join(dir, "a.mdx"), `["x", "/x/", "badge:Zed"] ["y", "/y/", "badge:Alpha"]`);
    fs.writeFileSync(path.join(dir, "sub", "b.mdx"), `["x", "/x/", "badge:Alpha"]`);
    fs.writeFileSync(path.join(dir, "sub", "deeper", "c.mdx"), `["x", "/x/", "badge:Mid_1"]`);
    fs.writeFileSync(path.join(dir, "skip.md"), `"badge:Ignored"`);
    fs.writeFileSync(path.join(dir, "skip.txt"), `"badge:Ignored"`);
    assert.deepEqual(collectBadgeNames(dir), ["Alpha", "Mid_1", "Zed"]);
  });

  test("returns an empty array when nothing is referenced", () => {
    const dir = path.join(tmp, "empty");
    fs.mkdirSync(dir);
    assert.deepEqual(collectBadgeNames(dir), []);
  });

  test("throws naming the file and the invalid name", () => {
    const dir = path.join(tmp, "bad");
    fs.mkdirSync(dir);
    const file = path.join(dir, "bad.mdx");
    fs.writeFileSync(file, `["x", "/x/", "badge:ESP.NOW"]`);
    assert.throws(
      () => collectBadgeNames(dir),
      (err) => err instanceof Error && err.message.includes(file) && err.message.includes("ESP.NOW"),
    );
  });
});
