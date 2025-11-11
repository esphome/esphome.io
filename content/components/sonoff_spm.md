---
description: "Instructions for setting up the Sonoff SPM (Smart Power Manager) in ESPHome."
title: "Sonoff SPM"
params:
  seo:
    description: Instructions for setting up the Sonoff SPM (Smart Power Manager) in ESPHome.
---

{{< anchor "sonoff_spm" >}}

The Sonoff SPM (Smart Power Manager) component provides support for the Sonoff SPM system, which consists of:

- **SPM Main** unit: ESP32-based controller with UART interface to ARM processors
- **SPM-4Relay** modules: Up to 32 modules, each with 4 relays and CSE7761 energy monitoring per relay (128 relays total)

The Sonoff SPM uses a proprietary serial protocol at 115200 baud to communicate between the ESP32 and ARM processors on the relay modules. Each SPM-4Relay module provides:

- 4 bistable relays
- Per-relay energy monitoring (voltage, current, power, energy)
- Overload protection
- Power state logging

## Hardware Setup

1. Connect ESP32 UART pins to SPM Main unit:
   - TX: GPIO4
   - RX: GPIO16
   - Baud: 115200

1. Connect SPM-4Relay modules to the SPM Main unit via RS-485

1. Power on the system and the ESP32 will automatically discover connected modules

The SPM component requires a {{< docref "/components/uart" "UART bus" >}} to be configured.

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
  module_count: 2
  auto_create_switches: true
  auto_create_sensors: true
  name_prefix: "SPM Relay"
```

## Configuration Variables

- **uart_id** (*Optional*, {{< apiref "uart/uart_component.h" "ID" >}}): Manually specify the ID of the {{< docref "/components/uart" "UART Component" >}} if you want to use multiple UART buses.
- **module_count** (*Optional*, int): Maximum number of SPM-4Relay modules to scan for (1-32). Default: `32`
- **auto_create_switches** (*Optional*, boolean): Automatically create switch entities for all relays. Default: `false`
- **auto_create_sensors** (*Optional*, boolean): Automatically create sensor entities for all relays. Default: `false`
- **name_prefix** (*Optional*, string): Prefix for auto-generated entity names. Default: `"SPM Relay"`
- **sensor_types** (*Optional*, list): Which sensors to auto-create when `auto_create_sensors` is enabled. Options: `voltage`, `current`, `power`, `energy`. Default: all four types
- **id** (*Optional*, {{< apiref "sonoff_spm/sonoff_spm.h" "ID" >}}): Manually specify the ID used for code generation.

## Automatic Entity Creation (Recommended)

The easiest way to use this component is with automatic entity creation - no need to manually specify each relay!

```yaml
uart:
  id: uart_bus
  tx_pin: GPIO4
  rx_pin: GPIO16
  baud_rate: 115200

sonoff_spm:
  id: spm_main
  uart_id: uart_bus
  module_count: 4                # Number of SPM-4Relay modules you have
  auto_create_switches: true     # Automatically create switches for all relays
  auto_create_sensors: true      # Automatically create sensors for all relays
  name_prefix: "Power"           # Optional: customize entity names
  sensor_types:                  # Optional: choose which sensors to create
    - voltage
    - current
    - power
    - energy
```

This will automatically create:

- **Switches**: `Power 0`, `Power 1`, ..., `Power 15` (for 4 modules)
- **Sensors**: Voltage, Current, Power, and Energy for each relay

## Manual Configuration

For more control over entity names and which relays to expose:

```yaml
uart:
  id: uart_bus
  tx_pin: GPIO4
  rx_pin: GPIO16
  baud_rate: 115200

sonoff_spm:
  id: spm_main
  uart_id: uart_bus
  module_count: 32  # Maximum modules to scan for

# Manually define switches
switch:
  - platform: sonoff_spm
    name: "Kitchen Light"
    sonoff_spm_id: spm_main
    relay_id: 0

  - platform: sonoff_spm
    name: "Living Room Light"
    sonoff_spm_id: spm_main
    relay_id: 1

# Manually define sensors
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
```

## Relay ID Mapping

Relay IDs are calculated as: `relay_id = (module_number * 4) + channel_number`

Where:

- `module_number`: 0-31 (for up to 32 SPM-4Relay modules)
- `channel_number`: 0-3 (4 channels per module)

Examples:

- Module 0, Channel 0: relay_id = 0
- Module 0, Channel 3: relay_id = 3
- Module 1, Channel 0: relay_id = 4
- Module 1, Channel 3: relay_id = 7
- Module 2, Channel 0: relay_id = 8
- Module 31, Channel 0: relay_id = 124
- Module 31, Channel 3: relay_id = 127

## Features

- **Automatic module discovery**: The component automatically scans for connected SPM-4Relay modules
- **Real-time energy monitoring**: Voltage, current, power, power factor, and energy consumption
- **Relay control**: Switch relays on/off via ESPHome
- **State synchronization**: Automatically syncs relay states from device button presses
- **Energy data types**:
  - Voltage (V)
  - Current (A)
  - Active Power (W)
  - Apparent Power (VA)
  - Reactive Power (var)
  - Power Factor
  - Total Energy (kWh)

## Protocol Details

The component implements the Sonoff SPM serial protocol:

- **Baud Rate**: 115200 bps, 8N1
- **Message Format**: `AA 55 01 [Module ID] [Command] [Data] [CRC]`
- **CRC**: CRC-16/ARC (polynomial 0xA001)

## Troubleshooting

### No modules detected

- Check UART wiring (TX/RX not swapped)
- Verify baud rate is 115200
- Ensure SPM-4Relay modules are powered
- Check RS-485 connections between Main and relay modules

### Energy readings not updating

- Relays must be powered ON to report energy data
- Wait a few seconds after turning on relay for data to appear

### Relay state not syncing

- Component automatically syncs state changes from physical buttons
- Check logs for communication errors

## Notes

- Energy measurements are only updated when relays are powered on
- The component handles module scanning and state synchronization automatically
- Up to 32 SPM-4Relay modules (128 relays) are supported
- Each relay can be independently monitored and controlled
- Module scanning may take up to 30 seconds for systems with many modules

## See Also

- {{< docref "/components/uart" >}}
- {{< docref "/components/switch/sonoff_spm" >}}
- {{< docref "/components/sensor/sonoff_spm" >}}
- {{< apiref "sonoff_spm/sonoff_spm.h" "sonoff_spm/sonoff_spm.h" >}}
- [Tasmota Sonoff SPM driver](https://github.com/arendst/Tasmota/blob/development/tasmota/tasmota_xdrv_driver/xdrv_86_esp32_sonoff_spm.ino)
