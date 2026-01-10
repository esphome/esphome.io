---
description: "Instructions for setting up Zigbee component."
title: "Zigbee component"
params:
  seo:
    description: Instructions for setting up Zigbee component.
    image: zigbee.svg
---

Zigbee is a low-power mesh networking standard for IoT devices. The low-power aspect is important for
battery-powered smart home devices. However, it’s also low-bandwidth, making it ideal for applications
that don’t send a lot of data, like switches or motion sensors.

Zigbee uses the same RF technology as Thread (IEEE 802.15.4) but defines also multiple application standards.
The `zigbee` component, however, supports only the Homeautomation profile.
It allows exposing supported ESPHome components over a Zigbee network to Home Assistant via
**Zigbee2MQTT** or **ZHA**. Due to the limitations of the Zigbee protocol, only basic properties are exposed.
Additional properties must be configured manually in Home Assistant. Each ESPHome entity consumes one Zigbee endpoint.

> [!NOTE]
> Zigbee support is currently available only on `nRF52` platforms.
> A maximum of 8 endpoints is supported and at least two endpoints are required due to a limitation in Zigbee2MQTT.

> [!NOTE]
> You will need a Zigbee coordinator like **Zigbee2MQTT** or **ZHA**.

> [!CAUTION]
> Whenever the configuration is changed, the device should be re-interviewed (z2m only) and removed and re-added
> to the Zigbee network. This is especially important if components are added or removed or if names change.

{{< anchor "config-zigbee" >}}

## Full Configuration

```yaml
# Example configuration entry
zigbee:
  id: my_zigbee
  on_join:
    then:
      - logger.log: "Joined network"
```

## Configuration variables

- **wipe_on_boot** (*Optional*): Erases all non-volatile memory data on boot, including
  Zigbee network pairing and preferences (e.g., last switch state). One of:
  - `false` (default): Preserve data across reboots.
  - `true`: Erase all data on every boot. Use only for recovery from boot loops when
    you don't have an SWD programmer.
  - `once`: Erase data only on first boot after flashing new firmware, then preserve.

- **on_join** (*Optional*, [Automation](/automations#automation)): Automation to run when the device joins the network.

- **id** (*Optional*, [ID](/guides/configuration-types#id)): The ID to use for this `zigbee` component.

- **power_source** (*Optional*, enum): Indicates what kind of power the device uses. Affects
  sleep behavior. One of `UNKNOWN`, `MAINS_SINGLE_PHASE`, `MAINS_THREE_PHASE`, `BATTERY`,
  `DC_SOURCE`, `EMERGENCY_MAINS_CONST`, or `EMERGENCY_MAINS_TRANSF`. Defaults to `DC_SOURCE`.

## Actions

### `factory_reset` Action

This [action](/automations/actions#config-action) triggers a factory reset of the Zigbee device.
It handles leaving the Zigbee network.

```yaml
on_...:
  then:
    - zigbee.factory_reset
```

## Supported Components

The following components are exposed over Zigbee if they have a name and if they are not marked as internal:

- [Binary Sensor](/components/binary_sensor#config-binary_sensor): only **state** and **name** are exposed over Zigbee.

- [Sensor](/components/sensor#config-sensor): **state**, **name** and **unit_of_measurement** are exposed
over Zigbee. If no unit is given or if it is not support it will fall back to unitless.

> [!NOTE]
> Units are only supported by **ZHA**, but not by **Zigbee2MQTT**.

## Component Implementation Details

### Binary Sensor

[Binary Sensors](/components/binary_sensor#config-binary_sensor) are implemented as binary input clusters with description and present_value attributes.

#### Configuration variables

- **name** (**Required**, string): The name for the binary sensor. This is exposed as the Zigbee description attribute.
- **internal** (*Optional*, boolean): Mark this component as internal. Internal components will
  not be exposed over Zigbee. Only specifying an `id` without a `name` will implicitly set this to true.
  Use this if you run out of Zigbee endpoints.

### Sensor

[Sensors](/components/sensor#config-sensor) are implemented as analog input clusters with desription, engineering_units,
and present_value attributes.

#### Configuration variables

- **name** (**Required**, string): The name for the binary sensor. This is exposed as the Zigbee description attribute.
- **internal** (*Optional*, boolean): Mark this component as internal. Internal components will
  not be exposed over Zigbee. Only specifying an `id` without a `name` will implicitly set this to true.
  Use this if you run out of Zigbee endpoints.
- **unit_of_measurement** (*Optional*, string): Manually set or overwrite the unit. By default
the unit of the component is used and if the component does not set a unit, values are unitless.
  Only a limited set of units is supported. Unsupported units will revert to unitless.
  This is exposed as the Zigbee engineering units attribute.

> [!NOTE]
> Units are only supported by **ZHA**, but not by **Zigbee2MQTT**.

## See Also

- [Zigbee2MQTT](https://www.zigbee2mqtt.io/)
- [Zigbee Home Automation](https://www.home-assistant.io/integrations/zha/)
