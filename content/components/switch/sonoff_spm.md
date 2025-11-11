---
description: "Instructions for setting up Sonoff SPM switches in ESPHome."
title: "Sonoff SPM Switch"
params:
  seo:
    description: Instructions for setting up Sonoff SPM switches in ESPHome.
---

The `sonoff_spm` switch platform allows you to control relays on the Sonoff SPM (Smart Power Manager) system and requires {{< docref "/components/sonoff_spm" >}} to be configured.

Each SPM-4Relay module provides 4 bistable relays that can be independently controlled.

## Configuration Variables

- **sonoff_spm_id** (*Optional*, {{< apiref "sonoff_spm/sonoff_spm.h" "ID" >}}): Manually specify the ID of the {{< docref "/components/sonoff_spm" "Sonoff SPM Component" >}}.
- **relay_id** (**Required**, int): The relay number (0-127) to control. See {{< docref "/components/sonoff_spm#relay-id-mapping" "Relay ID Mapping" >}}.
- **name** (**Required**, string): The name of the switch.
- All other options from [Switch](#config-switch).

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

# Manual switch definitions
switch:
  # Module 0, Channel 0
  - platform: sonoff_spm
    name: "Kitchen Light"
    sonoff_spm_id: spm_main
    relay_id: 0

  # Module 0, Channel 1
  - platform: sonoff_spm
    name: "Living Room Light"
    sonoff_spm_id: spm_main
    relay_id: 1

  # Module 0, Channel 2
  - platform: sonoff_spm
    name: "Bedroom Light"
    sonoff_spm_id: spm_main
    relay_id: 2

  # Module 0, Channel 3
  - platform: sonoff_spm
    name: "Bathroom Light"
    sonoff_spm_id: spm_main
    relay_id: 3

  # Module 1, Channel 0
  - platform: sonoff_spm
    name: "Garage Door"
    sonoff_spm_id: spm_main
    relay_id: 4

  # Module 1, Channel 1
  - platform: sonoff_spm
    name: "Pool Pump"
    sonoff_spm_id: spm_main
    relay_id: 5
```

## Automatic Entity Creation

Instead of manually defining switches, you can use the automatic entity creation feature:

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
  auto_create_switches: true     # Automatically create switches
  name_prefix: "Relay"           # Prefix for switch names
```

This will automatically create switches for all relays on the connected modules:

- `Relay 0`, `Relay 1`, ..., `Relay 7` (for 2 modules)

## Relay ID Mapping

Relay IDs are calculated as: `relay_id = (module_number * 4) + channel_number`

Where:

- `module_number`: 0-31 (for up to 32 SPM-4Relay modules)
- `channel_number`: 0-3 (4 channels per module)

Examples:

- Module 0, Channel 0: relay_id = 0
- Module 0, Channel 1: relay_id = 1
- Module 0, Channel 2: relay_id = 2
- Module 0, Channel 3: relay_id = 3
- Module 1, Channel 0: relay_id = 4
- Module 2, Channel 0: relay_id = 8

## State Synchronization

The component automatically synchronizes relay states when physical buttons on the SPM modules are pressed. This ensures that ESPHome always reflects the current state of the relays.

## Important Notes

- Each SPM-4Relay module has 4 bistable relays
- Up to 32 modules can be connected (128 relays total)
- Relay states persist across power cycles (bistable relays)
- The component automatically discovers connected modules at startup

## See Also

- {{< docref "/components/sonoff_spm" >}}
- {{< docref "/components/sensor/sonoff_spm" >}}
- {{< docref "/components/uart" >}}
- {{< docref "/components/switch" >}}
- {{< apiref "sonoff_spm/sonoff_spm.h" "sonoff_spm/sonoff_spm.h" >}}
