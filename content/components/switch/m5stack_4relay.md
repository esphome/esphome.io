---
description: "Instructions for setting up M5Stack 4-Relay Unit switch in ESPHome."
title: "M5Stack 4-Relay Switch"
params:
  seo:
    description: Instructions for setting up M5Stack 4-Relay Unit switch in ESPHome.
    image: m5stack_4relay.png
---

The `m5stack_4relay` switch platform allows you to control the 4 relay channels of the
[M5Stack 4-Relay Unit](https://docs.m5stack.com/en/unit/4relay). The relays can switch
up to AC 250V or DC 28V at 10A.

This component requires the [I²C Bus](/components/i2c) to be set up.

{{< img src="m5stack_4relay.png" alt="M5Stack 4-Relay Unit" width="50.0%" class="align-center" >}}

```yaml
# Example configuration entry
i2c:
  sda: GPIOXX
  scl: GPIOXX

m5stack_4relay:
  id: relay_hub

switch:
  - platform: m5stack_4relay
    channel: 1
    name: "Relay 1"
    m5stack_4relay_id: relay_hub
  - platform: m5stack_4relay
    channel: 2
    name: "Relay 2"
  - platform: m5stack_4relay
    channel: 3
    name: "Relay 3"
  - platform: m5stack_4relay
    channel: 4
    name: "Relay 4"
```

## Hub Configuration variables

- **id** (*Optional*, [ID](/guides/configuration-types#id)): Manually specify the ID used for code generation.
- All other options from [I²C Device](/components/i2c_device).

## Switch Configuration variables

- **channel** (**Required**, int): The relay channel number to control (1-4).
- **m5stack_4relay_id** (*Optional*, [ID](/guides/configuration-types#id)): The ID of the M5Stack 4-Relay hub. Required if you have multiple hubs.
- **interlock** (*Optional*, list): A list of other switches in an interlock group. See
  [GPIO Switch Interlocking](/components/switch/gpio#switch-gpio-interlocking).
- **interlock_wait_time** (*Optional*, [Time](/guides/configuration-types#time)): For interlocking mode, set how long
  to wait after other items in an interlock group have been disabled before re-activating.
  Useful for motors where immediately turning on in the other direction could cause problems.
- All other options from [Switch](/components/switch#config-switch).

## See Also

- {{< docref "/components/switch/gpio" >}}
- {{< apiref "m5stack_4relay/m5stack_4relay.h" "m5stack_4relay/m5stack_4relay.h" >}}
