---
description: "Zigbee end device for zigbee2mqtt and ZHA."
title: "Zigbee end device"
params:
  seo:
    description: Zigbee end device for zigbee2mqtt and ZHA.
    image: zigbee.svg
---

The `zigbee` component allows exposing supported ESPHome components over a Zigbee network to Home Assistant via **Zigbee2MQTT** or **ZHA**.  
Due to the limitations of the Zigbee protocol, only basic properties are exposed. Additional properties must be configured manually in Home Assistant.

### Supported Components
- [Binary Sensor](#config-binary_sensor): only **state** and **name** are exposed over Zigbee.

```yaml
# Example configuration entry
binary_sensor:
  - platform: template
    name: "Door 1"

zigbee:
  wipe_on_boot: true
  on_join:
    then:
      - logger.log: "Joined network"
```

## Configuration variables

- **wipe_on_boot** (*Optional*, boolean): erases all non volatile memory data on boot; use only if the device is in boot loop crash. Defaults to `false`.

- **on_join** (*Optional*, [Automation](#automation)): Automation to run when the device join the network.

## Actions

## `factory_reset` Action

This [action](#config-action) triggers a factory reset of the zigbee device. It handles the leaving of the zigbee network.

```yaml
on_...:
  then:
    - zigbee.factory_reset
```

## See Also

- [Zigbee2MQTT](https://www.zigbee2mqtt.io/)
- [Zigbee Home Automation](https://www.home-assistant.io/integrations/zha/)
