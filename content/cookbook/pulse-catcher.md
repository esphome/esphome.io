---
description: "Example to use the pulse meter sensor as a pulse catcher."
title: "Pulse Catcher"
params:
  seo:
    description: Example to use the pulse meter sensor as a pulse catcher.
    image: pulses.png
---

The {{< docref "/components/sensor/pulse_meter" >}} can be used as a very fast pulse catcher. This can be useful
if you would like to detect an incoming pulse on a GPIO pin shorter than the typical `16ms` loop interval.

```yaml
sensor:
  - platform: pulse_meter
    pin: GPIOXX
#    internal_filter: 1ms # If a pulse shorter than this time is detected, it is discarded. Defaults to 13us.
    id: trigger
    filters:
      - lambda: return {}; # Don't return any pulses/s to not spam the logs
    total:
      id: pulses
      on_value:
        then:
          # Do something cool when a pulse is detected, like flashing a led e.g.
          - output.turn_on: led
          - delay: 500ms
          - output.turn_off: led
```

## See Also

- {{< docref "/automations" >}}
- {{< docref "/components/sensor/pulse_meter" >}}
