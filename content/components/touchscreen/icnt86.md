---
description: "Instructions for setting up the Pico CapTouch 2.9 e-Paper Touchscreen with ESPHome"
title: "Pico CapTouch 2.9 e-Paper Touchscreen"
params:
  seo:
    description: Instructions for setting up the Pico CapTouch 2.9 e-Paper Touchscreen with ESPHome
---

The `icnt86` touchscreen platform allows using the touchscreen controller
for the Pico CapTouch 2.9 e-Paper Display with ESPHome.
The [I²C](/components/i2c) is required to be set up in your configuration for this touchscreen to work.

```yaml
# Example configuration entry
touchscreen:
  - platform: icnt86
    interrupt_pin: GPIOXX
```

## Configuration variables

- **id** (*Optional*, [ID](/guides/configuration-types#id)): Manually set the ID of this touchscreen.
- **interrupt_pin** ([Pin Schema](/guides/configuration-types#pin-schema)): The touch detection pin.
- **reset_pin** (*Optional*, [Pin Schema](/guides/configuration-types#pin-schema)): The reset pin.
- All other options from [Base Touchscreen Configuration](/components/touchscreen#config-touchscreen).

## See Also

- {{< docref "index" "Touchscreen" >}}
