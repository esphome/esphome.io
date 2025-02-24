from genericpath import exists
import re
import json
import urllib

from typing import MutableMapping
from sphinx.util import logging
from docutils import nodes

# Instructions for building
# you must have checked out this project in the same folder of
# esphome and esphome-vscode so the SCHEMA_PATH below can find the source schemas

# This file is not processed by default as extension unless added.
# To add this extension from command line use:
#   -Dextensions=github,seo,sitemap,components,schema_doc"

# also for improve performance running old version
#   -d_build/.doctrees-schema
# will put caches in another dir and not overwrite the ones without schema

SCHEMA_PATH = "../esphome-vscode/server/src/schema/"
CONFIGURATION_VARIABLES = "Configuration variables:"
CONFIGURATION_OPTIONS = "Configuration options:"
PIN_CONFIGURATION_VARIABLES = "Pin configuration variables:"
COMPONENT_HUB = "Component/Hub"

JSON_DUMP_PRETTY = True


class Statistics:
    props_documented = 0
    enums_good = 0
    enums_bad = 0


statistics = Statistics()

logger = logging.getLogger(__name__)


def setup(app):
    import os

    if not os.path.isfile(SCHEMA_PATH + "esphome.json"):
        logger.info(f"{SCHEMA_PATH} not found. Not documenting schema.")
        return

    app.connect("doctree-resolved", doctree_resolved)
    app.connect("build-finished", build_finished)
    app.files = {}

    return {"version": "1.0.0", "parallel_read_safe": True, "parallel_write_safe": True}


def find_platform_component(app, platform, component):
    file_data = get_component_file(app, component)
    return file_data[f"{component}.{platform}"]["schemas"]["CONFIG_SCHEMA"]


def doctree_resolved(app, doctree, docname):
    if docname == "components/index":
        # nothing useful here
        return
    handle_component(app, doctree, docname)


PLATFORMS_TITLES = {
    "Sensor": "sensor",
    "Binary Sensor": "binary_sensor",
    "Text Sensor": "text_sensor",
    "Output": "output",
    "Cover": "cover",
    "Button": "button",
    "Select": "select",
    "Fan": "fan",
    "Lock": "lock",
    "Number": "number",
    "Climate": "climate",
    "CAN Bus": "canbus",
    "Stepper": "stepper",
    "Switch": "switch",
    "I²C": "i2c",
    "Media Player": "media_player",
    "Microphone": "microphone",
    "Speaker": "speaker",
    "Alarm Control Panel": "alarm_control_panel",
    "Event": "event",
}

