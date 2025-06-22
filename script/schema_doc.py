import argparse
import json
import os
import re
from pathlib import Path
from pprint import pprint
from inspect import getmembers
from types import FunctionType


DOC_CONFIGURATION_VARIABLES = "Configuration variables:"
DOC_CONFIGURATION_OPTIONS = "Configuration options:"
DOC_OVER_SPI = "Over SPI"
DOC_OVER_I2C = "Over I²C"

JSON_CONFIG_VARS = "config_vars"
JSON_EXTENDS = "extends"
JSON_DOCS = "docs"
JSON_CV_TYPE = "type"
JSON_CV_TYPE_SCHEMA = "schema"
JSON_ACTION = "action"


class Stats:
    core_docs = 0
    core_platform_docs = 0
    platform_docs = 0
    props = 0
    enum_docs = 0
    action_docs = 0
    condition_docs = 0


stats = Stats()


def md_skip_frontmatter(lines):
    if lines[0] == "---":
        index = 1
        while lines[index] != "---":
            index += 1
        return index + 1
    return 0


def md_get_paragraph(lines, index):
    # skip
    while (
        not lines[index].strip()
        or (  # whitespace
            lines[index].strip().startswith("{{")
            and lines[index].strip().endswith("}}")  # anchors
        )
        or (lines[index].startswith("#"))  # titles
    ):
        index += 1
        if index >= len(lines):
            return index, None
    paragraph = ""
    # get lines
    if lines[index].startswith("```"):  # got a code block, return None
        return index, None

    while lines[index].strip():
        paragraph = paragraph + lines[index] + " "
        index += 1
    return index, paragraph.strip()


REGEX_CONFIGURATION_VARIABLES_TITLE = r"^#*\s?Configuration (variables|options):?$"


def md_get_next_title(lines, index):
    while True:
        if index >= len(lines):
            return index, None
        line = lines[index]
        if re.search(REGEX_CONFIGURATION_VARIABLES_TITLE, line, re.IGNORECASE):
            return index + 1, DOC_CONFIGURATION_VARIABLES
        if line.startswith("#"):
            return index + 1, line.replace("#", "").strip()
        index += 1


def md_get_next_config(lines, index):
    # returns a - item from a list
    ret = None
    indent = 0
    in_code_block = False
    while True:
        if index >= len(lines):
            return index, None, indent
        line = lines[index].strip()

        # skip code blocks inside properties (and complain??)
        if line.startswith("```"):
            in_code_block = not in_code_block
        if in_code_block:
            index += 1
            continue

        if line.startswith("#"):
            if ret:
                return index, ret, indent
            return index, None, indent
        if line.startswith("-"):
            if ret:
                return index, ret, indent
            ret = line.strip()[2:]
            indent = lines[index].find("-")
        elif ret and line:
            ret += " " + line
        index += 1


mrkdwn_docs = {}
json_docs = {}
env = {
    "args": None,
}


def mrkdwn_lines(mrkdwn_file_name):
    mrkdwn_doc_lines = mrkdwn_docs.get(mrkdwn_file_name)
    if mrkdwn_doc_lines:
        return mrkdwn_doc_lines

    if os.path.exists(mrkdwn_file_name):
        mrkdwn_f = open(mrkdwn_file_name, "r", encoding="utf-8-sig")
        mrkdwn = mrkdwn_f.read()
        mrkdwn_docs[mrkdwn_file_name] = mrkdwn_doc_lines = mrkdwn.split("\n")
        return mrkdwn_doc_lines
    else:
        print(f"Error: File {mrkdwn_file_name} not found")
    return


def json_exists(name):
    json_file_name = os.path.join(env["args"].schema_dir, name + ".json")
    if os.path.exists(json_file_name):
        return True
    return False


