import os
import json



def setup(app):
    """Setup connects events to the components output builder"""
    app.connect("html-page-context", add_component_details)
    app.connect("build-finished", create_output)
    app.compoents_output = {}

    is_production = os.getenv("NETLIFY") == "true"

    return {
        "version": "1.0.0",
        "parallel_read_safe": True,
        "parallel_write_safe": not is_production,
    }


def add_component_details(app, pagename, templatename, context, doctree):
    """As each page is built, collect page details for the output."""
    if pagename.startswith("components/"):
        page_key = pagename[11:].replace("/", "_")
        component_name = pagename.split("/")[-1]
        page_data = {
            "title": context["title"],
            "url": context["pageurl"],
            "path": f"components/{component_name}",
        }
        if os.path.exists(os.path.join(app.builder.srcdir, "images", component_name + ".png")):
            page_data["image"] = app.builder.config.html_baseurl + "/_images/" + component_name + ".png"
        elif os.path.exists(os.path.join(app.builder.srcdir, "images", component_name + ".jpg")):
            page_data["image"] = app.builder.config.html_baseurl + "/_images/" + component_name + ".jpg"

        app.compoents_output[page_key] = page_data


def create_output(app, exception):
    """Generates the components.json from the collected component pages"""
    with open(os.path.join(app.builder.outdir, "components.json"), "wt") as f:
        f.write(json.dumps(app.compoents_output))
