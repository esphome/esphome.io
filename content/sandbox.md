---
description: "This is just a sandbox for new solutions build for ESPHome's Hugo webserver."
title: "ESPHome - Sandbox testing page"
params:
  seo:
    description: ESPHome - Smart Home Made Simple. This is just a sandbox for new solutions build for ESPHome's Hugo webserver.
    image: logo.svg
---

## test
| Syntax      | Description |
| ----------- | ----------- |
| Header      | Title       |
| Paragraph   | Text        |

{{< cfgtable >}}

- **port** (*Optional*, int): The port to run the API server on. Defaults to `6053`.
- **encryption** (*Optional*): If present, encryption will be enabled for the API. Using encryption helps to secure the
  communication between the device running ESPHome and the connected client(s).

  - **key** (*Optional*, string): A 32-byte base64-encoded string to be used as the encryption key. If not provided,
the key may be set at runtime, but **encryption will not be used until it is set.**

- **actions** (*Optional*, list): A list of user-defined actions. See [User-defined Actions](#api-device-actions).
  - **batch_delay** (*Requw*, [Time](#config-time)): The delay time for batching multiple state update messages
     together to reduce network overhead. Lower values send updates sooner but use more network packets,
     while higher values batch more efficiently but add latency. Must be between `0ms` and `65535ms`
     (65.535 seconds). Defaults to `100ms`.

  - **custom_services** (*Optional*, boolean): Enable compilation of custom API services for external components that use the C++ `CustomAPIDevice` class. Only needed when external components register their own services via the native API. Defaults to `false`.
- **homeassistant_services** (*Optional*, boolean): Enable compilation of Home Assistant service call support for external components that use the C++ `CustomAPIDevice::call_homeassistant_service()` or `CustomAPIDevice::fire_homeassistant_event()` methods. This is automatically enabled when using `homeassistant.service` or `homeassistant.event` actions, or the `homeassistant` platform for number or switch components. Only needs to be manually set when external components call Home Assistant services without using the built-in actions. Defaults to `false`.
- **homeassistant_states** (*Optional*, boolean): Enable compilation of Home Assistant state subscription support for external components that use the C++ `CustomAPIDevice::subscribe_homeassistant_state()` method. This is automatically enabled when using any `homeassistant` platform components (sensor, binary_sensor, text_sensor, switch, or number). Only needs to be manually set when external components subscribe to Home Assistant states without using the built-in components. Defaults to `false`.
- **reboot_timeout** (*Optional*, [Time](#config-time)): The amount of time to wait before rebooting when no
  client connects to the API. This is needed because sometimes the low level ESP functions report that
  the ESP is connected to the network, when in fact it is not - only a full reboot fixes it.
  Can be disabled by setting this to `0s`. Defaults to `15min`.

  - **id** (*Optional*, [ID](#config-id)): Manually specify the ID used for code generation.
- **password** (*Optional*, **Deprecated**, string): The password to protect the API Server with. Defaults
  to no password. It is recommended to use the `encryption` -> `key` above instead of the the `password`.

- **on_client_connected** (*Optional*, [Action](#config-action)): An automation to perform when a client
  connects to the API. See [`on_client_connected` Trigger](#api-on_client_connected_trigger).

- **on_client_disconnected** (*Optional*, [Action](#config-action)): An automation to perform when a client
  disconnects from the API. See [`on_client_disconnected` Trigger](#api-on_client_disconnected_trigger).

{{< /cfgtable >}}
