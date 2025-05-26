#!/usr/bin/env python
# reStructuredText (RST) to GitHub-flavored Markdown converter

import sys
from docutils import core, nodes, writers
from urllib import parse


class Translator(nodes.NodeVisitor):
    def __init__(self, base_url, document):
        nodes.NodeVisitor.__init__(self, document)
        self.output = ""
        self.indent = 0
        self.preserve_newlines = False
        self.base_url = base_url

    def write(self, text):
        self.output += text.replace("\n", "\n" + " " * self.indent)

    def visit_document(self, node):
        pass

    def depart_document(self, node):
        pass

    def visit_section(self, node):
        pass

    def depart_section(self, node):
        # Skip all sections except the first one.
        raise nodes.StopTraversal

    def visit_title(self, node):
        pass

    def visit_title_reference(self, node):
        raise Exception(
            f'Markdown conversion: Improper format or not supported feature in "{node.parent.rawsource}". Check "`"'
        )

    def depart_title(self, node):
        pass

    def visit_Text(self, node):
        if not self.preserve_newlines:
            node = node.replace("\n", " ")
        self.write(node)

    def depart_Text(self, node):
        pass

    def visit_bullet_list(self, node):
        self.write("\n")
        pass

    def depart_bullet_list(self, node):
        pass

    def visit_list_item(self, node):
        self.write("* ")
        self.indent += 2

    def depart_list_item(self, node):
        self.indent -= 2
        self.write("\n\n")

    def visit_paragraph(self, node):
        pass

    def depart_paragraph(self, node):
        pass

    def visit_reference(self, node):
        # if not is_github_ref(node):
        self.write("[")

    def depart_reference(self, node):
        # if not is_github_ref(node):
        #    self.write('](' + node['refuri'] + ')')
        refid = node.get("refid")
        if refid:
            self.write("](" + parse.urljoin(self.base_url, "#" + refid) + ")")
        else:
            refuri = node.get("refuri")
            if refuri:
                # if refuri.startswith('../'):
                #    refuri = parse.urljoin(self.base_url, refuri)
                # self.write('](' + refuri + ')')
                self.write("](" + parse.urljoin(self.base_url, refuri) + ")")

    def visit_emphasis(self, node):
        self.write("*")
        pass

    def depart_emphasis(self, node):
        self.write("*")
        pass

    def visit_target(self, node):
        pass

    def depart_target(self, node):
        pass

    def visit_literal(self, node):
        self.write("`")

    def depart_literal(self, node):
        self.write("`")

    def visit_literal_block(self, node):
        self.write("\n\n```")
        if "c++" in node["classes"]:
            self.write("c++")
        self.write("\n")
        self.preserve_newlines = True

    def depart_literal_block(self, node):
        self.write("\n```\n")
        self.preserve_newlines = False

    def visit_inline(self, node):
        pass

    def depart_inline(self, node):
        pass

    def visit_image(self, node):
        self.write("![](" + node["uri"] + ")")

    def depart_image(self, node):
        pass

    def write_row(self, row, widths):
        for i, entry in enumerate(row):
            text = entry[0][0] if len(entry) > 0 else ""
            if i != 0:
                self.write("|")
            self.write("{:{}}".format(text, widths[i]))
        self.write("\n")

    def visit_table(self, node):
        table = node.children[0]
        colspecs = table[:-2]
        thead = table[-2]
        tbody = table[-1]
        widths = [int(cs["colwidth"]) for cs in colspecs]
        sep = "|".join(["-" * w for w in widths]) + "\n"
        self.write("\n\n")
        self.write_row(thead[0], widths)
        self.write(sep)
        for row in tbody:
            self.write_row(row, widths)
        raise nodes.SkipChildren

    def depart_table(self, node):
        pass

    def visit_strong(self, node):
        self.write("**")
        pass

    def depart_strong(self, node):
        self.write("**")
        pass

    def visit_block_quote(self, node):
        pass

    def depart_block_quote(self, node):
        pass

    def visit_raw(self, node):
        pass

    def depart_raw(self, node):
        pass

    def visit_note(self, node):
        self.write("\n > ")
        pass

    def depart_note(self, node):
        pass

    def unknown_visit(self, node):
        text = node.astext()
        if text.startswith(":apistruct:"):
            pass

    def unknown_departure(self, node):
        pass


class MDWriter(writers.Writer):
    """GitHub-flavored markdown writer"""

    supported = ("md",)
    """Formats this writer supports."""

    def translate(self):
        translator = Translator(self.document)
        self.document.walkabout(translator)
        self.output = (translator.output, translator.version)


def convert(rst_path):
    """Converts RST file to Markdown."""
    return core.publish_file(source_path=rst_path, writer=MDWriter())


if __name__ == "__main__":
    convert(sys.argv[1])
