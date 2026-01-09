---
description: "Instructions for setting up the Captive Portal fallback mechanism in ESPHome."
title: "Captive Portal"
params:
  seo:
    description: Instructions for setting up the Captive Portal fallback mechanism in ESPHome.
    image: wifi-strength-alert-outline.svg
---

The captive portal component in ESPHome is a fallback mechanism for when connecting to the
configured {{< docref "wifi" "WiFi" >}} fails.

After 1 minute of unsuccessful WiFi connection attempts, the ESP will start a WiFi hotspot
(with the credentials from your configuration)

{{< img src="captive_portal-ui.png" alt="Image" width="70.0%" class="align-center" >}}

In this web interface, you can manually override the WiFi settings of the device (please note
this will be overwritten by any subsequent serial upload so make sure to also update your YAML configuration).

Additionally, you can upload a new firmware file.

## Web Server Access

When both `captive_portal` and [web_server](/components/web_server/) components are enabled,
you can access the full web server control interface while the captive portal is active. A
"Device Control" link will appear in the captive portal UI, or you can navigate directly to
<http://192.168.4.1/?web_server>. This allows you to control the device's entities (switches,
lights, sensors, etc.) even when the device is in AP fallback mode.

When you connect to the fallback network, the web interface should open automatically (see also
login to network notifications). If that does not work, you can also navigate to <http://192.168.4.1/>
manually in your browser.

```yaml
# Example configuration entry
wifi:
  # ...
  ap:
    ssid: "Livingroom Fallback Hotspot"
    password: !secret wifi_ap_password

captive_portal:
```

## Configuration variables

- **compression** (*Optional*, string): The compression algorithm used for the embedded web assets.
  Options are `br` (Brotli) or `gzip`. Brotli provides ~24% smaller size than gzip.
  Defaults to `br`.

## See Also

- {{< docref "wifi/" >}}
- {{< docref "improv_serial/" >}}
- {{< docref "esp32_improv/" >}}
- {{< apiref "captive_portal/captive_portal.h" "captive_portal/captive_portal.h" >}}
