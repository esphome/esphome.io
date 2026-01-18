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

sensor:
  - platform: fendt_caravan
    fendt_caravan_id: my_caravan
    control_unit_device:
      id: control_unit
      main_switch:
        name: "Main Switch"
      temperature_in:
        name: "In Temperature"
      temperature_out:
        name: "Out Temperature"
      power_status:
        name: "AC Status"
      light_status:
        name: "Main Light"
      software_version:
        name: "Software Version"
      floor_heater:
        name: "Floot Heater"
```

Configuration variables:

- **id** (**Required**, [ID](/guides/configuration-types#id)): The ID of the Fendt Caravan.
- **ble_client_id** (**Required**): The client ID of the `ble_client`.

Sensor Configuration variables:

The sensor platform exposes multible logical devices under the caravan management system.

- **fendt_caravan_id** (**Required**): Reference to the `fendt_caravan` component.
- **control_unit_device** (**Required**): Main control unit(MACU) of the caravan. The MCU provides some information for the caravan like in/out temperature, power, light main switch, and floor heater status. 
  - **id** (**Required**): The ID of the MCU.
  - **main_switch** (Optional): Main Switch of the MCU. This switch closes all power in the caravan including MCU power. 
  - **temperature_in** (Optional): Inside temperature sensor. 
  - **temperature_out** (Optional): Outside temperature sensor.
  - **power_status** (Optional): AC Power connection status text sensor.
  - **light_status** (Optional): Main light state switch. It closes or opens all lights in the caravan.
  - **software_version** (Optional): The MCU software firmware version.
  - **floor_heater** (Optional): Floor heating system state switch.

## Supported Platforms

- ESP32 (BLE required)
- Tested with **ESP32-C3**

ESP8266 is **not supported** due to BLE limitations.

## See Also

- ESPHome Bluetooth Tracker
- ESPHome BLE Client
- Home Assistant ESPHome Integration
