---
description: "Instructions for setting up the Adafruit Capacitive Soil Sensor"
title: "Adafruit Capacitive Soil Sensor"
params:
  seo:
    description: Instructions for setting up the Adafruit Capacitive Soil Sensor
---

The [Adafruit STEMMA Soil Sensor](https://www.adafruit.com/product/4026) uses a capacitive touch sensor to measure moisture in soil. It also includes a temperature sensor by way of the onboard microcontroller's temperature sensor.

The [I²C](/components/i2c) is required to be set up in your configuration for this sensor to work.

> [!NOTE]
>
> - Capacitance sensor: according to the Adafruit documentation, the sensor returns capacitance values between 200 (very dry) and 2000 (very wet). You should run this sensor for a few days in both dry and wet soil to calibrate the extremes before creating a [Sensor Filter](/components/sensor#sensor-filters) to produce a usable moisture percentage. This should be done for each sensor, do not assume each sensor/soil combination is identical.
>
> - Temperature sensor: This is a low precision sensor, expect values &plusmn;&nbsp;2&nbsp;&deg;C

```yaml
# Example configuration entry
sensor:
  - platform: adafruit_soil_sensor
    temperature:
      name: "Temperature"
    capacitance:
      name: "Raw Soil Moisture"
    update_interval: 60s
```

## Configuration variables

- **temperature** (*Optional*): The information for the temperature sensor.
  - All other options from [Sensor](/components/sensor).

- **capacitance** (*Optional*): The information for the soil moisture sensor.

  - All other options from [Sensor](/components/sensor).

- **address** (*Optional*, int): Manually specify the I²C address of
  the sensor. Defaults to `0x76`. Another address can be `0x77`.

- **update_interval** (*Optional*, [Time](/guides/configuration-types#time)): The interval to check the
  sensor. Defaults to `60s`.

## See Also

- [Sensor Filters](/components/sensor#sensor-filters)
- {{< docref "absolute_humidity/" >}}
- {{< docref "/components/sensor/adafruit_soil_sensor" >}}
- {{< docref "/components/sensor/smt100" >}}
- {{< docref "/components/sensor/pmwcs3" >}}
- {{< docref "/components/sensor/b_parasite" >}}
- {{< docref "/components/sensor/xiaomi_ble" >}}
- {{< apiref "adafruit_soil_sensor/adafruit_soil_sensor.h" "adafruit_soil_sensor/adafruit_soil_sensor.h" >}}