CUSTOM_DOCS = {
    "components/globals": {
        "Global Variables": "globals.schemas.CONFIG_SCHEMA",
    },
    "guides/configuration-types": {
        "Pin Schema": [
            "esp32.pin.schema",
            "esp8266.pin.schema",
        ],
    },
    "components/binary_sensor/index": {
        "Binary Sensor Filters": "binary_sensor.registry.filter",
    },
    "components/canbus": {
        "_LoadSchema": False,
        "Base CAN Bus Configuration": "canbus.schemas.CANBUS_SCHEMA",
    },
    "components/climate/climate_ir": {"_LoadSchema": False, "IR Remote Climate": []},
    "components/display/index": {
        "Images": "image.schemas.CONFIG_SCHEMA",
        "Fonts": "font.schemas.CONFIG_SCHEMA",
        "Color": "color.schemas.CONFIG_SCHEMA",
        "Animation": "animation.schemas.CONFIG_SCHEMA",
    },
    "components/light/index": {
        "Base Light Configuration": [
            "light.schemas.ADDRESSABLE_LIGHT_SCHEMA",
            "light.schemas.BINARY_LIGHT_SCHEMA",
            "light.schemas.BRIGHTNESS_ONLY_LIGHT_SCHEMA",
            "light.schemas.LIGHT_SCHEMA",
        ],
        "Light Effects": "light.registry.effects",
    },
    "components/light/fastled": {
        "_LoadSchema": False,
        "Clockless": "fastled_clockless.platform.light.schemas.CONFIG_SCHEMA",
        "SPI": "fastled_spi.platform.light.schemas.CONFIG_SCHEMA",
    },
    "components/binary_sensor/ttp229": {
        "_LoadSchema": False,
    },
    "components/mcp230xx": {
        "_LoadSchema": False,
        PIN_CONFIGURATION_VARIABLES: "mcp23xxx.pin",
    },
    "components/mqtt": {
        "MQTT Component Base Configuration": "core.schemas.MQTT_COMMAND_COMPONENT_SCHEMA",
        "MQTTMessage": "mqtt.schemas.MQTT_MESSAGE_BASE",
    },
    "components/output/index": {
        "Base Output Configuration": "output.schemas.FLOAT_OUTPUT_SCHEMA",
    },
    "components/remote_transmitter": {
        "Remote Transmitter Actions": "remote_base.schemas.BASE_REMOTE_TRANSMITTER_SCHEMA",
    },
    "components/sensor/index": {
        "Sensor Filters": "sensor.registry.filter",
    },
    "components/time": {
        "_LoadSchema": False,
        "Base Time Configuration": "time.schemas.TIME_SCHEMA",
        "on_time Trigger": "time.schemas.TIME_SCHEMA.schema.config_vars.on_time.schema",
        "Home Assistant Time Source": "homeassistant.platform.time.schemas.CONFIG_SCHEMA",
        "SNTP Time Source": "sntp.platform.time.schemas.CONFIG_SCHEMA",
        "GPS Time Source": "gps.platform.time.schemas.CONFIG_SCHEMA",
        "DS1307 Time Source": "ds1307.platform.time.schemas.CONFIG_SCHEMA",
    },
    "components/wifi": {
        "Connecting to Multiple Networks": "wifi.schemas.CONFIG_SCHEMA.schema.config_vars.networks.schema",
        "Enterprise Authentication": "wifi.schemas.EAP_AUTH_SCHEMA",
    },
    "components/esp32": {
        "Arduino framework": "esp32.schemas.CONFIG_SCHEMA.schema.config_vars.framework.types.arduino",
        "ESP-IDF framework": "esp32.schemas.CONFIG_SCHEMA.schema.config_vars.framework.types.esp-idf",
    },
    "components/sensor/airthings_ble": {
        "_LoadSchema": False,
    },
    "components/sensor/radon_eye_ble": {
        "_LoadSchema": False,
    },
    "components/sensor/xiaomi_ble": {
        "_LoadSchema": False,
    },
    "components/sensor/xiaomi_miscale2": {
        "_LoadSchema": False,
    },
    "components/mcp23Sxx": {
        "_LoadSchema": False,
    },
    "components/display/lcd_display": {"_LoadSchema": False},
    "components/display/ssd1306": {"_LoadSchema": False},
    "components/display/ssd1322": {"_LoadSchema": False},
    "components/display/ssd1325": {"_LoadSchema": False},
    "components/display/ssd1327": {"_LoadSchema": False},
    "components/display/ssd1351": {"_LoadSchema": False},
    "components/copy": {"_LoadSchema": False},
    "components/display_menu/index": {
        "Display Menu": "display_menu_base.schemas.DISPLAY_MENU_BASE_SCHEMA",
        "Select": "display_menu_base.schemas.MENU_TYPES.schema.config_vars.items.types.select",
        "Menu": "display_menu_base.schemas.MENU_TYPES.schema.config_vars.items.types.menu",
        "Number": "display_menu_base.schemas.MENU_TYPES.schema.config_vars.items.types.number",
        "Switch": "display_menu_base.schemas.MENU_TYPES.schema.config_vars.items.types.switch",
        "Custom": "display_menu_base.schemas.MENU_TYPES.schema.config_vars.items.types.custom",
    },
    "components/display_menu/lcd_menu": {
        "LCD Menu": "lcd_menu.schemas.CONFIG_SCHEMA",
    },
    "components/alarm_control_panel/index": {
        "Base Alarm Control Panel Configuration": "template.alarm_control_panel.schemas.CONFIG_SCHEMA",
    },
    "components/vbus": {
        "custom VBus sensors": "vbus.platform.sensor.schemas.CONFIG_SCHEMA.types.custom",
        "custom VBus binary sensors": "vbus.platform.binary_sensor.schemas.CONFIG_SCHEMA.types.custom",
    },
    "components/spi": {
        "Generic SPI device component:": "spi_device.schemas.CONFIG_SCHEMA"
    },
    "components/libretiny": {"LibreTiny Platform": "bk72xx.schemas.CONFIG_SCHEMA"},
}

REQUIRED_OPTIONAL_TYPE_REGEX = r"(\(((\*\*Required\*\*)|(\*Optional\*))(,\s(.*))*)\):\s"


def get_node_title(node):
    return list(node.traverse(nodes.title))[0].astext()


def read_file(fileName):
    f = open(SCHEMA_PATH + fileName + ".json", "r", encoding="utf-8-sig")
    str = f.read()
    return json.loads(str)


def is_config_vars_title(title_text):
    return title_text == CONFIGURATION_VARIABLES or title_text == CONFIGURATION_OPTIONS


