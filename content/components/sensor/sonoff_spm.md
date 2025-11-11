---
description: "Instructions for setting up Sonoff SPM sensors in ESPHome."
title: "Sonoff SPM Sensor"
params:
  seo:
    description: Instructions for setting up Sonoff SPM sensors in ESPHome.
---

The `sonoff_spm` sensor platform allows you to monitor energy consumption from the Sonoff SPM (Smart Power Manager) system and requires {{< docref "/components/sonoff_spm" >}} to be configured.

Each relay on the SPM-4Relay modules includes a CSE7761 energy monitoring chip that provides comprehensive power measurements.

## Configuration Variables

- **sonoff_spm_id** (*Optional*, {{< apiref "sonoff_spm/sonoff_spm.h" "ID" >}}): Manually specify the ID of the {{< docref "/components/sonoff_spm" "Sonoff SPM Component" >}}.
- **relay_id** (**Required**, int): The relay number (0-127) to monitor. See {{< docref "/components/sonoff_spm#relay-id-mapping" "Relay ID Mapping" >}}.

- **voltage** (*Optional*): Voltage measurement in Volts (V).
  - All options from [Sensor](#config-sensor).

- **current** (*Optional*): Current measurement in Amperes (A).
  - All options from [Sensor](#config-sensor).

- **power** (*Optional*): Active power measurement in Watts (W).
  - All options from [Sensor](#config-sensor).

- **apparent_power** (*Optional*): Apparent power measurement in Volt-Amperes (VA).
  - All options from [Sensor](#config-sensor).

- **reactive_power** (*Optional*): Reactive power measurement in Volt-Amperes Reactive (var).
  - All options from [Sensor](#config-sensor).

- **power_factor** (*Optional*): Power factor (dimensionless, 0-1).
  - All options from [Sensor](#config-sensor).

- **energy** (*Optional*): Total energy consumption in kilowatt-hours (kWh).
  - All options from [Sensor](#config-sensor).

## Example

```yaml
# Example configuration entry
uart:
  id: uart_bus
  tx_pin: GPIO4
  rx_pin: GPIO16
  baud_rate: 115200

sonoff_spm:
  id: spm_main
  uart_id: uart_bus

# Basic monitoring for Relay 0
sensor:
  - platform: sonoff_spm
    sonoff_spm_id: spm_main
    relay_id: 0
    voltage:
      name: "Kitchen Voltage"
    current:
      name: "Kitchen Current"
    power:
      name: "Kitchen Power"
    energy:
      name: "Kitchen Energy"

  # Detailed monitoring for Relay 5 (Pool Pump)
  - platform: sonoff_spm
    sonoff_spm_id: spm_main
    relay_id: 5
    voltage:
      name: "Pool Pump Voltage"
    current:
      name: "Pool Pump Current"
    power:
      name: "Pool Pump Power"
    apparent_power:
      name: "Pool Pump Apparent Power"
    reactive_power:
      name: "Pool Pump Reactive Power"
    power_factor:
      name: "Pool Pump Power Factor"
    energy:
      name: "Pool Pump Energy Total"
```

## Automatic Entity Creation

Instead of manually defining sensors, you can use the automatic entity creation feature:

```yaml
uart:
  id: uart_bus
  tx_pin: GPIO4
  rx_pin: GPIO16
  baud_rate: 115200

sonoff_spm:
  id: spm_main
  uart_id: uart_bus
  module_count: 2                # Number of SPM-4Relay modules
  auto_create_sensors: true      # Automatically create sensors
  name_prefix: "SPM"             # Prefix for sensor names
  sensor_types:                  # Which sensor types to create
    - voltage
    - current
    - power
    - energy
```

This will automatically create voltage, current, power, and energy sensors for all relays on the connected modules.

## Important Notes

- Energy measurements are only updated when relays are powered ON
- Wait a few seconds after turning on a relay for energy data to appear
- The relay_id is calculated as: `(module_number * 4) + channel_number`
- All sensors for a given relay_id should be defined in a single sensor block

## See Also

- {{< docref "/components/sonoff_spm" >}}
- {{< docref "/components/switch/sonoff_spm" >}}
- {{< docref "/components/uart" >}}
- {{< docref "/components/sensor" >}}
- {{< apiref "sonoff_spm/sonoff_spm.h" "sonoff_spm/sonoff_spm.h" >}}
