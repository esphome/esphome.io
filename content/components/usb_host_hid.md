---
description: "Instructions for setting up a USB HID Host interface on an ESP32 in ESPHome"
title: "USB HID Host Interface"
params:
  seo:
    description: Instructions for setting up a USB HID Host interface on an ESP32 in ESPHome
    image: usb.svg
---

The USB HID Host interface on the ESP32-S2, ESP32-S3 and ESP32-P4 is used to
connect to USB HID (Human Interface Device) peripheral devices, that is,
keyboards and mouses. Multiple devices may be configured and connected at once.
By default, devices must be directly connected to the ESP32, but this can be
changed by setting the `enable_hubs` option to `true`.

This component only supports **keyboards** today. Key presses, assuming a
standard US keyboard layout, will be accumulated internally. It is therefore
most useful in combination with a {{< docref "/components/key_collector" >}} to
do an action with the recorded keys, as illustrated below.

```yaml
# Example configuration entry
usb_host_hid:
  enable_hubs: true
  keyboards:
    - id: kbd_1
      vid: 0x1725
      pid: 0x1234

key_collector:
  - id: reader_1
    source_id: kbd_1
    # Collects whole lines of text, up to <Return>.
    end_keys: "\r"
    timeout: 1s
    # on_result:
    #   ...
```

> [!NOTE]
> This component cannot be used in combination with the
> {{< docref "/components/usb_host" >}} as both components need to assume
> control of the plugged USB devices, which would create a conflict.

## Configuration variables

- **id** (*Optional*, [ID](#config-id)): The id to use for this component.
- **enable_hubs** (*Optional*, boolean): Whether to include support for hubs.
  Defaults to `false`.
- **keyboards** (*Optional*, list): A list of keyboard devices to configure.

## Keyboard configuration options

- **id** (*Optional*, [ID](#config-id)): An id to assign to the device.
- **check_class**: (*Optional*, boolean): Whether to check the device's HID
  class is indeed “keyboard”. Defaults to `true`.
- **vid** (**Required**, int): The vendor ID of the device. Use 0 as a wildcard.
- **pid** (**Required**, int): The product ID of the device. Use 0 as a wildcard.

If a device is configured and a device is connected that matches the
configuration, the device will be connected to the ESP32 and log entries will
appear at the DEBUG level. If the log level is set to VERBOSE, then individual
key presses will be logged. The device will remain connected until it is
disconnected or the ESP32 is reset.

> [!WARNING]
> If multiple devices are plugged in that match the same wildcard
> configuration, only the first one will be correctly handled. A log entry at
> WARNING level will appear for subsequent conflicting devices. Make sure you
> have one `keyboards` configuration declared for each of the devices you intend
> to plug in, and that they do not overlap with each other.

If a device is plugged in that does not match any configured device, it will be
ignored and a log entry will appear at the DEBUG level.

If a configured device is plugged in that does *not* declare itself as a HID
keyboard, it will be ignored and a log entry will appear at the WARNING level.
Some devices may work just fine (they report key presses) with this component,
but do not declare themselves as keyboards, in which case you can set
`check_class` to `false`.

### See Also

- {{< docref "/components/usb_host" >}}
- {{< apiref "usb_host_hid/usb_hid.h" "usb_host_hid/usb_hid.h" >}}
