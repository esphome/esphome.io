---
description: "Instructions for setting up template water heaters in ESPHome."
title: "Template Water Heater"
params:
  seo:
    description: Instructions for setting up template water heaters in ESPHome.
    image: water-boiler.svg
---

The `template` water heater platform allows you to create simple water heaters out of just a few actions and lambdas. Once
defined, it will automatically appear in Home Assistant as a water heater entity and can be controlled through the frontend.

{{< img src="water-boiler.png" alt="Image" class="align-center" >}}

```yaml
# Example configuration entry
water_heater:
  - platform: template
    name: "Template Boiler"
    id: my_boiler
    
    # Lambda to read the current temperature (e.g. from a sensor)
    current_temperature: return id(my_sensor).state;
    
    # Lambda to read the current operation mode (optional)
    mode: return water_heater::WATER_HEATER_MODE_ECO;
    optimistic: true

    # List to show available modes to show in the UI (optional)
    supported_modes:
      - off
      - eco
      - gas
```

Possible return values for the lambdas:

- `current_temperature`: Returns a `float` (e.g. `42.5`).
- `mode`: Returns a `WaterHeaterMode` enum (e.g. `water_heater::WATER_HEATER_MODE_ECO`).

## Configuration variables

- **current_temperature** (*Optional*, [lambda](/automations/templates#config-lambda)):
  Lambda to be evaluated repeatedly to get the current temperature of the water. Expects a float return value.

- **mode** (*Optional*, [lambda](/automations/templates#config-lambda)):
  Lambda to be evaluated repeatedly to get the current operation mode. Expects a `WaterHeaterMode` enum return value.

- **optimistic** (*Optional*, boolean): Whether to operate in optimistic mode - when in this mode, any command sent to
  the template water heater will immediately update the reported state. Defaults to `true`.

- **supported_modes** (*Optional*, list): List to show which modes will be available to set from the UI. Shows all modes on default.

- **restore_mode** (*Optional*, enum): Control how the water heater attempts to restore state on bootup.

  - `NO_RESTORE` (Default): Do not save or restore state.
  - `RESTORE`  : Attempts to restore the state (target temp & mode) on startup, but doesn't perform the `set_action`.
  - `RESTORE_AND_CALL`  : Attempts to restore the state on startup and immediately executes the `set_action`.

- All other options from [Water Heater](/components/water_heater#config-water-heater).

Configuration options:

- **id** (**Required**, [ID](/guides/configuration-types#id)): The ID of the template water heater.
- **current_temperature** (*Optional*, [templatable](/automations/templates), float):
  The current measured temperature to publish.

- **target_temperature** (*Optional*, [templatable](/automations/templates), float):
  The target setpoint temperature to publish.

- **mode** (*Optional*, [templatable](/automations/templates), string):
  The operation mode to publish. See [Water Heater Modes](/components/water_heater#water-heater-modes) for options.

> [!NOTE]
> This action can also be written in lambdas:
>
> ```cpp
> id(my_template_boiler).current_temperature = 50.0;
> id(my_template_boiler).mode = water_heater::WATER_HEATER_MODE_PERFORMANCE;
> id(my_template_boiler).publish_state();
> ```

## See Also

- {{< docref "/components/water_heater" >}}
- [Automation](/automations)
- {{< apiref "template/water_heater/template_water_heater.h" "template/water_heater/template_water_heater.h" >}}
