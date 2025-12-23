---
description: "Instructions for setting up Neewer Bi-Color lights."
title: "Neewer CB60B Bi-Color LED Light"
params:
  seo:
    description: Instructions for setting up Neewer Bi-Color lights.
    image: images/neewer_cb60b.png
---

The `neewerlight_ct` light platform provides support for Neewer Bi-Color lights.

The lights use Bluetooth Low Energy (BLE) to communicate with the Neewer app on your phone.

Before you disconnect the light from the Neewer app, note the range of its color temperature, we will need it later.
Alternatively, refer to the product documentation or the user manual.

In order to connect your light to ESPHome, first you need to kill the Neewer app on your phone.

Next step is to find out the mac address of your light. You can do this by using the `neewerlight_ble` component.
Switch the light on and then use the following configuration to scan for BLE devices:

```yaml
# Find the mac address of your light
neewerlight_ble:
```

Now you can use the `neewerlight_ct` platform:

```yaml
# Declare a BLE client with the mac address of your light
ble_client:
  - mac_address: 00:00:00:00:00:00
    id: neewer_light_cb60b_1

# Create a light using the neewerlight_ct platform
light:
  - platform: neewerlight_ct
    name: "Neewer Light CB60B #1"
    ble_client_id: neewer_light_cb60b_1
    cold_white_color_temperature: 6500 K
    warm_white_color_temperature: 2700 K
```

## Configuration variables

For `ble_client` configuration, refer to {{< docref `/components/ble_client` >}}.

- **ble_client_id** (**Required**, int): ID of the associated BLE client.
- **cold_white_color_temperature** (**Required**, float): The coldest color temperature supported by this light. This
  is the lowest value when expressed in [mireds](https://en.wikipedia.org/wiki/Mired), or the highest value when
  expressed in Kelvin.
- **warm_white_color_temperature** (**Required**, float): The warmest color temperature supported by this light. This
  is the highest value when expressed in [mireds](https://en.wikipedia.org/wiki/Mired), or the lowest value when
  expressed in Kelvin.
- All other options from [Light](/components/light#config-light).

## See Also

- {{< docref "/components/ble_client" >}}
- {{< docref "/components/light/index" >}}
- {{< docref "/components/light/color_temperature" >}}
- {{< apiref "neewerlight_ct/neewer_ct_light_output.h" >}}
