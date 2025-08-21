## Description:

Adds documentation for the new `preferred_phy` configuration option in the `esp32_ble` component.

This documentation explains:
- The new PHY configuration option with its three modes (1m, 2m, auto)
- Why 1M PHY is now the default (compatibility and reliability)
- Platform restrictions (2M PHY only available on ESP32-C3/S3/C6/H2)
- Practical guidance on when to use different PHY modes
- The connection issues that can occur with 2M PHY when WiFi is active

**Related issue (if applicable):** fixes esphome/issues#[BLE disconnection issues with ESP32-S3]

**Pull request in [esphome](https://github.com/esphome/esphome) with YAML changes (if applicable):** 

- esphome/esphome#9968

## Checklist:

  - [x] I am merging into `next` because this is new documentation that has a matching pull-request in [esphome](https://github.com/esphome/esphome) as linked above.  
    or
  - [ ] I am merging into `current` because this is a fix, change and/or adjustment in the current documentation and is not for a new component or feature.

  - [ ] Link added in `/components/index.rst` when creating new documents for new components or cookbook.