def json_get(name):
    json_doc = json_docs.get(name)
    if json_doc:
        return json_doc

    if name == "core":
        name = "esphome"
    json_file_name = os.path.join(env["args"].schema_dir, name + ".json")
    if os.path.exists(json_file_name):
        f = open(json_file_name, "r", encoding="utf-8-sig")
        str = f.read()
        json_docs[name] = json_doc = json.loads(str)
        return json_doc
    else:
        print(f"Error: File {json_file_name} not found")
    return


def json_save():
    for name, content in json_docs.items():
        json_file_name = os.path.join(env["args"].schema_dir, name + ".json")
        with open(json_file_name, "w", encoding="utf-8") as f:
            f.write(json.dumps(content, indent=2))


def process_component(lines, index, name):
    esphome_json = json_get("esphome")
    core = esphome_json["core"]
    if name not in core["components"]:
        return index, False
    index, docs = md_get_paragraph(lines, index)
    core["components"][name][JSON_DOCS] = docs
    stats.core_docs += 1
    return index, True


def process_platform_component(lines, index, platform, name):
    platform_json = json_get(platform)
    index, docs = md_get_paragraph(lines, index)
    if name in platform_json[platform]["components"]:
        platform_json[platform]["components"][name][JSON_DOCS] = docs
        stats.platform_docs += 1
        return index, True
    else:
        return index, False


def get_platform_from_title(title, config_component=None):
    esphome_json = json_get("esphome")
    title = title.lower()
    if config_component and title.startswith(config_component.lower()):
        title = title[len(config_component) + 1 :]
    name = title.replace(" ", "_")
    if name in esphome_json["core"]["platforms"]:
        return name
    return None


REGEX_PROP = r"^\*\*(\w+)\*\* \((.*?)\): (.*)"
REGEX_ENUM1 = r"^`([^`]*)`(?:(?: -|:) (.*)|\s\((.*)\))?"
REGEX_ENUM2 = r"^\*\*([^\*]*)\*\*(?:(?: -|:) (.*)|\s\((.*)\))?"
REGEX_PROP_TITLE = r"^#+ `([^`]+)`(.*)"


def find_schema_prop(schema, prop_name):
    if JSON_CONFIG_VARS in schema:
        matched_config = schema[JSON_CONFIG_VARS].get(prop_name)
        if matched_config:
            return matched_config
    for extended in schema.get(JSON_EXTENDS, []):
        parts = extended.split(".")
        extended_json = json_get(parts[0])
        if len(parts) == 3:
            extended = (
                extended_json.get(f"{parts[0]}.{parts[1]}", {})
                .get("schemas", {})
                .get(parts[2], {})
            )
        else:
            extended = (
                extended_json.get(parts[0], {}).get("schemas", {}).get(parts[1], {})
            )
        if not extended:
            print(f"Cannot find extended schema: {'.'.join(parts)}")
        if extended.get(JSON_CV_TYPE) == JSON_CV_TYPE_SCHEMA:
            matched_config = find_schema_prop(extended["schema"], prop_name)
            if matched_config:
                return matched_config
    return None


def set_schema_doc(schema, prop_name, doc):
    matched_config = find_schema_prop(schema, prop_name)
    if matched_config:
        matched_config[JSON_DOCS] = doc
        stats.props += 1
    return matched_config


def md_skip_level(lines, index):
    line = lines[index]
    indent = len(line) - len(line.strip())
    while index + 1 < len(lines):
        index += 1
        line = lines[index]
        if indent < len(line) - len(line.strip()):
            return index
    return index + 1


def is_break_title(title):
    if title.startswith("#"):
        name = title.split(" ")[-1].lower()
        if get_platform_from_title(name):
            return True
        if name in ["action", "condition"]:
            return True
    return False


