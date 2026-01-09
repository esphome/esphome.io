---
description: "Instructions for setting up Mk2PVRouter Telemetry"
title: "Telemetry from Mk2PVRouter diverter."
params:
  seo:
  description: Instructions for setting up Mk2PVRouter Telemetry
  image: mk2pvrouter.jpg
---

## Component/Hub

The `mk2pvrouter` component allows you to retrieve data from a
Mk2PVRouter diverter using Telemetry. It works with any Mk2PVRouter
diverter, as long as this feature has been activated on the router itself.

This component can also be used to send data to a non-Home Assistant system via MQTT.

{{< img src="mk2pvrouter-full.jpg" alt="Mk2PVRouter diverter" caption="Mk2PVRouter diverter." width="50.0%" class="align-center" >}}

---

## Wiring

A simple electronic assembly with an ESP8266 or ESP32 allows you to retrieve detailed telemetry data from the diverter.

Connect the **TX pin** of the Mk2PVRouter diverter to the **RX pin** of your ESP module. No TX connection from ESP to diverter is needed (communication is one-way).

## UART Configuration

The communication uses UART with specific settings: **9600 baud, 7 data bits, even parity, 1 stop bit**.

> [!WARNING]
> **ESP32**: Avoid using GPIO1/GPIO3 (UART0) as these pins are used for USB serial communication and will cause conflicts. Use UART2 pins instead (e.g., GPIO16 for RX, GPIO17 for TX).

> [!NOTE]
> **ESP8266**: You can use the default UART pins (GPIO3 for RX), but you must disable serial logging by setting `baud_rate: 0` in the logger component.

```yaml
# ESP32 example configuration
uart:
  tx_pin: GPIO17
  rx_pin: GPIO16
  baud_rate: 9600
  parity: EVEN
  data_bits: 7
  stop_bits: 1

# For ESP8266, also add:
# logger:
#   baud_rate: 0  # Disable serial logging to free up UART

mk2pvrouter:
  update_interval: 5s
```

## Configuration variables

- **id** (*Optional*, [ID](/guides/configuration-types#id)): Manually specify the ID used for code generation or multiple hubs.
- **uart_id** (*Optional*, [ID](/guides/configuration-types#id)): Manually specify the ID of the UART Component if you want to use multiple UART buses.
- **update_interval** (*Optional*, [Time](/guides/configuration-types#time)): The interval to check the sensor. Defaults to `5s`.

## Available Tags

The tags available depend on your Mk2PVRouter configuration. Common tags include:

| Tag | Description | Unit | Notes |
|-----|-------------|------|-------|
| `P` | Total power at grid | W | Positive = importing, Negative = exporting |
| `P1`, `P2`, `P3` | Power per phase | W | Three-phase systems only |
| `V` | Voltage (single-phase) | cV | Value is in centivolts (divide by 100) |
| `V1`, `V2`, `V3` | Voltage per phase | cV | Three-phase systems only, in centivolts |
| `D` | Diverted power | W | Single-phase systems |
| `D1`, `D2`, `D3` | Diversion rate per load | % | Three-phase systems |
| `E` | Diverted energy | Wh | Single-phase systems |
| `T1`, `T2`, ... | Temperature sensors | °C×10 | Value is temperature × 10 |
| `R1`, `R2`, ... | Relay states | 0/1 | 0 = OFF, 1 = ON |
| `N` | No-diversion counter | - | Count of cycles without diversion |

> [!NOTE]
> Voltage values are sent multiplied by 100 (centivolts). The component automatically converts them to volts.

## Sensors

```yaml
sensor:
  - platform: mk2pvrouter
    tag_name: "P"
    name: "Power at grid"
  - platform: mk2pvrouter
    tag_name: "V1"
    name: "Voltage Phase 1"
  - platform: mk2pvrouter
    tag_name: "D1"
    name: "Diversion rate Load 1"
```

- **tag_name** (**Required**, string): The tag to retrieve from the Telemetry.
- All other options from [Sensor](/components/sensor).

> [!NOTE]
> Sensor defaults (unit, device class, accuracy) are automatically set based on the tag name. You can override them if needed.

## Binary Sensor

Use binary sensors for relay states:

```yaml
binary_sensor:
  - platform: mk2pvrouter
    tag_name: "R1"
    name: "Relay 1"
```

- **tag_name** (**Required**, string): The tag to retrieve from the Telemetry.
- All other options from [Binary Sensor](/components/binary_sensor#config-binary_sensor).

## Text Sensor

Use text sensors if you need the raw string value:

```yaml
text_sensor:
  - platform: mk2pvrouter
    tag_name: "P"
    name: "Power at grid (raw)"
```

- **tag_name** (**Required**, string): The tag to retrieve from the Telemetry.
- All other options from [Text Sensor](/components/text_sensor#config-text_sensor).

## Complete Example

Here's a complete configuration for a three-phase system:

```yaml
esphome:
  name: pvrouter-monitor

esp32:
  board: esp32dev

logger:
  level: DEBUG

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

api:
  encryption:
    key: !secret api_key

ota:
  - platform: esphome

uart:
  tx_pin: GPIO17
  rx_pin: GPIO16
  baud_rate: 9600
  parity: EVEN
  data_bits: 7
  stop_bits: 1

mk2pvrouter:
  update_interval: 5s

sensor:
  - platform: mk2pvrouter
    tag_name: "P"
    name: "Total Power"
  - platform: mk2pvrouter
    tag_name: "P1"
    name: "Power Phase 1"
  - platform: mk2pvrouter
    tag_name: "P2"
    name: "Power Phase 2"
  - platform: mk2pvrouter
    tag_name: "P3"
    name: "Power Phase 3"
  - platform: mk2pvrouter
    tag_name: "V1"
    name: "Voltage Phase 1"
  - platform: mk2pvrouter
    tag_name: "V2"
    name: "Voltage Phase 2"
  - platform: mk2pvrouter
    tag_name: "V3"
    name: "Voltage Phase 3"

binary_sensor:
  - platform: mk2pvrouter
    tag_name: "R1"
    name: "Relay 1 State"
```

## MQTT Integration

> [!WARNING]
> If you enable MQTT forwarding and do *not* use the {{< docref "/components/api" >}} (i.e., the module is exclusively used for forwarding data via MQTT and is *not* connected to any Home Assistant instance), you must remove the `api:` configuration or set `reboot_timeout: 0s`, otherwise the ESP will reboot every 15 minutes.

If you configure MQTT, you need to define the {{< docref "/components/mqtt" >}} component. The component will publish all sensor data to topics following this structure: `<topic_prefix>/<sensor_name>`

```yaml
mqtt:
  broker: 192.168.1.10
  port: 1883
  username: mqtt_user
  password: mqtt_pass
  topic_prefix: "mk2pvrouter"

mk2pvrouter:
```

With this configuration, data will be published to topics such as:

- `mk2pvrouter/V1` for voltage on phase 1
- `mk2pvrouter/P1` for power on phase 1

## See Also

- [Mk2PVRouter documentation](https://fredm67.github.io/Mk2PVRouter/)
- [Mk2PVRouter FW single phase](https://github.com/FredM67/PVRouter-1-phase)
- [Mk2PVRouter FW three phase](https://github.com/FredM67/PVRouter-3-phase)
- {{< apiref "mk2pvrouter/mk2pvrouter.h" "mk2pvrouter/mk2pvrouter.h" >}}
