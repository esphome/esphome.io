---
description: "Instructions for setting up time-based covers with tilt function (venetian blinds) driven by one motor in ESPHome."
title: "Time Based Cover with Tilt Function"
params:
  seo:
    description: Instructions for setting up time-based covers with tilt function (venetian blinds) driven by one motor in ESPHome.
    image: time_based_tilt.svg
---

The `time_based_tilt` cover platform allows you to control covers with both position and tilt
using a single motor, without any physical position feedback. This type of mechanism is commonly
used in external venetian blinds. Because no sensors are available, the cover state is always
**assumed**, and both position and tilt are estimated based on how long the motor has been running
in each direction.

The platform can also be used for covers **without** a tilt function — in such cases, the tilt
rotation time should be set to `0ms`.

The implementation includes automatic recalibration at the end positions (0% and 100%), and it
respects **interlock wait time**, **actuator activation time**, and **inertia time** when changing
direction. These timings ensure safe motor operation and allow the component to maintain accurate,
time-based tracking of both position and tilt — even for motors that require a minimum power-on
window, exhibit mechanical inertia before movement, or must not reverse direction immediately.

{{< img src="shutter-tilt.png" alt="Image" width="75.0%" class="align-center" >}}

```yaml
# Example configuration entry
cover:
  - platform: time_based_tilt
    name: "Time-Based Tilt Cover"
    open_duration: 58700ms
    close_duration: 57700ms
    inertia_open_time: 300ms
    tilt_open_duration: 930ms
    inertia_close_time: 250ms
    tilt_close_duration: 900ms
    recalibration_close_time: 6500ms
    recalibration_open_time: 4500ms
    actuator_activation_open_time: 200ms
    actuator_activation_close_time: 250ms
    close_sets_tilt: false
    open_sets_tilt: false

    open_action:
      - switch.turn_on: open_cover_switch

    close_action:
      - switch.turn_on: close_cover_switch

    stop_action:
      - switch.turn_off: open_cover_switch
      - switch.turn_off: close_cover_switch
```

## Configuration variables

- **name** (**Required**, string): The name of the cover.

