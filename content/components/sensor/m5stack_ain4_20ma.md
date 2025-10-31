---
description: "Instructions for setting up the M5STack AIN4-20mA current analog measurement unit."
title: "M5STack AIN4-20mA current analog measurement unit"
params:
  seo:
    description: Instructions for setting up the M5Stack AIN4-20mA current analog measurement unit.
    image: m5stack_ain4_20ma.jpg
---

{{< anchor "m5stack_ain4_20ma-component" >}}

## Component/Hub

The `m5stack_ain4_20ma` platform allows to use the [AIN4-20mA](https://docs.m5stack.com/en/unit/AIN4-20mA%20Unit) current analog measurement unit sensor 

The AIN4-20mA Unit is a highly capable single-channel 4~20mA current analog measurement unit. Powered by the STM32G030F6 main control chip, it communicates through i2c, ensuring efficient and reliable data transmission.
It can be used as base sensor for all sensors with a 4-20mA output.

{{< img src="m5stack_ain4_20ma.jpg" alt="AIN4-20mA Sensor" caption="The m5stack_ain4_20ma unit." class="align-center" >}}

To use this sensor, first setup the [I²C Bus](#i2c) and connect the sensor to the pins specified there.


```yaml
# Example configuration entry
sensor:
  - platform: m5stack_ain4_20ma
    name: "Current"
    update_interval: 60s
```

### Configuration variables

- **address** (*Optional*, int): The i²c address of the sensor. Defaults to `0x55`
- **update_interval** (*Optional*, [Time](#config-time)): The interval to check the sensor. Defaults to `60s`.

## See Also

- [Sensor Filters](#sensor-filters)
- {{< docref "template/" >}}
- {{< apiref "m5stack_ain4_20ma/m5stack_ain4_20ma.h" "m5stack_ain4_20ma/m5stack_ain4_20ma.h" >}}
