---
description: "Interval Component"
title: "Interval Component"
---


# Interval Component

This component allows you to run actions at fixed time intervals. For example, if you want to toggle a switch every
minute, you can use this component. Please note that it's possible to achieve the same thing with the
[time.on_time](#time-on_time) trigger, but this technique is more light-weight and user-friendly.

```yaml
# Example configuration entry
interval:
  - interval: 1min
    then:
      - switch.toggle: relay_1

```
If a startup delay is configured, the first execution of the actions will not occur before at least that time after boot.

## Configuration variables:

- **interval** (**Required**, [Time](#config-time)): The interval to execute the action with.
- **startup_delay** (*Optional*, [Time](#config-time)): An optional startup delay - defaults to zero.
- **then** (**Required**, [Action](#config-action)): The action to perform.

# See Also

- {{< docref "index/" >}}
- {{< docref "/automations/actions" >}}
- {{< docref "/automations/templates" >}}

