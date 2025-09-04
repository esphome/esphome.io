---
description: "Instructions for setting up Waveshare CH32V003 digital port expanders in ESPHome."
title: "Waveshare CH32V003 I/O Expander"
params:
  seo:
    description: Instructions for setting up Waveshare CH32V003 digital port expanders in ESPHome.
    image: waveshare_io_ch32v003.svg
---

The Waveshare IO CH32V003 component allows you to use the Waveshare I/O expansion modules based on the CH32V003 microcontroller in ESPHome. It uses [I²C Bus](#i2c) for communication.

The Waveshare IO CH32V003 module provides:
- **8 GPIO pins** (0-7): Can be individually configured as digital inputs or digital outputs
- **1 dedicated PWM output**: Single PWM channel with configurable duty cycle and safety limits
- **1 ADC input**: 10-bit analog-to-digital converter for reading analog values

This module is Waveshare replacement for older CH422 expander and is used in their 2025+ boards.

Once configured, you can use any of the 8 GPIO pins for digital I/O operations. Within ESPHome they emulate real internal GPIO pins and can therefore be used with many of ESPHome's components such as GPIO binary sensors and GPIO switches. The PWM output and ADC input are accessed through their dedicated components.

Any GPIO option accepting a [Pin Schema](#config-pin_schema) can be used with the 8 digital pins.

## Component/Hub


The Waveshare IO CH32V003 is an [I²C Bus](#i2c) slave device. Its default address is `0x24`.

```yaml
waveshare_io_ch32v003:
  - id: wave_hub
    address: 0x24
    i2c_id: bus_a
```

### Configuration variables

- **id** (**Required**, [ID](#config-id)): The id to use for this `waveshare_io_ch32v003` component.
- **address** (*Optional*, int): The I²C address of the expander.
  Defaults to `0x24`.
- **i2c_id** (*Optional*): The I²C Bus ID if you have multiple I²C buses.

## Binary Sensor Example

Waveshare IO CH32V003 pins can be used as binary sensors for reading digital input states.

```yaml
# Example configuration
binary_sensor:
  - platform: gpio
    name: "IO Pin 0 Input"
    id: io_pin_0
    pin:
      waveshare_io_ch32v003: wave_hub
      number: 0
      mode:
        input: true
      inverted: false
```

## Switch Example

Waveshare IO CH32V003 pins can be used as digital output switches.

```yaml
# Example configuration
switch:
  - platform: gpio
    name: "IO Pin 1 Output"
    id: io_pin_1
    pin:
      waveshare_io_ch32v003: wave_hub
      number: 1
      mode:
        output: true
      inverted: false
```

## PWM Output Example

The Waveshare IO CH32V003 has a single dedicated PWM output with hardware safety limits to protect connected circuits.

```yaml
# Example configuration: Dedicated PWM output with safety limits
i2c:
  id: bus_a
  sda: GPIO8
  scl: GPIO9

waveshare_io_ch32v003:
  - id: wave_hub
    address: 0x24
    i2c_id: bus_a

output:
  - platform: waveshare_io_ch32v003
    id: pwm_output
    waveshare_io_ch32v003_id: wave_hub
    safe_pwm_levels:
      min_value: 5%      # Minimum 5% duty cycle
      max_value: 90%     # Maximum 90% duty cycle

light:
  - platform: monochromatic
    name: "PWM Light"
    id: pwm_light
    output: pwm_output
    default_transition_length: 0.5s
```

### PWM Safety Features

The PWM output includes configurable safety limits to protect hardware:

- **safe_pwm_levels**: Configure minimum and maximum duty cycle limits
  - **min_value** (*Optional*, percentage): Minimum PWM duty cycle (0% to 100%). Defaults to `0%`.
  - **max_value** (*Optional*, percentage): Maximum PWM duty cycle (0% to 100%). Defaults to `97%`.

These limits ensure that PWM values are clamped to safe ranges, preventing potential hardware damage from extreme duty cycles.

## Sensor Example

Read the built-in 10-bit ADC value from the Waveshare IO CH32V003's dedicated analog input.

```yaml
# Example configuration
sensor:
  - platform: waveshare_io_ch32v003
    name: "ADC Reading"
    id: adc_sensor
    waveshare_io_ch32v003_id: wave_hub
    unit_of_measurement: "V"
    accuracy_decimals: 3
    update_interval: 1s

```

## Complete Example

```yaml
# Complete configuration example
esphome:
  name: waveshare-io-test
  friendly_name: "Waveshare IO Test"

esp32:
  board: esp32-s3-devkitc-1
  framework:
    type: esp-idf

# Configure I²C bus
i2c:
  id: bus_a
  sda: GPIO8
  scl: GPIO9
  scan: true

# Configure the Waveshare IO expander
waveshare_io_ch32v003:
  - id: wave_hub
    address: 0x24
    i2c_id: bus_a

# Binary sensor on pin 0
binary_sensor:
  - platform: gpio
    name: "Button Input"
    pin:
      waveshare_io_ch32v003: wave_hub
      number: 0
      mode:
        input: true
      inverted: true

# Switch on pin 1
switch:
  - platform: gpio
    name: "Digital Output"
    pin:
      waveshare_io_ch32v003: wave_hub
      number: 1
      mode:
        output: true

# PWM output with safety limits
output:
  - platform: waveshare_io_ch32v003
    id: pwm_out
    waveshare_io_ch32v003_id: wave_hub
    safe_pwm_levels:
      min_value: 10%
      max_value: 85%

# Light using PWM output
light:
  - platform: monochromatic
    name: "PWM Light"
    output: pwm_out

# ADC sensor
sensor:
  - platform: waveshare_io_ch32v003
    name: "ADC Voltage"
    waveshare_io_ch32v003_id: wave_hub
    unit_of_measurement: "V"
    accuracy_decimals: 3
    update_interval: 2s

```

## Pin Configuration

The Waveshare IO CH32V003 provides distinct I/O capabilities:

### GPIO Pins (0-7)
- **8 digital I/O pins** numbered 0-7
- Each pin can be individually configured as:
  - **Digital Input**: Read HIGH/LOW states
  - **Digital Output**: Set HIGH/LOW states

### Dedicated PWM Output
- **Single PWM channel**: One dedicated PWM output (not associated with GPIO pins)
- Configurable duty cycle with safety limits
- Suitable for LED dimming, motor control, etc.

### Dedicated ADC Input
- **Single 10-bit ADC**: One dedicated analog input (not associated with GPIO pins)
- 0-1023 digital values
- Suitable for reading sensors, potentiometers, etc.

### Hardware Limitations

- **GPIO**: 8 independent digital I/O pins (0-7)
- **PWM**: Single dedicated PWM output channel
- **ADC**: Single dedicated analog input channel
- **Current**: Each I/O pin has limited current capability suitable for LEDs and small loads

## Hardware Integration

This component is specifically designed for the Waveshare I/O expansion modules that use the CH32V003 microcontroller. These modules are commonly integrated into Waveshare development boards like the ESP32-S3-Touch-LCD series.

## See Also

- [I²C Bus](#i2c)
- {{< docref "switch/gpio" >}}
- {{< docref "/components/binary_sensor" >}}
- {{< docref "binary_sensor/gpio" >}}
- {{< docref "light/monochromatic" >}}
- {{< docref "/components/output" >}}
- {{< apiref "waveshare_io_ch32v003/waveshare_io_ch32v003.h" "waveshare_io_ch32v003/waveshare_io_ch32v003.h" >}}
