---
description: "Instructions for setting up a sensor that tracks the uptime of the ESP."
title: "Uptime Sensor"
params:
  seo:
    description: Instructions for setting up a sensor that tracks the uptime of the ESP.
    image: timer.svg
---

The `uptime` sensor allows you to track the time the ESP has stayed up for in seconds.
Time rollovers are automatically handled.

```yaml
# Example configuration entry
sensor:
  - platform: uptime
    type: seconds
    name: Uptime Sensor
```

## Configuration variables

- **type** (*Optional*): Either:

  - `seconds` (*default*): A simple counter.
  - `timestamp`  : presents the time ESPHome last booted up. Requires a {{< docref "/components/time" >}}.

- **update_interval** (*Optional*, [Time](#config-time)): The sensor reporting interval. Defaults to `60s`.
  Valid only with `type: seconds`.

- All other options from [Sensor](#config-sensor).

## See Also

- {{< docref "/components/text_sensor/uptime" >}}
- [Sensor Filters](#sensor-filters)
- {{< apiref "API Reference (Seconds)" "uptime/sensor/uptime_seconds_sensor.h" >}}
- {{< apiref "API Reference (Timestamp)" "uptime/sensor/uptime_timestamp_sensor.h" >}}
- {{< apiref "API Reference (Text)" "uptime/text_sensor/uptime_text_sensor.h" >}}
