# Fendt Caravan BLE Component

The **Fendt Caravan** component allows ESP32 devices to connect to the Bluetooth Low Energy (BLE) interface of **Fendt** and **Hobby** caravans and exposes the same data and controls that are available in the *Fendt Connect* mobile application directly to **Home Assistant** using ESPHome.

This enables fully local control and monitoring of caravan systems such as heating, fridge, lighting, temperature sensors, and power status without relying on the official mobile application or any cloud services.

::: warning
This component is **experimental**. The configuration, exposed entities, and behavior may change in future ESPHome releases.
:::

---

## Supported Platforms

- ESP32 (BLE required)
- Tested with **ESP32-C3**

ESP8266 is **not supported** due to BLE limitations.

---

## Features

- Designed to closely match the behavior and structure of the official Fendt Connect application
- Native BLE integration with the caravan control unit
- Mix of read-only and controllable entities
- Fully local communication (no cloud dependency)
- Native Home Assistant entities via ESPHome

### Supported subsystems

- **Control Unit** (main power, temperatures, AC status)
- **Fridge** (status, mode, source, temperature)
- **Alde heating system** (gas, electric, water heating)
- **Interior lighting** (on/off and dimming channels)

---

## Requirements

The following requirements must be met for reliable operation:

- ESPHome **2024.4.0** or later
- ESP32 device with BLE support
- Caravan with **Fendt / Hobby BLE interface** enabled

---

## Basic Setup

At minimum, BLE tracking and a BLE client must be configured.

```yaml
esp32_ble_tracker:

ble_client:
  - mac_address: DE:00:40:10:62:39
    id: my_ble_client
    auto_connect: true
```

---

## Fendt Caravan Component Configuration

### Component definition

```yaml
fendt_caravan:
  id: my_caravan
  ble_client_id: my_ble_client
```

### Configuration variables

- **id** (**Required**, ID): Internal component ID
- **ble_client_id** (**Required**, ID): Reference to the configured BLE client

---

## Sensor Platform

The sensor platform exposes multiple logical devices under the caravan system.

```yaml
sensor:
  - platform: fendt_caravan
    fendt_caravan_id: my_caravan
```

### Configuration variables

- **fendt_caravan_id** (**Required**, ID): Reference to the `fendt_caravan` component

---

## Control Unit Sensors

```yaml
control_unit:
  main_switch:
    name: "Main Switch"
  temperature_in:
    name: "Inside Temperature"
  temperature_out:
    name: "Outside Temperature"
  power_status:
    name: "AC Power Status"
  light_status:
    name: "Main Light Status"
  software_version:
    name: "Software Version"
  floor_heater:
    name: "Floor Heater"
```

### Available entities

- **main_switch** – Main power state of the caravan
- **temperature_in / temperature_out** – Interior and exterior temperatures
- **power_status** – AC power connection status
- **light_status** – Main lighting state
- **software_version** – Control unit firmware version
- **floor_heater** – Floor heating system state

---

## Fridge Device

```yaml
fridge_device:
  fridge_available:
    name: "Fridge Available"
  fridge_status:
    name: "Fridge Status"
  fridge_mode:
    name: "Fridge Mode"
  fridge_source:
    name: "Fridge Source"
  fridge_type:
    name: "Fridge Type"
  fridge_temperature:
    name: "Fridge Temperature"
```

---

## Alde Heating System

```yaml
alde_device:
  alde_available:
    name: "Alde Available"
  alde_heater_status:
    name: "Heater Status"
  alde_heater_temperature:
    name: "Heater Temperature"
  alde_heater_water:
    name: "Water Heater"
  alde_heater_water_temperature:
    name: "Boost Water Temperature"
  alde_heater_electric:
    name: "Heater Electricity"
  alde_heater_gas:
    name: "Heater Gas Status"
```

---

## Lighting Device

```yaml
lighting_device:
  light_sw0:
    name: "Light 1"
  light_sw1:
    name: "Light 2"
  light_sw2:
    name: "Light 3"
  light_sw3:
    name: "Light 4"
  light_dimsw0:
    name: "Light Dim 1"
  light_dimsw1:
    name: "Light Dim 2"
  light_dimsw2:
    name: "Light Dim 3"
  light_dimsw3:
    name: "Light Dim 4"
  light_dimsw4:
    name: "Light Dim 5"
```

Each lighting channel is exposed as a Home Assistant entity and can be controlled individually.

---

## Example Full Configuration

```yaml
esp32_ble_tracker:

ble_client:
  - mac_address: DE:00:40:10:62:39
    id: my_ble_client

fendt_caravan:
  id: my_caravan
  ble_client_id: my_ble_client

sensor:
  - platform: fendt_caravan
    fendt_caravan_id: my_caravan
    control_unit:
      temperature_in:
        name: "Inside Temperature"
```

---

## Notes

- This component communicates directly with the caravan control unit over BLE and does not require internet access.
- BLE signal quality significantly affects update frequency.
- Only one ESP32 device should connect to the caravan BLE interface at a time.
- Some entities may be read-only depending on caravan configuration.

---

## Troubleshooting

### Device does not connect

- Verify the BLE MAC address
- Ensure the Fendt Connect mobile application is not connected simultaneously
- Check BLE signal strength

---

## See Also

- ESPHome Bluetooth Tracker
- ESPHome BLE Client
- Home Assistant ESPHome Integration