class SchemaGeneratorVisitor(nodes.NodeVisitor):
    def __init__(self, app, doctree, docname):
        nodes.NodeVisitor.__init__(self, doctree)
        self.app = app
        self.doctree = doctree
        self.docname = docname
        self.path = docname.split("/")
        self.json_component = None
        self.props = None
        self.platform = None
        self.json_platform_component = None
        self.title_id = None
        self.props_section_title = None
        self.find_registry = None
        self.component = None
        self.section_level = 0
        self.file_schema = None
        self.custom_doc = CUSTOM_DOCS.get(docname)
        if self.path[0] == "components":
            if len(self.path) == 2:  # root component, e.g. dfplayer, logger
                self.component = docname[11:]
                if not self.custom_doc or self.custom_doc.get("_LoadSchema", True):
                    self.file_schema = get_component_file(app, self.component)
                    self.json_component = self.file_schema[self.component]["schemas"][
                        "CONFIG_SCHEMA"
                    ]
            elif self.path[1] == "display_menu":  # weird folder naming
                if self.path[2] == "index":
                    # weird component name mismatch
                    self.component = "display_menu_base"
                else:
                    self.component = self.path[2]

                    self.file_schema = get_component_file(app, self.component)
                    self.json_component = self.file_schema[self.component]["schemas"][
                        "CONFIG_SCHEMA"
                    ]

            else:  # sub component, e.g. output/esp8266_pwm
                # components here might have a core / hub, eg. dallas, ads1115
                # and then they can be a binary_sensor, sensor, etc.
                self.platform = self.path[1]
                self.component = self.path[2]

                if self.component == "ssd1331":
                    self.component = "ssd1331_spi"

                if not self.custom_doc or self.custom_doc.get("_LoadSchema", True):
                    if self.component == "index":
                        # these are e.g. sensor, binary sensor etc.
                        self.component = self.platform.replace(" ", "_").lower()
                        self.file_schema = get_component_file(app, self.component)
                        self.json_component = self.file_schema[self.component][
                            "schemas"
                        ].get(self.component.upper() + "_SCHEMA")
                        pass
                    else:
                        self.json_component = get_component_file(app, self.component)
                        self.json_platform_component = find_platform_component(
                            app, self.platform, self.component
                        )

        self.previous_title_text = "No title"

        self.is_component_hub = False

        # used in custom_docs when titles are mapped to array of components, this
        # allows for same configuration text be applied to different json schemas
        self.multi_component = None

        # a stack for props, used when there are nested props to save high level props.
        self.prop_stack = []

        # The prop just filled in, used when there are nested props and need to know which
        # want to dig
        self.current_prop = None

        # self.filled_props used to know when any prop is added to props,
        # we dont invalidate props on exiting bullet lists but just when entering a new title
        self.filled_props = False

        # Found a Configuration variables: heading, this is to increase docs consistency
        self.accept_props = False

        self.bullet_list_level = 0

    def set_component_description(self, description, componentName, platformName=None):
        if platformName is not None:
            platform = get_component_file(self.app, platformName)
            platform[platformName]["components"][componentName.lower()][
                "docs"
            ] = description
        else:
            core = get_component_file(self.app, "esphome")["core"]
            if componentName in core["components"]:
                core["components"][componentName]["docs"] = description
            elif componentName in core["platforms"]:
                core["platforms"][componentName]["docs"] = description
            else:
                if componentName != "display_menu_base":
                    raise ValueError(
                        "Cannot set description for component " + componentName
                    )

    def visit_document(self, node):
        # ESPHome page docs follows strict formatting guidelines which allows
        # for docs to be parsed directly into yaml schema

        if self.docname in ["components/sensor/binary_sensor_map"]:
            # temporarily not supported
            raise nodes.SkipChildren

        if self.docname in ["components/climate/climate_ir"]:
            # not much to do on the visit to the document, component will be found by title
            return

        if len(list(node.traverse(nodes.paragraph))) == 0:
            # this is empty, not much to do
            raise nodes.SkipChildren

        self.props_section_title = get_node_title(node)

        # Document first paragraph is description of this thing
        description = self.getMarkdownParagraph(node)

        if self.json_platform_component:
            self.set_component_description(description, self.component, self.platform)
        elif self.json_component:
            self.set_component_description(description, self.component)

        # for most components / platforms get the props, this allows for a less restrictive
        # first title on the page
        if self.json_component or self.json_platform_component:
            if is_component_file(
                self.app,
                self.component,
            ):
                self.props = self.find_props(
                    self.json_platform_component
                    if self.json_platform_component
                    else self.json_component,
                    True,
                )

    def visit_table(self, node):
        if (
            self.docname == "components/climate/climate_ir"
            and len(CUSTOM_DOCS["components/climate/climate_ir"]["IR Remote Climate"])
            == 0
        ):
            # figure out multi components from table
            table_rows = node[0][4]
            for row in table_rows:
                components_paths = [
                    components + ".platform.climate.schemas.CONFIG_SCHEMA"
                    for components in row[1].astext().split("\n")
                ]
                CUSTOM_DOCS["components/climate/climate_ir"][
                    "IR Remote Climate"
                ] += components_paths

    def depart_document(self, node):
        pass

    def visit_section(self, node):
        self.section_level += 1
        section_title = get_node_title(node)
        if self.custom_doc and section_title in self.custom_doc:
            r = self.custom_doc[section_title]
            if ".registry." in r:
                self.find_registry = r

    def depart_section(self, node):
        self.section_level -= 1
        if self.section_level == 1:
            self.find_registry = None

    def unknown_visit(self, node):
        pass

    def unknown_departure(self, node):
        pass

    def visit_title(self, node):
        title_text = node.astext()
        if self.custom_doc is not None and title_text in self.custom_doc:
            if isinstance(self.custom_doc[title_text], list):
                self.multi_component = self.custom_doc[title_text]
                self.filled_props = False
                self.props = None

                desc = self.getMarkdownParagraph(node.parent)
                for c in self.multi_component:
                    if len(c.split(".")) == 2:
                        self.set_component_description(desc, c.split(".")[0])

                return

            json_component = self.find_component(self.custom_doc[title_text])
            if not json_component:
                return
            if self.json_component is None:
                self.json_component = json_component

            parts = self.custom_doc[title_text].split(".")
            if parts[0] not in ["core", "remote_base"] and parts[-1] != "pin":
                if parts[1] == "platform":
                    self.set_component_description(
                        self.getMarkdownParagraph(node.parent), parts[0], parts[2]
                    )
                else:
                    self.set_component_description(
                        self.getMarkdownParagraph(node.parent),
                        parts[0],
                    )
            self.props_section_title = title_text
            self.props = self.find_props(json_component)

            return

        elif title_text == COMPONENT_HUB:
            # here comes docs for the component, make sure we have props of the component
            # Needed for e.g. ads1115
            self.props_section_title = f"{self.path[-1]} {title_text}"
            json_component = self.get_component_schema(
                self.path[-1] + ".CONFIG_SCHEMA"
            ).get("schema", {})
            if json_component:
                self.props = self.find_props(json_component)

                self.set_component_description(
                    self.getMarkdownParagraph(node.parent), self.path[-1]
                )

            # mark this to retrieve components instead of platforms
            self.is_component_hub = True

        elif is_config_vars_title(title_text):
            if not self.props and self.multi_component is None:
                raise ValueError(
                    f'Found a "{title_text}": title after {self.previous_title_text}. Unknown object.'
                )

        elif title_text == "Over SPI" or title_text == "Over I²C":
            suffix = "_spi" if "SPI" in title_text else "_i2c"

            # these could be platform components, like the display's ssd1306
            # but also there are components which are component/hub
            # and there are non platform components with the SPI/I2C versions,
            # like pn532, those need to be marked with the 'Component/Hub' title
            component = self.path[-1] + suffix

            self.props_section_title = self.path[-1] + " " + title_text

            if self.platform is not None and not self.is_component_hub:
                json_platform_component = find_platform_component(
                    self.app, self.platform, component
                )
                if not json_platform_component:
                    raise ValueError(
                        f"Cannot find platform {self.platform} component '{component}' after found title: '{title_text}'."
                    )
                self.props = self.find_props(json_platform_component)

                # Document first paragraph is description of this thing
                json_platform_component["docs"] = self.getMarkdownParagraph(node.parent)

            else:
                json_component = self.get_component_schema(
                    component + ".CONFIG_SCHEMA"
                ).get("schema", {})
                if not json_component:
                    raise ValueError(
                        f"Cannot find component '{component}' after found title: '{title_text}'."
                    )
                self.props = self.find_props(json_component)

                # Document first paragraph is description of this thing
                self.set_component_description(
                    self.getMarkdownParagraph(node.parent), component
                )

        # Title is description of platform component, those ends with Sensor, Binary Sensor, Cover, etc.
        elif (
            len(
                list(
                    filter(
                        lambda x: title_text.endswith(x), list(PLATFORMS_TITLES.keys())
                    )
                )
            )
            > 0
        ):
            if title_text in PLATFORMS_TITLES:
                # this omits the name of the component, but we know the platform
                platform_name = PLATFORMS_TITLES[title_text]
                if self.path[-1] == "index":
                    component_name = self.path[-2]
                else:
                    component_name = self.path[-1]
                self.props_section_title = component_name + " " + title_text
            else:
                # # title first word is the component name
                # component_name = title_text.split(" ")[0]
                # # and the rest is the platform
                # platform_name = PLATFORMS_TITLES.get(
                #     title_text[len(component_name) + 1 :]
                # )
                # if not platform_name:
                #     # Some general title which does not locate a component directly
                #     return
                # self.props_section_title = title_text

                for t in PLATFORMS_TITLES:
                    if title_text.endswith(t):
                        component_name = title_text[
                            0 : len(title_text) - len(t) - 1
                        ].replace(" ", "_")
                        platform_name = PLATFORMS_TITLES[t]

                if not platform_name:
                    # Some general title which does not locate a component directly
                    return
                self.props_section_title = title_text
                if not is_component_file(self.app, component_name):
                    return

            c = find_platform_component(self.app, platform_name, component_name.lower())
            if c:
                self.json_platform_component = c
                self.set_component_description(
                    self.getMarkdownParagraph(node.parent),
                    component_name,
                    platform_name,
                )

            # Now fill props for the platform element
            try:
                self.props = self.find_props(self.json_platform_component)
            except KeyError:
                raise ValueError("Cannot find platform props")

        elif title_text.endswith("Component") or title_text.endswith("Bus"):
            # if len(path) == 3 and path[2] == 'index':
            #     # skip platforms index, e.g. sensors/index
            #     continue
            split_text = title_text.split(" ")
            self.props_section_title = title_text

            # some components are several components in a single platform doc
            # e.g. ttp229 binary_sensor has two different named components.
            component_name = (
                "_".join(split_text[:-1]).lower().replace(".", "").replace("i²c", "i2c")
            )

            if component_name != self.platform and is_component_file(
                self.app, component_name
            ):
                f = get_component_file(self.app, component_name)

                # Document first paragraph is description of this thing
                description = self.getMarkdownParagraph(node.parent)

                if component_name in f:
                    self.set_component_description(description, component_name)

                    c = f[component_name]
                    if c:
                        self.json_component = c["schemas"]["CONFIG_SCHEMA"]
                        try:
                            self.props = self.find_props(self.json_component)
                            self.multi_component = None
                        except KeyError:
                            raise ValueError(
                                "Cannot find props for component " + component_name
                            )
                        return

                # component which are platforms in doc, used by: stepper and canbus, lcd_pcf8574
                elif f"{component_name}.{self.path[1]}" in f:
                    self.set_component_description(
                        description, component_name, self.path[1]
                    )
                    self.json_platform_component = f[
                        f"{component_name}.{self.path[1]}"
                    ]["schemas"]["CONFIG_SCHEMA"]
                    try:
                        self.props = self.find_props(self.json_platform_component)

                    except KeyError:
                        raise ValueError(
                            f"Cannot find props for platform {self.path[1]} component {self.component_name}"
                        )
                    return

        elif title_text.endswith("Trigger"):
            # Document first paragraph is description of this thing
            description = self.getMarkdownParagraph(node.parent)
            split_text = title_text.split(" ")
            if len(split_text) != 2:
                return
            key = split_text[0]

            if (
                not self.props or not self.props.typed
            ):  # props are right for typed components so far
                c = self.json_component
                if c:
                    if self.component in c:
                        c = c[self.component]["schemas"][
                            self.component.upper() + "_SCHEMA"
                        ]
                    trigger_schema = self.find_props(c).get(key)
                    if trigger_schema is not None:
                        self.props = self.find_props(trigger_schema)
            self.props_section_title = title_text

        elif title_text == PIN_CONFIGURATION_VARIABLES:
            self.component = self.find_component(self.path[-1] + ".pin")
            self.props = self.find_props(self.component)
            self.accept_props = True
            if not self.component:
                raise ValueError(
                    f'Found a "{PIN_CONFIGURATION_VARIABLES}" entry but could not find pin schema'
                )

        elif title_text.endswith("Action") or title_text.endswith("Condition"):
            # Document first paragraph is description of this thing
            description = self.getMarkdownParagraph(node.parent)
            split_text = title_text.split(" ")
            if len(split_text) != 2:
                return
            key = split_text[0]

            component_parts = split_text[0].split(".")
            if len(component_parts) == 3:
                try:
                    cv = get_component_file(self.app, component_parts[1])[
                        component_parts[1] + "." + component_parts[0]
                    ][split_text[1].lower()][component_parts[2]]
                except KeyError:
                    logger.warn(
                        f"In {self.docname} cannot found schema of {title_text}"
                    )
                    cv = None
                if cv is not None:
                    cv["docs"] = description
                    self.props = self.find_props(cv.get("schema", {}))
            elif len(component_parts) == 2:
                registry_name = ".".join(
                    [component_parts[0], "registry", split_text[1].lower()]
                )
                key = component_parts[1]
                self.find_registry_prop(registry_name, key, description)
            else:
                registry_name = f"core.registry.{split_text[1].lower()}"
                # f"automation.{split_text[1].upper()}_REGISTRY"
                self.find_registry_prop(registry_name, key, description)

        if self.section_level == 3 and self.find_registry:
            name = title_text
            if name.endswith(" Effect"):
                name = title_text[: -len(" Effect")]
            if name.endswith(" Light"):
                name = name[: -len(" Light")]
            key = name.replace(" ", "_").replace(".", "").lower()
            description = self.getMarkdownParagraph(node.parent)
            self.find_registry_prop(self.find_registry, key, description)
            self.props_section_title = title_text

    def get_component_schema(self, name):
        parts = name.split(".")
        schema_file = get_component_file(self.app, parts[0])
        if parts[1] == "registry":
            schema = schema_file.get(parts[0], {}).get(parts[2], {})
        elif len(parts) == 3:
            schema = (
                schema_file.get(f"{parts[0]}.{parts[1]}")
                .get("schemas", {})
                .get(parts[2], {})
            )
        else:
            schema = schema_file.get(parts[0], {}).get("schemas", {}).get(parts[1], {})
        return schema

    def get_component_config_var(self, name, key):
        c = self.get_component_schema(name)
        if key in c:
            return c[key]
        if "config_vars" not in c:
            return c
        if key in c["config_vars"]:
            return c["config_vars"][c]

    def find_registry_prop(self, registry_name, key, description):
        c = self.get_component_schema(registry_name)
        if key in c:
            cv = c[key]
            if cv is not None:
                cv["docs"] = description
                self.props = self.find_props(cv.get("schema", {}))

    def depart_title(self, node):
        if self.filled_props:
            self.filled_props = False
            self.props = None
            self.current_prop = None
            self.accept_props = False
            self.multi_component = None
        self.previous_title_text = node.astext()
        self.title_id = node.parent["ids"][0]

    def find_props_previous_title(self):
        comp = self.json_component or self.json_platform_component
        if comp:
            props = self.find_props(comp)

            if self.previous_title_text in props:
                prop = props[self.previous_title_text]
                if prop:
                    self.props = self.find_props(prop)
                else:
                    # return fake dict so better errors are printed
                    self.props = {"__": "none"}

    def visit_Text(self, node):
        if self.multi_component:
            return
        if is_config_vars_title(node.astext()):
            if not self.props:
                self.find_props_previous_title()
            if not self.props:
                raise ValueError(
                    f'Found a "{node.astext()}" entry for unknown object after {self.previous_title_text}'
                )
            self.accept_props = True

        raise nodes.SkipChildren

    def depart_Text(self, node):
        pass

    def visit_paragraph(self, node):
        if is_config_vars_title(node.astext()):
            if not self.props and not self.multi_component:
                self.find_props_previous_title()
            if not self.props and not self.multi_component:
                logger.info(
                    f"In {self.docname} / {self.previous_title_text} found a {node.astext()} title and there are no props."
                )
                # raise ValueError(
                #     f'Found a "{node.astext()}" entry for unknown object after {self.previous_title_text}'
                # )
            self.accept_props = True

        raise nodes.SkipChildren

    def depart_paragraph(self, node):
        pass

    def visit_bullet_list(self, node):
        self.bullet_list_level = self.bullet_list_level + 1
        if (
            self.current_prop
            and (self.props or self.multi_component)
            and self.bullet_list_level > 1
        ):
            self.prop_stack.append((self.current_prop, node))
            self.accept_props = True
            return

        if not self.props and self.multi_component is None:
            raise nodes.SkipChildren

    def depart_bullet_list(self, node):
        self.bullet_list_level = self.bullet_list_level - 1
        if len(self.prop_stack) > 0:
            stack_prop, stack_node = self.prop_stack[-1]
            if stack_node == node:
                self.prop_stack.pop()
                self.filled_props = True
                self.current_prop = stack_prop

    def visit_list_item(self, node):
        if self.accept_props and self.props:
            self.filled_props = True
            self.current_prop, found = self.update_prop(node, self.props)
            if self.current_prop and not found:
                logger.info(
                    f"In '{self.docname} {self.previous_title_text} Cannot find property {self.current_prop}"
                )

        elif self.multi_component:
            # update prop for each component
            found_any = False
            self.current_prop = None
            for c in self.multi_component:
                props = self.find_props(self.find_component(c))
                self.current_prop, found = self.update_prop(node, props)
                if self.current_prop and found:
                    found_any = True
            if self.current_prop and not found_any:
                logger.info(
                    f"In '{self.docname} {self.previous_title_text} Cannot find property {self.current_prop}"
                )
            self.filled_props = True

    def depart_list_item(self, node):
        pass

    def visit_literal(self, node):
        raise nodes.SkipChildren

    def depart_literal(self, node):
        pass

    def getMarkdown(self, node):
        from markdown import Translator

        t = Translator(
            urllib.parse.urljoin(self.app.config.html_baseurl, self.docname + ".html"),
            self.doctree,
        )
        node.walkabout(t)
        return t.output.strip("\n")

    def getMarkdownParagraph(self, node):
        paragraph = list(node.traverse(nodes.paragraph))[0]
        markdown = self.getMarkdown(paragraph)

        param_type = None
        # Check if there is type information for this item
        try:
            name_type = markdown[: markdown.index(": ") + 2]
            ntr = re.search(
                REQUIRED_OPTIONAL_TYPE_REGEX,
                name_type,
                re.IGNORECASE,
            )
            if ntr:
                param_type = ntr.group(6)
                if param_type:
                    markdown = (
                        f"**{param_type}**: {markdown[markdown.index(': ') + 2 :]}"
                    )
        except ValueError:
            # ': ' not found
            pass

        title = list(node.traverse(nodes.title))[0]
        if len(title) > 0:
            url = urllib.parse.urljoin(
                self.app.config.html_baseurl,
                self.docname + ".html#" + title.parent["ids"][0],
            )
            if (
                self.props_section_title is not None
                and self.props_section_title.endswith(title.astext())
            ):
                markdown += f"\n\n*See also: [{self.props_section_title}]({url})*"
            else:
                markdown += f"\n\n*See also: [{self.getMarkdown(title)}]({url})*"

        return markdown

    def update_prop(self, node, props):
        prop_name = None

        for s_prop, n in self.prop_stack:
            inner = props.get(s_prop)
            if inner is not None and "schema" in inner:
                props = self.Props(self, inner["schema"])
            elif inner is not None and inner.get("type") == "typed":
                # this is used in external_components
                props = self.Props(self, inner)
            elif inner is not None and inner.get("type") == "enum":
                enum_raw = self.getMarkdown(node)
                # the regex allow the format to have either a ":" or a " -" as the value / docs separator, value must be in `back ticks`
                # also description is optional
                enum_match = re.search(
                    r"\* `([^`]*)`((:| -) (.*))*", enum_raw, re.IGNORECASE
                )
                if enum_match:
                    enum_value = enum_match.group(1)
                    enum_docs = enum_match.group(4)
                    found = False
                    for name in inner["values"]:
                        if enum_value.upper().replace(" ", "_") == str(name).upper():
                            found = True
                            if enum_docs:
                                enum_docs = enum_docs.strip()
                                if inner["values"][name] is None:
                                    inner["values"][name] = {"docs": enum_docs}
                                else:
                                    inner["values"][name]["docs"] = enum_docs
                                statistics.props_documented += 1
                                statistics.enums_good += 1
                    if not found:
                        logger.info(
                            f"In '{self.docname} {self.previous_title_text} Property {s_prop} cannot find enum value {enum_value}"
                        )
                else:
                    statistics.enums_bad += 1
                    logger.info(
                        f"In '{self.docname} {self.previous_title_text} Property {s_prop} unexpected enum member description format"
                    )

            else:
                # nothing to do?
                return prop_name, False

        raw = node.rawsource  # this has the full raw rst code for this property

        if not raw.startswith("**"):
            # not bolded, most likely not a property definition,
            # usually texts like 'All properties from...' etc
            return prop_name, False

        markdown = self.getMarkdown(node)

        markdown += f"\n\n*See also: [{self.props_section_title}]({urllib.parse.urljoin(self.app.config.html_baseurl, self.docname +'.html#'+self.title_id)})*"

        try:
            name_type = markdown[: markdown.index(": ") + 2]
        except ValueError:
            logger.info(
                f"In '{self.docname} {self.previous_title_text} Property format error. Missing ': ' in {raw}'"
            )
            return prop_name, False

        # Example properties formats are:
        # **prop_name** (**Required**, string): Long Description...
        # **prop_name** (*Optional*, string): Long Description... Defaults to ``value``.
        # **prop_name** (*Optional*): Long Description... Defaults to ``value``.
        # **prop_name** can be a list of names separated by / e.g. **name1/name2** (*Optional*) see climate/pid/ threshold_low/threshold_high

        PROP_NAME_REGEX = r"\*\*(\w*(?:/\w*)*)\*\*"

        FULL_ITEM_PROP_NAME_TYPE_REGEX = (
            r"\* " + PROP_NAME_REGEX + r"\s" + REQUIRED_OPTIONAL_TYPE_REGEX
        )

        ntr = re.search(
            FULL_ITEM_PROP_NAME_TYPE_REGEX,
            name_type,
            re.IGNORECASE,
        )

        if ntr:
            prop_name = ntr.group(1)
            param_type = ntr.group(7)
        else:
            s2 = re.search(
                FULL_ITEM_PROP_NAME_TYPE_REGEX,
                markdown,
                re.IGNORECASE,
            )
            if s2:
                # this is e.g. when a property has a list inside, and the list inside are the options.
                # just validate **prop_name**
                s3 = re.search(r"\* " + PROP_NAME_REGEX + r"*:\s", name_type)
                if s3 is not None:
                    prop_name = s3.group(1)
                else:
                    logger.info(
                        f"In '{self.docname} {self.previous_title_text} Invalid list format: {node.rawsource}"
                    )
                param_type = None
            else:
                logger.info(
                    f"In '{self.docname} {self.previous_title_text} Invalid property format: {node.rawsource}"
                )
                return prop_name, False

        prop_names = str(prop_name)
        for k in prop_names.split("/"):
            config_var = props.get(k)

            if not config_var:
                # Create docs for common properties when descriptions are overridden
                # in the most specific component.

                if k in [
                    "id",
                    "name",
                    "internal",
                    # i2c
                    "address",
                    "i2c_id",
                    # polling component
                    "update_interval",
                    # uart
                    "uart_id",
                    # light
                    "effects",
                    "gamma_correct",
                    "default_transition_length",
                    "flash_transition_length",
                    "color_correct",
                    # display
                    "lambda",
                    "pages",
                    "rotation",
                    # spi
                    "spi_id",
                    "cs_pin",
                    # output (binary/float output)
                    "inverted",
                    "power_supply",
                    # climate
                    "receiver_id",
                ]:
                    config_var = props[k] = {}
                else:
                    if self.path[1] == "esphome" and k in [
                        # deprecated esphome
                        "platform",
                        "board",
                        "arduino_version",
                        "esp8266_restore_from_flash",
                    ]:
                        return prop_name, True
                    return prop_name, False

            desc = markdown[markdown.index(": ") + 2 :].strip()
            if param_type:
                desc = "**" + param_type + "**: " + desc

            config_var["docs"] = desc

        statistics.props_documented += 1

        return prop_name, True

    def find_component(self, component_path):
        path = component_path.split(".")
        file_content = get_component_file(self.app, path[0])

        if path[1] == "platform":
            path[2] = f"{path[0]}.{path[2]}"
            path = path[2:]

        component = file_content
        for p in path:
            component = component.get(p, {})

        return component

    class Props(MutableMapping):
        """Smarter props dict.

        Props are mostly a dict, however some constructs have two issues:
        - An update is intended on an element which does not own a property, but it is based
        on an schema that does have the property, those cases are handled by examining the extended

        """

        def __init__(self, visitor, component, fail_silently=False):
            self.visitor = visitor
            self.component = component
            self.store = self._get_props(component, fail_silently)
            self.parent = None
            self.typed = self.component.get("type") == "typed"

        def _get_props(self, component, fail_silently):
            # component is a 'schema' dict which has 'config_vars' and 'extends'
            if not (
                "config_vars" in component
                or "extends" in component
                or len(component) == 0
                or component.get("type") == "typed"
            ):
                if fail_silently:
                    return None
                raise ValueError("Unexpected component data to get props")

            props = component.get("config_vars")
            return props

        def _find_extended(self, component, key):
            for extended in component.get("extends", []):
                c = self.visitor.get_component_schema(extended)
                if c.get("type") == "typed":
                    p = self.visitor.Props(self.visitor, c)
                    return p[key]
                schema = c.get("schema", {})
                for k, cv in schema.get("config_vars", {}).items():
                    if k == key:
                        return SetObservable(
                            cv,
                            setitem_callback=self._set_extended,
                            inner_key=key,
                            original_dict=schema.get("config_vars"),
                        )
                ex1 = self._find_extended(schema, key)
                if ex1:
                    return ex1

        def _set_extended(self, inner_key, original_dict, key, value):
            original_dict[inner_key][key] = value

        def _iter_extended(self, component):
            for extended in component.get("extends", []):
                schema = self.visitor.get_component_schema(extended).get("schema", {})
                for s in self._iter_extended(schema):
                    yield s
                yield schema

        def __getitem__(self, key):
            if self.store and key in self.store:
                return self.store[key]

            extended = self._find_extended(self.component, key)
            if extended is not None:
                return extended

            if self.component.get("type") == "typed":
                return SetObservable(
                    {key: {"type": "string"}},
                    setitem_callback=self._set_typed,
                    inner_key=key,
                    original_dict={},
                )

        def _set_typed(self, inner_key, original_dict, key, value):
            if inner_key == self.component.get("typed_key", "type"):
                self.component[key] = value
            else:
                for tk, tv in self.component["types"].items():
                    for cv_k, cv_v in tv["config_vars"].items():
                        if cv_k == inner_key:
                            cv_v[key] = value

        def __setitem__(self, key, value):
            self.store[key] = value

        def __delitem__(self, key):
            self.store.pop(key)

        def __iter__(self):
            return iter(self.store)

        def __len__(self):
            len_extended = 0

            if self.component.get("type"):
                types = self.component.get("types")
                for t, tv in types.items():
                    for s in self._iter_extended(types.get(t, {})):
                        len_extended += len(s.get("config_vars", {}))
                    len_extended += len(tv.get("config_vars", {}))
                return len_extended

            for s in self._iter_extended(self.component):
                len_extended += len(s.get("config_vars", {}))
            return len_extended + (len(self.store) if self.store else 0)

    def find_props(self, component, fail_silently=False):
        if component.get("type") in ["trigger", "schema"]:
            # can have schema
            if "schema" not in component:
                return None
            component = component.get("schema")

        props = self.Props(self, component, fail_silently)

        if props:
            self.filled_props = False
            self.accept_props = False
            self.current_prop = None

        return props


