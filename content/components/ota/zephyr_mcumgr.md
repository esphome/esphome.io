---
description: "Instructions for setting up ESPHome's nRF52 platform to allow remote firmware updates of devices."
title: "ESPHome nRF52 Firmware Updates"
params:
  seo:
    description: Instructions for setting up ESPHome's nRF52 platform to allow remote firmware updates of devices.
    image: system-update.svg
---

The nRF52 platform supports firmware updates via Over-the-Air (OTA) mechanisms. The **only supported bootloader** for OTA updates is **MCUboot**.

To flash firmware onto the device, you can use any of the tools or libraries listed in the [Zephyr MCUmgr documentation](https://docs.zephyrproject.org/latest/services/device_mgmt/mcumgr.html#tools-libraries).
Firmware updates are also available via the ESPHome command-line interface.
For flashing over **BLE**, the [MCUmgr Web Tool](https://boogie.github.io/mcumgr-web/) provides a convenient browser-based interface.

```yaml
# Example configuration entry
ota:
  - platform: zephyr_mcumgr
```

## Configuration variables

- **transport** (*Optional*, mapping): Specifies the transport method used by Zephyr MCUmgr for OTA updates. By default, Bluetooth Low Energy (`ble: true`) is enabled.

## `transport`

Zephyr MCUmgr can operate over multiple transport protocols, which are selected via configuration options.

```yaml
# Example configuration entry
ota:
  - platform: zephyr_mcumgr
    transport:
      ble: true
      hardware_uart: CDC
```

### Configuration variables

- **ble** (*Optional*, boolean): Enable Bluetooth Low Energy transport for MCUmgr OTA. Default `false`.
- **hardware_uart** (*Optional*, enum): Select a hardware UART interface to use for MCUmgr OTA communication. This is used when updating devices over a serial interface rather than BLE. Options: `CDC`, `CDC1`, `UART0`, `UART1`.

## Usage

To connect and update the device over BLE:

```bash
esphome upload nrf52_device.yaml --device BLE
```

Or connect to a specific BLE address:

```bash
esphome upload nrf52_device.yaml --device 00:11:22:33:44:55
```

To connect and update the device over serial:

```bash
esphome upload h.yaml
```

Or connect to a specific serial:

```bash
esphome upload h.yaml --device /dev/ttyACM0
```

## See Also

- {{< apiref "ota/ota_component.h" "ota/ota_component.h" >}}
- {{< docref "/components/ota" >}}
