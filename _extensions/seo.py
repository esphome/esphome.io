import re
from pathlib import Path

from docutils import nodes
from docutils.parsers.rst import Directive, directives
from docutils.writers._html_base import HTMLTranslator


class SEONode(nodes.General, nodes.Element):
    def __init__(
        self,
        title=None,
        description=None,
        image=None,
        author=None,
        author_twitter=None,
        keywords=None,
    ):
        super(SEONode, self).__init__()
        self.title = title
        self.description = description.replace("\n", " ")
        self.image = image
        self.author = author
        self.author_twitter = author_twitter
        self.keywords = keywords


class RedirectNode(nodes.General, nodes.Element):
    def __init__(self, url=None):
        super(RedirectNode, self).__init__()
        self.url = url


def seo_visit(self: HTMLTranslator, node: SEONode):
    def encode_text(text):
        special_characters = {
            ord("&"): "&amp;",
            ord("<"): "&lt;",
            ord('"'): "&quot;",
            ord(">"): "&gt;",
        }
        return text.translate(special_characters)

    def create_content_meta(name, content):
        if content is None:
            return
        self.meta.append(
            '<meta name="{}" content="{}">\n'.format(name, encode_text(content))
        )

    def create_itemprop_meta(name, content):
        if content is None:
            return
        self.meta.append(
            '<meta itemprop="{}" content="{}">\n'.format(name, encode_text(content))
        )

    def create_property_meta(name, content):
        if content is None:
            return
        self.meta.append(
            '<meta property="{}" content="{}">\n'.format(name, encode_text(content))
        )

    # Base
    create_content_meta("description", node.description)
    create_content_meta("keywords", node.keywords)

    # Schema.org
    create_itemprop_meta("name", node.title)
    create_itemprop_meta("description", node.description)
    create_itemprop_meta("image", node.image)

    # Twitter
    create_content_meta("twitter:title", node.title)
    create_content_meta("twitter:image:src", node.image)
    if node.author:
        create_content_meta("twitter:card", "summary_large_image")
    else:
        create_content_meta("twitter:card", "summary")
    create_content_meta("twitter:site", "@OttoWinter_")
    create_content_meta("twitter:creator", node.author_twitter)
    create_content_meta("twitter:description", node.description)

    # Open Graph
    create_property_meta("og:title", node.title)
    create_property_meta("og:image", node.image)
    create_property_meta("og:type", "article" if node.author is not None else "website")
    create_property_meta("og:description", node.description)


def redirect_visit(self: HTMLTranslator, node: RedirectNode):
    self.meta.append('<meta http-equiv="refresh" content="0; url={}">'.format(node.url))

    self.body.append(
        self.starttag(
            node, "p", 'Redirecting to <a href="{0}">{0}</a>'.format(node.url)
        )
    )


def seo_depart(self, _):
    pass


def redirect_depart(self, _):
    self.body.append("</p>")


class SEODirective(Directive):
    option_spec = {
        "title": directives.unchanged,
        "description": directives.unchanged,
        "image": directives.path,
        "author": directives.unchanged,
        "author_twitter": directives.unchanged,
        "keywords": directives.unchanged,
    }

    def run(self):
        env = self.state.document.settings.env
        title_match = re.match(r".+<title>(.+)</title>.+", str(self.state.document))
        if title_match is not None and "title" not in self.options:
            self.options["title"] = title_match.group(1)

        image = self.options.get("image")
        if image is not None:
            local_img = image
            if not image.startswith("/"):
                local_img = f"/images/{image}"
                image = "/_images/" + image
            p = Path(__file__).parent / local_img[1:]
            if not p.is_file():
                raise ValueError(f"File {p} for seo tag does not exist {self.state.document}")
            
            if image.endswith(".svg"):
                image = image[:-len(".svg")] + ".png"
            self.options["image"] = env.config.html_baseurl + image
        return [SEONode(**self.options)]


class RedirectDirective(Directive):
    option_spec = {
        "url": directives.unchanged,
    }

    def run(self):
        return [RedirectNode(**self.options)]


def setup(app):
    app.add_directive("seo", SEODirective)
    app.add_node(SEONode, html=(seo_visit, seo_depart))
    app.add_directive("redirect", RedirectDirective)
    app.add_node(RedirectNode, html=(redirect_visit, redirect_depart))
    return {"version": "1.0.0", "parallel_read_safe": True, "parallel_write_safe": True}