def process_config(md_file, lines, index, config_var, indent=0, parent_schema=None):
    matched_config = None
    while True:
        if index >= len(lines):
            return index
        if is_break_title(lines[index]):
            return index
        item_type = config_var.get(JSON_CV_TYPE)
        if item_type in ["schema", "trigger"] and JSON_CV_TYPE_SCHEMA in config_var:
            schema = config_var[JSON_CV_TYPE_SCHEMA]
            prev_index = index
            index, item_config, item_indent = md_get_next_config(lines, index)
            if index >= len(lines):
                return index

            search = re.search(REGEX_PROP_TITLE, lines[index], re.IGNORECASE)
            if search:
                prop_name = search.group(1)
                matched_config = find_schema_prop(schema, prop_name)
                if matched_config:
                    print(
                        f"{md_file}:{index} {lines[index]} : matched title for prop {prop_name} "
                    )
                    index = process_config(
                        md_file, lines, index + 1, matched_config, 0, schema
                    )
                    continue
                elif parent_schema:
                    matched_config = find_schema_prop(parent_schema, prop_name)
                    if matched_config:
                        return index
                elif lines[index].endswith("Action"):
                    continue  # this is a breaking title, but many triggers are labeled action

            if item_indent < indent:
                return prev_index
            if item_indent > indent:
                if not matched_config:
                    print(
                        f"{md_file}:{index} {lines[index]} an indentation increase for unknown"
                    )
                    next_index = md_skip_level(lines, index)
                    continue
                if matched_config.get(JSON_CV_TYPE, []) not in ["enum", "schema"]:
                    print(
                        f"{md_file}:{index} {lines[index]} : an indentation increase for a {matched_config.get(JSON_CV_TYPE, 'unknown')}"
                    )
                next_index = process_config(
                    md_file, lines, prev_index, matched_config, item_indent, schema
                )
                if next_index == prev_index:
                    # no progress
                    next_index = index  # skip ahead
                index = next_index
                continue
            if not item_config:
                index += 1
                continue
            search = re.search(REGEX_PROP, item_config, re.IGNORECASE)
            if search:
                prop_name = search.group(1)
                matched_config = set_schema_doc(schema, prop_name, search.group(3))

        elif item_type == "typed":
            return md_skip_level(lines, index + 1)
        elif item_type == "enum":
            prev_index = index
            index, item_config, item_indent = md_get_next_config(lines, index)
            if not item_config:
                return index
            if item_indent < indent:
                return prev_index
            search = re.search(REGEX_ENUM1, item_config, re.IGNORECASE)
            if search:
                enum_value = search.group(1)
                enum_desc = search.group(2) or search.group(3)
                values = config_var.get("values", {})
                if enum_value in values:
                    values[enum_value] = values.get(enum_value) or {}
                    values[enum_value][JSON_DOCS] = enum_desc
                    stats.enum_docs += 1
            else:
                search = re.search(REGEX_ENUM2, item_config, re.IGNORECASE)
                if search:
                    enum_value = search.group(1)
                    enum_desc = search.group(2) or search.group(3)
                    values = config_var.get("values", {})
                    if enum_value in values:
                        values[enum_value] = values.get(enum_value) or {}
                        values[enum_value][JSON_DOCS] = enum_desc
                        stats.enum_docs += 1
                else:
                    print("Cannot get enum for this thing")

        elif item_type is None or item_type == "string":
            # consume this level
            prev_index = index
            index, item_config, item_indent = md_get_next_config(lines, index)
            if not item_config or item_indent != indent:
                return prev_index if item_config else index
        else:
            return index
    return index


def oddities_doc_not_specific_component(folder, file):
    # these are docs that the doc name does not directly correspond to a component
    # may be a frontmatter flag could be set for these
    if folder == "binary_sensor":
        return file == "ttp229"
    elif folder == "climate":
        return file == "climate_ir"
    elif folder == "display":
        return file in [
            "lcd_display",
            "ssd1306",
            "ssd1322",
            "ssd1325",
            "ssd1327",
            "ssd1331",
            "ssd1351",
            "st7567",
        ]
    elif folder == "light":
        return file == "fastled"


