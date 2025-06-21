---
description: "Instructions for setting up GPIO binary sensors with ESPHome."
title: "GPIO Binary Sensor"
params:
  seo:
    description: Instructions for setting up GPIO binary sensors with ESPHome.
    image: gpio.svg
---


{{< anchor "gpio-binary-sensor" >}}


The GPIO Binary Sensor platform allows you to use any input pin on your
device as a binary sensor.

{{< img src="gpio-ui.png" alt="Image" width="80.0%" class="center" >}}

```yaml
# Example configuration entry
binary_sensor:
  - platform: gpio
    pin: D2
    name: "Living Room Window"
    device_class: window

```
## Configuration variables:

- **pin** (**Required**, [Pin Schema](#config-pin_schema)): The pin to periodically check.
- All other options from [Binary Sensor](#config-binary_sensor).

## Activating internal pullups

If you're hooking up a button without an external pullup or see lots of ON/OFF events
in the log output all the time, this often means the GPIO pin is floating.

For these cases you need to manually enable the pull-up (or pull-down) resistors on the ESP,
you can do so with the [Pin Schema](#config-pin_schema).

```yaml
binary_sensor:
  - platform: gpio
    pin:
      number: D2
      mode:
        input: true
        pullup: true
    name: ...

```
## Inverting Values

Use the `inverted` property of the [Pin Schema](#config-pin_schema) to invert the binary
sensor:

```yaml
# Example configuration entry
binary_sensor:
  - platform: gpio
    pin:
      number: D2
      inverted: true
    name: ...

```
## Debouncing Values

Some binary sensors are a bit unstable and quickly transition between the ON and OFF state while
they're pressed. To fix this and debounce the signal, use the [binary sensor filters](#binary_sensor-filters):

```yaml
# Example configuration entry
binary_sensor:
  - platform: gpio
    pin: D2
    name: ...
    filters:
      - delayed_on: 10ms

```
Above example will only make the signal go high if the button has stayed high for more than 10ms.
Alternatively, below configuration will make the binary sensor publish an ON value immediately, but
will wait 10ms before publishing an OFF value:

```yaml
# Example configuration entry
binary_sensor:
  - platform: gpio
    pin: D2
    name: ...
    filters:
      - delayed_off: 10ms

```
## See Also

- {{< docref "/components/binary_sensor" >}}
- [Pin Schema](#config-pin_schema)
- {{< apiref "gpio/binary_sensor/gpio_binary_sensor.h" "gpio/binary_sensor/gpio_binary_sensor.h" >}}

