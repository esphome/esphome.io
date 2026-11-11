import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { collectPageAnchors } from "../script/heading-anchors.mjs";
import { createHeadingSlugger } from "../src/lib/heading-slugs.mjs";

const anchors = (content) => [...collectPageAnchors(content)];

describe("createHeadingSlugger", () => {
  test("maps dots to hyphens so automation names stay readable", () => {
    assert.equal(createHeadingSlugger()("`light.turn_on` Action"), "light-turn_on-action");
  });

  test("a dot followed by a space yields two hyphens, as the renderer does", () => {
    assert.equal(createHeadingSlugger()("2. Web Server Authentication"), "2--web-server-authentication");
  });

  test("numbers repeated headings within one page", () => {
    const slug = createHeadingSlugger();
    assert.deepEqual(["Configuration Variables", "Configuration Variables", "Configuration Variables"].map(slug), [
      "configuration-variables",
      "configuration-variables-1",
      "configuration-variables-2",
    ]);
  });

  test("a fresh slugger starts the numbering over", () => {
    assert.equal(createHeadingSlugger()("Configuration Variables"), "configuration-variables");
    assert.equal(createHeadingSlugger()("Configuration Variables"), "configuration-variables");
  });
});

describe("collectPageAnchors", () => {
  test("slugs headings at every level, in document order", () => {
    assert.deepEqual(anchors("# Top\n\n## Middle\n\n###### Deep\n"), ["top", "middle", "deep"]);
  });

  test("uses the rendered text of a heading, not its markdown", () => {
    assert.deepEqual(anchors("## `uart.write` Action\n"), ["uart-write-action"]);
    assert.deepEqual(anchors("## [Home Assistant Yellow](https://home-assistant.io/yellow)\n"), [
      "home-assistant-yellow",
    ]);
    assert.deepEqual(anchors("## **Bold** and *italic*\n"), ["bold-and-italic"]);
  });

  test("ignores frontmatter, whose closing --- would otherwise make a setext heading", () => {
    assert.deepEqual(anchors('---\ntitle: "Web Server"\ndescription: "Serves a page"\n---\n\n## Real\n'), ["real"]);
  });

  test("tolerates a BOM and CRLF line endings", () => {
    assert.deepEqual(anchors('﻿---\r\ntitle: "T"\r\n---\r\n\r\n## Real\r\n'), ["real"]);
  });

  test("applies smartypants, as the site's markdown pipeline does", () => {
    // `...` renders as a single `…`, which github-slugger drops; the literal dots would have
    // become three hyphens.
    assert.deepEqual(anchors("## I have a question... How can I contact you?\n"), [
      "i-have-a-question-how-can-i-contact-you",
    ]);
  });

  test("ignores # inside a fenced code block", () => {
    assert.deepEqual(anchors("## Real\n\n```yaml\n# Not a heading\nsensor:\n```\n"), ["real"]);
  });

  test("ignores a fence indented inside a list item", () => {
    const content = ["## Before", "", "- ```yaml", "  # pins", "  ```", "", "## After", ""].join("\n");
    assert.deepEqual(anchors(content), ["before", "after"]);
  });

  test("finds a heading nested in a list item or blockquote", () => {
    assert.deepEqual(anchors("- ## In A List\n"), ["in-a-list"]);
    assert.deepEqual(anchors("> ## Quoted\n"), ["quoted"]);
  });

  test("numbers repeated headings the way the renderer does", () => {
    assert.deepEqual(anchors("## Setup\n\n## Setup\n"), ["setup", "setup-1"]);
  });

  test("collects explicit span anchor targets alongside headings", () => {
    assert.deepEqual(anchors('<span id="base_time_config"></span>\n\n## Base Time Configuration\n'), [
      "base-time-configuration",
      "base_time_config",
    ]);
  });

  test("returns nothing for a page with no headings or anchors", () => {
    assert.deepEqual(anchors("Just a paragraph.\n\n---\n"), []);
  });
});