- **open_duration** (**Required**, [Time](/guides/configuration-types#time)): The amount of time it takes the cover
  to open up from the fully-closed state.

- **close_duration** (**Required**, [Time](/guides/configuration-types#time)): The amount of time it takes the cover
  to close from the fully-open state.

- **open_action** (**Required**, [Action](/automations/actions#all-actions)): The action that should
  be performed when the remote requests the cover to be opened.

- **close_action** (**Required**, [Action](/automations/actions#all-actions)): The action that should
  be performed when the remote requests the cover to be closed.

- **stop_action** (**Required**, [Action](/automations/actions#all-actions)): The action that should
  be performed when the remote requests the cover to be stopped or
  when the cover has been opening/closing for the given durations.

- **tilt_open_duration** (*Optional*, [Time](/guides/configuration-types#time)): The amount of time it takes lamellas
  to tilt from the fully-closed state. Defaults to `0ms`.

- **tilt_close_duration** (*Optional*, [Time](/guides/configuration-types#time)): The amount of time it takes lamellas
  to tilt from the fully-open state. Defaults to `0ms`.

- **inertia_open_time** (*Optional*, [Time](/guides/configuration-types#time)):
  The delay before the cover begins to physically open after changing direction.
  During this time the motor is already powered and running, but the cover has not yet started to move.
  The accumulated “inertia offset” position is **not reset on every motor start** — it is preserved
  across movements until the direction changes again, and after the direction change the distance
  required to overcome inertia is **equal to the distance previously travelled in the opposite direction**,
  not reset to zero.

- **inertia_close_time** (*Optional*, [Time](/guides/configuration-types#time)):
  The delay before the cover begins to physically close after changing direction.
  During this time the motor is already powered and running, but the cover has not yet started to move.
  The accumulated “inertia offset” position is **not reset on every motor start** — it is preserved
  across movements until the direction changes again, and after the direction change the distance
  required to overcome inertia is **equal to the distance previously travelled in the opposite direction**,
  not reset to zero.
  Defaults to `0ms`..

- **interlock_wait_time** (*Optional*, [Time](/guides/configuration-types#time)): The waiting time after a direction
  change before the motor is allowed to run again. Useful for motors that must not reverse instantly.
  This timer is reset on every direction change and it continues to elapse regardless of whether the cover is currently moving or not.
  **Important:** If your installation uses switches that also have an `interlock_wait_time` configured, you *must* set
  a delay here that is **not lower** than the value used for the switches.
  Leaving this value lower than the switch configuration will cause incorrect position calculations.
  Defaults to `0ms`.

- **recalibration_open_time** (*Optional*, [Time](/guides/configuration-types#time)): Additional time the motor remains on
  after reaching the fully-open position (100%) for calibration. Defaults to `0ms`.

- **recalibration_close_time** (*Optional*, [Time](/guides/configuration-types#time)): Additional time the motor remains on
  after reaching the fully-closed position (0%) for calibration. Defaults to `0ms`.

- **actuator_activation_open_time** (*Optional*, [Time](/guides/configuration-types#time)):
  Additional activation time applied **before** the cover starts opening.
  During this time the motor is already powered, but the mechanism has not yet begun to move.
  This value is counted **from the moment power is applied**, and it **resets whenever power is removed**.
  Required for motors that must receive power for a minimum duration before movement begins
  (e.g. drives specifying requirements such as *“Continuous orders of at least 200 ms must be sent
  to ensure proper execution”*).
  Defaults to `0ms`.

- **actuator_activation_close_time** (*Optional*, [Time](/guides/configuration-types#time)):
  Additional activation time applied **before** the cover starts closing.
  During this time the motor is powered but the mechanism has not yet started moving.
  The time is **measured from the moment power is applied**, and it **resets when power is removed**.
  Use this when motors require a minimum “power-on” window before responding to a closing command
  or direction change.
  Defaults to `0ms`.

- **close_sets_tilt** (*Optional*, boolean): When set to `true`, issuing a *close* command
  (i.e., setting the cover position to `0.0` without specifying any tilt value) will also
  set tilt position `0.0`.
  Defaults to `false`.

- **open_sets_tilt** (*Optional*, boolean): When set to `true`, issuing an *open* command
  (i.e., setting the cover position to `1.0` without specifying any tilt value) will also
  set tilt position `1.0`.
  Defaults to `false`.

- **assumed_state** (*Optional*, boolean): Whether the true state of the cover is not known.
  This makes Home Assistant show both OPEN and CLOSE buttons. Defaults to `true`.

- **id** (*Optional*, [ID](/guides/configuration-types#id)): Manually specify the ID used for code generation.

- All other options from [Cover](/components/cover#config-cover).

### Note on execution order of timing parameters

The cover movement sequences apply timing parameters in a fixed, deterministic order.
Each stage begins **only after** the previous one has fully completed.

#### Order for **opening**

1. **interlock_wait_time** – waiting time after a direction change before movement is allowed.
1. **actuator_activation_open_time** – initial power-on time required by some actuators before movement begins.
1. **inertia_open_time** – delay before the cover starts moving when changing direction.
1. **tilt_open_duration** – time used to tilt lamellas toward the fully-open position (if applicable).
1. **open_duration** – main travel time of the cover from closed to open.
1. **recalibration_open_time** – extra time the motor remains powered after reaching the open limit.

#### Order for **closing**

1. **interlock_wait_time** – waiting time after a direction change before movement is allowed.
1. **actuator_activation_close_time** – initial power-on time required by some actuators before movement begins.
1. **inertia_close_time** – delay before the cover starts moving when changing direction.
1. **tilt_close_duration** – time used to tilt lamellas toward the fully-close position (if applicable).
1. **close_duration** – main travel time of the cover from open to closed.
1. **recalibration_close_time** – extra time the motor remains powered after reaching the closed limit.

> [!NOTE]
> The stop button on the UI is always enabled even when the cover is stopped and each press
> on the button will cause the `stop_action` to be performed.

## See Also

- {{< docref "index/" >}}
- [Automation](/automations)
- {{< apiref "time_based/time_based_cover.h" "time_based/time_based_cover.h" >}}
