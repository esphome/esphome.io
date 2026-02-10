---
description: "Instructions for setting up the Filter Lifetime sensor to track air filter, water filter, or other consumable filter usage"
title: "Filter Lifetime Sensor"
params:
  seo:
    description: Track filter usage time and remaining lifetime for air purifiers, HVAC systems, water filters, and other devices with replaceable filters
    image: filter.jpg
---

The `filter_lifetime` sensor platform tracks the remaining lifetime of replaceable filters (air filters, water filters, etc.) based on actual usage time and operating speed. The sensor calculates a percentage (0-100%) representing remaining filter life, accounts for variable speed operation, and persists data across reboots.

This is particularly useful for:

- Air purifiers with variable fan speeds
- HVAC systems with replaceable filters
- Water filtration systems
- Any device with a consumable filter that needs periodic replacement

## Basic Configuration

Minimal configuration (always-on device at full speed):

```yaml
sensor:
  - platform: filter_lifetime
    name: "Air Filter Remaining"
    max_lifetime: 6
```

With lambdas for variable speed operation:

```yaml
sensor:
  - platform: filter_lifetime
    name: "Air Filter Remaining"
    max_lifetime: 6
    is_on: !lambda "return id(purifier_switch).state;"
    current_speed: !lambda "return id(fan_speed).state;"
    update_interval: 60s
```

With sensor references (recommended when using existing sensors):

```yaml
binary_sensor:
  - platform: template
    id: purifier_running
    name: "Purifier Running"

sensor:
  - platform: template
    id: fan_speed_percent
    name: "Fan Speed"
    unit_of_measurement: "%"

  - platform: filter_lifetime
    name: "Air Filter Remaining"
    max_lifetime: 6
    is_on_sensor: purifier_running
    current_speed_sensor: fan_speed_percent
    update_interval: 60s
```

## Configuration variables

