import os
import xml.etree.ElementTree as ET


def setup(app):
    """Setup connects events to the sitemap builder"""
    app.connect("html-page-context", add_html_link)
    app.connect("build-finished", create_sitemap)
    app.sitemap_links = []

    is_production = os.getenv("PRODUCTION") == "YES"

    return {
        "version": "1.0.0",
        "parallel_read_safe": True,
        "parallel_write_safe": not is_production,
    }


def add_html_link(app, pagename, templatename, context, doctree):
    """As each page is built, collect page names for the sitemap"""
    app.sitemap_links.append(pagename + ".html")


def create_sitemap(app, exception):
    """Generates the sitemap.xml from the collected HTML page links"""
    root = ET.Element("urlset")
    root.set("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")
    app.sitemap_links.sort()

    for link in app.sitemap_links:
        url = ET.SubElement(root, "url")
        priority = 0.5
        if link == "index.html":
            priority = 1.0
            link = ""
        elif link.endswith("index.html"):
            priority += 0.25
            link = link[: -len("index.html")]
        if link.endswith(".html"):
            link = link[: -len(".html")]
        ET.SubElement(url, "loc").text = app.builder.config.html_baseurl + "/" + link
        ET.SubElement(url, "priority").text = str(priority)

    filename = os.path.join(app.outdir, "sitemap.xml")
    ET.ElementTree(root).write(
        filename, xml_declaration=True, encoding="utf-8", method="xml"
    )

    with open(os.path.join(app.builder.outdir, "robots.txt"), "wt") as f:
        if os.getenv("PRODUCTION") != "YES":
            f.write("User-agent: *\nDisallow: /\n")
        else:
            f.write(
                "User-agent: *\nDisallow: \n\n"
                "Sitemap: https://esphome.io/sitemap.xml\n"
            )
