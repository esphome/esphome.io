---
title: Status Binary Sensor
description: Instructions for setting up MQTT status binary sensors.
seo:
  description: Instructions for setting up MQTT status binary sensors.
  image: server-network.svg
---

The Status Binary Sensor exposes the node state (if it's connected to via MQTT/native API)
for Home Assistant.

::img{src="status-ui.png" alt="Image" width="80.0%" class="align-center"}

```yaml
# Example configuration entry
binary_sensor:
  - platform: status
    name: "Living Room Status"
```

## Configuration variables

- All options from [Binary Sensor](/components/binary_sensor#config-binary_sensor). (Inverted mode is not supported)

## See Also

- [binary_sensor](/components/binary_sensor)
- [mqtt](/components/mqtt)
- ::apiref{text="status/status_binary_sensor.h" path="status/status_binary_sensor.h"}
