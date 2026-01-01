---
description: "Instructions for setting up the Pico CapTouch 2.9 e-Paper Touchscreen with ESPHome"
title: "Pico CapTouch 2.9 e-Paper Touchscreen"
params:
  seo:
    description: Instructions for setting up the Pico CapTouch 2.9 e-Paper Touchscreen with ESPHome
---

The `icnt86` touchscreen controller allows using the touchscreen with ESPHome.
The [I²C](/components/i2c) is required to be set up in your configuration for this touchscreen to work.
The `icnt86` touchscreen controller is used in the Pico CapTouch 2.9\" e Paper Touchscreen.

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

### Sample config for the Pico CapTouch 2.9\" e Paper Touchscreen

```yaml
spi:
  clk_pin: GPIO10
  mosi_pin: GPIO11

i2c:
   - id: bus_a
     sda: GPIO20
     scl: GPIO21
   - id: bus_b
     sda: GPIO6
     scl: GPIO7

touchscreen:
  - platform: icnt86
    i2c_id: bus_b
    interrupt_pin: GPIO17
    reset_pin: GPIO16
    display: epaper

display:
  - platform: waveshare_epaper
    id: epaper
    rotation: 90
    cs_pin: GPIO9
    dc_pin: GPIO8
    busy_pin: GPIO13
    reset_pin: GPIO12
```

## See Also

- {{< docref "index" "Touchscreen" >}}
