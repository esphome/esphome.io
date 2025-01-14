
import csv
from itertools import zip_longest

from docutils import nodes, utils
from docutils.parsers.rst import directives
from docutils.parsers.rst.directives.tables import Table

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
    app.add_directive("imgtable", ImageTableDirective)
    app.add_directive("pintable", PinTableDirective)
    return {"version": "1.0.0", "parallel_read_safe": True, "parallel_write_safe": True}
