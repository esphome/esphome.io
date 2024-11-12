
import os

from docutils import nodes, utils


def libpr_role(name, rawtext, text, lineno, inliner, options=None, content=None):
    ref = "https://github.com/esphome/esphome-core/pull/{}".format(text)
    return [make_link_node(rawtext, "core#{}".format(text), ref, options)], []


def yamlpr_role(name, rawtext, text, lineno, inliner, options=None, content=None):
    ref = "https://github.com/esphome/esphome/pull/{}".format(text)
    return [make_link_node(rawtext, "esphome#{}".format(text), ref, options)], []


def docspr_role(name, rawtext, text, lineno, inliner, options=None, content=None):
    ref = "https://github.com/esphome/esphome-docs/pull/{}".format(text)
    return [make_link_node(rawtext, "docs#{}".format(text), ref, options)], []


def ghuser_role(name, rawtext, text, lineno, inliner, options=None, content=None):
    ref = "https://github.com/{}".format(text)
    return [make_link_node(rawtext, "@{}".format(text), ref, options)], []


def ghedit_role(name, rawtext, text, lineno, inliner, options=None, content=None):
    path = os.path.relpath(
        inliner.document.current_source, inliner.document.settings.env.app.srcdir
    )
    ref = "https://github.com/esphome/esphome-docs/blob/current/{}".format(path)
    return [make_link_node(rawtext, "Edit this page on GitHub", ref, options)], []


def make_link_node(rawtext, text, ref, options=None):
    options = options or {}
    node = nodes.reference(rawtext, utils.unescape(text), refuri=ref, **options)
    return node


def setup(app):
    app.add_role("libpr", libpr_role)
    app.add_role("corepr", libpr_role)
    app.add_role("yamlpr", yamlpr_role)
    app.add_role("esphomepr", yamlpr_role)
    app.add_role("docspr", docspr_role)
    app.add_role("ghuser", ghuser_role)
    app.add_role("ghedit", ghedit_role)
    return {"version": "1.0.0", "parallel_read_safe": True, "parallel_write_safe": True}
