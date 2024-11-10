import csv
from itertools import zip_longest
import os
import re
import string

from docutils import nodes, utils
from docutils.parsers.rst import directives
from docutils.parsers.rst.directives.tables import Table


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


value_re = re.compile(r"^(.*)\s*<(.*)>$")
DOXYGEN_LOOKUP = {}
for s in string.ascii_lowercase + string.digits:
    DOXYGEN_LOOKUP[s] = s
for s in string.ascii_uppercase:
    DOXYGEN_LOOKUP[s] = "_{}".format(s.lower())
DOXYGEN_LOOKUP[":"] = "_1"
DOXYGEN_LOOKUP["_"] = "__"
DOXYGEN_LOOKUP["."] = "_8"


def split_text_value(value):
    match = value_re.match(value)
    if match is None:
        return None, value
    return match.group(1), match.group(2)


def encode_doxygen(value):
    value = value.split("/")[-1]
    try:
        return "".join(DOXYGEN_LOOKUP[s] for s in value)
    except KeyError:
        raise ValueError("Unknown character in doxygen string! '{}'".format(value))


def apiref_role(name, rawtext, text, lineno, inliner, options=None, content=None):
    text, value = split_text_value(text)
    if text is None:
        text = "API Reference"
    ref = "/api/{}.html".format(encode_doxygen(value))
    return [make_link_node(rawtext, text, ref, options)], []


def apiclass_role(name, rawtext, text, lineno, inliner, options=None, content=None):
    text, value = split_text_value(text)
    if text is None:
        text = value
    ref = "/api/classesphome_1_1{}.html".format(encode_doxygen(value))
    return [make_link_node(rawtext, text, ref, options)], []


def apistruct_role(name, rawtext, text, lineno, inliner, options=None, content=None):
    text, value = split_text_value(text)
    if text is None:
        text = value
    ref = "/api/structesphome_1_1{}.html".format(encode_doxygen(value))
    return [make_link_node(rawtext, text, ref, options)], []


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


# https://stackoverflow.com/a/3415150/8924614
def grouper(n, iterable, fillvalue=None):
    """Pythonic way to iterate over sequence, 4 items at a time.

    grouper(3, 'ABCDEFG', 'x') --> ABC DEF Gxx
    """
    args = [iter(iterable)] * n
    return zip_longest(fillvalue=fillvalue, *args)


# Based on https://www.slideshare.net/doughellmann/better-documentation-through-automation-creating-docutils-sphinx-extensions
class ImageTableDirective(Table):

    option_spec = {
        "columns": directives.positive_int,
    }

    def run(self):
        cols = self.options.get("columns", 3)

        items = []

        data = list(csv.reader(self.content))
        for row in data:
            if not row:
                continue
            name, page, image = row[0:3]
            link = page.strip()
            if link.startswith("http"):
                pass
            else:
                if not link.startswith("/"):
                    link = "/{}".format(link)
                if ".html" not in link:
                    link += ".html"
            category = None
            dark_invert = False
            if len(row) == 4:
                if row[3].strip() == "dark-invert":
                    dark_invert = True
                else:
                    category = row[3].strip()
            if len(row) == 5 and row[4].strip() == "dark-invert":
                category = row[3].strip()
                dark_invert = True
            items.append(
                {
                    "name": name.strip(),
                    "link": link,
                    "image": "/images/{}".format(image.strip()),
                    "category": category,
                    "dark_invert": dark_invert,
                }
            )

        title, messages = self.make_title()
        table = nodes.table()
        table["classes"].append("table-center")
        table["classes"].append("colwidths-given")

        # Set up column specifications based on widths
        tgroup = nodes.tgroup(cols=cols)
        table += tgroup
        tgroup.extend(nodes.colspec(colwidth=1) for _ in range(cols))

        tbody = nodes.tbody()
        tgroup += tbody
        rows = []
        for value in grouper(cols, items):
            trow = nodes.row()
            for cell in value:
                entry = nodes.entry()
                if cell is None:
                    entry += nodes.paragraph()
                    trow += entry
                    continue
                name = cell["name"]
                link = cell["link"]
                image = cell["image"]
                reference_node = nodes.reference(refuri=link)
                img = nodes.image(uri=directives.uri(image), alt=name)
                img["classes"].append("component-image")
                if cell["dark_invert"]:
                    img["classes"].append("dark-invert")
                reference_node += img
                para = nodes.paragraph()
                para += reference_node
                entry += para
                trow += entry
            rows.append(trow)

            trow = nodes.row()
            for cell in value:
                entry = nodes.entry()
                if cell is None:
                    entry += nodes.paragraph()
                    trow += entry
                    continue
                name = cell["name"]
                link = cell["link"]
                ref = nodes.reference(name, name, refuri=link)
                para = nodes.paragraph()
                para += ref
                entry += para
                cat_text = cell["category"]
                if cat_text:
                    cat = nodes.paragraph(text=cat_text)
                    entry += cat
                trow += entry
            rows.append(trow)
        tbody.extend(rows)

        self.add_name(table)
        if title:
            table.insert(0, title)

        return [table] + messages


class PinTableDirective(Table):
    option_spec = {}

    def run(self):
        items = []

        data = list(csv.reader(self.content))
        for row in data:
            if not row:
                continue
            if len(row) == 3:
                items.append((row[0], row[1], True))
            else:
                items.append((row[0], row[1], False))

        col_widths = self.get_column_widths(2)
        title, messages = self.make_title()
        table = nodes.table()

        # Set up column specifications based on widths
        tgroup = nodes.tgroup(cols=2)
        table += tgroup
        tgroup.extend(nodes.colspec(colwidth=col_width) for col_width in col_widths)

        thead = nodes.thead()
        tgroup += thead
        trow = nodes.row()
        thead += trow
        trow.extend(
            nodes.entry(h, nodes.paragraph(text=h)) for h in ("Pin", "Function")
        )

        tbody = nodes.tbody()
        tgroup += tbody
        for name, func, important in items:
            trow = nodes.row()
            entry = nodes.entry()
            para = nodes.paragraph()
            para += nodes.literal(text=name)
            entry += para
            trow += entry

            entry = nodes.entry()
            if important:
                para = nodes.paragraph()
                para += nodes.strong(text=func)
            else:
                para = nodes.paragraph(text=func)
            entry += para
            trow += entry
            tbody += trow

        self.add_name(table)
        if title:
            table.insert(0, title)

        return [table] + messages


def setup(app):
    app.add_role("libpr", libpr_role)
    app.add_role("corepr", libpr_role)
    app.add_role("yamlpr", yamlpr_role)
    app.add_role("esphomepr", yamlpr_role)
    app.add_role("docspr", docspr_role)
    app.add_role("ghuser", ghuser_role)
    app.add_role("apiref", apiref_role)
    app.add_role("apiclass", apiclass_role)
    app.add_role("apistruct", apistruct_role)
    app.add_role("ghedit", ghedit_role)
    app.add_directive("imgtable", ImageTableDirective)
    app.add_directive("pintable", PinTableDirective)
    return {"version": "1.0.0", "parallel_read_safe": True, "parallel_write_safe": True}
