---
description: "Instructions for setting up A01NYUB waterproof ultrasonic distance sensor in ESPHome."
title: "A01NYUB Waterproof Ultrasonic Sensor"
params:
  seo:
    description: Instructions for setting up A01NYUB waterproof ultrasonic distance sensor in ESPHome.
    image: a01nyub.jpg
---

This sensor allows you to use A01NYUB waterproof ultrasonic sensor by DFRobot
([datasheet](https://wiki.dfrobot.com/A01NYUB%20Waterproof%20Ultrasonic%20Sensor%20SKU:%20SEN0313))
with ESPHome to measure distances. This sensor can measure
ranges between 28 centimeters and 750 centimeters with a resolution of 1 milimeter.

Since this sensor reads multiple times per second, [Sensor Filters](#sensor-filters) are highly recommended.

To use the sensor, first set up an [UART Bus](#uart) with a baud rate of 9600 and connect the sensor to the specified pin.

{{< img src="a01nyub-full.jpg" alt="Image" caption="A01NYUB Waterproof Ultrasonic Distance Sensor." width="50.0%" class="align-center" >}}

```yaml
# Example configuration entry
sensor:
  - platform: "a01nyub"
    name: "Distance"
```

## Configuration variables

- **uart_id** (*Optional*, [ID](#config-id)): The ID of the [UART bus](#uart) you wish to use for this sensor.
  Use this if you want to use multiple UART buses at once.

- All other options from [Sensor](#config-sensor).

## See Also

- [Sensor Filters](#sensor-filters)
- [UART Bus](#uart)
- {{< apiref "a01nyub/a01nyub.h" "a01nyub/a01nyub.h" >}}
