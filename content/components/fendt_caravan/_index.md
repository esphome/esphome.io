---
description: "Fendt Caravan component allows ESP32 devices to connect to the Bluetooth Low Energy (BLE) interface of Fendt and Hobby(most probably) caravans."
title: "Fendt Caravan Connect"
params:
  seo:
    description: Fendt Caravan component allows ESP32 devices to connect to the Bluetooth Low Energy (BLE) interface of Fendt and Hobby(most probably) caravans.
    image: /images/example.png
---

The **Fendt Caravan** component allows ESP32 devices to connect to the Bluetooth Low Energy (BLE) interface of **Fendt** and **Hobby** caravans and exposes the same data and controls that are available in the *Fendt Connect* mobile application directly to **Home Assistant** using ESPHome.

This enables fully local control and monitoring of caravan systems such as heating, fridge, lighting, temperature sensors, and power status without relying on the official mobile application or any cloud services.

::: warning
This component is **experimental**. The configuration, exposed entities, and behavior may change in future ESPHome releases.
:::

{{< img src="fendt_caravan_ui.png" alt="Image" >}}

{{< anchor "config-fend-caravan" >}}

## Prerequisites

To use the **Fendt Caravan** component, the `esp32_ble_tracker` and `ble_client` components must be added to the YAML configuration file. For the `ble_client component`, the specified `mac_address` must be the MAC address of the Caravan.
You can obtain the Caravan’s MAC address using the **nRF Connect** application.

- ESP32 device with BLE support
- Caravan with **Fendt / Hobby BLE interface** enabled or power on


## Base Fan Configuration

```yaml
esp32_ble_tracker:
ble_client:
  - mac_address: DE:00:40:10:62:39
    id: my_ble_client
    auto_connect: true
fendt_caravan:
  id: my_caravan
  ble_client_id: my_ble_client
```

Configuration variables:

- **id** (**Required**, [ID](/guides/configuration-types#id)): The ID of the Fendt Caravan.
- **ble_client_id** (**Required**): The client ID of the `ble_client`.


## Supported Platforms

- ESP32 (BLE required)
- Tested with **ESP32-C3**

ESP8266 is **not supported** due to BLE limitations.


## See Also

- ESPHome Bluetooth Tracker
- ESPHome BLE Client
- Home Assistant ESPHome Integration