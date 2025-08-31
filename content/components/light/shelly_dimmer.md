---
description: "Instructions for setting up a Shelly Dimmer 2."
title: "Shelly Dimmer"
params:
  seo:
    description: Instructions for setting up a Shelly Dimmer 2.
    image: shellydimmer2.jpg
---

The `shelly_dimmer` component adds support for the dimming and power-metering functionality that can be found the [Shelly Dimmer 2](https://shelly.cloud/knowledge-base/devices/shelly-dimmer-2/). The interaction with mains is done via an STM32 microcontroller that is automatically (when configured) flashed with an [open source firmware](https://github.com/jamesturton/shelly-dimmer-stm32).
A detailed analysis of the Shelly Dimmer 2 hardware is given on<https://github.com/arendst/Tasmota/issues/6914>.

Warning!!! At the time of writing there seems to be no way to revert back to the "stock firmware", because there seems to be no way to revert to firmware of the STM32 co-processor.

{{< img src="shellydimmer2.jpg" alt="Image" width="40.0%" class="align-center" >}}

An example of a configuration of this component:

```yaml
logger:
    baud_rate: 0

uart:
    tx_pin: 1
    rx_pin: 3
    baud_rate: 115200
sensor:

light:
    - platform: shelly_dimmer
      name: Shelly Dimmer 2 Light
      id: thislight
      power:
        name: Shelly Dimmer 2 Light Power
      voltage:
        name: Shelly Dimmer 2 Light Voltage
      current:
        name: Shelly Dimmer 2 Light Current
      max_brightness: 500
      firmware:
        version: "51.6"
        update: true
```

## Configuration variables

- **uart_id** (*Optional*, [ID](#config-id)): Manually specify the ID of the UART hub.

{{< note >}}
Currently, only the first hardware UART of the ESP is supported, which has to be configured like this:

```yaml
uart:
    tx_pin: 1
    rx_pin: 3
    baud_rate: 115200
```

{{< /note >}}

- **leading_edge** (*Optional*, boolean): [Dimming mode](https://en.wikipedia.org/wiki/Dimmer#Solid-state_dimmer): `true` means leading edge, `false` is trailing edge. Defaults to `false`.
- **min_brightness** (*Optional*, int): Minimum brightness value on a scale from 0..1000, the default is 0.
- **max_brightness** (*Optional*, int): Maximum brightness value on a scale from 0..1000, the default is 1000.
- **warmup_brightness** (*Optional*, int): Brightness threshold below which the dimmer switches on later in mains current cycle. [This might help with dimming LEDs](https://github.com/jamesturton/shelly-dimmer-stm32/pull/23). The value is from 0..1000 with an default of 0.
- **nrst_pin** (*Optional*, [Pin](#config-pin)): Pin connected with "NRST" of STM32. The default is "GPIO5".
- **boot0_pin** (*Optional*, [Pin](#config-pin)): Pin connected with "BOOT0" of STM32. The default is "GPIO4".
- **current** (*Optional*): Sensor of the current in Amperes. All options from
  [Sensor](#config-sensor).

- **voltage** (*Optional*): Sensor of the voltage in Volts. Only accurate if neutral is connected. All options from [Sensor](#config-sensor).
- **power** (*Optional*): Sensor of the active power in Watts. Only accurate if neutral is connected. All options from [Sensor](#config-sensor).
- **firmware** (*Optional*):

  - **version** (*Optional*): Version string of the [firmware](https://github.com/jamesturton/shelly-dimmer-stm32) that will be expected on the microcontroller. The default is "51.6", another known-good firmware is "51.5".
  - **url** (*Optional*, string): An URL to download the firmware from. Defaults to github for known firmware versions.
  - **sha256** (*Optional*): A hash to compare the downloaded firmware against. Defaults a proper hash of known firmware versions.
  - **update** (*Optional*): Should the firmware of the STM be updated if necessary? The default is false.

{{< note >}}
When flashing Shelly Dimmer with esphome for the first time, automatic flashing the STM firmware is necessary too for the dimmer to work and enabled by the following configuration.:

```yaml
firmware:
  version: "51.6" #<-- set version here
  update: true
```

There is no action required by the user to flash the STM32. There is no way to revert to stock firmware on the STM32 at the time of writing.

{{< /note >}}

- All other options from [Light](#config-light).

## Automatic calibration

Many dimmable light bulbs have non-linear characteristic. This means that changing brightness from 100% to 80% can
have no visible change, but a change from 50% to 40% can decrease visible output by a third. You can partially overcome
this by hand-picking `min_brightness` and `max_brightness` values, but this only helps in aligning 0% and 100%
levels to the actual output. The curve between these values is still likely to be non-linear. Original Shelly firmware
supports automatic calibration that helps make this curve more linear resulting in smoother control across the whole
spectrum.

An attempt was made to replicate this process in Shelly Dimmer component for ESPHome. In order to be able to calibrate
your dimmer, you need to take several steps:

1. Optionally remove `min_brightness` and `max_brightness` from your Shelly `light` section. Calibration process
   will respect these values if they are set, but they are not needed unless you intentionally wish to limit your
   brightness levels.
2. Add `output_id` to your `light` configuration. This id will be used to access calibration functions from lambdas.
3. Add a template button that calls `start_calibration` function to begin calibration process.

```yaml
light:
  - platform: shelly_dimmer
    id: dimmer
    output_id: shelly


button:
  - platform: template
    id: calibrate_button
    name: "Calibrate"
    entity_category: config
    on_press:
      then:
        - lambda: |-
            id(shelly)->start_calibration();
```

4. You can also create another button to clear calibration data and revert your dimmer to its original behavior:

```yaml
button:
  - platform: template
    id: clear_calibration_button
    name: "Clear calibration"
    entity_category: config
    on_press:
      then:
        - lambda: |-
            id(shelly)->clear_calibration();
```

5. Set logger level to `DEBUG` if you want to observe the calibration process in detail.

Upload firmware as usual and press the "Calibrate" button that appears in Home Assistant. The following will happen:

1. Light will be turned on and set to full brightness.
2. Nothing will happen for a warmup period of 20 seconds.
3. Every 3 seconds brightness will decrease by 5%. Power drawn by the light bulb will be measured each second, producing
   a single measurement averaged over 3 steps. Calibration process takes 60 seconds in total.
4. Calibration results will be saved to device memory and brightness level will be brought back to 100%.
5. Calibration is complete! You can change brightness value and observe whether it became more linear.

## See Also

- {{< docref "/components/light" >}}
- {{< apiref "shelly_dimmer/light/shelly_dimmer.h" "shelly_dimmer/light/shelly_dimmer.h" >}}