def handle_component(app, doctree, docname):
    path = docname.split("/")
    if path[0] == "components":
        pass
    elif docname not in CUSTOM_DOCS:
        return

    try:
        v = SchemaGeneratorVisitor(app, doctree, docname)
        doctree.walkabout(v)
    except Exception as e:
        err_str = f"In {docname}.rst: {str(e)}"
        # if you put a breakpoint here get call-stack in the console by entering
        # import traceback
        # traceback.print_exc()
        logger.warning(err_str)


def build_finished(app, exception):
    # TODO: create report of missing descriptions

    for fname, contents in app.files.items():
        f = open(SCHEMA_PATH + fname + ".json", "w", newline="\n")
        if JSON_DUMP_PRETTY:
            f.write(json.dumps(contents, indent=2))
        else:
            f.write(json.dumps(contents, separators=(",", ":")))

    str = f"Documented: {statistics.props_documented} Enums: {statistics.enums_good}/{statistics.enums_bad}"
    logger.info(str)


class SetObservable(dict):
    """
    a MyDict is like a dict except that when you set an item, before
    doing so it will call a callback function that was passed in when the
    MyDict instance was created
    """

    def __init__(
        self,
        value,
        setitem_callback=None,
        inner_key=None,
        original_dict=None,
        *args,
        **kwargs,
    ):
        super(SetObservable, self).__init__(value, *args, **kwargs)
        self._setitem_callback = setitem_callback
        self.inner_key = inner_key
        self.original_dict = original_dict

    def __setitem__(self, key, value):
        if self._setitem_callback:
            self._setitem_callback(self.inner_key, self.original_dict, key, value)
        super(SetObservable, self).__setitem__(key, value)


def is_component_file(app: SchemaGeneratorVisitor, component):
    if component == "core" or component == "automation":
        component = "esphome"
    return exists(SCHEMA_PATH + component + ".json")


def get_component_file(app: SchemaGeneratorVisitor, component):
    if component == "core" or component == "automation":
        component = "esphome"
    if component not in app.files:
        app.files[component] = read_file(component)
    return app.files[component]
