---
description: "Instructions for setting up RMT Simple pulse generator on ESP32"
title: "RMT Simple Pulse Generator"
params:
  seo:
    description: Instructions for setting up RMT Simple auto-start pulse generator on ESP32 variants
    image: pwm.png
---

This library provides a static high-frequency, synchronised, multi-channel pulse sequence generator suitable for driving power-electronics, switched-capacitor, and timing-critical digital applications. The library uses the [RMT (Remote Control) peripheral](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/peripherals/rmt.html) to enable complementary and phase-controlled pulse sequence outputs to GPIO pins.  The hardware peripheral ensures zero cpu overhead.

The overarching aim of the library to provide an intuitive, and user-friendly way of deploying low-level rmt_word_types in pulse sequences. For this reason, the yaml input file uses rmt_word_type nomenclature for pulse sequence input.


## Platform variant support

Advanced synchronisation hardware is enabled by default, but only available on certain chips:

| Variant | Max Transmission Channels | Sync Manager | Alignment |
|---------|--------------|--------------|-----------|
| ESP32    | 4 | No  | Optional |
| ESP32-C3 | 2 | Yes | Required |
| ESP32-C6 | 2 | Yes | Required |
| ESP32-S3 | 4 | Yes | Required |
| ESP32-P4 | 4 | Yes | Required |

## Configuration variables

- **resolution_hz** (*Optional*, int): The default tick resolution is 1 µs, set by resolution_hz: 1000000.
  Note: rmt_symbol_word_t only allocates 15 bits for tick encoding, so the maximum individual symbol length
  is 32,767 ticks (≈32.8 ms at 1 MHz).

- **align_pulse_lengths** (*Optional*, boolean): When enabled, all channel pulse sequences are padded to match
  the longest pattern duration. This necessarily happens for hardware synchronisation.
  Defaults to `true`. This feature can only be disabled for platforms lacking synchronisation hardware (ESP32).

- **pin_0**, **pin_1**, **pin_2**, **pin_3** (*Optional*, [Pin](/guides/configuration-types#pin) or Object):
  GPIO pins and pulse configurations for up to 4 channels. At least one pin must be configured. Each pin
  accepts either a simple GPIO pin number or a full configuration object with pulse sequence.

### Pin channel configuration

- **gpio_number** (**Required**, [Pin](/guides/configuration-types#pin)): The GPIO pin to output pulses on.
  Must be a valid output pin for your ESP32 variant.

### Pulse sequence symbol configuration

Each rmt_word_type symbol in the pulse sequence defines two level transitions:

- **duration0** (**Required**, int): Duration of the first level in RMT ticks. 
- **level0** (**Required**, int): State of the first level. `0` for LOW, `1` for HIGH.
- **duration1** (**Required**, int): Duration of the second level in RMT ticks.
- **level1** (**Required**, int): State of the second level. `0` for LOW, `1` for HIGH.

**Example conversions at different resolutions:**

| Resolution | Tick Duration  | Max duration (32767 ticks) |
|------------|---------------|------------|
| 1 MHz | 1 µs | 32.767 ms |
| 10 MHz | 100 ns | 3.277 ms |
| 80 MHz | 12.5 ns | 409.6 µs |

**Choosing a resolution:**
- **Lower frequency** (1 MHz): Longer maximum duration, less precision. Good for millisecond-range pulses.
- **Higher frequency** (80 MHz): Shorter maximum duration, high precision. Good for sub-microsecond timing.

> [!NOTES] 
> Frequency can be adjusted by zero filling the longest pulse sequence. 

## Understanding RMT symbols

Each pulse consists of a RMT symbol (internally `rmt_symbol_word_t`) which defines **two** consecutive
level transitions. This dual-transition structure allows compact representation of pulse patterns. Each
rmt_word_t symbol which is limited to 32767 ticks maximum.

**Example symbol breakdown:**
```yaml
- duration0: 100   # Stay at level0 for 100 ticks
  level0: 0        # First level is LOW
  duration1: 50    # Stay at level1 for 50 ticks
  level1: 1        # Second level is HIGH
```

Multiple symbols chain together to create complex patterns. The pattern repeats continuously once started.

## Example configuration

For scnchronised pulses, the frequency on each GPIO is determined both by the longest duration pulse sequence, and the number pulses per sequence on each GPIO.  In the example below pin_0 (GPIO26) is frequency limiting for both channels.

```yaml
# Example configuration entry
esp32:
  board: esp32C6
  framework:
    type: esp-idf

rmt_simple:
  id: rmt_test
  resolution_hz: 10000000   # 10 MHz (100 ns per tick)
  pin_0:
    gpio_number: GPIO26     # 400 KHz @ 5µs/sequence and 2 pulses/sequence
    pulse_sequence:
      - duration0: 10       # 1µs high
        level0: 1
        duration1: 20       # 2µs low
        level1: 0
      - duration0: 5        # 0.5µs high
        level0: 1
        duration1: 15       # 1.5µs low (Implied frequency of 400 KHz at 50µs/sequence and 2 pulses/sequence)
        level1: 0
  pin_1:
    gpio_number: GPIO16     # 200 KHz @ 50µs/sequence and 1 pulses/sequence
    pulse_sequence:
      - duration0: 10
        level0: 0
        duration1: 20
        level1: 1
```

## Limitations and constraints

- **No runtime control**: Cannot modify patterns without reflashing
- **No Home Assistant integration**: No actions, triggers, or automations available
- **Limited to 64 symbols per channel for non-hardware synchronised variants (ESP32)**
- **Limited to 48 symbols per channel for hardware synchronised variants**
- **Platform-specific channel limits**: 2 synchronised channels on most variants, 4 on S3/P4

## Use cases

**Well suited for:**
- Charge pumps / voltage doublers
- Synchronous DC-DC converters
- Inverters
- Motor control experiments
- Fixed frequency ultrasonic signal generation
- Software-defined pulse sequencer, similar to what one might otherwise implement
  using a CPLD, GAL, or 555/logic glue

## See Also

- {{< docref "/components/output" >}}
- {{< docref "/components/output/ledc" >}} - ESP32 PWM output (dynamic frequency control)
- {{< docref "/components/remote_transmitter" >}} - IR transmission with RMT peripheral
- {{< apiref "rmt_simple/rmt_simple.h" "rmt_simple/rmt_simple.h" >}}
- [ESP-IDF RMT Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/peripherals/rmt.html)
