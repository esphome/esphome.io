---
description: "Instructions for setting up STTS22H temperature sensor from STMicroelectronics"
title: "STTS22H Temperature Sensor"
params:
  seo:
    description: Instructions for setting up STTS22H temperature sensor from STMicroelectronics with ESPHome
    image: stts22h.jpg
---

The `stts22h` sensor platform allows you to use a STTS22H temperature sensor ([datasheet](https://www.st.com/resource/en/datasheet/stts22h.pdf)) with ESPHome.  
The [I²C bus](#i2c) is required to be set up in your configuration for this sensor to work.

{{< img src="stts22h.png" alt="Image" caption="SparkFun Temperature Sensor & SparkFun Micro Temperature Sensor" class="align-center" >}}

```yaml
# Example configuration entry
sensor:
  - platform: stts22h
    name: "STTS22h Temperature"
    address: 0x3C
    update_interval: 60s
```

## Configuration variables

- **address** (*Optional*, int): The I²C address of the sensor. Defaults to
  `0x3C`.  
  Can be one of the following: `0x38`, `0x3C`, `0x3E`, `0x3F`.

- **update_interval** (*Optional*, [Time](#config-time)): The interval to check
  the sensor. Defaults to `60s`.

- All other options from [Sensor](#config-sensor).

## See Also

- [Sensor Filters](#sensor-filters)
- [STTS22H Product Overview - STMicroelectronics](https://www.st.com/en/mems-and-sensors/stts22h.html)
