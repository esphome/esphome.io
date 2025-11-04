---
description: "Instructions for setting up garage door motor with single button in ESPHome."
title: "Single button garage door"
params:
  seo:
    description: Instructions for setting up garage door motor with single button in ESPHome.
    image: electric-switch.svg
---

The `single_button_garage_door` cover platform allows you to create covers with position control that have
endstops at both ends of the cover to detect the fully-open and fully-closed states.
When any of these endstops are reached, the corresponding state is sent out.

This cover platform is mainly intended for garage door motors that have a single button (up/stop/down) where you can plug a switch to control the door. 
In addition, two endstops at either end should be added. The user just needs to enter what to do when the platform wants to click the button,
as well as information about open and close information so that the current position can be approximated.

Additionally, open and close durations must be specified to allow ESPHome to approximate the
current position of the cover.

{{< img src="more-info-ui.png" alt="Image" width="75.0%" class="align-center" >}}

```yaml
# Example configuration entry
cover:
  - platform: single_button_garage_door
    name: garage-door
    id: garage_door
    device_class: garage
    open_duration: 19s
    open_endstop: open_endstop
    close_duration: 19s
    close_endstop: close_endstop
    max_duration: 30s
    single_button_action: 
      - switch.turn_on: door_switch
      - delay: 200ms
      - switch.turn_off: door_switch
      - delay: 200ms


```

## Configuration variables

- **single_button_action** (**Required**, [Action](#config-action)): The action that should
  be performed to click on motor button.

- **open_duration** (**Required**, [Time](#config-time)): The amount of time it takes the cover
  to open up from the fully-closed state.

- **open_endstop** (**Required**, [ID](#config-id)): The ID of the
  [Binary Sensor](#config-binary_sensor) that turns on when the open position is reached.

- **close_duration** (**Required**, [Time](#config-time)): The amount of time it takes the cover
  to close from the fully-open state.

- **close_endstop** (**Required**, [ID](#config-id)): The ID of the
  [Binary Sensor](#config-binary_sensor) that turns on when the closed position is reached.

- **max_duration** (*Optional*, [Time](#config-time)): The maximum duration the cover should be opening
  or closing. Useful for protecting from dysfunctional endstops.

- All other options from [Cover](#config-cover).

## See Also

- {{< docref "index/" >}}
- [Automation](#automation)
- {{< apiref "single_button_garage_door/sb_cover.h" "single_button_garage_door/sb_cover.h" >}}
