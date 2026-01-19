---
description: "Instructions for setting up the STCC4 CO2 sensor with optional SHT45 Temperature and Relative Humidity monitoring"
title: "STCC4 CO2 and optional SHT45 Temperature and RH"
params:
  seo:
    description: Instructions for setting up the STCC4 CO2 sensor with optional SHT45 Temperature and Relative Humidity monitoring
    image: stcc4.jpg
---

The `stcc4` sensor platform allows you to use your Sensirion STCC4
([datasheet](https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://sensirion.com/resource/datasheet/STCC4&ved=2ahUKEwiH8NeqnpiSAxXQ1fACHc4mL9kQFnoECAwQAQ&usg=AOvVaw2lbr1B1SLPjH2PC6wWO_z6)) with ESPHome.
Using a SHT45 on the internal STCC4 bus is supported for automatic temperature and relative humidity compensation and monitoring.
The [I²C Bus](/components/i2c) is required to be set up in your configuration for this sensor to work.



{{< img src="stcc4.jpg" alt="Image" width="80.0%" class="align-center" >}}

```yaml
# Example configuration entry
sensor:
  - platform: stcc4
    continuous: true
    co2:
      id: co2
      name: "STCC4 CO2"
    temperature:
      id: temp
      name: "SHT45 Temperature"
    humidity:
      id: hum
      name: "SHT45 Humidity"
```

## Configuration variables

- **co2** (*Optional*): CO2 in PPM
  - All other options from [Sensor](/components/sensor).

- **temperature** (*Optional*): Temperature in celsius from the internal SHT45, if the SHT45 is not present, this configuration will be ignored
  - All other options from [Sensor](/components/sensor).

- **humidity** (*Optional*): RH from the internal SHT45, if the SHT45 is not present, this configuration will be ignored
  - All other options from [Sensor](/components/sensor).

- **update_interval** (*Optional*, [Time](/guides/configuration-types#time)): The interval to check the sensor. Defaults to `60s`

- **continuous** (*Required*): Boolean value configuring whether or not to operate the sensor in continuous measurement mode.

- **compensation** (*Optional*): The block containing sensors used for compensation. If not set defaults will be used.

  - **ambient_pressure_compensation_source** (*Optional*, [ID](/guides/configuration-types#id)): Give an external pressure sensor ID
    here. This can improve the sensor's internal calculations. Defaults to `101'300 Pa`


## Example With Compensation

```yaml
# Example configuration entry
sensor:
  - platform: stcc4
    continuous: true
    update_interval: 60s
    co2:
      id: co2
      name: "STCC4 CO2"

    temperature:
      id: temp
      name: "SHT45 Temperature"

    humidity:
      id: hum
      name: "SHT45 Humidity"

    compensation:
      ambient_pressure_compensation_source: bmp_hpa
```

## See Also

- [Sensor Filters](/components/sensor#sensor-filters)
- {{< apiref "stcc4/stcc4.h" >}}
