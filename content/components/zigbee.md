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
> Zigbee support is currently available only on `nRF52` platforms and on `ESP32` with IEEE 802.15.4 
> connectivity (ESP32-C6 or ESP32-H2).
> On `nRF52` a maximum of 8 endpoints is supported and at least two endpoints are required due to a limitation in Zigbee2MQTT.

> [!NOTE]
> You will need a Zigbee coordinator like **Zigbee2MQTT** or **ZHA**.

> [!WARNING]
> Whenever the configuration is changed, the device should be re-inerviewed (z2m only) and removed and re-added
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

- **model** (*Optional*, string): Model Identifier of the Zigbee device. Defauts to the ESPHome node name.

- **id** (*Optional*, [ID](/guides/configuration-types#id)): The ID to use for this `zigbee` component.

Only on `ESP32`:

- **router** (*Optional*, boolean): If true the Zigbee role will be `router` instead of `end device` and it will
 forward Zigbee packets from other devices. Don't use this for battery powered devices. Defaults to `false`.

Only on `nrf52`:

- **wipe_on_boot** (*Optional*, boolean): Erases all non-volatile memory data on boot.
  Use only if the device is in a boot loop crash. Defaults to `false`.

- **on_join** (*Optional*, [Automation](/automations#automation)): Automation to run when the device joins the network.

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

## Zigbee Component Base Configuration

All components in ESPHome that do some sort of communication through
Zigbee can have some overrides for specific options.

### Configuration variables

Only on `ESP32`:
- **report** (**Optional**, enum): Report the state. One of `yes`, `no`, `force`. `yes` activates reporting and uses
the configuration from the coordinator. `force` ignores the the coordinator settings and reports every change.
Defaults to `yes`.

> [!NOTE]
> ZHA sets the minimum reporting interval to 30 seconds for most sensor devices. If you need faster responses set `report` to `force`.


## See Also

- [Zigbee2MQTT](https://www.zigbee2mqtt.io/)
- [Zigbee Home Automation](https://www.home-assistant.io/integrations/zha/)