def oddities_titles(folder, file, title):
    # this replaces some titles which should be named otherwise
    if folder == "light":
        if file == "fastled":
            if title == "Clockless":
                return "fastled_clockless Component"
            elif title == "SPI":
                return "fastled_spi Component"
    elif folder == "components":
        if file == "dfrobot_sen0395":
            if title == "Hub Component":
                return "Component/Hub"
        elif file == "sn74hc595":
            if title == "Over SPI":
                # this is actually a typed schema, something to better figure documenting later
                return ""

    return title


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Add docs to ESPHome json schema")
    parser.add_argument("schema_dir", help="Directory containing JSON files")
    parser.add_argument("--single", help="Process a single json file")
    args = parser.parse_args()

    env["args"] = args
    esphome_json = json_get("esphome")
    core = esphome_json["core"]

    md_files = []
    for root, _, files in os.walk(Path(".") / "content" / "components"):
        for file in files:
            if file.endswith(".md"):
                fullpath = Path(root, file)
                md_files.append(fullpath)

    # md_files = [f for f in md_files if "alarm_control_panel/_index.md" in repr(f)]

    for md_file in md_files:
        lines = mrkdwn_lines(md_file)
        index = md_skip_frontmatter(lines)
        file_name = md_file.stem
        content_folder = md_file.parent.name
        is_platform = False
        is_component = False
        config_component = None
        json_config = None
        # component docs:
        # some components have .md files on folders, e.g. http_request
        # so for the root component (in core) we need to use the one in root, and ignore the one in subfolder,
        # that one will be used in e.g. sensors.json (platform)

        # skip components with typed schema for now
        if file_name in [
            "ads1118",
            "animation",
            "binary_sensor_map",
            "ble_client",
            "combination",
            "dfrobot_sen0395",
            "display_menu_base",
            "esp32",
            "ethernet",
            "i2s_audio",
            "image",
            "micro_wake_word",
            "modbus_controller",
            "msa3xx",
            "qspi_dbi",
            "sn74hc595",
            "speaker",
            "spi",
            "template",
            "uptime",
            "usb_uart",
            "vbus",
        ]:
            continue

        if file_name == "one_wire":  # TODO move one_wire into folder
            content_folder = "one_wire"
            file_name = "_index"

        if file_name.startswith("sensor-filter-"):  # TODO this is kind of garbage
            continue

        if file_name == "_index" and content_folder == "components":
            continue  # nothing here

        if file_name in core["components"]:
            # fill root component docs
            index, is_component = process_component(lines, index, file_name)
            if is_component:
                config_component = file_name
        elif content_folder != "content" and content_folder in core["platforms"]:
            if file_name == "_index":
                # fill core platform docs, from _index files in platforms folders
                index, docs = md_get_paragraph(lines, index)
                core["platforms"][content_folder][JSON_DOCS] = docs
                stats.core_platform_docs += 1
                is_platform = True
                config_component = content_folder
            else:
                # this is a component inside a folder
                if not oddities_doc_not_specific_component(content_folder, file_name):
                    index, is_platform = process_platform_component(
                        lines, index, content_folder, file_name
                    )
                    if is_platform:
                        config_component = file_name

        platform_name = content_folder if content_folder != "components" else None
        title_config_vars = None

        while True:
            index, title = md_get_next_title(lines, index)
            if not title:
                break
            component_name = None

            title = oddities_titles(content_folder, file_name, title)

            if title == "Component/Hub":
                # Some files like pn523, rc522, as3935 are in a platform folder even
                # though they are full components and their platform components are
                # documented with the platform titles
                platform_name = None

            elif title.endswith(" Component"):
                component_name = (
                    title.replace(" Component", "")
                    .replace("`", "")
                    .replace(".", "")
                    .lower()
                )
            elif title.endswith(DOC_OVER_SPI):
                component_name = f"{file_name}_spi"
            elif title.endswith(DOC_OVER_I2C):
                component_name = f"{file_name}_i2c"
            elif (
                file_name != "_index"
                and get_platform_from_title(title, config_component) is not None
            ):
                component_name = file_name
                platform_name = get_platform_from_title(title, config_component)

            if (
                title.endswith(" Action") or title.endswith(" Condition")
            ) and title.startswith("`"):
                config_type = title.split(" ")[-1].lower()  # action / condition
                parts = title.split(" ")[0].replace("`", "").split(".")
                if len(parts) == 1:
                    # action; the component should be actual component
                    if not config_component:
                        print(f"{md_file}:{index} {title} with no config component.")
                        continue
                    if json_config != json_get(config_component):
                        print(f"{md_file}:{index} {title} set needed for this.")
                    json_config = json_get(config_component)
                    if not json_config:
                        print(
                            f"{md_file}:{index} Found title {title} in {config_component} cannot find config"
                        )
                    else:
                        title_config_vars = (
                            json_config.get(config_component, {})
                            .get(config_type, {})
                            .get(parts[0])
                        )
                elif len(parts) == 2:
                    # component.action
                    title_config_vars = (
                        (json_get(parts[0]) or {})
                        .get(parts[0], {})
                        .get(config_type, {})
                        .get(parts[1])
                    )
                elif len(parts) == 3:
                    # platform.component.action
                    if parts[1] not in core["components"]:
                        print(
                            f"{md_file}:{index} Found {config_type} {title} with invalid name format"
                        )
                    title_config_vars = (
                        (json_get(parts[1]) or {})
                        .get(f"{parts[1]}.{parts[0]}", {})
                        .get(config_type, {})
                        .get(parts[2])
                    )

                else:
                    print(f"{md_file}:{index} Found title {title} too many parts")

                if title_config_vars:
                    index, docs = md_get_paragraph(lines, index)
                    title_config_vars[JSON_DOCS] = docs
                    if config_type == "action":
                        stats.action_docs += 1
                    elif config_type == "condition":
                        stats.condition_docs += 1
                else:
                    print(
                        f"{md_file}:{index} Found title {title} in {config_component} config not found"
                    )

            if component_name:
                is_platform = platform_name in core["platforms"]
                is_component = False
                if is_platform:
                    index, is_platform = process_platform_component(
                        lines, index, platform_name, component_name
                    )

                if not is_platform and component_name in core["components"]:
                    index, is_component = process_component(
                        lines, index, component_name
                    )

                if not is_platform and not is_component:
                    print(f"{platform_name}/{file_name} {title} not processed.")
                else:
                    config_component = component_name

            if title == DOC_CONFIGURATION_VARIABLES:
                if not config_component:
                    print(
                        f"{md_file}:{index} TODO {platform_name}/{file_name} {title} not processed."
                    )
                    continue

                if title_config_vars:
                    schema = title_config_vars
                else:
                    json_config = json_get(config_component)
                    if not json_config:
                        print(f"{md_file}:{index} {config_component} no json_config")
                        schema = None
                    elif is_component:
                        schema = json_config[config_component]["schemas"][
                            "CONFIG_SCHEMA"
                        ]
                    elif is_platform and config_component:
                        if config_component == platform_name:
                            schema = json_config[config_component]["schemas"].get(
                                f"{platform_name.upper()}_SCHEMA"
                            )
                        else:
                            schema = json_config[f"{config_component}.{platform_name}"][
                                "schemas"
                            ].get("CONFIG_SCHEMA")
                    else:
                        schema = None
                if schema:
                    try:
                        index = process_config(md_file, lines, index + 1, schema)
                    except Exception as err:
                        print(f"{md_file}:{index} {title} failed {repr(err)}")
                        # if you put a breakpoint here get call-stack in the console by entering
                        # import traceback
                        # traceback.print_exc()
                        break

    json_save()

    def attributes(obj):
        disallowed_names = {
            name
            for name, value in getmembers(type(obj))
            if isinstance(value, FunctionType)
        }
        return {
            name: getattr(obj, name)
            for name in dir(obj)
            if name[0] != "_" and name not in disallowed_names and hasattr(obj, name)
        }

    def print_attributes(obj):
        pprint(attributes(obj))

    print_attributes(stats)
