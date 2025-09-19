#!/usr/bin/env python3

# Takes GENERATE_TAGFILE from Doxygen and outputs a map
# of file paths and class names to Doxygen URL

import json, re, sys
import xml.etree.ElementTree as ET

tree = ET.parse(sys.stdin)
root = tree.getroot()

tags = {}

for tag in root:
    kind = tag.attrib["kind"]

    # Skip pages and groups
    if kind in ["group", "page"]:
        continue

    url = tag.find("filename").text
    name = tag.find("name").text

    # Prepend path to "file" tags
    if kind == "file":
        name = tag.find("path").text + name

    # name = re.sub(r"^esphome(::|/(core|components)/)", "", name)

    tags[name] = url

    # Allow matches without "esphome::" or "esphome/" prefix
    name = re.sub(r"^esphome(::|/)", "", name)
    tags[name] = url

    # Allow matches without "core/" or "components/" prefix
    name = re.sub(r"^(core|components)/", "", name)
    tags[name] = url

print(json.dumps(tags))