- **max_lifetime** (**Required**, int): Maximum filter lifetime in months. For example, if the filter should be replaced every 6 months, set this to `6`.
- **is_on** (*Optional*, [Lambda](/guides/automations#templates-lambdas)): A lambda that returns `true` when the device is running. Runtime only accumulates when this returns `true`. Defaults to `true` (always on).
- **is_on_sensor** (*Optional*, [Binary Sensor](/components/binary_sensor)): Reference to a binary sensor that indicates when the device is running. Cannot be used together with `is_on` lambda.
- **current_speed** (*Optional*, [Lambda](/guides/automations#templates-lambdas)): A lambda that returns the current operating speed as a percentage (0-100). This scales the runtime accumulation - running at 50% speed accumulates half as much runtime. Defaults to `100.0` (full speed).
- **current_speed_sensor** (*Optional*, [Sensor](/components/sensor)): Reference to a sensor that reports the current operating speed percentage (0-100). Cannot be used together with `current_speed` lambda.
- **runtime_hours** (*Optional*): Optional sensor showing total accumulated runtime in hours.
  - All options from [Sensor](/components/sensor).
- **remaining_days** (*Optional*): Optional sensor showing estimated remaining days until filter replacement.
  - All options from [Sensor](/components/sensor).
- **update_interval** (*Optional*, [Time](/guides/configuration-types#time)): How often to update the sensor. Defaults to `60s`.
- All other options from [Sensor](/components/sensor).

## Complete Example

This example shows a comprehensive configuration for an air purifier using sensor references:

```yaml
binary_sensor:
  - platform: template
    id: purifier_running
    name: "Air Purifier Running"
    # ... binary sensor to detect when purifier is on

sensor:
  - platform: template
    id: fan_speed_percent
    name: "Fan Speed"
    unit_of_measurement: "%"
    # ... sensor reporting fan speed as percentage (0-100)

  - platform: filter_lifetime
    id: filter_life_remaining
    name: "Filter Life Remaining"
    max_lifetime: 6  # Replace filter every 6 months
    is_on_sensor: purifier_running
    current_speed_sensor: fan_speed_percent
    update_interval: 60s
    runtime_hours:
      name: "Filter Runtime Hours"
    remaining_days:
      name: "Filter Days Remaining"

button:
  - platform: template
    name: "Reset Filter"
    on_press:
      - filter_lifetime.reset_filter:
          id: filter_life_remaining
```

The same can be accomplished using lambdas instead of sensor references:

```yaml
switch:
  - platform: template
    id: purifier_switch
    name: "Air Purifier"
    # ... switch configuration

number:
  - platform: template
    id: fan_speed
    name: "Fan Speed"
    min_value: 0
    max_value: 100
    step: 25
    # ... number configuration

sensor:
  - platform: filter_lifetime
    id: filter_life_remaining
    name: "Filter Life Remaining"
    max_lifetime: 6
    is_on: !lambda "return id(purifier_switch).state;"
    current_speed: !lambda "return id(fan_speed).state;"
    update_interval: 60s
    runtime_hours:
      name: "Filter Runtime Hours"
    remaining_days:
      name: "Filter Days Remaining"

button:
  - platform: template
    name: "Reset Filter"
    on_press:
      - filter_lifetime.reset_filter:
          id: filter_life_remaining
```

## How It Works

The sensor tracks filter usage by:

1. **Monitoring runtime**: Accumulates time when the device is on. You can specify this with `is_on` lambda, `is_on_sensor`, or omit it to assume always-on (default: `true`)
2. **Scaling by speed**: Runtime is multiplied by the speed percentage. You can specify this with `current_speed` lambda, `current_speed_sensor`, or omit it for constant full-speed operation (default: `100.0`). Running at 50% speed for 1 hour = 30 minutes of runtime
3. **Calculating percentage**: Compares accumulated runtime against `max_lifetime` to show remaining life
4. **Persisting data**: Stores runtime to flash memory, surviving reboots and power loss

### Calculation Details

- Maximum runtime = `max_lifetime` × 30.4375 days/month × 24 hours/day × 60 minutes/hour
- Effective runtime accumulation = elapsed time × (speed / 100)
- Remaining percentage = 100 × (1 - runtime / max_runtime)

For example, with a 6-month filter:

- Max runtime = 6 × 30.4375 × 24 × 60 = 262,620 minutes
- Running 1 hour at 100% speed = 60 minutes accumulated
- Running 1 hour at 50% speed = 30 minutes accumulated
- At 50% consumed: remaining = 100 × (1 - 131,310 / 262,620) = 50%

## Actions

### `filter_lifetime.reset_filter`

Resets the filter lifetime counter to 100% (new filter). Use this after replacing the physical filter.

```yaml
button:
  - platform: template
    name: "Reset Filter Counter"
    on_press:
      - filter_lifetime.reset_filter:
          id: my_filter_lifetime
```

## Advanced Examples

### Integration with PM2.5 Sensor

Combine with a PM2.5 sensor to show both filter life and air quality:

```yaml
uart:
  rx_pin: GPIO22
  tx_pin: GPIO21
  baud_rate: 9600

sensor:
  - platform: pm100x
    model: pm1006
    pm_2_5:
      id: pm25_sensor
      name: "PM2.5"

  - platform: filter_lifetime
    name: "HEPA Filter Life"
    max_lifetime: 12
    is_on: !lambda "return id(purifier).state;"
    current_speed: !lambda "return id(fan_speed_pct).state;"
    runtime_hours:
      name: "Filter Runtime"
    remaining_days:
      name: "Days Until Replacement"
```

### Multi-Speed Fan Example

For fans with discrete speed settings (low/medium/high), you can use lambdas to map the speed:

```yaml
select:
  - platform: template
    id: fan_mode
    name: "Fan Mode"
    options:
      - "Off"
      - "Low"
      - "Medium"
      - "High"
    # ... select configuration

sensor:
  - platform: filter_lifetime
    name: "Filter Remaining"
    max_lifetime: 3
    is_on: !lambda |-
      return id(fan_mode).state != "Off";
    current_speed: !lambda |-
      auto mode = id(fan_mode).state;
      if (mode == "Low") return 33.0f;
      if (mode == "Medium") return 66.0f;
      if (mode == "High") return 100.0f;
      return 0.0f;
```

### Simple Always-On Device

For devices that run continuously at constant speed (e.g., refrigerator water filters):

```yaml
sensor:
  - platform: filter_lifetime
    name: "Fridge Water Filter Life"
    max_lifetime: 6  # Replace every 6 months
    # No is_on or current_speed needed - assumes always on at 100%
    remaining_days:
      name: "Filter Days Remaining"
```

### Automatic Alerts

Send alerts when filter needs replacement:

```yaml
sensor:
  - platform: filter_lifetime
    id: filter_sensor
    name: "Filter Life"
    max_lifetime: 6
    is_on: !lambda "return id(device_power).state;"
    current_speed: !lambda "return id(speed_percent).state;"
    on_value:
      then:
        - if:
            condition:
              lambda: "return x < 10.0;"
            then:
              - homeassistant.service:
                  service: notify.mobile_app
                  data:
                    message: "Filter needs replacement! Only {{ x | round(0) }}% remaining"
```

### Water Filter Tracking

Track water filter usage for reverse osmosis systems or refrigerators:

```yaml
binary_sensor:
  - platform: template
    id: water_flowing
    # ... sensor to detect water flow

sensor:
  - platform: filter_lifetime
    name: "RO Filter Life"
    max_lifetime: 12  # 12-month filter
    is_on: !lambda "return id(water_flowing).state;"
    current_speed: !lambda "return 100.0;"  # Water filters typically run at constant "speed"
    update_interval: 10s  # Check more frequently
    remaining_days:
      name: "Filter Replacement In"
```

## Notes

- Runtime data is stored in flash memory and survives reboots
- The sensor uses average days per month (30.4375) for calculations
- Speed percentage should be 0-100, where 100 = full speed operation
- When the device is off (`is_on` returns `false` or `is_on_sensor` is off), no runtime accumulates
- If neither `is_on` lambda nor `is_on_sensor` is specified, the device is assumed to be always on
- If neither `current_speed` lambda nor `current_speed_sensor` is specified, full speed (100%) is assumed
- You can use either lambda or sensor reference for `is_on` and `current_speed`, but not both for the same parameter
- The percentage can briefly go negative if runtime exceeds max_lifetime, but is clamped to 0%
- Shorter update intervals provide more accurate tracking but increase flash writes

> [!TIP]
> Set `update_interval` based on typical usage patterns. For devices that run continuously, 60s is sufficient. For devices that cycle on/off frequently, consider 10-30s for better accuracy.

> [!WARNING]
> The sensor tracks time-based usage only. It does not measure actual filter contamination or airflow degradation. Real filter life may vary based on environmental conditions (dust levels, humidity, etc.).

## See Also

- [Sensor Component](/components/sensor)
- [Template Switch](/components/switch/template)
- [Automations](/guides/automations)
- {{< docref "/components/sensor/pm100x" "PM100X Particulate Matter Sensor" >}}
- {{< apiref "filter_lifetime/filter_lifetime.h" "filter_lifetime/filter_lifetime.h" >}}
