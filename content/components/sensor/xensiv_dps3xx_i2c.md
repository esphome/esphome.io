---
title: "Infineon XENSIV™ DPS3xx Pressure Sensor"
description: "Instructions for setting up Infineon XENSIV™ DPS3xx temperature and pressure sensors with ESPHome"
params:
  seo:
    description: Instructions for setting up Infineon XENSIV™ DPS3xx temperature and pressure sensors with ESPHome
    image: dps3xx.png
---

The `xensiv_dps3xx_i2c` sensor platform allows you to use Infineon's XENSIV™ DPS3xx series of high-precision
barometric pressure sensors with ESPHome. This platform supports the DPS310, DPS368, and compatible variants,
providing accurate temperature and pressure measurements. The [I²C Bus](/components/i2c) is required to be set up
in your configuration for this sensor to work.

These sensors are known for their high accuracy, low power consumption, and small form factor, making them ideal
for weather stations, altitude measurement, and indoor navigation applications.

```yaml
# Example configuration entry
sensor:
  - platform: xensiv_dps3xx_i2c
    temperature:
      name: "Temperature"
    pressure:
      name: "Pressure"
```

## Configuration Variables

- **temperature** (**Required**): The temperature sensor configuration.

  - All other options from [Sensor](/components/sensor).

- **pressure** (**Required**): The pressure sensor configuration.

  - All other options from [Sensor](/components/sensor).

- **address** (*Optional*, int): The I²C address of the sensor. Defaults to `0x77`. The DPS3xx sensors
  typically use `0x77` or `0x76` depending on the hardware configuration.

- **operation_mode** (*Optional*, string): Sensor operation mode. One of `single_shot`, `continuous`.
  Defaults to `continuous`.

- **update_interval** (*Optional*, [Time](/guides/configuration-types#time)): The interval to check the sensor.
  Defaults to `60s`.

- **id** (*Optional*, [ID](/guides/configuration-types#id)): Manually specify the ID used for code generation.

## Operation Modes

The sensor supports two operation modes:

- `continuous`: The sensor continuously measures temperature and pressure at the interval specified by
  `update_interval`. This is the default and recommended mode for most applications.
- `single_shot`: The sensor enters a low-power state between measurements. Useful for battery-powered applications.

## Hardware Variants

The XENSIV™ DPS3xx family includes several variants with the same I²C interface:

- **DPS310**: High-precision barometric pressure sensor with ±0.002 hPa (or ±0.02 m) precision
- **DPS368**: Similar to DPS310 with enhanced temperature compensation

## Advanced Example

```yaml
# Advanced configuration with all options
i2c:
  sda: GPIOXX
  scl: GPIOXX

sensor:
  - platform: xensiv_dps3xx_i2c
    id: dps3xx_sensor
    address: 0x77
    operation_mode: continuous
    update_interval: 60s
    temperature:
      name: "Room Temperature"
      filters:
        - sliding_window_moving_average:
            window_size: 5
            send_every: 1
    pressure:
      name: "Room Pressure"
      filters:
        - sliding_window_moving_average:
            window_size: 5
            send_every: 1
```

## See Also

- [Sensor Filters](/components/sensor#sensor-filters)
- [I²C Bus Component](/components/i2c)
- [DPS310 Component](/components/sensor/dps310) (alternative implementation)
- [Template Sensor](/components/sensor/template)
- {{< apiref "xensiv_dps3xx_i2c/xensiv_dps3xx_i2c.h" "xensiv_dps3xx_i2c.h" >}}
