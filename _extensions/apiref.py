import os
import re
import string

from docutils import nodes, utils

value_re = re.compile(r"^(.*)\s*<(.*)>$")
DOXYGEN_LOOKUP = {}
for s in string.ascii_lowercase + string.digits:
    DOXYGEN_LOOKUP[s] = s
for s in string.ascii_uppercase:
    DOXYGEN_LOOKUP[s] = "_{}".format(s.lower())
DOXYGEN_LOOKUP[":"] = "_1"
DOXYGEN_LOOKUP["_"] = "__"
DOXYGEN_LOOKUP["."] = "_8"

API_DOCS_URL = os.getenv("API_DOCS_URL", "https://api-docs.esphome.io")


def split_text_value(value):
    match = value_re.match(value)
    if match is None:
        return None, value
    return match.group(1), match.group(2)


def encode_doxygen(value):
    value = value.split("/")[-1]
    try:
        return "".join(DOXYGEN_LOOKUP[s] for s in value)
    except KeyError as exc:
        raise ValueError(
            "Unknown character in doxygen string! '{}'".format(value)
        ) from exc


def apiref_role(name, rawtext, text, lineno, inliner, options=None, content=None):
    text, value = split_text_value(text)
    if text is None:
        text = "API Reference"
    ref = f"{API_DOCS_URL}/{encode_doxygen(value)}.html"
    return [make_link_node(rawtext, text, ref, options)], []


def apiclass_role(name, rawtext, text, lineno, inliner, options=None, content=None):
    text, value = split_text_value(text)
    if text is None:
        text = value
    ref = f"{API_DOCS_URL}/classesphome_1_1{encode_doxygen(value)}.html"
    return [make_link_node(rawtext, text, ref, options)], []


def apistruct_role(name, rawtext, text, lineno, inliner, options=None, content=None):
    text, value = split_text_value(text)
    if text is None:
        text = value
    ref = f"{API_DOCS_URL}/structesphome_1_1{encode_doxygen(value)}.html"
    return [make_link_node(rawtext, text, ref, options)], []


def make_link_node(rawtext, text, ref, options=None):
    options = options or {}
    node = nodes.reference(rawtext, utils.unescape(text), refuri=ref, **options)
    return node


def setup(app):
    app.add_role("apiref", apiref_role)
    app.add_role("apiclass", apiclass_role)
    app.add_role("apistruct", apistruct_role)
    return {"version": "1.0.0", "parallel_read_safe": True, "parallel_write_safe": True}
