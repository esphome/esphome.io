---
description: "Instructions for setting up Mk2PVRouter Telemetry"
title: "Telemetry from Mk2PVRouter diverter."
params:
  seo:
    description: Instructions for setting up Mk2PVRouter Telemetry
    image: mk2pvrouter.jpg
---

## Component/Hub

The `mk2pvrouter`   component allows you to retrieve data from a
Mk2PVRouter diverter using Telemetry. It works with any Mk2PVRouter
diverter, as long as this feature has been activated on the router itself.

This component can also be used to send data to a non-Home Assistant system via MQTT.

{{< img src="mk2pvrouter-full.jpg" alt="Mk2PVRouter diverter" caption="Mk2PVRouter diverter." width="50.0%" class="align-center" >}}

..

A simple electronic assembly with an ESP8266 or ESP32 could
let you retrieve detailed telemetry data from the diverter.

As the communication with the Telemetry is done using UART, you need to
have an [UART bus](#uart) in your configuration with the `rx_pin`
connected to the output of the diverter. Additionally, you need to
set the baud rate to 9600bps.

```yaml
# Example configuration entry
mk2pvrouter:
  update_interval: 5s

```

## Configuration variables:

In `mk2pvrouter`   platform:

- **id** (*Optional*, [ID](#config-id)): Manually specify the ID used for code generation or multiple hubs.
- **uart_id** (*Optional*, [ID](#config-id)): Manually specify the ID of the UART Component if you want to use multiple UART buses.
- **update_interval** (*Optional*, [Time](#config-time)): The interval to check the
  sensor. Defaults to `5s`.

## MQTT Integration

{{< warning >}}
If you enable `mqtt`   forwarding and you do *not* use the {{< docref "/components/api" >}}, ie the module is exclusively used for forwarding data via MQTT and it's *not* connected to any Home Assistant instance, you must
remove the `api:`   configuration or set `reboot_timeout: 0s`, otherwise the ESP will
reboot every 15 minutes because no client connected to the native API.

{{< /warning >}}
If you configure the `mqtt`   option, you will need to define the {{< docref "/components/mqtt" >}} component in your configuration.
This is required for the component to publish data to the MQTT broker.

The component will publish all sensor data to topics following this structure:
`<topic_prefix>/<sensor_name>`

Example:

```yaml
mqtt:
  broker: 192.168.1.10
  port: 1883           # Optional
  username: mqtt_user  # Optional
  password: mqtt_pass  # Optional
  id: mqtt_client      # Optional
  topic_prefix: "mk2pvrouter"

mk2pvrouter:

```

With this configuration, data will be published to topics such as:

- `mk2pvrouter/V1`   for voltage on phase 1
- `mk2pvrouter/P1`   for power on CT1

## Sensors

```yaml
sensor:
  - platform: mk2pvrouter
    tag_name: "P"
    name: "Power at grid"
    unit_of_measurement: "Wh"
    icon: mdi:flash
  - platform: mk2pvrouter
    tag_name: "D"
    name: "Diverted power"
    unit_of_measurement: "Wh"
    icon: mdi:flash
  - platform: mk2pvrouter
    tag_name: "E"
    name: "Diverted energy"
    unit_of_measurement: "Wh"
    icon: mdi:lightning-bolt

```

- **tag_name** (**Required**, string): Specify the tag you want to retrieve from the Telemetry.

{{< note >}}
The available tags are defined in the Mk2PVRouter diverter's program and depend on its configuration.
Please refer to your diverter's documentation or configuration to determine the tags available for your setup.

{{< /note >}}

- All other options from [Sensor](#config-sensor).

## Binary Sensor

```yaml
binary_sensor:
  - platform: mk2pvrouter
    tag_name: "R1"
    name: "Relay 1"

```

- **tag_name** (**Required**, string): Specify the tag you want to retrieve from the Telemetry.
- All other options from [Sensor](#config-sensor).

## Text Sensor

```yaml
text_sensor:
  - platform: teleinfo
    tag_name: "P"
    name: "Power at grid as string"

```

- **tag_name** (**Required**, string): Specify the tag you want to retrieve from the Telemetry.
- All other options from [Text Sensor](#config-text_sensor).

## See Also

- [Mk2PVRouter documentation](https://fredm67.github.io/Mk2PVRouter/)
- [Mk2PVRouter FW single phase](https://github.com/FredM67/PVRouter-1-phase)
- [Mk2PVRouter FW three phase](https://github.com/FredM67/PVRouter-3-phase)
- {{< apiref "mk2pvrouter/mk2pvrouter.h" "mk2pvrouter/mk2pvrouter.h" >}}
