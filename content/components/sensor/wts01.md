---
description: "Instructions for setting up WTS01 temperature sensors in ESPHome."
title: "WTS01 Temperature Sensor"
params:
  seo:
    description: Instructions for setting up WTS01 temperature sensors in ESPHome.
    image: wts01.png
---



The `wts01`   platform allows you to use WTS01 temperature sensors with ESPHome.
This is the sensor used in Sonoff TH Origin (THR316, THR320) and TH Elite (THR316D, THR320D) devices.

For this component to work you need to have set up a UART bus in your configuration - only the RX pin should be necessary.

The sensor communicates with the microcontroller via {{< docref "/components/uart" "UART" >}}.

{{< img src="wts01-full.png" alt="Image" caption="WTS01 Temperature Sensor" width="80.0%" class="align-center" >}}

**Basic configuration**

```yaml
# You need to have a UART bus setup in your configuration
uart:
  rx_pin: GPIO17
  baud_rate: 9600

# Then you can add the WTS01 sensor
sensor:
  - platform: wts01
    name: "WTS01 Temperature"

```
**More advanced configurations**

```yaml
# Throttle updates to the sensor
sensor:
  - platform: wts01
    name: "WTS01 Temperature"
    filters:
      - throttle: 60s

```
```yaml
# Convert the temperature to Fahrenheit
sensor:
  - platform: wts01
    name: "WTS01 Temperature"
    filters:
    # Converts Celsius to Fahrenheit using the formula: F = C * (9/5) + 32 
    - lambda: return x * (9.0/5.0) + 32.0;
    unit_of_measurement: "°F"

```
## Configuration variables:

- **sensor** (*Required*): The sensor configuration.

  - **platform** (*Required*, string): Must be `wts01`  .
  - **name** (*Required*, string): The name of the temperature sensor.
  - All other options from [Sensor](/components/sensor/#base-sensor-configuration).

{{< note >}}
The WTS01 sensor is used in Sonoff TH Origin (THR316, THR320) and TH Elite (THR316D, THR320D) devices and connects to the main device using a RJ9 4C4P connector.
This sensor provides temperature readings with 0.1°C resolution.

{{< /note >}}
## See Also

- [Sensor Filters](/components/sensor/#sensor-filters)
- {{< docref "/components/uart" >}}
- {{< apiref "wts01/wts01.h" "wts01/wts01.h" >}}
