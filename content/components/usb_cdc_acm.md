---
description: "Instructions for setting up USB CDC-ACM virtual serial ports on ESP32 variants in ESPHome"
title: "USB CDC-ACM Interface"
params:
  seo:
    description: Instructions for setting up USB CDC-ACM virtual serial ports on ESP32 variants in ESPHome
    image: usb.svg
---

The USB CDC-ACM (Communications Device Class - Abstract Control Model) component enables ESP32-S2 and ESP32-S3 devices
to function as USB virtual serial ports. When connected to a host computer, the microcontroller will appear as one or
more standard serial/COM ports, allowing serial communication with the application running on the microcontroller.

You must have the TinyUSB component in your device's configuration to use this component.

> [!NOTE]
> This component is only compatible with ESP32-S2 and ESP32-S3 variants using the ESP-IDF framework.

```yaml
# Example minimal configuration entry
usb_cdc_acm:
  interfaces:
    - number: 0
```

## Configuration variables

- **usb_rx_buffer_size** (*Optional*, int): Size of the USB receive buffer in bytes. Range: 1-65535. Defaults to `256`.
- **usb_tx_buffer_size** (*Optional*, int): Size of the USB transmit buffer in bytes. Range: 1-65535. Defaults to `256`.
- **interfaces** (**Required**, list): List of CDC-ACM interface instances to configure; up to two are supported. At
  least one is required.

## Interface configuration variables

Each interface in the `interfaces` list supports the following options:

- **id** (*Optional*, [ID](#config-id)): The ID to use for this interface instance.
- **number** (**Required**, int): Unique interface identifier. Valid values are `0` or `1`. Each configured interface
  must have a unique number.

## Multiple Interface Example

The USB CDC-ACM component supports up to two simultaneous virtual serial port interfaces on a single device. This
allows you to create multiple independent communication channels over a single physical USB connection.

```yaml
# Example configuration with two interfaces
usb_cdc_acm:
  interfaces:
    - id: cdc_acm_1
      number: 0
    - id: cdc_acm_2
      number: 1
```

In this configuration, the device will appear as two separate serial/COM ports to the host computer. Each interface
operates independently with its own data buffers.

## Buffer Size Considerations

The buffer sizes determine how much data can be temporarily stored during USB transfers:

- **Small buffers (256 bytes, default)**: Suitable for low-bandwidth applications and conserves RAM
- **Large buffers (512-1024 bytes)**: Recommended for high-throughput applications or when handling bursts of data

Increase buffer sizes if you experience data loss or need to handle larger data packets without frequent polling.

## See Also

- {{< apiref "usb_cdc_acm/usb_cdc_acm.h" "usb_cdc_acm/usb_cdc_acm.h" >}}
