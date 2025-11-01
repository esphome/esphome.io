---
description: "Instructions for setting up Daikin Madoka climate controller with ESPHome."
title: "Daikin Madoka"
params:
  seo:
    description: Instructions for setting up Daikin Madoka climate controller with ESPHome.
    image: daikin.png
---

The `madoka` component creates a climate device which can be used
to control Daikin Madoka controllers.

![Daikin Madoka controller](/images/madoka.png)

This component supports the following functionality:

- Set the operating mode: off, heat, cool, dry, fan_only, auto
- Set the desired target temperatures (two-setpoint mode)
- Show the current room temperature
- Set the desired fan speed: auto, low, medium, high

## Base Configuration

To use the Daikin Madoka climate controller in your installation, add the following to your configuration file:

```yaml
esp32_ble_tracker:

esp32_ble:
  io_capability: display_yes_no

ble_client:
  - mac_address: <mac_address>
    id: madoka_climate

climate:
  - platform: madoka
    name: "Madoka Climate"
    ble_client_id: madoka_climate
    update_interval: 15s
```

## Configuration variables

- **ble_client_id** (**Required**, [ID](#config-id)): The ID of the {{< docref "/components/ble_client" >}} used for the communication.
- **update_interval** (*Optional*, [Time](#config-time)): The interval to check the device for state updates. Defaults to `10s`.
- All other options from [Climate](#config-climate).

> [!NOTE]
> The Daikin Madoka climate controller requires `esp32_ble` IO Capability to be set to `display_yes_no`, due to the fact that the device expects to be pairing to a smartphone.
> A pairing code is displayed on the device, the ESP32 prints the same code to the serial console, and the user must confirm that the codes match.
> The code is automatically confirmed on the ESP32 device.

## Credits

This component is based on the awesome work of [@blafois](https://github.com/blafois), who reverse engineered the Daikin Madoka protocol.
You can find his writeup [here](https://github.com/blafois/Daikin-Madoka-BRC1H-BLE-Reverse).

## See Also

- {{< docref "/components/esp32_ble" >}}
- {{< docref "/components/ble_client" >}}
- {{< docref "/components/climate" >}}
- {{< apiref "madoka/madoka.h" "madoka/madoka.h" >}}
