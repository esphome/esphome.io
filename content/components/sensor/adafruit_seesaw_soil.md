---
description: "Instructions for setting up Adafruit STEMMA Soil Sensor - I2C Capacitative Moisture Sensor"
title: "Adafruit STEMMA Soil Sensor"
params:
  seo:
    description: Instructions for setting up Adafruit STEMMA Soil Sensor
    image: adafruit_seesaw_soil.jpg
---

The `adafruit_seesaw_soil` soil sensor allows you to use your [Adafruit STEMMA Soil Sensor](https://learn.adafruit.com/adafruit-stemma-soil-sensor-i2c-capacitive-moisture-sensor) [I²C](/components/i2c)-based sensor with ESPHome.

The sensor uses the [Adafruit seesaw](https://learn.adafruit.com/adafruit-seesaw-atsamd09-breakout/overview) I²C sensor platform.

> [!TIP]
> Humidity is provided in *raw counts* instead of a unit such as relative humidity. It is recommended to use [Sensor Filters](/components/sensor#sensor-filters) to calibrate the sensor for your environment.

{{< img src="adafruit_seesaw_soil.jpg" alt="Image" caption="Adafruit STEMMA Soil Sensor." width="50.0%" class="align-center" >}}

```yaml
# Example configuration entry
sensor:
  - platform: adafruit_seesaw_soil
    temperature:
      name: "Planter Ambient Temperature"
    humidity:
      name: "Soil Moisture"
```

## Configuration variables

- **temperature** (**Required**): The information for the temperature sensor.

  - All options from [Sensor](/components/sensor).

- **humidity** (**Required**): The information for the humidity sensor

  - All options from [Sensor](/components/sensor).

## See Also

- [Sensor Filters](/components/sensor#sensor-filters)
- {{< docref "absolute_humidity/" >}}
- {{< docref "i2c" >}}
- [Adafruit seesaw Overview](https://learn.adafruit.com/adafruit-seesaw-atsamd09-breakout/overview)
- [Adafruit_Seesaw Library](https://github.com/adafruit/Adafruit_Seesaw) by [Adafruit Industries](https://github.com/adafruit)
- [Adafruit Overview](https://learn.adafruit.com/adafruit-stemma-soil-sensor-i2c-capacitive-moisture-sensor)
