---
description: "Instructions for setting up Rohm Semiconductors BH1900NUX Temperature Sensor in ESPHome."
title: "BH1900NUX Temperature Sensor"
params:
  seo:
    description: Instructions for setting up Rohm Semiconductors BH1900NUX Temperature Sensor in ESPHome
    image: bh1900nux-evk-001.png
---

{{< anchor "bh1900nux" >}}

The `bh1900nux` sensor platform allows you to use a BH1900NUX
([datasheet](https://fscdn.rohm.com/en/products/databook/datasheet/ic/sensor/temperature/bh1900nux-e.pdf))
temperatur sensor with ESPHome.  
The [I²C bus](#i2c) is required to be set up in
your configuration for this sensor to work.

{{< img src="bh1900nux-evk-001.png" alt="BH1900NUX-EVK-001" class="align-center" >}}

```yaml
# Example configuration entry
sensor:
  - platform: bh1900nux
    name: "BH1900NUX Temperature"
    address: 0x48
    update_interval: 60s
```

# BH1900NUX Temperature Sensor
The `bh1900nux` sensor platform allows you to use a [BH1900NUX](https://fscdn.rohm.com/en/products/databook/datasheet/ic/sensor/temperature/bh1900nux-e.pdf)
temperatur sensor with ESPHome.  
The [I²C bus](#i2c) is required to be set up in
your configuration for this sensor to work.


## Configuration variables
- **address** (*Optional*, int): Manually specify the I²C address of the sensor.
  Defaults to `0x48`. 
- **update_interval** (*Optional*, [Time](#config-time)): The interval to check the
  sensor. Defaults to `60s`.
- All other options from [Sensor](#config-sensor).

> [!NOTE]
> The `ALERT` pin is not supported yet.  
> The `TLOW register` and `THIGH register` for the `Thermostat Mode` are not supported yet.  
> The `Configuration register` is not supported yet.  


### Configurable Addresses
The BH1900NUX has 3 address pins (A0, A1, A2) that can be used to set the I²C address of the sensor.  
The address can be changed by connecting the A0, A1, and A2 pins to VCC or GND. 

In total there are 8 possible addresses:

- 0x48 (A0=0, A1=0, A2=0) 
- 0x49 (A0=0, A1=0, A2=1) 
- 0x4A (A0=0, A1=1, A2=0)
- 0x4B (A0=0, A1=1, A2=1) 
- 0x4C (A0=1, A1=0, A2=0) 
- 0x4D (A0=1, A1=0, A2=1) 
- 0x4E (A0=1, A1=1, A2=0) 
- 0x4F (A0=1, A1=1, A2=1) 

## See Also
- [Sensor Filters](#sensor-filters)
- [Product Page](https://www.rohm.com/products/sensors-mems/temperature-sensor-ics/bh1900nux-product)
- [BH1900NUX Datasheet](https://fscdn.rohm.com/en/products/databook/datasheet/ic/sensor/temperature/bh1900nux-e.pdf)
