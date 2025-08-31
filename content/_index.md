---
description: "Smart Home Made Simple. ESPHome turns ESP32, ESP8266, and RP2040 microcontrollers into fully-featured smart home devices."
title: "ESPHome - Smart Home Made Simple"
params:
  seo:
    description: ESPHome - Smart Home Made Simple. ESPHome turns ESP32, ESP8266, and RP2040 microcontrollers into fully-featured smart home devices.
    image: logo.svg
---

## What is ESPHome?

ESPHome is an open-source firmware framework that simplifies the process of creating custom firmware for popular
WiFi-enabled microcontrollers. With ESPHome, you can:

* **Create custom smart home devices** using simple YAML configuration files
* **Integrate seamlessly with Home Assistant** for a unified smart home experience
* **Control and monitor** your devices through multiple interfaces (web, API, MQTT)
* **Automate your home** with powerful on-device automations
* **Update your devices wirelessly** "Over The Air" (OTA) updates without physical access

ESPHome takes care of the complex parts of firmware development, allowing you to focus on what matters - building your
smart home exactly how you want it.

{{< feature-grid >}}
[
  {
    "icon": "code",
    "title": "No Coding Required",
    "description": "Simple YAML configuration files instead of complex C++ code"
  },
  {
    "icon": "wifi",
    "title": "Wireless Updates",
    "description": "Update your devices over-the-air without physical access"
  },
  {
    "icon": "puzzle-piece",
    "title": "Modular Design",
    "description": "Support for hundreds of sensors, displays, and other components"
  },
  {
    "icon": "shield-alt",
    "title": "Local Control",
    "description": "Devices work locally without cloud dependencies"
  }
]
{{< /feature-grid >}}
{{< anchor "who-uses-esphome" >}}

## Who Uses ESPHome?

{{< feature-grid >}}
[
  {
    "icon": "user-cog",
    "title": "DIY Enthusiasts",
    "description": "Create custom sensors, switches, and displays tailored to specific needs"
  },
  {
    "icon": "home",
    "title": "Smart Home Hobbyists",
    "description": "Extend their home automation systems with affordable custom devices"
  },
  {
    "icon": "briefcase",
    "title": "Professional Integrators",
    "description": "Deploy reliable, locally-controlled smart devices for clients"
  },
  {
    "icon": "industry",
    "title": "Manufacturers",
    "description": "Create [Made for ESPHome](/guides/made_for_esphome) certified products with standardized firmware"
  }
]
{{< /feature-grid >}}

## Which microcontrollers does ESPHome support?

{{< feature-grid >}}
[
  {
    "icon": "microchip",
    "title": "Espressif ESP32 and ESP8266",
    "description": "Wide support for ESP32 and ESP8266 microcontrollers, the heart of many IoT projects."
  },
  {
    "icon": "raspberry-pi",
    "title": "RP2040",
    "description": "Support for Raspberry Pi's RP2040 microcontroller."
  },
  {
    "icon": "bolt",
    "title": "Others",
    "description": "Nordic Semiconductor nRF52, Realtek RTL87xx, and Beken BK72xx chips are supported."
  },
  {
    "icon": "computer",
    "title": "Desktop",
    "description": "Many ESPHome components can be run on a desktop computer using the *host* platform!"
  }
]
{{< /feature-grid >}}
{{< anchor "getting-started" >}}

## Getting Started

Getting started with ESPHome is easy. Choose the method that works best for you:

{{< getting-started-grid >}}
[
  {
    "icon": "home-assistant",
    "title": "From Home Assistant",
    "description": "The easiest way to get started with ESPHome is through the Home Assistant add-on.",
    "steps": [],
    "url": "/guides/getting_started_hassio/",
    "button_text": "Home Assistant Guide"
  },
  {
    "icon": "terminal",
    "title": "Command Line",
    "description": "For advanced users who prefer working with the command line.",
    "steps": [],
    "url": "/guides/getting_started_command_line/",
    "button_text": "Command Line Guide"
  },
  {
    "icon": "puzzle-piece",
    "title": "Ready-Made Projects",
    "description": "Start with a pre-configured project for common use cases.",
    "steps": [],
    "url": "/projects/",
    "button_text": "Browse Projects"
  }
]
{{< /getting-started-grid >}}
